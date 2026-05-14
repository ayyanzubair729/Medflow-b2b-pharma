import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { listMyProducts, updateProductStock, updateProductVisibility } from "../../api/suppliers.js";
import { formatCurrency } from "../../utils/pricing.js";

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
      const data = await listMyProducts(); // or listSupplierOrders / listSupplierQuotes
      if (!cancelled) setProducts(data || []);
    } catch {
      if (!cancelled) flash("Unable to load.");
    } finally {
      if (!cancelled) setLoading(false);
    }
  })();
  return () => { cancelled = true; };
}, []);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Catalog</h1>
          <p className="text-sm text-slate-400">Manage your listed products, stock levels, and visibility.</p>
        </div>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
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
                  <div className="flex-1 min-w-0">
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
                      variant={p.is_active ? "ghost" : "outline"}
                      className={`px-3 py-1.5 text-xs ${p.is_active ? "text-slate-500 hover:text-rose-400" : "text-emerald-400"}`}
                      onClick={() => toggleVisibility(p)}>
                      {p.is_active ? "Hide" : "List"}
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