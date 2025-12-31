"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useEffect } from "react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, description }) => {
  // Handle Escape key press for closing the modal
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-labelledby="confirmation-modal-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative w-[90vw] max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <h2 id="confirmation-modal-title" className="text-lg font-semibold text-gray-900">
          {title || "Confirmation"}
        </h2>
        <p className="mt-2 text-sm text-gray-600">{description}</p>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            Confirm
          </Button>
        </div>

        <button
          className="absolute top-3 right-3 inline-flex h-7 w-7 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Close"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ConfirmationModal;