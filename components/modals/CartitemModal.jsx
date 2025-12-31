import React from 'react'
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
import { Trash2 } from 'lucide-react';
import OrderService from '@/services/OrderService';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';

const CartitemModal = ({ open, setOpen, selectedItem, setOrders, setSelectedItem }) => {
    const items = selectedItem?.items || [];

    console.log("selectedItem====", selectedItem);

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
              setOrders((prevOrders) =>
                prevOrders.map((order) =>
                  order.o_id === selectedItem.o_id
                    ? { ...order, items: order.items.filter((item) => item.oi_id !== id) }
                    : order
                )
              );

              // If no items left, close the modal
              if (selectedItem.items.length <= 1) {
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
                                        {/* <TableHead className="border-r border-gray-300">Discount Price</TableHead> */}
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
                                                    {item?.ci_product_details?.image && (
                                                        <div className="relative w-16 h-16 flex-shrink-0">
                                                            <Image
                                                                src={item.ci_product_details.image}
                                                                alt={item.ci_product_details.name || 'Product'}
                                                                fill
                                                                className="object-cover rounded"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-gray-900">
                                                            {item?.ci_product_details?.name || 'N/A'}
                                                        </span>
                                                        <span className="text-sm text-gray-500">
                                                            Product ID: {item?.ci_product_id}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            <TableCell className="border-r border-gray-200 font-medium">
                                                {item?.ci_qty}
                                            </TableCell>

                                            <TableCell className="border-r border-gray-200">
                                                ৳{parseFloat(item?.ci_price).toFixed(2)}
                                            </TableCell>

                                            {/* <TableCell className="border-r border-gray-200">
                                                ৳{parseFloat(item?.oi_discount_price).toFixed(2)}
                                            </TableCell> */}

                                            <TableCell className="border-r border-gray-200 font-semibold text-green-600">
                                                ৳{parseFloat(item?.ci_subtotal).toFixed(2)}
                                            </TableCell>



                                            <TableCell className="">
                                                <button
                                                    onClick={() => handleDelete(item?.ci_id)}
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
                                                {items.reduce((sum, item) => sum + parseInt(item.ci_qty), 0)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2">
                                            <span className="text-gray-900 font-bold">Grand Total:</span>
                                            <span className="font-bold text-green-600 text-lg">
                                                ৳{items.reduce((sum, item) => sum + parseFloat(item.ci_subtotal), 0).toFixed(2)}
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
    )
}

export default CartitemModal;
