import React, { useState } from 'react'
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


// Yup Validation Schema
const schema = yup.object().shape({
    s_title: yup.string().required("Title is required"),
    s_description: yup.string().required("Description is required"),
    // s_shop_category_id: yup.string().required("Category is required"),
});

const ShopModal = ({ open, setOpen, shop, fetchShops }) => {
    const [description, setDescription] = useState(shop?.s_description || "");
    const [logo, setLogo] = useState(null);
    const [bannerImages, setBannerImages] = useState([]); // multiple banner
    const [existingLogoUrl, setExistingLogoUrl] = useState(shop?.s_logo || null);
    const [existingBanners, setExistingBanners] = useState(shop?.s_shop_banner || []);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            s_title: shop?.s_title || '',
            s_description: shop?.s_description || '',
            s_shop_category_id: shop?.s_shop_category_id || 1,
            s_address: shop?.s_address || '',
        },
    });

    const onSubmit = async (data) => {
        const formData = new FormData();
        formData.append("s_title", data.s_title);
        formData.append("s_description", description);
        formData.append("s_shop_category_id", data.s_shop_category_id);
        formData.append("s_address", data.s_address);

        // single logo
        if (logo) {
            formData.append("s_logo", logo);
        }

        // multiple banner with index
        if (bannerImages.length > 0) {
            bannerImages.forEach((file, index) => {
                formData.append(`s_shop_banner[${index}]`, file);
            });
        }

        try {
            let response;
            if (shop && shop.s_id) {
                formData.append("_method", 'PUT');
                // Update mode
                response = await StoreService.Commands.updateShop(shop.s_id, formData);

                if (response.status == 'success') {
                    fetchShops();
                    toast.success("Shop updated successfully!");
                }



            } else {
                // Add mode
                response = await StoreService.Commands.storeShop(formData);

                if (response.status == 'success') {
                    fetchShops();
                    toast.success("Shop added successfully!");
                }
            }

            reset();
            setLogo(null);
            setBannerImages([]);
            setExistingLogoUrl(null);
            setExistingBanners([]);
            setOpen(false);
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
        }
    };

    // Handle image changes
    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) setLogo(file);
    };

    const handleMultipleBannerChange = (e) => {
        const files = Array.from(e.target.files);
        setBannerImages((prev) => [...prev, ...files]); // merge previous + new files
    };

    React.useEffect(() => {
        if (shop && open) {

            const shopArr = [];
            if (shop.s_shop_banner?.length > 0) {
                shop.s_shop_banner.forEach((banner) => {
                    shopArr.push(banner.url);
                })
            }

            setValue("s_title", shop.s_title || '');
            setValue("s_description", shop.s_description || '');
            setValue("s_shop_category_id", shop.s_shop_category_id || '');
            setValue("s_address", shop.s_address || '');
            setDescription(shop.s_description || '');
            setExistingLogoUrl(shop?.s_logo?.url || null);
            setExistingBanners(shopArr || []);
            setLogo(null);
            setBannerImages([]);
        } else if (!open) {
            reset();
            setLogo(null);
            setBannerImages([]);
            setExistingLogoUrl(null);
            setExistingBanners([]);
            setDescription('');
        }
    }, [shop, open, reset, setValue]);


    // Remove single banner by index
    const handleRemoveBanner = (index) => {
        setBannerImages((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{shop ? 'Edit Shop' : 'Add New Shop'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        {/* Shop Name */}
                        <div>
                            <Label htmlFor="s_title">Shop Name</Label>
                            <Input
                                {...register("s_title")}
                                id="s_title"
                                placeholder="Enter shop name"
                            />
                            {errors.s_title && <p className="text-red-500 text-sm">{errors.s_title.message}</p>}
                        </div>



                        {/* Address */}
                        <div>
                            <Label htmlFor="s_address">Address</Label>
                            <Input
                                {...register("s_address")}
                                id="s_address"
                                placeholder="Enter address"
                            />
                            {errors.s_address && <p className="text-red-500 text-sm">{errors.s_address.message}</p>}
                        </div>

                        {/* Category */}
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

                        {/* Description */}
                        <div>
                            <Label htmlFor="s_description">Description</Label>
                            <Textarea
                                {...register("s_description")}
                                id="s_description"
                                placeholder="Write about your shop..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {errors.s_description && <p className="text-red-500 text-sm">{errors.s_description.message}</p>}
                        </div>

                        {/* Logo Upload */}
                        <div>
                            <Label htmlFor="s_logo">Upload Logo</Label>
                            <div className="mt-2 flex items-center gap-4">
                                <label
                                    htmlFor="s_logo"
                                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                                >
                                    {logo ? "Change Logo" : existingLogoUrl ? "Change Logo" : "Choose Logo"}
                                </label>
                                {logo && <span className="text-gray-700 truncate max-w-xs">{logo.name}</span>}
                                {!logo && existingLogoUrl && <span className="text-gray-700 truncate max-w-xs">Current Logo</span>}
                            </div>
                            <input
                                id="s_logo"
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                                className="hidden"
                            />
                            {logo && (
                                <div className="mt-2 w-32 h-32 relative">
                                    <img
                                        src={URL.createObjectURL(logo)}
                                        alt="Logo Preview"
                                        className="w-32 h-32 object-cover border rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setLogo(null)}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}
                            {!logo && existingLogoUrl && (
                                <div className="mt-2 w-32 h-32 relative">
                                    <img
                                        src={existingLogoUrl}
                                        alt="Current Logo"
                                        className="w-32 h-32 object-cover border rounded"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setExistingLogoUrl(null)}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                    >
                                        ✕
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
                                id="s_shop_banners"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleMultipleBannerChange}
                                className="hidden"
                            />
                            <div className="flex flex-wrap gap-2 mt-3">
                                {existingBanners.map((url, idx) => (
                                    <div key={"existing-" + idx} className="relative w-24 h-16">
                                        <img
                                            src={url}
                                            alt={`Banner ${idx + 1}`}
                                            className="w-24 h-16 object-cover border rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setExistingBanners(existingBanners.filter((_, i) => i !== idx))}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                                {bannerImages.map((file, idx) => (
                                    <div key={"new-" + idx} className="relative w-24 h-16">
                                        <img
                                            src={URL.createObjectURL(file)}
                                            alt={`Banner ${idx + 1}`}
                                            className="w-24 h-16 object-cover border rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBanner(idx)}
                                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* Submit */}
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
