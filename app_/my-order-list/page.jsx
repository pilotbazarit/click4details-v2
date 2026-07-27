'use client';

import Navbar from '@/components/Navbar';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import OrderService from '@/services/OrderService';
import toast from 'react-hot-toast';
import _ from 'lodash';

const statusConfig = {
    'shipped': {
        style: 'bg-blue-100 text-blue-800'
    },
    'delivered': {
        style: 'bg-green-100 text-green-800'
    },
    'canceled': {
        style: 'bg-red-100 text-red-800'
    },
    'pending': {
        style: 'bg-yellow-100 text-yellow-800'
    }
};

const MyOrdersPage = () => {
    const { user } = useAppContext();
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

            // Parse user data to get user ID
            let userId = null;
            if (user) {
                try {
                    const parsedUser = typeof user === 'string' ? JSON.parse(user) : user;
                    userId = parsedUser?.id;
                } catch (e) {
                    console.log('Failed to parse user', e);
                }
            }

            if (!userId) {
                setError('User not authenticated. Please login first.');
                setLoading(false);
                return;
            }


            console.log("userId my order list 62", userId);


            // Fetch orders from API
            const response = await OrderService.Queries.getOrderList({
                _page: currentPage,
                _user_id: userId,
                _perPage: perPage,
                _orderBy: 'o_created_at',
                _order: 'DESC'
            });


            console.log("response my order list 69", response);
            if (response?.status === "success") {
                if (response?.data?.data) {
                    setOrders(response.data.data || []);
                    setTotalPages(response?.data?.last_page || 1);
                } else {
                    setOrders([]);
                }
            }


        } catch (err) {
            console.log('Failed to fetch orders:', err);
            setError('Failed to load orders. Please try again later.');
            toast.error('Failed to load orders');
        } finally {
            setLoading(false);
        }
    };


    console.log("orders my order list 94", orders);

    const OrderSkeleton = () => (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-pulse">
            <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between gap-4">
                    <div className="h-6 bg-gray-300 rounded w-32"></div>
                    <div className="h-6 bg-gray-300 rounded w-24"></div>
                </div>
            </div>
            <div className="p-4 sm:p-6">
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="flex items-start gap-4">
                            <div className="w-20 h-20 bg-gray-300 rounded-lg"></div>
                            <div className="flex-grow space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-32"></div>
                                <div className="h-4 bg-gray-300 rounded w-24"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <>
            <Navbar />

            <div className="bg-gray-50 min-h-screen">
                <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-6xl">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700">{error}</p>
                        </div>
                    )}

                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <OrderSkeleton key={i} />
                            ))}
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center bg-white p-12 rounded-lg shadow">
                            <h3 className="mt-2 text-xl font-medium text-gray-900">No orders found</h3>
                            <p className="mt-1 text-sm text-gray-500">You haven't placed any orders yet.</p>
                            <div className="mt-6">
                                <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    Continue Shopping
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-6">
                                {orders.map((order, index) => {
                                    const statusInfo = statusConfig[order.status?.toLowerCase()] || { style: 'bg-gray-100 text-gray-800' };
                                    return (
                                        <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300">
                                            <div className="p-4 sm:p-6 border-b border-gray-200">
                                                <div className="flex flex-wrap items-center justify-between gap-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className="font-bold text-lg text-gray-800">Order #{order.o_id}</div>
                                                        <span className={`inline-flex items-center gap-2 px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.style}`}>
                                                            {order.o_status}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-gray-500">Placed on <span className="font-medium text-gray-700">{new Date(order.o_created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
                                                </div>
                                            </div>

                                            <div className="p-4 sm:p-6">
                                                <div className="space-y-4">
                                                    {order.items && order.items.map(product => (
                                                        <div key={product.oi_id} className="flex items-start gap-4">
                                                            <div className="flex-shrink-0">
                                                                {product?.oi_product_details ? (
                                                                    <Image
                                                                        src={product?.oi_product_details?.image}
                                                                        alt={product?.oi_product_details?.name || 'Product'}
                                                                        width={80}
                                                                        height={80}
                                                                        className="rounded-lg border border-gray-200 object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-20 h-20 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                                                                        <span className="text-gray-400 text-sm">No Image</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-grow">
                                                                <p className="font-semibold text-gray-800">{product?.oi_product_details?.name}</p>
                                                                <p className="text-sm text-gray-500">Qty: {product.oi_quantity}</p>
                                                            </div>
                                                            <div className="text-right">
                                                                <p className="font-semibold text-gray-800">${parseFloat(product.oi_unit_price || 0).toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="p-4 sm:p-6 bg-gray-50 rounded-b-xl">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        {/* <Link href={`/my-orders/${order.id}`} className="font-medium text-indigo-600 hover:text-indigo-500">
                                    View Order Details
                                </Link> */}
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-500">Total</p>
                                                        <p className="text-xl font-bold text-gray-900">${parseFloat(order.oi_total_price || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex justify-center items-center gap-4 mt-8">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-gray-700">
                                        Page {currentPage} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default MyOrdersPage;