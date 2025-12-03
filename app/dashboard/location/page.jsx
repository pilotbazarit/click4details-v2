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
import MasterDataService from "@/services/MasterDataService";
import AddLocationModal from "@/components/modals/AddLocationModal";
import LocationService from "@/services/LocationService";

const Model = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("")
  const [countries, setCountries] = useState("");
  const [locations, setLocations] = useState([]);
  const [open, setOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState();
  const [itemsPerPage, setItemsPerPage] = useState(25);


  const getCountries = async () => {
    try {
      const country_code = constData.COUNTRY_CODE;
      const response = await MasterDataService.Queries.getMasterDataByTypeCode(country_code);

      const countryMasterData = response.data?.master_data;
      const countryData = countryMasterData.map((country) => ({
        value: country.md_id,
        label: country.md_title,
      }));
      setCountries(countryData);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const getLocations = async (value = "") => {
    try {
      setLoading(true);
      const response = await LocationService.Queries.getLocationall({
        _page: currentPage,
        _perPage: itemsPerPage,
        _name: value,
      });

      if (response.status == "Success") {
        setTotalItems(response?.data?.total)
        setLocations(response?.data?.data)
        setLoading(false);
      } else {
        setLoading(false);
        toast.error(response?.data?.message || "Failed To Fetch Location sdaf");
      }

    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed To Fetch Data Types"
      );
    }
  }

  const fetchSearchResults = (value) => {
    // console.log("value", value);
    getLocations(value);
  };

  const handleEdit = (item) => {
    setSelectedModel(item);
    setOpen(true);
  }

  // const handleDelete = async (id) => {
  //   const result = await Swal.fire({
  //     title: "Are you sure?",
  //     text: "You want to delete this!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     cancelButtonColor: "#d33",
  //     confirmButtonText: "Yes, delete it!"
  //   });

  //   if (result.isConfirmed) {
  //     try {
  //       await LocationService.Commands.deleteModel(id);
  //       Swal.fire({
  //         title: "Deleted!",
  //         text: "Model deleted successfully!",
  //         icon: "success"
  //       });
  //       await getLocations(); 
  //     } catch (error) {
  //       if (error.errors) {
  //         Object.values(error.errors).forEach((e) => toast.error(e[0]));
  //       } else {
  //         toast.error(error.message || "Something went wrong");
  //       }
  //     }
  //   }
  // };

  // Reset selected model when modal closes
  const handleModalClose = () => {
    setOpen(false);
    setSelectedModel(null);
  }

  
  useEffect(() => {
    getCountries();
    getLocations();
  }, []);


  useEffect(() => {
    getLocations();
  }, [currentPage, itemsPerPage]);

  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">All Locations</h2>
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
            Add Location
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
                <TableHead className="border-r border-gray-300">Country</TableHead>
                <TableHead className="border-r border-gray-300">Name</TableHead>
                <TableHead className="border-r border-gray-300">Address</TableHead>
                <TableHead className="border-r border-gray-300">Zip</TableHead>
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
              {!loading && locations?.length > 0 ? (
                locations.map((item, index) => (
                  <TableRow key={item.id || index} className="border-b border-gray-200">
                    <TableCell className="border-r border-gray-200 text-center">{index + 1}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item.country_name}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item.l_name}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item.l_address}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">{item.l_zip_code}</TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${item.l_status === 'active'
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {item.l_status === 'active' ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-center gap-2 border-r border-gray-200 font-medium">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label={`Edit shop ${item.l_name}`}
                      >
                        <Pencil size={18} />
                      </button>
                      {/* <button
                        onClick={() => handleDelete(item?.l_id)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Delete shop ${item.l_name}`}
                      >
                        <Trash2 size={18} />
                      </button> */}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[600px] text-center py-4 text-gray-500">
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
      <AddLocationModal
        open={open}
        setOpen={handleModalClose}
        countries={countries}
        setLocations={setLocations}
        initialData={selectedModel}
      />
    </div>
  );
};

export default Model;
