import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { clearCart, listCartItems, removeCartItem, updateCartItem } from "../../api/cart.js";
import { createOrder } from "../../api/orders.js";
import { getProductImage } from "../../utils/assetMaps.js";
import { formatCurrency, resolveUnitPrice } from "../../utils/pricing.js";

const getMoq = (tiers) => {
  if (!Array.isArray(tiers) || tiers.length === 0) return 1;
  return Math.min(...tiers.map((tier) => Number(tier.min_quantity) || 1));
};

export default function BuyerCart() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [quantities, setQuantities] = useState({});

  const fetchCart = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCartItems();
      setItems(data || []);
      const qtyMap = (data || []).reduce((acc, item) => {
        acc[item.id] = item.quantity;
        return acc;
      }, {});
      setQuantities(qtyMap);
    } catch (err) {
      setError(err.message || "Unable to load cart.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const totals = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const unitPrice = resolveUnitPrice(item.product?.price_tiers, item.quantity);
        if (unitPrice === null) {
          acc.unpriced = true;
          return acc;
        }
        acc.total += unitPrice * item.quantity;
        return acc;
      },
      { total: 0, unpriced: false }
    );
  }, [items]);

  const handleUpdate = async (itemId) => {
    const qty = Number(quantities[itemId]);
    if (!Number.isFinite(qty) || qty <= 0) {
      setNotice("Enter a valid quantity.");
      return;
    }
    const item = items.find((entry) => entry.id === itemId);
    const moq = getMoq(item?.product?.price_tiers);
    if (qty < moq) {
      setNotice(`MOQ for ${item?.product?.name || "this product"} is ${moq}.`);
      return;
    }
    try {
      await updateCartItem({ id: itemId, quantity: qty });
      await fetchCart();
      setNotice("Cart updated.");
    } catch (err) {
      setNotice(err.message || "Unable to update cart.");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeCartItem(itemId);
      await fetchCart();
    } catch (err) {
      setNotice(err.message || "Unable to remove item.");
    }
  };

  const handleClear = async () => {
    try {
      await clearCart();
      await fetchCart();
    } catch (err) {
      setNotice(err.message || "Unable to clear cart.");
    }
  };

  const handlePlaceOrder = async () => {
    for (const item of items) {
      const moq = getMoq(item.product?.price_tiers);
      if (item.quantity < moq) {
        setNotice(`MOQ for ${item.product?.name || "this product"} is ${moq}.`);
        return;
      }
    }
    try {
      await createOrder({
        delivery_address: deliveryAddress || null,
        notes: notes || null,
      });
      setNotice("Order placed successfully.");
      navigate("/buyer/orders");
    } catch (err) {
      setNotice(err.message || "Unable to place order.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Your cart</h1>
        <p className="text-sm text-slate-400">Review items and place your order.</p>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {loading ? (
            <Card className="h-48 animate-pulse" />
          ) : items.length === 0 ? (
            <Card className="p-6 text-sm text-slate-300">Your cart is empty.</Card>
          ) : (
            items.map((item) => (
              <Card key={item.id} className="p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                      <img
                        src={getProductImage(item.product)}
                        alt={item.product?.name || "Product"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{item.product?.name}</p>
                      <p className="text-xs text-slate-400">SKU: {item.product?.sku}</p>
                      <p className="text-xs text-slate-500">MOQ: {getMoq(item.product?.price_tiers)}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-300">
                    Unit price: {formatCurrency(resolveUnitPrice(item.product?.price_tiers, item.quantity))}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    value={quantities[item.id] || item.quantity}
                    onChange={(event) =>
                      setQuantities((prev) => ({
                        ...prev,
                        [item.id]: event.target.value,
                      }))
                    }
                    className="w-24 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                  />
                  <Button variant="outline" className="px-4" onClick={() => handleUpdate(item.id)}>
                    Update
                  </Button>
                  <Button variant="ghost" className="px-4" onClick={() => handleRemove(item.id)}>
                    Remove
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        <Card className="h-fit p-6">
          <h2 className="text-lg font-semibold text-slate-100">Order summary</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span>Items</span>
              <span>{items.length}</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold text-slate-100">
              <span>Estimated total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
            {totals.unpriced && (
              <p className="text-xs text-slate-400">Some items require manual pricing review.</p>
            )}
          </div>

          <div className="mt-6 space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Delivery address
            </label>
            <textarea
              value={deliveryAddress}
              onChange={(event) => setDeliveryAddress(event.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
              placeholder="Enter delivery address"
            />
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={2}
              className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none"
              placeholder="Add special instructions"
            />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button onClick={handlePlaceOrder} disabled={items.length === 0}>
              Place order
            </Button>
            <Button variant="outline" onClick={handleClear} disabled={items.length === 0}>
              Clear cart
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
