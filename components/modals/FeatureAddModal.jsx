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

// Yup Validation Schema
const schema = yup.object().shape({
    md_title: yup.string().required("Name is required")
});


const FeatureAddModal = ({ open, setOpen, getFeatureSpecification }) => {
    const [featureId, setFeatureId] = useState('');

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
        if (featureId) {
            try {
                //insert
                const response = await MasterDataService.Commands.storeMasterData({
                    md_title: data.md_title,
                    md_description: data.md_description,
                    md_type_id: featureId,
                });

                if (response?.status === 'success') {
                    setOpen(false);
                    getFeatureSpecification(); // Refresh the list after adding
                    toast.success("Brand created successfully");
                    reset(); // clear form
                }
            } catch (error) {
                if (error.errors) {
                    Object.values(error.errors).forEach((e) => toast.error(e[0]));
                } else {
                    console.log("Error::", error);
                }
            }
        }

    };



    const getFeatureId = async () => {
        try {
            const feature_code = constData.FEATURE_CODE;
            const response = await MasterDataService.Queries.getMasterDataByTypeCode(feature_code);

            if (response?.status === 'success') {
                const featureId = response.data?.mdt_id;
                setFeatureId(featureId);
            }
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
        }
    }



    useEffect(() => {
        getFeatureId();
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
                    <DialogTitle>Add Feature</DialogTitle>
                </DialogHeader>

                <hr />

                {/* Add your form fields here */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">

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
                            {isSubmitting ? "Processing..." : "ADD"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default FeatureAddModal;