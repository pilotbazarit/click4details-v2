import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import PresetSuggestionService from "@/services/PresetSuggestionService";
import MasterDataService from "@/services/MasterDataService";
import constData from "@/lib/constant";

const schema = yup.object().shape({
  ps_suggestion: yup.string().required("Suggestion is required"),
  ps_type: yup.string().required("Type is required"),
  ps_sl: yup.number().transform((value) => (Number.isNaN(value) ? undefined : value)).required("Serial is required"),
  ps_status: yup.string().required("Status is required"),
});

const PresetSuggestionModal = ({
  open,
  setOpen,
  getPresetSuggestions,
  initialData,
  presetSuggestionTypes = [],
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
  });
  const [suggestionTypeOptions, setSuggestionTypeOptions] = useState([]);

  useEffect(() => {
    if (!open) return;

    const getPresetSuggestionTypeData = async () => {
      try {
        const presetSuggestionTypeCode = constData.PRESET_SUGGESTION_TYPE_MD_CODE;

        if (!presetSuggestionTypeCode) {
          setSuggestionTypeOptions(presetSuggestionTypes);
          return;
        }

        const response = await MasterDataService.Queries.getMasterDataByTypeCode(
          presetSuggestionTypeCode
        );

        console.log("response", response);
        
        const typeMasterData = Array.isArray(response?.data?.master_data)
          ? response.data.master_data
          : [];
        const nextTypeOptions = typeMasterData.map((type) => ({
          value: String(type.md_id),
          label: type.md_title,
        }));

        setSuggestionTypeOptions(nextTypeOptions);

        const initialTypeId = initialData?.ps_type ? String(initialData.ps_type) : "";

        if (
          initialTypeId &&
          nextTypeOptions.some((typeOption) => typeOption.value === initialTypeId)
        ) {
          setValue("ps_type", initialTypeId, {
            shouldDirty: false,
            shouldValidate: false,
          });
        } else if (!initialData?.ps_id && nextTypeOptions.length > 0 && !getValues("ps_type")) {
          setValue("ps_type", nextTypeOptions[0].value, {
            shouldDirty: false,
            shouldValidate: false,
          });
        }
      } catch (error) {
        setSuggestionTypeOptions(presetSuggestionTypes);
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to load suggestion types"
        );
      }
    };

    getPresetSuggestionTypeData();
  }, [open, initialData, getValues, setValue, presetSuggestionTypes]);

  useEffect(() => {
    if (initialData) {
      setValue("ps_suggestion", initialData.ps_suggestion || "");
      setValue("ps_type", initialData.ps_type ?? "");
      setValue("ps_sl", initialData.ps_sl ?? "");
      setValue("ps_status", String(initialData.ps_status ?? ""));
      return;
    }

    reset({
      ps_suggestion: "",
      ps_type: "",
      ps_sl: "",
      ps_status: "1",
    });
  }, [initialData, reset, setValue]);

  const onSubmit = async (data) => {
    try {
      if (initialData?.ps_id || initialData?.id) {
        await PresetSuggestionService.Commands.updatePresetSuggestion(
          initialData.ps_id || initialData.id,
          {
            ...data,
            _method: "PUT",
          }
        );
        toast.success("Preset suggestion updated successfully!");
      } else {
        await PresetSuggestionService.Commands.storePresetSuggestion(data);
        toast.success("Preset suggestion added successfully!");
      }

      if (getPresetSuggestions) {
        await getPresetSuggestions();
      }
      setOpen(false);
    } catch (error) {
      if (error?.errors) {
        Object.values(error.errors).forEach((entry) => toast.error(entry[0]));
        return;
      }

      toast.error(error?.message || "Something went wrong");
    }
  };

  const handleOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setSuggestionTypeOptions([]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Preset Suggestion" : "Add Preset Suggestion"}
          </DialogTitle>
        </DialogHeader>

        <hr />

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="ps_suggestion">Suggestion</Label>
              <Input
                className="border-gray-400"
                {...register("ps_suggestion")}
                id="ps_suggestion"
                placeholder="Enter suggestion"
                disabled={isSubmitting}
              />
              {errors.ps_suggestion && (
                <p className="text-sm text-red-600">{errors.ps_suggestion.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1 w-full">
              <Label htmlFor="ps_type">Type</Label>
              <Controller
                name="ps_type"
                control={control}
                render={({ field }) => (
                  <select
                    id="ps_type"
                    className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                    value={field.value || ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    disabled={isSubmitting}
                  >
                    <option value="">Select Type</option>
                    {suggestionTypeOptions.map((typeOption) => (
                      <option key={typeOption.value} value={typeOption.value}>
                        {typeOption.label}
                      </option>
                    ))}
                  </select>
                )}
              />
              {errors.ps_type && (
                <p className="text-sm text-red-600">{errors.ps_type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="ps_sl">Serial</Label>
              <Input
                className="border-gray-400"
                {...register("ps_sl")}
                id="ps_sl"
                placeholder="Enter serial"
                type="number"
                disabled={isSubmitting}
              />
              {errors.ps_sl && (
                <p className="text-sm text-red-600">{errors.ps_sl.message}</p>
              )}
            </div>

            <div className="flex flex-col gap-1 w-full">
              <label className="text-base font-medium" htmlFor="ps_status">
                Status
              </label>
              <select
                id="ps_status"
                className="outline-none py-2 px-3 rounded border border-gray-400 w-full"
                {...register("ps_status")}
                disabled={isSubmitting}
              >
                <option value="">Select Status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
              {errors.ps_status && (
                <p className="text-sm text-red-600">{errors.ps_status.message}</p>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="submit"
              className="rounded bg-blue-600 px-6 py-2.5 font-medium text-white disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : initialData ? "UPDATE" : "ADD"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PresetSuggestionModal;
