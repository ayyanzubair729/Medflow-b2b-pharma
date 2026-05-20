import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { listAnnouncements } from "../../api/announcements.js";

export default function NotificationsPanel({ open, onClose }) {
  const { user } = useSelector((s) => s.auth);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listAnnouncements(user?.role)
      .then((data) => setAnnouncements(data || []))
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, [open, user?.role]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-slate-700/80 bg-slate-900 shadow-xl"
    >
      <div className="border-b border-slate-800 px-4 py-3">
        <p className="text-sm font-semibold text-slate-100">Announcements</p>
      </div>
      <div className="max-h-80 space-y-0 overflow-y-auto">
        {loading ? (
          <div className="space-y-3 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800/60" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <p className="p-4 text-sm text-slate-500">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className="border-b border-slate-800/60 px-4 py-3 last:border-0">
              <p className="text-sm font-semibold text-slate-100">{a.title}</p>
              <p className="mt-0.5 text-xs text-slate-400">{a.body}</p>
              <p className="mt-1 text-[10px] text-slate-600">
                {new Date(a.created_at).toLocaleDateString("en-PK", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
