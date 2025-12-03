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
import PackageService from '@/services/PackageService'
import FeatureSpecificationService from '@/services/FeatureSpecificationService';

// Yup Validation Schema
const schema = yup.object().shape({
    fs_title: yup.string().required("Title is required")
});


const FeatureSpecificationAddModal = ({ open, setOpen, featureId, getFeatureSpecification }) => {

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {


        const FormData = {
            fs_feature_id: featureId,
            fs_title: data.fs_title,
            fs_status: data.fs_status,
        }

        //  console.log("FormData", FormData);
        const res = await FeatureSpecificationService.Commands.storeFeatureSpecification(FormData);

        if (res?.status === 'success') {
            setOpen(false);
            toast.success("Feature Specification created successfully");
            getFeatureSpecification();
            reset(); // clear form
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
                    <DialogTitle>Add Feature Specification</DialogTitle>
                </DialogHeader>

                <hr />

                {/* Add your form fields here */}
                <form onSubmit={handleSubmit(onSubmit)}>
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

                    <div className="flex flex-col gap-1 w-full mt-3">
                        <label className="text-base font-medium" htmlFor="fs_status">
                            Status
                        </label>
                        <select
                            id="fs_status"
                            className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                            {...register("fs_status")}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        {errors.fs_status && (
                            <p className="text-red-500 text-sm">{errors.fs_status.message}</p>
                        )}
                    </div>


                    <div className="flex justify-end gap-2 mt-4">

                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : "ADD"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default FeatureSpecificationAddModal;