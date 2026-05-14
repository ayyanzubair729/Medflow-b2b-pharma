import { Link } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Admin Dashboard</h1>
        <p className="text-sm text-slate-400">Platform management and oversight.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link 
          to="/admin/verification" 
          className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 transition-all duration-200 hover:border-secondary/40 hover:bg-slate-800/60 hover-lift"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
            <i className="ti ti-user-check text-xl" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-100">Supplier Verification</p>
          <p className="mt-1 text-xs text-slate-400">Approve or reject new supplier registrations</p>
        </Link>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 opacity-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
            <i className="ti ti-chart-bar text-xl" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-100">Analytics</p>
          <p className="mt-1 text-xs text-slate-400">Coming in Phase 3</p>
        </div>

        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 opacity-50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-500">
            <i className="ti ti-settings text-xl" aria-hidden="true" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-100">Platform Settings</p>
          <p className="mt-1 text-xs text-slate-400">Coming in Phase 3</p>
        </div>
      </div>
    </div>
  );
}