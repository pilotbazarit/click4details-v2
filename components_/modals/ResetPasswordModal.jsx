import { useState } from "react"; 
import LoginService from "@/services/LoginService";

export default function ResetPasswordModal({ isOpen, onClose }) {
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await LoginService.Commands.resetPassword({
        token,
        password: newPassword,
        password_confirmation: confirmPassword,
      });

      if (res.status === "success") {
        setSuccessMsg("Password has been reset successfully.");
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setErrorMsg("Failed to reset password. Please try again.");
      }
    } catch (error) {
      console.log("error", error);
      setErrorMsg(error.message || "An error occurred. Please try again.");
      
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-40">
      <div className="relative p-4 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              Reset Password
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:bg-gray-200 rounded-lg w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          <div className="p-4 md:p-5">
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Token */}
              <div>
                <label htmlFor="token" className="block mb-2 text-sm font-medium">
                  Token Is Sent To Your Email. Please Copy The Token From Your Email & Paste Below
                </label>
                <input
                  type="text"
                  id="token"
                  required
                  className="w-full p-2.5 border rounded-lg"
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>

              {/* Passwords */}
              <div>
                <label htmlFor="newPassword" className="block mb-2 text-sm font-medium">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  required
                  className="w-full p-2.5 border rounded-lg"
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  required
                  className="w-full p-2.5 border rounded-lg"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {/* Messages */}
              {successMsg && <p className="text-sm text-green-500">{successMsg}</p>}
              {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full bg-blue-700 text-white rounded-lg px-5 py-2.5"
                disabled={loading}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
