"use client";

import { useAppContext } from "@/context/AppContext";
import PosService from "@/services/PosService";
import ShopService from "@/services/ShopService";
import {
    AlertCircle,
    BadgePercent,
    Car,
    ChevronDown,
    CreditCard,
    Loader2,
    Minus,
    Package,
    Plus,
    Printer,
    Receipt,
    Search,
    ShoppingCart,
    Store,
    Tag,
    Trash2,
    User,
    X,
    XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import PosReceipt from "./PosReceipt";

const PAYMENT_METHODS = [
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "card", label: "Card", icon: "💳" },
    { value: "mobile_banking", label: "Mobile Banking", icon: "📱" },
    { value: "bank_transfer", label: "Bank Transfer", icon: "🏦" },
];

const PRODUCT_TYPES = [
    { value: "all", label: "All", icon: null },
    { value: "product", label: "Products", icon: Package },
    { value: "vehicle", label: "Vehicles", icon: Car },
];

export default function PosTerminal() {
    const { user, selectedCompanyShop } = useAppContext();

    const parsedUser = useMemo(() => {
        if (!user) return null;
        try {
            return typeof user === "string" ? JSON.parse(user) : user;
        } catch {
            return null;
        }
    }, [user]);

    const isAdminOrSupreme = ["admin", "supreme", "pbl"].includes(parsedUser?.user_mode);

    // Shop state
    const [shops, setShops] = useState([]);
    const [selectedShop, setSelectedShop] = useState(null);
    const [shopLoading, setShopLoading] = useState(false);

    // Shop search dropdown state
    const [shopSearch, setShopSearch] = useState("");
    const [shopDropOpen, setShopDropOpen] = useState(false);
    const shopDropRef = useRef(null);

    const filteredShops = useMemo(() => {
        if (!shopSearch.trim()) return shops;
        const q = shopSearch.toLowerCase();
        return shops.filter(s =>
            s.s_title?.toLowerCase().includes(q) ||
            String(s.s_id).includes(q) ||
            String(s?.user?.phone || s?.s_user_phone || "").includes(q)
        );
    }, [shops, shopSearch]);

    // Product search state
    const [searchQuery, setSearchQuery] = useState("");
    const [productType, setProductType] = useState("all");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const searchTimeoutRef = useRef(null);

    // Cart state
    const [cartItems, setCartItems] = useState([]);

    // Customer info
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");

    // Payment state
    const [paymentMethod, setPaymentMethod] = useState("cash");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [vatPercent, setVatPercent] = useState(0);
    const [paidAmount, setPaidAmount] = useState(0);

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [completedSale, setCompletedSale] = useState(null);
    const [showReceipt, setShowReceipt] = useState(false);

    // ─── Computed totals ──────────────────────────────────────────────────────
    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
        [cartItems]
    );
    const vatAmount = useMemo(() => (subtotal * vatPercent) / 100, [subtotal, vatPercent]);
    const totalAmount = useMemo(
        () => Math.max(0, subtotal + vatAmount - Number(discountAmount || 0)),
        [subtotal, vatAmount, discountAmount]
    );
    const dueAmount = useMemo(() => Math.max(0, totalAmount - Number(paidAmount || 0)), [totalAmount, paidAmount]);
    const paymentStatus = useMemo(() => {
        if (Number(paidAmount) <= 0) return "unpaid";
        if (dueAmount <= 0) return "paid";
        return "partially_paid";
    }, [paidAmount, dueAmount]);

    // ─── Load shops ───────────────────────────────────────────────────────────
    useEffect(() => {
        if (!parsedUser) return;

        if (isAdminOrSupreme) {
            setShopLoading(true);
            PosService.Queries.getShops()
                .then((res) => {
                    const data = res?.data?.data ?? res?.data ?? [];
                    const list = Array.isArray(data) ? data : [];
                    setShops(list);
                    if (list.length > 0) setSelectedShop(list[0]);
                })
                .catch(() => toast.error("Failed to load shops"))
                .finally(() => setShopLoading(false));
        } else {
            setShopLoading(true);
            ShopService.Queries.getShops()
                .then((res) => {
                    const data = res?.data?.data ?? res?.data ?? [];
                    const list = Array.isArray(data) ? data : [];
                    setShops(list);
                    if (list.length > 0) setSelectedShop(list[0]);
                })
                .catch(() => toast.error("Failed to load shops"))
                .finally(() => setShopLoading(false));
        }
    }, [parsedUser, isAdminOrSupreme]);

    // ─── Close shop dropdown on outside click ─────────────────────────────────
    useEffect(() => {
        const handler = (e) => {
            if (shopDropRef.current && !shopDropRef.current.contains(e.target)) {
                setShopDropOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // ─── Product search ───────────────────────────────────────────────────────
    const doSearch = useCallback(
        async (q, type, shopId) => {
            if (!shopId) return;
            setSearching(true);
            try {
                const res = await PosService.Queries.searchProducts({
                    query: q,
                    type,
                    shop_id: shopId,
                    limit: 30,
                });
                const results = res?.data?.data ?? res?.data ?? [];
                setSearchResults(Array.isArray(results) ? results : []);
            } catch {
                toast.error("Product search failed");
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        },
        []
    );

    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        searchTimeoutRef.current = setTimeout(() => {
            doSearch(searchQuery, productType, selectedShop?.s_id);
        }, 350);
        return () => clearTimeout(searchTimeoutRef.current);
    }, [searchQuery, productType, selectedShop, doSearch]);

    // ─── Cart helpers ─────────────────────────────────────────────────────────
    const addToCart = (product) => {
        setCartItems((prev) => {
            const existing = prev.find(
                (i) => i.id === product.id && i.type === product.type
            );
            if (existing) {
                return prev.map((i) =>
                    i.id === product.id && i.type === product.type
                        ? { ...i, qty: i.qty + 1 }
                        : i
                );
            }
            return [
                ...prev,
                {
                    ...product,
                    qty: 1,
                    unitPrice: product.price,
                    discount: 0,
                },
            ];
        });
        toast.success(`${product.name} added to cart`, { duration: 1200 });
    };

    const updateQty = (id, type, delta) => {
        setCartItems((prev) =>
            prev
                .map((i) =>
                    i.id === id && i.type === type
                        ? { ...i, qty: Math.max(1, i.qty + delta) }
                        : i
                )
        );
    };

    const setQty = (id, type, val) => {
        const n = parseInt(val, 10);
        if (isNaN(n) || n < 1) return;
        setCartItems((prev) =>
            prev.map((i) => (i.id === id && i.type === type ? { ...i, qty: n } : i))
        );
    };

    const removeFromCart = (id, type) => {
        setCartItems((prev) => prev.filter((i) => !(i.id === id && i.type === type)));
    };

    const clearCart = () => {
        setCartItems([]);
        setCustomerName("");
        setCustomerPhone("");
        setDiscountAmount(0);
        setVatPercent(0);
        setPaidAmount(0);
        setPaymentMethod("cash");
    };

    // ─── Complete sale ────────────────────────────────────────────────────────
    const completeSale = async () => {
        if (!selectedShop) return toast.error("Please select a shop");
        if (cartItems.length === 0) return toast.error("Cart is empty");

        setSubmitting(true);
        try {
            const payload = {
                o_shop_id: selectedShop.s_id,
                o_total_amount: totalAmount,
                o_discount_amount: Number(discountAmount) || 0,
                o_vat_amount: vatAmount,
                o_paid_amount: Number(paidAmount) || 0,
                o_due_amount: dueAmount,
                o_payment_method: paymentMethod,
                o_payment_status: paymentStatus,
                o_note: JSON.stringify({
                    customer_name: customerName,
                    customer_phone: customerPhone,
                }),
                oi_product_id: cartItems.map((i) => i.id),
                oi_type_id: cartItems.map((i) => i.type_id ?? i.id),
                oi_quantity: cartItems.map((i) => i.qty),
                oi_unit_price: cartItems.map((i) => i.unitPrice),
                oi_discount_price: cartItems.map((i) => i.discount ?? 0),
                oi_total_price: cartItems.map((i) => i.unitPrice * i.qty),
            };

            const res = await PosService.Commands.createSale(payload);
            const sale = res?.data?.data ?? res?.data;

            setCompletedSale({
                ...sale,
                items: cartItems,
                shop: selectedShop,
                customer: { name: customerName, phone: customerPhone },
                totals: { subtotal, vatAmount, discountAmount: Number(discountAmount), totalAmount, paidAmount: Number(paidAmount), dueAmount },
                paymentMethod,
                paymentStatus,
                cashierName: parsedUser?.name,
                saleDate: new Date().toISOString(),
            });
            setShowReceipt(true);
            clearCart();
            toast.success("POS sale completed!");
        } catch (err) {
            toast.error(err?.response?.data?.message ?? "Sale failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Auto-fill paid amount ────────────────────────────────────────────────
    const handleQuickPay = () => setPaidAmount(totalAmount.toFixed(2));

    return (
        <div className="flex flex-col bg-gray-100" style={{height:"calc(100dvh - 110px)"}}>
            {/* Top bar — flex-shrink-0 so panels get remaining height */}
            <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-4 py-2 flex items-center justify-between shadow-lg flex-shrink-0">
                <div className="flex items-center gap-3">
                    <Receipt className="w-6 h-6 text-blue-200" />
                    <div>
                        <h1 className="text-lg font-bold tracking-wide">POS Terminal</h1>
                        <p className="text-blue-200 text-xs">Point of Sale System</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Shop selector */}
                    {shopLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-200" />
                    ) : isAdminOrSupreme ? (
                        /* Searchable shop combobox for admin/supreme/pbl */
                        <div className="relative" ref={shopDropRef}>
                            <button
                                type="button"
                                onClick={() => {
                                    setShopDropOpen(o => !o);
                                    setShopSearch("");
                                }}
                                className="flex items-center gap-2 bg-blue-800 border border-blue-600 rounded-lg px-3 py-1.5 min-w-[220px] text-left hover:bg-blue-700 transition-colors"
                            >
                                <Store className="w-4 h-4 text-blue-300 shrink-0" />
                                <span className="text-sm text-white flex-1 truncate">
                                    {selectedShop?.s_title ?? "Select Shop"}
                                </span>
                                <ChevronDown className={`w-3.5 h-3.5 text-blue-300 shrink-0 transition-transform ${shopDropOpen ? "rotate-180" : ""}`} />
                            </button>

                            {shopDropOpen && (
                                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                                    {/* Search input */}
                                    <div className="p-2 border-b border-gray-100">
                                        <div className="relative">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                autoFocus
                                                type="text"
                                                placeholder="Search shops..."
                                                value={shopSearch}
                                                onChange={e => setShopSearch(e.target.value)}
                                                className="w-full pl-8 pr-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Shop list */}
                                    <div className="max-h-56 overflow-y-auto">
                                        {filteredShops.length === 0 ? (
                                            <div className="px-4 py-3 text-sm text-gray-400 text-center">No shops found</div>
                                        ) : (
                                            filteredShops.map(s => (
                                                <button
                                                    key={s.s_id}
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedShop(s);
                                                        setSearchResults([]);
                                                        setShopDropOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors flex items-center gap-2 ${
                                                        selectedShop?.s_id === s.s_id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                                                    }`}
                                                >
                                                    <Store className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                                                    <span className="flex flex-col truncate">
                                                        <span className="truncate">{s.s_title}</span>
                                                        {(s?.user?.phone || s?.s_user_phone) && (
                                                            <span className="text-xs text-gray-400">{s?.user?.phone || s?.s_user_phone}</span>
                                                        )}
                                                    </span>
                                                </button>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Non-admin: just show the shop name */
                        <div className="flex items-center gap-2 bg-blue-800 border border-blue-600 rounded-lg px-3 py-1.5">
                            <Store className="w-4 h-4 text-blue-300" />
                            <span className="text-sm font-medium text-white">
                                {selectedShop?.s_title ?? "No Shop"}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-2 bg-blue-800 rounded-lg px-3 py-1.5 border border-blue-600">
                        <User className="w-4 h-4 text-blue-300" />
                        <span className="text-sm">{parsedUser?.name ?? "Cashier"}</span>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="flex flex-1 overflow-hidden gap-0 min-h-0">
                {/* ── Left: Product panel ──────────────────────────────────── */}
                <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 border-r border-gray-200">
                    {/* Search bar */}
                    <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search products or vehicles by name, code..."
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Type filter */}
                            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                                {PRODUCT_TYPES.map((t) => (
                                    <button
                                        key={t.value}
                                        onClick={() => setProductType(t.value)}
                                        className={`px-3 py-2 text-sm font-medium transition flex items-center gap-1.5 ${
                                            productType === t.value
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-gray-600 hover:bg-gray-100"
                                        }`}
                                    >
                                        {t.icon && <t.icon className="w-3.5 h-3.5" />}
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Product grid */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {!selectedShop ? (
                            <EmptyState icon={Store} message="Select a shop to browse products" />
                        ) : searching ? (
                            <div className="flex items-center justify-center h-40">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                <span className="ml-2 text-gray-500 text-sm">Searching...</span>
                            </div>
                        ) : searchResults.length === 0 ? (
                            <EmptyState
                                icon={AlertCircle}
                                message={searchQuery ? `No results for "${searchQuery}"` : "Type to search for products"}
                            />
                        ) : (
                            <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                                {searchResults.map((product) => (
                                    <ProductCard
                                        key={`${product.type}-${product.id}`}
                                        product={product}
                                        onAdd={addToCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right: Cart + Payment ──────────────────────────────────── */}
                <div className="w-[400px] xl:w-[440px] flex flex-col bg-white shadow-lg overflow-hidden">
                    {/* Cart header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold text-gray-800">Cart</span>
                            {cartItems.length > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                                    {cartItems.reduce((s, i) => s + i.qty, 0)}
                                </span>
                            )}
                        </div>
                        {cartItems.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 text-xs font-medium transition"
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Clear
                            </button>
                        )}
                    </div>

                    {/* Customer info */}
                    <div className="px-4 py-2 border-b border-gray-100 bg-blue-50/50">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Customer name (optional)"
                                className="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Phone"
                                className="w-32 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                value={customerPhone}
                                onChange={(e) => setCustomerPhone(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Cart items */}
                    <div className="flex-1 overflow-y-auto">
                        {cartItems.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
                                <ShoppingCart className="w-12 h-12 opacity-20" />
                                <p className="text-sm">Cart is empty</p>
                                <p className="text-xs">Search and click products to add</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {cartItems.map((item) => (
                                    <CartRow
                                        key={`${item.type}-${item.id}`}
                                        item={item}
                                        onQtyChange={updateQty}
                                        onSetQty={setQty}
                                        onRemove={removeFromCart}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Totals + payment */}
                    <div className="border-t border-gray-200 bg-gray-50">
                        {/* Discount + VAT */}
                        <div className="px-4 py-3 space-y-2 border-b border-gray-200">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                                        <BadgePercent className="w-3 h-3" /> Discount (৳)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                        value={discountAmount}
                                        onChange={(e) => setDiscountAmount(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> VAT (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-400"
                                        value={vatPercent}
                                        onChange={(e) => setVatPercent(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Summary rows */}
                        <div className="px-4 py-3 space-y-1.5 border-b border-gray-200">
                            <SummaryRow label="Subtotal" value={subtotal} />
                            {vatAmount > 0 && <SummaryRow label={`VAT (${vatPercent}%)`} value={vatAmount} />}
                            {Number(discountAmount) > 0 && (
                                <SummaryRow label="Discount" value={-Number(discountAmount)} color="text-green-600" />
                            )}
                            <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                                <span className="font-bold text-gray-800">Total</span>
                                <span className="font-bold text-xl text-blue-700">৳{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Payment method */}
                        <div className="px-4 py-2 border-b border-gray-200">
                            <label className="text-xs text-gray-500 mb-1.5 block">Payment Method</label>
                            <div className="grid grid-cols-2 gap-1.5">
                                {PAYMENT_METHODS.map((m) => (
                                    <button
                                        key={m.value}
                                        onClick={() => setPaymentMethod(m.value)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition ${
                                            paymentMethod === m.value
                                                ? "border-blue-500 bg-blue-50 text-blue-700"
                                                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                        }`}
                                    >
                                        <span className="text-base">{m.icon}</span>
                                        {m.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Paid / Due */}
                        <div className="px-4 py-3 border-b border-gray-200">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 mb-1 block">Amount Paid (৳)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        className="w-full px-3 py-2 text-base font-semibold border-2 border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={paidAmount}
                                        onChange={(e) => setPaidAmount(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleQuickPay}
                                    className="px-3 py-2 bg-blue-100 text-blue-700 text-xs font-medium rounded-md hover:bg-blue-200 transition whitespace-nowrap"
                                >
                                    Exact
                                </button>
                            </div>
                            {dueAmount > 0 && (
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-orange-600 font-medium">Due Amount</span>
                                    <span className="text-orange-600 font-bold">৳{dueAmount.toFixed(2)}</span>
                                </div>
                            )}
                            {Number(paidAmount) > totalAmount && (
                                <div className="mt-2 flex justify-between text-sm">
                                    <span className="text-green-600 font-medium">Change</span>
                                    <span className="text-green-600 font-bold">৳{(Number(paidAmount) - totalAmount).toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        {/* Complete Sale button */}
                        <div className="px-4 py-3">
                            <button
                                onClick={completeSale}
                                disabled={submitting || cartItems.length === 0 || !selectedShop}
                                className="w-full py-3.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-base rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <CreditCard className="w-5 h-5" />
                                        Complete Sale — ৳{totalAmount.toFixed(2)}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Receipt modal */}
            {showReceipt && completedSale && (
                <PosReceipt
                    sale={completedSale}
                    onClose={() => {
                        setShowReceipt(false);
                        setCompletedSale(null);
                    }}
                />
            )}
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProductCard({ product, onAdd }) {
    const isVehicle = product.type === "vehicle";
    return (
        <button
            onClick={() => onAdd(product)}
            className="bg-white rounded-xl border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all text-left group overflow-hidden"
        >
            <div className="relative bg-gray-100 h-28 overflow-hidden">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        {isVehicle ? (
                            <Car className="w-10 h-10 text-gray-300" />
                        ) : (
                            <Package className="w-10 h-10 text-gray-300" />
                        )}
                    </div>
                )}
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isVehicle ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                    {isVehicle ? "Vehicle" : "Product"}
                </span>
            </div>
            <div className="p-2.5">
                <p className="text-xs font-semibold text-gray-800 truncate leading-snug">{product.name}</p>
                {product.code && (
                    <p className="text-[10px] text-gray-400 mt-0.5">#{product.code}</p>
                )}
                <p className="text-sm font-bold text-blue-700 mt-1">৳{Number(product.price).toLocaleString()}</p>
            </div>
        </button>
    );
}

function CartRow({ item, onQtyChange, onSetQty, onRemove }) {
    const isVehicle = item.type === "vehicle";
    const lineTotal = item.unitPrice * item.qty;

    return (
        <div className="flex gap-2 px-3 py-2.5 hover:bg-gray-50 transition">
            {/* Icon */}
            <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center ${isVehicle ? "bg-purple-100" : "bg-blue-100"}`}>
                {isVehicle ? (
                    <Car className="w-4 h-4 text-purple-600" />
                ) : (
                    <Package className="w-4 h-4 text-blue-600" />
                )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400">৳{Number(item.unitPrice).toLocaleString()} ea.</p>
            </div>

            {/* Qty controls */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onQtyChange(item.id, item.type, -1)}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                    <Minus className="w-3 h-3" />
                </button>
                <input
                    type="number"
                    min="1"
                    className="w-10 h-6 text-center text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={item.qty}
                    onChange={(e) => onSetQty(item.id, item.type, e.target.value)}
                />
                <button
                    onClick={() => onQtyChange(item.id, item.type, 1)}
                    className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition"
                >
                    <Plus className="w-3 h-3" />
                </button>
            </div>

            {/* Line total */}
            <div className="text-right flex-shrink-0 w-20">
                <p className="text-sm font-semibold text-gray-800">৳{lineTotal.toLocaleString()}</p>
                <button
                    onClick={() => onRemove(item.id, item.type)}
                    className="text-red-400 hover:text-red-600 transition mt-0.5"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

function SummaryRow({ label, value, color = "text-gray-600" }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">{label}</span>
            <span className={`font-medium ${color}`}>
                {value < 0 ? "-" : ""}৳{Math.abs(value).toFixed(2)}
            </span>
        </div>
    );
}

function EmptyState({ icon: Icon, message }) {
    return (
        <div className="flex flex-col items-center justify-center h-60 text-gray-400 gap-3">
            <Icon className="w-12 h-12 opacity-20" />
            <p className="text-sm text-center">{message}</p>
        </div>
    );
}
