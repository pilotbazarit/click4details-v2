'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import FeedbackCategoryService from '@/services/FeedbackCategoryService';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const FeedbackCategoriesPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        status: 'active',
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await FeedbackCategoryService.Queries.getFeedbackCategories();
            if (response && response.success) {
                setCategories(response.data);
            } else {
                toast.error('Failed to load feedback categories');
            }
        } catch (error) {
            toast.error('Failed to fetch feedback categories');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingCategory) {
                const response = await FeedbackCategoryService.Commands.updateFeedbackCategory(editingCategory.id, formData);
                if (response.success) {
                    toast.success('Feedback Category updated successfully');
                    closeModal();
                    fetchCategories();
                }
            } else {
                const response = await FeedbackCategoryService.Commands.storeFeedbackCategory(formData);
                if (response.success) {
                    toast.success('Feedback Category created successfully');
                    closeModal();
                    fetchCategories();
                }
            }
        } catch (error) {
            toast.error(editingCategory ? 'Failed to update feedback category' : 'Failed to create feedback category');
            console.error('Error:', error);
        }
    };

    const handleEdit = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            status: category.status,
        });
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won\'t be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                confirmDelete(id);
            }
        });
    };

    const confirmDelete = async (id) => {
        try {
            const response = await FeedbackCategoryService.Commands.deleteFeedbackCategory(id);
            if (response.success) {
                toast.success('Feedback Category deleted successfully');
                fetchCategories();
            }
        } catch (error) {
            toast.error('Failed to delete feedback category');
            console.error('Error deleting feedback category:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            status: 'active',
        });
    };

    const openModal = () => {
        setEditingCategory(null);
        resetForm();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        resetForm();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Feedback Categories</h1>
                <button
                    onClick={openModal}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Feedback Category
                </button>
            </div>

            {/* Feedback Categories Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">SR.</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Feedback Category</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                        No feedback categories found
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category, index) => (
                                    <tr key={category.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {category.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ 
                                                category.status === 'active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}> 
                                                {category.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(category)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
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
                    <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">
                                    {editingCategory ? 'Edit Feedback Category' : 'Add New Feedback Category'}
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
                                        Feedback Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                        {editingCategory ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackCategoriesPage;