"use client";

import { API_URL } from "@/helpers/apiUrl";
import { createApiRequest } from "@/helpers/axios";
import { CheckCircle, Clipboard, Headset, MessageSquare, Plus, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import FeedbackListModal from "../modals/FeedbackListModal.jsx";
import FeedbackModal from "../modals/FeedbackModal.jsx";
import FollowupMessageListModal from "../modals/FollowupMessageListModal.jsx";
import FollowupMessageModal from "../modals/FollowupMessageModal.jsx";
import FollowupModal from "../modals/FollowupModal.jsx";
import TransferFollowupModal from "../modals/TransferFollowupModal.jsx";

const CustomerCareDashboard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMessageListModalOpen, setIsMessageListModalOpen] = useState(false);
  const [recentFollowups, setRecentFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedFollowup, setSelectedFollowup] = useState(null);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedFeedbackFollowup, setSelectedFeedbackFollowup] = useState(null);
  const [isFeedbackListModalOpen, setIsFeedbackListModalOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loadingFeedbacks, setLoadingFeedbacks] = useState(false);

  // New state to hold the followup_detail_id when opening feedback modal
  const [selectedFollowupDetailId, setSelectedFollowupDetailId] = useState(null);

  // New state for followup entry
  const [isFollowupModalOpen, setIsFollowupModalOpen] = useState(false);
  const [selectedFollowupForEdit, setSelectedFollowupForEdit] = useState(null);
  const [followupModalKey, setFollowupModalKey] = useState(0);

  // State for complete confirmation modal
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completeFollowupId, setCompleteFollowupId] = useState(null);

  // State for transfer modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferFollowupId, setTransferFollowupId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);

  // Sorting state
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Search state
  const [search, setSearch] = useState("");

  const commandApi = useMemo(() => createApiRequest(API_URL), []);

  const handleCopyToClipboard = (text) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        console.log("Failed to copy: ", err);
        toast.error("Failed to copy to clipboard.");
      });
  };

  const handleOpenModal = (followup) => {
    setSelectedFollowup(followup);
    setCurrentMessage(null); // Ensure add mode
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFollowup(null);
    setCurrentMessage(null);
  };

  // New handlers for followup entry
  const handleOpenFollowupModal = (followup = null) => {
    setFollowupModalKey((prevKey) => prevKey + 1); // Increment key to force re-mount
    setSelectedFollowupForEdit(followup);
    setIsFollowupModalOpen(true);
  };

  const handleCloseFollowupModal = () => {
    setIsFollowupModalOpen(false);
    setSelectedFollowupForEdit(null);
  };

  const handleFollowupSuccess = () => {
    toast.success(selectedFollowupForEdit ? "Followup updated successfully!" : "Followup created successfully!");
    fetchRecentFollowups(); // Refresh the list
    handleCloseFollowupModal();
  };

  const handleSubmitPackageDetails = ({ selectedFollowupPackage, stage, startDate, visitDate }) => {
    console.log("Package to send:", selectedFollowupPackage);
    console.log("Stage:", stage);
    console.log("Start Date:", startDate);
    console.log("Visit Date:", visitDate);
    // Here you would typically send the package details to your backend or perform other actions
    handleCloseModal();
  };

  const handleMessageCountClick = async (followup) => {
    setSelectedFollowup(followup);
    setIsMessageListModalOpen(true);
    setLoadingMessages(true);
    try {
      const response = await commandApi.get(`/api/followup-messages/by-followup/${followup.id}`);
      if (response.status === "success") {
        setMessages(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch messages.");
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSubmitMessageDetails = async (messageDetails) => {
    if (!selectedFollowup) {
      console.log("No followup selected");
      return;
    }

    const payload = {
      ...messageDetails,
      customer_id: selectedFollowup.customer.id,
      followup_id: selectedFollowup.id,
    };

    try {
      const response = await commandApi.post("/api/followup-messages", payload);
      toast.success(response.message || "Followup message saved successfully!");
      // Optionally, you can refresh the followups list here
      // fetchRecentFollowups();
    } catch (error) {
      console.log("Failed to save followup message:", error.response ? error.response.data : error.message);
      toast.error(error.response?.data?.message || "Failed to save followup message.");
    } finally {
      handleCloseModal();
    }
  };

  const handleOpenFeedbackModal = (followup, followupDetailId = null) => {
    setSelectedFeedbackFollowup(followup);
    setSelectedFollowupDetailId(followupDetailId);
    setIsFeedbackModalOpen(true);
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
    setSelectedFeedbackFollowup(null);
  };

  const handleMarkAsComplete = (followupId) => {
    setCompleteFollowupId(followupId);
    setShowCompleteConfirm(true);
  };

  const confirmComplete = async () => {
    try {
      const response = await commandApi.put(`/api/followups/${completeFollowupId}/complete`);
      if (response.status === "success") {
        toast.success("Followup marked as complete!");
        fetchRecentFollowups(); // Refresh the list
      } else {
        toast.error(response.message || "Failed to mark followup as complete.");
      }
      fetchRecentFollowups(); // Refresh the list
    } catch (error) {
      console.log("Error marking followup as complete:", error);
      toast.error("Failed to mark followup as complete.");
    } finally {
      setShowCompleteConfirm(false);
      setCompleteFollowupId(null);
    }
  };

  const handleTransfer = (followupId) => {
    setTransferFollowupId(followupId);
    setIsTransferModalOpen(true);
  };

  const handleTransferSuccess = () => {
    fetchRecentFollowups();
    setIsTransferModalOpen(false);
    setTransferFollowupId(null);
  };

  const handleFeedbackSuccess = () => {
    toast.success("Feedback saved successfully!");
    // Refresh the followups list to update feedback count
    fetchRecentFollowups();
  };

  const handleFeedbackCountClick = async (followup, followup_detail_id) => {
    setSelectedFeedbackFollowup(followup);
    setIsFeedbackListModalOpen(true);
    setLoadingFeedbacks(true);
    try {
      const response = await commandApi.get(`/api/feedbacks/by-followup/${followup_detail_id}`);
      if (response.status === "success") {
        setFeedbacks(response.data || []);
      }
    } catch (error) {
      toast.error("Failed to fetch feedbacks.");
    } finally {
      setLoadingFeedbacks(false);
    }
  };

  const fetchRecentFollowups = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        perPage: perPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        page_name: "customer_care_dashboard",
      });

      if (search && search.trim()) {
        params.append("search", search.trim());
      }

      const response = await commandApi.get(`/api/followups?${params.toString()}`);

      if (response && response.status === "success") {
        setRecentFollowups(response.data?.data || []);
        setTotal(response.data.pagination.total);
        setLastPage(response.data.pagination.last_page);
      }
    } catch (error) {
      console.log("Error fetching recent followups:", error);
      setRecentFollowups([]);
      setTotal(0);
      setLastPage(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, perPage, sortBy, sortOrder, search, commandApi]);

  useEffect(() => {
    fetchRecentFollowups();
  }, [fetchRecentFollowups]);

  // Separate useEffect for search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRecentFollowups();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [search, fetchRecentFollowups]);

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

  const handlePerPageChange = (newPerPage) => {
    setPerPage(newPerPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setCurrentPage(1);
  };

  return (
    <div className="w-full  p-6 space-y-6 ">
      {/* Next.js and Tailwind CSS implementation */}
      <img
        src="https://static.vecteezy.com/system/resources/thumbnails/000/701/690/small/abstract-polygonal-banner-background.jpg"
        alt="Banner"
        className="w-full h-[200px] mb-6"
      />
      <div className="pt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Today's Tasks</h3>
          {/* Add New Followup Button */}
          <button
            onClick={() => handleOpenFollowupModal()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Followup
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* KPI Card 1: Total Customers Today */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Headset className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Customers Today</p>
            <h2 className="text-2xl font-bold text-gray-800">{total}</h2>
          </div>
        </div>

        {/* KPI Card 2: Total Jobs Today */}
        <div className="bg-white p-4 rounded-lg shadow flex items-center space-x-4">
          <div className="p-3 bg-green-100 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Jobs Today</p>
            <h2 className="text-2xl font-bold text-gray-800">320</h2>
          </div>
        </div>
      </div>

      {/* Recent Followups Section */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <a href="/dashboard/followups" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All →
            </a>
          </div>
        </div>

        {/* Search and Controls */}
        <div className="p-4 flex items-center justify-between space-x-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search followups..."
              value={search}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select value={perPage} onChange={(e) => handlePerPageChange(Number(e.target.value))} className="px-2 py-1 border border-gray-300 rounded text-sm">
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing {(currentPage - 1) * perPage + 1} to {Math.min(currentPage * perPage, total)} of {total} entries
            </span>
          </div>
        </div>

        <div className="p-4 w-full">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-600">Loading recent followups...</span>
            </div>
          ) : recentFollowups.length > 0 ? (
            <>
              <table className="min-w-full border-collapse border-2 border-gray-200">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200">#</th>
                    <th
                      className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200 cursor-pointer"
                      onClick={() => handleSort("customer_name")}
                    >
                      Customer Name {sortBy === "customer_name" && (sortOrder === "asc" ? "↑" : "↓")}
                    </th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200 w-[50%]">Message</th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200">What's App</th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200">Call</th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200">Feedback</th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200">Transferred To</th>
                    <th className="px-2 py-1 text-center font-medium text-gray-700 border-2 border-gray-200 w-[15%]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recentFollowups.map((recentFollowup, index) => (
                    <tr key={recentFollowup.id} className={`hover:bg-gray-50 ${recentFollowup.status === 1 ? "bg-green-50" : ""}`}>
                      <td className="px-2 py-1 border-2 border-gray-200 text-center">{(currentPage - 1) * perPage + index + 1}</td>
                      <td className="px-2 py-1 border border-gray-200">
                        {recentFollowup.followup.customer?.id ? (
                          <a href={`/dashboard/customers/${recentFollowup.followup.customer.id}`} className="text-blue-600 hover:underline font-medium">
                            {recentFollowup.followup.customer.name}
                          </a>
                        ) : (
                          <span>{recentFollowup.followup.customer?.name || "Unknown Customer"}</span>
                        )}
                        <br />
                        <small className="text-gray-500">{recentFollowup.followup.customer?.mobile || "N/A"}</small>
                      </td>
                      <td className="px-2 py-1 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs">{recentFollowup.message_template}</span>
                          {recentFollowup.message_template && (
                            <button
                              type="button"
                              onClick={() => handleCopyToClipboard(recentFollowup.message_template)}
                              className="ml-2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              title="Copy message to clipboard"
                            >
                              <Clipboard className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        {recentFollowup.followup.followup_messages_count > 0 && (
                          <button className="text-blue-600 hover:text-blue-800" onClick={() => handleMessageCountClick(recentFollowup)}>
                            <span className="text-gray-500 ml-1">({recentFollowup.followup.followup_messages_count})</span>
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-200 text-center">
                        <a
                          href={`https://wa.me/${recentFollowup.followup.customer?.mobile || ""}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-800"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" />
                          </svg>
                        </a>
                      </td>
                      <td className="px-2 py-1 border border-gray-200 text-center">
                        {recentFollowup.include_call === 1 && (
                          <button className="text-blue-600 hover:text-blue-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                stroke="currentColor"
                                strokeWidth="2"
                                d="M22 16.92V19a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3 5.18 2 2 0 0 1 5 3h2.09a2 2 0 0 1 2 1.72c.13 1.06.37 2.09.72 3.08a2 2 0 0 1-.45 2.11l-1.27 1.27a16 16 0 0 0 6.58 6.58l1.27-1.27a2 2 0 0 1 2.11-.45c.99.35 2.02.59 3.08.72A2 2 0 0 1 22 16.92z"
                              />
                            </svg>
                          </button>
                        )}
                      </td>
                      <td className="px-2 py-1 border border-gray-200 text-center">
                        {recentFollowup.status !== 1 && (
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            onClick={() => handleOpenFeedbackModal(recentFollowup.followup, recentFollowup.id)}
                            title="Add Feedback"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                              />
                            </svg>
                          </button>
                        )}
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => handleFeedbackCountClick(recentFollowup.followup, recentFollowup.id)}
                        >
                          <span className="text-gray-500 ml-1">({recentFollowup.feedbacks?.length})</span>
                        </button>
                      </td>
                      <td className="px-2 py-1 border border-gray-200 text-center">{recentFollowup.transferred_to && recentFollowup.transferred_to.name}</td>
                      <td className="px-2 py-1 space-x-2 border border-gray-200 text-center">
                        {recentFollowup.status !== 1 && (
                          <>
                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-green-300 text-xs font-medium rounded-md text-green-700 bg-green-50 hover:bg-green-100 hover:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 transition-colors duration-200"
                              onClick={() => handleMarkAsComplete(recentFollowup.id)}
                              title="Mark as Complete"
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Complete
                            </button>
                            <button
                              className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-xs font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors duration-200"
                              onClick={() => handleTransfer(recentFollowup.id)}
                              title="Transfer"
                            >
                              <RefreshCcw className="w-3 h-3 mr-1" />
                              Transfer
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === lastPage}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{lastPage}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        First
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === lastPage}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                      <button
                        onClick={() => handlePageChange(lastPage)}
                        disabled={currentPage === lastPage}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                      >
                        Last
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recent followups found</p>
              <p className="text-sm text-gray-400 mt-1">Followups will appear here once created</p>
            </div>
          )}
        </div>
      </div>

      <FollowupMessageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmitMessageDetails={handleSubmitMessageDetails}
        currentMessage={currentMessage}
      />
      <FollowupMessageListModal
        isOpen={isMessageListModalOpen}
        onClose={() => setIsMessageListModalOpen(false)}
        messages={messages}
        loading={loadingMessages}
      />
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={handleCloseFeedbackModal}
        onSuccess={handleFeedbackSuccess}
        feedback={null} // Always create new feedback
        initialData={{
          customer: selectedFeedbackFollowup?.customer,
          followup: selectedFeedbackFollowup,
          followup_detail_id: selectedFollowupDetailId, // Pass followup_detail_id
        }}
      />
      <FeedbackListModal
        isOpen={isFeedbackListModalOpen}
        onClose={() => setIsFeedbackListModalOpen(false)}
        feedbacks={feedbacks}
        loading={loadingFeedbacks}
        followup={selectedFeedbackFollowup}
      />
      {/* Followup Modal for creating/editing followups */}
      <FollowupModal
        key={followupModalKey}
        isOpen={isFollowupModalOpen}
        onClose={handleCloseFollowupModal}
        onSuccess={handleFollowupSuccess}
        followup={selectedFollowupForEdit}
      />

      <TransferFollowupModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        onSuccess={handleTransferSuccess}
        followupId={transferFollowupId}
      />

      {/* Complete Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Confirm Completion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to mark this followup as complete?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCompleteConfirm(false)}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={confirmComplete}
                className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerCareDashboard;
