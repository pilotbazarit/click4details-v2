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
import { useAppContext } from '@/context/AppContext';
import constData from "@/lib/constant";
import MasterDataService from '@/services/MasterDataService';

const AddMemberModal = ({ open, setOpen, selectedUser, getShopEmployee }) => {
    // if (!isOpen) return null;

    const { selectedShop } = useAppContext();

    const [permissionNames, setPermissionNames] = useState([]);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [selectUser, setSelectUser] = useState({});
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [emails, setEmails] = useState(['']);
    const [phones, setPhones] = useState(['']);
    const [designations, setDesignations] = useState([]);
    const [selectedDesignations, setSelectedDesignations] = useState(['']);

    // console.log("selectedUser", selectedUser);


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


    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset(); // Reset form when dialog closes
            setEmails(['']);
            setPhones(['']);
            setSelectedDesignations(['']);
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
                setLoading(false);
            } else {
                toast.error(response?.data?.message || "Failed to fetch models");
            }

        } catch (error) {
            console.log("error", error);
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
            console.log("error", error);
        }
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

    useEffect(() => {
        getRoles();
    }, []);

    // useEffect(() => {
    //     console.log('Emails state updated:', emails);
    // }, [emails]);

    // Email handling functions
    const handleAddEmail = () => {
        if (emails.length < 4) {
            setEmails([...emails, '']);
        } else {
            toast.error('Maximum 4 email addresses allowed');
        }
    };

    const handleRemoveEmail = (index) => {
        if (emails.length > 1) {
            const newEmails = emails.filter((_, i) => i !== index);
            setEmails(newEmails);
        }
    };

    const handleEmailChange = (index, value) => {
        const newEmails = [...emails];
        newEmails[index] = value;
        setEmails(newEmails);
    };

    // Phone handling functions
    const handleAddPhone = () => {
        if (phones.length < 4) {
            setPhones([...phones, '']);
        } else {
            toast.error('Maximum 4 phone numbers allowed');
        }
    };

    const handleRemovePhone = (index) => {
        if (phones.length > 1) {
            const newPhones = phones.filter((_, i) => i !== index);
            setPhones(newPhones);
        }
    };

    const handlePhoneChange = (index, value) => {
        const newPhones = [...phones];
        newPhones[index] = value;
        setPhones(newPhones);
    };

    // Designation handling function
    const handleRemoveDesignation = (index) => {
        const newDesignations = selectedDesignations.filter((_, i) => i !== index);
        setSelectedDesignations(newDesignations.length > 0 ? newDesignations : ['']);
    };

    const onSubmit = async (data) => {
        let permissionArr = [];
        permissionNames.forEach((role) => {
            role.permissions.forEach((perm) => {
                if (perm.p_is_selected) {
                    permissionArr.push(perm.p_id);
                }
            });
        })

        // Filter out empty emails, phones, and designations
        const validEmails = emails.filter(email => email.trim() !== '');
        const validPhones = phones.filter(phone => phone.trim() !== '');
        const validDesignations = selectedDesignations.filter(designation => designation.trim() !== '');



        const payload = {
            urp_entity_id: selectedShop?.s_id,
            urp_entity_type: 'shop',
            urp_user_id: data?.user_id,
            urp_role_id: data?.role_id,
            urp_permissions: permissionArr,
        }

        // Add indexed emails to payload
        validEmails.forEach((email, index) => {
            payload[`urp_com_email[${index}]`] = email;
        });

        // Add indexed phones to payload
        validPhones.forEach((phone, index) => {
            payload[`urp_com_phone[${index}]`] = phone;
        });

        // Add indexed designations to payload
        validDesignations.forEach((designation, index) => {
            payload[`urp_com_dsg[${index}]`] = designation;
        });

        // console.log("payload", payload);

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
                toast.success(selectedUser?.urp_id ? "Permission updated successfully!" : "Permission added successfully!");
                getShopEmployee();
                setOpen(false);
                reset();
                setEmails(['']);
                setPhones(['']);
                setSelectedDesignations(['']);
            } else {
                toast.error(response?.data?.message);
            }
        } catch (error) {
            toast.error(error?.message);
            console.log("error", error);
        }
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
            console.log("error", error);
        }
    }

    useEffect(() => {
        if (selectedUser && selectedUser.urp_id) {
            getUserRolePermission(selectedUser?.urp_id);
        }
    }, [selectedUser]);


    const getDesignation = async () => {
        try {
          const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.DESIGNATION_CODE);
    
          const designationMasterData = response.data?.master_data;
          const designationData = [
            {
              value: "",
              label: "-Select Designation-",
            },
            // First placeholder option
            ...designationMasterData.map((designation) => ({
              value: designation.md_id,
              label: designation.md_title,
            })),
          ];
    
          setDesignations(designationData);
        } catch (error) {
          if (error.errors) {
            Object.values(error.errors).forEach((e) => toast.error(e[0]));
          } else {
            toast.error(error.message || "Something went wrong");
          }
        }
      };


    useEffect(() => {
        getDesignation();
    }, []);


    // console.log("designations", designations);

    return (
        <Dialog open={open} onOpenChange={() => setOpen(false)}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">

                <DialogTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                            <span className="inline-block w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
                            {selectedUser?.urp_id ? "Update" : "Add User"}
                        </h2>

                        <button
                            onClick={() => {
                                setOpen(false);
                                // selectedUserId('');
                                setUsers([]);
                                setPermissionNames([]);
                                setEmails(['']);
                                setPhones(['']);
                                setSelectedDesignations(['']);
                                reset();
                            }}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center"
                        >
                            {/* Left arrow SVG for Back */}
                            <svg
                                className="inline-block w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Close
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


                    {/* User Name - read only field */}
                    {selectedUserId && (
                        <div className="mb-4">
                            <div className="flex flex-col gap-1">
                                <label htmlFor="user_name" className="text-base font-medium">User Name</label>
                                <input
                                    id="user_name"
                                    type="text"
                                    value={selectUser.name || ''}
                                    readOnly
                                    className="border rounded px-3 py-2 bg-gray-100 cursor-not-allowed focus:outline-none w-full"
                                />
                            </div>
                        </div>
                    )}



                    {/* Designation Section */}
                    <div className="mb-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-base font-medium">Designations</label>

                            {/* Selected Designations as Chips */}
                            {selectedDesignations.filter(d => d.trim() !== '').length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedDesignations.map((selectedDesignation, index) => {
                                        if (!selectedDesignation.trim()) return null;
                                        // Convert both to string for comparison
                                        const designationLabel = designations.find(d => String(d.value) === String(selectedDesignation))?.label || selectedDesignation;
                                        return (
                                            <div
                                                key={index}
                                                className="inline-flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-full px-4 py-2"
                                            >
                                                <span className="text-sm font-medium text-gray-700">
                                                    {designationLabel}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDesignation(index)}
                                                    className="text-gray-500 hover:text-red-600 font-bold text-lg"
                                                    title="Remove designation"
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Dropdown to Add New Designation */}
                            <div className="flex gap-2 items-center">
                                <select
                                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
                                    value=""
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Check if already selected (convert both to string for comparison)
                                        const alreadySelected = selectedDesignations.some(d => String(d) === String(value));
                                        if (value && !alreadySelected) {
                                            if (selectedDesignations.filter(d => d.trim() !== '').length < 4) {
                                                const newDesignations = selectedDesignations.filter(d => d.trim() !== '');
                                                setSelectedDesignations([...newDesignations, value]);
                                            } else {
                                                toast.error('Maximum 4 designations allowed');
                                            }
                                        }
                                    }}
                                    disabled={selectedDesignations.filter(d => d.trim() !== '').length >= 4}
                                >
                                    <option value="">-Select Designation-</option>
                                    {designations
                                        .filter(d => d.value !== '' && !selectedDesignations.some(sd => String(sd) === String(d.value)))
                                        .map((designation, idx) => (
                                            <option key={idx} value={designation.value}>
                                                {designation.label}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>
                    </div>


                    {/* Email Section */}
                    <div className="mb-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-base font-medium"></label>
                            <div className="flex flex-col gap-2">
                                {emails.map((email, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="email"
                                            placeholder="Enter email address"
                                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
                                            value={email}
                                            onChange={(e) => handleEmailChange(index, e.target.value)}
                                        />
                                        {emails.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveEmail(index)}
                                                className="text-red-600 hover:text-red-800 font-bold text-2xl px-2"
                                                title="Remove email"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddEmail}
                                    disabled={emails.length >= 4}
                                    className={`px-4 py-2 rounded transition w-fit ${
                                        emails.length >= 4
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    + Add Another Email {emails.length >= 4 && '(Max 4)'}
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Phone Section */}
                    <div className="mb-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-base font-medium">Phone Numbers</label>
                            <div className="flex flex-col gap-2">
                                {phones.map((phone, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="tel"
                                            placeholder="Enter phone number"
                                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
                                            value={phone}
                                            onChange={(e) => handlePhoneChange(index, e.target.value)}
                                        />
                                        {phones.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePhone(index)}
                                                className="text-red-600 hover:text-red-800 font-bold text-2xl px-2"
                                                title="Remove phone"
                                            >
                                                &times;
                                            </button>
                                        )}
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={handleAddPhone}
                                    disabled={phones.length >= 4}
                                    className={`px-4 py-2 rounded transition w-fit ${
                                        phones.length >= 4
                                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    + Add Another Phone {phones.length >= 4 && '(Max 4)'}
                                </button>
                            </div>
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
                            setPermissionNames([]);
                            setEmails(['']);
                            setPhones(['']);
                            setSelectedDesignations(['']);
                            reset();
                        }}>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-purple-700 transition"
                        >
                            {
                                selectedUser?.urp_id
                                    ? 'Update'
                                    : 'Add'
                            }
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddMemberModal;
