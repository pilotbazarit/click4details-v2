'use client';

import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import OrderService from '@/services/OrderService';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    ChevronLeft,
    ChevronRight,
    Clock3,
    Package,
    ReceiptText,
    ShoppingBag,
    Truck,
} from 'lucide-react';

const statusConfig = {
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    canceled: 'bg-red-50 text-red-700 border-red-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200',
};

const parseMaybeJson = (value, fallback = null) => {
    if (!value) return fallback;
    if (typeof value !== 'string') return value;

    try {
        return JSON.parse(value);
    } catch {
        return fallback;
    }
};

const getMediaUrl = (media) => {
    if (!media) return '';
    const parsedMedia = parseMaybeJson(media, media);

    if (typeof parsedMedia === 'string') return parsedMedia;
    if (Array.isArray(parsedMedia)) return getMediaUrl(parsedMedia[0]);

    return parsedMedia?.secure_url || parsedMedia?.url || '';
};

const money = (amount, currency = 'TK.') => {
    const numericAmount = Number(amount) || 0;
    const currencyLabel = !currency || currency === 'BDT' ? 'TK.' : currency;

    return `${currencyLabel} ${numericAmount.toLocaleString('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const formatOrderDate = (dateValue) => {
    if (!dateValue) return 'Not available';

    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Not available';

    return date.toLocaleDateString('en-BD', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const getOrderItems = (order) => Array.isArray(order?.items) ? order.items : [];

const getOrderTotal = (order) => {
    const directTotal = Number(order?.o_total_amount);
    if (Number.isFinite(directTotal) && directTotal > 0) return directTotal;

    return getOrderItems(order).reduce((sum, item) => {
        const itemTotal = Number(item?.oi_total_price);
        if (Number.isFinite(itemTotal)) return sum + itemTotal;
        return sum + (Number(item?.oi_unit_price) || 0) * (Number(item?.oi_quantity) || 0);
    }, 0);
};

const OrderSkeleton = () => (
    <div className="animate-pulse rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
            <div className="space-y-3">
                <div className="h-5 w-36 rounded bg-gray-200" />
                <div className="h-4 w-48 rounded bg-gray-100" />
            </div>
            <div className="h-8 w-28 rounded-full bg-gray-100" />
        </div>
        <div className="space-y-4 pt-5">
            {[1, 2].map((item) => (
                <div key={item} className="flex gap-4">
                    <div className="h-20 w-20 rounded-md bg-gray-100" />
                    <div className="flex-1 space-y-3">
                        <div className="h-4 w-2/3 rounded bg-gray-200" />
                        <div className="h-4 w-1/3 rounded bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const OrderLine = ({ product, currency }) => {
    const variantSnapshot = parseMaybeJson(product?.oi_variant_snapshot, {});
    const variantTitle = variantSnapshot?.title || variantSnapshot?.option_summary || '';
    const variantSku = variantSnapshot?.sku || '';
    const imageSrc = getMediaUrl(variantSnapshot?.image) || getMediaUrl(product?.oi_product_details?.image);
    const quantity = Number(product?.oi_quantity) || 0;
    const unitPrice = Number(product?.oi_unit_price) || 0;
    const totalPrice = Number(product?.oi_total_price) || unitPrice * quantity;

    return (
        <div className="grid gap-4 py-4 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:items-center">
            <div className="h-20 w-20 overflow-hidden rounded-md border border-gray-100 bg-gray-50">
                {imageSrc ? (
                    <Image
                        src={imageSrc}
                        alt={product?.oi_product_details?.name || 'Product'}
                        width={160}
                        height={160}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Package className="h-6 w-6 text-gray-300" />
                    </div>
                )}
            </div>

            <div className="min-w-0">
                <p className="font-semibold text-gray-950">
                    {product?.oi_product_details?.name || 'Product'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    {variantTitle && (
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                            {variantTitle}
                        </span>
                    )}
                    {variantSku && (
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                            SKU {variantSku}
                        </span>
                    )}
                    <span className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600">
                        Qty {quantity}
                    </span>
                </div>
            </div>

            <div className="text-left sm:text-right">
                <p className="text-sm text-gray-500">{money(unitPrice, currency)} each</p>
                <p className="mt-1 text-lg font-semibold text-gray-950">{money(totalPrice, currency)}</p>
            </div>
        </div>
    );
};

const MyOrdersPage = () => {
    const { user, currency } = useAppContext();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const perPage = 10;

    useEffect(() => {
        fetchOrders();
    }, [user, currentPage]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const parsedUser = parseMaybeJson(user, user);
            const userId = parsedUser?.id;

            if (!userId) {
                setError('Please login first to view your orders.');
                setOrders([]);
                setLoading(false);
                return;
            }

            const response = await OrderService.Queries.getOrderList({
                _page: currentPage,
                _user_id: userId,
                _perPage: perPage,
                _orderBy: 'o_created_at',
                _order: 'DESC',
            });

            if (response?.status === 'success') {
                setOrders(response?.data?.data || []);
                setTotalPages(response?.data?.last_page || 1);
            } else {
                setOrders([]);
                setTotalPages(1);
            }
        } catch (err) {
            console.log('Failed to fetch orders:', err);
            setError('Failed to load orders. Please try again later.');
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />

            <main className="min-h-screen bg-[#f6f7f9]">
                <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <Link
                                href="/all-products"
                                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-950"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Continue shopping
                            </Link>
                            <h1 className="text-3xl font-semibold text-gray-950 md:text-4xl">
                                My Orders
                            </h1>
                            <p className="mt-2 text-sm text-gray-500">
                                Recent purchases and fulfillment status.
                            </p>
                        </div>

                        <div className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
                            {orders.length} order{orders.length === 1 ? '' : 's'}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-5">
                            {[1, 2, 3].map((item) => (
                                <OrderSkeleton key={item} />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <section className="rounded-lg border border-gray-200 bg-white px-6 py-16 text-center shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                <ShoppingBag className="h-7 w-7 text-gray-500" />
                            </div>
                            <h2 className="mt-5 text-xl font-semibold text-gray-950">No orders found</h2>
                            <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                                Your placed orders will appear here.
                            </p>
                            <Link
                                href="/all-products"
                                className="mt-6 inline-flex items-center justify-center rounded-md bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                            >
                                Browse products
                            </Link>
                        </section>
                    ) : (
                        <>
                            <div className="space-y-5">
                                {orders.map((order) => {
                                    const status = String(order?.o_status || 'pending').toLowerCase();
                                    const statusStyle = statusConfig[status] || 'bg-gray-50 text-gray-700 border-gray-200';
                                    const items = getOrderItems(order);
                                    const itemCount = items.reduce((sum, item) => sum + (Number(item?.oi_quantity) || 0), 0);
                                    const total = getOrderTotal(order);

                                    return (
                                        <article
                                            key={order?.o_id}
                                            className="rounded-lg border border-gray-200 bg-white shadow-sm transition hover:border-gray-300"
                                        >
                                            <header className="flex flex-col gap-4 border-b border-gray-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex h-11 w-11 flex-none items-center justify-center rounded-md bg-gray-950 text-white">
                                                        <ReceiptText className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h2 className="text-lg font-semibold text-gray-950">
                                                            Order #{order?.o_id}
                                                        </h2>
                                                        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                            <span className="inline-flex items-center gap-1.5">
                                                                <Clock3 className="h-4 w-4" />
                                                                {formatOrderDate(order?.o_created_at || order?.created_at)}
                                                            </span>
                                                            <span>{itemCount} item{itemCount === 1 ? '' : 's'}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase ${statusStyle}`}>
                                                        {order?.o_status || 'pending'}
                                                    </span>
                                                    <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-2 text-right">
                                                        <p className="text-xs uppercase text-gray-400">Total</p>
                                                        <p className="font-semibold text-gray-950">{money(total, currency)}</p>
                                                    </div>
                                                </div>
                                            </header>

                                            <div className="divide-y divide-gray-100 px-5">
                                                {items.map((product) => (
                                                    <OrderLine
                                                        key={product?.oi_id}
                                                        product={product}
                                                        currency={currency}
                                                    />
                                                ))}
                                            </div>

                                            <footer className="grid gap-3 rounded-b-lg border-t border-gray-100 bg-gray-50 p-5 text-sm text-gray-600 sm:grid-cols-3">
                                                <div className="flex items-center gap-2">
                                                    <Truck className="h-4 w-4 text-gray-400" />
                                                    <span>Delivery: {order?.shipping_address?.a_area_name || order?.shipping_address?.a_district_name || 'Pending'}</span>
                                                </div>
                                                <div>Payment: {String(order?.o_payment_method || 'cash_on_delivery').replaceAll('_', ' ')}</div>
                                                <div className="sm:text-right">Payment status: {order?.o_payment_status || 'unpaid'}</div>
                                            </footer>
                                        </article>
                                    );
                                })}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-8 flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </button>
                                    <span className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    );
};

export default MyOrdersPage;
