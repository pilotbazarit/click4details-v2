"use client";
import React, { useEffect, useRef, useState } from "react";
import Footer from "@/components/dashboard/Footer";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import { Eye, Funnel, KeyRound, Loader2, Pencil, Search } from "lucide-react";
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
import UserService from "@/services/UserService";
import UserShopListModel from "@/components/modals/UserShopListModel";
import UserEditModel from "@/components/modals/UserEditModel";
import ShopService from "@/services/ShopService";
import PasswordChangeModal from "@/components/modals/PasswordChangeModal";

// ✅ Toggle Switch Component
const StatusToggle = ({ item, onToggle }) => {
  const isActive = item?.status === "active";

  return (
    <button
      onClick={() => onToggle(item)}
      className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors duration-300 ${isActive ? "bg-green-500" : "bg-red-700"
        }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-1"
          }`}
      />
    </button>
  );
};

const User = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(87);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedModel, setSelectedModel] = useState(null);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedEditData, setSelectedEditData] = useState([]);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editedMode, setEditedMode] = useState("");
  const [editedCode, setEditedCode] = useState("");
  const [editingColumn, setEditingColumn] = useState(null);
  const dropdownRef = useRef(null);
  const [shops, setShops] = useState([]);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [modeQuery, setModeQuery] = useState("");
  const [showModeSearch, setShowModeSearch] = useState(false);
  const modeButtonRef = useRef(null);
  const modeTooltipRef = useRef(null);
  // Mobile search state
  const [mobileQuery, setMobileQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const mobileButtonRef = useRef(null);
  const mobileTooltipRef = useRef(null);
  // Email search state
  const [emailQuery, setEmailQuery] = useState("");
  const [showEmailSearch, setShowEmailSearch] = useState(false);
  const emailButtonRef = useRef(null);
  const emailTooltipRef = useRef(null);

  const [codeQuery, setCodeQuery] = useState("");
  const [showCodeSearch, setShowCodeSearch] = useState(false);
  const codeButtonRef = useRef(null);
  const codeTooltipRef = useRef(null);

  const getUsers = async (value = query, modeValue = modeQuery, mobileValue = mobileQuery, emailValue = emailQuery, codeValue = codeQuery) => {
    try {
      setLoading(true);
      const response = await UserService.Queries.getUsers({
        _page: currentPage,
        _perPage: itemsPerPage,
        _name: value,
        _mode: modeValue,
        _phone: mobileValue,
        _email: emailValue,
        _code_prefix: codeValue
      });

      if (response?.status == "success") {
        setTotalItems(response?.data?.total);
        setUsers(response?.data?.data);
      } else {
        toast.error(response?.data?.message || "Failed to fetch models");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch data types"
      );
    } finally {
      setLoading(false);
    }
  };


  const handleModeChange = async (userId) => {
    try {
      const response = await UserService.Commands.updateUser(userId, {
        _method: "PUT",
        user_mode: editedMode
      });

      if (response.status === "success") {
        toast.success("User mode updated successfully!");
        setEditingRowId(null);
        setHoveredRow(null);
        setEditingColumn(null);
        setUsers(users.map((user) => (user.id === userId ? { ...user, user_mode: editedMode } : user)));
      } else {
        toast.error(response.message || "Failed to update user mode.");
      }
    } catch (err) {
      toast.error("Something went wrong while updating.");
    }
  };

  const handleCodeChange = async (userId) => {
    try {
      const response = await UserService.Commands.updateUser(userId, {
        _method: "PUT",
        up_code_prefix: editedCode
      });

      if (response.status === "success") {
        toast.success("User code updated successfully!");
        setEditingRowId(null);
        setHoveredRow(null);
        setEditingColumn(null);
        setUsers(users.map((user) => (user.id === userId ? { ...user, profile: { ...user.profile, up_code_prefix: editedCode } } : user)));
      } else {
        toast.error(response.message || "Failed to update user code.");
      }
    } catch (err) {
      toast.error("Something went wrong while updating.");
    }
  };

  const fetchSearchResults = (value) => {
    getUsers(value, modeQuery, mobileQuery, emailQuery, codeQuery);
  };

  const handleShow = async (item) => {
    const response = await ShopService.Queries.getShops({
      _user_id: item.id
    });

    if (response?.status === "success") {
      setShops(response?.data?.data);
    }
    setSelectedModel(item);
    setOpen(true);
  };

  const handleToggleStatus = async (user) => {
    const prevStatus = user.status;
    const newStatus = prevStatus === "active" ? "inactive" : "active";

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );

    try {
      const response = await UserService.Commands.updateUser(user.id, {
        _method: "PUT",
        status: newStatus,
      });

      if (response.status === "success") {
        toast.success(`User ${newStatus} successfully!`);
      } else {
        throw new Error("Failed to update");
      }
    } catch (error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: prevStatus } : u))
      );
      toast.error("Something went wrong while updating status.");
    }
  };

  const handleEdit = (item) => {
    setSelectedEditData(item);
    setOpenEditModal(true);
  };


  const handlePasswordChange = (item) => {
    // Handle password change logic here
    setPasswordModalOpen(true);
    setSelectedModel(item);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setEditingRowId(null);
        setHoveredRow(null);
      }

      const isClickInsideModeButton = modeButtonRef.current && modeButtonRef.current.contains(event.target);
      const isClickInsideModeTooltip = modeTooltipRef.current && modeTooltipRef.current.contains(event.target);
      if (!isClickInsideModeButton && !isClickInsideModeTooltip) {
        setShowModeSearch(false);
      }

      const isClickInsideMobileButton = mobileButtonRef.current && mobileButtonRef.current.contains(event.target);
      const isClickInsideMobileTooltip = mobileTooltipRef.current && mobileTooltipRef.current.contains(event.target);
      if (!isClickInsideMobileButton && !isClickInsideMobileTooltip) {
        setShowMobileSearch(false);
      }
      const isClickInsideEmailButton = emailButtonRef.current && emailButtonRef.current.contains(event.target);
      const isClickInsideEmailTooltip = emailTooltipRef.current && emailTooltipRef.current.contains(event.target);
      if (!isClickInsideEmailButton && !isClickInsideEmailTooltip) {
        setShowEmailSearch(false);
      }

      const isClickInsideCodeButton = codeButtonRef.current && codeButtonRef.current.contains(event.target);
      const isClickInsideCodeTooltip = codeTooltipRef.current && codeTooltipRef.current.contains(event.target);
      if (!isClickInsideCodeButton && !isClickInsideCodeTooltip) {
        setShowCodeSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    getUsers();
  }, [currentPage, itemsPerPage, query, modeQuery, mobileQuery, emailQuery, codeQuery]);

  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">User List</h2>
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
        />

        {/* Table Container */}
        <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] text-center border-r border-gray-300">SL</TableHead>
                <TableHead className="relative border-r border-gray-300">
                  <div className="flex items-center justify-between relative">
                    <span>Code</span>
                    <div className="relative">
                      <button
                        onClick={() => { setShowCodeSearch(!showCodeSearch); }}
                        className="ml-2 focus:outline-none"
                        ref={codeButtonRef}
                      >
                        <Search className={`w-4 h-4 ${codeQuery ? 'text-orange-500' : ''}`} />
                      </button>
                      {showCodeSearch && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                      )}
                    </div>
                  </div>
                  {showCodeSearch && (
                    <div className="relative" ref={codeTooltipRef}>
                      <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
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
                          onClick={() => getUsers(query, modeQuery, mobileQuery, emailQuery, codeQuery)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </TableHead>
                <TableHead className="relative border-r border-gray-300">Name</TableHead>
                <TableHead className="relative border-r border-gray-300">Company Name</TableHead>
                <TableHead className="relative border-r border-gray-300">Country Code</TableHead>
                <TableHead className="relative border-r border-gray-300">
                  <div className="flex items-center justify-between relative">
                    <span>Mobile</span>
                    <div className="relative">
                      <button
                        onClick={() => { setShowMobileSearch(!showMobileSearch); }}
                        className="ml-2 focus:outline-none"
                        ref={mobileButtonRef}
                      >
                        <Search className={`w-4 h-4 ${mobileQuery ? 'text-orange-500' : ''}`} />
                      </button>
                      {showMobileSearch && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                      )}
                    </div>
                  </div>
                  {showMobileSearch && (
                    <div className="relative" ref={mobileTooltipRef}>
                      <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                        <div className="flex items-center w-full mb-2">
                          <input
                            type="text"
                            placeholder="Search by Mobile"
                            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={mobileQuery}
                            onChange={(e) => setMobileQuery(e.target.value)}
                          />
                          {mobileQuery && (
                            <button
                              onClick={() => {
                                setMobileQuery('');
                                getUsers(query, modeQuery, '', emailQuery, codeQuery);
                                setShowMobileSearch(false);
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
                          onClick={() => getUsers(query, modeQuery, mobileQuery, emailQuery, codeQuery)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </TableHead>
                <TableHead className="relative border-r border-gray-300">
                  <div className="flex items-center justify-between relative">
                    <span>Email</span>
                    <div className="relative">
                      <button
                        onClick={() => { setShowEmailSearch(!showEmailSearch); }}
                        className="ml-2 focus:outline-none"
                        ref={emailButtonRef}
                      >
                        <Search className={`w-4 h-4 ${emailQuery ? 'text-orange-500' : ''}`} />
                      </button>
                      {showEmailSearch && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                      )}
                    </div>
                  </div>
                  {showEmailSearch && (
                    <div className="relative" ref={emailTooltipRef}>
                      <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                        <div className="flex items-center w-full mb-2">
                          <input
                            type="text"
                            placeholder="Search by Email"
                            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={emailQuery}
                            onChange={(e) => setEmailQuery(e.target.value)}
                          />
                          {emailQuery && (
                            <button
                              onClick={() => {
                                setEmailQuery('');
                                getUsers(query, modeQuery, mobileQuery, '', codeQuery);
                                setShowEmailSearch(false);
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
                          onClick={() => getUsers(query, modeQuery, mobileQuery, emailQuery, codeQuery)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </TableHead>
                <TableHead className="border-r border-gray-300 relative">
                  <div className="flex items-center justify-between relative">
                    <span>Mode</span>

                    <div className="relative">
                      <button
                        onClick={() => { setShowModeSearch(!showModeSearch); }}
                        className="ml-2 focus:outline-none"
                        ref={modeButtonRef}
                      >
                        <Search className={`w-4 h-4 ${modeQuery ? 'text-orange-500' : ''}`} />
                      </button>

                      {showModeSearch && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[2px] w-0 h-0 border-l-6 border-r-6 border-b-6 border-transparent border-b-gray-300" />
                      )}
                    </div>
                  </div>
                  {showModeSearch && (
                    <div className="relative" ref={modeTooltipRef}>
                      <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-white z-20" />

                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2 bg-white border border-gray-300 rounded-md shadow-lg z-50 w-48 flex flex-col items-end">
                        <div className="flex items-center w-full mb-2">
                          <select
                            className="w-full px-2 py-1 border rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={modeQuery}
                            onChange={(e) => setModeQuery(e.target.value)}
                          >
                            <option value="">All Modes</option>
                            <option value="supreme">Admin</option>
                            <option value="pbl">PBL</option>
                            <option value="partner">Partner</option>
                            <option value="user">User</option>
                            <option value="admin">System Admin</option>
                          </select>
                          {modeQuery && (
                            <button
                              onClick={() => {
                                setModeQuery('');
                                getUsers(query, '', mobileQuery, emailQuery, codeQuery);
                                setShowModeSearch(false);
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
                          onClick={() => getUsers(query, modeQuery, mobileQuery, emailQuery, codeQuery)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 focus:outline-none"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </TableHead>
                <TableHead className="border-r border-gray-300">Shop</TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && users?.length > 0 ? (
                users.map((item, index) => (
                  <TableRow key={item.id || index}>
                    <TableCell className="border-r border-gray-200">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                    <TableCell
                      className="border-r border-gray-200 font-medium relative"
                      onMouseEnter={() => setHoveredRow(item.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {editingRowId === item.id && editingColumn === 'code' ? (
                        <div ref={dropdownRef} className="flex items-center gap-2">
                          <input
                            type="text"
                            className="border rounded px-2 py-1 text-sm"
                            value={editedCode}
                            onChange={(e) => setEditedCode(e.target.value)}
                          />

                          {/* OK Button */}
                          <button
                            onClick={() => handleCodeChange(item.id)}
                            className="text-green-600 hover:text-green-800"
                            title="Save"
                          >
                            ✅
                          </button>

                          {/* Cancel Button */}
                          <button
                            onClick={() => {
                              setEditingRowId(null);
                              setHoveredRow(null);
                              setEditingColumn(null);
                            }}
                            className="text-red-500 hover:text-red-700 text-sm"
                            title="Cancel"
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <span
                          className={`cursor-pointer ${hoveredRow === item.id ? "text-blue-600 underline" : ""}`}
                          onClick={() => {
                            setEditingRowId(item.id);
                            setEditingColumn('code');
                            setEditedCode(item?.profile?.up_code_prefix || '');
                          }}
                        >
                          {hoveredRow === item.id ? <Pencil size={18} /> : (item?.profile?.up_code_prefix || "N/A")}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="border-r border-gray-200">{item?.name}</TableCell>
                    <TableCell className="border-r border-gray-200">{item?.profile?.up_company || "N/A"}</TableCell>
                    <TableCell className="border-r border-gray-200">+880</TableCell>
                    <TableCell className="border-r border-gray-200">{item?.phone}</TableCell>
                    <TableCell className="border-r border-gray-200">{item?.email}</TableCell>

                    {/* <TableCell>{item?.user_mode}</TableCell> */}

                    {
                      item.user_mode == 'supreme' ? (
                        <TableCell className="border-r border-gray-200 font-medium">Super Admin</TableCell>
                      ) : (
                        <TableCell
                          className="border-r border-gray-200 font-medium relative"
                          onMouseEnter={() => setHoveredRow(item.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                        >
                          {editingRowId === item.id && editingColumn === 'mode' ? (
                            <div ref={dropdownRef} className="flex items-center gap-2">
                              <select
                                className="border rounded px-2 py-1 text-sm"
                                value={editedMode}
                                onChange={(e) => setEditedMode(e.target.value)}
                              >
                                <option value="partner">Partner</option>
                                <option value="member">Member</option>
                                <option value="user">User</option>
                                <option value="pbl">PB.com</option>
                                <option value="admin">System Admin</option>
                              </select>

                              {/* OK Button */}
                              <button
                                onClick={() => handleModeChange(item.id)}
                                className="text-green-600 hover:text-green-800"
                                title="Save"
                              >
                                ✅
                              </button>

                              {/* Cancel Button */}
                              <button
                                onClick={() => {
                                  setEditingRowId(null);
                                  setHoveredRow(null);
                                  setEditingColumn(null);
                                }}
                                className="text-red-500 hover:text-red-700 text-sm"
                                title="Cancel"
                              >
                                ❌
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`cursor-pointer ${hoveredRow === item.id ? "text-blue-600 underline" : ""
                                }`}
                              onClick={() => {
                                setEditingRowId(item.id);
                                setEditingColumn('mode');
                                setEditedMode(item.user_mode);
                              }}
                            >
                              {hoveredRow === item.id ? <Pencil size={18} /> : item.user_mode === 'pbl' ? 'PB.com' : item.user_mode.charAt(0).toUpperCase() + item.user_mode.slice(1)}
                            </span>
                          )}
                        </TableCell>
                      )
                    }

                    {/* Shop View */}
                    <TableCell className="border-r border-gray-200">
                      <button
                        onClick={() => handleShow(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye size={18} />
                      </button>
                    </TableCell>

                    {/* ✅ Toggle Switch for Status */}
                    <TableCell className="border-r border-gray-200">
                      <StatusToggle item={item} onToggle={handleToggleStatus} />
                    </TableCell>

                    {/* Action buttons */}
                    <TableCell className="space-x-3">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => handlePasswordChange(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <KeyRound size={18} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-6">
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                        <span>Loading...</span>
                      </div>
                    ) : (
                      "No Users found."
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

      {/* Modals */}
      <UserShopListModel
        open={open}
        setOpen={() => setOpen(false)}
        selectedModel={selectedModel}
        shops={shops}
      />

      <PasswordChangeModal
        open={passwordModalOpen}
        setOpen={setPasswordModalOpen}
        selectedData={selectedModel}
      />


      <UserEditModel
        open={openEditModal}
        setOpen={setOpenEditModal}
        selectedData={selectedEditData}
        users={users}
        setUsers={setUsers}
      />
    </div>
  );
};

export default User;
