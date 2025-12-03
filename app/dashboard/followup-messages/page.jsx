'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { API_URL } from '@/helpers/apiUrl';
import { createApiRequest } from '@/helpers/axios';
import Link from 'next/link';
import Pagination from '@/components/Pagination';
import { formatDate } from '@/helpers/functions';
import toast from 'react-hot-toast';

const FollowupMessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);

    const api = createApiRequest(API_URL);

    const fetchMessages = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const response = await api.get(`/api/followup-messages?page=${page}`);
            if (response.data) {
                setMessages(response.data.data);
                setPagination(response.data.pagination);
            }
        } catch (error) {
            toast.error('Failed to fetch followup messages.');
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);


    return (
        <div className="w-full p-6 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Followup Messages</h1>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                    // onClick={() => alert('Add New Message functionality will be implemented here')}
                >
                    Add New Message
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Customer
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Message
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stage
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <Link href={`/dashboard/customers/${message.customer?.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                        {message.customer?.name}
                                    </Link>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{message.message}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{message.stage}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{message.created_by?.name || 'Unknown'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(message.created_at, 'DD MMM, YYYY h:mm A')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination pagination={pagination} onPageChange={fetchMessages} />
        </div>
    );
};

export default FollowupMessagesPage; 