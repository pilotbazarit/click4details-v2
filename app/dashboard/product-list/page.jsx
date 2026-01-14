"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Loading from '@/components/Loading';
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import ShopModal from "@/components/modals/ShopModal";
import StoreService from "@/services/ShopService";
import { DollarSign, Funnel, Loader2, Pencil, Trash2, Settings, Eye } from "lucide-react";
import Select from 'react-select';
import constData from "@/lib/constant";
import api from "@/lib/api";
import ColumnVisibilityToggle from "@/components/ColumnVisibilityToggle";

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
import UserService from "@/services/UserService";
import { useRouter } from "next/navigation";
import PackageService from "@/services/PackageService";
import PriceHistoryModal from "@/components/modals/PriceHistoryModal";
import PricePreviewModal from "@/components/modals/PricePreviewModal";
import { set } from "lodash";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";
import ShopService from "@/services/ShopService";

const ProductList = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("")
  const [codeQuery, setCodeQuery] = useState("");
  const [showCodeSearch, setShowCodeSearch] = useState(false);
  const [editionQuery, setEditionQuery] = useState("");
  const [showEditionSearch, setShowEditionSearch] = useState(false);
  const [chassisQuery, setChassisQuery] = useState("");
  const [showChassisSearch, setShowChassisSearch] = useState(false);
  const [priorityQuery, setPriorityQuery] = useState("");
  const [showPrioritySearch, setShowPrioritySearch] = useState(false);
  const [ownerQuery, setOwnerQuery] = useState("");
  const [showOwnerSearch, setShowOwnerSearch] = useState(false);
  const [brands, setBrands] = useState("");
  const [editions, setEditions] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [pricePreviewOpen, setPricePreviewOpen] = useState(false);
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
  const priorityButtonRef = useRef(null);
  const priorityTooltipRef = useRef(null);
  const ownerButtonRef = useRef(null);
  const ownerTooltipRef = useRef(null);
  const [sortColumn, setSortColumn] = useState('v_id'); // Default sort column
  const [sortOrder, setSortOrder] = useState('ASC'); // Default sort order
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pricePreviewProduct, setPricePreviewProduct] = useState(null);
  const [selectedShop, setSelectedShop] = useState("my-shop");
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['sl', 'name', 'brand', 'model', 'capacity', 'chassis', 'color', 'price', 'fixed-price', 'condition', 'owner', 'availability', 'priority', 'package', 'code', 'status', 'actions']);

  const {  permissionList } = useAppContext();
  const [shopData, setShopData] = useState([]);
  const [user, setUser] = useState(null);
  // const itemsPerPage = 10
  const router = useRouter();

  const columns = [
    { key: 'sl', label: 'SL' },
    { key: 'name', label: 'Name' },
    { key: 'brand', label: 'Brand' },
    { key: 'model', label: 'Model' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'chassis', label: 'Chassis No' },
    { key: 'color', label: 'Color' },
    { key: 'price', label: 'Price' },
    { key: 'fixed-price', label: 'Fixed Price' },
    { key: 'condition', label: 'Condition' },
    { key: 'owner', label: 'Owner' },
    { key: 'availability', label: 'Availability' },
    { key: 'priority', label: 'Priority' },
    { key: 'package', label: 'Package' },
    { key: 'code', label: 'Code' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const isColumnVisible = (columnKey) => visibleColumns.includes(columnKey);


  // console.log("=====================", permissionList);

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

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await UserService.Queries.getUsers({
          _page: 1,
          _perPage: 1000
        });
        if (response?.status === "success") {
          setUsers(response?.data?.data);
        } else {
          toast.error(response?.data?.message || "Failed to fetch users");
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch users");
      }
    };
    fetchUsers();
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


  // console.log("priorityQuery", priorityQuery);





  const getProducts = async (newCodeQuery = codeQuery, newEditionQuery = editionQuery, newChassisQuery = chassisQuery, newPriorityQuery = priorityQuery, newOwnerQuery = ownerQuery, searchQuery = query, shopId) => {
    try {

      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      const user = JSON.parse(userInfo);


      // console.log("user mode:::", user);



      setLoading(true);
      const params = {
        _page: currentPage,
        _perPage: itemsPerPage,
        _order: 'desc',
        _orderBy: 'v_id',
        _status: 'active',
      };

      const shopToFilter = shopId !== undefined ? shopId : selectedShop;

      if (shopToFilter) {
        if (shopToFilter === 'my-shop') {
          if (user?.user_mode === 'user' || user?.user_mode === 'partner') {
            params._user_id = user?.id;
          }
          // params._user_id = user?.id;
        } else {
          params['_shop_ids[0]'] = shopToFilter;
          delete params._user_id; // When filtering by a specific company shop, we don't want the default user filter
        }
      } else if (user?.user_mode === 'user' || user?.user_mode === 'partner') {
        // Default behavior if no shop is selected
        params._user_id = user?.id;
      }

      if (searchQuery) {
        params._title = searchQuery;
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

      if (newPriorityQuery) {
        params._orderBy = 'v_priority';

        params._order = newPriorityQuery;
      }

      if (newOwnerQuery) {
        params._user_id = newOwnerQuery;
      }


      // console.log("_priority_order", _priority_order);

      const response = await VehicleService.Queries.getVehiclesWithLogin(params);

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


  // console.log("query", query);

  const fetchSearchResults = () => {
    // This is called by TableFilter's debounced search
    // The query state is already updated, so we just need to trigger the API call
    // with all current filter values
    getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery);
  };

  const handleAdd = async () => {
    router.push("/dashboard/products/vehicle/create/");
  }

  const handleEdit = async (id) => {
    router.push(`/dashboard/products/vehicle/edit/${id}`);
  }

  const handlePriceHistory = async (item) => {
    setSelectedProduct(item);
    setOpen(true);
  }

  const handlePricePreview = (item) => {
    setPricePreviewProduct(item);
    setPricePreviewOpen(true);
  }

  useEffect(() => {
    getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery);
  }, [currentPage, itemsPerPage, sortColumn, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is inside any of the filter buttons
      const isClickInsideFilterButton =
        (filterButtonRef.current && filterButtonRef.current.contains(event.target)) ||
        (editionButtonRef.current && editionButtonRef.current.contains(event.target)) ||
        (chassisButtonRef.current && chassisButtonRef.current.contains(event.target)) ||
        (priorityButtonRef.current && priorityButtonRef.current.contains(event.target)) ||
        (ownerButtonRef.current && ownerButtonRef.current.contains(event.target));

      // Check if the click is inside any of the tooltips
      const isClickInsideTooltip =
        (tooltipRef.current && tooltipRef.current.contains(event.target)) ||
        (editionTooltipRef.current && editionTooltipRef.current.contains(event.target)) ||
        (chassisTooltipRef.current && chassisTooltipRef.current.contains(event.target)) ||
        (priorityTooltipRef.current && priorityTooltipRef.current.contains(event.target)) ||
        (ownerTooltipRef.current && ownerTooltipRef.current.contains(event.target));

      // Check if the click is inside any react-select component (including its control and menu)
      const isClickInsideReactSelect = event.target.closest('.react-select');

      if (!isClickInsideFilterButton && !isClickInsideTooltip && !isClickInsideReactSelect) {
        setShowCodeSearch(false);
        setShowEditionSearch(false);
        setShowChassisSearch(false);
        setShowPrioritySearch(false);
        setShowOwnerSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tooltipRef, filterButtonRef, editionTooltipRef, editionButtonRef, chassisTooltipRef, chassisButtonRef, priorityTooltipRef, priorityButtonRef, ownerTooltipRef, ownerButtonRef]);


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
        const response = await VehicleService.Commands.individualVehicleUpdate(id, {
          v_status: "inactive",
          _method: 'PUT'
        });

        // console.log("response:::", response);

        if (response) {
          setProducts(prevProducts => prevProducts.filter(product => product.v_id !== id));
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



  // shop data get from api
  const getShopData = async () => {
    try {
      const userData = localStorage.getItem("user");
      const userInfo = userData && JSON.parse(userData);
      const user = JSON.parse(userInfo);


      // Build request params conditionally
      const params = {
        order: "desc",
        orderBy: "md_id",
        _page: 1,
        _perPage: 1000,
        ...(user?.user_mode !== "admin" && { _user_id: user?.id }),
        // _user_id: user?.id,
        // ...(user.user_mode !== "pbl" && user.user_mode !== "supreme" && { _user_id: user?.id })
      };

      const response = await ShopService.Queries.getShops(params);

      const shopOptions = response.data.data.map((shop) => ({
        value: shop.s_id,
        label: shop.s_title,
      }));

      setShopData((prevShopData) => {
        const newShops = shopOptions.filter(
          (newShop) => !prevShopData.find((s) => s.value === newShop.value)
        );
        return [...prevShopData, ...newShops];
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    }
  };


  useEffect(() => {

    const userData = localStorage.getItem("user");
    const userInfo = userData && JSON.parse(userData);
    if (userInfo) {
      setUser(JSON.parse(userInfo));
    }

    // getShopData();
  }, []);



  const fetchCompanyShops = useCallback(async () => {
    try {
      const response = await ShopService.Queries.getCompanyShops(user?.id);

      if (response.status == 'success') {
        let shopArrayData = [];

        response?.data.forEach((item) => {
          if (item.shop) {
            // console.log("item.shop.s_id:", item.shop.s_id);
            // console.log("permissionList:", permissionList);

            let companyShopId = item.shop.s_id;
            let priceAction = "Create"

            const hasCreatePermission = hasPermission(permissionList, companyShopId, "Vehicle", priceAction);

            // console.log("hasCreatePermission:", hasCreatePermission);
            if (hasCreatePermission) {
              shopArrayData.push({
                value: item.shop.s_id,
                label: item.shop.s_title,
              });
            }

          }
        });


        setShopData((prevShopData) => {
          const newShops = shopArrayData.filter(
            (newShop) => !prevShopData.find((s) => s.value === newShop.value)
          );

          const finalData = [...prevShopData, ...newShops];

          return finalData;
        });
        // setCompanyShops(response?.data);
      }
    } catch (error) {
      console.log("Error fetching shops:", error);
    }
  }, [user?.id]);


 
  // console.log("user", user);


  useEffect(() => {
    if (user?.id) {
      fetchCompanyShops();
    }
  }, [user?.id, fetchCompanyShops]);


   console.log("ssetSelectedShophopData", selectedShop);



  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">Product List</h2>

          <div className="flex flex-col gap-1.5 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2 shadow-sm">
            <label
              htmlFor="status-filter"
              className="text-xs font-semibold uppercase tracking-wide text-gray-600"
            >
              Company Shop
            </label>
            <select
              id="status-filter"
              className="h-10 min-w-[220px] rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedShop}
              onChange={(e) => {
                const newShopId = e.target.value;
                setSelectedShop(newShopId);
                setCurrentPage(1);
                getProducts(
                  codeQuery,
                  editionQuery,
                  chassisQuery,
                  priorityQuery,
                  ownerQuery,
                  query,
                  newShopId
                );
              }}
            >
              <option value="">Select Company Shop</option>
              <option value="my-shop">My Shop</option>
              {shopData.map((shop) => (
                <option key={shop.value} value={shop.value}>{shop.label}</option>
              ))}
            </select>
          </div>

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
        <TableFilter
          query={query}
          setQuery={setQuery}
          setCurrentPage={setCurrentPage}
          fetchSearchResults={fetchSearchResults}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          placeholder="Search..."
          onClearSearch={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, '')}
        />


        {/* Table Container */}
        <div className="overflow-x-auto overflow-y-auto rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                {isColumnVisible('sl') && <TableHead className="w-[60px] border-r border-gray-300 text-center">SL</TableHead>}
                {isColumnVisible('name') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Name
                    </div>
                  </TableHead>
                )}
                {isColumnVisible('brand') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Brand
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('model') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Model
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('capacity') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Capacity
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('chassis') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Chassis No</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowChassisSearch(!showChassisSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={chassisButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${chassisQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {/* Arrow Up when search box is visible */}
                        {showChassisSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showChassisSearch && (
                      <div className="relative" ref={chassisTooltipRef}>
                        {/* Arrow Up */}
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />

                        {/* Search Box */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <input
                              type="text"
                              placeholder="Search by Chassis No"
                              className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                              value={chassisQuery}
                              onChange={(e) => setChassisQuery(e.target.value)}
                            />
                            {chassisQuery && (
                              <button
                                onClick={() => {
                                  setChassisQuery('');
                                  getProducts(codeQuery, editionQuery, '', priorityQuery, ownerQuery);
                                  setShowChassisSearch(false);
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
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}

                {isColumnVisible('color') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Color
                    </div>
                  </TableHead>
                )}


                {isColumnVisible('price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Price
                    </div>
                  </TableHead>
                )}


                
                {isColumnVisible('fixed-price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Fixed Price
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('condition') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Condition
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('owner') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Owner</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowOwnerSearch(!showOwnerSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowChassisSearch(false); setShowPrioritySearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={ownerButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${ownerQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {/* Arrow Up when search box is visible */}
                        {showOwnerSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showOwnerSearch && (
                      <div className="relative" ref={ownerTooltipRef}>
                        {/* Arrow Up */}
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                        {/* Search Box */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Owners' },
                                ...users.map(user => ({
                                  value: user.id,
                                  label: user.name
                                }))
                              ]}
                              value={users.find(option => option.id === ownerQuery) ? { value: ownerQuery, label: users.find(option => option.id === ownerQuery).name } : { value: '', label: 'All Owners' }}
                              onChange={(selectedOption) =>
                                setOwnerQuery(selectedOption ? selectedOption.value : '')
                              }
                              placeholder="Select Owner"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {ownerQuery && (
                              <button
                                onClick={() => {
                                  setOwnerQuery('');
                                  getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, '');
                                  setShowOwnerSearch(false);
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
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}


                {isColumnVisible('availability') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Availability
                    </div>
                  </TableHead>
                )}


                {isColumnVisible('priority') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Priority</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowPrioritySearch(!showPrioritySearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowChassisSearch(false); setShowOwnerSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={priorityButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${priorityQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {/* Arrow Up when search box is visible */}
                        {showPrioritySearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showPrioritySearch && (
                    <div className="relative" ref={priorityTooltipRef}>
                      {/* Arrow Up */}
                      <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                      {/* Search Box */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                        <div className="flex items-center w-full mb-2">
                          <Select
                            options={[
                              { value: '', label: 'All Priority' },
                              { value: 'ASC', label: 'Ascending' },
                              { value: 'DESC', label: 'Descending' }
                            ]}
                            value={priorityQuery ? { value: priorityQuery, label: priorityQuery === 'ASC' ? 'Ascending' : 'Descending' } : { value: '', label: 'All Priority' }}
                            onChange={(selectedOption) =>
                              setPriorityQuery(selectedOption ? selectedOption.value : '')
                            }
                            placeholder="Select Priority Order"
                            isClearable={true}
                            className="w-full text-sm"
                            classNamePrefix="react-select"
                          />

                          {priorityQuery && (
                            <button
                              onClick={() => {
                                setPriorityQuery('');
                                getProducts(codeQuery, editionQuery, chassisQuery, '', ownerQuery);
                                setShowPrioritySearch(false);
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
                          onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </TableHead>
                )}


                {isColumnVisible('package') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Package
                    </div>
                  </TableHead>
                )}



                {isColumnVisible('code') && (
                  <TableHead className="border-r border-gray-300 relative">
                  <div className="flex items-center justify-between relative">
                    <span>Code</span>

                    <div className="relative">
                      <button
                        onClick={() => { setShowCodeSearch(!showCodeSearch); setShowEditionSearch(false); setShowChassisSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); }}
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
                                getProducts('', editionQuery, chassisQuery, priorityQuery, ownerQuery);
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
                          onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </TableHead>
                )}

                {isColumnVisible('status') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Status
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('actions') && (
                  <TableHead className="text-right w-[10]">
                    <div className="flex justify-end items-center w-full">
                      <button
                        onClick={() => setShowColumnToggle(!showColumnToggle)}
                        className="text-gray-600 hover:text-gray-800 focus:outline-none"
                        title="Toggle columns"
                      >
                        <Settings size={20} />
                      </button>
                    </div>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && products?.length > 0 ? (
                products.map((item, index) => (
                  <TableRow key={item.id || index} className="border-b border-gray-200">
                    {isColumnVisible('sl') && <TableCell className="border-r border-gray-200 text-center py-4">{index + 1}</TableCell>}
                    {isColumnVisible('name') && (
                      <TableCell className="border-r border-gray-200 font-medium py-4">
                        <a className="text-blue-600" target="_blank" href={`/product/${item?.v_id}`}>{item?.v_title}</a>
                      </TableCell>
                    )}
                    {isColumnVisible('brand') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_brand_name}</TableCell>}
                    {isColumnVisible('model') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_model_name}</TableCell>}
                    {isColumnVisible('capacity') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_capacity}</TableCell>}
                    {isColumnVisible('chassis') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_chassis}</TableCell>}
                    {isColumnVisible('color') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_color_name}</TableCell>}
                    {isColumnVisible('price') && (
                      <TableCell className="border-r border-gray-200 font-medium py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handlePricePreview(item)}
                            className="text-gray-600 hover:text-blue-600"
                            aria-label="View price details"
                          >
                            <Eye size={18} />
                          </button>
                        </div>
                      </TableCell>
                    )}
                    {isColumnVisible('fixed-price') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_fixed_price}</TableCell>}
                    {isColumnVisible('condition') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_condition_name}</TableCell>}
                    {isColumnVisible('owner') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_shop_user_name}</TableCell>}
                    {isColumnVisible('availability') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_availability_name}</TableCell>}
                    {isColumnVisible('priority') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_priority}</TableCell>}
                    {isColumnVisible('package') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_edition_name}</TableCell>}
                    {isColumnVisible('code') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_code}</TableCell>}
                    {isColumnVisible('status') && (
                      <TableCell className="border-r border-gray-200 font-medium py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-semibold ${item.v_status === 'active'
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {item.v_status === 'active' ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    )}
                    {isColumnVisible('actions') && (
                      <TableCell className="flex justify-end gap-2 border-r border-gray-200 font-medium py-4">

                        <button
                          onClick={() => handlePriceHistory(item)}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label={`Price History`}
                        >
                          <DollarSign size={18} />
                        </button>

                        {/* {(() => {
                          const companyShopId = item?.v_shop_id;
                          const priceAction = "Update";
                          const hasCreatePermission = hasPermission(permissionList, companyShopId, "Vehicle", priceAction);

                          if (!hasCreatePermission) return null;

                          return (
                            <button
                              onClick={() => handleEdit(item.v_id)}
                              className="text-blue-600 hover:text-blue-800"
                              aria-label={`Edit shop ${item.s_title}`}
                            >
                              <Pencil size={18} />
                            </button>
                          );
                        })()} */}


                        <button
                          onClick={() => handleEdit(item.v_id)}
                          className="text-blue-600 hover:text-blue-800"
                          aria-label={`Edit shop ${item.s_title}`}
                        >
                        <Pencil size={18} />
                      </button>

                        <button
                          // Add delete handler here
                          onClick={() => handleDelete(item?.v_id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Delete shop ${item.s_title}`}
                        >
                          <Trash2 size={21} />
                        </button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={15} className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[600px] text-center py-4 text-gray-500">
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
      <PriceHistoryModal
        open={open}
        setOpen={setOpen}
        selectedProduct={selectedProduct}
      // brands={brands}
      // getModels={getModels}
      // initialData={selectedModel}
      />

      <PricePreviewModal
        open={pricePreviewOpen}
        setOpen={setPricePreviewOpen}
        selectedProduct={pricePreviewProduct}
      />

      {/* Column Visibility Toggle Modal */}
      {showColumnToggle && (
        <ColumnVisibilityToggle
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnsChange={setVisibleColumns}
          onClose={() => setShowColumnToggle(false)}
        />
      )}
    </div>
  );
};

export default ProductList;
