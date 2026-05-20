import { useEffect, useState } from "react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import {
  listSuppliersAdmin,
  verifySupplierAdmin,
  rejectSupplierAdmin,
} from "../../api/admin.js";

export default function SupplierVerification() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const fetchSuppliers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await listSuppliersAdmin({
          status,
          search: search || undefined,
        });
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
  }, [status, search, refreshToken]);

  const handleVerify = async (id) => {
    setActionLoading(id);
    try {
      await verifySupplierAdmin(id);
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
      await rejectSupplierAdmin(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-slate-100">Supplier Verification</h2>
        <p className="text-sm text-slate-400">Review supplier onboarding and status.</p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          {[
            { label: "Pending", value: "pending" },
            { label: "Verified", value: "verified" },
            { label: "Inactive", value: "inactive" },
            { label: "All", value: "all" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatus(tab.value)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                status === tab.value
                  ? "border-secondary bg-secondary/15 text-secondary"
                  : "border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
          <input
            type="text"
            placeholder="Search suppliers"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="min-w-[200px] rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
          />
          <Button className="px-4 py-2 text-xs" onClick={() => setRefreshToken((v) => v + 1)}>
            Refresh
          </Button>
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
      ) : suppliers.length === 0 ? (
        <Card className="p-6 text-center text-sm text-slate-400">
          <i className="ti ti-checkbox text-3xl text-slate-600 block mb-2" aria-hidden="true" />
          No suppliers found
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
                  {status === "pending" && (
                    <>
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
                    </>
                  )}
                  {status !== "pending" && (
                    <span className={`rounded-full border px-3 py-1 text-xs ${s.is_verified ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-slate-700 text-slate-400"}`}>
                      {s.is_active ? (s.is_verified ? "verified" : "unverified") : "inactive"}
                    </span>
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