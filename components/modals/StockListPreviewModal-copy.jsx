import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useMyShopProductContext } from '@/context/MyShopProductContext';
import { useAppContext } from '@/context/AppContext';
import { X, Share2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { usePathname } from "next/navigation";

const StockListPreviewModal = ({ open, setOpen, selectedFeatures, products: propProducts, userInfo }) => {
    // Try to get context, but don't fail if it's not available
    const context = useMyShopProductContext();
    const { selectedShop, selectedCompanyShop } = useAppContext();
    const pathname = usePathname();


    // console.log("selectedShop----------------------", selectedShop)
    // console.log("selectedCompanyShop----------------------", selectedCompanyShop)
    // console.log("pathname----------------------", pathname)

    // Use products from props if provided, otherwise fall back to context
    const products = propProducts || context?.products || [];

    // Get current date in readable format
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });


    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Handle WhatsApp share with PDF
    const handleWhatsAppShare = async () => {
        try {
            setIsGeneratingPDF(true);
            const productCount = products?.length || 0;

            // Show different messages based on product count
            if (productCount > 50) {
                toast.loading(`Generating PDF for ${productCount} products... This may take a moment.`, { id: 'pdf-generation' });
            } else {
                toast.loading('Generating PDF...', { id: 'pdf-generation' });
            }

            // Get the PDF content element
            const pdfContent = document.querySelector('.pdf-content');

            if (!pdfContent) {
                toast.error('Content not found', { id: 'pdf-generation' });
                return;
            }

            // Wait for rendering
            await new Promise(resolve => setTimeout(resolve, 300));

            // Generate canvas with timeout protection
            const canvasPromise = html2canvas(pdfContent, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: pdfContent.scrollWidth,
                height: pdfContent.scrollHeight,
                x: 0,
                y: 0,
                windowWidth: pdfContent.scrollWidth,
                windowHeight: pdfContent.scrollHeight
            });

            // Add timeout for large datasets
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('PDF generation timeout')), 60000) // 60 second timeout
            );

            const canvas = await Promise.race([canvasPromise, timeout]);

            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error('Canvas generation failed');
            }

            // console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

            toast.loading('Creating PDF document...', { id: 'pdf-generation' });

            // PDF dimensions (A4 landscape)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Add some margins
            const margin = 5; // 5mm margin
            const usablePageHeight = pageHeight - (margin * 2);

            // Calculate how to fit the canvas on pages
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * pageWidth) / canvas.width;

            const imgData = canvas.toDataURL('image/jpeg', 0.85); // Use JPEG with 85% quality for smaller file size

            // If content fits in one page
            if (imgHeight <= usablePageHeight) {
                pdf.addImage(imgData, 'JPEG', 0, margin, imgWidth, imgHeight);
            } else {
                // Split into multiple pages with better positioning
                let heightLeft = imgHeight;
                let position = 0;
                let pageNumber = 0;

                while (heightLeft > 0) {
                    if (pageNumber > 0) {
                        pdf.addPage();
                    }

                    // Calculate position for this page
                    const yPosition = position - (pageNumber * usablePageHeight);

                    // Add image to current page
                    pdf.addImage(imgData, 'JPEG', 0, yPosition + margin, imgWidth, imgHeight);

                    heightLeft -= usablePageHeight;
                    pageNumber++;
                }
            }

            // Convert PDF to blob
            const pdfBlob = pdf.output('blob');

            // Create filename
            const fileName = `Stock_List_${new Date().getTime()}.pdf`;

            // Try native share first, but with better error handling
            try {
                // Check if we can share files
                const canShare = navigator.share && navigator.canShare;

                if (canShare) {
                    const file = new File([pdfBlob], fileName, {
                        type: 'application/pdf'
                    });

                    // Check if files can be shared
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: 'Stock List',
                            text: `Stock List - ${selectedShop?.s_title || 'My Shop'}`,
                            files: [file]
                        });
                        toast.success('Shared successfully!', { id: 'pdf-generation' });
                        return;
                    }
                }

                // If native share not available, use fallback
                throw new Error('Native share not available');

            } catch (shareError) {
                // Fallback: Download PDF and open WhatsApp
                // console.log('Using fallback share method:', shareError.message);

                const shopName = selectedShop?.s_title || 'My Shop';
                const message = `📋 *Stock List - ${shopName}*\n\nPlease find the attached Stock List PDF.\n\nTotal Products: ${productCount}`;

                // Create WhatsApp URL - works for both desktop app and web
                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

                // Download the PDF
                const url = URL.createObjectURL(pdfBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Small delay before opening WhatsApp
                setTimeout(() => {
                    // This will open WhatsApp Desktop app if installed, otherwise WhatsApp Web
                    window.open(whatsappUrl, '_blank');
                }, 500);

                toast.success('PDF downloaded! Opening WhatsApp - please attach the PDF manually.', {
                    id: 'pdf-generation',
                    duration: 6000
                });
            }
        } catch (error) {
            console.error('Error sharing to WhatsApp:', error);
            if (error.message === 'PDF generation timeout') {
                toast.error('PDF generation is taking too long. Please try with fewer products.', { id: 'pdf-generation' });
            } else {
                toast.error('Failed to share. Please try again.', { id: 'pdf-generation' });
            }
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Handle PDF Download
    const handleDownload = async () => {
        try {
            setIsGeneratingPDF(true);
            const productCount = products?.length || 0;

            // Show different messages based on product count
            if (productCount > 50) {
                toast.loading(`Generating PDF for ${productCount} products... This may take a moment.`, { id: 'pdf-download' });
            } else {
                toast.loading('Generating PDF...', { id: 'pdf-download' });
            }

            // Get the PDF content element
            const pdfContent = document.querySelector('.pdf-content');

            if (!pdfContent) {
                toast.error('Content not found', { id: 'pdf-download' });
                return;
            }

            // Wait for rendering
            await new Promise(resolve => setTimeout(resolve, 300));

            // Generate canvas with timeout protection
            const canvasPromise = html2canvas(pdfContent, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: pdfContent.scrollWidth,
                height: pdfContent.scrollHeight,
                x: 0,
                y: 0,
                windowWidth: pdfContent.scrollWidth,
                windowHeight: pdfContent.scrollHeight
            });

            // Add timeout for large datasets
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('PDF generation timeout')), 60000) // 60 second timeout
            );

            const canvas = await Promise.race([canvasPromise, timeout]);

            if (!canvas || canvas.width === 0 || canvas.height === 0) {
                throw new Error('Canvas generation failed');
            }

            // console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);

            toast.loading('Creating PDF document...', { id: 'pdf-download' });

            // PDF dimensions (A4 landscape)
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // Add some margins
            const margin = 5; // 5mm margin
            const usablePageHeight = pageHeight - (margin * 2);

            // Calculate how to fit the canvas on pages
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * pageWidth) / canvas.width;

            const imgData = canvas.toDataURL('image/jpeg', 0.85); // Use JPEG with 85% quality for smaller file size

            // If content fits in one page
            if (imgHeight <= usablePageHeight) {
                pdf.addImage(imgData, 'JPEG', 0, margin, imgWidth, imgHeight);
            } else {
                // Split into multiple pages with better positioning
                let heightLeft = imgHeight;
                let position = 0;
                let pageNumber = 0;

                while (heightLeft > 0) {
                    if (pageNumber > 0) {
                        pdf.addPage();
                    }

                    // Calculate position for this page
                    const yPosition = position - (pageNumber * usablePageHeight);

                    // Add image to current page
                    pdf.addImage(imgData, 'JPEG', 0, yPosition + margin, imgWidth, imgHeight);

                    heightLeft -= usablePageHeight;
                    pageNumber++;
                }
            }

            toast.loading('Saving PDF...', { id: 'pdf-download' });

            // Convert PDF to blob and download
            const pdfBlob = pdf.output('blob');
            const url = URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Stock_List_${new Date().getTime()}.pdf`;
            a.click();
            URL.revokeObjectURL(url);

            toast.success('PDF downloaded successfully!', { id: 'pdf-download' });
        } catch (error) {
            console.error('Error downloading PDF:', error);
            if (error.message === 'PDF generation timeout') {
                toast.error('PDF generation is taking too long. Please try with fewer products.', { id: 'pdf-download' });
            } else {
                toast.error('Failed to download. Please try again.', { id: 'pdf-download' });
            }
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
    };


    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="max-w-[95vw] max-h-[95vh] overflow-y-auto p-0" data-radix-dialog-content>
                    <VisuallyHidden.Root>
                        <DialogTitle>Stock List Preview</DialogTitle>
                    </VisuallyHidden.Root>

                    {/* Action Buttons */}
                    <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 shadow-sm p-4 flex justify-end gap-3">
                        <button
                            onClick={handleWhatsAppShare}
                            disabled={isGeneratingPDF}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Share2 size={18} />
                            {isGeneratingPDF ? 'Generating...' : 'Share'}
                        </button>

                        <button
                            onClick={handleDownload}
                            disabled={isGeneratingPDF}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download size={18} />
                            {isGeneratingPDF ? 'Generating...' : 'Download'}
                        </button>

                        <button
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                        >
                            <X size={18} />
                            Close
                        </button>
                    </div>

                    <div className="pdf-content bg-gradient-to-br from-gray-50 to-white">
                        {/* Header Section with Blue Gradient */}
                        <div className="bg-gradient-to-r from-[#2B4C9F] to-[#3D5FA8] rounded-b-xl  overflow-hidden">
                            <div className="px-8 py-12">


                                <h1 className="text-4xl font-bold text-white text-center mb-2">
                                    {pathname === 'my-shop' ? selectedShop?.s_title : selectedCompanyShop?.shop?.s_title}
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

                        <div className="max-w-[95%] mx-auto bg-white shadow-md rounded-b-lg rounded-t-lg -mt-8">
                            {/* Seller Information Card */}
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mx-8 mb-8 relative z-10">
                                <div className="flex items-start justify-between">
                                    {/* Left side - Avatar and Name */}
                                    <div className="flex items-start gap-4">
                                        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                            {
                                                pathname === 'my-shop' ? selectedShop?.user?.name?.charAt(0).toUpperCase() : selectedCompanyShop?.shop?.s_title?.charAt(0).toUpperCase()
                                            }
                                        </div>
                                        <div className='flex items-center justify-center mt-3'>
                                            <h2 className="text-2xl font-bold text-gray-900 ">
                                                {pathname === 'my-shop' ? selectedShop?.user?.name : selectedCompanyShop?.shop?.s_title}
                                            </h2>
                                            {/* <div className="flex items-center gap-2 mb-2">
                                                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    Verified Seller
                                                </span>
                                                <span className="text-sm text-gray-600">• Shop #1</span>
                                            </div> */}
                                        </div>
                                    </div>

                                    {/* Right side - Contact Details */}
                                    <div className="text-right space-y-2">
                                        <div className="flex space-x-3 justify-end">
                                            {
                                                pathname === "/company-shop/" ? (
                                                    selectedCompanyShop?.shop?.profile?.up_biz_phone?.map((phone, index) => (


                                                        <div key={index} className="bg-gray-100 rounded-sm px-4 py-1.5">
                                                            <div className="flex items-center justify-start gap-2 text-sm">
                                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                                    />
                                                                </svg>
                                                                <span className="font-medium text-gray-700">Call Us</span>
                                                            </div>

                                                            <p className="text-lg font-bold text-blue-600">
                                                                {phone}
                                                            </p>
                                                        </div>
                                                    ))

                                                    // selectedShop && selectedShop?.profile?.up_biz_phone?.map((phone, index) => (
                                                    //     <div key={index} className="bg-gray-100 rounded-sm px-4 py-1.5">
                                                    //         <div className="flex items-center justify-start gap-2 text-sm">
                                                    //             <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    //                 <path
                                                    //                     strokeLinecap="round"
                                                    //                     strokeLinejoin="round"
                                                    //                     strokeWidth={2}
                                                    //                     d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                    //                 />
                                                    //             </svg>
                                                    //             <span className="font-medium text-gray-700">Call Us</span>
                                                    //         </div>

                                                    //         <p className="text-lg font-bold text-blue-600">
                                                    //             {phone}
                                                    //         </p>
                                                    //     </div>
                                                    // ))
                                                ) : userInfo?.profile?.up_biz_phone?.map((phone, index) => (
                                                    <div key={index}>
                                                        <div className="bg-gray-100 rounded-sm px-4 py-1.5">
                                                            <div className="flex items-center justify-start gap-2 text-sm">
                                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                                <span className="font-medium text-gray-700">Call Us</span>
                                                            </div>

                                                            <p className="text-lg font-bold text-blue-600">
                                                                {userInfo?.phone}
                                                            </p>

                                                        </div>

                                                        <div key={index} className="bg-gray-100 rounded-sm px-4 py-1.5">
                                                            <div className="flex items-center justify-start gap-2 text-sm">
                                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                                                    />
                                                                </svg>
                                                                <span className="font-medium text-gray-700">Call Us</span>
                                                            </div>

                                                            <p className="text-lg font-bold text-blue-600">
                                                                {phone}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            }


                                            {
                                                pathname === "/company-shop/" ? (
                                                    <div className="bg-gray-100 rounded-sm px-4 py-1.5">
                                                        <div className="flex items-center justify-start gap-2 text-sm mt-3">
                                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="font-medium text-gray-700">Email Us</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                           
                                                            {
                                                                selectedCompanyShop?.shop?.profile?.up_biz_email[0]
                                                            }
                                                        </p>
                                                    </div>
                                                ) : <div className="bg-gray-100 rounded-sm px-4 py-1.5">
                                                        <div className="flex items-center justify-start gap-2 text-sm mt-3">
                                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="font-medium text-gray-700">Email Us</span>
                                                        </div>
                                                        <p className="text-sm text-gray-600">
                                                            {userInfo?.email}
                                                        </p>
                                                    </div>
                                            }

                                        </div >


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
                                                <th className="px-4 w-[10%] py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-gray-600">
                                                    Details
                                                </th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-gray-600">
                                                    Specification
                                                </th>
                                                <th className="px-4 w-[59%] py-3 text-left text-sm font-semibold uppercase tracking-wider border-r border-gray-600">
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
                                                        <div className="text-lg">
                                                            {/* Brand Badge */}
                                                            {selectedFeatures.includes('brand') && (
                                                                // <span className={`inline-block px-2.5 py-1 rounded text-sm font-semibold text-white ${product.v_brand_name?.toLowerCase() === 'nissan' ? 'bg-red-600' :
                                                                <span className="font-bold text-blue-600">
                                                                    {product.v_brand_name}
                                                                </span>
                                                            )}

                                                            {/* Model Name */}
                                                            {selectedFeatures.includes('model') && (
                                                                <h3 className="text-lg font-bold text-blue-600">
                                                                    {product.v_model_name}
                                                                </h3>
                                                            )}

                                                            {/* Package/Edition */}
                                                            {selectedFeatures.includes('package') && (
                                                                <p className="text-lg font-bold text-blue-600">
                                                                    {product.v_edition_name}
                                                                </p>
                                                            )}

                                                            {/* Model & Registration Year */}

                                                            {selectedFeatures.includes('modelYr') && (
                                                                <div className='text-lg'>
                                                                    <span className="font-bold text-gray-700">Model:</span>{' '}
                                                                    <span className="text-gray-900">{product.v_mod_year}</span>
                                                                </div>
                                                            )}
                                                            {selectedFeatures.includes('registrationYr') && (
                                                                <div className='text-lg'>
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
                                                        <div className="text-lg">
                                                            <div>
                                                                <span className="font-semibold text-gray-700">Color:</span>{' '}
                                                                <span className="text-gray-900">{product.v_color_name}</span>
                                                            </div>
                                                            {selectedFeatures.includes('condition') && (
                                                                <div>
                                                                    <span className="font-semibold text-gray-700">Cond.:</span>{' '}
                                                                    <span className={`font-medium ${product.v_condition_name?.toLowerCase() === 'short used' ? 'text-green-600' :
                                                                        product.v_condition_name?.toLowerCase() === 'recon' ? 'text-gray-900' :
                                                                            product.v_condition_name?.toLowerCase() === 'new shape' ? 'text-gray-600' :
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
                                                        <div className=" text-gray-700 text-lg leading-relaxed">
                                                            {/* {
                                                            product.feature_specification && product.feature_specification.length > 0 ? (
                                                                product.feature_specification.map((feature, fIndex) => (
                                                                    <span key={fIndex}>
                                                                        {feature.md_title}
                                                                        {fIndex < product.feature_specification.length - 1 ? ', ' : '.'}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span className="text-gray-400 italic">No features specified</span>
                                                            )
                                                        } */}


                                                            <div className="flex flex-wrap gap-2">
                                                                {
                                                                    product?.feature_specification?.map((feature, index) => {
                                                                        const selectedItems = feature?.specification
                                                                            ?.filter(item => item?.is_selected)
                                                                            ?.map(item => item?.fs_title);

                                                                        if (!selectedItems || selectedItems.length === 0) return null;

                                                                        return (
                                                                            <span key={index} className="text-base">
                                                                                <span className="font-medium text-blue-600">
                                                                                    {feature?.md_title}:
                                                                                </span>{" "}
                                                                                {selectedItems.join(", ")}
                                                                            </span>
                                                                        );
                                                                    })
                                                                }
                                                            </div>

                                                            {/* {
                                                                product?.feature_specification?.map((feature, index) => {
                                                                    const selectedItems = feature?.specification
                                                                        ?.filter(item => item?.is_selected)
                                                                        ?.map(item => item?.fs_title);

                                                                    if (!selectedItems || selectedItems.length === 0) {
                                                                        return null;
                                                                    }

                                                                    return (
                                                                        <div className=" flex gap-2" key={index}>
                                                                            <span className="font-medium text-base text-blue-600">
                                                                                {feature?.md_title}:
                                                                            </span>

                                                                            <span className="text-base">
                                                                                {selectedItems.join(", ")}
                                                                            </span>
                                                                        </div>
                                                                    );
                                                                })
                                                            } */}
                                                        </div>
                                                    </td>

                                                    {/* Pricing & Status Column */}
                                                    <td className="px-4 py-2 align-top">
                                                        <div className="text-lg text-gray-700">
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
