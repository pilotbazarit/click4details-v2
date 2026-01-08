import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const BankAccountSelectModal = ({ open, setOpen, bankAccounts = [] }) => {
    const [selectedAccounts, setSelectedAccounts] = useState([]);

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            setSelectedAccounts([]);
        }
    };

    // console.log("Bank Accounts:===========", bankAccounts);

    const handleAccountSelect = (account) => {
        setSelectedAccounts(prev => {
            const isSelected = prev.some(acc => acc.ac_num === account.ac_num);
            if (isSelected) {
                return prev.filter(acc => acc.ac_num !== account.ac_num);
            } else {
                return [...prev, account];
            }
        });
    };

    const isAccountSelected = (account) => {
        return selectedAccounts.some(acc => acc.ac_num === account.ac_num);
    };

    const handleSelectAll = () => {
        if (selectedAccounts.length === bankAccounts.length) {
            // If all are selected, deselect all
            setSelectedAccounts([]);
        } else {
            // Select all accounts
            setSelectedAccounts([...bankAccounts]);
        }
    };

    const isAllSelected = bankAccounts.length > 0 && selectedAccounts.length === bankAccounts.length;

    const handleConfirm = () => {
        if (selectedAccounts.length === 0) return;

        // Build WhatsApp message with all selected bank account details
        let message = `*Bank Account Details*\n\n`;

        selectedAccounts.forEach((account, index) => {
            if (index > 0) {
                message += `\n-------------------\n\n`;
            }
            message += `Bank: ${account.ac_bank}\n`;
            message += `A/C Name: ${account.ac_name}\n`;
            message += `A/C No: ${account.ac_num}\n`;
            message += `Branch: ${account.ac_branch}\n`;
            message += `Routing: ${account.ac_routing}\n`;
            message += `SWIFT: ${account.ac_swift}\n`;
        });

        // Open WhatsApp with the message
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');

        // Close the modal
        setOpen(false);
        setSelectedAccounts([]);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className='text-center font-medium text-xl'>Select Bank Account</DialogTitle>
                </DialogHeader>

                <div className='mt-6 space-y-3'>
                    {bankAccounts && bankAccounts.length > 0 && (
                        <div
                            className={`border rounded-lg p-4 cursor-pointer transition bg-gray-50 ${
                                isAllSelected
                                    ? 'border-blue-500 bg-blue-100'
                                    : 'border-gray-400 hover:border-blue-300'
                            }`}
                            onClick={handleSelectAll}
                        >
                            <div className='flex items-center justify-between'>
                                <div className='flex-1'>
                                    <h3 className='font-semibold text-lg'>Select All Bank Accounts</h3>
                                    <p className='text-sm text-gray-600 mt-1'>
                                        {isAllSelected
                                            ? `All ${bankAccounts.length} accounts selected`
                                            : `Select all ${bankAccounts.length} accounts`}
                                    </p>
                                </div>
                                <div className='ml-4'>
                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                        isAllSelected
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
                    )}

                    {bankAccounts && bankAccounts.length > 0 ? (
                        bankAccounts.map((account, index) => {
                            const isSelected = isAccountSelected(account);
                            return (
                                <div
                                    key={index}
                                    className={`border rounded-lg p-4 cursor-pointer transition ${
                                        isSelected
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-blue-300'
                                    }`}
                                    onClick={() => handleAccountSelect(account)}
                                >
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <h3 className='font-semibold text-lg mb-2'>{account.bank_name}</h3>
                                            <div className='space-y-1 text-sm text-gray-700'>
                                                <p>Bank Name: {account.ac_bank}</p>
                                                <p>A/C Name: {account.ac_name}</p>
                                                <p>A/C No: {account.ac_num}</p>
                                                <p>Branch: {account.ac_branch}</p>
                                                <p>Routing: {account.ac_routing}</p>
                                                <p>SWIFT: {account.ac_swift}</p>
                                            </div>
                                        </div>
                                        <div className='ml-4'>
                                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                                                isSelected
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
                        })
                    ) : (
                        <div className='text-center py-8 text-gray-500'>
                            No bank accounts found
                        </div>
                    )}
                </div>

                {bankAccounts && bankAccounts.length > 0 && (
                    <div className='mt-6'>
                        <button
                            onClick={handleConfirm}
                            disabled={selectedAccounts.length === 0}
                            className={`w-full py-3 rounded-lg font-medium transition ${
                                selectedAccounts.length > 0
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Confirm Selection {selectedAccounts.length > 0 && `(${selectedAccounts.length})`}
                        </button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default BankAccountSelectModal
