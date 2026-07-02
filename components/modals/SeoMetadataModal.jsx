import React, { useCallback, useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { yupResolver } from "@hookform/resolvers/yup";
import { Loader2, Plus, Trash2 } from "lucide-react";
import AsyncSelect from "react-select/async";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as yup from "yup";
import CategoryService from "@/services/CategoryService";
import GeneralProductService from "@/services/GeneralProductService";
import PackageService from "@/services/PackageService";
import SeoMetadataService from "@/services/SeoMetadataService";
import VehicleModelService from "@/services/VehicleModelService";
import VehicleService from "@/services/VehicleService";

const ENTITY_TYPE_OPTIONS = [
    "vehicle",
    "product",
    "vehicle_model",
    "package",
    "category",
];

const schema = yup.object().shape({
    sm_entity_type: yup.string().required("Entity type is required"),
    sm_entity_id: yup.string().required("Entity ID is required"),
    sm_meta_title: yup.string().required("Meta title is required"),
    sm_meta_description: yup.string().required("Meta description is required"),
    sm_meta_keywords: yup.array().of(
        yup.object().shape({
            value: yup.string().nullable(),
        })
    ),
    sm_tags: yup.array().of(
        yup.object().shape({
            value: yup.string().nullable(),
        })
    ),
});

const toList = (value) => {
    if (Array.isArray(value)) {
        return value
            .map((item) => (typeof item === "string" ? item : item?.value))
            .map((item) => String(item || "").trim())
            .filter(Boolean);
    }

    return String(value || "")
        .split(/[\n,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
};

const getResponseItems = (response) => {
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;

    return [];
};

const getNestedValue = (item, key) => {
    if (!item || !key) return undefined;

    return key.split(".").reduce((value, part) => {
        if (value === null || value === undefined) return undefined;
        return value[part];
    }, item);
};

const getValue = (item, keys) => {
    for (const key of keys) {
        const value = getNestedValue(item, key);

        if (value !== undefined && value !== null && value !== "") {
            return value;
        }
    }

    return "";
};

const getMetadataValue = (item, field) => {
    const fieldMap = {
        entityType: ["sm_entity_type", "entity_type", "entityType", "seo.entity_type", "metadata.entity_type"],
        entityId: ["sm_entity_id", "entity_id", "entityId", "seo.entity_id", "metadata.entity_id"],
        metaTitle: ["sm_meta_title", "meta_title", "metaTitle", "seo_title", "title", "seo.meta_title", "metadata.meta_title"],
        metaDescription: ["sm_meta_description", "meta_description", "metaDescription", "seo_description", "description", "seo.meta_description", "metadata.meta_description"],
        metaKeywords: ["sm_meta_keywords", "meta_keywords", "metaKeywords", "keywords", "seo.meta_keywords", "metadata.meta_keywords"],
        tags: ["sm_tags", "tags", "seo.tags", "metadata.tags"],
    };

    return getValue(item, fieldMap[field] || []);
};

const toFieldArray = (value) => {
    const items = toList(value);
    return items.length ? items.map((item) => ({ value: item })) : [{ value: "" }];
};

const getStoredUser = () => {
    try {
        if (typeof window === "undefined") return null;

        const userData = localStorage.getItem("user");
        if (!userData) return null;

        const parsedUser = JSON.parse(userData);
        return typeof parsedUser === "string" ? JSON.parse(parsedUser) : parsedUser;
    } catch {
        return null;
    }
};

const getEntityOptionConfig = (entityType) => {
    switch (entityType) {
        case "vehicle":
            return {
                fetch: (searchValue) => {
                    const user = getStoredUser();
                    const params = {
                        _page: 1,
                        _perPage: 20,
                        _order: "desc",
                        _orderBy: "v_id",
                        _status: "active",
                    };

                    if (searchValue) {
                        params._title = searchValue;
                    }

                    if (user?.user_mode === "user" || user?.user_mode === "partner") {
                        params._user_id = user?.id;
                    }

                    return VehicleService.Queries.getVehiclesWithLogin(params);
                },
                mapItem: (item) => ({
                    value: String(item?.v_id || ""),
                    label: item?.v_title || item?.v_name || item?.v_code || `Vehicle #${item?.v_id}`,
                }),
            };
        case "vehicle_model":
            return {
                fetch: (searchValue) =>
                    VehicleModelService.Queries.getModels({
                        _page: 1,
                        _perPage: 20,
                        _name: searchValue,
                    }),
                mapItem: (item) => ({
                    value: String(item?.vm_id || ""),
                    label: item?.vm_name || `Model #${item?.vm_id}`,
                }),
            };
        case "product":
            return {
                fetch: (searchValue) =>
                    GeneralProductService.Queries.getGeneralProducts({
                        _page: 1,
                        _perPage: 20,
                        _order: "desc",
                        _orderBy: "p_id",
                        _status: "active",
                        _name: searchValue,
                    }),
                mapItem: (item) => ({
                    value: String(item?.p_id || ""),
                    label: item?.p_name || item?.p_title || `Product #${item?.p_id}`,
                }),
            };
        case "package":
            return {
                fetch: (searchValue) =>
                    PackageService.Queries.getPackages({
                        _page: 1,
                        _perPage: 20,
                        _name: searchValue,
                    }),
                mapItem: (item) => ({
                    value: String(item?.p_id || ""),
                    label: item?.p_name || `Package #${item?.p_id}`,
                }),
            };
        case "category":
            return {
                fetch: (searchValue) =>
                    CategoryService.Queries.getCategories({
                        _page: 1,
                        _perPage: 20,
                        _name: searchValue,
                    }),
                mapItem: (item) => ({
                    value: String(item?.c_id || ""),
                    label: item?.c_name || `Category #${item?.c_id}`,
                }),
            };
        default:
            return null;
    }
};

const buildSeoMetadataFormData = (data) => {
    const formData = new FormData();

    formData.append("sm_entity_type", data.sm_entity_type);
    formData.append("sm_entity_id", data.sm_entity_id);
    formData.append("sm_meta_title", data.sm_meta_title);
    formData.append("sm_meta_description", data.sm_meta_description);

    toList(data.sm_meta_keywords).forEach((keyword, index) => {
        formData.append(`sm_meta_keywords[${index}]`, keyword);
    });

    toList(data.sm_tags).forEach((tag, index) => {
        formData.append(`sm_tags[${index}]`, tag);
    });

    return formData;
};

const buildSeoMetadataJsonPayload = (data) => ({
    sm_entity_type: data.sm_entity_type,
    sm_entity_id: /^\d+$/.test(String(data.sm_entity_id)) ? Number(data.sm_entity_id) : data.sm_entity_id,
    sm_meta_title: data.sm_meta_title,
    sm_meta_description: data.sm_meta_description,
    sm_meta_keywords: toList(data.sm_meta_keywords),
    sm_tags: toList(data.sm_tags),
});

const SeoMetadataModal = ({ open, setOpen, onSaved, initialEntityType = "", initialEntityId = "", initialData = null }) => {
    const isEditMode = Boolean(initialData);
    const [selectedEntityOption, setSelectedEntityOption] = useState(null);
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        control,
        setValue,
        watch,
    } = useForm({
        resolver: yupResolver(schema),
        defaultValues: {
            sm_entity_type: initialEntityType,
            sm_entity_id: initialEntityId,
            sm_meta_title: "",
            sm_meta_description: "",
            sm_meta_keywords: [{ value: "" }],
            sm_tags: [{ value: "" }],
        },
    });
    const selectedEntityType = watch("sm_entity_type");

    const {
        fields: keywordFields,
        append: appendKeyword,
        remove: removeKeyword,
    } = useFieldArray({
        control,
        name: "sm_meta_keywords",
    });

    const {
        fields: tagFields,
        append: appendTag,
        remove: removeTag,
    } = useFieldArray({
        control,
        name: "sm_tags",
    });

    useEffect(() => {
        if (open) {
            const resolvedEntityType = getMetadataValue(initialData, "entityType") || initialEntityType || "";
            const resolvedEntityId = getMetadataValue(initialData, "entityId") || initialEntityId || "";

            reset({
                sm_entity_type: resolvedEntityType,
                sm_entity_id: resolvedEntityId,
                sm_meta_title: getMetadataValue(initialData, "metaTitle") || "",
                sm_meta_description: getMetadataValue(initialData, "metaDescription") || "",
                sm_meta_keywords: toFieldArray(getMetadataValue(initialData, "metaKeywords")),
                sm_tags: toFieldArray(getMetadataValue(initialData, "tags")),
            });
            setSelectedEntityOption(
                resolvedEntityId
                    ? { value: String(resolvedEntityId), label: String(resolvedEntityId) }
                    : null
            );
        }
    }, [initialData, initialEntityId, initialEntityType, open, reset]);

    const handleOpenChange = (isOpen) => {
        setOpen(isOpen);
        if (!isOpen) {
            reset();
        }
    };

    const loadEntityOptions = useCallback(async (inputValue) => {
        const config = getEntityOptionConfig(selectedEntityType);

        if (!config) {
            return [];
        }

        try {
            const response = await config.fetch(String(inputValue || "").trim());
            return getResponseItems(response)
                .map(config.mapItem)
                .filter((option) => option.value && option.label);
        } catch (error) {
            if (!error?.silent) {
                toast.error(error?.message || "Failed to load entity options");
            }

            return [];
        }
    }, [selectedEntityType]);

    const onSubmit = async (data) => {
        try {
            let savedEntityType = data.sm_entity_type;
            let savedEntityId = data.sm_entity_id;

            if (isEditMode) {
                const originalEntityType = getMetadataValue(initialData, "entityType") || data.sm_entity_type;
                const originalEntityId = getMetadataValue(initialData, "entityId") || data.sm_entity_id;

                await SeoMetadataService.Commands.updateSeoMetadata(
                    originalEntityType,
                    originalEntityId,
                    buildSeoMetadataJsonPayload(data)
                );
                toast.success("SEO metadata updated successfully!");
            } else {
                await SeoMetadataService.Commands.storeSeoMetadata(buildSeoMetadataFormData(data));
                toast.success("SEO metadata added successfully!");
            }

            setOpen(false);
            reset();

            if (onSaved) {
                await onSaved({
                    entityType: savedEntityType,
                    entityId: savedEntityId,
                });
            }
        } catch (error) {
            if (error?.errors) {
                Object.values(error.errors).forEach((e) => toast.error(e[0]));
            } else {
                toast.error(error?.message || "Something went wrong");
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Update SEO Metadata" : "Add SEO Metadata"}</DialogTitle>
                </DialogHeader>

                <hr />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="sm_entity_type">Entity Type</Label>
                                <select
                                    id="sm_entity_type"
                                    className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                                    disabled={isSubmitting}
                                    {...register("sm_entity_type", {
                                        onChange: () => {
                                            setValue("sm_entity_id", "");
                                            setSelectedEntityOption(null);
                                        },
                                    })}
                                >
                                    <option value="">Select Entity Type</option>
                                    {ENTITY_TYPE_OPTIONS.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                {errors.sm_entity_type && (
                                    <p className="text-red-600 text-sm">{errors.sm_entity_type.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <Label htmlFor="sm_entity_id">Entity ID</Label>
                                <Controller
                                    control={control}
                                    name="sm_entity_id"
                                    render={({ field }) => (
                                        <AsyncSelect
                                            key={selectedEntityType || "empty-entity-type"}
                                            inputId="sm_entity_id"
                                            cacheOptions
                                            defaultOptions
                                            isClearable
                                            isSearchable
                                            loadOptions={loadEntityOptions}
                                            value={
                                                selectedEntityOption ||
                                                (field.value
                                                    ? { value: String(field.value), label: String(field.value) }
                                                    : null)
                                            }
                                            onBlur={field.onBlur}
                                            onChange={(option) => {
                                                field.onChange(option?.value || "");
                                                setSelectedEntityOption(option || null);
                                            }}
                                            placeholder={
                                                selectedEntityType
                                                    ? "Search and select entity"
                                                    : "Select entity type first"
                                            }
                                            noOptionsMessage={({ inputValue }) =>
                                                selectedEntityType
                                                    ? inputValue
                                                        ? "No matching entity found"
                                                        : "No entity found"
                                                    : "Select entity type first"
                                            }
                                            loadingMessage={() => "Loading entities..."}
                                            classNamePrefix="react-select"
                                            className="react-select-container"
                                            isDisabled={isSubmitting || !selectedEntityType}
                                        />
                                    )}
                                />
                                {errors.sm_entity_id && (
                                    <p className="text-red-600 text-sm">{errors.sm_entity_id.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="sm_meta_title">Meta Title</Label>
                            <Input
                                id="sm_meta_title"
                                className="border-gray-400"
                                placeholder="Toyota Premio for Sale"
                                disabled={isSubmitting}
                                {...register("sm_meta_title")}
                            />
                            {errors.sm_meta_title && (
                                <p className="text-red-600 text-sm">{errors.sm_meta_title.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1 w-full">
                            <Label htmlFor="sm_meta_description">Meta Description</Label>
                            <Textarea
                                id="sm_meta_description"
                                className="border-gray-400"
                                placeholder="Buy Toyota Premio from Click4Details."
                                disabled={isSubmitting}
                                {...register("sm_meta_description")}
                            />
                            {errors.sm_meta_description && (
                                <p className="text-red-600 text-sm">{errors.sm_meta_description.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2 w-full">
                                <Label htmlFor="sm_meta_keywords">Meta Keywords</Label>
                                {keywordFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <Input
                                            id={index === 0 ? "sm_meta_keywords" : undefined}
                                            className="border-gray-400"
                                            placeholder="toyota"
                                            disabled={isSubmitting}
                                            {...register(`sm_meta_keywords.${index}.value`)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeKeyword(index)}
                                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-gray-300 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={isSubmitting}
                                            aria-label="Remove keyword"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => appendKeyword({ value: "" })}
                                    className="inline-flex w-fit items-center gap-2 rounded border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    <Plus size={16} />
                                    Add Keyword
                                </button>
                                {errors.sm_meta_keywords && (
                                    <p className="text-red-600 text-sm">{errors.sm_meta_keywords.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-2 w-full">
                                <Label htmlFor="sm_tags">Tags</Label>
                                {tagFields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <Input
                                            id={index === 0 ? "sm_tags" : undefined}
                                            className="border-gray-400"
                                            placeholder="sedan"
                                            disabled={isSubmitting}
                                            {...register(`sm_tags.${index}.value`)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeTag(index)}
                                            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded border border-gray-300 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={isSubmitting}
                                            aria-label="Remove tag"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => appendTag({ value: "" })}
                                    className="inline-flex w-fit items-center gap-2 rounded border border-blue-600 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                                    disabled={isSubmitting}
                                >
                                    <Plus size={16} />
                                    Add Tag
                                </button>
                                {errors.sm_tags && (
                                    <p className="text-red-600 text-sm">{errors.sm_tags.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <Button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded font-medium"
                            disabled={isSubmitting}
                        >
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isSubmitting ? "Processing..." : isEditMode ? "UPDATE" : "ADD"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default SeoMetadataModal;
