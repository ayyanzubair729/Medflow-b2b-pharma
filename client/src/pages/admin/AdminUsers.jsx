import { useEffect, useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";
import { listUsers, updateUserStatus } from "../../api/admin.js";

const ROLE_OPTIONS = ["all", "buyer", "supplier", "admin"];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  const flash = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listUsers({
        role: roleFilter === "all" ? undefined : roleFilter,
        active: statusFilter === "all" ? undefined : statusFilter === "active",
        search: search || undefined,
        limit: 50,
      });
      setUsers(data?.items || []);
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [roleFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const toggleActive = async (user) => {
    try {
      await updateUserStatus(user.id, !user.is_active);
      flash(user.is_active ? "User deactivated." : "User activated.");
      load();
    } catch (err) {
      flash(err.message || "Unable to update user.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">User Management</h1>
        <p className="text-sm text-slate-400">Search, filter, and manage platform users.</p>
      </div>

      <Card className="p-4">
        <form className="flex flex-wrap gap-3" onSubmit={handleSearch}>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by email or business name"
            className="min-w-[220px] rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
          />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
          >
            {ROLE_OPTIONS.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
          >
            <option value="all">all</option>
            <option value="active">active</option>
            <option value="inactive">inactive</option>
          </select>
          <Button type="submit" className="px-4 py-2 text-xs">
            Search
          </Button>
        </form>
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
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400">No users match your filters.</Card>
      ) : (
        <div className="space-y-3">
          {users.map((user) => (
            <Card key={user.id} className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${user.is_active ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" : "bg-rose-500/60"}`} />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">
                      {user.business_name || "Unnamed"}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                    <p className="text-xs text-slate-500 capitalize">
                      {user.role} · {user.is_active ? "active" : "inactive"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-3 py-1 text-xs ${user.is_verified ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-amber-500/40 bg-amber-500/10 text-amber-300"}`}>
                    {user.is_verified ? "verified" : "unverified"}
                  </span>
                  <Button
                    variant={user.is_active ? "outline" : "primary"}
                    className="px-4 py-2 text-xs"
                    onClick={() => toggleActive(user)}
                  >
                    {user.is_active ? "Deactivate" : "Activate"}
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
