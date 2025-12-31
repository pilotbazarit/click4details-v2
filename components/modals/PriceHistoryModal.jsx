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

    // Format field names to readable text
    const formatFieldName = (key) => {
        const fieldNames = {
            'vp_pbl_additional_amount': 'PBL Additional Amount',
            'vp_pbl_hs_price_status': 'PBL HS Price Status',
            'vp_pbl_price_status': 'PBL Price Status',
            'vp_user_fixed_price': 'User Fixed Price',
            'vp_user_asking_price': 'User Asking Price',
            'vp_purchase_price': 'Purchase Price',
            'vp_variable_price': 'Variable Price',
        };
        return fieldNames[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // Format currency values
    const formatValue = (value) => {
        if (value === null || value === undefined) return 'null';
        if (value === '') return 'Empty';
        // Check if value is a number or numeric string
        if (!isNaN(value) && value !== '') {
            const num = parseFloat(value);
            if (num > 1000) {
                return num.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            }
        }
        return value;
    };

    const getPriceHistory = async (id) => {
        try {
            const response = await VehicleService.Queries.getPriceHistory({
                _entity: "VehiclePrice",
                _entity_id: id,
                _action: "Update"
            });

            // console.log("price history response", response);
            if (response.status == "success") {
                setHistoryData(response?.data);
            }
        } catch (error) {
            // console.log("error", error);
        }
    }

    // console.log("-----------------------");
    // console.log("setHistoryData", historyData);


    useEffect(() => {
        if (selectedProduct?.v_id) {
            getPriceHistory(selectedProduct?.vehicle_db_price?.vp_id);
        }
    }, [selectedProduct]);

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
                    {historyData.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No price history available.</p>
                    ) : (
                        <div className="space-y-4">
                            {historyData.map((item, i) => (
                                <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-3 pb-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                                                {item.hl_action}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                #{item.hl_id}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-700">
                                                {new Date(item.hl_created_at).toLocaleDateString('en-GB', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(item.hl_created_at).toLocaleTimeString('en-GB', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Changes */}
                                    <div className="space-y-3">
                                        {Object.entries(item.hl_value).map(([key, value]) => (
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

                                    {/* Footer */}
                                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span className="text-xs text-gray-500">
                                            Updated by: <span className="font-medium text-gray-700">{item.hl_created_by}</span>
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>






            </DialogContent>
        </Dialog>
    )
}

export default PriceHistoryModal;