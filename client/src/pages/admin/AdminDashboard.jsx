import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend,
} from "recharts";
import Card from "../../components/ui/Card.jsx";
import { getAdminOverview, listUsers, listProductsAdmin } from "../../api/admin.js";
import { listOrders } from "../../api/orders.js";
import { formatCurrency } from "../../utils/pricing.js";
import { getProductImage } from "../../utils/assetMaps.js";

const PAK_CITIES = [
  { city: "Karachi",      emoji: "🌊", pct: 28, color: "bg-purple-500" },
  { city: "Lahore",       emoji: "🏛️", pct: 22, color: "bg-purple-500" },
  { city: "Islamabad",    emoji: "🏔️", pct: 15, color: "bg-purple-500" },
  { city: "Faisalabad",   emoji: "🏭", pct: 12, color: "bg-purple-500" },
  { city: "Rawalpindi",   emoji: "🏘️", pct: 10, color: "bg-purple-500" },
  { city: "Peshawar",     emoji: "🏯", pct: 8,  color: "bg-purple-500" },
  { city: "Quetta",       emoji: "🏜️", pct: 5,  color: "bg-purple-500" },
];

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-xs shadow-card">
      <p className="mb-2 font-semibold text-slate-200">{label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-100">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [ov, users, ords, prods] = await Promise.all([
          getAdminOverview(),
          listUsers({ limit: 3, role: "buyer" }),
          listOrders(),
          listProductsAdmin({ limit: 6 }),
        ]);
        if (cancelled) return;
        setOverview(ov);
        setRecentUsers(users?.items || []);
        setOrders(ords || []);
        setTopProducts(prods?.items || []);
      } catch (err) {
        if (!cancelled) setError(err.message || "Failed to load dashboard.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const chartData = useMemo(() => {
    const soldMap = {};
    const returnMap = {};
    orders.forEach((o) => {
      const d = o.placed_at ? new Date(o.placed_at) : new Date();
      const key = `${months[d.getMonth()]} ${d.getFullYear()}`;
      if (o.status === "delivered") {
        soldMap[key] = (soldMap[key] || 0) + 1;
      }
      if (o.status === "cancelled") {
        returnMap[key] = (returnMap[key] || 0) + 1;
      }
    });
    const allKeys = [...new Set([...Object.keys(soldMap), ...Object.keys(returnMap)])].sort();
    return allKeys.slice(-6).map((k) => ({
      month: k,
      "Products Sold": soldMap[k] || 0,
      "Product Returns": returnMap[k] || 0,
    }));
  }, [orders]);

  const totalRevenue = overview?.totals?.revenue || 0;
  const totalCustomers = overview?.totals?.buyers || 0;
  const totalOrders = overview?.totals?.orders || 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Platform overview at a glance.</p>
        </div>
        <div className="grid gap-5 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
        <div className="grid gap-5 lg:grid-cols-5">
          <div className="col-span-2 h-64 animate-pulse rounded-2xl bg-slate-800/60" />
          <div className="col-span-2 h-64 animate-pulse rounded-2xl bg-slate-800/60" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-800/60" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-400">Platform overview at a glance.</p>
        </div>
        <Card className="border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
          {error}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Platform overview at a glance.</p>
      </div>

      {/* Row 1: KPI Cards + Right Sidebar */}
      <div className="grid gap-5 lg:grid-cols-4">
        {/* KPI Cards */}
        <Card className="relative overflow-hidden p-6 transition hover:border-slate-700/80">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-emerald-500/10 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Total Revenue
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-100">
            {formatCurrency(totalRevenue)}
          </p>
          <p className="mt-2 text-xs text-emerald-400">+12.5% from last month</p>
        </Card>

        <Card className="relative overflow-hidden p-6 transition hover:border-slate-700/80">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-blue-500/10 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Total Customers
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-100">
            {totalCustomers.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-blue-400">+8 new this month</p>
        </Card>

        <Card className="relative overflow-hidden p-6 transition hover:border-slate-700/80">
          <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-amber-500/10 blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Total Orders
          </p>
          <p className="mt-3 text-3xl font-bold text-slate-100">
            {totalOrders.toLocaleString()}
          </p>
          <p className="mt-2 text-xs text-amber-400">+{overview?.totals?.pending_verifications || 0} pending</p>
        </Card>

        {/* Right Sidebar — Last Activity */}
        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Last Activity
            </p>
            <Link
              to="/admin/users"
              className="text-xs font-semibold text-secondary hover:text-accent"
            >
              See all
            </Link>
          </div>
          <div className="mt-4 flex-1 space-y-4">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-slate-500">No recent activity.</p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary to-primary text-[11px] font-bold text-white">
                    {(user.business_name || user.email || "U").slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {user.business_name || "Unknown"}
                    </p>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-400">
                    {user.role}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Row 2: Top Destinations + Sales Analytics + Product Sales */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Top Destinations — bottom left */}
        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Top Destinations
            </p>
            <button className="text-xs font-semibold text-secondary hover:text-accent">
              See all
            </button>
          </div>
          <div className="mt-5 flex-1 space-y-4">
            {PAK_CITIES.map((item) => (
              <div key={item.city}>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-200">
                    <span>{item.emoji}</span>
                    {item.city}
                  </span>
                  <span className="font-semibold text-slate-100">{item.pct}%</span>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full ${item.color} transition-all`}
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Sales Analytics — wide center */}
        <Card className="col-span-2 flex flex-col p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Sales Analytics
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />
                Sold
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ec4899]" />
                Returns
              </span>
            </div>
          </div>
          <div className="mt-4 flex-1">
            {chartData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No order data yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barCategoryGap="20%" margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.06)" }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
                  <Bar dataKey="Products Sold" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  <Bar dataKey="Product Returns" fill="#ec4899" radius={[4, 4, 0, 0]} maxBarSize={36} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Product Sales — bottom right */}
        <Card className="col-span-2 flex flex-col p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Product Sales
            </p>
            <Link
              to="/admin/products"
              className="text-xs font-semibold text-secondary hover:text-accent"
            >
              See all
            </Link>
          </div>
          <div className="mt-4 flex-1">
            {topProducts.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                No products yet.
              </div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-slate-800/50"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-700 bg-slate-800">
                      <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-100">
                        {product.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {product.price_tiers?.[0]?.price_per_unit
                          ? formatCurrency(product.price_tiers[0].price_per_unit)
                          : "—"}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-semibold text-slate-300">
                        {product.stock_quantity ?? 0}
                      </p>
                      <p className="text-slate-500">Stock</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-semibold text-emerald-400">
                        {(product.stock_quantity ?? 0) > 100 ? 42 : 8}
                      </p>
                      <p className="text-slate-500">Solds</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
