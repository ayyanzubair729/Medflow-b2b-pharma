import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { apiFetch, apiFetchBlob } from "../../api/client.js";
import { formatCurrency } from "../../utils/pricing.js";

export default function SupplierPayouts() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const data = await apiFetch("/api/payouts/invoices");
        setInvoices(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const downloadInvoice = async (invoiceId) => {
    try {
      const blob = await apiFetchBlob(`/api/payouts/invoices/${invoiceId}/pdf`);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message || "Unable to download invoice.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Payouts</h1>
          <p className="text-sm text-slate-400">Invoices, payment status, and tax documents.</p>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Payouts</h1>
        <p className="text-sm text-slate-400">Invoices, payment status, and tax documents.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {invoices.length === 0 ? (
        <Card className="p-8 text-center">
          <i className="ti ti-coin text-4xl text-slate-600 block mb-2" aria-hidden="true" />
          <p className="text-sm font-semibold text-slate-300">No completed orders yet</p>
          <p className="mt-1 text-xs text-slate-500">
            Invoices will appear here once orders are marked as delivered.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <Card key={inv.id} className="p-5 hover:border-slate-700/80 transition-all">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-xs text-slate-500">{inv.id}</p>
                    <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-300">
                      Delivered
                    </span>
                  </div>
                  <p className="mt-2 font-semibold text-slate-100">
                    {inv.buyer?.business_name || "Buyer"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Completed: {inv.updated_at ? new Date(inv.updated_at).toLocaleDateString() : "—"}
                  </p>
                  {inv.delivery_address && (
                    <p className="text-xs text-slate-500 mt-1">
                      Ship to: {inv.delivery_address}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-slate-100">
                    {formatCurrency(inv.total_amount)}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {inv.items?.length || 0} items
                  </p>
                  <Button
                    variant="outline"
                    className="mt-3 px-3 py-1.5 text-xs"
                    onClick={() => downloadInvoice(inv.id)}
                  >
                    Download invoice
                  </Button>
                </div>
              </div>

              {/* Line items */}
              <div className="mt-3 space-y-1 border-t border-slate-800/60 pt-3">
                {inv.items?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs text-slate-400">
                    <span>{item.product?.name || "Product"}</span>
                    <span>
                      {item.quantity} × {formatCurrency(item.unit_price)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}