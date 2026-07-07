"use client";

import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Boxes,
  ClipboardList,
  FilePlus2,
  PackageCheck,
  Plus,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Truck,
  Warehouse,
  X,
} from "lucide-react";

import ShopOperationsService from "@/services/ShopOperationsService";
import SupplierService from "@/services/SupplierService";

const modeConfig = {
  stock: {
    permission: "Stock.List",
    title: "Shop Stock",
    subtitle: "Monitor variant stock and apply controlled adjustments.",
    icon: Warehouse,
  },
  inventory: {
    permission: "Inventory.List",
    title: "Inventory Ledger",
    subtitle: "Track every opening, sale, purchase, and manual stock movement.",
    icon: ClipboardList,
  },
  purchases: {
    permission: "Purchase.List",
    title: "Purchase Management",
    subtitle: "Create purchase orders and receive stock into shop inventory.",
    icon: Truck,
  },
};

const emptyPurchaseItem = () => ({ variant_id: "", quantity: 1, unit_cost: "" });

const todayInputValue = () => new Date().toISOString().slice(0, 10);

const emptyPurchaseForm = () => ({
  supplier_id: "",
  reference_no: "",
  status: "ordered",
  order_date: "",
  expected_date: "",
  discount: 0,
  tax: 0,
  note: "",
  items: [emptyPurchaseItem()],
});

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const money = (value) =>
  `৳${toNumber(value).toLocaleString("en-BD", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const variantName = (variant) =>
  variant?.pv_title || variant?.pv_option_summary || variant?.product?.p_name || "Variant";

const stockStatus = (variant) => {
  const qty = toNumber(variant?.pv_stock_qty);
  const low = toNumber(variant?.pv_low_stock_threshold);
  if (qty <= 0) return { label: "Out of stock", className: "bg-red-50 text-red-700 ring-red-200" };
  if (low > 0 && qty <= low) return { label: "Low stock", className: "bg-amber-50 text-amber-700 ring-amber-200" };
  return { label: "In stock", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" };
};

const ModalShell = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <button type="button" aria-label="Close" className="absolute inset-0 bg-slate-950/45" onClick={onClose} />
    <div className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-md bg-white shadow-xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
        <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

const StatTile = ({ icon: Icon, label, value, tone = "slate" }) => {
  const tones = {
    slate: "bg-slate-50 text-slate-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className={`inline-flex h-10 w-10 items-center justify-center rounded-md ${tones[tone]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-950">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
};

export default function ShopOperationsPage({ mode = "stock" }) {
  const config = modeConfig[mode] || modeConfig.stock;
  const HeaderIcon = config.icon;
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState("");
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({ variants: 0, total_stock: 0, low_stock: 0, out_of_stock: 0 });
  const [stockRows, setStockRows] = useState([]);
  const [inventoryRows, setInventoryRows] = useState([]);
  const [purchaseRows, setPurchaseRows] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [adjusting, setAdjusting] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ mode: "increase", quantity: 1, unit_cost: "", note: "" });
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState(emptyPurchaseForm);

  const variantOptions = useMemo(
    () =>
      stockRows.map((row) => ({
        value: String(row.pv_id),
        label: `${row.product?.p_name || "Product"} - ${variantName(row)}${row.pv_sku ? ` (${row.pv_sku})` : ""}`,
        cost: row.pv_purchase_price || "",
      })),
    [stockRows]
  );

  const selectedShop = shops.find((shop) => String(shop.s_id) === String(shopId));

  const loadShops = async () => {
    try {
      const response = await ShopOperationsService.Queries.getOperationShops({ _permission: config.permission });
      const rows = response?.data || [];
      setShops(rows);
      setShopId((current) => current || (rows[0]?.s_id ? String(rows[0].s_id) : ""));
    } catch (error) {
      toast.error(error?.message || "Failed to load shops.");
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await SupplierService.Queries.getSuppliers({ _page: 1, _perPage: 1000, _status: "active" });
      setSuppliers(response?.data?.data || []);
    } catch {
      setSuppliers([]);
    }
  };

  const loadStock = async () => {
    if (!shopId) return;
    const response = await ShopOperationsService.Queries.getStock({
      _shop_id: shopId,
      _search: search || undefined,
      _stock: stockFilter || undefined,
      _page: 1,
      _perPage: 1000,
    });
    setSummary(response?.data?.summary || {});
    setStockRows(response?.data?.items?.data || []);
  };

  const loadInventory = async () => {
    if (!shopId) return;
    const response = await ShopOperationsService.Queries.getInventory({
      _shop_id: shopId,
      _search: search || undefined,
      _type: typeFilter || undefined,
      _page: 1,
      _perPage: 100,
    });
    setInventoryRows(response?.data?.data || []);
  };

  const loadPurchases = async () => {
    if (!shopId) return;
    const response = await ShopOperationsService.Queries.getPurchases({
      _shop_id: shopId,
      _search: search || undefined,
      _status: statusFilter || undefined,
      _page: 1,
      _perPage: 100,
    });
    setPurchaseRows(response?.data?.data || []);
  };

  const refresh = async () => {
    setLoading(true);
    try {
      if (mode === "stock") await loadStock();
      if (mode === "inventory") await loadInventory();
      if (mode === "purchases") {
        await Promise.all([loadStock(), loadPurchases(), loadSuppliers()]);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to load shop operations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShops();
  }, [mode]);

  useEffect(() => {
    refresh();
  }, [shopId, mode, stockFilter, typeFilter, statusFilter]);

  const submitAdjust = async () => {
    if (!adjusting) return;

    try {
      await ShopOperationsService.Commands.adjustStock({
        shop_id: shopId,
        variant_id: adjusting.pv_id,
        ...adjustForm,
      });
      toast.success("Stock adjusted.");
      setAdjusting(null);
      await refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Stock adjustment failed.");
    }
  };

  const addPurchaseItem = () => {
    setPurchaseForm((current) => ({ ...current, items: [...current.items, emptyPurchaseItem()] }));
  };

  const removePurchaseItem = (index) => {
    setPurchaseForm((current) => {
      const nextItems = current.items.filter((_, itemIndex) => itemIndex !== index);
      return { ...current, items: nextItems.length ? nextItems : [emptyPurchaseItem()] };
    });
  };

  const setPurchaseItem = (index, patch) => {
    setPurchaseForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)),
    }));
  };

  const submitPurchase = async () => {
    try {
      const items = purchaseForm.items
        .filter((item) => item.variant_id && Number(item.quantity) > 0)
        .map((item) => ({
          variant_id: Number(item.variant_id),
          quantity: Number(item.quantity),
          unit_cost: Number(item.unit_cost || 0),
        }));

      if (!items.length) {
        toast.error("Add at least one valid purchase item.");
        return;
      }

      await ShopOperationsService.Commands.createPurchase({
        shop_id: shopId,
        ...purchaseForm,
        order_date: purchaseForm.order_date || todayInputValue(),
        items,
      });
      toast.success("Purchase created.");
      setPurchaseModalOpen(false);
      setPurchaseForm(emptyPurchaseForm());
      await refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Purchase creation failed.");
    }
  };

  const receivePurchase = async (purchase) => {
    try {
      await ShopOperationsService.Commands.receivePurchase(purchase.po_id);
      toast.success("Purchase received into stock.");
      await refresh();
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || "Receive failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-5 text-slate-900 lg:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-white">
              <HeaderIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal">{config.title}</h1>
              <p className="mt-1 text-sm text-slate-500">{config.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <select
              value={shopId}
              onChange={(event) => setShopId(event.target.value)}
              className="h-10 min-w-[240px] rounded-md border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-900"
            >
              {shops.map((shop) => (
                <option key={shop.s_id} value={shop.s_id}>
                  {shop.s_title}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={refresh}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-50"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>
            {mode === "purchases" && (
              <button
                type="button"
                onClick={() => {
                  setPurchaseForm((current) => ({
                    ...current,
                    order_date: current.order_date || todayInputValue(),
                  }));
                  setPurchaseModalOpen(true);
                }}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <FilePlus2 className="h-4 w-4" />
                New Purchase
              </button>
            )}
          </div>
        </header>

        <section className="grid gap-3 md:grid-cols-4">
          <StatTile icon={Boxes} label="Variants" value={summary.variants || 0} />
          <StatTile icon={PackageCheck} label="Total Stock" value={summary.total_stock || 0} tone="green" />
          <StatTile icon={ArrowDownCircle} label="Low Stock" value={summary.low_stock || 0} tone="amber" />
          <StatTile icon={X} label="Out of Stock" value={summary.out_of_stock || 0} tone="red" />
        </section>

        <section className="rounded-md border border-slate-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="font-semibold text-slate-950">{selectedShop?.s_title || "Shop"} workspace</h2>
              <p className="text-sm text-slate-500">Owner and permitted shop users can manage this data.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && refresh()}
                  placeholder="Search product, SKU, note"
                  className="h-full w-full min-w-[220px] text-sm outline-none"
                />
              </div>
              {mode === "stock" && (
                <select value={stockFilter} onChange={(event) => setStockFilter(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                  <option value="">All stock</option>
                  <option value="in">In stock</option>
                  <option value="low">Low stock</option>
                  <option value="out">Out of stock</option>
                </select>
              )}
              {mode === "inventory" && (
                <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                  <option value="">All movement</option>
                  <option value="opening">Opening</option>
                  <option value="purchase">Purchase</option>
                  <option value="sale">Sale</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="stock_count">Stock count</option>
                </select>
              )}
              {mode === "purchases" && (
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm">
                  <option value="">All status</option>
                  <option value="draft">Draft</option>
                  <option value="ordered">Ordered</option>
                  <option value="partially_received">Partially received</option>
                  <option value="received">Received</option>
                </select>
              )}
              <button type="button" onClick={refresh} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white">
                <SlidersHorizontal className="h-4 w-4" />
                Apply
              </button>
            </div>
          </div>

          {mode === "stock" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Low Alert</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stockRows.map((row) => {
                    const status = stockStatus(row);
                    return (
                      <tr key={row.pv_id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-950">{row.product?.p_name}</div>
                          <div className="text-xs text-slate-500">{variantName(row)}</div>
                        </td>
                        <td className="px-4 py-3">{row.pv_sku || "-"}</td>
                        <td className="px-4 py-3">{row.product?.supplier?.s_name || "-"}</td>
                        <td className="px-4 py-3 text-lg font-semibold">{row.pv_stock_qty}</td>
                        <td className="px-4 py-3">{row.pv_low_stock_threshold || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${status.className}`}>{status.label}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setAdjusting(row);
                              setAdjustForm({ mode: "increase", quantity: 1, unit_cost: row.pv_purchase_price || "", note: "" });
                            }}
                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-50"
                          >
                            <Plus className="h-4 w-4" />
                            Adjust
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {mode === "inventory" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Unit Cost</th>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventoryRows.map((row) => (
                    <tr key={row.im_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">{row.im_created_at ? new Date(row.im_created_at).toLocaleString() : "-"}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-950">{row.product?.p_name}</div>
                        <div className="text-xs text-slate-500">{row.variant?.pv_sku || row.variant?.pv_title}</div>
                      </td>
                      <td className="px-4 py-3 capitalize">{String(row.im_type || "").replaceAll("_", " ")}</td>
                      <td className={`px-4 py-3 font-semibold ${Number(row.im_quantity) >= 0 ? "text-emerald-700" : "text-red-700"}`}>
                        {Number(row.im_quantity) >= 0 ? "+" : ""}
                        {row.im_quantity}
                      </td>
                      <td className="px-4 py-3">{row.im_unit_cost ? money(row.im_unit_cost) : "-"}</td>
                      <td className="px-4 py-3">{row.im_reference_type || "-"}</td>
                      <td className="px-4 py-3">{row.im_note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {mode === "purchases" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Reference</th>
                    <th className="px-4 py-3">Supplier</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Order Date</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchaseRows.map((row) => (
                    <tr key={row.po_id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-950">{row.po_reference_no}</td>
                      <td className="px-4 py-3">{row.supplier?.s_name || "-"}</td>
                      <td className="px-4 py-3">{row.items_count || 0}</td>
                      <td className="px-4 py-3">{row.po_order_date || "-"}</td>
                      <td className="px-4 py-3 font-semibold">{money(row.po_total)}</td>
                      <td className="px-4 py-3 capitalize">{String(row.po_status).replaceAll("_", " ")}</td>
                      <td className="px-4 py-3 text-right">
                        {!["received", "cancelled"].includes(row.po_status) && (
                          <button
                            type="button"
                            onClick={() => receivePurchase(row)}
                            className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700"
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                            Receive
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && mode === "stock" && !stockRows.length && <div className="p-8 text-center text-sm text-slate-500">No stock variants found.</div>}
          {!loading && mode === "inventory" && !inventoryRows.length && <div className="p-8 text-center text-sm text-slate-500">No inventory movement found.</div>}
          {!loading && mode === "purchases" && !purchaseRows.length && <div className="p-8 text-center text-sm text-slate-500">No purchase orders found.</div>}
        </section>
      </div>

      {adjusting && (
        <ModalShell title={`Adjust Stock - ${variantName(adjusting)}`} onClose={() => setAdjusting(null)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Mode</span>
              <select value={adjustForm.mode} onChange={(event) => setAdjustForm((current) => ({ ...current, mode: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
                <option value="increase">Increase</option>
                <option value="decrease">Decrease</option>
                <option value="set">Set exact stock</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Quantity</span>
              <input type="number" min="0" value={adjustForm.quantity} onChange={(event) => setAdjustForm((current) => ({ ...current, quantity: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Unit Cost</span>
              <input type="number" min="0" value={adjustForm.unit_cost} onChange={(event) => setAdjustForm((current) => ({ ...current, unit_cost: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" />
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Note</span>
              <textarea value={adjustForm.note} onChange={(event) => setAdjustForm((current) => ({ ...current, note: event.target.value }))} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setAdjusting(null)} className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold">Cancel</button>
            <button type="button" onClick={submitAdjust} className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white">Save Adjustment</button>
          </div>
        </ModalShell>
      )}

      {purchaseModalOpen && (
        <ModalShell title="New Purchase Order" onClose={() => setPurchaseModalOpen(false)}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Supplier</span>
              <select value={purchaseForm.supplier_id} onChange={(event) => setPurchaseForm((current) => ({ ...current, supplier_id: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
                <option value="">No supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.s_id} value={supplier.s_id}>{supplier.s_name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Reference</span>
              <input value={purchaseForm.reference_no} onChange={(event) => setPurchaseForm((current) => ({ ...current, reference_no: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" placeholder="Auto generated if blank" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Order Date</span>
              <input type="date" value={purchaseForm.order_date} onChange={(event) => setPurchaseForm((current) => ({ ...current, order_date: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Expected Date</span>
              <input type="date" value={purchaseForm.expected_date} onChange={(event) => setPurchaseForm((current) => ({ ...current, expected_date: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" />
            </label>
          </div>

          <div className="mt-5 rounded-md border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-sm font-semibold text-slate-900">Purchase Items</div>
              <button type="button" onClick={addPurchaseItem} className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-semibold text-white">
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
            <div className="divide-y divide-slate-100">
              {purchaseForm.items.map((item, index) => (
                <div key={index} className="grid gap-3 p-4 md:grid-cols-[minmax(0,1fr)_110px_140px_40px]">
                  <select
                    value={item.variant_id}
                    onChange={(event) => {
                      const selected = variantOptions.find((option) => option.value === event.target.value);
                      setPurchaseItem(index, { variant_id: event.target.value, unit_cost: item.unit_cost || selected?.cost || "" });
                    }}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
                  >
                    <option value="">Select variant</option>
                    {variantOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                  <input type="number" min="1" value={item.quantity} onChange={(event) => setPurchaseItem(index, { quantity: event.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
                  <input type="number" min="0" value={item.unit_cost} onChange={(event) => setPurchaseItem(index, { unit_cost: event.target.value })} className="h-10 rounded-md border border-slate-300 px-3 text-sm" />
                  <button type="button" onClick={() => removePurchaseItem(index)} className="flex h-10 items-center justify-center rounded-md border border-slate-300 text-slate-500">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Discount</span>
              <input type="number" min="0" value={purchaseForm.discount} onChange={(event) => setPurchaseForm((current) => ({ ...current, discount: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Tax</span>
              <input type="number" min="0" value={purchaseForm.tax} onChange={(event) => setPurchaseForm((current) => ({ ...current, tax: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Status</span>
              <select value={purchaseForm.status} onChange={(event) => setPurchaseForm((current) => ({ ...current, status: event.target.value }))} className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm">
                <option value="draft">Draft</option>
                <option value="ordered">Ordered</option>
              </select>
            </label>
            <label className="block md:col-span-3">
              <span className="mb-1 block text-sm font-medium text-slate-700">Note</span>
              <textarea value={purchaseForm.note} onChange={(event) => setPurchaseForm((current) => ({ ...current, note: event.target.value }))} rows={3} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <button type="button" onClick={() => setPurchaseModalOpen(false)} className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold">Cancel</button>
            <button type="button" onClick={submitPurchase} className="h-10 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white">Create Purchase</button>
          </div>
        </ModalShell>
      )}
    </div>
  );
}
