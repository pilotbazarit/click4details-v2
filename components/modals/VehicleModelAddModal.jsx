import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"


import { get, set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import StoreService from '@/services/ShopService'
import MasterDataService from '@/services/MasterDataService'
import constData from "@/lib/constant";
import VehicleModelService from '@/services/VehicleModelService'

// Yup Validation Schema
const schema = yup.object().shape({
    vm_name: yup.string().required("Name is required")
});


const VehicleModelAddModal = ({ open, setOpen, brandId, getModels }) => {
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
            vm_brand_id: brandId,
            vm_name: data.vm_name,
            vm_status: data.vm_status
        }

         console.log("FormData", FormData);

        const res =  await VehicleModelService.Commands.storeModel(FormData);

        if(res?.status === 'success'){
            setOpen(false);
            toast.success("Vehicle Model created successfully");
            getModels();
            reset(); // clear form
        }

        console.log('resss::', res);

        // try {
        //     //insert
        //     const response = await MasterDataService.Commands.storeMasterData({
        //         md_title: data.md_title,
        //         md_description: data.md_description,
        //         md_type_id: brandId,
        //     });

        //     if (response?.status === 'success') {
        //         setOpen(false);
        //         getBrands(); // Refresh the list after adding
        //         toast.success("Brand created successfully");
        //         reset(); // clear form
        //     }
        // } catch (error) {
        //     if (error.errors) {
        //         Object.values(error.errors).forEach((e) => toast.error(e[0]));
        //     } else {
        //         console.log("Error::", error);
        //     }
        // }


    };




    useEffect(() => {
        console.log("load::")
        // getBrandId();
    }, []);





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
                    <DialogTitle>Add Model</DialogTitle>
                </DialogHeader>

                <hr />

                {/* Add your form fields here */}
                <form onSubmit={handleSubmit(onSubmit)}>
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
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        {errors.vm_status && (
                            <p className="text-red-500 text-sm">{errors.vm_status.message}</p>
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

export default VehicleModelAddModal;