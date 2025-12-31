import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog"
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import { useMyShopProductContext } from '@/context/MyShopProductContext'
import { useAppContext } from '@/context/AppContext'
import { Printer, X, Share2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'

const StockListPreviewModal = ({ open, setOpen, selectedFeatures, products: propProducts }) => {
    // Try to get context, but don't fail if it's not available
    const context = useMyShopProductContext();
    const { selectedShop } = useAppContext();

    // Use products from props if provided, otherwise fall back to context
    const products = propProducts || context?.products || [];

    // Get current date in readable format
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });


    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Handle print functionality
    const handlePrint = () => {
        window.print()
    }

    // Handle WhatsApp share with PDF
    const handleWhatsAppShare = async () => {
        try {
            setIsGeneratingPDF(true);
            toast.loading('Generating PDF...', { id: 'pdf-generation' });

            // Get the print content element
            const printContent = document.querySelector('.print-content');

            if (!printContent) {
                toast.error('Content not found', { id: 'pdf-generation' });
                return;
            }

            // Generate canvas from the content
            const canvas = await html2canvas(printContent, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            // Calculate PDF dimensions (A4 landscape)
            const imgWidth = 297; // A4 landscape width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // Create PDF
            const pdf = new jsPDF({
                orientation: imgHeight > imgWidth ? 'portrait' : 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const imgData = canvas.toDataURL('image/jpeg', 0.95);
            pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);

            // Convert PDF to blob
            const pdfBlob = pdf.output('blob');

            // Create a file from blob
            const file = new File([pdfBlob], `Stock_List_${new Date().getTime()}.pdf`, {
                type: 'application/pdf'
            });

            // Check if Web Share API is supported
            if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: 'Stock List',
                    text: `Stock List - ${selectedShop?.s_title || 'My Shop'}`,
                    files: [file]
                });
                toast.success('Shared successfully!', { id: 'pdf-generation' });
            } else {
                // Fallback: Create WhatsApp link with text
                const shopName = selectedShop?.s_title || 'My Shop';
                const message = `Stock List - ${shopName}`;
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

                // Download the PDF
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Stock_List_${new Date().getTime()}.pdf`;
                a.click();
                URL.revokeObjectURL(url);

                // Open WhatsApp
                window.open(whatsappUrl, '_blank');

                toast.success('PDF downloaded! Please attach it manually in WhatsApp.', {
                    id: 'pdf-generation',
                    duration: 5000
                });
            }
        } catch (error) {
            console.error('Error sharing to WhatsApp:', error);
            toast.error('Failed to share. Please try again.', { id: 'pdf-generation' });
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
    };


    console.log("products", products)

    return (
        <>
            {/* Print-specific styles */}
            <style>{`
                @media print {
                    /* Hide everything first */
                    body * {
                        visibility: hidden !important;
                    }

                    /* Hide dialog overlay */
                    [data-radix-dialog-overlay] {
                        display: none !important;
                    }

                    /* Style the dialog content */
                    [data-radix-dialog-content] {
                        visibility: visible !important;
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;
                        transform: none !important;
                        max-width: 100% !important;
                        max-height: none !important;
                        width: 100% !important;
                        height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        border: none !important;
                        box-shadow: none !important;
                        overflow: visible !important;
                        background: white !important;
                    }

                    /* Make print content visible */
                    .print-content,
                    .print-content * {
                        visibility: visible !important;
                    }

                    .print-content {
                        display: block !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    /* Ensure colors print */
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }

                    /* Ensure table prints correctly */
                    .print-content table {
                        page-break-inside: auto !important;
                        border-collapse: collapse !important;
                        width: 100% !important;
                    }

                    .print-content tr {
                        page-break-inside: avoid !important;
                        page-break-after: auto !important;
                    }

                    .print-content thead {
                        display: table-header-group !important;
                    }

                    .print-content tbody {
                        display: table-row-group !important;
                    }

                    /* Ensure borders are visible */
                    .print-content table,
                    .print-content th,
                    .print-content td {
                        border: 1px solid #d1d5db !important;
                    }

                    /* Ensure header background color prints */
                    .print-content thead tr {
                        background-color: #1f2937 !important;
                        color: white !important;
                    }

                    /* Ensure alternating row colors print */
                    .print-content tbody tr:nth-child(even) {
                        background-color: #f9fafb !important;
                    }

                    /* Ensure gradient backgrounds print */
                    .bg-gradient-to-r {
                        background: #2B4C9F !important;
                    }

                    /* Ensure badges print with colors */
                    .bg-red-600 {
                        background-color: #dc2626 !important;
                    }

                    .bg-blue-600 {
                        background-color: #2563eb !important;
                    }

                    .bg-green-100 {
                        background-color: #dcfce7 !important;
                    }

                    .text-green-800 {
                        color: #166534 !important;
                    }

                    .bg-yellow-100 {
                        background-color: #fef3c7 !important;
                    }

                    .text-yellow-800 {
                        color: #854d0e !important;
                    }

                    @page {
                        size: A4 landscape;
                        margin: 10mm;
                    }
                }
            `}</style>

            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto p-0" data-radix-dialog-content>
                    <VisuallyHidden.Root>
                        <DialogTitle>Stock List Preview</DialogTitle>
                    </VisuallyHidden.Root>

                    {/* Print Button - Hidden during print */}
                    <div className="print:hidden sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-sm p-4 flex justify-end gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                            <Printer size={18} />
                            Print List
                        </button>

                        <button
                            onClick={handleWhatsAppShare}
                            disabled={isGeneratingPDF}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Share2 size={18} />
                            {isGeneratingPDF ? 'Generating...' : 'Share'}
                        </button>

                        <button
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                            <X size={18} />
                            Close
                        </button>
                    </div>

                    <div className="print-content bg-gradient-to-br from-gray-50 to-white">
                        {/* Header Section with Blue Gradient */}
                        <div className="bg-gradient-to-r from-[#2B4C9F] to-[#3D5FA8] rounded-b-xl  overflow-hidden">
                            <div className="px-8 py-12">
                                <h1 className="text-4xl font-bold text-white text-center mb-2">
                                    {selectedShop?.s_title || 'Prime Auto Imports'}
                                </h1>
                                <p className="text-white text-center text-lg opacity-90 mb-4">
                                    Stock Inventory & Price List
                                </p>
                                <div className="flex justify-center">
                                    <div className="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full flex items-center gap-2">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="text-white font-medium">Date: {currentDate}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="max-w-[80%] mx-auto bg-white shadow-md rounded-b-lg rounded-t-lg -mt-8">
                            {/* Seller Information Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mx-8 mb-8 relative z-10">
                                <div className="flex items-start justify-between">
                                    {/* Left side - Avatar and Name */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                            {(selectedShop?.user?.name || 'A').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                                {selectedShop?.user?.name || 'Aminul Islam'}
                                            </h2>
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Verified Seller
                                                </span>
                                                <span className="text-sm text-gray-600">• Shop #1</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right side - Contact Details */}
                                    <div className="text-right space-y-2">
                                        <div className="flex space-x-3 justify-end">
                                            <div className="bg-gray-100 rounded-sm px-4 py-1.5">
                                                <div className="flex items-center justify-start gap-2 text-sm">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    <span className="font-medium text-gray-700">Call Us</span>
                                                </div>
                                                <p className="text-lg font-bold text-blue-600">
                                                    {selectedShop?.user?.phone || '0176862664'}
                                                </p>
                                            </div>

                                            <div className="bg-gray-100 rounded-sm px-4 py-1.5">
                                                <div className="flex items-center justify-start gap-2 text-sm mt-3">
                                                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="font-medium text-gray-700">Email Us</span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {selectedShop?.user?.email || 'aminul@gmail.com'}
                                                </p>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            </div>

                            {/* Stock List Table */}
                            <div className="px-8 pb-8">
                                <div className="overflow-x-auto rounded-lg shadow-sm border border-gray-200">
                                    <table className="w-full border-collapse bg-white">
                                        {/* Table Header */}
                                        <thead>
                                            <tr className="bg-gray-800 text-white">
                                                <th className="px-3 py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-gray-600 w-12">
                                                    #
                                                </th>
                                                <th className="px-4 w-[14%] py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-gray-600">
                                                    Car Details
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-gray-600">
                                                    Specification
                                                </th>
                                                <th className="px-4 w-[52%] py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-gray-600">
                                                    Key Features
                                                </th>
                                                <th className="px-4 w-[15%] py-3 text-left text-sm font-semibold uppercase tracking-wider">
                                                    Pricing & Status
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map((product, index) => (
                                                <tr key={index} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}>
                                                    {/* Serial Number */}
                                                    <td className="px-3 py-4 text-center align-top font-bold text-gray-700 border-r border-gray-200">
                                                        {String(index + 1).padStart(2, '0')}
                                                    </td>

                                                    {/* Car Details Column */}
                                                    <td className="px-4 py-4 align-top border-r border-gray-200">
                                                        <div className="space-y-2">
                                                            {/* Brand Badge */}
                                                            {selectedFeatures.includes('brand') && (
                                                                <span className={`inline-block px-2.5 py-1 rounded text-sm font-semibold text-white ${product.v_brand_name?.toLowerCase() === 'nissan' ? 'bg-red-600' :
                                                                    product.v_brand_name?.toLowerCase() === 'toyota' ? 'bg-blue-600' :
                                                                        'bg-gray-600'
                                                                    }`}>
                                                                    {product.v_brand_name}
                                                                </span>
                                                            )}

                                                            {/* Model Name */}
                                                            {selectedFeatures.includes('model') && (
                                                                <h3 className="text-base font-bold text-gray-900">
                                                                    {product.v_model_name}
                                                                </h3>
                                                            )}

                                                            {/* Package/Edition */}
                                                            {selectedFeatures.includes('package') && (
                                                                <p className="text-sm text-gray-600">
                                                                    {product.v_edition_name}
                                                                </p>
                                                            )}

                                                            {/* Model & Registration Year */}

                                                            {selectedFeatures.includes('modelYr') && (
                                                                <div>
                                                                    <span className="font-bold text-gray-700">Model:</span>{' '}
                                                                    <span className="text-gray-900">{product.v_mod_year}</span>
                                                                </div>
                                                            )}
                                                            {selectedFeatures.includes('registrationYr') && (
                                                                <div>
                                                                    <span className="font-bold text-gray-700">Reg:</span>{' '}
                                                                    <span className="text-gray-900">{product.v_registration}</span>
                                                                </div>
                                                            )}


                                                            {/* <div className="flex gap-3 text-sm">
                                                                {selectedFeatures.includes('modelYr') && (
                                                                    <div>
                                                                        <span className="font-bold text-gray-700">Model:</span>{' '}
                                                                        <span className="text-gray-900">{product.v_mod_year}</span>
                                                                    </div>
                                                                )}
                                                                {selectedFeatures.includes('registrationYr') && (
                                                                    <div>
                                                                        <span className="font-bold text-gray-700">Reg:</span>{' '}
                                                                        <span className="text-gray-900">{product.v_registration}</span>
                                                                    </div>
                                                                )}
                                                            </div> */}
                                                        </div>
                                                    </td>

                                                    {/* Specs Column */}
                                                    <td className="px-4 py-4 align-top border-r border-gray-200">
                                                        <div className="space-y-1.5 text-sm">
                                                            <div>
                                                                <span className="font-semibold text-gray-700">Color:</span>{' '}
                                                                <span className="text-gray-900">{product.v_color_name}</span>
                                                            </div>
                                                            {selectedFeatures.includes('condition') && (
                                                                <div>
                                                                    <span className="font-semibold text-gray-700">Cond.:</span>{' '}
                                                                    <span className={`font-medium ${product.v_condition_name?.toLowerCase() === 'short used' ? 'text-green-600' :
                                                                        product.v_condition_name?.toLowerCase() === 'recon' ? 'text-blue-600' :
                                                                            product.v_condition_name?.toLowerCase() === 'new shape' ? 'text-purple-600' :
                                                                                'text-gray-900'
                                                                        }`}>
                                                                        {product.v_condition_name}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <div>
                                                                <span className="font-semibold text-gray-700">Mileage:</span>{' '}
                                                                <span className="text-gray-900">{product.v_mileage} km</span>
                                                            </div>
                                                            {selectedFeatures.includes('fuel') && (
                                                                <div>
                                                                    <span className="font-semibold text-gray-700">Fuel:</span>{' '}
                                                                    <span className="text-gray-900">{product.v_fuel_name}</span>
                                                                </div>
                                                            )}
                                                            {selectedFeatures.includes('option') && (
                                                                <div>
                                                                    <span className="font-semibold text-gray-700">Option:</span>{' '}
                                                                    <span className="text-gray-900">{product.v_transmission_name}</span>
                                                                </div>
                                                            )}
                                                            {selectedFeatures.includes('capacity') && (
                                                                <div>
                                                                    <span className="font-semibold text-gray-700">CC:</span>{' '}
                                                                    <span className="text-gray-900">{product.v_capacity}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Key Features Column */}
                                                    <td className="px-2 py-1 align-top border-r border-gray-200">
                                                        <div className=" text-gray-700 leading-relaxed">
                                                            {product.feature_specification && product.feature_specification.length > 0 ? (
                                                                product.feature_specification.map((feature, fIndex) => (
                                                                    <span key={fIndex}>
                                                                        {feature.md_title}
                                                                        {fIndex < product.feature_specification.length - 1 ? ', ' : '.'}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-400 italic">No features specified</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Pricing & Status Column */}
                                                    <td className="px-4 py-2 align-top">
                                                        <div className="space-y-1 text-sm text-gray-700">
                                                            {/* Price */}
                                                            {/* {selectedFeatures.includes('fixedPrice') && product?.vehicle_db_price?.vp_user_fixed_price && (
                                                                <div className="mb-2">
                                                                    <div className="text-lg font-bold text-blue-600">
                                                                        Tk. {parseFloat(product.vehicle_db_price.vp_user_fixed_price).toFixed(2)}
                                                                    </div>
                                                                    <div className="text-xs text-gray-500">Fixed Price</div>
                                                                </div>
                                                            )} */}

                                                            {
                                                                selectedFeatures.includes('available') &&
                                                                <div>
                                                                    <span className="font-semibold text-gray-700">Avail:</span> {product.v_availability_name}
                                                                </div>
                                                            }
                                                            {
                                                                selectedFeatures.includes('location') &&
                                                                <div>
                                                                    <span className="font-semibold">Loc:</span> {product.v_location?.location_name}
                                                                </div>

                                                            }
                                                            {
                                                                selectedFeatures.includes('fixedPrice') &&
                                                                <div>
                                                                    <span className="font-semibold">Fxd TK:</span> {product?.vehicle_db_price?.vp_user_fixed_price}
                                                                </div>
                                                            }
                                                            {
                                                                selectedFeatures.includes('askingPrice') &&
                                                                <div>
                                                                    <span className="font-semibold">Ask TK:</span> {product?.vehicle_db_price?.vp_user_asking_price}
                                                                </div>
                                                            }
                                                            {
                                                                selectedFeatures.includes('chassisNumber') &&
                                                                <div>
                                                                    <span className="font-semibold">Chassis:</span> {product?.v_chassis}
                                                                </div>
                                                            }
                                                            {
                                                                selectedFeatures.includes('engineNumber') &&
                                                                <div>
                                                                    <span className="font-semibold">Eng No:</span> {product?.v_engine}
                                                                </div>
                                                            }
                                                            <div className="text-blue-600 underline cursor-pointer">
                                                                <a href={`https://click4details.app/product/${product?.v_slug}`} target="_blank" rel="noopener noreferrer">
                                                                    <span className="font-semibold">Click Here</span>
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default StockListPreviewModal
