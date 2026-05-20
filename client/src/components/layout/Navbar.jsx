import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";
import logo from "../../assets/logo.png";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-900 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
            <img src={logo} alt="MedFlow" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">MedFlow</p>
          </div>
        </div>

        <nav className="hidden flex-1 items-center justify-center gap-5 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300 lg:flex">
          <a href="#about" className="transition hover:text-slate-100">About</a>
          <a href="#products" className="transition hover:text-slate-100">Products</a>
          <a href="#certifications" className="transition hover:text-slate-100">Certifications</a>
          <a href="#innovation" className="transition hover:text-slate-100">Innovation</a>
          <a href="#careers" className="transition hover:text-slate-100">Careers</a>
          <a href="#contact" className="transition hover:text-slate-100">Contact Us</a>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <button className="hidden items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm font-semibold text-slate-300 transition hover:border-secondary hover:text-secondary sm:inline-flex">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 21L16.65 16.65M18 11C18 14.866 14.866 18 11 18C7.134 18 4 14.866 4 11C4 7.134 7.134 4 11 4C14.866 4 18 7.134 18 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Search
          </button>
          <Link to="/login" className="text-sm font-semibold text-slate-300 transition hover:text-slate-100">
            Sign in
          </Link>
          <Link to="/register" className="rounded-full border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-secondary hover:text-secondary">
            Register
          </Link>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-4 pb-4 sm:px-6 lg:hidden">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          <a href="#about" className="hover:text-slate-100">About</a>
          <a href="#products" className="hover:text-slate-100">Products</a>
          <a href="#certifications" className="hover:text-slate-100">Certs</a>
          <a href="#innovation" className="hover:text-slate-100">Innovation</a>
          <a href="#careers" className="hover:text-slate-100">Careers</a>
          <a href="#contact" className="hover:text-slate-100">Contact</a>
        </div>
      </div>
    </header>
  );
}
