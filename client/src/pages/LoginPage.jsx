import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Button from "../components/ui/Button.jsx";
import logo from "../assets/logo.png";
import medicinesBg from "../assets/medicines.jpg";
import { loginUser } from "../store/slices/authSlice.js";
import { getRoleRedirect } from "../utils/redirects.js";

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [formState, setFormState] = useState({ email: "", password: "" });
  const [formError, setFormError] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);
  const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError(null);

    if (!formState.email || !formState.password) {
      setFormError("Email and password are required.");
      return;
    }

    const result = await dispatch(loginUser({ ...formState, persist: rememberMe }));
    if (result.type.endsWith("/fulfilled")) {
      navigate(getRoleRedirect(result.payload?.user?.role));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="relative min-h-screen">
        <img
          src={medicinesBg}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-65 blur-[1px]"
        />
        <div className="absolute inset-0 bg-slate-950/35" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-card">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-900">
                  <img src={logo} alt="MedFlow" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100">MedFlow</p>
                  <p className="text-xs text-slate-400">B2B Pharma Wholesale</p>
                </div>
              </div>

              <h2 className="mt-6 text-3xl font-semibold text-slate-100">Sign in</h2>
              <p className="mt-2 text-base text-slate-300">
                Use your business credentials to continue.
              </p>

              <div className="mt-6 grid gap-3">
                <a
                  href={`${apiBaseUrl}/api/auth/google`}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-white/95 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-secondary"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.8h5.4c-.7 2.2-2.6 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.6 0 3.1.6 4.2 1.7l2.6-2.6C17.3 3.2 14.8 2 12 2 6.9 2 2.8 6.1 2.8 11.2S6.9 20.4 12 20.4c4.9 0 8.6-3.5 8.6-8.4 0-.6-.1-1.1-.2-1.8H12z"
                    />
                  </svg>
                  Continue with Google
                </a>
                <a
                  href={`${apiBaseUrl}/api/auth/facebook`}
                  className="flex items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-[#1877F2] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M13.5 8.2V6.3c0-.8.5-1 1-1h1.9V2h-2.6c-2.9 0-4.3 1.7-4.3 4v2.2H7v3.2h2.5V22h3.2V11.4H16l.5-3.2h-3z" />
                  </svg>
                  Continue with Facebook
                </a>
              </div>

              <div className="mt-6 flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-800" />
                or sign in with email
                <span className="h-px flex-1 bg-slate-800" />
              </div>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="you@company.com"
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formState.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-secondary"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-secondary"
                    />
                    Remember me
                  </label>
                  <Link to="/forgot-password" className="font-semibold text-secondary hover:text-accent">
                    Forgot password?
                  </Link>
                </div>
                {(formError || error) && (
                  <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                    {formError || error}
                  </p>
                )}
                <Button className="w-full" type="submit" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="font-semibold text-secondary hover:text-accent">
                  Sign up
                </Link>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
}
