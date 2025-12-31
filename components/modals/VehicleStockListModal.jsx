import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import StockListPreviewModal from './StockListPreviewModal'
import { usePathname } from "next/navigation"
import { useAppContext } from '@/context/AppContext'
import VehicleService from '@/services/VehicleService'
import toast from 'react-hot-toast'

const VehicleStockListModal = ({ open, setOpen, user }) => {
    // Get pathname and context
    const pathname = usePathname();
    const { selectedShop, selectedCompanyShop } = useAppContext();

    // State for sorting options
    const [orderBy, setOrderBy] = useState('v_priority');
    const [order, setOrder] = useState('ASC');
    const [userInfo, setUserInfo] = useState(user);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    // State for preview modal
    const [previewModalOpen, setPreviewModalOpen] = useState(false)

    // All available features
    const allFeatures = [
        { id: 'brand', label: 'Brand' },
        { id: 'model', label: 'Model' },
        { id: 'package', label: 'Package' },
        { id: 'modelYr', label: 'Model Yr' },
        { id: 'registrationYr', label: 'Registration Yr' },
        { id: 'condition', label: 'Condition' },
        { id: 'option', label: 'Option' },
        { id: 'fuel', label: 'Fuel' },
        { id: 'mileage', label: 'Mileage' },
        { id: 'capacity', label: 'Capacity(CC)' },
        { id: 'point', label: 'Point' },
        { id: 'engineNumber', label: 'Engine Number' },
        { id: 'chassisNumber', label: 'Chassis Number' },
        { id: 'available', label: 'Available' },
        { id: 'location', label: 'Location' },
        { id: 'body', label: 'Body' },
        { id: 'seat', label: 'Seat' },
        { id: 'detailLink', label: 'Detail Link' },
        { id: 'askingPrice', label: 'Asking Price' },
        { id: 'fixedPrice', label: 'Fixed Price' },
    ];

    // State to track selected features - Initially all features are selected
    const [selectedFeatures, setSelectedFeatures] = useState(
        allFeatures.map(feature => feature.id)
    );

    // console.log("selectedFeatures", selectedFeatures);

    // Function to handle feature selection/deselection
    const toggleFeature = (featureId) => {
        setSelectedFeatures(prev => {
            if (prev.includes(featureId)) {
                // Already selected, so remove it
                return prev.filter(id => id !== featureId);
            } else {
                // Not selected, so add it
                return [...prev, featureId];
            }
        });
    };

    // Function to check if a feature is selected
    const isSelected = (featureId) => {
        return selectedFeatures.includes(featureId);
    };

    const handleInvoiceModalOpen = () => {
        setPreviewModalOpen(true)
    }


    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
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

            // Add static parameter for detail link
            showParams[`_show[${selectedFeatures.length}]`] = "d-link";

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

    return (
        <>
            <Dialog open={open} onOpenChange={handleOpenChange}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className='text-center text-xl font-semibold'>
                            Vehicle Stock List
                        </DialogTitle>
                    </DialogHeader>

                    <div className='mt-4'>
                        {/* Feature buttons grid - 2 columns */}
                        <div className='grid grid-cols-2 gap-3'>
                            {allFeatures.map((feature) => (
                                <button
                                    key={feature.id}
                                    onClick={() => toggleFeature(feature.id)}
                                    className={`
                                    py-4 px-4 rounded-lg font-medium text-white text-sm
                                    transition-all duration-200
                                    ${isSelected(feature.id)
                                            ? 'bg-blue-700 hover:bg-blue-800'
                                            : 'bg-blue-300 hover:bg-blue-400'
                                        }
                                `}
                                >
                                    {feature.label}
                                </button>
                            ))}

                        </div>

                        {/* Sorting Options - 2 dropdowns in a row */}
                        <div className='grid grid-cols-2 gap-3 mt-4'>
                            {/* Order By Dropdown */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Order By
                                </label>
                                <select
                                    value={orderBy}
                                    onChange={(e) => setOrderBy(e.target.value)}
                                    className='w-full py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                                >
                                    <option value="v_priority">Priority</option>
                                    <option value="v_created_at">Upload Date</option>
                                    <option value="v_milage">Mileage</option>
                                    <option value="brand_model">Brand/Model/package</option>
                                    {/* <option value="package">Package</option> */}
                                </select>
                            </div>

                            {/* Order Dropdown */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Order
                                </label>
                                <select
                                    value={order}
                                    onChange={(e) => setOrder(e.target.value)}
                                    className='w-full py-3 px-4 rounded-lg border border-gray-300 bg-white text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200'
                                >
                                    <option value="ASC">Ascending</option>
                                    <option value="DESC">Descending</option>
                                </select>
                            </div>
                        </div>

                        {/* Info text */}
                        <p className='text-center text-sm text-cyan-600 mt-6 mb-4'>
                            Selected features will be included in your stock list
                        </p>

                        {/* Generate PDF Button */}
                        <button
                           onClick={handleDownload}
                            // onClick={handleInvoiceModalOpen}
                            className="w-full font-semibold py-4 rounded-lg transition-all duration-200 shadow-md bg-blue-500 hover:bg-blue-600 hover:shadow-lg text-white"
                        >
                            {/* Generate PDF Stock List */}
                             {isGeneratingPDF ? 'Generating...' : ' Generate PDF Stock List'}
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Stock List Preview Modal */}
            {/*  <StockListPreviewModal
                open={previewModalOpen}
                setOpen={setPreviewModalOpen}
                selectedFeatures={selectedFeatures}
                userInfo={userInfo}
                orderBy={orderBy}
                order={order}
            /> */}
        </>
    )
}

export default VehicleStockListModal


