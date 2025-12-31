
'use client';

import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { createApiRequest } from '@/helpers/axios';
import { API_URL } from '@/helpers/apiUrl';

const TransferFollowupModal = ({ isOpen, onClose, onSuccess, followupId }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const commandApi = createApiRequest(API_URL);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      // Reset state on open
      setSelectedUser(null);
      setError(null);
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const response = await commandApi.get('/api/user/list');
      const usersData = response.data.data || response.data || [];
      setUsers(usersData);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: '42px',
      borderColor: state.isFocused ? '#3b82f6' : error ? '#ef4444' : '#d1d5db',
      boxShadow: state.isFocused ? '0 0 0 1px #3b82f6' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#3b82f6' : '#9ca3af'
      }
    }),
    menu: (base) => ({
      ...base,
      zIndex: 9999
    })
  };

  const handleTransfer = async () => {
    if (!selectedUser) {
      setError('Please select a user to transfer to.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      // Assuming an API endpoint to handle the transfer
      await commandApi.put(`/api/followups/${followupId}/transfer`, {
        user_id: selectedUser.id,
      });
      toast.success('Follow-up transferred successfully!');
      onSuccess(); // Callback to refresh the list in the parent component
      onClose();
    } catch (error) {
      console.error('Error transferring follow-up:', error);
      toast.error(error.response?.data?.message || 'Failed to transfer follow-up.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Transfer Follow-up</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transfer to *
              </label>
              <Select
                value={selectedUser}
                onChange={(option) => {
                  setSelectedUser(option);
                  if (error) setError(null);
                }}
                options={users}
                getOptionLabel={(option) => option.name}
                getOptionValue={(option) => option.id}
                placeholder="Select a user..."
                styles={customStyles}
                isClearable
              />
              {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTransfer}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Transferring...' : 'Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferFollowupModal;
