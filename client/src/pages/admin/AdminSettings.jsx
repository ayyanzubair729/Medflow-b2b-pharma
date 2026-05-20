import { useState } from "react";
import Card from "../../components/ui/Card.jsx";
import Button from "../../components/ui/Button.jsx";

const PLATFORMS = [
  { id: "leopards", name: "Leopards Courier", logo: "🐆", enabled: false },
  { id: "tcs", name: "TCS Express", logo: "🚚", enabled: true },
  { id: "callcourier", name: "Call Courier", logo: "📞", enabled: false },
  { id: "mnp", name: "M&P Logistics", logo: "📦", enabled: false },
  { id: "trax", name: "Trax Logistics", logo: "🚛", enabled: true },
  { id: "blueex", name: "BlueEx", logo: "🔵", enabled: false },
];

export default function AdminSettings() {
  const [platforms, setPlatforms] = useState(PLATFORMS);
  const [commission, setCommission] = useState("2.5");
  const [minOrder, setMinOrder] = useState("500");
  const [saved, setSaved] = useState(false);

  const togglePlatform = (id) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Platform Settings
        </h1>
        <p className="text-sm text-slate-400">
          Configure shipping platforms, fees, and platform rules.
        </p>
      </div>

      {saved && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Settings saved successfully.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Shipping Platforms
            </h2>
            <p className="text-xs text-slate-400">
              Enable or disable integrated shipping carriers.
            </p>
          </div>

          <div className="space-y-2">
            {platforms.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-3 rounded-xl border border-slate-800/60 bg-slate-950/50 px-4 py-3 cursor-pointer hover:border-slate-700/60 transition"
              >
                <span className="text-lg">{p.logo}</span>
                <span className="flex-1 text-sm font-medium text-slate-200">
                  {p.name}
                </span>
                <div
                  className={`relative h-5 w-9 rounded-full transition ${
                    p.enabled ? "bg-secondary" : "bg-slate-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${
                      p.enabled ? "left-4" : "left-0.5"
                    }`}
                  />
                  <input
                    type="checkbox"
                    checked={p.enabled}
                    onChange={() => togglePlatform(p.id)}
                    className="sr-only"
                  />
                </div>
              </label>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <div>
              <h2 className="text-base font-semibold text-slate-100">
                Platform Fees
              </h2>
              <p className="text-xs text-slate-400">
                Commission rates and order minimums.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Commission Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={commission}
                  onChange={(e) => setCommission(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400">
                  Min Order Amount (PKR)
                </label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSave}>Save Settings</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-semibold text-slate-100">
              Policy Controls
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Auto-approve verified suppliers, require prescription confirmation.
            </p>
            <div className="mt-4 space-y-3">
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800" />
                Auto-approve verified suppliers
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800" />
                Require prescription for Rx products
              </label>
              <label className="flex items-center gap-3 text-sm text-slate-300">
                <input type="checkbox" className="rounded border-slate-700 bg-slate-800" />
                Notify admin on new supplier registration
              </label>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
