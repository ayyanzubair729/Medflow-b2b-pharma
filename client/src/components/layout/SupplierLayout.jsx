import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearCredentials } from "../../store/slices/authSlice.js";
import Button from "../ui/Button.jsx";
import logo from "../../assets/logo.png";

const link = ({ isActive }) =>
  `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? "bg-secondary/15 text-secondary"
      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
  }`;

const NAV = [
  { to: "/supplier/dashboard/overview",  icon: "ti-layout-dashboard", label: "Overview" },
  { to: "/supplier/dashboard/catalog",   icon: "ti-package",          label: "Catalog" },
  { to: "/supplier/dashboard/orders",    icon: "ti-shopping-cart",    label: "Orders" },
  { to: "/supplier/dashboard/quotes",    icon: "ti-messages",         label: "Quotes" },
  { to: "/supplier/dashboard/payouts",   icon: "ti-coin",             label: "Payouts" },
  { to: "/supplier/dashboard/returns",   icon: "ti-arrow-back-up",    label: "Returns" },
  { to: "/supplier/dashboard/alerts",    icon: "ti-bell",             label: "Alerts" },
];

export default function SupplierLayout() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur lg:flex">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800/60">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
            <img src={logo} alt="MedFlow" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">MedFlow</p>
            <p className="text-xs text-secondary">Supplier Portal</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {NAV.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} className={link}>
              <i className={`ti ${icon} text-base`} aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800/60 p-4 space-y-2">
          <p className="text-xs font-semibold text-slate-100 truncate">{user?.business_name || "Supplier"}</p>
          <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          <Button variant="ghost" className="w-full justify-start px-3 py-2 text-xs text-slate-400 hover:text-rose-400" onClick={handleLogout}>
            <i className="ti ti-logout text-base" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MedFlow" className="h-8 w-8 rounded-xl object-cover" />
            <span className="text-sm font-semibold text-slate-100">Supplier</span>
          </div>
          <nav className="flex items-center gap-1">
            {NAV.map(({ to, icon }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `rounded-xl p-2 transition ${isActive ? "text-secondary" : "text-slate-400 hover:text-slate-100"}`
                }>
                <i className={`ti ${icon} text-lg`} aria-hidden="true" />
              </NavLink>
            ))}
          </nav>
          <Button variant="ghost" className="px-3 py-2 text-xs" onClick={handleLogout}>Out</Button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}