"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Boxes, Share2, ShoppingCart, ShieldCheck } from "lucide-react";

import { useAppContext } from "@/context/AppContext";
import { getSessionId } from "@/lib/utils";
import ProductShareModal from "./modals/ProductShareModal";
import AddToCartModal from "./modals/AddToCartModal";

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseUser = (value) => {
  const parsed = parseMaybeJson(value);
  return typeof parsed === "string" ? parseMaybeJson(parsed) : parsed;
};

const mediaUrl = (media) => {
  const parsed = parseMaybeJson(media);
  if (!parsed) return "";
  if (typeof parsed === "string") return parsed;
  return parsed.secure_url || parsed.url || "";
};

const imageList = (images) => {
  const parsed = parseMaybeJson(images);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(mediaUrl).filter(Boolean);
};

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const formatPrice = (price) => {
  const numericPrice = toNumber(price);
  if (!numericPrice) return "Call";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericPrice);
};

const productDisplayImage = (product) => {
  const canUsePblImage = Number(product?.p_is_saleBy_pbl) === 1 && product?.p_pbl_image;
  return mediaUrl(canUsePblImage ? product.p_pbl_image : product?.p_primary_image || product?.p_default_image);
};

export const normalizeGeneralProductOptions = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length) {
    return variants.map((variant, index) => {
      const regular = toNumber(variant?.pv_regular_price);
      const discount = toNumber(variant?.pv_discount_price);
      const price = discount > 0 && discount < regular ? discount : regular;
      const image = mediaUrl(variant?.pv_primary_image) || imageList(variant?.pv_images)[0] || productDisplayImage(product);

      return {
        id: `variant-${variant?.pv_id || index}`,
        type: "variant",
        variantId: variant?.pv_id || null,
        legacyPriceId: null,
        title: variant?.pv_title || variant?.pv_option_summary || `Variant ${index + 1}`,
        sku: variant?.pv_sku || "",
        price,
        regularPrice: regular,
        discountPrice: discount,
        stock: toNumber(variant?.pv_available_qty ?? variant?.pv_stock_qty),
        status: variant?.pv_status || "active",
        image,
        optionSummary: variant?.pv_option_summary || variant?.pv_title || "",
      };
    });
  }

  const prices = Array.isArray(product?.prices) ? product.prices : [];
  return prices.map((price, index) => ({
    id: `legacy-${price?.pp_id || index}`,
    type: "legacy",
    variantId: null,
    legacyPriceId: price?.pp_id || null,
    title: price?.unit?.md_title || `Option ${index + 1}`,
    sku: product?.p_code || "",
    price: toNumber(price?.pp_discount_price) || toNumber(price?.pp_regular_price),
    regularPrice: toNumber(price?.pp_regular_price),
    discountPrice: toNumber(price?.pp_discount_price),
    stock: 0,
    status: product?.p_status || "active",
    image: productDisplayImage(product),
    optionSummary: price?.unit?.md_title || "",
  }));
};

const GeneralProductCard = ({ product }) => {
  const [shareOpen, setShareOpen] = useState(false);
  const [addToCartModalOpen, setAddToCartModalOpen] = useState(false);
  const [hoverIdx, setHoverIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  const { addToCart, user } = useAppContext();

  const parsedUser = useMemo(() => parseUser(user), [user]);
  const options = useMemo(() => normalizeGeneralProductOptions(product), [product]);
  const activeOptions = options.filter((option) => option.status === "active");
  const prices = activeOptions.map((option) => option.price).filter((price) => price > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const minRegularPrice = activeOptions
    .map((o) => o.regularPrice)
    .filter((p) => p > 0)
    .reduce((min, p) => (p < min ? p : min), Infinity);

  const hasDiscount = minPrice > 0 && Number.isFinite(minRegularPrice) && minPrice < minRegularPrice;

  const allImages = useMemo(() => {
    const seen = new Set();
    const imgs = [];
    const push = (src) => {
      if (src && !seen.has(src)) { seen.add(src); imgs.push(src); }
    };
    push(productDisplayImage(product));
    imageList(product?.p_images).forEach(push);
    activeOptions.forEach((o) => push(o.image));
    return imgs;
  }, [product, activeOptions]);

  const href = `/general-product/${product?.p_slug}`;

  const displayImage = allImages[hoverIdx] || allImages[0] || "";

  const attributeValues = useMemo(() => {
    const values = new Set();
    (Array.isArray(product?.variants) ? product.variants : []).forEach((v) => {
      const summary = v?.pv_option_summary || v?.pv_title || "";
      summary.split("/").forEach((part) => {
        const colonIdx = part.indexOf(":");
        const val = (colonIdx >= 0 ? part.slice(colonIdx + 1) : part).trim();
        if (val) values.add(val);
      });
    });
    return Array.from(values).slice(0, 8);
  }, [product?.variants]);

  useEffect(() => {
    if (isHovered && allImages.length > 1) {
      intervalRef.current = setInterval(() => {
        setHoverIdx((i) => (i + 1) % allImages.length);
      }, 900);
    } else {
      clearInterval(intervalRef.current);
      if (!isHovered) setHoverIdx(0);
    }
    return () => clearInterval(intervalRef.current);
  }, [isHovered, allImages.length]);

  const handleAddToCart = (item, selectedOption = null) => {
    const option = selectedOption || activeOptions[0] || options[0];
    const price = option?.price || 0;

    const cartItem = {
      c_user_id: parsedUser?.id || null,
      c_session_id: parsedUser?.id ? null : getSessionId(),
      ci_product_id: item.p_id,
      ci_type_id: item.p_type_id,
      ci_qty: 1,
      ci_price: price,
      ci_url: option?.image || displayImage || "",
      ci_name: `${item.p_name}${option?.title ? ` - ${option.title}` : ""}`,
      ci_subtotal: price,
      ci_product_price_id: option?.legacyPriceId || null,
      ci_product_variant_id: option?.variantId || null,
    };

    addToCart(item.p_id, cartItem);
  };

  return (
    <article
      className="group flex h-[460px] flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image — 2/3 of card height */}
      <div className="relative shrink-0 overflow-hidden bg-slate-50" style={{ height: "67%" }}>
        <Link href={href} className="block h-full w-full">
          {displayImage ? (
            <img
              src={displayImage}
              alt={product?.p_name || "Product"}
              className="h-full w-full object-contain transition-opacity duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <Boxes className="h-12 w-12" />
            </div>
          )}
        </Link>

        {/* PBL badge */}
        {Number(product?.p_is_saleBy_pbl) === 1 && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white shadow">
            <ShieldCheck className="h-3 w-3" />
            PBL
          </span>
        )}

        {/* Image dots */}
        {allImages.length > 1 && (
          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
            {allImages.slice(0, 6).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === hoverIdx % allImages.length ? "w-4 bg-slate-700" : "w-1.5 bg-slate-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content — 1/3 of card height */}
      <div className="flex min-h-0 flex-1 flex-col justify-between px-3 py-2.5">
        <div className="min-h-0 overflow-hidden">
          <Link href={href}>
            <h2 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 group-hover:text-[#0167a1]">
              {product?.p_name || "Untitled product"}
            </h2>
          </Link>

          {attributeValues.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1 overflow-hidden" style={{ maxHeight: "2.6rem" }}>
              {attributeValues.map((val) => (
                <span
                  key={val}
                  className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600"
                >
                  {val}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-end justify-between gap-2">
          <div>
            <div className="text-base font-bold text-slate-950">
              {minPrice
                ? `TK. ${formatPrice(minPrice)}${maxPrice && maxPrice !== minPrice ? ` – ${formatPrice(maxPrice)}` : ""}`
                : "Call for price"}
            </div>
            {hasDiscount && Number.isFinite(minRegularPrice) && (
              <div className="text-xs text-slate-400 line-through">
                TK. {formatPrice(minRegularPrice)}
              </div>
            )}
          </div>

          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => setAddToCartModalOpen(true)}
              className="inline-flex h-8 items-center gap-1.5 rounded-md bg-[#0167a1] px-3 text-xs font-semibold text-white hover:bg-[#015a8d]"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </button>
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <ProductShareModal open={shareOpen} setOpen={setShareOpen} product={product} />
      <AddToCartModal
        open={addToCartModalOpen}
        setOpen={setAddToCartModalOpen}
        product={product}
        onAddToCart={handleAddToCart}
      />
    </article>
  );
};

export default GeneralProductCard;
