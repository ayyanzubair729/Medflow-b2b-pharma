import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { cancelOrder, listOrders, reorderFromOrder, downloadInvoicePdf } from "../../api/orders.js";
import { formatCurrency } from "../../utils/pricing.js";

const cancellable = new Set(["draft", "placed", "confirmed"]);

export default function BuyerOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchOrders = async () => {
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
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    try {
      await cancelOrder(orderId);
      setNotice("Order cancelled.");
      await fetchOrders();
    } catch (err) {
      setNotice(err.message || "Unable to cancel order.");
    }
  };

  const handleReorder = async (orderId) => {
    try {
      await reorderFromOrder(orderId);
      setNotice("Items added to cart for reorder.");
      navigate("/buyer/cart");
    } catch (err) {
      setNotice(err.message || "Unable to reorder.");
    }
  };

  const handleDownloadInvoice = async (orderId) => {
    try {
      const blob = await downloadInvoicePdf(orderId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setNotice(err.message || "Unable to download invoice.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Orders</h1>
        <p className="text-sm text-slate-400">Track your recent purchases.</p>
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

      {loading ? (
        <Card className="h-48 animate-pulse" />
      ) : orders.length === 0 ? (
        <Card className="p-6 text-sm text-slate-300">No orders yet.</Card>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Order ID</p>
                  <p className="text-sm font-semibold text-slate-100">{order.id}</p>
                </div>
                <div className="text-sm text-slate-300">
                  Status: <span className="font-semibold text-secondary">{order.status}</span>
                </div>
                <div className="text-sm text-slate-300">
                  Total: <span className="font-semibold text-slate-100">{formatCurrency(order.total_amount)}</span>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {(order.items || []).map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm text-slate-300">
                    <span>{item.product?.name || "Product"}</span>
                    <span>
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  Placed: {order.placed_at ? new Date(order.placed_at).toLocaleString() : "-"}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" className="px-4" onClick={() => handleReorder(order.id)}>
                    Reorder
                  </Button>
                  {order.status === "delivered" && (
                    <Button variant="outline" className="px-4" onClick={() => handleDownloadInvoice(order.id)}>
                      Invoice
                    </Button>
                  )}
                  {cancellable.has(order.status) && (
                    <Button variant="outline" className="px-4" onClick={() => handleCancel(order.id)}>
                      Cancel order
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
