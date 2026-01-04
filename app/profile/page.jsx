"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import Select from "react-select";
import constData from "@/lib/constant";
import MasterDataService from "@/services/MasterDataService";
import toast from "react-hot-toast";

import 'rc-slider/assets/index.css';
import RangeSlider from "@/components/RangeSlider";
// import CustomDatePicker from "@/components/CustomDatePicker";
import PageHeaderSection from "@/components/advance-filter/PageHeaderSection";
import CardViewFilteredProducts from "@/components/advance-filter/CardViewFilteredProducts";
import { AdvanceFilterProductContextProvider } from "@/context/AdvanceFilterProductContextProvider";
import { Minus, Plus } from "lucide-react";
import user_icon from "@/assets/user_icon.svg";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import UserService from "@/services/UserService";
import { method } from "lodash";

const Profile = () => {

    const [rows, setRows] = useState([
        { name: "", address: "", stock: false },
    ]);

    const [user, setUser] = useState({});

    const [emails, setEmails] = useState([""]);
    const [phones, setPhones] = useState([{ phone: "", name: "" }]);
    const [facebooks, setFacebooks] = useState([""]);
    const [youtubes, setYoutubes] = useState([""]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [countryCode, setCountryCode] = useState("+880");

    useEffect(() => {
        const userData = localStorage.getItem("user");
        const userInfo = userData && JSON.parse(userData);
        const user = JSON.parse(userInfo);

        if (user) {
            getUserById(user.id);
        }
    }, []);


    // const getUserById = async (id) => {
    //     const response = await UserService.Queries.getUserById(id);

    //     if (response.status === "success") {

    //         console.log("response", response.data);

    //         setUser({
    //             // ...user,
    //             id: response?.data?.id || "",
    //             name: response?.data?.name || "",
    //             email: response?.data?.email || "",
    //             phone: response?.data?.phone || "",
    //             designation: response?.data?.profile?.up_designation || "",
    //             company_name: response?.data?.profile?.up_company || "",
    //             facebook: response?.data?.profile?.up_facebook || "",
    //             instagram: response?.data?.profile?.up_instagram || "",
    //             twitter: response?.data?.profile?.up_twitter || "",
    //             linkedin: response?.data?.profile?.up_linkedin || "",
    //             youtube: response?.data?.profile?.up_youtube || "",
    //             website: response?.data?.profile?.up_website || "",
    //         });

    //         setEmails(response?.data?.profile?.up_biz_email || [""]);
    //         setPhones(response?.data?.profile?.up_biz_phone || [""]);
    //         setFacebooks(response?.data?.profile?.up_biz_facebook || [""]);
    //         setYoutubes(response?.data?.profile?.up_biz_youtube || [""]);
    //     }
    // }


    const getUserById = async (id) => {
        const response = await UserService.Queries.getUserById(id);

        if (response.status === "success") {
            const profile = response?.data?.profile || {};

            // Format phone number with country code if not already present
            let phoneNumber = response?.data?.phone ?? "";
            console.log("Original phone from API:", phoneNumber);

            // Remove any + or 880 prefix first to normalize
            phoneNumber = phoneNumber.replace(/^\+?880/, '');
            // Then add 880 prefix
            if (phoneNumber) {
                phoneNumber = '880' + phoneNumber;
            }

            console.log("Formatted phone for display:", phoneNumber);

            setUser({
                id: response?.data?.id ?? "",
                name: response?.data?.name ?? "",
                email: response?.data?.email ?? "",
                phone: phoneNumber,
                designation: profile?.up_designation ?? "",
                company_name: profile?.up_company ?? "",
                facebook: profile?.up_facebook ?? "",
                instagram: profile?.up_instagram ?? "",
                twitter: profile?.up_twitter ?? "",
                linkedin: profile?.up_linkedin ?? "",
                youtube: profile?.up_youtube ?? "",
                website: profile?.up_website ?? "",
            });

            // Array গুলো null-safe করে সেট করা
            setRows(
                (profile?.up_biz_address || [{ com: "", addr: "", stock: false }]).map(addr => ({
                    name: addr?.com ?? "",
                    address: addr?.addr ?? "",
                    stock: addr?.stock ?? false
                }))
            );

            setEmails((profile?.up_biz_email || [""]).map(e => e ?? ""));
            setPhones(
                (profile?.up_biz_phone || [{ phone: "", name: "" }]).map(p => ({
                    phone: p?.phone ?? p ?? "",
                    name: p?.name ?? ""
                }))
            );
            setFacebooks((profile?.up_biz_facebook || [""]).map(f => f ?? ""));
            setYoutubes((profile?.up_biz_youtube || [""]).map(y => y ?? ""));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);

        try {
            // Remove country code from phone number before submitting
            let phoneForSubmit = user?.phone || "";
            const dialCodeWithoutPlus = countryCode.replace('+', '');

            if (phoneForSubmit.startsWith(dialCodeWithoutPlus)) {
                phoneForSubmit = phoneForSubmit.substring(dialCodeWithoutPlus.length);
            } else if (phoneForSubmit.startsWith('+' + dialCodeWithoutPlus)) {
                phoneForSubmit = phoneForSubmit.substring(dialCodeWithoutPlus.length + 1);
            }

            const data = {
                name: user?.name,
                email: user?.email,
                phone: phoneForSubmit,
                country_code: countryCode,
                up_designation: user?.designation,
                up_company: user?.company_name,
                up_facebook: user?.facebook,
                up_instagram: user?.instagram,
                up_twitter: user?.twitter,
                up_linkedin: user?.linkedin,
                up_youtube: user?.youtube,
                up_website: user?.website,
                _method: 'PUT',
            };


            rows.length > 0 && rows.forEach((item, index) => {
                const i = index;
                data[`up_biz_address[${i}][com]`] = item?.name;
                data[`up_biz_address[${i}][addr]`] = item?.address;
                data[`up_biz_address[${i}][stock]`] = item?.stock ? 1 : 0;
            });

            emails.length > 0 && emails.forEach((email, index) => {
                const i = index;
                data[`up_biz_email[${i}]`] = email;
            });

            phones.length > 0 && phones.forEach((phone, index) => {
                const i = index;
                data[`up_biz_phone[${i}][phone]`] = phone.phone;
                data[`up_biz_phone[${i}][name]`] = phone.name;
            });

            facebooks.length > 0 && facebooks.forEach((facebook, index) => {
                const i = index;
                data[`up_biz_facebook[${i}]`] = facebook;
            });

            youtubes.length > 0 && youtubes.forEach((youtube, index) => {
                const i = index;
                data[`up_biz_youtube[${i}]`] = youtube;
            });

            const res = await UserService.Commands.updateUser(user.id, data);

            if (res.status == 'success') {
                toast.success("Profile updated successfully");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            toast.error("An error occurred while updating.");
        } finally {
            setIsUpdating(false);
        }
    };

    // handle input change
    const handleChange = (index, field, value) => {
        const updatedRows = [...rows];
        updatedRows[index][field] = value;
        setRows(updatedRows);
    };


    // Add new row
    const handleAdd = () => {
        setRows([...rows, { name: "", address: "", stock: false }]);
    };

    // Remove row by index
    const handleRemove = (index) => {
        const updatedRows = rows.filter((_, i) => i !== index);
        setRows(updatedRows);
    };


    const handleEmailChange = (index, value) => {
        const updatedEmails = [...emails];
        updatedEmails[index] = value;
        setEmails(updatedEmails);
    };

    const handleAddEmail = () => {
        if (emails.length < 4) {
            setEmails([...emails, ""]);
        } else {
            toast.error("You can add a maximum of 4 additional emails.");
        }
    };

    const handleRemoveEmail = (index) => {
        const updatedEmails = emails.filter((_, i) => i !== index);
        setEmails(updatedEmails);
    };

    const handlePhoneChange = (index, field, value) => {
        const updatedPhones = [...phones];
        updatedPhones[index][field] = value;
        setPhones(updatedPhones);
    };

    const handleAddPhone = () => {
        if (phones.length < 4) {
            setPhones([...phones, { phone: "", name: "" }]);
        } else {
            toast.error("You can add a maximum of 4 additional phone numbers.");
        }
    };

    const handleRemovePhone = (index) => {
        const updatedPhones = phones.filter((_, i) => i !== index);
        setPhones(updatedPhones);
    };

    const handleFacebookChange = (index, value) => {
        const updatedFacebooks = [...facebooks];
        updatedFacebooks[index] = value;
        setFacebooks(updatedFacebooks);
    };

    const handleAddFacebook = () => {
        if (facebooks.length < 4) {
            setFacebooks([...facebooks, ""]);
        } else {
            toast.error("You can add a maximum of 4 additional facebook links.");
        }
    };

    const handleRemoveFacebook = (index) => {
        const updatedFacebooks = facebooks.filter((_, i) => i !== index);
        setFacebooks(updatedFacebooks);
    };

    const handleYoutubeChange = (index, value) => {
        const updatedYoutubes = [...youtubes];
        updatedYoutubes[index] = value;
        setYoutubes(updatedYoutubes);
    };

    const handleAddYoutube = () => {
        if (youtubes.length < 4) {
            setYoutubes([...youtubes, ""]);
        } else {
            toast.error("You can add a maximum of 4 additional youtube links.");
        }
    };

    const handleRemoveYoutube = (index) => {
        const updatedYoutubes = youtubes.filter((_, i) => i !== index);
        setYoutubes(updatedYoutubes);
    };


    return (
        <>
            <Navbar />
            <div className="">
                <div className="relative h-56 w-full bg-blue-50 rounded-lg shadow-md">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div className="relative">
                            <Image
                                src={user_icon}
                                alt="profile icon"
                                className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg"
                            />
                        </div>
                    </div>
                </div>

                <div className="text-center mt-20">
                    <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "#116fa5" }}>
                        {user.name || "User Name"}
                    </h1>
                    <p className="text-gray-500 mt-1">{user?.email}</p>
                </div>

                {/* Customer Info Section */}
                <div id="profile-form" className="flex items-start justify-center">
                    <form onSubmit={handleSubmit} className="w-[90%] mt-6 mb-6  bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">



                        {/* Profile Info  */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="customer-name">
                                    Name
                                </label>
                                <input
                                    id="customer-name"
                                    type="text"
                                    placeholder="Enter Customer Name"
                                    className="outline-none py-2 px-3 rounded border border-gray-500/40"
                                    value={user?.name || ""}
                                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                                />
                            </div>

                            {/* Customer Email */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="customer-email">
                                    Email
                                </label>
                                <input
                                    id="customer-email"
                                    type="email"
                                    placeholder="Enter Email Address"
                                    className="outline-none py-2 px-3 rounded border border-gray-500/40 bg-gray-100 cursor-not-allowed"
                                    value={user?.email || ""}
                                    readOnly
                                />
                            </div>

                            {/* Customer Mobile */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="customer-mobile">
                                    Mobile Number
                                </label>
                                <PhoneInput
                                    country={'bd'}
                                    value={user?.phone || ""}
                                    onChange={(phone, country) => {
                                        const dialCode = country.dialCode;
                                        setUser({ ...user, phone: phone });
                                        setCountryCode(`+${dialCode}`);
                                    }}
                                    inputProps={{
                                        name: 'phone',
                                        id: 'customer-mobile',
                                    }}
                                    containerClass="w-full"
                                    inputClass="!w-full"
                                    buttonClass="!bg-gray-50 dark:!bg-gray-600"
                                    dropdownClass="!bg-white dark:!bg-gray-700"
                                    countryCodeEditable={false}
                                />
                            </div>

                            {/* Designation */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="designation">
                                    Designation
                                </label>
                                <input
                                    id="designation"
                                    type="text"
                                    placeholder="Enter Designation"
                                    className="outline-none py-2 px-3 rounded border border-gray-500/40"
                                    value={user?.designation || ""}
                                    onChange={(e) => setUser({ ...user, designation: e.target.value })}
                                />
                            </div>

                            {/* Company Name */}
                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="company-name">
                                    Company Name
                                </label>
                                <input
                                    id="company-name"
                                    type="text"
                                    placeholder="Enter Company Name"
                                    className="outline-none py-2 px-3 rounded border border-gray-500/40"
                                    value={user.company_name || ""}
                                    onChange={(e) => setUser({ ...user, company_name: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="facebook">
                                    Facebook
                                </label>
                                <input
                                    id="facebook"
                                    type="text"
                                    placeholder="Enter Facebook Profile"
                                    className="outline-none py-2 px-3 rounded border border-gray-500/40"
                                    value={user.facebook || ""}
                                    onChange={(e) => setUser({ ...user, facebook: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="instagram">
                                    Instagram
                                </label>
                                <input
                                    id="instagram"
                                    type="text"
                                    placeholder="Enter Instagram Profile"
                                    className="outline-none py-2 px-3 rounded border border-gray-500/40"
                                    value={user.instagram || ""}
                                    onChange={(e) => setUser({ ...user, instagram: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="twitter">
                                    Twitter
                                </label>
                                <input
                                    id="twitter"
                                    type="text"
                                    placeholder="Enter Twitter Profile"
                                    className="outline-none py-2 px-3 rounded border border-gray-500/40"
                                    value={user.twitter || ""}
                                    onChange={(e) => setUser({ ...user, twitter: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="linkedin">
                                    linkedin
                                </label>
                                <input
                                    id="twitter"
                                    type="text"
                                    placeholder="Enter Linkedin Profile"
                                    className="outline-none py-2 px-3 rounded border border-gray-500/40"
                                    value={user.linkedin || ""}
                                    onChange={(e) => setUser({ ...user, linkedin: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="youtube">
                                    Youtube
                                </label>
                                <input
                                    id="youtube"
                                    type="text"
                                    placeholder="Enter Youtube Profile"
                                    className="outline-none py-2 px-3 rounded border border-gray-500/40"
                                    value={user.youtube || ""}
                                    onChange={(e) => setUser({ ...user, youtube: e.target.value })}
                                />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-base font-medium" htmlFor="website">
                                    Website
                                </label>
                                <input
                                    id="website"
                                    type="text"
                                    placeholder="Enter Website "
                                    className="outline-none py-2 px-3 rounded border border-gray-500/40"
                                    value={user.website || ""}
                                    onChange={(e) => setUser({ ...user, website: e.target.value })}
                                />
                            </div>

                        </div>


                        <h2 className="text-sm font-semibold mt-5">Business Profile (Stock List Title)</h2>

                        <div className="w-full h-0.5 bg-gray-300 mt-2"></div>

                        <h2 className="text-sm font-semibold mt-5">Business Locations</h2>

                        <div className="mt-4">
                            <div className="w-[60%] bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="p-4">

                                    {rows.map((row, index) => (
                                        <div key={index}>
                                            <h2 className="text-sm font-semibold border-b border-gray-200 pb-2 mt-2">{index + 1}. Office/Shop/Outlet </h2>
                                            <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow w-full mx-auto mt-2">
                                                {/* Name Input */}
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={row?.name || ""}
                                                    onChange={e => handleChange(index, 'name', e.target.value)}
                                                />

                                                {/* Address Input */}
                                                <input
                                                    type="text"
                                                    placeholder="Address"
                                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    value={row?.address || ""}
                                                    onChange={e => handleChange(index, 'address', e.target.value)}
                                                />

                                                {/* Stock Checkbox */}
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`stock-${index}`}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        checked={row?.stock || false}
                                                        onChange={e => handleChange(index, 'stock', e.target.checked)}
                                                    />
                                                    <label htmlFor={`stock-${index}`} className="text-sm text-gray-700 whitespace-nowrap">
                                                        Show in Stock List
                                                    </label>
                                                </div>

                                                {/* Remove Button */}
                                                {rows.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemove(index)}
                                                        className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                    >
                                                        <Minus className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {/* Add Button */}
                                    <div className="mt-4 flex items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={handleAdd}
                                            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-4 mb-5">
                            {/* Additional Email Section */}
                            <div className="w-full lg:w-1/2">
                                <h2 className="text-sm font-semibold mt-5">Additional Email</h2>
                                <div className="mt-4">
                                    <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                        <div className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">You can add a maximum of 4 emails.</p>
                                            <div className="grid grid-cols-1 gap-4">
                                                {emails.map((email, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <input
                                                            type="email"
                                                            placeholder="Enter additional email"
                                                            value={email}
                                                            onChange={(e) => handleEmailChange(index, e.target.value)}
                                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        {emails.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveEmail(index)}
                                                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                            >
                                                                <Minus className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleAddEmail}
                                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Phone Section */}
                            <div className="w-full lg:w-1/2">
                                <h2 className="text-sm font-semibold mt-5">Additional Phone</h2>
                                <div className="mt-4">
                                    <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                        <div className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">You can add a maximum of 4 phone numbers.</p>
                                            <div className="grid grid-cols-1 gap-4">
                                                {phones.map((phone, index) => (
                                                    <div key={index} className="flex flex-col gap-2">
                                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                            <input
                                                                type="text"
                                                                placeholder="Enter name"
                                                                value={phone.name || ""}
                                                                onChange={(e) => handlePhoneChange(index, 'name', e.target.value)}
                                                                className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            <input
                                                                type="tel"
                                                                placeholder="Enter additional phone"
                                                                value={phone.phone || ""}
                                                                onChange={(e) => handlePhoneChange(index, 'phone', e.target.value)}
                                                                className="w-full sm:flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            />
                                                            {phones.length > 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemovePhone(index)}
                                                                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors self-center"
                                                                >
                                                                    <Minus className="w-5 h-5" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleAddPhone}
                                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Facebook Section */}
                            <div className="w-full lg:w-1/2">
                                <h2 className="text-sm font-semibold mt-5">Facebook</h2>
                                <div className="mt-4">
                                    <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                        <div className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">You can add a maximum of 4 facebook links.</p>
                                            <div className="grid grid-cols-1 gap-4">
                                                {facebooks.map((facebook, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter facebook link"
                                                            value={facebook || ""}
                                                            onChange={(e) => handleFacebookChange(index, e.target.value)}
                                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        {facebooks.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveFacebook(index)}
                                                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                            >
                                                                <Minus className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleAddFacebook}
                                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Additional Youtube Section */}
                            <div className="w-full lg:w-1/2">
                                <h2 className="text-sm font-semibold mt-5">Youtube</h2>
                                <div className="mt-4">
                                    <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                        <div className="p-4">
                                            <p className="text-xs text-gray-500 mb-2">You can add a maximum of 4 youtube links.</p>
                                            <div className="grid grid-cols-1 gap-4">
                                                {youtubes.map((youtube, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <input
                                                            type="text"
                                                            placeholder="Enter youtube link"
                                                            value={youtube || ""}
                                                            onChange={(e) => handleYoutubeChange(index, e.target.value)}
                                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                        />
                                                        {youtubes.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveYoutube(index)}
                                                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                            >
                                                                <Minus className="w-5 h-5" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleAddYoutube}
                                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>

                        <hr />

                        <div className="w-full mt-3 mb-6 border-gray-200 pb-4">
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-gradient-to-r gap-1 from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-sm shadow-md transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg flex items-center float-right"
                                disabled={isUpdating}
                            >
                                {isUpdating ? 'Updating...' : <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                        <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                                    </svg>
                                    Update
                                </>}
                            </button>

                        </div>

                    </form>


                </div>


                {/* Submit Button */}

            </div>

            <Footer />
        </>
    );
};

export default Profile;
