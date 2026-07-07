import React, { useCallback, useMemo, useRef, useState } from "react";
import { useGeneralProductContext } from "@/context/GeneralProductContext";
import GeneralProductCard from "./GeneralProductCard";
import { RotateCcw, Search, ShieldCheck, SlidersHorizontal } from "lucide-react";

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const productVariants = (product) => (Array.isArray(product?.variants) ? product.variants : []);

const productPrice = (product) => {
  const variants = productVariants(product);
  const variantPrices = variants
    .map((variant) => {
      const regular = toNumber(variant?.pv_regular_price);
      const discount = toNumber(variant?.pv_discount_price);
      return discount > 0 && discount < regular ? discount : regular;
    })
    .filter((price) => price > 0);

  if (variantPrices.length) return Math.min(...variantPrices);

  const legacyPrices = (Array.isArray(product?.prices) ? product.prices : [])
    .map((price) => toNumber(price?.pp_discount_price) || toNumber(price?.pp_regular_price))
    .filter((price) => price > 0);

  return legacyPrices.length ? Math.min(...legacyPrices) : 0;
};

const productStock = (product) =>
  productVariants(product).reduce((total, variant) => total + toNumber(variant?.pv_available_qty ?? variant?.pv_stock_qty), 0);

const GeneralProduct = () => {
  const {
    products,
    loading,
    hasMore,
    getAllProduct,
    categoryId,
    filters,
    setFilters,
    applyFilters,
    resetFilters,
  } = useGeneralProductContext();
  const observerRef = useRef();
  const [loadingNewData, setLoadingNewData] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      if (categoryId && Number(product?.p_is_saleBy_pbl) !== 1) return false;

      const price = productPrice(product);
      const stock = productStock(product);
      const minPrice = toNumber(filters.minPrice);
      const maxPrice = toNumber(filters.maxPrice);

      if (filters.stock === "in_stock" && stock <= 0 && productVariants(product).length) return false;
      if (filters.stock === "out_of_stock" && stock > 0) return false;
      if (minPrice > 0 && price > 0 && price < minPrice) return false;
      if (maxPrice > 0 && price > 0 && price > maxPrice) return false;

      return true;
    });
  }, [categoryId, filters.maxPrice, filters.minPrice, filters.stock, products]);

  const totalVisibleStock = useMemo(
    () => visibleProducts.reduce((total, product) => total + productStock(product), 0),
    [visibleProducts]
  );

  const lastProductRef = useCallback(
    (node) => {
      if (loading) return;
      if (observerRef.current) observerRef.current.disconnect();


      observerRef.current = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setLoadingNewData(true);
          await getAllProduct(false, categoryId, filters);
          setLoadingNewData(false);
        }
      }, {
        root: null, // Use the viewport
        rootMargin: "0px",
        threshold: 0.1 // Trigger a bit before it's fully in view
      });

      if (node) observerRef.current.observe(node);
    },
    [categoryId, filters, getAllProduct, hasMore, loading]
  );

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const submitFilters = (event) => {
    event?.preventDefault();
    applyFilters(filters);
    setMobileFiltersOpen(false);
  };

  const FilterPanel = (
    <form onSubmit={submitFilters} className="space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </div>
        {categoryId && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            PBL sale
          </span>
        )}
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Search</span>
        <div className="flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Product name"
            className="h-full w-full text-sm outline-none"
          />
        </div>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Min Price</span>
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={(event) => updateFilter("minPrice", event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Max Price</span>
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={(event) => updateFilter("maxPrice", event.target.value)}
            className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-slate-900"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Stock</span>
        <select
          value={filters.stock}
          onChange={(event) => updateFilter("stock", event.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
        >
          <option value="all">All stock</option>
          <option value="in_stock">In stock</option>
          <option value="out_of_stock">Out of stock</option>
        </select>
      </label>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold uppercase text-slate-500">Sort</span>
        <select
          value={filters.sort}
          onChange={(event) => updateFilter("sort", event.target.value)}
          className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
        >
          <option value="latest">Latest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </label>

      <div className="grid grid-cols-[1fr_44px] gap-2">
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Search className="h-4 w-4" />
          Apply
        </button>
        <button
          type="button"
          onClick={() => {
            resetFilters();
            setMobileFiltersOpen(false);
          }}
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </form>
  );

  return (
    <section className="mx-auto w-full max-w-screen-2xl px-3 py-5 sm:px-5 lg:px-6">
      <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950">General Products</h1>
          <p className="mt-1 text-sm text-slate-500">
            {visibleProducts.length} products · {totalVisibleStock} stock units
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((current) => !current)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
      </div>

      {mobileFiltersOpen && (
        <div className="mb-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm lg:hidden">
          {FilterPanel}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm">
            {FilterPanel}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="grid grid-cols-1 gap-4 pb-14 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {visibleProducts.map((product, index) => {
              const isLast = index === visibleProducts.length - 1;
              return (
                <div ref={isLast ? lastProductRef : undefined} key={product?.p_id || product?.p_slug || index}>
                  <GeneralProductCard product={product} />
                </div>
              );
            })}
          </div>

          {!visibleProducts.length && !loading && (
            <div className="rounded-md border border-dashed border-slate-300 bg-white px-4 py-12 text-center text-sm text-slate-500">
              No products found.
            </div>
          )}

          <div className="flex min-h-[50px] w-full justify-center pb-10">
            {loadingNewData ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent"></div>
                Loading more products...
              </div>
            ) : !hasMore && visibleProducts.length ? (
              <p className="text-sm text-slate-400">No more products to load.</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeneralProduct;
