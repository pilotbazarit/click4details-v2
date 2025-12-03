"use client";
import React, { useEffect, useState } from "react";
import Loading from '@/components/Loading';
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import Select from "react-select";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import toast from "react-hot-toast";
import MasterDataTypeModal from "@/components/modals/MasterDataTypeModal";
import MasterDataService from "@/services/MasterDataService";
import Swal from "sweetalert2";
import MasterDataModal from "@/components/modals/MasterDataModal";
import CategoryService from "@/services/CategoryService";

const MasterData = () => {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [masterData, setMasterData] = useState([]);
  const [selectedModel, setSelectedModel] = useState(null);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [selectedType, setSelectedType] = useState(null);

  const getMasterData = async () => {
    try {
      setLoading(true);
      const response = await MasterDataService.Queries.getMasterData({
        _page: 1,
        _perPage: 1000,
        _type_id: selectedType
      });

      setMasterData(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error(
        error.response?.data?.message || "Failed to fetch data types"
      );
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
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
        await MasterDataService.Commands.deleteMasterData(id);
        Swal.fire({
          title: "Deleted!",
          text: "Master Deleted Successfully!",
          icon: "success"
        });
        await getMasterData(); // ✅ make sure it's awaited if it's async
      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error.message || "Something went wrong");
        }
      }
    }
  };

  // get all master data types
  const [dataTypes, setDataTypes] = useState([]);
  const getMasterDataTypes = async () => {
    try {
      const response = await MasterDataService.Queries.getMaterDatatype({
        _page: 1,
        _perPage: 1000,
      })
      setDataTypes(response.data.data);
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const [categories, setCategories] = useState([]);
  const getMasterCatgories = async () => {
    try {
      const response = await CategoryService.Queries.getCategories({
        _page: 1,
        _perPage: 1000,
        _parent_id: 0
      })

      // console.log("Categories:", response);
      if(response.status === 'success'){
        setCategories(response.data.data);
      }
    } catch (error) {
      if (error.errors) {
        Object.values(error.errors).forEach((e) => toast.error(e[0]));
      } else {
        toast.error(error.message || "Something went wrong");
      }
    }
  }

  const [dataTypeOption, setDataTypeOption] = useState([]);

  useEffect(() => {
    const option = [
      { value: "", label: "-Select All-" },
      ...dataTypes.map((dt) => ({
        value: dt.mdt_id,
        label: dt.mdt_title,
      })),
    ];

    setDataTypeOption(option);
  }, [dataTypes]);

  useEffect(() => {
    getMasterData();
  }, [selectedType]);

  useEffect(() => {
    getMasterCatgories();
    getMasterData();
    getMasterDataTypes();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">All Master Data</h2>
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
            Add Master Data

          </Button>
        </div>

        {/* Search Filter */}
        <TableFilter searchTerm={searchTerm} setSearchTerm={handleSearchChange} />

        {/* Table Container */}
        <div className="rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                <TableHead className="border-r border-gray-300">Name</TableHead>
                <TableHead className="relative border-r border-gray-300">
                  <div className="flex items-center justify-between">
                    Type
                    <button onClick={() => setShowTypeFilter((prev) => !prev)}>
                      <svg
                        className={`w-6 h-6 ml-1 stroke-current transition-colors duration-300 ${
                          selectedType ? "text-red-600" : "text-gray-600"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M4 6h16M6 12h12M10 18h4" />
                      </svg>
                    </button>
                  </div>

                  

                  {/* Filter Dropdown */}
                  {showTypeFilter && (
                    <div className="absolute top-8 right-0 z-10 bg-white border border-gray-300 shadow-md rounded-md p-2 w-48">
                      <div className="flex flex-col space-y-2  ">
                        <h1 className="text-gray-800 font-semibold ">Select Master Data Type</h1>
                        <Select
                          id="typeFilter"
                          options={dataTypeOption}
                          value={dataTypeOption.find(opt => opt.value === selectedType) || null}
                          onChange={(option) => {
                            setSelectedType(option?.value ?? null);
                            setShowTypeFilter((prev) => !prev);
                          }}
                          className="react-select-container"
                          classNamePrefix="react-select"
                          isClearable
                          styles={{
                            control: (base) => ({
                              ...base,
                              minHeight: '40px',
                            }),
                          }}
                        />
                      </div>
                    </div>
                  )}
                </TableHead>
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

            <TableBody className="min-h-[300px] md:min-h-[400px] lg:min-h-[500px] xl:min-h-[600px]">
                {!loading &&masterData.length > 0 ? (
                  masterData.map((item, index) => (
                    <TableRow key={item.mdt_id || index} className="border-b border-gray-200">
                      <TableCell className="border-r border-gray-200 text-center">{index + 1}</TableCell>
                      <TableCell className="border-r border-gray-200 font-medium">{item.md_title}</TableCell>
                      <TableCell className="border-r border-gray-200 font-medium">
                        {dataTypes.find((type) => type.mdt_id === item.md_type_id)
                          ?.mdt_title || "N/A"}
                      </TableCell>
                      <TableCell className="border-r border-gray-200 font-medium">{item.md_description}</TableCell>
                      <TableCell className="flex justify-end gap-2 border-r border-gray-200 font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label={`Edit ${item.md_title}`}
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          // Add delete handler here
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Delete shop ${item.md_title}`}
                          onClick={() => handleDelete(item?.md_id)}
                        >
                          <Trash2 size={18} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[500px] text-center py-4 text-gray-500">
                      {loading ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        <div>No Master Data Found.</div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <Pagination />
        </div>
      </main>
      {/* )} */}
      <Footer />

      {/* Shop Modal */}
      <MasterDataModal
        open={open}
        setOpen={setOpen}
        getMasterData={getMasterData}
        initialData={selectedModel}
        dataTypes={dataTypes}
        categories={categories}
      />
    </div>
  );
};

export default MasterData;
