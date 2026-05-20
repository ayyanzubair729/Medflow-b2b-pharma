import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getProfile, updateProfile, uploadAvatar } from "../../api/auth.js";
import { setCredentials } from "../../store/slices/authSlice.js";
import Button from "../../components/ui/Button.jsx";
import Avatar from "../../components/ui/Avatar.jsx";

export default function BuyerProfile() {
  const { user, token, role } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loadingProfile, setLoadingProfile] = useState(true);

  const fileRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    business_name: "",
    phone: "",
    address: "",
    email: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfile();
        if (data) {
          setForm({
            business_name: data.business_name || "",
            phone: data.phone || "",
            address: data.address || "",
            email: data.email || "",
          });
          dispatch(setCredentials({ token, role: data.role, user: { ...user, ...data }, persist: true }));
        }
      } catch {
        if (user) {
          setForm({
            business_name: user.business_name || "",
            phone: user.phone || "",
            address: user.address || "",
            email: user.email || "",
          });
        }
      } finally {
        setLoadingProfile(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const data = await updateProfile({
        business_name: form.business_name,
        phone: form.phone,
        address: form.address,
      });
      if (data?.user) {
        dispatch(setCredentials({ token, role, user: { ...user, ...data.user }, persist: true }));
      }
      setMsg("Profile updated successfully.");
      setTimeout(() => navigate("/buyer/dashboard"), 1200);
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    setUploading(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const data = await uploadAvatar(fd);
      if (data?.avatar_url) {
        dispatch(setCredentials({ token, role, user: { ...user, avatar_url: data.avatar_url }, persist: true }));
      }
      setMsg("Avatar updated.");
      setTimeout(() => navigate("/buyer/dashboard"), 1200);
    } catch (e) {
      setErr(e.message);
    } finally {
      setUploading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-800/60" />
        <div className="h-64 animate-pulse rounded-2xl bg-slate-800/60" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Account Settings</h1>
        <p className="mt-1 text-sm text-slate-400">Manage your profile information and avatar.</p>
      </div>

      {msg && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{msg}</div>
      )}
      {err && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{err}</div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Profile Details</h2>
              <p className="text-xs text-slate-400">Update your business information.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-400">Business Name</label>
                <input name="business_name" value={form.business_name} onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Email</label>
                <input value={form.email} disabled
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-500 outline-none cursor-not-allowed" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={3}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary" />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
            </div>
          </form>
        </div>

        <div>
          <div className="rounded-2xl border border-slate-800/80 bg-slate-900/70 p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">Profile Photo</h2>
              <p className="text-xs text-slate-400">JPG, PNG or WebP. Max 5MB.</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <Avatar src={avatarPreview || user?.avatar_url} name={user?.business_name} size="xl" className="ring-2 ring-slate-700" />
              <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              <div className="flex gap-2">
                <Button variant="outline" className="px-4 py-2 text-xs" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? "Uploading..." : "Browse"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
