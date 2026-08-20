"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import {
  Boxes,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  ImageIcon,
  Layers,
  PlayCircle,
  Share2,
  ShieldCheck,
  ShoppingCart,
  PhoneOutgoing,
} from "lucide-react";
import toast from "react-hot-toast";

import { formatPrice } from "@/helpers/functions";
import { getSessionId } from "@/lib/utils";
import { useAppContext } from "@/context/AppContext";
import { pushDataLayerEvent } from "@/helpers/gtmEvents";
import GiftBadge from "@/components/GiftBadge";

dayjs.extend(relativeTime);

const DEFAULT_PHONE = "+8801969944400";

const formatLocalMobile = (value) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  return trimmed.startsWith("0") ? trimmed : `0${trimmed}`;
};

const parseMaybeJson = (value) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const parseUser = (value) => {
  const parsed = parseMaybeJson(value);
  return typeof parsed === "string" ? parseMaybeJson(parsed) : parsed;
};

const imageUrl = (image) => {
  const parsed = parseMaybeJson(image);
  if (!parsed) return "";
  if (typeof parsed === "string") return parsed;
  return parsed.secure_url || parsed.url || "";
};

const imageList = (images) => {
  const parsed = parseMaybeJson(images);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(imageUrl).filter(Boolean);
};

const uniqueImages = (images) => Array.from(new Set(images.filter(Boolean)));

const primaryProductImage = (product) => {
  const canUsePblImage = Number(product?.p_is_saleBy_pbl) === 1 && product?.p_pbl_image;
  return imageUrl(canUsePblImage ? product.p_pbl_image : product?.p_primary_image || product?.p_default_image);
};

const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const money = (value) => {
  const numeric = toNumber(value);
  return numeric > 0 ? `TK. ${formatPrice(numeric)}` : "Call for price";
};

const splitOptionText = (text, fallbackLabel) => {
  if (!text) return null;
  if (String(text).includes(":")) {
    const separator = String(text).indexOf(":");
    const label = String(text).slice(0, separator).trim();
    const value = String(text).slice(separator + 1).trim();
    return { label: label || fallbackLabel, value: value || text };
  }
  return { label: fallbackLabel, value: text };
};

const optionFromApi = (option, index) => {
  const rawValue =
    option?.display_value ||
    option?.pvo_value_text ||
    option?.attribute_value?.fs_title ||
    option?.attributeValue?.fs_title ||
    "";
  const rawLabel = option?.attribute?.md_title || option?.attribute?.md_name || `Option ${index + 1}`;
  return splitOptionText(rawValue, rawLabel);
};

const normalizeVariants = (product) => {
  const apiVariants = Array.isArray(product?.variants) ? product.variants : [];

  if (apiVariants.length) {
    return apiVariants.map((variant, index) => {
      const options = (variant?.options || []).map(optionFromApi).filter(Boolean);
      const title =
        variant?.pv_title ||
        variant?.pv_option_summary ||
        options.map((option) => option.value).join(" / ") ||
        `Variant ${index + 1}`;
      const regularPrice = toNumber(variant?.pv_regular_price);
      const discountPrice = toNumber(variant?.pv_discount_price);
      const sellingPrice = discountPrice > 0 && discountPrice < regularPrice ? discountPrice : regularPrice;
      const primaryImage = imageUrl(variant?.pv_primary_image);
      const galleryImages = imageList(variant?.pv_images);

      return {
        id: `variant-${variant?.pv_id || index}`,
        variantId: variant?.pv_id || null,
        legacyPriceId: null,
        title,
        sku: variant?.pv_sku || "",
        barcode: variant?.pv_barcode || "",
        status: variant?.pv_status || "active",
        options,
        regularPrice,
        discountPrice,
        sellingPrice,
        wholesalePrice: toNumber(variant?.pv_wholesale_price),
        minimumWholesaleQty: toNumber(variant?.pv_minimum_wholesale_qty),
        stockQty: toNumber(variant?.pv_stock_qty),
        availableQty: toNumber(variant?.pv_available_qty ?? variant?.pv_stock_qty),
        lowStockThreshold: toNumber(variant?.pv_low_stock_threshold),
        primaryImage,
        galleryImages,
      };
    });
  }

  const legacyPrices = Array.isArray(product?.prices) ? product.prices : [];
  return legacyPrices.map((price, index) => {
    const title = price?.unit?.md_title || `Option ${index + 1}`;
    const regularPrice = toNumber(price?.pp_regular_price);
    const discountPrice = toNumber(price?.pp_discount_price);
    const sellingPrice = discountPrice > 0 && discountPrice < regularPrice ? discountPrice : regularPrice;

    return {
      id: `legacy-${price?.pp_id || index}`,
      variantId: null,
      legacyPriceId: price?.pp_id || null,
      title,
      sku: product?.p_code || "",
      barcode: "",
      status: product?.p_status || "active",
      options: title ? [{ label: "Unit", value: title }] : [],
      regularPrice,
      discountPrice,
      sellingPrice,
      wholesalePrice: toNumber(price?.pp_wholesale_price),
      minimumWholesaleQty: toNumber(price?.pp_minimum_wholesale_qty),
      stockQty: 0,
      availableQty: 0,
      lowStockThreshold: 0,
      primaryImage: "",
      galleryImages: [],
    };
  });
};

const statusLabel = (variant) => {
  if (!variant) return "Available";
  if (variant.status !== "active") return "Unavailable";
  if (variant.variantId && variant.availableQty <= 0) return "Out of stock";
  if (variant.variantId && variant.availableQty <= variant.lowStockThreshold) return "Low stock";
  return "In stock";
};

const statusClass = (variant) => {
  const label = statusLabel(variant);
  if (label === "In stock" || label === "Available") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (label === "Low stock") return "bg-amber-50 text-amber-700 ring-amber-200";
  return "bg-red-50 text-red-700 ring-red-200";
};

const productCode = (code) => String(code || "").replace(/^[^-]*-/, "");

const productUrlFor = (product) => {
  if (typeof window !== "undefined") return window.location.href;
  return `${process.env.NEXT_PUBLIC_SITE_URL || "https://pilotbazar.com"}/general-product/${product?.p_slug || ""}`;
};

const normalizeMoreInformation = (product) => {
  const rows = product?.extended_data || product?.extendedData || [];
  return (Array.isArray(rows) ? rows : [])
    .map((item) => ({
      label: String(item?.ed_entity_key || "").trim(),
      value: String(item?.ed_entity_value || "").trim(),
    }))
    .filter((item) => item.label || item.value);
};

const normalizeExternalUrl = (url = "") => {
  const trimmed = String(url || "").trim();
  if (!trimmed) return "";
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
};

const youtubeEmbedUrl = (url = "") => {
  const rawUrl = normalizeExternalUrl(url);
  if (!rawUrl) return "";

  const patterns = [
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = rawUrl.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  }

  return "";
};

const GalleryCarousel = ({ images, productName, activeIndex, onActiveIndexChange }) => {
  const [swiper, setSwiper] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const goToSlide = (index) => {
    onActiveIndexChange(index);
    swiper?.slideTo(index);
  };

  if (!images.length) {
    return (
      <div className="flex aspect-[4/3] min-h-[320px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
        <div className="text-center">
          <ImageIcon className="mx-auto h-10 w-10" />
          <p className="mt-2 text-sm font-medium">No product images</p>
        </div>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div className="space-y-3">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <img
            src={images[activeIndex] || images[0]}
            alt={`${productName || "Product"} image`}
            className="h-[320px] w-full bg-slate-50 object-contain sm:h-[440px] lg:h-[560px]"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={`thumb-${src}-${index}`}
              type="button"
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white transition ${activeIndex === index ? "border-slate-900" : "border-slate-200"
                }`}
            >
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <Swiper
          key={images.join("|")}
          modules={[Autoplay, Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 3200, disableOnInteraction: false }}
          loop={false}
          rewind={images.length > 1}
          speed={550}
          onSwiper={setSwiper}
          onSlideChange={(instance) => onActiveIndexChange(instance.activeIndex)}
          className="h-[320px] sm:h-[440px] lg:h-[560px]"
        >
          {images.map((src, index) => (
            <SwiperSlide key={`${src}-${index}`}>
              <img
                src={src}
                alt={`${productName || "Product"} image ${index + 1}`}
                className="h-full w-full bg-slate-50 object-contain"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {images.map((src, index) => (
          <button
            key={`thumb-${src}-${index}`}
            type="button"
            onClick={() => goToSlide(index)}
            className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white transition ${activeIndex === index ? "border-slate-900" : "border-slate-200 hover:border-slate-400"
              }`}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
};

const FactRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div className="grid grid-cols-6 gap-2 py-1.5 border-b border-slate-100 last:border-b-0">
      <div className="col-span-3 text-sm text-gray-500">{label} :</div>
      <div className="col-span-3 text-sm font-semibold text-gray-800">{value}</div>
    </div>
  );
};

const ActionButton = ({ onClick, href, colorBorder, children, title }) => {
  const cls = `flex items-center justify-center gap-2 border ${colorBorder} font-semibold px-3.5 py-2 rounded-lg transition-all duration-300 hover:shadow-lg active:scale-95`;
  if (href) return <a href={href} className={cls} title={title}>{children}</a>;
  return <button type="button" onClick={onClick} className={cls} title={title}>{children}</button>;
};

const GeneralProductDetails = ({ productDetails }) => {
  const { addToCart, user, parsedUser } = useAppContext();
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [descTab, setDescTab] = useState("description");

  const variants = useMemo(() => normalizeVariants(productDetails), [productDetails]);
  const productImages = useMemo(
    () =>
      uniqueImages([
        primaryProductImage(productDetails),
        ...imageList(productDetails?.p_images),
      ]),
    [productDetails]
  );

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId) || variants[0] || null,
    [selectedVariantId, variants]
  );

  const galleryImages = useMemo(
    () =>
      uniqueImages([
        selectedVariant?.primaryImage,
        ...(selectedVariant?.galleryImages || []),
        ...productImages,
      ]),
    [productImages, selectedVariant]
  );

  const description = parseMaybeJson(productDetails?.p_description) || {};
  const moreInformation = useMemo(() => normalizeMoreInformation(productDetails), [productDetails]);
  const currentUser = parseUser(user) || parsedUser || null;
  const sellerPhone = currentUser?.phone || productDetails?.shop?.s_phone || DEFAULT_PHONE;
  const sellerMobileNumber = formatLocalMobile(productDetails?.user?.phone);
  const sellerInfoList = (Array.isArray(productDetails?.p_seller_info) ? productDetails.p_seller_info : [])
    .map((seller) => ({ name: seller?.name || "", phone: formatLocalMobile(seller?.phone) }))
    .filter((seller) => seller.phone);
  const showSellerMobile = Number(productDetails?.p_show_seller_mobile) === 1 && (sellerInfoList.length > 0 || Boolean(sellerMobileNumber));
  const selectedStatus = statusLabel(selectedVariant);
  const totalStock = variants.reduce((sum, v) => sum + toNumber(v.availableQty ?? v.stockQty), 0);
  const videoLink = String(productDetails?.p_video_link || "").trim();
  const videoEmbed = youtubeEmbedUrl(videoLink);
  const normalizedVideoLink = normalizeExternalUrl(videoLink);
  const discountAmount =
    selectedVariant?.discountPrice > 0 && selectedVariant?.discountPrice < selectedVariant?.regularPrice
      ? selectedVariant.regularPrice - selectedVariant.discountPrice
      : 0;

  useEffect(() => { setIsMounted(true); }, []);
  useEffect(() => { setSelectedVariantId(variants[0]?.id || ""); }, [variants]);
  useEffect(() => { setActiveImageIndex(0); }, [selectedVariantId]);

  if (!productDetails) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-slate-500">Loading product...</div>;
  }

  const copyCode = async () => {
    if (!productDetails?.p_code) return;
    await navigator.clipboard.writeText(productCode(productDetails.p_code));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const copyDetails = async () => {
    const productUrl = productUrlFor(productDetails);
    const lines = [
      productDetails?.p_name,
      productDetails?.brand?.md_title ? `Brand: ${productDetails.brand.md_title}` : "",
      productDetails?.category?.c_name ? `Category: ${productDetails.category.c_name}` : "",
      selectedVariant?.title ? `Variant: ${selectedVariant.title}` : "",
      selectedVariant?.sku ? `SKU: ${selectedVariant.sku}` : "",
      selectedVariant?.sellingPrice ? `Price: ${money(selectedVariant.sellingPrice)}` : "",
      `Link: ${productUrl}`,
    ].filter(Boolean);
    await navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Product details copied.");
  };

  const shareProduct = async () => {
    const productUrl = productUrlFor(productDetails);
    const shareData = {
      title: productDetails?.p_name || "Pilot Bazar product",
      text: `${productDetails?.p_name || "Product"} - ${selectedVariant ? money(selectedVariant.sellingPrice) : ""}`,
      url: productUrl,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); return; } catch (e) { if (e?.name === "AbortError") return; }
    }
    await navigator.clipboard.writeText(productUrl);
    toast.success("Product link copied.");
  };

  const downloadGallery = async () => {
    if (!galleryImages.length) { toast.error("No images found."); return; }
    setIsDownloading(true);
    const toastId = toast.loading("Preparing gallery...");
    try {
      const zip = new JSZip();
      const folder = zip.folder(productDetails?.p_slug || "product-gallery");
      for (let i = 0; i < galleryImages.length; i++) {
        const response = await fetch(galleryImages[i]);
        const blob = await response.blob();
        folder.file(`image-${i + 1}.${blob.type?.split("/")[1] || "jpg"}`, blob);
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${productDetails?.p_slug || "product-gallery"}.zip`);
      toast.success("Gallery downloaded.", { id: toastId });
    } catch {
      toast.error("Could not download gallery.", { id: toastId });
    } finally {
      setIsDownloading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) { toast.error("Please select a variant."); return; }
    const price = selectedVariant.sellingPrice || 0;
    const cartPayload = {
      c_user_id: currentUser?.id || null,
      c_session_id: currentUser?.id ? null : getSessionId(),
      ci_product_id: productDetails.p_id,
      ci_type_id: productDetails.p_type_id,
      ci_qty: quantity,
      ci_price: price,
      ci_url: galleryImages[0] || "",
      ci_name: `${productDetails.p_name}${selectedVariant.title ? ` - ${selectedVariant.title}` : ""}`,
      ci_subtotal: price * quantity,
    };
    if (selectedVariant.variantId) cartPayload.ci_product_variant_id = selectedVariant.variantId;
    if (selectedVariant.legacyPriceId) cartPayload.ci_product_price_id = selectedVariant.legacyPriceId;
    addToCart(productDetails.p_id, cartPayload);

    pushDataLayerEvent("add_to_cart", {
      value: price,
      currency: "BDT",
      items: [{ item_id: productDetails.p_id, item_name: cartPayload.ci_name, price }],
    });
  };

  const leftFacts = [
    { label: "Brand", value: productDetails?.brand?.md_title },
    { label: "Category", value: productDetails?.category?.c_name },
    { label: "SKU", value: selectedVariant?.sku },
    { label: "Barcode", value: selectedVariant?.barcode },
    { label: "Outlet", value: productDetails?.outlet?.uo_name },
  ];

  const rightFacts = [
    { label: "Location", value: productDetails?.location?.l_name },
    { label: "Stock", value: totalStock > 0 ? `${totalStock} pcs` : selectedVariant?.variantId ? "Out of stock" : null },
    { label: "Code", value: productDetails?.p_code },
    { label: "Status", value: selectedStatus },
  ];

  const actionButtons = (
    <div className="flex gap-2 flex-wrap">
      <ActionButton onClick={copyDetails} colorBorder="border-blue-300" title="Copy details">
        <Copy className="h-4 w-4 text-blue-600" />
      </ActionButton>
      <ActionButton onClick={shareProduct} colorBorder="border-green-300" title="Share">
        <Share2 className="h-4 w-4 text-green-600" />
      </ActionButton>
      <ActionButton href={`tel:${sellerPhone}`} colorBorder="border-purple-300" title="Call">
        <PhoneOutgoing className="h-4 w-4 text-purple-600" />
      </ActionButton>
      <ActionButton onClick={downloadGallery} colorBorder="border-lime-400" title="Download images">
        <Download className="h-4 w-4 text-lime-600" />
      </ActionButton>
      <ActionButton onClick={handleAddToCart} colorBorder="border-orange-300" title="Add to cart">
        <ShoppingCart className="h-4 w-4 text-orange-600" />
      </ActionButton>
    </div>
  );

  const pblTestContent = description?.pbl_test ? (
    <div className="border rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-gray-50">
        <Layers className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-600">PBL Text</span>
      </div>
      <div className="p-4">
        <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">{description.pbl_test}</p>
      </div>
    </div>
  ) : null;

  const sellerMobileBlock = showSellerMobile ? (
    sellerInfoList.length > 0 ? (
      sellerInfoList.map((seller, index) => (
        <a
          key={index}
          href={`tel:${seller.phone}`}
          title="Call seller"
          className="relative flex items-center gap-3 rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm animate-pulse hover:shadow-md hover:animate-none transition-shadow mb-3"
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
    ) : (
      <a
        href={`tel:${sellerMobileNumber}`}
        title="Call seller"
        className="relative flex items-center gap-3 rounded-lg border-2 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 p-4 shadow-sm animate-pulse hover:shadow-md hover:animate-none transition-shadow"
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
    )
  ) : null;

  const descTabs = [
    { key: "description", label: "Description", content: description?.pbl || description?.user || "" },
    { key: "special", label: "Special Description", content: description?.meta || "" },
  ].filter((tab) => tab.content);

  const descriptionContent = (
    <div className="border rounded-lg shadow-sm overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b bg-gray-50">
        <div className="flex items-center gap-1 px-4 pt-3 pb-0">
          <Layers className="h-4 w-4 text-blue-600 mb-3" />
        </div>
        {descTabs.length > 0 ? (
          descTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setDescTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${descTab === tab.key
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              {tab.label}
            </button>
          ))
        ) : (
          <span className="px-4 py-3 text-sm font-medium text-blue-600">Product Description</span>
        )}
      </div>

      {/* Tab content */}
      <div className="p-4">
        {descTabs.length > 0 ? (
          descTabs.map((tab) => (
            <div key={tab.key} className={descTab === tab.key ? "block" : "hidden"}>
              <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">{tab.content}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400">No product description added yet.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-4 pb-8">
      {/* Breadcrumb */}
      <nav className="mt-3 flex flex-wrap items-center gap-1 text-sm text-slate-500" aria-label="Breadcrumb">
        <Link href="/" className="font-medium hover:text-slate-900">Home</Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <Link href="/general-products" className="font-medium hover:text-slate-900">General Products</Link>
        {productDetails?.category?.c_name && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <Link href={`/general-products?category_id=${productDetails.category.c_id}`} className="font-medium hover:text-slate-900">
              {productDetails.category.c_name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="max-w-[300px] truncate text-slate-700">{productDetails?.p_name}</span>
      </nav>

      {/* Title + desktop action buttons */}
      <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-start mt-4 gap-3">
        <div>
          <p className="text-xl font-bold md:text-3xl md:font-semibold text-gray-900 leading-tight">
            {productDetails?.p_name}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {productDetails?.category?.c_name && (
              <span className="rounded-full bg-slate-900 px-3 py-0.5 text-xs font-semibold text-white">
                {productDetails.category.c_name}
              </span>
            )}
            <span className={`rounded-full px-3 py-0.5 text-xs font-semibold ring-1 ${statusClass(selectedVariant)}`}>
              {selectedStatus}
            </span>
            {Number(productDetails?.p_is_saleBy_pbl) === 1 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-0.5 text-xs font-semibold text-white">
                <ShieldCheck className="h-3 w-3" /> PBL
              </span>
            )}
            <GiftBadge userGift={productDetails?.user_gift} pblGift={productDetails?.pbl_gift} variant="inline" />
            {isMounted && productDetails?.p_created_at && (
              <span className="text-sm text-gray-400">{dayjs(productDetails.p_created_at).fromNow()}</span>
            )}
          </div>
        </div>

        <div className="hidden md:flex md:items-center md:justify-end gap-2 flex-wrap shrink-0">
          {actionButtons}
          <button
            type="button"
            onClick={copyDetails}
            className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 transform hover:scale-105 text-sm"
          >
            <Copy className="h-4 w-4" />
            Copy All
          </button>
        </div>
      </div>

      {/* Main grid: md:5 cols (3 left + 2 right) */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">

        {/* ── LEFT col (3/5) ── */}
        <div className="md:col-span-3 space-y-4">
          <GalleryCarousel
            images={galleryImages}
            productName={productDetails?.p_name}
            activeIndex={activeImageIndex}
            onActiveIndexChange={setActiveImageIndex}
          />




          {/* Description – desktop only */}
          <div className="hidden md:block space-y-4">
            {pblTestContent}
            {descriptionContent}
          </div>
        </div>

        {/* Mobile action buttons */}
        <div className="md:hidden">
          <div className="flex items-center justify-end gap-2 mb-3 flex-wrap">
            {actionButtons}
          </div>
          <button
            type="button"
            onClick={copyDetails}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg shadow-md flex items-center justify-center gap-2 text-sm"
          >
            <Copy className="h-4 w-4" />
            Copy All Details
          </button>
        </div>

        {/* ── RIGHT col (2/5) — sticky + scrollable ── */}
        <div className="md:col-span-2 md:col-start-4 space-y-4 md:sticky md:top-4 md:self-start md:max-h-[calc(100vh-2rem)] md:overflow-y-auto md:pr-1">

          {sellerMobileBlock}

          {/* Price card — green like vehicle page 693 */}
          <div className="w-full border bg-green-50 border-green-200 rounded-lg shadow p-4 lg:p-5 space-y-4">
            {/* Price row */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-bold text-gray-800">
                  {money(selectedVariant?.sellingPrice)}
                </div>
                {discountAmount > 0 && (
                  <div className="text-base text-red-400 line-through font-medium">
                    {money(selectedVariant?.regularPrice)}
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="text-sm font-semibold text-emerald-600">
                    You save {money(discountAmount)}
                  </div>
                )}
                {selectedVariant?.wholesalePrice > 0 && (
                  <div className="mt-1 inline-flex items-center rounded-md bg-amber-50 border border-amber-200 px-3 py-1 text-sm text-amber-700 font-medium">
                    Wholesale: {money(selectedVariant.wholesalePrice)}
                    {selectedVariant.minimumWholesaleQty > 0 ? ` (min ${selectedVariant.minimumWholesaleQty} pcs)` : ""}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={downloadGallery}
                disabled={isDownloading}
                className="px-3.5 py-2 text-sm font-medium text-white bg-lime-600 border border-lime-700 rounded-lg hover:bg-lime-700 flex items-center gap-2 disabled:opacity-60 transition-all duration-200"
                title="Download images"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>

            {/* Code */}
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-gray-700">Code :</span>
              <button
                type="button"
                onClick={copyCode}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                {copied ? "Copied!" : productCode(productDetails?.p_code) || productDetails?.p_code || "—"}
              </button>
            </div>

            {/* Variant selector */}
            {variants.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-700">Choose Variant</h3>
                  <span className="text-sm text-gray-400">{variants.length} option{variants.length !== 1 ? "s" : ""}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {variants.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`flex items-center gap-2.5 rounded-lg border p-2.5 text-left transition-all duration-150 ${selectedVariant?.id === variant.id
                        ? "border-slate-900 bg-white ring-2 ring-slate-900/10 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-400 hover:shadow-sm"
                        }`}
                    >
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-slate-100 border border-slate-200">
                        {variant.primaryImage || productImages[0] ? (
                          <img src={variant.primaryImage || productImages[0]} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ImageIcon className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs font-semibold text-slate-900 leading-tight">{variant.title}</div>
                        <div className="mt-0.5 flex flex-wrap gap-1">
                          {variant.options.slice(0, 2).map((opt) => (
                            <span key={`${variant.id}-${opt.label}-${opt.value}`} className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                              {opt.value}
                            </span>
                          ))}
                        </div>
                        <div className="mt-0.5 text-xs font-bold text-slate-800">{money(variant.sellingPrice)}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity + Add to Cart + Call */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex h-11 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-full text-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value || 1)))}
                  className="w-10 h-full border-x border-slate-200 text-center text-sm font-semibold outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-full text-lg font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                className="flex-1 h-11 flex items-center justify-center gap-2 rounded-lg bg-slate-900 text-white font-semibold text-sm hover:bg-slate-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>

              <a
                href={`tel:${sellerPhone}`}
                className="h-11 w-11 flex items-center justify-center rounded-lg border border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all duration-200 shrink-0"
                title="Call seller"
              >
                <PhoneOutgoing className="h-4 w-4 text-purple-600" />
              </a>
            </div>
          </div>

          {/* Product Facts */}
          <div className="border rounded-lg shadow-sm p-4">
            <div className="mb-3 border-b pb-2 flex items-center justify-between">
              <h2 className="text-lg font-medium text-blue-600">Product Details</h2>
              <button
                type="button"
                onClick={copyCode}
                className="text-sm font-medium text-blue-600 flex items-center gap-1 hover:text-blue-800 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied!" : "Copy Code"}
              </button>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 xl:gap-x-4 text-sm">
              <div>
                {leftFacts.map((fact) => (
                  <FactRow key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </div>
              <div>
                {rightFacts.map((fact) => (
                  <FactRow key={fact.label} label={fact.label} value={fact.value} />
                ))}
              </div>
            </div>
          </div>

          {/* More Information */}
          {moreInformation.length > 0 && (
            <div className="border rounded-lg shadow-sm p-4">
              <div className="mb-3 border-b pb-2 flex items-center gap-2">
                <Boxes className="h-4 w-4 text-blue-600" />
                <h2 className="text-lg font-medium text-blue-600">More Information</h2>
              </div>
              <div className="text-sm">
                {moreInformation.map((item, index) => (
                  <FactRow key={`${item.label}-${index}`} label={item.label || "Info"} value={item.value} />
                ))}
              </div>
            </div>
          )}

          {/* Specific Features */}
          {productDetails?.p_fs?.length > 0 && (
            <div className="border rounded-lg shadow-sm p-4">
              <div className="mb-3 border-b pb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <h2 className="text-lg font-medium text-blue-600">Specific Features</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {productDetails.p_fs.map((feature, index) =>
                  feature?.specification?.length > 0 ? (
                    <div key={`${feature?.md_title}-${index}`} className="border-b border-slate-100 pb-3 last:border-b-0">
                      <h3 className="font-medium text-blue-600 mb-1.5 text-sm">{feature?.md_title}</h3>
                      {feature.specification.map((item, idx) => (
                        <p key={`${item?.fs_title}-${idx}`} className="text-sm text-gray-700 leading-5">
                          {item?.fs_title}
                        </p>
                      ))}
                    </div>
                  ) : null
                )}
              </div>
            </div>
          )}

          {/* Video */}
          {videoLink && (
            <div className="border rounded-lg shadow-sm p-4">
              <div className="mb-3 border-b pb-2 flex items-center justify-between">
                <h2 className="text-lg font-medium text-blue-600 flex items-center gap-2">
                  <PlayCircle className="h-4 w-4" />
                  Product Video
                </h2>
                <a
                  href={normalizedVideoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-800"
                >
                  Open <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
              {videoEmbed ? (
                <div className="relative w-full overflow-hidden rounded-lg bg-slate-950" style={{ paddingTop: "56.25%" }}>
                  <iframe
                    src={videoEmbed}
                    title={`${productDetails?.p_name || "Product"} video`}
                    className="absolute left-0 top-0 h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : (
                <a
                  href={normalizedVideoLink}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-700 hover:bg-slate-100"
                >
                  <PlayCircle className="h-4 w-4 text-slate-500" />
                  {videoLink}
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Description – mobile only */}
      <div className="md:hidden mt-2 space-y-4">
        {pblTestContent}
        {descriptionContent}
      </div>
    </div>
  );
};

export default GeneralProductDetails;
