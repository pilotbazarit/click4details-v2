import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import VehicleService from "@/services/VehicleService";

const PricePreviewModal = ({ open, setOpen, selectedProduct, updateProductPricePermission }) => {
  const [purchasePrice, setPurchasePrice] = useState("");
  const [fixedPrice, setFixedPrice] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [variablePrice, setVariablePrice] = useState("");
  const [costingPrice, setCostingPrice] = useState("");
  const [urgentSale, setUrgentSale] = useState(false);
  const [negotiation, setNegotiation] = useState("negotiable");
  const [priceSelection, setPriceSelection] = useState("fixed");
  const [isSaving, setIsSaving] = useState(false);


  // console.log("selectedProduct", selectedProduct);

  useEffect(() => {
    if (!selectedProduct) {
      return;
    }

    const priceData = selectedProduct?.vehicle_db_price || {};

    setPurchasePrice(priceData?.vp_user_purchase_price ?? "");
    setFixedPrice(priceData?.vp_user_fixed_price ?? "");
    setAskingPrice(priceData?.vp_user_asking_price ?? "");
    setVariablePrice(priceData?.vp_user_variable_price ?? "");
    setCostingPrice(priceData?.vp_user_costing_price ?? "");
    setUrgentSale(Boolean(Number(selectedProduct?.v_urgent_sale)));
    setPriceSelection(priceData?.vp_show_price ?? "fixed");
    setNegotiation(
      (priceData?.vp_user_price_status ?? "negotiable")
        .toString()
        .toLowerCase()
    );
  }, [selectedProduct]);

  const handleUrgentSaleChange = (e) => {
    const isChecked = e.target.checked;
    if (isChecked && !fixedPrice) {
      toast.error("Please enter a fixed price before marking as urgent sell.");
      return;
    }
    setUrgentSale(isChecked);
    if (isChecked) {
      setPriceSelection('fixed');
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedProduct?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        vp_user_purchase_price: purchasePrice || "",
        vp_user_fixed_price: fixedPrice || "",
        vp_user_asking_price: askingPrice || "",
        vp_user_variable_price: variablePrice || "",
        vp_user_costing_price: costingPrice || "",
        vp_user_price_status: negotiation || "negotiable",
        vp_show_price: priceSelection || "fixed",
        v_urgent_sale: urgentSale ? 1 : 0,
        _method: "PUT",
      };

      const response = await VehicleService.Commands.individualVehicleUpdate(
        selectedProduct.v_id,
        payload
      );

      // console.log("response------", response);

      if (response?.v_id) {
        toast.success("Price updated successfully!");
        setOpen(false);
      } else {
        toast.error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto p-0 [&>button]:hidden">
        <div className="border-b border-gray-200 px-5 py-4 flex items-center justify-between">
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
            <DialogTitle className="text-lg font-semibold">
              Edit Price
            </DialogTitle>
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

        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold text-gray-700">
            <span>User Price</span>
            <span>Show In Front</span>
          </div>

          <div className="relative border border-gray-300 rounded-lg px-3 py-3">
            <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
              User Purchase Price
            </span>
            <input
              type="number"
              className="w-full text-sm text-gray-800 outline-none"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 border border-gray-300 rounded-lg px-3 py-3">
              <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
                User Fixed Price
              </span>
              <input
                type="number"
                className="w-full text-sm text-gray-800 outline-none"
                value={fixedPrice}
                onChange={(e) => setFixedPrice(e.target.value)}
              />
            </div>
            <input
              type="radio"
              name="show_in_front"
              className="h-5 w-5 text-blue-600"
              checked={priceSelection === 'fixed'}
              onChange={() => setPriceSelection("fixed")}
              aria-label="Show fixed price in front"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 border border-gray-300 rounded-lg px-3 py-3">
              <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
                User Asking Price
              </span>
              <input
                type="number"
                className="w-full text-sm text-gray-800 outline-none"
                value={askingPrice}
                onChange={(e) => setAskingPrice(e.target.value)}
              />
            </div>
            <input
              type="radio"
              name="show_in_front"
              className="h-5 w-5 text-blue-600"
              checked={priceSelection === 'asking'}
              onChange={() => setPriceSelection("asking")}
              aria-label="Show asking price in front"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex-1 border border-gray-300 rounded-lg px-3 py-3">
              <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
                User Variable Price
              </span>
              <input
                type="number"
                className="w-full text-sm text-gray-800 outline-none"
                value={variablePrice}
                onChange={(e) => setVariablePrice(e.target.value)}
              />
            </div>
            <input
              type="radio"
              name="show_in_front"
              className="h-5 w-5 text-blue-600"
              checked={priceSelection === 'variable'}
              onChange={() => setPriceSelection("variable")}
              aria-label="Show variable price in front"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 text-blue-600"
              checked={urgentSale}
              onChange={handleUrgentSaleChange}
            />
            Urgent Sale
          </label>

          <div className="relative border border-gray-300 rounded-lg px-3 py-3">
            <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
              User Price Negotiation
            </span>
            <select
              className="w-full bg-white text-sm text-gray-800 outline-none"
              value={negotiation}
              onChange={(e) => setNegotiation(e.target.value)}
            >
              <option value="negotiable">Negotiable</option>
              <option value="fixed">Fixed</option>
              <option value="variable">Variable</option>
            </select>
          </div>

          <div className="relative border border-gray-300 rounded-lg px-3 py-3">
            <span className="absolute -top-2 left-3 bg-white px-1 text-xs text-gray-500">
              User Costing Price
            </span>
            <input
              type="number"
              className="w-full text-sm text-gray-800 outline-none"
              value={costingPrice}
              onChange={(e) => setCostingPrice(e.target.value)}
            />
          </div>

          {
            updateProductPricePermission && (
              <Button
                type="button"
                className="w-full rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleUpdatePrice}
                disabled={isSaving}
              >
                {isSaving ? "Updating..." : "Update Price"}
              </Button>
            )
          }

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PricePreviewModal;
