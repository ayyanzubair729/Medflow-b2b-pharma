import { useEffect, useState } from "react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { apiFetch } from "../../api/client.js";
import { listOrders } from "../../api/orders.js";

export default function BuyerReturns() {
  const [orders, setOrders] = useState([]);
  const [returns, setReturns] = useState([]);
  const [reason, setReason] = useState("");
  const [selectedOrder, setSelectedOrder] = useState("");

  useEffect(() => {
    listOrders().then(setOrders);
    apiFetch("/api/rma").then(setReturns);
  }, []);

  const submitReturn = async () => {
    await apiFetch("/api/rma", { method: "POST", body: JSON.stringify({ order_id: selectedOrder, reason }) });
    setSelectedOrder("");
    setReason("");
    apiFetch("/api/rma").then(setReturns);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Return Requests</h1>
      <Card className="p-4">
        <h3 className="text-sm font-semibold">New Return</h3>
        <select className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-sm" value={selectedOrder} onChange={e => setSelectedOrder(e.target.value)}>
          <option value="">Select order</option>
          {orders.map(o => <option key={o.id} value={o.id}>{o.id} - {o.status}</option>)}
        </select>
        <textarea className="mt-2 w-full rounded-xl bg-slate-900 border border-slate-700 p-2 text-sm" placeholder="Reason" value={reason} onChange={e => setReason(e.target.value)} />
        <Button className="mt-2" onClick={submitReturn}>Submit Return</Button>
      </Card>
      <div className="space-y-3">
        {returns.map(r => (
          <Card key={r.id} className="p-3 flex justify-between">
            <div>
              <p className="font-semibold">Order {r.order_id}</p>
              <p className="text-xs text-slate-400">{r.reason}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${r.status === 'approved' ? 'text-emerald-400' : r.status === 'rejected' ? 'text-rose-400' : 'text-slate-400'}`}>{r.status}</span>
          </Card>
        ))}
      </div>
    </div>
  );
}