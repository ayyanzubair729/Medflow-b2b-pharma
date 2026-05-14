import { useEffect, useState } from "react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { apiFetch } from "../../api/client.js";

const STATUS_BADGE = {
  pending:  "border-amber-500/40 bg-amber-500/10 text-amber-300",
  approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  rejected: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

export default function SupplierReturns() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/api/rma");
      setReturns(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      setLoading(true);
      try {
        const data = await apiFetch("/api/rma");
        if (!cancelled) {
          setReturns(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/api/rma/${id}/status`, { 
        method: "PATCH", 
        body: JSON.stringify({ status }) 
      });
      fetchReturns();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Return Requests</h1>
        <p className="text-sm text-slate-400">Manage buyer return requests (RMA).</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : returns.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400 text-center">
          <i className="ti ti-arrow-back-up text-3xl text-slate-600 block mb-2" aria-hidden="true" />
          No return requests yet
        </Card>
      ) : (
        <div className="space-y-3">
          {returns.map((r) => (
            <Card key={r.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-100">
                    Order: <span className="font-mono text-xs text-slate-400">{r.order_id}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Buyer: {r.buyer?.business_name || r.buyer?.email || "Unknown"}
                  </p>
                  <p className="text-sm text-slate-300 mt-2">{r.reason}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Requested: {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${STATUS_BADGE[r.status] || ""}`}>
                    {r.status}
                  </span>
                  {r.status === 'pending' && (
                    <>
                      <Button 
                        className="px-3 py-1 text-xs" 
                        onClick={() => updateStatus(r.id, 'approved')}
                      >
                        Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        className="px-3 py-1 text-xs text-rose-400" 
                        onClick={() => updateStatus(r.id, 'rejected')}
                      >
                        Reject
                      </Button>
                    </>
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