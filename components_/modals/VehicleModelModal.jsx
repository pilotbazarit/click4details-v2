import React, { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import VehicleModelService from '@/services/VehicleModelService'

const schema = yup.object().shape({
    vm_brand_id: yup.string().required("Brand is required"),
    vm_name: yup.string().required("Name is required"),
    vm_status: yup.string().required("Status is required")
});

//FeatureSpecification

const VehicleModelModal = ({ open, setOpen, brands, getModels, initialData }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue
    } = useForm({
        resolver: yupResolver(schema),
    });

    // Set form values when initialData changes
    useEffect(() => {
        if (initialData) {
            setValue('vm_brand_id', initialData.vm_brand_id);
            setValue('vm_name', initialData.vm_name);
            setValue('vm_status', initialData.vm_status);
        } else {
            reset({
                vm_brand_id: '',
                vm_name: '',
                vm_status: ''
            });
        }
    }, [initialData, reset, setValue]);

    const onSubmit = async (data) => {
        try {
            if (initialData) {
                // Update existing model
                await VehicleModelService.Commands.updateModel(
                    initialData.vm_id, 
                    {
                        ...data,
                        _method: 'PUT'
                    }
                );
                getModels();
                setOpen(false);
                toast.success("Model updated successfully!");
            } else {
                // Create new model
                await VehicleModelService.Commands.storeModel(data);
                getModels();
                setOpen(false);
                toast.success("Model added successfully!");
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

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Update Vehicle Model" : "Add Vehicle Model"}</DialogTitle>
                </DialogHeader>

                <hr />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="vm_brand_id">
                                Select Brand
                            </label>
                            <select
                                id="vm_brand_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("vm_brand_id")}
                            >
                                <option value="">Select Brand</option>
                                {
                                    brands.length > 0 && brands?.map((brand) => (
                                        <option key={brand.value} value={brand.value}>
                                            {brand.label}
                                        </option>
                                    ))
                                }
                            </select>
                            {errors.vm_brand_id && (
                                <p className="text-red-500 text-sm">{errors.vm_brand_id.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="vm_name">Name</Label>
                            <Input
                                id="vm_name"
                                className="border-gray-400"
                                {...register("vm_name")}
                                placeholder="Enter name"
                            />
                            {errors.vm_name && (
                                <p className="text-red-500 text-sm">{errors.vm_name.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="vm_status">
                                Status
                            </label>
                            <select
                                id="vm_status"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("vm_status")}
                            >
                                {/* <option value="">Select Status</option> */}
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            {errors.vm_status && (
                                <p className="text-red-500 text-sm">{errors.vm_status.message}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : (initialData ? "UPDATE" : "ADD")}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default VehicleModelModal;