import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../../components/ui/Card.jsx";
import { getSupplierSummary, listSupplierOrders } from "../../api/suppliers.js";
import { formatCurrency } from "../../utils/pricing.js";

export default function SupplierAnalytics() {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [s, o] = await Promise.all([
          getSupplierSummary(),
          listSupplierOrders(),
        ]);
        if (cancelled) return;
        setSummary(s);
        setOrders(o || []);
      } catch (_e) {
        if (!cancelled) setSummary(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status === "delivered")
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const statusCounts = {};
  orders.forEach((o) => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });

  const monthlyData = [];
  const monthMap = {};
  orders.forEach((o) => {
    if (!o.placed_at) return;
    const d = new Date(o.placed_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[key]) monthMap[key] = { month: key, orders: 0, revenue: 0 };
    monthMap[key].orders += 1;
    if (o.status === "delivered") {
      monthMap[key].revenue += Number(o.total_amount || 0);
    }
  });
  Object.keys(monthMap)
    .sort()
    .forEach((k) => monthlyData.push(monthMap[k]));

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-800/60" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Analytics</h1>
        <p className="mt-1 text-sm text-slate-400">
          Sales performance and order trends.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Orders
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-100">
            {totalOrders}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Total Revenue
          </p>
          <p className="mt-2 text-2xl font-bold text-emerald-300">
            {formatCurrency(totalRevenue)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Active Products
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-100">
            {summary?.active_products ?? 0}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Open Orders
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-100">
            {summary?.open_orders ?? 0}
          </p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-100">
            Monthly Orders
          </h3>
          {monthlyData.length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              No order data yet.
            </p>
          ) : (
            <div className="mt-4">
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload }) =>
                      active && payload?.length ? (
                        <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-card">
                          <p className="text-slate-400">{payload[0].payload.month}</p>
                          <p className="font-semibold text-slate-100">
                            {payload[0].value} orders
                          </p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar
                    dataKey="orders"
                    fill="#7c3aed"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-100">
            Order Status Breakdown
          </h3>
          {Object.keys(statusCounts).length === 0 ? (
            <p className="mt-6 text-sm text-slate-500">
              No order data yet.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <span className="text-sm capitalize text-slate-300">
                    {status}
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-secondary transition-all"
                        style={{
                          width: `${(count / totalOrders) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      {count}
                    </span>
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
