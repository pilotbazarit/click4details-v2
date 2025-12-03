"use client";
import { API_URL } from "@/helpers/apiUrl";
import { ArrowDown, ArrowRight, ChevronDown, ChevronRight, Copy, Edit, Inbox, PlusCircle, Search, Trash2, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import JoditEditor from "../ui/JoditEditor";
import LoadingSpinner from "../ui/LoadingSpinner";

const getAuthToken = () => {
  let access_token = localStorage.getItem("auth_token");
  if (!access_token) {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        if (user && user.token) {
          access_token = user.token;
        }
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage:", error);
    }
  }
  return access_token;
};

const ConversationArchivesDataTable = () => {
  const [chapters, setChapters] = useState([]);
  const [loadingChapters, setLoadingChapters] = useState(true);
  const [chapterError, setChapterError] = useState(null);

  const [showChapterModal, setShowChapterModal] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [editingChapter, setEditingChapter] = useState(null);
  const [showChapterDeleteConfirm, setShowChapterDeleteConfirm] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);

  const [showNewArchiveModal, setShowNewArchiveModal] = useState(false);
  const [newArchiveTitle, setNewArchiveTitle] = useState("");
  const [addingToChapterId, setAddingToChapterId] = useState(null);

  const [showOptionDeleteConfirm, setShowOptionDeleteConfirm] = useState(false);
  const [currentOptionTitle, setCurrentOptionTitle] = useState("");
  const [currentOptionStatus, setCurrentOptionStatus] = useState(1); // Default to active
  const [newOptionTitle, setNewOptionTitle] = useState("");
  const [newOptionStatus, setNewOptionStatus] = useState(1); // Default to active
  const [isAddingOption, setIsAddingOption] = useState(false);
  const [isUpdatingOption, setIsUpdatingOption] = useState(false);
  const [editingOptionId, setEditingOptionId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState(null);
  const [expandedSnippets, setExpandedSnippets] = useState({});

  const [editingConversationId, setEditingConversationId] = useState(null);
  const [currentConversationTitle, setCurrentConversationTitle] = useState("");
  const [isUpdatingConversation, setIsUpdatingConversation] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [showConversationDeleteConfirm, setShowConversationDeleteConfirm] = useState(false);
  const [insertionPointSlNo, setInsertionPointSlNo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [showConversationOptionsModal, setShowConversationOptionsModal] = useState(false);
  const [selectedConversationForOptions, setSelectedConversationForOptions] = useState(null);

  const archiveRefs = useRef({}); // To store refs for each archive
  const chapterInputRef = useRef(null); // New ref for chapter input
  const conversationInputRef = useRef(null); // New ref for conversation input
  const optionInputRef = useRef(null); // New ref for option input

  const fetchChapters = useCallback(async () => {
    setLoadingChapters(true);
    try {
      const response = await fetch(`${API_URL}api/chapters-with-archives`, {
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setChapters(data.data);
      } else {
        setChapterError(data.message || "Failed to fetch chapters.");
      }
    } catch (err) {
      setChapterError("Network error: Could not fetch chapters.");
      console.error(err);
    } finally {
      setLoadingChapters(false);
    }
  }, []);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  useEffect(() => {
    if (showChapterModal && editingChapter && chapterInputRef.current) {
      const input = chapterInputRef.current;
      input.selectionStart = input.value.length;
      input.selectionEnd = input.value.length;
    }
  }, [showChapterModal, editingChapter]);

  useEffect(() => {
    if (editingConversationId && conversationInputRef.current) {
      const input = conversationInputRef.current;
      input.selectionStart = input.value.length;
      input.selectionEnd = input.value.length;
    }
  }, [editingConversationId]);

  useEffect(() => {
    if (editingOptionId && optionInputRef.current) {
      const input = optionInputRef.current;
      input.selectionStart = input.value.length;
      input.selectionEnd = input.value.length;
    }
  }, [editingOptionId]);

  const handleAddChapter = async () => {
    if (!newChapterTitle.trim()) {
      alert("Chapter title cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}api/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ title: newChapterTitle }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchChapters(); // Refetch all chapters
        setNewChapterTitle("");
        setShowChapterModal(false);
      } else {
        toast.error(`Error: ${data.message || "Failed to add chapter."}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Network error. Could not add chapter.");
    }
  };

  const handleUpdateChapter = async (chapterId) => {
    if (!newChapterTitle.trim()) {
      alert("Chapter title cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}api/chapters/${chapterId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ title: newChapterTitle }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchChapters(); // Refetch all chapters
        setNewChapterTitle("");
        setEditingChapter(null);
        setShowChapterModal(false);
      } else {
        toast.error(`Error: ${data.message || "Failed to update chapter."}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Network error. Could not update chapter.");
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    try {
      const response = await fetch(`${API_URL}api/chapters/${chapterId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchChapters(); // Refetch all chapters
      } else {
        toast.error(`Error: ${data.message || "Failed to delete chapter."}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error. Could not delete chapter.");
    }
  };

  const handleSaveNewArchive = async () => {
    if (!newArchiveTitle.trim()) {
      alert("Archive title cannot be empty.");
      return;
    }

    try {
      const createdBy = 1; // TODO: Replace with actual logged-in user ID
      const response = await fetch(`${API_URL}api/conversation-archives`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          title: newArchiveTitle,
          chapter_id: addingToChapterId,
          created_by: createdBy,
          insertion_point_sl_no: insertionPointSlNo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchChapters();

        setShowNewArchiveModal(false);
        setNewArchiveTitle("");
        setAddingToChapterId(null);
        setInsertionPointSlNo(null);
      } else {
        toast.error(`Error: ${data.message || "Failed to save archive."}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Network error. Could not save archive.");
    }
  };

  const handleUpdateConversation = async (conversationId) => {
    if (!currentConversationTitle.trim()) {
      alert("Conversation title cannot be empty.");
      return;
    }

    setIsUpdatingConversation(true);
    try {
      const updatedBy = 1; // TODO: Replace with actual logged-in user ID
      const response = await fetch(`${API_URL}api/conversation-archives/${conversationId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          title: currentConversationTitle,
          updated_by: updatedBy,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchChapters(); // Refetch all chapters
        setEditingConversationId(null); // Exit edit mode
      } else {
        toast.error(`Error: ${data.message || "Failed to update conversation."}`);
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error. Could not update conversation.");
    } finally {
      setIsUpdatingConversation(false);
    }
  };

  const handleAddOption = async (archiveId) => {
    if (!newOptionTitle.trim()) {
      alert("Option text cannot be empty.");
      return;
    }

    setIsAddingOption(true);
    try {
      const response = await fetch(`${API_URL}api/conversation-archives/${archiveId}/options`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          title: newOptionTitle,
          status: newOptionStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchChapters(); // Refetch all chapters
        setNewOptionTitle("");
        setNewOptionStatus(1); // Reset to Active
      } else {
        toast.error(`Error: ${data.message || "Failed to add option."}`);
        if (data.errors) {
          console.error("Validation errors:", data.errors);
        }
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Network error. Could not add option.");
    } finally {
      setIsAddingOption(false);
    }
  };

  const handleUpdateOption = async (archiveId, optionId) => {
    if (!currentOptionTitle.trim()) {
      alert("Option title cannot be empty.");
      return;
    }

    setIsUpdatingOption(true);
    try {
      const response = await fetch(`${API_URL}api/conversation-archives/${archiveId}/options/${optionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          title: currentOptionTitle,
          status: currentOptionStatus,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchChapters(); // Refetch all chapters
        setEditingOptionId(null); // Exit edit mode
      } else {
        toast.error(`Error: ${data.message || "Failed to update option."}`);
        if (data.errors) {
          console.error("Validation errors:", data.errors);
        }
      }
    } catch (err) {
      console.error("Network error:", err);
      toast.error("Network error. Could not update option.");
    } finally {
      setIsUpdatingOption(false);
    }
  };

  const handleDeleteOption = async (archiveId, optionId) => {
    try {
      const response = await fetch(`${API_URL}api/conversation-archives/${archiveId}/options/${optionId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchChapters(); // Refetch all chapters
        setShowDeleteConfirm(false);
      } else {
        toast.error(`Error: ${data.message || "Failed to delete option."}`);
        if (data.errors) {
          console.error("Validation errors:", data.errors);
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error. Could not delete option.");
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      const response = await fetch(`${API_URL}api/conversation-archives/${conversationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        await fetchChapters(); // Re-fetch chapters
        setShowConversationDeleteConfirm(false); // Close modal after action
      } else {
        toast.error(`Error: ${data.message || "Failed to delete conversation."}`);
        if (data.errors) {
          console.error("Validation errors:", data.errors);
        }
      }
    } catch (error) {
      console.error("Network error:", error);
      toast.error("Network error. Could not delete conversation.");
    }
  };

  const htmlToPlainText = (html) => {
    if (typeof document === "undefined") return "";
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  const handleCopyToClipboard = (html) => {
    const plainText = htmlToPlainText(html);
    navigator.clipboard
      .writeText(plainText)
      .then(() => {
        console.log("handleCopyToClipboard: Success");
        toast.success("Copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.error("Failed to copy to clipboard.");
      });
  };

  const toggleSnippets = (option) => {
    setExpandedSnippets((prev) => {
      const newExpanded = { ...prev };
      if (newExpanded[option.id]) {
        delete newExpanded[option.id]; // If already expanded, collapse it
      } else {
        const plainText = htmlToPlainText(option.title);
        const snippets = plainText
          .split(/[.।]/)
          .map((s) => s.trim())
          .filter(Boolean);
        newExpanded[option.id] = snippets; // Otherwise, expand it
      }
      return newExpanded;
    });
  };

  const toggleExpand = (id) => {
    setChapters((prevChapters) =>
      prevChapters.map((chapter) => ({
        ...chapter,
        archives: chapter.archives.map((archive) => (archive.id === id ? { ...archive, isExpanded: !archive.isExpanded } : archive)),
      }))
    );
    // Scroll to the element if it's expanded
    if (archiveRefs.current[id]) {
      archiveRefs.current[id].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filteredChapters = useMemo(() => {
    if (!searchTerm) {
      return chapters;
    }
    const lowercasedFilter = searchTerm.toLowerCase();
    return chapters
      .map((chapter) => {
        if (chapter.title.toLowerCase().includes(lowercasedFilter)) {
          return chapter;
        }

        const filteredArchives = chapter.archives.filter(
          (archive) =>
            archive.title.toLowerCase().includes(lowercasedFilter) ||
            archive.formated_serial.toLowerCase().includes(lowercasedFilter) ||
            (archive.options && archive.options.some((option) => option.title.toLowerCase().includes(lowercasedFilter)))
        );

        if (filteredArchives.length > 0) {
          return { ...chapter, archives: filteredArchives };
        }
        return null;
      })
      .filter(Boolean);
  }, [searchTerm, chapters]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* New flex container */}

      <div className="flex-grow py-6 pr-6 bg-gray-50 flex flex-col">
        {" "}
        {/* Original content, now taking remaining space */}
        {/* Main Content */}
        <div className="flex-grow overflow-y-auto pl-3">
          {" "}
          {/* Added flex-grow and overflow-y-auto here */}
          <div className="w-full">
            {loadingChapters && <LoadingSpinner message="Loading conversation archives..." />}
            {chapterError && <div className="text-center text-red-600">Error: {chapterError}</div>}
            <Toaster />
            {!loadingChapters && !chapterError && (
              <>
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Conversation Archives</h1>

                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-full max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={() => {
                      setEditingChapter(null);
                      setNewChapterTitle("");
                      setShowChapterModal(true);
                    }}
                    className="flex items-center text-sm bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    <PlusCircle size={16} className="mr-2" />
                    Add Chapter
                  </button>
                </div>

                <div className="rounded-lg overflow-hidden">
                  {filteredChapters.map((chapter) => (
                    <div key={chapter.id} className="border-b mb-4">
                      <div className="px-6 py-4 bg-gray-200 flex justify-between items-start">
                        <h3 className="text-lg font-bold">{chapter.title}</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            className="text-blue-500 hover:text-blue-700"
                            onClick={() => {
                              setEditingChapter(chapter);
                              setNewChapterTitle(chapter.title);
                              setShowChapterModal(true);
                            }}
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            onClick={() => {
                              setChapterToDelete(chapter);
                              setShowChapterDeleteConfirm(true);
                            }}
                          >
                            <Trash2 size={18} />
                          </button>
                          <button
                            className="flex items-center text-sm bg-blue-500 text-white px-2 py-1 rounded-md hover:bg-blue-600"
                            onClick={() => {
                              setShowNewArchiveModal(true);
                              setAddingToChapterId(chapter.id);
                              setInsertionPointSlNo(null);
                            }}
                          >
                            <PlusCircle size={16} className="mr-1" />
                            Add Archive
                          </button>
                        </div>
                      </div>
                      <div>
                        {chapter.archives.map((archive) => (
                          <div key={archive.id} className="border-b" ref={(el) => (archiveRefs.current[archive.id] = el)}>
                            <div className="px-6 py-4 grid grid-cols-12 items-start hover:bg-gray-50">
                              {editingConversationId === archive.id ? (
                                // Edit mode
                                <>
                                  <div className="col-span-1 text-gray-600">{archive.formated_serial}</div>
                                  <div className="col-span-8">
                                    <textarea
                                      autoFocus // Added autoFocus
                                      ref={conversationInputRef} // Added ref
                                      placeholder="Conversation title"
                                      className="w-full px-2 py-1 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      rows="3"
                                      value={currentConversationTitle}
                                      onChange={(e) => setCurrentConversationTitle(e.target.value)}
                                    ></textarea>
                                  </div>
                                  <div className="col-span-3 flex items-center space-x-4 justify-end">
                                    <button
                                      className="text-white bg-green-500 hover:bg-green-700 px-3 py-1 rounded-md"
                                      onClick={() => handleUpdateConversation(archive.id)}
                                      disabled={isUpdatingConversation}
                                    >
                                      {isUpdatingConversation ? "Saving..." : "Save"}
                                    </button>
                                    <button
                                      className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400"
                                      onClick={() => setEditingConversationId(null)} // Cancel edit
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              ) : (
                                // Display mode
                                <>
                                  <div className="col-span-9">
                                    <div
                                      className="cursor-pointer text-blue-700"
                                      onClick={() => {
                                        setSelectedConversationForOptions(archive);
                                        setShowConversationOptionsModal(true);
                                      }}
                                    >
                                      {archive.formated_serial} {archive.title}
                                    </div>
                                  </div>
                                  <div className="col-span-3 flex items-center space-x-4 justify-end">
                                    <button
                                      className="text-blue-500 hover:text-blue-700"
                                      onClick={() => {
                                        setEditingConversationId(archive.id);
                                        setCurrentConversationTitle(archive.title);
                                      }}
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button
                                      className="text-green-500 hover:text-green-700"
                                      onClick={() => {
                                        setShowNewArchiveModal(true);
                                        setAddingToChapterId(archive.chapter_id);
                                        setInsertionPointSlNo(archive.sl_no);
                                      }}
                                    >
                                      <PlusCircle size={18} />
                                    </button>
                                    <button
                                      className="text-red-500 hover:text-red-700"
                                      onClick={() => {
                                        setConversationToDelete(archive.id);
                                        setShowConversationDeleteConfirm(true);
                                      }}
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                    <button onClick={() => toggleExpand(archive.id)} className="text-gray-500 hover:text-gray-800">
                                      {archive.isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                            {archive.isExpanded && (
                              <div className="pl-12 pr-6 pb-4 bg-gray-50">
                                {archive.options.map((option) => (
                                  <div key={option.id} className="border-b last:border-b-0">
                                    <div className="grid grid-cols-12 items-start py-2">
                                      {editingOptionId === option.id ? (
                                        // Edit mode
                                        <>
                                          <div className="col-span-10">
                                            <JoditEditor value={currentOptionTitle} onBlur={(newContent) => setCurrentOptionTitle(newContent)} />
                                          </div>
                                          <div className="col-span-2 flex justify-end items-start space-x-3 pl-3">
                                            <button
                                              className="text-white bg-green-500 hover:bg-green-700 px-3 py-1 rounded-md"
                                              onClick={() => handleUpdateOption(archive.id, option.id)}
                                              disabled={isUpdatingOption}
                                            >
                                              {isUpdatingOption ? "Saving..." : "Save"}
                                            </button>
                                            <button
                                              className="bg-gray-300 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-400"
                                              onClick={() => setEditingOptionId(null)} // Cancel edit
                                            >
                                              Cancel
                                            </button>
                                          </div>
                                        </>
                                      ) : (
                                        // Display mode
                                        <>
                                          <div className="col-span-11 flex justify-start items-start space-x-2">
                                            <button
                                              className="text-gray-500 hover:text-gray-700"
                                              onClick={() => handleCopyToClipboard(option.title)}
                                              title="Copy to clipboard"
                                            >
                                              <Copy size={16} />
                                            </button>
                                            <button
                                              className="text-gray-500 hover:text-gray-700"
                                              onClick={() => toggleSnippets(option)}
                                              title="Split into sentences"
                                            >
                                              {expandedSnippets[option.id] ? <ArrowDown size={16} /> : <ArrowRight size={16} />}
                                            </button>
                                            <div className="col-span-10 text-gray-700 text-justify" dangerouslySetInnerHTML={{ __html: option.title }}></div>
                                          </div>

                                          <div className="col-span-1 flex justify-end items-start space-x-3">
                                            <button
                                              className="text-blue-500 hover:text-blue-700"
                                              onClick={() => {
                                                setEditingOptionId(option.id);
                                                setCurrentOptionTitle(option.title);
                                                setCurrentOptionStatus(option.status);
                                              }}
                                            >
                                              <Edit size={16} />
                                            </button>
                                            <button
                                              className="text-red-500 hover:text-red-700"
                                              onClick={() => {
                                                setOptionToDelete({ archiveId: archive.id, optionId: option.id });
                                                setShowDeleteConfirm(true);
                                              }}
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                    {/* Render snippets if they exist for this option */}
                                    {expandedSnippets[option.id] && (
                                      <div className="pl-16 pr-6 pb-2">
                                        {expandedSnippets[option.id].map((snippet, index) => (
                                          <div key={index} className="flex items-center py-1">
                                            <button
                                              className="text-gray-500 hover:text-gray-700 mr-2 flex-shrink-0"
                                              onClick={() => {
                                                navigator.clipboard.writeText(snippet);
                                                toast.success("Copied!");
                                              }}
                                              title="Copy snippet"
                                            >
                                              <Copy size={14} />
                                            </button>
                                            <span className="text-gray-600">{snippet}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                                {/* Inline form for adding a new option */}
                                <div className="grid grid-cols-11 items-center py-2 mt-2">
                                  <div className="col-span-9">
                                    <JoditEditor placeholder={"Option text"} value={newOptionTitle} onBlur={(newContent) => setNewOptionTitle(newContent)} />
                                  </div>

                                  <div className="col-span-2 flex items-center space-x-3 pl-3">
                                    <button
                                      className="text-white bg-blue-500 hover:bg-blue-700 px-3 py-1 rounded-md"
                                      onClick={() => handleAddOption(archive.id)}
                                      disabled={isAddingOption}
                                    >
                                      {isAddingOption ? "Adding..." : "Save"}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this option? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteOption(optionToDelete.archiveId, optionToDelete.optionId);
                      setShowDeleteConfirm(false); // Close modal after action
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {showConversationDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this conversation record? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowConversationDeleteConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteConversation(conversationToDelete);
                      setShowConversationDeleteConfirm(false); // Close modal after action
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Chapter Modal */}
          {showChapterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">{editingChapter ? "Edit Chapter" : "Add Chapter"}</h3>
                <input
                  autoFocus // Added autoFocus
                  ref={chapterInputRef} // Added ref
                  type="text"
                  placeholder="Chapter title"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-2 focus:ring-blue-500"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowChapterModal(false);
                      setNewChapterTitle("");
                      setEditingChapter(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingChapter ? () => handleUpdateChapter(editingChapter.id) : handleAddChapter}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {editingChapter ? "Update" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Chapter Delete Confirmation Modal */}
          {showChapterDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete this chapter? This action cannot be undone.</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowChapterDeleteConfirm(false)} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400">
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteChapter(chapterToDelete.id);
                      setShowChapterDeleteConfirm(false);
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* New Archive Modal */}
          {showNewArchiveModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
                <h3 className="text-lg font-semibold mb-4">Add New Conversation Archive</h3>
                <textarea
                  autoFocus // Added autoFocus attribute
                  placeholder="Archive title"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  value={newArchiveTitle}
                  onChange={(e) => setNewArchiveTitle(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowNewArchiveModal(false);
                      setNewArchiveTitle("");
                      setAddingToChapterId(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button onClick={handleSaveNewArchive} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
          {showConversationOptionsModal && selectedConversationForOptions && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-11/12 lg:w-3/4 mx-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Options for {selectedConversationForOptions.title}</h3>
                  <button onClick={() => setShowConversationOptionsModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </div>
                <div className="max-h-[80vh] overflow-y-auto">
                  {selectedConversationForOptions.options && selectedConversationForOptions.options.length > 0 ? (
                    selectedConversationForOptions.options.map((option) => (
                      <div key={option.id} className="py-2 border-b last:border-b-0">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center text-justify pr-4 space-x-3">
                            <button
                              className="text-gray-500 hover:text-gray-700 flex-shrink-0 ml-2"
                              onClick={() => handleCopyToClipboard(option.title)}
                              title="Copy to clipboard"
                            >
                              <Copy size={16} />
                            </button>
                            <button
                              className="text-gray-500 hover:text-gray-700 mr-2 mt-1 flex-shrink-0"
                              onClick={() => toggleSnippets(option)}
                              title="Split into sentences"
                            >
                              {expandedSnippets[option.id] ? <ArrowDown size={16} /> : <ArrowRight size={16} />}
                            </button>
                            <span dangerouslySetInnerHTML={{ __html: option.title }}></span>
                          </div>
                        </div>
                        {expandedSnippets[option.id] && (
                          <div className="pl-10 pr-6 py-2">
                            {expandedSnippets[option.id].map((snippet, index) => (
                              <div key={index} className="flex items-center py-1">
                                <button
                                  className="text-gray-500 hover:text-gray-700 mr-2 flex-shrink-0"
                                  onClick={() => {
                                    navigator.clipboard.writeText(snippet);
                                    toast.success("Copied!");
                                  }}
                                  title="Copy snippet"
                                >
                                  <Copy size={14} />
                                </button>
                                <span className="text-gray-600">{snippet}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 py-8">
                      <Inbox size={48} />
                      <p className="mt-4 text-lg">No options available.</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowConversationOptionsModal(false);
                      setSelectedConversationForOptions(null);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationArchivesDataTable;
