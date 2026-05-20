"use client";

import { API_URL } from "@/helpers/apiUrl";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * Account Deletion Page Component
 * This component follows the Next.js App Router convention for a page.
 */
export default function AccountDeletionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      adr_app_name: formData.get("adr_app_name"),
      adr_full_name: formData.get("adr_full_name"),
      adr_registered_email: formData.get("adr_registered_email"),
      adr_user_id_or_phone: formData.get("adr_user_id_or_phone"),
      adr_request_type: formData.get("adr_request_type"),
      adr_additional_message: formData.get("adr_additional_message"),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}api/account-deletion-request`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const validationErrors = data?.errors
          ? Object.values(data.errors).flat()
          : [];

        if (validationErrors.length) {
          validationErrors.forEach((message) => toast.error(message));
        } else {
          toast.error(data?.message || "Failed to submit deletion request.");
        }

        return;
      }

      toast.success(data?.message || "Account deletion request submitted successfully.");
      form.reset();
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] py-10 px-4 text-[#1f2937] font-sans antialiased">
      <div className="max-w-[900px] mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          
          {/* Header Section */}
          <header className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-10 px-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
              Account Deletion Request
            </h1>
            <p className="text-lg opacity-90 font-medium">
              Submit a request to delete your account and associated data.
            </p>
          </header>

          <div className="p-8 md:p-10">
            
            {/* Warning Notice */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-lg mb-10 text-blue-900 shadow-sm">
              <p className="text-sm md:text-base">
                <span className="font-bold uppercase text-xs border-b border-blue-300 mr-2">Important</span> 
                Once your account is deleted, your profile and related personal data may no longer be recoverable.
              </p>
            </div>

            <div className="grid gap-10">
              {/* Information Sections */}
              <section>
                <h2 className="text-xl font-bold mb-3 text-gray-900">About Account Deletion</h2>
                <p className="text-gray-600 leading-relaxed">
                  If you have created an account in our app, you can request deletion of your account and associated personal data using the form below.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3 text-gray-900">Data That Will Be Deleted</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Your user account information</li>
                  <li>Your profile details</li>
                  <li>Your login or registration information</li>
                  <li>App-related user data connected with your account</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold mb-3 text-gray-900">Data Retention</h2>
                <p className="text-gray-600 leading-relaxed">
                  Some data may be retained for a limited period if required for legal, security, fraud prevention, or regulatory purposes.
                  Account deletion requests are usually processed within <span className="font-semibold text-gray-900">7 to 30 working days</span>.
                </p>
              </section>

              {/* Form Section */}
              <section className="pt-4">
                <div className="bg-gray-50 p-6 md:p-8 rounded-2xl border border-gray-200">
                  <h2 className="text-2xl font-bold mb-6 text-gray-900">Submit Deletion Request</h2>
                  
                  <form 
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label htmlFor="app_name" className="block text-sm font-bold mb-2 text-gray-700">App Name</label>
                        <input type="text" id="app_name" name="adr_app_name" defaultValue="Click4details" placeholder="Enter app name" required 
                          className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" />
                      </div>

                      <div>
                        <label htmlFor="name" className="block text-sm font-bold mb-2 text-gray-700">Full Name</label>
                        <input type="text" id="name" name="adr_full_name" placeholder="Enter your full name" required 
                          className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-bold mb-2 text-gray-700">Registered Email Address</label>
                      <input type="email" id="email" name="adr_registered_email" placeholder="Enter your registered email" required 
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" />
                    </div>

                    <div>
                      <label htmlFor="user_id" className="block text-sm font-bold mb-2 text-gray-700">User ID / Phone Number</label>
                      <input type="text" id="user_id" name="adr_user_id_or_phone" placeholder="Enter user ID or phone number if available" 
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm" />
                    </div>

                    <div>
                      <label htmlFor="request_type" className="block text-sm font-bold mb-2 text-gray-700">Request Type</label>
                      <select id="request_type" name="adr_request_type" required defaultValue="account_deletion"
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm appearance-none cursor-pointer">
                        <option value="">Select request type</option>
                        <option value="account_deletion">Delete my account and data</option>
                        <option value="specific_data_deletion">Delete only specific data</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-bold mb-2 text-gray-700">Additional Message</label>
                      <textarea id="message" name="adr_additional_message" placeholder="Write any additional information here..." 
                        className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm min-h-[140px] resize-y"></textarea>
                    </div>

                    <button type="submit" disabled={isSubmitting}
                      className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-md">
                      {isSubmitting ? "Submitting..." : "Submit Account Deletion Request"}
                    </button>
                  </form>
                </div>
              </section>

              <section className="text-center md:text-left border-t border-gray-100 pt-8">
                <h2 className="text-xl font-bold mb-2 text-gray-900">Contact Us</h2>
                <p className="text-gray-600">
                  For any questions about account deletion or data privacy, contact us at:{' '}
                  <a href="mailto:pilotbazar.com@gmail.com" className="text-blue-600 font-semibold hover:underline">
                    pilotbazar.com@gmail.com
                  </a>
                </p>
              </section>
            </div>
          </div>

          {/* Footer Section */}
          <footer className="bg-gray-100 py-8 px-8 text-center text-sm text-gray-500 border-t border-gray-200">
            <p>© {new Date().getFullYear()} Your Click4details. All rights reserved.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
