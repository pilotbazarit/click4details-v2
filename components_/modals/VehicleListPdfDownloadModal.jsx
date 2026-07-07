import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

const COLUMN_OPTIONS = [
  { key: "code", label: "Code" },
  { key: "title", label: "Title" },
  { key: "shop", label: "Shop" },
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "package", label: "Package" },
  { key: "mod_year", label: "Model Year" },
  { key: "condition", label: "Condition" },
  { key: "transmission", label: "Transmission" },
  { key: "fuel", label: "Fuel" },
  { key: "capacity", label: "Capacity" },
  { key: "mileage", label: "Mileage" },
  { key: "color", label: "Color" },
  { key: "chassis", label: "Chassis" },
  { key: "status", label: "Status" },
  { key: "price", label: "Price" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "", label: "All Status" },
];

const buildDefaultColumns = () => ({
  code: true,
  title: true,
  shop: true,
  brand: true,
  model: true,
  package: true,
  mod_year: true,
  condition: true,
  transmission: true,
  fuel: true,
  capacity: true,
  mileage: true,
  color: true,
  chassis: true,
  status: true,
  price: true,
});

const VehicleListPdfDownloadModal = ({
  open,
  setOpen,
  shopOptions = [],
  initialShopValue = "__CURRENT__",
  initialStatus = "active",
  isDownloading = false,
  onSubmit,
}) => {
  const [selectedShopValue, setSelectedShopValue] = useState(initialShopValue);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [selectedColumns, setSelectedColumns] = useState(buildDefaultColumns());

  useEffect(() => {
    if (!open) {
      return;
    }

    setSelectedShopValue(initialShopValue);
    setSelectedStatus(initialStatus);
    setSelectedColumns(buildDefaultColumns());
  }, [open, initialShopValue, initialStatus]);

  const handleColumnToggle = (columnKey) => {
    setSelectedColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    const enabledColumns = COLUMN_OPTIONS
      .filter((column) => selectedColumns[column.key])
      .map((column) => column.key);

    onSubmit?.({
      status: selectedStatus,
      shopValue: selectedShopValue,
      columns: enabledColumns,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Vehicle List PDF Download</DialogTitle>
          <DialogDescription>
            Filter the list and choose which columns should be included in the PDF.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="vehicle-list-pdf-shop"
                className="text-sm font-medium text-gray-700"
              >
                Shop
              </label>
              <select
                id="vehicle-list-pdf-shop"
                value={selectedShopValue}
                onChange={(event) => setSelectedShopValue(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="__CURRENT__">Current Page Scope</option>
                {shopOptions.map((shop) => (
                  <option key={shop.value} value={String(shop.value)}>
                    {shop.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="vehicle-list-pdf-status"
                className="text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="vehicle-list-pdf-status"
                value={selectedStatus}
                onChange={(event) => setSelectedStatus(event.target.value)}
                className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUS_OPTIONS.map((statusOption) => (
                  <option key={statusOption.label} value={statusOption.value}>
                    {statusOption.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm font-semibold text-gray-800">Columns</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {COLUMN_OPTIONS.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-3 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(selectedColumns[column.key])}
                    onChange={() => handleColumnToggle(column.key)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>{column.label}</span>
                </label>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDownloading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Preparing PDF
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleListPdfDownloadModal;
