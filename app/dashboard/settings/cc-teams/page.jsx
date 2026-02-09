'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, User, UserPlus, Search, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Swal from 'sweetalert2';

const CCTeamsPage = () => {
    // Mock users data - will be replaced with API call later
    const [availableUsers, setAvailableUsers] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '1234567890' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '1234567891' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', phone: '1234567892' },
        { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', phone: '1234567893' },
        { id: 5, name: 'David Brown', email: 'david@example.com', phone: '1234567894' },
        { id: 6, name: 'Emily Davis', email: 'emily@example.com', phone: '1234567895' },
        { id: 7, name: 'Chris Wilson', email: 'chris@example.com', phone: '1234567896' },
        { id: 8, name: 'Lisa Anderson', email: 'lisa@example.com', phone: '1234567897' },
        { id: 9, name: 'Tom Martinez', email: 'tom@example.com', phone: '1234567898' },
        { id: 10, name: 'Amy Taylor', email: 'amy@example.com', phone: '1234567899' },
        { id: 11, name: 'Robert Lee', email: 'robert@example.com', phone: '1234567900' },
        { id: 12, name: 'Maria Garcia', email: 'maria@example.com', phone: '1234567901' },
    ]);

    // Static mock data - will be replaced with API calls later
    const [teams, setTeams] = useState([
        {
            id: 1,
            name: 'Sales Team',
            description: 'Handles all sales-related customer care',
            status: 'active',
            team_leader_id: 1,
            team_leader: { id: 1, name: 'John Doe', email: 'john@example.com' },
            team_member_ids: [2, 3, 4, 5],
            team_members: [
                { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
                { id: 3, name: 'Mike Johnson', email: 'mike@example.com' },
                { id: 4, name: 'Sarah Williams', email: 'sarah@example.com' },
                { id: 5, name: 'David Brown', email: 'david@example.com' },
            ],
            created_at: '2024-01-15',
        },
        {
            id: 2,
            name: 'Support Team',
            description: 'Technical support and troubleshooting',
            status: 'active',
            team_leader_id: 6,
            team_leader: { id: 6, name: 'Emily Davis', email: 'emily@example.com' },
            team_member_ids: [7, 8, 9],
            team_members: [
                { id: 7, name: 'Chris Wilson', email: 'chris@example.com' },
                { id: 8, name: 'Lisa Anderson', email: 'lisa@example.com' },
                { id: 9, name: 'Tom Martinez', email: 'tom@example.com' },
            ],
            created_at: '2024-01-20',
        },
        {
            id: 3,
            name: 'Billing Team',
            description: 'Payment and billing inquiries',
            status: 'inactive',
            team_leader_id: 10,
            team_leader: { id: 10, name: 'Amy Taylor', email: 'amy@example.com' },
            team_member_ids: [11, 12],
            team_members: [
                { id: 11, name: 'Robert Lee', email: 'robert@example.com' },
                { id: 12, name: 'Maria Garcia', email: 'maria@example.com' },
            ],
            created_at: '2024-02-01',
        },
    ]);

    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const [managingMembersTeam, setManagingMembersTeam] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active',
        team_leader_id: '',
        team_member_ids: [],
    });
    const [membersFormData, setMembersFormData] = useState({
        team_member_ids: [],
    });
    const [errors, setErrors] = useState({});
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [memberSearchQuery, setMemberSearchQuery] = useState('');

    // Get users not assigned to any team (for dropdowns)
    const getAvailableUsersForTeam = (excludeTeamId = null) => {
        const assignedUserIds = new Set();
        
        teams.forEach(team => {
            if (team.id !== excludeTeamId) {
                if (team.team_leader_id) assignedUserIds.add(team.team_leader_id);
                if (team.team_member_ids) {
                    team.team_member_ids.forEach(id => assignedUserIds.add(id));
                }
            }
        });

        return availableUsers.filter(user => !assignedUserIds.has(user.id));
    };

    // TODO: Replace with actual API call
    const fetchTeams = async () => {
        setLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            // In real implementation, this would be:
            // const response = await CCTeamService.Queries.getCCTeams();
            // if (response && response.success) {
            //     setTeams(response.data);
            // }
        } catch (error) {
            toast.error('Failed to fetch teams');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Team name is required';
        }

        if (!formData.team_leader_id) {
            newErrors.team_leader_id = 'Team leader is required';
        }

        if (formData.team_member_ids.length < 3) {
            newErrors.team_member_ids = 'At least 3 team members are required';
        } else if (formData.team_member_ids.length > 10) {
            newErrors.team_member_ids = 'Maximum 10 team members allowed';
        }

        // Ensure team leader is not in members list
        if (formData.team_leader_id && formData.team_member_ids.includes(parseInt(formData.team_leader_id))) {
            newErrors.team_member_ids = 'Team leader cannot be a team member';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the form errors');
            return;
        }

        try {
            // TODO: Replace with actual API call
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const teamLeader = availableUsers.find(u => u.id === parseInt(formData.team_leader_id));
            const teamMembers = availableUsers.filter(u => formData.team_member_ids.includes(u.id));
            
            if (editingTeam) {
                // Update existing team
                setTeams(teams.map(team => 
                    team.id === editingTeam.id 
                        ? { 
                            ...team, 
                            ...formData,
                            team_leader: teamLeader,
                            team_members: teamMembers,
                            updated_at: new Date().toISOString().split('T')[0] 
                        }
                        : team
                ));
                toast.success('Team updated successfully');
            } else {
                // Create new team
                const newTeam = {
                    id: Math.max(...teams.map(t => t.id), 0) + 1,
                    ...formData,
                    team_leader_id: parseInt(formData.team_leader_id),
                    team_leader: teamLeader,
                    team_members: teamMembers,
                    created_at: new Date().toISOString().split('T')[0],
                };
                setTeams([...teams, newTeam]);
                toast.success('Team created successfully');
            }
            
            closeModal();
            
            // In real implementation, this would be:
            // if (editingTeam) {
            //     const response = await CCTeamService.Commands.updateCCTeam(editingTeam.id, formData);
            //     if (response.success) {
            //         toast.success('Team updated successfully');
            //         closeModal();
            //         fetchTeams();
            //     }
            // } else {
            //     const response = await CCTeamService.Commands.storeCCTeam(formData);
            //     if (response.success) {
            //         toast.success('Team created successfully');
            //         closeModal();
            //         fetchTeams();
            //     }
            // }
        } catch (error) {
            toast.error(editingTeam ? 'Failed to update team' : 'Failed to create team');
            console.error('Error:', error);
        }
    };

    const handleEdit = (team) => {
        setEditingTeam(team);
        setFormData({
            name: team.name,
            description: team.description || '',
            status: team.status,
            team_leader_id: team.team_leader_id || '',
            team_member_ids: team.team_member_ids || [],
        });
        setIsModalOpen(true);
    };

    const handleManageMembers = (team) => {
        setManagingMembersTeam(team);
        setMembersFormData({
            team_member_ids: team.team_member_ids || [],
        });
        setIsMembersModalOpen(true);
    };

    const handleMembersSubmit = async (e) => {
        e.preventDefault();
        
        if (membersFormData.team_member_ids.length < 3) {
            toast.error('At least 3 team members are required');
            return;
        }
        
        if (membersFormData.team_member_ids.length > 10) {
            toast.error('Maximum 10 team members allowed');
            return;
        }

        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const teamMembers = availableUsers.filter(u => membersFormData.team_member_ids.includes(u.id));
            
            setTeams(teams.map(team => 
                team.id === managingMembersTeam.id 
                    ? { 
                        ...team, 
                        team_member_ids: membersFormData.team_member_ids,
                        team_members: teamMembers,
                        updated_at: new Date().toISOString().split('T')[0] 
                    }
                    : team
            ));
            
            toast.success('Team members updated successfully');
            closeMembersModal();
            
            // In real implementation, this would be:
            // const response = await CCTeamService.Commands.updateTeamMembers(managingMembersTeam.id, membersFormData);
            // if (response.success) {
            //     toast.success('Team members updated successfully');
            //     closeMembersModal();
            //     fetchTeams();
            // }
        } catch (error) {
            toast.error('Failed to update team members');
            console.error('Error:', error);
        }
    };

    const handleMemberToggleInModal = (userId) => {
        const userIdNum = parseInt(userId);
        setMembersFormData(prev => {
            const currentMembers = prev.team_member_ids || [];
            let newMembers;
            
            if (currentMembers.includes(userIdNum)) {
                newMembers = currentMembers.filter(id => id !== userIdNum);
            } else {
                if (currentMembers.length >= 10) {
                    toast.error('Maximum 10 team members allowed');
                    return prev;
                }
                newMembers = [...currentMembers, userIdNum];
            }
            
            return { ...prev, team_member_ids: newMembers };
        });
    };

    const closeMembersModal = () => {
        setIsMembersModalOpen(false);
        setManagingMembersTeam(null);
        setMembersFormData({ team_member_ids: [] });
        setMemberSearchQuery(''); // Clear search when closing modal
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
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
            // TODO: Replace with actual API call
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setTeams(teams.filter(team => team.id !== id));
            toast.success('Team deleted successfully');
            
            // In real implementation, this would be:
            // const response = await CCTeamService.Commands.deleteCCTeam(id);
            // if (response.success) {
            //     toast.success('Team deleted successfully');
            //     fetchTeams();
            // }
        } catch (error) {
            toast.error('Failed to delete team');
            console.error('Error deleting team:', error);
        }
    };

    const handleMemberToggle = (userId) => {
        const userIdNum = parseInt(userId);
        setFormData(prev => {
            const currentMembers = prev.team_member_ids || [];
            let newMembers;
            
            if (currentMembers.includes(userIdNum)) {
                newMembers = currentMembers.filter(id => id !== userIdNum);
            } else {
                if (currentMembers.length >= 10) {
                    toast.error('Maximum 10 team members allowed');
                    return prev;
                }
                newMembers = [...currentMembers, userIdNum];
            }
            
            // Clear error when user adds/removes members
            if (errors.team_member_ids) {
                setErrors(prev => ({ ...prev, team_member_ids: null }));
            }
            
            return { ...prev, team_member_ids: newMembers };
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            status: 'active',
            team_leader_id: '',
            team_member_ids: [],
        });
        setErrors({});
    };

    const openModal = () => {
        setEditingTeam(null);
        resetForm();
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingTeam(null);
        resetForm();
        setUserSearchQuery(''); // Clear search when closing modal
    };

    const availableUsersForTeam = getAvailableUsersForTeam(editingTeam?.id);
    const availableMembers = availableUsersForTeam.filter(u => 
        !formData.team_leader_id || u.id !== parseInt(formData.team_leader_id)
    );

    // For members modal - exclude team leader and users already in other teams
    const availableMembersForModal = managingMembersTeam 
        ? getAvailableUsersForTeam(managingMembersTeam.id).filter(u => 
            u.id !== managingMembersTeam.team_leader_id
        )
        : [];

    // Filter users based on search query
    const filterUsersBySearch = (users, searchQuery) => {
        if (!searchQuery || searchQuery.trim() === '') {
            return users;
        }
        const query = searchQuery.toLowerCase().trim();
        return users.filter(user => 
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone?.toLowerCase().includes(query)
        );
    };

    // Filtered users based on search
    const filteredAvailableMembers = filterUsersBySearch(availableMembers, userSearchQuery);
    const filteredAvailableMembersForModal = filterUsersBySearch(availableMembersForModal, memberSearchQuery);

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">CC Teams</h1>
                <button
                    onClick={openModal}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Team
                </button>
            </div>

            {/* Teams Table */}
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">SR.</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Team Name</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Team Leader</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Members</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center">
                                        Loading...
                                    </td>
                                </tr>
                            ) : teams.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                        No teams found
                                    </td>
                                </tr>
                            ) : (
                                teams.map((team, index) => (
                                    <tr key={team.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {team.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="flex items-center">
                                                <User className="w-4 h-4 mr-2 text-blue-600" />
                                                {team.team_leader?.name || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2 text-gray-400" />
                                                {team.team_members?.length || 0} member{team.team_members?.length !== 1 ? 's' : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ 
                                                team.status === 'active' 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}> 
                                                {team.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleManageMembers(team)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Manage Members"
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(team)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(team.id)}
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
                                    {editingTeam ? 'Edit Team' : 'Add New Team'}
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
                                        Team Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => {
                                            setFormData({...formData, name: e.target.value});
                                            if (errors.name) setErrors({...errors, name: null});
                                        }}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                        placeholder="Enter team name"
                                    />
                                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                        placeholder="Enter team description (optional)"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Team Leader *
                                    </label>
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={userSearchQuery}
                                            onChange={(e) => setUserSearchQuery(e.target.value)}
                                            placeholder="Search by name, email, or phone..."
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {userSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setUserSearchQuery('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <select
                                        value={formData.team_leader_id}
                                        onChange={(e) => {
                                            setFormData({...formData, team_leader_id: e.target.value});
                                            // Remove team leader from members if selected
                                            if (e.target.value) {
                                                const leaderId = parseInt(e.target.value);
                                                setFormData(prev => ({
                                                    ...prev,
                                                    team_leader_id: e.target.value,
                                                    team_member_ids: prev.team_member_ids.filter(id => id !== leaderId)
                                                }));
                                            }
                                            if (errors.team_leader_id) setErrors({...errors, team_leader_id: null});
                                        }}
                                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.team_leader_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                        required
                                    >
                                        <option value="">Select Team Leader</option>
                                        {filterUsersBySearch(availableUsersForTeam, userSearchQuery).map(user => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.team_leader_id && <p className="mt-1 text-sm text-red-600">{errors.team_leader_id}</p>}
                                    {availableUsersForTeam.length === 0 && (
                                        <p className="mt-1 text-sm text-yellow-600">
                                            No available users. All users are already assigned to teams.
                                        </p>
                                    )}
                                    {userSearchQuery && filteredAvailableMembers.length === 0 && (
                                        <p className="mt-1 text-sm text-gray-500">
                                            No users found matching "{userSearchQuery}"
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Team Members * (3-10 members required)
                                    </label>
                                    <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                                        {availableMembers.length === 0 ? (
                                            <p className="text-sm text-gray-500">No available members</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {availableMembers.map(user => (
                                                    <label key={user.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.team_member_ids.includes(user.id)}
                                                            onChange={() => handleMemberToggle(user.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-900">
                                                            {user.name} <span className="text-gray-500">({user.email})</span>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className={`${errors.team_member_ids ? 'text-red-600' : 'text-gray-600'}`}>
                                            Selected: {formData.team_member_ids.length} / 10
                                        </span>
                                        <span className="text-gray-500">
                                            Minimum: 3 members required
                                        </span>
                                    </div>
                                    {errors.team_member_ids && <p className="mt-1 text-sm text-red-600">{errors.team_member_ids}</p>}
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
                                        {editingTeam ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Members Modal */}
            {isMembersModalOpen && managingMembersTeam && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-xl font-semibold">
                                        Manage Team Members
                                    </h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {managingMembersTeam.name}
                                    </p>
                                </div>
                                <button
                                    onClick={closeMembersModal}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <form onSubmit={handleMembersSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Team Members (3-10 members required)
                                    </label>
                                    <div className="relative mb-2">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                        <input
                                            type="text"
                                            value={memberSearchQuery}
                                            onChange={(e) => setMemberSearchQuery(e.target.value)}
                                            placeholder="Search by name, email, or phone..."
                                            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {memberSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => setMemberSearchQuery('')}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="border border-gray-300 rounded-md p-3 max-h-64 overflow-y-auto">
                                        {filteredAvailableMembersForModal.length === 0 ? (
                                            <p className="text-sm text-gray-500">
                                                {memberSearchQuery ? `No members found matching "${memberSearchQuery}"` : 'No available members'}
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {filteredAvailableMembersForModal.map(user => (
                                                    <label key={user.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                                        <input
                                                            type="checkbox"
                                                            checked={membersFormData.team_member_ids.includes(user.id)}
                                                            onChange={() => handleMemberToggleInModal(user.id)}
                                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        <span className="text-sm text-gray-900">
                                                            {user.name} <span className="text-gray-500">({user.email})</span>
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-sm">
                                        <span className="text-gray-600">
                                            Selected: {membersFormData.team_member_ids.length} / 10
                                        </span>
                                        <span className="text-gray-500">
                                            Minimum: 3 members required
                                        </span>
                                    </div>
                                    {membersFormData.team_member_ids.length < 3 && (
                                        <p className="mt-1 text-sm text-red-600">
                                            At least 3 team members are required
                                        </p>
                                    )}
                                </div>

                                {/* Current Members Display */}
                                {managingMembersTeam.team_members && managingMembersTeam.team_members.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Current Team Members
                                        </label>
                                        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
                                            <div className="flex flex-wrap gap-2">
                                                {managingMembersTeam.team_members.map(member => (
                                                    <span
                                                        key={member.id}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {member.name}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={closeMembersModal}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Update Members
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

export default CCTeamsPage;
