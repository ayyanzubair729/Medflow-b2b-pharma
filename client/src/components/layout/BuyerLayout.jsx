import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";


import { useDispatch, useSelector } from "react-redux";
import { useState, useCallback, useEffect, useRef } from "react";
import Button from "../ui/Button.jsx";
import Avatar from "../ui/Avatar.jsx";
import NotificationsPanel from "../ui/NotificationsPanel.jsx";
import { clearCredentials } from "../../store/slices/authSlice.js";
import { listAnnouncements } from "../../api/announcements.js";
import logo from "../../assets/logo.png";

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold transition ${
    isActive ? "text-secondary" : "text-slate-300 hover:text-slate-100"
  }`;

export default function BuyerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
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
    navigate(`/buyer/home?search=${encodeURIComponent(searchQuery.trim())}`);
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

  const closeNotifs = useCallback(() => {
    setShowNotifs(false);
    markAllRead();
  }, []);

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-900 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
              <img src={logo} alt="MedFlow" className="h-full w-full object-cover" />
            </Link>
            <div>
              <p className="text-sm font-semibold text-slate-100">MedFlow</p>
              <p className="text-xs text-slate-500">Buyer Portal</p>
            </div>
          </div>

          <nav className="hidden flex-1 items-center justify-center gap-6 sm:flex">
            <NavLink to="/buyer/dashboard" className={navLinkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/buyer/home" className={navLinkClass}>
              Catalog
            </NavLink>
            <NavLink to="/buyer/cart" className={navLinkClass}>
              Cart
            </NavLink>
            <NavLink to="/buyer/orders" className={navLinkClass}>
              Orders
            </NavLink>
            <NavLink to="/buyer/quotes" className={navLinkClass}>
              Quotes
            </NavLink>
            <NavLink to="/buyer/returns" className={navLinkClass}>
              Returns
            </NavLink>
            <NavLink to="/buyer/settings" className={navLinkClass}>
              Settings
            </NavLink>
          </nav>

          <div className="ml-auto flex items-center gap-3">
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
              <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 text-slate-300 hover:text-slate-100"
                onClick={handleNotifToggle}>
                <i className="ti ti-bell text-lg" aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>
              <NotificationsPanel open={showNotifs} onClose={closeNotifs} />
            </div>
            <Link to="/buyer/settings">
              <Avatar
                src={user?.avatar_url}
                name={user?.business_name}
                size="md"
              />
            </Link>
            <Button variant="outline" className="px-4 py-2 text-xs" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}