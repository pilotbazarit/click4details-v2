import React, { useState } from 'react';
import CustomDatePicker from '../CustomDatePicker';

const FollowupPackageModal = ({ isOpen, onClose, onSubmitPackageDetails, packages, currentPackage }) => {
    const [selectedFollowupPackage, setSelectedFollowupPackage] = useState('');
    const [stage, setStage] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [visitDate, setVisitDate] = useState(null);

    // Reset form when modal opens/closes or when currentPackage changes
    React.useEffect(() => {
        if (isOpen) {
            if (currentPackage) {
                // Editing mode - populate with existing data
                setSelectedFollowupPackage(currentPackage.title || '');
                setStage(currentPackage.stage || '');
                setStartDate(currentPackage.start_date ? new Date(currentPackage.start_date) : null);
                setVisitDate(currentPackage.visit_date ? new Date(currentPackage.visit_date) : null);
            } else {
                // Add mode - reset form
                setSelectedFollowupPackage('');
                setStage('');
                setStartDate(null);
                setVisitDate(null);
            }
        }
    }, [isOpen, currentPackage]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        // Basic validation
        if (!selectedFollowupPackage.trim()) {
            alert('Please enter a package name');
            return;
        }

        onSubmitPackageDetails({
            selectedFollowupPackage,
            stage,
            startDate,
            visitDate,
        });
        // Form will be reset by useEffect when modal closes
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <div className="flex justify-between items-center border-gray-200">
                    <h5 className="text-lg font-semibold">{currentPackage ? 'Edit Followup Package' : 'Add New Followup Package'}</h5>
                    <button type="button" className="text-gray-400 hover:text-gray-600" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
                                         <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                         <input
                             type="text"
                             className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                             value={selectedFollowupPackage}
                             onChange={(e) => setSelectedFollowupPackage(e.target.value)}
                             placeholder="Enter package name"
                         />
                     </div>
                     <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Stage</label>
                         <select
                             className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                             value={stage}
                             onChange={(e) => setStage(e.target.value)}
                         >
                             <option value="">Select Stage</option>
                             <option value="Initial">Initial</option>
                             <option value="Before">Before</option>
                             <option value="After">After</option>
                             <option value="Current">Current</option>
                         </select>
                     </div>
                                          <div className="mb-4 w-full">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Starting Date</label>
                         <div className="w-full block">
                             <CustomDatePicker 
                                 selected={startDate}
                                 onChange={(date) => setStartDate(date)}
                                 placeholderText="Select starting date"
                             />
                         </div>
                     </div>
                                         <div className="mb-4">
                         <label className="block text-sm font-medium text-gray-700 mb-1">Visit Date</label>
                         <CustomDatePicker 
                             selected={visitDate}
                             onChange={(date) => setVisitDate(date)}
                             placeholderText="Select visit date"
                         />
                     </div>
                </div>
                <div className="flex justify-end p-4 border-t border-gray-200">
                    <button type="button" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700" onClick={handleSubmit}>
                        {currentPackage ? 'Update' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FollowupPackageModal;