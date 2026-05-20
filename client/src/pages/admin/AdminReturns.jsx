import { useEffect, useMemo, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { listReturnsAdmin, updateReturnStatusAdmin } from "../../api/admin.js";

const STATUS_OPTIONS = ["all", "pending", "approved", "rejected"];

export default function AdminReturns() {
  const [returnsData, setReturnsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [notice, setNotice] = useState(null);

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listReturnsAdmin({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      setReturnsData(data || []);
    } catch (err) {
      setError(err.message || "Unable to load return requests.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [statusFilter]);

  const updateStatus = async (rma, status) => {
    try {
      await updateReturnStatusAdmin(rma.id, status);
      flash("Return status updated.");
      load();
    } catch (err) {
      flash(err.message || "Unable to update return status.");
    }
  };

  const filtered = useMemo(() => returnsData, [returnsData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Returns / Disputes</h1>
        <p className="text-sm text-slate-400">Review and arbitrate return requests.</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
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
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400">No return requests found.</Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((rma) => (
            <Card key={rma.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    Order {rma.order_id}
                  </p>
                  <p className="text-xs text-slate-400">
                    Buyer: {rma.buyer?.business_name || rma.buyer?.email || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-400">
                    Supplier: {rma.supplier?.business_name || rma.supplier?.email || "Unknown"}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{rma.reason}</p>
                  <p className="text-xs text-slate-500">
                    Requested: {rma.created_at ? new Date(rma.created_at).toLocaleDateString() : "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Status</p>
                  <p className="text-sm font-semibold text-slate-100 capitalize">{rma.status}</p>
                  {rma.status === "pending" && (
                    <div className="mt-2 flex gap-2">
                      <Button className="px-3 py-1 text-xs" onClick={() => updateStatus(rma, "approved")}>
                        Approve
                      </Button>
                      <Button variant="outline" className="px-3 py-1 text-xs text-rose-400" onClick={() => updateStatus(rma, "rejected")}>
                        Reject
                      </Button>
                    </div>
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
