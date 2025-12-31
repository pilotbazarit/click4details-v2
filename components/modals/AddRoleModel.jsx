import React, { use, useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import UserService from '@/services/UserService'



const AddRoleModal = ({ open, setOpen, selectedItem, setRoles }) => {
    const [roleNameError, setRoleNameError] = useState("");

    const [roleName, setRoleName] = useState("");
    const [permissionNames, setPermissionNames] = useState([]);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (selectedItem && selectedItem.r_id) {
            setRoleName(selectedItem.r_name || "");
            setIsActive(selectedItem.r_status === "active");
        } else {
            setRoleName("");
            setIsActive(true);
        }
    }, [selectedItem]);

    // console.log("selectedItem", selectedItem);

    // Helper to update permission selection
    const updatePermissionSelection = () => {
        if (selectedItem?.r_permissions) {
            let permissionIds = JSON.parse(selectedItem?.r_permissions);
            permissionIds = permissionIds
                .map((id) => typeof id === 'string' ? Number(id) : id)
                .filter((id) => typeof id === 'number' && !isNaN(id));
            setPermissionNames((prev) => prev.map((sections) => ({
                ...sections,
                permissions: sections.permissions.map((permission) => ({
                    ...permission,
                    p_is_selected: permissionIds.includes(permission.p_id)
                }))
            })));
        } else {
            setPermissionNames((prev) => prev.map((sections) => ({
                ...sections,
                permissions: sections.permissions.map((permission) => ({
                    ...permission,
                    p_is_selected: false
                }))
            })));
        }
    };

    useEffect(() => {
        updatePermissionSelection();
    }, [open, selectedItem, permissionNames.length]);


    const [submitLoading, setSubmitLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!roleName.trim()) {
            setRoleNameError("Role Name is required");
            return;
        } else {
            setRoleNameError("");
        }
        setSubmitLoading(true);
        try {
            let permissionArr = [];
            permissionNames.forEach((role) => {
                role.permissions.forEach((perm) => {
                    if (perm.p_is_selected) {
                        permissionArr.push(perm.p_id);
                    }
                });
            })

            // Prepare payload
            const payload = {
                r_name: roleName,
                r_status: isActive ? 'active' : 'inactive',
                r_permissions: permissionArr
            };

            let response;
            if (selectedItem && selectedItem.r_id) {
                // Update existing role
                payload._method = "PUT";
                response = await UserService.Commands.updateRole(selectedItem.r_id, payload);
            } else {
                // Add new role
                response = await UserService.Commands.addRole(payload);
            }

            if (response.status === "success") {
                if (selectedItem && selectedItem.r_id) {
                    // Update role in state
                    setRoles((prevRoles) =>
                        prevRoles.map((role) =>
                            role.r_id === selectedItem.r_id
                                ? { ...role, ...response.data }
                                : role
                        )
                    );
                    toast.success("Role updated successfully!");
                } else {
                    // Add new role to state
                    setRoles((prevRoles) => [
                        ...prevRoles,
                        response.data,
                    ]);
                    toast.success("Role added successfully!");
                }
                setOpen(false);
            } else {
                toast.error(response?.data?.message || (selectedItem && selectedItem.r_id ? "Failed to update role" : "Failed to add role"));
            }
        } catch (error) {
            toast.error(error?.message || (selectedItem && selectedItem.r_id ? "Error updating role" : "Error adding role"));
        } finally {
            setSubmitLoading(false);
        }
    };

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        selectedItem = null;
    };

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

    const getUserPermissionName = async () => {
        try {
            const response = await UserService.Queries.getUserPermissionName({
                _role_id: 0
            });
            if (response.status == "success") {
                setPermissionNames(response.data);
            }
        } catch (error) {
            // console.log("error", error);
        }
    };

    useEffect(() => {
        getUserPermissionName();
    }, []);


    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className='flex items-center justify-center flex-col'>
                        <div>
                            <h2 className="text-2xl font-semibold mb-1">{selectedItem && selectedItem.r_id ? "Update Role" : "Add New Role"}</h2>
                            <p className="text-sm text-gray-500 ">Set role permissions</p>
                        </div>
                    </DialogTitle>
                </DialogHeader>
                <hr />
                {/* Add your form fields here */}
                <div className="w-full p-6 bg-white rounded-xl shadow-md">

                    <input
                        type="text"
                        placeholder="Role Name"
                        className={`w-full mb-2 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 ${roleNameError ? 'border-red-500' : ''}`}
                        value={roleName}
                        onChange={(e) => {
                            setRoleName(e.target.value);
                            if (roleNameError && e.target.value.trim()) setRoleNameError("");
                        }}
                    />
                    {roleNameError && (
                        <div className="text-red-500 text-sm mb-4">{roleNameError}</div>
                    )}

                    <div className="mb-4">
                        <div className='mb-4'>
                            <span className="font-bold text-xl">Role Permissions</span>
                        </div>

                        <div className="flex items-center justify-between mb-2">

                            <div>
                                <span>Administrator Access</span>
                                <span className="text-gray-400 cursor-pointer" title="Administrator has full access">ℹ️</span>
                            </div>
                            {/* <div>
                               
                                <label className="ml-4 flex items-center gap-2 text-sm cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={handleSelectAll}
                                        className="accent-purple-600"
                                    />
                                    Select All
                                </label>
                            </div> */}
                        </div>

                        <div className="space-y-4">
                            {permissionNames.map((item, index) => (
                                <div key={index} className="flex items-center justify-between border-b pb-2">
                                    <span className="w-1/3">{item?.name}</span>
                                    <div className="flex gap-6">
                                        {item?.permissions.map((action, index) => (
                                            <label key={index} className="flex items-center gap-1 text-sm">
                                                <input
                                                    type="checkbox"
                                                    className="accent-purple-600"
                                                    checked={action.p_is_selected || false}
                                                    onChange={(e) => handlePermissionChange(item?.name, action?.p_name, e)}
                                                />
                                                {action?.p_name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* <hr/> */}
                    {/* <br/> */}

                    <label className="flex items-center cursor-pointer">
                        {/* Label */}
                        <span className="mr-3 text-sm font-medium text-gray-700">Is Active</span>

                        {/* Toggle */}
                        <div className="relative">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isActive}
                                onChange={() => setIsActive((prev) => !prev)}
                            />
                            <div className={`w-11 h-6 rounded-full transition-all duration-300 ${isActive ? "bg-blue-500" : "bg-gray-300"}`}></div>
                            <div className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 ${isActive ? "translate-x-5" : ""}`}></div>
                        </div>
                    </label>

                    <div className="flex justify-end mt-6 gap-4">
                        {/* {
                            selectedItem && selectedItem.r_id ? (
                                <button
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
                                    onClick={handleSubmit}
                                >
                                    Update Role
                                </button>
                            ) : (
                                <button
                                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
                                    onClick={handleSubmit}
                                >
                                    Add Role
                                </button>
                            )
                        } */}

                        <button
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
                            onClick={handleSubmit}
                            disabled={submitLoading}
                        >
                            {submitLoading ? (selectedItem && selectedItem.r_id ? "Updating..." : "Adding...") : (selectedItem && selectedItem.r_id ? "Update Role" : "Add Role")} 
                        </button>

                        <button className="border px-6 py-2 rounded-md text-gray-600 hover:bg-gray-100 transition" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddRoleModal;