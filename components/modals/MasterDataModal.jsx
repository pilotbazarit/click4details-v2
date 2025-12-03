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



// Yup Validation Schema
const schema = yup.object().shape({
    md_cat_id: yup.string().required("Master Data Category is required"),
    md_type_id: yup.string().required("Master Data Type is required"),
    md_title: yup.string().required("Name is required")
});


const MasterDataModal = ({ open, setOpen, getMasterData, initialData, dataTypes, categories }) => {
    const [description, setDescription] = useState("");
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch
    } = useForm({
        resolver: yupResolver(schema),
    });



    const onSubmit = async (data) => {
        try {
            if (initialData) {
                //update existing master data type
                const response = await MasterDataService.Commands.updateMasterData(
                    initialData.md_id,
                    {
                        ...data,
                        _method: 'PUT'
                    }
                );

                if (response?.status === 'success') {
                    setOpen(false);
                    getMasterData(); // Refresh the list after adding
                    toast.success(response?.message);
                    reset(); // clear form
                }
            } else {
                //insert
                const response = await MasterDataService.Commands.storeMasterData({
                    md_title: data.md_title,
                    md_description: data.md_description,
                    md_type_id: data.md_type_id,
                    md_cat_id: data.md_cat_id,
                });

                if (response?.status === 'success') {
                    setOpen(false);
                    getMasterData(); // Refresh the list after adding
                    toast.success(response?.message);
                    reset(); // clear form
                }
            }

        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                console.log("Error::", error);
            }
        }
    };
    
    // Set form values when initialData changes
    useEffect(() => {
        if (initialData) {
            setValue('md_cat_id', initialData.md_cat_id);
            setValue('md_type_id', initialData.md_type_id);
            setValue('md_title', initialData.md_title);
            setValue('md_description', initialData.md_description);
        } else {
            reset({
                md_cat_id: '',
                md_type_id: '',
                md_title: '',
                md_description: ''
            });
        }
    }, [initialData, reset, setValue]);


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
                    <DialogTitle>{initialData ? "Update Master Data" : "Add Master Data"}</DialogTitle>
                </DialogHeader>

                <hr />
                
                {/* Add your form fields here */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">

                        {/* Category Select */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="md_cat_id">
                                Select Master Category
                            </label>
                            <select
                                id="md_cat_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("md_cat_id")}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Master Category</option>
                                {categories.map((item) => (
                                    <option key={item.c_id} value={item.c_id}>
                                        {item.c_name}
                                    </option>
                                ))}
                            </select>
                            {errors.md_cat_id && <p className="text-red-600 text-sm">{errors.md_cat_id.message}</p>}
                        </div>


                        {/* Brand Select */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="md_type_id">
                                Select Master Type
                            </label>
                            <select
                                id="md_type_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("md_type_id")}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Master Type</option>
                                {dataTypes.map((item) => (
                                    <option key={item.mdt_id} value={item.mdt_id}>
                                        {item.mdt_title}
                                    </option>
                                ))}
                            </select>
                            {errors.md_type_id && <p className="text-red-600 text-sm">{errors.md_type_id.message}</p>}
                        </div>


                        <div>
                            <Label htmlFor="md_title"> Name</Label>
                            <Input
                                {...register("md_title")}
                                id="md_title"
                                placeholder="Enter name"
                            />
                            {errors.md_title && <p className="text-red-600 text-sm">{errors.md_title.message}</p>}
                        </div>


                        <div>
                            <Label htmlFor="md_description">Description</Label>
                            <Textarea
                                {...register("md_description")}
                                id="md_description"
                                placeholder="description"
                            />
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

export default MasterDataModal;