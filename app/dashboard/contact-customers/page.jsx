"use client";

import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Footer from "@/components/dashboard/Footer";
import Pagination from "@/components/Pagination";
import TableFilter from "@/components/TableFilter";
import ContactCustomerModal from "@/components/modals/ContactCustomerModal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ContactCustomerService from "@/services/ContactCustomerService";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";
import { parseStoredUser } from "@/lib/parseStoredUser";

const normalizeUserData = (rawUser) => parseStoredUser(rawUser);

const getStoredUser = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return normalizeUserData(localStorage.getItem("user"));
  } catch (error) {
    console.error("Failed to read user from storage:", error);
    return null;
  }
};

const getContactCustomerListFromResponse = (response) => {
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.list)) return response.list;
  if (Array.isArray(response)) return response;
  return [];
};

const getContactCustomerTotalFromResponse = (response, fallbackTotal = 0) => {
  const possibleTotals = [
    response?.data?.total,
    response?.total,
    response?.meta?.total,
    response?.data?.meta?.total,
    response?.pagination?.total,
    response?.data?.pagination?.total,
  ];

  const total = possibleTotals.find((value) => Number.isFinite(Number(value)));
  return total === undefined ? fallbackTotal : Number(total);
};

const getContactCustomerStatusMeta = (value) => {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (["1", "active", "true", "yes"].includes(normalized)) {
    return {
      value: "1",
      label: "Active",
      className: "bg-green-100 text-green-700",
    };
  }

  return {
    value: "0",
    label: "Inactive",
    className: "bg-red-100 text-red-700",
  };
};

const normalizeContactCustomer = (item = {}) => {
  const statusMeta = getContactCustomerStatusMeta(
    item?.cci_status ?? item?.status ?? item?.is_active
  );

  return {
    id:
      item?.cci_id ??
      item?.id ??
      item?.contact_info_id ??
      item?.customer_contact_info_id ??
      null,
    userId: String(
      item?.cci_user_id ??
      item?.user_id ??
      item?.user?.id ??
      item?.user?.u_id ??
      ""
    ),
    userName: String(
      item?.cci_user_name ??
      item?.user_name ??
      item?.user?.name ??
      item?.user?.u_name ??
      ""
    ).trim(),
    customerId: String(
      item?.cci_customer_id ??
      item?.customer_id ??
      item?.customer?.id ??
      ""
    ).trim(),
    customerName: String(
      item?.cci_customer_name ??
      item?.customer_name ??
      item?.customer?.name ??
      ""
    ).trim(),
    name: String(item?.cci_name ?? item?.name ?? "").trim(),
    phone: String(item?.cci_phone ?? item?.phone ?? "").trim(),
    address: String(item?.cci_address ?? item?.address ?? "").trim(),
    description: String(
      item?.cci_desc ?? item?.description ?? item?.desc ?? ""
    ).trim(),
    nid: String(item?.cci_nid ?? item?.nid ?? "").trim(),
    statusValue: statusMeta.value,
    statusLabel: statusMeta.label,
    statusClassName: statusMeta.className,
    createdAt:
      item?.created_at ??
      item?.cci_created_at ??
      item?.createdAt ??
      item?.updated_at ??
      "",
  };
};

const formatContactCustomerDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const parsedDate = dayjs(value);
  if (!parsedDate.isValid()) {
    return "N/A";
  }

  return parsedDate.format("DD MMM YYYY");
};

const ContactCustomersPage = () => {
  const { permissionList, user, loading: userLoading } = useAppContext();


  const canShowAddContactCustomerButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "ContactCustomer", "ShowContactCustomerAddButton")

  const canShowEditContactCustomerButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "ContactCustomer", "ShowContactCustomerEditButton")

  const canShowDeleteContactCustomerButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "ContactCustomer", "ShowContactCustomerDeleteButton")


  const parsedUser = useMemo(
    () => normalizeUserData(user) || getStoredUser(),
    [user]
  );

  const currentUserId = String(parsedUser?.id ?? parsedUser?.u_id ?? "");

  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactCustomers, setContactCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const activeUserId = currentUserId;
  const activeUserLabel = useMemo(() => {
    const labelParts = [
      parsedUser?.name,
      parsedUser?.phone,
      parsedUser?.email,
    ].filter(Boolean);

    return labelParts.length > 0
      ? labelParts.join(" | ")
      : activeUserId
        ? `User #${activeUserId}`
        : "";
  }, [activeUserId, parsedUser?.email, parsedUser?.name, parsedUser?.phone]);

  const getContactCustomers = async (
    value = searchQuery,
    page = currentPage,
    perPage = itemsPerPage,
    targetUserId = activeUserId
  ) => {
    if (!targetUserId) {
      setContactCustomers([]);
      setTotalItems(0);
      return;
    }

    try {
      setLoading(true);
      const params = {
        _user_id: targetUserId,
        _page: page,
        _perPage: perPage,
      };

      const trimmedValue = String(value || "").trim();
      if (trimmedValue) {
        params._name = trimmedValue;
      }

      const response =
        await ContactCustomerService.Queries.getContactCustomers(params);

      if (response?.status === "success") {
        const rows = getContactCustomerListFromResponse(response);
        setContactCustomers(rows.map(normalizeContactCustomer));
        setTotalItems(getContactCustomerTotalFromResponse(response, rows.length));
        return;
      }

      setContactCustomers([]);
      setTotalItems(0);
      toast.error(
        response?.message ||
        response?.data?.message ||
        "Failed to fetch contact customer list"
      );
    } catch (error) {
      setContactCustomers([]);
      setTotalItems(0);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch contact customer list"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getContactCustomers(searchQuery, currentPage, itemsPerPage, activeUserId);
  }, [activeUserId, searchQuery, currentPage, itemsPerPage]);

  useEffect(() => {
    if (query.trim() === "" && searchQuery !== "") {
      setCurrentPage(1);
      setSearchQuery("");
    }
  }, [query, searchQuery]);

  const fetchSearchResults = (value = query) => {
    setCurrentPage(1);
    setSearchQuery(String(value || "").trim());
  };

  const handleClearSearch = () => {
    setCurrentPage(1);
    setSearchQuery("");
  };

  const startIndex = (currentPage - 1) * itemsPerPage;

  const handleModalClose = (isOpen = false) => {
    setModalOpen(isOpen);

    if (!isOpen) {
      setSelectedItem(null);
    }
  };

  const handleAdd = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleDelete = async (item) => {
    if (!item?.id) {
      toast.error("Invalid contact customer id");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this contact customer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      const response =
        await ContactCustomerService.Commands.deleteContactCustomer(item.id);

      // if (response?.status === "success") {
      toast.success("Contact customer deleted successfully!");
      await getContactCustomers(searchQuery, currentPage, itemsPerPage, activeUserId);
      return;
      // }

      // toast.error(
      //   response?.message ||
      //     response?.data?.message ||
      //     "Failed to delete contact customer"
      // );
    } catch (error) {
      if (error?.errors) {
        Object.values(error.errors).forEach((messages) => {
          if (Array.isArray(messages) && messages[0]) {
            toast.error(messages[0]);
          }
        });
        return;
      }

      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete contact customer"
      );
    }
  };

  const handleSaved = async () => {
    handleModalClose(false);
    await getContactCustomers(searchQuery, currentPage, itemsPerPage, activeUserId);
  };

  if (userLoading && !currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          <span>Loading user...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col justify-between bg-gray-50 px-6">
      <main className="mx-auto my-6 w-full rounded-lg border border-gray-200 bg-white p-6 shadow-lg">
        <div className="mb-6 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="text-xl text-gray-800">Contact Customer List</h2>
            {activeUserLabel && (
              <p className="mt-1 text-sm text-gray-500">
                Managing contacts for {activeUserLabel}
              </p>
            )}
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">

            <Button
              variant="outline"
              onClick={() =>
                getContactCustomers(searchQuery, currentPage, itemsPerPage, activeUserId)
              }
              disabled={loading || !activeUserId}
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>


            {
              canShowAddContactCustomerButton && (
                <Button onClick={handleAdd} disabled={!activeUserId}>
                  <Plus />
                  Add Contact Customer
                </Button>
              )
            }


          </div>
        </div>

        <TableFilter
          query={query}
          setQuery={setQuery}
          setCurrentPage={setCurrentPage}
          fetchSearchResults={fetchSearchResults}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          placeholder="Search by name, phone or address..."
          onClearSearch={handleClearSearch}
        />

        <div className="mt-4 overflow-x-auto rounded-md border border-gray-300">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">
                  SL
                </TableHead>
                <TableHead className="border-r border-gray-300">Name</TableHead>
                <TableHead className="border-r border-gray-300">Phone</TableHead>
                <TableHead className="border-r border-gray-300">
                  Address
                </TableHead>
                <TableHead className="border-r border-gray-300">
                  Description
                </TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
                <TableHead className="border-r border-gray-300">Date</TableHead>
                <TableHead className="border-r border-gray-300">Action</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {!loading && contactCustomers.length > 0 ? (
                contactCustomers.map((item, index) => (
                  <TableRow
                    key={item.id || `${item.userId}-${index}`}
                    className="border-b border-gray-200"
                  >
                    <TableCell className="border-r border-gray-200 text-center font-medium">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      {item.name || "N/A"}
                    </TableCell>
                    <TableCell className="border-r border-gray-200">
                      {item.phone || "N/A"}
                    </TableCell>
                    <TableCell className="max-w-[220px] border-r border-gray-200 whitespace-normal">
                      {item.address || "N/A"}
                    </TableCell>
                    <TableCell className="max-w-[240px] border-r border-gray-200 whitespace-normal">
                      {item.description || "N/A"}
                    </TableCell>
                    <TableCell className="border-r border-gray-200">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${item.statusClassName}`}
                      >
                        {item.statusLabel}
                      </span>
                    </TableCell>
                    <TableCell className="border-r border-gray-200">
                      {formatContactCustomerDate(item.createdAt)}
                    </TableCell>
                    <TableCell className="border-r border-gray-200">
                      <div className="flex items-center gap-3">

                        {
                          canShowEditContactCustomerButton && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800"
                              aria-label="Edit contact customer"
                              disabled={!item.id}
                            >
                              <Pencil size={18} />
                            </button>
                          )
                        }
                        {
                          canShowDeleteContactCustomerButton && (
                            <button
                              onClick={() => handleDelete(item)}
                              className="text-red-600 hover:text-red-800"
                              aria-label="Delete contact customer"
                              disabled={!item.id}
                            >
                              <Trash2 size={18} />
                            </button>
                          )
                        }

                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-[300px] py-4 text-center text-gray-500"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        <span className="font-semibold text-gray-500">
                          Loading...
                        </span>
                      </div>
                    ) : (
                      <div>No contact customer found.</div>
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
            onPageChange={setCurrentPage}
          />
        </div>
      </main>

      <Footer />

      <ContactCustomerModal
        open={modalOpen}
        setOpen={handleModalClose}
        selectedItem={selectedItem}
        userId={activeUserId}
        selectedUserLabel={activeUserLabel}
        onSuccess={handleSaved}
      />
    </div>
  );
};

export default ContactCustomersPage;
