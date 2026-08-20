import React, { useEffect, useState, useCallback } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import ShopSelect from "@/components/ShopSelect"
import Select from "react-select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import constData from "@/lib/constant";
import MasterDataService from '@/services/MasterDataService'
import OutletService from '@/services/OutletService'
import Swal from 'sweetalert2'

const schema = yup.object().shape({
    uo_name: yup.string().required("Name is required"),
});

const defaultFormValues = {
    uo_shop_id: '',
    uo_country_id: '',
    uo_location_id: '',
    uo_district_id: '',
    uo_name: '',
    uo_address: '',
    uo_map_link: '',
};

const selectCustomStyles = {
    control: (base, state) => ({
        ...base,
        minHeight: "42px",
        borderColor: state.isFocused ? "#2563eb" : "#9ca3af",
        boxShadow: state.isFocused ? "0 0 0 1px #2563eb" : "none",
        "&:hover": {
            borderColor: state.isFocused ? "#2563eb" : "#6b7280",
        },
        borderRadius: "0.375rem",
        fontSize: "0.875rem",
    }),
    menu: (base) => ({
        ...base,
        zIndex: 9999,
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),
};

const OutletModal = ({ open, setOpen, initialData, setRows, shopData }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch,
        control
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: defaultFormValues,
    });

    const [countries, setCountries] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [loadingDistricts, setLoadingDistricts] = useState(false);

    const getDistricts = useCallback(async (selectedDistrictId = '') => {
        setLoadingDistricts(true);
        try {
            const response = await OutletService.Queries.getDistricts();

            if (response?.status === 'success' || response?.status === 'Success' || response?.data) {
                const districtMasterData = response?.data?.data || response?.data || [];
                const districtData = (Array.isArray(districtMasterData) ? districtMasterData : []).map((district) => ({
                    value: String(district.id),
                    label: district.name,
                }));

                setDistricts(districtData);

                if (selectedDistrictId) {
                    const matchedDistrict = districtData.find(
                        (d) => String(d.value) === String(selectedDistrictId)
                    );
                    const targetId = matchedDistrict ? String(matchedDistrict.value) : String(selectedDistrictId);
                    setValue('uo_location_id', targetId);
                    setValue('uo_district_id', targetId);
                }
            } else {
                setDistricts([]);
            }
        } catch (error) {
            console.log("Error fetching district data:", error);
            setDistricts([]);
        } finally {
            setLoadingDistricts(false);
        }
    }, [setValue]);

    const getCountry = async () => {
        try {
            const country_code = constData.COUNTRY_CODE;
            const response = await MasterDataService.Queries.getMasterDataByTypeCode(country_code);

            const countryMasterData = response?.data?.master_data || [];
            const countryData = countryMasterData.map((brand) => ({
                value: String(brand.md_id),
                label: brand.md_title,
            }));

            setCountries(countryData);
        } catch (error) {
            console.log("Error fetching country data:", error);
        }
    };

    // Load static master datasets
    useEffect(() => {
        getCountry();
        getDistricts();
    }, [getDistricts]);

    // Set form values when initialData changes
    useEffect(() => {
        if (!open) {
            return;
        }

        if (initialData) {
            const districtId = initialData.uo_district_id || initialData.uo_location_id || '';
            reset({
                uo_shop_id: initialData.uo_shop_id ? String(initialData.uo_shop_id) : '',
                uo_country_id: initialData.uo_country_id ? String(initialData.uo_country_id) : '',
                uo_location_id: districtId ? String(districtId) : '',
                uo_district_id: districtId ? String(districtId) : '',
                uo_name: initialData.uo_name || '',
                uo_address: initialData.uo_address || '',
                uo_map_link: initialData.uo_map_link || '',
            });
            getDistricts(districtId);
        } else {
            reset(defaultFormValues);
        }
    }, [open, initialData, reset, getDistricts]);

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                uo_district_id: data.uo_district_id || data.uo_location_id || null,
                uo_location_id: data.uo_location_id || data.uo_district_id || null,
            };

            if (initialData) {
                // Update existing model
                const res = await OutletService.Commands.updateOutlet(
                    initialData.uo_id, 
                    {
                        ...payload,
                        _method: 'PUT'
                    }
                );

                if (res?.status === 'success') {
                    setOpen(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Outlet Updated Successfully',
                    });

                    setRows((prevRows) => prevRows.map((row) => {
                        if (row.uo_id === initialData.uo_id) {
                            return res?.data;
                        }
                        return row;
                    }));
                }
            } else {
                // Create new model
                const res = await OutletService.Commands.storeOutlet(payload);
                if (res?.status === 'success') {
                    setOpen(false);
                    Swal.fire({
                        icon: 'success',
                        title: 'Success',
                        text: 'Outlet Created Successfully',
                    });
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
            reset(defaultFormValues);
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

                        {/* Shop dropdown (Searchable) */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm font-medium text-gray-700" htmlFor="uo_shop_id">
                                Shop
                            </label>
                            <Controller
                                name="uo_shop_id"
                                control={control}
                                render={({ field }) => (
                                    <ShopSelect
                                        shops={shopData}
                                        value={field.value}
                                        onChange={(shopId) => field.onChange(shopId)}
                                        placeholder="Search and select shop..."
                                    />
                                )}
                            />
                            {errors.uo_shop_id && (
                                <p className="text-red-500 text-xs">{errors.uo_shop_id.message}</p>
                            )}
                        </div>

                        {/* Country dropdown (Searchable) */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm font-medium text-gray-700" htmlFor="uo_country_id">
                                Country
                            </label>
                            <Controller
                                name="uo_country_id"
                                control={control}
                                render={({ field }) => {
                                    const selected = countries.find((c) => String(c.value) === String(field.value)) || null;
                                    return (
                                        <Select
                                            options={countries}
                                            value={selected}
                                            onChange={(option) => field.onChange(option?.value ?? '')}
                                            placeholder="Search and select country..."
                                            isClearable
                                            isSearchable
                                            styles={selectCustomStyles}
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                            noOptionsMessage={() => "No countries found"}
                                        />
                                    );
                                }}
                            />
                            {errors.uo_country_id && (
                                <p className="text-red-500 text-xs">{errors.uo_country_id.message}</p>
                            )}
                        </div>

                        {/* District / Location dropdown (Searchable from District Table) */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-sm font-medium text-gray-700" htmlFor="uo_location_id">
                                District
                            </label>
                            <Controller
                                name="uo_location_id"
                                control={control}
                                render={({ field }) => {
                                    const currentVal = field.value || watch('uo_district_id') || '';
                                    const selected = districts.find((d) => String(d.value) === String(currentVal)) || null;
                                    return (
                                        <Select
                                            options={districts}
                                            value={selected}
                                            onChange={(option) => {
                                                const val = option?.value ?? '';
                                                field.onChange(val);
                                                setValue('uo_district_id', val);
                                            }}
                                            placeholder={loadingDistricts ? "Loading districts..." : "Search and select district..."}
                                            isLoading={loadingDistricts}
                                            isClearable
                                            isSearchable
                                            styles={selectCustomStyles}
                                            menuPortalTarget={typeof document !== "undefined" ? document.body : null}
                                            noOptionsMessage={() => "No districts found"}
                                        />
                                    );
                                }}
                            />
                            {errors.uo_location_id && (
                                <p className="text-red-500 text-xs">{errors.uo_location_id.message}</p>
                            )}
                        </div>

                        {/* Name */}
                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="uo_name" className="text-sm font-medium text-gray-700">Name</Label>
                            <Input
                                id="uo_name"
                                className="border-gray-400 h-10"
                                {...register("uo_name")}
                                placeholder="Enter Outlet Name"
                            />
                            {errors.uo_name && (
                                <p className="text-red-500 text-xs">{errors.uo_name.message}</p>
                            )}
                        </div>

                        {/* Address */}
                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="uo_address" className="text-sm font-medium text-gray-700">Address</Label>
                            <Input
                                id="uo_address"
                                className="border-gray-400 h-10"
                                {...register("uo_address")}
                                placeholder="Enter Address"
                            />
                            {errors.uo_address && (
                                <p className="text-red-500 text-xs">{errors.uo_address.message}</p>
                            )}
                        </div>

                        {/* Map Link */}
                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="uo_map_link" className="text-sm font-medium text-gray-700">Map Link</Label>
                            <Input
                                id="uo_map_link"
                                className="border-gray-400 h-10"
                                {...register("uo_map_link")}
                                placeholder="Enter Map Link"
                            />
                            {errors.uo_map_link && (
                                <p className="text-red-500 text-xs">{errors.uo_map_link.message}</p>
                            )}
                        </div>

                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded font-medium text-sm transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-medium text-sm transition disabled:opacity-50"
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
