import { useEffect, useState } from "react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { apiFetch } from "../../api/client.js";

export default function SupplierVerification() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    const fetchSuppliers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiFetch("/api/admin/suppliers/pending");
        if (!cancelled) {
          setSuppliers(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load suppliers.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchSuppliers();
    
    return () => {
      cancelled = true;
    };
  }, []);

  const handleVerify = async (id) => {
    setActionLoading(id);
    try {
      await apiFetch(`/api/admin/suppliers/${id}/verify`, { method: "PATCH" });
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id) => {
    setActionLoading(id);
    try {
      await apiFetch(`/api/admin/suppliers/${id}/reject`, { method: "PATCH" });
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-100">Supplier Verification</h2>
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
        <h2 className="text-xl font-semibold text-slate-100">Supplier Verification</h2>
        <p className="text-sm text-slate-400">Review and approve new supplier registrations.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      {suppliers.length === 0 ? (
        <Card className="p-6 text-center text-sm text-slate-400">
          <i className="ti ti-checkbox text-3xl text-slate-600 block mb-2" aria-hidden="true" />
          No pending supplier verifications
        </Card>
      ) : (
        <div className="space-y-3">
          {suppliers.map((s) => (
            <Card key={s.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-100">{s.business_name}</p>
                  <p className="mt-1 text-xs text-slate-400">{s.email}</p>
                  <p className="text-xs text-slate-500">License: {s.license_number || "N/A"}</p>
                  {s.phone && <p className="text-xs text-slate-500">Phone: {s.phone}</p>}
                  {s.address && <p className="text-xs text-slate-500">Address: {s.address}</p>}
                  <p className="mt-1 text-xs text-slate-600">
                    Registered: {s.created_at ? new Date(s.created_at).toLocaleDateString() : "Unknown"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button 
                    className="px-4 py-2 text-xs" 
                    onClick={() => handleVerify(s.id)}
                    disabled={actionLoading === s.id}
                  >
                    {actionLoading === s.id ? "Processing..." : "Verify"}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="px-4 py-2 text-xs text-rose-400 hover:border-rose-500" 
                    onClick={() => handleReject(s.id)}
                    disabled={actionLoading === s.id}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}