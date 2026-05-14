import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getSupplierSummary } from "../../api/suppliers.js";
import { formatCurrency } from "../../utils/pricing.js";

const STAT_COLORS = [
  "from-secondary/20 to-transparent border-secondary/30",
  "from-primary/20 to-transparent border-primary/30",
  "from-amber-500/20 to-transparent border-amber-500/30",
  "from-emerald-500/20 to-transparent border-emerald-500/30",
];

function StatCard({ label, value, sub, colorIdx = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const animating = useRef(false);
  const targetValue = useRef(value);

  useEffect(() => {
    targetValue.current = value;
  }, [value]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let observer;
    let animationId;

    const timer = setTimeout(() => {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting || animating.current) return;
        animating.current = true;

        const target = targetValue.current;
        if (typeof target !== "number" || target === 0) {
          setDisplay(target);
          return;
        }

        const start = performance.now();
        const duration = 900;

        const step = (now) => {
          const p = Math.min((now - start) / duration, 1);
          setDisplay(Math.round(target * p));
          if (p < 1) {
            animationId = requestAnimationFrame(step);
          }
        };

        animationId = requestAnimationFrame(step);
        if (observer) observer.disconnect();
      }, { threshold: 0.3 });

      observer.observe(el);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${STAT_COLORS[colorIdx]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-100">
        {typeof value === "number" ? display.toLocaleString() : value}
      </p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

export default function SupplierOverview() {
  const { user } = useSelector((s) => s.auth);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchSummary = async () => {
      try {
        const data = await getSupplierSummary();
        if (!cancelled) {
          setSummary(data);
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

    fetchSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = summary
    ? [
        { label: "Active Products", value: summary.active_products ?? 0, colorIdx: 0 },
        { label: "Open Orders", value: summary.open_orders ?? 0, colorIdx: 1 },
        { label: "Pending Quotes", value: summary.pending_quotes ?? 0, colorIdx: 2 },
        {
          label: "Revenue (Month)",
          value: summary.revenue_month ?? 0,
          colorIdx: 3,
          sub: summary.revenue_month > 0 ? formatCurrency(summary.revenue_month) : "No revenue yet",
        },
      ]
    : [];

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-100">
            Good to see you, <span className="text-secondary">{user?.business_name || "Supplier"}</span>
          </h1>
        </div>
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-slate-100">
          Good to see you, <span className="text-secondary">{user?.business_name || "Supplier"}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Here's what's happening with your MedFlow account today.
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} colorIdx={s.colorIdx} />
          ))}
        </div>
      )}

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Quick Actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "ti-package", label: "Manage Catalog", to: "/supplier/dashboard/catalog", desc: "Update stock, prices, visibility" },
            { icon: "ti-shopping-cart", label: "View Orders", to: "/supplier/dashboard/orders", desc: "Accept, ship, manage returns" },
            { icon: "ti-messages", label: "Quote Requests", to: "/supplier/dashboard/quotes", desc: "Respond to buyer RFQs" },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group flex items-start gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 transition-all duration-200 hover:border-secondary/40 hover:bg-slate-800/60 hover-lift"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary/20 transition-colors">
                <i className={`ti ${q.icon} text-xl`} aria-hidden="true" />
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