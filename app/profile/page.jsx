"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import Select from "react-select";
import constData from "@/lib/constant";
import MasterDataService from "@/services/MasterDataService";
import toast from "react-hot-toast";
import { useAppContext } from "@/context/AppContext";

import 'rc-slider/assets/index.css';
import RangeSlider from "@/components/RangeSlider";
// import CustomDatePicker from "@/components/CustomDatePicker";
import PageHeaderSection from "@/components/advance-filter/PageHeaderSection";
import CardViewFilteredProducts from "@/components/advance-filter/CardViewFilteredProducts";
import { AdvanceFilterProductContextProvider } from "@/context/AdvanceFilterProductContextProvider";
import { ArrowLeft, BarChart3, CreditCard, ExternalLink, Eye, EyeOff, FileText, FolderOpen, Headset, Mail, MapPin, Phone, Plus, Share2, Upload, UserRound, Youtube, Minus, Package } from "lucide-react";
import user_icon from "@/assets/user_icon.svg";
import Image from "next/image";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import UserService from "@/services/UserService";
import { method } from "lodash";

import { parseStoredUser } from "@/lib/parseStoredUser";

const partnerButtonStyles = `
  @keyframes pulse-glow {
    0%, 100% {
      box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.7);
    }
    50% {
      box-shadow: 0 0 0 10px rgba(249, 115, 22, 0);
    }
  }

  .partner-btn {
    animation: pulse-glow 2s infinite;
  }

  .partner-btn:hover {
    transform: scale(1.05);
  }

  .partner-btn:active {
    transform: scale(0.98);
  }
`;

const resolveProfileImageUrl = (profile, fallbackUser) => {
    const image =
        profile?.image_url ??
        profile?.up_image ??
        fallbackUser?.image_url ??
        fallbackUser?.up_image ??
        fallbackUser?.profile?.image_url ??
        fallbackUser?.profile?.up_image;

    if (!image) return "";
    if (typeof image === "string") return image;

    return image?.url || image?.secure_url || image?.location || image?.path || "";
};

const profileMenuItems = [
    { id: "profile-info", label: "Profile Info", description: "Basic profile details", icon: UserRound },
    { id: "business-locations", label: "Business Locations", description: "Office, shop, outlet", icon: MapPin },
    { id: "additional-email", label: "Email", description: "Extra business emails", icon: Mail },
    { id: "additional-phone", label: "Phone", description: "Extra phone numbers", icon: Phone },
    { id: "facebook-links", label: "Facebook", description: "Facebook profile links", icon: Share2 },
    { id: "youtube-links", label: "Youtube", description: "Youtube profile links", icon: Youtube },
    { id: "google-drive-links", label: "Google Drive", description: "Drive document links", icon: FolderOpen },
    { id: "bank-accounts", label: "Bank Account", description: "Bank information", icon: CreditCard },
    { id: "essential-documents", label: "Documents", description: "Essential documents", icon: FileText },
];

const legacyProfileHashMap = {
    "business-profile-section": "business-locations",
    "bank-account-information-section": "bank-accounts",
    "essential-documents-section": "essential-documents",
};

const Profile = () => {
    const { setUser: setAppUser } = useAppContext();

    const [rows, setRows] = useState([
        { name: "", address: "", stock: false, quotation: false },
    ]);

    const [user, setUser] = useState({});

    const [emails, setEmails] = useState([""]);
    const [phones, setPhones] = useState([{ phone: "", name: "" }]);
    const [facebooks, setFacebooks] = useState([""]);
    const [youtubes, setYoutubes] = useState([""]);
    const [googleDrives, setGoogleDrives] = useState([""]);
    const [bankAccounts, setBankAccounts] = useState([
        { ac_bank: "", ac_num: "", ac_name: "", ac_branch: "", ac_routing: "", ac_swift: "", stock: false, quot: false }
    ]);
    const [upDocs, setUpDocs] = useState([{ name: "", file: null, fileName: "", fileUrl: "", publicId: "" }]);
    const [upDocsRemove, setUpDocsRemove] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [countryCode, setCountryCode] = useState("+880");
    const [isPartnerLoading, setIsPartnerLoading] = useState(false);
    const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState("");
    const [activeProfileSection, setActiveProfileSection] = useState("profile-info");
    const [showFilterPassword, setShowFilterPassword] = useState(false);
    const canViewFilterProductPassword = ["supreme", "admin", "pbl"].includes(user?.userMode || user?.user_mode);



    // console.log("upDocs 74", upDocs);

    useEffect(() => {
        const user = parseStoredUser(localStorage.getItem("user"));

        if (user) {
            getUserById(user.id);
        }
    }, []);

    useEffect(() => {
        const syncActiveSectionFromHash = () => {
            const hash = window.location.hash.replace("#", "");
            if (!hash) return;

            const sectionId = legacyProfileHashMap[hash] || hash;
            const isKnownSection = profileMenuItems.some((item) => item.id === sectionId);

            if (isKnownSection) {
                setActiveProfileSection(sectionId);
            }
        };

        syncActiveSectionFromHash();
        window.addEventListener("hashchange", syncActiveSectionFromHash);

        return () => window.removeEventListener("hashchange", syncActiveSectionFromHash);
    }, []);

    useEffect(() => {
        return () => {
            if (profileImagePreview?.startsWith("blob:")) {
                URL.revokeObjectURL(profileImagePreview);
            }
        };
    }, [profileImagePreview]);

    const [isToBePartnerHide, setIsTobePartnerHide] = useState(false);


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
            const profileImageUrl = resolveProfileImageUrl(profile, response?.data);

            // Format phone number with country code if not already present
            let phoneNumber = response?.data?.phone ?? "";
            console.log("Original phone from API:", phoneNumber);

            // Remove any + or 880 prefix first to normalize
            phoneNumber = phoneNumber.replace(/^\+?880/, '');
            // Then add 880 prefix
            if (phoneNumber) {
                phoneNumber = '880' + phoneNumber;
            }



            setUser({
                id: response?.data?.id ?? "",
                name: response?.data?.name ?? "",
                email: response?.data?.email ?? "",
                userMode: response?.data?.user_mode ?? "",
                phone: phoneNumber,
                designation: profile?.up_designation ?? "",
                company_name: profile?.up_company ?? "",
                facebook: profile?.up_facebook ?? "",
                instagram: profile?.up_instagram ?? "",
                twitter: profile?.up_twitter ?? "",
                linkedin: profile?.up_linkedin ?? "",
                youtube: profile?.up_youtube ?? "",
                website: profile?.up_website ?? "",
                filter_product_password: profile?.up_filter_product_password ?? "",
            });

            // Array গুলো null-safe করে সেট করা
            setRows(
                (profile?.up_biz_address || [{ com: "", addr: "", stock: false, quotation: false }]).map(addr => ({
                    name: addr?.com ?? "",
                    address: addr?.addr ?? "",
                    stock: addr?.stock == '1' || addr?.stock === 1 || addr?.stock === true,
                    quotation: addr?.qutation == '1' || addr?.qutation === 1 || addr?.qutation === true
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
            setGoogleDrives((profile?.up_biz_google_drive || [""]).map(g => g ?? ""));
            setBankAccounts(
                (profile?.up_biz_bank_info || [{ ac_bank: "", ac_num: "", ac_name: "", ac_branch: "", ac_routing: "", ac_swift: "", stock: false, quot: false }]).map(bank => ({
                    ac_bank: bank?.ac_bank ?? "",
                    ac_num: bank?.ac_num ?? "",
                    ac_name: bank?.ac_name ?? "",
                    ac_branch: bank?.ac_branch ?? "",
                    ac_routing: bank?.ac_routing ?? "",
                    ac_swift: bank?.ac_swift ?? "",
                    stock: bank?.stock == 1 || bank?.stock === '1' || bank?.stock === true,
                    quot: bank?.quot == 1 || bank?.quot === '1' || bank?.quot === true
                }))
            );
            const mappedUpDocs = Array.isArray(profile?.up_docs)
                ? profile.up_docs
                    .filter(Boolean)
                    .map((doc) => {
                        const fileUrl = doc?.doc?.secure_url || doc?.doc?.url || "";
                        const publicId = doc?.doc?.public_id || "";
                        const fallbackName = publicId ? String(publicId).split("/").pop() : "";

                        return {
                            name: doc?.name ?? "",
                            file: null,
                            fileName: fallbackName,
                            fileUrl,
                            publicId
                        };
                    })
                : [];

            setUpDocs(
                mappedUpDocs.length > 0
                    ? mappedUpDocs
                    : [{ name: "", file: null, fileName: "", fileUrl: "", publicId: "" }]
            );
            setUpDocsRemove([]);
            setProfileImageFile(null);
            setProfileImagePreview(profileImageUrl);
        }
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            toast.error("Please select a valid image file");
            e.target.value = "";
            return;
        }

        const previewUrl = URL.createObjectURL(file);
        setProfileImageFile(file);
        setProfileImagePreview(previewUrl);
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
                up_filter_product_password: user?.filter_product_password,
                _method: 'PUT',
            };

            if (profileImageFile) {
                data.up_image = profileImageFile;
            }


            rows.length > 0 && rows.forEach((item, index) => {
                const i = index;
                data[`up_biz_address[${i}][com]`] = item?.name;
                data[`up_biz_address[${i}][addr]`] = item?.address;
                data[`up_biz_address[${i}][stock]`] = item?.stock ? 1 : 0;
                data[`up_biz_address[${i}][qutation]`] = item?.quotation ? 1 : 0;
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

            googleDrives.length > 0 && googleDrives.forEach((googleDrive, index) => {
                const i = index;
                data[`up_biz_google_drive[${i}]`] = googleDrive;
            });

            bankAccounts.length > 0 && bankAccounts.forEach((bank, index) => {
                const i = index;
                data[`up_biz_bank_info[${i}][ac_bank]`] = bank.ac_bank;
                data[`up_biz_bank_info[${i}][ac_num]`] = bank.ac_num;
                data[`up_biz_bank_info[${i}][ac_name]`] = bank.ac_name;
                data[`up_biz_bank_info[${i}][ac_branch]`] = bank.ac_branch;
                data[`up_biz_bank_info[${i}][ac_routing]`] = bank.ac_routing;
                data[`up_biz_bank_info[${i}][ac_swift]`] = bank.ac_swift;
                data[`up_biz_bank_info[${i}][stock]`] = bank.stock ? 1 : 0;
                data[`up_biz_bank_info[${i}][quot]`] = bank.quot ? 1 : 0;
            });

            upDocs.filter((doc) => (doc?.name || "").trim() || doc?.file).forEach((doc, index) => {
                const i = index;
                data[`up_docs[${i}][name]`] = doc.name;
                if (doc.file) {
                    data[`up_docs[${i}][file]`] = doc.file;
                }
            });

            upDocsRemove.forEach((publicId, index) => {
                data[`up_docs_remove[${index}]`] = publicId;
            });

            const res = await UserService.Commands.updateUser(user.id, data);

            if (res.status == 'success') {
                const refreshedUserResponse = await UserService.Queries.getUserById(user.id);
                if (refreshedUserResponse.status === "success") {
                    localStorage.setItem("user", JSON.stringify(refreshedUserResponse.data));
                    setAppUser(JSON.stringify(refreshedUserResponse.data));
                    getUserById(user.id);
                }
                toast.success("Profile updated successfully");
                setUpDocsRemove([]);
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
        setRows([...rows, { name: "", address: "", stock: false, quotation: false }]);
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

    const handleGoogleDriveChange = (index, value) => {
        const updatedGoogleDrives = [...googleDrives];
        updatedGoogleDrives[index] = value;
        setGoogleDrives(updatedGoogleDrives);
    };

    const handleAddGoogleDrive = () => {
        if (googleDrives.length < 4) {
            setGoogleDrives([...googleDrives, ""]);
        } else {
            toast.error("You can add a maximum of 4 additional google drive links.");
        }
    };

    const handleRemoveGoogleDrive = (index) => {
        const updatedGoogleDrives = googleDrives.filter((_, i) => i !== index);
        setGoogleDrives(updatedGoogleDrives);
    };

    const handleBankAccountChange = (index, field, value) => {
        const updatedBankAccounts = [...bankAccounts];
        updatedBankAccounts[index][field] = value;
        setBankAccounts(updatedBankAccounts);
    };

    const handleAddBankAccount = () => {
        setBankAccounts([...bankAccounts, { ac_bank: "", ac_num: "", ac_name: "", ac_branch: "", ac_routing: "", ac_swift: "", stock: false, quot: false }]);
    };

    const handleRemoveBankAccount = (index) => {
        const updatedBankAccounts = bankAccounts.filter((_, i) => i !== index);
        setBankAccounts(updatedBankAccounts);
    };

    const handleUpDocChange = (index, field, value) => {
        const updatedDocs = [...upDocs];
        updatedDocs[index][field] = value;
        setUpDocs(updatedDocs);
    };

    const handleUpDocFileChange = (index, file) => {
        const updatedDocs = [...upDocs];
        updatedDocs[index].file = file || null;
        updatedDocs[index].fileName = file?.name || "";
        updatedDocs[index].publicId = file?.public_id || "";

        setUpDocs(updatedDocs);
    };

    const handleAddUpDoc = () => {
        setUpDocs([...upDocs, { name: "", file: null, fileName: "", fileUrl: "", publicId: "" }]);
    };

    const handleRemoveUpDoc = (index) => {
        const removedDoc = upDocs[index];
        const removedPublicId = removedDoc?.publicId;

        if (removedPublicId) {
            setUpDocsRemove((prev) => {
                if (prev.includes(removedPublicId)) return prev;
                return [...prev, removedPublicId];
            });
        }

        const updatedDocs = upDocs.filter((_, i) => i !== index);
        setUpDocs(updatedDocs);
    };

    const handlePreviewUpDoc = (doc) => {
        if (!doc) return;

        if (doc.file) {
            const localFileUrl = URL.createObjectURL(doc.file);
            window.open(localFileUrl, "_blank", "noopener,noreferrer");
            setTimeout(() => URL.revokeObjectURL(localFileUrl), 1500);
            return;
        }

        if (doc.fileUrl) {
            window.open(doc.fileUrl, "_blank", "noopener,noreferrer");
        }
    };



    const handlePartnerRequest = async () => {
        setIsPartnerLoading(true);
        setIsTobePartnerHide(true);
        try {
            const response = await UserService.Commands.sendPartnerRequest();
            console.log("Partner request initiated for user profile page 404:", response);
            if (response?.status === "success") {
                toast.success("Partner request submitted successfully");
                setIsPartnerModalOpen(false);
            } else {
                toast.error(response?.message || "Unable to submit partner request");
            }
        } catch (error) {
            console.error("Error in partner request:", error);
            toast.error("Something went wrong while submitting request");
        } finally {
            setIsPartnerLoading(false);
        }
    };

    const activeMenuItem = profileMenuItems.find((item) => item.id === activeProfileSection) || profileMenuItems[0];

    const handleProfileMenuClick = (sectionId) => {
        setActiveProfileSection(sectionId);
        window.history.replaceState(null, "", `#${sectionId}`);
    };

    // console.log("profile page user 413", user);

    return (
        <>
            <style>{partnerButtonStyles}</style>
            <Navbar />
            <div className="">
                <div className="relative h-56 w-full bg-blue-50 rounded-lg shadow-md">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div className="relative">
                            <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
                                {profileImagePreview ? (
                                    <img
                                        src={profileImagePreview}
                                        alt={`${user?.name || "User"} profile`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Image
                                        src={user_icon}
                                        alt="profile icon"
                                        className="h-full w-full object-cover"
                                    />
                                )}
                            </div>
                            <label
                                htmlFor="profile-image-upload"
                                className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#116fa5] text-white shadow-md transition hover:bg-[#0d5a86]"
                                title="Update profile image"
                            >
                                <Upload className="h-4 w-4" />
                            </label>
                            <input
                                id="profile-image-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleProfileImageChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-20 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "#116fa5" }}>
                        {user.name || "User Name"}
                    </h1>
                    <p className="text-gray-500 mt-1">{user?.email}</p>
                    <p className="text-xs text-gray-500 mt-2">Click the upload icon to update your profile photo.</p>

                    {
                        (user?.userMode === "user" || user?.userMode === "member") && (
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    disabled={isToBePartnerHide}
                                    onClick={() => setIsPartnerModalOpen(true)}
                                    className={`partner-btn mr-10 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white text-sm font-semibold rounded-full shadow-lg ${isToBePartnerHide ? 'cursor-not-allowed opacity-70' : 'transition-all duration-300'}`}
                                >
                                    <span className="flex items-center ">
                                        {isPartnerLoading ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Loading...
                                            </>
                                        ) : (
                                            <>
                                                <div>
                                                    <span>to be partner</span>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                                    </svg>
                                                </div>
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        )
                    }


                </div>

                {isPartnerModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
                        <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-[#f4f5f9] shadow-2xl">
                            <div className="p-6 sm:p-8">
                                <button
                                    type="button"
                                    onClick={() => setIsPartnerModalOpen(false)}
                                    className="mb-6 inline-flex items-center gap-3 text-gray-900"
                                >
                                    <ArrowLeft className="h-6 w-6" />
                                    <span className="text-2xl font-medium leading-none">Want to be a Partner</span>
                                </button>

                                <h2 className="text-[22px] font-extrabold leading-tight text-gray-900">
                                    Become a Click4Details Partner
                                </h2>

                                <p className="mt-6 text-base leading-relaxed text-gray-500">
                                    Join our network of professional car dealers and enthusiasts. As a partner, you&apos;ll get
                                    access to exclusive features, tools to manage your inventory, and a wider reach to potential buyers.
                                </p>

                                <div className="mt-8 space-y-7">
                                    <div className="flex items-start gap-4">
                                        <Package className="mt-1 h-8 w-8 text-sky-500" />
                                        <div>
                                            <h3 className="text-xl font-extrabold text-gray-900">Manage Inventory</h3>
                                            <p className="mt-1 text-base text-gray-500">Easily add and update your car listings.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <BarChart3 className="mt-1 h-8 w-8 text-sky-500" />
                                        <div>
                                            <h3 className="text-xl font-extrabold text-gray-900">Advanced Analytics</h3>
                                            <p className="mt-1 text-base text-gray-500">Track your performance and view detailed reports.</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <Headset className="mt-1 h-8 w-8 text-sky-500" />
                                        <div>
                                            <h3 className="text-xl font-extrabold text-gray-900">Priority Support</h3>
                                            <p className="mt-1 text-base text-gray-500">Get help from our dedicated support team.</p>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handlePartnerRequest}
                                    disabled={isPartnerLoading}
                                    className="mt-10 w-full rounded-2xl bg-[#2f95df] py-4 text-xl font-bold tracking-wide text-white shadow-md transition hover:bg-[#2889cf] disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {isPartnerLoading ? "APPLYING..." : "APPLY NOW"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* <div>
                    <button
                        type="button"
                        onClick={handlePartnerRequest}
                        disabled={isPartnerLoading}
                        className="partner-btn absolute -bottom-3 -right-3 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-orange-400 disabled:to-orange-500 text-white text-sm font-semibold rounded-full shadow-lg transition-all duration-300"
                    >
                        <span className="flex items-center gap-2">
                            {isPartnerLoading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <span>to be partner</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                                    </svg>
                                </>
                            )}
                        </span>
                    </button>
                </div> */}

                {/* Customer Info Section */}
                <div id="profile-form" className="flex items-start justify-center">
                    <form onSubmit={handleSubmit} className="w-[90%] max-w-7xl mt-6 mb-6 bg-white border border-gray-200 rounded-lg p-4 sm:p-5 shadow-sm">
                        <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)] gap-5">
                            <aside className="lg:sticky lg:top-24 self-start rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                    Profile Menu
                                </p>
                                <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-2 lg:overflow-visible lg:pb-0">
                                    {profileMenuItems.map((item) => {
                                        const Icon = item.icon;
                                        const isActive = activeProfileSection === item.id;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => handleProfileMenuClick(item.id)}
                                                className={`flex min-w-[210px] items-center gap-3 rounded-lg border px-3 py-3 text-left transition lg:min-w-0 lg:w-full ${isActive
                                                    ? "border-[#116fa5] bg-white text-[#116fa5] shadow-sm"
                                                    : "border-transparent text-gray-700 hover:border-gray-200 hover:bg-white"
                                                    }`}
                                            >
                                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isActive ? "bg-[#116fa5] text-white" : "bg-white text-gray-500"}`}>
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                                <span className="min-w-0">
                                                    <span className="block text-sm font-semibold">{item.label}</span>
                                                    <span className="block truncate text-xs text-gray-500">{item.description}</span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </aside>

                            <div className="min-w-0 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                <div className="mb-5 flex flex-col gap-1 border-b border-gray-200 pb-4">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Active Section</p>
                                    <h2 className="text-xl font-bold text-gray-900">{activeMenuItem.label}</h2>
                                    <p className="text-sm text-gray-500">{activeMenuItem.description}</p>
                                </div>



                                {/* Profile Info  */}
                                {activeProfileSection === "profile-info" && (
                                    <>
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
                                                        readOnly: true,
                                                    }}
                                                    containerClass="w-full"
                                                    inputClass="!w-full !bg-gray-100 !cursor-not-allowed"
                                                    buttonClass="!bg-gray-50 dark:!bg-gray-600 !cursor-not-allowed"
                                                    dropdownClass="!bg-white dark:!bg-gray-700"
                                                    countryCodeEditable={false}
                                                    disableDropdown
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

                                            {canViewFilterProductPassword && (
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-base font-medium" htmlFor="filter-product-password">
                                                        Filter Product Password
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            id="filter-product-password"
                                                            type={showFilterPassword ? "text" : "password"}
                                                            placeholder="Enter Filter Product Password"
                                                            className="outline-none py-2 px-3 pr-10 rounded border border-gray-500/40 w-full"
                                                            value={user.filter_product_password || ""}
                                                            onChange={(e) => setUser({ ...user, filter_product_password: e.target.value })}
                                                        />
                                                        <button
                                                            type="button"
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                            onClick={() => setShowFilterPassword(!showFilterPassword)}
                                                        >
                                                            {showFilterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </>
                                )}


                                {activeProfileSection === "business-locations" && (
                                    <>
                                        <h2 id="business-profile-section" className="scroll-mt-24 text-sm font-semibold mt-5">Business Profile (Stock List Title)</h2>

                                        <div className="w-full h-0.5 bg-gray-300 mt-2"></div>

                                        <h2 className="text-sm font-semibold mt-5">Business Locations</h2>

                                        <div className="mt-4">
                                            <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                                <div className="p-4">

                                                    {rows.map((row, index) => (
                                                        <div key={index}>
                                                            <h2 className="text-sm font-semibold border-b border-gray-200 pb-2 mt-2">{index + 1}. Office/Shop/Outlet </h2>
                                                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 p-4 bg-white rounded-lg shadow w-full mx-auto mt-2">
                                                                {/* Name Input */}
                                                                <input
                                                                    type="text"
                                                                    placeholder="Name"
                                                                    className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    value={row?.name || ""}
                                                                    onChange={e => handleChange(index, 'name', e.target.value)}
                                                                />

                                                                {/* Address Input */}
                                                                <input
                                                                    type="text"
                                                                    placeholder="Address"
                                                                    className="w-full md:flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    value={row?.address || ""}
                                                                    onChange={e => handleChange(index, 'address', e.target.value)}
                                                                />

                                                                {/* Stock Checkbox and Remove Button Container */}
                                                                <div className="flex items-center justify-between md:justify-start gap-2">
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

                                                                    {/* Quotation Checkbox */}
                                                                    {/* <div className="flex items-center gap-2 ml-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            id={`quotation-${index}`}
                                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                            checked={row?.quotation || false}
                                                                            onChange={e => handleChange(index, 'quotation', e.target.checked)}
                                                                        />
                                                                        <label htmlFor={`quotation-${index}`} className="text-sm text-gray-700 whitespace-nowrap">
                                                                            Show in Quotation
                                                                        </label>
                                                                    </div> */}

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
                                    </>
                                )}

                                {/* First Row: Email, Phone, Facebook */}
                                {/* Additional Email Section */}
                                {activeProfileSection === "additional-email" && (
                                    <>
                                        <div className="w-full lg:w-[60%]">
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
                                    </>
                                )}

                                {activeProfileSection === "additional-phone" && (
                                    <>
                                        {/* Additional Phone Section */}
                                        <div className="w-full">
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
                                    </>
                                )}

                                {activeProfileSection === "facebook-links" && (
                                    <>
                                        {/* Additional Facebook Section */}
                                        <div className="w-full lg:w-[60%]">
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
                                    </>
                                )}

                                {/* Second Row: Youtube, Google Drive */}
                                {activeProfileSection === "youtube-links" && (
                                    <>
                                        {/* Additional Youtube Section */}
                                        <div className="w-full lg:w-[60%]">
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
                                    </>
                                )}

                                {activeProfileSection === "google-drive-links" && (
                                    <>
                                        {/* Additional Google Drive Section */}
                                        <div className="w-full lg:w-[60%]">
                                            <h2 className="text-sm font-semibold mt-5">Google Drive</h2>
                                            <div className="mt-4">
                                                <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                                    <div className="p-4">
                                                        <p className="text-xs text-gray-500 mb-2">You can add a maximum of 4 google drive links.</p>
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {googleDrives.map((googleDrive, index) => (
                                                                <div key={index} className="flex items-center gap-2">
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Enter google drive link"
                                                                        value={googleDrive || ""}
                                                                        onChange={(e) => handleGoogleDriveChange(index, e.target.value)}
                                                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                    />
                                                                    {googleDrives.length > 1 && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => handleRemoveGoogleDrive(index)}
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
                                                                onClick={handleAddGoogleDrive}
                                                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                            >
                                                                <Plus className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeProfileSection === "bank-accounts" && (
                                    <>
                                        {/* Bank Account Section */}
                                        <div className="w-full lg:w-full">
                                            <h2 id="bank-account-information-section" className="scroll-mt-24 text-sm font-semibold mt-5">Bank Account Information</h2>
                                            <div className="mt-4">
                                                <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                                    <div className="p-4">
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {bankAccounts.map((bank, index) => (
                                                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                                    <h3 className="text-sm font-semibold mb-3 text-gray-700">Bank Account {index + 1}</h3>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Bank Name"
                                                                            value={bank.ac_bank || ""}
                                                                            onChange={(e) => handleBankAccountChange(index, 'ac_bank', e.target.value)}
                                                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Account Number"
                                                                            value={bank.ac_num || ""}
                                                                            onChange={(e) => handleBankAccountChange(index, 'ac_num', e.target.value)}
                                                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Account Name"
                                                                            value={bank.ac_name || ""}
                                                                            onChange={(e) => handleBankAccountChange(index, 'ac_name', e.target.value)}
                                                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Branch Name"
                                                                            value={bank.ac_branch || ""}
                                                                            onChange={(e) => handleBankAccountChange(index, 'ac_branch', e.target.value)}
                                                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="Routing Number"
                                                                            value={bank.ac_routing || ""}
                                                                            onChange={(e) => handleBankAccountChange(index, 'ac_routing', e.target.value)}
                                                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                        <input
                                                                            type="text"
                                                                            placeholder="SWIFT Code"
                                                                            value={bank.ac_swift || ""}
                                                                            onChange={(e) => handleBankAccountChange(index, 'ac_swift', e.target.value)}
                                                                            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                        />
                                                                    </div>
                                                                    {/* Show in Stock List & Quotation Checkbox */}
                                                                    <div className="flex items-center gap-4 mt-3">
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                id={`bank-stock-${index}`}
                                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                                checked={bank?.stock || false}
                                                                                onChange={(e) => handleBankAccountChange(index, 'stock', e.target.checked)}
                                                                            />
                                                                            <label htmlFor={`bank-stock-${index}`} className="text-sm text-gray-700">
                                                                                Show in Stock List
                                                                            </label>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <input
                                                                                type="checkbox"
                                                                                id={`bank-quotation-${index}`}
                                                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                                                checked={bank?.quot || false}
                                                                                onChange={(e) => handleBankAccountChange(index, 'quot', e.target.checked)}
                                                                            />
                                                                            <label htmlFor={`bank-quotation-${index}`} className="text-sm text-gray-700">
                                                                                Show in Quotation
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                    {bankAccounts.length > 1 && (
                                                                        <div className="mt-3 flex justify-end">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveBankAccount(index)}
                                                                                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                                                            >
                                                                                <Minus className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 flex items-center justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={handleAddBankAccount}
                                                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                            >
                                                                <Plus className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {activeProfileSection === "essential-documents" && (
                                    <>
                                        {/* Essential Documents Section */}
                                        <div className="w-full lg:w-full mt-4">
                                            <div className="mt-5 mb-3">
                                                <h2 id="essential-documents-section" className="scroll-mt-24 text-sm font-semibold">Essential Documents</h2>
                                            </div>
                                            <div className="mt-4">
                                                <div className="w-full bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                                                    <div className="p-4">
                                                        <div className="h-px bg-gray-200 mb-4" />
                                                        <div className="grid grid-cols-1 gap-4">
                                                            {upDocs.map((doc, index) => (
                                                                <div key={index} className="border border-gray-200 rounded-xl p-4 bg-slate-50">
                                                                    <h3 className="text-sm font-semibold mb-3 text-gray-800">Document {index + 1}</h3>
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                                                                        <div className="relative">
                                                                            <FileText className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                                                            <input
                                                                                type="text"
                                                                                placeholder="Document Name"
                                                                                value={doc?.name || ""}
                                                                                onChange={(e) => handleUpDocChange(index, "name", e.target.value)}
                                                                                className="w-full pl-9 pr-3 py-2.5 bg-white border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                            />
                                                                        </div>


                                                                        {/* comment box start */}

                                                                        <div className="flex flex-col gap-2">
                                                                            <label
                                                                                htmlFor={`up-doc-file-${index}`}
                                                                                className="w-full px-4 py-2.5 border border-blue-300 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-center gap-2 bg-white"
                                                                            >
                                                                                <Upload className="w-4 h-4" />
                                                                                Upload File
                                                                            </label>
                                                                            <input
                                                                                id={`up-doc-file-${index}`}
                                                                                type="file"
                                                                                onChange={(e) => handleUpDocFileChange(index, e.target.files?.[0])}
                                                                                className="hidden"
                                                                            />
                                                                            <p className="text-xs text-gray-500 truncate">
                                                                                {doc?.fileName || (doc?.fileUrl ? decodeURIComponent(String(doc.fileUrl).split('/').pop()) : "No file selected")}
                                                                            </p>
                                                                            {(doc?.file || doc?.fileUrl) && (
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={() => handlePreviewUpDoc(doc)}
                                                                                    className="w-fit text-xs text-blue-700 hover:text-blue-800 font-semibold inline-flex items-center gap-1"
                                                                                >
                                                                                    <ExternalLink className="w-3.5 h-3.5" />
                                                                                    View Document
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {upDocs.length > 1 && (
                                                                        <div className="mt-3 flex justify-end">
                                                                            <button
                                                                                type="button"
                                                                                onClick={() => handleRemoveUpDoc(index)}
                                                                                className="w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                                                            >
                                                                                <Minus className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <div className="mt-4 flex items-center justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={handleAddUpDoc}
                                                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                                                title="Add Document"
                                                            >
                                                                <Plus className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}

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

                            </div>
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
