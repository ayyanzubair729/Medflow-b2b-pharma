import { useCallback, useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { listSupplierQuotes, respondToQuote } from "../../api/suppliers.js";
import { formatCurrency } from "../../utils/pricing.js";

const BADGE = {
  pending:   "border-slate-600   bg-slate-800    text-slate-300",
  responded: "border-blue-500/40 bg-blue-500/10  text-blue-300",
  accepted:  "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  rejected:  "border-rose-500/40   bg-rose-500/10    text-rose-300",
};

function RespondForm({ quote, onDone }) {
  const [price, setPrice]     = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy]       = useState(false);

  const submit = async (accepted) => {
    setBusy(true);
    try {
      await respondToQuote(quote.id, {
        status: accepted ? "responded" : "rejected",
        quoted_price: accepted ? Number(price) : undefined,
        supplier_response: message || undefined,
      });
      onDone(accepted ? "Quote response sent." : "Quote declined.");
    } catch (e) { onDone(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="mt-4 space-y-3 border-t border-slate-800/60 pt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-xs font-semibold text-slate-400">Quoted price (PKR per unit)</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g. 980"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-400">Message (optional)</label>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Lead time, conditions…"
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <Button className="px-4 py-1.5 text-xs" disabled={busy || !price} onClick={() => submit(true)}>
          Send quote
        </Button>
        <Button variant="outline" className="px-4 py-1.5 text-xs text-rose-400 hover:border-rose-500" disabled={busy} onClick={() => submit(false)}>
          Decline
        </Button>
      </div>
    </div>
  );
}

export default function SupplierQuotes() {
  const [quotes, setQuotes]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice]   = useState(null);
  const [openId, setOpenId]   = useState(null);

  const flash = (msg) => { setNotice(msg); setTimeout(() => setNotice(null), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    try { setQuotes(await listSupplierQuotes() || []); }
    catch { setNotice("Unable to load quotes."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const handleDone = (msg) => {
    flash(msg);
    setOpenId(null);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Quote desk</h1>
        <p className="text-sm text-slate-400">Respond to buyer RFQs and manage your negotiation log.</p>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-800/60" />)}
        </div>
      ) : quotes.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400">No quote requests yet.</Card>
      ) : (
        <div className="space-y-4">
          {quotes.map((q) => (
            <Card key={q.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-100">{q.product?.name || "Product"}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    From: {q.buyer?.business_name || q.buyer?.email || "—"} ·
                    Qty: <span className="text-slate-300">{q.quantity_requested}</span>
                  </p>
                  {q.message && (
                    <p className="mt-1.5 text-xs italic text-slate-400">"{q.message}"</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${BADGE[q.status] || ""}`}>
                    {q.status}
                  </span>
                  {q.status === "pending" && (
                    <Button variant="outline" className="px-3 py-1.5 text-xs"
                      onClick={() => setOpenId(openId === q.id ? null : q.id)}>
                      {openId === q.id ? "Cancel" : "Respond"}
                    </Button>
                  )}
                </div>
              </div>

              {q.quoted_price && (
                <p className="mt-2 text-xs text-slate-400">
                  Quoted: <span className="font-semibold text-slate-200">{formatCurrency(q.quoted_price)}/unit</span>
                  {q.supplier_response && ` — ${q.supplier_response}`}
                </p>
              )}

              {openId === q.id && (
                <RespondForm quote={q} onDone={handleDone} />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}