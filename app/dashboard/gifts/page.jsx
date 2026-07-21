"use client";
import React, { useEffect, useState } from "react";
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import { Gift as GiftIcon, Loader2, Pencil, Plus, Trash2, CalendarClock } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import toast from "react-hot-toast";
import GiftModal from "@/components/modals/GiftModal";
import GiftService from "@/services/GiftService";
import Swal from "sweetalert2";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";

const GiftManagement = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [gifts, setGifts] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { permissionList, user } = useAppContext();

  // Gift Management is restricted to super admin + specifically-permitted
  // users only - unlike Package's looser "any mode except pbl/admin"
  // fallback, we explicitly check for supreme or a granted Gift.* permission.
  const isSupreme = user?.user_mode === "supreme";
  const canCreate = isSupreme || hasPermission(permissionList, 0, "Gift", "Create");
  const canUpdate = isSupreme || hasPermission(permissionList, 0, "Gift", "Update");
  const canDelete = isSupreme || hasPermission(permissionList, 0, "Gift", "Delete");

  const getGifts = async (
    value = searchQuery,
    page = currentPage,
    perPage = itemsPerPage
  ) => {
    try {
      setLoading(true);
      const response = await GiftService.Queries.getGifts({
        _page: page,
        _perPage: perPage,
        _title: value,
      });

      if (response?.status == "success") {
        setTotalItems(response?.data?.total);
        setGifts(response?.data?.data || []);
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(response?.data?.message || "Failed to fetch gifts");
      }
    } catch (error) {
      setLoading(false);
      toast.error(error.response?.data?.message || "Failed to fetch gifts");
    }
  };

  const fetchSearchResults = () => {
    setCurrentPage(1);
    setSearchQuery(query.trim());
  };

  const handleEdit = (item) => {
    setSelectedGift(item);
    setOpen(true);
  };

  const handleModalClose = () => {
    setOpen(false);
    setSelectedGift(null);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This gift will be removed. Vehicles/products it's attached to will no longer show it.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#7c3aed",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await GiftService.Commands.deleteGift(id);
        await getGifts();
        Swal.fire({ title: "Deleted!", text: "Gift deleted successfully!", icon: "success" });
      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error.message || "Something went wrong");
        }
      }
    }
  };

  useEffect(() => {
    getGifts(searchQuery, currentPage, itemsPerPage);
  }, [searchQuery, currentPage, itemsPerPage]);

  useEffect(() => {
    if (query.trim() === "" && searchQuery !== "") {
      setCurrentPage(1);
      setSearchQuery("");
    }
  }, [query, searchQuery]);

  const handleClearSearch = () => {
    setCurrentPage(1);
    setSearchQuery("");
  };

  const isExpired = (date) => date && new Date(date) < new Date();
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 my-6 w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 text-white">
            <div className="bg-white/15 rounded-full p-2.5">
              <GiftIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Gift Management</h2>
              <p className="text-sm text-purple-100">Gifts attachable to vehicles &amp; products as a user gift or PBL gift</p>
            </div>
          </div>
          {canCreate && (
            <Button
              onClick={() => {
                setOpen(true);
                setSelectedGift(null);
              }}
              className="flex items-center gap-2 bg-white text-purple-700 hover:bg-purple-50"
            >
              <Plus className="w-5 h-5" />
              Add Gift
            </Button>
          )}
        </div>

        <div className="p-6">
          {/* Search Filter */}
          <TableFilter
            query={query}
            setQuery={setQuery}
            setCurrentPage={setCurrentPage}
            fetchSearchResults={fetchSearchResults}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            placeholder="Search by gift title..."
            onClearSearch={handleClearSearch}
          />

          {/* Table Container */}
          <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow className="border-b border-gray-300">
                  <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                  <TableHead className="border-r border-gray-300">Image</TableHead>
                  <TableHead className="border-r border-gray-300">Title</TableHead>
                  <TableHead className="border-r border-gray-300">Description</TableHead>
                  <TableHead className="border-r border-gray-300">Expire Date</TableHead>
                  <TableHead className="border-r border-gray-300">Status</TableHead>
                  <TableHead className="text-right w-[10]">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {gifts?.length > 0 ? (
                  gifts.map((item, index) => (
                    <TableRow key={item.g_id || index} className="border-b border-gray-200">
                      <TableCell className="border-r border-gray-200 text-center">{startIndex + index + 1}</TableCell>
                      <TableCell className="border-r border-gray-200">
                        {item?.g_image?.secure_url || item?.g_image?.url ? (
                          <img
                            src={item.g_image.secure_url || item.g_image.url}
                            alt={item?.g_title}
                            className="w-12 h-12 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg border bg-purple-50 flex items-center justify-center text-purple-400">
                            <GiftIcon className="w-5 h-5" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium">{item?.g_title}</TableCell>
                      <TableCell className="border-r border-gray-200 text-gray-600 max-w-xs truncate">{item?.g_description || '-'}</TableCell>
                      <TableCell className="border-r border-gray-200">
                        {item?.g_expiredate ? (
                          <span className={`inline-flex items-center gap-1.5 text-sm ${isExpired(item.g_expiredate) ? 'text-red-600' : 'text-gray-700'}`}>
                            <CalendarClock className="w-3.5 h-3.5" />
                            {String(item.g_expiredate).slice(0, 10)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">No expiry</span>
                        )}
                      </TableCell>
                      <TableCell className="border-r border-gray-200">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${item?.g_status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                          {item?.g_status}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-end gap-2 border-r border-gray-200 font-medium">
                        {canUpdate && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-blue-600 hover:text-blue-800"
                            aria-label={`Edit gift ${item.g_title}`}
                          >
                            <Pencil size={18} />
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(item?.g_id)}
                            className="text-red-600 hover:text-red-800"
                            aria-label={`Delete gift ${item.g_title}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="animate-spin w-5 h-5 text-purple-500" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <div>No gifts found.</div>
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
        </div>
      </main>
      <Footer />

      <GiftModal
        open={open}
        setOpen={handleModalClose}
        getGifts={getGifts}
        initialData={selectedGift}
      />
    </div>
  );
};

export default GiftManagement;
