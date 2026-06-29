'use client';

import { useAppContext } from "@/context/AppContext";
import { ArrowRight, CheckCircle2, ReceiptText, Truck } from "lucide-react";
import React from "react";

const money = (amount, currency = "TK.") => {
  const numericAmount = Number(amount) || 0;
  const currencyLabel = !currency || currency === "BDT" ? "TK." : currency;

  return `${currencyLabel} ${numericAmount.toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const OrderSummary = () => {
  const { currency, router, getCartCount, getCartAmount } = useAppContext();
  const itemCount = getCartCount();
  const subtotal = Number(getCartAmount()) || 0;
  const taxAmount = 0;
  const total = subtotal + taxAmount;

  return (
    <aside className="self-start rounded-lg border border-gray-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-gray-950 text-white">
          <ReceiptText className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Order Summary</h2>
          <p className="text-sm text-gray-500">{itemCount} item{itemCount === 1 ? "" : "s"}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4 border-y border-gray-100 py-5">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-gray-500">Subtotal</span>
          <span className="font-semibold text-gray-950">{money(subtotal, currency)}</span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-gray-500">Shipping</span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
            <Truck className="h-4 w-4" />
            Free
          </span>
        </div>
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-gray-500">Tax</span>
          <span className="font-semibold text-gray-950">{money(taxAmount, currency)}</span>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <span className="text-base font-semibold text-gray-700">Total</span>
        <span className="text-2xl font-semibold text-gray-950">{money(total, currency)}</span>
      </div>

      <button
        type="button"
        disabled={itemCount === 0}
        onClick={() => router.push("/checkout")}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Checkout
        <ArrowRight className="h-4 w-4" />
      </button>

      <div className="mt-4 flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-3 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none" />
        <span>Checkout details are protected.</span>
      </div>
    </aside>
  );
};

export default OrderSummary;
