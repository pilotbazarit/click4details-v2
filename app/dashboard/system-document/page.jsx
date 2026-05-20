"use client";

import React, { useEffect, useState } from "react";
import Footer from "@/components/dashboard/Footer";
import { Button } from "@/components/ui/button";
import TableFilter from "@/components/TableFilter";
import Pagination from "@/components/Pagination";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import SystemDocumentService from "@/services/SystemDocumentService";
import SystemDocumentModal from "@/components/modals/SystemDocumentModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppContext } from "@/context/AppContext";
import { hasPermission } from "@/lib/utils";

const formatDate = (value) => {
  if (!value) return "N/A";
  return String(value).split(" ")[0];
};

const SystemDocument = () => {
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [systemDocuments, setSystemDocuments] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const { permissionList, user } = useAppContext();

  const canShowAddSystemDocumentButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "SystemDocument", "ShowSystemDocumentAddButton")

  const canShowEditSystemDocumentButton =
    (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
    hasPermission(permissionList, 0, "SystemDocument", "ShowSystemDocumentEditButton")

  // const canShowDeleteSystemDocumentButton =
  //   (user?.user_mode !== "pbl" && user?.user_mode !== "admin") ||
  //   hasPermission(permissionList, 0, "SystemDocument", "ShowSystemDocumentDeleteButton")



  const getSystemDocuments = async (
    value = searchQuery,
    page = currentPage,
    perPage = itemsPerPage
  ) => {
    try {
      setLoading(true);
      const response = await SystemDocumentService.Queries.getSystemDocuments({
        _page: page,
        _perPage: perPage,
        _name: value,
      });

      if (response?.status === "success") {
        const documents = Array.isArray(response?.data?.data) ? response.data.data : [];

        setSystemDocuments(documents);
        setTotalItems(response?.data?.total || 0);
        return;
      }

      setSystemDocuments([]);
      setTotalItems(0);
      toast.error(response?.message || "Failed to fetch system documents");
    } catch (error) {
      setSystemDocuments([]);
      setTotalItems(0);
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to fetch system documents"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchResults = () => {
    setCurrentPage(1);
    setSearchQuery(query.trim());
  };

  const handleEdit = (item) => {
    setSelectedDocument(item);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this document!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await SystemDocumentService.Commands.deleteSystemDocument(id);

      if (response?.status === "success") {
        await Swal.fire({
          title: "Deleted!",
          text: response?.message || "System document deleted successfully!",
          icon: "success",
        });

        if (currentPage > 1 && systemDocuments.length === 1) {
          setCurrentPage((prevPage) => prevPage - 1);
        } else {
          await getSystemDocuments(searchQuery, currentPage, itemsPerPage);
        }

        return;
      }

      toast.error(response?.message || "Failed to delete system document");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to delete system document"
      );
    }
  };

  const handleModalClose = (isOpen) => {
    setOpen(isOpen);

    if (!isOpen) {
      setSelectedDocument(null);
    }
  };

  const handleClearSearch = () => {
    setCurrentPage(1);
    setSearchQuery("");
  };

  useEffect(() => {
    getSystemDocuments(searchQuery, currentPage, itemsPerPage);
  }, [searchQuery, currentPage, itemsPerPage]);

  useEffect(() => {
    if (query.trim() === "" && searchQuery !== "") {
      setCurrentPage(1);
      setSearchQuery("");
    }
  }, [query, searchQuery]);

  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="flex flex-col min-h-screen w-full justify-between bg-gray-50 px-6">
      <main className="mx-auto bg-white rounded-lg shadow-lg border border-gray-200 p-6 my-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <h2 className="text-xl text-gray-800">All System Documents</h2>

          {
            canShowAddSystemDocumentButton && (
              <Button
                onClick={() => {
                  setSelectedDocument(null);
                  setOpen(true);
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add System Document
              </Button>
            )
          }


        </div>

        <TableFilter
          query={query}
          setQuery={setQuery}
          setCurrentPage={setCurrentPage}
          fetchSearchResults={fetchSearchResults}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          placeholder="Search by name..."
          onClearSearch={handleClearSearch}
        />

        <div className="overflow-x-auto rounded-md border border-gray-300 mt-4">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="border-b border-gray-300">
                <TableHead className="w-[60px] border-r border-gray-300 text-center">
                  SL
                </TableHead>
                <TableHead className="border-r border-gray-300">Name</TableHead>
                <TableHead className="border-r border-gray-300">Type ID</TableHead>
                <TableHead className="border-r border-gray-300">Date</TableHead>
                <TableHead className="border-r border-gray-300">Documents</TableHead>
                <TableHead className="border-r border-gray-300">Status</TableHead>
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

            <TableBody>
              {!loading && systemDocuments.length > 0 ? (
                systemDocuments.map((item, index) => (
                  <TableRow
                    key={item.sd_id || index}
                    className="border-b border-gray-200"
                  >
                    <TableCell className="border-r border-gray-200 text-center">
                      {startIndex + index + 1}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      {item.sd_name || "N/A"}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      {item.sd_type_id || "N/A"}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      {formatDate(item.sd_date)}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      {Array.isArray(item.sd_docs) && item.sd_docs.length > 0 ? (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500">
                            {item.sd_docs.length} file
                            {item.sd_docs.length > 1 ? "s" : ""}
                          </p>
                          {item.sd_docs.slice(0, 2).map((doc, docIndex) => {
                            const fileUrl = doc?.secure_url || doc?.url;

                            if (!fileUrl) {
                              return (
                                <span
                                  key={`doc-${docIndex}`}
                                  className="block text-gray-500"
                                >
                                  {`Document ${docIndex + 1}`}
                                </span>
                              );
                            }

                            return (
                              <a
                                key={`${fileUrl}-${docIndex}`}
                                href={fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="block text-blue-600 hover:underline"
                              >
                                {`View doc ${docIndex + 1}`}
                              </a>
                            );
                          })}
                          {item.sd_docs.length > 2 && (
                            <p className="text-xs text-gray-500">
                              +{item.sd_docs.length - 2} more
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No docs</span>
                      )}
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-semibold ${Number(item.sd_status) === 1
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}
                      >
                        {Number(item.sd_status) === 1 ? "Active" : "Inactive"}
                      </span>
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium max-w-xs">
                      <p className="whitespace-pre-wrap break-words">
                        {item.sd_desc || "N/A"}
                      </p>
                    </TableCell>
                    <TableCell className="border-r border-gray-200 font-medium">
                      <div className="flex justify-center gap-2">

                        {
                          canShowEditSystemDocumentButton && (
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-blue-600 hover:text-blue-800"
                              aria-label={`Edit ${item.sd_name}`}
                            >
                              <Pencil size={18} />
                            </button>
                          )
                        }



                        {/* <button
                          onClick={() => handleDelete(item.sd_id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label={`Delete ${item.sd_name}`}
                        >
                          <Trash2 size={18} />
                        </button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-[300px] md:h-[300px] lg:h-[400px] xl:h-[600px] text-center py-4 text-gray-500"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="animate-spin w-5 h-5 text-blue-500" />
                        <span className="text-gray-500 font-semibold">
                          Loading...
                        </span>
                      </div>
                    ) : (
                      <div>No system document found.</div>
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

      <SystemDocumentModal
        open={open}
        setOpen={handleModalClose}
        getSystemDocuments={() =>
          getSystemDocuments(searchQuery, currentPage, itemsPerPage)
        }
        initialData={selectedDocument}
      />
    </div>
  );
};

export default SystemDocument;
