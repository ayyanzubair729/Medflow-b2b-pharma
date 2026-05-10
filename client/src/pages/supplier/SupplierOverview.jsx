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

function StatCard({ label, value, sub, colorIdx = 0, animateFrom = 0 }) {
  const [display, setDisplay] = useState(animateFrom);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    if (typeof value !== "number") return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / 900, 1);
        setDisplay(Math.round(animateFrom + (value - animateFrom) * p));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      observer.disconnect();
    }, { threshold: 0.3 });

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, animateFrom]);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${STAT_COLORS[colorIdx]}`}>
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

  // Fetch summary data
  useEffect(() => {
    getSupplierSummary()
      .then(setSummary)
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  // Wire reveal animations (same pattern as LandingPage)
  useEffect(() => {
    const els = document.querySelectorAll("[data-reveal]");
    if (!els.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]); // re-run after loading so stat cards are in DOM

  const stats = summary
    ? [
        { label: "Active products",   value: summary.active_products ?? 0, colorIdx: 0 },
        { label: "Open orders",        value: summary.open_orders    ?? 0, colorIdx: 1 },
        { label: "Pending quotes",     value: summary.pending_quotes ?? 0, colorIdx: 2 },
        { label: "Revenue this month", value: summary.revenue_month  ?? 0, colorIdx: 3, format: "currency" },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="reveal" data-reveal>
        <h1 className="font-display text-2xl font-semibold text-slate-100">
          Good to see you,{" "}
          <span className="text-secondary">{user?.business_name || "Supplier"}</span>
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Here's what's happening with your MedFlow account today.
        </p>
      </div>

      {/* Stats grid */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 reveal" data-reveal>
          {stats.map((s) => (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.format === "currency" ? formatCurrency(s.value) : s.value}
              colorIdx={s.colorIdx}
            />
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className="reveal" data-reveal>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: "ti-package",      label: "Manage catalog", to: "/supplier/dashboard/catalog", desc: "Update stock, prices, visibility" },
            { icon: "ti-shopping-cart", label: "View orders",   to: "/supplier/dashboard/orders",  desc: "Accept, ship, manage returns" },
            { icon: "ti-messages",     label: "Quote requests", to: "/supplier/dashboard/quotes",  desc: "Respond to buyer RFQs" },
          ].map((q) => (
            <Link
              key={q.to}
              to={q.to}
              className="group flex items-start gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/70 p-5 transition-all duration-200 hover:border-secondary/40 hover:bg-slate-800/60 hover-lift">
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