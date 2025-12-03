"use client";
import React, { useEffect, useState, useRef } from "react";
import Loading from '@/components/Loading';
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import ShopModal from "@/components/modals/ShopModal";
import StoreService from "@/services/ShopService";
import { DollarSign, Funnel, Loader2, Pencil, Trash2 } from "lucide-react";
import Select from 'react-select';
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
import Swal from "sweetalert2";
import MasterDataService from "@/services/MasterDataService";
import VehicleService from "@/services/VehicleService";
import { useRouter } from "next/navigation";
import PackageService from "@/services/PackageService";
import PriceHistoryModal from "@/components/modals/PriceHistoryModal";
import { set } from "lodash";
import GeneralProductService from "@/services/GeneralProductService";

const ProductList = () => {
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("")
    const [codeQuery, setCodeQuery] = useState("");
    const [showCodeSearch, setShowCodeSearch] = useState(false);
    const [editionQuery, setEditionQuery] = useState("");
    const [showEditionSearch, setShowEditionSearch] = useState(false);
    const [chassisQuery, setChassisQuery] = useState("");
    const [showChassisSearch, setShowChassisSearch] = useState(false);
    const [brands, setBrands] = useState("");
    const [editions, setEditions] = useState([]);
    const [products, setProducts] = useState([]);
    const [open, setOpen] = useState(false);
    const [shops, setShops] = useState([]);
    const [selectedModel, setSelectedModel] = useState(null);
    const [currentPage, setCurrentPage] = useState(1)
    const [totalItems, setTotalItems] = useState(87);
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const filterButtonRef = useRef(null);
    const tooltipRef = useRef(null);
    const editionButtonRef = useRef(null);
    const editionTooltipRef = useRef(null);
    const chassisButtonRef = useRef(null);
    const chassisTooltipRef = useRef(null);
    const [sortColumn, setSortColumn] = useState('v_id'); // Default sort column
    const [sortOrder, setSortOrder] = useState('desc'); // Default sort order
    const [selectedProduct, setSelectedProduct] = useState(null);

    // const itemsPerPage = 10
    const router = useRouter();

    useEffect(() => {
        const fetchEditions = async () => {
            try {
                const response = await PackageService.Queries.getPackages({
                    _page: 1,
                    _perPage: 1000
                });
                if (response?.status === "success") {
                    setEditions(response?.data?.data);
                } else {
                    toast.error(response?.data?.message || "Failed to fetch editions");
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to fetch editions");
            }
        };
        fetchEditions();
    }, []);



    // const getPackages = async () => {
    //   try {
    //     setLoading(true);
    //     const response = await PackageService.Queries.getPackages({
    //       _page: 1,
    //       _perPage: 1000
    //     });
    //     setPackages(response?.data?.data);
    //     setLoading(false);
    //   } catch (error) {
    //     setLoading(false);
    //     toast.error(
    //       error.response?.data?.message || "Failed to fetch data types"
    //     );
    //   }
    // };


    // console.log("user mode:::", user?.user_mode);


    const getProducts = async (newCodeQuery = codeQuery, newEditionQuery = editionQuery, newChassisQuery = chassisQuery) => {
        try {

            const userData = localStorage.getItem("user");
            const userInfo = userData && JSON.parse(userData);
            const user = JSON.parse(userInfo);


            console.log("user mode:::", user);



            setLoading(true);
            const params = {
                _page: currentPage,
                _perPage: itemsPerPage,
                _order: 'desc',
                _orderBy: 'v_id',
                _status: 'active',
            };

            // Only set _user_id if user.mode is not 'pbl'
            if (user?.user_mode === 'user' || user?.user_mode === 'partner') {
                params._user_id = user?.id;
            }

            if (query) {
                params._name = query;
            }

            if (newCodeQuery) {
                params._code = newCodeQuery;
            }

            if (newEditionQuery) {
                params._edition_id = newEditionQuery;
            }

            if (newChassisQuery) {
                params._chassis = newChassisQuery;
            }

            const response = await GeneralProductService.Queries.getGeneralProducts(params);

            if (response?.status == "success") {
                setTotalItems(response?.data?.total)
                setProducts(response?.data?.data)
                setLoading(false);
            } else {
                setLoading(false);
                toast.error(response?.data?.message || "Failed to fetch products");
            }

        } catch (error) {
            setLoading(false);
            toast.error(
                error.response?.data?.message || "Failed to fetch data types"
            );
        }
    }

    const fetchSearchResults = (value) => {
        // getModels(value);
    };

    const handleAdd = async () => {
        router.push("/dashboard/products/general-product/create/");
    }

    const handleEdit = async (id) => {
        router.push(`/dashboard/products/general-product/edit/${id}`);
    }

    const handlePriceHistory = async (item) => {
        setSelectedProduct(item);
        setOpen(true);
    }

    useEffect(() => {
        getProducts(undefined, undefined, undefined);
    }, [currentPage, itemsPerPage, query, sortColumn, sortOrder]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if the click is inside any of the filter buttons
            const isClickInsideFilterButton =
                (filterButtonRef.current && filterButtonRef.current.contains(event.target)) ||
                (editionButtonRef.current && editionButtonRef.current.contains(event.target)) ||
                (chassisButtonRef.current && chassisButtonRef.current.contains(event.target));

            // Check if the click is inside any of the tooltips
            const isClickInsideTooltip =
                (tooltipRef.current && tooltipRef.current.contains(event.target)) ||
                (editionTooltipRef.current && editionTooltipRef.current.contains(event.target)) ||
                (chassisTooltipRef.current && chassisTooltipRef.current.contains(event.target));

            // Check if the click is inside any react-select component (including its control and menu)
            const isClickInsideReactSelect = event.target.closest('.react-select');

            if (!isClickInsideFilterButton && !isClickInsideTooltip && !isClickInsideReactSelect) {
                setShowCodeSearch(false);
                setShowEditionSearch(false);
                setShowChassisSearch(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [tooltipRef, filterButtonRef, editionTooltipRef, editionButtonRef, chassisTooltipRef, chassisButtonRef]);


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
                const response = await GeneralProductService.Commands.updateGeneralProduct(id, {
                    p_status: "inactive",
                    _method: 'PUT'
                });

                // console.log("response:::", response);

                if (response) {
                    setProducts(prevProducts => prevProducts.filter(product => product.p_id !== id));
                    Swal.fire({
                        title: "Deleted!",
                        text: "Product deleted successfully!",
                        icon: "success"
                    });
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

    return (
        <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
            <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                    <h2 className="text-xl text-gray-800">General Product List</h2>
                    <Button
                        onClick={handleAdd}
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
                        Add Product
                    </Button>
                </div>

                {/* Search Filter */}
                <TableFilter query={query} setQuery={setQuery} setCurrentPage={setCurrentPage} fetchSearchResults={fetchSearchResults} itemsPerPage={itemsPerPage} setItemsPerPage={setItemsPerPage} placeholder="Search..." />


                {/* Table Container */}
                <div className="overflow-x-auto overflow-y-auto rounded-md border border-gray-300 mt-4">
                    <Table className="min-w-full">
                        <TableHeader>
                            <TableRow className="border-b border-gray-300">
                                <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>
                                {/* <TableHead className="border-r border-gray-300 cursor-pointer" onClick={() => handleSort('v_title')}> */}
                                <TableHead className="border-r border-gray-300">
                                    <div className="flex items-center">
                                        Name
                                    </div>
                                </TableHead>
                                <TableHead className="border-r border-gray-300">
                                    <div className="flex items-center">
                                        Brand
                                    </div>
                                </TableHead>
                                

                                <TableHead className="border-r border-gray-300">
                                    <div className="flex items-center">
                                        Category
                                    </div>
                                </TableHead>


                                <TableHead className="border-r border-gray-300 relative">
                                    <div className="flex items-center justify-between relative">
                                        <span>Code</span>

                                        <div className="relative">
                                            <button
                                                onClick={() => { setShowCodeSearch(!showCodeSearch); setShowEditionSearch(false); }}
                                                className="ml-2 focus:outline-none"
                                                ref={filterButtonRef}
                                            >
                                                <Funnel className={`w-4 h-4 ${codeQuery ? 'text-orange-500' : ''}`} />
                                            </button>

                                            {/* Arrow Up when search box is visible */}
                                            {showCodeSearch && (
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                                            )}
                                        </div>
                                    </div>
                                    {showCodeSearch && (
                                        <div className="relative" ref={tooltipRef}>
                                            {/* Arrow Up */}
                                            <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />

                                            {/* Search Box */}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                                                <div className="flex items-center w-full mb-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Search by Code"
                                                        className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                                        value={codeQuery}
                                                        onChange={(e) => setCodeQuery(e.target.value)}
                                                    />
                                                    {codeQuery && (
                                                        <button
                                                            onClick={() => {
                                                                setCodeQuery('');
                                                                getProducts('', undefined);
                                                                setShowCodeSearch(false);
                                                            }}
                                                            className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => getProducts(codeQuery, undefined)}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </TableHead>

                                <TableHead className="border-r border-gray-300">
                                    <div className="flex items-center">
                                        Status
                                    </div>
                                </TableHead>
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
                            {!loading && products?.length > 0 ? (
                                products.map((item, index) => (
                                    <TableRow key={item.id || index} className="border-b border-gray-200">
                                        <TableCell className="border-r border-gray-200 text-center py-4">{index + 1}</TableCell>
                                        <TableCell className="border-r border-gray-200 font-medium py-4">{item?.p_name}</TableCell>
                                        <TableCell className="border-r border-gray-200 font-medium py-4">{item?.brand?.md_title}</TableCell>
                                        
                                        <TableCell className="border-r border-gray-200 font-medium py-4">{item?.category?.c_name}</TableCell>
                                        
                                        <TableCell className="border-r border-gray-200 font-medium py-4">{item?.p_code}</TableCell>
                                        <TableCell className="border-r border-gray-200 font-medium py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded-full font-semibold ${item.p_status === 'active'
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.p_status === 'active' ? "Active" : "Inactive"}
                                            </span>
                                        </TableCell>

                                        <TableCell className="flex justify-end gap-2 border-r border-gray-200 font-medium py-4">

                                            {/* <button
                                                onClick={() => handlePriceHistory(item)}
                                                className="text-blue-600 hover:text-blue-800"
                                                aria-label={`Price History`}
                                            >
                                                <DollarSign size={18} />
                                            </button> */}

                                            <button
                                                onClick={() => handleEdit(item.p_id)}
                                                className="text-blue-600 hover:text-blue-800"
                                                aria-label={`Edit shop ${item.p_name}`}
                                            >
                                                <Pencil size={18} />
                                            </button>

                                            <button
                                                onClick={() => handleDelete(item?.p_id)}
                                                className="text-red-600 hover:text-red-800"
                                                aria-label={`Delete shop ${item.p_name}`}
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={11} className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[600px] text-center py-4 text-gray-500">
                                        {loading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                                                <span className="text-gray-500 font-semibold ">Loading...</span>
                                            </div>
                                        ) : (
                                            <div> No Product found.</div>
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
            {/* <PriceHistoryModal
        open={open}
        setOpen={setOpen}
        selectedProduct={selectedProduct}
      /> */}
        </div>
    );
};

export default ProductList;
