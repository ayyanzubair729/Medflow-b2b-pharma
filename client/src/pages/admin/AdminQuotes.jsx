import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { listQuotes } from "../../api/quotes.js";
import { formatCurrency } from "../../utils/pricing.js";

const STATUS_OPTIONS = ["all", "pending", "responded", "accepted", "rejected"];

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const load = async () => {
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
    load();
  }, []);

  const filtered = useMemo(() => {
    return quotes.filter((quote) => {
      if (statusFilter !== "all" && quote.status !== statusFilter) return false;
      if (!search) return true;
      const query = search.toLowerCase();
      return (
        quote.id?.toLowerCase().includes(query) ||
        quote.product?.name?.toLowerCase().includes(query) ||
        quote.buyer?.business_name?.toLowerCase().includes(query) ||
        quote.supplier?.business_name?.toLowerCase().includes(query)
      );
    });
  }, [quotes, statusFilter, search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Quote Oversight</h1>
        <p className="text-sm text-slate-400">Track quote requests and responses.</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search quote, buyer, supplier"
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
          <Button className="px-4 py-2 text-xs" onClick={load}>Refresh</Button>
        </div>
      </Card>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400">No quotes match your filters.</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((quote) => (
            <Card key={quote.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {quote.product?.name || "Product"}
                  </p>
                  <p className="text-xs text-slate-400">Buyer: {quote.buyer?.business_name || quote.buyer?.email}</p>
                  <p className="text-xs text-slate-400">Supplier: {quote.supplier?.business_name || quote.supplier?.email}</p>
                  <p className="text-xs text-slate-500">Qty: {quote.quantity_requested}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-sm font-semibold text-slate-100 capitalize">{quote.status}</p>
                  <p className="text-xs text-slate-400">
                    {quote.quoted_price ? formatCurrency(quote.quoted_price) : "—"}
                  </p>
                </div>
              </div>
              {quote.message && (
                <p className="mt-3 text-xs text-slate-400">"{quote.message}"</p>
              )}
              {quote.supplier_response && (
                <p className="mt-2 text-xs text-slate-500">Supplier: {quote.supplier_response}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
