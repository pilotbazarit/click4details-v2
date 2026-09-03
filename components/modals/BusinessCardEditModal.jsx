'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import PermissionService from '@/services/PermissionService';
import UserService from '@/services/UserService';
import MasterDataService from '@/services/MasterDataService';
import constData from '@/lib/constant';
import { useAppContext } from '@/context/AppContext';

const EMPTY_LIST = [''];

const normalizeListValues = (value) => {
    if (value === undefined || value === null) {
        return EMPTY_LIST;
    }

    let rawItems = [];

    if (Array.isArray(value)) {
        rawItems = value;
    } else if (typeof value === 'string') {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            rawItems = [];
        } else {
            try {
                const parsedValue = JSON.parse(trimmedValue);
                rawItems = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
            } catch (error) {
                rawItems = trimmedValue.includes(',') ? trimmedValue.split(',') : [trimmedValue];
            }
        }
    } else if (typeof value === 'object') {
        rawItems = Object.values(value);
    } else {
        rawItems = [value];
    }

    const normalizedItems = rawItems
        .map((item) => {
            if (item === undefined || item === null) {
                return '';
            }

            if (typeof item === 'object') {
                const resolvedValue =
                    item.value ??
                    item.email ??
                    item.phone ??
                    item.url ??
                    item.website ??
                    item.name ??
                    item.label ??
                    '';

                return String(resolvedValue).trim();
            }

            return String(item).trim();
        })
        .filter(Boolean);

    return normalizedItems.length > 0 ? normalizedItems : EMPTY_LIST;
};

const getListFromSources = (keys, ...sources) => {
    for (const source of sources) {
        if (!source) continue;

        for (const key of keys) {
            const value = source?.[key];
            if (value !== undefined && value !== null && !(typeof value === 'string' && value.trim() === '')) {
                return normalizeListValues(value);
            }
        }
    }

    return EMPTY_LIST;
};

const getPermissionIds = (...sources) => {
    for (const source of sources) {
        const permissions = source?.urp_permissions;
        if (!Array.isArray(permissions) || permissions.length === 0) {
            continue;
        }

        const permissionIds = permissions.flatMap((permission) => {
            if (permission === undefined || permission === null) {
                return [];
            }

            if (typeof permission !== 'object') {
                return [permission];
            }

            if (Array.isArray(permission.permissions)) {
                return permission.permissions
                    .filter((item) => item?.p_is_selected)
                    .map((item) => item?.p_id)
                    .filter(Boolean);
            }

            const resolvedPermissionId =
                permission.p_id ??
                permission.id ??
                permission.value ??
                null;

            return resolvedPermissionId ? [resolvedPermissionId] : [];
        });

        if (permissionIds.length > 0) {
            return permissionIds;
        }
    }

    return [];
};

const BusinessCardEditModal = ({ open, setOpen, selectedCompanyShop }) => {
    const { setSelectedCompanyShop, setCompanyShops } = useAppContext();

    const [loading, setLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [designations, setDesignations] = useState([]);
    const [selectedUser, setSelectedUser] = useState({});
    const [userId, setUserId] = useState('');
    const [roleId, setRoleId] = useState('');
    const [permissionIds, setPermissionIds] = useState([]);
    const [selectedDesignations, setSelectedDesignations] = useState(EMPTY_LIST);
    const [emails, setEmails] = useState(EMPTY_LIST);
    const [phones, setPhones] = useState(EMPTY_LIST);
    const [facebooks, setFacebooks] = useState(EMPTY_LIST);
    const [youtubes, setYoutubes] = useState(EMPTY_LIST);
    const [websites, setWebsites] = useState(EMPTY_LIST);
    const [googleMaps, setGoogleMaps] = useState(EMPTY_LIST);

    const resetFormState = () => {
        setSelectedUser({});
        setUserId('');
        setRoleId('');
        setPermissionIds([]);
        setSelectedDesignations(EMPTY_LIST);
        setEmails(EMPTY_LIST);
        setPhones(EMPTY_LIST);
        setFacebooks(EMPTY_LIST);
        setYoutubes(EMPTY_LIST);
        setWebsites(EMPTY_LIST);
        setGoogleMaps(EMPTY_LIST);
        setLoading(false);
        setSubmitLoading(false);
    };

    const closeModal = () => {
        resetFormState();
        setOpen(false);
    };

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            resetFormState();
        }
    };

    const handleAddItem = (items, setItems, maxLabel) => {
        if (items.length < 4) {
            setItems([...items, '']);
            return;
        }

        toast.error(`Maximum 4 ${maxLabel} allowed`);
    };

    const handleRemoveItem = (index, items, setItems) => {
        if (items.length > 1) {
            setItems(items.filter((_, itemIndex) => itemIndex !== index));
        }
    };

    const handleItemChange = (index, value, items, setItems) => {
        const nextItems = [...items];
        nextItems[index] = value;
        setItems(nextItems);
    };

    const handleRemoveDesignation = (index) => {
        const nextDesignations = selectedDesignations.filter((_, designationIndex) => designationIndex !== index);
        setSelectedDesignations(nextDesignations.length > 0 ? nextDesignations : EMPTY_LIST);
    };

    const getDesignation = async () => {
        try {
            const response = await MasterDataService.Queries.getMasterDataByTypeCode(constData.DESIGNATION_CODE);
            const designationMasterData = response.data?.master_data || [];
            const designationOptions = [
                { value: "", label: "-Select Designation-" },
                ...designationMasterData.map((designation) => ({
                    value: designation.md_id,
                    label: designation.md_title,
                })),
            ];

            setDesignations(designationOptions);
        } catch (error) {
            if (error?.errors) {
                Object.values(error.errors).forEach((item) => toast.error(item[0]));
                return;
            }

            toast.error(error?.message || "Failed to load designations");
        }
    };

    useEffect(() => {
        getDesignation();
    }, []);

    useEffect(() => {
        if (!open || !selectedCompanyShop?.urp_id) {
            return;
        }

        let isActive = true;

        const hydrateForm = async () => {
            setLoading(true);

            try {
                const response = await PermissionService.Queries.getSingleUserRolePermission(selectedCompanyShop.urp_id);
                const permissionData = response?.status === 'success' ? response.data : null;
                const fallbackSource = selectedCompanyShop;
                const source = permissionData || fallbackSource;
                const resolvedUserId =
                    source?.urp_user_id ??
                    fallbackSource?.urp_user_id ??
                    fallbackSource?.user?.id ??
                    '';
                let resolvedUser =
                    permissionData?.user ||
                    fallbackSource?.user ||
                    fallbackSource?.shop?.user ||
                    {};

                if ((!resolvedUser?.name || !String(resolvedUser.name).trim()) && resolvedUserId) {
                    try {
                        const userResponse = await UserService.Queries.getUserById(resolvedUserId);
                        if (userResponse?.status === 'success' && userResponse?.data) {
                            resolvedUser = userResponse.data;
                        }
                    } catch (error) {
                        console.error('Failed to fetch business card user:', error);
                    }
                }

                if (!isActive) {
                    return;
                }

                setSelectedUser(resolvedUser);
                setUserId(resolvedUserId);
                setRoleId(source?.urp_role_id ?? fallbackSource?.urp_role_id ?? '');
                setPermissionIds(getPermissionIds(fallbackSource, source));
                setSelectedDesignations(
                    getListFromSources(
                        ['urp_com_dsg', 'urp_com_designation', 'com_dsg', 'designations'],
                        source,
                        fallbackSource
                    )
                );
                setEmails(
                    getListFromSources(
                        ['urp_com_email', 'urp_com_emails', 'com_email', 'emails'],
                        source,
                        fallbackSource
                    )
                );
                setPhones(
                    getListFromSources(
                        ['urp_com_phone', 'urp_com_phones', 'com_phone', 'phones'],
                        source,
                        fallbackSource
                    )
                );
                setFacebooks(
                    getListFromSources(
                        ['urp_com_facebook', 'com_facebook', 'facebook', 'facebooks'],
                        source,
                        fallbackSource
                    )
                );
                setYoutubes(
                    getListFromSources(
                        ['urp_com_youtube', 'com_youtube', 'youtube', 'youtubes'],
                        source,
                        fallbackSource
                    )
                );
                setWebsites(
                    getListFromSources(
                        ['urp_com_web', 'urp_com_website', 'com_web', 'website', 'web'],
                        source,
                        fallbackSource
                    )
                );
                setGoogleMaps(
                    getListFromSources(
                        ['urp_com_map', 'urp_com_google_map', 'com_map', 'google_map', 'map'],
                        source,
                        fallbackSource
                    )
                );
            } catch (error) {
                if (isActive) {
                    toast.error("Failed to load business card information");
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        hydrateForm();

        return () => {
            isActive = false;
        };
    }, [open, selectedCompanyShop]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedCompanyShop?.urp_id) {
            toast.error("Business card record not found");
            return;
        }

        const validDesignations = selectedDesignations.filter((designation) => designation.trim() !== '');
        const validEmails = emails.filter((item) => item.trim() !== '');
        const validPhones = phones.filter((item) => item.trim() !== '');
        const validFacebooks = facebooks.filter((item) => item.trim() !== '');
        const validYoutubes = youtubes.filter((item) => item.trim() !== '');
        const validWebsites = websites.filter((item) => item.trim() !== '');
        const validGoogleMaps = googleMaps.filter((item) => item.trim() !== '');

        const payload = {
            urp_entity_id: selectedCompanyShop?.urp_entity_id ?? selectedCompanyShop?.shop?.s_id,
            urp_entity_type: selectedCompanyShop?.urp_entity_type || 'shop',
            urp_user_id: userId,
            urp_role_id: roleId,
            urp_permissions: permissionIds,
            _method: 'PUT',
        };

        validEmails.forEach((email, index) => {
            payload[`urp_com_email[${index}]`] = email;
        });

        validPhones.forEach((phone, index) => {
            payload[`urp_com_phone[${index}]`] = phone;
        });

        validDesignations.forEach((designation, index) => {
            payload[`urp_com_dsg[${index}]`] = designation;
        });

        validFacebooks.forEach((facebook, index) => {
            payload[`urp_com_facebook[${index}]`] = facebook;
        });

        validYoutubes.forEach((youtube, index) => {
            payload[`urp_com_youtube[${index}]`] = youtube;
        });

        validWebsites.forEach((website, index) => {
            payload[`urp_com_web[${index}]`] = website;
        });

        validGoogleMaps.forEach((googleMap, index) => {
            payload[`urp_com_map[${index}]`] = googleMap;
        });

        try {
            setSubmitLoading(true);

            const response = await PermissionService.Commands.updateUserPermission(selectedCompanyShop.urp_id, payload);

            if (response?.status === 'success') {
                const updatedCompanyShop = {
                    ...selectedCompanyShop,
                    urp_user_id: userId,
                    urp_role_id: roleId,
                    urp_permissions: permissionIds,
                    urp_com_dsg: validDesignations,
                    urp_com_email: validEmails,
                    urp_com_phone: validPhones,
                    urp_com_facebook: validFacebooks,
                    urp_com_youtube: validYoutubes,
                    urp_com_web: validWebsites,
                    urp_com_map: validGoogleMaps,
                    user: Object.keys(selectedUser || {}).length > 0 ? selectedUser : selectedCompanyShop?.user,
                };

                setSelectedCompanyShop(updatedCompanyShop);
                setCompanyShops((prevShops) => {
                    if (!Array.isArray(prevShops)) {
                        return prevShops;
                    }

                    return prevShops.map((shopItem) =>
                        shopItem?.urp_id === updatedCompanyShop?.urp_id
                            ? { ...shopItem, ...updatedCompanyShop }
                            : shopItem
                    );
                });

                toast.success("Business card updated successfully!");
                closeModal();
                return;
            }

            toast.error(response?.data?.message || "Failed to update business card");
        } catch (error) {
            toast.error(error?.response?.data?.message || error?.message || "Failed to update business card");
        } finally {
            setSubmitLoading(false);
        }
    };

    const renderInputList = ({
        label,
        values,
        placeholder,
        type = 'text',
        onAdd,
        onRemove,
        onChange,
        maxLabel,
    }) => (
        <div className="mb-1">
            <div className="flex flex-col gap-1">
                <label className="text-base font-medium">{label}</label>
                <div className="flex flex-col gap-2">
                    {values.map((value, index) => (
                        <div key={`${label}-${index}`} className="flex gap-2 items-center">
                            <input
                                type={type}
                                placeholder={placeholder}
                                className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
                                value={value}
                                onChange={(e) => onChange(index, e.target.value)}
                            />
                            {values.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="text-red-600 hover:text-red-800 font-bold text-2xl px-2"
                                    title={`Remove ${label}`}
                                >
                                    &times;
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={onAdd}
                        disabled={values.length >= 4}
                        className={`px-4 py-2 rounded transition w-fit self-end ${values.length >= 4
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        <Plus className="w-6 h-6" /> {values.length >= 4 && `(Max 4 ${maxLabel})`}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
                <DialogTitle>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200 mb-4">
                        <h2 className="text-2xl font-bold text-gray-800 tracking-tight flex items-center gap-2">
                            <span className="inline-block w-2 h-6 bg-blue-600 rounded-sm mr-2"></span>
                            Update Business Card
                        </h2>

                        <button
                            type="button"
                            onClick={closeModal}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center"
                        >
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

                <form onSubmit={handleSubmit} className="p-4">
                    <h2 className='font-bold text-md mb-1'>Business Card Information</h2>
                    <hr />

                    {loading ? (
                        <div className="py-10 text-center text-sm text-gray-500">Loading business card information...</div>
                    ) : (
                        <>
                            <div className="mb-4 mt-2">
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="user_name" className="text-base font-medium">User Name</label>
                                    <input
                                        id="user_name"
                                        type="text"
                                        value={selectedUser?.name || ''}
                                        readOnly
                                        className="border rounded px-3 py-2 bg-gray-100 cursor-not-allowed focus:outline-none w-full"
                                    />
                                </div>
                            </div>

                            <div className="mb-4 mt-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-base font-medium">Designations</label>

                                    {selectedDesignations.filter((designation) => designation.trim() !== '').length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {selectedDesignations.map((selectedDesignation, index) => {
                                                if (!selectedDesignation.trim()) return null;

                                                const designationLabel =
                                                    designations.find((designation) => String(designation.value) === String(selectedDesignation))?.label ||
                                                    selectedDesignation;

                                                return (
                                                    <div
                                                        key={`designation-${index}`}
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

                                    <div className="flex gap-2 items-center">
                                        <select
                                            className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 flex-1"
                                            value=""
                                            onChange={(e) => {
                                                const nextDesignation = e.target.value;
                                                const alreadySelected = selectedDesignations.some(
                                                    (designation) => String(designation) === String(nextDesignation)
                                                );

                                                if (nextDesignation && !alreadySelected) {
                                                    if (selectedDesignations.filter((designation) => designation.trim() !== '').length < 4) {
                                                        const nextDesignations = selectedDesignations.filter((designation) => designation.trim() !== '');
                                                        setSelectedDesignations([...nextDesignations, nextDesignation]);
                                                    } else {
                                                        toast.error('Maximum 4 designations allowed');
                                                    }
                                                }
                                            }}
                                            disabled={selectedDesignations.filter((designation) => designation.trim() !== '').length >= 4}
                                        >
                                            <option value="">-Select Designation-</option>
                                            {designations
                                                .filter((designation) =>
                                                    designation.value !== '' &&
                                                    !selectedDesignations.some(
                                                        (selectedDesignation) => String(selectedDesignation) === String(designation.value)
                                                    )
                                                )
                                                .map((designation, index) => (
                                                    <option key={`designation-option-${index}`} value={designation.value}>
                                                        {designation.label}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {renderInputList({
                                label: 'Emails',
                                values: emails,
                                placeholder: 'Enter email address',
                                type: 'email',
                                maxLabel: 'emails',
                                onAdd: () => handleAddItem(emails, setEmails, 'email addresses'),
                                onRemove: (index) => handleRemoveItem(index, emails, setEmails),
                                onChange: (index, value) => handleItemChange(index, value, emails, setEmails),
                            })}

                            {renderInputList({
                                label: 'Phone Numbers',
                                values: phones,
                                placeholder: 'Enter phone number',
                                type: 'tel',
                                maxLabel: 'phones',
                                onAdd: () => handleAddItem(phones, setPhones, 'phone numbers'),
                                onRemove: (index) => handleRemoveItem(index, phones, setPhones),
                                onChange: (index, value) => handleItemChange(index, value, phones, setPhones),
                            })}

                            {renderInputList({
                                label: 'Facebook',
                                values: facebooks,
                                placeholder: 'Enter Facebook link',
                                maxLabel: 'facebooks',
                                onAdd: () => handleAddItem(facebooks, setFacebooks, 'facebook links'),
                                onRemove: (index) => handleRemoveItem(index, facebooks, setFacebooks),
                                onChange: (index, value) => handleItemChange(index, value, facebooks, setFacebooks),
                            })}

                            {renderInputList({
                                label: 'YouTube',
                                values: youtubes,
                                placeholder: 'Enter YouTube link',
                                maxLabel: 'youtubes',
                                onAdd: () => handleAddItem(youtubes, setYoutubes, 'youtube links'),
                                onRemove: (index) => handleRemoveItem(index, youtubes, setYoutubes),
                                onChange: (index, value) => handleItemChange(index, value, youtubes, setYoutubes),
                            })}

                            {renderInputList({
                                label: 'Website',
                                values: websites,
                                placeholder: 'Enter website link',
                                maxLabel: 'websites',
                                onAdd: () => handleAddItem(websites, setWebsites, 'website links'),
                                onRemove: (index) => handleRemoveItem(index, websites, setWebsites),
                                onChange: (index, value) => handleItemChange(index, value, websites, setWebsites),
                            })}

                            {renderInputList({
                                label: 'Google Map',
                                values: googleMaps,
                                placeholder: 'Enter Google Map link',
                                maxLabel: 'google maps',
                                onAdd: () => handleAddItem(googleMaps, setGoogleMaps, 'google map links'),
                                onRemove: (index) => handleRemoveItem(index, googleMaps, setGoogleMaps),
                                onChange: (index, value) => handleItemChange(index, value, googleMaps, setGoogleMaps),
                            })}

                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="rounded px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className={`rounded px-5 py-2 text-white transition ${submitLoading
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                        }`}
                                >
                                    {submitLoading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BusinessCardEditModal;
