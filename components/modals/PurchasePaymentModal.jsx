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
import { buildAmountOptions } from '@/helpers/amountSuggestions';

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

// required-field label: bigger + a red asterisk, matching the convention
// already used elsewhere in the app (e.g. ViewProductForm.jsx)
const RequiredLabel = ({ htmlFor, children }) => (
    <Label htmlFor={htmlFor} className="text-base font-semibold">
        {children} <span className="text-red-500 text-base">*</span>
    </Label>
);

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

// mirrors applyRowFieldChange in VehiclePurchaseCalculationPanel.jsx - keeps
// amount (from-currency) and toAmount (to-currency) in sync via conv_rate,
// remembering which side the user is actively editing so the anchor field
// never drifts while the rate is being typed digit by digit
const syncDualAmount = (field, value, state) => {
    const rate = field === 'conv_rate' ? Number(value) : Number(state.convRate);

    if (field === 'amount') {
        const toAmount = value === '' ? '' : rate > 0 ? (Number(value) * rate).toFixed(2) : state.toAmount;
        return { amount: value, toAmount, convRate: state.convRate, lastEditedSide: 'from' };
    }
    if (field === 'toAmount') {
        const amount = value === '' ? '' : rate > 0 ? (Number(value) / rate).toFixed(2) : state.amount;
        return { amount, toAmount: value, convRate: state.convRate, lastEditedSide: 'to' };
    }
    // field === 'conv_rate'
    let amount = state.amount;
    let toAmount = state.toAmount;
    if (rate > 0) {
        if (state.lastEditedSide === 'to' && state.toAmount !== '') {
            amount = (Number(state.toAmount) / rate).toFixed(2);
        } else if (state.amount !== '') {
            toAmount = (Number(state.amount) * rate).toFixed(2);
        }
    }
    return { amount, toAmount, convRate: value, lastEditedSide: state.lastEditedSide };
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
    // calc-linked payments show a second, directly-editable to-currency amount
    // field kept in sync with `amount` (from-currency) via conv_rate
    const [toAmount, setToAmount] = useState('');
    const lastEditedSideRef = useRef('from');
    // amount-field magnitude suggestion dropdown (same feature as the costing panel)
    const [amountDropdownTarget, setAmountDropdownTarget] = useState(null); // 'amount' | 'to_amount'
    const [amountAnchorRect, setAmountAnchorRect] = useState(null);
    const amountInputRef = useRef(null);

    const watchedAmount = watch('amount');
    const watchedCurrency = watch('currency');
    const watchedConvRate = watch('conv_rate');
    const watchedBucket = watch('payment_against');
    const watchedReason = watch('reason');

    const isVehicle = entityOption?.entity_type === 'vehicle';
    const selectedCalculation = calculations.find((c) => String(c.vpc_id) === String(selectedCalculationId)) || null;
    const isCalcLinked = !!selectedCalculation;
    const isProduct = entityOption?.entity_type === 'product';
    // calc-linked payments always enter the amount in the calculation's own
    // from-currency; a second to-currency field only shows when they differ
    const sameCurrency = isCalcLinked && selectedCalculation.vpc_from_currency === selectedCalculation.vpc_to_currency;
    const dualCurrency = isCalcLinked && !sameCurrency;
    const generalCostLocked = isCalcLinked ? !!selectedCalculation?.general_cost_locked : !!pricing?.general_cost_locked;

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
            setToAmount(initialData.pp_conv_amount !== null && initialData.pp_conv_amount !== undefined ? String(initialData.pp_conv_amount) : '');
            lastEditedSideRef.current = 'from';
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
            setToAmount('');
            lastEditedSideRef.current = 'from';
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

    // switch bucket default when a calculation gets linked/unlinked, or when
    // the current bucket is General but the user doesn't have GeneralCost access
    useEffect(() => {
        if (!open) return;
        if (isCalcLinked && (!['purchase_costing', 'other_costing'].includes(watchedBucket) || (generalCostLocked && watchedBucket === 'other_costing'))) {
            setValue('payment_against', 'purchase_costing');
        }
        if (!isCalcLinked && (!['purchase_price', 'db_costing_price'].includes(watchedBucket) || (generalCostLocked && watchedBucket === 'db_costing_price'))) {
            setValue('payment_against', 'purchase_price');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCalcLinked, open, generalCostLocked]);

    // calc-linked payments always enter the amount in the calculation's own
    // from-currency, and the rate is fixed at 1 whenever the pair matches
    useEffect(() => {
        if (!open || !isCalcLinked) return;
        setValue('currency', selectedCalculation.vpc_from_currency);
        if (sameCurrency) {
            setValue('conv_rate', 1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, isCalcLinked, selectedCalculation?.vpc_id, sameCurrency]);

    // per-reason target/paid/due for the selected bucket, from the calculation's
    // reason_summary - only reasons that still have something due are offered,
    // and picking one shows/caps the amount to what's actually left on it
    const reasonDueMap = useMemo(() => {
        if (!isCalcLinked) return {};
        const section = watchedBucket === 'other_costing' ? 'other_costing' : 'purchase_costing';
        return selectedCalculation?.reason_summary?.[section] || {};
    }, [isCalcLinked, selectedCalculation, watchedBucket]);

    const availableReasons = useMemo(() => {
        // keep the currently-selected reason in the list even at due=0 (e.g.
        // editing the one payment that fully covers it), so editing doesn't
        // make the saved reason disappear from its own dropdown. due_amount
        // (from-currency) is the operative figure since that's the currency
        // the amount field is entered in for calc-linked payments.
        return Object.entries(reasonDueMap)
            .filter(([reason, info]) => Number(info?.due_amount) > 0 || reason === watchedReason)
            .map(([reason, info]) => ({ reason, ...info }));
    }, [reasonDueMap, watchedReason]);

    // the bucket-level due (used as the amount cap when no reason is selected,
    // and as the fallback for standalone/non-calc-linked payments). Calc-linked
    // figures are from-currency (due_amount) since that's now the currency the
    // amount field is entered in.
    const bucketDue = useMemo(() => {
        if (isCalcLinked) {
            if (!selectedCalculation?.summary) return null;
            return watchedBucket === 'other_costing'
                ? Number(selectedCalculation.summary.other_costing_due_amount || 0)
                : Number(selectedCalculation.summary.purchase_costing_due_amount || 0);
        }
        if (!pricing) return null;
        if (watchedBucket === 'db_costing_price') {
            return pricing.other_charge_total !== null && pricing.other_charge_total !== undefined
                ? Math.max(0, Number(pricing.other_charge_total) - Number(pricing.db_costing_price_paid || 0))
                : null;
        }
        return pricing.purchase_price !== null && pricing.purchase_price !== undefined
            ? Math.max(0, Number(pricing.purchase_price) - Number(pricing.purchase_price_paid || 0))
            : null;
    }, [isCalcLinked, selectedCalculation, pricing, watchedBucket]);

    // the reason's own due once one is picked, otherwise the whole bucket's due
    const currentDue = watchedReason && reasonDueMap[watchedReason]
        ? Number(reasonDueMap[watchedReason].due_amount)
        : bucketDue;

    // when editing, the payment being edited is itself already counted inside
    // "paid" (and therefore subtracted out of currentDue) - add its own
    // amount back so editing doesn't immediately look like it exceeds the due
    const editingContribution = useMemo(() => {
        if (!initialData) return 0;
        const sameBucket = initialData.pp_payment_against === watchedBucket;
        const sameReason = (initialData.pp_reason || '') === (watchedReason || '');
        return sameBucket && sameReason ? Number(initialData.pp_amount || 0) : 0;
    }, [initialData, watchedBucket, watchedReason]);

    const effectiveDue = currentDue !== null && currentDue !== undefined
        ? currentDue + editingContribution
        : currentDue;

    // clear a stale reason when the bucket changes away from the one it belonged to
    useEffect(() => {
        if (!open) return;
        if (previousBucketRef.current !== watchedBucket) {
            setValue('reason', '');
            previousBucketRef.current = watchedBucket;
        }
    }, [watchedBucket, setValue]);

    // auto-fill conversion rate from the entity's price record once, when it
    // loads - not for calc-linked payments, which use the calculation's own rate
    useEffect(() => {
        if (!isCalcLinked && pricing?.conv_rate && !watchedConvRate) {
            setValue('conv_rate', pricing.conv_rate);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pricing, isCalcLinked]);

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

    // for calc-linked payments the only meaningful preview is the to-currency
    // equivalent (toAmount); the generic BDT/USD preview only applies to
    // standalone payments and would be misleading here (e.g. a YEN calc)
    const previewAmounts = useMemo(() => {
        const amount = Number(watchedAmount);
        if (!amount || Number.isNaN(amount)) return { bdt: null, usd: null, conv: null };

        if (isCalcLinked) {
            const conv = sameCurrency ? amount : (toAmount !== '' && !Number.isNaN(Number(toAmount)) ? Number(toAmount) : null);
            return { bdt: null, usd: null, conv };
        }

        const rate = Number(watchedConvRate);
        if (watchedCurrency === 'USD') {
            return { bdt: rate ? amount * rate : null, usd: amount, conv: null };
        }
        if (watchedCurrency === 'BDT') {
            return { bdt: amount, usd: rate ? amount / rate : null, conv: null };
        }
        return { bdt: null, usd: null, conv: null };
    }, [watchedAmount, watchedCurrency, watchedConvRate, isCalcLinked, sameCurrency, toAmount]);

    // the amount can never exceed what's actually still due (reason-level if
    // a reason is picked, otherwise the whole bucket's due)
    const handleAmountChange = (e) => {
        if (effectiveDue === null || effectiveDue === undefined) return;
        const value = Number(e.target.value);
        if (!Number.isNaN(value) && value > effectiveDue) {
            toast.error(`Amount cannot exceed the due amount (${formatPrice(effectiveDue.toFixed(2))}).`);
            setValue('amount', effectiveDue > 0 ? String(effectiveDue) : '', { shouldValidate: true });
        }
    };

    // drives the dual-currency amount/toAmount/rate fields for calc-linked
    // payments, clamping the resulting from-currency amount to effectiveDue
    const handleDualFieldChange = (field) => (e) => {
        const value = e.target.value;
        const result = syncDualAmount(field, value, {
            amount: watchedAmount ?? '',
            toAmount,
            convRate: watchedConvRate ?? '',
            lastEditedSide: lastEditedSideRef.current,
        });

        let { amount, toAmount: nextToAmount, convRate } = result;
        if (effectiveDue !== null && effectiveDue !== undefined && amount !== '') {
            const numeric = Number(amount);
            if (!Number.isNaN(numeric) && numeric > effectiveDue) {
                toast.error(`Amount cannot exceed the due amount (${formatPrice(effectiveDue.toFixed(2))}).`);
                amount = effectiveDue > 0 ? String(effectiveDue) : '';
                const rate = Number(convRate);
                nextToAmount = rate > 0 && amount !== '' ? (Number(amount) * rate).toFixed(2) : '';
            }
        }

        lastEditedSideRef.current = result.lastEditedSide;
        setValue('amount', amount, { shouldValidate: true });
        setValue('conv_rate', convRate, { shouldValidate: true });
        setToAmount(nextToAmount);
    };

    // wraps the real onChange handlers so the magnitude-suggestion dropdown
    // opens/repositions alongside the existing sync/due-cap logic
    const handleAmountInputChange = (e) => {
        amountInputRef.current = e.target;
        setAmountAnchorRect(e.target.getBoundingClientRect());
        setAmountDropdownTarget('amount');
        if (dualCurrency) {
            handleDualFieldChange('amount')(e);
        } else {
            handleAmountChange(e);
        }
    };

    const handleAmountInputFocus = (e) => {
        amountInputRef.current = e.target;
        setAmountAnchorRect(e.target.getBoundingClientRect());
        setAmountDropdownTarget('amount');
    };

    const handleToAmountInputChange = (e) => {
        amountInputRef.current = e.target;
        setAmountAnchorRect(e.target.getBoundingClientRect());
        setAmountDropdownTarget('to_amount');
        handleDualFieldChange('toAmount')(e);
    };

    const handleToAmountInputFocus = (e) => {
        amountInputRef.current = e.target;
        setAmountAnchorRect(e.target.getBoundingClientRect());
        setAmountDropdownTarget('to_amount');
    };

    const clearAmountDropdown = () => setTimeout(() => {
        setAmountDropdownTarget(null);
        setAmountAnchorRect(null);
        amountInputRef.current = null;
    }, 150);

    // suggestion clicks reuse the exact same sync/due-cap logic as typing,
    // via a minimal synthetic event carrying just the chosen value.
    // handleDualFieldChange sets the field itself (with clamping); the plain
    // handleAmountChange is only a clamp side-effect (real typing relies on
    // RHF's own onChange to set the raw value first), so that branch needs
    // an explicit setValue before the clamp check runs.
    const applyAmountSuggestion = (value) => {
        if (dualCurrency) {
            handleDualFieldChange('amount')({ target: { value } });
        } else {
            setValue('amount', value, { shouldValidate: true });
            handleAmountChange({ target: { value } });
        }
    };

    const applyToAmountSuggestion = (value) => {
        handleDualFieldChange('toAmount')({ target: { value } });
    };

    const renderAmountSuggestionList = (target, currentValue, applyValue) =>
        amountDropdownTarget === target &&
        buildAmountOptions(currentValue).length > 0 &&
        amountAnchorRect && (
            <div
                style={{
                    position: 'fixed',
                    top: amountAnchorRect.bottom + 2,
                    left: amountAnchorRect.left,
                    width: Math.max(amountAnchorRect.width, 220),
                    zIndex: 9999,
                }}
                className="bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
            >
                {buildAmountOptions(currentValue).map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        className="flex w-full flex-col items-start gap-0.5 border-b border-gray-100 px-3 py-1.5 text-left last:border-b-0 hover:bg-teal-50"
                        onMouseDown={(e) => {
                            e.preventDefault();
                            applyValue(option.value);
                            setAmountDropdownTarget(null);
                            setAmountAnchorRect(null);
                            amountInputRef.current = null;
                        }}
                    >
                        <span className="text-xs font-semibold text-gray-900">{option.label}</span>
                        <span className="text-[11px] text-gray-500">{option.words}</span>
                    </button>
                ))}
            </div>
        );

    // reposition the suggestion dropdown on scroll/resize, same as the costing panel
    useEffect(() => {
        if (!amountDropdownTarget) return;
        const updateRect = () => {
            if (amountInputRef.current) {
                setAmountAnchorRect(amountInputRef.current.getBoundingClientRect());
            }
        };
        window.addEventListener('scroll', updateRect, true);
        window.addEventListener('resize', updateRect);
        return () => {
            window.removeEventListener('scroll', updateRect, true);
            window.removeEventListener('resize', updateRect);
        };
    }, [amountDropdownTarget]);

    const onSubmit = async (data) => {
        if (!entityOption?.entity_type || !entityOption?.entity_id) {
            toast.error('Please select a vehicle or product.');
            return;
        }

        if (effectiveDue !== null && effectiveDue !== undefined && Number(data.amount) > effectiveDue) {
            toast.error(`Amount cannot exceed the due amount (${formatPrice(effectiveDue.toFixed(2))}).`);
            return;
        }

        if (dualCurrency && (!data.conv_rate || Number(data.conv_rate) <= 0)) {
            toast.error('Conversion rate is required when the payment and calculation currencies differ.');
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
                            <RequiredLabel htmlFor="pp-entity-select">Vehicle / Product</RequiredLabel>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <RequiredLabel htmlFor="payment_against">Type</RequiredLabel>
                                <select
                                    id="payment_against"
                                    className="outline-none py-2 px-3 rounded border border-gray-400 w-full h-10"
                                    {...register('payment_against')}
                                    disabled={isSubmitting}
                                >
                                    {isCalcLinked ? (
                                        <>
                                            <option value="purchase_costing">Fixed</option>
                                            {!generalCostLocked && <option value="other_costing">General</option>}
                                        </>
                                    ) : (
                                        <>
                                            <option value="purchase_price">Fixed</option>
                                            {!generalCostLocked && (
                                                <option value="db_costing_price" disabled={isProduct}>
                                                    General{isProduct ? ' (not tracked for products)' : ''}
                                                </option>
                                            )}
                                        </>
                                    )}
                                </select>
                                {errors.payment_against && <p className="text-red-600 text-sm">{errors.payment_against.message}</p>}
                            </div>
                            <div>
                                <Label htmlFor="reason">Reason</Label>
                                {isCalcLinked ? (
                                    <select
                                        id="reason"
                                        className="outline-none py-2 px-3 rounded border border-gray-400 w-full h-10"
                                        {...register('reason')}
                                        disabled={isSubmitting}
                                    >
                                        <option value="">All / not specified</option>
                                        {availableReasons.map(({ reason, due_amount }) => (
                                            <option key={reason} value={reason}>
                                                {reason} — Due: {formatPrice(Number(due_amount).toFixed(2))} {selectedCalculation.vpc_from_currency}
                                            </option>
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
                        </div>

                        {effectiveDue !== null && effectiveDue !== undefined && (
                            <div className="text-xs bg-blue-50 border border-blue-200 rounded p-2 text-blue-800">
                                {watchedReason ? (
                                    <>
                                        <span className="font-semibold">{watchedReason}</span> — Paid: {formatPrice(Number(reasonDueMap[watchedReason]?.paid_amount || 0).toFixed(2))}
                                        {' · '}Due: <span className="font-semibold">{formatPrice(effectiveDue.toFixed(2))}</span>
                                        {isCalcLinked && <span> {selectedCalculation.vpc_from_currency}</span>}
                                    </>
                                ) : (
                                    <>This type's remaining due: <span className="font-semibold">{formatPrice(effectiveDue.toFixed(2))}</span>{isCalcLinked && <span> {selectedCalculation.vpc_from_currency}</span>}</>
                                )}
                            </div>
                        )}

                        {isCalcLinked && selectedCalculation?.summary ? (
                            <div className={`grid ${generalCostLocked ? "grid-cols-1" : "grid-cols-2"} gap-3 text-xs bg-gray-50 border border-gray-200 rounded p-3`}>
                                <div>
                                    <div className="text-gray-500 uppercase">Fixed</div>
                                    <div className="mt-1 space-y-2">
                                        <div>
                                            <div className="font-semibold">{formatPrice(selectedCalculation.summary.purchase_costing_amount || 0)} {selectedCalculation.vpc_from_currency}</div>
                                            <div>
                                                <span className="text-blue-700 font-semibold">Paid: {formatPrice(selectedCalculation.summary.purchase_costing_paid_amount || 0)}</span>
                                                <span className="text-slate-400 mx-1">·</span>
                                                <span className="text-slate-600 font-semibold">Due: {formatPrice(selectedCalculation.summary.purchase_costing_due_amount || 0)}</span>
                                            </div>
                                        </div>
                                        {dualCurrency && (
                                            <div className="pt-2 border-t border-gray-200">
                                                <div className="font-semibold">{formatPrice(selectedCalculation.summary.purchase_costing_total || 0)} {selectedCalculation.vpc_to_currency}</div>
                                                <div>
                                                    <span className="text-blue-700 font-semibold">Paid: {formatPrice(selectedCalculation.summary.purchase_costing_paid || 0)}</span>
                                                    <span className="text-slate-400 mx-1">·</span>
                                                    <span className="text-slate-600 font-semibold">Due: {formatPrice(selectedCalculation.summary.purchase_costing_due || 0)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {!generalCostLocked && (
                                    <div>
                                        <div className="text-gray-500 uppercase">General</div>
                                        <div className="mt-1 space-y-2">
                                            <div>
                                                <div className="font-semibold">{formatPrice(selectedCalculation.summary.other_costing_amount || 0)} {selectedCalculation.vpc_from_currency}</div>
                                                <div>
                                                    <span className="text-blue-700 font-semibold">Paid: {formatPrice(selectedCalculation.summary.other_costing_paid_amount || 0)}</span>
                                                    <span className="text-slate-400 mx-1">·</span>
                                                    <span className="text-slate-600 font-semibold">Due: {formatPrice(selectedCalculation.summary.other_costing_due_amount || 0)}</span>
                                                </div>
                                            </div>
                                            {dualCurrency && (
                                                <div className="pt-2 border-t border-gray-200">
                                                    <div className="font-semibold">{formatPrice(selectedCalculation.summary.other_costing_total || 0)} {selectedCalculation.vpc_to_currency}</div>
                                                    <div>
                                                        <span className="text-blue-700 font-semibold">Paid: {formatPrice(selectedCalculation.summary.other_costing_paid || 0)}</span>
                                                        <span className="text-slate-400 mx-1">·</span>
                                                        <span className="text-slate-600 font-semibold">Due: {formatPrice(selectedCalculation.summary.other_costing_due || 0)}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : pricing && (
                            <div className={`grid ${generalCostLocked ? "grid-cols-1" : "grid-cols-2"} gap-3 text-xs bg-gray-50 border border-gray-200 rounded p-3`}>
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
                                {!generalCostLocked && (
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
                                )}
                            </div>
                        )}

                        {isCalcLinked && (
                            <div className="text-xs text-gray-600">
                                Currency: <span className="font-semibold text-gray-800">{selectedCalculation.vpc_from_currency} → {selectedCalculation.vpc_to_currency}</span>
                                <input type="hidden" {...register('currency')} />
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <div className="relative">
                                <RequiredLabel htmlFor="amount">Amount {isCalcLinked && `(${selectedCalculation.vpc_from_currency})`}</RequiredLabel>
                                <Input
                                    className="border-gray-400"
                                    type="number"
                                    step="0.01"
                                    max={effectiveDue ?? undefined}
                                    {...register('amount', { onChange: handleAmountInputChange, onBlur: clearAmountDropdown })}
                                    onFocus={handleAmountInputFocus}
                                    id="amount"
                                    placeholder="0.00"
                                    disabled={isSubmitting}
                                />
                                {renderAmountSuggestionList('amount', watchedAmount, applyAmountSuggestion)}
                                {effectiveDue !== null && effectiveDue !== undefined && (
                                    <p className="text-xs text-gray-500 mt-1">Max: {formatPrice(effectiveDue.toFixed(2))}</p>
                                )}
                                {errors.amount && <p className="text-red-600 text-sm">{errors.amount.message}</p>}
                            </div>
                            <div>
                                {dualCurrency ? (
                                    <RequiredLabel htmlFor="conv_rate">{`Conv. Rate (to ${selectedCalculation.vpc_to_currency})`}</RequiredLabel>
                                ) : (
                                    <Label htmlFor="conv_rate">
                                        {isCalcLinked ? `Conv. Rate (to ${selectedCalculation.vpc_to_currency})` : 'Conv. Rate (BDT/USD)'}
                                    </Label>
                                )}
                                <Input
                                    className="border-gray-400"
                                    type="number"
                                    step="0.000001"
                                    {...register('conv_rate', { onChange: dualCurrency ? handleDualFieldChange('conv_rate') : undefined })}
                                    id="conv_rate"
                                    placeholder="e.g. 110"
                                    disabled={isSubmitting || sameCurrency}
                                    required={dualCurrency}
                                />
                            </div>
                            <div className="relative">
                                {isCalcLinked ? (
                                    dualCurrency ? (
                                        <>
                                            <RequiredLabel htmlFor="to_amount">Amount ({selectedCalculation.vpc_to_currency})</RequiredLabel>
                                            <Input
                                                className="border-gray-400"
                                                type="number"
                                                step="0.01"
                                                value={toAmount}
                                                onChange={handleToAmountInputChange}
                                                onFocus={handleToAmountInputFocus}
                                                onBlur={clearAmountDropdown}
                                                id="to_amount"
                                                placeholder="0.00"
                                                disabled={isSubmitting}
                                            />
                                            {renderAmountSuggestionList('to_amount', toAmount, applyToAmountSuggestion)}
                                        </>
                                    ) : (
                                        <>
                                            <Label htmlFor="single_currency">Currency</Label>
                                            <div id="single_currency" className="h-10 flex items-center px-3 rounded border border-gray-300 bg-gray-50 text-sm font-medium text-gray-700">
                                                {selectedCalculation.vpc_from_currency}
                                            </div>
                                        </>
                                    )
                                ) : (
                                    <>
                                        <RequiredLabel htmlFor="currency">Currency</RequiredLabel>
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
                                    </>
                                )}
                            </div>
                        </div>

                        {(previewAmounts.bdt !== null || previewAmounts.usd !== null || previewAmounts.conv !== null) && (
                            <div className="text-xs text-gray-600 bg-emerald-50 border border-emerald-200 rounded p-2">
                                {isCalcLinked && previewAmounts.conv !== null ? (
                                    <span className="font-semibold">
                                        = {formatPrice(previewAmounts.conv.toFixed(2))} {selectedCalculation.vpc_to_currency}
                                        {' '}(counts toward this calculation)
                                    </span>
                                ) : !isCalcLinked && (
                                    <>
                                        ≈ {previewAmounts.bdt !== null ? formatPrice(previewAmounts.bdt.toFixed(2)) : '-'} BDT
                                        {' / '}
                                        {previewAmounts.usd !== null ? formatPrice(previewAmounts.usd.toFixed(2)) : '-'} USD
                                    </>
                                )}
                            </div>
                        )}

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

                        <div>
                            <Label htmlFor="paid_at">Paid At</Label>
                            <Input
                                className="border-gray-400 sm:w-1/3"
                                type="datetime-local"
                                {...register('paid_at')}
                                id="paid_at"
                                disabled={isSubmitting}
                            />
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
