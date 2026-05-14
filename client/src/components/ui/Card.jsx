export default function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-slate-800/80 bg-slate-900/70 ${className}`}>
      {children}
    </div>
  );
}