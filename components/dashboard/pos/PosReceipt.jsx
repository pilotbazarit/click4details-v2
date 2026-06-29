"use client";

import { Printer, X } from "lucide-react";
import { useRef } from "react";

export default function PosReceipt({ sale, onClose }) {
    const printRef = useRef(null);

    const handlePrint = () => {
        const content = printRef.current.innerHTML;
        const win = window.open("", "_blank", "width=400,height=600");
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>POS Receipt</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: 'Courier New', monospace; font-size: 12px; width: 300px; padding: 10px; }
                    .receipt { width: 100%; }
                    .center { text-align: center; }
                    .bold { font-weight: bold; }
                    .divider { border-top: 1px dashed #000; margin: 6px 0; }
                    .row { display: flex; justify-content: space-between; margin: 3px 0; }
                    .total-row { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; margin: 4px 0; }
                    .item-name { flex: 1; }
                    .item-qty { width: 40px; text-align: center; }
                    .item-price { width: 70px; text-align: right; }
                    table { width: 100%; border-collapse: collapse; }
                    td { padding: 2px 0; vertical-align: top; }
                    .thank-you { text-align: center; margin-top: 10px; font-size: 11px; }
                </style>
            </head>
            <body>${content}</body>
            </html>
        `);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); win.close(); }, 300);
    };

    const fmt = (n) => `৳${Number(n || 0).toLocaleString("en-BD", { minimumFractionDigits: 2 })}`;
    const date = new Date(sale.saleDate).toLocaleString("en-BD");

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Modal header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
                    <div className="flex items-center gap-2 text-white">
                        <Printer className="w-5 h-5" />
                        <span className="font-bold text-lg">Sale Complete!</span>
                    </div>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Receipt preview */}
                <div className="px-5 py-4 overflow-y-auto max-h-[70vh]">
                    <div ref={printRef} className="receipt font-mono text-xs">
                        {/* Header */}
                        <div className="center bold text-sm mb-1">{sale.shop?.s_title ?? "Shop"}</div>
                        <div className="center text-gray-500 mb-1">{sale.shop?.s_address ?? ""}</div>
                        <div className="divider border-t border-dashed border-gray-400 my-2" />

                        <div className="row text-gray-600">
                            <span>Date:</span>
                            <span>{date}</span>
                        </div>
                        <div className="row text-gray-600">
                            <span>Receipt #:</span>
                            <span>POS-{sale.o_id ?? "—"}</span>
                        </div>
                        <div className="row text-gray-600">
                            <span>Cashier:</span>
                            <span>{sale.cashierName ?? "—"}</span>
                        </div>
                        {(sale.customer?.name || sale.customer?.phone) && (
                            <div className="row text-gray-600">
                                <span>Customer:</span>
                                <span>{sale.customer.name || sale.customer.phone}</span>
                            </div>
                        )}

                        <div className="divider border-t border-dashed border-gray-400 my-2" />

                        {/* Items header */}
                        <div className="flex text-gray-500 font-semibold mb-1">
                            <span className="flex-1">Item</span>
                            <span className="w-10 text-center">Qty</span>
                            <span className="w-24 text-right">Amount</span>
                        </div>
                        <div className="border-t border-dashed border-gray-300 mb-1" />

                        {/* Items */}
                        {sale.items?.map((item, i) => (
                            <div key={i} className="flex gap-1 mb-1.5">
                                <span className="flex-1 truncate">{item.name}</span>
                                <span className="w-10 text-center">{item.qty}</span>
                                <span className="w-24 text-right">
                                    {fmt(item.unitPrice * item.qty)}
                                </span>
                            </div>
                        ))}

                        <div className="border-t border-dashed border-gray-300 my-2" />

                        {/* Totals */}
                        <div className="row text-gray-600">
                            <span>Subtotal</span>
                            <span>{fmt(sale.totals?.subtotal)}</span>
                        </div>
                        {sale.totals?.vatAmount > 0 && (
                            <div className="row text-gray-600">
                                <span>VAT</span>
                                <span>{fmt(sale.totals.vatAmount)}</span>
                            </div>
                        )}
                        {sale.totals?.discountAmount > 0 && (
                            <div className="row text-green-700">
                                <span>Discount</span>
                                <span>-{fmt(sale.totals.discountAmount)}</span>
                            </div>
                        )}

                        <div className="border-t border-dashed border-gray-400 my-2" />

                        <div className="total-row font-bold text-base">
                            <span>TOTAL</span>
                            <span>{fmt(sale.totals?.totalAmount)}</span>
                        </div>

                        <div className="row text-gray-600 mt-1">
                            <span>Paid ({PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod})</span>
                            <span>{fmt(sale.totals?.paidAmount)}</span>
                        </div>
                        {sale.totals?.dueAmount > 0 && (
                            <div className="row font-semibold text-orange-700">
                                <span>Due</span>
                                <span>{fmt(sale.totals.dueAmount)}</span>
                            </div>
                        )}
                        {Number(sale.totals?.paidAmount) > Number(sale.totals?.totalAmount) && (
                            <div className="row text-green-700">
                                <span>Change</span>
                                <span>{fmt(Number(sale.totals.paidAmount) - Number(sale.totals.totalAmount))}</span>
                            </div>
                        )}

                        <div className="border-t border-dashed border-gray-400 my-3" />
                        <div className="thank-you text-center text-gray-500 text-xs">
                            <p>Thank you for your purchase!</p>
                            <p className="mt-1">Powered by Pilot Bazar</p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
                    <button
                        onClick={handlePrint}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition shadow"
                    >
                        <Printer className="w-4 h-4" />
                        Print Receipt
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
                    >
                        New Sale
                    </button>
                </div>
            </div>
        </div>
    );
}

const PAYMENT_LABELS = {
    cash: "Cash",
    card: "Card",
    mobile_banking: "Mobile Banking",
    bank_transfer: "Bank Transfer",
};
