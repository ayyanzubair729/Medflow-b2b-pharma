import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { listOrders } from "../../api/orders.js";
import { cancelOrderAdmin } from "../../api/admin.js";
import { formatCurrency } from "../../utils/pricing.js";

const STATUS_OPTIONS = ["all", "draft", "placed", "confirmed", "shipped", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
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
      const data = await listOrders();
      setOrders(data || []);
    } catch (err) {
      setError(err.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) return false;
      if (!search) return true;
      const query = search.toLowerCase();
      const buyerName = order.buyer?.business_name?.toLowerCase() || "";
      const supplierName = order.supplier?.business_name?.toLowerCase() || "";
      return (
        order.id?.toLowerCase().includes(query) ||
        buyerName.includes(query) ||
        supplierName.includes(query)
      );
    });
  }, [orders, statusFilter, search]);

  const handleCancel = async (order) => {
    const ok = window.confirm("Cancel this order? This is an admin override.");
    if (!ok) return;
    try {
      await cancelOrderAdmin(order.id);
      flash("Order cancelled.");
      load();
    } catch (err) {
      flash(err.message || "Unable to cancel order.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Order Management</h1>
        <p className="text-sm text-slate-400">Monitor and override orders across the platform.</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order, buyer, supplier"
            className="min-w-[220px] rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <Button className="px-4 py-2 text-xs" onClick={load}>
            Refresh
          </Button>
        </div>
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
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400">No orders match your filters.</Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => (
            <Card key={order.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">Order ID</p>
                  <p className="font-mono text-xs text-slate-300">{order.id}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Buyer: {order.buyer?.business_name || order.buyer?.email || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Supplier: {order.supplier?.business_name || order.supplier?.email || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500">
                    Placed: {order.placed_at ? new Date(order.placed_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-sm font-semibold text-slate-100 capitalize">{order.status}</p>
                  <p className="text-sm font-semibold text-slate-100">
                    {formatCurrency(order.total_amount)}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs text-slate-400">
                    <span>{item.product?.name || "Product"}</span>
                    <span>
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>

              {order.status !== "cancelled" && (
                <div className="mt-4 flex justify-end">
                  <Button variant="outline" className="px-4 py-1.5 text-xs" onClick={() => handleCancel(order)}>
                    Cancel order
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
