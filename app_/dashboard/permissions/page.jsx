"use client";
import React, { useEffect, useState } from "react";
import Footer from "@/components/dashboard/Footer";
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
import { Button } from "@/components/ui/button";
import AddPermissionModal from "@/components/modals/AddPermissionModal";
import PermissionService from "@/services/PermissionService";

const Permission = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedModel, setSelectedModel] = useState(null);

  const getPermissions = async (value = "") => {
    try {
      setLoading(true);
      const response = await PermissionService.Queries.getPermissions({
        _page: currentPage,
        _perPage: itemsPerPage,
      });

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

  const fetchSearchResults = (value) => {
    getPermissions(value);
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
    getPermissions();
  }, [currentPage, itemsPerPage]);


  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">Permission List</h2>
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
                <TableHead className="border-r border-gray-300">Model</TableHead>
                <TableHead className="border-r border-gray-300">Type</TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
                <TableHead className="border-r border-gray-300">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && permissions?.length > 0 ? (
                permissions.map((item, index) => (
                  <TableRow key={item.id || index} className="border-b border-gray-200">
                    <TableCell className="border-r border-gray-200 font-medium">{index + 1}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item?.p_name}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item?.p_model }</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item?.p_type }</TableCell>
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
                      <button
                        onClick={() => handleShow(item)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="View Shop"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handleDelete(item?.p_id)}
                        className="text-red-600 hover:text-red-800"
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
