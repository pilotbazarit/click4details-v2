"use client";

import { formatDate } from "@/helpers/functions";
import { Copy } from "lucide-react";
import toast from "react-hot-toast";

const FeedbackListModal = ({ isOpen, onClose, feedbacks, loading, followup }) => {
  if (!isOpen) return null;

  const handleCopy = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Feedbacks for Followup</h2>
            {followup && (
              <p className="text-sm text-gray-600 mt-1">
                {followup.title || "Followup"} - {followup.customer?.name}
              </p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Loading feedbacks...</span>
          </div>
        ) : feedbacks.length > 0 ? (
          <div className="space-y-4">
            {feedbacks.map((feedback) => {
              return (
                <div key={feedback.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                        {/* Left side content */}
                        <div className="flex-1">
                            <p className="text-gray-600 text-sm mb-2">
                                {feedback.title && (
                                    <>
                                        <strong>Title:</strong> {feedback.title}
                                    </>
                                )}
                            </p>
                            <p className="text-gray-600 text-sm mb-2">
                                <strong>Message:</strong> {feedback.message}
                            </p>
                            {feedback.comment && (
                                <p className="text-gray-600 text-sm mb-2">
                                    <strong>Comment:</strong> {feedback.comment}
                                </p>
                            )}
                            {feedback.instruction && (
                                <p className="text-gray-600 text-sm mb-2">
                                    <strong>Instruction:</strong> {feedback.instruction}
                                </p>
                            )}
                        </div>

                        {/* Right side audio player */}
                        {feedback.audio && feedback.audio.url && (
                            <div className="flex items-center space-x-2 ml-4">
                                <audio controls src={feedback.audio.url} className="w-64" />
                                <button onClick={() => handleCopy(feedback.audio.url)} className="text-gray-600 hover:text-gray-900" title="Copy URL">
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3">
                            {feedback.category && <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">{feedback.category}</span>}
                        </div>
                        <div className="text-sm text-gray-500">{formatDate(feedback.created_at, "DD MMM, YYYY h:mm A")}</div>
                    </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-gray-500">No feedbacks found for this followup</p>
            <p className="text-sm text-gray-400 mt-1">Feedbacks will appear here once created</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackListModal;
