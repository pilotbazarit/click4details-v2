import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { usePathname } from "next/navigation";

import CopyInput from '../CopyInput'
import PriceSelectModal from './PriceSelectModal'
import VehicleStockListModal from './VehicleStockListModal'
import { formatPermissions } from '@/helpers/functions'
import { useAppContext } from '@/context/AppContext';



const ProductShareModal = ({ open, setOpen, product }) => {

    const pathname = usePathname();
    const [user, setUser] = useState(null);
    const { selectedCompanyShop } = useAppContext();





    useEffect(() => {
        const userData = localStorage.getItem("user");
        const userInfo = userData && JSON.parse(userData);
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
    }, []);


    // console.log("product in share modal User:::::", user);


    const formattedPermissions = formatPermissions(user?.permissions);



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


    // console.log("-------------------------------------");
    // console.log("model user", user);
    // console.log("selectedCompanyShop", selectedCompanyShop?.shop?.s_id);
    // console.log("Formatted Permissions:", formattedPermissions);


    // ---------- Custom Helper ----------
    let isMyShop = pathname.includes("my-shop");
    let isCompanyShop = pathname.includes("company-shop");

    const domain = 'https://click4details.app';
    // const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://click4details.app';
    const url = `${domain}/product/${product?.v_slug}`;

    // State to track selected option (kon option select hoise seta track korbe)
    const [selectedBusinessOption, setSelectedBusinessOption] = useState('');

    // State for price select modal
    const [priceModalOpen, setPriceModalOpen] = useState(false);
    const [priceModalType, setPriceModalType] = useState(''); // 'withPrice' or 'withoutPrice'

    // State for vehicle stock list modal
    const [stockListModalOpen, setStockListModalOpen] = useState(false);

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
    };

    // Function to handle price selection and share
    const handlePriceShare = (priceData) => {
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
        message += `\n🔗 View Details & Download Images:\n${url}`;

        // Mark the option as selected
        setSelectedBusinessOption(priceModalType === 'withPrice' ? 'detailsWithPrice' : 'detailsWithoutPrice');

        // WhatsApp open korbe message niye
        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    // WhatsApp e share korar function
    const handleBusinessShare = async (option) => {
        // Option select kora holo
        setSelectedBusinessOption(option);

        const productName = product?.v_title || product?.v_title;
        // const price = product?.v_price || product?.price || 'N/A';
        const price =
            product?.vehicle_price?.user_price !== 'Call for Price'
                ? `TK. ${product?.vehicle_price?.user_price}`
                : 'Call for Price';

        const details = product?.v_description || product?.p_description || '';

        // All Images option er jonno special handling - Image files share korbe
        if (option === 'allImages') {
            const images = product?.vehicle_images || [];

            if (images.length > 0) {
                try {
                    // Step 1: Mobile e Web Share API try kora (best option)
                    // Check if mobile device AND Web Share API available
                    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                    if (isMobile && navigator.share && navigator.canShare) {
                        try {

                            // Sob image download kore File object banano
                            const imageFiles = await Promise.all(
                                images.map(async (img, index) => {
                                    try {
                                        const response = await fetch(img.url);
                                        const blob = await response.blob();
                                        return new File([blob], `image-${index + 1}.jpg`, { type: 'image/jpeg' });
                                    } catch (error) {
                                        console.error(`Image ${index + 1} load error:`, error);
                                        return null;
                                    }
                                })
                            );

                            // Null files filter kore remove kora
                            const validFiles = imageFiles.filter(file => file !== null);

                            if (validFiles.length > 0) {
                                // Share data ready kora
                                const shareData = {
                                    title: productName,
                                    text: `${productName}\n\n${url}`,
                                    files: validFiles
                                };

                                // Check if files share supported
                                if (navigator.canShare(shareData)) {
                                    await navigator.share(shareData);
                                    console.log(" Web Share API successful");
                                    return;
                                } else {
                                    console.log(" Files not shareable, falling back...");
                                }
                            }
                        } catch (shareError) {
                            // Web Share API error - silently fallback
                            console.log(" Web Share API failed:", shareError.message);
                            // Continue to fallback methods
                        }
                    }

                    // Step 2: Desktop/Fallback - Images download kore WhatsApp e pathano

                    // Check if desktop
                    const isDesktop = !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                    if (isDesktop && images.length <= 10) {
                        // Desktop e: Download images using fetch + blob (CORS safe)

                        // Download all images using fetch (CORS friendly)
                        const downloadPromises = images.map(async (img, index) => {
                            try {

                                // Fetch image as blob
                                const response = await fetch(img.url);
                                if (!response.ok) {
                                    console.error(`Failed to fetch image ${index + 1}:`, response.status);
                                    return false;
                                }

                                const blob = await response.blob();

                                // Get file extension from URL or use jpg as default
                                const urlParts = img.url.split('.');
                                const extension = urlParts[urlParts.length - 1].split('?')[0] || 'jpg';

                                // Create download link
                                const blobUrl = window.URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = blobUrl;
                                link.download = `${productName.replace(/[^a-z0-9]/gi, '_')}_image_${index + 1}.${extension}`;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);

                                // Clean up blob URL
                                setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);

                                console.log(` Image ${index + 1} downloaded successfully`);
                                return true;
                            } catch (error) {
                                console.error(` Error downloading image ${index + 1}:`, error);
                                return false;
                            }
                        });

                        // Wait for all downloads with delay
                        Promise.all(downloadPromises).then((results) => {
                            const successCount = results.filter(r => r === true).length;
                            console.log(`Download complete: ${successCount}/${images.length} images downloaded`);

                            // WhatsApp message with download status
                            let desktopMessage = `*${productName}*\n\n`;

                            if (successCount === images.length) {
                                desktopMessage += ` ${images.length} ta image download hoye geche!\n\n`;
                            } else {
                                desktopMessage += ` ${successCount}/${images.length} ta image download hoyeche\n\n`;
                            }

                            desktopMessage += ` Images attach :\n`;
                            desktopMessage += `1. Download folder e jacchen\n`;
                            desktopMessage += `2. Images select korun\n`;
                            desktopMessage += `3. WhatsApp e attach korun\n\n`;
                            desktopMessage += ` Product Link:\n${url}`;

                            // Open WhatsApp with message
                            setTimeout(() => {
                                const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(desktopMessage)}`;
                                window.open(whatsappUrl, '_blank');
                            }, 500);
                        });

                    } else {
                        // Fallback: Just send URLs in message
                        let imageMessage = `*${productName}*\n\n`;
                        imageMessage += ` Total ${images.length} ta image:\n\n`;

                        // Prottek image URL alag alag line e
                        images.forEach((img, index) => {
                            imageMessage += `${index + 1}. ${img.url}\n\n`;
                        });

                        imageMessage += `\n Product Link:\n${url}`;

                        // WhatsApp e pathano
                        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(imageMessage)}`;
                        window.open(whatsappUrl, '_blank');
                    }

                } catch (error) {
                    console.error('Share error:', error);
                    // Error hole fallback WhatsApp URL share
                    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${productName}\n\n${url}`)}`;
                    window.open(whatsappUrl, '_blank');
                }
            } else {
                // Kono image na thakle
                const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${productName}\n\n${url}`)}`;
                window.open(whatsappUrl, '_blank');
            }
            return;
        }

        // featureAndSpecification
        if (option === 'featureAndSpecification') {
            // WhatsApp e pathano

            let allDetails = '';

            // Features সেকশন
            allDetails += `\nFeatures:\n`;

            // Brand
            if (product?.v_brand_name) {
                allDetails += `Brand : ${product?.v_brand_name}\n`;
            }
            // Model
            if (product?.v_model_name) {
                allDetails += `Model: ${product?.v_model_name}\n`;
            }
            // Package
            if (product?.v_edition_name) {
                allDetails += `Package: ${product?.v_edition_name}\n`;
            }
            // Condition
            if (product?.v_condition_name) {
                allDetails += `Condition : ${product?.v_condition_name}\n`;
            }
            // Model Yr
            if (product?.v_mod_year) {
                allDetails += `Model Yr : ${product?.v_mod_year}\n`;
            }
            // Reg Yr
            if (product?.v_registration) {
                allDetails += `Reg Yr : ${product?.v_registration}\n`;
            }
            // Grade
            if (product?.v_grade_name) {
                allDetails += `Grade : ${product?.v_grade_name}\n`;
            }
            // Exterior Grd
            if (product?.v_ext_grade_name) {
                allDetails += `Exterior Grd : ${product?.v_ext_grade_name}\n`;
            }
            // Interior Grd
            if (product?.v_int_grade_name) {
                allDetails += `Interior Grd : ${product?.v_int_grade_name}\n`;
            }
            // Mileage
            if (product?.v_mileage) {
                allDetails += `Mileage: ${product?.v_mileage}\n`;
            }
            // Color
            if (product?.v_color_name) {
                allDetails += `Color: ${product?.v_color_name}\n`;
            }
            // Fuel
            if (product?.v_fuel_name) {
                allDetails += `Fuel : ${product?.v_fuel_name}\n`;
            }
            // Option
            if (product?.v_transmission_name) {
                allDetails += `Option : ${product?.v_transmission_name}\n`;
            }
            // CC
            if (product?.v_capacity) {
                allDetails += `CC : ${product?.v_capacity}\n`;
            }
            // Body
            if (product?.v_skeleton_name) {
                allDetails += `Body : ${product?.v_skeleton_name}\n`;
            }
            // Seat
            if (product?.v_seat_name) {
                allDetails += `Seat : ${product?.v_seat_name}\n`;
            }
            // Chassis No
            if (product?.v_chassis) {
                allDetails += `Chassis No : ${product?.v_chassis}\n`;
            }
            // Engine No
            if (product?.v_engine) {
                allDetails += `Engine No: ${product?.v_engine}\n`;
            }
            // Tax Token
            if (product?.v_tax_token_exp_date) {
                allDetails += `Tax Token : ${product?.v_tax_token_exp_date}\n`;
            }
            // Fitness
            if (product?.v_fitness_exp_date) {
                allDetails += `Fitness : ${product?.v_fitness_exp_date}\n`;
            }

            // Specific Features সেকশন
            if (product?.feature_specification && product.feature_specification.length > 0) {
                allDetails += `\nSpecific Features:\n`;

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

                allDetails += featureText;
            }


            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${allDetails}\n`)}`;
            window.open(whatsappUrl, '_blank');
            return;
        }


        // console.log("PRODUCT::+++++++++========", product);

        // Baki sob option er jonno normal message handling
        let message = '';

        switch (option) {
            case 'details':
                // Formatted vehicle details message
                let detailsMessage = `*${productName}*\n\n`;

                // Brand
                if (product?.v_brand_name) {
                    detailsMessage += `Brand: ${product.v_brand_name}\n`;
                }
                // Model
                if (product?.v_model_name) {
                    detailsMessage += `Model: ${product.v_model_name}\n`;
                }
                // Package/Edition
                if (product?.v_edition_name) {
                    detailsMessage += `Package: ${product.v_edition_name}\n`;
                }
                // Condition
                if (product?.v_condition_name) {
                    detailsMessage += `Condition: ${product.v_condition_name}\n`;
                }
                // Model Year
                if (product?.v_mod_year) {
                    detailsMessage += `Model Yr: ${product.v_mod_year}\n`;
                }
                // Registration Year
                if (product?.v_registration) {
                    detailsMessage += `Reg Yr: ${product.v_registration}\n`;
                }
                // Grade
                if (product?.v_grade_name) {
                    detailsMessage += `Grade: ${product.v_grade_name}\n`;
                }
                // Exterior Grade
                if (product?.v_ext_grade_name) {
                    detailsMessage += `Exterior Grd: ${product.v_ext_grade_name}\n`;
                }
                // Interior Grade
                if (product?.v_int_grade_name) {
                    detailsMessage += `Interior Grd: ${product.v_int_grade_name}\n`;
                }
                // Mileage
                if (product?.v_mileage) {
                    detailsMessage += `Mileage: ${product.v_mileage} km\n`;
                }
                // Color
                if (product?.v_color_name) {
                    detailsMessage += `Color: ${product.v_color_name}\n`;
                }
                // Fuel
                if (product?.v_fuel_name) {
                    detailsMessage += `Fuel: ${product.v_fuel_name}\n`;
                }
                // Transmission
                if (product?.v_transmission_name) {
                    detailsMessage += `Option: ${product.v_transmission_name}\n`;
                }
                // Engine Capacity (CC)
                if (product?.v_capacity) {
                    detailsMessage += `CC: ${product.v_capacity}\n`;
                }
                // Body Type
                if (product?.v_skeleton_name) {
                    detailsMessage += `Body: ${product.v_skeleton_name}\n`;
                }
                // Seat
                if (product?.v_seat_name) {
                    detailsMessage += `Seat: ${product.v_seat_name}\n`;
                }
                // Chassis Number
                if (product?.v_chassis && product.v_chassis !== 'null') {
                    detailsMessage += `Chassis No: ${product.v_chassis}\n`;
                }
                // Engine Number
                if (product?.v_engine && product.v_engine !== 'null') {
                    detailsMessage += `Engine No: ${product.v_engine}\n`;
                }
                // Tax Token
                if (product?.v_tax_token_exp_date) {
                    detailsMessage += `Tax Token: ${product.v_tax_token_exp_date}\n`;
                }
                // Fitness
                if (product?.v_fitness_exp_date) {
                    detailsMessage += `Fitness: ${product.v_fitness_exp_date}\n`;
                }

                // Feature Specifications
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

                // Price
                // if (price && price !== 'N/A') {
                //     detailsMessage += `\n Price: ${price} BDT\n`;
                // }

                // Product Link
                detailsMessage += `\n View Details & Download Images:\n${url}`;

                message = detailsMessage;
                break;

            case 'oneImageShortDetails':
                // One image with detailed product information for WhatsApp
                const images = product?.vehicle_images || [];

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

                if (images.length > 0) {
                    const firstImage = images[0];

                    try {
                        // Mobile device check
                        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

                        if (isMobile && navigator.share && navigator.canShare) {
                            // Mobile Web Share API - only for mobile
                            try {

                                const response = await fetch(firstImage.url);
                                const blob = await response.blob();
                                const imageFile = new File([blob], `${productName.replace(/[^a-z0-9]/gi, '_')}.jpg`, { type: 'image/jpeg' });

                                const shareData = {
                                    title: productName,
                                    text: oneImageDetailsMessage,
                                    files: [imageFile]
                                };

                                if (navigator.canShare(shareData)) {
                                    await navigator.share(shareData);
                                    console.log("Web Share API successful for one image");
                                    return;
                                }
                            } catch (shareError) {
                                console.log("Web Share API failed:", shareError.message);
                            }
                        }

                        // Fallback for desktop or if Web Share API fails
                        message = oneImageDetailsMessage;

                    } catch (error) {
                        console.error('Share error:', error);
                        message = oneImageDetailsMessage;
                    }
                } else {
                    // No image available
                    message = oneImageDetailsMessage;
                }
                break;

            case 'priceLinkDetailsImage':
                // Same as 'details' case - formatted vehicle details message
                let priceLinkDetailsImageMessage = `*${productName}*\n\n`;

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
                if (price && price !== 'N/A') {
                    priceLinkDetailsImageMessage += `\n Price: ${price} BDT\n`;
                }

                // Product Link
                priceLinkDetailsImageMessage += `\n View Details & Download Images:\n${url}`;

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


            case 'shareLocation':
                let locationMessage = ` Check out My Personal Location:\n\n`;


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
                message = `${productName}\n\nDam: ${price} BDT\n\n${details}\n\nProduct dekhuun: ${url}`;
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

    return (
        // <Dialog open={open} onOpenChange={setOpen}>
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className='text-center font-thin'>Share Product</DialogTitle>
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
                            <span className='text-gray-700'>Share All Feature & Feature Specification</span>
                            <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                {selectedBusinessOption === 'featureAndSpecification' && (
                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                )}
                            </div>
                        </div>


                        {/* Option 1: All Image */}
                        <div
                            className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                            onClick={() => handleBusinessShare('allImages')}
                        >
                            <span className='text-gray-700'>All Image Link (Mobile Version Only)</span>
                            <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                {selectedBusinessOption === 'allImages' && (
                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                )}
                            </div>
                        </div>

                        {/* isMyShop */}

                        {/* Option 2: Details */}
                        <div
                            className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                            onClick={() => handleBusinessShare('details')}
                        >
                            <span className='text-gray-700'>Details & Download Images Link</span>
                            <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                {selectedBusinessOption === 'details' && (
                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                )}
                            </div>
                        </div>

                        {/* Option 2: Details with Price and Details without Price */}
                        {
                            (isMyShop || isCompanyShop) && (
                                <>
                                    <div
                                        className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                        onClick={() => {
                                            setPriceModalType('withPrice');
                                            setPriceModalOpen(true);
                                        }}
                                    >
                                        <span className='text-gray-700'>Details with Price</span>
                                        <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                            {selectedBusinessOption === 'detailsWithPrice' && (
                                                <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                            )}
                                        </div>
                                    </div>

                                    <div
                                        className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                        onClick={() => {
                                            setPriceModalType('withoutPrice');
                                            setPriceModalOpen(true);
                                        }}
                                    >
                                        <span className='text-gray-700'>Details without Price</span>
                                        <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                            {selectedBusinessOption === 'detailsWithoutPrice' && (
                                                <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                            )}
                                        </div>
                                    </div>




                                    <div
                                        className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                        onClick={() => handleBusinessShare('shareLocation')}
                                    >
                                        <span className='text-gray-700'>Location Share</span>
                                        <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                            {selectedBusinessOption === 'shareLocation' && (
                                                <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                            )}
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
                            onClick={() => handleBusinessShare('oneImageShortDetails')}
                        >
                            <span className='text-gray-700'>One Image, Short Details, Download Link</span>
                            <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                {selectedBusinessOption === 'oneImageShortDetails' && (
                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                )}
                            </div>
                        </div>

                        {/* Option 2: Price, Link, Details, Image */}
                        <div
                            className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                            onClick={() => handleBusinessShare('priceLinkDetailsImage')}
                        >
                            <span className='text-gray-700'>Price, Link, Details, Image</span>
                            <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                {selectedBusinessOption === 'priceLinkDetailsImage' && (
                                    <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                )}
                            </div>
                        </div>

                        {
                            (isMyShop || isCompanyShop) && (
                                <>

                                    <div
                                        className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                        onClick={() => handleBusinessShare('sendMyProfile')}
                                    >
                                        <span className='text-gray-700'>Send My Profile</span>
                                        <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                            {selectedBusinessOption === 'sendMyProfile' && (
                                                <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                            )}
                                        </div>
                                    </div>

                                    {
                                        (hasPermissionStockList || isMyShop) && (
                                            <div
                                                className='flex items-center justify-between border border-gray-300 rounded p-3 cursor-pointer hover:bg-gray-50 transition'
                                                onClick={() => handleBusinessShare('stockList')}
                                            >
                                                <span className='text-gray-700'>Stock List</span>
                                                <div className='w-5 h-5 rounded-full border-2 border-gray-400 flex items-center justify-center'>
                                                    {selectedBusinessOption === 'stockList' && (
                                                        <div className='w-3 h-3 rounded-full bg-green-600'></div>
                                                    )}
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
        </Dialog>
    )
}

export default ProductShareModal