"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import Loading from '@/components/Loading';
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import ShopModal from "@/components/modals/ShopModal";
import StoreService from "@/services/ShopService";
import { DollarSign, Funnel, Loader2, Pencil, Trash2, Settings, Eye, Download, Printer, Calculator, Check, X } from "lucide-react";
import Select from 'react-select';
import constData from "@/lib/constant";
import ColumnVisibilityToggle from "@/components/ColumnVisibilityToggle";
import { API_URL } from "@/helpers/apiUrl";

{/* <Download /> */ }

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
import VehicleModelService from "@/services/VehicleModelService";
import VehicleService from "@/services/VehicleService";
import UserService from "@/services/UserService";
import { useRouter } from "next/navigation";
import PackageService from "@/services/PackageService";
import PriceHistoryModal from "@/components/modals/PriceHistoryModal";
import PricePreviewModal from "@/components/modals/PricePreviewModal";
import VehicleListPdfDownloadModal from "@/components/modals/VehicleListPdfDownloadModal";
import { set } from "lodash";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";
import ShopService from "@/services/ShopService";

import { parseStoredUser } from "@/lib/parseStoredUser";

const ProductList = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("")
  const [codeQuery, setCodeQuery] = useState("");
  const [showCodeSearch, setShowCodeSearch] = useState(false);
  const [editionQuery, setEditionQuery] = useState("");
  const [showEditionSearch, setShowEditionSearch] = useState(false);
  const [shopFilterId, setShopFilterId] = useState(null);
  const [showShopSearch, setShowShopSearch] = useState(false);
  const [chassisQuery, setChassisQuery] = useState("");
  const [showChassisSearch, setShowChassisSearch] = useState(false);
  const [createdAtQuery, setCreatedAtQuery] = useState("");
  const [showCreatedAtSearch, setShowCreatedAtSearch] = useState(false);
  const [priorityQuery, setPriorityQuery] = useState("");
  const [showPrioritySearch, setShowPrioritySearch] = useState(false);
  const [ownerQuery, setOwnerQuery] = useState("");
  const [showOwnerSearch, setShowOwnerSearch] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");
  const [showBrandSearch, setShowBrandSearch] = useState(false);
  const [modelQuery, setModelQuery] = useState("");
  const [showModelSearch, setShowModelSearch] = useState(false);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
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
  const createdAtButtonRef = useRef(null);
  const createdAtTooltipRef = useRef(null);
  const priorityButtonRef = useRef(null);
  const priorityTooltipRef = useRef(null);
  const ownerButtonRef = useRef(null);
  const ownerTooltipRef = useRef(null);
  const brandButtonRef = useRef(null);
  const brandTooltipRef = useRef(null);
  const modelButtonRef = useRef(null);
  const modelTooltipRef = useRef(null);
  const shopButtonRef = useRef(null);
  const shopTooltipRef = useRef(null);
  const tableRef = useRef(null);
  const topScrollbarRef = useRef(null);
  const [sortColumn, setSortColumn] = useState('v_id'); // Default sort column
  const [sortOrder, setSortOrder] = useState('ASC'); // Default sort order
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [pricePreviewProduct, setPricePreviewProduct] = useState(null);
  const [selectedShop, setSelectedShop] = useState("my-shop");
  const [showColumnToggle, setShowColumnToggle] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState(['sl', 'name', 'brand', 'model', 'package', 'shop', 'chassis', 'color', 'costing-price', 'b2b-price', 'asking-price', 'fixed-price', 'condition', 'availability', 'code', 'actions']);
  const availabilityStatusOptions = [
    { value: "available", label: "Available" },
    { value: "sold", label: "Sold" },
    { value: "booked", label: "Booked" },
    { value: "hold", label: "Hold" },
  ];
  const normalizeAvailabilityStatus = (status) => {
    const value = String(status || "").toLowerCase();
    const isValidStatus = availabilityStatusOptions.some((option) => option.value === value);
    return isValidStatus ? value : "available";
  };
  const getAvailabilityStatusLabel = (status) => (
    availabilityStatusOptions.find((option) => option.value === String(status || "").toLowerCase())?.label || "-"
  );


  const [editingFixedPriceId, setEditingFixedPriceId] = useState(null);
  const [editingFixedPriceValue, setEditingFixedPriceValue] = useState("");
  const [savingFixedPriceId, setSavingFixedPriceId] = useState(null);
  const [editingPurchasePriceId, setEditingPurchasePriceId] = useState(null);
  const [editingPurchasePriceValue, setEditingPurchasePriceValue] = useState("");
  const [savingPurchasePriceId, setSavingPurchasePriceId] = useState(null);
  const [editingB2BPriceId, setEditingB2BPriceId] = useState(null);
  const [editingB2BPriceValue, setEditingB2BPriceValue] = useState("");
  const [savingB2BPriceId, setSavingB2BPriceId] = useState(null);
  const [editingAskingPriceId, setEditingAskingPriceId] = useState(null);
  const [editingAskingPriceValue, setEditingAskingPriceValue] = useState("");
  const [savingAskingPriceId, setSavingAskingPriceId] = useState(null);
  const [editingAvailabilityStatusId, setEditingAvailabilityStatusId] = useState(null);
  const [editingAvailabilityStatusValue, setEditingAvailabilityStatusValue] = useState("available");
  const [savingAvailabilityStatusId, setSavingAvailabilityStatusId] = useState(null);
  const [editingCostingPriceId, setEditingCostingPriceId] = useState(null);
  const [editingCostingPriceValue, setEditingCostingPriceValue] = useState("");
  const [savingCostingPriceId, setSavingCostingPriceId] = useState(null);



  const [topScrollbarMetrics, setTopScrollbarMetrics] = useState({ contentWidth: 0, viewportWidth: 0 });

  const { permissionList } = useAppContext();
  const [shopData, setShopData] = useState([]);
  const [user, setUser] = useState(null);
  // const itemsPerPage = 10
  const router = useRouter();

  // console.log("selectedShop", selectedShop);
  // console.log("permissionList", permissionList);

  const [updateFixedPricePermission, setUpdateFixedPricePermission] = useState(true);
  const [updateCostingPricePermission, setUpdateCostingPricePermission] = useState(true);
  const [updateAskingPricePermission, setUpdateAskingPricePermission] = useState(true);
  const [updatePurchasePricePermission, setUpdatePurchasePricePermission] = useState(true);
  const [updateAvailabilityStatusPermission, setUpdateAvailabilityStatusPermission] = useState(true);


  const [updateVariablePricePermission, setUpdateVariablePricePermission] = useState(true);
  const [updateProductPricePermission, setUpdateProductPricePermission] = useState(true);
  // const [updateProductPermission, setUpdateProductPermission] = useState(true);
  const [companyShops, setCompanyShops] = useState([]);
  const [allShop, setAllShop] = useState([]);
  const [isVehicleListPdfModalOpen, setIsVehicleListPdfModalOpen] = useState(false);
  const [isVehicleListPdfDownloading, setIsVehicleListPdfDownloading] = useState(false);

  const canViewPriceColumn = user?.user_mode === "supreme" || user?.user_mode === "admin";

  const canShowAddProductButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "ShowProductAddButton");

  const canShowVehicleListPdfButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "ShowVehicleListPdfButton");
  
  const canShowPriceCalculatorButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "PriceCalculatorButtonShow");

  const canShowPriceHistoryButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "PriceHistoryButtonShow");

  const canShowDownloadPriceDocumentButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "DownloadPriceDocumentButtonShow");

  const canEditButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "EditButtonShow");

  const canDeleteButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "DeleteButtonShow");

  const canUpdateB2BPrice =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "B2bPriceUpdate");

  const canUpdateFixedPrice =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "FixedPriceUpdate");

  const canUpdateAskingPrice =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "AskingPriceUpdate");

  
  const canUpdatePurchasePrice =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "PurchasePriceUpdate");

  const canUpdateAvailabilityStatus =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "Vehicle", "UpdateAvailabilityStatus");

  const canAllShopView = (targetUser = user) => {
    if (!targetUser) return false;
    return (
      (targetUser?.user_mode !== "pbl" && targetUser?.user_mode !== "admin") ||
      hasPermission(permissionList, 0, "Vehicle", "AllShopView")
    );
  };

  const updateTopScrollbarMetrics = useCallback(() => {
    const tableElement = tableRef.current;
    const scrollContainer = tableElement?.parentElement;

    if (!tableElement || !scrollContainer) {
      return;
    }

    const nextMetrics = {
      contentWidth: tableElement.scrollWidth,
      viewportWidth: scrollContainer.clientWidth,
    };

    setTopScrollbarMetrics((prevMetrics) => (
      prevMetrics.contentWidth === nextMetrics.contentWidth &&
        prevMetrics.viewportWidth === nextMetrics.viewportWidth
        ? prevMetrics
        : nextMetrics
    ));

    if (topScrollbarRef.current && topScrollbarRef.current.scrollLeft !== scrollContainer.scrollLeft) {
      topScrollbarRef.current.scrollLeft = scrollContainer.scrollLeft;
    }
  }, []);

  const hasTopScrollbar = topScrollbarMetrics.contentWidth > topScrollbarMetrics.viewportWidth;


  // console.log("user---------", user)

  useEffect(() => {

    // console.log("----------------permissionList------------------", permissionList);

    if (selectedShop !== "my-shop") {
      let companyShopId = selectedShop;
      // console.log("companyShopId", companyShopId);

      // let updateProductPriceAction = "Update"
      // const hasUpdateProductPricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateProductPriceAction);
      // if (hasUpdateProductPricePermission) {
      //   setUpdateProductPricePermission(hasUpdateProductPricePermission);
      // } else {
      //   setUpdateProductPricePermission(false);
      // }



      // let updateProductAction = "Update"
      // const hasUpdateProductPermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateProductAction);
      // if (hasUpdateProductPermission) {
      //   setUpdateProductPermission(hasUpdateProductPermission);
      // } else {
      //   setUpdateProductPermission(false);
      // }

      // -----------update fixed price-------------
      // let updateFixedPriceAction = "UpdateFixedPrice"
      // const hasUpdateFixedPricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateFixedPriceAction);
      // if (hasUpdateFixedPricePermission) {
      //   setUpdateFixedPricePermission(hasUpdateFixedPricePermission);
      // } else {
      //   setUpdateFixedPricePermission(false);
      // }


      // let updateCostingPriceAction = "UpdateCostingPrice"
      // const hasUpdateCostingPricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateCostingPriceAction);
      // if (hasUpdateCostingPricePermission) {
      //   setUpdateCostingPricePermission(hasUpdateCostingPricePermission);
      // } else {
      //   setUpdateCostingPricePermission(false);
      // }



      // let updateAskingPriceAction = "UpdateAskingPrice"
      // const hasUpdateAskingPricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateAskingPriceAction);
      // if (hasUpdateAskingPricePermission) {
      //   setUpdateAskingPricePermission(hasUpdateAskingPricePermission);
      // } else {
      //   setUpdateAskingPricePermission(false);
      // }

      // UpdatePurchasePrice
      // let updatePurchasePriceAction = "UpdatePurchasePrice"
      // const hasUpdatePurchasePricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updatePurchasePriceAction);
      // if (hasUpdatePurchasePricePermission) {
      //   setUpdatePurchasePricePermission(hasUpdatePurchasePricePermission);
      // } else {
      //   setUpdatePurchasePricePermission(false);
      // }

      // let updateAvailabilityStatusAction = "ChangeSold/Booked"
      // const hasUpdateAvailabilityStatusPermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateAvailabilityStatusAction);
      // if (hasUpdateAvailabilityStatusPermission) {
      //   setUpdateAvailabilityStatusPermission(hasUpdateAvailabilityStatusPermission);
      // } else {
      //   setUpdateAvailabilityStatusPermission(false);
      // }

      // -----------------


      // let updateVariablePriceAction = "UpdateVariablePrice"
      // const hasUpdateVariablePricePermission = hasPermission(permissionList, Number(companyShopId), "Vehicle", updateVariablePriceAction);
      // if (hasUpdateVariablePricePermission) {
      //   setUpdateVariablePricePermission(hasUpdateVariablePricePermission);
      // } else {
      //   setUpdateVariablePricePermission(false);
      // }


    } else {
      // setUpdateProductPermission(true);
      // setUpdateVariablePricePermission(true);
      // setUpdateCostingPricePermission(true);
      // setUpdateAskingPricePermission(true);
      // setUpdateAvailabilityStatusPermission(true);
      // setUpdateVariablePricePermission(true);
    }

  }, [permissionList, selectedShop]);

  useEffect(() => {
    updateTopScrollbarMetrics();
  }, [updateTopScrollbarMetrics, visibleColumns, products, loading]);

  useEffect(() => {
    const tableElement = tableRef.current;
    const topScrollbar = topScrollbarRef.current;
    const scrollContainer = tableElement?.parentElement;

    if (!topScrollbar || !scrollContainer) {
      return;
    }

    let syncingFromTop = false;
    let syncingFromBottom = false;

    const handleTopScroll = () => {
      if (syncingFromBottom) {
        syncingFromBottom = false;
        return;
      }

      syncingFromTop = true;
      scrollContainer.scrollLeft = topScrollbar.scrollLeft;
    };

    const handleBottomScroll = () => {
      if (syncingFromTop) {
        syncingFromTop = false;
        return;
      }

      syncingFromBottom = true;
      topScrollbar.scrollLeft = scrollContainer.scrollLeft;
    };

    topScrollbar.addEventListener("scroll", handleTopScroll, { passive: true });
    scrollContainer.addEventListener("scroll", handleBottomScroll, { passive: true });
    handleBottomScroll();

    return () => {
      topScrollbar.removeEventListener("scroll", handleTopScroll);
      scrollContainer.removeEventListener("scroll", handleBottomScroll);
    };
  }, [hasTopScrollbar]);

  useEffect(() => {
    const tableElement = tableRef.current;
    const scrollContainer = tableElement?.parentElement;

    if (!tableElement || !scrollContainer || typeof ResizeObserver === "undefined") {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateTopScrollbarMetrics();
    });

    resizeObserver.observe(tableElement);
    resizeObserver.observe(scrollContainer);

    return () => {
      resizeObserver.disconnect();
    };
  }, [updateTopScrollbarMetrics]);


  const columns = [
    { key: 'sl', label: 'SL' },
    { key: 'name', label: 'Name' },
    { key: 'brand', label: 'Brand' },
    { key: 'model', label: 'Model' },
    { key: 'model-year', label: 'Model Year' },
    { key: 'registration-year', label: 'Registration Year' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'created-at', label: 'created-at' },
    { key: 'package', label: 'Package' },
    { key: 'shop', label: 'Shop' },
    { key: 'chassis', label: 'Chassis No' },
    { key: 'color', label: 'Color' },
    { key: 'price', label: 'Price' },
    { key: 'costing-price', label: 'Costing Price' },
    { key: 'asking-price', label: 'Asking Price' },
    { key: 'fixed-price', label: 'Fixed Price' },
    { key: 'purchase-price', label: 'Purchase Price' },
    { key: 'b2b-price', label: 'B2B Price' },
    { key: 'condition', label: 'Condition' },
    { key: 'location', label: 'Location' },
    { key: 'outlet', label: 'Outlet' },
    { key: 'owner', label: 'Owner' },
    { key: 'availability', label: 'Availability' },
    { key: 'grade', label: 'Grade' },
    { key: 'milage', label: 'Milage' },
    { key: 'fuel', label: 'Fuel' },
    { key: 'priority', label: 'Priority' },
    { key: 'code', label: 'Code' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  const isColumnVisible = (columnKey) => visibleColumns.includes(columnKey);

  const printableColumnKeys = Array.from(new Set(visibleColumns)).filter(
    (columnKey) => columnKey !== "actions" && columnKey !== "price"
  );

  const formatPrintableValue = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    return String(value);
  };

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
      .format(date)
      .replace(/\bam\b/i, "AM")
      .replace(/\bpm\b/i, "PM");
  };

  const escapeHtml = (value) =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

  const getPrintableCellValue = (item, columnKey, index) => {
    const vehiclePrice = item?.vehicle_db_price || {};

    switch (columnKey) {
      case "sl":
        return index + 1;
      case "name":
        return item?.v_title;
      case "brand":
        return item?.v_brand_name;
      case "model":
        return item?.v_model_name;
      case "model-year":
        return item?.v_mod_year;
      case "registration-year":
        return item?.v_registration;
      case "capacity":
        return item?.v_capacity;
      case "created-at":
        return formatDateTime(item?.v_created_at ?? item?.created_at);
      case "package":
        return item?.v_edition_name;
      case "shop":
        return item?.v_shop_name;
      case "chassis":
        return item?.v_chassis;
      case "color":
        return item?.v_color_name;
      case "costing-price":
        return vehiclePrice?.vp_user_costing_price;
      case "asking-price":
        return vehiclePrice?.vp_user_asking_price;
      case "fixed-price":
        return vehiclePrice?.vp_user_fixed_price;
      case "purchase-price":
        return vehiclePrice?.vp_user_purchase_price;
      case "b2b-price":
        return vehiclePrice?.vp_user_to_pbl_price;
      case "condition":
        return item?.v_condition_name;
      case "location":
        return item?.v_location?.location_name;
      case "outlet":
        return item?.v_location?.uo_address;
      case "owner":
        return item?.v_shop_user_name;
      case "availability":
        return getAvailabilityStatusLabel(item?.v_availability_status);
      case "grade":
        return item?.v_grade_name;
      case "milage":
        return item?.v_mileage;
      case "fuel":
        return item?.v_fuel_name;
      case "priority":
        return item?.v_priority;
      case "code":
        return item?.v_code;
      case "status":
        return item?.v_status === "active" ? "Active" : "Inactive";
      default:
        return "";
    }
  };

  const resolveVehicleRow = (productSource) => (
    productSource?.data?.data ||
    productSource?.data ||
    productSource ||
    null
  );

  const mergeVehicleRowData = (currentRow, nextRow) => ({
    ...currentRow,
    ...nextRow,
    vehicle_price: {
      ...(currentRow?.vehicle_price || {}),
      ...(nextRow?.vehicle_price || {}),
    },
    vehicle_db_price: {
      ...(currentRow?.vehicle_db_price || {}),
      ...(nextRow?.vehicle_db_price || {}),
    },
  });

  const handlePricePreviewUpdated = (updatedProductSource) => {
    const updatedProduct = resolveVehicleRow(updatedProductSource);

    if (!updatedProduct?.v_id) {
      return;
    }

    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.v_id === updatedProduct.v_id
          ? mergeVehicleRowData(product, updatedProduct)
          : product
      )
    );

    setPricePreviewProduct((prevProduct) =>
      prevProduct?.v_id === updatedProduct.v_id
        ? mergeVehicleRowData(prevProduct, updatedProduct)
        : prevProduct
    );
  };

  const handlePrint = () => {
    if (!products?.length) {
      toast.error("No product data available to print.");
      return;
    }

    const printableColumns = printableColumnKeys
      .map((columnKey) => columns.find((column) => column.key === columnKey))
      .filter(Boolean);

    if (printableColumns.length === 0) {
      toast.error("No printable columns selected.");
      return;
    }

    const tableHeaderHtml = printableColumns
      .map((column) => `<th>${escapeHtml(column.label)}</th>`)
      .join("");

    const tableRowsHtml = products
      .map((item, index) => {
        const cells = printableColumns
          .map((column) => {
            const cellValue = formatPrintableValue(getPrintableCellValue(item, column.key, index));
            return `<td>${escapeHtml(cellValue)}</td>`;
          })
          .join("");

        return `<tr>${cells}</tr>`;
      })
      .join("");

    const printWindow = window.open("", "_blank", "width=1200,height=800");

    if (!printWindow) {
      toast.error("Unable to open print preview. Please allow pop-ups and try again.");
      return;
    }

    const printedAt = new Date().toLocaleString("en-BD", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Product List Print</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 24px;
              color: #111827;
            }
            h1 {
              margin: 0 0 8px;
              font-size: 24px;
            }
            p {
              margin: 0 0 16px;
              color: #4b5563;
              font-size: 14px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              table-layout: auto;
            }
            th, td {
              border: 1px solid #d1d5db;
              padding: 8px 10px;
              text-align: left;
              vertical-align: top;
              font-size: 12px;
              word-break: break-word;
            }
            th {
              background: #eff6ff;
              font-weight: 700;
            }
            @media print {
              body {
                margin: 12px;
              }
            }
          </style>
        </head>
        <body>
          <h1>Product List</h1>
          <p>Printed at: ${escapeHtml(printedAt)} | Total rows: ${products.length}</p>
          <table>
            <thead>
              <tr>${tableHeaderHtml}</tr>
            </thead>
            <tbody>
              ${tableRowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const getVehicleListPdfInitialShopValue = () => {
    if (shopFilterId !== null && shopFilterId !== undefined && shopFilterId !== "") {
      return String(shopFilterId);
    }

    if (
      selectedShop &&
      selectedShop !== "my-shop" &&
      selectedShop !== "company-shop"
    ) {
      return String(selectedShop);
    }

    return "__CURRENT__";
  };

  const buildVehicleListPdfScopeParams = (params, selectedPdfShopValue) => {
    if (selectedPdfShopValue && selectedPdfShopValue !== "__CURRENT__") {
      params.set("_shop_ids[0]", selectedPdfShopValue);
      return;
    }

    const scopedShopValue =
      shopFilterId !== null && shopFilterId !== undefined ? shopFilterId : selectedShop;

    if (!scopedShopValue) {
      if ((user?.user_mode === "user" || user?.user_mode === "partner") && user?.id) {
        params.set("_user_id", String(user.id));
      }
      return;
    }

    if (scopedShopValue === "my-shop") {
      if ((user?.user_mode === "user" || user?.user_mode === "partner") && user?.id) {
        params.set("_user_id", String(user.id));
      }
      return;
    }

    if (scopedShopValue === "company-shop") {
      companyShops.forEach((shop, index) => {
        const shopId = shop?.value ?? shop;
        if (shopId) {
          params.set(`_shop_ids[${index}]`, String(shopId));
        }
      });
      return;
    }

    params.set("_shop_ids[0]", String(scopedShopValue));
  };

  const handleOpenVehicleListPdfModal = async () => {
    setIsVehicleListPdfModalOpen(true);
    await handleShopData("");
  };

  const handleVehicleListPdfDownload = async ({ status, shopValue, columns }) => {
    if (!Array.isArray(columns) || columns.length === 0) {
      toast.error("Select at least one column.");
      return;
    }

    const toastId = "vehicle-list-pdf-download";

    try {
      setIsVehicleListPdfDownloading(true);
      toast.loading("Preparing vehicle list PDF...", { id: toastId });

      const params = new URLSearchParams();
      params.set("_page", String(currentPage));

      if (status) {
        params.set("_status", status);
      }

      buildVehicleListPdfScopeParams(params, shopValue);

      columns.forEach((columnKey) => {
        params.set(`column[${columnKey}]`, "1");
      });

      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}api/vehicle/list-pdf?${params.toString()}`, {
        method: "GET",
        headers: {
          Accept: "application/octet-stream, application/pdf, application/json",
          "X-Requested-With": "XMLHttpRequest",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to download vehicle list PDF";

        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        const downloadUrl = data?.url || data?.data?.url;

        if (!downloadUrl) {
          throw new Error(data?.message || "Download URL not found");
        }

        window.open(downloadUrl, "_blank", "noopener,noreferrer");
        toast.success("Vehicle list PDF is ready.", { id: toastId });
        setIsVehicleListPdfModalOpen(false);
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
      const fileName = fileNameMatch?.[1]
        ? decodeURIComponent(fileNameMatch[1])
        : `vehicle-list-page-${currentPage}.pdf`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Vehicle list PDF downloaded successfully.", { id: toastId });
      setIsVehicleListPdfModalOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to download vehicle list PDF", { id: toastId });
    } finally {
      setIsVehicleListPdfDownloading(false);
    }
  };


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

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandCode = constData.BRAND_MD_CODE;
        const response = await MasterDataService.Queries.getMasterDataByTypeCode(brandCode);
        const brandMasterData = response.data?.master_data || [];
        const brandData = brandMasterData.map((brand) => ({
          value: brand.md_id,
          label: brand.md_title,
        }));
        setBrands(brandData);
      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error.message || "Failed to fetch brands");
        }
      }
    };

    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await VehicleModelService.Queries.getModels({
          _page: 1,
          _perPage: 1000,
        });
        const modelData = response.data?.data?.map((model) => ({
          value: model.vm_id,
          label: model.vm_name,
        })) || [];
        setModels(modelData);
      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error.message || "Failed to fetch models");
        }
      }
    };

    fetchModels();
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


  // console.log("companyShops product-list 339", companyShops);





  const getProducts = async (
    newCodeQuery = codeQuery,
    newEditionQuery = editionQuery,
    newChassisQuery = chassisQuery,
    newPriorityQuery = priorityQuery,
    newOwnerQuery = ownerQuery,
    newBrandQuery = brandQuery,
    newModelQuery = modelQuery,
    searchQuery = query,
    shopId,
    companyShopsOverride = null,
    newCreatedAtQuery = createdAtQuery
  ) => {
    try {

      const user = parseStoredUser(localStorage.getItem("user"));

      setLoading(true);
      const params = {
        _page: currentPage,
        _perPage: itemsPerPage,
        _order: 'desc',
        _orderBy: 'v_id',
        _status: 'active',
      };

      const shopToFilter =
        shopId !== undefined ? shopId : shopFilterId !== null ? shopFilterId : selectedShop;

      if (shopToFilter) {
        if (shopToFilter === 'my-shop') {
          if (user?.user_mode === 'user' || user?.user_mode === 'partner') {
            params._user_id = user?.id;
          }
          // params._user_id = user?.id;
        } else if (shopToFilter === 'company-shop') {
          const effectiveCompanyShops = Array.isArray(companyShopsOverride) ? companyShopsOverride : companyShops;
          // if (companyShops.length === 0) {
          //   setProducts([]);
          //   setTotalItems(0);
          //   setLoading(false);
          //   Swal.fire({
          //     icon: "warning",
          //     title: "No Company Shop Found",
          //     text: "Please add company shops first.",
          //   });
          //   return;
          // }

          effectiveCompanyShops.forEach((item, idx) => {
            params[`_shop_ids[${idx}]`] = item?.value ?? item;
          });
          if (user?.user_mode !== 'supreme' && user?.id) {
            params._user_id = user.id;
          } else {
            delete params._user_id;
          }

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

      if (newCreatedAtQuery) {
        params._orderBy = 'v_created_at';
        params._order = newCreatedAtQuery;
      }

      if (newOwnerQuery) {
        params._user_id = newOwnerQuery;
      }

      if (newBrandQuery) {
        params._brand_id = newBrandQuery;
      }

      if (newModelQuery) {
        params._model_id = newModelQuery;
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


  const getStoredUser = () => {
    try {
      return parseStoredUser(localStorage.getItem("user"));
    } catch {
      return null;
    }
  };

  const handleShopData = async (shopType, userOverride = null) => {


    // if (shopType !== "company-shop") {
    //   setShopData([]);
    //   return;
    // }

    // console.log("shopType", shopType);

    const activeUser = userOverride || user || getStoredUser();
    const type = shopType === "company-shop" ? "company" : shopType === "my-shop" ? "own" : "all";
    const shouldPassLoginUserId =
      activeUser?.id &&
      (shopType === "company-shop"
        ? activeUser?.user_mode !== "supreme"
        : !canAllShopView(activeUser));
    const params = {
      // _user_id: user?.id,
      ...(shouldPassLoginUserId && { _user_id: activeUser.id }),
      _type: type,
      _page: 1,
      _perPage: 1000
    };
    try {
      const response = await ShopService.Queries.getShopsWithCompanyShops(params);

      //  console.log("response------`-474", response);


      const list = response?.data || [];
      const shopOptions = list
        .map((item) => {
          const shop = item?.shop ?? item;
          if (!shop?.s_id) return null;
          return { value: shop.s_id, label: shop.s_title, phone: shop?.user?.phone || shop?.s_user_phone || "" };
        })
        .filter(Boolean);

      setAllShop(shopOptions);
      setShopData(shopOptions);
      if (shopType === "company-shop") {
        setCompanyShops(shopOptions);
      }


      // setShopData(shopOptions);
      return shopOptions;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to fetch company shops");
      return [];
    }
  };


  // console.log("query", query);

  const fetchSearchResults = () => {
    // This is called by TableFilter's debounced search
    // The query state is already updated, so we just need to trigger the API call
    // with all current filter values
    getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery);
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

  // -----------------------

  const startEditFixedPrice = (item) => {
    setEditingFixedPriceId(item?.v_id);
    setEditingFixedPriceValue(item?.vehicle_db_price?.vp_user_fixed_price ?? "");
  };

  const cancelEditFixedPrice = () => {
    setEditingFixedPriceId(null);
    setEditingFixedPriceValue("");
  };

  const handleFixedPriceSave = async (item) => {
    const newValue = editingFixedPriceValue;
    const numericValue = Number(newValue);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      toast.error("Please enter a valid fixed price.");
      return;
    }

    if (!item?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    setSavingFixedPriceId(item.v_id);
    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(item.v_id, {
        vp_user_fixed_price: newValue ?? "",
        _method: "PUT",
      });

      if (response?.v_id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.v_id === item.v_id
              ? {
                ...product,
                vehicle_db_price: {
                  ...product.vehicle_db_price,
                  vp_user_fixed_price: newValue ?? "",
                },
              }
              : product
          )
        );
        toast.success("Fixed price updated.");
        cancelEditFixedPrice();
      } else {
        toast.error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setSavingFixedPriceId(null);
    }
  };


  const startEditPurchasePrice = (item) => {
    setEditingPurchasePriceId(item?.v_id);
    setEditingPurchasePriceValue(item?.vehicle_db_price?.vp_user_purchase_price ?? "");
  };

  const cancelEditPurchasePrice = () => {
    setEditingPurchasePriceId(null);
    setEditingPurchasePriceValue("");
  };

  const handlePurchasePriceSave = async (item) => {
    const newValue = editingPurchasePriceValue;
    const numericValue = Number(newValue);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      toast.error("Please enter a valid purchase price.");
      return;
    }

    if (!item?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    setSavingPurchasePriceId(item.v_id);
    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(item.v_id, {
        vp_user_purchase_price: newValue ?? "",
        _method: "PUT",
      });

      if (response?.v_id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.v_id === item.v_id
              ? {
                ...product,
                vehicle_db_price: {
                  ...product.vehicle_db_price,
                  vp_user_purchase_price: newValue ?? "",
                },
              }
              : product
          )
        );
        toast.success("Purchase price updated.");
        cancelEditPurchasePrice();
      } else {
        toast.error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setSavingPurchasePriceId(null);
    }
  };

  const startEditB2BPrice = (item) => {
    setEditingB2BPriceId(item?.v_id);
    setEditingB2BPriceValue(item?.vehicle_db_price?.vp_user_to_pbl_price ?? "");
  };

  const cancelEditB2BPrice = () => {
    setEditingB2BPriceId(null);
    setEditingB2BPriceValue("");
  };

  const handleB2BPriceSave = async (item) => {
    const newValue = editingB2BPriceValue;
    const numericValue = Number(newValue);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      toast.error("Please enter a valid B2B price.");
      return;
    }

    if (!item?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    setSavingB2BPriceId(item.v_id);
    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(item.v_id, {
        vp_user_to_pbl_price: newValue ?? "",
        _method: "PUT",
      });

      if (response?.v_id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.v_id === item.v_id
              ? {
                ...product,
                vehicle_db_price: {
                  ...product.vehicle_db_price,
                  vp_user_to_pbl_price: newValue ?? "",
                },
              }
              : product
          )
        );
        toast.success("B2B price updated.");
        cancelEditB2BPrice();
      } else {
        toast.error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setSavingB2BPriceId(null);
    }
  };



  const startEditAskingPrice = (item) => {
    setEditingAskingPriceId(item?.v_id);
    setEditingAskingPriceValue(item?.vehicle_db_price?.vp_user_asking_price ?? "");
  };

  const cancelEditAskingPrice = () => {
    setEditingAskingPriceId(null);
    setEditingAskingPriceValue("");
  };

  const handleAskingPriceSave = async (item) => {
    const newValue = editingAskingPriceValue;
    const numericValue = Number(newValue);

    if (Number.isNaN(numericValue) || numericValue < 0) {
      toast.error("Please enter a valid asking price.");
      return;
    }

    if (!item?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    setSavingAskingPriceId(item.v_id);
    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(item.v_id, {
        vp_user_asking_price: newValue ?? "",
        _method: "PUT",
      });

      if (response?.v_id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.v_id === item.v_id
              ? {
                ...product,
                vehicle_db_price: {
                  ...product.vehicle_db_price,
                  vp_user_asking_price: newValue ?? "",
                },
              }
              : product
          )
        );
        toast.success("Asking price updated.");
        cancelEditAskingPrice();
      } else {
        toast.error(response?.data?.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setSavingAskingPriceId(null);
    }
  };

  const startEditAvailabilityStatus = (item) => {
    setEditingAvailabilityStatusId(item?.v_id);
    setEditingAvailabilityStatusValue(normalizeAvailabilityStatus(item?.v_availability_status));
  };

  const cancelEditAvailabilityStatus = () => {
    setEditingAvailabilityStatusId(null);
    setEditingAvailabilityStatusValue("available");
  };

  const handleAvailabilityStatusSave = async (item) => {
    const newValue = normalizeAvailabilityStatus(editingAvailabilityStatusValue);

    if (!item?.v_id) {
      toast.error("Product not selected.");
      return;
    }

    if (newValue === normalizeAvailabilityStatus(item?.v_availability_status)) {
      cancelEditAvailabilityStatus();
      return;
    }

    setSavingAvailabilityStatusId(item.v_id);
    try {
      const response = await VehicleService.Commands.individualVehicleUpdate(item.v_id, {
        v_availability_status: newValue,
        _method: "PUT",
      });

      if (response?.status === "success" || response?.v_id) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.v_id === item.v_id
              ? {
                ...product,
                v_availability_status: newValue,
              }
              : product
          )
        );
        toast.success("Availability updated.");
        cancelEditAvailabilityStatus();
      } else {
        toast.error(response?.data?.message || response?.message || "Update failed.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed.");
    } finally {
      setSavingAvailabilityStatusId(null);
    }
  };








  useEffect(() => {
    getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery);
  }, [currentPage, itemsPerPage, sortColumn, sortOrder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is inside any of the filter buttons
      const isClickInsideFilterButton =
        (filterButtonRef.current && filterButtonRef.current.contains(event.target)) ||
        (editionButtonRef.current && editionButtonRef.current.contains(event.target)) ||
        (shopButtonRef.current && shopButtonRef.current.contains(event.target)) ||
        (modelButtonRef.current && modelButtonRef.current.contains(event.target)) ||
        (chassisButtonRef.current && chassisButtonRef.current.contains(event.target)) ||
        (createdAtButtonRef.current && createdAtButtonRef.current.contains(event.target)) ||
        (priorityButtonRef.current && priorityButtonRef.current.contains(event.target)) ||
        (ownerButtonRef.current && ownerButtonRef.current.contains(event.target)) ||
        (brandButtonRef.current && brandButtonRef.current.contains(event.target));

      // Check if the click is inside any of the tooltips
      const isClickInsideTooltip =
        (tooltipRef.current && tooltipRef.current.contains(event.target)) ||
        (editionTooltipRef.current && editionTooltipRef.current.contains(event.target)) ||
        (shopTooltipRef.current && shopTooltipRef.current.contains(event.target)) ||
        (modelTooltipRef.current && modelTooltipRef.current.contains(event.target)) ||
        (chassisTooltipRef.current && chassisTooltipRef.current.contains(event.target)) ||
        (createdAtTooltipRef.current && createdAtTooltipRef.current.contains(event.target)) ||
        (priorityTooltipRef.current && priorityTooltipRef.current.contains(event.target)) ||
        (ownerTooltipRef.current && ownerTooltipRef.current.contains(event.target)) ||
        (brandTooltipRef.current && brandTooltipRef.current.contains(event.target));

      // Check if the click is inside any react-select component (including its control and menu)
      const isClickInsideReactSelect = event.target.closest('.react-select');

      if (!isClickInsideFilterButton && !isClickInsideTooltip && !isClickInsideReactSelect) {
        setShowCodeSearch(false);
        setShowEditionSearch(false);
        setShowShopSearch(false);
        setShowModelSearch(false);
        setShowChassisSearch(false);
        setShowCreatedAtSearch(false);
        setShowPrioritySearch(false);
        setShowOwnerSearch(false);
        setShowBrandSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [tooltipRef, filterButtonRef, editionTooltipRef, editionButtonRef, shopTooltipRef, shopButtonRef, modelTooltipRef, modelButtonRef, chassisTooltipRef, chassisButtonRef, createdAtTooltipRef, createdAtButtonRef, priorityTooltipRef, priorityButtonRef, ownerTooltipRef, ownerButtonRef, brandTooltipRef, brandButtonRef]);


  const handleDownload = async (productId, productShopId) => {
    const toastId = `price-doc-download-${productId}`;

    if (
      selectedShop !== "my-shop" &&
      !hasPermission(permissionList, Number(productShopId), "Vehicle", "priceDocDownload")
    ) {
      toast.error("You don't have permission");
      return;
    }

    try {
      toast.loading("Preparing download...", { id: toastId });

      const token = localStorage.getItem("auth_token");
      const response = await fetch(`${API_URL}api/vehicle/download-price-doc/${productId}`, {
        method: "GET",
        headers: {
          Accept: "application/octet-stream, application/pdf, application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        let errorMessage = "Failed to download document";

        try {
          const errorData = await response.json();
          errorMessage = errorData?.message || errorMessage;
        } catch {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
          }
        }

        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const data = await response.json();
        const downloadUrl = data?.url || data?.data?.url;

        if (!downloadUrl) {
          throw new Error(data?.message || "Download URL not found");
        }

        window.open(downloadUrl, "_blank", "noopener,noreferrer");
        toast.success("Document is ready.", { id: toastId });
        return;
      }

      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition") || "";
      const fileNameMatch = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
      const fileName = fileNameMatch?.[1]
        ? decodeURIComponent(fileNameMatch[1])
        : `vehicle-price-doc-${productId}`;

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Document downloaded successfully.", { id: toastId });
    } catch (error) {
      toast.error(error.message || "Failed to download document", { id: toastId });
    }
  };

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

  const handlePermanentDelete = async (id) => {
    if (!id) {
      toast.error("Product not selected.");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This product will be permanently deleted and cannot be restored!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, permanently delete it!"
    });

    if (result.isConfirmed) {
      try {
        const response = await VehicleService.Commands.deleteVehicle(id);

        if (response) {
          setProducts(prevProducts => prevProducts.filter(product => product.v_id !== id));
          setTotalItems(prevTotal => Math.max((prevTotal || 0) - 1, 0));
          Swal.fire({
            title: "Permanently Deleted!",
            text: "Product permanently deleted successfully!",
            icon: "success"
          });
        }
      } catch (error) {
        if (error.errors) {
          Object.values(error.errors).forEach((e) => toast.error(e[0]));
        } else {
          toast.error(error?.response?.data?.message || error.message || "Something went wrong");
        }
      }
    }
  };



  // shop data get from api
  const getShopData = async () => {
    try {
      const user = parseStoredUser(localStorage.getItem("user"));


      // Build request params conditionally
      const params = {
        order: "desc",
        orderBy: "md_id",
        _page: 1,
        _perPage: 1000,
        ...(!canAllShopView(user) && user?.id && { _user_id: user.id }),
        // _user_id: user?.id,
        // ...(user.user_mode !== "pbl" && user.user_mode !== "supreme" && { _user_id: user?.id })
      };

      const response = await ShopService.Queries.getShops(params);

      const shopOptions = response.data.data.map((shop) => ({
        value: shop.s_id,
        label: shop.s_title,
        phone: shop?.user?.phone || shop?.s_user_phone || "",
      }));

      // console.log("======================shopOptions===============================", shopOptions);

      setAllShop((prevShopData) => {
        const newShops = shopOptions.filter(
          (newShop) => !prevShopData.find((s) => s.value === newShop.value)
        );
        return [...prevShopData, ...newShops];
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    }
  };


  // console.log("-----------allShop----------", allShop);


  useEffect(() => {

    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }

    handleShopData('my-shop', storedUser);
  }, []);



  const fetchCompanyShops = useCallback(async () => {
    try {
      const params = {
        order: "desc",
        orderBy: "s_id",
        _page: 1,
        _perPage: 1000,
        _user_id: user?.id,
        _type: "company"
      };
      const response = await ShopService.Queries.getShopsWithCompanyShops(user?.id);

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
                phone: item?.shop?.user?.phone || item?.shop?.s_user_phone || "",
              });
            }

          }
        });


        setCompanyShops(shopArrayData);


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



  // console.log("companyShops 903000000000000", companyShops);


  // useEffect(() => {
  //   if (user?.id) {
  //     // fetchCompanyShops();
  //   }
  // }, [user?.id, fetchCompanyShops]);


  // console.log("ssetSelectedShophopData", selectedShop);



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
              onChange={async (e) => {
                const newShopId = e.target.value;
                setShopFilterId(null);
                setSelectedShop(newShopId);
                setCurrentPage(1);
                const latestShopOptions = await handleShopData(newShopId);
                if (newShopId === "company-shop" && latestShopOptions.length === 0) {
                  setProducts([]);
                  setTotalItems(0);
                  Swal.fire({
                    icon: "warning",
                    title: "No Company Shop Found",
                    text: "Please add company shops first.",
                  });
                  return;
                }
                getProducts(
                  codeQuery,
                  editionQuery,
                  chassisQuery,
                  priorityQuery,
                  ownerQuery,
                  brandQuery,
                  modelQuery,
                  query,
                  newShopId,
                  newShopId === "company-shop" ? latestShopOptions : null
                );
              }}
            >
              {/* <option value="">Select Company Shop</option> */}
              <option value="my-shop">My Shop</option>
              <option value="company-shop">Company Shop</option>
              {/* {shopData.map((shop) => (
                <option key={shop.value} value={shop.value}>{shop.label}</option>
              ))} */}
            </select>
          </div>



          <div className="flex items-center gap-2">
            {/* <Button
              type="button"
              onClick={handlePrint}
              variant="outline"
              className=" border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button> */}

            {canShowVehicleListPdfButton && (
              <Button
                type="button"
                onClick={handleOpenVehicleListPdfModal}
                variant="outline"
                className=" border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                <Download className="h-4 w-4" />
                Vehicle List PDF
              </Button>
            )}

            {canShowAddProductButton && (
              <Button
                type="button"
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
            )}
          </div>
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
          onClearSearch={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery, '')}
        />


        {/* Table Container */}
        <div className="rounded-md border border-gray-300 mt-4">
          {hasTopScrollbar && (
            <div
              ref={topScrollbarRef}
              className="overflow-x-auto overflow-y-hidden border-b border-gray-300 bg-gray-50"
            >
              <div
                style={{
                  width: `${topScrollbarMetrics.contentWidth}px`,
                  height: "16px",
                }}
              />
            </div>
          )}

          <Table
            ref={tableRef}
            containerClassName={hasTopScrollbar ? "scrollbar-hidden" : ""}
            className="min-w-full"
          >
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
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Brand</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowBrandSearch(!showBrandSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowShopSearch(false); setShowModelSearch(false); setShowChassisSearch(false); setShowCreatedAtSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={brandButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${brandQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {showBrandSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showBrandSearch && (
                      <div className="relative" ref={brandTooltipRef}>
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Brands' },
                                ...brands
                              ]}
                              value={brands.find(option => option.value === brandQuery) ? brands.find(option => option.value === brandQuery) : { value: '', label: 'All Brands' }}
                              onChange={(selectedOption) =>
                                setBrandQuery(selectedOption ? selectedOption.value : '')
                              }
                              placeholder="Select Brand"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {brandQuery && (
                              <button
                                onClick={() => {
                                  setBrandQuery('');
                                  getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, '', modelQuery);
                                  setShowBrandSearch(false);
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
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}

                {isColumnVisible('model') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Model</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowModelSearch(!showModelSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowShopSearch(false); setShowBrandSearch(false); setShowChassisSearch(false); setShowCreatedAtSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={modelButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${modelQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {showModelSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showModelSearch && (
                      <div className="relative" ref={modelTooltipRef}>
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Models' },
                                ...models
                              ]}
                              value={models.find(option => option.value === modelQuery) ? models.find(option => option.value === modelQuery) : { value: '', label: 'All Models' }}
                              onChange={(selectedOption) =>
                                setModelQuery(selectedOption ? selectedOption.value : '')
                              }
                              placeholder="Select Model"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {modelQuery && (
                              <button
                                onClick={() => {
                                  setModelQuery('');
                                  getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, '');
                                  setShowModelSearch(false);
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
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}

                {isColumnVisible('model-year') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Model Year
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('registration-year') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Registration Year
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('package') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Package</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowEditionSearch(!showEditionSearch); setShowCodeSearch(false); setShowShopSearch(false); setShowModelSearch(false); setShowBrandSearch(false); setShowChassisSearch(false); setShowCreatedAtSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={editionButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${editionQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {showEditionSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showEditionSearch && (
                      <div className="relative" ref={editionTooltipRef}>
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Packages' },
                                ...editions.map((edition) => ({
                                  value: edition.p_id,
                                  label: edition.p_name
                                }))
                              ]}
                              value={editions.find(option => option.p_id === editionQuery) ? { value: editionQuery, label: editions.find(option => option.p_id === editionQuery).p_name } : { value: '', label: 'All Packages' }}
                              onChange={(selectedOption) =>
                                setEditionQuery(selectedOption ? selectedOption.value : '')
                              }
                              placeholder="Select Package"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {editionQuery && (
                              <button
                                onClick={() => {
                                  setEditionQuery('');
                                  getProducts(codeQuery, '', chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery);
                                  setShowEditionSearch(false);
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
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}


                {isColumnVisible('shop') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Shop</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowShopSearch(!showShopSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowModelSearch(false); setShowBrandSearch(false); setShowChassisSearch(false); setShowCreatedAtSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={shopButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${shopFilterId !== null ? 'text-orange-500' : ''}`} />
                        </button>

                        {showShopSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showShopSearch && (
                      <div className="relative" ref={shopTooltipRef}>
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Shops' },
                                // { value: 'my-shop', label: 'My Shop' },
                                ...allShop
                              ]}
                              value={(() => {
                                const currentValue = shopFilterId !== null ? shopFilterId : selectedShop;
                                const options = [
                                  { value: '', label: 'All Shops' },
                                  // { value: 'my-shop', label: 'My Shop' },
                                  ...allShop
                                ];
                                const found = options.find((option) => option.value === currentValue);
                                if (found) return found;
                                if (!currentValue) return { value: '', label: 'All Shops' };
                                return { value: currentValue, label: 'Selected Shop' };
                              })()}
                              onChange={(selectedOption) =>
                                setShopFilterId(selectedOption ? selectedOption.value : null)
                              }
                              placeholder="Select Shop"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {shopFilterId !== null && (
                              <button
                                onClick={() => {
                                  setShopFilterId(null);
                                  getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery, query, selectedShop);
                                  setShowShopSearch(false);
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
                            onClick={() => {
                              const shopIdToApply = shopFilterId !== null ? shopFilterId : selectedShop;
                              getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery, query, shopIdToApply);
                              setShowShopSearch(false);
                            }}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}





                {isColumnVisible('chassis') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Chassis No</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowChassisSearch(!showChassisSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowShopSearch(false); setShowModelSearch(false); setShowCreatedAtSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); setShowBrandSearch(false); }}
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
                                  getProducts(codeQuery, editionQuery, '', priorityQuery, ownerQuery, brandQuery, modelQuery);
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
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}


                {isColumnVisible('created-at') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Created At</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowCreatedAtSearch(!showCreatedAtSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowShopSearch(false); setShowModelSearch(false); setShowChassisSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); setShowBrandSearch(false); }}
                          className="ml-2 focus:outline-none"
                          ref={createdAtButtonRef}
                        >
                          <Funnel className={`w-4 h-4 ${createdAtQuery ? 'text-orange-500' : ''}`} />
                        </button>

                        {showCreatedAtSearch && (
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                        )}
                      </div>
                    </div>
                    {showCreatedAtSearch && (
                      <div className="relative" ref={createdAtTooltipRef}>
                        <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />

                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                          <div className="flex items-center w-full mb-2">
                            <Select
                              options={[
                                { value: '', label: 'All Created At' },
                                { value: 'ASC', label: 'ASC' },
                                { value: 'DESC', label: 'DESC' }
                              ]}
                              value={createdAtQuery ? { value: createdAtQuery, label: createdAtQuery } : { value: '', label: 'All Created At' }}
                              onChange={(selectedOption) => {
                                const nextCreatedAtQuery = selectedOption ? selectedOption.value : '';
                                setCreatedAtQuery(nextCreatedAtQuery);
                                if (nextCreatedAtQuery) {
                                  setPriorityQuery('');
                                }
                              }}
                              placeholder="Select Created At Order"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {createdAtQuery && (
                              <button
                                onClick={() => {
                                  setCreatedAtQuery('');
                                  getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery, query, undefined, null, '');
                                  setShowCreatedAtSearch(false);
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
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery, query, undefined, null, createdAtQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}


                {isColumnVisible('capacity') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Capacity
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('color') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Color
                    </div>
                  </TableHead>
                )}


                {isColumnVisible('price') && canViewPriceColumn && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Price
                    </div>
                  </TableHead>
                )}


                {/* purchase-price */}
                {isColumnVisible('purchase-price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Purchase Price
                    </div>
                  </TableHead>
                )}

                {/* costing-price */}
                {isColumnVisible('costing-price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Costing Price
                    </div>
                  </TableHead>
                )}


                {isColumnVisible('b2b-price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      B2B Price
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

                {/* asking-price */}
                {isColumnVisible('asking-price') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Asking Price
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

                
                {isColumnVisible('location') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Location
                    </div>
                  </TableHead>
                )}


                {isColumnVisible('outlet') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Outlet
                    </div>
                  </TableHead>
                )}

                {isColumnVisible('owner') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Owner</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowOwnerSearch(!showOwnerSearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowShopSearch(false); setShowModelSearch(false); setShowChassisSearch(false); setShowCreatedAtSearch(false); setShowPrioritySearch(false); setShowBrandSearch(false); }}
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
                                  getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, '', brandQuery, modelQuery);
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
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
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


                {isColumnVisible('grade') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Grade
                    </div>
                  </TableHead>
                )}



                {isColumnVisible('milage') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Milage
                    </div>
                  </TableHead>
                )}


                {isColumnVisible('fuel') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Fuel
                    </div>
                  </TableHead>
                )}


                {isColumnVisible('priority') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Priority</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowPrioritySearch(!showPrioritySearch); setShowCodeSearch(false); setShowEditionSearch(false); setShowShopSearch(false); setShowModelSearch(false); setShowChassisSearch(false); setShowCreatedAtSearch(false); setShowOwnerSearch(false); setShowBrandSearch(false); }}
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
                              onChange={(selectedOption) => {
                                const nextPriorityQuery = selectedOption ? selectedOption.value : '';
                                setPriorityQuery(nextPriorityQuery);
                                if (nextPriorityQuery) {
                                  setCreatedAtQuery('');
                                }
                              }}
                              placeholder="Select Priority Order"
                              isClearable={true}
                              className="w-full text-sm"
                              classNamePrefix="react-select"
                            />

                            {priorityQuery && (
                              <button
                                onClick={() => {
                                  setPriorityQuery('');
                                  getProducts(codeQuery, editionQuery, chassisQuery, '', ownerQuery, brandQuery, modelQuery);
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
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
                            className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    )}
                  </TableHead>
                )}


                {/* {isColumnVisible('package') && (
                  <TableHead className="border-r border-gray-300">
                    <div className="flex items-center">
                      Package
                    </div>
                  </TableHead>
                )} */}



                {isColumnVisible('code') && (
                  <TableHead className="border-r border-gray-300 relative">
                    <div className="flex items-center justify-between relative">
                      <span>Code</span>

                      <div className="relative">
                        <button
                          onClick={() => { setShowCodeSearch(!showCodeSearch); setShowEditionSearch(false); setShowShopSearch(false); setShowModelSearch(false); setShowChassisSearch(false); setShowCreatedAtSearch(false); setShowPrioritySearch(false); setShowOwnerSearch(false); setShowBrandSearch(false); }}
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
                                  getProducts('', editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery);
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
                            onClick={() => getProducts(codeQuery, editionQuery, chassisQuery, priorityQuery, ownerQuery, brandQuery, modelQuery)}
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
                products.map((item, index) => {
                  let updateAction = "UpdatePurchasePrice";
                  const hasUpdatePermission =
                    selectedShop === "my-shop" ||
                    hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", updateAction);

                  let updateVariablePriceAction = "UpdateVariablePrice";
                  const hasUpdateVariablePricePermission =
                    selectedShop === "my-shop" ||
                    hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", updateVariablePriceAction);

                  let updateFixedPriceAction = "UpdateFixedPrice";
                  const hasUpdateFixedPricePermission =
                    selectedShop === "my-shop" ||
                    hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", updateFixedPriceAction);

                  let updateAskingPriceAction = "UpdateAskingPrice";
                  const hasUpdateAskingPricePermission =
                    selectedShop === "my-shop" ||
                    hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", updateAskingPriceAction);

                  let updateAvailabilityStatusAction = "ChangeSold/Booked";
                  const hasUpdateAvailabilityStatusPermission =
                    selectedShop === "my-shop" ||
                    hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", updateAvailabilityStatusAction);
                  let showPriceCalculatorAction = "ShowPriceCalculatorButton";
                  const hasShowPriceCalculatorPermission =
                    selectedShop === "my-shop" ||
                    hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", showPriceCalculatorAction);
                  let showPriceHistoryButtonAction = "ShowPriceHistoryButton";
                  const hasShowPriceHistoryButtonPermission =
                    selectedShop === "my-shop" ||
                    hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", showPriceHistoryButtonAction);
                  let showDownloadPriceDocumentButtonAction = "ShowDownloadPriceDocumentButton";
                  const hasShowDownloadPriceDocumentButtonPermission =
                    selectedShop === "my-shop" ||
                    hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", showDownloadPriceDocumentButtonAction);
                  // const canShowPriceActionButtons =
                  //   user &&
                  //   (
                  //     user?.user_mode === "supreme" ||
                  //     user?.user_mode === "admin" ||
                  //     selectedShop !== "my-shop"
                  //   );

                  return (
                    <TableRow key={item.id || index} className="border-b border-gray-200">
                      {isColumnVisible('sl') && <TableCell className="border-r border-gray-200 text-center py-4">{index + 1}</TableCell>}
                      {isColumnVisible('name') && (
                        <TableCell className="border-r border-gray-200 font-medium py-4">
                          {(selectedShop === "my-shop" || selectedShop === "company-shop") ? (
                            <a
                              className="text-blue-600"
                              target="_blank"
                              href={`/product/my-shop/${item?.v_id}`}
                            >
                              {item?.v_title}
                            </a>
                          ) : (
                            <a
                              className="text-blue-600"
                              target="_blank"
                              href={`/product/${item?.v_id}`}
                            >
                              {item?.v_title}
                            </a>
                          )}
                        </TableCell>
                      )}
                      {isColumnVisible('brand') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_brand_name}</TableCell>}
                      {isColumnVisible('model') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_model_name}</TableCell>}
                      {isColumnVisible('model-year') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_mod_year || "-"}</TableCell>}
                      {isColumnVisible('registration-year') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_registration || "-"}</TableCell>}
                      {isColumnVisible('package') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_edition_name}</TableCell>}
                      {isColumnVisible('shop') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_shop_name}</TableCell>}
                      {isColumnVisible('chassis') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_chassis}</TableCell>}
                      {isColumnVisible('created-at') && <TableCell className="border-r border-gray-200 font-medium py-4">{formatDateTime(item?.v_created_at)}</TableCell>}
                      {isColumnVisible('capacity') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_capacity}</TableCell>}
                      {isColumnVisible('color') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_color_name}</TableCell>}

                      {isColumnVisible('price') && canViewPriceColumn && (
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



                      {isColumnVisible('purchase-price') && (
                        <TableCell className="border-r border-gray-200 font-medium py-4">
                          {editingPurchasePriceId === item?.v_id ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="number"
                                inputMode="decimal"
                                className="h-9 w-full min-w-[7rem] rounded-md border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingPurchasePriceValue}
                                onChange={(e) => setEditingPurchasePriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handlePurchasePriceSave(item);
                                  }
                                  if (e.key === "Escape") {
                                    cancelEditPurchasePrice();
                                  }
                                }}
                                aria-label="Edit purchase price"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handlePurchasePriceSave(item)}
                                  disabled={savingPurchasePriceId === item?.v_id}
                                  className="rounded-md border border-green-200 bg-green-50 p-1 text-green-700 hover:bg-green-100 disabled:opacity-60"
                                  aria-label="Save purchase price"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditPurchasePrice}
                                  disabled={savingPurchasePriceId === item?.v_id}
                                  className="rounded-md border border-gray-200 bg-gray-50 p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                                  aria-label="Cancel purchase price edit"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 group">
                              <span>{item?.vehicle_db_price?.vp_user_purchase_price ?? "-"}</span>


                              {
                                hasUpdatePermission && canUpdatePurchasePrice && (
                                  <button
                                    type="button"
                                    onClick={() => startEditPurchasePrice(item)}
                                    className="rounded-md p-1 text-gray-500 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                                    aria-label="Edit purchase price"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )
                              }


                            </div>
                          )}
                        </TableCell>
                      )}

                      {isColumnVisible('costing-price') && (
                        <TableCell className="border-r border-gray-200 font-medium py-4">
                          <span>{item?.vehicle_db_price?.vp_user_costing_price ?? "-"}</span>
                        </TableCell>
                      )}



                      {isColumnVisible('b2b-price') && (
                        <TableCell className="border-r border-gray-200 font-medium py-4">
                          {editingB2BPriceId === item?.v_id ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="number"
                                inputMode="decimal"
                                className="h-9 w-full min-w-[7rem] rounded-md border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingB2BPriceValue}
                                onChange={(e) => setEditingB2BPriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleB2BPriceSave(item);
                                  }
                                  if (e.key === "Escape") {
                                    cancelEditB2BPrice();
                                  }
                                }}
                                aria-label="Edit B2B price"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleB2BPriceSave(item)}
                                  disabled={savingB2BPriceId === item?.v_id}
                                  className="rounded-md border border-green-200 bg-green-50 p-1 text-green-700 hover:bg-green-100 disabled:opacity-60"
                                  aria-label="Save B2B price"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditB2BPrice}
                                  disabled={savingB2BPriceId === item?.v_id}
                                  className="rounded-md border border-gray-200 bg-gray-50 p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                                  aria-label="Cancel B2B price edit"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 group">
                              <span>{item?.vehicle_db_price?.vp_user_to_pbl_price ?? "-"}</span>

                              {
                                hasUpdateVariablePricePermission && canUpdateB2BPrice && (
                                  <button
                                    type="button"
                                    onClick={() => startEditB2BPrice(item)}
                                    className="rounded-md p-1 text-gray-500 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                                    aria-label="Edit B2B price"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )
                              }
                            </div>
                          )}
                        </TableCell>
                      )}



                      {isColumnVisible('fixed-price') &&
                        <TableCell className="border-r border-gray-200 font-medium py-4">
                          {editingFixedPriceId === item?.v_id ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="number"
                                inputMode="decimal"
                                className="h-9 w-full min-w-[7rem] rounded-md border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingFixedPriceValue}
                                onChange={(e) => setEditingFixedPriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleFixedPriceSave(item);
                                  }
                                  if (e.key === "Escape") {
                                    cancelEditFixedPrice();
                                  }
                                }}
                                aria-label="Edit fixed price"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleFixedPriceSave(item)}
                                  disabled={savingFixedPriceId === item?.v_id}
                                  className="rounded-md border border-green-200 bg-green-50 p-1 text-green-700 hover:bg-green-100 disabled:opacity-60"
                                  aria-label="Save fixed price"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditFixedPrice}
                                  disabled={savingFixedPriceId === item?.v_id}
                                  className="rounded-md border border-gray-200 bg-gray-50 p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                                  aria-label="Cancel fixed price edit"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 group">
                              <span>{item?.vehicle_db_price?.vp_user_fixed_price ?? "-"}</span>

                              {
                                hasUpdateFixedPricePermission && canUpdateFixedPrice && (
                                  <button
                                    type="button"
                                    onClick={() => startEditFixedPrice(item)}
                                    className="rounded-md p-1 text-gray-500 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                                    aria-label="Edit fixed price"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )
                              }

                            </div>
                          )}
                        </TableCell>}



                      {isColumnVisible('asking-price') && (
                        <TableCell className="border-r border-gray-200 font-medium py-4">
                          {editingAskingPriceId === item?.v_id ? (
                            <div className="flex flex-col gap-2">
                              <input
                                type="number"
                                inputMode="decimal"
                                className="h-9 w-full min-w-[7rem] rounded-md border border-gray-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingAskingPriceValue}
                                onChange={(e) => setEditingAskingPriceValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleAskingPriceSave(item);
                                  }
                                  if (e.key === "Escape") {
                                    cancelEditAskingPrice();
                                  }
                                }}
                                aria-label="Edit asking price"
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAskingPriceSave(item)}
                                  disabled={savingAskingPriceId === item?.v_id}
                                  className="rounded-md border border-green-200 bg-green-50 p-1 text-green-700 hover:bg-green-100 disabled:opacity-60"
                                  aria-label="Save asking price"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditAskingPrice}
                                  disabled={savingAskingPriceId === item?.v_id}
                                  className="rounded-md border border-gray-200 bg-gray-50 p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                                  aria-label="Cancel asking price edit"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 group">
                              <span>{item?.vehicle_db_price?.vp_user_asking_price ?? "-"}</span>

                              {
                                hasUpdateAskingPricePermission && canUpdateAskingPrice && (
                                  <button
                                    type="button"
                                    onClick={() => startEditAskingPrice(item)}
                                    className="rounded-md p-1 text-gray-500 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                                    aria-label="Edit asking price"
                                  >
                                    <Pencil size={14} />
                                  </button>
                                )
                              }



                            </div>
                          )}
                        </TableCell>
                      )}


                      {isColumnVisible('condition') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_condition_name}</TableCell>}

                      {isColumnVisible('location') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_location?.location_name}</TableCell>}
                      
                      {isColumnVisible('outlet') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_location?.uo_address}</TableCell>}

                      {isColumnVisible('owner') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_shop_user_name}</TableCell>}


                      {isColumnVisible('availability') && (
                        <TableCell className="border-r border-gray-200 font-medium py-4">
                          {editingAvailabilityStatusId === item?.v_id ? (
                            <div className="flex flex-col gap-2">
                              <select
                                className="h-9 w-full min-w-[8rem] rounded-md border border-gray-300 bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={editingAvailabilityStatusValue}
                                onChange={(e) => setEditingAvailabilityStatusValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleAvailabilityStatusSave(item);
                                  }
                                  if (e.key === "Escape") {
                                    cancelEditAvailabilityStatus();
                                  }
                                }}
                                aria-label="Edit availability status"
                              >
                                {availabilityStatusOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleAvailabilityStatusSave(item)}
                                  disabled={savingAvailabilityStatusId === item?.v_id}
                                  className="rounded-md border border-green-200 bg-green-50 p-1 text-green-700 hover:bg-green-100 disabled:opacity-60"
                                  aria-label="Save availability status"
                                >
                                  <Check size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEditAvailabilityStatus}
                                  disabled={savingAvailabilityStatusId === item?.v_id}
                                  className="rounded-md border border-gray-200 bg-gray-50 p-1 text-gray-600 hover:bg-gray-100 disabled:opacity-60"
                                  aria-label="Cancel availability status edit"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-2 group">
                              <span>{getAvailabilityStatusLabel(item?.v_availability_status)}</span>

                              {hasUpdateAvailabilityStatusPermission && canUpdateAvailabilityStatus && (
                                <button
                                  type="button"
                                  onClick={() => startEditAvailabilityStatus(item)}
                                  className="rounded-md p-1 text-gray-500 opacity-0 transition hover:bg-gray-100 hover:text-gray-700 group-hover:opacity-100"
                                  aria-label="Edit availability status"
                                >
                                  <Pencil size={14} />
                                </button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      )}


                      {isColumnVisible('grade') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_grade_name}</TableCell>}
                      {isColumnVisible('milage') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_mileage}</TableCell>}
                      {isColumnVisible('fuel') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_fuel_name}</TableCell>}
                      {isColumnVisible('priority') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_priority}</TableCell>}
                      {/* {isColumnVisible('package') && <TableCell className="border-r border-gray-200 font-medium py-4">{item?.v_edition_name}</TableCell>} */}
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


                          {/* { */}
                          {/* // canShowPriceActionButtons && ( */}
                          <>


                            <button
                              disabled={!hasShowPriceCalculatorPermission || !canShowPriceCalculatorButton}
                              onClick={() => handlePricePreview(item)}
                              className="text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
                              title="Price Calculator"
                              aria-label={`Calculator`}
                            >
                              <Calculator size={18} />
                            </button>

                            {/* <Calculator /> */}

                            <button
                              disabled={!hasShowPriceHistoryButtonPermission || !canShowPriceHistoryButton}
                              onClick={() => handlePriceHistory(item)}
                              className="text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
                              title="Price History"
                              aria-label={`Price History`}
                            >
                              <DollarSign size={18} />
                            </button>

                            <button
                              disabled={!hasShowDownloadPriceDocumentButtonPermission || !canShowDownloadPriceDocumentButton}
                              onClick={() => handleDownload(item.v_id, item?.v_shop_id)}
                              title="Download Price Document"
                              className="text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
                              aria-label={`Download price document for ${item.v_name}`}
                            >
                              <Download size={18} />
                            </button>
                          </>
                          {/* // ) */}
                          {/* // } */}

                          <button
                            disabled={!(selectedShop === "my-shop" ||
                              hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", "Update")) || !canEditButton}
                            onClick={() => handleEdit(item.v_id)}
                            className="text-blue-600 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-gray-400"
                            title="Product Edit"
                            aria-label={`Edit product ${item.v_name}`}
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            disabled={!(selectedShop === "my-shop" ||
                              hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", "Delete")) || !canDeleteButton}
                            onClick={() => handleDelete(item?.v_id)}
                            className="text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
                            title="Delete Product"
                            aria-label={`Delete product ${item.v_name}`}
                          >
                            <Trash2 size={21} />
                          </button>

                          <button
                            // disabled={!(selectedShop === "my-shop" ||
                            //   hasPermission(permissionList, Number(item?.v_shop_id), "Vehicle", "Delete")) || !canDeleteButton}
                            onClick={() => handlePermanentDelete(item?.v_id)}
                            className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400 disabled:hover:bg-transparent"
                            title="Permanent Delete Product"
                            aria-label={`Permanent delete product ${item?.v_name || item?.v_id}`}
                          >
                            <Trash2 size={16} />
                            {/* <span>Permanent Delete</span> */}
                          </button>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.filter((column) => isColumnVisible(column.key) && (column.key !== "price" || canViewPriceColumn)).length || 1}
                    className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[600px] text-center py-4 text-gray-500"
                  >
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
        updateProductPricePermission={updateProductPricePermission}
        onPriceUpdated={handlePricePreviewUpdated}
      />

      <VehicleListPdfDownloadModal
        open={isVehicleListPdfModalOpen}
        setOpen={setIsVehicleListPdfModalOpen}
        shopOptions={allShop}
        initialShopValue={getVehicleListPdfInitialShopValue()}
        initialStatus="active"
        isDownloading={isVehicleListPdfDownloading}
        onSubmit={handleVehicleListPdfDownload}
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
