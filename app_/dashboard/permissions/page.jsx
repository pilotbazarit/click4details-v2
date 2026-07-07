"use client";
import React, { useEffect, useRef, useState } from "react";
import Footer from "@/components/dashboard/Footer";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import { Eye, Info, Loader2, Pencil, Search, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import AddPermissionModal from "@/components/modals/AddPermissionModal";
import PermissionService from "@/services/PermissionService";
import { PERMISSION_MODEL_OPTIONS } from "@/lib/permissionModelOptions";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";

const PERMISSION_TYPE_OPTIONS = [
  { label: "System", value: "system" },
  { label: "General", value: "general" },
  { label: "Custom", value: "custom" },
  { label: "Reserved", value: "reserved" },
];

const Permission = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [modelQuery, setModelQuery] = useState("");
  const [appliedModelQuery, setAppliedModelQuery] = useState("");
  const [showModelSearch, setShowModelSearch] = useState(false);
  const [typeQuery, setTypeQuery] = useState("");
  const [appliedTypeQuery, setAppliedTypeQuery] = useState("");
  const [showTypeSearch, setShowTypeSearch] = useState(false);
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedModel, setSelectedModel] = useState(null);
  const modelButtonRef = useRef(null);
  const modelTooltipRef = useRef(null);
  const typeButtonRef = useRef(null);
  const typeTooltipRef = useRef(null);

  const { permissionList, user } = useAppContext();

  const canShowAddPermissionButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Permission", "ShowPermissionAddButton")

  const canShowEditPermissionButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Permission", "ShowPermissionEditButton")


  const canShowCheckPermissionButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Permission", "ShowPermissionCheckButton")

  const canShowDeletePermissionButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Permission", "ShowPermissionDeleteButton")




  const getPermissions = async (
    value = searchQuery,
    page = currentPage,
    perPage = itemsPerPage,
    modelValue = appliedModelQuery,
    typeValue = appliedTypeQuery
  ) => {
    try {
      setLoading(true);
      const params = {
        _page: page,
        _perPage: perPage,
        _name: value,
      };

      if (modelValue) {
        params._model = modelValue;
      }

      if (typeValue) {
        params._type = typeValue;
      }

      const response = await PermissionService.Queries.getPermissions(params);

      if (response?.status == "success") {
        setTotalItems(response?.data?.total)
        setPermissions(response?.data?.data)
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(response?.data?.message || "Failed to fetch models");
      }

    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to fetch data types"
      );
    }
  }

  const fetchSearchResults = () => {
    setCurrentPage(1);
    setSearchQuery(query.trim());
  };

  const handleShow = (item) => {
    setSelectedModel(item);
    setOpen(true);
  }

  const handleViewDescription = (item) => {
    Swal.fire({
      title: item?.p_name || "Permission Description",
      text: item?.p_description || "No description available.",
      icon: "info",
      confirmButtonText: "Close",
    });
  }

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });

    if (result.isConfirmed) {
      try {
        const response = await PermissionService.Commands.deletePermission(id);
        if (response.status === "success") {
          Swal.fire({
            title: "Deleted!",
            text: "Permission deleted successfully!",
            icon: "success"
          });

          setPermissions(permissions.filter((permission) => permission.p_id !== id));
          setTotalItems(totalItems - 1);
        }

      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error.message || "Something went wrong");
        }
      }
    }
  };

  // Reset selected model when modal closes
  const handleModalClose = () => {
    setOpen(false);
    setSelectedModel(null);
  }

  useEffect(() => {
    getPermissions(
      searchQuery,
      currentPage,
      itemsPerPage,
      appliedModelQuery,
      appliedTypeQuery
    );
  }, [searchQuery, appliedModelQuery, appliedTypeQuery, currentPage, itemsPerPage]);

  useEffect(() => {
    if (query.trim() === "" && searchQuery !== "") {
      setCurrentPage(1);
      setSearchQuery("");
    }
  }, [query, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideModelButton =
        modelButtonRef.current && modelButtonRef.current.contains(event.target);
      const isClickInsideModelTooltip =
        modelTooltipRef.current && modelTooltipRef.current.contains(event.target);
      const isClickInsideTypeButton =
        typeButtonRef.current && typeButtonRef.current.contains(event.target);
      const isClickInsideTypeTooltip =
        typeTooltipRef.current && typeTooltipRef.current.contains(event.target);

      if (!isClickInsideModelButton && !isClickInsideModelTooltip) {
        setShowModelSearch(false);
      }

      if (!isClickInsideTypeButton && !isClickInsideTypeTooltip) {
        setShowTypeSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClearSearch = () => {
    setCurrentPage(1);
    setSearchQuery("");
  };

  const startIndex = (currentPage - 1) * itemsPerPage;


  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">Permission List</h2>
          {
            canShowAddPermissionButton && (
              <Button
                onClick={() => {
                  setOpen(true);
                  // setSelectedModel(null);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Add Permission
              </Button>
            )
          }
        </div>

        {/* Search Filter */}
        <TableFilter query={query} setQuery={setQuery} setCurrentPage={setCurrentPage} fetchSearchResults={fetchSearchResults} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} placeholder="Search by name..." onClearSearch={handleClearSearch} />

        {/* Table Container */}
        <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                <TableHead className="border-r border-gray-300">Name</TableHead>
                <TableHead className="border-r border-gray-300 relative">
                  <div className="flex items-center justify-between relative">
                    <span>Model</span>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowModelSearch(!showModelSearch);
                          setShowTypeSearch(false);
                        }}
                        className="ml-2 focus:outline-none"
                        ref={modelButtonRef}
                      >
                        <Search
                          className={`w-4 h-4 ${appliedModelQuery ? "text-orange-500" : ""
                            }`}
                        />
                      </button>
                      {showModelSearch && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                      )}
                    </div>
                  </div>
                  {showModelSearch && (
                    <div className="relative" ref={modelTooltipRef}>
                      <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-52 flex flex-col items-end">
                        <div className="flex items-center w-full mb-2">
                          <select
                            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={modelQuery}
                            onChange={(e) => setModelQuery(e.target.value)}
                          >
                            <option value="">All Models</option>
                            {PERMISSION_MODEL_OPTIONS.map((item) => (
                              <option key={item} value={item}>
                                {item}
                              </option>
                            ))}
                          </select>
                          {(modelQuery || appliedModelQuery) && (
                            <button
                              onClick={() => {
                                setModelQuery("");
                                setAppliedModelQuery("");
                                setCurrentPage(1);
                                setShowModelSearch(false);
                              }}
                              className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setCurrentPage(1);
                            setAppliedModelQuery(modelQuery);
                            setShowModelSearch(false);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </TableHead>
                <TableHead className="border-r border-gray-300 relative">
                  <div className="flex items-center justify-between relative">
                    <span>Type</span>
                    <div className="relative">
                      <button
                        onClick={() => {
                          setShowTypeSearch(!showTypeSearch);
                          setShowModelSearch(false);
                        }}
                        className="ml-2 focus:outline-none"
                        ref={typeButtonRef}
                      >
                        <Search
                          className={`w-4 h-4 ${appliedTypeQuery ? "text-orange-500" : ""
                            }`}
                        />
                      </button>
                      {showTypeSearch && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                      )}
                    </div>
                  </div>
                  {showTypeSearch && (
                    <div className="relative" ref={typeTooltipRef}>
                      <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-52 flex flex-col items-end">
                        <div className="flex items-center w-full mb-2">
                          <select
                            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={typeQuery}
                            onChange={(e) => setTypeQuery(e.target.value)}
                          >
                            <option value="">All Types</option>
                            {PERMISSION_TYPE_OPTIONS.map((item) => (
                              <option key={item.value} value={item.value}>
                                {item.label}
                              </option>
                            ))}
                          </select>
                          {(typeQuery || appliedTypeQuery) && (
                            <button
                              onClick={() => {
                                setTypeQuery("");
                                setAppliedTypeQuery("");
                                setCurrentPage(1);
                                setShowTypeSearch(false);
                              }}
                              className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            setCurrentPage(1);
                            setAppliedTypeQuery(typeQuery);
                            setShowTypeSearch(false);
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
                <TableHead className="border-r border-gray-300">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && permissions?.length > 0 ? (
                permissions.map((item, index) => (
                  <TableRow key={item.id || index} className="border-b border-gray-200">
                    <TableCell className="border-r border-gray-200 font-medium">{startIndex + index + 1}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item?.p_name}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item?.p_model}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item?.p_type}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      <div className="flex items-center gap-2">
                        {item?.p_status === "active" ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}

                      </div>
                    </TableCell>

                    <TableCell className="flex  gap-2 border-r border-gray-200 font-medium">
                      {
                        canShowEditPermissionButton && (
                          <button
                            onClick={() => handleShow(item)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="View Shop"
                          >
                            <Pencil size={18} />
                          </button>
                        )
                      }

                      {
                        canShowCheckPermissionButton && (
                          <button
                            onClick={() => handleViewDescription(item)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label="View Description"
                          >
                            <Info size={18} />
                          </button>
                        )
                      }

                      {
                        canShowDeletePermissionButton && (
                          <button
                            onClick={() => handleDelete(item?.p_id)}
                            className="text-red-600 hover:text-red-800"
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
                  <TableCell colSpan={8} className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[600px] text-center py-4 text-gray-500">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                        <span className="text-gray-500 font-semibold ">Loading...</span>
                      </div>
                    ) : (
                      <div> No Models found.</div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </main>
      <Footer />



      {/* Shop Modal */}
      <AddPermissionModal
        open={open}
        setOpen={handleModalClose}
        selectedItem={selectedModel}
        setPermissions={setPermissions}
      />
    </div>
  );
};

export default Permission;
