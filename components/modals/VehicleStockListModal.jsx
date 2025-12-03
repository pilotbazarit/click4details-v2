import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useMyShopProductContext } from '@/context/MyShopProductContext'
import { useAppContext } from '@/context/AppContext'
import { jsPDF } from 'jspdf'
import StockListPreviewModal from './StockListPreviewModal'
import VehicleService from '@/services/VehicleService'

const VehicleStockListModal = ({ open, setOpen }) => {
    // const { products } = useMyShopProductContext()
    const { selectedShop, user } = useAppContext()
    const [products, setProducts] = useState([]);



    const getAllProduct = async (reset = false) => {
        try {
          if (!selectedShop) return;
         
    
          const currentPage = 1;
    
          const res = await VehicleService.Queries.getVehiclesWithLogin({
            _page: currentPage,
            _perPage: 2000,
            _shop_id: selectedShop?.s_id,
            _order: 'desc',
            _orderBy: 'v_id',
            _status: 'active'
          });

         
          if (res.status === "success") {
            const newProducts = res?.data?.data || [];

            setProducts(newProducts);
          }
        } catch (error) {
          console.log("get product error", error);
        }
      };


    useEffect(() => {
        getAllProduct();
    }, []);

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

                        {/* Info text */}
                        <p className='text-center text-sm text-cyan-600 mt-6 mb-4'>
                            Selected features will be included in your stock list
                        </p>

                        {/* Generate PDF Button */}
                        <button
                            onClick={handleInvoiceModalOpen}
                            className='w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg'
                        >
                            Generate PDF Stock List
                        </button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Stock List Preview Modal */}
            <StockListPreviewModal
                open={previewModalOpen}
                setOpen={setPreviewModalOpen}
                selectedFeatures={selectedFeatures}
                products={products}
            />
        </>
    )
}

export default VehicleStockListModal
