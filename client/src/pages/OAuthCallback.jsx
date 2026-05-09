import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setCredentials } from "../store/slices/authSlice.js";
import { getRoleRedirect } from "../utils/redirects.js";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${(`00${char.charCodeAt(0).toString(16)}`).slice(-2)}`)
        .join("")
    );
    return JSON.parse(payload);
  } catch (_error) {
    return null;
  }
};

export default function OAuthCallback() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Completing sign in...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setMessage("OAuth token missing. Redirecting to sign in...");
      const timer = setTimeout(() => navigate("/login"), 1500);
      return () => clearTimeout(timer);
    }

    const payload = parseJwt(token) || {};
    const role = payload.role || null;
    const user = {
      id: payload.id || null,
      email: payload.email || null,
      role,
    };

    dispatch(setCredentials({ token, role, user }));
    navigate(getRoleRedirect(role));
  }, [dispatch, navigate]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-6">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-4 text-sm text-slate-200">
        {message}
      </div>
    </div>
  );
}
