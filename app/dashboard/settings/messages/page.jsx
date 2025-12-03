'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Copy } from 'lucide-react';
import MessageService from '@/services/MessageService';
import { toast } from 'react-hot-toast';

const MessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        status: 'active',
        stage: ''
    });
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [messageToDeleteId, setMessageToDeleteId] = useState(null);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            console.log('Fetching messages...');
            const response = await MessageService.Queries.getMessages();
            console.log('Messages response:', response);
            console.log('Response type:', typeof response);
            console.log('Response keys:', Object.keys(response));
            
            if (response && response.success) {
                setMessages(response.data);
                console.log('Messages set:', response.data);
                console.log('Messages count:', response.data.length);
            } else {
                console.log('Response not successful:', response);
                toast.error('Failed to load messages');
            }
        } catch (error) {
            toast.error('Failed to fetch messages');
            console.log('Error fetching messages:', error);
            console.log('Error details:', error.response);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingMessage) {
                const response = await MessageService.Commands.updateMessage(editingMessage.id, formData);
                if (response.success) {
                    toast.success('Message updated successfully');
                    setIsModalOpen(false);
                    setEditingMessage(null);
                    resetForm();
                    fetchMessages();
                }
            } else {
                const response = await MessageService.Commands.storeMessage(formData);
                if (response.success) {
                    toast.success('Message created successfully');
                    setIsModalOpen(false);
                    resetForm();
                    fetchMessages();
                }
            }
        } catch (error) {
            toast.error(editingMessage ? 'Failed to update message' : 'Failed to create message');
            console.error('Error:', error);
        }
    };

    const handleEdit = (message) => {
        setEditingMessage(message);
        setFormData({
            title: message.title,
            message: message.message,
            status: message.status,
            stage: message.stage
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        setMessageToDeleteId(id);
        setShowConfirmDialog(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await MessageService.Commands.deleteMessage(messageToDeleteId);
            if (response.success) {
                toast.success('Message deleted successfully');
                fetchMessages();
            }
        } catch (error) {
            toast.error('Failed to delete message');
            console.error('Error deleting message:', error);
        } finally {
            setShowConfirmDialog(false);
            setMessageToDeleteId(null);
        }
    };

    const handleCopy = (message) => {
        navigator.clipboard.writeText(message);
        toast.success('Message copied to clipboard');
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            status: 'active',
            stage: ''
        });
    };

    const openModal = () => {
        setEditingMessage(null);
        resetForm();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMessage(null);
        resetForm();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                <button
                    onClick={openModal}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Message
                </button>
            </div>

            {/* Messages Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">Sr.</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Title
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[70%]">
                                    Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : messages.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No messages found
                                    </td>
                                </tr>
                            ) : (
                                messages.map((message, index) => (
                                    <tr key={message.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            <div>{message.title}</div>
                                            <div className="text-xs text-gray-500">{message.stage}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 max-w-md">
                                            <div className="flex items-center justify-between">
                                                <div className="whitespace-pre-wrap break-words pr-2">
                                                    {message.message}
                                                </div>
                                                <button
                                                    onClick={() => handleCopy(message.message)}
                                                    className="text-gray-600 hover:text-gray-900"
                                                    title="Copy"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                message.status === 'active' 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {message.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(message)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(message.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">
                                    {editingMessage ? 'Edit Message' : 'Add New Message'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Message *
                                    </label>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        rows="4"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Stage *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.stage}
                                        onChange={(e) => setFormData({...formData, stage: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 15-day followup, 8-day followup"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status *
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {editingMessage ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                        <p className="mb-4">Are you sure you want to delete this message?</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                                onClick={() => setShowConfirmDialog(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                                onClick={confirmDelete}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MessagesPage; 