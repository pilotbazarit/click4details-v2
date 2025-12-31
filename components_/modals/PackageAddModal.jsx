import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
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


import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import MasterDataService from '@/services/MasterDataService'
import constData from "@/lib/constant";
import VehicleModelService from '@/services/VehicleModelService'
import PackageService from '@/services/PackageService'

// Yup Validation Schema
const schema = yup.object().shape({
    p_name: yup.string().required("Name is required")
});


const PackageAddModal = ({ open, setOpen, getPackages }) => {

    const [brands, setBrands] = useState([]);
    const [models, setModels] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState("");
    const [selectedModel, setSelectedModel] = useState("");


    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset
    } = useForm({
        resolver: yupResolver(schema),
    });

    const onSubmit = async (data) => {

        if (!selectedBrand) {
            return toast.error("Please select a brand");
        }
        if (!selectedModel) {
            return toast.error("Please select a model");
        }

        const FormData = {
            p_brand_id: selectedBrand,
            p_model_id: selectedModel,
            p_name: data.p_name,
        }

        const res = await PackageService.Commands.storePackage(FormData);
       
        if (res?.status === 'success') {
            setOpen(false);
            toast.success("Package created successfully");
            getPackages();
            reset(); // clear form
            setSelectedBrand("");
            setSelectedModel("");
            setModels([]);
        }
    };


    const getBrands = async () => {
        try {
            const brand_code = constData.BRAND_MD_CODE;
            const response = await MasterDataService.Queries.getMasterDataByTypeCode(brand_code);

            const brandMasterData = response.data?.master_data;
            const brandData = brandMasterData.map((brand) => ({
                value: brand.md_id,
                label: brand.md_title,
            }));

            setBrands(brandData);
        } catch (error) {
            console.log("Error fetching brand data:", error);
        }
    }


    useEffect(() => {
        if(open){
             getBrands();
        }
    }, [open]);


    const handleBrandChange = async (value) => {
        setSelectedBrand(value);
        setSelectedModel(""); // Reset model selection
        setModels([]);
        if (value) {
            try {
                const response = await VehicleModelService.Queries.getModelsByBrand({
                    _brand_id: value,
                    _page: 1,
                    _perPage: 1000,
                });
                setModels(response?.data?.data || []);
            } catch (error) {
                console.log("Error fetching models:", error);
                setModels([]);
            }
        } else {
            setModels([]);
        }
    };


    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset(); // Reset form when dialog closes
            setSelectedBrand("");
            setSelectedModel("");
            setModels([]);
        }
    };


    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Add Package</DialogTitle>
                </DialogHeader>

                <hr />

                {/* Add your form fields here */}
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <Label htmlFor="p_brand_id">Brand</Label>
                            <Select onValueChange={handleBrandChange} value={selectedBrand}>
                                <SelectTrigger className="w-full border-gray-400">
                                    <SelectValue placeholder="Select Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Brands</SelectLabel>
                                        {brands.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="p_model_id">Model</Label>
                             <Select onValueChange={setSelectedModel} value={selectedModel} disabled={!selectedBrand || models.length === 0}>
                                <SelectTrigger className="w-full border-gray-400">
                                    <SelectValue placeholder="Select Model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Models</SelectLabel>
                                        {models.length > 0 ? (
                                            models.map((item) => (
                                                <SelectItem key={item.vm_id} value={item.vm_id}>
                                                    {item.vm_name}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <SelectItem value="no-data" disabled>
                                                No data available
                                            </SelectItem>
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
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

export default PackageAddModal;