import React, { useEffect, useState } from 'react'
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
import VehicleModelService from '@/services/VehicleModelService'
import PackageService from '@/services/PackageService';

const schema = yup.object().shape({
    p_brand_id: yup.string().required("Brand is required"),
    p_model_id: yup.string().required("Model is required"),
    p_name: yup.string().required("Name is required")
});

const PackageModal = ({ open, setOpen, brands, getPackages, initialData }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
        setValue,
        getValues
    } = useForm({
        resolver: yupResolver(schema),
    });

    const [models, setModels] = useState([]);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const selectedBrandId = watch('p_brand_id');


    // Fetch models when brand changes or when editing
    useEffect(() => {
        const fetchModels = async () => {
            if (selectedBrandId) {
                setIsLoadingModels(true);
                try {
                    const response = await VehicleModelService.Queries.getModelsByBrand({
                        _brand_id: selectedBrandId,
                        _page: 1,
                        _perPage: 1000,
                    });
                    setModels(response?.data?.data || []);
                    // If editing and models are loaded, ensure the model is selected
                    if (initialData && initialData.p_brand_id === selectedBrandId) {
                        setValue('p_model_id', initialData.p_model_id);
                    }
                } catch (error) {
                    toast.error("Failed to load models");
                } finally {
                    setIsLoadingModels(false);
                }
            } else {
                setModels([]);
            }
        };

        fetchModels();
    }, [selectedBrandId, initialData, setValue]);

    // Set initial form values
    useEffect(() => {
        if (initialData) {
            setValue('p_brand_id', initialData.p_brand_id);
            setValue('p_model_id', initialData.p_model_id);
            setValue('p_name', initialData.p_name);

            // Immediately fetch models for the initial brand if editing
            if (initialData.p_brand_id) {
                const fetchInitialModels = async () => {
                    setIsLoadingModels(true);
                    try {
                        const res = await VehicleModelService.Queries.getModelsByBrand(initialData.p_brand_id);
                        setModels(res?.data?.data || []);
                    } catch (error) {
                        toast.error("Failed to load models");
                    } finally {
                        setIsLoadingModels(false);
                    }
                };
                fetchInitialModels();
            }
        } else {
            reset({
                p_brand_id: '',
                p_model_id: '',
                p_name: ''
            });
            setModels([]);
        }
    }, [initialData, reset, setValue]);

    const onSubmit = async (data) => {
        try {
            if (initialData) {
                // Update existing package
                await PackageService.Commands.updatePackage(initialData.p_id, {
                    ...data,
                    _method: 'PUT'
                });
                toast.success("Package updated successfully!");
            } else {
                // Create new package
                await PackageService.Commands.storePackage(data);
                toast.success("Package added successfully!");
            }
            getPackages();
            setOpen(false);
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
                    <DialogTitle>{initialData ? "Edit Package" : "Add Package"}</DialogTitle>
                </DialogHeader>

                <hr />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {/* Brand Select */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="p_brand_id">
                                Select Brand
                            </label>
                            <select
                                id="p_brand_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("p_brand_id")}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Brand</option>
                                {brands?.map((brand) => (
                                    <option key={brand.value} value={brand.value}>
                                        {brand.label}
                                    </option>
                                ))}
                            </select>
                            {errors.p_brand_id && <p className="text-red-600 text-sm">{errors.p_brand_id.message}</p>}
                        </div>

                        {/* Model Select */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="p_model_id">
                                Select Model
                            </label>
                            <select
                                id="p_model_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("p_model_id")}
                                disabled={isLoadingModels || isSubmitting || !selectedBrandId}
                            >
                                <option value="">{isLoadingModels ? "Loading models..." : "Select model"}</option>
                                {models?.map((model) => (
                                    <option key={model.vm_id} value={model.vm_id}>
                                        {model.vm_name}
                                    </option>
                                ))}
                            </select>
                            {errors.p_model_id && <p className="text-red-600 text-sm">{errors.p_model_id.message}</p>}
                        </div>

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
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium disabled:opacity-50"
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

export default PackageModal;