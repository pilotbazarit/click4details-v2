import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Gift as GiftIcon, ImagePlus, X } from "lucide-react";
import GiftService from '@/services/GiftService';

const schema = yup.object().shape({
    g_title: yup.string().required("Title is required"),
    g_description: yup.string().nullable(),
    g_expiredate: yup.string().nullable(),
    g_status: yup.string().required("Status is required"),
});

const GiftModal = ({ open, setOpen, getGifts, initialData }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: { g_status: 'active' },
    });

    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState(initialData?.g_image || null);
    const [imageRemoved, setImageRemoved] = useState(false);
    const imageInputRef = useRef(null);

    const imagePreviewUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

    useEffect(() => {
        return () => {
            if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
        };
    }, [imagePreviewUrl]);

    useEffect(() => {
        if (initialData) {
            reset({
                g_title: initialData.g_title || '',
                g_description: initialData.g_description || '',
                g_expiredate: initialData.g_expiredate ? String(initialData.g_expiredate).slice(0, 10) : '',
                g_status: initialData.g_status || 'active',
            });
            setExistingImage(initialData.g_image || null);
        } else {
            reset({ g_title: '', g_description: '', g_expiredate: '', g_status: 'active' });
            setExistingImage(null);
        }
        setImage(null);
        setImageRemoved(false);
        if (imageInputRef.current) imageInputRef.current.value = '';
    }, [initialData, reset]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setImageRemoved(false);
        }
    };

    const handleRemoveImage = () => {
        setImage(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        if (existingImage) setImageRemoved(true);
    };

    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append('g_title', data.g_title);
            formData.append('g_description', data.g_description || '');
            if (data.g_expiredate) formData.append('g_expiredate', data.g_expiredate);
            formData.append('g_status', data.g_status);
            if (image) formData.append('g_image', image);

            if (initialData) {
                if (imageRemoved && !image && existingImage?.public_id) {
                    formData.append('g_image_remove[]', existingImage.public_id);
                }
                formData.append('_method', 'PUT');
                await GiftService.Commands.updateGift(initialData.g_id, formData);
                toast.success("Gift updated successfully!");
            } else {
                await GiftService.Commands.storeGift(formData);
                toast.success("Gift added successfully!");
            }
            getGifts();
            setOpen(false);
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
        }
    };

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) reset();
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl overflow-hidden p-0">
                <div className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white text-xl">
                            <GiftIcon className="h-6 w-6" />
                            {initialData ? "Edit Gift" : "Add New Gift"}
                        </DialogTitle>
                    </DialogHeader>
                    <p className="mt-1 text-sm text-purple-100">
                        Gifts can be attached to any vehicle or product as a seller gift or a PilotBazar gift.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="g_title">Gift Title</Label>
                            <Input
                                className="border-gray-400"
                                {...register("g_title")}
                                id="g_title"
                                placeholder="e.g. Free Helmet, 1 Year Service"
                                disabled={isSubmitting}
                            />
                            {errors.g_title && <p className="text-red-600 text-sm">{errors.g_title.message}</p>}
                        </div>

                        <div>
                            <Label htmlFor="g_description">Description</Label>
                            <textarea
                                id="g_description"
                                rows={3}
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full resize-none"
                                {...register("g_description")}
                                placeholder="Describe what the customer gets"
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="g_expiredate">Expire Date</Label>
                                <Input
                                    className="border-gray-400"
                                    type="date"
                                    {...register("g_expiredate")}
                                    id="g_expiredate"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div>
                                <Label htmlFor="g_status">Status</Label>
                                <select
                                    id="g_status"
                                    className="outline-none py-2 px-3 rounded border border-gray-400 w-full h-10"
                                    {...register("g_status")}
                                    disabled={isSubmitting}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                                {errors.g_status && <p className="text-red-600 text-sm">{errors.g_status.message}</p>}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="g_image">Gift Image</Label>
                            <div className="mt-2 flex items-center gap-4">
                                <label
                                    htmlFor="g_image"
                                    className="cursor-pointer inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                                >
                                    <ImagePlus className="h-4 w-4" />
                                    {image ? "Change Image" : existingImage ? "Change Image" : "Choose Image"}
                                </label>
                                {image && <span className="text-gray-700 truncate max-w-xs">{image.name}</span>}
                            </div>
                            <input
                                ref={imageInputRef}
                                id="g_image"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />

                            {image && (
                                <div className="mt-3 w-32 h-32 relative">
                                    <img src={imagePreviewUrl} alt="Gift preview" className="w-32 h-32 object-cover border rounded-lg" />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        aria-label="Remove selected image"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                            {!image && existingImage && !imageRemoved && (
                                <div className="mt-3 w-32 h-32 relative">
                                    <img
                                        src={existingImage.secure_url || existingImage.url}
                                        alt="Current gift"
                                        className="w-32 h-32 object-cover border rounded-lg"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                        aria-label="Remove current image"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6 border-t pt-4">
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            className="px-6 py-2.5 rounded font-medium border border-gray-300 text-gray-700 hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-6 py-2.5 rounded font-medium disabled:opacity-50 hover:bg-purple-700"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : (initialData ? "Update Gift" : "Add Gift")}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default GiftModal;
