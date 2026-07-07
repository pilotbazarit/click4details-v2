"use client";
import React, { useEffect, useState } from "react";
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import PresetSuggestionModal from "@/components/modals/PresetSuggestionModal";
import PresetSuggestionService from "@/services/PresetSuggestionService";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";

const DEFAULT_PRESET_SUGGESTION_TYPE_OPTIONS = [{ value: "1", label: "1" }];

const PresetSuggestionsPage = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [presetSuggestions, setPresetSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { permissionList, user } = useAppContext();

  const canShowAddPresetSuggestionButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "PresetSuggestion", "ShowPresetSuggestionAddButton")

  const canShowEditPresetSuggestionButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "PresetSuggestion", "ShowPresetSuggestionEditButton")

  const canShowDeletePresetSuggestionButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "PresetSuggestion", "ShowPresetSuggestionDeleteButton")

  const presetSuggestionTypes = Array.from(
    new Set(
      [
        ...DEFAULT_PRESET_SUGGESTION_TYPE_OPTIONS.map((option) => option.value),
        ...presetSuggestions.map((item) => String(item?.ps_type || "").trim()).filter(Boolean),
        String(selectedSuggestion?.ps_type || "").trim(),
      ].filter(Boolean)
    )
  ).map((value) => ({ value, label: value }));

  const getPresetSuggestions = async (value = query, page = currentPage) => {
    try {
      setLoading(true);
      const response = await PresetSuggestionService.Queries.getPresetSuggestionList({
        _page: page,
        _perPage: itemsPerPage,
        _title: value,
        _suggestion: value,
      });

      if (response?.status === "success") {
        setTotalItems(response?.data?.total || 0);
        setPresetSuggestions(response?.data?.data || []);
        return;
      }

      setPresetSuggestions([]);
      toast.error(response?.message || response?.data?.message || "Failed to fetch preset suggestions");
    } catch (error) {
      setPresetSuggestions([]);
      toast.error(error?.response?.data?.message || error?.message || "Failed to fetch preset suggestions");
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = () => {
    setCurrentPage(1);
    getPresetSuggestions(query, 1);
  };

  const handleEdit = (item) => {
    setSelectedSuggestion(item);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    setSelectedSuggestion(null);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this preset suggestion!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await PresetSuggestionService.Commands.deletePresetSuggestion(id);
      await getPresetSuggestions();
      Swal.fire({
        title: "Deleted!",
        text: "Preset suggestion deleted successfully!",
        icon: "success",
      });
    } catch (error) {
      if (error?.errors) {
        Object.values(error.errors).forEach((entry) => toast.error(entry[0]));
        return;
      }

      toast.error(error?.message || "Something went wrong");
    }
  };

  useEffect(() => {
    getPresetSuggestions(query, currentPage);
  }, [currentPage, itemsPerPage]);

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-gray-50 px-6">
      <main className="my-6 w-full rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <h2 className="text-xl text-gray-800">All Preset Suggestions</h2>
          {
            canShowAddPresetSuggestionButton && (
              <Button
                onClick={() => {
                  setOpen(true);
                  setSelectedSuggestion(null);
                }}
                className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
              >
                <svg
                  className="h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Preset Suggestion
              </Button>
            )
          }

        </div>

        <TableFilter
          query={query}
          setQuery={setQuery}
          setCurrentPage={setCurrentPage}
          fetchSearchResults={fetchSearchResults}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          placeholder="Search by suggestion..."
        />

        <div className="mt-4 overflow-x-auto rounded-md border border-gray-300">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                <TableHead className="border-r border-gray-300">Suggestion</TableHead>
                <TableHead className="border-r border-gray-300">Type</TableHead>
                <TableHead className="border-r border-gray-300">Serial</TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
                <TableHead className="w-[10] text-right">
                  <div className="flex w-full items-center justify-end">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 stroke-current"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {presetSuggestions.length > 0 ? (
                presetSuggestions.map((item, index) => (
                  <TableRow
                    key={item?.ps_id || item?.id || index}
                    className="border-b border-gray-200"
                  >
                    <TableCell className="border-r border-gray-200 text-center">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      {item?.ps_suggestion}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      {item?.ps_type}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      {item?.ps_sl}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      {Number(item?.ps_status) === 1 ? (
                        <span className="font-medium text-green-600">Active</span>
                      ) : (
                        <span className="font-medium text-red-600">Inactive</span>
                      )}
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 border-r border-gray-200 font-medium">
                      {
                        canShowEditPresetSuggestionButton && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label={`Edit preset suggestion ${item?.ps_suggestion || ""}`}
                          >
                            <Pencil size={18} />
                          </button>
                        )
                      }

                      {
                        canShowDeletePresetSuggestionButton && (
                          <button
                            onClick={() => handleDelete(item?.ps_id || item?.id)}
                            className="text-red-600 hover:text-red-800"
                            aria-label={`Delete preset suggestion ${item?.ps_suggestion || ""}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        )
                      }

                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-4 text-center text-gray-500">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <div>No Preset Suggestion found.</div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>

      <Footer />

      <PresetSuggestionModal
        open={open}
        setOpen={handleModalClose}
        getPresetSuggestions={getPresetSuggestions}
        initialData={selectedSuggestion}
        presetSuggestionTypes={presetSuggestionTypes}
      />
    </div>
  );
};

export default PresetSuggestionsPage;
