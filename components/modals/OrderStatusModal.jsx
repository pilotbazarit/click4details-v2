"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import OrderService from "@/services/OrderService";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "completed",
  "cancelled"
];

const OrderStatusModal = ({ open, setOpen, order, onStatusUpdate }) => {
  const [newStatus, setNewStatus] = useState(order?.o_status || "");
  const [loading, setLoading] = useState(false);

  console.log("order===========", order);

  const handleStatusChange = async () => {
    if (!newStatus || newStatus === order?.o_status) {
      toast.error("Please select a different status");
      return;
    }

    try {
      setLoading(true);
      const response = await OrderService.Commands.updateOrder(order.o_id, {
        o_status: newStatus,
        _method: "PUT",
      });

      if (response?.status === "success") {
        toast.success("Order status updated successfully!");
        onStatusUpdate(order.id, newStatus);
        setOpen(false);
      } else {
        toast.error(response?.data?.message || "Failed to update order status");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (isOpen) => {
    if (!isOpen) {
      setNewStatus(order?.o_status || "");
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Order Status</DialogTitle>
          <DialogDescription>
            Update the status for order <strong>{order?.o_id}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">
              Current Status: <span className="font-bold">{order?.o_status}</span>
            </label>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="status" className="text-sm font-medium text-gray-700">
              New Status
            </label>
            <select
              id="status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="flex h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a status</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleStatusChange}
            disabled={loading || !newStatus || newStatus === order?.o_status}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Updating..." : "Update Status"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderStatusModal;
