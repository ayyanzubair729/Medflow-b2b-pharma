import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import { getSupplierSummary, listSupplierOrders } from "../../api/suppliers.js";
import { formatCurrency } from "../../utils/pricing.js";

const SAMPLE_CHART = [
  { name: "Mon", value: 4 },  { name: "Tue", value: 7 },
  { name: "Wed", value: 5 },  { name: "Thu", value: 9 },
  { name: "Fri", value: 6 },  { name: "Sat", value: 11 },
  { name: "Sun", value: 8 },
];

const GRADIENTS = [
  { from: "from-emerald-500/10",  border: "border-emerald-500/20", badge: "bg-emerald-500/15 text-emerald-300", icon: "📦" },
  { from: "from-blue-500/10",     border: "border-blue-500/20",    badge: "bg-blue-500/15 text-blue-300",     icon: "🛒" },
  { from: "from-amber-500/10",    border: "border-amber-500/20",   badge: "bg-amber-500/15 text-amber-300",   icon: "💬" },
  { from: "from-purple-500/10",   border: "border-purple-500/20",  badge: "bg-purple-500/15 text-purple-300", icon: "💰" },
];

function KpiCard({ label, value, sub, idx, trend }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const animating = useRef(false);
  const target = useRef(value);

  useEffect(() => { target.current = value; }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let observer = null;
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || animating.current) return;
        animating.current = true;
        const t = target.current;
        if (typeof t !== "number") { setDisplay(t); return; }
        const start = performance.now();
        const step = (now) => {
          const p = Math.min((now - start) / 900, 1);
          setDisplay(Math.round(t * p));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        observer.disconnect();
      }, { threshold: 0.3 });
      observer.observe(el);
    }, 80);
    return () => { clearTimeout(timer); if (observer) observer.disconnect(); };
  }, []);

  const g = GRADIENTS[idx % GRADIENTS.length];

  return (
    <div
      ref={ref}
      className={`group relative overflow-hidden rounded-2xl border ${g.border} bg-gradient-to-br ${g.from} from-[2%] to-transparent p-5 transition-all duration-300 hover:border-slate-600/80 hover:shadow-lg`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-100">
            {typeof value === "number" ? display.toLocaleString() : value}
          </p>
          {sub && (
            <p className="mt-2 text-xs text-slate-500">{sub}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/70 text-lg backdrop-blur">
          {g.icon}
        </div>
      </div>
      {trend !== undefined && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <span className={trend >= 0 ? "text-emerald-400" : "text-rose-400"}>
            {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </span>
          <span className="text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  );
}

export default function SupplierOverview() {
  const { user } = useSelector((s) => s.auth);
  const [summary, setSummary] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setRecentOrders((o || []).slice(0, 4));
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const stats = summary ? [
    { label: "Active Products", value: summary.active_products ?? 0, sub: null, trend: 5 },
    { label: "Open Orders",     value: summary.open_orders ?? 0,     sub: null, trend: -2 },
    { label: "Pending Quotes",  value: summary.pending_quotes ?? 0,  sub: null, trend: 12 },
    { label: "Revenue (Month)", value: summary.revenue_month ?? 0,   sub: summary.revenue_month > 0 ? formatCurrency(summary.revenue_month) : "No revenue yet", trend: 8 },
  ] : [];

  if (error) {
    return (
      <div className="space-y-8">
        <Greeting name={user?.business_name} />
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Greeting name={user?.business_name} />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <KpiCard key={s.label} label={s.label} value={s.value} sub={s.sub} idx={i} trend={s.trend} />
          ))}
        </div>
      )}

      {/* Chart + Recent Orders */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Mini trend chart */}
        <Card className="col-span-2 flex flex-col p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Weekly Orders
            </p>
            <span className="text-xs text-slate-500">This week</span>
          </div>
          <div className="mt-4 flex-1">
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={SAMPLE_CHART} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5a4"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#0ea5a4", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#0ea5a4", stroke: "#0b1220", strokeWidth: 2 }}
                />
                <Tooltip
                  content={({ active, payload, label }) =>
                    active && payload?.length ? (
                      <div className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs shadow-card">
                        <p className="text-slate-400">{label}</p>
                        <p className="font-semibold text-slate-100">{payload[0].value} orders</p>
                      </div>
                    ) : null
                  }
                  cursor={{ stroke: "rgba(148,163,184,0.12)", strokeWidth: 1 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent orders mini-list */}
        <Card className="flex flex-col p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Recent Orders
            </p>
            <Link
              to="/supplier/dashboard/orders"
              className="text-xs font-semibold text-secondary hover:text-accent"
            >
              See all
            </Link>
          </div>
          <div className="mt-4 flex-1 space-y-3">
            {recentOrders.length === 0 ? (
              <p className="text-sm text-slate-500">No recent orders.</p>
            ) : (
              recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-100">
                      {o.buyer?.business_name || "Buyer"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {o.placed_at ? new Date(o.placed_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-semibold text-slate-200">{formatCurrency(o.total_amount)}</p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${
                        o.status === "delivered"
                          ? "bg-emerald-500/15 text-emerald-300"
                          : o.status === "shipped"
                          ? "bg-blue-500/15 text-blue-300"
                          : o.status === "cancelled"
                          ? "bg-rose-500/15 text-rose-300"
                          : "bg-amber-500/15 text-amber-300"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "📦", label: "Manage Catalog", to: "/supplier/dashboard/catalog", desc: "Update stock, prices, visibility" },
            { icon: "🛒", label: "View Orders", to: "/supplier/dashboard/orders", desc: "Accept, ship, manage returns" },
            { icon: "💬", label: "Quote Requests", to: "/supplier/dashboard/quotes", desc: "Respond to buyer RFQs" },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group flex items-start gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 transition-all duration-200 hover:border-secondary/30 hover:bg-slate-800/60 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-lg group-hover:bg-secondary/20">
                {q.icon}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-100">{q.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{q.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Greeting({ name }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-slate-100">
        Good to see you,{" "}
        <span className="bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
          {name || "Supplier"}
        </span>
      </h1>
      <p className="mt-1 text-sm text-slate-400">
        Here&apos;s what&apos;s happening with your MedFlow account today.
      </p>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/70 ${className}`}>
      {children}
    </div>
  );
}
