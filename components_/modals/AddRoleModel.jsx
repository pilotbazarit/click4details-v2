import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import toast from "react-hot-toast";
import UserService from '@/services/UserService'


const getPermissionList = (permissions) => {
    if (Array.isArray(permissions)) {
        return permissions;
    }

    if (typeof permissions !== 'string') {
        return [];
    }

    const trimmedPermissions = permissions.trim();

    if (!trimmedPermissions) {
        return [];
    }

    try {
        const parsedPermissions = JSON.parse(trimmedPermissions);
        return Array.isArray(parsedPermissions) ? parsedPermissions : [parsedPermissions];
    } catch (error) {
        return trimmedPermissions.includes(',')
            ? trimmedPermissions.split(',').map((permission) => permission.trim())
            : [trimmedPermissions];
    }
};

const normalizePermissionIds = (permissions) => {
    const permissionIds = [];

    getPermissionList(permissions).forEach((permission) => {
        if (permission === undefined || permission === null || permission === '') {
            return;
        }

        if (typeof permission !== 'object') {
            permissionIds.push(permission);
            return;
        }

        if (Array.isArray(permission.permissions)) {
            permission.permissions.forEach((item) => {
                if (item?.p_is_selected && item?.p_id) {
                    permissionIds.push(item.p_id);
                }
            });
            return;
        }

        const resolvedPermissionId = permission.p_id ?? permission.id ?? permission.value ?? null;

        if (resolvedPermissionId) {
            permissionIds.push(resolvedPermissionId);
        }
    });

    return [...new Set(permissionIds.map((id) => String(id)))];
};

const applySelectedPermissions = (sections, selectedPermissionIds = null) => {
    const selectedPermissionIdSet = Array.isArray(selectedPermissionIds)
        ? new Set(selectedPermissionIds)
        : null;

    return (Array.isArray(sections) ? sections : []).map((section) => ({
        ...section,
        permissions: Array.isArray(section?.permissions)
            ? section.permissions.map((permission) => ({
                ...permission,
                p_is_selected: selectedPermissionIdSet
                    ? selectedPermissionIdSet.has(String(permission?.p_id))
                    : !!permission?.p_is_selected,
            }))
            : [],
    }));
};


const AddRoleModal = ({ open, setOpen, selectedItem, setRoles }) => {
    const [roleNameError, setRoleNameError] = useState("");

    const [roleName, setRoleName] = useState("");
    const [typeName, setTypeName] = useState("");
    const [permissionNames, setPermissionNames] = useState([]);
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (selectedItem && selectedItem.r_id) {
            setRoleName(selectedItem.r_name || "");
            setTypeName(selectedItem.r_type || "");
            setIsActive(selectedItem.r_status === "active");
        } else {
            setRoleName("");
            setTypeName("");
            setIsActive(true);
        }
    }, [selectedItem]);

    // console.log("selectedItem", selectedItem);

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
                role?.permissions?.forEach((perm) => {
                    if (perm.p_is_selected) {
                        permissionArr.push(perm.p_id);
                    }
                });
            })

            // Prepare payload
            const payload = {
                r_name: roleName,
                r_type: typeName,
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
    };

    const handlePermissionChange = (roleName, permissionId, checked) => {
        setPermissionNames((prevPermissions) =>
            prevPermissions.map((role) =>
                role.name === roleName
                    ? {
                        ...role,
                        permissions: role.permissions.map((perm) =>
                            perm.p_id === permissionId
                                ? { ...perm, p_is_selected: checked }
                                : perm
                        ),
                    }
                    : role
            )
        );
    };

    const handleTypeChange = (e) => {
        const nextType = e.target.value;
        setTypeName(nextType);

        if (!nextType) {
            setPermissionNames([]);
            return;
        }
    };

    const getUserPermissionName = async (selectedType = typeName) => {
        if (!selectedType) {
            setPermissionNames([]);
            return;
        }

        try {
            const hasStoredPermissions = selectedItem
                ? Object.prototype.hasOwnProperty.call(selectedItem, 'r_permissions')
                : false;
            const shouldApplyStoredPermissions =
                selectedItem?.r_id &&
                selectedType === selectedItem?.r_type &&
                hasStoredPermissions;
            const params = {
                _role_id: selectedItem?.r_id || 0,
                _type: selectedType
            };

            const response = await UserService.Queries.getUserPermissionName(params);
            if (response.status == "success") {
                setPermissionNames(
                    applySelectedPermissions(
                        response.data,
                        shouldApplyStoredPermissions
                            ? normalizePermissionIds(selectedItem?.r_permissions)
                            : null
                    )
                );
            }
        } catch (error) {
            // console.log("error", error);
        }
    };

    useEffect(() => {
        if (!open) return;

        if (!typeName) {
            setPermissionNames([]);
            return;
        }

        getUserPermissionName(typeName);
    }, [open, typeName, selectedItem?.r_id, selectedItem?.r_type, selectedItem?.r_permissions]);


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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                        </label>
                        <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={typeName || ""}
                            onChange={handleTypeChange}
                        >
                            <option value="">Select Type</option>
                            <option value="system">System</option>
                            <option value="general">General</option>
                            <option value="custom">Custom</option>
                            <option value="reserved">Reserved</option>
                        </select>
                    </div>

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
                                <div key={index} className="flex flex-col gap-2 border-b pb-3 sm:flex-row sm:items-start sm:justify-between">
                                    <span className="sm:w-1/3 break-words">{item?.name}</span>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2 sm:w-2/3">
                                        {item?.permissions.map((action, index) => (
                                            <label key={index} className="flex items-center gap-1 text-sm">
                                                <input
                                                    type="checkbox"
                                                    className="accent-purple-600"
                                                    checked={!!action.p_is_selected}
                                                    onChange={(e) => handlePermissionChange(item?.name, action?.p_id, e.target.checked)}
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
