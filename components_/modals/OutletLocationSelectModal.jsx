"use client";

import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import toast from 'react-hot-toast';

import OutletService from '@/services/OutletService';
import { usePathname, useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";
import { parseStoredUser as parseStoredUserValue } from "@/lib/parseStoredUser";

const cleanValue = (value) => {
    if (value === null || value === undefined) return "";

    const stringValue = String(value).trim();
    if (!stringValue || stringValue.toLowerCase() === "null") return "";

    return stringValue;
};

const parseStoredUser = () => {
    if (typeof window === "undefined") return null;
    return parseStoredUserValue(localStorage.getItem("user"));
};

const normalizeOutlet = (outlet) => ({
    ...outlet,
    uo_id: String(outlet?.uo_id || outlet?.id || ""),
    uo_name: cleanValue(outlet?.uo_name || outlet?.name),
    uo_address: cleanValue(outlet?.uo_address || outlet?.address),
    uo_map_link: cleanValue(outlet?.uo_map_link || outlet?.map_link),
    countryName: cleanValue(outlet?.country?.md_title || outlet?.country_name),
    locationName: cleanValue(outlet?.location?.l_name || outlet?.location_name),
});

const createProductOutletFallback = (product) => {
    const outletId = cleanValue(product?.v_location?.uo_id || product?.v_availability_id);
    const outletName = cleanValue(product?.v_location?.uo_name);
    const address = cleanValue(product?.v_location?.uo_address);
    const mapLink = cleanValue(product?.v_location?.uo_map_link);
    const countryName = cleanValue(product?.v_location?.country?.md_title || product?.v_location?.country_name);
    const locationName = cleanValue(product?.v_location?.location?.l_name || product?.v_location?.location_name);

    if (!outletId && !outletName && !address && !mapLink && !countryName && !locationName) {
        return null;
    }

    return normalizeOutlet({
        uo_id: outletId || "product-location",
        uo_name: outletName,
        uo_address: address,
        uo_map_link: mapLink,
        country_name: countryName,
        location_name: locationName,
    });
};

const buildLocationMessage = (outlet) => {
    const normalizedOutlet = normalizeOutlet(outlet);
    let message = `*Outlet Location*\n\n`;

    if (normalizedOutlet.uo_name) {
        message += `Name: ${normalizedOutlet.uo_name}\n`;
    }

    if (normalizedOutlet.countryName) {
        message += `Country: ${normalizedOutlet.countryName}\n`;
    }

    if (normalizedOutlet.locationName) {
        message += `Location: ${normalizedOutlet.locationName}\n`;
    }

    if (normalizedOutlet.uo_address) {
        message += `Address: ${normalizedOutlet.uo_address}\n`;
    }

    if (normalizedOutlet.uo_map_link) {
        message += `Map Link: ${normalizedOutlet.uo_map_link}\n`;
    }

    return message.trim();
};

const OutletLocationSelectModal = ({ open, setOpen, product, user, selectedCompanyShop }) => {
    const router = useRouter();
    const [outlets, setOutlets] = useState([]);
    const [selectedOutletIds, setSelectedOutletIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const pathname = usePathname();
    const { permissionList } = useAppContext();

    let isCompanyShop = pathname.includes("company-shop");
    const hasShareOutletLocationPermission =
        !isCompanyShop ||
        hasPermission(
            permissionList,
            Number(selectedCompanyShop?.shop?.s_id),
            "Vehicle",
            "ShareOutletLocation"
        );

    // console.log("isCompanyShop ------", isCompanyShop);

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setSelectedOutletIds([]);
            setOutlets([]);
        }
    };

    const handleOutletSelect = (outletId) => {
        setSelectedOutletIds((prev) => (
            prev.includes(outletId)
                ? prev.filter((id) => id !== outletId)
                : [...prev, outletId]
        ));
    };

    const handleSelectAll = () => {
        if (selectedOutletIds.length === outlets.length) {
            setSelectedOutletIds([]);
            return;
        }

        setSelectedOutletIds(outlets.map((outlet) => outlet.uo_id));
    };

    const isOutletSelected = (outletId) => selectedOutletIds.includes(outletId);
    const isAllSelected = outlets.length > 0 && selectedOutletIds.length === outlets.length;

    useEffect(() => {
        if (!open) return;

        let isMounted = true;

        const fetchOutlets = async () => {
            const storedUser = user || parseStoredUser();
            const resolvedShopId =
                product?.v_shop_id ||
                product?.shop?.s_id ||
                selectedCompanyShop?.shop?.s_id ||
                "";

            try {
                setLoading(true);

                let response;
                if (resolvedShopId) {
                    response = await OutletService.Queries.getOutletByShopId({
                        _page: 1,
                        _perPage: 1000,
                        _shop_id: resolvedShopId,
                    });
                } else {
                    const params = {
                        _page: 1,
                        _perPage: 1000,
                        _order: 'asc',
                        _orderBy: 'uo_serial',
                    };

                    if (storedUser?.user_mode !== 'supreme' && storedUser?.id) {
                        params._user_id = storedUser.id;
                    }

                    response = await OutletService.Queries.getAllOutlets(params);
                }

                const fetchedOutlets = (response?.data?.data || []).map(normalizeOutlet);
                const fallbackOutlet = createProductOutletFallback(product);
                const nextOutlets =
                    fetchedOutlets.length > 0
                        ? fetchedOutlets
                        : fallbackOutlet
                            ? [fallbackOutlet]
                            : [];

                if (!isMounted) return;

                setOutlets(nextOutlets);
                setSelectedOutletIds([]);
            } catch (error) {
                if (!isMounted) return;

                const fallbackOutlet = createProductOutletFallback(product);
                setOutlets(fallbackOutlet ? [fallbackOutlet] : []);
                setSelectedOutletIds([]);
                toast.error(error?.response?.data?.message || "Failed to fetch outlet locations");
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchOutlets();

        return () => {
            isMounted = false;
        };
    }, [open, product, selectedCompanyShop, user]);

    const handleAddLocationClick = () => {
        setOpen(false);
        setSelectedOutletIds([]);
        setOutlets([]);
        router.push('/dashboard/outlets/');
    };

    const handleShareLocation = () => {
        const selectedOutlets = outlets.filter((outlet) => selectedOutletIds.includes(outlet.uo_id));
        if (selectedOutlets.length === 0) return;
        if (!hasShareOutletLocationPermission) {
            alert("You don't have permission");
            return;
        }

        let message = `*Outlet Location Details*\n\n`;

        selectedOutlets.forEach((outlet, index) => {
            if (index > 0) {
                message += `\n \n\n`;
            }

            message += buildLocationMessage(outlet).replace(/^\*Outlet Location\*\n\n/, "");
        });

        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message.trim())}`;
        window.open(whatsappUrl, '_blank');

        setOpen(false);
        setSelectedOutletIds([]);
        setOutlets([]);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className='text-center font-medium text-xl'>Select Outlet Location</DialogTitle>
                </DialogHeader>

                <div className='mt-6 space-y-3'>
                    {loading ? (
                        <div className='rounded-lg border border-gray-300 bg-gray-50 px-4 py-8 text-center text-gray-500'>
                            Loading locations...
                        </div>
                    ) : outlets.length > 0 ? (
                        <>
                            <div
                                className={`border rounded-lg p-4 cursor-pointer transition bg-gray-50 ${isAllSelected
                                        ? 'border-blue-500 bg-blue-100'
                                        : 'border-gray-400 hover:border-blue-300'
                                    }`}
                                onClick={handleSelectAll}
                            >
                                <div className='flex items-center justify-between'>
                                    <div className='flex-1'>
                                        <h3 className='font-semibold text-lg'>Select All Outlet Locations</h3>
                                        <p className='text-sm text-gray-600 mt-1'>
                                            {isAllSelected
                                                ? `All ${outlets.length} locations selected`
                                                : `Select all ${outlets.length} locations`}
                                        </p>
                                    </div>
                                    <div className='ml-4'>
                                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isAllSelected
                                                ? 'border-blue-500 bg-blue-500'
                                                : 'border-gray-400'
                                            }`}>
                                            {isAllSelected && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {outlets.map((outlet) => {
                                const isSelected = isOutletSelected(outlet.uo_id);

                                return (
                                    <div
                                        key={outlet.uo_id}
                                        className={`border rounded-lg p-4 cursor-pointer transition ${isSelected
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-300 hover:border-blue-300'
                                            }`}
                                        onClick={() => handleOutletSelect(outlet.uo_id)}
                                    >
                                        <div className='flex items-start justify-between gap-4'>
                                            <div className='flex-1 space-y-1 text-sm text-gray-700'>
                                                <h3 className='font-semibold text-lg text-gray-900'>
                                                    {outlet.uo_name || 'Unnamed Outlet'}
                                                </h3>
                                                {outlet.countryName && <p>Country: {outlet.countryName}</p>}
                                                {outlet.locationName && <p>Location: {outlet.locationName}</p>}
                                                {outlet.uo_address && <p>Address: {outlet.uo_address}</p>}
                                                {outlet.uo_map_link && <p>Map Link: {outlet.uo_map_link}</p>}
                                            </div>
                                            <div className='shrink-0'>
                                                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${isSelected
                                                        ? 'border-blue-500 bg-blue-500'
                                                        : 'border-gray-400'
                                                    }`}>
                                                    {isSelected && (
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <div className='rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-gray-500'>
                            No outlet locations found
                        </div>
                    )}
                </div>

                {
                    !isCompanyShop && (
                        <div className='mt-6'>
                            <button
                                type='button'
                                onClick={handleAddLocationClick}
                                className='w-full py-3 rounded-lg font-medium transition border border-blue-500 text-blue-600 hover:bg-blue-50'
                            >
                                Add Location
                            </button>
                        </div>
                    )
                }


                <div className='mt-6'>
                    <button
                        type='button'
                        onClick={handleShareLocation}
                        disabled={selectedOutletIds.length === 0}
                        className={`w-full py-3 rounded-lg font-medium transition ${selectedOutletIds.length > 0
                                ? 'bg-blue-500 text-white hover:bg-blue-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Share Location {selectedOutletIds.length > 0 && `(${selectedOutletIds.length})`}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default OutletLocationSelectModal;
