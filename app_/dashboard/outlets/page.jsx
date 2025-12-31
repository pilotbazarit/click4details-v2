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
import OutletModal from "@/components/modals/OutletModal";
import DragDropTable from "@/components/drag-drop-table/DragDropTable";
import OutletService from "@/services/OutletService";
import ShopService from "@/services/ShopService";
import { orderBy } from "lodash";

const Model = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState();
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [shopData, setShopData] = useState([]);

  const getOutlets = async (value = "") => {
    try {

      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      const user = JSON.parse(userInfo);

      const params = {
        _page: 1,
        _perPage: 1000,
        _name: value,
        _order: 'asc',
        _orderBy: 'uo_serial',
      };

      // Add _user_id parameter if user is not superadmin
      if (user?.user_mode !== 'supreme') {
        params._user_id = user?.id;
      }

      const response = await OutletService.Queries.getAllOutlets(params);

      if (response?.status === 'success') {
        setTotalItems(response?.data?.total)
        setRows(response?.data?.data)
      }
    } catch (error) {
      console.log("Error fetching brand data:", error);
    }
  }

  const fetchSearchResults = (value) => {
    getOutlets(value);
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
        const res = await OutletService.Commands.deleteOutlet(id);

        if (res?.status === 'success') {
          Swal.fire({
            title: "Deleted!",
            text: "Outlet Deleted Successfully!",
            icon: "success"
          });

          setRows((prevRows) => prevRows.filter((row) => row.uo_id !== id));
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


  const getShopData = async () => {
    try {
      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      const user = JSON.parse(userInfo);

      const response = await ShopService.Queries.getShops(
        {
          order: "desc",
          orderBy: "md_id",
          _user_id: user?.id,
          _page: 1,
          _perPage: 1000,
        }
      );

      const shopOptions = response.data.data.map((shop) => ({
        value: shop.s_id,
        label: shop.s_title,
      }));

      setShopData(shopOptions);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    }
  };

  // Reset selected model when modal closes
  const handleModalClose = () => {
    setOpen(false);
    setSelectedModel(null);
  }

  useEffect(() => {
    getOutlets();
    getShopData();
  }, []);

  useEffect(() => {
    getOutlets();
  }, [currentPage, itemsPerPage]);


  // const [rows, setRows] = useState([
  //   { id: 1, country: "Bangladesh", location: "Dhaka", title: "PBL", address: "PBL, Dhaka", map_link: "https://goo.gl/maps/2o4bEe6wLxq6N4oJ8" },
  //   { id: 2, country: "Japan", location: "Tokyo", title: "PBL", address: "PBL, Japan", map_link: "https://goo.gl/maps/2o4bEe6wLxq6N4oJ8" },
  //   { id: 3, country: "Bangladesh", location: "Mirpur", title: "PBL", address: "PBL, Dhaka", map_link: "https://goo.gl/maps/2o4bEe6wLxq6N4oJ8" },
  //   { id: 4, country: "Bangladesh", location: "Gulshan", title: "PBL", address: "PBL, Dhaka", map_link: "https://goo.gl/maps/2o4bEe6wLxq6N4oJ8" },
  // ]);

  const columns = [
    { key: "serial", header: "SL", width: "5%" },
    { key: "uo_country_id", header: "Country", width: "15%" },
    { key: "uo_location", header: "Location", width: "15%" },
    { key: "uo_name", header: "Name", width: "15%" },
    { key: "uo_address", header: "Address", width: "15%" },
    { key: "uo_map_link", header: "Map Link", width: "15%" },
    {
      key: "action",
      header: "Action",
      width: "10%",
      render: (row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => handleDelete(row.uo_id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];


  // console.log("shopData::", shopData);

  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">All Outlets</h2>
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
            Add Outlet
          </Button>
        </div>

        {/* Search Filter */}
        <TableFilter query={query} setQuery={setQuery} setCurrentPage={setCurrentPage} fetchSearchResults={fetchSearchResults} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} placeholder="Search by name..." />

        {/* Table Container */}
        <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
          {/* <div className="max-w-3xl mx-auto p-4"> */}
          {/* <h2 className="text-xl font-semibold mb-3">Drag & Drop Table (Demo)</h2>
            <p className="text-sm text-gray-500 mb-4">Drag the handle on the left to reorder rows.</p> */}
          <DragDropTable
            columns={columns}
            rows={rows}
            onReorder={(next) => setRows(next)}
          />

          {/* Pagination */}
          {/* <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
          /> */}
          {/* <pre className="mt-4 text-xs bg-gray-50 p-3 rounded border">{JSON.stringify(rows, null, 2)}</pre> */}
        </div>
        {/* </div> */}
      </main>
      <Footer />

      {/* Shop Modal */}
      <OutletModal
        open={open}
        setOpen={handleModalClose}
        initialData={selectedModel}
        setRows={setRows}
        shopData={shopData}
      />
    </div>
  );
};

export default Model;
