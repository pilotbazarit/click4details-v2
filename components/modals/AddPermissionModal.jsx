import React, { use, useEffect, useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import PermissionService from '@/services/PermissionService';

const schema = yup.object().shape({
    p_type: yup.string().required("Type is required"),
    p_model: yup.string().required("Model is required"),
    p_name: yup.string().required("Name is required")
});

const AddPermissionModal = ({ open, setOpen, selectedItem, setPermissions }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {
        try {
            if (selectedItem && selectedItem.p_id) {
                console.log("data", data);
                // Update existing package
                const response = await PermissionService.Commands.updatePermission(selectedItem.p_id, {
                    ...data,
                    _method: 'PUT'
                });

                if (response.status === "success") {
                    setPermissions((prev) =>
                        prev.map((item) =>
                            item.p_id === selectedItem.p_id ? { ...item, ...data } : item
                        )
                    );
                    reset();
                    setOpen(false);
                    toast.success("Permission updated successfully!");
                }
            } else {
                // Create new package
                console.log("data", data);
                const response = await PermissionService.Commands.storePermission(data);

                if (response.status === "success") {
                    setPermissions((prev) => [...prev, response.data]);
                    setOpen(false);
                    reset();
                    toast.success("Permission added successfully!");
                }
            }
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
        }
    };

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset(); // Reset form when dialog closes
        }
    };

    useEffect(() => {
        if (selectedItem) {
            setValue("p_name", selectedItem.p_name);
            setValue("p_type", selectedItem.p_type);
            setValue("p_model", selectedItem.p_model);
            setValue("p_status", selectedItem.p_status);
        }
    }, [selectedItem]);


    const modelData = ['User', 'MasterDataType', 'MasterData', 'Package', 'Vehicle', 'FeatureSpecification', 'Permission', 'Role', 'Shop', 'UserRolePermission', 'UserProfile']

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{selectedItem ? "Edit Permission" : "Add Permission"}</DialogTitle>
                </DialogHeader>

                <hr />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {/* Brand Select */}

                        <div>
                            <Label htmlFor="p_name">Name</Label>
                            <Input
                                className="border-gray-400"
                                {...register("p_name")}
                                id="p_name"
                                placeholder="Enter name"
                                disabled={isSubmitting}
                            />
                            {errors.p_name && <p className="text-red-600 text-sm">{errors.p_name.message}</p>}
                        </div>

                       


                         {/* Model Select */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="p_model">
                                Model
                            </label>
                            <select
                                id="p_model"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("p_model")}
                            >
                                <option value="">Select Model</option>
                                {modelData.map((item, index) => (
                                    <option key={index} value={item} >{item}</option>
                                ))}
                            </select>
                            {errors.p_model && <p className="text-red-600 text-sm">{errors.p_model.message}</p>}
                        </div>


                          {/* Model Select */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="p_type">
                                Type
                            </label>
                            <select
                                id="p_type"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("p_type")}
                            >
                                <option value="">Select Type</option>
                                <option value="reserved" >Reserved</option>
                                <option value="system" >System</option>
                                <option value="user" >User</option>
                            </select>
                            {errors.p_type && <p className="text-red-600 text-sm">{errors.p_type.message}</p>}
                        </div>

                        {/* Status Select */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="p_status">
                                Status
                            </label>
                            <select
                                id="p_status"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("p_status")}
                            >
                                 <option value="active" >Active</option>
                                 <option value="inactive" >Inactive</option>
                            </select>
                            {errors.p_status && <p className="text-red-600 text-sm">{errors.p_status.message}</p>}
                        </div>

                        
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : (selectedItem ? "UPDATE" : "ADD")}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddPermissionModal;