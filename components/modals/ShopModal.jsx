import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import StoreService from '@/services/ShopService'

const schema = yup.object().shape({
    s_title: yup.string().required("Title is required"),
    s_description: yup.string().required("Description is required"),
    // s_shop_category_id: yup.string().required("Category is required"),
});

const getDefaultValues = (shop) => ({
    s_title: shop?.s_title || '',
    s_description: shop?.s_description || '',
    s_shop_category_id: shop?.s_shop_category_id || 1,
    s_address: shop?.s_address || '',
});

const getAssetUrl = (asset) => {
    if (!asset) return '';
    if (typeof asset === 'string') return asset;

    return asset.url || asset.path || asset.full_url || asset.original_url || '';
};

const normalizeAsset = (asset) => {
    const url = getAssetUrl(asset);
    if (!url) return null;

    return {
        id: typeof asset === 'object' ? asset.id || asset.media_id || asset.uuid || null : null,
        url,
        key: typeof asset === 'object' ? asset.id || asset.media_id || asset.uuid || url : url,
    };
};

const normalizeBanners = (banners) => {
    if (!banners) return [];

    if (Array.isArray(banners)) {
        return banners.map(normalizeAsset).filter(Boolean);
    }

    if (typeof banners === 'string') {
        try {
            const parsedBanners = JSON.parse(banners);
            if (Array.isArray(parsedBanners)) {
                return parsedBanners.map(normalizeAsset).filter(Boolean);
            }
        } catch {
            // Keep plain image URLs as-is.
        }

        const normalizedBanner = normalizeAsset(banners);
        return normalizedBanner ? [normalizedBanner] : [];
    }

    const normalizedBanner = normalizeAsset(banners);
    return normalizedBanner ? [normalizedBanner] : [];
};

const ShopModal = ({ open, setOpen, shop, fetchShops }) => {
    const [logo, setLogo] = useState(null);
    const [bannerImages, setBannerImages] = useState([]);
    const [existingLogo, setExistingLogo] = useState(normalizeAsset(shop?.s_logo));
    const [existingBanners, setExistingBanners] = useState(normalizeBanners(shop?.s_shop_banner));
    const [logoRemoved, setLogoRemoved] = useState(false);
    const [removedExistingBanners, setRemovedExistingBanners] = useState([]);
    const logoInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: getDefaultValues(shop),
    });

    const logoPreviewUrl = useMemo(() => {
        return logo ? URL.createObjectURL(logo) : null;
    }, [logo]);

    const bannerPreviews = useMemo(() => {
        return bannerImages.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
        }));
    }, [bannerImages]);

    useEffect(() => {
        return () => {
            if (logoPreviewUrl) {
                URL.revokeObjectURL(logoPreviewUrl);
            }
        };
    }, [logoPreviewUrl]);

    useEffect(() => {
        return () => {
            bannerPreviews.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
        };
    }, [bannerPreviews]);

    const clearLogoInput = () => {
        if (logoInputRef.current) {
            logoInputRef.current.value = '';
        }
    };

    const clearBannerInput = () => {
        if (bannerInputRef.current) {
            bannerInputRef.current.value = '';
        }
    };

    const resetMediaState = () => {
        setLogo(null);
        setBannerImages([]);
        setExistingLogo(null);
        setExistingBanners([]);
        setLogoRemoved(false);
        setRemovedExistingBanners([]);
        clearLogoInput();
        clearBannerInput();
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("s_title", data.s_title);
        formData.append("s_description", data.s_description);
        formData.append("s_shop_category_id", data.s_shop_category_id || 1);
        formData.append("s_address", data.s_address || '');

        if (logo) {
            formData.append("s_logo", logo);
        }

        bannerImages.forEach((file, index) => {
            formData.append(`s_shop_banner[${index}]`, file);
        });

        try {
            let response;
            if (shop && shop.s_id) {
                formData.append("_method", 'PUT');

                if (logoRemoved && !logo) {
                    formData.append("remove_s_logo", "1");
                }

                existingBanners.forEach((banner, index) => {
                    formData.append(`existing_s_shop_banner[${index}]`, banner.id || banner.url);
                });

                removedExistingBanners.forEach((banner, index) => {
                    formData.append(`removed_s_shop_banner[${index}]`, banner.id || banner.url);
                });

                response = await StoreService.Commands.updateShop(shop.s_id, formData);
            } else {
                response = await StoreService.Commands.storeShop(formData);
            }

            if (response?.status !== 'success') {
                throw new Error(response?.message || "Shop save failed");
            }

            await fetchShops?.();
            toast.success(shop ? "Shop updated successfully!" : "Shop added successfully!");
            reset(getDefaultValues());
            resetMediaState();
            setOpen(false);
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
        }
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
        }
    };

    const handleMultipleBannerChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setBannerImages((prev) => [...prev, ...files]);
        }
        e.target.value = '';
    };

    useEffect(() => {
        if (shop && open) {
            reset(getDefaultValues(shop));
            setExistingLogo(normalizeAsset(shop?.s_logo));
            setExistingBanners(normalizeBanners(shop?.s_shop_banner));
            setLogo(null);
            setBannerImages([]);
            setLogoRemoved(false);
            setRemovedExistingBanners([]);
            clearLogoInput();
            clearBannerInput();
        } else if (open) {
            reset(getDefaultValues());
            resetMediaState();
        } else if (!open) {
            reset(getDefaultValues());
            resetMediaState();
        }
    }, [shop, open, reset]);

    const handleRemoveBanner = (index) => {
        setBannerImages((prev) => prev.filter((_, i) => i !== index));
        clearBannerInput();
    };

    const handleRemoveExistingBanner = (index) => {
        const removedBanner = existingBanners[index];
        if (removedBanner) {
            setRemovedExistingBanners((prev) => [...prev, removedBanner]);
        }
        setExistingBanners((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingLogo = () => {
        setExistingLogo(null);
        setLogoRemoved(true);
        clearLogoInput();
    };

    const handleRemoveLogo = () => {
        setLogo(null);
        clearLogoInput();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{shop ? 'Edit Shop' : 'Add New Shop'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div>
                            <Label htmlFor="s_title">Shop Name</Label>
                            <Input
                                {...register("s_title")}
                                id="s_title"
                                placeholder="Enter shop name"
                            />
                            {errors.s_title && <p className="text-red-500 text-sm">{errors.s_title.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="s_address">Address</Label>
                            <Input
                                {...register("s_address")}
                                id="s_address"
                                placeholder="Enter address"
                            />
                            {errors.s_address && <p className="text-red-500 text-sm">{errors.s_address.message}</p>}
                        </div>

                        <div className="flex flex-col gap-1 w-full hidden">
                            <label className="text-base font-medium" htmlFor="s_shop_category_id">
                                Select category
                            </label>
                            <select
                                id="s_shop_category_id"
                                {...register("s_shop_category_id")}
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                            >
                                <option value="1">Category 1</option>
                                <option value="2">Category 2</option>
                            </select>
                            {errors.s_shop_category_id && <p className="text-red-500 text-sm">{errors.s_shop_category_id.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="s_description">Description</Label>
                            <Textarea
                                {...register("s_description")}
                                id="s_description"
                                placeholder="Write about your shop..."
                            />
                            {errors.s_description && <p className="text-red-500 text-sm">{errors.s_description.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="s_logo">Upload Logo</Label>
                            <div className="mt-2 flex items-center gap-4">
                                <label
                                    htmlFor="s_logo"
                                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                >
                                    {logo ? "Change Logo" : existingLogo ? "Change Logo" : "Choose Logo"}
                                </label>
                                {logo && <span className="text-gray-700 truncate max-w-xs">{logo.name}</span>}
                                {!logo && existingLogo && <span className="text-gray-700 truncate max-w-xs">Current Logo</span>}
                            </div>
                            <input
                                ref={logoInputRef}
                                id="s_logo"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                            {logo && (
                                <div className="mt-2 w-32 h-32 relative">
                                    <img
                                        src={logoPreviewUrl}
                                        alt="Logo Preview"
                                        className="w-32 h-32 object-cover border rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveLogo}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        aria-label="Remove selected logo"
                                    >
                                        x
                                    </button>
                                </div>
                            )}
                            {!logo && existingLogo && (
                                <div className="mt-2 w-32 h-32 relative">
                                    <img
                                        src={existingLogo.url}
                                        alt="Current Logo"
                                        className="w-32 h-32 object-cover border rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveExistingLogo}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        aria-label="Remove current logo"
                                    >
                                        x
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="s_shop_banners">Upload Banners</Label>
                            <div className="mt-2 flex items-center gap-4">
                                <label
                                    htmlFor="s_shop_banners"
                                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                                >
                                    {bannerImages.length > 0 ? "Add Banners" : existingBanners.length > 0 ? "Add Banners" : "Choose Banners"}
                                </label>
                                {(bannerImages.length > 0 || existingBanners.length > 0) && (
                                    <span className="text-gray-700">{bannerImages.length + existingBanners.length} file(s) selected</span>
                                )}
                            </div>
                            <input
                                ref={bannerInputRef}
                                id="s_shop_banners"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleMultipleBannerChange}
                                className="hidden"
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {existingBanners.map((banner, idx) => (
                                    <div key={banner.key || `existing-${idx}`} className="relative w-24 h-16">
                                        <img
                                            src={banner.url}
                                            alt={`Banner ${idx + 1}`}
                                            className="w-24 h-16 object-cover border rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveExistingBanner(idx)}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                            aria-label={`Remove current banner ${idx + 1}`}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                                {bannerPreviews.map(({ file, previewUrl }, idx) => (
                                    <div key={`new-${idx}-${file.name}`} className="relative w-24 h-16">
                                        <img
                                            src={previewUrl}
                                            alt={`Banner ${idx + 1}`}
                                            className="w-24 h-16 object-cover border rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBanner(idx)}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                            aria-label={`Remove selected banner ${idx + 1}`}
                                        >
                                            x
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium"
                        >
                            {isSubmitting ? (shop ? "Updating..." : "Saving...") : shop ? "UPDATE" : "ADD"}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default ShopModal
