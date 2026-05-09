export default function Section({ title, subtitle, children, className = "" }) {
  return (
    <section className={`py-16 sm:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          {title && (
            <h2 className="font-display text-3xl font-semibold text-slate-100 sm:text-4xl">
              {title}
            </h2>
          )}
          {subtitle && <p className="mt-3 text-base text-slate-300">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
