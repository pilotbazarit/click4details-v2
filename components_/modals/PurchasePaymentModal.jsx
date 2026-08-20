import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Receipt, Paperclip, Plus } from "lucide-react";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import PurchasePaymentService from '@/services/PurchasePaymentService';
import SupplierService from '@/services/SupplierService';
import { formatPrice } from '@/helpers/functions';

const ENTITY_SEARCH_MIN_LENGTH = 2;

// same canonical payment methods used by the sales-side Client Payment History modal
const METHOD_OPTIONS = [
    { value: "cash", label: "Cash" },
    { value: "cash_deposit", label: "Cash Deposit" },
    { value: "advance", label: "Advance" },
    { value: "bank_check", label: "Bank Check" },
    { value: "pay_order", label: "Pay Order" },
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "rtgs", label: "RTGS" },
    { value: "credit_card", label: "Credit Card" },
    { value: "debit_card", label: "Debit Card" },
    { value: "loan", label: "Loan" },
    { value: "mfs", label: "MFS" },
    { value: "bkash", label: "Bkash" },
    { value: "nagad", label: "Nagad" },
    { value: "rocket", label: "Rocket" },
    { value: "others", label: "Others" },
];

// small inline "Add Supplier" popup - just enough fields to create a usable
// supplier record without leaving the payment form
const AddSupplierModal = ({ open, setOpen, onCreated }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (open) {
            setName('');
            setPhone('');
            setAddress('');
        }
    }, [open]);

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error('Supplier name is required.');
            return;
        }
        try {
            setSaving(true);
            const response = await SupplierService.Commands.createSupplier({
                s_name: name.trim(),
                s_phone: phone || null,
                s_address: address || null,
                s_status: 'active',
            });
            toast.success('Supplier added.');
            onCreated?.(response?.data);
            setOpen(false);
        } catch (error) {
            toast.error(error?.response?.data?.message || error.message || 'Failed to add supplier');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-sm p-0 overflow-hidden">
                <div className="bg-teal-600 px-4 py-3 flex items-center justify-between">
                    <DialogHeader>
                        <DialogTitle className="text-white text-base">Add Supplier</DialogTitle>
                    </DialogHeader>
                </div>
                <div className="p-4 grid gap-3">
                    <div>
                        <Label htmlFor="new-supplier-name">Name</Label>
                        <Input id="new-supplier-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Supplier name" disabled={saving} />
                    </div>
                    <div>
                        <Label htmlFor="new-supplier-phone">Phone</Label>
                        <Input id="new-supplier-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" disabled={saving} />
                    </div>
                    <div>
                        <Label htmlFor="new-supplier-address">Address</Label>
                        <Input id="new-supplier-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" disabled={saving} />
                    </div>
                    <div className="flex justify-end gap-2 mt-1">
                        <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded text-sm border border-gray-300 text-gray-700 hover:bg-gray-50" disabled={saving}>
                            Cancel
                        </button>
                        <button type="button" onClick={handleSave} className="px-4 py-2 rounded text-sm bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50" disabled={saving}>
                            {saving ? 'Saving...' : 'Save Supplier'}
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

const entityTypeFromFqcn = (fqcn) => {
    if (!fqcn) return null;
    return fqcn.includes('Vehicle') ? 'vehicle' : 'product';
};

const toDatetimeLocal = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const schema = yup.object().shape({
    payment_against: yup.string().oneOf(['purchase_price', 'db_costing_price', 'purchase_costing', 'other_costing']).required('Payment bucket is required'),
    reason: yup.string().nullable(),
    amount: yup.number().typeError('Amount is required').positive('Amount must be greater than 0').required('Amount is required'),
    currency: yup.string().oneOf(['BDT', 'USD', 'YEN']).required('Currency is required'),
    conv_rate: yup.number().nullable().transform((value, original) => (original === '' ? null : value)),
    method: yup.string().nullable(),
    transaction_ref: yup.string().nullable(),
    bank_name: yup.string().nullable(),
    branch_name: yup.string().nullable(),
    remark: yup.string().nullable(),
    paid_at: yup.string().nullable(),
});

const PurchasePaymentModal = ({ open, setOpen, onSaved, initialData, prefillEntityOption }) => {
    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            payment_against: 'purchase_price',
            currency: 'BDT',
        },
    });

    const [entityOption, setEntityOption] = useState(null);
    const [pricing, setPricing] = useState(null);
    const [calculations, setCalculations] = useState([]);
    const [selectedCalculationId, setSelectedCalculationId] = useState('');
    const [docs, setDocs] = useState([]);
    const [supplierOptions, setSupplierOptions] = useState([]);
    const [selectedSupplierId, setSelectedSupplierId] = useState('');
    const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
    const entitySearchDebounceRef = useRef(null);
    const docsInputRef = useRef(null);
    // tracks the bucket the reason field was last set for, so we only clear
    // it on a genuine user-driven bucket change, not on the initial reset()
    const previousBucketRef = useRef('purchase_price');

    const watchedAmount = watch('amount');
    const watchedCurrency = watch('currency');
    const watchedConvRate = watch('conv_rate');
    const watchedBucket = watch('payment_against');

    const isVehicle = entityOption?.entity_type === 'vehicle';
    const selectedCalculation = calculations.find((c) => String(c.vpc_id) === String(selectedCalculationId)) || null;
    const isCalcLinked = !!selectedCalculation;
    const isProduct = entityOption?.entity_type === 'product';

    const fetchPricing = useCallback(async (option) => {
        if (!option?.entity_type || !option?.entity_id) {
            setPricing(null);
            return;
        }
        try {
            const response = await PurchasePaymentService.Queries.getEntityPricing({
                entity_type: option.entity_type,
                entity_id: option.entity_id,
            });
            if (response?.status === 'success') {
                setPricing(response.data);
            }
        } catch {
            setPricing(null);
        }
    }, []);

    const fetchCalculations = useCallback(async (option, preferredCalcId = null) => {
        if (option?.entity_type !== 'vehicle' || !option?.entity_id) {
            setCalculations([]);
            setSelectedCalculationId('');
            return;
        }
        try {
            const response = await PurchasePaymentService.Queries.getCalculations({ vehicle_id: option.entity_id });
            const list = response?.status === 'success' ? (response.data || []) : [];
            setCalculations(list);
            if (preferredCalcId && list.some((c) => String(c.vpc_id) === String(preferredCalcId))) {
                setSelectedCalculationId(String(preferredCalcId));
            } else {
                const active = list.find((c) => c.vpc_is_active);
                setSelectedCalculationId(active ? String(active.vpc_id) : '');
            }
        } catch {
            setCalculations([]);
            setSelectedCalculationId('');
        }
    }, []);

    const fetchSuppliers = useCallback(async () => {
        try {
            const response = await SupplierService.Queries.getSuppliers({ _page: 1, _perPage: 1000, _status: 'active' });
            const rows = response?.data?.data || [];
            setSupplierOptions(rows.map((s) => ({ value: s.s_id, label: s.s_name })));
        } catch {
            setSupplierOptions([]);
        }
    }, []);

    useEffect(() => {
        if (!open) return;

        setDocs([]);
        if (docsInputRef.current) docsInputRef.current.value = '';
        fetchSuppliers();

        if (initialData) {
            const type = entityTypeFromFqcn(initialData.pp_entity);
            const option = {
                value: `${type}-${initialData.pp_entity_id}`,
                entity_type: type,
                entity_id: initialData.pp_entity_id,
                label: `[${type === 'vehicle' ? 'Vehicle' : 'Product'}] #${initialData.pp_entity_id}`,
            };
            setEntityOption(option);
            fetchPricing(option);
            fetchCalculations(option, initialData.pp_calculation_id || null);
            setSelectedSupplierId(initialData.pp_supplier_id || '');
            previousBucketRef.current = initialData.pp_payment_against || 'purchase_price';
            reset({
                payment_against: initialData.pp_payment_against || 'purchase_price',
                reason: initialData.pp_reason || '',
                amount: initialData.pp_amount || '',
                currency: initialData.pp_currency || 'BDT',
                conv_rate: initialData.pp_conv_rate || '',
                method: initialData.pp_method || '',
                transaction_ref: initialData.pp_transaction_ref || '',
                bank_name: initialData.pp_bank_name || '',
                branch_name: initialData.pp_branch_name || '',
                remark: initialData.pp_remark || '',
                paid_at: toDatetimeLocal(initialData.pp_paid_at),
            });
        } else {
            const option = prefillEntityOption || null;
            setEntityOption(option);
            fetchPricing(option);
            fetchCalculations(option);
            setSelectedSupplierId('');
            previousBucketRef.current = 'purchase_price';
            reset({
                payment_against: 'purchase_price',
                reason: '',
                amount: '',
                currency: 'BDT',
                conv_rate: '',
                method: '',
                transaction_ref: '',
                bank_name: '',
                branch_name: '',
                remark: '',
                paid_at: toDatetimeLocal(new Date()),
            });
        }
    }, [open, initialData, prefillEntityOption, reset, fetchPricing, fetchCalculations, fetchSuppliers]);

    // switch bucket default when a calculation gets linked/unlinked
    useEffect(() => {
        if (!open) return;
        if (isCalcLinked && !['purchase_costing', 'other_costing'].includes(watchedBucket)) {
            setValue('payment_against', 'purchase_costing');
        }
        if (!isCalcLinked && !['purchase_price', 'db_costing_price'].includes(watchedBucket)) {
            setValue('payment_against', 'purchase_price');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCalcLinked, open]);

    // the reasons already recorded on this calculation's costing rows for the
    // selected bucket - lets the user pick a matching reason instead of retyping it
    const availableReasons = useMemo(() => {
        if (!isCalcLinked) return [];
        const section = watchedBucket === 'other_costing' ? 'other_costing' : 'purchase_costing';
        const reasons = (selectedCalculation?.items || [])
            .filter((item) => item.vpci_section === section)
            .map((item) => item.vpci_reason)
            .filter(Boolean);
        return Array.from(new Set(reasons));
    }, [isCalcLinked, selectedCalculation, watchedBucket]);

    // clear a stale reason when the bucket changes away from the one it belonged to
    useEffect(() => {
        if (!open) return;
        if (previousBucketRef.current !== watchedBucket) {
            setValue('reason', '');
            previousBucketRef.current = watchedBucket;
        }
    }, [watchedBucket, setValue]);

    // auto-fill conversion rate from the entity's price record once, when it loads
    useEffect(() => {
        if (pricing?.conv_rate && !watchedConvRate) {
            setValue('conv_rate', pricing.conv_rate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pricing]);

    const loadEntityOptions = useCallback((inputValue) => {
        return new Promise((resolve) => {
            const q = String(inputValue ?? '').trim();
            if (q.length < ENTITY_SEARCH_MIN_LENGTH) {
                resolve([]);
                return;
            }

            if (entitySearchDebounceRef.current) {
                clearTimeout(entitySearchDebounceRef.current);
            }

            entitySearchDebounceRef.current = setTimeout(async () => {
                try {
                    const res = await PurchasePaymentService.Queries.searchEntities({ search: q });
                    const items = Array.isArray(res?.data) ? res.data : [];
                    resolve(
                        items.map((item) => ({
                            value: `${item.entity_type}-${item.entity_id}`,
                            entity_type: item.entity_type,
                            entity_id: item.entity_id,
                            label: `[${item.entity_type === 'vehicle' ? 'Vehicle' : 'Product'}] ${item.title || '-'} (${item.code || '-'})`,
                        }))
                    );
                } catch {
                    resolve([]);
                }
            }, 400);
        });
    }, []);

    const handleEntityChange = (option) => {
        setEntityOption(option);
        fetchPricing(option);
        fetchCalculations(option);
    };

    const previewAmounts = useMemo(() => {
        const amount = Number(watchedAmount);
        const rate = Number(watchedConvRate);
        if (!amount || Number.isNaN(amount)) return { bdt: null, usd: null, conv: null };

        let conv = null;
        if (isCalcLinked) {
            conv = watchedCurrency === selectedCalculation.vpc_to_currency ? amount : (rate ? amount * rate : null);
        }

        if (watchedCurrency === 'USD') {
            return { bdt: rate ? amount * rate : null, usd: amount, conv };
        }
        if (watchedCurrency === 'BDT') {
            return { bdt: amount, usd: rate ? amount / rate : null, conv };
        }
        return { bdt: null, usd: null, conv };
    }, [watchedAmount, watchedCurrency, watchedConvRate, isCalcLinked, selectedCalculation]);

    const onSubmit = async (data) => {
        if (!entityOption?.entity_type || !entityOption?.entity_id) {
            toast.error('Please select a vehicle or product.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('entity_type', entityOption.entity_type);
            formData.append('entity_id', entityOption.entity_id);
            if (selectedCalculationId) formData.append('calculation_id', selectedCalculationId);
            if (selectedSupplierId) formData.append('supplier_id', selectedSupplierId);
            formData.append('payment_against', data.payment_against);
            if (data.reason) formData.append('reason', data.reason);
            formData.append('amount', data.amount);
            formData.append('currency', data.currency);
            if (data.conv_rate) formData.append('conv_rate', data.conv_rate);
            if (data.method) formData.append('method', data.method);
            if (data.transaction_ref) formData.append('transaction_ref', data.transaction_ref);
            if (data.bank_name) formData.append('bank_name', data.bank_name);
            if (data.branch_name) formData.append('branch_name', data.branch_name);
            if (data.remark) formData.append('remark', data.remark);
            if (data.paid_at) formData.append('paid_at', new Date(data.paid_at).toISOString());
            docs.forEach((file) => formData.append('pp_docs[]', file));

            if (initialData) {
                formData.append('_method', 'PUT');
                await PurchasePaymentService.Commands.updatePurchasePayment(initialData.pp_id, formData);
                toast.success('Purchase payment updated successfully!');
            } else {
                await PurchasePaymentService.Commands.createPurchasePayment(formData);
                toast.success('Purchase payment recorded successfully!');
            }
            onSaved?.();
            setOpen(false);
        } catch (error) {
            if (error?.response?.data?.errors) {
                Object.values(error.response.data.errors).forEach((e) => toast.error(Array.isArray(e) ? e[0] : e));
            } else {
                toast.error(error?.response?.data?.message || error.message || 'Something went wrong');
            }
        }
    };

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) reset();
    };

    return (
        <>
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl overflow-hidden p-0">
                <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white text-xl">
                            <Receipt className="h-6 w-6" />
                            {initialData ? 'Edit Purchase Payment' : 'Add Purchase Payment'}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="mt-1 text-sm text-teal-100">
                        Record a partial or full payment against a vehicle/product's purchase costing.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 max-h-[70vh] overflow-y-auto">
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="pp-entity-select">Vehicle / Product</Label>
                            <AsyncSelect
                                inputId="pp-entity-select"
                                cacheOptions={false}
                                defaultOptions={false}
                                loadOptions={loadEntityOptions}
                                value={entityOption}
                                onChange={handleEntityChange}
                                placeholder="Search by title or code..."
                                isClearable
                                isDisabled={!!initialData}
                                openMenuOnClick={false}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                noOptionsMessage={({ inputValue }) => {
                                    const q = String(inputValue ?? '').trim();
                                    if (q.length < ENTITY_SEARCH_MIN_LENGTH) return 'Type at least 2 characters...';
                                    return 'No vehicle/product found';
                                }}
                            />
                        </div>

                        {isVehicle && calculations.length > 0 && (
                            <div>
                                <Label htmlFor="pp-calculation-select">Calculation</Label>
                                <select
                                    id="pp-calculation-select"
                                    className="outline-none py-2 px-3 rounded border border-gray-400 w-full h-10"
                                    value={selectedCalculationId}
                                    onChange={(e) => setSelectedCalculationId(e.target.value)}
                                    disabled={isSubmitting}
                                >
                                    <option value="">No calculation (standalone payment)</option>
                                    {calculations.map((calc) => (
                                        <option key={calc.vpc_id} value={calc.vpc_id}>
                                            {calc.vpc_type.charAt(0).toUpperCase() + calc.vpc_type.slice(1)} ({calc.vpc_from_currency}→{calc.vpc_to_currency}){calc.vpc_is_active ? ' — active' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {isCalcLinked && selectedCalculation?.summary ? (
                            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 border border-gray-200 rounded p-3">
                                <div>
                                    <div className="text-gray-500 uppercase">Fixed</div>
                                    <div className="font-semibold">
                                        {formatPrice(selectedCalculation.summary.purchase_costing_total || 0)} {selectedCalculation.vpc_to_currency}
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-blue-700 font-semibold">Paid: {formatPrice(selectedCalculation.summary.purchase_costing_paid || 0)}</span>
                                        <span className="text-slate-400 mx-1">·</span>
                                        <span className="text-slate-600 font-semibold">Due: {formatPrice(selectedCalculation.summary.purchase_costing_due || 0)}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500 uppercase">General</div>
                                    <div className="font-semibold">
                                        {formatPrice(selectedCalculation.summary.other_costing_total || 0)} {selectedCalculation.vpc_to_currency}
                                    </div>
                                    <div className="mt-1">
                                        <span className="text-blue-700 font-semibold">Paid: {formatPrice(selectedCalculation.summary.other_costing_paid || 0)}</span>
                                        <span className="text-slate-400 mx-1">·</span>
                                        <span className="text-slate-600 font-semibold">Due: {formatPrice(selectedCalculation.summary.other_costing_due || 0)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : pricing && (
                            <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 border border-gray-200 rounded p-3">
                                <div>
                                    <div className="text-gray-500 uppercase">Fixed</div>
                                    <div className="font-semibold">{pricing.purchase_price !== null ? formatPrice(pricing.purchase_price) : 'N/A'}</div>
                                    <div className="mt-1">
                                        <span className="text-blue-700 font-semibold">Paid: {formatPrice(pricing.purchase_price_paid || 0)}</span>
                                        <span className="text-slate-400 mx-1">·</span>
                                        <span className="text-slate-600 font-semibold">
                                            Due: {formatPrice(Math.max(0, Number(pricing.purchase_price || 0) - Number(pricing.purchase_price_paid || 0)))}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-500 uppercase">General</div>
                                    <div className="font-semibold">{pricing.other_charge_total !== null ? formatPrice(pricing.other_charge_total) : 'N/A'}</div>
                                    {pricing.other_charge_total !== null && (
                                        <div className="mt-1">
                                            <span className="text-blue-700 font-semibold">Paid: {formatPrice(pricing.db_costing_price_paid || 0)}</span>
                                            <span className="text-slate-400 mx-1">·</span>
                                            <span className="text-slate-600 font-semibold">
                                                Due: {formatPrice(Math.max(0, Number(pricing.other_charge_total || 0) - Number(pricing.db_costing_price_paid || 0)))}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="amount">Amount</Label>
                                <Input
                                    className="border-gray-400"
                                    type="number"
                                    step="0.01"
                                    {...register('amount')}
                                    id="amount"
                                    placeholder="0.00"
                                    disabled={isSubmitting}
                                />
                                {errors.amount && <p className="text-red-600 text-sm">{errors.amount.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="currency">Currency</Label>
                                <select
                                    id="currency"
                                    className="outline-none py-2 px-3 rounded border border-gray-400 w-full h-10"
                                    {...register('currency')}
                                    disabled={isSubmitting}
                                >
                                    <option value="BDT">BDT</option>
                                    <option value="USD">USD</option>
                                    <option value="YEN">YEN</option>
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="conv_rate">
                                    {isCalcLinked
                                        ? `Conv. Rate (to ${selectedCalculation.vpc_to_currency})`
                                        : 'Conv. Rate (BDT/USD)'}
                                </Label>
                                <Input
                                    className="border-gray-400"
                                    type="number"
                                    step="0.000001"
                                    {...register('conv_rate')}
                                    id="conv_rate"
                                    placeholder="e.g. 110"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        {(previewAmounts.bdt !== null || previewAmounts.usd !== null || previewAmounts.conv !== null) && (
                            <div className="text-xs text-gray-600 bg-emerald-50 border border-emerald-200 rounded p-2">
                                {isCalcLinked && previewAmounts.conv !== null && (
                                    <span className="font-semibold">
                                        = {formatPrice(previewAmounts.conv.toFixed(2))} {selectedCalculation.vpc_to_currency}
                                        {' '}(counts toward this calculation) ·{' '}
                                    </span>
                                )}
                                ≈ {previewAmounts.bdt !== null ? formatPrice(previewAmounts.bdt.toFixed(2)) : '-'} BDT
                                {' / '}
                                {previewAmounts.usd !== null ? formatPrice(previewAmounts.usd.toFixed(2)) : '-'} USD
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="payment_against">Payment Against</Label>
                                <select
                                    id="payment_against"
                                    className="outline-none py-2 px-3 rounded border border-gray-400 w-full h-10"
                                    {...register('payment_against')}
                                    disabled={isSubmitting}
                                >
                                    {isCalcLinked ? (
                                        <>
                                            <option value="purchase_costing">Fixed</option>
                                            <option value="other_costing">General</option>
                                        </>
                                    ) : (
                                        <>
                                            <option value="purchase_price">Fixed</option>
                                            <option value="db_costing_price" disabled={isProduct}>
                                                General{isProduct ? ' (not tracked for products)' : ''}
                                            </option>
                                        </>
                                    )}
                                </select>
                                {errors.payment_against && <p className="text-red-600 text-sm">{errors.payment_against.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="reason">Reason</Label>
                                {availableReasons.length > 0 ? (
                                    <select
                                        id="reason"
                                        className="outline-none py-2 px-3 rounded border border-gray-400 w-full h-10"
                                        {...register('reason')}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select reason</option>
                                        {availableReasons.map((reason) => (
                                            <option key={reason} value={reason}>{reason}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <Input
                                        className="border-gray-400"
                                        {...register('reason')}
                                        id="reason"
                                        placeholder="Reason (optional)"
                                        disabled={isSubmitting}
                                    />
                                )}
                            </div>
                            <div>
                                <Label htmlFor="paid_at">Paid At</Label>
                                <Input
                                    className="border-gray-400"
                                    type="datetime-local"
                                    {...register('paid_at')}
                                    id="paid_at"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="pp-supplier-select">Supplier / Vendor</Label>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <Select
                                            inputId="pp-supplier-select"
                                            options={supplierOptions}
                                            value={supplierOptions.find((o) => String(o.value) === String(selectedSupplierId)) || null}
                                            onChange={(option) => setSelectedSupplierId(option?.value || '')}
                                            isClearable
                                            isDisabled={isSubmitting}
                                            placeholder="Select supplier"
                                            className="react-select-container"
                                            classNamePrefix="react-select"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddSupplierModal(true)}
                                        className="inline-flex items-center justify-center h-10 w-10 shrink-0 rounded border border-teal-500 text-teal-700 hover:bg-teal-50"
                                        aria-label="Add supplier"
                                        title="Add supplier"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="transaction_ref">Transaction ID / Cheque Name / Ref</Label>
                                <Input
                                    className="border-gray-400"
                                    {...register('transaction_ref')}
                                    id="transaction_ref"
                                    placeholder="Transaction ID / Cheque / Ref"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="bank_name">Bank Name</Label>
                                <Input
                                    className="border-gray-400"
                                    {...register('bank_name')}
                                    id="bank_name"
                                    placeholder="Bank name"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <Label htmlFor="branch_name">Branch Name</Label>
                                <Input
                                    className="border-gray-400"
                                    {...register('branch_name')}
                                    id="branch_name"
                                    placeholder="Branch name"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <Label htmlFor="method">Payment Method</Label>
                                <select
                                    id="method"
                                    className="outline-none py-2 px-3 rounded border border-gray-400 w-full h-10"
                                    {...register('method')}
                                    disabled={isSubmitting}
                                >
                                    <option value="">Select method</option>
                                    {METHOD_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="pp_docs">Payment Documents</Label>
                            <div className="mt-1 flex items-center gap-3">
                                <label
                                    htmlFor="pp_docs"
                                    className="cursor-pointer inline-flex items-center gap-2 border border-teal-500 text-teal-700 px-3 py-1.5 rounded text-sm hover:bg-teal-50 transition"
                                >
                                    <Paperclip className="h-4 w-4" />
                                    {docs.length > 0 ? `${docs.length} file(s) selected` : 'Attach documents'}
                                </label>
                                <input
                                    ref={docsInputRef}
                                    id="pp_docs"
                                    type="file"
                                    multiple
                                    accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                                    onChange={(e) => setDocs(Array.from(e.target.files || []))}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="remark">Remark</Label>
                            <textarea
                                id="remark"
                                rows={3}
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full resize-none"
                                {...register('remark')}
                                placeholder="Any note about this payment"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-6 py-2.5 rounded font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-teal-600 text-white px-6 py-2.5 rounded font-medium disabled:opacity-50 hover:bg-teal-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Processing...' : (initialData ? 'Update Payment' : 'Add Payment')}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>

        <AddSupplierModal
            open={showAddSupplierModal}
            setOpen={setShowAddSupplierModal}
            onCreated={(supplier) => {
                if (!supplier?.s_id) return;
                setSupplierOptions((prev) => [{ value: supplier.s_id, label: supplier.s_name }, ...prev]);
                setSelectedSupplierId(supplier.s_id);
            }}
        />
        </>
    )
}

export default PurchasePaymentModal;
