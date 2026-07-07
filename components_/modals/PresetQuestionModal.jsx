import React, { useEffect } from 'react'
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
import FeedbackTemplateService from '@/services/PresetQuestionService';

const schema = yup.object().shape({
    pqa_type: yup.string().required("Type is required"),
    pqa_cat_id: yup.string().required("Category is required"),
    pqa_title: yup.string().required("Title is required"),
    pqa_priority: yup.number().transform(value => (isNaN(value) ? undefined : value)).nullable(),
    status: yup.string().required("Status is required")
});

const PresetQuestionModal = ({ open, setOpen, presetCategories, getPresetQuestionAnswer, initialData }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
    } = useForm({
        resolver: yupResolver(schema),
    });

    // Set initial form values
    useEffect(() => {
        if (initialData) {
            setValue('pqa_type', initialData.pqa_type);
            setValue('pqa_cat_id', initialData.pqa_cat_id);
            setValue('pqa_title', initialData.pqa_title);
            setValue('pqa_priority', initialData.pqa_priority);
            setValue('status', initialData.pqa_status);
        } else {
            reset({
                pqa_type: '',
                pqa_cat_id: '',
                pqa_title: '',
                pqa_priority: '',
                status: ''
            });
        }
    }, [initialData, reset, setValue]);

    const onSubmit = async (data) => {
        try {
            if (initialData) {
                // Update existing preset question
                await FeedbackTemplateService.Commands.updateFeedbackTemplate(initialData.pqa_id, {
                    ...data,
                    _method: 'PUT'
                });
                toast.success("Preset question updated successfully!");
            } else {
                // Create new preset question
                await FeedbackTemplateService.Commands.storeFeedbackTemplate(data);
                toast.success("Preset question added successfully!");
            }
            if (getPresetQuestionAnswer) {
                getPresetQuestionAnswer();
            }
            setOpen(false);
        } catch (error) {
            if (error.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error.message || "Something went wrong");
            }
        }
    };

    // Function to handle dialog open/close changes
    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset(); // Reset form when dialog closes
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Edit Preset Question & Answer" : "Add Preset Question & Answer"}</DialogTitle>
                </DialogHeader>

                <hr />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        
                        {/* Type Select */}
                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="pqa_type">
                                Type
                            </label>
                            <select
                                id="pqa_type"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("pqa_type")}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Type</option>
                                <option value="q">Question</option>
                                <option value="a">Answer</option>
                            </select>
                            {errors.pqa_type && <p className="text-red-600 text-sm">{errors.pqa_type.message}</p>}
                        </div>


                  

                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="pqa_cat_id">
                                Category
                            </label>
                            <select
                                id="pqa_cat_id"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("pqa_cat_id")}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Category</option>
                                {presetCategories?.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                            {errors.pqa_cat_id && <p className="text-red-600 text-sm">{errors.pqa_cat_id.message}</p>}
                        </div>


                    

                        <div>
                            <Label htmlFor="pqa_title">Title</Label>
                            <Input
                                className="border-gray-400"
                                {...register("pqa_title")}
                                id="pqa_title"
                                placeholder="Enter title"
                                disabled={isSubmitting}
                            />
                            {errors.pqa_title && <p className="text-red-600 text-sm">{errors.pqa_title.message}</p>}
                        </div>


                         <div>
                            <Label htmlFor="pqa_priority">Priority</Label>
                            <Input
                                className="border-gray-400"
                                {...register("pqa_priority")}
                                id="pqa_priority"
                                placeholder="Enter priority"
                                disabled={isSubmitting}
                                type="number"
                            />
                            {errors.pqa_priority && <p className="text-red-600 text-sm">{errors.pqa_priority.message}</p>}
                        </div>



                        <div className="flex flex-col gap-1 w-full">
                            <label className="text-base font-medium" htmlFor="status">
                                Status
                            </label>
                            <select
                                id="status"
                                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                {...register("status")}
                                disabled={isSubmitting}
                            >
                                <option value="">Select Status</option>
                                <option value="1">Active</option>
                                <option value="0">Inactive</option>
                            </select>
                            {errors.status && <p className="text-red-600 text-sm">{errors.status.message}</p>}
                        </div>


                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-6 py-2.5 rounded font-medium disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Processing..." : (initialData ? "UPDATE" : "ADD")}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default PresetQuestionModal;