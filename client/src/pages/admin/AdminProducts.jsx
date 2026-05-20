import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { listProductsAdmin, updateProductStatus } from "../../api/admin.js";
import { formatCurrency } from "../../utils/pricing.js";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProductsAdmin({
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search || undefined,
        limit: 50,
      });
      setProducts(data?.items || []);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const toggleActive = async (product) => {
    try {
      await updateProductStatus(product.id, !product.is_active);
      flash(product.is_active ? "Product deactivated." : "Product activated.");
      load();
    } catch (err) {
      flash(err.message || "Unable to update product.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Product Management</h1>
        <p className="text-sm text-slate-400">Review all products across suppliers.</p>
      </div>

      <Card className="p-4">
        <form className="flex flex-wrap gap-3" onSubmit={handleSearch}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product, SKU, or supplier"
            className="min-w-[220px] rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
          >
            <option value="all">all</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <Button type="submit" className="px-4 py-2 text-xs">Search</Button>
        </form>
      </Card>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400">No products match your filters.</Card>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">{product.name}</p>
                  <p className="text-xs text-slate-400">SKU: {product.sku}</p>
                  <p className="text-xs text-slate-500">
                    Supplier: {product.supplier?.business_name || product.supplier_id}
                  </p>
                  <p className="text-xs text-slate-500">
                    Price tiers: {product.price_tiers?.length || 0}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Stock</p>
                    <p className="text-sm font-semibold text-slate-100">{product.stock_quantity}</p>
                    <p className="text-xs text-slate-500">
                      {product.price_tiers?.[0]?.price_per_unit ? formatCurrency(product.price_tiers[0].price_per_unit) : "—"}
                    </p>
                  </div>
                  <Button
                    variant={product.is_active ? "outline" : "primary"}
                    className="px-4 py-2 text-xs"
                    onClick={() => toggleActive(product)}
                  >
                    {product.is_active ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
