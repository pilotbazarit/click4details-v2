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
    mdt_title: yup.string().required("Name is required")
});


const MasterDataTypeModal = ({ open, setOpen, getMasterDataTypes, initialData }) => {
    const [description, setDescription] = useState("");
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
            if (initialData) {
                //update existing master data type
                const response = await MasterDataService.Commands.updateMasterDataType(
                    initialData.mdt_id, 
                    {
                        ...data,
                        _method: 'PUT'
                    }
                );

                if (response?.status === 'success') {
                    setOpen(false);
                    getMasterDataTypes(); // Refresh the list after adding
                    toast.success(response?.message);
                    reset(); // clear form
                }
            } else {
                //insert
                const response = await MasterDataService.Commands.storeMasterDataType({
                    mdt_title: data.mdt_title,
                    mdt_description: data.mdt_description,
                });

                if (response?.status === 'success') {
                    setOpen(false);
                    getMasterDataTypes(); // Refresh the list after adding
                    toast.success(response?.message);
                    reset(); // clear form
                }
            }

        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                console.log("Error::",error);
            }
        }
    };


    // Set form values when initialData changes
    useEffect(() => {
        if (initialData) {
            setValue('mdt_title', initialData.mdt_title);
            setValue('mdt_description', initialData.mdt_description);
        } else {
            reset({
                mdt_title: '',
                mdt_description: ''
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
                    <DialogTitle>{initialData ? "Update Master Data Type" : "Add Master Data Type"}</DialogTitle>
                </DialogHeader>

                <hr />

                {/* Add your form fields here */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div>
                            <Label htmlFor="mdt_title"> Name</Label>
                            <Input
                                {...register("mdt_title")}
                                id="mdt_title"
                                placeholder="Enter name"
                            />
                            {errors.mdt_title && <p className="text-red-600 text-sm">{errors.mdt_title.message}</p>}
                        </div>


                        <div>
                            <Label htmlFor="mdt_description">Description</Label>
                            <Textarea
                                {...register("mdt_description")}
                                id="mdt_description"
                                placeholder="description"
                                value={description}
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
                        {/* <Button
                            type="submit"
                            className="bg-blue-600 text-white"
                        >
                            Add Shop
                        </Button> */}
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default MasterDataTypeModal;