import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import Button from "../ui/Button.jsx";
import { clearCredentials } from "../../store/slices/authSlice.js";
import logo from "../../assets/logo.png";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
    isActive
      ? "bg-secondary/15 text-secondary"
      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
  }`;

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
            <p className="text-xs text-rose-400">Admin Portal</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          <NavLink to="/admin/dashboard" className={navLinkClass}>
            <i className="ti ti-layout-dashboard text-base" aria-hidden="true" />
            Dashboard
          </NavLink>
          <NavLink to="/admin/verification" className={navLinkClass}>
            <i className="ti ti-user-check text-base" aria-hidden="true" />
            Supplier Verification
          </NavLink>
        </nav>

        <div className="border-t border-slate-800/60 p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start px-3 py-2 text-xs text-slate-400 hover:text-rose-400" 
            onClick={handleLogout}
          >
            <i className="ti ti-logout text-base" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex flex-1 flex-col overflow-hidden lg:hidden">
        <header className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <img src={logo} alt="MedFlow" className="h-8 w-8 rounded-xl object-cover" />
            <span className="text-sm font-semibold text-slate-100">Admin</span>
          </div>
          <nav className="flex items-center gap-1">
            <NavLink to="/admin/dashboard" className={({ isActive }) => `rounded-xl p-2 transition ${isActive ? "text-secondary" : "text-slate-400 hover:text-slate-100"}`}>
              <i className="ti ti-layout-dashboard text-lg" aria-hidden="true" />
            </NavLink>
            <NavLink to="/admin/verification" className={({ isActive }) => `rounded-xl p-2 transition ${isActive ? "text-secondary" : "text-slate-400 hover:text-slate-100"}`}>
              <i className="ti ti-user-check text-lg" aria-hidden="true" />
            </NavLink>
          </nav>
          <Button variant="ghost" className="px-3 py-2 text-xs" onClick={handleLogout}>Out</Button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-8">
          <Outlet />
        </main>
      </div>

      {/* Desktop main area */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:overflow-hidden">
        <header className="flex items-center justify-end border-b border-slate-800/80 bg-slate-950/90 px-6 py-3 backdrop-blur">
          <div className="flex items-center gap-4">
            <p className="text-xs text-slate-400">Administrator</p>
            <Button variant="ghost" className="px-3 py-2 text-xs" onClick={handleLogout}>Sign out</Button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto px-6 py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}