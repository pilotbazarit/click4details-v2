'use client';

import React from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import OrderSummary from "@/components/OrderSummary";
import { useAppContext } from "@/context/AppContext";
import { getSessionId } from "@/lib/utils";
import {
  ArrowLeft,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";

const parseMaybeJson = (value, fallback = null) => {
  if (!value) return fallback;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const money = (amount, currency = "TK.") => {
  const numericAmount = Number(amount) || 0;
  const currencyLabel = !currency || currency === "BDT" ? "TK." : currency;

  return `${currencyLabel} ${numericAmount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getVariantText = (item) => {
  const snapshot = parseMaybeJson(item?.ci_variant_snapshot, {});
  return item?.ci_variant_title || snapshot?.title || snapshot?.option_summary || "";
};

const getVariantSku = (item) => {
  const snapshot = parseMaybeJson(item?.ci_variant_snapshot, {});
  return item?.ci_variant_sku || snapshot?.sku || "";
};

const Cart = () => {
  const {
    router,
    cartItems,
    updateCartQuantity,
    removeCartItem,
    getCartCount,
    user,
    currency,
  } = useAppContext();

  const parsedUser = parseMaybeJson(user, user);
  const activeCartItems = cartItems.filter((item) => item && Number(item.ci_qty) > 0);

  const handleRemoveFromCart = (item) => {
    const cartItem = {
      c_user_id: parsedUser?.id || null,
      c_session_id: parsedUser?.id ? null : getSessionId(),
      ci_product_id: item.ci_product_id,
      ci_type_id: item.ci_type_id,
    };

    if (item.ci_product_variant_id) {
      cartItem.ci_product_variant_id = item.ci_product_variant_id;
    }

    removeCartItem(cartItem);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#f6f7f9]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push("/all-products")}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-950 capitalize"
              >
                <ArrowLeft className="h-4 w-4" />
                Continue shopping
              </button>
              <h1 className="text-3xl font-semibold text-gray-950 md:text-4xl capitalize">
                Shopping Cart
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {getCartCount()} item{getCartCount() === 1 ? "" : "s"} selected for checkout
              </p>
            </div>

            {activeCartItems.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 capitalize">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Secure checkout
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 capitalize">
                  <PackageCheck className="h-4 w-4 text-blue-600" />
                  Ready for checkout
                </span>
              </div>
            )}
          </div>

          {activeCartItems.length === 0 ? (
            <section className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <ShoppingBag className="h-7 w-7 text-gray-500" />
              </div>
              <h2 className="mt-5 text-xl font-semibold text-gray-950 capitalize">Your cart is empty</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-gray-500 capitalize">
                Your selected products will appear here.
              </p>
              <button
                type="button"
                onClick={() => router.push("/all-products")}
                className="mt-6 inline-flex items-center justify-center rounded-md bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 capitalize"
              >
                Browse products
              </button>
            </section>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <section className="space-y-4">
                {activeCartItems.map((item, index) => {
                  const imageSrc = typeof item?.ci_url === "string" ? item.ci_url.trim() : "";
                  const quantity = Number(item?.ci_qty) || 0;
                  const unitPrice = Number(item?.ci_price) || 0;
                  const variantText = getVariantText(item);
                  const variantSku = getVariantSku(item);
                  const rowKey = item.ci_id || `${item.ci_product_id}-${item.ci_product_variant_id || "base"}-${index}`;
                  const displayCurrency = item?.ci_currency || currency || "TK.";

                  return (
                    <article
                      key={rowKey}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 sm:p-5"
                    >
                      <div className="grid gap-4 sm:grid-cols-[112px_minmax(0,1fr)]">
                        <div className="h-28 w-28 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                          {imageSrc ? (
                            <Image
                              src={imageSrc}
                              alt={item?.ci_name || "Product image"}
                              width={224}
                              height={224}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs font-medium text-gray-400 capitalize">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <p className="text-base font-semibold text-gray-950">{item?.ci_name}</p>
                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {variantText && (
                                  <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                                    {variantText}
                                  </span>
                                )}
                                {variantSku && (
                                  <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                    SKU {variantSku}
                                  </span>
                                )}
                                <span className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 capitalize">
                                  General product
                                </span>
                              </div>
                            </div>

                            <div className="text-left lg:text-right">
                              <p className="text-xs uppercase tracking-wide text-gray-400">Unit price</p>
                              <p className="mt-1 text-lg font-semibold text-gray-950">
                                {money(unitPrice, displayCurrency)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="inline-flex w-max items-center rounded-md border border-gray-200 bg-gray-50 p-1">
                              <button
                                type="button"
                                title="Decrease quantity"
                                disabled={quantity <= 1}
                                onClick={() => updateCartQuantity(item, -1)}
                                className="flex h-9 w-9 items-center justify-center rounded text-gray-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="flex h-9 min-w-11 items-center justify-center px-3 text-sm font-semibold text-gray-950">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                title="Increase quantity"
                                onClick={() => updateCartQuantity(item, 1)}
                                className="flex h-9 w-9 items-center justify-center rounded text-gray-700 transition hover:bg-white"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                              <div className="text-left sm:text-right">
                                <p className="text-xs uppercase tracking-wide text-gray-400">Subtotal</p>
                                <p className="mt-1 text-xl font-semibold text-gray-950">
                                  {money(unitPrice * quantity, displayCurrency)}
                                </p>
                              </div>
                              <button
                                type="button"
                                title="Remove item"
                                onClick={() => handleRemoveFromCart(item)}
                                className="flex h-10 w-10 items-center justify-center rounded-md border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>

              <OrderSummary />
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default Cart;
