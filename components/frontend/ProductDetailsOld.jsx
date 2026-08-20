'use client'
import React, { useEffect, useMemo, useState } from "react";
import ProductDetailsSlider from "@/components/frontend/ProductDetailsSlider";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Copy, Download, Edit, Eye, FileText, GitCompare, PhoneOutgoing, Share2, ShoppingCart } from "lucide-react";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import ProductDetailsDescription from "@/components/frontend/ProductDetailsDescription";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatPrice } from "@/helpers/functions";
import { FaWhatsapp } from "react-icons/fa";
import ProductShareModal from "@/components/modals/ProductShareModal";
import ShopSelectModal from "@/components/modals/ShopSelectModal";
import { useAppContext } from "@/context/AppContext";
import { getSessionId, hasPermission } from "@/lib/utils";
import ModalSlider from "./ModalSlider";
import { parseStoredUser } from "@/lib/parseStoredUser";

dayjs.extend(relativeTime);

const formatProductDetailsDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = dayjs(date);
    if (!parsedDate.isValid()) return "N/A";

    return parsedDate.format("YYYY-MM-DD");
};
const formatDetailValue = (value, suffix = "") => {
    if (value === null || value === undefined) return "-";
    const stringValue = String(value).trim();
    if (!stringValue || stringValue.toLowerCase() === "null") return "-";
    return `${stringValue}${suffix}`;
};

const formatTitleCase = (value) => {
    const stringValue = formatDetailValue(value);
    if (stringValue === "-") return "";
    return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
};

const ProductDetails = ({ productDetails }) => {
    const [sliderImage, setSliderImage] = useState([])
    const [user, setUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [folderName, setFolderName] = useState("");
    const pathname = usePathname();
    const router = useRouter();
    const { addToCart, toggleCompare, isInCompare, permissionList } = useAppContext();
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shopModalOpen, setShopModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showDocumentModal, setShowDocumentModal] = useState(false);
    const [activeDetailsTab, setActiveDetailsTab] = useState("overview");


    const additionalDocumentImages = useMemo(() => (
        Array.isArray(productDetails?.data?.v_docs)
            ? productDetails.data.v_docs
            : Array.isArray(productDetails?.v_docs)
                ? productDetails.v_docs
                : []
    )
        .map((doc) => doc?.url || doc?.secure_url)
        .filter(Boolean), [productDetails]);

    

    const additionalSecretDocumentImages = useMemo(() => (
        Array.isArray(productDetails?.data?.v_secret_docs)
            ? productDetails.data.v_secret_docs
            : Array.isArray(productDetails?.v_secret_docs)
                ? productDetails.v_secret_docs
                : []
    )
        .map((doc) => doc?.url || doc?.secure_url)
        .filter(Boolean), [productDetails]);


    // console.log("productDetails?.data-----------------------", productDetails);

    // ---------- Custom Helper ----------
    let isMyShop = pathname.includes("my-shop");
    let isCompanyShop = pathname.includes("company-shop");
    const userMode = String(user?.user_mode || "").toLowerCase();



    const canShowAdditionalDocument =
        additionalDocumentImages.length > 0 &&
        (
            userMode === "supreme" ||
            (
                (userMode === "pbl" || userMode === "admin") &&
                hasPermission(permissionList, 0, "Vehicle", "AdditionalDocumentShow")
            )
        );


    const canShowAdditionalSecretDocument =
        additionalSecretDocumentImages.length > 0 &&
        !isMyShop &&
        !isCompanyShop &&
        (
            userMode === "supreme" ||
            (
                (userMode === "pbl" || userMode === "admin") &&
                hasPermission(permissionList, 0, "Vehicle", "AdditionalSecretDocumentShow")
            )
        );



    const canShowChassisNumber =
        isMyShop ||
        isCompanyShop ||
        (user && ["supreme", "admin", "pbl"].includes(user.user_type));

    const handleCopy = (e) => {
        e.preventDefault();
        if (productDetails?.v_code) {
            console.log("Original v_code:", productDetails.v_code);

            const cleanedCode = productDetails.v_code.replace(/^[^-]*-/, "");

            navigator.clipboard.writeText(cleanedCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        }
    };

    // console.log("pathname===========", pathname);

    // ID বাদ দিয়ে basePath বের করা
    const basePath =
        "/" +
        pathname
            .split("/")
            .filter(Boolean) // খালি string বাদ দেবে
            .slice(0, -1) // শেষের ID বাদ দেবে
            .join("/");

    const isPublicProductDetails = basePath === "/product";
    const isMyOrCompanyDetails = basePath === "/product/my-shop" || basePath === "/product/company-shop";

    // console.log("basePath===========", basePath);

    useEffect(() => {
        if (productDetails) {
            const sliderImages = [];
            if (productDetails?.vehicle_images && productDetails?.vehicle_images.length > 0) {
                productDetails.vehicle_images.map((img) => {
                    sliderImages.push(img.url);
                });
            }
            if (canShowAdditionalDocument) {
                sliderImages.push(...additionalDocumentImages);
            }
            setSliderImage(sliderImages);
        }
    }, [productDetails, canShowAdditionalDocument, additionalDocumentImages]);

    useEffect(() => {
        const storedUser = parseStoredUser(localStorage.getItem("user"));
        setUser(storedUser);
    }, []);


    // console.log("0000000000000000000000", user);
    // console.log("user", user);


    const downloadAsZip = async () => {
        if (!folderName.trim()) {
            alert("Please enter a folder name");
            return;
        }

        setShowModal(false);

        const zip = new JSZip();
        const folder = zip.folder(folderName);

        for (let i = 0; i < sliderImage.length; i++) {
            try {
                const response = await fetch(sliderImage[i]);
                const blob = await response.blob();
                const fileName = `image-${i + 1}.${blob.type.split("/")[1]}`;
                folder.file(fileName, blob);
            } catch (error) {
                console.error(`Error downloading image ${i + 1}:`, error);
            }
        }

        const content = await zip.generateAsync({ type: "blob" });
        saveAs(content, `${folderName}.zip`);
    };

    const downloadAsUnzip = async () => {
        // if (!folderName.trim()) {
        //     alert("Please enter a folder name");
        //     return;
        // }

        setShowModal(false);

        for (let i = 0; i < sliderImage.length; i++) {
            try {
                const response = await fetch(sliderImage[i]);
                const blob = await response.blob();
                const fileName = `${folderName}-image-${i + 1}.${blob.type.split("/")[1]}`;
                saveAs(blob, fileName);
            } catch (error) {
                console.error(`Error downloading image ${i + 1}:`, error);
            }
        }
    };

    // const domain = process.env.NEXT_PUBLIC_SITE_URL || 'https://pilotbazar.com';

    const getYouTubeVideoId = (url = "") => {
        const rawUrl = String(url || "").trim();
        if (!rawUrl) return "";

        const shortsMatch = rawUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
        if (shortsMatch?.[1]) return shortsMatch[1];

        const embedMatch = rawUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
        if (embedMatch?.[1]) return embedMatch[1];

        const shortLinkMatch = rawUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
        if (shortLinkMatch?.[1]) return shortLinkMatch[1];

        try {
            const parsedUrl = new URL(rawUrl);
            if (parsedUrl.hostname.includes("youtube.com")) {
                const videoId = parsedUrl.searchParams.get("v");
                if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) return videoId;
            }
        } catch (error) {
            return "";
        }

        return "";
    };

    if (!productDetails) {
        return <div>Loading...</div>; // Or some other loading state
    }

    let userVideoLink = "";
    let pblVideoLink = "";
    let genericVideoLink = "";
    let gdocPblLink = "";
    let gdocUserLink = "";
    const rawVideoData = productDetails?.v_video;

    if (rawVideoData && typeof rawVideoData === "object") {
        userVideoLink = rawVideoData?.user ? String(rawVideoData.user).trim() : "";
        pblVideoLink = rawVideoData?.pbl ? String(rawVideoData.pbl).trim() : "";
        gdocPblLink = rawVideoData?.gdocpbl
            ? String(rawVideoData.gdocpbl).trim()
            : (rawVideoData?.gdoc ? String(rawVideoData.gdoc).trim() : "");
        gdocUserLink = rawVideoData?.gdocuser ? String(rawVideoData.gdocuser).trim() : "";
    } else if (typeof rawVideoData === "string") {
        const trimmedVideo = rawVideoData.trim();
        if (trimmedVideo.startsWith("{") && trimmedVideo.endsWith("}")) {
            try {
                const parsedVideo = JSON.parse(trimmedVideo);
                if (parsedVideo && typeof parsedVideo === "object") {
                    userVideoLink = parsedVideo?.user ? String(parsedVideo.user).trim() : "";
                    pblVideoLink = parsedVideo?.pbl ? String(parsedVideo.pbl).trim() : "";
                    gdocPblLink = parsedVideo?.gdocpbl
                        ? String(parsedVideo.gdocpbl).trim()
                        : (parsedVideo?.gdoc ? String(parsedVideo.gdoc).trim() : "");
                    gdocUserLink = parsedVideo?.gdocuser ? String(parsedVideo.gdocuser).trim() : "";
                }
            } catch (error) {
                genericVideoLink = trimmedVideo;
            }
        } else if (trimmedVideo) {
            genericVideoLink = trimmedVideo;
        }
    }

    if (!userVideoLink && productDetails?.v_video_user) {
        userVideoLink = String(productDetails.v_video_user).trim();
    }
    if (!pblVideoLink && productDetails?.v_video_pbl) {
        pblVideoLink = String(productDetails.v_video_pbl).trim();
    }
    if (!gdocPblLink && productDetails?.v_video_gdocpbl) {
        gdocPblLink = String(productDetails.v_video_gdocpbl).trim();
    }
    if (!gdocPblLink && productDetails?.v_video_gdoc) {
        gdocPblLink = String(productDetails.v_video_gdoc).trim();
    }
    if (!gdocUserLink && productDetails?.v_video_gdocuser) {
        gdocUserLink = String(productDetails.v_video_gdocuser).trim();
    }

    const videoSources = [];
    if (userVideoLink) {
        videoSources.push({ label: "User Video", url: userVideoLink });
    } else if (genericVideoLink) {
        videoSources.push({ label: "Video", url: genericVideoLink });
    }
    if (pblVideoLink) {
        videoSources.push({ label: "PBL Video", url: pblVideoLink });
    }

    const youtubeVideos = videoSources
        .map((video) => {
            const videoId = getYouTubeVideoId(video.url);
            if (!videoId) return null;
            return {
                ...video,
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
            };
        })
        .filter(Boolean);

    const userYoutubeVideo =
        youtubeVideos.find((video) => video.label === "User Video") ||
        youtubeVideos.find((video) => video.label === "Video") ||
        null;
    const pblYoutubeVideo = youtubeVideos.find((video) => video.label === "PBL Video") || null;
    const selectedYoutubeVideo = (isMyShop || isCompanyShop) ? userYoutubeVideo : pblYoutubeVideo;

    const selectedGdocLink = (isMyShop || isCompanyShop)
        ? (gdocUserLink || gdocPblLink || "")
        : (gdocPblLink || "");
    const shouldShowGdocButton = Boolean(selectedGdocLink);

    const handleGdocOpen = () => {
        if (!selectedGdocLink) {
            toast.error("Document link not available.");
            return;
        }

        const normalizedLink = /^https?:\/\//i.test(selectedGdocLink) ? selectedGdocLink : `https://${selectedGdocLink}`;
        window.open(normalizedLink, "_blank", "noopener,noreferrer");
    };

    const handleOpenAdditionalSecretDocumentModal = () => {
        if (additionalSecretDocumentImages.length === 0) {
            toast.error("Additional secret document not available.");
            return;
        }

        setShowDocumentModal(true);
    };



    const handleCopyClick = async () => {
        let detailsToCopy = '';

        // Brand
        if (productDetails?.v_brand_name) {
            detailsToCopy += `Brand : ${productDetails?.v_brand_name}\n`;
        }
        // Model
        if (productDetails?.v_model_name) {
            detailsToCopy += `Model: ${productDetails?.v_model_name}\n`;
        }
        // Package
        if (productDetails?.v_edition_name) {
            detailsToCopy += `Package: ${productDetails?.v_edition_name}\n`;
        }
        // Condition
        if (productDetails?.v_condition_name) {
            detailsToCopy += `Condition : ${productDetails?.v_condition_name}\n`;
        }
        // Model Yr
        if (productDetails?.v_mod_year) {
            detailsToCopy += `Model Yr : ${productDetails?.v_mod_year}\n`;
        }
        // Reg Yr
        if (productDetails?.v_registration) {
            detailsToCopy += `Reg Yr : ${productDetails?.v_registration}\n`;
        }
        // Grade
        if (productDetails?.v_grade_name) {
            detailsToCopy += `Grade : ${productDetails?.v_grade_name}\n`;
        }
        // Exterior Grd
        if (productDetails?.v_ext_grade_name) {
            detailsToCopy += `Exterior Grd : ${productDetails?.v_ext_grade_name}\n`;
        }
        // Interior Grd
        if (productDetails?.v_int_grade_name) {
            detailsToCopy += `Interior Grd : ${productDetails?.v_int_grade_name}\n`;
        }
        // Mileage
        if (productDetails?.v_mileage) {
            detailsToCopy += `Mileage: ${productDetails?.v_mileage}\n`;
        }
        // Color
        if (productDetails?.v_color_name) {
            detailsToCopy += `Color: ${productDetails?.v_color_name}\n`;
        }
        // Fuel
        if (productDetails?.v_fuel_name) {
            detailsToCopy += `Fuel : ${productDetails?.v_fuel_name}\n`;
        }
        // Option
        if (productDetails?.v_transmission_name) {
            detailsToCopy += `Option : ${productDetails?.v_transmission_name}\n`;
        }
        // CC
        if (productDetails?.v_capacity) {
            detailsToCopy += `CC : ${productDetails?.v_capacity}\n`;
        }
        // Body
        if (productDetails?.v_skeleton_name) {
            detailsToCopy += `Body : ${productDetails?.v_skeleton_name}\n`;
        }
        // Seat
        if (productDetails?.v_seat_name) {
            detailsToCopy += `Seat : ${productDetails?.v_seat_name}\n`;
        }
        // Chassis No
        if (productDetails?.v_chassis) {
            detailsToCopy += `Chassis No : ${productDetails?.v_chassis}\n`;
        }
        // Engine No
        if (productDetails?.v_engine) {
            detailsToCopy += `Engine No: ${productDetails?.v_engine}\n`;
        }
        // Tax Token
        if (productDetails?.v_tax_token_exp_date) {
            detailsToCopy += `Tax Token : ${productDetails?.v_tax_token_exp_date}\n`;
        }
        // Fitness
        if (productDetails?.v_fitness_exp_date) {
            detailsToCopy += `Fitness : ${productDetails?.v_fitness_exp_date}\n`;
        }
        // Auction type
        if (!isMyShop && !isCompanyShop && productDetails?.v_auction_type) {
            detailsToCopy += `Auction Type : ${productDetails?.v_auction_type}\n`;
        }

        try {
            await navigator.clipboard.writeText(detailsToCopy);
            toast.success('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert('Failed to copy details.');
        }
    };


    const handleFeatureCopyClick = () => {
        if (!productDetails?.feature_specification) return;

        // প্রতিটা ফিচার থেকে ডাটা ফরম্যাট করা
        const featureText = productDetails.feature_specification
            .map((feature) => {
                if (
                    feature?.specification?.length > 0 &&
                    feature.specification.some((item) => item.is_selected)
                ) {
                    const selectedItems = feature.specification
                        .filter((item) => item.is_selected)
                        .map((item) => item.fs_title)
                        .join(", "); // কমা দিয়ে join

                    return `${feature.md_title}: ${selectedItems}`;
                }
                return null;
            })
            .filter(Boolean) // null বাদ দিচ্ছে
            .join("\n"); // নতুন লাইনে যোগ করবে

        // Clipboard এ কপি করা
        navigator.clipboard.writeText(featureText).then(() => {
            toast.success("Copied to clipboard!");
        });
    };

    const handleCopyAllClick = () => {
        let allDetails = '';

        // Features সেকশন
        allDetails += `\nFeatures:\n`;

        // Brand
        if (productDetails?.v_brand_name) {
            allDetails += `Brand : ${productDetails?.v_brand_name}\n`;
        }
        // Model
        if (productDetails?.v_model_name) {
            allDetails += `Model: ${productDetails?.v_model_name}\n`;
        }
        // Package
        if (productDetails?.v_edition_name) {
            allDetails += `Package: ${productDetails?.v_edition_name}\n`;
        }
        // Condition
        if (productDetails?.v_condition_name) {
            allDetails += `Condition : ${productDetails?.v_condition_name}\n`;
        }
        // Model Yr
        if (productDetails?.v_mod_year) {
            allDetails += `Model Yr : ${productDetails?.v_mod_year}\n`;
        }
        // Reg Yr
        if (productDetails?.v_registration) {
            allDetails += `Reg Yr : ${productDetails?.v_registration}\n`;
        }
        // Grade
        if (productDetails?.v_grade_name) {
            allDetails += `Grade : ${productDetails?.v_grade_name}\n`;
        }
        // Exterior Grd
        if (productDetails?.v_ext_grade_name) {
            allDetails += `Exterior Grd : ${productDetails?.v_ext_grade_name}\n`;
        }
        // Interior Grd
        if (productDetails?.v_int_grade_name) {
            allDetails += `Interior Grd : ${productDetails?.v_int_grade_name}\n`;
        }
        // Mileage
        if (productDetails?.v_mileage) {
            allDetails += `Mileage: ${productDetails?.v_mileage}\n`;
        }
        // Color
        if (productDetails?.v_color_name) {
            allDetails += `Color: ${productDetails?.v_color_name}\n`;
        }
        // Fuel
        if (productDetails?.v_fuel_name) {
            allDetails += `Fuel : ${productDetails?.v_fuel_name}\n`;
        }
        // Option
        if (productDetails?.v_transmission_name) {
            allDetails += `Option : ${productDetails?.v_transmission_name}\n`;
        }
        // CC
        if (productDetails?.v_capacity) {
            allDetails += `CC : ${productDetails?.v_capacity}\n`;
        }
        // Body
        if (productDetails?.v_skeleton_name) {
            allDetails += `Body : ${productDetails?.v_skeleton_name}\n`;
        }
        // Seat
        if (productDetails?.v_seat_name) {
            allDetails += `Seat : ${productDetails?.v_seat_name}\n`;
        }
        // Chassis No
        if (productDetails?.v_chassis) {
            allDetails += `Chassis No : ${productDetails?.v_chassis}\n`;
        }
        // Engine No
        if (productDetails?.v_engine) {
            allDetails += `Engine No: ${productDetails?.v_engine}\n`;
        }
        // Tax Token
        if (productDetails?.v_tax_token_exp_date) {
            allDetails += `Tax Token : ${productDetails?.v_tax_token_exp_date}\n`;
        }
        // Fitness
        if (productDetails?.v_fitness_exp_date) {
            allDetails += `Fitness : ${productDetails?.v_fitness_exp_date}\n`;
        }

        // Specific Features সেকশন
        if (productDetails?.feature_specification && productDetails.feature_specification.length > 0) {
            allDetails += `\nSpecific Features:\n`;

            const featureText = productDetails.feature_specification
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

        // Clipboard এ কপি করা
        navigator.clipboard.writeText(allDetails).then(() => {
            toast.success("All details copied to clipboard!");
        }).catch(err => {
            console.error('Failed to copy: ', err);
            toast.error('Failed to copy details.');
        });
    };

    const handleImageShare = async () => {
        if (!sliderImage || sliderImage.length === 0) {
            toast.error('No images to share.');
            return;
        }

        const domain = 'https://click4details.app';

        const shouldUseShopProductUrl =
            pathname.startsWith("/my-shop/") ||
            pathname.startsWith("/company-shop/") ||
            pathname.startsWith("/member-shop/") ||
            pathname.startsWith("/user-shop/") ||
            pathname.startsWith("/product/my-shop") ||
            pathname.startsWith("/product/company-shop");
        const productPath = shouldUseShopProductUrl
            ? `/product/my-shop/${productDetails?.v_id}`
            : `/product/${productDetails?.v_id}`;
        const productUrl = `${domain}${productPath}`;

        const text = `Check out this product: ${productUrl}`;
        const title = productDetails?.v_title || 'Product Images';

        // Use Web Share API if available

        if (navigator.share) {
            const toastId = toast.loading('Preparing images...');
            try {
                const files = await Promise.all(
                    sliderImage.map(async (imageUrl, index) => {
                        const response = await fetch(imageUrl);
                        if (!response.ok) {
                            throw new Error(`Failed to fetch image: ${response.statusText}`);
                        }
                        const blob = await response.blob();
                        const fileName = `image-${index + 1}.${blob.type.split('/')[1] || 'jpg'}`;
                        return new File([blob], fileName, { type: blob.type });
                    })
                );

                await navigator.share({
                    files: files,
                    title,
                    text,
                });

                toast.success('Shared!', { id: toastId });
            } catch (error) {
                toast.dismiss(toastId);

                if (error.name !== 'AbortError') {
                    console.log("Share failed:", error);

                    try {
                        // 🔄 fallback to share only first image as file
                        const response = await fetch(sliderImage[0]);
                        const blob = await response.blob();
                        const firstFile = new File([blob], "image-1.jpg", { type: blob.type });

                        await navigator.share({
                            files: [firstFile],
                            title,
                            text,
                        });
                    } catch (fallbackError) {
                        console.log("Fallback also failed:", fallbackError);

                        // last fallback - share link via WhatsApp
                        const messageText = `${productDetails?.v_title}\nBrand : ${productDetails?.v_brand_name}\nModel: ${productDetails?.v_model_name}\n \nFor more pictures and details, please browse our website link provided below: ${productUrl}`;
                        const message = `${sliderImage[0]}\n${messageText}`;
                        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                    }
                }
            }
        } else {
            // Fallback for browsers without Web Share API
            const messageText = `${productDetails?.v_title}\n Brand : ${productDetails?.v_brand_name}\nModel: ${productDetails?.v_model_name}\n \nFor more pictures and details, please browse our website link provided below: ${productUrl}`;
            const message = `${messageText}`;
            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }



        // if (navigator.share) {
        //     const toastId = toast.loading('Preparing images...');
        //     try {
        //         const files = await Promise.all(
        //             sliderImage.map(async (imageUrl, index) => {
        //                 const response = await fetch(imageUrl);
        //                 if (!response.ok) {
        //                     throw new Error(`Failed to fetch image: ${response.statusText}`);
        //                 }
        //                 const blob = await response.blob();
        //                 const fileName = `image-${index + 1}.${blob.type.split('/')[1] || 'jpg'}`;
        //                 return new File([blob], fileName, { type: blob.type });
        //             })
        //         );

        //         await navigator.share({
        //             files: files,
        //             title: title,
        //             text: text,
        //         });
        //         toast.success('Shared!', { id: toastId });
        //     } catch (error) {
        //         toast.dismiss(toastId);
        //         if (error.name !== 'AbortError') {
        //             console.log("Share failed:", error);
        //             const messageText = `${productDetails?.v_title}\nMore details: ${productUrl}`;
        //             const message = `${sliderImage[0]}\n${messageText}`;
        //             const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        //              window.open(whatsappUrl, '_blank');
        //         }
        //     }
        // } else {
        //     const messageText = `${productDetails?.v_title}\nMore details: ${productUrl}`;
        //     const message = `${sliderImage[0]}\n${messageText}`;
        //     const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
        //     window.open(whatsappUrl, '_blank');
        // }
    };

    const handleEditProduct = (item) => {
        if (!item?.v_id) return;
        router.push(`/dashboard/products/vehicle/edit/${item.v_id}`);
    };

    const handleAddToCart = (item) => {
        if (!item?.v_id) return;

        let price = 0;
        const rawPrice = isMyOrCompanyDetails
            ? item?.vehicle_price?.user_price
            : item?.vehicle_price?.pbl_price;

        if (rawPrice !== "Call for Price") {
            price = rawPrice;
        }

        const priceId = item?.vehicle_price?.v_price_id;

        const cartItem = {
            c_user_id: user?.id || null,
            c_session_id: user?.id ? null : getSessionId(),
            ci_product_id: item.v_id,
            ci_type_id: item?.v_category?.c_id,
            ci_qty: 1,
            ci_price: price || 0,
            ci_url: item?.vehicle_front_image?.url || "",
            ci_name: item.v_title,
            ci_subtotal: price * 1,
            ci_product_price_id: priceId,
        };

        addToCart(item.v_id, cartItem);
    };

    const handleCallClick = () => {
        const phoneNumber = user?.phone || "+8809638660077";
        window.location.href = `tel:${phoneNumber}`;
    };

    const handleWhatsappClick = () => {
        const rawPhoneNumber = "+8801407054400";
        const phoneNumber = rawPhoneNumber.replace("+", "");
        const productDetailsUrl = window.location.href;
        const message = `Hello,\nI am interested about this product. Please give me more information.\n${productDetailsUrl}`;
        const whatsappText = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${whatsappText}`;
        window.open(whatsappUrl, "_blank");
    };

    const rawDisplayPrice = isMyOrCompanyDetails
        ? productDetails?.vehicle_price?.user_price
        : productDetails?.vehicle_price?.pbl_price;
    const hasDisplayPrice = rawDisplayPrice !== undefined && rawDisplayPrice !== null && rawDisplayPrice !== "" && rawDisplayPrice !== "Call for Price";
    const displayCurrency = productDetails?.vehicle_db_price?.vp_currency;
    const displayPrice = hasDisplayPrice
        ? `${displayCurrency ? `${displayCurrency}. ` : ""}${formatPrice(rawDisplayPrice)}`
        : "Call for Price";
    const displayPriceStatus = basePath === "/product"
        ? productDetails?.vehicle_db_price?.vp_pbl_price_status
        : productDetails?.vehicle_db_price?.vp_user_price_status;
    const displayPriceStatusText = formatTitleCase(displayPriceStatus);
    const listedText = productDetails?.v_created_at
        ? `Listed ${dayjs(productDetails.v_created_at).fromNow()}`
        : "Recently listed";
    const gradeBadgeText = [productDetails?.v_grade_name, productDetails?.v_ext_grade_name || productDetails?.v_int_grade_name]
        .map((value) => formatDetailValue(value))
        .filter((value) => value !== "-")
        .join("/");
    const agencyName = formatDetailValue(productDetails?.shop?.s_name || productDetails?.user?.name || "Pilot Bazar Ltd.");

    const gdocDownloadControl = shouldShowGdocButton ? (
        <button
            type="button"
            onClick={handleGdocOpen}
            className="inline-flex items-center justify-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
        >
            <Download className="h-3.5 w-3.5" />
            Open
        </button>
    ) : null;

    const vehicleSpecItems = [
        { label: "Brand", value: formatDetailValue(productDetails?.v_brand_name) },
        { label: "Model", value: formatDetailValue(productDetails?.v_model_name) },
        { label: "Package", value: formatDetailValue(productDetails?.v_edition_name) },
        { label: "Condition", value: formatDetailValue(productDetails?.v_condition_name) },
        { label: "Model Yr.", value: formatDetailValue(productDetails?.v_mod_year) },
        { label: "Reg Yr.", value: formatDetailValue(productDetails?.v_registration) },
        { label: "Grade", value: formatDetailValue(productDetails?.v_grade_name) },
        { label: "Exterior Grd", value: formatDetailValue(productDetails?.v_ext_grade_name) },
        { label: "Interior Grd", value: formatDetailValue(productDetails?.v_int_grade_name) },
        { label: "Mileage", value: formatDetailValue(productDetails?.v_mileage, productDetails?.v_mileage ? " KM" : "") },
        !isMyShop && !isCompanyShop ? { label: "Auction Type", value: formatDetailValue(productDetails?.v_auction_type ? String(productDetails.v_auction_type).toUpperCase() : "") } : null,
        { label: "Color", value: formatDetailValue(productDetails?.v_color_name) },
        { label: "Fuel", value: formatDetailValue(productDetails?.v_fuel_name) },
        { label: "Option", value: formatDetailValue(productDetails?.v_transmission_name) },
        { label: "CC", value: formatDetailValue(productDetails?.v_capacity) },
        { label: "Body Style", value: formatDetailValue(productDetails?.v_skeleton_name) },
        { label: "Seat Count", value: formatDetailValue(productDetails?.v_seat_name) },
        canShowChassisNumber ? { label: "Chassis No", value: formatDetailValue(productDetails?.v_chassis) } : null,
        { label: "Engine No", value: formatDetailValue(productDetails?.v_engine) },
        { label: "Tax Token", value: formatProductDetailsDate(productDetails?.v_tax_token_exp_date) },
        { label: "Fitness", value: formatProductDetailsDate(productDetails?.v_fitness_exp_date) },
        { label: "Arrival Date", value: formatProductDetailsDate(productDetails?.v_arrival_date) },
        gdocDownloadControl ? { label: "Download Pic", value: gdocDownloadControl } : null,
    ].filter(Boolean);

    const specMidpoint = Math.ceil(vehicleSpecItems.length / 2);
    const specLeftItems = vehicleSpecItems.slice(0, specMidpoint);
    const specRightItems = vehicleSpecItems.slice(specMidpoint);

    const selectedFeatureGroups = Array.isArray(productDetails?.feature_specification)
        ? productDetails.feature_specification
            .map((feature) => ({
                title: formatDetailValue(feature?.md_title, ""),
                items: Array.isArray(feature?.specification)
                    ? feature.specification.filter((item) => item?.is_selected && item?.fs_title)
                    : [],
            }))
            .filter((feature) => feature.title !== "-" && feature.items.length > 0)
        : [];
    const selectedFeatureChips = selectedFeatureGroups.flatMap((feature) => feature.items.map((item) => item.fs_title)).slice(0, 14);
    const featureAccentStyles = [
        { dot: "bg-amber-400", text: "text-amber-600", border: "border-amber-100" },
        { dot: "bg-indigo-400", text: "text-indigo-600", border: "border-indigo-100" },
        { dot: "bg-sky-400", text: "text-sky-600", border: "border-sky-100" },
        { dot: "bg-yellow-400", text: "text-yellow-600", border: "border-yellow-100" },
        { dot: "bg-violet-400", text: "text-violet-600", border: "border-violet-100" },
        { dot: "bg-emerald-400", text: "text-emerald-600", border: "border-emerald-100" },
    ];
    const detailTabs = [
        { id: "overview", label: "Overview" },
        { id: "warranty", label: "Warranty & Policy" },
        { id: "auction", label: "Auction Guarantee" },
    ];

    const renderSpecValue = (value) => (
        React.isValidElement(value) ? value : <span>{formatDetailValue(value)}</span>
    );

    const renderTopActions = () => (
        <div className="flex flex-wrap items-center gap-2">
            <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
                <Share2 className="h-4 w-4" />
                Copy Share Link
            </button>
            <button
                type="button"
                onClick={handleCopyAllClick}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700"
            >
                <FileText className="h-4 w-4" />
                Copy Spec Sheet
            </button>
        </div>
    );

    const renderQuickActions = (isMobile = false) => (
        <div className={isMobile ? "grid grid-cols-4 gap-2 sm:grid-cols-7" : "flex flex-wrap items-center gap-2"}>
            {isPublicProductDetails && (
                <button
                    type="button"
                    onClick={() => setShopModalOpen(true)}
                    title="Copy to shop"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                >
                    <Copy className="h-4 w-4" />
                    {!isMobile && <span>Shop</span>}
                </button>
            )}

            <button
                type="button"
                onClick={() => setShareModalOpen(true)}
                title="Share product"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
            >
                <Share2 className="h-4 w-4" />
                {!isMobile && <span>Share</span>}
            </button>

            {!isMyShop && !isCompanyShop && (
                <button
                    type="button"
                    onClick={handleCallClick}
                    title="Call seller"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-3 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                >
                    <PhoneOutgoing className="h-4 w-4" />
                    {!isMobile && <span>Call</span>}
                </button>
            )}

            {isPublicProductDetails && (
                <button
                    type="button"
                    onClick={handleWhatsappClick}
                    title="WhatsApp"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 text-xs font-bold text-green-700 transition hover:bg-green-100"
                >
                    <FaWhatsapp className="h-4 w-4" />
                    {!isMobile && <span>WhatsApp</span>}
                </button>
            )}

            {!isMyShop && !isCompanyShop && (
                <button
                    type="button"
                    onClick={() => handleAddToCart(productDetails)}
                    title="Add to cart"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-orange-100 bg-orange-50 px-3 text-xs font-bold text-orange-700 transition hover:bg-orange-100"
                >
                    <ShoppingCart className="h-4 w-4" />
                    {!isMobile && <span>Cart</span>}
                </button>
            )}

            <button
                type="button"
                onClick={() => toggleCompare(productDetails?.v_id)}
                title={isInCompare(productDetails?.v_id) ? "Remove from compare" : "Add to compare"}
                aria-label={isInCompare(productDetails?.v_id) ? "Remove from compare" : "Add to compare"}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold transition ${isInCompare(productDetails?.v_id)
                    ? "border-cyan-600 bg-cyan-600 text-white"
                    : "border-cyan-100 bg-cyan-50 text-cyan-700 hover:bg-cyan-100"}`}
            >
                <GitCompare className="h-4 w-4" />
                {!isMobile && <span>{isInCompare(productDetails?.v_id) ? "Added" : "Compare"}</span>}
            </button>

            {isMyOrCompanyDetails && (
                <button
                    type="button"
                    onClick={() => handleEditProduct(productDetails)}
                    title="Edit product"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-pink-100 bg-pink-50 px-3 text-xs font-bold text-pink-700 transition hover:bg-pink-100"
                >
                    <Edit className="h-4 w-4" />
                    {!isMobile && <span>Edit</span>}
                </button>
            )}
        </div>
    );

    const renderDownloadModal = () => showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
            <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
                <h2 className="text-lg font-bold text-slate-900">Enter Folder Name</h2>
                <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Folder name..."
                    className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => setShowModal(false)}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={downloadAsZip}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                        Download ZIP
                    </button>
                    <button
                        type="button"
                        onClick={downloadAsUnzip}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
                    >
                        Gallery
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    return (
        <div className="min-h-screen bg-slate-50 px-3 py-4 text-slate-900 sm:px-5 lg:px-8">
            <div className="mx-auto max-w-[1880px]">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <nav className="text-[11px] font-semibold text-slate-500">
                        <span>Inventory</span>
                        <span className="mx-2 text-slate-300">/</span>
                        <span>{formatDetailValue(productDetails?.v_brand_name)}</span>
                        <span className="mx-2 text-slate-300">/</span>
                        <span className="text-slate-900">{formatDetailValue(productDetails?.v_title)}</span>
                    </nav>
                    {renderTopActions()}
                </div>

                <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(520px,0.98fr)]">
                    <section className="min-w-0 space-y-4">
                        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="rounded bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                                            Reconditioned Special
                                        </span>
                                        {gradeBadgeText && (
                                            <span className="rounded bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-700">
                                                USS Grade: {gradeBadgeText}
                                            </span>
                                        )}
                                    </div>
                                    <h1 className="mt-3 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
                                        {formatDetailValue(productDetails?.v_title)}
                                    </h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-500">
                                        <span>{listedText}</span>
                                        <span className="h-1 w-1 rounded-full bg-slate-300" />
                                        <span>Verified Chassis ID available</span>
                                    </div>
                                </div>
                                <div className="shrink-0 text-left sm:text-right">
                                    <p className="text-[10px] font-bold text-slate-400">Importer Agency</p>
                                    <p className="mt-1 text-sm font-black text-blue-800">{agencyName}</p>
                                </div>
                            </div>

                            <div className="mt-4 lg:hidden">
                                {renderQuickActions(true)}
                            </div>
                        </div>

                        <ProductDetailsSlider images={sliderImage} />

                        <div className="rounded-lg bg-slate-950 p-4 text-white shadow-sm">
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Asking Price</p>
                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                        <p className="text-2xl font-black tracking-tight md:text-3xl">{displayPrice}</p>
                                        {displayPriceStatusText && (
                                            <span className="rounded bg-emerald-500/15 px-2 py-1 text-[10px] font-black text-emerald-300">
                                                {displayPriceStatusText}
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleCopy}
                                        className="mt-1 text-xs font-semibold text-slate-400 transition hover:text-white"
                                    >
                                        Code: {copied ? "Copied!" : formatDetailValue(productDetails?.v_code)}
                                    </button>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    {!isMyShop && !isCompanyShop && (
                                        <button
                                            type="button"
                                            onClick={handleCallClick}
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-5 text-sm font-black uppercase text-white transition hover:bg-emerald-400"
                                        >
                                            <PhoneOutgoing className="h-4 w-4" />
                                            Contact Seller
                                        </button>
                                    )}
                                    {isPublicProductDetails && (
                                        <button
                                            type="button"
                                            onClick={handleWhatsappClick}
                                            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 px-5 text-sm font-black text-white transition hover:bg-white/15"
                                        >
                                            <FaWhatsapp className="h-4 w-4" />
                                            Book Viewing
                                        </button>
                                    )}
                                    {canShowAdditionalSecretDocument && (
                                        <button
                                            type="button"
                                            onClick={handleOpenAdditionalSecretDocumentModal}
                                            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-3 text-white transition hover:bg-white/15"
                                            title="View additional secret documents"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(true)}
                                        className="inline-flex h-11 items-center justify-center rounded-lg border border-white/15 bg-white/10 px-3 text-white transition hover:bg-white/15"
                                        title="Download images"
                                    >
                                        <Download className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:block">
                            {renderQuickActions(false)}
                        </div>

                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="grid grid-cols-3 border-b border-slate-200 text-center text-xs font-black text-slate-500">
                                {detailTabs.map((tab) => {
                                    const isActive = activeDetailsTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            type="button"
                                            onClick={() => setActiveDetailsTab(tab.id)}
                                            className={`border-b-2 px-3 py-3 transition ${isActive
                                                ? "border-blue-700 text-blue-800"
                                                : "border-transparent text-slate-500 hover:text-blue-700"}`}
                                        >
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="bg-slate-50/70 p-4">
                                <ProductDetailsDescription productDetails={productDetails} basePath={basePath} activeTab={activeDetailsTab} />
                            </div>
                        </div>
                    </section>

                    <aside className="min-w-0 space-y-4">
                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="divide-y divide-slate-100">
                                {specLeftItems.map((leftItem, index) => {
                                    const rightItem = specRightItems[index];
                                    return (
                                        <div key={`${leftItem.label}-${index}`} className="grid grid-cols-1 md:grid-cols-2">
                                            <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 px-4 py-2.5 text-xs md:border-r md:border-slate-100">
                                                <span className="font-bold text-slate-400">{leftItem.label}:</span>
                                                <span className="text-right font-black text-slate-950">{renderSpecValue(leftItem.value)}</span>
                                            </div>
                                            {rightItem ? (
                                                <div className="grid grid-cols-[112px_minmax(0,1fr)] gap-3 border-t border-slate-100 px-4 py-2.5 text-xs md:border-t-0">
                                                    <span className="font-bold text-slate-400">{rightItem.label}:</span>
                                                    <span className="text-right font-black text-slate-950">{renderSpecValue(rightItem.value)}</span>
                                                </div>
                                            ) : (
                                                <div className="hidden md:block" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                                <h2 className="text-sm font-black text-slate-800">Equipment Details & Accessories</h2>
                                {selectedFeatureGroups.length > 0 && (
                                    <span className="text-[10px] font-black uppercase text-emerald-500">Fully Loaded</span>
                                )}
                            </div>

                            {selectedFeatureGroups.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-2">
                                        {selectedFeatureGroups.map((feature, index) => {
                                            const accent = featureAccentStyles[index % featureAccentStyles.length];
                                            return (
                                                <div key={`${feature.title}-${index}`} className={`rounded-lg border ${accent.border} bg-slate-50/60 p-3`}>
                                                    <h3 className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] ${accent.text}`}>
                                                        <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                                                        {feature.title}
                                                    </h3>
                                                    <div className="mt-3 space-y-2">
                                                        {feature.items.slice(0, 6).map((item, itemIndex) => (
                                                            <div key={`${item.fs_title}-${itemIndex}`} className="flex items-center justify-between gap-3 text-xs">
                                                                <span className="min-w-0 truncate text-slate-500">{item.fs_title}</span>
                                                                <span className="shrink-0 font-black text-slate-800">Included</span>
                                                            </div>
                                                        ))}
                                                        {feature.items.length > 6 && (
                                                            <p className="text-[11px] font-bold text-slate-400">+{feature.items.length - 6} more</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {selectedFeatureChips.length > 0 && (
                                        <div className="border-t border-slate-100 px-4 py-3">
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">Selected Highlights</h3>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {selectedFeatureChips.map((item) => (
                                                    <span key={item} className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                                                        {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="p-8 text-center text-sm font-semibold text-slate-500">
                                    No accessory details available.
                                </div>
                            )}
                        </div>

                        {selectedYoutubeVideo && (
                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-200 px-4 py-3">
                                    <h2 className="text-sm font-black text-slate-800">YouTube Video</h2>
                                </div>
                                <div className="p-4">
                                    <p className="mb-2 text-xs font-bold text-slate-500">{selectedYoutubeVideo.label}</p>
                                    <div className="relative w-full overflow-hidden rounded-lg bg-slate-950" style={{ paddingTop: "56.25%" }}>
                                        <iframe
                                            src={selectedYoutubeVideo.embedUrl}
                                            title={selectedYoutubeVideo.label}
                                            className="absolute left-0 top-0 h-full w-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>

            {renderDownloadModal()}
            <ProductShareModal open={shareModalOpen} setOpen={setShareModalOpen} product={productDetails} />
            <ShopSelectModal open={shopModalOpen} setOpen={setShopModalOpen} product={productDetails} />
            {showDocumentModal && (
                <ModalSlider
                    setShowModal={setShowDocumentModal}
                    images={additionalSecretDocumentImages}
                    activeIndex={0}
                />
            )}
        </div>
    );
};

export default ProductDetails;
