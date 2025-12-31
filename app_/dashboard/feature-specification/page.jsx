"use client";
import React, { useEffect, useState } from "react";
import Loading from '@/components/Loading';
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import ShopModal from "@/components/modals/ShopModal";
import StoreService from "@/services/ShopService";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import constData from "@/lib/constant";
import api from "@/lib/api";

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
import FeatureSpecification from "@/components/modals/FeatureSpecificationModal";
import FeatureSpecificationModal from "@/components/modals/FeatureSpecificationModal";
import FeatureSpecificationService from "@/services/FeatureSpecificationService";
import MasterDataService from "@/services/MasterDataService";

const Model = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [brands, setBrands] = useState("");
  const [featureSpecification, setFeatureSpecification] = useState([]);
  const [open, setOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [features, setFeatures] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [query, setQuery] = useState("");

  const getFeatureSpecification = async () => {
    try {
      setLoading(true);
      const response = await FeatureSpecificationService.Queries.getFeatureSpecification({
        _page: currentPage,
        _perPage: itemsPerPage,
        // _title: value,
      });

      if (response?.status == "success") {
        setTotalItems(response?.data?.total)
        setFeatureSpecification(response?.data?.data)
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to fetch data types"
      );
    }
  }

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredShops = shops.filter((shop) =>
    shop.s_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        // Call the delete API
        await FeatureSpecificationService.Commands.deleteFeatureSpecification(id);
        await getFeatureSpecification();
        Swal.fire({
          title: "Deleted!",
          text: "Feature Specification Deleted Successfully!",
          icon: "success"
        });
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

  const fetchSearchResults = (value) => {
    getFeatureSpecification(value);
  };

  const getFeatures = async () => {

    console.log("getFeatures called");
    try {
      const response = await MasterDataService.Queries.getMasterData({
        _type_code: constData.FEATURE_CODE,
        _status: 'active',
        _perPage: 1000 // Fetch all active features
      });

      const featureMasterData = response.data?.data;

      const featureData = featureMasterData.map((item) => ({
        value: item.md_id,
        label: item.md_title,
      }));

      setFeatures(featureData);

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch data types"
      );
    }
  }

  useEffect(() => {
    getFeatureSpecification();

    getFeatures();
  }, []);

  useEffect(() => {
    getFeatureSpecification();
  }, [currentPage, itemsPerPage]);

  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">All Feature Specification</h2>
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
            Add Feature SFC
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
                <TableHead className="border-r border-gray-300">Feature</TableHead>
                <TableHead className="border-r border-gray-300">Title</TableHead>
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
              {!loading && featureSpecification?.length > 0 ? (
                featureSpecification.map((item, index) => (
                  <TableRow key={item.id || index} className="border-b border-gray-200">
                    <TableCell className="border-r border-gray-200 text-center">{index + 1}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item.fs_feature_name}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item.fs_title}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${item.fs_status === 'active'
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {item.fs_status === 'active' ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2 border-r border-gray-200 font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={`Edit shop ${item.fs_title}`}
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        // Add delete handler here
                        onClick={() => handleDelete(item?.fs_id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Delete shop ${item.fs_title}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4 text-gray-500">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      <div>No Feature Specification found.</div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
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
      <FeatureSpecificationModal
        open={open}
        setOpen={handleModalClose}
        features={features}
        getFeatureSpecification={getFeatureSpecification}
        initialData={selectedModel}
      />
    </div>
  );
};

export default Model;
