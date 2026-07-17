"use client";

import {
    Badge,
    BadgeCheck,
    BadgeMinus,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Eye,
    Loader2,
    Receipt,
    RefreshCw,
    Search,
    ShoppingCart,
    Store,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import PosService from "@/services/PosService";
import { useAppContext } from "@/context/AppContext";
import ShopService from "@/services/ShopService";
import ShopSelect from "@/components/ShopSelect";

const STATUS_COLORS = {
    completed:  "bg-green-100 text-green-700 border-green-200",
    pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
    cancelled:  "bg-red-100 text-red-700 border-red-200",
};

const PAYMENT_STATUS_COLORS = {
    paid:           "bg-emerald-100 text-emerald-700",
    unpaid:         "bg-red-100 text-red-700",
    partially_paid: "bg-orange-100 text-orange-700",
};

export default function PosHistory() {
    const { user } = useAppContext();

    const parsedUser = useMemo(() => {
        if (!user) return null;
        try { return typeof user === "string" ? JSON.parse(user) : user; }
        catch { return null; }
    }, [user]);

    const isAdminOrSupreme = ["admin", "supreme", "pbl"].includes(parsedUser?.user_mode);

    // Filters
    const [shopId, setShopId] = useState("");
    const [shops, setShops] = useState([]);
    const [status, setStatus] = useState("");
    const [paymentStatus, setPaymentStatus] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [search, setSearch] = useState("");

    // Data
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const itemsPerPage = 20;

    // Detail view
    const [selectedSale, setSelectedSale] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);

    // Load shops
    useEffect(() => {
        if (!parsedUser) return;
        const fn = isAdminOrSupreme ? PosService.Queries.getShops : ShopService.Queries.getShops;
        fn().then((res) => {
            const data = res?.data?.data ?? res?.data ?? [];
            setShops(Array.isArray(data) ? data : []);
        });
    }, [parsedUser, isAdminOrSupreme]);

    const fetchSales = async () => {
        setLoading(true);
        try {
            const params = {
                _page: currentPage,
                _perPage: itemsPerPage,
                _orderBy: "o_id",
                _order: "DESC",
            };
            if (shopId) params._shop_id = shopId;
            if (status) params._status = status;
            if (paymentStatus) params._payment_status = paymentStatus;
            if (dateFrom) params._date_from = dateFrom;
            if (dateTo) params._date_to = dateTo;
            if (search) params._search = search;

            const res = await PosService.Queries.getSales(params);
            if (res?.data?.status === "success" || res?.status === "success") {
                const d = res?.data?.data ?? res?.data;
                setSales(d?.data ?? (Array.isArray(d) ? d : []));
                setTotalItems(d?.total ?? 0);
            } else {
                setSales([]);
                setTotalItems(0);
            }
        } catch {
            setSales([]);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, [currentPage, shopId, status, paymentStatus, dateFrom, dateTo]);

    const handleSearch = () => {
        setCurrentPage(1);
        fetchSales();
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Delete this POS sale?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, delete",
        });
        if (!result.isConfirmed) return;
        try {
            await PosService.Commands.deleteSale(id);
            toast.success("POS sale deleted");
            fetchSales();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const parseNote = (note) => {
        if (!note) return {};
        try { return typeof note === "object" ? note : JSON.parse(note); }
        catch { return {}; }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Page header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow">
                            <Receipt className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">POS Sales History</h1>
                            <p className="text-sm text-gray-500">View and manage all point-of-sale transactions</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchSales}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-medium transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="flex flex-wrap gap-3 items-end">
                    {/* Search */}
                    <div className="relative min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID or note..."
                            className="pl-9 pr-8 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        />
                        {search && (
                            <button onClick={() => { setSearch(""); setCurrentPage(1); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Shop filter (admin only) */}
                    {isAdminOrSupreme && (
                        <div className="flex items-center gap-1.5 min-w-[220px]">
                            <Store className="w-4 h-4 text-gray-400 shrink-0" />
                            <ShopSelect
                                shops={shops}
                                value={shopId}
                                onChange={(id) => { setShopId(id); setCurrentPage(1); }}
                                placeholder="All Shops"
                                className="flex-1 text-sm"
                            />
                        </div>
                    )}

                    {/* Status */}
                    <select
                        className="py-2 pl-2 pr-7 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={status}
                        onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Payment status */}
                    <select
                        className="py-2 pl-2 pr-7 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={paymentStatus}
                        onChange={(e) => { setPaymentStatus(e.target.value); setCurrentPage(1); }}
                    >
                        <option value="">All Payments</option>
                        <option value="paid">Paid</option>
                        <option value="partially_paid">Partially Paid</option>
                        <option value="unpaid">Unpaid</option>
                    </select>

                    {/* Date range */}
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <input
                            type="date"
                            className="py-2 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={dateFrom}
                            onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                        />
                        <span className="text-gray-400 text-xs">to</span>
                        <input
                            type="date"
                            className="py-2 px-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                            value={dateTo}
                            onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                        />
                    </div>

                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
                    >
                        Search
                    </button>

                    {(shopId || status || paymentStatus || dateFrom || dateTo || search) && (
                        <button
                            onClick={() => {
                                setShopId(""); setStatus(""); setPaymentStatus("");
                                setDateFrom(""); setDateTo(""); setSearch("");
                                setCurrentPage(1);
                            }}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition"
                        >
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 px-6 py-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Stats strip */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ShoppingCart className="w-4 h-4" />
                            <span>
                                {loading ? "Loading..." : `${totalItems} sales found`}
                            </span>
                        </div>
                        <span className="text-sm text-gray-400">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-12">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sale ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Shop</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Paid</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Payment</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={11} className="py-16 text-center">
                                            <div className="flex items-center justify-center gap-2 text-gray-400">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Loading sales...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : sales.length === 0 ? (
                                    <tr>
                                        <td colSpan={11} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-400">
                                                <Receipt className="w-12 h-12 opacity-20" />
                                                <p className="text-sm">No POS sales found</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    sales.map((sale, index) => {
                                        const note = parseNote(sale.o_note);
                                        const customerDisplay = note.customer_name || note.o_c_name || note.customer_phone || note.o_phone || "Walk-in";
                                        const saleDate = new Date(sale.o_created_at).toLocaleString("en-BD", {
                                            dateStyle: "medium", timeStyle: "short",
                                        });
                                        return (
                                            <tr key={sale.o_id} className="hover:bg-blue-50/30 transition">
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {(currentPage - 1) * itemsPerPage + index + 1}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="text-sm font-mono font-semibold text-blue-700">
                                                        POS-{sale.o_id}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        <Store className="w-3.5 h-3.5 text-gray-400" />
                                                        <span className="text-sm text-gray-700 truncate max-w-[120px]">
                                                            {sale.shop?.s_title ?? "—"}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                    {customerDisplay}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-gray-500">
                                                    {sale.items?.length ?? "—"} items
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-sm font-bold text-gray-800">
                                                        ৳{Number(sale.o_total_amount).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className="text-sm font-medium text-green-700">
                                                        ৳{Number(sale.o_paid_amount).toLocaleString()}
                                                    </span>
                                                    {Number(sale.o_due_amount) > 0 && (
                                                        <div className="text-xs text-orange-500">
                                                            Due: ৳{Number(sale.o_due_amount).toLocaleString()}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[sale.o_status] ?? "bg-gray-100 text-gray-700 border-gray-200"}`}>
                                                        {sale.o_status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PAYMENT_STATUS_COLORS[sale.o_payment_status] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {sale.o_payment_status?.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                                                    {saleDate}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => { setSelectedSale(sale); setDetailOpen(true); }}
                                                            className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                                                            title="View details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(sale.o_id)}
                                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
                            <p className="text-sm text-gray-500">
                                Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    const page = i + 1;
                                    return (
                                        <button
                                            key={page}
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition ${currentPage === page ? "bg-blue-600 text-white shadow" : "border border-gray-200 text-gray-600 hover:bg-gray-100"}`}
                                        >
                                            {page}
                                        </button>
                                    );
                                })}
                                {totalPages > 5 && <span className="text-gray-400 text-sm">…</span>}
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {detailOpen && selectedSale && (
                <SaleDetailModal sale={selectedSale} onClose={() => { setDetailOpen(false); setSelectedSale(null); }} />
            )}
        </div>
    );
}

function SaleDetailModal({ sale, onClose }) {
    const note = (() => {
        if (!sale.o_note) return {};
        try { return typeof sale.o_note === "object" ? sale.o_note : JSON.parse(sale.o_note); }
        catch { return {}; }
    })();

    const fmt = (n) => `৳${Number(n || 0).toLocaleString()}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800">
                    <div className="flex items-center gap-2 text-white">
                        <Receipt className="w-5 h-5" />
                        <span className="font-bold">POS-{sale.o_id}</span>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[75vh] p-5 space-y-4">
                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <InfoRow label="Shop" value={sale.shop?.s_title ?? "—"} />
                        <InfoRow label="Cashier" value={sale.cashier?.name ?? "—"} />
                        <InfoRow label="Customer" value={note.customer_name || note.o_c_name || "Walk-in"} />
                        <InfoRow label="Phone" value={note.customer_phone || note.o_phone || "—"} />
                        <InfoRow label="Payment" value={sale.o_payment_method?.replace("_", " ")} />
                        <InfoRow label="Date" value={new Date(sale.o_created_at).toLocaleString("en-BD")} />
                    </div>

                    {/* Items */}
                    {sale.items?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Items</h3>
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-3 py-2 text-left text-xs text-gray-500">Product</th>
                                            <th className="px-3 py-2 text-center text-xs text-gray-500">Qty</th>
                                            <th className="px-3 py-2 text-right text-xs text-gray-500">Price</th>
                                            <th className="px-3 py-2 text-right text-xs text-gray-500">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {sale.items.map((item, i) => (
                                            <tr key={i}>
                                                <td className="px-3 py-2 text-gray-800">{item.oi_product_id ?? `#${item.oi_product_id}`}</td>
                                                <td className="px-3 py-2 text-center text-gray-600">{item.oi_quantity}</td>
                                                <td className="px-3 py-2 text-right text-gray-600">{fmt(item.oi_unit_price)}</td>
                                                <td className="px-3 py-2 text-right font-medium text-gray-800">{fmt(item.oi_total_price)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Totals */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                        <DetailRow label="Subtotal" value={fmt(Number(sale.o_total_amount) + Number(sale.o_discount_amount) - Number(sale.o_vat_amount))} />
                        {Number(sale.o_vat_amount) > 0 && <DetailRow label="VAT" value={fmt(sale.o_vat_amount)} />}
                        {Number(sale.o_discount_amount) > 0 && <DetailRow label="Discount" value={`-${fmt(sale.o_discount_amount)}`} valueClass="text-green-700" />}
                        <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-200">
                            <span>Total</span>
                            <span className="text-blue-700">{fmt(sale.o_total_amount)}</span>
                        </div>
                        <DetailRow label="Paid" value={fmt(sale.o_paid_amount)} valueClass="text-green-700" />
                        {Number(sale.o_due_amount) > 0 && (
                            <DetailRow label="Due" value={fmt(sale.o_due_amount)} valueClass="text-orange-600" />
                        )}
                    </div>
                </div>

                <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div>
            <dt className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</dt>
            <dd className="text-sm font-medium text-gray-800">{value ?? "—"}</dd>
        </div>
    );
}

function DetailRow({ label, value, valueClass = "text-gray-700" }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-gray-500">{label}</span>
            <span className={`font-medium ${valueClass}`}>{value}</span>
        </div>
    );
}
