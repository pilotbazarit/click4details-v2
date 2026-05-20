"use client";
import React, { useEffect, useState } from "react";
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import ShopModal from "@/components/modals/ShopModal";
import StoreService from "@/services/ShopService";
import { Loader2, Pencil, SmilePlus } from "lucide-react";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import toast from "react-hot-toast";
import UserRolePermissionListModal from "@/components/modals/UserRolePermissionListModal";
import RoleService from "@/services/RoleService";
import AddUserModal from "@/components/modals/AddUserModal";

const Shop = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [openPermissionList, setOpenPermissionList] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedShopForEdit, setSelectedShopForEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const { permissionList, user } = useAppContext();


  const canShowAddShopButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Shop", "ShowShopAddButton")

  const canPermissionUserShopButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Shop", "AddPermissionUserShopButton")

  const canShowEditShopButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Shop", "ShowShopEditButton")

  const fetchShops = async (
    searchValue = searchQuery,
    page = currentPage,
    perPage = itemsPerPage
  ) => {
    setLoading(true);
    try {
      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      const user = JSON.parse(userInfo);

      const params = {
        _page: page,
        _perPage: perPage,
        _order: 'desc',
        _orderBy: 's_created_at',
      };

      if (searchValue?.trim()) {
        params._title = searchValue.trim();
      }

      // Add _user_id parameter if user is not superadmin
      if (user?.user_mode !== 'supreme') {
        params._user_id = user?.id;
      }

      const response = await StoreService.Queries.getShops(params);
      setShops(response?.data?.data || []);
      setTotalItems(response?.data?.total || 0);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddShopClick = () => {
    setSelectedShopForEdit(null);
    setOpen(true);
  };

  const handleEditShopClick = (shop) => {
    setSelectedShopForEdit(shop);
    setOpen(true);
  };

  const handleShopModalOpenChange = (isOpen) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedShopForEdit(null);
    }
  };

  useEffect(() => {
    fetchShops(searchQuery, currentPage, itemsPerPage);
  }, [searchQuery, currentPage, itemsPerPage]);

  useEffect(() => {
    if (query.trim() === "" && searchQuery !== "") {
      setCurrentPage(1);
      setSearchQuery("");
    }
  }, [query, searchQuery]);

  const handleOpenPermissionList = (shop) => {
    setSelectedShop(shop);
    setEmployees([]);
    setOpenPermissionList(true);
    getUserRolePermission(shop);
  };


  const [employees, setEmployees] = useState([]);

  const getUserRolePermission = async (shop) => {
    if (!shop?.s_id) {
      setEmployees([]);
      return;
    }

    try {
      const response = await RoleService.Queries.getUserRolePermission(shop?.s_id);

      if (response.status === "success") {
        setEmployees(Array.isArray(response?.data) ? response.data : []);
      } else {
        setEmployees([]);
      }
    } catch (error) {
      setEmployees([]);
      console.log("Error fetching users:", error);
    }
  };

  const fetchSearchResults = () => {
    setCurrentPage(1);
    setSearchQuery(query.trim());
  };

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
          <h2 className="text-xl text-gray-800">All Shops</h2>
          {
            canShowAddShopButton && (
              <Button
                onClick={handleAddShopClick}
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
                Add Shop
              </Button>
            )
          }

        </div>

        {/* Search Filter */}
        <TableFilter
          query={query}
          setQuery={setQuery}
          setCurrentPage={setCurrentPage}
          fetchSearchResults={fetchSearchResults}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          placeholder="Search by name..."
          onClearSearch={handleClearSearch}
        />

        {/* Table Container */}
        <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                <TableHead className="border-r border-gray-300">Shop Logo</TableHead>
                <TableHead className="border-r border-gray-300">Name</TableHead>
                <TableHead className="border-r border-gray-300">Mobile</TableHead>
                {/* <TableHead className="border-r border-gray-300">Shop Category</TableHead> */}
                <TableHead className="border-r border-gray-300">Description</TableHead>
                <TableHead className="text-right w-[10]">
                  <div className="flex justify-end items-center w-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-6 h-6 stroke-current"
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
              {!loading && shops.length > 0 ? (
                shops.map((shop, index) => (
                  <TableRow key={shop.id || index} className="border-b border-gray-200">
                    <TableCell className="border-r border-gray-200 text-center">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 text-center">
                      <img
                        src={shop?.s_logo?.url}
                        alt={shop.s_title}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{shop.s_title}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{shop?.user?.phone}</TableCell>
                    {/* <TableCell className="border-r border-gray-200 font-medium">{shop.s_shop_category_id}</TableCell> */}
                    <TableCell className="border-r border-gray-200 font-medium">{shop.s_description}</TableCell>
                    <TableCell className="flex justify-end gap-2 border-r border-gray-200 font-medium">

                      {
                        canPermissionUserShopButton && (
                          <button
                            onClick={() => handleOpenPermissionList(shop)}
                            className="text-orange-600 hover:text-orange-800"
                            aria-label={`Add Permission`}
                            title="Add Permission"
                          >
                            <SmilePlus size={18} />
                          </button>
                        )
                      }

                      {
                        canShowEditShopButton && (
                          <button
                            onClick={() => handleEditShopClick(shop)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label={`Edit shop ${shop.s_title}`}
                          >
                            <Pencil size={18} />
                          </button>
                        )
                      }


                      {/* <button
                          // Add delete handler here
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Delete shop ${shop.s_title}`}
                        >
                          <Trash2 size={18} />
                        </button> */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[600px] text-center py-4 text-gray-500">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                        <span className="text-gray-500 font-semibold">Loading...</span>
                      </div>
                    ) : (
                      <div>No shops found.</div>
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
      {/* <ShopModal open={open} setOpen={setOpen} /> */}
      <ShopModal open={open} setOpen={handleShopModalOpenChange} shop={selectedShopForEdit} fetchShops={fetchShops} />

      <AddUserModal open={openUser} setOpen={setOpenUser} selectedShop={selectedShop} selectedUser={selectedUser} />

      <UserRolePermissionListModal
        open={openPermissionList}
        setOpen={setOpenPermissionList}
        selectedShop={selectedShop}
        employees={employees}
        setOpenUser={setOpenUser}
        setSelectedUser={setSelectedUser}
      />

      {/* openPermission */}
      {/* <AddShopPermissionModal open={openPermission} setOpen={setOpenPermission} selectedShop={selectedShop} /> */}
    </div>
  );
};

export default Shop;
