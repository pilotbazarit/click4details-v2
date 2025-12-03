import React, { useState, useEffect } from 'react';

const FollowupMessageModal = ({ isOpen, onClose, onSubmitMessageDetails, currentMessage }) => {
    const [stage, setStage] = useState('');
    const [message, setMessage] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (currentMessage) {
                // Editing mode - populate with existing data
                setStage(currentMessage.stage || '');
                setMessage(currentMessage.message || '');
                setDescription(currentMessage.description || '');
            } else {
                // Add mode - reset form
                setStage('');
                setMessage('');
                setDescription('');
            }
        }
    }, [isOpen, currentMessage]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        // Basic validation
        if (!stage.trim() || !message.trim()) {
            alert('Please fill in all required fields: Stage and Message.');
            return;
        }

        onSubmitMessageDetails({
            stage,
            message,
            status: 'Active',
            description,
        });
        onClose(); // Close modal after submit
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
                <div className="flex justify-between items-center border-b pb-3">
                    <h5 className="text-lg font-semibold">{currentMessage ? 'Edit Followup Message' : 'Add New Followup Message'}</h5>
                    <button type="button" className="text-gray-400 hover:text-gray-600" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
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
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                        <textarea
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Enter the message"
                            rows="4"
                        ></textarea>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter a description (optional)"
                            rows="3"
                        ></textarea>
                    </div>
                </div>
                <div className="flex justify-end p-4 border-t border-gray-200">
                    <button type="button" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700" onClick={handleSubmit}>
                        {currentMessage ? 'Update' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FollowupMessageModal; 