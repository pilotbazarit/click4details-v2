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
import OrderService from "@/services/OrderService";
import OrderItemModal from "@/components/modals/OrderItemModal";
import CartService from "@/services/CartService";
import CartitemModal from "@/components/modals/CartitemModal";

const OrderList = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false);
  const [cartItems, setCartItems] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedModel, setSelectedModel] = useState(null);
  // const itemsPerPage = 10

  const [hoveredRow, setHoveredRow] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedMode, setEditedMode] = useState("");
  const dropdownRef = useRef(null); // 👈 Add this

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
  };

  const getOrders = async (value = "") => {
    try {
      setLoading(true);
      // const response = await OrderService.Queries.getOrderList({
      //   _page: currentPage,
      //   _perPage: itemsPerPage,
      // });
      const response = await CartService.Queries.getCartList({
        _page: currentPage,
        _perPage: itemsPerPage,
        // _search: value
      });

      console.log("Response from getCards:===========", response);

      if (response?.status == "success") {
        setTotalItems(response?.data?.total)
        setCartItems(response?.data?.data)
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
    getOrders(value);
  };

  const handleShow = (item) => {

    console.log("itemmmm", item);
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
      // try {
      //   const response = await RoleService.Commands.deleteRole(id);
      //   if (response.status === "success") {
      //     Swal.fire({
      //       title: "Deleted!",
      //       text: "Model deleted successfully!",
      //       icon: "success"
      //     });

      //     setCartItems(cartItems.filter((item) => item.o_id !== id));
      //     setTotalItems(totalItems - 1);
      //   }

      // } catch (error) {
      //   if (error.errors) {
      //     Object.values(error.errors).forEach((e) => toast.error(e[0]));
      //   } else {
      //     toast.error(error.message || "Something went wrong");
      //   }
      // }
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
        setCartItems(roles.map((role) => (role.id === userId ? { ...role, user_mode: editedMode } : role)));
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

//   getOrderList

  useEffect(() => {
    getOrders();
  }, [currentPage, itemsPerPage]);


  console.log("orders---------------", cartItems);


  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        {/* <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">Order List</h2>
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
        </div> */}

        {/* Search Filter */}
        <TableFilter query={query} setQuery={setQuery} setCurrentPage={setCurrentPage} fetchSearchResults={fetchSearchResults} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} placeholder="Search by name..." />

        {/* Table Container */}
        <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                <TableHead className="border-r border-gray-300">Cart Id</TableHead>
                <TableHead className="border-r border-gray-300">Customer</TableHead>
                {/* <TableHead className="border-r border-gray-300">Shipping Address</TableHead> */}
                <TableHead className="border-r border-gray-300">Total Amount</TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
                <TableHead className="border-r border-gray-300">Date</TableHead>
                <TableHead className="border-r border-gray-300">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && cartItems?.length > 0 ? (
                cartItems.map((item, index) => (
                  <TableRow key={item.id || index} className="border-b border-gray-200">
                    <TableCell className="border-r border-gray-200 font-medium">{index + 1}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item?.c_id}</TableCell>
                    <TableCell className="border-r border-gray-200">
                      <div className="flex flex-col gap-1">
                        <div className="font-medium text-gray-900">
                          {item?.user?.name || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item?.user?.email || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {item?.user?.phone || 'N/A'}
                        </div>
                      </div>
                    </TableCell>
                   

                    <TableCell className="border-r border-gray-200 font-medium">{item?.c_total}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item?.c_status}</TableCell>
                    <TableCell className="border-r border-gray-200">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-gray-900">
                          {formatDate(item?.c_created_at)}
                        </div>
                      </div>
                    </TableCell>




                    <TableCell className="flex  gap-2 border-r border-gray-200 font-medium">
                      <button
                        onClick={() => handleShow(item)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="View Shop"
                      >
                        <Eye size={18} />
                      </button>

                      {/* <button
                        onClick={() => handleShow(item)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="View Shop"
                      >
                        <Pencil size={18} />
                      </button> */}

                      {/* <button
                        onClick={() => handleDelete(item?.r_id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button> */}
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
      <CartitemModal
        open={open}
        setOpen={handleModalClose}
        setCartItems={setCartItems}
        selectedItem={selectedModel}
        setSelectedItem={setSelectedModel}
      />
    </div>
  );
};

export default OrderList;
