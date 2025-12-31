import { useAppContext } from "@/context/AppContext";
import { Ban, CheckCircle, Eye, EyeOff, Plus, StopCircle } from "lucide-react";
import { useState } from "react";

const Instruction = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 210;

  if (!text) {
    return (
      <p className="text-xs text-gray-800">
        <strong>Instruction:</strong> N/A
      </p>
    );
  }

  const isLongText = text.length > maxLength;

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <p className="text-xs text-gray-800">
      <strong>Instruction:</strong>{" "}
      {isLongText && !isExpanded ? (
        <>
          {`${text.substring(0, maxLength)}... `}
          <button onClick={toggleExpanded} className="text-blue-600 hover:underline">
            Show more
          </button>
        </>
      ) : (
        <>
          {text}
          {isLongText && (
            <button onClick={toggleExpanded} className="text-blue-600 hover:underline ml-1">
              Show less
            </button>
          )}
        </>
      )}
    </p>
  );
};

const FollowupsSection = ({ followups, handleOpenFollowupModal, formatDate, openConfirmationModal }) => {
  const [showFollowupDetails, setShowFollowupDetails] = useState(false);
  const [showViewDetailsConfirmation, setShowViewDetailsConfirmation] = useState(false);
  const { user } = useAppContext();
  const parsedUser = JSON.parse(user);

  const handleViewDetailsConfirm = () => {
    setShowFollowupDetails(true);
    setShowViewDetailsConfirmation(false);
  };

  const handleViewDetailsCancel = () => {
    setShowViewDetailsConfirmation(false);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Followups</h2>
          <div className="flex items-center space-x-2">
            {" "}
            {/* Group buttons */}
            {!showFollowupDetails &&
              followups.length > 0 && ( // Show View Details button only if details are hidden and there are followups
                <button
                  onClick={() => setShowViewDetailsConfirmation(true)} // Open confirmation modal
                  className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </button>
              )}
            {showFollowupDetails && ( // Show Hide Details button if details are visible
              <button
                onClick={() => setShowFollowupDetails(false)} // Hide details directly
                className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-200"
              >
                <EyeOff className="w-4 h-4 mr-2" />
                Hide Details
              </button>
            )}
            <button
              onClick={() => handleOpenFollowupModal()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Followup
            </button>
          </div>
        </div>

        {followups.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No followups found for this customer.</p>
          </div>
        ) : (
          <>
            {showFollowupDetails && (
              <div className="space-y-4">
                {followups.map((followup, index) => {
                  const canModify = parsedUser?.id == followup.followup_by.id;
                  if (canModify) {
                    return (
                      <div key={followup.id || index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          {followup.description && (
                            <div className="flex items-center">
                              <h3 className="font-medium text-gray-900">Followup Description: {followup.description}</h3>
                            </div>
                          )}
                          <span className="text-sm text-gray-500">Date: {followup.followup_date ? formatDate(followup.followup_date) : "N/A"}</span>
                          {followup.status == "cancelled" && (
                            <span className="ml-2 flex items-center text-xs font-semibold bg-red-200 text-red-800 px-2 py-1 rounded-full">
                              <Ban className="w-4 h-4 mr-1" />
                              Stopped
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {followup.followup_by?.name && (
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Followup By:</strong> {followup.followup_by.name}
                              </p>
                            </div>
                          )}
                          <div>
                            {followup.followup_package?.name && (
                              <p className="text-sm text-gray-600">
                                <strong>Package:</strong> {followup.followup_package.name}
                              </p>
                            )}
                            {followup.followup_package?.description && <p className="text-sm text-gray-600">{followup.followup_package.description}</p>}
                          </div>
                        </div>

                        {followup.description && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600">
                              <strong>Description:</strong> {followup.description}
                            </p>
                          </div>
                        )}

                        {followup.followup_details && followup.followup_details.length > 0 && (
                          <div className="mb-2">
                            <p className="text-sm text-gray-600 mb-1">
                              <strong>Followup Details:</strong>
                            </p>
                            <div className="space-y-3">
                              {followup.followup_details.map((detail, detailIndex) => (
                                <div key={detail.id || detailIndex} className="bg-gray-100 p-3 rounded-md border border-gray-200 shadow-sm">
                                  <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center">
                                      <p className="font-medium text-gray-800">
                                        <span className="text-gray-500">Date:</span> {detail.followup_date ? formatDate(detail.followup_date) : "N/A"}
                                      </p>
                                      {detail.status == 1 && (
                                        <span className="ml-2 flex items-center text-xs font-semibold bg-green-200 text-green-800 px-2 py-1 rounded-full">
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          Completed
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      {detail.stage_name && (
                                        <span className="text-xs font-semibold bg-blue-200 text-blue-800 px-2 py-1 rounded-full">{detail.stage_name}</span>
                                      )}
                                      {detail.status === 0 && (
                                        <button
                                          onClick={() => openConfirmationModal(detail.id)}
                                          className="flex items-center text-xs font-semibold bg-red-200 text-red-800 px-2 py-1 rounded-full hover:bg-red-300 transition-all"
                                        >
                                          <StopCircle className="w-4 h-4 mr-1" />
                                          Stop
                                        </button>
                                      )}
                                    </div>
                                  </div>

                                  <p className="text-sm text-gray-700 mb-2">
                                    {detail.include_call === 1 && <strong className="mr-1">Call And</strong>}
                                    <span className="font-semibold">Message:</span> {detail.message_template || "N/A"}
                                  </p>

                                  {detail.feedbacks && detail.feedbacks.length > 0 && (
                                    <div className="mt-2 pl-4 border-l-2 border-blue-300">
                                      <h5 className="text-sm font-semibold mb-1">Feedbacks for this detail:</h5>
                                      <div className="space-y-2">
                                        {detail.feedbacks.map((feedback, fbIndex) => (
                                          <div key={feedback.id || fbIndex} className="bg-blue-50 p-2 rounded-md border border-blue-200 shadow-sm">
                                            <p className="text-xs text-gray-800">
                                              <strong>Title:</strong> {feedback.title || "N/A"}
                                            </p>
                                            <p className="text-xs text-gray-800">
                                              <strong>Category:</strong> {feedback.category || "N/A"}
                                            </p>

                                            <p className="text-xs text-gray-800">
                                              <strong>Message:</strong> {feedback.message || "N/A"}
                                            </p>
                                            <p className="text-xs text-gray-800">
                                              <strong>Comment:</strong> {feedback.comment || "N/A"}
                                            </p>
                                            <Instruction text={feedback.instruction} />
                                            <p className="text-xs text-gray-500 mt-1">Date: {feedback.created_at ? formatDate(feedback.created_at) : "N/A"}</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Nested Feedbacks and Messages */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                          {/* Messages Column */}
                          {followup.followup_messages && followup.followup_messages.length > 0 && (
                            <div className="p-3 bg-green-50 bg-opacity-50 rounded-md border border-green-200">
                              <h4 className="text-md font-semibold mb-2">Messages:</h4>
                              <div className="space-y-3">
                                {followup.followup_messages.map((message, msgIndex) => (
                                  <div key={message.id || msgIndex} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                                    <p className="text-sm text-gray-800">
                                      <strong>Message #{msgIndex + 1}:</strong> {message.subject || message.message || "N/A"}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            )}
          </>
        )}
      </div>
      {showViewDetailsConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-medium mb-4">Confirm Action</h3>
            <p className="mb-6">Are you sure you want to view the followup details?</p>
            <div className="flex justify-end space-x-4">
              <button onClick={handleViewDetailsCancel} className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
                No
              </button>
              <button onClick={handleViewDetailsConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowupsSection;
