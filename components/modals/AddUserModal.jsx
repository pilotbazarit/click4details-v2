import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"

import { get, useForm, Controller } from "react-hook-form";
import Select from 'react-select';
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { DialogTitle } from '@radix-ui/react-dialog';
import UserService from '@/services/UserService';
import RoleService from '@/services/RoleService';
import PermissionService from '@/services/PermissionService';


const AddUserModal = ({ open, setOpen, selectedShop, selectedUser }) => {
    const [permissionNames, setPermissionNames] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [selectUser, setSelectUser] = useState({});
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);


    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
        watch,
        setValue
    } = useForm({
    });

    const selectedUserId = watch('user_id');
    const roleId = watch('role_id');

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset(); // Reset form when dialog closes
        }
    };

    const getUsers = async (value = "") => {
        try {
            setLoading(true);
            const response = await UserService.Queries.getUsers({
                _page: 1,
                _perPage: 1000,
                _phone: value,
            });

            if (response?.status == "success") {
                setUsers(response?.data?.data)
            } else {
                toast.error(response?.data?.message || "Failed to fetch users");
            }

        } catch (error) {
            console.log("Error fetching users:", error);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    }




    const [roles, setRoles] = useState([]);
    const getRoles = async (value = "") => {
        try {
            const response = await RoleService.Queries.getRoles({
                _page: 1,
                _perPage: 1000,
            });

            if (response?.status == "success") {
                setRoles(response?.data?.data)
            } else {
                toast.error(response?.data?.message || "Failed to fetch models");
            }

        } catch (error) {
            setLoading(false);
            toast.error(
                error.response?.data?.message || "Failed to fetch data types"
            );
        }
    }


    const getUserPermissionName = async (roleIdParam) => {
        try {
            setLoading(true);
            const response = await UserService.Queries.getUserPermissionName({
                _use_id: selectedUserId,
                _role_id: roleIdParam
            });


            if (response.status == "success") {
                setPermissionNames(response.data);
                setLoading(false);
            }
        } catch (error) {
            setLoading(true);
            // console.log("error", error);
        }
    };


    // console.log("00000000000000000000000000000000");
    // console.log("permissionNames", permissionNames);


    const handlePermissionChange = (roleName, permissionName, e) => {
        setPermissionNames((prevPermissions) =>
            prevPermissions.map((role) =>
                role.name === roleName
                    ? {
                        ...role,
                        permissions: role.permissions.map((perm) =>
                            perm.p_name === permissionName
                                ? { ...perm, p_is_selected: e.target.checked }
                                : perm
                        ),
                    }
                    : role
            )
        );
    };

    useEffect(() => {
        getRoles();
    }, []);


    const onSubmit = async (data) => {
        let permissionArr = [];
        permissionNames.forEach((role) => {
            role.permissions.forEach((perm) => {
                if (perm.p_is_selected) {
                    permissionArr.push(perm.p_id);
                }
            });
        })

        const payload = {
            urp_entity_id: selectedShop?.s_id,
            urp_entity_type: 'shop',
            urp_user_id: data?.user_id,
            urp_role_id: data?.role_id,
            urp_permissions: permissionArr
        }

        try {
            let response;
            if (selectedUser?.urp_id) {
                // Update mode
                payload._method = "PUT";

                response = await PermissionService.Commands.updateUserPermission(selectedUser.urp_id, payload);
            } else {
                // Add mode
                response = await PermissionService.Commands.storeUserPermission(payload);
            }

            if (response.status == "success") {
                toast.success("User permission updated successfully!");
                setOpen(false);
                reset();
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.message);
            // console.log("error", error);
        }

        // try {
        //     const response = await PermissionService.Commands.storeUserPermission(payload);

        //     if (response.status == "success") {
        //         toast.success(response?.data?.message);
        //         setOpen(false);
        //         reset();
        //     } else {
        //         toast.error(response?.data?.message);
        //     }
        // } catch (error) {
        //     console.log("error", error);
        // }
    };

    const getUserRolePermission = async (id) => {
        try {
            const response = await PermissionService.Queries.getSingleUserRolePermission(id);
            if (response.status == "success") {
                setValue("user_id", selectedShop?.user?.id);
                setValue("role_id", response?.data?.urp_role_id);
                setSelectUser(selectedShop?.user);
                setUsers([selectedShop.user]);
                setPermissionNames(response?.data?.urp_permissions);
            }
        } catch (error) {
            // console.log("error", error);
        }
    }

    useEffect(() => {
        if (selectedUser && selectedUser.urp_id) {
            getUserRolePermission(selectedUser?.urp_id);
        }
    }, [selectedUser]);


    // console.log("selectedUser", selectedUser);


    return (
        // <Dialog open={open} onOpenChange={setOpen}>
        <Dialog open={open}>
            <DialogContent className="sm:max-w-2xl [&>button]:hidden">

                <DialogTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                            <span className="inline-block w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
                            {selectedUser?.urp_id ? "Edit User" : "Add User"}
                        </h2>





                        <button
                            onClick={() => {
                                setOpen(false);
                                // selectedUserId('');
                                setUsers([]);
                                setPermissionNames([])
                                reset();
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center"
                        >
                            {/* Left arrow SVG for Back */}
                            <svg className="inline-block w-4 h-4 mr-2 -mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                            Back
                        </button>
                    </div>
                </DialogTitle>


                <form onSubmit={handleSubmit(onSubmit)} className="p-4">
                    {/* User Search & Select - full row */}
                    {/* User Search & Select - full row, hide if user selected */}
                    <div className="mb-2">
                        <div className="flex flex-col gap-1">
                            {/* Hide label and input if user selected, but always show dropdown if users found */}
                            {!selectedUserId && (
                                <>
                                    <label htmlFor="user_search" className="text-base font-medium">User Phone</label>
                                    <div className="relative w-full">
                                        <input
                                            id="user_search"
                                            type="number"
                                            placeholder="Enter phone number"
                                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                                            autoComplete="off"
                                            onChange={e => {
                                                const value = e.target.value;
                                                if (value.length === 11) {
                                                    getUsers(value);
                                                } else {
                                                    setUsers([]);
                                                }
                                            }}
                                        />
                                        {/* Autocomplete suggestion list */}
                                        {users.length > 0 && (
                                            <ul className="absolute left-0 right-0 z-10 mt-1 w-full bg-white border border-gray-200 rounded shadow max-h-48 overflow-y-auto">
                                                {users.map((user) => (
                                                    <li
                                                        key={user.id}
                                                        className="px-4 py-2 cursor-pointer hover:bg-blue-100 flex justify-between items-center"
                                                        onClick={() => {
                                                            setValue('user_id', user.id);
                                                            setSelectUser(user);
                                                            setUsers([]);
                                                        }}
                                                    >
                                                        <span>{user.name}</span>
                                                        <span className="text-xs text-gray-500">{user.email || user.phone}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </>
                            )}


                            {selectedUserId && (
                                <div className="flex items-center gap-2 mt-2">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded px-4 py-2">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    {selectUser.profile_image ? (
                                                        <img
                                                            src={selectUser.profile_image}
                                                            alt={selectUser.name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                                                            {selectUser.name ? selectUser.name.charAt(0).toUpperCase() : ''}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-blue-600">{selectUser.name}</p>
                                                    <p className="text-sm font-medium text-gray-500">{selectUser.phone}</p>
                                                    <p className="text-xs text-gray-500">{selectUser.email}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                className="ml-2 text-gray-500 hover:text-red-600 text-lg font-bold px-2 py-1 rounded focus:outline-none"
                                                title="Clear selection"
                                                onClick={() => {
                                                    setValue('user_id', '');
                                                    // selectUser({});
                                                    setUsers([]);
                                                }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {errors.user_id && <span className="text-red-500 text-xs mt-1">{errors.user_id.message}</span>}
                        </div>
                    </div>


                    {/* Select Role - full row */}
                    <div className="mb-6">
                        <div className="flex flex-col gap-1">
                            <label htmlFor="role_id" className="text-base font-medium">Select Role</label>
                            <Controller
                                name="role_id"
                                control={control}
                                rules={{ required: 'Role is required' }}
                                render={({ field }) => (
                                    <Select
                                        {...field}
                                        inputId="role_id"
                                        options={roles.map(role => ({ value: role.r_id, label: role.r_name }))}
                                        classNamePrefix="react-select"
                                        className="w-full"
                                        value={roles.map(role => ({ value: role.r_id, label: role.r_name })).find(option => option.value === field.value) || null}
                                        onChange={option => {
                                            if (!selectedUserId) {
                                                toast.error('Please select a user first.');
                                            } else {
                                                field.onChange(option ? option.value : '');
                                                if (option && option.value) {
                                                    getUserPermissionName(option.value);
                                                } else {
                                                    setPermissionNames([]);
                                                }
                                            }
                                        }}
                                        placeholder="Select Role"
                                        isClearable
                                    // isDisabled={!selectedUserId}
                                    />
                                )}
                            />
                            {errors.role_id && <span className="text-red-500 text-xs mt-1">{errors.role_id.message}</span>}
                        </div>
                    </div>

                    {/* Permissions Section */}
                    <div className="bg-gray-50 border rounded-lg p-6 mt-2 max-h-64 overflow-y-auto">
                        <h3 className="text-center text-xl font-semibold mb-6">Permissions </h3>
                        {/* Example permissions data, replace with dynamic if needed */}
                        {
                            permissionNames.map((item, idx) => (
                                <div key={idx} className="mb-6">
                                    <div className="font-bold text-lg mb-2">{item?.name}</div>
                                    <div className="space-y-6">
                                        {item?.permissions.length > 0 && item?.permissions.map((per, index) => (
                                            <div key={index} className="flex items-center justify-between">
                                                <span className="ml-6 text-base">{per?.p_name}</span>
                                                <input
                                                    type="checkbox"
                                                    className="w-5 h-5 accent-blue-600"
                                                    checked={!!per?.p_is_selected}
                                                    readOnly
                                                    onChange={(e) => handlePermissionChange(item?.name, per?.p_name, e)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    <DialogFooter className="flex justify-end gap-2 mt-6">
                        <DialogClose asChild onClick={() => {
                            setOpen(false);
                            // selectedUserId('');
                            setUsers([]);
                            setPermissionNames([])
                            reset();
                        }}>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
                        >
                            {
                                selectedUser?.urp_id ? 'Update' : 'Add'
                            }
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default AddUserModal;