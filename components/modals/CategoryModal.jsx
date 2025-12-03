"use client";
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import CategoryService from '@/services/CategoryService';
import { ChevronRight, Home, ArrowLeft, FolderTree } from 'lucide-react';

const schema = yup.object().shape({
    c_name: yup.string().required("Name is required"),
    c_status: yup.string().required("Status is required"),
    c_parent_id: yup.number().nullable()
});

const CategoryModal = ({ open, setOpen, categories, getCategories, initialData }) => {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            c_parent_id: null,
            c_name: '',
            c_status: 'active'
        }
    });

    // Tree picker states
    const [categoryItems, setCategoryItems] = useState([]);
    const [isCategoryLoading, setIsCategoryLoading] = useState(false);
    const [categoryHistory, setCategoryHistory] = useState([]);
    const [showCategoryPicker, setShowCategoryPicker] = useState(false);

    const selectedParentId = watch('c_parent_id');
    const categoryName = watch('c_name');

    // Set form values when initialData changes
    useEffect(() => {
        if (initialData) {
            setValue('c_parent_id', initialData.c_parent_id || null);
            setValue('c_name', initialData.c_name);
            setValue('c_status', initialData.c_status);
        } else {
            reset({
                c_parent_id: null,
                c_name: '',
                c_status: 'active'
            });
            setCategoryHistory([]);
        }
    }, [initialData, reset, setValue, open]);

    // Fetch categories based on parent ID
    const fetchCategories = async (parentId = 0) => {
        setIsCategoryLoading(true);
        try {
            const response = await CategoryService.Queries.getCategories({
                _page: 1,
                _perPage: 5000,
                _parent_id: parentId,
            });

            if (response.status === "success") {
                setCategoryItems(response?.data?.data || []);
            } else {
                setCategoryItems([]);
            }
        } catch (error) {
            toast.error("Failed to fetch categories");
            setCategoryItems([]);
        } finally {
            setIsCategoryLoading(false);
        }
    };

    // Load categories when picker opens or history changes
    useEffect(() => {
        if (showCategoryPicker) {
            const parentId = categoryHistory.length > 0
                ? categoryHistory[categoryHistory.length - 1]?.c_id
                : 0;
            fetchCategories(parentId);
        }
    }, [categoryHistory, showCategoryPicker]);

    const handleCategoryClick = (category) => {
        setValue('c_parent_id', category.c_id, { shouldValidate: true });
        setCategoryHistory(prev => [...prev, category]);
    };

    const handleCategoryBack = () => {
        if (categoryHistory.length > 0) {
            const newHistory = [...categoryHistory];
            newHistory.pop();
            const parentCategory = newHistory[newHistory.length - 1];
            setValue('c_parent_id', parentCategory ? parentCategory.c_id : null, { shouldValidate: true });
            setCategoryHistory(newHistory);
        }
    };

    const handleReset = () => {
        setCategoryHistory([]);
        setValue('c_parent_id', null, { shouldValidate: true });
    };


    console.log("initialData", initialData);

    const onSubmit = async (data) => {
        console.log("Form Data Submitted: ", data);
        const payload = {
            c_name: data.c_name,
            c_parent_id: data.c_parent_id || 0,
            c_status: data.c_status
        };

        try {
            if (initialData) {
                await CategoryService.Commands.updateCategory(
                    initialData.c_id,
                    { ...payload, _method: 'PUT' }
                );
                toast.success("Category updated successfully!");
            } else {
                await CategoryService.Commands.storeCategory(payload);
                toast.success("Category created successfully!");
            }

            await getCategories();
            setOpen(false);
            reset();
            setCategoryHistory([]);
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
        if (!isOpen) {
            reset();
            setCategoryHistory([]);
            setShowCategoryPicker(false);
        }
    };

    const lastCategoryName = categoryHistory.length
  ? categoryHistory[categoryHistory.length - 1].c_name
  : null;

    // console.log("categoryHistory", lastCategoryName);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-3xl max-h-[95vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <FolderTree className="w-6 h-6 text-blue-600" />
                        {initialData ? "Edit Category" : "Add New Category / Multiple Sub Categories"}
                    </DialogTitle>
                </DialogHeader>

                <hr className="my-2" />

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Parent Category Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold flex items-center gap-2">
                            <Home size={16} className="text-gray-500" />
                            <p>Select Main Category &gt; Level 1 Sub Category &gt; Level 2 Sub Category Below ...... </p>
                        </Label>

                        {/* Selected Path Display */}
                        <div className="border-2 border-gray-300 rounded-lg p-3 bg-gradient-to-r from-gray-50 to-white min-h-[56px] flex items-center justify-between hover:border-blue-400 transition-colors">
                            <div className="flex items-center gap-2 flex-wrap flex-1">
                                {categoryHistory.length === 0 ? (
                                    <span className="text-gray-500 text-sm flex items-center gap-2">
                                        <Home size={16} className="text-blue-500" />
                                        <span className="font-medium">Main Category</span>
                                    </span>
                                ) : (
                                    <div className="flex items-center gap-1 text-sm flex-wrap">
                                        <Home size={14} className="text-gray-400" />
                                        {categoryHistory.map((cat, index) => (
                                            <React.Fragment key={cat.c_id}>
                                                <ChevronRight size={14} className="text-gray-400" />
                                                <span 
                                                    onClick={handleCategoryBack}
                                                    className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded"
                                                >
                                                    {cat.c_name}
                                                </span>
                                            </React.Fragment>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button
                                type="button"
                                variant={showCategoryPicker ? "default" : "outline"}
                                size="sm"
                                onClick={() => setShowCategoryPicker(!showCategoryPicker)}
                                className={`ml-2 ${showCategoryPicker ? 'bg-blue-600' : ''}`}
                            >
                                {showCategoryPicker ? "Close" : "Select Available Categories / Multiple Categories"}
                            </Button>
                        </div>

                        {/* Category Tree Picker */}
                        {showCategoryPicker && (
                            <div className="border-2 border-blue-200 rounded-lg p-4 bg-white shadow-xl animate-in slide-in-from-top-2">
                                {/* Navigation */}
                                <div className="flex items-center gap-2 mb-3 pb-3 border-b-2 border-gray-200">
                                    {categoryHistory.length > 0 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleCategoryBack}
                                            className="text-blue-600 hover:bg-blue-50"
                                        >
                                            <ArrowLeft size={16} className="mr-1" />
                                            Back
                                        </Button>
                                    )}

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleReset}
                                        className="text-gray-600 hover:bg-gray-100"
                                    >
                                        <Home size={16} className="mr-1" />
                                        Main Category
                                    </Button>

                                    <div className="ml-auto text-xs font-semibold text-gray-600 bg-blue-100 px-3 py-1.5 rounded-full">
                                        {categoryHistory.length > 0
                                            ? `Level ${categoryHistory.length}`
                                            : 'Main Category Level'}
                                    </div>
                                </div>

                                {/* Category List */}
                                {isCategoryLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                        <span className="mt-3 text-gray-600 font-medium">Loading categories...</span>
                                    </div>
                                ) : (
                                    <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
                                        {categoryItems.length > 0 ? (
                                            categoryItems.map((item) => (
                                                <button
                                                    key={item.c_id}
                                                    type="button"
                                                    onClick={() => handleCategoryClick(item)}
                                                    // onClick={item.c_is_child ? () => handleCategoryClick(item) : undefined}
                                                    className="w-full p-3 hover:bg-blue-50 rounded-lg flex justify-between items-center group transition-all border-2 border-transparent hover:border-blue-300 hover:shadow-md"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <FolderTree size={18} className="text-gray-400 group-hover:text-blue-600" />
                                                        <span className="font-medium text-gray-700 group-hover:text-blue-600">
                                                            {item.c_name}
                                                        </span>
                                                    </div>
                                                    {
                                                        item.c_is_child && (
                                                            <ChevronRight
                                                                size={18}
                                                                className="text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-transform"
                                                            />
                                                        )
                                                    }

                                                </button>
                                            ))
                                        ) : <p className="text-sm text-gray-500">
                                                No Sub Categories Available for "{lastCategoryName}" Category
                                            </p>
                                            // (
                                            //     <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                            //         <div className="text-5xl mb-3">✓</div>
                                            //         <p className="text-base text-gray-700 font-semibold mb-1">
                                            //             No Subcategories
                                            //         </p>
                                            //         <p className="text-sm text-gray-500">
                                            //             This is a leaf category
                                            //         </p>
                                            //     </div>
                                            // )
                                        }
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Category Name */}
                    <div className="space-y-2">
                        <Label htmlFor="c_name" className="text-sm font-bold">
                            Enter New Main Category / Multiple Category / Sub Category (All Level) Name Under Above Selected Category Level <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="c_name"
                            className="border-2 border-gray-300 focus:border-blue-500 h-11 text-base"
                            {...register("c_name")}
                            placeholder="Enter category name (e.g., Electronics, Mobile, Samsung)"
                        />
                        {errors.c_name && (
                            <p className="text-red-500 text-sm font-medium flex items-center gap-1">
                                <span>⚠</span> {errors.c_name.message}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="c_status" className="text-base font-semibold">
                            Status
                        </Label>
                        <select
                            id="c_status"
                            className="w-full outline-none py-2.5 px-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition h-11 text-base"
                            {...register("c_status")}
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                        {errors.c_status && (
                            <p className="text-red-500 text-sm font-medium">{errors.c_status.message}</p>
                        )}
                    </div>

                    {/* Preview Section */}
                    {(categoryHistory.length > 0 || categoryName) && (
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 shadow-sm">
                            <p className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <span className="text-lg">👁</span> Preview
                            </p>
                            <div className="flex items-center gap-2 text-sm flex-wrap bg-white p-3 rounded-md border border-blue-200">
                                <Home size={14} className="text-blue-500" />
                                {categoryHistory.map((cat) => (
                                    <React.Fragment key={cat.c_id}>
                                        <ChevronRight size={14} className="text-gray-400" />
                                        <span className="text-gray-600 font-medium">{cat.c_name}</span>
                                    </React.Fragment>
                                ))}
                                {categoryName && (
                                    <>
                                        <ChevronRight size={14} className="text-gray-400" />
                                        <span className="font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                            {categoryName}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isSubmitting}
                            className="px-6"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-blue-600 hover:bg-blue-700 px-8 font-semibold"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                </span>
                            ) : (
                                initialData ? "Update Category" : "Create Category"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryModal;