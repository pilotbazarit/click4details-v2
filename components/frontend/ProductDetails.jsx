'use client'
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import ProductDetailsSlider from "@/components/frontend/ProductDetailsSlider";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Copy, Download, Edit, ExternalLink, Eye, FileText, GitCompare, Image as ImageIcon, PhoneOutgoing, Share2, ShoppingCart, X } from "lucide-react";
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
import { pushDataLayerEvent } from "@/helpers/gtmEvents";
import GiftBadge from "@/components/GiftBadge";

dayjs.extend(relativeTime);

const formatProductDetailsDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = dayjs(date);
    if (!parsedDate.isValid()) return "N/A";

    return parsedDate.format("YYYY-MM-DD");
};

const formatLocalMobile = (value) => {
    const trimmed = String(value || "").trim();
    if (!trimmed) return "";
    return trimmed.startsWith("0") ? trimmed : `0${trimmed}`;
};

const getImageDownloadExtension = (url, contentType = "") => {
    const normalizedType = String(contentType || "").split(";")[0].trim().toLowerCase();
    const extensionByType = {
        "image/jpeg": "jpg",
        "image/jpg": "jpg",
        "image/png": "png",
        "image/gif": "gif",
        "image/webp": "webp",
        "image/bmp": "bmp",
        "image/svg+xml": "svg",
    };

    if (extensionByType[normalizedType]) {
        return extensionByType[normalizedType];
    }

    const cleanUrl = String(url || "").split(/[?#]/)[0];
    const urlExtension = cleanUrl.includes(".") ? cleanUrl.split(".").pop() : "";

    return urlExtension || "jpg";
};

const fetchImageBlobForDownload = async (imageUrl) => {
    const sourceUrl = String(imageUrl || "").trim();

    if (!sourceUrl) {
        throw new Error("Image URL is missing");
    }

    const fetchBlob = async (url) => {
        const response = await fetch(url);

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
    } catch {
        return fetchBlob(`/api/proxy-image?url=${encodeURIComponent(sourceUrl)}`);
    }
};

const getDocumentUrl = (doc) => {
    if (typeof doc === "string") return doc;
    return doc?.url || doc?.secure_url || doc?.resource_url || "";
};

const getDocumentFormat = (doc, url) => {
    const explicitFormat = typeof doc === "object" ? doc?.format : "";
    if (explicitFormat) return String(explicitFormat).toLowerCase();

    const cleanUrl = String(url || "").split(/[?#]/)[0];
    const extension = cleanUrl.includes(".") ? cleanUrl.split(".").pop() : "";
    return String(extension || "").toLowerCase();
};

const getDocumentFileName = (doc, index = 0) => {
    const url = getDocumentUrl(doc);
    const publicId = typeof doc === "object" ? doc?.public_id : "";
    const cleanSource = String(publicId || url || `Document ${index + 1}`).split(/[?#]/)[0];
    const fileName = cleanSource.split("/").pop() || `Document ${index + 1}`;

    try {
        return decodeURIComponent(fileName);
    } catch (error) {
        return fileName;
    }
};

const isPdfDocument = (doc, url) => {
    const format = getDocumentFormat(doc, url);
    return format === "pdf" || /\.pdf(?:[?#].*)?$/i.test(String(url || ""));
};

const isImageDocument = (doc, url) => {
    const resourceType = typeof doc === "object" ? String(doc?.resource_type || "").toLowerCase() : "";
    const format = getDocumentFormat(doc, url);

    return (
        resourceType === "image" ||
        /^(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(format) ||
        /\.(jpg|jpeg|png|gif|webp|bmp|svg)(?:[?#].*)?$/i.test(String(url || ""))
    );
};

const getCloudinaryPdfPreviewUrls = (doc, url) => {
    const sourceUrl = String(url || "");
    if (!sourceUrl.includes("res.cloudinary.com") || !sourceUrl.includes("/raw/upload/")) {
        return [];
    }

    const [cloudinaryBase, uploadPathWithQuery] = sourceUrl.split("/raw/upload/");
    const uploadPath = String(uploadPathWithQuery || "").split(/[?#]/)[0];
    if (!cloudinaryBase || !uploadPath) return [];

    const withoutPdfExtension = uploadPath.replace(/\.pdf$/i, "");
    const publicId = typeof doc === "object" ? String(doc?.public_id || "").replace(/^\/+/, "") : "";
    const versionMatch = uploadPath.match(/^(v\d+)\//);
    const versionPrefix = versionMatch?.[1] ? `${versionMatch[1]}/` : "";
    const publicIdPath = publicId ? `${versionPrefix}${publicId}` : "";
    const publicIdWithoutPdfExtension = publicIdPath.replace(/\.pdf$/i, "");
    const imageBase = `${cloudinaryBase}/image/upload`;

    return Array.from(new Set([
        `${imageBase}/pg_1,f_jpg,q_auto/${uploadPath}`,
        `${imageBase}/pg_1,f_png,q_auto/${uploadPath}`,
        `${imageBase}/pg_1,f_jpg,q_auto/${withoutPdfExtension}.jpg`,
        `${imageBase}/pg_1,f_png,q_auto/${withoutPdfExtension}.png`,
        publicIdPath ? `${imageBase}/pg_1,f_jpg,q_auto/${publicIdPath}` : "",
        publicIdPath ? `${imageBase}/pg_1,f_png,q_auto/${publicIdPath}` : "",
        publicIdWithoutPdfExtension ? `${imageBase}/pg_1,f_jpg,q_auto/${publicIdWithoutPdfExtension}.jpg` : "",
        publicIdWithoutPdfExtension ? `${imageBase}/pg_1,f_png,q_auto/${publicIdWithoutPdfExtension}.png` : "",
    ].filter(Boolean)));
};

const normalizeSecretDocuments = (docs = []) => (
    docs
        .map((doc, index) => {
            const url = getDocumentUrl(doc);
            if (!url) return null;

            const type = isPdfDocument(doc, url)
                ? "pdf"
                : isImageDocument(doc, url)
                    ? "image"
                    : "document";

            return {
                url,
                type,
                name: getDocumentFileName(doc, index),
                format: getDocumentFormat(doc, url),
                pdfPreviewUrls: type === "pdf" ? getCloudinaryPdfPreviewUrls(doc, url) : [],
            };
        })
        .filter(Boolean)
);

const PdfDocumentPreview = ({ url, title, previewUrls = [] }) => {
    const [previewUrl, setPreviewUrl] = useState("");
    const [status, setStatus] = useState(previewUrls.length ? "image-preview" : "loading");
    const [errorMessage, setErrorMessage] = useState("");
    const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
    const [tryDirectPdf, setTryDirectPdf] = useState(false);

    useEffect(() => {
        setPreviewUrl("");
        setErrorMessage("");
        setImagePreviewIndex(0);
        setTryDirectPdf(false);
        setStatus(previewUrls.length ? "image-preview" : "loading");
    }, [url, previewUrls.length]);

    useEffect(() => {
        if (previewUrls.length && !tryDirectPdf) {
            setStatus("image-preview");
            return;
        }

        let isMounted = true;
        let objectUrl = "";

        const loadPdf = async () => {
            setStatus("loading");
            setPreviewUrl("");
            setErrorMessage("");

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    const statusText = response.status === 401
                        ? "PDF URL is unauthorized (401)."
                        : `PDF request failed (${response.status}).`;
                    throw new Error(statusText);
                }

                const buffer = await response.arrayBuffer();
                const signature = String.fromCharCode(...new Uint8Array(buffer.slice(0, 5)));
                if (signature !== "%PDF-") {
                    throw new Error("Response is not a valid PDF file.");
                }

                const nextObjectUrl = URL.createObjectURL(new Blob([buffer], { type: "application/pdf" }));

                if (isMounted) {
                    objectUrl = nextObjectUrl;
                    setPreviewUrl(nextObjectUrl);
                    setStatus("ready");
                } else {
                    URL.revokeObjectURL(nextObjectUrl);
                }
            } catch (error) {
                if (isMounted) {
                    setErrorMessage(error?.message || "PDF preview is not available.");
                    setStatus("failed");
                }
            }
        };

        loadPdf();

        return () => {
            isMounted = false;
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [url, previewUrls.length, tryDirectPdf]);

    if (status === "image-preview" && previewUrls.length) {
        return (
            <div className="flex h-full min-h-[320px] w-full flex-col">
                <div className="border-b border-blue-200 bg-blue-50 px-3 py-2 text-xs font-medium text-blue-800">
                    Showing PDF first page preview.
                </div>
                <div className="min-h-0 flex-1 bg-slate-100">
                    <img
                        src={previewUrls[imagePreviewIndex]}
                        alt={title}
                        className="h-full w-full object-contain"
                        onError={() => {
                            if (imagePreviewIndex < previewUrls.length - 1) {
                                setImagePreviewIndex((currentIndex) => currentIndex + 1);
                            } else {
                                setTryDirectPdf(true);
                            }
                        }}
                    />
                </div>
            </div>
        );
    }

    if (status === "loading") {
        return (
            <div className="flex h-full min-h-[320px] w-full items-center justify-center p-6 text-center">
                <div>
                    <FileText className="mx-auto mb-3 h-10 w-10 text-blue-600" />
                    <p className="text-sm font-bold text-slate-900">Loading PDF...</p>
                </div>
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="flex h-full min-h-[320px] w-full items-center justify-center p-6 text-center">
                <div className="max-w-md">
                    <FileText className="mx-auto mb-3 h-10 w-10 text-amber-600" />
                    <p className="text-sm font-bold text-slate-900">PDF preview is blocked</p>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                        {errorMessage || "This PDF cannot be loaded from the current document URL."}
                    </p>
                    <p className="mt-2 text-xs font-medium text-slate-500">
                        Cloudinary raw PDF delivery needs to be public, signed, or proxied by the backend.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <iframe
            src={previewUrl}
            title={title}
            className="h-full min-h-[320px] w-full"
        />
    );
};
const SecretDocumentsModal = ({ documents, onClose }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const activeDocument = documents[activeIndex] || documents[0];

    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleEscape);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener("keydown", handleEscape);
        };
    }, [onClose]);

    useEffect(() => {
        if (activeIndex >= documents.length) {
            setActiveIndex(0);
        }
    }, [activeIndex, documents.length]);

    if (!activeDocument) return null;

    const activeTypeLabel = activeDocument.type === "pdf"
        ? "PDF"
        : activeDocument.type === "image"
            ? "Image"
            : "Document";

    return (
        <div
            className="fixed inset-0 z-50 bg-slate-950/80 p-2 sm:p-4"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-lg bg-white shadow-2xl">
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Secret Documents</h2>
                        <p className="text-xs font-medium text-slate-500">
                            {documents.length} file{documents.length > 1 ? "s" : ""}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                        aria-label="Close secret documents"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
                    <aside className="max-h-44 overflow-y-auto border-b border-slate-200 bg-slate-50 p-3 md:max-h-none md:border-b-0 md:border-r">
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-1">
                            {documents.map((doc, index) => {
                                const isActive = index === activeIndex;
                                const label = doc.type === "pdf" ? "PDF" : doc.type === "image" ? "Image" : "Document";

                                return (
                                    <button
                                        key={`${doc.url}-${index}`}
                                        type="button"
                                        onClick={() => setActiveIndex(index)}
                                        className={`flex min-w-0 items-center gap-3 rounded-lg border p-3 text-left transition ${isActive
                                            ? "border-blue-500 bg-blue-50 text-blue-900"
                                            : "border-slate-200 bg-white text-slate-700 hover:border-blue-300"}`}
                                    >
                                        <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${doc.type === "image"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : "bg-blue-50 text-blue-600"}`}
                                        >
                                            {doc.type === "image" ? (
                                                <ImageIcon className="h-5 w-5" />
                                            ) : (
                                                <FileText className="h-5 w-5" />
                                            )}
                                        </span>
                                        <span className="min-w-0">
                                            <span className="block truncate text-sm font-semibold">{doc.name}</span>
                                            <span className="block text-xs font-bold uppercase text-slate-400">{label}</span>
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    <section className="flex min-h-0 flex-1 flex-col bg-slate-100">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-slate-900">{activeDocument.name}</p>
                                <p className="text-xs font-medium text-slate-500">{activeTypeLabel}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <a
                                    href={activeDocument.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                                    title="Open in new tab"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                </a>
                                <a
                                    href={activeDocument.url}
                                    download={activeDocument.name}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-300 hover:text-blue-700"
                                    title="Download document"
                                >
                                    <Download className="h-4 w-4" />
                                </a>
                            </div>
                        </div>

                        <div className="min-h-0 flex-1 p-3">
                            <div className="flex h-full min-h-[320px] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white">
                                {activeDocument.type === "pdf" ? (
                                    <PdfDocumentPreview
                                        url={activeDocument.url}
                                        title={activeDocument.name}
                                        previewUrls={activeDocument.pdfPreviewUrls}
                                    />
                                ) : activeDocument.type === "image" ? (
                                    <img
                                        src={activeDocument.url}
                                        alt={activeDocument.name}
                                        className="h-full max-h-full w-full object-contain"
                                    />
                                ) : (
                                    <div className="max-w-sm p-6 text-center">
                                        <FileText className="mx-auto mb-3 h-10 w-10 text-blue-600" />
                                        <p className="text-sm font-bold text-slate-900">{activeDocument.name}</p>
                                        <p className="mt-1 text-xs font-medium text-slate-500">
                                            Preview is not available for this file type.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// ── Typewriter Price Animation Component ──────────────────────────────
const TypewriterPrice = ({ text, className = "" }) => {
    const chars = String(text || "").split("");
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.065,
            },
        },
    };
    const charVariants = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
    };
    return (
        <motion.span
            key={text}
            className={`inline ${className}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            {chars.map((char, i) => (
                <motion.span key={i} variants={charVariants}>
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </motion.span>
    );
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
    const [showSecretDocumentSlider, setShowSecretDocumentSlider] = useState(false);


    const additionalDocumentImages = useMemo(() => (
        Array.isArray(productDetails?.data?.v_docs)
            ? productDetails.data.v_docs
            : Array.isArray(productDetails?.v_docs)
                ? productDetails.v_docs
                : []
    )
        .map((doc) => doc?.url || doc?.secure_url)
        .filter(Boolean), [productDetails]);



    const additionalSecretDocuments = useMemo(() => {
        const docs = Array.isArray(productDetails?.data?.v_secret_docs)
            ? productDetails.data.v_secret_docs
            : Array.isArray(productDetails?.v_secret_docs)
                ? productDetails.v_secret_docs
                : [];

        return normalizeSecretDocuments(docs);
    }, [productDetails]);

    const additionalSecretDocumentImages = useMemo(
        () => additionalSecretDocuments.map((doc) => doc.url),
        [additionalSecretDocuments]
    );


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


        // console.log("isMyShop", isMyShop); myshop false hote hobe 
        // console.log("isCompanyShop", isCompanyShop); isCompanyShop false hote hobe
        // console.log("userMode", userMode); userMode supreme 
        // console.log("additionalSecretDocuments", additionalSecretDocuments); additionalSecretDocuments length 0 er basi hote hobe


    const canShowAdditionalSecretDocument =
        additionalSecretDocuments.length > 0 &&
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

    const sellerMobileNumber = formatLocalMobile(productDetails?.user?.phone);
    const sellerInfoList = (Array.isArray(productDetails?.v_seller_info) ? productDetails.v_seller_info : [])
        .map((seller) => ({ name: seller?.name || "", phone: formatLocalMobile(seller?.phone) }))
        .filter((seller) => seller.phone);
    const showSellerMobile = Number(productDetails?.v_show_seller_mobile) === 1 && (sellerInfoList.length > 0 || Boolean(sellerMobileNumber));

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
                const imageUrl = sliderImage[i];
                const blob = await fetchImageBlobForDownload(imageUrl);
                const fileName = `image-${i + 1}.${getImageDownloadExtension(imageUrl, blob.type)}`;
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
                const imageUrl = sliderImage[i];
                const blob = await fetchImageBlobForDownload(imageUrl);
                const fileName = `${folderName}-image-${i + 1}.${getImageDownloadExtension(imageUrl, blob.type)}`;
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

    const handleOpenAdditionalSecretDocumentSlider = () => {
        if (additionalSecretDocumentImages.length === 0) {
            toast.error("Additional secret document not available.");
            return;
        }

        setShowSecretDocumentSlider(true);
    };
    const handleOpenAdditionalSecretDocumentModal = () => {
        if (additionalSecretDocuments.length === 0) {
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
            detailsToCopy += `Tax Token : ${formatProductDetailsDate(productDetails?.v_tax_token_exp_date)}\n`;
        }
        // Fitness
        if (productDetails?.v_fitness_exp_date) {
            detailsToCopy += `Fitness : ${formatProductDetailsDate(productDetails?.v_fitness_exp_date)}\n`;
        }
        // Arrival Date
        if (productDetails?.v_arrival_date) {
            detailsToCopy += `Arrival Date : ${formatProductDetailsDate(productDetails?.v_arrival_date)}\n`;
        }
        // Delivery Condition
        if (productDetails?.v_delivery_condition) {
            detailsToCopy += `Delivery Condition : ${productDetails?.v_delivery_condition}\n`;
        }
        // Auction type
        if (!isMyShop && !isCompanyShop && productDetails?.v_auction_type) {
            detailsToCopy += `Auction Type : ${String(productDetails.v_auction_type).toUpperCase()}\n`;
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
        // Auction Type
        if (productDetails?.v_auction_type) {
            allDetails += `Auction Type : ${String(productDetails.v_auction_type).toUpperCase()}\n`;
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
            allDetails += `Tax Token : ${formatProductDetailsDate(productDetails?.v_tax_token_exp_date)}\n`;
        }
        // Fitness
        if (productDetails?.v_fitness_exp_date) {
            allDetails += `Fitness : ${formatProductDetailsDate(productDetails?.v_fitness_exp_date)}\n`;
        }
        // Arrival Date
        if (productDetails?.v_arrival_date) {
            allDetails += `Arrival Date : ${formatProductDetailsDate(productDetails?.v_arrival_date)}\n`;
        }
        // Delivery Condition
        if (productDetails?.v_delivery_condition) {
            allDetails += `Delivery Condition : ${productDetails?.v_delivery_condition}\n`;
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

        pushDataLayerEvent("add_to_cart", {
            value: price || 0,
            currency: "BDT",
            items: [{ item_id: item.v_id, item_name: item.v_title, price: price || 0 }],
        });
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

    return (
        <div className="px-4 overflow-x-hidden">
            <div>
                <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-center mt-4">
                    <div>
                        <p className="text-xl text-blue-700 font-bold md:text-3xl md:font-medium">
                            <TypewriterPrice text={productDetails?.v_title} />
                        </p>
                        <span className="text-gray-500">{dayjs(productDetails?.v_created_at).fromNow()}</span>
                        <div className="mt-2">
                            <GiftBadge userGift={productDetails?.user_gift} pblGift={productDetails?.pbl_gift} variant="inline" />
                        </div>
                    </div>

                    <motion.div
                        className="hidden md:flex md:items-center md:justify-end gap-2 flex-wrap"
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0.22, delayChildren: 2 } },
                        }}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="flex gap-2">
                            {isPublicProductDetails && (
                                <motion.button
                                    onClick={() => setShopModalOpen(true)}
                                    className="flex-1 border border-blue-300 font-semibold px-4 py-2 rounded-lg"
                                    variants={{
                                        hidden: { opacity: 0, x: -60, scale: 0.9 },
                                        visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 160, damping: 48 } },
                                    }}
                                    whileHover={{ scale: 1.1, boxShadow: '0 6px 20px rgba(59,130,246,0.25)' }}
                                    whileTap={{ scale: 0.93 }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Copy className="h-4 w-4 text-blue-600" />
                                    </div>
                                </motion.button>
                            )}

                            <motion.button
                                onClick={() => setShareModalOpen(true)}
                                className="flex-1 border border-green-300 font-semibold px-4 py-2 rounded-lg"
                                variants={{
                                    hidden: { opacity: 0, x: 60, scale: 0.9 },
                                    visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
                                }}
                                whileHover={{ scale: 1.1, boxShadow: '0 6px 20px rgba(34,197,94,0.25)' }}
                                whileTap={{ scale: 0.93 }}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Share2 className="h-4 w-4 text-green-600" />
                                </div>
                            </motion.button>

                            {
                                (!isMyShop && !isCompanyShop) && (
                                    <motion.button
                                        onClick={handleCallClick}
                                        className="flex-1 border border-purple-300 font-semibold px-4 py-2 rounded-lg"
                                        variants={{
                                            hidden: { opacity: 0, x: -60, scale: 0.9 },
                                            visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 28 } },
                                        }}
                                        whileHover={{ scale: 1.1, boxShadow: '0 6px 20px rgba(168,85,247,0.25)' }}
                                        whileTap={{ scale: 0.93 }}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <PhoneOutgoing className="h-4 w-4 text-purple-600" />
                                        </div>
                                    </motion.button>
                                )
                            }

                            {isPublicProductDetails && (
                                <motion.button
                                    onClick={handleWhatsappClick}
                                    className="flex-1 border-2 border-green-600 font-bold px-4 py-2 rounded-lg"
                                    variants={{
                                        hidden: { opacity: 0, x: -60, scale: 0.9 },
                                        visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 28 } },
                                    }}
                                    whileHover={{ scale: 1.1, boxShadow: '0 6px 20px rgba(22,163,74,0.3)' }}
                                    whileTap={{ scale: 0.93 }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <FaWhatsapp className="h-6 w-6 text-green-600" />
                                    </div>
                                </motion.button>
                            )}

                            {
                                (!isMyShop && !isCompanyShop) && (
                                    <motion.button
                                        onClick={() => handleAddToCart(productDetails)}
                                        className="flex-1 border border-orange-300 font-semibold px-4 py-2 rounded-lg"
                                        variants={{
                                            hidden: { opacity: 0, x: -60, scale: 0.9 },
                                            visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 28 } },
                                        }}
                                        whileHover={{ scale: 1.1, boxShadow: '0 6px 20px rgba(249,115,22,0.25)' }}
                                        whileTap={{ scale: 0.93 }}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <ShoppingCart className="h-4 w-4 text-orange-600" />
                                        </div>
                                    </motion.button>
                                )
                            }

                            <motion.button
                                type="button"
                                onClick={() => toggleCompare(productDetails?.v_id)}
                                title={isInCompare(productDetails?.v_id) ? "Remove from compare" : "Add to compare"}
                                aria-label={isInCompare(productDetails?.v_id) ? "Remove from compare" : "Add to compare"}
                                className={`flex-1 border font-semibold px-4 py-2 rounded-lg ${isInCompare(productDetails?.v_id) ? 'border-cyan-600 bg-cyan-600 text-white' : 'border-cyan-300'}`}
                                variants={{
                                    hidden: { opacity: 0, x: 60, scale: 0.9 },
                                    visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
                                }}
                                whileHover={{ scale: 1.1, boxShadow: '0 6px 20px rgba(6,182,212,0.25)' }}
                                whileTap={{ scale: 0.93 }}
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <GitCompare className={`h-4 w-4 ${isInCompare(productDetails?.v_id) ? 'text-white' : 'text-cyan-600'}`} />
                                    {isInCompare(productDetails?.v_id) && (
                                        <span className="text-xs text-white">Added</span>
                                    )}
                                </div>
                            </motion.button>

                            {isMyOrCompanyDetails && (
                                <motion.button
                                    onClick={() => handleEditProduct(productDetails)}
                                    className="flex-1 border border-pink-300 font-semibold px-4 py-2 rounded-lg"
                                    variants={{
                                        hidden: { opacity: 0, x: -60, scale: 0.9 },
                                        visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 120, damping: 28 } },
                                    }}
                                    whileHover={{ scale: 1.1, boxShadow: '0 6px 20px rgba(236,72,153,0.25)' }}
                                    whileTap={{ scale: 0.93 }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Edit className="h-4 w-4 text-pink-600" />
                                    </div>
                                </motion.button>
                            )}
                        </div>

                        <motion.button
                            onClick={handleCopyAllClick}
                            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md flex items-center gap-2"
                            variants={{
                                hidden: { opacity: 0, x: 60, scale: 0.9 },
                                visible: { opacity: 1, x: 0, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 22 } },
                            }}
                            whileHover={{ scale: 1.07, boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Copy className="h-4 w-4" />
                            <span>Copy All</span>
                        </motion.button>
                    </motion.div>
                </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-2 mb-6 md:h-[calc(100vh-140px)] md:min-h-0 md:overflow-hidden">
                <div className="md:col-span-3 md:h-full md:min-h-0 md:overflow-y-scroll md:pr-2 md:overscroll-contain">
                    <div>
                        <ProductDetailsSlider images={sliderImage} />
                    </div>

                    {productDetails?.v_pbl_text && (
                        <div className="mt-4 border rounded-lg shadow-sm overflow-hidden">
                            <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
                                <span className="text-sm font-medium text-blue-600">PBL Text</span>
                            </div>
                            <div className="p-4">
                                <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">{productDetails.v_pbl_text}</p>
                            </div>
                        </div>
                    )}

                    <div className="mt-4">
                        <div className="w-full border bg-blue-50 border-blue-500 rounded-lg shadow p-4 lg:p-6 space-y-4">
                            <div className="flex justify-between">
                                <div className="space-y-2">
                                    <div>
                                        <div className="font-bold text-gray-600 text-md md:text-xl flex flex-col">
                                            <TypewriterPrice
                                                text={
                                                    [
                                                        (productDetails?.vehicle_price?.user_price || productDetails?.vehicle_price?.pbl_price) !== 'Call for Price'
                                                            ? (productDetails?.vehicle_db_price?.vp_currency + '. ')
                                                            : '',
                                                        basePath === '/product/my-shop'
                                                            ? formatPrice(productDetails?.vehicle_price?.user_price)
                                                            : formatPrice(productDetails?.vehicle_price?.pbl_price),
                                                    ].join('')
                                                }
                                                className="font-bold text-gray-600 text-md md:text-xl"
                                            />
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
                                            <>
                                                {/* <div className="">
                                                    <button
                                                        type="button"
                                                        onClick={handleOpenAdditionalSecretDocumentSlider}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-blue-700 rounded-l hover:bg-blue-700 flex items-center gap-2"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </div> */}
                                                <div className="">
                                                    <button
                                                        type="button"
                                                        onClick={handleOpenAdditionalSecretDocumentModal}
                                                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-indigo-700 rounded-l hover:bg-indigo-700 flex items-center gap-2"
                                                        title="View secret documents"
                                                        aria-label="View secret documents"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </>
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


                <div className="md:col-span-2 md:col-start-4 md:h-full md:min-h-0 md:overflow-y-scroll md:pl-2 md:overscroll-contain">
                    {showSellerMobile && sellerInfoList.length > 0 && (
                        sellerInfoList.map((seller, index) => (
                            <a
                                key={index}
                                href={`tel:${seller.phone}`}
                                title="Call seller"
                                className="relative flex items-center gap-3 rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm animate-pulse hover:shadow-md hover:animate-none transition-shadow mb-4"
                            >
                                <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                    <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                        <PhoneOutgoing className="h-5 w-5 text-white" />
                                    </span>
                                </span>
                                <span>
                                    <span className="block text-xs font-medium text-green-700">
                                        {seller.name ? `Seller Name: ${seller.name}` : "Seller Mobile Number"}
                                    </span>
                                    <span className="block text-lg font-bold tracking-wide text-green-800">{seller.phone}</span>
                                </span>
                            </a>
                        ))
                    )}
                    {showSellerMobile && sellerInfoList.length === 0 && (
                        <a
                            href={`tel:${sellerMobileNumber}`}
                            title="Call seller"
                            className="relative flex items-center gap-3 rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm animate-pulse hover:shadow-md hover:animate-none transition-shadow mb-4"
                        >
                            <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                                <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                                    <PhoneOutgoing className="h-5 w-5 text-white" />
                                </span>
                            </span>
                            <span>
                                <span className="block text-xs font-medium text-green-700">Seller Mobile Number</span>
                                <span className="block text-lg font-bold tracking-wide text-green-800">{sellerMobileNumber}</span>
                            </span>
                        </a>
                    )}
                    <motion.div
                        variants={{
                            hidden: {},
                            visible: { transition: { staggerChildren: 0, delayChildren: 0 } },
                        }}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.05 }}
                    >
                        <motion.div
                            className="border border-blue-500 rounded-xl shadow-md p-4 overflow-hidden"
                            variants={{
                                hidden: { opacity: 0, x: 600 },
                                visible: { opacity: 1, x: 0, transition: { duration: 2.5, ease: [0.22, 1, 0.36, 1] } },
                            }}
                        >
                            <motion.div
                                className="-mx-4 -mt-4 mb-4 flex items-center justify-between rounded-t bg-blue-50 px-4 py-3 border border-blue-500 border-t-0 border-l-0"
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
                            >
                                <h2 className="text-lg font-medium text-blue-600">Features</h2>
                                {/* এখানে onClick ইভেন্ট যোগ করা হয়েছে */}
                                <button className="text-lg font-medium text-blue-600 flex items-center gap-1" onClick={handleCopyClick}>
                                    <Copy /> Copy
                                </button>
                            </motion.div>
                            <motion.div
                                className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 md:gap-x-1 lg:gap-x-2 text-sm"
                                variants={{
                                    hidden: {},
                                    visible: { transition: { staggerChildren: 0.055, delayChildren: 0.25 } },
                                }}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.04 }}
                            >
                                <div className="">
                                    {[
                                        ['Brand :', productDetails?.v_brand_name],
                                        ['Model:', productDetails?.v_model_name],
                                        ['Package:', productDetails?.v_edition_name],
                                        ['Condition :', productDetails?.v_condition_name],
                                        ['Model Yr :', productDetails?.v_mod_year],
                                        ['Reg Yr :', productDetails?.v_registration],
                                        ['Grade :', productDetails?.v_grade_name],
                                        ['Exterior Grd :', productDetails?.v_ext_grade_name],
                                        ['Interior Grd :', productDetails?.v_int_grade_name],
                                        ['Mileage:', productDetails?.v_mileage],
                                    ].map(([label, value], i) => (
                                        <div
                                            key={i}
                                            className="grid grid-cols-6 gap-2 rounded px-1 py-0.5 hover:bg-blue-50 transition-colors"
                                            variants={{
                                                hidden: { opacity: 0, x: -22 },
                                                visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                                            }}
                                        >
                                            <div className="col-span-3 text-base">{label}</div>
                                            <div className="col-span-3 text-base font-semibold">{value}</div>
                                        </div>
                                    ))}

                                    {
                                        !isMyShop && !isCompanyShop && (
                                            <div
                                                className="grid grid-cols-6 gap-2 rounded px-1 py-0.5 hover:bg-blue-50 transition-colors"
                                                variants={{
                                                    hidden: { opacity: 0, x: -22 },
                                                    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                                                }}
                                            >
                                                <div className="col-span-3 text-base">Auction Type:</div>
                                                <div className="col-span-3 text-base font-semibold">
                                                    {productDetails?.v_auction_type ? String(productDetails.v_auction_type).toUpperCase() : ""}
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                                <div>
                                    {[
                                        ['Color:', productDetails?.v_color_name],
                                        ['Fuel :', productDetails?.v_fuel_name],
                                        ['Option :', productDetails?.v_transmission_name],
                                        ['CC :', productDetails?.v_capacity],
                                        ['Body :', productDetails?.v_skeleton_name],
                                        ['Seat :', productDetails?.v_seat_name],
                                    ].map(([label, value], i) => (
                                        <div
                                            key={i}
                                            className="grid grid-cols-6 gap-2 rounded px-1 py-0.5 hover:bg-blue-50 transition-colors"
                                            variants={{
                                                hidden: { opacity: 0, x: -22 },
                                                visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                                            }}
                                        >
                                            <div className="col-span-3 text-base">{label}</div>
                                            <div className="col-span-3 text-base font-semibold">{value}</div>
                                        </div>
                                    ))}


                                    {
                                        canShowChassisNumber && (
                                            <motion.div
                                                className="grid grid-cols-6 gap-2 rounded px-1 py-0.5 hover:bg-blue-50 transition-colors"
                                                variants={{
                                                    hidden: { opacity: 0, x: -22 },
                                                    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                                                }}
                                            >
                                                <div className="col-span-3 text-base">Chassis No :</div>
                                                <div className="col-span-3 text-base font-semibold">{productDetails?.v_chassis}</div>
                                            </motion.div>
                                        )
                                    }

                                    {[
                                        ['Engine No:', productDetails?.v_engine],
                                        ['Tax Token :', formatProductDetailsDate(productDetails?.v_tax_token_exp_date)],
                                        ['Fitness :', formatProductDetailsDate(productDetails?.v_fitness_exp_date)],
                                        ['Arrival Date :', formatProductDetailsDate(productDetails?.v_arrival_date)],
                                    ].map(([label, value], i) => (
                                        <motion.div
                                            key={i}
                                            className="grid grid-cols-6 gap-2 rounded px-1 py-0.5 hover:bg-blue-50 transition-colors"
                                            variants={{
                                                hidden: { opacity: 0, x: -22 },
                                                visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                                            }}
                                        >
                                            <div className="col-span-3 text-base">{label}</div>
                                            <div className="col-span-3 text-base font-semibold">{value}</div>
                                        </motion.div>
                                    ))}

                                    {
                                        productDetails?.v_delivery_condition && (
                                            <motion.div
                                                className="grid grid-cols-6 gap-2 rounded px-1 py-0.5 hover:bg-blue-50 transition-colors"
                                                variants={{
                                                    hidden: { opacity: 0, x: -22 },
                                                    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                                                }}
                                            >
                                                <div className="col-span-3 text-base">Delivery Condition :</div>
                                                <div className="col-span-3 text-base font-semibold">{productDetails.v_delivery_condition}</div>
                                            </motion.div>
                                        )
                                    }

                                    {
                                        shouldShowGdocButton && (
                                            <motion.div
                                                className="grid grid-cols-6 gap-2 rounded px-1 py-0.5"
                                                variants={{
                                                    hidden: { opacity: 0, x: -22 },
                                                    visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
                                                }}
                                            >
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
                                            </motion.div>
                                        )
                                    }

                                </div>
                            </motion.div>
                        </motion.div>

                        <motion.div
                            className="border border-blue-500 rounded shadow-sm p-4 mt-4"
                            variants={{
                                hidden: { opacity: 0, x: 600 },
                                visible: { opacity: 1, x: 0, transition: { duration: 1.8, ease: [0.22, 1, 0.36, 1] } },
                            }}
                        >

                            <div className="-mx-4 -mt-4 mb-4 flex items-center justify-between rounded bg-blue-50 px-4 py-3 border border-blue-500 border-t-0 border-l-0">
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
                                            <motion.div
                                                className="border-b pb-2"
                                                key={index}
                                                initial={{ opacity: 0, scale: 0.88, y: 18 }}
                                                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                                                viewport={{ once: true, amount: 0.1 }}
                                                transition={{
                                                    duration: 0.45,
                                                    delay: index * 0.06,
                                                    ease: [0.34, 1.56, 0.64, 1],
                                                }}
                                            >
                                                <h3 className="font-medium text-base text-blue-600 mb-1">{feature?.md_title}</h3>
                                                {
                                                    feature?.specification && feature?.specification.length > 0 && feature?.specification?.map((item, idx) => (
                                                        <p key={idx} className="text-base">
                                                            {item?.is_selected && item?.fs_title}
                                                        </p>
                                                    ))
                                                }
                                            </motion.div>
                                        ) : null
                                    ))
                                }
                            </div>
                        </motion.div>
                    </motion.div>

                    {Array.isArray(productDetails?.v_more_information) && productDetails.v_more_information.length > 0 && (
                        <div className="border rounded shadow-sm p-4 mt-4">
                            <div className="-mx-4 -mt-4 mb-4 rounded-t bg-blue-50 px-4 py-3 border-b border-blue-100">
                                <h2 className="text-lg font-medium text-blue-600">More Information</h2>
                            </div>
                            <div className="text-sm">
                                {productDetails.v_more_information.map((item, index) => (
                                    item?.value ? (
                                        <div key={`${item.label}-${index}`} className="grid grid-cols-6 gap-2 py-1.5 border-b border-slate-100 last:border-b-0">
                                            <div className="col-span-3 text-sm text-gray-500">{item.label || "Info"} :</div>
                                            <div className="col-span-3 text-sm font-semibold text-gray-800">{item.value}</div>
                                        </div>
                                    ) : null
                                ))}
                            </div>
                        </div>
                    )}

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
                    <ProductDetailsDescription productDetails={productDetails} basePath={basePath} />
                </div>
            )}

            <ProductShareModal open={shareModalOpen} setOpen={setShareModalOpen} product={productDetails} />
            <ShopSelectModal open={shopModalOpen} setOpen={setShopModalOpen} product={productDetails} />
            {showSecretDocumentSlider && (
                <ModalSlider
                    setShowModal={setShowSecretDocumentSlider}
                    images={additionalSecretDocumentImages}
                    activeIndex={0}
                />
            )}
            {showDocumentModal && (
                <SecretDocumentsModal
                    documents={additionalSecretDocuments}
                    onClose={() => setShowDocumentModal(false)}
                />
            )}
        </div>
    );
};

export default ProductDetails;
