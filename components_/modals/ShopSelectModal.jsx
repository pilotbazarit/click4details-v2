import React, { useEffect, useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAppContext } from '@/context/AppContext';
import { Search, Store } from 'lucide-react';
import ShopService from "@/services/ShopService";
import VehicleService from '@/services/VehicleService';
import toast from 'react-hot-toast';

const ShopSelectModal = ({ open, setOpen, product }) => {
    const { parsedUser } = useAppContext();
    const [selectedShop, setSelectedShop] = useState(null);
    const [shopData, setShopData] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [search, setSearch] = useState('');


    const getShops = async () => {
        try {
            const response = await ShopService.Queries.getShops(
                {
                    order: "desc",
                    orderBy: "md_id",
                    _user_id: parsedUser?.id,
                    _page: 1,
                    _perPage: 1000,
                }
            );

            // console.log("responseresponseresponse", response);
            const shopOptions = response.data.data.map((shop) => ({
                value: shop.s_id,
                label: shop.s_title,
                phone: shop?.user?.phone || shop?.s_user_phone || '',
            }));

            setShopData(shopOptions);
        } catch (error) {
            console.error('Error fetching shops:', error);
            return [];
        }
    };



    useEffect(() => {
        if (open && parsedUser?.id) {
            getShops();
        }
    }, [open, parsedUser?.id]);



    // console.log("shopData", shopData);

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        if (!isOpen && isSaving) {
            return;
        }

        setOpen(isOpen);
        if (!isOpen) {
            setSelectedShop(null);
        }
    };

    // Function to handle shop selection
    const handleShopSelect = (shop) => {
        if (isSaving) return;
        setSelectedShop(shop);
    };

    const filteredShopData = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return shopData;
        return shopData.filter((shop) =>
            String(shop.label || '').toLowerCase().includes(term) ||
            String(shop.phone || '').includes(term)
        );
    }, [shopData, search]);

    // Function to handle save/ok button
    const handleSave = async () => {
        if (!selectedShop || isSaving) {
            return;
        }

        setIsSaving(true);

        try {
            const response = await VehicleService.Commands.cloneVehicle(product.v_id, selectedShop.value)

            if (response.status === "success") {
                setOpen(false);
                setSelectedShop(null);
                toast.success("Product copied successfully!");
            } else {
                toast.error(response?.message || "Failed to copy product. Please try again.");
            }
        } catch (error) {
            console.log("error", error);
            toast.error(error?.message || "An error occurred while copying the product. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle className='text-center text-lg font-semibold'>
                        Want to Copy this Product to your Shop?
                    </DialogTitle>
                    <p className='text-center text-base font-medium mt-2'>
                        Select your Shop First
                    </p>
                </DialogHeader>

                {shopData && shopData.length > 3 && (
                    <div className='relative'>
                        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                        <input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder='Search shop or phone'
                            className='w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-teal-400'
                        />
                    </div>
                )}
                <div className='space-y-3 max-h-[400px] overflow-y-auto py-4'>
                    {filteredShopData && filteredShopData.length > 0 ? (
                        filteredShopData.map((shop, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-4 border border-gray-200 rounded-lg p-4 transition ${
                                    isSaving
                                        ? 'cursor-not-allowed opacity-60'
                                        : 'cursor-pointer hover:bg-gray-50'
                                }`}
                                onClick={() => handleShopSelect(shop)}
                            >
                                <div className='flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg'>
                                    <Store className="w-6 h-6 text-teal-600" />
                                </div>
                                <div className='flex-1'>
                                    <span className='block text-gray-900 font-medium text-base'>
                                        {shop.label || `Shop ${shop.value}`}
                                    </span>
                                    {shop.phone ? (
                                        <span className='block text-sm text-gray-500'>{shop.phone}</span>
                                    ) : null}
                                </div>
                                <div className='w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center'>
                                    {selectedShop?.value === shop.value && (
                                        <div className='w-4 h-4 rounded-full bg-teal-600'></div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className='text-center text-gray-500 py-8'>
                            No shops available
                        </div>
                    )}
                </div>

                <div className='flex gap-3 pt-4 border-t'>
                    <button
                        onClick={() => handleOpenChange(false)}
                        disabled={isSaving}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg font-medium transition ${
                            isSaving
                                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                                : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-blue-500"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!selectedShop || isSaving}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${selectedShop && !isSaving
                            ? 'bg-teal-600 text-white hover:bg-teal-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                        aria-busy={isSaving}
                    >
                        {isSaving && (
                            <svg
                                className="h-5 w-5 animate-spin"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                />
                            </svg>
                        )}
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ShopSelectModal
