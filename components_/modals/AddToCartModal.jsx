"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Boxes, CheckCircle2, X } from "lucide-react";

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
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

const productImage = (product) => {
  const canUsePblImage = Number(product?.p_is_saleBy_pbl) === 1 && product?.p_pbl_image;
  return mediaUrl(canUsePblImage ? product.p_pbl_image : product?.p_primary_image || product?.p_default_image) || imageList(product?.p_images)[0];
};

const normalizeOptions = (product) => {
  const variants = Array.isArray(product?.variants) ? product.variants : [];
  if (variants.length) {
    return variants.map((variant, index) => {
      const regular = toNumber(variant?.pv_regular_price);
      const discount = toNumber(variant?.pv_discount_price);
      const price = discount > 0 && discount < regular ? discount : regular;

      return {
        id: `variant-${variant?.pv_id || index}`,
        type: "variant",
        variantId: variant?.pv_id || null,
        legacyPriceId: null,
        title: variant?.pv_title || variant?.pv_option_summary || `Variant ${index + 1}`,
        sku: variant?.pv_sku || "",
        price,
        stock: toNumber(variant?.pv_available_qty ?? variant?.pv_stock_qty),
        status: variant?.pv_status || "active",
        image: mediaUrl(variant?.pv_primary_image) || imageList(variant?.pv_images)[0] || productImage(product),
      };
    });
  }

  const prices = Array.isArray(product?.prices) ? product.prices : [];
  if (prices.length) {
    return prices.map((price, index) => ({
      id: `legacy-${price?.pp_id || index}`,
      type: "legacy",
      variantId: null,
      legacyPriceId: price?.pp_id || null,
      title: price?.unit?.md_title || `Option ${index + 1}`,
      sku: product?.p_code || "",
      price: toNumber(price?.pp_discount_price) || toNumber(price?.pp_regular_price),
      stock: 0,
      status: product?.p_status || "active",
      image: productImage(product),
    }));
  }

  return [
    {
      id: "default",
      type: "default",
      title: "Default",
      price: 0,
      stock: 0,
      status: product?.p_status || "active",
      image: productImage(product),
    },
  ];
};

const AddToCartModal = ({ open, setOpen, product, onAddToCart }) => {
  const options = useMemo(() => normalizeOptions(product), [product]);
  const [selectedOption, setSelectedOption] = useState(null);
  const image = selectedOption?.image || productImage(product);

  useEffect(() => {
    if (open) {
      setSelectedOption(options.find((option) => option.status === "active") || options[0] || null);
    }
  }, [open, options]);

  const handleAddToCart = () => {
    if (!selectedOption) return;
    onAddToCart(product, selectedOption);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-950/50"
        onClick={() => setOpen(false)}
      />

      <div className="relative max-h-[90vh] w-full max-w-lg overflow-hidden rounded-md bg-white shadow-xl">
        <div className="flex items-start gap-3 border-b border-slate-200 p-4">
          <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
            {image ? (
              <img src={image} alt={product?.p_name || "Product"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Boxes className="h-6 w-6 text-slate-400" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-base font-semibold text-slate-950">{product?.p_name}</h3>
            <p className="mt-1 text-lg font-bold text-[#0167a1]">TK. {formatPrice(selectedOption?.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[52vh] overflow-auto p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-900">Select Option</h4>
          <div className="grid gap-2">
            {options.map((option) => {
              const isSelected = selectedOption?.id === option.id;
              const isOutOfStock = option.type === "variant" && option.stock <= 0;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOption(option)}
                  disabled={option.status !== "active"}
                  className={`grid grid-cols-[1fr_auto] gap-3 rounded-md border p-3 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    isSelected
                      ? "border-slate-950 bg-slate-50 ring-2 ring-slate-950/10"
                      : "border-slate-200 bg-white hover:border-slate-400"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-slate-950">{option.title}</span>
                      {isSelected && <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {option.sku && <span>SKU {option.sku}</span>}
                      {option.type === "variant" && <span>{isOutOfStock ? "Out of stock" : `${option.stock} in stock`}</span>}
                    </div>
                  </div>
                  <div className="text-right text-sm font-bold text-slate-950">TK. {formatPrice(option.price)}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 p-4">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedOption || selectedOption.status !== "active"}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[#0167a1] px-4 text-sm font-semibold text-white hover:bg-[#015a8d] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
