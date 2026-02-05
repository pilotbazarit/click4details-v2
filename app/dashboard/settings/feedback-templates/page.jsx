"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import FeedbackTemplateModal from "@/components/modals/FeedbackTemplateModal";
import FeedbackTemplateService from "@/services/FeedbackTemplateService";
import { Copy, Edit, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const FeedbackTemplatesPage = () => {
  const [feedbackTemplates, setFeedbackTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeedbackTemplate, setEditingFeedbackTemplate] = useState(null);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [feedbackTemplateToDeleteId, setFeedbackTemplateToDeleteId] = useState(null);

  // Pagination, Sorting, and Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  const TruncatedText = ({ text, maxLength }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!text || text.length <= maxLength) {
      return <div>{text}</div>;
    }

    return (
      <div>
        {isExpanded ? (
          <div>
            {text}
            <button onClick={() => setIsExpanded(false)} className="text-blue-600 hover:underline ml-2">
              Show Less
            </button>
          </div>
        ) : (
          <div>
            {`${text.substring(0, maxLength)}...`}
            <button onClick={() => setIsExpanded(true)} className="text-blue-600 hover:underline ml-2">
              Show More
            </button>
          </div>
        )}
      </div>
    );
  };

  const fetchFeedbackTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        perPage: perPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        search: search,
      });

      const response = await FeedbackTemplateService.Queries.getFeedbackTemplateList(params);

      if (response && response.data) {
        setFeedbackTemplates(response.data || []);
        setTotalPages(response.meta.last_page || 1);
        setTotalRecords(response.meta.total || 0);
      } else {
        toast.error("Failed to load feedback templates");
        setFeedbackTemplates([]);
      }
    } catch (error) {
      toast.error("Failed to fetch feedback templates");
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, sortBy, sortOrder, search]);

  useEffect(() => {
    fetchFeedbackTemplates();
  }, [fetchFeedbackTemplates]);

  const handleSearchChange = (e) => {
    setCurrentPage(1);
    setSearch(e.target.value);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePerPageChange = (e) => {
    setPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handleEdit = (feedbackTemplate) => {
    setEditingFeedbackTemplate(feedbackTemplate);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setFeedbackTemplateToDeleteId(id);
    setShowConfirmDialog(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await FeedbackTemplateService.Commands.deleteFeedbackTemplate(feedbackTemplateToDeleteId);
      if (response.success) {
        toast.success("Feedback template deleted successfully");
        fetchFeedbackTemplates();
      }
    } catch (error) {
      toast.error("Failed to delete feedback template");
      console.error("Error deleting feedback template:", error);
    } finally {
      setShowConfirmDialog(false);
      setFeedbackTemplateToDeleteId(null);
    }
  };

  const handleCopy = (message) => {
    navigator.clipboard.writeText(message);
    toast.success("Message copied to clipboard");
  };

  const openModal = () => {
    setEditingFeedbackTemplate(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFeedbackTemplate(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Templates</h1>
        <button
          onClick={openModal}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Feedback Template
        </button>
      </div>

      {/* Search and Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={handleSearchChange}
            className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Show:</label>
          <select value={perPage} onChange={handlePerPageChange} className="px-2 py-1 border border-gray-300 rounded text-sm">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Messages Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 table-fixed">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-12">Sr.</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <button onClick={() => handleSort("title")} className="flex items-center">
                    Title
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <button onClick={() => handleSort("category")} className="flex items-center whitespace-nowrap">
                    Category
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[35%]">Audio</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[35%]">Message</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[35%]">Instruction</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <button onClick={() => handleSort("status")} className="flex items-center">
                    Status
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center">
                    <LoadingSpinner message="Loading templates..." />
                  </td>
                </tr>
              ) : feedbackTemplates.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center text-gray-500">
                    No feedback templates found
                  </td>
                </tr>
              ) : (
                feedbackTemplates.map((feedbackTemplate, index) => (
                  <tr key={feedbackTemplate.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div>{feedbackTemplate.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{feedbackTemplate.category}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        {feedbackTemplate.audio ? (
                          <>
                            <audio controls src={feedbackTemplate.audio.url} className="w-64" />
                            <button onClick={() => handleCopy(feedbackTemplate.audio.url)} className="text-gray-600 hover:text-gray-900" title="Copy URL">
                              <Copy className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          "No audio"
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center justify-between">
                        <div className="whitespace-pre-wrap break-words pr-2">{feedbackTemplate.message}</div>
                        <button onClick={() => handleCopy(feedbackTemplate.message)} className="text-gray-600 hover:text-gray-900" title="Copy">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <TruncatedText text={feedbackTemplate.instruction} maxLength={50} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          feedbackTemplate.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {feedbackTemplate.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button onClick={() => handleEdit(feedbackTemplate)} className="text-blue-600 hover:text-blue-900" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(feedbackTemplate.id)} className="text-red-600 hover:text-red-900" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(currentPage - 1) * perPage + 1}</span> to{" "}
            <span className="font-medium">{Math.min(currentPage * perPage, totalRecords)}</span> of <span className="font-medium">{totalRecords}</span> results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                    currentPage === page ? "z-10 bg-blue-50 border-blue-500 text-blue-600" : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              );
            })}{" "}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Template Modal */}
      <FeedbackTemplateModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={fetchFeedbackTemplates}
        editingTemplate={editingFeedbackTemplate}
      />

      {/* Delete Confirmation */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
            <p className="mb-4">Are you sure you want to delete this feedback template?</p>
            <div className="flex justify-end space-x-4">
              <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400" onClick={() => setShowConfirmDialog(false)}>
                Cancel
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackTemplatesPage;
