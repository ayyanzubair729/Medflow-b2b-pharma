import { useEffect, useState } from "react";
import { listAnnouncements, createAnnouncement } from "../../api/announcements.js";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

export default function AdminNotifications() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await listAnnouncements();
      setAnnouncements(data || []);
    } catch {
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      await createAnnouncement(title.trim(), body.trim(), target);
      setTitle("");
      setBody("");
      setTarget("all");
      setMsg("Announcement published.");
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Announcements</h1>
        <p className="mt-1 text-sm text-slate-400">
          Create announcements for buyers, suppliers, or both.
        </p>
      </div>

      {msg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{msg}</div>
      )}
      {err && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <Card className="p-6">
        <h2 className="text-base font-semibold text-slate-100">New announcement</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
              placeholder="e.g. New pricing update"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
              placeholder="Details of the announcement…"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Target audience</label>
            <div className="mt-2 flex gap-3">
              {["all", "buyer", "supplier"].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setTarget(opt)}
                  className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                    target === opt
                      ? "bg-secondary text-white"
                      : "border border-slate-700 text-slate-300 hover:border-secondary"
                  }`}
                >
                  {opt === "all" ? "Everyone" : opt === "buyer" ? "Buyers only" : "Suppliers only"}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Publishing…" : "Publish Announcement"}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-base font-semibold text-slate-100">Published announcements</h2>
        {loading ? (
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-800/60" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">No announcements yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className="rounded-xl border border-slate-800/60 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-100">{a.title}</p>
                  <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300">
                    {a.target_audience === "all" ? "Everyone" : a.target_audience === "buyer" ? "Buyers" : "Suppliers"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">{a.body}</p>
                <p className="mt-1 text-[10px] text-slate-600">
                  {new Date(a.created_at).toLocaleDateString("en-PK", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
