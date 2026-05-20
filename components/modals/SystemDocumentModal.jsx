"use client";

import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SystemDocumentService from "@/services/SystemDocumentService";
import MasterDataService from "@/services/MasterDataService";
import constData from "@/lib/constant";

const schema = yup.object().shape({
  sd_name: yup.string().trim().required("Document name is required"),
  sd_date: yup.string().required("Document date is required"),
  sd_type_id: yup
    .string()
    .trim()
    .required("Type id is required")
    .matches(/^\d+$/, "Type id must be numeric"),
  sd_desc: yup.string().nullable(),
  sd_status: yup.string().required("Status is required"),
});

const defaultValues = {
  sd_name: "",
  sd_date: "",
  sd_type_id: "",
  sd_desc: "",
  sd_status: "1",
};

const normalizeDate = (value) => {
  if (!value) return "";
  return String(value).split(" ")[0];
};

const formatFileSize = (size = 0) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const SystemDocumentModal = ({
  open,
  setOpen,
  getSystemDocuments,
  initialData,
}) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    getValues,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingDocs, setExistingDocs] = useState([]);
  const [documentTypeOptions, setDocumentTypeOptions] = useState([]);

  useEffect(() => {
    if (!open) return;

    const getSystemDocumentTypeData = async () => {
      try {
        const systemDocCode = constData.SYSTEM_DOCUMENTS_MD_CODE;
        const response = await MasterDataService.Queries.getMasterDataByTypeCode(systemDocCode);
        const typeMasterData = Array.isArray(response?.data?.master_data) ? response.data.master_data : [];
        const nextTypeOptions = typeMasterData.map((type) => ({
          value: String(type.md_id),
          label: type.md_title,
        }));

        setDocumentTypeOptions(nextTypeOptions);

        const initialTypeId = initialData?.sd_type_id ? String(initialData.sd_type_id) : "";

        if (
          initialTypeId &&
          nextTypeOptions.some((typeOption) => typeOption.value === initialTypeId)
        ) {
          setValue("sd_type_id", initialTypeId, {
            shouldDirty: false,
            shouldValidate: false,
          });
        } else if (!initialData?.sd_id && nextTypeOptions.length > 0 && !getValues("sd_type_id")) {
          setValue("sd_type_id", nextTypeOptions[0].value, {
            shouldDirty: false,
            shouldValidate: false,
          });
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message || "Failed to load document types");
      }
    };

    getSystemDocumentTypeData();
  }, [open, initialData, getValues, setValue]);

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      reset({
        sd_name: initialData.sd_name || "",
        sd_date: normalizeDate(initialData.sd_date),
        sd_type_id: initialData.sd_type_id ? String(initialData.sd_type_id) : "",
        sd_desc: initialData.sd_desc || "",
        sd_status:
          initialData.sd_status === 0 || initialData.sd_status === "0" ? "0" : "1",
      });
      setExistingDocs(Array.isArray(initialData.sd_docs) ? initialData.sd_docs : []);
    } else {
      reset(defaultValues);
      setExistingDocs([]);
    }

    setSelectedFiles([]);
  }, [initialData, open, reset]);

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);

    if (!isOpen) {
      reset(defaultValues);
      setSelectedFiles([]);
      setExistingDocs([]);
    }
  };

  const handleFileChange = (event) => {
    const nextFiles = Array.from(event.target.files || []);

    if (!nextFiles.length) return;

    setSelectedFiles((prevFiles) => [...prevFiles, ...nextFiles]);
    event.target.value = "";
  };

  const handleRemoveFile = (fileIndex) => {
    setSelectedFiles((prevFiles) =>
      prevFiles.filter((_, index) => index !== fileIndex)
    );
  };

  const buildFormData = (data) => {
    const formData = new FormData();

    formData.append("sd_name", data.sd_name.trim());
    formData.append("sd_date", data.sd_date);
    formData.append("sd_type_id", data.sd_type_id);
    formData.append("sd_desc", data.sd_desc || "");
    formData.append("sd_status", data.sd_status);

    selectedFiles.forEach((file, index) => {
      formData.append(`sd_docs[${index}]`, file);
    });

    return formData;
  };

  const onSubmit = async (data) => {
    try {
      const formData = buildFormData(data);
      let response;

      if (initialData?.sd_id) {
        formData.append("_method", "PUT");
        response = await SystemDocumentService.Commands.updateSystemDocument(
          initialData.sd_id,
          formData
        );
      } else {
        response = await SystemDocumentService.Commands.storeSystemDocument(formData);
      }

      if (response?.status === "success") {
        toast.success(
          response?.message ||
            (initialData ? "System document updated successfully!" : "System document added successfully!")
        );
        await getSystemDocuments();
        handleOpenChange(false);
        return;
      }

      toast.error(response?.message || "Failed to save system document");
    } catch (error) {
      if (error?.errors) {
        Object.values(error.errors).forEach((entry) => toast.error(entry[0]));
      } else {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Something went wrong"
        );
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:max-w-2xl max-h-[92vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Update System Document" : "Add System Document"}
          </DialogTitle>
        </DialogHeader>

        <hr />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <Label htmlFor="sd_name">Document Name</Label>
              <Input
                id="sd_name"
                className="border-gray-400"
                placeholder="Enter document name"
                {...register("sd_name")}
              />
              {errors.sd_name && (
                <p className="text-sm text-red-500">{errors.sd_name.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="sd_date">Document Date</Label>
              <Input
                id="sd_date"
                type="date"
                className="border-gray-400"
                {...register("sd_date")}
              />
              {errors.sd_date && (
                <p className="text-sm text-red-500">{errors.sd_date.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="sd_type_id">Type</Label>
              <Controller
                name="sd_type_id"
                control={control}
                render={({ field }) => (
                  <select
                    id="sd_type_id"
                    className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  >
                    <option value="">Select document type</option>
                    {documentTypeOptions.map((typeOption) => (
                      <option key={typeOption.value} value={typeOption.value}>
                        {typeOption.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.sd_type_id && (
                <p className="text-sm text-red-500">{errors.sd_type_id.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="sd_status">Status</Label>
              <select
                id="sd_status"
                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                {...register("sd_status")}
              >
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
              {errors.sd_status && (
                <p className="text-sm text-red-500">{errors.sd_status.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <Label htmlFor="sd_desc">Description</Label>
            <Textarea
              id="sd_desc"
              className="border-gray-400 min-h-28"
              placeholder="Enter document description"
              {...register("sd_desc")}
            />
            {errors.sd_desc && (
              <p className="text-sm text-red-500">{errors.sd_desc.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="sd_docs">Documents</Label>
            <Input
              id="sd_docs"
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              multiple
              className="border-gray-400"
              onChange={handleFileChange}
            />
            <p className="text-xs text-gray-500">
              You can upload multiple files. Accepted: images, PDF, DOC, DOCX.
            </p>
          </div>

          {selectedFiles.length > 0 && (
            <div className="rounded-md border border-gray-200 p-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">Selected files</p>
              {selectedFiles.map((file, index) => (
                <div
                  key={`${file.name}-${index}`}
                  className="flex items-center justify-between gap-3 rounded-md bg-gray-50 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="text-sm font-medium text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {existingDocs.length > 0 && (
            <div className="rounded-md border border-gray-200 p-3 space-y-2">
              <p className="text-sm font-medium text-gray-700">Existing documents</p>
              {existingDocs.map((doc, index) => {
                const fileUrl = doc?.secure_url || doc?.url;

                if (!fileUrl) {
                  return (
                    <div
                      key={`doc-${index}`}
                      className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600"
                    >
                      {`Document ${index + 1}`}
                    </div>
                  );
                }

                return (
                  <a
                    key={`${fileUrl}-${index}`}
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-md bg-gray-50 px-3 py-2 text-sm text-blue-600 hover:underline"
                  >
                    {`Document ${index + 1}`}
                  </a>
                );
              })}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Processing..."
                : initialData
                  ? "Update"
                  : "Add"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SystemDocumentModal;
