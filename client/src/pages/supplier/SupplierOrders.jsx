import { useCallback, useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { listSupplierOrders, updateOrderStatus } from "../../api/suppliers.js";
import { formatCurrency } from "../../utils/pricing.js";

const STATUS_FLOW = ["placed", "confirmed", "shipped", "delivered"];
const STATUS_BADGE = {
  placed:    "border-blue-500/40  bg-blue-500/10  text-blue-300",
  confirmed: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  shipped:   "border-purple-500/40 bg-purple-500/10 text-purple-300",
  delivered: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-rose-500/40   bg-rose-500/10   text-rose-300",
};

export default function SupplierOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice]   = useState(null);
  const [filter, setFilter]   = useState("all");

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(null), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try { setOrders(await listSupplierOrders() || []); }
    catch { setNotice("Unable to load orders."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const advance = async (order) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx === -1 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    try {
      await updateOrderStatus(order.id, next);
      flash(`Order moved to "${next}".`);
      load();
    } catch (e) { flash(e.message); }
  };

  const shown = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Orders</h1>
        <p className="text-sm text-slate-400">Review incoming orders and manage fulfilment.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2">
        {["all", ...STATUS_FLOW, "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition ${
              filter === s
                ? "border-secondary bg-secondary/15 text-secondary"
                : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
            }`}>
            {s}
          </button>
        ))}
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-800/60" />)}
        </div>
      ) : shown.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400">No orders in this status.</Card>
      ) : (
        <div className="space-y-4">
          {shown.map((o) => {
            const nextIdx = STATUS_FLOW.indexOf(o.status);
            const canAdvance = nextIdx !== -1 && nextIdx < STATUS_FLOW.length - 1;
            return (
              <Card key={o.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-500">Order ID</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-300">{o.id}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Placed: {o.placed_at ? new Date(o.placed_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold capitalize ${STATUS_BADGE[o.status] || ""}`}>
                      {o.status}
                    </span>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{formatCurrency(o.total_amount)}</p>
                  </div>
                </div>

                {/* Line items */}
                <div className="mt-3 space-y-1.5">
                  {(o.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs text-slate-400">
                      <span>{item.product?.name || "Product"}</span>
                      <span>{item.quantity} × {formatCurrency(item.unit_price)}</span>
                    </div>
                  ))}
                </div>

                {o.delivery_address && (
                  <p className="mt-3 text-xs text-slate-500">
                    <span className="text-slate-400">Ship to:</span> {o.delivery_address}
                  </p>
                )}

                {canAdvance && (
                  <div className="mt-4 flex justify-end">
                    <Button className="px-4 py-1.5 text-xs" onClick={() => advance(o)}>
                      Mark as {STATUS_FLOW[nextIdx + 1]}
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}