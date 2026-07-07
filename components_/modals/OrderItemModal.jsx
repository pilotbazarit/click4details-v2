import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import OrderService from '@/services/OrderService';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const OrderItemModal = ({ open, setOpen, selectedItem, setOrders, setSelectedItem }) => {
    const items = selectedItem?.items || [];

    const [editingItem, setEditingItem] = useState(null);
    const [editValues, setEditValues] = useState({
        quantity: "",
        unitPrice: "",
        discountPrice: "",
    });
    const [savingEdit, setSavingEdit] = useState(false);

    useEffect(() => {
        if (!open) {
            setEditingItem(null);
            setEditValues({
                quantity: "",
                unitPrice: "",
                discountPrice: "",
            });
        }
    }, [open]);

    const resetEditState = () => {
        setEditingItem(null);
        setEditValues({
            quantity: "",
            unitPrice: "",
            discountPrice: "",
        });
    };

    const handleEditClick = (item) => {
        setEditingItem(item);
        setEditValues({
            quantity: item?.oi_quantity?.toString() || "",
            unitPrice: item?.oi_unit_price ? parseFloat(item.oi_unit_price).toFixed(2) : "",
            discountPrice: item?.oi_discount_price
                ? parseFloat(item.oi_discount_price).toFixed(2)
                : "",
        });
    };

    const refreshOrderDetails = async (orderId) => {
        if (!orderId) return;
        try {
            const response = await OrderService.Queries.getOrderDetails(orderId);
            if (response?.status === "success") {
                const updatedOrder = response?.data?.data || response?.data;
                if (updatedOrder) {
                    setSelectedItem(updatedOrder);
                    setOrders((prevOrders) => {
                        if (!prevOrders) return prevOrders;
                        return prevOrders.map((order) =>
                            order.o_id === updatedOrder.o_id ? { ...order, ...updatedOrder } : order
                        );
                    });
                }
            }
        } catch (error) {
            console.error("Failed to refresh order after edit:", error);
        }
    };

    const handleCancelEdit = () => {
        resetEditState();
    };


    const persistOrderItem = async (quantityToSend) => {
        setSavingEdit(true);
        try {
            const quantityChange = quantityToSend; // 1 or -1

            const newQuantity = editingItem.oi_quantity + quantityChange;
            const finalQuantity = Math.max(newQuantity, 0);

            const orderItemData = {
                oi_order_id: editingItem?.oi_order_id,
                oi_product_id: editingItem?.oi_product_id,
                oi_type_id: editingItem?.oi_type_id,
                oi_quantity: finalQuantity, // ✅ final quantity
                oi_unit_price: editingItem.oi_unit_price,
                oi_discount_price: 0,
                oi_total_price: finalQuantity * editingItem.oi_unit_price, // ✅ recalculated
                oi_product_price_id: editingItem?.oi_product_price_id,
            };

            // console.log("orderItemData", orderItemData);

            const response = await OrderService.Commands.addOrderItem(orderItemData);

            if (response?.status === "success") {
                await refreshOrderDetails(selectedItem?.o_id);
                return true;
            } else {
                toast.error(response?.message || "Failed to update order item.");
                return false;
            }
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
            return false;
        } finally {
            setSavingEdit(false);
        }
    };


    const persistOrderItemOld = async (quantityToSend) => {
        setSavingEdit(true);
        try {
            // console.log("editingItem", editingItem);
            const orderItemData = {
                oi_order_id: editingItem?.oi_order_id,
                oi_product_id: editingItem?.oi_product_id,
                oi_type_id: editingItem?.oi_type_id,
                oi_quantity: quantityToSend,
                oi_unit_price: editingItem.oi_unit_price,
                oi_discount_price: 0,
                oi_total_price: editingItem.oi_total_price,
                oi_product_price_id: editingItem?.oi_product_price_id,
            };

            // console.log("orderItemData 104", orderItemData);

            const response = await OrderService.Commands.addOrderItem(orderItemData);

            if (response?.status === "success") {
                await refreshOrderDetails(selectedItem?.o_id);
                return true;
            } else {
                toast.error(response?.message || "Failed to update order item.");
                return false;
            }
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
            return false;
        } finally {
            setSavingEdit(false);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingItem) return;

        if (!editValues.quantity || Number(editValues.quantity) <= 0) {
            toast.error("Quantity must be greater than zero.");
            return;
        }

        const ok = await persistOrderItem(Number(editValues.quantity));
        if (ok) {
            resetEditState();
            toast.success("Order item updated.");
        }
    };

    const handleAdjustQuantity = async (delta) => {
        if (!editingItem) return;

        // console.log("145====", delta);

        const current = Number(editValues.quantity || editingItem?.oi_quantity || 1);
        const nextQty = Math.max(1, current + delta);
        if (nextQty === current) return;

        setEditValues((prev) => ({ ...prev, quantity: nextQty.toString() }));
        const ok = await persistOrderItem(delta);
        if (!ok) {
            // revert on failure
            setEditValues((prev) => ({ ...prev, quantity: current.toString() }));
        } else {
            toast.success(`Quantity ${delta > 0 ? "increased" : "decreased"}.`);
        }
    };

    const handleDelete = async (id) => {

        const result = await Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
            customClass: {
                container: 'swal2-container-high-z',
                popup: 'swal2-popup-high-z',
                actions: 'swal2-actions-visible'
            }
        });

        if (result.isConfirmed) {
            try {
                const response = await OrderService.Commands.deleteOrderItem({
                    oi_id: id
                });


                if (response.status === "success") {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Order Item Deleted Successfully!",
                        icon: "success"
                    });

                    // Update selected item - remove the deleted item
                    setSelectedItem((prevSelectedItem) => {
                        if (!prevSelectedItem || !prevSelectedItem.items) {
                            return prevSelectedItem;
                        }
                        return {
                            ...prevSelectedItem,
                            items: prevSelectedItem.items.filter((item) => item.oi_id !== id),
                        };
                    });

                    // Update orders list - remove the deleted item from the current order
                    setOrders((prevOrders) => {
                        if (!prevOrders) return prevOrders;
                        return prevOrders.map((order) =>
                            order.o_id === selectedItem?.o_id
                                ? { ...order, items: order.items.filter((item) => item.oi_id !== id) }
                                : order
                        );
                    });

                    if (editingItem?.oi_id === id) {
                        resetEditState();
                    }

                    // If no items left, close the modal
                    if ((selectedItem?.items?.length || 0) <= 1) {
                        setOpen(false);
                    }
                }

            } catch (error) {
                if (error.errors) {
                    Object.values(error.errors).forEach((e) => toast.error(e[0]));
                } else {
                    toast.error(error.message || "Something went wrong");
                }
            }
        }
    };

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">
                            Order Items - Order #{selectedItem?.o_id}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="mt-4">
                        {items.length > 0 ? (
                            <div className="overflow-x-auto rounded-md border border-gray-300">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-300">
                                            <TableHead className="border-r border-gray-300">SL</TableHead>
                                            <TableHead className="border-r border-gray-300">Product</TableHead>
                                            {/* <TableHead className="border-r border-gray-300">Type ID</TableHead> */}
                                            <TableHead className="border-r border-gray-300">Quantity</TableHead>
                                            <TableHead className="border-r border-gray-300">Unit Price</TableHead>
                                            <TableHead className="border-r border-gray-300">Discount Price</TableHead>
                                            <TableHead className="border-r border-gray-300">Total Price</TableHead>
                                            <TableHead className="border-r border-gray-300">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={item.oi_id || index} className="border-b border-gray-200">
                                                <TableCell className="border-r border-gray-200 font-medium">
                                                    {index + 1}
                                                </TableCell>


                                                <TableCell className="border-r border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        {item?.oi_product_details?.image && (
                                                            <div className="relative w-16 h-16 flex-shrink-0">
                                                                <Image
                                                                    src={item.oi_product_details.image}
                                                                    alt={item.oi_product_details.name || 'Product'}
                                                                    fill
                                                                    className="object-cover rounded"
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-gray-900">
                                                                {item?.oi_product_details?.name || 'N/A'}
                                                            </span>
                                                            <span className="text-sm text-gray-500">
                                                                Product ID: {item?.oi_product_id}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                <TableCell className="border-r border-gray-200 font-medium">
                                                    {item?.oi_quantity} {item?.product_price?.unit?.md_title}
                                                </TableCell>

                                                <TableCell className="border-r border-gray-200">
                                                    ৳{parseFloat(item?.oi_unit_price).toFixed(2)}
                                                </TableCell>

                                                <TableCell className="border-r border-gray-200">
                                                    ৳{parseFloat(item?.oi_discount_price).toFixed(2)}
                                                </TableCell>

                                                <TableCell className="border-r border-gray-200 font-semibold text-green-600">
                                                    ৳{parseFloat(item?.oi_total_price).toFixed(2)}
                                                </TableCell>



                                                <TableCell className="p-3 border-r border-gray-200 flex items-center gap-2">
                                                    {/* <button
                                                    onClick={() => handleShow(item)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    aria-label="View Shop"
                                                >
                                                    <Eye size={18} />
                                                </button> */}

                                                    <button
                                                        onClick={() => handleEditClick(item)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        aria-label="Edit Order Item"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(item?.oi_id)}
                                                        className="text-red-600 hover:text-red-800"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </TableCell>

                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>

                                {/* Summary Section */}
                                <div className="bg-gray-50 p-4 border-t border-gray-300">
                                    <div className="flex justify-end">
                                        <div className="w-64">
                                            <div className="flex justify-between py-2 border-b border-gray-300">
                                                <span className="text-gray-700">Total Items:</span>
                                                <span className="font-semibold">{items.length}</span>
                                            </div>
                                            <div className="flex justify-between py-2 border-b border-gray-300">
                                                <span className="text-gray-700">Total Quantity:</span>
                                                <span className="font-semibold">
                                                    {items.reduce((sum, item) => sum + parseInt(item.oi_quantity), 0)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-2">
                                                <span className="text-gray-900 font-bold">Grand Total:</span>
                                                <span className="font-bold text-green-600 text-lg">
                                                    ৳{items.reduce((sum, item) => sum + parseFloat(item.oi_total_price), 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No items found for this order.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
            {editingItem && (
                <Dialog open={!!editingItem} onOpenChange={(isOpen) => !isOpen && resetEditState()}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-semibold">
                                Edit Order Item
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold text-gray-900">
                                {editingItem?.oi_product_details?.name || "Product"}
                            </p>
                            <p className="text-xs text-gray-500">
                                Product ID: {editingItem?.oi_product_id}
                            </p>
                        </div>

                        <div className="mt-4 grid gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Quantity</label>
                                <div className="mt-1 flex items-center gap-3">
                                    <div className="inline-flex items-center overflow-hidden rounded border border-gray-300">
                                        <button
                                            type="button"
                                            onClick={() => handleAdjustQuantity(-1)}
                                            disabled={savingEdit || Number(editValues.quantity || 1) <= 1}
                                            className="px-3 py-2 text-lg leading-none text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            –
                                        </button>
                                        <div className="px-4 py-2 text-sm font-semibold text-gray-900 min-w-[48px] text-center">
                                            {editValues.quantity || 1}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => handleAdjustQuantity(1)}
                                            disabled={savingEdit}
                                            className="px-3 py-2 text-lg leading-none text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {editingItem?.product_price?.unit?.md_title || "pcs"}
                                    </span>
                                </div>
                            </div>

                            {/* <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label className="text-xs font-semibold text-gray-500">Unit Price</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editValues.unitPrice}
                                    onChange={(e) =>
                                        setEditValues((prev) => ({
                                            ...prev,
                                            unitPrice: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500">Discount Price</label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={editValues.discountPrice}
                                    onChange={(e) =>
                                        setEditValues((prev) => ({
                                            ...prev,
                                            discountPrice: e.target.value,
                                        }))
                                    }
                                    className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div> */}
                        </div>

                        {/* <div className="mt-6 flex items-center justify-end gap-2">
                        <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={savingEdit}
                            className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            {savingEdit ? "Saving..." : "Save changes"}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-gray-500"
                        >
                            Cancel
                        </button>
                    </div> */}
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}

export default OrderItemModal
