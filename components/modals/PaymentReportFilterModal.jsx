import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { FileDown, Loader2 } from "lucide-react";
import PurchasePaymentService from '@/services/PurchasePaymentService';

// shared pre-generation filter dialog for both the Payment Report and Money
// Receipt PDFs - both are filtered, multi-row listings of an entity's
// payments, scoped by type (Fixed/General), reason and supplier
const PaymentReportFilterModal = ({ open, setOpen, entityOption, title, onConfirm, isGenerating }) => {
    const [types, setTypes] = useState([]);
    const [reasons, setReasons] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [type, setType] = useState('');
    const [reason, setReason] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [loadingOptions, setLoadingOptions] = useState(false);

    useEffect(() => {
        if (!open || !entityOption?.entity_type || !entityOption?.entity_id) return;

        setType('');
        setReason('');
        setSupplierId('');
        setLoadingOptions(true);

        PurchasePaymentService.Queries.getFilterOptions({
            entity_type: entityOption.entity_type,
            entity_id: entityOption.entity_id,
        })
            .then((response) => {
                if (response?.status === 'success') {
                    setTypes(response.data?.types || []);
                    setReasons(response.data?.reasons || []);
                    setSuppliers(response.data?.suppliers || []);
                } else {
                    setTypes([]);
                    setReasons([]);
                    setSuppliers([]);
                }
            })
            .catch(() => {
                setTypes([]);
                setReasons([]);
                setSuppliers([]);
            })
            .finally(() => setLoadingOptions(false));
    }, [open, entityOption]);

    const handleGenerate = () => {
        onConfirm({
            type: type || undefined,
            reason: reason || undefined,
            supplier_id: supplierId || undefined,
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-4">
                    <DialogHeader>
                        <DialogTitle className="text-white text-lg flex items-center gap-2">
                            <FileDown className="h-5 w-5" />
                            {title || 'Report Filters'}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="text-teal-100 text-xs mt-1">Choose what to include - leave blank for everything.</p>
                </div>

                <div className="p-5 grid gap-4">
                    {loadingOptions && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin" /> Loading filter options...
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            className="w-full border border-gray-400 rounded h-10 px-3 outline-none"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            disabled={isGenerating}
                        >
                            <option value="">All</option>
                            {types.map((t) => (
                                <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                        <select
                            className="w-full border border-gray-400 rounded h-10 px-3 outline-none"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            disabled={isGenerating || reasons.length === 0}
                        >
                            <option value="">All</option>
                            {reasons.map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                        <select
                            className="w-full border border-gray-400 rounded h-10 px-3 outline-none"
                            value={supplierId}
                            onChange={(e) => setSupplierId(e.target.value)}
                            disabled={isGenerating || suppliers.length === 0}
                        >
                            <option value="">All</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-2 px-5 py-4 border-t">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                        disabled={isGenerating}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50 text-sm flex items-center gap-2"
                    >
                        {isGenerating && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isGenerating ? 'Generating...' : 'Generate'}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentReportFilterModal;
