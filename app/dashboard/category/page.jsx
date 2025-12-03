"use client";
import React, { useEffect, useState } from "react";
import Loading from '@/components/Loading';
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import { Loader2, Pencil, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import constData from "@/lib/constant";

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
import MasterDataService from "@/services/MasterDataService";
import CategoryModal from "@/components/modals/CategoryModal";
import CategoryService from "@/services/CategoryService";

const Category = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("")
  const [brands, setBrands] = useState("");
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState();
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Nested categories state
  const [expandedRows, setExpandedRows] = useState({});
  const [subCategories, setSubCategories] = useState({});
  const [loadingSubCategories, setLoadingSubCategories] = useState({});

  // Initialize with parent_id = 0 for main categories
  useEffect(() => {
    getCategories();
  }, [currentPage, itemsPerPage]);

  useEffect(() => {
    getBrands();
    getCategories();
  }, []);

  const getBrands = async () => {
    try {
      const brand_code = constData.BRAND_MD_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(brand_code);

      const brandMasterData = response.data?.master_data;
      const brandData = brandMasterData.map((brand) => ({
        value: brand.md_id,
        label: brand.md_title,
      }));
      setBrands(brandData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getCategories = async (value = "") => {
    try {
      setLoading(true);
      const response = await CategoryService.Queries.getCategories({
        _page: currentPage,
        _perPage: itemsPerPage,
        _name: value,
        _parent_id: 0, // Only fetch main categories (parent_id = 0 or null)
      });

      if (response?.status == "success") {
        setTotalItems(response?.data?.total)
        setCategories(response?.data?.data)
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(response?.data?.message || "Failed to fetch categories");
      }

    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to fetch data types"
      );
    }
  }

  // Fetch subcategories for a parent category
  const getSubCategories = async (parentId) => {
    try {
      setLoadingSubCategories(prev => ({ ...prev, [parentId]: true }));

      // API call to get subcategories by parent ID
      const response = await CategoryService.Queries.getCategories({
        _parent_id: parentId,
        _perPage: 1000, // Get all subcategories
      });

      if (response?.status == "success") {
        setSubCategories(prev => ({
          ...prev,
          [parentId]: response?.data?.data || []
        }));
      }

      setLoadingSubCategories(prev => ({ ...prev, [parentId]: false }));
    } catch (error) {
      setLoadingSubCategories(prev => ({ ...prev, [parentId]: false }));
      toast.error("Failed to fetch subcategories");
    }
  }

  // Toggle row expansion
  const toggleRow = async (categoryId) => {
    const isExpanded = expandedRows[categoryId];

    setExpandedRows(prev => ({
      ...prev,
      [categoryId]: !isExpanded
    }));

    // Fetch subcategories if expanding and not already loaded
    if (!isExpanded && !subCategories[categoryId]) {
      await getSubCategories(categoryId);
    }
  }

  const fetchSearchResults = (value) => {
    getCategories(value);
  };

  const handleEdit = (item) => {
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
        await CategoryService.Commands.deleteCategory(id);
        Swal.fire({
          title: "Deleted!",
          text: "Category deleted successfully!",
          icon: "success"
        });
        await getCategories();
      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error.message || "Something went wrong");
        }
      }
    }
  };

  const handleModalClose = () => {
    setOpen(false);
    setSelectedModel(null);
  }

  useEffect(() => {
    getCategories();
  }, [currentPage, itemsPerPage]);

  // Recursive component to render nested categories
  const CategoryRow = ({ item, index, level = 0 }) => {
    const hasChildren = subCategories[item.c_id]?.length > 0;
    const isExpanded = expandedRows[item.c_id];
    const isLoadingSub = loadingSubCategories[item.c_id];
    const indent = level * 24; // 24px per level

    return (
      <>

        <TableRow
          className={`border-b border-gray-200 hover:bg-gray-50 ${item.c_is_child ? 'cursor-pointer' : 'cursor-default'
            }`}
          onClick={item.c_is_child ? () => toggleRow(item.c_id) : undefined}
        >
          <TableCell className="border-r border-gray-200 text-center">
            {level === 0 ? index + 1 : ""}
          </TableCell>
          <TableCell className="border-r border-gray-200 font-medium">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${indent}px` }}
            >
              <span className="flex-shrink-0">
                {isExpanded ? (
                  <ChevronDown size={16} className="text-gray-600" />
                ) : (

                  item.c_is_child ? (
                    <ChevronRight size={16} className="text-gray-600" />
                  ) : null


                )}

              </span>
              <span className="text-gray-500 text-sm">
                {level === 0 ? "Level 1" :
                  level === 1 ? "Level 2" :
                    level === 2 ? "Level 3" :
                      `Level ${level + 1}`}
              </span>
            </div>
          </TableCell>
          <TableCell className="border-r border-gray-200 font-medium">
            {item.c_name}
          </TableCell>
          <TableCell className="border-r border-gray-200 font-medium">
            <span
              className={`px-2 py-1 text-xs rounded-full font-semibold ${item.c_status === 'active'
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
                }`}
            >
              {item.c_status === 'active' ? "Active" : "Inactive"}
            </span>
          </TableCell>
          <TableCell
            className="border-r border-gray-200 font-medium"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleEdit(item)}
                className="text-blue-600 hover:text-blue-800"
                aria-label={`Edit category ${item.c_name}`}
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => handleDelete(item?.c_id)}
                className="text-red-600 hover:text-red-800"
                aria-label={`Delete category ${item.c_name}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </TableCell>
        </TableRow>

        {/* Show subcategories when expanded */}
        {isExpanded && (
          <>
            {isLoadingSub ? (
              <TableRow>
                <TableCell colSpan={5} className="py-2 text-center bg-gray-50">
                  <Loader2 className="animate-spin w-4 h-4 inline-block text-blue-500" />
                  <span className="ml-2 text-sm text-gray-500">Loading subcategories...</span>
                </TableCell>
              </TableRow>
            ) : hasChildren ? (
              subCategories[item.c_id].map((subItem, subIndex) => (
                <CategoryRow
                  key={subItem.c_id}
                  item={subItem}
                  index={subIndex}
                  level={level + 1}
                />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-2 text-center bg-gray-50">
                  <span className="text-sm text-gray-500">No subcategories found</span>
                </TableCell>
              </TableRow>
            )}
          </>
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">All Category</h2>
          <Button
            onClick={() => {
              setOpen(true);
              setSelectedModel(null);
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
            Add Category
          </Button>
        </div>

        <TableFilter
          query={query}
          setQuery={setQuery}
          setCurrentPage={setCurrentPage}
          fetchSearchResults={fetchSearchResults}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          placeholder="Search by name..."
        />

        <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                <TableHead className="border-r border-gray-300">Main Category</TableHead>
                <TableHead className="border-r border-gray-300">Name</TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
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
              {!loading && categories?.length > 0 ? (
                categories.map((item, index) => (
                  <CategoryRow key={item.c_id} item={item} index={index} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[600px] text-center py-4 text-gray-500">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                        <span className="text-gray-500 font-semibold ">Loading...</span>
                      </div>
                    ) : (
                      <div>No Category found.</div>
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

      <CategoryModal
        open={open}
        setOpen={handleModalClose}
        brands={brands}
        categories={categories}
        getCategories={getCategories}
        initialData={selectedModel}
      />
    </div>
  );
};

export default Category;