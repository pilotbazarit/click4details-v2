"use client";

import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ContactCustomerService from "@/services/ContactCustomerService";
import CustomerService from "@/services/CustomerService";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const schema = yup.object({
  cci_customer_id: yup.string().nullable(),
  cci_name: yup.string().trim().required("Name is required"),
  cci_phone: yup.string().trim().required("Phone is required"),
  cci_address: yup.string().trim().required("Address is required"),
  cci_desc: yup.string().nullable(),
  cci_nid: yup.string().nullable(),
  cci_status: yup.string().required("Status is required"),
});

const DEFAULT_FORM_VALUES = {
  cci_customer_id: "",
  cci_name: "",
  cci_phone: "",
  cci_address: "",
  cci_desc: "",
  cci_nid: "",
  cci_status: "1",
};

const ContactCustomerModal = ({
  open,
  setOpen,
  selectedItem,
  userId,
  selectedUserLabel = "",
  onSuccess,
}) => {
  const isEditMode = Boolean(selectedItem?.id);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const customerOptions = useMemo(() => {
    return customers.map((customer) => ({
      value: String(customer?.id ?? ""),
      label: [customer?.name, customer?.mobile || customer?.email]
        .filter(Boolean)
        .join(" - "),
    }));
  }, [customers]);

  const fetchCustomers = async () => {
    try {
      setCustomersLoading(true);
      const response = await CustomerService.Queries.getCustomerList();
      const rows =
        response?.data?.data ??
        response?.data ??
        response?.items ??
        [];

      setCustomers(Array.isArray(rows) ? rows : []);
    } catch (error) {
      setCustomers([]);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to fetch customers"
      );
    } finally {
      setCustomersLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchCustomers();
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (selectedItem?.id) {
      reset({
        cci_customer_id: String(
          selectedItem.customerId ??
            selectedItem.cci_customer_id ??
            selectedItem.customer_id ??
            ""
        ),
        cci_name: selectedItem.name || "",
        cci_phone: selectedItem.phone || "",
        cci_address: selectedItem.address || "",
        cci_desc: selectedItem.description || "",
        cci_nid: selectedItem.nid || selectedItem.cci_nid || "",
        cci_status: selectedItem.statusValue || "1",
      });
      return;
    }

    reset(DEFAULT_FORM_VALUES);
  }, [open, reset, selectedItem]);

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);

    if (!isOpen) {
      reset(DEFAULT_FORM_VALUES);
    }
  };

  const handleError = (error) => {
    if (error?.errors) {
      Object.values(error.errors).forEach((messages) => {
        if (Array.isArray(messages) && messages[0]) {
          toast.error(messages[0]);
        }
      });
      return;
    }

    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
    );
  };

  const onSubmit = async (data) => {
    // if (!userId) {
    //   toast.error("User is required");
    //   return;
    // }

    try {
      const payload = {
        ...data,
        p_cci_id: data.cci_customer_id || "",
      };

      if (userId) {
        payload.cci_user_id = userId;
      }

      const response = isEditMode
        ? await ContactCustomerService.Commands.updateContactCustomer(
            selectedItem.id,
            {
              ...payload,
              _method: "PUT",
            }
          )
        : await ContactCustomerService.Commands.storeContactCustomer(payload);

      // if (response?.status === "Customer contact info created successfully") {
        toast.success(
          isEditMode
            ? "Contact customer updated successfully!"
            : "Contact customer created successfully!"
        );
        reset(DEFAULT_FORM_VALUES);
        await Promise.resolve(onSuccess?.());
        return;
      // }

      // toast.error(
      //   response?.message ||
      //     response?.data?.message ||
      //     "Failed to save contact customer"
      // );
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Contact Customer" : "Add Contact Customer"}
          </DialogTitle>
          {/* <DialogDescription>
            {selectedUserLabel
              ? `Selected user: ${selectedUserLabel}`
              : "Create or update customer contact information."}
          </DialogDescription> */}
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* <div className="space-y-2">
            <Label htmlFor="cci_customer_id">Select Customer</Label>
            <select
              id="cci_customer_id"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("cci_customer_id")}
              disabled={isSubmitting || customersLoading}
            >
              <option value="">
                {customersLoading ? "Loading customers..." : "Select Customer"}
              </option>
              {customerOptions.map((customer) => (
                <option key={customer.value} value={customer.value}>
                  {customer.label}
                </option>
              ))}
            </select>
            {errors.cci_customer_id && (
              <p className="text-sm text-red-600">
                {errors.cci_customer_id.message}
              </p>
            )}
          </div> */}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cci_name">Reference Name</Label>
              <Input
                id="cci_name"
                placeholder="Enter reference name"
                {...register("cci_name")}
                disabled={isSubmitting}
              />
              {errors.cci_name && (
                <p className="text-sm text-red-600">{errors.cci_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cci_phone">Phone</Label>
              <Input
                id="cci_phone"
                placeholder="Enter phone"
                {...register("cci_phone")}
                disabled={isSubmitting}
              />
              {errors.cci_phone && (
                <p className="text-sm text-red-600">
                  {errors.cci_phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cci_address">Address</Label>
            <Textarea
              id="cci_address"
              placeholder="Enter address"
              className="min-h-[90px]"
              {...register("cci_address")}
              disabled={isSubmitting}
            />
            {errors.cci_address && (
              <p className="text-sm text-red-600">
                {errors.cci_address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cci_desc">Description</Label>
            <Textarea
              id="cci_desc"
              placeholder="Enter description"
              className="min-h-[100px]"
              {...register("cci_desc")}
              disabled={isSubmitting}
            />
            {errors.cci_desc && (
              <p className="text-sm text-red-600">{errors.cci_desc.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cci_nid">NID</Label>
            <Input
              id="cci_nid"
              placeholder="Enter NID"
              {...register("cci_nid")}
              disabled={isSubmitting}
            />
            {errors.cci_nid && (
              <p className="text-sm text-red-600">{errors.cci_nid.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cci_status">Status</Label>
            <select
              id="cci_status"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              {...register("cci_status")}
              disabled={isSubmitting}
            >
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
            {errors.cci_status && (
              <p className="text-sm text-red-600">
                {errors.cci_status.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Processing..."
                : isEditMode
                ? "Update"
                : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ContactCustomerModal;
