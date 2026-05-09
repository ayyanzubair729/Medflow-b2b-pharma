import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";
import Card from "../../components/ui/Card.jsx";
import { addCartItem } from "../../api/cart.js";
import { listProducts } from "../../api/products.js";
import { listCategories } from "../../api/categories.js";
import { listSuppliers } from "../../api/suppliers.js";
import { createQuote } from "../../api/quotes.js";
import { getCategoryImage, getProductImage } from "../../utils/assetMaps.js";
import { getTierRange } from "../../utils/pricing.js";

const getMoq = (tiers) => {
  if (!Array.isArray(tiers) || tiers.length === 0) return 1;
  return Math.min(...tiers.map((tier) => Number(tier.min_quantity) || 1));
};

export default function BuyerHome() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    supplier: "",
    stock_status: "",
    price_min: "",
    price_max: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [quantities, setQuantities] = useState({});
  const [quoteOpenId, setQuoteOpenId] = useState(null);
  const [quoteForms, setQuoteForms] = useState({});

  const fetchFilters = async () => {
    try {
      const [categoryData, supplierData] = await Promise.all([
        listCategories(),
        listSuppliers(),
      ]);
      setCategories(categoryData || []);
      setSuppliers(supplierData || []);
    } catch (_err) {
      setCategories([]);
      setSuppliers([]);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProducts({
        search,
        page,
        limit: 9,
        category: filters.category || undefined,
        supplier: filters.supplier || undefined,
        stock_status: filters.stock_status || undefined,
        price_min: filters.price_min || undefined,
        price_max: filters.price_max || undefined,
      });
      setProducts(data.items || []);
      setTotalPages(data.totalPages || 1);
    } catch (err) {
      setError(err.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, search, filters]);

  const handleAddToCart = async (product) => {
    const qty = Number(quantities[product.id] || getMoq(product.price_tiers));
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

  const handleQuoteSubmit = async (product) => {
    const form = quoteForms[product.id] || {};
    const qty = Number(form.quantity || getMoq(product.price_tiers));
    if (!Number.isFinite(qty) || qty <= 0) {
      setNotice("Enter a valid quote quantity.");
      return;
    }

    try {
      await createQuote({
        product_id: product.id,
        quantity_requested: qty,
        message: form.message || null,
      });
      setNotice("Quote request sent.");
      setQuoteOpenId(null);
    } catch (err) {
      setNotice(err.message || "Unable to request quote.");
    }
  };

  const totalFilters = useMemo(
    () =>
      [filters.category, filters.supplier, filters.stock_status, filters.price_min, filters.price_max].filter(
        Boolean
      ).length,
    [filters]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Buyer Catalog</h1>
          <p className="text-sm text-slate-400">Browse verified suppliers and tiered pricing.</p>
        </div>
        <div className="flex w-full items-center gap-3 rounded-full border border-slate-800 bg-slate-900/80 px-4 py-2 sm:max-w-md">
          <input
            type="text"
            value={search}
            onChange={(event) => {
              setPage(1);
              setSearch(event.target.value);
            }}
            placeholder="Search by product or SKU"
            className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 outline-none"
          />
        </div>
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-100">Filters</p>
          {totalFilters > 0 && (
            <Button
              variant="outline"
              className="px-4"
              onClick={() => {
                setFilters({
                  category: "",
                  supplier: "",
                  stock_status: "",
                  price_min: "",
                  price_max: "",
                });
                setPage(1);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Category</label>
            <select
              value={filters.category}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, category: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Supplier</label>
            <select
              value={filters.supplier}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, supplier: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">All</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.business_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Stock</label>
            <select
              value={filters.stock_status}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, stock_status: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
            >
              <option value="">All</option>
              <option value="in_stock">In stock</option>
              <option value="low_stock">Low stock</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Min price</label>
            <input
              type="number"
              value={filters.price_min}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, price_min: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Max price</label>
            <input
              type="number"
              value={filters.price_max}
              onChange={(event) =>
                setFilters((prev) => ({ ...prev, price_max: event.target.value }))
              }
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
              placeholder="10000"
            />
          </div>
        </div>
      </Card>

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <Card key={`skeleton-${index}`} className="h-56 animate-pulse" />
            ))
          : products.map((product) => {
              const moq = getMoq(product.price_tiers);
              const productImage = getProductImage(product);
              const categoryImage = getCategoryImage(product.category?.name);
              return (
                <Card key={product.id} className="flex h-full flex-col p-5">
                  <div className="h-36 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60">
                    <img
                      src={productImage}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="mt-4 flex items-center gap-2">
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
                    <h3 className="text-lg font-semibold text-slate-100">{product.name}</h3>
                    <p className="text-sm text-slate-400">SKU: {product.sku}</p>
                    <p className="text-sm text-slate-300">
                      Supplier: {product.supplier?.business_name || "Verified supplier"}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2 text-sm text-slate-300">
                    <p>Stock: {product.stock_status?.replace(/_/g, " ")}</p>
                    <p>MOQ: {moq}</p>
                    <p>Tiered pricing: {getTierRange(product.price_tiers)}</p>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <input
                      type="number"
                      min={moq}
                      value={quantities[product.id] || moq}
                      onChange={(event) =>
                        setQuantities((prev) => ({
                          ...prev,
                          [product.id]: event.target.value,
                        }))
                      }
                      className="w-24 rounded-full border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                    />
                    <Button className="flex-1" onClick={() => handleAddToCart(product)}>
                      Add to cart
                    </Button>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      className="text-sm font-semibold text-secondary hover:text-accent"
                      onClick={() => setQuoteOpenId((prev) => (prev === product.id ? null : product.id))}
                    >
                      Request quote
                    </button>
                    <Link
                      to={`/buyer/products/${product.id}`}
                      className="text-sm font-semibold text-secondary hover:text-accent"
                    >
                      View details
                    </Link>
                  </div>

                  {quoteOpenId === product.id && (
                    <div className="mt-4 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <input
                        type="number"
                        min={moq}
                        value={quoteForms[product.id]?.quantity || moq}
                        onChange={(event) =>
                          setQuoteForms((prev) => ({
                            ...prev,
                            [product.id]: {
                              ...(prev[product.id] || {}),
                              quantity: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                        placeholder="Quantity requested"
                      />
                      <textarea
                        rows={3}
                        value={quoteForms[product.id]?.message || ""}
                        onChange={(event) =>
                          setQuoteForms((prev) => ({
                            ...prev,
                            [product.id]: {
                              ...(prev[product.id] || {}),
                              message: event.target.value,
                            },
                          }))
                        }
                        className="w-full rounded-2xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-100"
                        placeholder="Notes or delivery requirements"
                      />
                      <div className="flex gap-2">
                        <Button className="flex-1" onClick={() => handleQuoteSubmit(product)}>
                          Send request
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setQuoteOpenId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="px-4"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            className="px-4"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
