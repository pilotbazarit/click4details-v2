import React from 'react';
import { formatDate } from '@/helpers/functions';

const FollowupMessageListModal = ({ isOpen, onClose, messages, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl">
                <div className="flex justify-between items-center border-b pb-3">
                    <h5 className="text-lg font-semibold">Followup Messages</h5>
                    <button type="button" className="text-gray-400 hover:text-gray-600" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-32">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : messages.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                        Message
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                        Stage
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                                        Sent By
                                    </th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {messages.map((message) => (
                                    <tr key={message.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{message.message}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{message.stage}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-r border-gray-200">{message.created_by?.name || 'Unknown'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(message.created_at, 'DD MMM, YYYY h:mm A')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p>No messages found for this followup.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FollowupMessageListModal; 