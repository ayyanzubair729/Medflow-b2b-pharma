import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import Card from "../../components/ui/Card.jsx";
import { getAdminOverview } from "../../api/admin.js";
import { listOrders } from "../../api/orders.js";
import { listUsers } from "../../api/admin.js";
import { formatCurrency } from "../../utils/pricing.js";

const COLORS = ["#7c3aed", "#ec4899", "#0ea5a4", "#f59e0b", "#ef4444", "#22c55e"];

export default function AdminAnalytics() {
  const [overview, setOverview] = useState(null);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [ov, ord, usr] = await Promise.all([
          getAdminOverview(),
          listOrders(),
          listUsers({ limit: 100 }),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setOrders(ord || []);
        setUsers(usr?.items || []);
      } catch (_e) {
        if (!cancelled) { setOverview(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const monthlyRevenue = [];
  const monthMap = {};
  (orders || [])
    .filter((o) => o.status === "delivered")
    .forEach((o) => {
      if (!o.placed_at) return;
      const d = new Date(o.placed_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[key]) monthMap[key] = { month: key, revenue: 0, orders: 0 };
      monthMap[key].revenue += Number(o.total_amount || 0);
      monthMap[key].orders += 1;
    });
  Object.keys(monthMap).sort().forEach((k) => monthlyRevenue.push(monthMap[k]));

  const statusCounts = {};
  (orders || []).forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  const roleCounts = {};
  (users || []).forEach((u) => {
    roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
  });
  const roleData = Object.entries(roleCounts).map(([name, value]) => ({ name, value }));

  const totalRev = (overview?.total_revenue ?? 0) + monthlyRevenue.reduce((s, m) => s + m.revenue, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-800/60" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/60" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">Platform-wide metrics and trends.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Revenue</p>
          <p className="mt-2 text-2xl font-bold text-emerald-300">{formatCurrency(totalRev)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Orders</p>
          <p className="mt-2 text-2xl font-bold text-slate-100">{orders.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</p>
          <p className="mt-2 text-2xl font-bold text-slate-100">{users.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Suppliers</p>
          <p className="mt-2 text-2xl font-bold text-slate-100">
            {users.filter((u) => u.role === "supplier" && u.is_active).length}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-100">Monthly Revenue</h3>
          {monthlyRevenue.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No revenue data yet.</p>
          ) : (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-card">
                          <p className="text-slate-400">{payload[0].payload.month}</p>
                          <p className="font-semibold text-emerald-300">{formatCurrency(payload[0].value)}</p>
                          <p className="text-slate-400">{payload[0].payload.orders} orders</p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="revenue" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={44} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-100">Order Status Breakdown</h3>
          {pieData.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No order data yet.</p>
          ) : (
            <div className="mt-4 flex items-center justify-center gap-8">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={44} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-card">
                          <p className="capitalize text-slate-300">{payload[0].name}</p>
                          <p className="font-semibold text-slate-100">{payload[0].value} orders</p>
                        </div>
                      ) : null
                    }
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="capitalize text-slate-400">{d.name}</span>
                    <span className="font-semibold text-slate-200">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-100">Monthly Orders</h3>
          {monthlyRevenue.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No order data yet.</p>
          ) : (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-card">
                          <p className="text-slate-400">{payload[0].payload.month}</p>
                          <p className="font-semibold text-slate-100">{payload[0].value} orders</p>
                        </div>
                      ) : null
                    }
                  />
                  <Line type="monotone" dataKey="orders" stroke="#0ea5a4" strokeWidth={2.5} dot={{ r: 3, fill: "#0ea5a4" }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-100">Users by Role</h3>
          {roleData.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">No user data yet.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {roleData.map((r, i) => (
                <div key={r.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm capitalize text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    {r.name}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full rounded-full transition-all" style={{ width: `${(r.value / (users.length || 1)) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">{r.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
