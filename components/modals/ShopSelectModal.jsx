import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAppContext } from '@/context/AppContext';
import { Store } from 'lucide-react';
import ShopService from "@/services/ShopService";
import VehicleService from '@/services/VehicleService';
import toast from 'react-hot-toast';

const ShopSelectModal = ({ open, setOpen, product }) => {
    const { parsedUser } = useAppContext();
    const [selectedShop, setSelectedShop] = useState(null);
    const [shopData, setShopData] = useState([]);


    // console.log("parsedUser?.id", shopData);



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

            console.log("responseresponseresponse", response);
            const shopOptions = response.data.data.map((shop) => ({
                value: shop.s_id,
                label: shop.s_title,
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
        setOpen(isOpen);
        if (!isOpen) {
            setSelectedShop(null);
        }
    };

    // Function to handle shop selection
    const handleShopSelect = (shop) => {
        setSelectedShop(shop);
    };

    // Function to handle save/ok button
    const handleSave = async () => {
        if (selectedShop) {
            console.log('Selected shop:', selectedShop);
            console.log('Product to copy:', product);
            // TODO: Implement the actual copy logic here
            // You can add API call or any other functionality


            // const response = await VehicleService.Commands.cloneVehicle({
            //     id: product.v_id,
            //     shopId: selectedShop.value,
            // });

            const response = await VehicleService.Commands.cloneVehicle(product.v_id, selectedShop.value)

            // console.log("response", response);

            if (response.status === "success") {
                setOpen(false);
                setSelectedShop(null);
                toast.success("Product copied successfully!");
            }

            // Close the modal after save
            // setOpen(false);
            // setSelectedShop(null);
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

                <div className='space-y-3 max-h-[400px] overflow-y-auto py-4'>
                    {shopData && shopData.length > 0 ? (
                        shopData.map((shop, index) => (
                            <div
                                key={index}
                                className='flex items-center gap-4 border border-gray-200 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition'
                                onClick={() => handleShopSelect(shop)}
                            >
                                <div className='flex items-center justify-center w-12 h-12 bg-teal-100 rounded-lg'>
                                    <Store className="w-6 h-6 text-teal-600" />
                                </div>
                                <div className='flex-1'>
                                    <span className='text-gray-900 font-medium text-base'>
                                        {shop.label || shop.label || `Shop ${shop.value}`}
                                    </span>
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
                        className='flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition'
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
                        disabled={!selectedShop}
                        className={`flex-1 px-4 py-3 rounded-lg font-medium transition ${selectedShop
                            ? 'bg-teal-600 text-white hover:bg-teal-700'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        Save
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ShopSelectModal
