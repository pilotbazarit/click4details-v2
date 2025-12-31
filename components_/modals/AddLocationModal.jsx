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
import LocationService from '@/services/LocationService'
import Swal from 'sweetalert2'

const schema = yup.object().shape({
    l_country_id: yup.string().required("Country is required"),
    l_name: yup.string().required("Name is required"),
    // vm_status: yup.string().required("Status is required")
});

//FeatureSpecification

const AddLocationModal = ({ open, setOpen, countries, setLocations, initialData }) => {
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
            setValue('l_country_id', initialData.l_country_id);
            setValue('l_name', initialData.l_name);
            setValue('l_address', initialData.l_address);
            setValue('l_zip_code', initialData.l_zip_code);
            setValue('vm_status', initialData.vm_status);
        } else {
            reset();
        }
    }, [initialData, reset, setValue]);

    const onSubmit = async (data) => {
        // console.log("DATAA", data);
        try {
            if (initialData) {
                // Update existing model
                const res = await LocationService.Commands.updateLocation(
                    initialData.l_id, 
                    {
                        ...data,
                        _method: 'PUT'
                    }
                );

                console.log("res::::::::::", res);


                if(res?.status === 'success'){
                    setOpen(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Location Updated Successfully',
                    })
                    setLocations((prevLocations) => prevLocations.map((location) => {
                        if (location.l_id === initialData.l_id) {
                            return res?.data;
                        }
                        return location;
                    }))
                }
                // getModels();
                // setOpen(false);
                // toast.success("Location updated successfully!");
            } else {
                // Create new model
                const res = await LocationService.Commands.storeLocation(data);
                console.log('res', res);
                if(res?.status === 'success'){
                    setOpen(false);
                    setLocations((prevLocations) => [...prevLocations, res?.data]);
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Location Added Successfully',
                    })
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

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Update Location" : "Add Location"}</DialogTitle>
                </DialogHeader>

                <hr />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="l_country_id">
                                Select Country
                            </label>
                            <select
                                id="l_country_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("l_country_id")}
                            >
                                <option value="">Select Country</option>
                                {
                                    countries.length > 0 && countries?.map((country) => (
                                        <option key={country.value} value={country.value}>
                                            {country.label}
                                        </option>
                                    ))
                                }
                            </select>
                            {errors.l_country_id && (
                                <p className="text-red-500 text-sm">{errors.l_country_id.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="l_name">Name</Label>
                            <Input
                                id="l_name"
                                className="border-gray-400"
                                {...register("l_name")}
                                placeholder="Enter name"
                            />
                            {errors.l_name && (
                                <p className="text-red-500 text-sm">{errors.l_name.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="l_address">Address</Label>
                            <Input
                                id="l_address"
                                className="border-gray-400"
                                {...register("l_address")}
                                placeholder="Enter Address"
                            />
                            {errors.l_address && (
                                <p className="text-red-500 text-sm">{errors.l_address.message}</p>
                            )}
                        </div>

                         <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="l_zip_code">Zip Code</Label>
                            <Input
                                id="l_zip_code"
                                className="border-gray-400"
                                {...register("l_zip_code")}
                                placeholder="Enter name"
                            />
                            {errors.l_zip_code && (
                                <p className="text-red-500 text-sm">{errors.l_zip_code.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="l_status">
                                Status
                            </label>
                            <select
                                id="l_status"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("l_status")}
                            >
                                {/* <option value="">Select Status</option> */}
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                            {errors.l_status && (
                                <p className="text-red-500 text-sm">{errors.l_status.message}</p>
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

export default AddLocationModal;