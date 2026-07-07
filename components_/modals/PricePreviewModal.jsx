import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import VehiclePricingSection from "@/components/pricing/VehiclePricingSection";
import VehicleService from "@/services/VehicleService";

const EMPTY_COST_ITEM = { name: "", amount: "" };

const normalizePlainText = (value, fallback = "") => {
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value).trim();
};

const normalizeNumericText = (value, fallback = "") => {
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value).replace(/,/g, "").trim();
};

const normalizeConversionRate = (value) => {
  const valueStr = normalizeNumericText(value);
  const numericValue = Number(valueStr);
  if (!valueStr || Number.isNaN(numericValue) || numericValue < 1) {
    return "1";
  }
  return valueStr;
};

const normalizeShowPrice = (value) => {
  const nextValue = normalizePlainText(value, "fixed").toLowerCase();
  return ["fixed", "asking", "variable"].includes(nextValue) ? nextValue : "fixed";
};

const normalizePriceStatus = (value) => {
  const nextValue = normalizePlainText(value, "negotiable").toLowerCase();
  return ["negotiable", "fixed", "variable"].includes(nextValue) ? nextValue : "negotiable";
};

const normalizeCurrency = (value) => {
  const nextValue = normalizePlainText(value, "BDT").toUpperCase();
  if (nextValue === "YEN") {
    return "YEN";
  }
  return ["BDT", "USD", "YEN"].includes(nextValue) ? nextValue : "BDT";
};

const normalizeCostEntries = (entries, fallbackName) => {
  if (Array.isArray(entries) && entries.length > 0) {
    return entries.map((item) => ({
      name: normalizePlainText(item?.name),
      amount: normalizeNumericText(item?.amount),
    }));
  }

  const scalarAmount = normalizeNumericText(entries);
  if (!scalarAmount) {
    return [{ ...EMPTY_COST_ITEM }];
  }

  return [
    {
      name: fallbackName,
      amount: scalarAmount,
    },
  ];
};

const resolveProductSource = (productSource) => (
  productSource?.data?.data ||
  productSource?.data ||
  productSource ||
  {}
);

const buildPriceFormValues = (productSource) => {
  const resolvedProduct = resolveProductSource(productSource);
  const priceData = resolvedProduct?.vehicle_db_price || {};

  return {
    v_id: resolvedProduct?.v_id ?? "",
    vp_user_to_pbl_price: normalizeNumericText(priceData?.vp_user_to_pbl_price ?? resolvedProduct?.vp_user_to_pbl_price),
    vp_user_purchase_price: normalizeNumericText(priceData?.vp_user_purchase_price ?? resolvedProduct?.vp_user_purchase_price),
    vp_user_fixed_price: normalizeNumericText(priceData?.vp_user_fixed_price ?? resolvedProduct?.vp_user_fixed_price),
    vp_user_asking_price: normalizeNumericText(priceData?.vp_user_asking_price ?? resolvedProduct?.vp_user_asking_price),
    vp_user_variable_price: normalizeNumericText(priceData?.vp_user_variable_price ?? resolvedProduct?.vp_user_variable_price),
    vp_user_costing_price: normalizeNumericText(priceData?.vp_user_costing_price ?? resolvedProduct?.vp_user_costing_price),
    vp_show_price: normalizeShowPrice(priceData?.vp_show_price ?? resolvedProduct?.vp_show_price),
    vp_user_price_status: normalizePriceStatus(priceData?.vp_user_price_status ?? resolvedProduct?.vp_user_price_status),
    vp_currency: normalizeCurrency(priceData?.vp_currency ?? resolvedProduct?.vp_currency),
    vp_conv_rate: normalizeConversionRate(priceData?.vp_conv_rate ?? resolvedProduct?.vp_conv_rate),
    vp_bd_tax: normalizeNumericText(priceData?.vp_bd_tax ?? resolvedProduct?.vp_bd_tax),
    vp_other_cost: normalizeCostEntries(priceData?.vp_other_cost ?? resolvedProduct?.vp_other_cost, "Other Charge"),
    vp_purchase_cost: normalizeCostEntries(
      priceData?.vp_purchase_cost ??
        resolvedProduct?.vp_purchase_cost ??
        priceData?.vp_purchase_price ??
        resolvedProduct?.vp_purchase_price,
      "Purchase Price"
    ),
    v_urgent_sale: Boolean(Number(resolvedProduct?.v_urgent_sale)),
  };
};

const buildFallbackUpdatedProduct = (selectedProduct, values) => {
  const normalizedValues = {
    ...values,
    vp_show_price: normalizeShowPrice(values?.vp_show_price),
    vp_user_price_status: normalizePriceStatus(values?.vp_user_price_status),
    vp_currency: normalizeCurrency(values?.vp_currency),
    vp_conv_rate: normalizeConversionRate(values?.vp_conv_rate),
    vp_bd_tax: normalizeNumericText(values?.vp_bd_tax),
    vp_user_to_pbl_price: normalizeNumericText(values?.vp_user_to_pbl_price),
    vp_user_purchase_price: normalizeNumericText(values?.vp_user_purchase_price),
    vp_user_fixed_price: normalizeNumericText(values?.vp_user_fixed_price),
    vp_user_asking_price: normalizeNumericText(values?.vp_user_asking_price),
    vp_user_variable_price: normalizeNumericText(values?.vp_user_variable_price),
    vp_user_costing_price: normalizeNumericText(values?.vp_user_costing_price),
    vp_other_cost: normalizeCostEntries(values?.vp_other_cost, "Other Charge"),
    vp_purchase_cost: normalizeCostEntries(values?.vp_purchase_cost, "Purchase Price"),
  };

  const selectedUserPrice =
    normalizedValues.vp_show_price === "asking"
      ? normalizedValues.vp_user_asking_price
      : normalizedValues.vp_show_price === "variable"
        ? normalizedValues.vp_user_variable_price
        : normalizedValues.vp_user_fixed_price;

  return {
    ...selectedProduct,
    v_urgent_sale: normalizedValues.v_urgent_sale ? 1 : 0,
    vehicle_price: {
      ...(selectedProduct?.vehicle_price || {}),
      user_price: selectedUserPrice || "",
      v_purchase_price: normalizedValues.vp_user_purchase_price || "",
      v_costing_price: normalizedValues.vp_user_costing_price || "",
    },
    vehicle_db_price: {
      ...(selectedProduct?.vehicle_db_price || {}),
      vp_user_to_pbl_price: normalizedValues.vp_user_to_pbl_price,
      vp_user_purchase_price: normalizedValues.vp_user_purchase_price,
      vp_user_fixed_price: normalizedValues.vp_user_fixed_price,
      vp_user_asking_price: normalizedValues.vp_user_asking_price,
      vp_user_variable_price: normalizedValues.vp_user_variable_price,
      vp_user_costing_price: normalizedValues.vp_user_costing_price,
      vp_show_price: normalizedValues.vp_show_price,
      vp_user_price_status: normalizedValues.vp_user_price_status,
      vp_currency: normalizedValues.vp_currency,
      vp_conv_rate: normalizedValues.vp_conv_rate,
      vp_bd_tax: normalizedValues.vp_bd_tax,
      vp_other_cost: normalizedValues.vp_other_cost,
      vp_purchase_cost: normalizedValues.vp_purchase_cost,
    },
  };
};

const PricePreviewModal = ({ open, setOpen, selectedProduct, updateProductPricePermission, onPriceUpdated }) => {
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    watch,
    setValue,
    control,
    handleSubmit,
    reset,
  } = useForm({
    defaultValues: buildPriceFormValues(),
  });

  const selectedCurrency = watch("vp_currency");

  const applyPriceFields = useCallback((productSource) => {
    reset(buildPriceFormValues(productSource));
  }, [reset]);

  useEffect(() => {
    if (!open || !selectedProduct) {
      return;
    }

    applyPriceFields(selectedProduct);

    let isMounted = true;

    const fetchLatestProductDetails = async () => {
      const productId = selectedProduct?.v_id;
      if (!productId) {
        return;
      }

      try {
        const response = await VehicleService.Queries.getVehicleDetailById(productId);
        if (isMounted && response?.status === "success" && response?.data) {
          applyPriceFields(response.data);
        }
      } catch (error) {
        // Keep modal usable with row data if detail fetch fails.
      }
    };

    fetchLatestProductDetails();

    return () => {
      isMounted = false;
    };
  }, [open, selectedProduct, applyPriceFields]);

  const handleUpdatePrice = async (values) => {
    if (!selectedProduct?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    if (values?.v_urgent_sale && !normalizeNumericText(values?.vp_user_fixed_price)) {
      toast.error("Please enter a fixed price before marking as urgent sell.");
      return;
    }

    const formData = new FormData();

    formData.append("vp_user_to_pbl_price", normalizeNumericText(values?.vp_user_to_pbl_price));
    formData.append("vp_user_purchase_price", normalizeNumericText(values?.vp_user_purchase_price));
    formData.append("vp_user_fixed_price", normalizeNumericText(values?.vp_user_fixed_price));
    formData.append("vp_user_asking_price", normalizeNumericText(values?.vp_user_asking_price));
    formData.append("vp_user_variable_price", normalizeNumericText(values?.vp_user_variable_price));
    formData.append("vp_user_costing_price", normalizeNumericText(values?.vp_user_costing_price));
    formData.append("vp_conv_rate", normalizeConversionRate(values?.vp_conv_rate));
    formData.append("vp_bd_tax", normalizeNumericText(values?.vp_bd_tax));
    formData.append("vp_user_price_status", normalizePriceStatus(values?.vp_user_price_status));
    formData.append("vp_currency", normalizeCurrency(values?.vp_currency));
    formData.append("vp_show_price", normalizeShowPrice(values?.vp_show_price));
    formData.append("v_urgent_sale", values?.v_urgent_sale ? "1" : "0");
    formData.append("_method", "PUT");

    const otherCosts = normalizeCostEntries(values?.vp_other_cost, "Other Charge");
    otherCosts.forEach((item, index) => {
      formData.append(`vp_other_cost[${index}][name]`, normalizePlainText(item?.name));
      formData.append(`vp_other_cost[${index}][amount]`, normalizeNumericText(item?.amount));
    });

    const purchaseCosts = normalizeCostEntries(values?.vp_purchase_cost, "Purchase Price");
    purchaseCosts.forEach((item, index) => {
      formData.append(`vp_purchase_cost[${index}][name]`, normalizePlainText(item?.name));
      formData.append(`vp_purchase_cost[${index}][amount]`, normalizeNumericText(item?.amount));
    });

    setIsSaving(true);

    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(selectedProduct.v_id, formData);

      if (response?.status === "success" || response?.v_id) {
        let latestProduct = null;

        try {
          const latestResponse = await VehicleService.Queries.getVehicleDetailById(selectedProduct.v_id);
          if (latestResponse?.status === "success" && latestResponse?.data) {
            latestProduct = latestResponse.data;
          }
        } catch (error) {
          // Keep modal flow uninterrupted if latest detail fetch fails.
        }

        if (typeof onPriceUpdated === "function") {
          onPriceUpdated(latestProduct || buildFallbackUpdatedProduct(selectedProduct, values));
        }

        toast.success("Price updated successfully!");
        setOpen(false);
        return;
      }

      toast.error(response?.data?.message || response?.message || "Update failed.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full max-w-[96vw] p-0 sm:max-w-[96vw] xl:max-w-[1400px] [&>button]:hidden">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2 text-gray-800">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full p-1 hover:bg-gray-100"
              aria-label="Close"
            >
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <DialogTitle className="text-lg font-semibold">Edit Price</DialogTitle>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close modal"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(handleUpdatePrice)} className="flex max-h-[88vh] flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="vp_currency">
                  Currency
                </label>
                <select
                  id="vp_currency"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none"
                  {...register("vp_currency")}
                >
                  <option value="BDT">BDT</option>
                  <option value="USD">USD</option>
                  <option value="YEN">YEN</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700" htmlFor="vp_user_price_status">
                  User Price Negotiation
                </label>
                <select
                  id="vp_user_price_status"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none"
                  {...register("vp_user_price_status")}
                >
                  <option value="negotiable">Negotiable</option>
                  <option value="fixed">Fixed</option>
                  <option value="variable">Variable</option>
                </select>
              </div>
            </div>

            <div className="mt-2 text-xs text-gray-500">
              Selected currency: {selectedCurrency || "BDT"}
            </div>

            <VehiclePricingSection
              register={register}
              watch={watch}
              setValue={setValue}
              control={control}
              showCurrencyField={false}
              purchasePriceField="vp_user_purchase_price"
              partnerPriceLabel="Partner Price"
              hotlineText="Call PBL Hotline to be Partner"
              selectedProduct={selectedProduct}
            />
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-5 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>

            {updateProductPricePermission && (
              <Button
                type="submit"
                className="rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                disabled={isSaving}
              >
                {isSaving ? "Updating..." : "Update Price"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PricePreviewModal;

