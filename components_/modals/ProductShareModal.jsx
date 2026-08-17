import React, { useMemo, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Info } from 'lucide-react';
import { usePathname, useRouter } from "next/navigation";

import CopyInput from '../CopyInput'
import PriceSelectModal from './PriceSelectModal'
import VehicleStockListModal from './VehicleStockListModal'
import BankAccountSelectModal from './BankAccountSelectModal'
import OutletLocationSelectModal from './OutletLocationSelectModal'
import ProfileShareModal from './ProfileShareModal'
import BusinessCardEditModal from './BusinessCardEditModal'
import { formatPermissions, formatPrice } from '@/helpers/functions'
import { useAppContext } from '@/context/AppContext';
import { hasPermission } from '@/lib/utils';

const cleanShareValue = (value) => {
    if (value === null || value === undefined) return "";

    const stringValue = String(value).trim();
    if (!stringValue || stringValue.toLowerCase() === "null") return "";

    return stringValue;
};

const formatPhoneForShare = (value) => {
    const phoneValue = cleanShareValue(value);
    if (!phoneValue) return "";
    if (phoneValue.startsWith("+")) return phoneValue;
    if (phoneValue.startsWith("880")) return `+${phoneValue}`;
    if (/^\d+$/.test(phoneValue)) return `+880${phoneValue}`;
    return phoneValue;
};

const extractProductDocUrl = (doc) => cleanShareValue(
    typeof doc === "string"
        ? doc
        : doc?.doc?.secure_url || doc?.doc?.url || doc?.secure_url || doc?.url
);

const extractProductDocName = (doc, docUrl, index) => {
    const explicitName = cleanShareValue(
        typeof doc === "string" ? "" : doc?.name || doc?.title
    );
    if (explicitName) return explicitName;

    const publicId = cleanShareValue(
        typeof doc === "string" ? "" : doc?.doc?.public_id || doc?.public_id
    );
    if (publicId) {
        const parts = publicId.split("/");
        return parts[parts.length - 1];
    }

    if (docUrl) {
        try {
            const pathName = new URL(docUrl).pathname;
            const lastSegment = decodeURIComponent(pathName.split("/").pop() || "");
            if (lastSegment) return lastSegment;
        } catch (error) {
            const lastSegment = decodeURIComponent(String(docUrl).split("/").pop() || "");
            if (lastSegment) return lastSegment;
        }
    }

    return `document-${index + 1}`;
};

const inferExtensionFromMimeType = (mimeType) => {
    switch (mimeType) {
        case "application/pdf":
            return ".pdf";
        case "image/jpeg":
            return ".jpg";
        case "image/png":
            return ".png";
        case "image/webp":
            return ".webp";
        default:
            return "";
    }
};

const ensureFileNameHasExtension = (fileName, mimeType) => {
    const cleanedName = cleanShareValue(fileName) || "document";
    if (/\.[a-z0-9]+$/i.test(cleanedName)) return cleanedName;

    const extension = inferExtensionFromMimeType(mimeType);
    return `${cleanedName}${extension}`;
};

const fetchShareImageBlob = async (imageUrl) => {
    const sourceUrl = cleanShareValue(imageUrl);

    if (!sourceUrl) {
        throw new Error("Image URL is missing");
    }

    const fetchBlob = async (requestUrl) => {
        const response = await fetch(requestUrl);
        if (!response.ok) {
            throw new Error(`Image request failed (${response.status})`);
        }

        const blob = await response.blob();
        if (!blob.size) {
            throw new Error("Image file is empty");
        }

        return blob;
    };

    try {
        return await fetchBlob(sourceUrl);
    } catch (error) {
        return fetchBlob(`/api/proxy-image?url=${encodeURIComponent(sourceUrl)}`);
    }
};

const normalizeShareList = (value) => {
    if (value === undefined || value === null) {
        return [];
    }

    let rawItems = [];

    if (Array.isArray(value)) {
        rawItems = value;
    } else if (typeof value === "string") {
        const trimmedValue = value.trim();

        if (!trimmedValue) {
            rawItems = [];
        } else {
            try {
                const parsedValue = JSON.parse(trimmedValue);
                rawItems = Array.isArray(parsedValue) ? parsedValue : [parsedValue];
            } catch (error) {
                rawItems = trimmedValue.includes(",") ? trimmedValue.split(",") : [trimmedValue];
            }
        }
    } else if (typeof value === "object") {
        rawItems = Object.values(value);
    } else {
        rawItems = [value];
    }

    return rawItems
        .map((item) => {
            if (item === undefined || item === null) return "";

            if (typeof item === "object") {
                return cleanShareValue(
                    item.value ??
                    item.email ??
                    item.phone ??
                    item.url ??
                    item.website ??
                    item.name ??
                    item.label ??
                    ""
                );
            }

            return cleanShareValue(item);
        })
        .filter(Boolean);
};

const getShareListFromSource = (source, keys) => {
    for (const key of keys) {
        const values = normalizeShareList(source?.[key]);
        if (values.length > 0) {
            return values;
        }
    }

    return [];
};

const SHARE_OPTION_INFO = {
    featureAndSpecification: {
        title: 'Copy - Share Image - Paste Text',
        description: 'প্রোডাক্টের ছবি এবং বিস্তারিত তথ্য কপি হয়ে যাবে। কাস্টমারের ইনবক্সে গিয়ে প্রথমে ছবি পেস্ট করুন। তারপর টেক্সট বক্সে তথ্য পেস্ট করুন। ছবি ও তথ্য এক ক্লিকে চলে যাবে।',
    },
    copyAllTextWithPriceLink: {
        title: 'Copy All Text (With Price & Link)',
        description: 'প্রোডাক্টের দাম এবং সরাসরি দেখার লিংকসহ সব টেক্সট একসাথে কপি করার জন্য এটি ব্যবহার করুন। লিংক থেকে কাস্টমার ছবি ডাউনলোড করতে পারবে এবং তথ্য কপি করতে পারবে।',
    },
    allImages: {
        title: 'All Image',
        description: 'প্রোডাক্টের সবকটি ছবি একসাথে ডাউনলোড বা শেয়ার করার জন্য এই অপশনটি সিলেক্ট করুন।',
    },
    detailsWithPrice: {
        title: 'Details with Price',
        description: 'শুধুমাত্র প্রোডাক্টের টেকনিক্যাল তথ্য এবং দাম শেয়ার করতে এটি ব্যবহার করুন।',
    },
    detailsWithoutPrice: {
        title: 'Details without Price',
        description: 'যদি কাস্টমারকে দাম না জানিয়ে শুধু প্রোডাক্টের স্পেসিফিকেশন বা তথ্য পাঠাতে চান, তবে এটি বেছে নিন।',
    },
    oneImageShortDetails: {
        title: 'One Image, Short Details, Link',
        description: 'কাস্টমারকে সংক্ষেপে ধারণা দেওয়ার জন্য একটি মূল ছবি, অল্প কিছু তথ্য এবং অ্যাপের লিংক পাঠানোর সেরা মাধ্যম।',
    },
    priceLinkDetailsImage: {
        title: 'Price, Link, Details, Image',
        description: 'এটি একটি কমপ্লিট প্যাকেজ। কাস্টমার একসাথেই দাম, ছবি, লিংক এবং বিস্তারিত সব তথ্য পেয়ে যাবেন।',
    },
    priceLinkDetails: {
        title: 'Price, Link, Details',
        description: 'ছবি ছাড়া শুধুমাত্র দাম, বিস্তারিত তথ্য এবং লিংক পাঠানোর জন্য এই অপশনটি কার্যকর।',
    },
    shareLocation: {
        title: 'Share Outlet Location',
        description: 'আপনার শোরুম বা আউটলেটটি ঠিক কোথায় অবস্থিত, তার গুগল ম্যাপ লোকেশন কাস্টমারকে পাঠাতে এটি ব্যবহার করুন।',
    },
    sendMyProfile: {
        title: 'Send My Profile',
        description: 'আপনার ব্যক্তিগত পেশাদার প্রোফাইল বা ভিজিটিং কার্ড কাস্টমারের সাথে শেয়ার করুন।',
    },
    sendBusinessProfile: {
        title: 'Send Business Profile',
        description: 'আপনার পুরো প্রতিষ্ঠানের তথ্য, লোগো এবং কাজের বিবরণ কাস্টমারকে একবারে পাঠানোর জন্য এটি ব্যবহার করুন।',
    },
    sendBankAccount: {
        title: 'Send Bank Information',
        description: 'লেনদেনের সুবিধার্থে আপনার প্রতিষ্ঠানের ব্যাংক একাউন্ট ডিটেইলস সরাসরি কাস্টমারকে পাঠিয়ে দিন।',
    },
    stockList: {
        title: 'Stock List',
        description: 'আপনার কাছে বর্তমানে কী কী প্রোডাক্ট স্টকে আছে, তার একটি পূর্ণাঙ্গ তালিকা এক ক্লিকেই তৈরি করে শেয়ার করুন। কাস্টমার উক্ত স্টক লিস্ট থেকে আপনার প্রতিটি গাড়ির ছবি, তথ্য, মূল্য তালিকা এবং আরও অনেক কিছু আপনাকে ফোন না করে জানতে পারবে।',
    },
    sendBusinessCard: {
        title: 'Send Business Card',
        description: 'আপনার প্রতিষ্ঠানের সংক্ষিপ্ত বিজনেস কার্ড বা পরিচিতিমূলক কার্ড কাস্টমারের কাছে পাঠাতে এটি ব্যবহার করুন।',
    },
    profileShare: {
        title: 'Send Essential Documents',
        description: 'আপনার প্রয়োজনীয় ব্যক্তিগত বা পেশাগত ডকুমেন্ট একসাথে কাস্টমারের কাছে শেয়ার করতে এই অপশনটি ব্যবহার করুন।',
    },
    productShareDocuments: {
        title: 'Send Product Documents/Auction Sheet/Brochure',
        description: 'এই প্রোডাক্টের সাথে সম্পর্কিত ডকুমেন্ট, অকশন শিট বা ব্রোশার কাস্টমারের কাছে পাঠাতে এটি ব্যবহার করুন।',
    },
};

const SHARE_INFO_SECTIONS = [
    {
        title: 'SEND FOR BUSINESS PURPOSE (ব্যবসায়িক প্রয়োজনে)',
        items: ['featureAndSpecification', 'copyAllTextWithPriceLink', 'allImages', 'detailsWithPrice', 'detailsWithoutPrice'],
    },
    {
        title: 'SEND FOR DIRECT CUSTOMER (সরাসরি কাস্টমারের জন্য)',
        items: [
            'oneImageShortDetails',
            'priceLinkDetailsImage',
            'priceLinkDetails',
            'shareLocation',
            'sendMyProfile',
            'sendBusinessProfile',
            'sendBankAccount',
            'stockList',
            'sendBusinessCard',
            'profileShare',
            'productShareDocuments',
        ],
    },
];


const ProductShareModal = ({ open, setOpen, product }) => {

    const pathname = usePathname();
    const router = useRouter();
    const { selectedCompanyShop, user: appUser } = useAppContext();
    const user = useMemo(() => {
        if (!appUser) return null;
        if (typeof appUser === "string") {
            try {
                return JSON.parse(appUser);
            } catch (error) {
                console.error("Failed to parse app user in ProductShareModal:", error);
                return null;
            }
        }
        return appUser;
    }, [appUser]);


    // console.log("product in share modal User:::::", selectedCompanyShop);


    const formattedPermissions = formatPermissions(user?.permissions);

    // console.log("formattedPermissions===================", formattedPermissions);
    // ShareBankInformation


    let companyShopId = selectedCompanyShop?.shop?.s_id;

    let priceAction = "StockList";
    let action = "Vehicle";

    const hasPermissionStockList = companyShopId
        ? formattedPermissions.some(
            permission =>
                permission.shopId === companyShopId &&
                (permission.section === "Vehicle" || permission.section === "*") &&
                (permission.action === priceAction || permission.action === "*")
        )
        : false;

    let shareBankInformationAction = "ShareBankInformation";


    const hasPermissionShareBankInformation = companyShopId
        ? formattedPermissions.some(
            permission =>
                permission.shopId === companyShopId &&
                (permission.section === "Vehicle" || permission.section === "*") &&
                (permission.action === shareBankInformationAction || permission.action === "*")
        )
        : false;


    let shareOutletLocationAction = "ShareOutletLocation";

    const hasPermissionShareOutletLocation = companyShopId
        ? formattedPermissions.some(
            permission =>
                permission.shopId === companyShopId &&
                (permission.section === "Vehicle" || permission.section === "*") &&
                (permission.action === shareOutletLocationAction || permission.action === "*")
        )
        : false;
    // console.log("-------------------------------------");
    // console.log("model user pathname 75", pathname);
    // console.log("selectedCompanyShop", selectedCompanyShop?.shop?.s_id);
    // console.log("Formatted Permissions:", formattedPermissions);


    // ---------- Custom Helper ----------
    let isMyShop = pathname.includes("my-shop");
    let isCompanyShop = pathname.includes("company-shop");
    let isStock = pathname.includes("pb-home") || pathname == "/";
    const hasPermissionShowSendBusinessProfileButton =
        isCompanyShop &&
        hasPermission(
            formattedPermissions,
            Number(companyShopId),
            "Vehicle",
            "ShowSendBusinessProfileShareButton"
        );
    const hasPermissionShowSendProductDocumentsShareButton =
        isCompanyShop &&
        hasPermission(
            formattedPermissions,
            Number(companyShopId),
            "Vehicle",
            "ShowSendProductDocumentsShareButton"
        );
    const hasPermissionShowSelectPriceDialog =
        isCompanyShop &&
        hasPermission(
            formattedPermissions,
            Number(companyShopId),
            "Vehicle",
            "ShowSelectPriceDialog"
        );
    const shouldUseUserPrice = pathname === '/my-shop/' || pathname === '/company-shop/';
    const shouldOpenPriceSelectModal =
        Boolean(user) && !isStock && (!isCompanyShop || hasPermissionShowSelectPriceDialog);

    const getShareDisplayPrice = () => {
        const rawPrice = shouldUseUserPrice
            ? product?.vehicle_price?.user_price
            : product?.vehicle_price?.pbl_price;
        const formattedPrice = formatPrice(rawPrice);
        const currency = cleanShareValue(product?.vehicle_db_price?.vp_currency);

        if (!formattedPrice) return "";
        if (formattedPrice === 'Call for Price') return formattedPrice;

        return currency ? `${currency}. ${formattedPrice}` : String(formattedPrice);
    };

    const domain = 'https://click4details.app';
    // const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://click4details.app';


    const url = isMyShop || isCompanyShop
        ? `${domain}/product/my-shop/${product?.v_id}`
        : `${domain}/product/${product?.v_id}`;

    // const url = `${domain}/product/${product?.v_slug}`;

    // State to track selected option (kon option select hoise seta track korbe)
    const [selectedBusinessOption, setSelectedBusinessOption] = useState('');

    // State for price select modal
    const [priceModalOpen, setPriceModalOpen] = useState(false);
    const [priceModalType, setPriceModalType] = useState(''); // 'withPrice' or 'withoutPrice'

    // State for vehicle stock list modal
    const [stockListModalOpen, setStockListModalOpen] = useState(false);

    // State for bank account select modal
    const [bankAccountModalOpen, setBankAccountModalOpen] = useState(false);
    const [locationModalOpen, setLocationModalOpen] = useState(false);
    const [profileShareModalOpen, setProfileShareModalOpen] = useState(false);
    const [businessCardModalOpen, setBusinessCardModalOpen] = useState(false);
    const [infoDialogOpen, setInfoDialogOpen] = useState(false);
    const [activeInfoKey, setActiveInfoKey] = useState('overview');

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
    };

    const handleProfileEditClick = (e) => {
        e.stopPropagation();
        setOpen(false);
        setProfileShareModalOpen(false);
        router.push('/profile');
    };

    const handleBusinessProfileClick = (e) => {
        e.stopPropagation();
        setSelectedBusinessOption('sendBusinessProfile');
        setOpen(false);
        setProfileShareModalOpen(false);
        router.push('/profile#business-profile-section');
    };

    const handleBusinessCardEditClick = (e) => {
        e.stopPropagation();
        setBusinessCardModalOpen(true);
    };

    const openInfoDialog = (infoKey = 'overview') => {
        setActiveInfoKey(infoKey);
        setInfoDialogOpen(true);
    };

    const activeShareInfo = activeInfoKey === 'overview' ? null : SHARE_OPTION_INFO[activeInfoKey];

    const renderInfoButton = (infoKey) => (
        <button
            type='button'
            className='shrink-0 rounded-full border border-sky-500 p-1 text-sky-600 transition hover:bg-sky-50'
            onClick={(e) => {
                e.stopPropagation();
                openInfoDialog(infoKey);
            }}
            aria-label={`Show info for ${SHARE_OPTION_INFO[infoKey]?.title || 'this option'}`}
        >
            <Info className='h-4 w-4' />
        </button>
    );

    const getProductShareImageUrls = () => (
        [
            extractProductDocUrl(product?.vehicle_front_image),
            ...(Array.isArray(product?.vehicle_images)
                ? product.vehicle_images.map((image) => extractProductDocUrl(image))
                : []),
        ].filter((imageUrl, index, array) => imageUrl && array.indexOf(imageUrl) === index)
    );

    const buildFeatureAndSpecificationMessage = () => {
        let featureMessage = `*${product?.v_title || product?.v_title}*\n\n`;
        featureMessage += `Features & Specifications:\n`;

        if (product?.feature_specification?.length > 0) {
            const featureText = product.feature_specification
                .map((feature) => {
                    if (!feature?.specification?.length) {
                        return null;
                    }

                    const selectedItems = feature.specification
                        .filter((item) => item.is_selected)
                        .map((item) => item.fs_title);

                    const specificationTitles =
                        selectedItems.length > 0
                            ? selectedItems
                            : feature.specification
                                .map((item) => item.fs_title)
                                .filter(Boolean);

                    if (!specificationTitles.length) {
                        return null;
                    }

                    return `${feature.md_title}: ${specificationTitles.join(", ")}`;
                })
                .filter(Boolean)
                .join("\n");

            if (featureText) {
                featureMessage += `${featureText}\n`;
            } else {
                featureMessage += `No feature specification found.\n`;
            }
        } else {
            featureMessage += `No feature specification found.\n`;
        }

        featureMessage += `\n View & Download All Images and Copy Product Features form below Link:\n${url}`;

        return featureMessage;
    };

    const buildPriceLinkDetailsMessage = () => {
        const productName = product?.v_title || product?.v_title;
        const price = getShareDisplayPrice();

        let priceLinkDetailsMessage = `*${productName}*\n\n`;

        if (product?.v_brand_name) {
            priceLinkDetailsMessage += `Brand: ${product.v_brand_name}\n`;
        }
        if (product?.v_model_name) {
            priceLinkDetailsMessage += `Model: ${product.v_model_name}\n`;
        }
        if (product?.v_edition_name) {
            priceLinkDetailsMessage += `Package: ${product.v_edition_name}\n`;
        }
        if (product?.v_condition_name) {
            priceLinkDetailsMessage += `Condition: ${product.v_condition_name}\n`;
        }
        if (product?.v_mod_year) {
            priceLinkDetailsMessage += `Model Yr: ${product.v_mod_year}\n`;
        }
        if (product?.v_registration) {
            priceLinkDetailsMessage += `Reg Yr: ${product.v_registration}\n`;
        }
        if (product?.v_grade_name) {
            priceLinkDetailsMessage += `Grade: ${product.v_grade_name}\n`;
        }
        if (product?.v_ext_grade_name) {
            priceLinkDetailsMessage += `Exterior Grd: ${product.v_ext_grade_name}\n`;
        }
        if (product?.v_int_grade_name) {
            priceLinkDetailsMessage += `Interior Grd: ${product.v_int_grade_name}\n`;
        }
        if (product?.v_mileage) {
            priceLinkDetailsMessage += `Mileage: ${product.v_mileage} km\n`;
        }
        if (product?.v_color_name) {
            priceLinkDetailsMessage += `Color: ${product.v_color_name}\n`;
        }
        if (product?.v_fuel_name) {
            priceLinkDetailsMessage += `Fuel: ${product.v_fuel_name}\n`;
        }
        if (product?.v_transmission_name) {
            priceLinkDetailsMessage += `Option: ${product.v_transmission_name}\n`;
        }
        if (product?.v_capacity) {
            priceLinkDetailsMessage += `CC: ${product.v_capacity}\n`;
        }
        if (product?.v_skeleton_name) {
            priceLinkDetailsMessage += `Body: ${product.v_skeleton_name}\n`;
        }
        if (product?.v_seat_name) {
            priceLinkDetailsMessage += `Seat: ${product.v_seat_name}\n`;
        }
        if (product?.v_chassis && product.v_chassis !== 'null') {
            priceLinkDetailsMessage += `Chassis No: ${product.v_chassis}\n`;
        }
        if (product?.v_engine && product.v_engine !== 'null') {
            priceLinkDetailsMessage += `Engine No: ${product.v_engine}\n`;
        }
        if (product?.v_tax_token_exp_date) {
            priceLinkDetailsMessage += `Tax Token: ${product.v_tax_token_exp_date}\n`;
        }
        if (product?.v_fitness_exp_date) {
            priceLinkDetailsMessage += `Fitness: ${product.v_fitness_exp_date}\n`;
        }

        if (product?.feature_specification && product.feature_specification.length > 0) {
            priceLinkDetailsMessage += `\n Features:\n`;

            const featureText = product.feature_specification
                .map((feature) => {
                    if (
                        feature?.specification?.length > 0 &&
                        feature.specification.some((item) => item.is_selected)
                    ) {
                        const selectedItems = feature.specification
                            .filter((item) => item.is_selected)
                            .map((item) => item.fs_title)
                            .join(", ");

                        return `${feature.md_title}: ${selectedItems}`;
                    }
                    return null;
                })
                .filter(Boolean)
                .join("\n");

            if (featureText) {
                priceLinkDetailsMessage += featureText + '\n';
            }
        }

        if (price) {
            priceLinkDetailsMessage += `\n Price: ${price}\n`;
        }

        priceLinkDetailsMessage += `\n View & Download All Images and Copy Product Features form below Link:\n${url}`;

        return priceLinkDetailsMessage;
    };

    const buildVehicleDetailsMessage = ({ includePrice = false } = {}) => {
        const productName = product?.v_title || product?.v_title;
        const price = getShareDisplayPrice();

        let detailsMessage = `*${productName}*\n\n`;

        if (product?.v_brand_name) {
            detailsMessage += `Brand: ${product.v_brand_name}\n`;
        }
        if (product?.v_model_name) {
            detailsMessage += `Model: ${product.v_model_name}\n`;
        }
        if (product?.v_edition_name) {
            detailsMessage += `Package: ${product.v_edition_name}\n`;
        }
        if (product?.v_condition_name) {
            detailsMessage += `Condition: ${product.v_condition_name}\n`;
        }
        if (product?.v_mod_year) {
            detailsMessage += `Model Yr: ${product.v_mod_year}\n`;
        }
        if (product?.v_registration) {
            detailsMessage += `Reg Yr: ${product.v_registration}\n`;
        }
        if (product?.v_grade_name) {
            detailsMessage += `Grade: ${product.v_grade_name}\n`;
        }
        if (product?.v_ext_grade_name) {
            detailsMessage += `Exterior Grd: ${product.v_ext_grade_name}\n`;
        }
        if (product?.v_int_grade_name) {
            detailsMessage += `Interior Grd: ${product.v_int_grade_name}\n`;
        }
        if (product?.v_mileage) {
            detailsMessage += `Mileage: ${product.v_mileage} km\n`;
        }
        if (product?.v_color_name) {
            detailsMessage += `Color: ${product.v_color_name}\n`;
        }
        if (product?.v_fuel_name) {
            detailsMessage += `Fuel: ${product.v_fuel_name}\n`;
        }
        if (product?.v_transmission_name) {
            detailsMessage += `Option: ${product.v_transmission_name}\n`;
        }
        if (product?.v_capacity) {
            detailsMessage += `CC: ${product.v_capacity}\n`;
        }
        if (product?.v_skeleton_name) {
            detailsMessage += `Body: ${product.v_skeleton_name}\n`;
        }
        if (product?.v_seat_name) {
            detailsMessage += `Seat: ${product.v_seat_name}\n`;
        }
        if (product?.v_chassis && product.v_chassis !== 'null') {
            detailsMessage += `Chassis No: ${product.v_chassis}\n`;
        }
        if (product?.v_engine && product.v_engine !== 'null') {
            detailsMessage += `Engine No: ${product.v_engine}\n`;
        }
        if (product?.v_tax_token_exp_date) {
            detailsMessage += `Tax Token: ${product.v_tax_token_exp_date}\n`;
        }
        if (product?.v_fitness_exp_date) {
            detailsMessage += `Fitness: ${product.v_fitness_exp_date}\n`;
        }

        if (product?.feature_specification && product.feature_specification.length > 0) {
            detailsMessage += `\n Features:\n`;

            const featureText = product.feature_specification
                .map((feature) => {
                    if (
                        feature?.specification?.length > 0 &&
                        feature.specification.some((item) => item.is_selected)
                    ) {
                        const selectedItems = feature.specification
                            .filter((item) => item.is_selected)
                            .map((item) => item.fs_title)
                            .join(", ");

                        return `${feature.md_title}: ${selectedItems}`;
                    }
                    return null;
                })
                .filter(Boolean)
                .join("\n");

            if (featureText) {
                detailsMessage += featureText + '\n';
            }
        }

        if (includePrice && price) {
            detailsMessage += `\n Price: ${price}\n`;
        }

        detailsMessage += `\n View & Download All Images and Copy Product Features form below Link:\n${url}`;

        return detailsMessage;
    };

    const buildBusinessCardMessage = () => {
        const businessCardSource = selectedCompanyShop || {};
        const companyName = cleanShareValue(
            businessCardSource?.shop?.s_title ||
            businessCardSource?.up_company ||
            businessCardSource?.company_name ||
            businessCardSource?.name
        );

        const businessEmails = getShareListFromSource(businessCardSource, [
            'urp_com_email',
            'urp_com_emails',
            'com_email',
            'emails',
        ]);
        const businessPhones = getShareListFromSource(businessCardSource, [
            'urp_com_phone',
            'urp_com_phones',
            'com_phone',
            'phones',
        ]);
        const businessFacebooks = getShareListFromSource(businessCardSource, [
            'urp_com_facebook',
            'com_facebook',
            'facebook',
            'facebooks',
        ]);
        const businessYoutubes = getShareListFromSource(businessCardSource, [
            'urp_com_youtube',
            'com_youtube',
            'youtube',
            'youtubes',
        ]);
        const businessWebsites = getShareListFromSource(businessCardSource, [
            'urp_com_web',
            'urp_com_website',
            'com_web',
            'website',
            'web',
        ]);

        const sections = [];

        if (businessEmails.length > 0) {
            sections.push(`*Business Emails*:\n${businessEmails.map((email) => `- ${email}`).join("\n")}`);
        }

        if (businessPhones.length > 0) {
            sections.push(`*Business Phones*:\n${businessPhones.map((phone) => `- ${cleanShareValue(phone)}`).join("\n")}`);
        }

        if (businessFacebooks.length > 0) {
            sections.push(`*Business Facebooks*:\n${businessFacebooks.map((facebook) => `- ${facebook}`).join("\n")}`);
        }

        if (businessYoutubes.length > 0) {
            sections.push(`*Business YouTubes*:\n${businessYoutubes.map((youtube) => `- ${youtube}`).join("\n")}`);
        }

        if (businessWebsites.length > 0) {
            sections.push(`*Business Website*:\n${businessWebsites.map((website) => `- ${website}`).join("\n")}`);
        }

        let businessCardMessage = `Here is my Business Card:\n\n`;

        if (user?.name) {
            businessCardMessage += `Name: ${user.name}\n\n`;
        }

        businessCardMessage += `Company: ${companyName || "N/A"}`;

       

        if (sections.length > 0) {
            businessCardMessage += `\n\n${sections.join("\n\n")}`;
        }

        return businessCardMessage;
    };

    const buildAllImagesFallbackMessage = () => {
        const imageUrls = getProductShareImageUrls();

        let imageMessage = `*${product?.v_title || product?.v_title}*\n\n`;

        if (imageUrls.length > 0) {
            imageMessage += `All Images:\n\n`;
            imageUrls.forEach((imageUrl, index) => {
                imageMessage += `${index + 1}. ${imageUrl}\n\n`;
            });
        } else {
            imageMessage += `No images found.\n\n`;
        }

        imageMessage += `Product Link:\n${url}`;
        return imageMessage;
    };

    const shareProductImagesWithFallback = async (
        shareMessage,
        fallbackMessage = shareMessage,
        imageUrls = getProductShareImageUrls(),
        allowFilesOnlyShare = true
    ) => {
        const canUseWebShare =
            typeof navigator !== "undefined" &&
            typeof navigator.share === "function" &&
            typeof navigator.canShare === "function";

        if (imageUrls.length > 0 && canUseWebShare) {
            try {
                const shareableFiles = await Promise.all(
                    imageUrls.map(async (imageUrl, index) => {
                        try {
                            const blob = await fetchShareImageBlob(imageUrl);
                            const fileName = ensureFileNameHasExtension(
                                extractProductDocName(imageUrl, imageUrl, index),
                                blob.type || "image/jpeg"
                            );

                            return new File([blob], fileName, {
                                type: blob.type || "image/jpeg",
                            });
                        } catch (error) {
                            console.error(`Share image ${index + 1} load error:`, error);
                            return null;
                        }
                    })
                );

                const validFiles = shareableFiles.filter((file) => file?.type?.startsWith("image/"));

                if (validFiles.length > 0) {
                    const shareData = {
                        title: product?.v_title || product?.v_title,
                        text: shareMessage,
                        files: validFiles,
                    };

                    if (navigator.canShare(shareData)) {
                        await navigator.share(shareData);
                        return true;
                    }

                    const filesOnlyShareData = { files: validFiles };
                    if (allowFilesOnlyShare && navigator.canShare(filesOnlyShareData)) {
                        await navigator.share(filesOnlyShareData);
                        return true;
                    }
                }
            } catch (shareError) {
                console.log("Product image share failed:", shareError?.message || shareError);
            }
        }

        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fallbackMessage)}`;
        window.open(whatsappUrl, '_blank');
        return false;
    };

    const shareProductFirstImageWithFallback = async (shareMessage, fallbackMessage = shareMessage) => {
        const firstImageUrl = getProductShareImageUrls()[0];
        const imageUrls = firstImageUrl ? [firstImageUrl] : [];

        return shareProductImagesWithFallback(shareMessage, fallbackMessage, imageUrls, false);
    };
    // console.log("isStock 109", isStock);

    // Function to handle price selection and share
    const handlePriceShare = async (priceData) => {
        if (priceModalType === 'allImages') {
            await handleBusinessShare('allImages');
            return;
        }
        if (priceModalType === 'details') {
            await handleBusinessShare('details');
            return;
        }
        if (priceModalType === 'oneImageShortDetails') {
            await handleBusinessShare('oneImageShortDetails');
            return;
        }
        if (priceModalType === 'priceLinkDetailsImage') {
            await handleBusinessShare('priceLinkDetailsImage');
            return;
        }
        if (priceModalType === 'priceLinkDetails') {
            await handleBusinessShare('priceLinkDetails');
            return;
        }
        if (priceModalType === 'featureAndSpecification') {
            setSelectedBusinessOption('featureAndSpecification');
            await shareProductImagesWithFallback(buildFeatureAndSpecificationMessage());
            return;
        }

        // Build message based on priceModalType
        const productName = product?.v_title || product?.v_title;

        let message = `*${productName}*\n\n`;

        // Add vehicle details
        if (product?.v_brand_name) {
            message += `Brand: ${product.v_brand_name}\n`;
        }
        if (product?.v_model_name) {
            message += `Model: ${product.v_model_name}\n`;
        }
        if (product?.v_edition_name) {
            message += `Package: ${product.v_edition_name}\n`;
        }
        if (product?.v_condition_name) {
            message += `Condition: ${product.v_condition_name}\n`;
        }
        if (product?.v_mod_year) {
            message += `Model Yr: ${product.v_mod_year}\n`;
        }
        if (product?.v_registration) {
            message += `Reg Yr: ${product.v_registration}\n`;
        }
        if (product?.v_grade_name) {
            message += `Grade: ${product.v_grade_name}\n`;
        }
        if (product?.v_ext_grade_name) {
            message += `Exterior Grd: ${product.v_ext_grade_name}\n`;
        }
        if (product?.v_int_grade_name) {
            message += `Interior Grd: ${product.v_int_grade_name}\n`;
        }
        if (product?.v_mileage) {
            message += `Mileage: ${product.v_mileage} km\n`;
        }
        if (product?.v_color_name) {
            message += `Color: ${product.v_color_name}\n`;
        }
        if (product?.v_fuel_name) {
            message += `Fuel: ${product.v_fuel_name}\n`;
        }
        if (product?.v_transmission_name) {
            message += `Option: ${product.v_transmission_name}\n`;
        }
        if (product?.v_capacity) {
            message += `CC: ${product.v_capacity}\n`;
        }
        if (product?.v_skeleton_name) {
            message += `Body: ${product.v_skeleton_name}\n`;
        }
        if (product?.v_seat_name) {
            message += `Seat: ${product.v_seat_name}\n`;
        }
        if (product?.v_chassis && product.v_chassis !== 'null') {
            message += `Chassis No: ${product.v_chassis}\n`;
        }
        if (product?.v_engine && product.v_engine !== 'null') {
            message += `Engine No: ${product.v_engine}\n`;
        }
        if (product?.v_tax_token_exp_date) {
            message += `Tax Token: ${product.v_tax_token_exp_date}\n`;
        }
        if (product?.v_fitness_exp_date) {
            message += `Fitness: ${product.v_fitness_exp_date}\n`;
        }

        // Feature Specifications
        if (product?.feature_specification && product.feature_specification.length > 0) {
            message += `\n📋 Features:\n`;

            const featureText = product.feature_specification
                .map((feature) => {
                    if (
                        feature?.specification?.length > 0 &&
                        feature.specification.some((item) => item.is_selected)
                    ) {
                        const selectedItems = feature.specification
                            .filter((item) => item.is_selected)
                            .map((item) => item.fs_title)
                            .join(", ");

                        return `${feature.md_title}: ${selectedItems}`;
                    }
                    return null;
                })
                .filter(Boolean)
                .join("\n");

            if (featureText) {
                message += featureText + '\n';
            }
        }

        // Add price if 'withPrice' type
        if (priceModalType === 'withPrice' && priceData.value) {
            message += `\n💰 `;
            if (priceData.type === 'asking') {
                message += `Asking Price: ${priceData.value} BDT\n`;
            } else if (priceData.type === 'fixed') {
                message += `Fixed Price: ${priceData.value} BDT\n`;
            } else if (priceData.type === 'variable') {
                message += `Variable Price: ${priceData.value} BDT\n`;
            }
        }

        // Add urgent sale note if selected
        if (priceData.urgentSale) {
            message += `\n🔥 Urgent Sale!\n`;
        }

        // Product Link
        // message += `\n🔗 View & Download All Images and Copy Product Features form below Link:\n${url}`;

        // Mark the option as selected
        setSelectedBusinessOption(
            priceModalType === 'withPrice'
                ? 'detailsWithPrice'
                : priceModalType === 'allImages'
                    ? 'allImages'
                    : priceModalType === 'details'
                        ? 'details'
                        : priceModalType === 'oneImageShortDetails'
                            ? 'oneImageShortDetails'
                            : priceModalType === 'priceLinkDetailsImage'
                                ? 'priceLinkDetailsImage'
                                : priceModalType === 'withoutPrice'
                                    ? 'detailsWithoutPrice'
                                    : 'featureAndSpecification'
        );

        if (priceModalType === 'withPrice' || priceModalType === 'withoutPrice') {
            await shareProductFirstImageWithFallback(message);
            return;
        }

        // WhatsApp open korbe message niye
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };




    // WhatsApp e share korar function
    const handleBusinessShare = async (option) => {
        // Option select kora holo
        setSelectedBusinessOption(option);

        const productName = product?.v_title || product?.v_title;
        const price = getShareDisplayPrice();

        const details = product?.v_description || product?.p_description || '';

        if (option === 'productShareDocuments') {
            const productDocs = Array.isArray(product?.v_docs) ? product.v_docs : [];
            const validDocs = productDocs
                .map((doc, index) => {
                    const docUrl = extractProductDocUrl(doc);
                    if (!docUrl) return null;

                    return {
                        id: `product-doc-${index}`,
                        name: extractProductDocName(doc, docUrl, index),
                        url: docUrl,
                    };
                })
                .filter(Boolean);

            if (validDocs.length > 0) {
                const canUseWebShare =
                    typeof navigator !== "undefined" &&
                    typeof navigator.share === "function" &&
                    typeof navigator.canShare === "function";

                if (canUseWebShare) {
                    try {
                        const shareableFiles = await Promise.all(
                            validDocs.map(async (doc, index) => {
                                try {
                                    const response = await fetch(doc.url);
                                    if (!response.ok) {
                                        throw new Error(`Failed to fetch document ${index + 1}`);
                                    }

                                    const blob = await response.blob();
                                    const fileName = ensureFileNameHasExtension(doc.name, blob.type);

                                    return new File([blob], fileName, {
                                        type: blob.type || "application/octet-stream",
                                    });
                                } catch (error) {
                                    console.error(`Document ${index + 1} load error:`, error);
                                    return null;
                                }
                            })
                        );

                        const validFiles = shareableFiles.filter(Boolean);

                        if (validFiles.length > 0) {
                            const shareData = {
                                title: productName,
                                text: `${productName}\n\n${url}`,
                                files: validFiles,
                            };

                            if (navigator.canShare(shareData)) {
                                await navigator.share(shareData);
                                return;
                            }
                        }
                    } catch (shareError) {
                        console.log("Product documents share failed:", shareError?.message || shareError);
                    }
                }
            }

            let productDocsMessage = `*${productName}*\n\n`;

            if (validDocs.length > 0) {
                productDocsMessage += `Product Documents:\n\n`;
                validDocs.forEach((doc, index) => {
                    productDocsMessage += `${index + 1}. ${doc.name}: ${doc.url}\n\n`;
                });
            } else {
                productDocsMessage += `No product documents found.\n\n`;
            }

            productDocsMessage += `Product Link:\n${url}`;

            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(productDocsMessage)}`;
            window.open(whatsappUrl, '_blank');
            return;
        }

        // All Images option er jonno special handling - Image files share korbe
        if (option === 'allImages') {
            await shareProductImagesWithFallback(
                `${productName}\n\nProduct Link:\n${url}`,
                buildAllImagesFallbackMessage()
            );
            return;
        }
        // featureAndSpecification
        if (option === 'featureAndSpecification') {
            const featureMessage = buildFeatureAndSpecificationMessage();

            if (!shouldOpenPriceSelectModal) {
                await shareProductImagesWithFallback(featureMessage);
                return;
            }

            setPriceModalType('featureAndSpecification');
            setPriceModalOpen(true);
            return;
        }



        // console.log("PRODUCT::+++++++++========", product);

        // Baki sob option er jonno normal message handling
        let message = '';

        switch (option) {
            case 'details':
                message = buildVehicleDetailsMessage();
                await shareProductFirstImageWithFallback(message);
                return;

            case 'detailsWithPrice':
                message = buildVehicleDetailsMessage({ includePrice: true });
                await shareProductFirstImageWithFallback(message);
                return;

            case 'detailsWithoutPrice':
                message = buildVehicleDetailsMessage();
                await shareProductFirstImageWithFallback(message);
                return;
            case 'oneImageShortDetails':
                // One image with detailed product information for WhatsApp
                // Build detailed message
                let oneImageDetailsMessage = `*${productName}*\n\n`;

                // Brand
                if (product?.v_brand_name) {
                    oneImageDetailsMessage += `Brand: ${product.v_brand_name}\n`;
                }
                // Model
                if (product?.v_model_name) {
                    oneImageDetailsMessage += `Model: ${product.v_model_name}\n`;
                }
                // Package/Edition
                if (product?.v_edition_name) {
                    oneImageDetailsMessage += `Package: ${product.v_edition_name}\n`;
                }
                // Condition
                if (product?.v_condition_name) {
                    oneImageDetailsMessage += `Condition: ${product.v_condition_name}\n`;
                }
                // Model Year
                if (product?.v_mod_year) {
                    oneImageDetailsMessage += `Model Yr: ${product.v_mod_year}\n`;
                }
                // Registration Year
                if (product?.v_registration) {
                    oneImageDetailsMessage += `Reg Yr: ${product.v_registration}\n`;
                }
                // Grade
                if (product?.v_grade_name) {
                    oneImageDetailsMessage += `Grade: ${product.v_grade_name}\n`;
                }
                // Exterior Grade
                if (product?.v_ext_grade_name) {
                    oneImageDetailsMessage += `Exterior Grd: ${product.v_ext_grade_name}\n`;
                }
                // Interior Grade
                if (product?.v_int_grade_name) {
                    oneImageDetailsMessage += `Interior Grd: ${product.v_int_grade_name}\n`;
                }
                // Mileage
                if (product?.v_mileage) {
                    oneImageDetailsMessage += `Mileage: ${product.v_mileage} km\n`;
                }
                // Color
                if (product?.v_color_name) {
                    oneImageDetailsMessage += `Color: ${product.v_color_name}\n`;
                }
                // Fuel
                if (product?.v_fuel_name) {
                    oneImageDetailsMessage += `Fuel: ${product.v_fuel_name}\n`;
                }
                // Transmission
                if (product?.v_transmission_name) {
                    oneImageDetailsMessage += `Option: ${product.v_transmission_name}\n`;
                }
                // Engine Capacity (CC)
                if (product?.v_capacity) {
                    oneImageDetailsMessage += `CC: ${product.v_capacity}\n`;
                }
                // Body Type
                if (product?.v_skeleton_name) {
                    oneImageDetailsMessage += `Body: ${product.v_skeleton_name}\n`;
                }
                // Seat
                if (product?.v_seat_name) {
                    oneImageDetailsMessage += `Seat: ${product.v_seat_name}\n`;
                }
                // Chassis Number
                if (product?.v_chassis && product.v_chassis !== 'null') {
                    oneImageDetailsMessage += `Chassis No: ${product.v_chassis}\n`;
                }
                // Engine Number
                if (product?.v_engine && product.v_engine !== 'null') {
                    oneImageDetailsMessage += `Engine No: ${product.v_engine}\n`;
                }
                // Tax Token
                if (product?.v_tax_token_exp_date) {
                    oneImageDetailsMessage += `Tax Token: ${product.v_tax_token_exp_date}\n`;
                }
                // Fitness
                if (product?.v_fitness_exp_date) {
                    oneImageDetailsMessage += `Fitness: ${product.v_fitness_exp_date}\n`;
                }



                // Product Link
                oneImageDetailsMessage += `\n More Details:\n${url}`;

                await shareProductFirstImageWithFallback(oneImageDetailsMessage);
                return;
            case 'priceLinkDetailsImage':
                // Same as 'details' case - formatted vehicle details message
                let priceLinkDetailsImageMessage = `*${productName}*\n\n`;
                const priceLinkShareImageUrl = getProductShareImageUrls()[0];

                // Brand
                if (product?.v_brand_name) {
                    priceLinkDetailsImageMessage += `Brand: ${product.v_brand_name}\n`;
                }
                // Model
                if (product?.v_model_name) {
                    priceLinkDetailsImageMessage += `Model: ${product.v_model_name}\n`;
                }
                // Package/Edition
                if (product?.v_edition_name) {
                    priceLinkDetailsImageMessage += `Package: ${product.v_edition_name}\n`;
                }
                // Condition
                if (product?.v_condition_name) {
                    priceLinkDetailsImageMessage += `Condition: ${product.v_condition_name}\n`;
                }
                // Model Year
                if (product?.v_mod_year) {
                    priceLinkDetailsImageMessage += `Model Yr: ${product.v_mod_year}\n`;
                }
                // Registration Year
                if (product?.v_registration) {
                    priceLinkDetailsImageMessage += `Reg Yr: ${product.v_registration}\n`;
                }
                // Grade
                if (product?.v_grade_name) {
                    priceLinkDetailsImageMessage += `Grade: ${product.v_grade_name}\n`;
                }
                // Exterior Grade
                if (product?.v_ext_grade_name) {
                    priceLinkDetailsImageMessage += `Exterior Grd: ${product.v_ext_grade_name}\n`;
                }
                // Interior Grade
                if (product?.v_int_grade_name) {
                    priceLinkDetailsImageMessage += `Interior Grd: ${product.v_int_grade_name}\n`;
                }
                // Mileage
                if (product?.v_mileage) {
                    priceLinkDetailsImageMessage += `Mileage: ${product.v_mileage} km\n`;
                }
                // Color
                if (product?.v_color_name) {
                    priceLinkDetailsImageMessage += `Color: ${product.v_color_name}\n`;
                }
                // Fuel
                if (product?.v_fuel_name) {
                    priceLinkDetailsImageMessage += `Fuel: ${product.v_fuel_name}\n`;
                }
                // Transmission
                if (product?.v_transmission_name) {
                    priceLinkDetailsImageMessage += `Option: ${product.v_transmission_name}\n`;
                }
                // Engine Capacity (CC)
                if (product?.v_capacity) {
                    priceLinkDetailsImageMessage += `CC: ${product.v_capacity}\n`;
                }
                // Body Type
                if (product?.v_skeleton_name) {
                    priceLinkDetailsImageMessage += `Body: ${product.v_skeleton_name}\n`;
                }
                // Seat
                if (product?.v_seat_name) {
                    priceLinkDetailsImageMessage += `Seat: ${product.v_seat_name}\n`;
                }
                // Chassis Number
                if (product?.v_chassis && product.v_chassis !== 'null') {
                    priceLinkDetailsImageMessage += `Chassis No: ${product.v_chassis}\n`;
                }
                // Engine Number
                if (product?.v_engine && product.v_engine !== 'null') {
                    priceLinkDetailsImageMessage += `Engine No: ${product.v_engine}\n`;
                }
                // Tax Token
                if (product?.v_tax_token_exp_date) {
                    priceLinkDetailsImageMessage += `Tax Token: ${product.v_tax_token_exp_date}\n`;
                }
                // Fitness
                if (product?.v_fitness_exp_date) {
                    priceLinkDetailsImageMessage += `Fitness: ${product.v_fitness_exp_date}\n`;
                }

                // Feature Specifications
                if (product?.feature_specification && product.feature_specification.length > 0) {
                    priceLinkDetailsImageMessage += `\n Features:\n`;

                    const featureText = product.feature_specification
                        .map((feature) => {
                            if (
                                feature?.specification?.length > 0 &&
                                feature.specification.some((item) => item.is_selected)
                            ) {
                                const selectedItems = feature.specification
                                    .filter((item) => item.is_selected)
                                    .map((item) => item.fs_title)
                                    .join(", ");

                                return `${feature.md_title}: ${selectedItems}`;
                            }
                            return null;
                        })
                        .filter(Boolean)
                        .join("\n");

                    if (featureText) {
                        priceLinkDetailsImageMessage += featureText + '\n';
                    }
                }

                // Price
                if (price) {
                    priceLinkDetailsImageMessage += `\n Price: ${price}\n`;
                }

                // Product Link
                priceLinkDetailsImageMessage += `\n View & Download All Images and Copy Product Features form below Link:\n${url}`;

                if (priceLinkShareImageUrl) {
                    const canUseWebShare =
                        typeof navigator !== "undefined" &&
                        typeof navigator.share === "function" &&
                        typeof navigator.canShare === "function";

                    if (canUseWebShare) {
                        try {
                            const response = await fetch(priceLinkShareImageUrl);
                            if (!response.ok) {
                                throw new Error("Failed to fetch share image");
                            }

                            const blob = await response.blob();
                            const fileName = ensureFileNameHasExtension(
                                extractProductDocName(priceLinkShareImageUrl, priceLinkShareImageUrl, 0),
                                blob.type
                            );
                            const imageFile = new File([blob], fileName, {
                                type: blob.type || "image/jpeg",
                            });
                            const shareData = {
                                title: productName,
                                text: priceLinkDetailsImageMessage,
                                files: [imageFile],
                            };

                            if (navigator.canShare(shareData)) {
                                await navigator.share(shareData);
                                return;
                            }
                        } catch (shareError) {
                            console.error("Price link image load error:", shareError);
                            console.log("Price link details image share failed:", shareError?.message || shareError);
                        }
                    }
                }

                message = priceLinkDetailsImageMessage;
                break;

            case 'sendMyProfile':
                let myProfileMessage = ` Check out My Personal Profile:\n\n`;

                if (user?.name) {
                    myProfileMessage += ` Name: ${user.name}\n`;
                }

                if (user?.email) {
                    myProfileMessage += ` Email: ${user.email}\n`;
                }

                if (user?.phone) {
                    myProfileMessage += ` Phone: +880${user.phone}\n`;
                }

                if (user?.company_name) {
                    myProfileMessage += ` Company: ${user.company_name}\n`;
                }

                if (user?.address) {
                    myProfileMessage += ` Address: ${user.address}\n`;
                }

                message = myProfileMessage;
                break;

            case 'sendBusinessProfile': {
                // console.log("send business profile user---------------------------", user);

                const profile = user?.profile || {};
                const businessAddresses = Array.isArray(profile?.up_biz_address) ? profile.up_biz_address : [];
                const businessEmails = Array.isArray(profile?.up_biz_email) ? profile.up_biz_email : [];
                const businessPhones = Array.isArray(profile?.up_biz_phone) ? profile.up_biz_phone : [];
                const businessFacebooks = Array.isArray(profile?.up_biz_facebook) ? profile.up_biz_facebook : [];

                let businessProfileMessage = ` Business Profile:\n\n`;

                if (user?.name) {
                    businessProfileMessage += ` Name: ${user.name}\n`;
                }


                if (user?.email) {
                    businessProfileMessage += ` Email: ${user.email}\n`;
                }

                if (user?.phone) {
                    businessProfileMessage += ` Phone: +880${user.phone}\n`;
                }

                if (profile?.up_designation) {
                    businessProfileMessage += ` Designation: ${profile.up_designation}\n`;
                }


                if (profile?.up_company) {
                    businessProfileMessage += ` Company: ${profile.up_company}\n`;
                }


                if (profile?.up_website) {
                    businessProfileMessage += ` Website: ${profile.up_website}\n`;
                }



                if (businessEmails.length > 0) {
                    businessEmails.forEach((email, index) => {
                        const businessEmail = cleanShareValue(email);
                        if (businessEmail) {
                            businessProfileMessage += ` Business Email ${index + 1}: ${businessEmail}\n`;
                        }
                    });
                } else if (user?.email) {
                    businessProfileMessage += ` Email: ${user.email}\n`;
                }

                if (businessPhones.length > 0) {
                    businessPhones.forEach((phone, index) => {
                        const businessPhone = formatPhoneForShare(phone?.phone ?? phone);
                        const businessPhoneName = cleanShareValue(phone?.name);
                        if (businessPhone) {
                            businessProfileMessage += ` Business Phone ${index + 1}: ${businessPhoneName ? `${businessPhoneName} - ` : ""}${businessPhone}\n`;
                        }
                    });
                } else if (user?.phone) {
                    businessProfileMessage += ` Phone: +880${user.phone}\n`;
                }

                businessAddresses.forEach((address, index) => {
                    const businessAddress = cleanShareValue(address?.addr ?? address);
                    const businessAddressName = cleanShareValue(address?.com);
                    if (businessAddress) {
                        businessProfileMessage += ` Business Address ${index + 1}: ${businessAddressName ? `${businessAddressName} - ` : ""}${businessAddress}\n`;
                    }
                });

                businessFacebooks.forEach((facebook, index) => {
                    const businessFacebook = cleanShareValue(facebook);
                    if (businessFacebook) {
                        businessProfileMessage += ` Facebook ${index + 1}: ${businessFacebook}\n`;
                    }
                });

                message = businessProfileMessage;
                break;
            }

            case 'sendBusinessCard':
                message = buildBusinessCardMessage();
                break;


            case 'shareLocation':
                let locationMessage = ` My Personal / Product Location:\n\n`;


                if (product?.v_location?.uo_name && product.v_location?.uo_name !== 'null') {
                    locationMessage += `Name: ${product.v_location.uo_name}\n`;
                }

                if (product?.v_location?.uo_email && product.v_location?.uo_email !== 'null') {
                    locationMessage += `Email: ${product.v_location.uo_email}\n`;
                }

                if (product?.v_location?.uo_phone && product.v_location?.uo_phone !== 'null') {
                    locationMessage += `Phone: ${product.v_location.uo_phone}\n`;
                }


                if (product?.v_location?.uo_address && product.v_location?.uo_address !== 'null') {
                    locationMessage += `Address: ${product.v_location.uo_address}\n`;
                }


                if (product?.v_location?.uo_map_link && product.v_location?.uo_map_link !== 'null') {
                    locationMessage += `Map Link: ${product.v_location.uo_map_link}\n`;
                }

                message = locationMessage;
                break;

            case 'priceLinkDetails':
                message = buildPriceLinkDetailsMessage();
                break;

            case 'stockList':
                // Open Vehicle Stock List Modal
                setStockListModalOpen(true);
                return; // Don't open WhatsApp for this option

            default:
                message = url;
        }

        // WhatsApp open korbe message niye
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const openPriceShareModal = (type, fallbackOption = type) => {
        if (shouldOpenPriceSelectModal) {
            setPriceModalType(type);
            setPriceModalOpen(true);
            return;
        }

        handleBusinessShare(fallbackOption);
    };

    return (
        // <Dialog open={open} onOpenChange={setOpen}>
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader className='relative'>
                    <DialogTitle className='text-center font-thin'>Share Product</DialogTitle>
                    <button
                        type='button'
                        className='absolute right-10 top-0 rounded-full border border-sky-500 p-1 text-sky-600 transition hover:bg-sky-50'
                        onClick={() => openInfoDialog('overview')}
                        aria-label='Show share option guide'
                    >
                        <Info className='h-4 w-4' />
                    </button>
                </DialogHeader>

                <hr />

                {/* SEND FOR BUSINESS PURPOSE Section */}
                <div>
                    <h3 className='text-green-600 font-semibold mb-4'>SEND FOR BUSINESS PURPOSE</h3>

                    <div className='space-y-3'>

                        <div
                            className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                            onClick={() => handleBusinessShare('featureAndSpecification')}
                        >
                            {/* <span className='text-gray-700'>Share All Feature & Feature Specification</span> */}
                            <span className='text-gray-700'>Features & Link: Image Download & Copy Specification</span>
                            <div className='flex items-center gap-3'>
                                {renderInfoButton('featureAndSpecification')}
                                <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                    {selectedBusinessOption === 'featureAndSpecification' && (
                                        <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                    )}
                                </div>
                            </div>
                        </div>


                        {/* Option 1: All Image */}
                        <div
                            className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                            onClick={() => openPriceShareModal('allImages')}
                        >
                            <span className='text-gray-700'>All Images (Mobile Version Only)</span>
                            <div className='flex items-center gap-3'>
                                {renderInfoButton('allImages')}
                                <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                    {selectedBusinessOption === 'allImages' && (
                                        <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* isMyShop */}

                        {/* Option 2: Details */}
                        {/* <div
                            className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                            onClick={() => {
                                if (isStock) {
                                    handleBusinessShare('details');
                                    return;
                                }
                                setPriceModalType('details');
                                setPriceModalOpen(true);
                            }}
                        >
                            <span className='text-gray-700'>Details & Download Images Link</span>
                            <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                {selectedBusinessOption === 'details' && (
                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                )}
                            </div>
                        </div> */}

                        {/* Option 2: Details with Price and Details without Price */}
                        {
                            (isMyShop || isCompanyShop) && (
                                <>
                                    <div
                                        className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                        onClick={() => openPriceShareModal('withPrice', 'detailsWithPrice')}
                                    >
                                        <span className='text-gray-700'>Details with Price</span>
                                        <div className='flex items-center gap-3'>
                                            {renderInfoButton('detailsWithPrice')}
                                            <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                {selectedBusinessOption === 'detailsWithPrice' && (
                                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div
                                        className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                        onClick={() => openPriceShareModal('withoutPrice', 'detailsWithoutPrice')}
                                    >
                                        <span className='text-gray-700'>Details without Price</span>
                                        <div className='flex items-center gap-3'>
                                            {renderInfoButton('detailsWithoutPrice')}
                                            <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                {selectedBusinessOption === 'detailsWithoutPrice' && (
                                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                )}
                                            </div>
                                        </div>
                                    </div>



                                    {/* <div
                                        className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                        onClick={() => {
                                            setPriceModalType('shareLocation');
                                            setPriceModalOpen(true);
                                        }}
                                    >
                                        <span className='text-gray-700'>Location Share</span>
                                        <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                            {selectedBusinessOption === 'shareLocation' && (
                                                <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                            )}
                                        </div>
                                    </div> */}
                                </>

                            )
                        }
                    </div>
                </div>

                {/* SEND FOR DIRECT CUSTOMER Section */}
                <div className='mt-6'>
                    <h3 className='text-green-600 font-semibold mb-4'>SEND FOR DIRECT CUSTOMER</h3>

                    <div className='space-y-3'>
                        {/* Option 1: One Image, Short Details, Link */}
                        <div
                            className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                            onClick={() => openPriceShareModal('oneImageShortDetails')}
                        >
                            <span className='text-gray-700'>One Image, Short Details, Download Link</span>
                            <div className='flex items-center gap-3'>
                                {renderInfoButton('oneImageShortDetails')}
                                <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                    {selectedBusinessOption === 'oneImageShortDetails' && (
                                        <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Option 2: Price, Link, Details, Image */}
                        <div
                            className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                            onClick={() => openPriceShareModal('priceLinkDetailsImage')}
                        >
                            <span className='text-gray-700'>Price, Link, Details, Image</span>
                            <div className='flex items-center gap-3'>
                                {renderInfoButton('priceLinkDetailsImage')}
                                <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                    {selectedBusinessOption === 'priceLinkDetailsImage' && (
                                        <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                    )}
                                </div>
                            </div>
                        </div>




                        {/* Option 2: Price, Link, Details */}
                        <div
                            className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                            onClick={() => openPriceShareModal('priceLinkDetails')}
                        >
                            <span className='text-gray-700'>Price, Link, Details</span>
                            <div className='flex items-center gap-3'>
                                {renderInfoButton('priceLinkDetails')}
                                <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                    {selectedBusinessOption === 'priceLinkDetails' && (
                                        <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                    )}
                                </div>
                            </div>
                        </div>





                        {
                            (isMyShop || isCompanyShop) && (
                                <>



                                    {
                                        (hasPermissionShareOutletLocation || isMyShop) && (
                                            <div
                                                className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                                onClick={() => {
                                                    setSelectedBusinessOption('shareLocation');
                                                    setLocationModalOpen(true);
                                                }}
                                            >
                                                <span className='text-gray-700'>Share Outlet Location</span>
                                                <div className='flex items-center gap-3'>
                                                    {renderInfoButton('shareLocation')}
                                                    <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                        {selectedBusinessOption === 'shareLocation' && (
                                                            <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }









                                    {
                                        (isMyShop) && (
                                            <>
                                                <div
                                                    className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                                    onClick={() => handleBusinessShare('sendMyProfile')}
                                                >
                                                    <span className='text-gray-700'>Send My Profile</span>
                                                    <div className='flex items-center gap-3'>
                                                        {renderInfoButton('sendMyProfile')}
                                                        <button
                                                            type='button'
                                                            className='shrink-0 rounded-full border border-green-600 bg-white px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50'
                                                            onClick={handleProfileEditClick}
                                                        >
                                                            Edit
                                                        </button>
                                                        <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                            {selectedBusinessOption === 'sendMyProfile' && (
                                                                <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>


                                            </>
                                        )
                                    }



                                    {
                                        (isCompanyShop) && (
                                            <div
                                                className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                                onClick={() => handleBusinessShare('sendBusinessCard')}
                                            >
                                                <span className='text-gray-700'>Send Business Card</span>
                                                <div className='flex items-center gap-3'>
                                                    {renderInfoButton('sendBusinessCard')}
                                                    {
                                                        <button
                                                            type='button'
                                                            className='shrink-0 rounded-full border border-green-600 bg-white px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50'
                                                            onClick={handleBusinessCardEditClick}
                                                        >
                                                            Edit
                                                        </button>
                                                    }

                                                    <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                        {selectedBusinessOption === 'sendBusinessCard' && (
                                                            <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }

                                    {
                                        (hasPermissionShowSendBusinessProfileButton || isMyShop) && (
                                            <div
                                                className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                                onClick={() => handleBusinessShare('sendBusinessProfile')}
                                            >
                                                <span className='text-gray-700'>Send Business Profile</span>
                                                <div className='flex items-center gap-3'>
                                                    {renderInfoButton('sendBusinessProfile')}
                                                    {
                                                        (isMyShop) && (
                                                            <button
                                                                type='button'
                                                                className='shrink-0 rounded-full border border-green-600 bg-white px-3 py-1 text-xs font-medium text-green-700 transition hover:bg-green-50'
                                                                onClick={handleBusinessProfileClick}
                                                            >
                                                                Edit
                                                            </button>
                                                        )
                                                    }

                                                    <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                        {selectedBusinessOption === 'sendBusinessProfile' && (
                                                            <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }


                                    


                                    {
                                        (hasPermissionShareBankInformation || isMyShop) && (
                                            <div
                                                className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                                onClick={() => {
                                                    setSelectedBusinessOption('sendBankAccount');
                                                    setBankAccountModalOpen(true);
                                                }}
                                            >
                                                <span className='text-gray-700'>Send Bank Information</span>
                                                <div className='flex items-center gap-3'>
                                                    {renderInfoButton('sendBankAccount')}
                                                    <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                        {selectedBusinessOption === 'sendBankAccount' && (
                                                            <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }


                                    {
                                        (isMyShop) && (
                                            <div
                                                className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                                onClick={() => {
                                                    setSelectedBusinessOption('profileShare');
                                                    setProfileShareModalOpen(true);
                                                }}
                                            >
                                                <span className='text-gray-700'>Send Essential Documents</span>
                                                <div className='flex items-center gap-3'>
                                                    {renderInfoButton('profileShare')}
                                                    <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                        {selectedBusinessOption === 'profileShare' && (
                                                            <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }


                                    {
                                        (hasPermissionShowSendProductDocumentsShareButton || isMyShop) && (
                                            <div
                                                className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                                onClick={() => handleBusinessShare('productShareDocuments')}
                                            >
                                                <span className='text-gray-700'>Send Product Documents/Auction Sheet/Burchore</span>
                                                <div className='flex items-center gap-3'>
                                                    {renderInfoButton('productShareDocuments')}
                                                    <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                        {selectedBusinessOption === 'productShareDocuments' && (
                                                            <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }



                                    {
                                        (hasPermissionStockList || isMyShop) && (
                                            <div
                                                className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                                onClick={() => handleBusinessShare('stockList')}
                                            >
                                                <span className='text-gray-700'>Stock List</span>
                                                <div className='flex items-center gap-3'>
                                                    {renderInfoButton('stockList')}
                                                    <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                        {selectedBusinessOption === 'stockList' && (
                                                            <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }

                                </>

                            )
                        }

                        {/* Option 3: Price, Link, Details */}
                        {/* <div
                            className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                            onClick={() => handleBusinessShare('priceLinkDetails')}
                        >
                            <span className='text-gray-700'>Price, Link, Details</span>
                            <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                {selectedBusinessOption === 'priceLinkDetails' && (
                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                )}
                            </div>
                        </div> */}
                    </div>
                </div>

                {/* <div>
                    <span className='text-gray-500'>Share this link via</span>

                    <div className='flex gap-3 items-center justify-center mt-2'>

                        <div className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                            <a
                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition duration-300 ease-in-out text-green-600 hover:text-white"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M20.52 3.48A11.92 11.92 0 0 0 12.07.06a11.93 11.93 0 0 0-10.7 17.2L.05 24l6.84-1.82a11.93 11.93 0 0 0 5.19 1.24h.01a11.92 11.92 0 0 0 8.43-20.94zM12 21.36a9.35 9.35 0 0 1-4.78-1.3l-.34-.2-4.05 1.08 1.1-3.94-.22-.35a9.35 9.35 0 1 1 8.3 4.71zm5.29-6.98c-.29-.14-1.7-.84-1.96-.94-.26-.1-.45-.14-.64.15s-.74.94-.9 1.14c-.17.2-.33.22-.62.08-.29-.14-1.21-.45-2.31-1.43-.85-.76-1.43-1.7-1.6-1.99-.17-.29-.02-.45.13-.6.13-.13.29-.33.43-.5.14-.17.19-.29.29-.48.1-.2.05-.37-.03-.52-.08-.14-.64-1.54-.88-2.11-.23-.55-.46-.48-.64-.49h-.55c-.17 0-.45.07-.68.33s-.89.87-.89 2.13.91 2.48 1.04 2.65c.13.17 1.78 2.7 4.32 3.78.6.26 1.06.41 1.42.53.6.19 1.15.16 1.58.1.48-.07 1.48-.6 1.69-1.18.2-.58.2-1.08.15-1.18-.05-.1-.24-.17-.53-.3z" />
                                </svg>
                            </a>
                        </div>

                        <div className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                            <a
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 hover:bg-blue-600 text-blue-600 hover:text-white rounded-full flex items-center justify-center shadow-lg transition duration-300 ease-in-out"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 16 16"
                                >
                                    <path d="M12.728 0H3.273A3.273 3.273 0 0 0 0 3.273v9.454A3.273 3.273 0 0 0 3.273 16h5.09v-6.273H6.545V7.273h1.818V5.818c0-1.8 1.091-2.818 2.727-2.818.773 0 1.545.091 1.545.091v1.727h-.873c-.854 0-1.127.545-1.127 1.1v1.355h2.018l-.318 2.454h-1.7V16h2.727A3.273 3.273 0 0 0 16 12.727V3.273A3.273 3.273 0 0 0 12.728 0z" />
                                </svg>
                            </a>
                        </div>

                        <div className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                            <a
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 hover:bg-sky-500 text-sky-500 hover:text-white rounded-full flex items-center justify-center shadow-lg transition duration-300 ease-in-out"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M23 2.999c-.835.37-1.732.62-2.675.733a4.7 4.7 0 0 0 2.052-2.592 9.424 9.424 0 0 1-2.985 1.14A4.682 4.682 0 0 0 16.11 2a4.685 4.685 0 0 0-4.675 4.675c0 .366.042.723.123 1.064A13.3 13.3 0 0 1 3.095 2.61a4.673 4.673 0 0 0-.634 2.35 4.675 4.675 0 0 0 2.08 3.89 4.673 4.673 0 0 1-2.116-.584v.06a4.681 4.681 0 0 0 3.752 4.587 4.736 4.736 0 0 1-1.228.165c-.3 0-.607-.028-.9-.086a4.686 4.686 0 0 0 4.37 3.248A9.387 9.387 0 0 1 2 19.54a13.29 13.29 0 0 0 7.203 2.114c8.645 0 13.368-7.16 13.368-13.368 0-.203-.005-.406-.014-.607a9.556 9.556 0 0 0 2.343-2.44z" />
                                </svg>
                            </a>
                        </div>

                        <div className="w-12 h-12 border border-gray-300 rounded-full flex items-center justify-center cursor-pointer shadow-lg">
                            <a
                                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-12 h-12 hover:bg-blue-700 text-blue-700 hover:text-white rounded-full flex items-center justify-center shadow-lg transition duration-300 ease-in-out"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M19 0h-14C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM8.34 19H5.67v-8.67h2.67V19zM7 9.4c-.86 0-1.4-.6-1.4-1.35C5.6 7.3 6.14 6.7 7 6.7c.86 0 1.4.6 1.4 1.35 0 .75-.54 1.35-1.4 1.35zM19 19h-2.67v-4.67c0-1.15-.4-1.93-1.4-1.93-.76 0-1.22.5-1.42.99-.07.18-.09.44-.09.7V19h-2.67v-8.67h2.67v1.19c.35-.53.99-1.28 2.43-1.28 1.78 0 3.15 1.17 3.15 3.69V19z" />
                                </svg>
                            </a>
                        </div>

                    </div>
                </div>

                <div className="flex items-center gap-4 my-4">
                    <hr className="flex-grow border-gray-300" />
                    <span className="text-sm text-gray-600 whitespace-nowrap">Or copy link</span>
                    <hr className="flex-grow border-gray-300" />
                </div>

                <CopyInput product={product} /> */}


                {/* Add your form fields here */}

            </DialogContent>

            {/* Price Select Modal */}
            <PriceSelectModal
                open={priceModalOpen}
                setOpen={setPriceModalOpen}
                product={product}
                onShare={handlePriceShare}
                selectedCompanyShop={selectedCompanyShop}
                formattedPermissions={formattedPermissions}
                isMyShop={isMyShop}
            />

            {/* Vehicle Stock List Modal */}
            <VehicleStockListModal
                open={stockListModalOpen}
                setOpen={setStockListModalOpen}
                user={user}
            />

            {/* {
                console.log("user data", user)
            } */}



            {/* Bank Account Select Modal */}
            <BankAccountSelectModal
                open={bankAccountModalOpen}
                setOpen={setBankAccountModalOpen}
                bankAccounts={user?.profile?.up_biz_bank_info || []}
            />

            <OutletLocationSelectModal
                open={locationModalOpen}
                setOpen={setLocationModalOpen}
                product={product}
                user={user}
                selectedCompanyShop={selectedCompanyShop}
            />

            <ProfileShareModal
                open={profileShareModalOpen}
                setOpen={setProfileShareModalOpen}
                user={user}
            />

            <BusinessCardEditModal
                open={businessCardModalOpen}
                setOpen={setBusinessCardModalOpen}
                selectedCompanyShop={selectedCompanyShop}
            />

            <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
                <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {activeInfoKey === 'overview' ? 'Share Option Guide' : activeShareInfo?.title || 'Option Info'}
                        </DialogTitle>
                    </DialogHeader>

                    {
                        activeInfoKey === 'overview' ? (
                            <div className='space-y-5 text-sm leading-6 text-gray-700'>
                                {
                                    SHARE_INFO_SECTIONS.map((section) => (
                                        <div key={section.title}>
                                            <h4 className='font-semibold text-green-700'>{section.title}</h4>
                                            <div className='mt-3 space-y-3'>
                                                {
                                                    section.items.map((itemKey) => (
                                                        <div key={itemKey} className='rounded-lg border border-gray-200 p-3'>
                                                            <div className='font-medium text-gray-900'>{SHARE_OPTION_INFO[itemKey]?.title}</div>
                                                            <p className='mt-1 text-gray-600'>{SHARE_OPTION_INFO[itemKey]?.description}</p>
                                                        </div>
                                                    ))
                                                }
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ) : (
                            <p className='text-sm leading-6 text-gray-700'>{activeShareInfo?.description}</p>
                        )
                    }
                </DialogContent>
            </Dialog>
        </Dialog>
    )
}

export default ProductShareModal
