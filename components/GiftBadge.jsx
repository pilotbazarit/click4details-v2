"use client";

import React, { useState } from "react";
import { Gift, X, Sparkles, CalendarClock } from "lucide-react";

// Renders a small animated gift icon (drop into any relative-positioned
// image container) when a vehicle/product has a user_gift and/or pbl_gift
// attached. Clicking it opens a popup with the gift's image, description,
// and expiry - used on both listing cards (ProductCard/GeneralProductCard)
// and detail pages (ProductDetails/GeneralProductDetails), fed directly by
// VehicleResource/ProductResource's `user_gift`/`pbl_gift` fields.
const GiftBadge = ({ userGift = null, pblGift = null, className = "", variant = "overlay" }) => {
  const [open, setOpen] = useState(false);

  const gifts = [
    userGift ? { ...userGift, _label: "Seller Gift" } : null,
    pblGift ? { ...pblGift, _label: "PilotBazar Gift" } : null,
  ].filter(Boolean);

  if (gifts.length === 0) return null;

  // "overlay" = absolute-positioned corner badge for card/gallery images
  // (caller passes e.g. className="top-3 left-3"); "inline" = static, for
  // placing next to a title on a detail page where there's no guaranteed
  // relative-positioned image wrapper to anchor an absolute badge to.
  const positionClass = variant === "inline" ? "relative" : "absolute z-20";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        title="This item comes with a free gift!"
        className={`${positionClass} flex items-center gap-1 rounded-full bg-gradient-to-r from-fuchsia-600 to-purple-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-lg animate-bounce hover:animate-none transition-all ${className}`}
      >
        <Gift className="h-3.5 w-3.5" />
        <span className={variant === "inline" ? "" : "hidden sm:inline"}>
          {variant === "inline" ? "Gift Included" : "Gift"}
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Sparkles className="h-5 w-5" />
                <h3 className="text-lg font-semibold">Free Gift{gifts.length > 1 ? "s" : ""} Included!</h3>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpen(false);
                }}
                className="text-white/90 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto divide-y divide-gray-100">
              {gifts.map((gift, index) => (
                <div key={gift.g_id || index} className="p-5 flex gap-4">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-purple-50 flex items-center justify-center">
                    {gift?.g_image?.secure_url || gift?.g_image?.url ? (
                      <img
                        src={gift.g_image.secure_url || gift.g_image.url}
                        alt={gift?.g_title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Gift className="h-8 w-8 text-purple-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-semibold text-purple-700 mb-1">
                      {gift._label}
                    </span>
                    <p className="font-semibold text-gray-900">{gift?.g_title}</p>
                    {gift?.g_description && (
                      <p className="mt-1 text-sm text-gray-600 line-clamp-3">{gift.g_description}</p>
                    )}
                    {gift?.g_expiredate && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Valid till {String(gift.g_expiredate).slice(0, 10)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GiftBadge;
