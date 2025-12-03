'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAppContext } from '@/context/AppContext';
import toast from "react-hot-toast";
import FollowupPackageModal from '../modals/FollowupPackageModal.jsx';
import { API_URL } from '@/helpers/apiUrl';

const FollowupPackagesDataTable = () => {
    const { user } = useAppContext();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPackage, setCurrentPackage] = useState(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [packageToDeleteId, setPackageToDeleteId] = useState(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [total, setTotal] = useState(0);
    const [lastPage, setLastPage] = useState(1);
    
    // Sorting state
    const [sortBy, setSortBy] = useState('created_at');
    const [sortOrder, setSortOrder] = useState('desc');
    
    // Search state
    const [search, setSearch] = useState('');

    const FOLLOWUP_PACKAGES_API = `${API_URL}api/followup-packages`;

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null); // Clear previous errors
            
            const params = new URLSearchParams({
                page: currentPage,
                perPage: perPage,
                sortBy: sortBy,
                sortOrder: sortOrder,
            });
            
            if (search && search.trim()) {
                params.append('search', search.trim());
            }

            console.log('Fetching data with params:', params.toString()); // Debug log

            const response = await axios.get(`${FOLLOWUP_PACKAGES_API}?${params.toString()}`);
            
            console.log('API Response:', response.data); // Debug log
            
            if (response.data.data) {
                setData(response.data.data.data || []);
                setTotal(response.data.data.pagination.total);
                setLastPage(response.data.data.pagination.last_page);
            } else {
                // Handle case where response structure is different
                setData(response.data.data || []);
                setTotal(0);
                setLastPage(1);
            }
        } catch (err) {
            console.error('Search error:', err); // Debug log
            const errorMessage = err.response?.data?.message || err.message || 'Failed to fetch data';
            setError(errorMessage);
            toast.error(errorMessage);
            setData([]);
            setTotal(0);
            setLastPage(1);
        } finally {
            setLoading(false);
        }
    }, [currentPage, perPage, sortBy, sortOrder, search, FOLLOWUP_PACKAGES_API]);

    useEffect(() => {
        if (user && user.token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
        }
        fetchData();
    }, [fetchData, user]);

    // Separate useEffect for search with debouncing
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (user && user.token) {
                fetchData();
            }
        }, 500); // 500ms delay

        return () => clearTimeout(timeoutId);
    }, [search, fetchData, user]);

    const handleAddEdit = async (packageData) => {
        try {
            const formattedData = {
                title: packageData.selectedFollowupPackage,
                stage: packageData.stage,
                start_date: packageData.startDate ? packageData.startDate.toISOString().split('T')[0] : null,
                visit_date: packageData.visitDate ? packageData.visitDate.toISOString().split('T')[0] : null,
            };

            if (currentPackage) {
                const response = await axios.put(`${FOLLOWUP_PACKAGES_API}/${currentPackage.id}`, formattedData);
                toast.success(response.data.message || 'Package updated successfully');
            } else {
                const response = await axios.post(FOLLOWUP_PACKAGES_API, formattedData);
                toast.success(response.data.message || 'Package created successfully');
            }
            
            setCurrentPackage(null);
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
            toast.error(errorMessage);
        }
    };

    const handleDelete = async (id) => {
        setPackageToDeleteId(id);
        setShowConfirmDialog(true);
    };

    const confirmDelete = async () => {
        try {
            const response = await axios.delete(`${FOLLOWUP_PACKAGES_API}/${packageToDeleteId}`);
            toast.success(response.data.message);
            fetchData();
        } catch (err) {
            toast.error(err.response?.data?.message || err.message);
        } finally {
            setShowConfirmDialog(false);
            setPackageToDeleteId(null);
        }
    };

    const openEditModal = (pkg) => {
        setCurrentPackage(pkg);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setCurrentPackage(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentPackage(null);
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePerPageChange = (newPerPage) => {
        setPerPage(newPerPage);
        setCurrentPage(1);
    };

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    if (loading && data.length === 0) return <div className="p-6">Loading...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

    return (
        <div className="w-full p-6 space-y-6 bg-gray-50">
            <div className='flex items-center justify-between'>
                <h1 className="text-2xl font-bold mb-4">Followup Packages</h1>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md mb-4 hover:bg-blue-600"
                    onClick={openAddModal}
                >
                    Add New Package
                </button>
            </div>

            {/* Search and Controls */}
            <div className="flex items-center justify-between space-x-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search packages..."
                        value={search}
                        onChange={handleSearchChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Show:</label>
                    <select
                        value={perPage}
                        onChange={(e) => handlePerPageChange(Number(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <span className="text-sm text-gray-600">
                        Showing {((currentPage - 1) * perPage) + 1} to {Math.min(currentPage * perPage, total)} of {total} entries
                    </span>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('title')}
                                >
                                    Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('stage')}
                                >
                                    Stage {sortBy === 'stage' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('start_date')}
                                >
                                    Start Date {sortBy === 'start_date' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('visit_date')}
                                >
                                    Visit Date {sortBy === 'visit_date' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th 
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                    onClick={() => handleSort('created_at')}
                                >
                                    Created At {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.map((pkg, index) => (
                                <tr key={pkg.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {((currentPage - 1) * perPage) + index + 1}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {pkg.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {pkg.stage || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {pkg.start_date ? new Date(pkg.start_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {pkg.visit_date ? new Date(pkg.visit_date).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric'
                                        }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {pkg.created_at ? new Date(pkg.created_at).toLocaleString('en-US', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                        }) : '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex space-x-2">
                                            <button
                                                className="bg-yellow-500 text-white px-3 py-1 rounded-md hover:bg-yellow-600 text-sm"
                                                onClick={() => openEditModal(pkg)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 text-sm"
                                                onClick={() => handleDelete(pkg.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === lastPage}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing page <span className="font-medium">{currentPage}</span> of{' '}
                                <span className="font-medium">{lastPage}</span>
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => handlePageChange(1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    First
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === lastPage}
                                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                                <button
                                    onClick={() => handlePageChange(lastPage)}
                                    disabled={currentPage === lastPage}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Last
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <FollowupPackageModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    onSubmitPackageDetails={handleAddEdit}
                    packages={data}
                    currentPackage={currentPackage}
                />
            )}

            {/* Delete Confirmation */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
                        <p className="mb-4">Are you sure you want to delete this package?</p>
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

export default FollowupPackagesDataTable; 