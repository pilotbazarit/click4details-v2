import React, { useEffect, useState } from 'react'
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
import FeatureSpecificationService from '@/services/FeatureSpecificationService'

const schema = yup.object().shape({
    fs_feature_id: yup.string().required("Feature is required"),
    fs_title: yup.string().required("Title is required"),
    fs_status: yup.string().required("Status is required")
});

const FeatureSpecificationModal = ({ open, setOpen, features, getFeatureSpecification, initialData }) => {
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
            setValue('fs_feature_id', initialData.fs_feature_id);
            setValue('fs_title', initialData.fs_title);
            setValue('fs_status', initialData.fs_status);
        } else {
            reset({
                fs_feature_id: '',
                fs_title: '',
                vm_status: ''
            });
        }
    }, [initialData, reset, setValue]);


    const onSubmit = async (data) => {
        try {
            if (initialData) {
                // Update existing model
                await FeatureSpecificationService.Commands.updateFeatureSpecification(
                    initialData.fs_id,
                    {
                        ...data,
                        _method: 'PUT'
                    }
                );
                toast.success("Model updated successfully!");
            } else {
                // Create new model
                const response = await FeatureSpecificationService.Commands.storeFeatureSpecification(data);
                toast.success("Feature Specification added successfully!");
            }
            getFeatureSpecification();
            setOpen(false);
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
        }
    };


    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset(); // Reset form when dialog closes
        }
    };



    // chip
    const [chips, setChips] = useState([]);
    const [input, setInput] = useState('');

    const handleKeyDown = (e) => {
        if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
            e.preventDefault(); // prevent form submit or comma
            if (!chips.includes(input.trim())) {
                setChips([...chips, input.trim()]);
            }
            setInput('');
        }

        // Backspace to delete last chip
        if (e.key === 'Backspace' && !input && chips.length > 0) {
            setChips(chips.slice(0, -1));
        }
    };

    const removeChip = (index) => {
        setChips(chips.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Feature Specification" : "Add Feature Specification"}</DialogTitle>
                </DialogHeader>

                <hr />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="fs_feature_id">
                                Select Feature
                            </label>
                            <select
                                id="fs_feature_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("fs_feature_id")}
                            >
                                <option value="">Select Feature</option>
                                {
                                    features.length > 0 && features?.map((feature) => (
                                        <option key={feature.value} value={feature.value}>
                                            {feature.label}
                                        </option>
                                    ))
                                }
                            </select>
                            {errors.fs_feature_id && (
                                <p className="text-red-500 text-sm">{errors.fs_feature_id.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="fs_title">Title</Label>
                            <Input
                                id="fs_title"
                                className="border-gray-400"
                                {...register("fs_title")}
                                placeholder="Enter Title"
                            />
                            {errors.fs_title && (
                                <p className="text-red-500 text-sm">{errors.fs_title.message}</p>
                            )}
                        </div>

                        {/* <div>
                            <Label htmlFor="fs_title">Title</Label>
                        
                            <div className="flex flex-wrap items-center gap-2 border border-gray-300 rounded px-2 py-1">
                                {chips.map((chip, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-full"
                                    >
                                        {chip}
                                        <button
                                            onClick={() => removeChip(index)}
                                            className="ml-1 text-blue-600 hover:text-blue-800"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                ))}
                                
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Type and press enter"
                                    className="border-gray-200 focus:outline-none py-1"
                                />
                            </div>
                        </div> */}

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="fs_status">
                                Status
                            </label>
                            <select
                                id="fs_status"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("fs_status")}
                            >
                                <option value="">Select Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            {errors.fs_status && (
                                <p className="text-red-500 text-sm">{errors.fs_status.message}</p>
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

export default FeatureSpecificationModal;