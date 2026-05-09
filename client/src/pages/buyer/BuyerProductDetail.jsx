import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { addCartItem } from "../../api/cart.js";
import { createQuote } from "../../api/quotes.js";
import { getProductById } from "../../api/products.js";
import { getCategoryImage, getProductImage } from "../../utils/assetMaps.js";
import { formatCurrency, getTierRange, resolveUnitPrice } from "../../utils/pricing.js";

const getMoq = (tiers) => {
  if (!Array.isArray(tiers) || tiers.length === 0) return 1;
  return Math.min(...tiers.map((tier) => Number(tier.min_quantity) || 1));
};

export default function BuyerProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [quantity, setQuantity] = useState(0);
  const [quoteQuantity, setQuoteQuantity] = useState(0);
  const [quoteMessage, setQuoteMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(id);
        setProduct(data);
        const moq = getMoq(data?.price_tiers);
        setQuantity(moq);
        setQuoteQuantity(moq);
      } catch (err) {
        setError(err.message || "Unable to load product.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const tiers = useMemo(() => {
    if (!product?.price_tiers) return [];
    return [...product.price_tiers].sort(
      (a, b) => Number(a.min_quantity) - Number(b.min_quantity)
    );
  }, [product]);

  const handleAddToCart = async () => {
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setNotice("Enter a valid quantity.");
      return;
    }
    try {
      await addCartItem({ product_id: product.id, quantity: qty });
      setNotice("Added to cart.");
    } catch (err) {
      setNotice(err.message || "Unable to add to cart.");
    }
  };

  const handleQuote = async () => {
    const qty = Number(quoteQuantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setNotice("Enter a valid quote quantity.");
      return;
    }
    try {
      await createQuote({
        product_id: product.id,
        quantity_requested: qty,
        message: quoteMessage || null,
      });
      setNotice("Quote request sent.");
      setQuoteMessage("");
    } catch (err) {
      setNotice(err.message || "Unable to request quote.");
    }
  };

  if (loading) {
    return <Card className="h-60 animate-pulse" />;
  }

  if (error) {
    return (
      <Card className="p-6 text-sm text-rose-200">
        {error}
      </Card>
    );
  }

  if (!product) return null;

  const moq = getMoq(product.price_tiers);
  const unitPrice = resolveUnitPrice(product.price_tiers, quantity);
  const productImage = getProductImage(product);
  const categoryImage = getCategoryImage(product.category?.name);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 overflow-hidden rounded-full border border-slate-800">
              <img
                src={categoryImage}
                alt={product.category?.name || "Category"}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              {product.category?.name || "Category"}
            </p>
          </div>
          <h1 className="mt-2 text-2xl font-semibold text-slate-100">{product.name}</h1>
          <p className="mt-2 text-sm text-slate-400">SKU: {product.sku}</p>
        </div>
        <Link to="/buyer/home" className="text-sm font-semibold text-secondary hover:text-accent">
          Back to catalog
        </Link>
      </div>

      {notice && (
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
            <img
              src={productImage}
              alt={product.name}
              className="h-52 w-full object-cover"
              loading="lazy"
            />
          </div>
          <h2 className="mt-6 text-lg font-semibold text-slate-100">Product details</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-slate-400">Supplier</p>
              <p className="text-sm font-semibold text-slate-100">
                {product.supplier?.business_name || "Verified supplier"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Stock status</p>
              <p className="text-sm font-semibold text-slate-100">
                {product.stock_status?.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">MOQ</p>
              <p className="text-sm font-semibold text-slate-100">{moq}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Tiered range</p>
              <p className="text-sm font-semibold text-slate-100">
                {getTierRange(product.price_tiers)}
              </p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-800">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-4 py-3">Min Qty</th>
                  <th className="px-4 py-3">Max Qty</th>
                  <th className="px-4 py-3">Price / Unit</th>
                </tr>
              </thead>
              <tbody>
                {tiers.length === 0 ? (
                  <tr>
                    <td className="px-4 py-4" colSpan={3}>
                      Pricing on request.
                    </td>
                  </tr>
                ) : (
                  tiers.map((tier) => (
                    <tr key={tier.id} className="border-t border-slate-800">
                      <td className="px-4 py-3">{tier.min_quantity}</td>
                      <td className="px-4 py-3">{tier.max_quantity ?? "∞"}</td>
                      <td className="px-4 py-3">{formatCurrency(tier.price_per_unit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-100">Order actions</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">Quantity</p>
              <input
                type="number"
                min={moq}
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
              />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Estimated unit price</span>
              <span className="font-semibold text-slate-100">
                {unitPrice ? formatCurrency(unitPrice) : "Pricing on request"}
              </span>
            </div>
            <Button className="w-full" onClick={handleAddToCart}>
              Add to cart
            </Button>
          </div>

          <div className="mt-6 border-t border-slate-800 pt-6">
            <h3 className="text-sm font-semibold text-slate-100">Request a custom quote</h3>
            <div className="mt-3 space-y-3">
              <input
                type="number"
                min={moq}
                value={quoteQuantity}
                onChange={(event) => setQuoteQuantity(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                placeholder="Requested quantity"
              />
              <textarea
                value={quoteMessage}
                onChange={(event) => setQuoteMessage(event.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-slate-100"
                placeholder="Notes or delivery requirements"
              />
              <Button variant="outline" className="w-full" onClick={handleQuote}>
                Request quote
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
