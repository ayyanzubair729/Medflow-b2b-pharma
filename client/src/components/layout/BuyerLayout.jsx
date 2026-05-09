import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "../ui/Button.jsx";
import { clearCredentials } from "../../store/slices/authSlice.js";
import logo from "../../assets/logo.png";

const navLinkClass = ({ isActive }) =>
  `text-sm font-semibold transition ${
    isActive ? "text-secondary" : "text-slate-300 hover:text-slate-100"
  }`;

export default function BuyerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(clearCredentials());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-900 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
              <img src={logo} alt="MedFlow" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">MedFlow</p>
              <p className="text-xs text-slate-500">Buyer Portal</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 sm:flex">
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
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <div className="hidden text-right text-xs text-slate-400 sm:block">
              <p className="text-slate-200">{user?.business_name || "Buyer"}</p>
              <p>{user?.email || ""}</p>
            </div>
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
