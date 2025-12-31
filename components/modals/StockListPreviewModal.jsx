import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogTitle,
} from "@/components/ui/dialog";
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useMyShopProductContext } from '@/context/MyShopProductContext';
import { useAppContext } from '@/context/AppContext';
import { X, Share2, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePathname } from "next/navigation";
import { useCompanyShopProductContext } from '@/context/CompanyShopProductContext';
import VehicleService from '@/services/VehicleService';

const StockListPreviewModal = ({ open, setOpen, selectedFeatures, userInfo, orderBy, order }) => {
    // Try to get context, but don't fail if it's not available
    // const context = useMyShopProductContext();

    // console.log("orderBy==============", orderBy);
    const companyCtx = useCompanyShopProductContext();
    const shopCtx = useMyShopProductContext();

    const { selectedShop, selectedCompanyShop } = useAppContext();
    const [products, setProducts] = useState([]);
    const pathname = usePathname();

    const isCompanyShop = pathname === '/company-shop/';
    const activeCtx = isCompanyShop ? companyCtx : shopCtx;


    const loading = activeCtx?.loading;
    const hasMore = activeCtx?.hasMore;
    const getAllProduct = activeCtx?.getAllProduct;


    const observerRef = useRef(null);
    const [loadingNewData, setLoadingNewData] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);
    const initialLoadRef = useRef(false);
    const [currentPage, setCurrentPage] = useState(1);

    const lastProductRef = useCallback(
        (node) => {
            if (loading || loadingNewData) return;

            if (observerRef.current) observerRef.current.disconnect();

            observerRef.current = new IntersectionObserver(
                async (entries) => {
                    if (entries[0].isIntersecting && hasMore) {
                        setLoadingNewData(true);
                        const nextPage = currentPage + 1;
                        setCurrentPage(nextPage);
                        await getAllProduct?.(false, orderBy, order, 5000, nextPage);
                        setLoadingNewData(false);
                    }
                },
                {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0.1,
                }
            );

            if (node) observerRef.current.observe(node);
        },
        [loading, loadingNewData, hasMore, getAllProduct, orderBy, order, currentPage]
    );



    // Initial load when modal opens
    useEffect(() => {
        if (open && !initialLoadRef.current && getAllProduct) {
            initialLoadRef.current = true;
            setInitialLoading(true);
            setCurrentPage(1); // Reset to page 1
            getAllProduct(false, orderBy, order, 5000, 1).finally(() => {
                setInitialLoading(false);
            });
        }

        // Reset the ref when modal closes
        if (!open) {
            initialLoadRef.current = false;
            setCurrentPage(1); // Reset page on close
        }
    }, [open, getAllProduct, orderBy, order]);

    useEffect(() => {
        // Only update products when modal is open to prevent modal closing
        if (open) {
            if (pathname === '/company-shop/') {
                setProducts(companyCtx?.products || []);
            } else {
                setProducts(shopCtx?.products || []);
            }
        }
    }, [pathname, companyCtx?.products, shopCtx?.products, open]);


    // Get current date in readable format
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });


    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // Generate PDF definition using pdfmake
    const generatePdfDefinition = () => {
        const shopName = pathname === '/my-shop/' ? selectedShop?.s_title : selectedCompanyShop?.shop?.s_title;
        const userName = pathname === '/my-shop/' ? selectedShop?.user?.name : selectedCompanyShop?.shop?.s_title;
        const userInitial = userName?.charAt(0).toUpperCase() || 'S';

        // Build phone numbers array
        let phoneNumbers = [];
        if (pathname === "/company-shop/") {
            phoneNumbers = selectedCompanyShop?.shop?.profile?.up_biz_phone || [];
        } else {
            phoneNumbers = userInfo?.profile?.up_biz_phone || [];
            if (userInfo?.phone) {
                phoneNumbers = [userInfo?.phone, ...phoneNumbers];
            }
        }

        // Get email
        const email = pathname === "/company-shop/"
            ? selectedCompanyShop?.shop?.profile?.up_biz_email?.[0]
            : userInfo?.email;

        // Build table headers based on selected features
        const tableHeaders = [
            { text: '#', style: 'tableHeader', alignment: 'center' },
            { text: 'Details', style: 'tableHeader' },
            { text: 'Specification', style: 'tableHeader' },
            { text: 'Key Features', style: 'tableHeader' },
            { text: 'Pricing & Status', style: 'tableHeader' }
        ];

        // Build table body
        const tableBody = [tableHeaders];

        products.forEach((product, index) => {
            // Details Column
            const detailsContent = [];

            if (selectedFeatures.includes('brand')) {
                detailsContent.push({ text: product.v_brand_name, style: 'detailText', color: '#2563eb' });
            }
            if (selectedFeatures.includes('model')) {
                detailsContent.push({ text: product.v_model_name, style: 'detailText', bold: true, color: '#2563eb' });
            }
            if (selectedFeatures.includes('package')) {
                detailsContent.push({ text: product.v_edition_name, style: 'detailText', bold: true, color: '#2563eb' });
            }
            if (selectedFeatures.includes('modelYr')) {
                detailsContent.push({
                    text: [
                        { text: 'Model: ', bold: true, color: '#374151' },
                        { text: product.v_mod_year, color: '#111827' }
                    ], style: 'detailText'
                });
            }
            if (selectedFeatures.includes('registrationYr')) {
                detailsContent.push({
                    text: [
                        { text: 'Reg: ', bold: true, color: '#374151' },
                        { text: product.v_registration, color: '#111827' }
                    ], style: 'detailText'
                });
            }

            // Specification Column
            const specsContent = [
                {
                    text: [
                        { text: 'Color: ', bold: true, color: '#374151' },
                        { text: product.v_color_name, color: '#111827' }
                    ], style: 'specText'
                }
            ];

            if (selectedFeatures.includes('condition')) {
                specsContent.push({
                    text: [
                        { text: 'Cond.: ', bold: true, color: '#374151' },
                        { text: product.v_condition_name, color: '#111827' }
                    ], style: 'specText'
                });
            }

            specsContent.push({
                text: [
                    { text: 'Mileage: ', bold: true, color: '#374151' },
                    { text: `${product.v_mileage} km`, color: '#111827' }
                ], style: 'specText'
            });

            if (selectedFeatures.includes('fuel')) {
                specsContent.push({
                    text: [
                        { text: 'Fuel: ', bold: true, color: '#374151' },
                        { text: product.v_fuel_name, color: '#111827' }
                    ], style: 'specText'
                });
            }

            if (selectedFeatures.includes('option')) {
                specsContent.push({
                    text: [
                        { text: 'Option: ', bold: true, color: '#374151' },
                        { text: product.v_transmission_name, color: '#111827' }
                    ], style: 'specText'
                });
            }

            if (selectedFeatures.includes('capacity')) {
                specsContent.push({
                    text: [
                        { text: 'CC: ', bold: true, color: '#374151' },
                        { text: product.v_capacity, color: '#111827' }
                    ], style: 'specText'
                });
            }

            // Key Features Column
            const featuresContent = [];
            if (product?.feature_specification) {
                product.feature_specification.forEach((feature) => {
                    const selectedItems = feature?.specification
                        ?.filter(item => item?.is_selected)
                        ?.map(item => item?.fs_title);

                    if (selectedItems && selectedItems.length > 0) {
                        featuresContent.push({
                            text: [
                                { text: `${feature?.md_title}: `, bold: true, color: '#2563eb' },
                                { text: selectedItems.join(", "), color: '#374151' }
                            ],
                            style: 'featureText',
                            margin: [0, 2]
                        });
                    }
                });
            }

            if (featuresContent.length === 0) {
                featuresContent.push({ text: 'No features specified', style: 'featureText', color: '#9ca3af', italics: true });
            }

            // Pricing & Status Column
            const pricingContent = [];

            if (selectedFeatures.includes('available')) {
                pricingContent.push({
                    text: [
                        { text: 'Avail: ', bold: true, color: '#374151' },
                        { text: product.v_availability_name, color: '#111827' }
                    ], style: 'pricingText'
                });
            }

            if (selectedFeatures.includes('location')) {
                pricingContent.push({
                    text: [
                        { text: 'Loc: ', bold: true, color: '#374151' },
                        { text: product.v_location?.location_name || '-', color: '#111827' }
                    ], style: 'pricingText'
                });
            }

            if (selectedFeatures.includes('fixedPrice')) {
                pricingContent.push({
                    text: [
                        { text: 'Fxd TK: ', bold: true, color: '#374151' },
                        { text: product?.vehicle_db_price?.vp_user_fixed_price || '-', color: '#111827' }
                    ], style: 'pricingText'
                });
            }

            if (selectedFeatures.includes('askingPrice')) {
                pricingContent.push({
                    text: [
                        { text: 'Ask TK: ', bold: true, color: '#374151' },
                        { text: product?.vehicle_db_price?.vp_user_asking_price || '-', color: '#111827' }
                    ], style: 'pricingText'
                });
            }

            if (selectedFeatures.includes('chassisNumber')) {
                pricingContent.push({
                    text: [
                        { text: 'Chassis: ', bold: true, color: '#374151' },
                        { text: product?.v_chassis || '-', color: '#111827' }
                    ], style: 'pricingText'
                });
            }

            if (selectedFeatures.includes('engineNumber')) {
                pricingContent.push({
                    text: [
                        { text: 'Eng No: ', bold: true, color: '#374151' },
                        { text: product?.v_engine || '-', color: '#111827' }
                    ], style: 'pricingText'
                });
            }

            pricingContent.push({
                text: 'Click Here',
                link: `https://click4details.app/product/${product?.v_slug}`,
                color: '#2563eb',
                decoration: 'underline',
                style: 'pricingText'
            });

            // Add row to table
            tableBody.push([
                { text: String(index + 1).padStart(2, '0'), alignment: 'center', style: 'tableCell', bold: true },
                { stack: detailsContent, style: 'tableCell' },
                { stack: specsContent, style: 'tableCell' },
                { stack: featuresContent, style: 'tableCell' },
                { stack: pricingContent, style: 'tableCell' }
            ]);
        });

        // Build phone number card elements
        const phoneCards = phoneNumbers.map(phone => ({
            table: {
                widths: ['auto'],
                body: [
                    [
                        {
                            stack: [
                                {
                                    text: 'Call Us',
                                    fontSize: 8,
                                    color: '#6b7280',
                                    margin: [0, 0, 0, 2]
                                },
                                {
                                    text: phone,
                                    fontSize: 11,
                                    bold: true,
                                    color: '#2563eb'
                                }
                            ],
                            fillColor: '#f3f4f6',
                            border: [true, true, true, true],
                            borderColor: ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb'],
                            margin: [8, 6, 8, 6]
                        }
                    ]
                ]
            },
            layout: {
                hLineWidth: function () { return 1; },
                vLineWidth: function () { return 1; },
                hLineColor: function () { return '#e5e7eb'; },
                vLineColor: function () { return '#e5e7eb'; }
            },
            margin: [0, 2, 5, 2]
        }));

        return {
            pageSize: 'A4',
            pageOrientation: 'landscape',
            pageMargins: [20, 20, 20, 20],
            content: [
                // Header with blue background
                {
                    table: {
                        widths: ['*'],
                        body: [
                            [
                                {
                                    stack: [
                                        {
                                            text: shopName,
                                            fontSize: 24,
                                            bold: true,
                                            color: '#ffffff',
                                            alignment: 'center',
                                            margin: [0, 15, 0, 5]
                                        },
                                        {
                                            text: 'Stock Inventory & Price List',
                                            fontSize: 14,
                                            color: '#ffffff',
                                            alignment: 'center',
                                            margin: [0, 0, 0, 10]
                                        },
                                        {
                                            columns: [
                                                { width: '*', text: '' },
                                                {
                                                    width: 'auto',
                                                    table: {
                                                        widths: ['auto'],
                                                        body: [
                                                            [
                                                                {
                                                                    text: `Date: ${currentDate}`,
                                                                    fontSize: 10,
                                                                    color: '#ffffff',
                                                                    alignment: 'center',
                                                                    margin: [12, 6, 12, 6],
                                                                    fillColor: 'rgba(255, 255, 255, 0.6)',
                                                                    border: [true, true, true, true],
                                                                    borderColor: ['#9ca3af', '#9ca3af', '#9ca3af', '#9ca3af']
                                                                }
                                                            ]
                                                        ]
                                                    },
                                                    layout: {
                                                        hLineWidth: function () { return 1; },
                                                        vLineWidth: function () { return 1; },
                                                        hLineColor: function () { return '#9ca3af'; },
                                                        vLineColor: function () { return '#9ca3af'; }
                                                    }
                                                },
                                                { width: '*', text: '' }
                                            ],
                                            margin: [0, 0, 0, 12]
                                        }
                                    ],
                                    fillColor: '#2B4C9F',
                                    border: [false, false, false, false]
                                }
                            ]
                        ]
                    },
                    layout: 'noBorders',
                    margin: [0, 0, 0, 15]
                },
                // Seller Information Card
                {
                    table: {
                        widths: ['auto', '*', 'auto'],
                        body: [
                            [
                                {
                                    text: userInitial,
                                    fontSize: 14,
                                    bold: true,
                                    color: '#ffffff',
                                    fillColor: '#3b82f6',
                                    alignment: 'center',
                                    margin: [8, 4, 8, 4],
                                    border: [false, false, false, false]
                                },
                                {
                                    text: userName,
                                    fontSize: 16,
                                    bold: true,
                                    color: '#111827',
                                    margin: [10, 8, 0, 0],
                                    border: [false, false, false, false]
                                },
                                {
                                    columns: phoneCards.concat([
                                        {
                                            table: {
                                                widths: ['auto'],
                                                body: [
                                                    [
                                                        {
                                                            stack: [
                                                                {
                                                                    text: 'Email Us',
                                                                    fontSize: 8,
                                                                    color: '#6b7280',
                                                                    margin: [0, 0, 0, 2]
                                                                },
                                                                {
                                                                    text: email || '',
                                                                    fontSize: 10,
                                                                    bold: true,
                                                                    color: '#2563eb'
                                                                }
                                                            ],
                                                            fillColor: '#f3f4f6',
                                                            border: [true, true, true, true],
                                                            borderColor: ['#e5e7eb', '#e5e7eb', '#e5e7eb', '#e5e7eb'],
                                                            margin: [8, 6, 8, 6]
                                                        }
                                                    ]
                                                ]
                                            },
                                            layout: {
                                                hLineWidth: function () { return 1; },
                                                vLineWidth: function () { return 1; },
                                                hLineColor: function () { return '#e5e7eb'; },
                                                vLineColor: function () { return '#e5e7eb'; }
                                            },
                                            margin: [0, 2, 0, 2]
                                        }
                                    ]),
                                    alignment: 'right',
                                    margin: [0, 5, 0, 5],
                                    border: [false, false, false, false]
                                }
                            ]
                        ]
                    },
                    layout: {
                        fillColor: '#ffffff',
                        hLineWidth: function () { return 1; },
                        vLineWidth: function () { return 1; },
                        hLineColor: function () { return '#e5e7eb'; },
                        vLineColor: function () { return '#e5e7eb'; }
                    },
                    margin: [0, 0, 0, 15]
                },
                // Product Table
                {
                    table: {
                        headerRows: 1,
                        widths: [25, 'auto', 'auto', '*', 'auto'],
                        body: tableBody
                    },
                    layout: {
                        fillColor: function (rowIndex, node, columnIndex) {
                            return rowIndex === 0 ? '#1e293b' : (rowIndex % 2 === 0 ? '#ffffff' : '#f8fafc');
                        },
                        hLineWidth: function (i, node) {
                            return 0.5;
                        },
                        vLineWidth: function (i, node) {
                            return 0.5;
                        },
                        hLineColor: function (i, node) {
                            return '#e5e7eb';
                        },
                        vLineColor: function (i, node) {
                            return '#e5e7eb';
                        }
                    }
                }
            ],
            styles: {
                tableHeader: {
                    fontSize: 10,
                    bold: true,
                    color: '#ffffff',
                    margin: [5, 8, 5, 8]
                },
                tableCell: {
                    fontSize: 8,
                    margin: [5, 5, 5, 5]
                },
                detailText: {
                    fontSize: 9,
                    margin: [0, 1]
                },
                specText: {
                    fontSize: 9,
                    margin: [0, 1]
                },
                featureText: {
                    fontSize: 8,
                    margin: [0, 1]
                },
                pricingText: {
                    fontSize: 9,
                    margin: [0, 1]
                }
            }
        };
    };

    // Handle WhatsApp share with PDF
    const handleWhatsAppShareold = async () => {
        try {
            setIsGeneratingPDF(true);
            const productCount = products?.length || 0;

            // Show different messages based on product count
            if (productCount > 50) {
                toast.loading(`Generating PDF for ${productCount} products... This may take a moment.`, { id: 'pdf-generation' });
            } else {
                toast.loading('Generating PDF...', { id: 'pdf-generation' });
            }

            // Dynamically import pdfMake (client-side only)
            const pdfMakeModule = await import('pdfmake/build/pdfmake');
            const pdfMake = pdfMakeModule.default || pdfMakeModule;

            // Try to load fonts, but continue if it fails
            try {
                const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
                const pdfFonts = pdfFontsModule.default || pdfFontsModule;

                // Try different possible structures
                if (pdfFonts.pdfMake?.vfs) {
                    pdfMake.vfs = pdfFonts.pdfMake.vfs;
                } else if (pdfFonts.vfs) {
                    pdfMake.vfs = pdfFonts.vfs;
                } else {
                    // If fonts object has a direct vfs property
                    pdfMake.vfs = pdfFonts;
                }
            } catch (fontError) {
                console.warn('Could not load custom fonts, using defaults:', fontError);
            }

            // Generate PDF definition
            const docDefinition = generatePdfDefinition();

            toast.loading('Creating PDF document...', { id: 'pdf-generation' });

            // Create PDF
            const pdfDocGenerator = pdfMake.createPdf(docDefinition);

            // Get PDF as blob
            pdfDocGenerator.getBlob((pdfBlob) => {
                // Create filename
                const fileName = `Stock_List_${new Date().getTime()}.pdf`;

                // Try native share first, but with better error handling
                const tryNativeShare = async () => {
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
                                    text: `Stock List - ${selectedShop?.s_title || selectedCompanyShop?.shop?.s_title || 'My Shop'}`,
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
                        const shopName = selectedShop?.s_title || selectedCompanyShop?.shop?.s_title || 'My Shop';
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
                };

                tryNativeShare();
            });
        } catch (error) {
            console.error('Error sharing to WhatsApp:', error);
            toast.error('Failed to share. Please try again.', { id: 'pdf-generation' });
        } finally {
            setIsGeneratingPDF(false);
        }
    };


    const handleWhatsAppShare = async () => {
        try {
            setIsGeneratingPDF(true);
            toast.loading('Preparing PDF for WhatsApp share...', { id: 'pdf-whatsapp' });

            // All available feature mappings
            const allFeatureMap = {
                'brand': 'brand',
                'model': 'model',
                'package': 'pac',
                'modelYr': 'mod-yr',
                'registrationYr': 'req-yr',
                'condition': 'con',
                'option': 'opt',
                'fuel': 'fuel',
                'capacity': 'cc',
                'available': 'avail',
                'location': 'loc',
                'fixedPrice': 'fxd',
                'askingPrice': 'ask',
                'chassisNumber': 'chass',
                'engineNumber': 'eng',
            };

            // Build featureMap with only selectedFeatures
            const featureMap = selectedFeatures.reduce((acc, feature) => {
                if (allFeatureMap[feature]) {
                    acc[feature] = allFeatureMap[feature];
                }
                return acc;
            }, {});

            // Build _show array from selectedFeatures
            const showParams = selectedFeatures.reduce((acc, feature, index) => {
                const mappedFeature = featureMap[feature];
                if (mappedFeature) {
                    acc[`_show[${index}]`] = mappedFeature;
                }
                return acc;
            }, {});

            const params = {
                _page: 1,
                _shop_id: pathname === '/company-shop/' ? selectedCompanyShop?.shop?.s_id : selectedShop?.s_id,
                _order: order || 'asc',
                _orderBy: orderBy || 'brand_model',
                ...showParams,
                _is_down: 1,
            };

            const response = await VehicleService.Queries.stockListDownload(params);

            // The response itself is the Blob, not response.data
            const blob = response.data || response;

            if (blob instanceof Blob && blob.size > 0) {
                // Try to read first few bytes to verify it's a PDF
                const reader = new FileReader();
                reader.onloadend = () => {
                    const arr = new Uint8Array(reader.result).subarray(0, 5);
                    const header = String.fromCharCode.apply(null, arr);

                    if (header === '%PDF-') {
                        // Valid PDF, proceed with WhatsApp share
                        const fileName = `Stock_List_${new Date().getTime()}.pdf`;
                        const shopName = pathname === '/my-shop/' ? selectedShop?.s_title : selectedCompanyShop?.shop?.s_title;
                        const productCount = products?.length || 0;

                        // Try native share first
                        const tryNativeShare = async () => {
                            try {
                                // Check if we can share files
                                const canShare = navigator.share && navigator.canShare;

                                if (canShare) {
                                    const file = new File([blob], fileName, {
                                        type: 'application/pdf'
                                    });

                                    // Check if files can be shared
                                    if (navigator.canShare({ files: [file] })) {
                                        await navigator.share({
                                            title: 'Stock List',
                                            text: `Stock List - ${shopName}`,
                                            files: [file]
                                        });
                                        toast.success('Shared successfully!', { id: 'pdf-whatsapp' });
                                        return;
                                    }
                                }

                                // If native share not available, use fallback
                                throw new Error('Native share not available');

                            } catch (shareError) {
                                // Fallback: Download PDF and open WhatsApp
                                const message = `📋 *Stock List - ${shopName}*\n\nPlease find the attached Stock List PDF.\n\nTotal Products: ${productCount}`;

                                // Create WhatsApp URL
                                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

                                // Download the PDF
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = fileName;
                                document.body.appendChild(a);
                                a.click();
                                document.body.removeChild(a);
                                URL.revokeObjectURL(url);

                                // Small delay before opening WhatsApp
                                setTimeout(() => {
                                    window.open(whatsappUrl, '_blank');
                                }, 500);

                                toast.success('PDF downloaded! Opening WhatsApp - please attach the PDF manually.', {
                                    id: 'pdf-whatsapp',
                                    duration: 6000
                                });
                            }
                        };

                        tryNativeShare();
                    } else {
                        // Not a valid PDF
                        console.error('Invalid PDF file. Header:', header);
                        toast.error('Downloaded file is not a valid PDF.', { id: 'pdf-whatsapp' });
                    }
                };
                reader.readAsArrayBuffer(blob.slice(0, 5));
            } else {
                // Invalid response
                console.error('Invalid response:', response);
                toast.error('Invalid PDF response from server.', { id: 'pdf-whatsapp' });
            }
        } catch (error) {
            console.error('Error sharing to WhatsApp:', error);
            toast.error('Failed to share. Please try again.', { id: 'pdf-whatsapp' });
        } finally {
            setIsGeneratingPDF(false);
        }
    };



    const handleDownload = async () => {
        try {
            setIsGeneratingPDF(true);
            toast.loading('Preparing PDF download...', { id: 'pdf-download' });

            // All available feature mappings
            const allFeatureMap = {
                'brand': 'brand',
                'model': 'model',
                'package': 'pac',
                'modelYr': 'mod-yr',
                'registrationYr': 'req-yr',
                'condition': 'con',
                'option': 'opt',
                'fuel': 'fuel',
                'capacity': 'cc',
                'available': 'avail',
                'location': 'loc',
                'fixedPrice': 'fxd',
                'askingPrice': 'ask',
                'chassisNumber': 'chass',
                'engineNumber': 'eng',
            };

            // Build featureMap with only selectedFeatures
            const featureMap = selectedFeatures.reduce((acc, feature) => {
                if (allFeatureMap[feature]) {
                    acc[feature] = allFeatureMap[feature];
                }
                return acc;
            }, {});

            // Build _show array from selectedFeatures
            const showParams = selectedFeatures.reduce((acc, feature, index) => {
                const mappedFeature = featureMap[feature];
                if (mappedFeature) {
                    acc[`_show[${index}]`] = mappedFeature;
                }
                return acc;
            }, {});

            const params = {
                _page: 1,
                _shop_id: pathname === '/company-shop/' ? selectedCompanyShop?.shop?.s_id : selectedShop?.s_id,
                _order: order || 'asc',
                _orderBy: orderBy || 'brand_model',
                ...showParams,
                _is_down: 1,
            };


            

            const response = await VehicleService.Queries.stockListDownload(params);

            // console.log("response pdf download", response);

            // The response itself is the Blob, not response.data
            const blob = response.data || response;

            if (blob instanceof Blob && blob.size > 0) {
                // Try to read first few bytes to verify it's a PDF
                const reader = new FileReader();
                reader.onloadend = () => {
                    const arr = new Uint8Array(reader.result).subarray(0, 5);
                    const header = String.fromCharCode.apply(null, arr);

                    if (header === '%PDF-') {
                        // Valid PDF, proceed with download
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `Stock_List_${new Date().getTime()}.pdf`;

                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);

                        toast.success('PDF downloaded successfully!', { id: 'pdf-download' });
                    } else {
                        // Not a valid PDF, but might be HTML error page
                        console.error('Invalid PDF file. Header:', header);

                        // Try to read as text to see error message
                        const textReader = new FileReader();
                        textReader.onloadend = () => {
                            console.error('Response content:', textReader.result);
                        };
                        textReader.readAsText(blob);

                        toast.error('Downloaded file is not a valid PDF.', { id: 'pdf-download' });
                    }
                };
                reader.readAsArrayBuffer(blob.slice(0, 5));
            } else {
                // Unknown response format
                console.error('Invalid response:', response);
                toast.error('Invalid PDF response from server.', { id: 'pdf-download' });
            }
        } catch (error) {
            console.error('Error downloading PDF:', error);
            toast.error('Failed to download PDF. Please try again.', { id: 'pdf-download' });
        } finally {
            setIsGeneratingPDF(false);
        }
    }

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
                                                pathname === '/my-shop/' ? selectedShop.user.name?.charAt(0).toUpperCase() : selectedCompanyShop?.shop?.s_title?.charAt(0).toUpperCase()
                                            }
                                        </div>
                                        <div className='flex items-center justify-center mt-3'>
                                            <h2 className="text-2xl font-bold text-gray-900 ">
                                                {pathname === '/my-shop/' ? selectedShop?.user?.name : selectedCompanyShop?.shop?.s_title}
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
                                {initialLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="text-center">
                                            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                            <p className="text-gray-600 font-medium text-lg">Loading {orderBy === 'v_milage' ? 'mileage sorted' : orderBy === 'v_priority' ? 'priority sorted' : 'sorted'} products...</p>
                                            <p className="text-gray-500 text-sm mt-2">Please wait while we fetch your stock list</p>
                                        </div>
                                    </div>
                                ) : (
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
                                                    <tr ref={lastProductRef} key={index} className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}>
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
                                            {loadingNewData && (
                                                <tfoot>
                                                    <tr>
                                                        <td colSpan="5" className="px-4 py-6 text-center">
                                                            <div className="flex items-center justify-center gap-3">
                                                                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                                <span className="text-gray-600 font-medium">Loading more data...</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tfoot>
                                            )}
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default StockListPreviewModal
