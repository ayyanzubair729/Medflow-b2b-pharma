import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback, useEffect, useRef } from "react";
import { clearCredentials } from "../../store/slices/authSlice.js";
import Button from "../ui/Button.jsx";
import Avatar from "../ui/Avatar.jsx";
import NotificationsPanel from "../ui/NotificationsPanel.jsx";
import { listAnnouncements } from "../../api/announcements.js";
import logo from "../../assets/logo.png";

const link = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? "bg-slate-900 text-slate-100 shadow-soft"
      : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/60"
  }`;

const NAV = [
  { to: "/supplier/dashboard/overview",  label: "Overview" },
  { to: "/supplier/dashboard/analytics", label: "Analytics" },
  { to: "/supplier/dashboard/catalog",   label: "Catalog" },
  { to: "/supplier/dashboard/orders",    label: "Orders" },
  { to: "/supplier/dashboard/quotes",    label: "Quotes" },
  { to: "/supplier/dashboard/payouts",   label: "Payouts" },
  { to: "/supplier/dashboard/returns",   label: "Returns" },
  { to: "/supplier/dashboard/alerts",    label: "Alerts" },
  { to: "/supplier/dashboard/settings",  label: "Settings" },
];

export default function SupplierLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const [showNotifs, setShowNotifs] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const handleSearchKey = (e) => {
    if (e.key !== "Enter" || !searchQuery.trim()) return;
    setShowSearch(false);
    setSearchQuery("");
    navigate(`/supplier/dashboard/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const getLastSeenKey = () => `medflow_notifs_seen_${user?.id || "anon"}`;

  const fetchUnread = useCallback(async () => {
    try {
      const data = await listAnnouncements(user?.role);
      if (!data?.length) { setUnreadCount(0); return; }
      const lastSeen = localStorage.getItem(getLastSeenKey());
      const count = data.filter((a) => !lastSeen || new Date(a.created_at) > new Date(lastSeen)).length;
      setUnreadCount(count);
    } catch { setUnreadCount(0); }
  }, [user?.id, user?.role]);

  useEffect(() => { fetchUnread(); }, [fetchUnread]);

  const markAllRead = () => {
    localStorage.setItem(getLastSeenKey(), new Date().toISOString());
    setUnreadCount(0);
  };

  const handleNotifToggle = () => {
    setShowNotifs((p) => {
      if (!p) markAllRead();
      return !p;
    });
  };

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
  };

  const closeNotifs = useCallback(() => {
    setShowNotifs(false);
    markAllRead();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800/70 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-4 px-4 py-4 lg:px-8">
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900">
              <img src={logo} alt="MedFlow" className="h-7 w-7" />
            </Link>
            <div>
              <p className="text-sm font-semibold text-slate-100">MedFlow</p>
              <p className="text-xs text-secondary">Supplier Portal</p>
            </div>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-2 lg:flex">
            {NAV.map(({ to, label }) => (
              <NavLink key={to} to={to} className={link}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="relative" ref={searchWrapRef}>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 text-slate-300 hover:text-slate-100"
                onClick={() => setShowSearch((p) => !p)}>
                <i className="ti ti-search text-lg" aria-hidden="true" />
              </button>
              {showSearch && (
                <div className="absolute right-0 top-11 z-50 flex w-72 items-center gap-2 rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2.5 shadow-xl">
                  <i className="ti ti-search text-base text-slate-400" aria-hidden="true" />
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKey}
                    placeholder="Search products, orders…"
                    className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
                  />
                </div>
              )}
            </div>
            <div className="relative">
              <button
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 text-slate-300 hover:text-slate-100"
                onClick={handleNotifToggle}
              >
                <i className="ti ti-bell text-lg" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              <NotificationsPanel open={showNotifs} onClose={closeNotifs} />
            </div>
            <Link to="/supplier/dashboard/settings">
              <Avatar src={user?.avatar_url} name={user?.business_name} size="md" />
            </Link>
            <Button variant="ghost" className="px-4 py-2 text-xs" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-screen-2xl items-center gap-2 overflow-x-auto px-4 pb-3 lg:hidden">
          {NAV.map(({ to, label }) => (
            <NavLink key={to} to={to} className={link}>
              {label}
            </NavLink>
          ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-screen-2xl px-4 py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}
