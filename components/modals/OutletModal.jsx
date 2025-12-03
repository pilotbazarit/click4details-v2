import React, { useEffect } from 'react'
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
import constData from "@/lib/constant";
import MasterDataService from '@/services/MasterDataService'
import OutletService from '@/services/OutletService'
import Swal from 'sweetalert2'
import LocationService from '@/services/LocationService';

const schema = yup.object().shape({
    uo_name: yup.string().required("Name is required"),
});


const OutletModal = ({ open, setOpen, initialData, setRows, shopData }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue
    } = useForm({
        resolver: yupResolver(schema),
    });

    const [countries, setCountries] = React.useState([]);
    const [locations, setLocations] = React.useState([]);
    const [loadingLocations, setLoadingLocations] = React.useState(false);

    // Set form values when initialData changes
    useEffect(() => {
        if (initialData) {
            setValue('uo_shop_id', initialData.uo_shop_id);
            setValue('uo_country_id', initialData.uo_country_id);
            setValue('uo_location_id', initialData.uo_location_id);
            setValue('uo_name', initialData.uo_name);
            setValue('uo_address', initialData.uo_address);
            setValue('uo_map_link', initialData.uo_map_link);
        } else {
            reset();
        }
    }, [initialData, reset, setValue]);


    const getLocations = async (countryId) => {
        setLoadingLocations(true);
        try {
            const response = await LocationService.Queries.getLocationByCountryId({ 
                _page: 1,
                _perPage: 1000,
                _country_id: countryId
            });

            if (response.status == 'Success') {
                const locationMasterData = response?.data?.data;
                const locationData = locationMasterData.map((location) => ({
                    value: location.l_id,
                    label: location.l_name,
                }));
                setLocations(locationData);
            }
        } catch (error) {
            console.log("Error fetching location data:", error);
        } finally {
            setLoadingLocations(false);
        }
    };


    const getCountry = async () => {
        try {
            const country_code = constData.COUNTRY_CODE;
            const response = await MasterDataService.Queries.getMasterDataByTypeCode(country_code);

            const countryMasterData = response.data?.master_data;
            const countryData = countryMasterData.map((brand) => ({
                value: brand.md_id,
                label: brand.md_title,
            }));

            setCountries(countryData);
        } catch (error) {
            console.log("Error fetching brand data:", error);
        }
    }


    useEffect(() => {
        getCountry();
    }, []);

    const onSubmit = async (data) => {
        console.log("form data", data);
        try {
            if (initialData) {
                // Update existing model
                const res = await OutletService.Commands.updateOutlet(
                    initialData.uo_id, 
                    {
                        ...data,
                        _method: 'PUT'
                    }
                );

                if(res?.status === 'success'){
                    setOpen(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Outlet Updated Successfully',
                    })

                    setRows((prevRows) => prevRows.map((row) => {
                        if (row.uo_id === initialData.uo_id) {
                            return res?.data;
                        }
                        return row;
                    }));
                }
            } else {
                // Create new model
                const res = await OutletService.Commands.storeOutlet(data);
                // console.log("res", res);
                if(res?.status === 'success'){
                    setOpen(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Outlet Created Successfully',
                    })
                    setRows((prevRows) => [...prevRows, res?.data]);
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
                    <DialogTitle>{initialData ? "Update Outlet" : "Add Outlet"}</DialogTitle>
                </DialogHeader>

                <hr />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">

                        {/* shopData */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="uo_shop_id">
                                Shop
                            </label>
                            <select
                                id="uo_shop_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("uo_shop_id")}
                                // onChange={(e) => {
                                //     setValue("uo_shop_id", e.target.value);
                                //     getLocations(e.target.value);
                                // }}
                            >
                                <option value="">Select Shop</option>
                                {
                                    shopData.length > 0 && shopData?.map((shop) => (
                                        <option key={shop.value} value={shop.value}>
                                            {shop.label}
                                        </option>
                                    ))
                                }
                            </select>
                            {errors.uo_shop_id && (
                                <p className="text-red-500 text-sm">{errors.uo_shop_id.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="uo_country_id">
                                Country
                            </label>
                            <select
                                id="uo_country_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("uo_country_id")}
                                onChange={(e) => {
                                    setValue("uo_country_id", e.target.value);
                                    getLocations(e.target.value);
                                }}
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
                            {errors.uo_country_id && (
                                <p className="text-red-500 text-sm">{errors.uo_country_id.message}</p>
                            )}
                        </div>
                        

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="uo_location_id">
                                Location
                            </label>
                            <select
                                id="uo_location_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("uo_location_id")}
                            >
                                <option value="">Select Location</option>
                                {
                                    loadingLocations ? (
                                        <option value="" disabled>Loading locations...</option>
                                    ) : (
                                        locations.length > 0 && locations?.map((location) => (
                                            <option key={location.value} value={location.value}>
                                                {location.label}
                                            </option>
                                        ))
                                    )
                                }
                            </select>
                            {errors.uo_location_id && (
                                <p className="text-red-500 text-sm">{errors.uo_location_id.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="uo_name">Name</Label>
                            <Input
                                id="uo_name"
                                className="border-gray-400"
                                {...register("uo_name")}
                                placeholder="Enter Outlet Name"
                            />
                            {errors.uo_name && (
                                <p className="text-red-500 text-sm">{errors.uo_name.message}</p>
                            )}
                        </div>


                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="uo_address">Address</Label>
                            <Input
                                id="uo_address"
                                className="border-gray-400"
                                {...register("uo_address")}
                                placeholder="Enter Address"
                            />
                            {errors.uo_address && (
                                <p className="text-red-500 text-sm">{errors.uo_address.message}</p>
                            )}
                        </div>


                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="uo_map_link">Map Link</Label>
                            <Input
                                id="uo_map_link"
                                className="border-gray-400"
                                {...register("uo_map_link")}
                                placeholder="Enter Map Link"
                            />
                            {errors.uo_map_link && (
                                <p className="text-red-500 text-sm">{errors.uo_map_link.message}</p>
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

export default OutletModal;