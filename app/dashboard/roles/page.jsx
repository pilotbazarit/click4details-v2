"use client";
import React, { useEffect, useRef, useState } from "react";
import Footer from "@/components/dashboard/Footer";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import { Check, Eye, Loader2, Pencil, Trash2 } from "lucide-react";


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import toast from "react-hot-toast";
import VehicleModelModal from "@/components/modals/VehicleModelModal";
import VehicleModelService from "@/services/VehicleModelService";
import Swal from "sweetalert2";
import MasterDataService from "@/services/MasterDataService";
import UserService from "@/services/UserService";
import UserShopListModel from "@/components/modals/UserShopListModel";
import { Button } from "@/components/ui/button";
import AddRoleModal from "@/components/modals/AddRoleModel";
import RoleService from "@/services/RoleService";

const Role = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false);
  const [roles, setRoles] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedModel, setSelectedModel] = useState(null);
  // const itemsPerPage = 10

  const [hoveredRow, setHoveredRow] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedMode, setEditedMode] = useState("");
  const dropdownRef = useRef(null); // 👈 Add this

  const getRoles = async (value = "") => {
    try {
      setLoading(true);
      const response = await RoleService.Queries.getRoles({
        _page: currentPage,
        _perPage: itemsPerPage,
      });

      // console.log("Response from getRoles:", response);

      if (response?.status == "success") {
        setTotalItems(response?.data?.total)
        setRoles(response?.data?.data)
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

  const fetchSearchResults = (value) => {
    getRoles(value);
  };

  const handleShow = (item) => {
    setSelectedModel(item);
    setOpen(true);
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
        const response = await RoleService.Commands.deleteRole(id);
        if (response.status === "success") {
          Swal.fire({
            title: "Deleted!",
            text: "Model deleted successfully!",
            icon: "success"
          });

          setRoles(roles.filter((role) => role.r_id !== id));
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

  const handleModeChange = async (userId) => {
    try {
      const response = await UserService.Commands.updateUser(userId, {
        _method: "PUT",
        user_mode: editedMode
      });

      if (response.status === "success") {
        toast.success("User mode updated successfully!");
        setEditingRowId(null);
        setHoveredRow(null);
        setRoles(roles.map((role) => (role.id === userId ? { ...role, user_mode: editedMode } : role)));
      } else {
        toast.error(response.message || "Failed to update user mode.");
      }
    } catch (err) {
      toast.error("Something went wrong while updating.");
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setEditingRowId(null);
        setHoveredRow(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    getRoles();
  }, [currentPage, itemsPerPage]);


  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">Role List</h2>
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
            Add Role
          </Button>
        </div>

        {/* Search Filter */}
        <TableFilter query={query} setQuery={setQuery} setCurrentPage={setCurrentPage} fetchSearchResults={fetchSearchResults} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} placeholder="Search by name..." />

        {/* Table Container */}
        <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                <TableHead className="border-r border-gray-300">Name</TableHead>
                <TableHead className="border-r border-gray-300">Description</TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
                <TableHead className="border-r border-gray-300">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && roles?.length > 0 ? (
                roles.map((item, index) => (
                  <TableRow key={item.id || index} className="border-b border-gray-200">
                    <TableCell className="border-r border-gray-200 font-medium">{index + 1}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item?.r_name}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item?.r_description || 'N/A'}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      <div className="flex items-center gap-2">
                        {item?.r_status === "active" ? (
                          <span className="text-green-600">Active</span>
                        ) : (
                          <span className="text-red-600">Inactive</span>
                        )}

                      </div>
                    </TableCell>




                    <TableCell className="flex  gap-2 border-r border-gray-200 font-medium">
                      <button
                        onClick={() => handleShow(item)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="View Shop"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        // Add delete handler here
                        onClick={() => handleDelete(item?.r_id)}
                        className="text-red-600 hover:text-red-800"
                      // aria-label={`Delete roles ${item.fs_title}`}
                      >
                        <Trash2 size={18} />
                      </button>
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
      <AddRoleModal
        open={open}
        setOpen={handleModalClose}
        selectedItem={selectedModel}
        setRoles={setRoles}
      />
    </div>
  );
};

export default Role;
