import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import VehicleService from '@/services/VehicleService';

const PriceSelectModal = ({ open, setOpen, product, onShare, selectedCompanyShop, formattedPermissions, isMyShop }) => {
    const [priceType, setPriceType] = useState('fixed'); // 'asking', 'fixed', 'variable'
    const [urgentSale, setUrgentSale] = useState(false);


    // console.log("product::::::::::", product);

    // Get prices from product and make them editable
    const [askingPrice, setAskingPrice] = useState(product?.vehicle_db_price?.vp_user_asking_price || 0);
    const [fixedPrice, setFixedPrice] = useState(product?.vehicle_db_price?.vp_user_fixed_price || 0);
    const [variablePrice, setVariablePrice] = useState(product?.vehicle_db_price?.vp_variable_price || 0);
    const [userCostingPrice, setUserCostingPrice] = useState(product?.vehicle_price?.v_costing_price || 0);

    const updateVehiclePrice = async (priceData) => {
        try {
            // Assuming you have a service to update vehicle prices
            const response = await VehicleService.Commands.individualVehicleUpdate(product?.v_id, {
                vp_user_asking_price: priceData.type === 'asking' ? priceData.value : askingPrice,
                vp_user_fixed_price: priceData.type === 'fixed' ? priceData.value : fixedPrice,
                vp_variable_price: priceData.type === 'variable' ? priceData.value : variablePrice,
                vp_urgent_sale: priceData.urgentSale ? 1 : 0,
                vp_show_price: priceData.type,
                _method: 'PUT'
            });
            return response;
        } catch (error) {
            console.error('Error updating vehicle price:', error);
            return null;
        }
    };


    const handleShare = () => {
        let companyShopId = selectedCompanyShop?.shop?.s_id;

        let priceAction = ""
        let action = "Vehicle";

        if (priceType === 'asking') {
            priceAction = "UpdateAskingPrice"
        } else if (priceType === 'fixed') {
            priceAction = "UpdateFixedPrice"
        } else if (priceType === 'variable') {
            priceAction = "UpdateVariablePrice"
        }

        const hasPermission = companyShopId
            ? formattedPermissions.some(
                permission =>
                    permission.shopId === companyShopId &&
                    (permission.section === "Vehicle" || permission.section === "*") &&
                    (permission.action === priceAction || permission.action === "*")
            )
            : false;

        // const hasPermissionOld = formattedPermissions.some(
        //     permission =>
        //         permission.shopId === companyShopId &&
        //         (permission.section === "Vehicle" || permission.section === "*") &&
        //         (permission.action === priceAction || permission.action === "*")
        // );

        // Prepare price data to send
        const priceData = {
            type: priceType,
            value: priceType === 'asking' ? askingPrice : priceType === 'fixed' ? fixedPrice : variablePrice,
            urgentSale
        };

        onShare(priceData);
        setOpen(false);

        if (hasPermission) {
            const response = updateVehiclePrice(priceData);
        }
    };

    const handleCancel = () => {
        setOpen(false);
        setPriceType('fixed');
        setUrgentSale(false);
    };


    let companyShopId = selectedCompanyShop?.shop?.s_id;
    const hasUserPricePermission = companyShopId
        ? formattedPermissions.some(
            permission =>
                permission.shopId === companyShopId &&
                (permission.section === "Vehicle" || permission.section === "*") &&
                (permission.action === "UpdateCostingPrice" || permission.action === "*")
        )
        : false;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-lg font-semibold">Select Price</DialogTitle>
                </DialogHeader>
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-4">
                        যদি আপনি সঠিকভাবে মূল্য না দেন, তাহলে আপনার বিক্রির হার কমে যাবে।
                    </p>
                </div>

                <div className="space-y-3">
                    {/* Asking Price */}
                    <div
                        className={`border rounded-lg p-3 transition ${priceType === 'asking' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                    >
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Asking Price
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={askingPrice}
                                onChange={(e) => setAskingPrice(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter asking price"
                            />
                            <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 ${priceType === 'asking' ? 'border-blue-500' : 'border-gray-400'
                                    }`}
                                onClick={() => setPriceType('asking')}
                            >
                                {priceType === 'asking' && (
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Fixed Price */}
                    <div
                        className={`border rounded-lg p-3 transition ${priceType === 'fixed' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                    >
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Fixed Price
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={fixedPrice}
                                onChange={(e) => setFixedPrice(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter fixed price"
                            />
                            <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 ${priceType === 'fixed' ? 'border-blue-500' : 'border-gray-400'
                                    }`}
                                onClick={() => setPriceType('fixed')}
                            >
                                {priceType === 'fixed' && (
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Variable Price */}
                    <div
                        className={`border rounded-lg p-3 transition ${priceType === 'variable' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                            }`}
                    >
                        <label className="text-sm font-medium text-gray-700 block mb-2">
                            Variable Price
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={variablePrice}
                                onChange={(e) => setVariablePrice(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter variable price"
                            />
                            <div
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer flex-shrink-0 ${priceType === 'variable' ? 'border-blue-500' : 'border-gray-400'
                                    }`}
                                onClick={() => setPriceType('variable')}
                            >
                                {priceType === 'variable' && (
                                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* User Costing Price */}
                    {
                        (hasUserPricePermission || isMyShop) && (
                            <div
                                className={`border rounded-lg p-3 transition border-gray-300`}
                            >
                                <label className="text-sm font-medium text-gray-700 block mb-2">
                                    User Costing Price
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        value={userCostingPrice}
                                        // onChange={(e) => setVariablePrice(e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter variable price"
                                        readOnly
                                    />

                                </div>
                            </div>
                        )
                    }


                    {/* Urgent Sale Checkbox */}
                    <div
                        className="flex items-center gap-3 p-3 cursor-pointer"
                        onClick={() => setUrgentSale(!urgentSale)}
                    >
                        <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${urgentSale ? 'bg-blue-500 border-blue-500' : 'border-gray-400'
                            }`}>
                            {urgentSale && (
                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                        <label className="text-sm font-medium text-gray-700 cursor-pointer">
                            Urgent Sale
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleShare}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        Share
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default PriceSelectModal
