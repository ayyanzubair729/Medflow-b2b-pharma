import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback, useRef, useEffect } from "react";
import Button from "../ui/Button.jsx";
import Avatar from "../ui/Avatar.jsx";
import { clearCredentials } from "../../store/slices/authSlice.js";
import logo from "../../assets/logo.png";

const NAV = [
  { to: "/admin/dashboard", label: "Overview" },
  { to: "/admin/analytics", label: "Analytics" },
  { to: "/admin/orders", label: "Orders", badge: 12 },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/returns", label: "Transactions" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/announcements", label: "Announcements" },
  { to: "/admin/profile", label: "Profile" },
];

const navLinkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition whitespace-nowrap ${
    isActive
      ? "bg-slate-900 text-slate-100 shadow-soft"
      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
  }`;

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    if (!showSearch) return;
    searchRef.current?.focus();
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSearch]);

  const navItems = NAV;

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/70 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center justify-between gap-4 px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900">
              <img src={logo} alt="MedFlow" className="h-7 w-7" />
            </Link>
            <div>
              <p className="text-sm font-semibold text-slate-100">MedFlow</p>
              <p className="text-xs text-slate-400">Admin workspace</p>
            </div>
          </div>

          <nav className="hidden items-center justify-center gap-2 lg:flex flex-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={navLinkClass}>
                <span className="relative whitespace-nowrap">
                  {item.label}
                  {item.badge && (
                    <span className="absolute -right-4 -top-2 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  )}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <div className="relative" ref={searchWrapRef}>
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-800 text-slate-300 hover:text-slate-100"
                onClick={() => setShowSearch((p) => !p)}>
                <i className="ti ti-search text-base" aria-hidden="true" />
              </button>
              {showSearch && (
                <div className="absolute right-0 top-10 z-50 flex w-72 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2.5 shadow-xl">
                  <i className="ti ti-search text-base text-slate-400" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    type="text"
                    placeholder="Search orders, users…"
                    className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>
            <Link to="/admin/profile">
              <Avatar
                src={user?.avatar_url}
                name={user?.business_name || "ME"}
                size="sm"
              />
            </Link>
            <Button variant="ghost" className="px-3 py-1.5 text-xs whitespace-nowrap" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl px-4 py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}