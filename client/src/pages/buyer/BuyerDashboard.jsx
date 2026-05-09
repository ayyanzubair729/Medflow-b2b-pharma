import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { getDashboardSummary } from "../../api/dashboard.js";
import { listProducts } from "../../api/products.js";
import { reorderFromOrder } from "../../api/orders.js";
import { getProductImage } from "../../utils/assetMaps.js";
import { formatCurrency } from "../../utils/pricing.js";
import medicinesBg from "../../assets/medicines.jpg";

const getTopEntries = (map, limit = 3) =>
  Array.from(map.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

export default function BuyerDashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(err.message || "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommended = async () => {
    try {
      const data = await listProducts({ page: 1, limit: 3 });
      setRecommended(data.items || []);
    } catch (_err) {
      setRecommended([]);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchRecommended();
  }, []);

  const recentOrders = summary?.recent_orders || [];

  const favoriteSuppliers = useMemo(() => {
    const counts = new Map();
    recentOrders.forEach((order) => {
      const name = order.supplier?.business_name;
      if (!name) return;
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    return getTopEntries(counts, 4);
  }, [recentOrders]);

  const frequentItems = useMemo(() => {
    const counts = new Map();
    recentOrders.forEach((order) => {
      (order.items || []).forEach((item) => {
        const name = item.product?.name;
        if (!name) return;
        counts.set(name, (counts.get(name) || 0) + item.quantity);
      });
    });
    return getTopEntries(counts, 4);
  }, [recentOrders]);

  const handleReorder = async (orderId) => {
    try {
      await reorderFromOrder(orderId);
      setNotice("Items added to cart for reorder.");
      navigate("/buyer/cart");
    } catch (err) {
      setNotice(err.message || "Unable to reorder.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Buyer dashboard</h1>
          <p className="text-sm text-slate-400">Monitor orders, quotes, and spend at a glance.</p>
        </div>
        <Link to="/buyer/home" className="text-sm font-semibold text-secondary hover:text-accent">
          Browse catalog
        </Link>
      </div>

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

      {loading && <Card className="h-28 animate-pulse" />}

      <Card className="relative overflow-hidden p-6">
        <img
          src={medicinesBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
          loading="lazy"
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
            Procurement snapshot
          </p>
          <h2 className="mt-3 text-2xl font-semibold text-slate-100">
            Track orders, quotes, and spend in one place.
          </h2>
          <p className="mt-2 text-sm text-slate-300">
            Jump back into the catalog to restock fast-moving essentials.
          </p>
          <Link
            to="/buyer/home"
            className="mt-4 inline-flex text-sm font-semibold text-secondary hover:text-accent"
          >
            Browse catalog
          </Link>
        </div>
      </Card>

      {summary && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending orders</p>
            <p className="mt-3 text-2xl font-semibold text-slate-100">{summary.pending_orders}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Pending quotes</p>
            <p className="mt-3 text-2xl font-semibold text-slate-100">{summary.pending_quotes}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total spend</p>
            <p className="mt-3 text-2xl font-semibold text-slate-100">
              {formatCurrency(summary.total_revenue)}
            </p>
          </Card>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-100">Recent orders</h2>
            <Link to="/buyer/orders" className="text-sm font-semibold text-secondary hover:text-accent">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-slate-400">No orders yet.</p>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{order.supplier?.business_name}</p>
                    <p className="text-xs text-slate-500">{order.status}</p>
                  </div>
                  <div className="text-sm text-slate-300">
                    {formatCurrency(order.total_amount)}
                  </div>
                  <Button variant="outline" className="px-4" onClick={() => handleReorder(order.id)}>
                    Reorder
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-100">Favorite suppliers</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              {favoriteSuppliers.length === 0 ? (
                <p>No suppliers yet.</p>
              ) : (
                favoriteSuppliers.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span>{name}</span>
                    <span className="text-xs text-slate-500">{count} orders</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-100">Frequently ordered</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-400">
              {frequentItems.length === 0 ? (
                <p>No data yet.</p>
              ) : (
                frequentItems.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span>{name}</span>
                    <span className="text-xs text-slate-500">{count} units</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Recommended products</h2>
          <Link to="/buyer/home" className="text-sm font-semibold text-secondary hover:text-accent">
            View catalog
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {recommended.map((product) => (
            <Card key={product.id} className="p-5">
              <div className="h-28 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                {product.category?.name || "Category"}
              </p>
              <h3 className="mt-2 text-sm font-semibold text-slate-100">{product.name}</h3>
              <p className="mt-2 text-xs text-slate-500">SKU: {product.sku}</p>
              <Link
                to={`/buyer/products/${product.id}`}
                className="mt-4 inline-flex text-sm font-semibold text-secondary hover:text-accent"
              >
                View details
              </Link>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
