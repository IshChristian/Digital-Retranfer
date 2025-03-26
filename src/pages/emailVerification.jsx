import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";

const EmailVerification = ({ setNeedsVerification, setIsAuthenticated }) => {
  const [activeTab, setActiveTab] = useState("verify");
  const [email, setEmail] = useState(Cookies.get("email") || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = "https://digitalbackend-uobz.onrender.com/api/v1";
  const token = Cookies.get("token");
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleVerifyEmail = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address");
      }

      console.log(code);

      const response = await axiosInstance.post(`/users/code/${email}`, {code});
      
      if (response.data.code === code) {
        setIsVerified(true);
        setNeedsVerification(false);
        navigate(location.state?.from?.pathname || "/");
      } else {
        throw new Error("Invalid verification code");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCode = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address");
      }

      const response = await axiosInstance.post("/users/check", { email });
      
      if (response.data.success) {
        setActiveTab("verify");
      } else {
        throw new Error(response.data.message || "Failed to request code");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to request verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      if (!validateEmail(email)) {
        throw new Error("Please enter a valid email address");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords don't match");
      }

      const response = await axiosInstance.put(`/users/resetPassword/${email}`, {
        newPassword,
        confirmPassword
      });

      if (response.data.success) {
        setIsPasswordReset(true);
        setActiveTab("feedback");
      } else {
        throw new Error(response.data.message || "Password reset failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Password reset failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoBack = () => {
    if (activeTab === "verify") {
      setActiveTab("request");
    } else if (activeTab === "reset") {
      setActiveTab("verify");
    }
  };

  const handleContinueToApp = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        {/* Request Code Tab */}
        {activeTab === "request" && (
          <div>
            <p className="text-gray-600 mb-4">
              A verification code will be sent to your email address to verify your account.
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(""); // Clear error when typing
                }}
                className={`w-full px-3 py-2 border ${error && !validateEmail(email) ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
              />
              {error && !validateEmail(email) && (
                <p className="text-red-500 text-sm mt-1">{error}</p>
              )}
            </div>
            <button
              onClick={handleRequestCode}
              disabled={isLoading || !validateEmail(email)}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:bg-green-300"
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>
          </div>
        )}

        {/* Verify Email Tab */}
        {activeTab === "verify" && (
          <div>
            <p className="text-gray-600 mb-4">
              Enter the verification code sent to <span className="font-semibold">{email}</span>
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Verification Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError("");
                }}
                className={`w-full px-3 py-2 border ${error ? "border-red-500" : "border-gray-300"} rounded-md focus:outline-none focus:ring-2 focus:ring-green-500`}
                placeholder="Enter 6-digit code"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <button
              onClick={handleVerifyEmail}
              disabled={isLoading || !code}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:bg-green-300"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </button>
          </div>
        )}

        {/* Reset Password Tab */}
        {activeTab === "reset" && (
          <div>
            <p className="text-gray-600 mb-4">
              Set a new password for your account.
            </p>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Confirm new password"
              />
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button
              onClick={handleResetPassword}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md disabled:bg-green-300"
            >
              {isLoading ? "Processing..." : "Reset Password"}
            </button>
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === "feedback" && (
          <div className="text-center">
            {isPasswordReset ? (
              <>
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-green-600 mb-2">Password Reset Successful</h3>
                <p className="text-gray-600 mb-6">
                  Your password has been updated successfully. You can now login with your new password.
                </p>
                <button
                  onClick={handleContinueToApp}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                >
                  Continue to App
                </button>
              </>
            ) : (
              <>
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-600 mb-2">Password Reset Failed</h3>
                <p className="text-gray-600 mb-6">
                  {error || "There was an error resetting your password. Please try again."}
                </p>
                <button
                  onClick={() => setActiveTab("reset")}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;