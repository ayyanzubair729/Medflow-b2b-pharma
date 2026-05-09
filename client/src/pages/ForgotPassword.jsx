import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import logo from "../assets/logo.png";
import medicinesBg from "../assets/medicines.jpg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    setError(null);

    if (!email) {
      setError("Email is required.");
      return;
    }

    setSubmitted(true);
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
                <p className="text-xs text-slate-400">Secure account recovery</p>
              </div>
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-slate-100">Forgot password</h2>
            <p className="mt-2 text-sm text-slate-300">
              We&apos;ll send reset instructions if an account exists for this email.
            </p>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none focus:border-secondary"
                />
              </div>

              {error && (
                <p className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </p>
              )}

              {submitted && !error && (
                <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                  Check your inbox for a reset link.
                </p>
              )}

              <Button className="w-full" type="submit">
                Send reset link
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Remembered your password?{" "}
              <Link to="/login" className="font-semibold text-secondary hover:text-accent">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
