"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  Check,
  Layers,
  ShieldCheck,
  ShoppingBag,
  Tag,
  X,
} from "lucide-react";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import GeneralProductService from "@/services/GeneralProductService";

const imageUrl = (image) => {
  if (!image) return "";
  if (typeof image === "string") {
    try {
      const parsed = JSON.parse(image);
      return parsed?.secure_url || parsed?.url || "";
    } catch {
      return image;
    }
  }
  return image?.secure_url || image?.url || "";
};

const arrayValue = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const formatTaka = (value) => {
  const amount = Number(value);
  if (!amount) return null;
  return `৳ ${amount.toLocaleString("en-BD")}`;
};

export default function GeneralProductApprovalView({ productId }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState("");
  const [decision, setDecision] = useState(null); // "approve" | "reject" while submitting

  useEffect(() => {
    if (!productId) return;
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      try {
        const response = await GeneralProductService.Queries.getGeneralProductDetailById(productId);
        if (!isMounted) return;

        if (response?.status !== "success" || !response?.data) {
          toast.error(response?.message || "Product could not be loaded.");
          return;
        }

        setProduct(response.data);
        setActiveImage(imageUrl(response.data?.p_primary_image) || imageUrl(response.data?.p_default_image));
      } catch (error) {
        if (isMounted) toast.error(error?.response?.data?.message || "Product could not be loaded.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [productId]);

  const gallery = useMemo(() => {
    if (!product) return [];
    const primary = imageUrl(product?.p_primary_image) || imageUrl(product?.p_default_image);
    const rest = arrayValue(product?.p_images).map(imageUrl).filter(Boolean);
    return [primary, ...rest].filter(Boolean).filter((url, index, arr) => arr.indexOf(url) === index);
  }, [product]);

  const price = useMemo(() => {
    const firstPrice = Array.isArray(product?.prices) ? product.prices[0] : null;
    const regular = formatTaka(firstPrice?.pp_regular_price);
    const discount = formatTaka(firstPrice?.pp_discount_price);
    return { regular, discount };
  }, [product]);

  const saleByPblState = Number(product?.p_is_saleBy_pbl) === 1 ? "approved" : "pending";
  const isActive = (product?.p_status || "active") === "active";

  const handleDecision = async (isApproved) => {
    setDecision(isApproved ? "approve" : "reject");
    try {
      const response = await GeneralProductService.Commands.approveGeneralProduct(productId, {
        _is_approved: isApproved ? 1 : 0,
      });

      if (response?.status === "success") {
        toast.success(
          isApproved ? "Product approved for sale by PBL." : "Product's sale by PBL request was rejected."
        );
        router.push("/dashboard/products/general-product/list");
      } else {
        toast.error(response?.message || "Action could not be completed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Action could not be completed.");
    } finally {
      setDecision(null);
    }
  };

  if (isLoading) return <Loading />;

  if (!product) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-gray-600">Product not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <button
        type="button"
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 transition hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {/* header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white px-6 py-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-orange-600">
              Sale by PBL — Approval Request
            </p>
            <h1 className="mt-1 text-xl font-bold text-gray-900">{product.p_name}</h1>
            <p className="mt-0.5 text-xs text-gray-500">Code: {product.p_code}</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                isActive ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-600"
              }`}
            >
              <BadgeCheck className="h-3.5 w-3.5" />
              {isActive ? "Active" : "Inactive"}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                saleByPblState === "approved"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              {saleByPblState === "approved" ? "PBL Approved" : "Pending Approval"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-2">
          {/* gallery */}
          <div>
            <div className="aspect-square w-full overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
              {activeImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeImage} alt={product.p_name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-400">
                  No image
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto">
                {gallery.map((url) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImage(url)}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                      activeImage === url ? "border-orange-500" : "border-transparent"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* details */}
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <InfoRow icon={Tag} label="Category" value={product?.category?.c_name} />
              <InfoRow icon={Layers} label="Brand" value={product?.brand?.md_title} />
              <InfoRow icon={Building2} label="Shop" value={product?.shop?.s_title} />
              <InfoRow icon={ShoppingBag} label="Requested by" value={product?.user?.name} />
            </div>

            {(price.regular || price.discount) && (
              <div className="flex items-baseline gap-3 rounded-lg bg-gray-50 px-4 py-3">
                {price.discount ? (
                  <>
                    <span className="text-2xl font-bold text-orange-600">{price.discount}</span>
                    <span className="text-sm text-gray-400 line-through">{price.regular}</span>
                  </>
                ) : (
                  <span className="text-2xl font-bold text-orange-600">{price.regular}</span>
                )}
              </div>
            )}

            {product?.p_description?.pbl && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  PBL Description
                </p>
                <p className="text-sm leading-relaxed text-gray-700">{product.p_description.pbl}</p>
              </div>
            )}

            {product?.p_description?.user && (
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Product Details
                </p>
                <p className="text-sm leading-relaxed text-gray-700">{product.p_description.user}</p>
              </div>
            )}
          </div>
        </div>

        {/* actions */}
        {saleByPblState === "pending" ? (
          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 bg-gray-50 px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              disabled={decision !== null}
              onClick={() => handleDecision(false)}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              <X className="mr-1.5 h-4 w-4" />
              {decision === "reject" ? "Rejecting..." : "Reject"}
            </Button>
            <Button
              disabled={decision !== null}
              onClick={() => handleDecision(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Check className="mr-1.5 h-4 w-4" />
              {decision === "approve" ? "Approving..." : "Approve Sale by PBL"}
            </Button>
          </div>
        ) : (
          <div className="border-t border-gray-100 bg-blue-50 px-6 py-3 text-center text-sm font-medium text-blue-700">
            This product has already been approved for sale by PBL.
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-gray-100 px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-gray-400" />
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
        <p className="truncate text-sm font-medium text-gray-800">{value}</p>
      </div>
    </div>
  );
}
