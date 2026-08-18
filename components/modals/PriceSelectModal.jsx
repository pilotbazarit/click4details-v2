import React, { useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import VehicleService from '@/services/VehicleService';
import { hasPermission } from '@/lib/utils';

const formatIndianNumber = (value, keepDecimal = false) => {
    const raw = String(value ?? '').trim();
    if (!raw) return '';

    const [integerPartRaw, decimalPartRaw = ''] = raw.replace(/,/g, '').split('.');
    const digits = String(integerPartRaw).replace(/\D+/g, '');
    if (!digits) return '';

    const formattedInteger = new Intl.NumberFormat('en-IN').format(Number(digits));
    if (!keepDecimal || decimalPartRaw.length === 0) return formattedInteger;

    const decimalDigits = decimalPartRaw.replace(/\D+/g, '').slice(0, 2);
    return decimalDigits.length > 0 ? `${formattedInteger}.${decimalDigits}` : formattedInteger;
};

const numberWordsUnderTwenty = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const numberWordsTens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

const numberToWordsBelowThousand = (num) => {
    if (num < 20) return numberWordsUnderTwenty[num];
    if (num < 100) {
        const ten = Math.floor(num / 10);
        const unit = num % 10;
        return unit ? `${numberWordsTens[ten]} ${numberWordsUnderTwenty[unit]}` : numberWordsTens[ten];
    }

    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return remainder
        ? `${numberWordsUnderTwenty[hundred]} Hundred ${numberToWordsBelowThousand(remainder)}`
        : `${numberWordsUnderTwenty[hundred]} Hundred`;
};

const numberToIndianWords = (value) => {
    const numeric = Number(String(value).replace(/\D+/g, ''));
    if (!numeric) return '';
    if (numeric < 1000) return numberToWordsBelowThousand(numeric);

    const parts = [];
    const units = [
        { value: 10000000, label: 'Crore' },
        { value: 100000, label: 'Lakh' },
        { value: 1000, label: 'Thousand' },
    ];

    let remaining = numeric;

    units.forEach((unit) => {
        if (remaining >= unit.value) {
            const count = Math.floor(remaining / unit.value);
            parts.push(`${numberToIndianWords(count)} ${unit.label}`);
            remaining %= unit.value;
        }
    });

    if (remaining > 0) {
        parts.push(numberToWordsBelowThousand(remaining));
    }

    return parts.join(' ').replace(/\s+/g, ' ').trim();
};

const buildPriceOptions = (baseValue) => {
    if (baseValue === null || baseValue === undefined) return [];

    const normalized = String(baseValue).split('.')[0].replace(/\D+/g, '').trim();
    if (normalized.length === 0 || normalized.startsWith('0') || !/^\d+$/.test(normalized)) {
        return [];
    }

    return Array.from({ length: 5 }, (_, i) => {
        const value = `${normalized}${'0'.repeat(i)}`;
        return {
            value,
            label: formatIndianNumber(value),
            words: numberToIndianWords(value),
        };
    });
};

const PriceSelectModal = ({ open, setOpen, product, onShare, selectedCompanyShop, formattedPermissions, isMyShop }) => {
    const [priceType, setPriceType] = useState('fixed'); // 'asking', 'fixed', 'variable'
    const [urgentSale, setUrgentSale] = useState(false);


    // console.log("product::::::::::", product);

    // Get prices from product and make them editable
    const [askingPrice, setAskingPrice] = useState(product?.vehicle_db_price?.vp_user_asking_price || 0);
    const [fixedPrice, setFixedPrice] = useState(product?.vehicle_db_price?.vp_user_fixed_price || 0);
    const [variablePrice, setVariablePrice] = useState(product?.vehicle_db_price?.vp_variable_price || 0);
    const [userCostingPrice, setUserCostingPrice] = useState(product?.vehicle_price?.v_costing_price || 0);
    const [selectedAskingOption, setSelectedAskingOption] = useState('');
    const [isAskingDropdownOpen, setIsAskingDropdownOpen] = useState(false);
    const [selectedFixedOption, setSelectedFixedOption] = useState('');
    const [isFixedDropdownOpen, setIsFixedDropdownOpen] = useState(false);
    const [selectedVariableOption, setSelectedVariableOption] = useState('');
    const [isVariableDropdownOpen, setIsVariableDropdownOpen] = useState(false);
    const askingPriceOptions = useMemo(() => buildPriceOptions(askingPrice), [askingPrice]);
    const fixedPriceOptions = useMemo(() => buildPriceOptions(fixedPrice), [fixedPrice]);
    const variablePriceOptions = useMemo(() => buildPriceOptions(variablePrice), [variablePrice]);

    const updateVehiclePrice = async (priceData) => {
        try {
            const payload = {
                vp_user_asking_price: priceData.type === 'asking' ? priceData.value : askingPrice,
                vp_user_fixed_price: priceData.type === 'fixed' ? priceData.value : fixedPrice,
                vp_variable_price: priceData.type === 'variable' ? priceData.value : variablePrice,
                v_urgent_sale: priceData.urgentSale ? 1 : 0,
                vp_show_price: priceData.urgentSale ? 'fixed' : priceData.type,
                _method: 'PUT'
            };
            if (priceData.urgentSale && (priceData.type === 'fixed' ? priceData.value : fixedPrice)) {
                payload.vp_user_to_pbl_price = priceData.type === 'fixed' ? priceData.value : fixedPrice;
            }
            const response = await VehicleService.Commands.individualVehicleUpdate(product?.v_id, payload);
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


            //  console.log("price select modal.jsx 133", companyShopId);

        // const hasPermissionOld = formattedPermissions.some(
        //     permission =>
        //         permission.shopId === companyShopId &&
        //         (permission.section === "Vehicle" || permission.section === "*") &&
        //         (permission.action === priceAction || permission.action === "*")
        // );

        if (urgentSale && (!fixedPrice || Number(String(fixedPrice).replace(/,/g, "")) <= 0)) {
            toast.error("Fixed Price is mandatory to select Urgent Sale.");
            return;
        }

        // Prepare price data to send
        const priceData = {
            type: urgentSale ? 'fixed' : priceType,
            value: (urgentSale || priceType === 'fixed') ? fixedPrice : (priceType === 'asking' ? askingPrice : variablePrice),
            urgentSale
        };

        onShare(priceData);
        setOpen(false);

        if (hasPermission || isMyShop) {
            updateVehiclePrice(priceData);
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
    const hasAskingPricePermission =
        isMyShop ||
        hasPermission(
            formattedPermissions,
            Number(selectedCompanyShop?.shop?.s_id),
            "Vehicle",
            "UpdateAskingPrice"
        );
    const hasFixedPricePermission =
        isMyShop ||
        hasPermission(
            formattedPermissions,
            Number(selectedCompanyShop?.shop?.s_id),
            "Vehicle",
            "UpdateFixedPrice"
        );
    const hasVariablePricePermission =
        isMyShop ||
        hasPermission(
            formattedPermissions,
            Number(selectedCompanyShop?.shop?.s_id),
            "Vehicle",
            "UpdateVariablePrice"
        );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent
                onOpenAutoFocus={(e) => e.preventDefault()}
                className="sm:max-w-md w-[95vw] max-h-[90dvh] p-0 flex flex-col gap-0 overflow-hidden"
            >
                <DialogHeader className="px-4 pt-4 pb-2">
                    <DialogTitle className="text-center text-lg font-semibold">Select Price</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
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
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    disabled={!hasAskingPricePermission}
                                    value={formatIndianNumber(askingPrice)}
                                    onChange={(e) => {
                                        const nextValue = e.target.value.replace(/\D+/g, '').slice(0, 12);
                                        setAskingPrice(nextValue);
                                        setSelectedAskingOption('');
                                        setIsAskingDropdownOpen(nextValue.length > 0);
                                    }}
                                    onFocus={() => setIsAskingDropdownOpen(hasAskingPricePermission && askingPriceOptions.length > 0)}
                                    onBlur={() => {
                                        setTimeout(() => setIsAskingDropdownOpen(false), 120);
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                    placeholder="Enter asking price"
                                />
                                {isAskingDropdownOpen && askingPriceOptions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                        {askingPriceOptions.map((option) => {
                                            const isSelected = selectedAskingOption === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                                    onClick={() => {
                                                        setAskingPrice(option.value);
                                                        setSelectedAskingOption(option.value);
                                                        setPriceType('asking');
                                                        setIsAskingDropdownOpen(false);
                                                    }}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                                                        <p className="mt-1 text-xs text-gray-700">{option.words}</p>
                                                    </div>
                                                    {/* <span className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-blue-600' : 'border-gray-400'}`}>
                                                        {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                                                    </span> */}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
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
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    disabled={!hasFixedPricePermission}
                                    value={formatIndianNumber(fixedPrice, true)}
                                    onChange={(e) => {
                                        const nextValue = String(e.target.value).split('.')[0].replace(/\D+/g, '').slice(0, 12);
                                        setFixedPrice(nextValue);
                                        setSelectedFixedOption('');
                                        setIsFixedDropdownOpen(nextValue.length > 0);
                                    }}
                                    onFocus={() => setIsFixedDropdownOpen(hasFixedPricePermission && fixedPriceOptions.length > 0)}
                                    onBlur={() => {
                                        setTimeout(() => setIsFixedDropdownOpen(false), 120);
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                    placeholder="Enter fixed price"
                                />
                                {isFixedDropdownOpen && fixedPriceOptions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                        {fixedPriceOptions.map((option) => {
                                            const isSelected = selectedFixedOption === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                                    onClick={() => {
                                                        setFixedPrice(option.value);
                                                        setSelectedFixedOption(option.value);
                                                        setPriceType('fixed');
                                                        setIsFixedDropdownOpen(false);
                                                    }}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                                                        <p className="mt-1 text-xs text-gray-700">{option.words}</p>
                                                    </div>
                                                    {/* <span className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-blue-600' : 'border-gray-400'}`}>
                                                        {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                                                    </span> */}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
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
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    disabled={!hasVariablePricePermission}
                                    value={formatIndianNumber(variablePrice, true)}
                                    onChange={(e) => {
                                        const nextValue = String(e.target.value).split('.')[0].replace(/\D+/g, '').slice(0, 12);
                                        setVariablePrice(nextValue);
                                        setSelectedVariableOption('');
                                        setIsVariableDropdownOpen(nextValue.length > 0);
                                    }}
                                    onFocus={() => setIsVariableDropdownOpen(hasVariablePricePermission && variablePriceOptions.length > 0)}
                                    onBlur={() => {
                                        setTimeout(() => setIsVariableDropdownOpen(false), 120);
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                    placeholder="Enter variable price"
                                />
                                {isVariableDropdownOpen && variablePriceOptions.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-72 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-sm">
                                        {variablePriceOptions.map((option) => {
                                            const isSelected = selectedVariableOption === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    type="button"
                                                    onMouseDown={(e) => e.preventDefault()}
                                                    className="flex w-full items-start justify-between gap-3 border-b border-gray-200 px-3 py-2 text-left last:border-b-0 hover:bg-gray-50"
                                                    onClick={() => {
                                                        setVariablePrice(option.value);
                                                        setSelectedVariableOption(option.value);
                                                        setPriceType('variable');
                                                        setIsVariableDropdownOpen(false);
                                                    }}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-900">{option.label}</p>
                                                        <p className="mt-1 text-xs text-gray-700">{option.words}</p>
                                                    </div>
                                                    {/* <span className={`mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? 'border-blue-600' : 'border-gray-400'}`}>
                                                        {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> : null}
                                                    </span> */}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
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
                        onClick={() => {
                            const nextVal = !urgentSale;
                            setUrgentSale(nextVal);
                            if (nextVal) {
                                setPriceType('fixed');
                            }
                        }}
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
                </div>

                {/* Action Buttons */}
                <div className="px-4 py-3 border-t bg-white">
                    <div className="flex gap-3">
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
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default PriceSelectModal
