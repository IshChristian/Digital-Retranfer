import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

const WelcomePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Setup axios instance with token
  const API_URL = "https://digitalbackend-uobz.onrender.com/api/v1";
  const token = Cookies.get("token");
  const userId = Cookies.get("userID");
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!userId) {
          throw new Error("User ID not found in cookies");
        }
        
        const { data } = await axiosInstance.get(`/users/${userId}`);
        if (data.success) {
          setUser(data.user);
        } else {
          throw new Error(data.message || "Failed to fetch user data");
        }
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-800">Loading user information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">Error</h2>
          <p className="text-red-500 mb-6">{error}</p>
          <p className="text-gray-600">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full text-center">
        {/* App Name */}
        <h1 className="text-4xl font-bold text-green-600 mb-2">Digital Retransfer</h1>
        <div className="h-1 bg-green-200 w-24 mx-auto mb-8"></div>
        
        {/* Welcome Message */}
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Welcome back, <span className="text-green-600">{user?.firstname || 'User'}!</span>
        </h2>
        
        {/* User Info Card */}
        <div className="bg-green-100 rounded-lg p-6 mb-8 text-left max-w-md mx-auto">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-green-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
              {user?.firstname?.charAt(0)}{user?.lastname?.charAt(0)}
            </div>
          </div>
          
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Name:</span> {user?.firstname} {user?.lastname}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Email:</span> {user?.email}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Role:</span> <span className="capitalize">{user?.role}</span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Status:</span> <span className="capitalize">{user?.status}</span>
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Member since:</span> {formatDate(user?.createdAt)}
            </p>
          </div>
        </div>
        
        {/* App Description */}
        <div className="text-gray-600 mb-8">
          <p className="mb-4">
            Thank you for using <span className="font-semibold text-green-600">Digital Retransfer</span>, your trusted platform for seamless data management and transfer.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;