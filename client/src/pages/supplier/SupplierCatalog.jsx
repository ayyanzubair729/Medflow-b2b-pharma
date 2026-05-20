import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import {
  createProduct,
  deleteProduct,
  listMyProducts,
  updateProduct,
  updateProductStock,
  updateProductVisibility,
} from "../../api/suppliers.js";
import { listCategories } from "../../api/categories.js";
import { formatCurrency } from "../../utils/pricing.js";
import { getProductImage } from "../../utils/assetMaps.js";

const STATUS_BADGE = {
  in_stock:     "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  low_stock:    "border-amber-500/40   bg-amber-500/10   text-amber-300",
  out_of_stock: "border-rose-500/40    bg-rose-500/10    text-rose-300",
};

export default function SupplierCatalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [notice, setNotice]     = useState(null);
  const [editing, setEditing]   = useState(null); // product id being stock-edited
  const [categories, setCategories] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formError, setFormError] = useState(null);
  const [formBusy, setFormBusy] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    description: "",
    unit: "box",
    stock_quantity: 0,
    stock_status: "in_stock",
    requires_prescription: false,
  });
  const [priceTiers, setPriceTiers] = useState([
    { min_quantity: 1, max_quantity: null, price_per_unit: "" },
  ]);

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(null), 3000); };

  const load = async () => {
    setLoading(true);
    try { setProducts(await listMyProducts() || []); }
    catch { flash("Unable to load products."); }
    finally { setLoading(false); }
  };

useEffect(() => {
  let cancelled = false;
  (async () => {
    setLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        listMyProducts(),
        listCategories(),
      ]);
      if (!cancelled) {
        setProducts(productData || []);
        setCategories(categoryData || []);
      }
    } catch {
      if (!cancelled) flash("Unable to load.");
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();
  return () => { cancelled = true; };
}, []);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const resetForm = () => {
    setFormMode("create");
    setFormData({
      name: "",
      sku: "",
      category_id: "",
      description: "",
      unit: "box",
      stock_quantity: 0,
      stock_status: "in_stock",
      requires_prescription: false,
    });
    setPriceTiers([{ min_quantity: 1, max_quantity: null, price_per_unit: "" }]);
    setFormError(null);
    setFormOpen(false);
  };

  const openCreate = () => {
    resetForm();
    setFormMode("create");
    setFormOpen(true);
  };

  const openEdit = (product) => {
    setFormMode("edit");
    setFormData({
      name: product.name || "",
      sku: product.sku || "",
      category_id: product.category?.id || product.category_id || "",
      description: product.description || "",
      unit: product.unit || "box",
      stock_quantity: product.stock_quantity ?? 0,
      stock_status: product.stock_status || "in_stock",
      requires_prescription: Boolean(product.requires_prescription),
      id: product.id,
    });
    const tiers = product.price_tiers?.length
      ? product.price_tiers.map((tier) => ({
          min_quantity: tier.min_quantity ?? 1,
          max_quantity: tier.max_quantity ?? null,
          price_per_unit: tier.price_per_unit ?? "",
        }))
      : [{ min_quantity: 1, max_quantity: null, price_per_unit: "" }];
    setPriceTiers(tiers);
    setFormError(null);
    setFormOpen(true);
  };

  const toggleVisibility = async (product) => {
    try {
      await updateProductVisibility(product.id, !product.is_active);
      flash(`${product.name} ${product.is_active ? "hidden" : "listed"}.`);
      load();
    } catch (e) { flash(e.message); }
  };

  const saveStock = async (product, qty, status) => {
    try {
      await updateProductStock(product.id, { stock_quantity: Number(qty), stock_status: status });
      flash("Stock updated.");
      setEditing(null);
      load();
    } catch (e) { flash(e.message); }
  };

  const updateTier = (idx, key, value) => {
    setPriceTiers((prev) =>
      prev.map((tier, i) => (i === idx ? { ...tier, [key]: value } : tier))
    );
  };

  const addTier = () => {
    setPriceTiers((prev) => [...prev, { min_quantity: 1, max_quantity: null, price_per_unit: "" }]);
  };

  const removeTier = (idx) => {
    setPriceTiers((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitForm = async () => {
    setFormError(null);
    if (!formData.name || !formData.sku || !formData.category_id) {
      setFormError("Name, SKU, and category are required.");
      return;
    }

    const cleanedTiers = priceTiers
      .map((tier) => ({
        min_quantity: Number(tier.min_quantity),
        max_quantity:
          tier.max_quantity === "" || tier.max_quantity === null
            ? null
            : Number(tier.max_quantity),
        price_per_unit: Number(tier.price_per_unit),
      }))
      .filter((tier) => Number.isFinite(tier.min_quantity) && Number.isFinite(tier.price_per_unit));

    if (cleanedTiers.length === 0) {
      setFormError("At least one valid price tier is required.");
      return;
    }

    const payload = {
      ...formData,
      stock_quantity: Number(formData.stock_quantity) || 0,
      price_tiers: cleanedTiers,
    };

    setFormBusy(true);
    try {
      if (formMode === "create") {
        await createProduct(payload);
        flash("Product added.");
      } else {
        await updateProduct(formData.id, payload);
        flash("Product updated.");
      }
      resetForm();
      load();
    } catch (e) {
      setFormError(e.message || "Unable to save product.");
    } finally {
      setFormBusy(false);
    }
  };

  const handleDelete = async (product) => {
    const ok = window.confirm(`Deactivate ${product.name}? This will hide it from buyers.`);
    if (!ok) return;
    try {
      await deleteProduct(product.id);
      flash("Product deactivated.");
      load();
    } catch (e) {
      flash(e.message || "Unable to delete product.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Catalog</h1>
          <p className="text-sm text-slate-400">Manage your listed products, stock levels, and visibility.</p>
        </div>
        <Button onClick={openCreate}>Add Product</Button>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      )}

      {formOpen && (
        <Card className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-100">
                {formMode === "create" ? "Add Product" : "Edit Product"}
              </h2>
              <p className="text-xs text-slate-400">
                Update name, SKU, category, description, and price tiers.
              </p>
            </div>
            <Button variant="ghost" className="text-xs" onClick={resetForm}>Close</Button>
          </div>

          {formError && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
              {formError}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-400">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">SKU</label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData((prev) => ({ ...prev, category_id: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
              >
                <option value="">Select category</option>
                {sortedCategories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
              >
                <option value="box">Box</option>
                <option value="strip">Strip</option>
                <option value="vial">Vial</option>
                <option value="pack">Pack</option>
                <option value="bottle">Bottle</option>
                <option value="unit">Unit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
              rows={3}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-semibold text-slate-400">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock_quantity: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Stock Status</label>
              <select
                value={formData.stock_status}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock_status: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
              >
                <option value="in_stock">In stock</option>
                <option value="low_stock">Low stock</option>
                <option value="out_of_stock">Out of stock</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={formData.requires_prescription}
                onChange={(e) => setFormData((prev) => ({ ...prev, requires_prescription: e.target.checked }))}
              />
              Requires prescription
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400">Price tiers</p>
              <Button variant="outline" className="px-3 py-1.5 text-xs" onClick={addTier}>Add tier</Button>
            </div>
            <div className="space-y-2">
              {priceTiers.map((tier, idx) => (
                <div key={idx} className="grid gap-3 md:grid-cols-4 items-end">
                  <div>
                    <label className="text-[11px] text-slate-500">Min qty</label>
                    <input
                      type="number"
                      min="1"
                      value={tier.min_quantity}
                      onChange={(e) => updateTier(idx, "min_quantity", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Max qty (optional)</label>
                    <input
                      type="number"
                      min="1"
                      value={tier.max_quantity ?? ""}
                      onChange={(e) => updateTier(idx, "max_quantity", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-500">Price / unit</label>
                    <input
                      type="number"
                      min="0"
                      value={tier.price_per_unit}
                      onChange={(e) => updateTier(idx, "price_per_unit", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs text-slate-100 outline-none focus:border-secondary"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      className="px-3 py-2 text-xs text-rose-400"
                      disabled={priceTiers.length === 1}
                      onClick={() => removeTier(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" className="px-4 py-2 text-xs" onClick={resetForm}>
              Cancel
            </Button>
            <Button className="px-4 py-2 text-xs" disabled={formBusy} onClick={submitForm}>
              {formMode === "create" ? "Add product" : "Save changes"}
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/60" />)}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400">No products found for your account.</Card>
      ) : (
        <div className="space-y-3">
          {products.map((p) => {
            const lowestTier = p.price_tiers?.length
              ? Math.min(...p.price_tiers.map((t) => Number(t.price_per_unit)))
              : null;

            return (
              <Card key={p.id} className="p-5 transition-all duration-200 hover:border-slate-700/80">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <img
                      src={getProductImage(p)}
                      alt={p.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                    <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-100">{p.name}</p>
                      <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-400">
                        {p.sku}
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-xs capitalize ${STATUS_BADGE[p.stock_status] || ""}`}>
                        {p.stock_status?.replace("_", " ")}
                      </span>
                      {!p.is_active && (
                        <span className="rounded-full border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs text-slate-500">
                          Hidden
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Category: {p.category?.name || "—"} · Unit: {p.unit}
                      {lowestTier !== null && ` · From ${formatCurrency(lowestTier)}`}
                    </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-slate-100">{p.stock_quantity}</span> units
                    </p>
                    <Button
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => setEditing(editing === p.id ? null : p.id)}>
                      {editing === p.id ? "Cancel" : "Edit stock"}
                    </Button>
                    <Button
                      variant="outline"
                      className="px-3 py-1.5 text-xs"
                      onClick={() => openEdit(p)}>
                      Edit
                    </Button>
                    <Button
                      variant={p.is_active ? "ghost" : "outline"}
                      className={`px-3 py-1.5 text-xs ${p.is_active ? "text-slate-500 hover:text-rose-400" : "text-emerald-400"}`}
                      onClick={() => toggleVisibility(p)}>
                      {p.is_active ? "Hide" : "List"}
                    </Button>
                    <Button
                      variant="ghost"
                      className="px-3 py-1.5 text-xs text-rose-400"
                      onClick={() => handleDelete(p)}>
                      Delete
                    </Button>
                  </div>
                </div>

                {/* Inline stock editor */}
                {editing === p.id && (
                  <StockEditor product={p} onSave={saveStock} />
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StockEditor({ product, onSave }) {
  const [qty, setQty]       = useState(product.stock_quantity);
  const [status, setStatus] = useState(product.stock_status);

  return (
    <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-slate-800/60 pt-4">
      <div>
        <label className="text-xs font-semibold text-slate-400">Quantity</label>
        <input
          type="number"
          min="0"
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className="mt-1 w-28 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-slate-400">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary">
          <option value="in_stock">In stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </div>
      <Button className="px-4 py-2 text-xs" onClick={() => onSave(product, qty, status)}>
        Save
      </Button>
    </div>
  );
}