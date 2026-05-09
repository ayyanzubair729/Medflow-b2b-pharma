import { useEffect, useState } from "react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { acceptQuote, listQuotes, rejectQuote } from "../../api/quotes.js";
import { formatCurrency } from "../../utils/pricing.js";

const statusStyles = {
  pending: "border-amber-500/40 bg-amber-500/10 text-amber-200",
  responded: "border-blue-500/40 bg-blue-500/10 text-blue-200",
  accepted: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-200",
};

export default function BuyerQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const fetchQuotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listQuotes();
      setQuotes(data || []);
    } catch (err) {
      setError(err.message || "Unable to load quotes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, []);

  const handleAccept = async (id) => {
    try {
      await acceptQuote(id);
      setNotice("Quote accepted.");
      await fetchQuotes();
    } catch (err) {
      setNotice(err.message || "Unable to accept quote.");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectQuote(id);
      setNotice("Quote rejected.");
      await fetchQuotes();
    } catch (err) {
      setNotice(err.message || "Unable to reject quote.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Quotes</h1>
        <p className="text-sm text-slate-400">Track your quotation requests and supplier responses.</p>
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
      ) : quotes.length === 0 ? (
        <Card className="p-6 text-sm text-slate-300">No quote requests yet.</Card>
      ) : (
        <div className="space-y-5">
          {quotes.map((quote) => (
            <Card key={quote.id} className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-400">Product</p>
                  <p className="text-sm font-semibold text-slate-100">
                    {quote.product?.name || "Product"}
                  </p>
                  <p className="text-xs text-slate-500">Supplier: {quote.supplier?.business_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Quantity</p>
                  <p className="text-sm font-semibold text-slate-100">{quote.quantity_requested}</p>
                </div>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                    statusStyles[quote.status] || "border-slate-700 text-slate-200"
                  }`}
                >
                  {quote.status}
                </span>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="text-sm text-slate-300">
                  <p className="font-semibold text-slate-100">Supplier response</p>
                  <p className="mt-2 text-slate-400">
                    {quote.supplier_response || "Awaiting response"}
                  </p>
                </div>
                <div className="text-sm text-slate-300">
                  <p className="font-semibold text-slate-100">Quoted price</p>
                  <p className="mt-2 text-slate-400">
                    {quote.quoted_price ? formatCurrency(quote.quoted_price) : "Pending"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                {quote.status === "responded" && (
                  <Button className="px-4" onClick={() => handleAccept(quote.id)}>
                    Accept quote
                  </Button>
                )}
                {quote.status !== "accepted" && quote.status !== "rejected" && (
                  <Button variant="outline" className="px-4" onClick={() => handleReject(quote.id)}>
                    Reject
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
