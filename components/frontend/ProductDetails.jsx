'use client'
import React, { useEffect, useMemo, useState } from "react";
import ProductDetailsSlider from "@/components/frontend/ProductDetailsSlider";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Copy, Download, Edit, Eye, GitCompare, PhoneOutgoing, Share2, ShoppingCart } from "lucide-react";
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

dayjs.extend(relativeTime);

const formatProductDetailsDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = dayjs(date);
    if (!parsedDate.isValid()) return "N/A";

    return parsedDate.format("YYYY-MM-DD");
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
        const userData = localStorage.getItem("user");
        if (!userData) {
            setUser(null);
            return;
        }

        try {
            const userInfo = JSON.parse(userData);
            const normalizedUser = typeof userInfo === "string" ? JSON.parse(userInfo) : userInfo;
            setUser(normalizedUser);
        } catch (error) {
            console.error("Failed to parse user info:", error);
            setUser(null);
        }
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
        const phoneNumber = user?.phone || "+8801969944400";
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

    return (
        <div className="px-4">
            <div>
                <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center mt-4">
                    <div>
                        <p className="text-xl font-bold md:text-3xl md:font-medium">{productDetails?.v_title}</p>
                        <span className="text-gray-500">{dayjs(productDetails?.v_created_at).fromNow()}</span>
                    </div>

                    <div className="hidden md:flex md:items-center md:justify-end gap-2 flex-wrap">
                        <div className="flex gap-2">
                            {isPublicProductDetails && (
                                <button
                                    onClick={() => setShopModalOpen(true)}
                                    className="flex-1 border border-blue-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Copy className="h-4 w-4 text-blue-600" />
                                    </div>
                                </button>
                            )}

                            <button
                                onClick={() => setShareModalOpen(true)}
                                className="flex-1 border border-green-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Share2 className="h-4 w-4 text-green-600" />
                                </div>
                            </button>

                            {
                                (!isMyShop && !isCompanyShop) && (
                                    <button
                                        onClick={handleCallClick}
                                        className="flex-1 border border-purple-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <PhoneOutgoing className="h-4 w-4 text-purple-600" />
                                        </div>
                                    </button>
                                )
                            }

                            {isPublicProductDetails && (
                                <button
                                    onClick={handleWhatsappClick}
                                    className="flex-1 border-2 border-green-600 font-bold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <FaWhatsapp className="h-6 w-6 text-green-600" />
                                    </div>
                                </button>
                            )}

                            {
                                (!isMyShop && !isCompanyShop) && (
                                    <button
                                        onClick={() => handleAddToCart(productDetails)}
                                        className="flex-1 border border-orange-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <ShoppingCart className="h-4 w-4 text-orange-600" />
                                        </div>
                                    </button>
                                )
                            }

                            <button
                                type="button"
                                onClick={() => toggleCompare(productDetails?.v_id)}
                                title={isInCompare(productDetails?.v_id) ? "Remove from compare" : "Add to compare"}
                                aria-label={isInCompare(productDetails?.v_id) ? "Remove from compare" : "Add to compare"}
                                className={`flex-1 border font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 ${isInCompare(productDetails?.v_id) ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-cyan-300'}`}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <GitCompare className={`h-4 w-4 ${isInCompare(productDetails?.v_id) ? 'text-white' : 'text-cyan-600'}`} />
                                    {isInCompare(productDetails?.v_id) && (
                                        <span className="text-xs text-white">Added</span>
                                    )}
                                </div>
                            </button>

                            {isMyOrCompanyDetails && (
                                <button
                                    onClick={() => handleEditProduct(productDetails)}
                                    className="flex-1 border border-pink-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Edit className="h-4 w-4 text-pink-600" />
                                    </div>
                                </button>
                            )}
                        </div>

                        <button
                            onClick={handleCopyAllClick}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
                        >
                            <Copy className="h-4 w-4" />
                            <span>Copy All Features & Specific Features</span>
                        </button>
                    </div>

                    {/* <div className="w-full md:w-[39.5%] border border-gray-200 rounded-lg shadow p-2 space-y-2">
                        <div>
                            <div className="md:flex md:justify-between">
                                <div className="flex space-x-4">
                                    <div>
                                        <div>
                                            <h2 className="text-sm text-gray-500  pb-1">Seller Mobile Number</h2>
                                        </div>
                                        <div className="mb-2">
                                            <p className="text-xl font-bold text-gray-800">
                                                {
                                                    user ? (
                                                        <a href={`tel:${user?.phone}`}>{user?.phone}</a>
                                                    ) : (
                                                        <a href="tel:+8801969944400">+8801969944400</a>
                                                    )
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2 text-center items-center">
                                        <div>
                                            <a
                                                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${domain}/product/${productDetails?.v_id}`)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg transition duration-300 ease-in-out text-white"
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
                                    </div>
                                </div>
                                <div className="">
                                    <div>
                                        <h2 className="text-sm text-gray-500  pb-1">Seller Name</h2>
                                    </div>
                                    <div className="mb-2">
                                        <p className="text-xl font-bold text-gray-800"> {user && user.name ? user.name : 'click4Details Limited'} </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2 mb-6">
                <div className="md:col-span-3">
                    <div>
                        <ProductDetailsSlider images={sliderImage} />
                    </div>

                    <div className="mt-4">
                        <div className="w-full border bg-green-50 border-green-200 rounded-lg shadow p-4 lg:p-6 space-y-4">
                            <div className="flex justify-between">
                                <div className="space-y-2">
                                    <div>
                                        <div className="font-bold  text-gray-600 text-md md:text-xl flex flex-col">

                                            {(productDetails?.vehicle_price?.user_price || productDetails?.vehicle_price?.pbl_price) !== 'Call for Price' && productDetails?.vehicle_db_price?.vp_currency + '. '}

                                            {/* {displayVehiclePrice?.user_price !== 'Call for Price' && displayVehicleDbPrice?.vp_currency + '. ' } */}

                                            {
                                                basePath == '/product/my-shop' ?
                                                    formatPrice(productDetails?.vehicle_price?.user_price)
                                                    :
                                                    formatPrice(productDetails?.vehicle_price?.pbl_price)
                                            }
                                        </div>

                                        {
                                            basePath == '/product' ? (
                                                <span className="text-gray-500">
                                                    {productDetails?.vehicle_db_price?.vp_pbl_price_status
                                                        ? String(productDetails.vehicle_db_price.vp_pbl_price_status).charAt(0).toUpperCase() +
                                                        String(productDetails.vehicle_db_price.vp_pbl_price_status).slice(1)
                                                        : ''}
                                                </span>
                                            ) : (
                                                <span className="text-gray-500">
                                                    {productDetails?.vehicle_db_price?.vp_user_price_status
                                                        ? String(productDetails.vehicle_db_price.vp_user_price_status).charAt(0).toUpperCase() +
                                                        String(productDetails.vehicle_db_price.vp_user_price_status).slice(1)
                                                        : ''}
                                                </span>
                                            )
                                        }
                                    </div>

                                    <div className="flex space-x-4 items-center">
                                        <div className="flex items-center">
                                            <h2 className=" text-md md:text-xl font-semibold">Code: </h2>
                                            <span
                                                onClick={handleCopy}
                                                className="text-sm font-bold text-gray-500 ml-2"
                                            >
                                                {copied ? "Copied!" : productDetails?.v_code}
                                                {/* {productDetails?.v_code} */}
                                            </span>
                                        </div>
                                    </div>
                                </div>


                                {/* ====================== */}

                                <div className="space-y-2">
                                    {
                                        canShowAdditionalSecretDocument && (
                                            <div className="">
                                                <button
                                                    type="button"
                                                    onClick={handleOpenAdditionalSecretDocumentModal}
                                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-700 rounded-l hover:bg-blue-700 flex items-center gap-2"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )
                                    }


                                    <div>
                                        <div>
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(true)}
                                                className="px-4 py-2 text-sm font-medium text-white bg-lime-600 border border-lime-700 rounded-l hover:bg-lime-700 flex items-center gap-2"
                                            >
                                                <Download className="h-4 w-4" />
                                            </button>
                                            {showModal && (
                                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                                                    <div className="bg-white p-6 rounded-lg shadow-lg w-104">
                                                        <h2 className="text-lg font-bold mb-4">Enter Folder Name</h2>
                                                        <input
                                                            type="text"
                                                            value={folderName}
                                                            onChange={(e) => setFolderName(e.target.value)}
                                                            placeholder="Folder name..."
                                                            className="border border-gray-300 rounded w-full px-3 py-2 mb-4"
                                                        />
                                                        <div className="flex justify-between gap-2">
                                                            <button
                                                                onClick={() => setShowModal(false)}
                                                                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={downloadAsZip}
                                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                                                >
                                                                    Download as ZIP
                                                                </button>
                                                                <button
                                                                    onClick={downloadAsUnzip}
                                                                    className="px-4 py-2 bg-lime-400 text-white rounded hover:bg-lime-400"
                                                                >
                                                                    Download at Gallery
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>



                                {/* ------------------------------ */}
                            </div>
                        </div>
                    </div>

                    {/* {!user && ( */}
                    <div className="mt-4 hidden md:inline">
                        <ProductDetailsDescription productDetails={productDetails} basePath={basePath} />
                    </div>
                    {/* // )} */}
                </div>





                <div className="md:hidden">

                    <div className="flex items-center justify-end gap-2 mb-4">
                        {isPublicProductDetails && (
                            <button
                                onClick={() => setShopModalOpen(true)}
                                className="flex-1 border border-blue-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Copy className="h-4 w-4 text-blue-600" />
                                </div>
                            </button>
                        )}

                        <button
                            onClick={() => setShareModalOpen(true)}
                            className="flex-1 border border-green-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Share2 className="h-4 w-4 text-green-600" />
                            </div>
                        </button>

                        {
                            (!isMyShop && !isCompanyShop) && (
                                <button
                                    onClick={handleCallClick}
                                    className="flex-1 border border-purple-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <PhoneOutgoing className="h-4 w-4 text-purple-600" />
                                    </div>
                                </button>
                            )
                        }

                        {isPublicProductDetails && (
                            <button
                                onClick={handleWhatsappClick}
                                className="flex-1 border-2 border-green-600 font-bold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <FaWhatsapp className="h-6 w-6 text-green-600" />
                                </div>
                            </button>
                        )}

                        {
                            (!isMyShop && !isCompanyShop) && (
                                <button
                                    onClick={() => handleAddToCart(productDetails)}
                                    className="flex-1 border border-orange-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <ShoppingCart className="h-4 w-4 text-orange-600" />
                                    </div>
                                </button>
                            )
                        }

                        <button
                            type="button"
                            onClick={() => toggleCompare(productDetails?.v_id)}
                            title={isInCompare(productDetails?.v_id) ? "Remove from compare" : "Add to compare"}
                            aria-label={isInCompare(productDetails?.v_id) ? "Remove from compare" : "Add to compare"}
                            className={`flex-1 border font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95 ${isInCompare(productDetails?.v_id) ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-cyan-300'}`}
                        >
                            <div className="flex items-center justify-center gap-1.5">
                                <GitCompare className={`h-4 w-4 ${isInCompare(productDetails?.v_id) ? 'text-white' : 'text-cyan-600'}`} />
                                {isInCompare(productDetails?.v_id) && (
                                    <span className="text-xs text-white">Added</span>
                                )}
                            </div>
                        </button>

                        {isMyOrCompanyDetails && (
                            <button
                                onClick={() => handleEditProduct(productDetails)}
                                className="flex-1 border border-pink-300 font-semibold px-4 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Edit className="h-4 w-4 text-pink-600" />
                                </div>
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleCopyAllClick}
                        className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105"
                    >
                        <Copy className="h-4 w-4" />
                        <span>Copy All Text</span>
                    </button>
                </div>


                <div className="md:col-span-2 md:col-start-4">
                    <div className="border rounded shadow-sm p-4">
                        <div className=" mb-4 border-b pb-2 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-blue-600">Features</h2>
                            {/* এখানে onClick ইভেন্ট যোগ করা হয়েছে */}
                            <button className="text-lg font-medium text-blue-600 flex items-center gap-1" onClick={handleCopyClick}>
                                <Copy /> Copy
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 md:gap-x-1 lg:gap-x-2 text-sm">
                            <div className="">
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Brand :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_brand_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Model:</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_model_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Package:</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_edition_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Condition :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_condition_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Model Yr :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_mod_year}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Reg Yr :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_registration}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Grade :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_grade_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Exterior Grd :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_ext_grade_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Interior Grd :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_int_grade_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Mileage:</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_mileage}</div>
                                </div>

                                {
                                    !isMyShop && !isCompanyShop && (
                                        <div className="grid grid-cols-6 gap-2">
                                            <div className="col-span-3 text-base">Auction Type:</div>
                                            <div className="col-span-3 text-base font-semibold">
                                                {productDetails?.v_auction_type ? String(productDetails.v_auction_type).toUpperCase() : ""}
                                            </div>
                                        </div>
                                    )
                                }

                            </div>
                            <div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Color:</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_color_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Fuel :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_fuel_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Option :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_transmission_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">CC :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_capacity}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Body :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_skeleton_name}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Seat :</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_seat_name}</div>
                                </div>



                                {/* {
                                    user && (user.user_type === 'supreme' || user.user_type === 'admin' || user.user_type === 'pbl') && (
                                        <div className="grid grid-cols-6 gap-2">
                                            <div className="col-span-3 text-base">Chassis No :</div>
                                            <div className="col-span-3 text-base font-semibold">{productDetails?.v_chassis}</div>
                                        </div>
                                    )
                                } */}

                                {
                                    canShowChassisNumber && (
                                        <div className="grid grid-cols-6 gap-2">
                                            <div className="col-span-3 text-base">Chassis No :</div>
                                            <div className="col-span-3 text-base font-semibold">{productDetails?.v_chassis}</div>
                                        </div>
                                    )
                                }

                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Engine No:</div>
                                    <div className="col-span-3 text-base font-semibold">{productDetails?.v_engine}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Tax Token :</div>
                                    <div className="col-span-3 text-base font-semibold">{formatProductDetailsDate(productDetails?.v_tax_token_exp_date)}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Fitness :</div>
                                    <div className="col-span-3 text-base font-semibold">{formatProductDetailsDate(productDetails?.v_fitness_exp_date)}</div>
                                </div>
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-3 text-base">Arrival Date :</div>
                                    <div className="col-span-3 text-base font-semibold">{formatProductDetailsDate(productDetails?.v_arrival_date)}</div>
                                </div>

                                {
                                    shouldShowGdocButton && (
                                        <div className="grid grid-cols-6 gap-2">
                                            <div className="col-span-3 text-base">Download Pic :</div>
                                            <div className="col-span-3 text-base font-semibold">
                                                <button
                                                    type="button"
                                                    onClick={handleGdocOpen}
                                                    className="px-4 py-2 bg-lime-600 border border-lime-700 rounded-lg hover:bg-lime-700 flex items-center gap-2 text-white"
                                                >
                                                    <Download className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                }

                            </div>
                        </div>
                    </div>

                    <div className="border rounded shadow-sm p-4 mt-4">

                        <div className=" mb-4 border-b pb-2 flex items-center justify-between">
                            <h2 className="text-lg font-medium text-blue-600">Specific Features</h2>
                            {/* এখানে onClick ইভেন্ট যোগ করা হয়েছে */}
                            <button className="text-lg font-medium text-blue-600 flex items-center gap-1" onClick={handleFeatureCopyClick}>
                                <Copy /> Copy
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                            {
                                productDetails?.feature_specification?.map((feature, index) => (
                                    feature.specification?.length > 0 && feature?.specification?.some(item => item.is_selected) ? (
                                        <div className="border-b pb-2" key={index}>
                                            <h3 className="font-medium text-base text-blue-600 mb-1">{feature?.md_title}</h3>
                                            {
                                                feature?.specification && feature?.specification.length > 0 && feature?.specification?.map((item, idx) => (
                                                    <p key={idx} className="text-base">
                                                        {item?.is_selected && item?.fs_title}
                                                    </p>
                                                ))
                                            }
                                        </div>
                                    ) : null
                                ))
                            }
                        </div>
                    </div>

                    {selectedYoutubeVideo && (
                        <div className="border rounded shadow-sm p-4 mt-4">
                            <div className="mb-4 border-b pb-2">
                                <h2 className="text-lg font-medium text-blue-600">YouTube Video</h2>
                            </div>
                            <div>
                                <p className="mb-2 text-sm font-medium text-gray-700">{selectedYoutubeVideo.label}</p>
                                <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: "56.25%" }}>
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

                </div>
            </div>

            {!user && (
                <div className="mt-4 inline md:hidden">
                    <ProductDetailsDescription productDetails={productDetails} />
                </div>
            )}

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
