import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

import { DialogTitle } from '@radix-ui/react-dialog';
import VehicleService from '@/services/VehicleService';



const PriceHistoryModal = ({ open, setOpen, selectedProduct }) => {


    const [historyData, setHistoryData] = useState([]);
    const [vehicleHistoryData, setVehicleHistoryData] = useState([]);
    const [costingPaymentHistoryData, setCostingPaymentHistoryData] = useState([]);

    // Format field names to readable text
    const formatFieldName = (key) => {
        const fieldNames = {
            // Price fields
            'vp_pbl_hs_price_status': 'PBL HS Price Status',
            'vp_pbl_price_status': 'PBL Price Status',
            'vp_purchase_price': 'Purchase Price',
            'vp_variable_price': 'Variable Price',
            'vp_user_purchase_price': 'User Purchase Price',
            'vp_purchase_cost': 'Purchase Cost',
            'vp_user_costing_price': 'User Costing Price',
            'vp_conv_rate': 'Conversion Rate',
            'vp_bd_tax': 'BD Tax',
            'vp_other_cost': 'Other Cost',
            'vp_user_asking_price': 'User Asking Price',
            'vp_user_variable_price': 'User Variable Price',
            'vp_user_fixed_price': 'User Fixed Price',
            'vp_show_price': 'Show Price',
            'vp_pbl_additional_amount': 'PBL Additional Amount',
            'vp_pbl_asking_price': 'PBL Asking Price',
            'vp_user_to_pbl_price': 'User to PBL Price',
            'vp_currency': 'Currency',
            'vp_user_price_status': 'User Price Status',
            'vp_user_hs_asking_price': 'User HS Asking Price',
            'vp_user_hs_fixed_price': 'User HS Fixed Price',
            'vp_hs_min_qty': 'HS Min Qty',
            'vp_user_hs_price_status': 'User HS Price Status',
            'vp_pbl_hs_additional_amount': 'PBL HS Additional Amount',
            'vp_pbl_hs_asking_price': 'PBL HS Asking Price',
            'vp_calculated_price': 'Calculated Price',

            // Vehicle fields
            'v_title': 'Title',
            'v_code': 'Vehicle Code',
            'v_brand_id': 'Brand',
            'v_model_id': 'Model',
            'v_edition_id': 'Edition',
            'v_condition_id': 'Condition',
            'v_transmission_id': 'Transmission',
            'v_fuel_id': 'Fuel Type',
            'v_skeleton_id': 'Body Type / Skeleton',
            'v_grade_id': 'Grade',
            'v_int_grade_id': 'Internal Grade',
            'v_ext_grade_id': 'External Grade',
            'v_color_id': 'Color',
            'v_location_id': 'Location',
            'v_availability_id': 'Availability',
            'v_availability_status': 'Availability Status',
            'v_capacity': 'Engine Capacity (cc)',
            'v_mileage': 'Mileage (km)',
            'v_registration': 'Registration Year',
            'v_mod_year': 'Model Year',
            'v_engine': 'Engine Number',
            'v_chassis': 'Chassis Number',
            'v_is_saleBy_pbl': 'Sale by PBL',
            'v_pbl_partnership_expire_date': 'PBL Partnership Expire Date',
            'v_user_gift': 'User Gift',
            'v_pbl_gift': 'PBL Gift',
            'v_show_seller_mobile': 'Show Seller Mobile',
            'v_seller_info': 'Seller Info',
            'v_tax_token_exp_date': 'Tax Token Expiry',
            'v_fitness_exp_date': 'Fitness Expiry',
            'v_arrival_date': 'Arrival Date',
            'v_urgent_sale': 'Urgent Sale',
            'v_seat_id': 'Seat Capacity',
            'v_description': 'Description',
            'v_status': 'Status',
            'v_priority': 'Priority',
            'v_staged': 'Approval Stage',
            'v_sketch_id': 'Sketch',
            'v_video': 'Video URL',
            'v_vehicle_type_id': 'Vehicle Type',
            'v_category_id': 'Category',
            'v_auction_type': 'Auction Type',
        };
        return fieldNames[key] || key.replace(/^(v_|vp_|ed_|p_|s_)/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Format currency values
    const formatValue = (value) => {
        if (value === null || value === undefined) return 'null';
        if (value === '') return 'Empty';

        if (Array.isArray(value)) {
            return value.map((item) => formatValue(item)).join(', ');
        }

        if (typeof value === 'object') {
            if ('name' in value || 'amount' in value) {
                const label = value.name ? String(value.name) : '';
                const amount = value.amount !== undefined ? formatValue(value.amount) : '';

                if (label && amount) {
                    return `${label} (${amount})`;
                }

                return label || amount || 'Empty';
            }

            return Object.entries(value)
                .map(([key, nestedValue]) => `${formatFieldName(key)}: ${formatValue(nestedValue)}`)
                .join(', ');
        }

        // Check if value is a number or numeric string
        if (!isNaN(value) && value !== '') {
            const num = parseFloat(value);
            if (num > 1000) {
                return num.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        }

        return String(value);
    };

    const getPriceHistory = async (id) => {
        try {
            const response = await VehicleService.Queries.getPriceHistory({
                _entity: "VehiclePrice", // Vehicle
                _entity_id: id,
                _action: "Update"
            });


            // console.log("response data", response);

            // console.log("price history response", response);
            if (response.status == "success") {
                setHistoryData(response?.data);
            }
        } catch (error) {
            // console.log("error", error);
        }
    }

    const getVehicleHistory = async (id) => {
        try {
            const response = await VehicleService.Queries.getPriceHistory({
                _entity: "Vehicle",
                _entity_id: id,
                _action: "Update"
            });

            if (response.status == "success") {
                setVehicleHistoryData(response?.data);
            }
        } catch (error) {
            // console.log("error", error);
        }
    }

    // console.log("-----------------------");
    // console.log("setHistoryData", historyData);

    const getCostingPaymentHistory = async (id) => {
        try {
            const [costingRes, paymentRes] = await Promise.all([
                VehicleService.Queries.getPriceHistory({ _entity: "VehiclePurchaseCosting", _entity_id: id }),
                VehicleService.Queries.getPriceHistory({ _entity: "PurchasePayment", _entity_id: id }),
            ]);

            const costingRows = costingRes?.status === "success" ? (costingRes?.data || []) : [];
            const paymentRows = paymentRes?.status === "success" ? (paymentRes?.data || []) : [];

            const merged = [...costingRows, ...paymentRows].sort(
                (a, b) => new Date(b.hl_created_at) - new Date(a.hl_created_at)
            );
            setCostingPaymentHistoryData(merged);
        } catch (error) {
            // console.log("error", error);
        }
    }

    useEffect(() => {
        if (selectedProduct?.v_id) {
            getPriceHistory(selectedProduct?.vehicle_db_price?.vp_id);
            getVehicleHistory(selectedProduct?.v_id);
            getCostingPaymentHistory(selectedProduct?.v_id);
        }
    }, [selectedProduct]);

    // Helper to check if a value is null, undefined, empty, or string "null"
    const isNullOrEmptyValue = (val) => {
        if (val === null || val === undefined || val === '') return true;
        const str = String(val).trim().toLowerCase();
        return str === 'null' || str === 'undefined' || str === 'empty';
    };

    // Filter out null/empty transitions
    const filterValidChanges = (hlValue) => {
        if (!hlValue || typeof hlValue !== 'object') return {};
        const filtered = {};
        for (const [key, value] of Object.entries(hlValue)) {
            if (!value || typeof value !== 'object') continue;
            const oldVal = value.old;
            const newVal = value.new;
            if (isNullOrEmptyValue(oldVal) || isNullOrEmptyValue(newVal) || String(oldVal) === String(newVal)) {
                continue;
            }
            filtered[key] = value;
        }
        return filtered;
    };

    // Derived filtered history data without null changes
    const validPriceHistory = historyData
        .map(item => ({ ...item, filteredChanges: filterValidChanges(item.hl_value) }))
        .filter(item => Object.keys(item.filteredChanges).length > 0);

    const validVehicleHistory = vehicleHistoryData
        .map(item => ({ ...item, filteredChanges: filterValidChanges(item.hl_value) }))
        .filter(item => Object.keys(item.filteredChanges).length > 0);

    const validCostingPaymentHistory = costingPaymentHistoryData
        .map(item => ({ ...item, filteredChanges: filterValidChanges(item.hl_value) }))
        .filter(item => Object.keys(item.filteredChanges).length > 0);

    // hl_action arrives ucfirst()'d only on the leading char (e.g. "Costing_item_added") -
    // normalize underscores/casing into a readable label
    const formatActionLabel = (action) => (action || '').replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    return (
        <Dialog open={open}>
            <DialogContent className="max-w-xl md:max-w-4xl max-h-[80vh] overflow-y-auto [&>button]:hidden">

                <DialogTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                            <span className="inline-block w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
                            Price History
                        </h2>

                        <button
                            onClick={() => setOpen(false)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center"
                        >
                            {/* Close (X) SVG */}
                            <svg
                                className="inline-block w-4 h-4 mr-2 -mt-0.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <line x1="18" y1="6" x2="6" y2="18" />
                                <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Close
                        </button>
                    </div>
                </DialogTitle>

                <div className="p-4">
                    {validPriceHistory.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No price history available.</p>
                    ) : (
                        <div className="space-y-4">
                            {validPriceHistory.map((item, i) => (
                                <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-3 pb-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                                {item.hl_action}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                #{item.hl_id}
                                            </span>
                                        </div>

                                        <div className=" flex items-center">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <span className="text-xs text-gray-500">
                                                Updated by: <span className="font-medium text-gray-700">{item.hl_created_by}</span>
                                            </span>
                                        </div>


                                        <div className="">
                                            <div className="text-sm font-medium text-gray-700 gap-2 flex flex-row ">
                                                <span>
                                                    {new Date(item.hl_created_at).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>

                                                <span>
                                                    {new Date(item.hl_created_at).toLocaleTimeString('en-GB', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Changes */}
                                    <div className="space-y-3">
                                        {Object.entries(item.filteredChanges || {}).map(([key, value]) => (
                                            <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                                <span className="font-medium text-gray-700 min-w-[200px]">
                                                    {formatFieldName(key)}:
                                                </span>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-red-600 bg-red-50 px-3 py-1 rounded line-through">
                                                        {formatValue(value.old)}
                                                    </span>
                                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                    <span className="text-green-600 bg-green-50 px-3 py-1 rounded font-semibold">
                                                        {formatValue(value.new)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Vehicle History Section */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2 mb-4">
                        <span className="inline-block w-2 h-6 bg-purple-600 rounded-sm mr-2"></span>
                        Vehicle History
                    </h3>

                    <div className="p-4">
                        {validVehicleHistory.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No vehicle history available.</p>
                        ) : (
                            <div className="space-y-4">
                                {validVehicleHistory.map((item, i) => (
                                    <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                        {/* Header */}
                                        <div className="flex items-start gap-4 mb-3 pb-3 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                                    {item.hl_action}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    #{item.hl_id}
                                                </span>
                                            </div>

                                            <div className=" flex items-center">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="text-xs text-gray-500">
                                                    Updated by: <span className="font-medium text-gray-700">{item.hl_created_by}</span>
                                                </span>
                                            </div>


                                            <div className="">
                                                <div className="text-sm font-medium text-gray-700 gap-2 flex flex-row ">
                                                    <span>
                                                        {new Date(item.hl_created_at).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>

                                                    <span>
                                                        {new Date(item.hl_created_at).toLocaleTimeString('en-GB', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Changes */}
                                        <div className="space-y-3">
                                            {Object.entries(item.filteredChanges || {}).map(([key, value]) => (
                                                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                                    <span className="font-medium text-gray-700 min-w-[200px]">
                                                        {formatFieldName(key)}:
                                                    </span>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-red-600 bg-red-50 px-3 py-1 rounded line-through">
                                                            {formatValue(value.old)}
                                                        </span>
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded font-semibold">
                                                            {formatValue(value.new)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Costing & Payment History Section */}
                <div className="border-t border-gray-200 pt-6 mt-6">
                    <h3 className="text-xl font-bold text-gray-800 tracking-tight flex items-center gap-2 mb-4">
                        <span className="inline-block w-2 h-6 bg-emerald-600 rounded-sm mr-2"></span>
                        Purchase Costing &amp; Payment History
                    </h3>

                    <div className="p-4">
                        {validCostingPaymentHistory.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">No costing/payment history available.</p>
                        ) : (
                            <div className="space-y-4">
                                {validCostingPaymentHistory.map((item, i) => (
                                    <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                        {/* Header */}
                                        <div className="flex items-start gap-4 mb-3 pb-3 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                                                    {formatActionLabel(item.hl_action)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    #{item.hl_id}
                                                </span>
                                            </div>

                                            <div className=" flex items-center">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span className="text-xs text-gray-500">
                                                    By: <span className="font-medium text-gray-700">{item.hl_created_by}</span>
                                                </span>
                                            </div>

                                            <div className="">
                                                <div className="text-sm font-medium text-gray-700 gap-2 flex flex-row ">
                                                    <span>
                                                        {new Date(item.hl_created_at).toLocaleDateString('en-GB', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </span>

                                                    <span>
                                                        {new Date(item.hl_created_at).toLocaleTimeString('en-GB', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Changes */}
                                        <div className="space-y-3">
                                            {Object.entries(item.filteredChanges || {}).map(([key, value]) => (
                                                <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                                                    <span className="font-medium text-gray-700 min-w-[200px]">
                                                        {formatFieldName(key)}:
                                                    </span>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-red-600 bg-red-50 px-3 py-1 rounded line-through">
                                                            {formatValue(value.old)}
                                                        </span>
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                        <span className="text-green-600 bg-green-50 px-3 py-1 rounded font-semibold">
                                                            {formatValue(value.new)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>



            </DialogContent>
        </Dialog>
    )
}

export default PriceHistoryModal;
