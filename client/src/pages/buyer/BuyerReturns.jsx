import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { apiFetch } from "../../api/client.js";
import { listOrders } from "../../api/orders.js";

export default function BuyerReturns() {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [reason, setReason] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orderData, returnData] = await Promise.all([
          listOrders(),
          apiFetch("/api/rma"),
        ]);
        setOrders(orderData || []);
        setReturns(returnData || []);
      } catch (err) {
        setError(err.message || "Unable to load returns.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const submitReturn = async () => {
    if (!selectedOrder || !reason.trim()) {
      setError("Please select a delivered order and provide a reason.");
      return;
    }
    try {
      await apiFetch("/api/rma", {
        method: "POST",
        body: JSON.stringify({ order_id: selectedOrder, reason }),
      });
      setSelectedOrder("");
      setReason("");
      setNotice("Return request submitted.");
      const updated = await apiFetch("/api/rma");
      setReturns(updated || []);
    } catch (err) {
      setError(err.message || "Unable to submit return.");
    }
  };

  const deliveredOrders = useMemo(
    () => orders.filter((order) => order.status === "delivered"),
    [orders]
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Return Requests</h1>

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

      <Card className="p-4">
        <h3 className="text-sm font-semibold">New Return</h3>
        <select
          className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-sm"
          value={selectedOrder}
          onChange={(e) => setSelectedOrder(e.target.value)}
        >
          <option value="">Select delivered order</option>
          {deliveredOrders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.id} - delivered
            </option>
          ))}
        </select>
        <textarea
          className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-sm"
          placeholder="Reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <Button className="mt-2" onClick={submitReturn} disabled={loading}>
          Submit Return
        </Button>
        {deliveredOrders.length === 0 && (
          <p className="mt-2 text-xs text-slate-500">No delivered orders available for returns.</p>
        )}
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : returns.length === 0 ? (
        <Card className="p-4 text-sm text-slate-400">No returns submitted yet.</Card>
      ) : (
        <div className="space-y-3">
          {returns.map((r) => (
            <Card key={r.id} className="p-3 flex justify-between">
              <div>
                <p className="font-semibold">Order {r.order_id}</p>
                <p className="text-xs text-slate-400">{r.reason}</p>
              </div>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  r.status === "approved"
                    ? "text-emerald-400"
                    : r.status === "rejected"
                    ? "text-rose-400"
                    : "text-slate-400"
                }`}
              >
                {r.status}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}