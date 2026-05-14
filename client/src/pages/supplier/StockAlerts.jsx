import { useEffect, useState } from "react";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { apiFetch } from "../../api/client.js";
import { listMyProducts } from "../../api/suppliers.js";

export default function StockAlerts() {
  const [products, setProducts] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [threshold, setThreshold] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodData, alertData] = await Promise.all([
        listMyProducts(),
        apiFetch("/api/supplier/alerts"),
      ]);
      setProducts(prodData || []);
      setAlerts(alertData || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    
    const load = async () => {
      setLoading(true);
      try {
        const [prodData, alertData] = await Promise.all([
          listMyProducts(),
          apiFetch("/api/supplier/alerts"),
        ]);
        if (!cancelled) {
          setProducts(prodData || []);
          setAlerts(alertData || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const addAlert = async () => {
    if (!selectedProduct || !threshold) {
      setError("Please select a product and threshold.");
      return;
    }
    try {
      await apiFetch("/api/supplier/alerts", {
        method: "POST",
        body: JSON.stringify({ 
          product_id: selectedProduct, 
          threshold: Number(threshold) 
        }),
      });
      setSelectedProduct("");
      setThreshold("");
      setError(null);
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  const removeAlert = async (id) => {
    try {
      await apiFetch(`/api/supplier/alerts/${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Stock Alerts</h1>
        <p className="text-sm text-slate-400">Get notified when stock drops below threshold.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-100 mb-3">Set New Alert</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Product</label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Stock: {p.stock_quantity})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 block mb-1">Threshold</label>
            <input
              type="number"
              min="1"
              placeholder="Min stock level"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
              className="w-32 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100 outline-none focus:border-secondary"
            />
          </div>
          <Button onClick={addAlert}>Set Alert</Button>
        </div>
      </Card>

      {loading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-800/60" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="p-6 text-sm text-slate-400 text-center">
          <i className="ti ti-bell-off text-3xl text-slate-600 block mb-2" aria-hidden="true" />
          No stock alerts set
        </Card>
      ) : (
        <div className="space-y-2">
          {alerts.map((a) => (
            <Card key={a.id} className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  {a.product?.name || "Product"}
                </p>
                <p className="text-xs text-slate-400">
                  Alert when below: <span className="text-amber-400">{a.threshold} units</span>
                  {a.product && (
                    <span className="text-slate-500 ml-2">
                      (Current: {a.product.stock_quantity})
                    </span>
                  )}
                </p>
              </div>
              <Button 
                variant="ghost" 
                className="text-xs text-rose-400 hover:text-rose-300" 
                onClick={() => removeAlert(a.id)}
              >
                Remove
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}