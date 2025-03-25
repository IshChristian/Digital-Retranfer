import { useState, useEffect, useRef } from "react";
import { Bell, Menu, User } from "lucide-react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Navbar({ toggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userEmail = Cookies.get("email");
    if (userEmail) {
      setEmail(userEmail);
    }

    // Fetch notifications
    const fetchNotifications = async () => {
      try {
        const token = Cookies.get("token"); // Get token from cookies
        const response = await axios.get(
          "https://digitalbackend-uobz.onrender.com/api/v1/notification",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const { data, unreadCount } = response.data;
        // Filter to only show unread notifications
        const unreadNotifications = data.filter(
          (notification) => !notification.isRead
        );
        setNotifications(unreadNotifications);
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        // If unauthorized (401), redirect to login
        if (error.response && error.response.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchNotifications();

    function handleClickOutside(event) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [navigate]);

  // Format timestamp to relative time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationsRef}>
            <button
              className="relative p-2 rounded-full hover:bg-gray-100"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-6 w-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="ml-2 text-xs text-gray-500">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-3 border-b border-gray-100 hover:bg-gray-50"
                      >
                        <p className="text-sm font-medium text-gray-800">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-sm text-gray-500">
                      No unread notifications
                    </div>
                  )}
                </div>
                <div className="p-2 text-center border-t border-gray-200">
                  <button
                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                    onClick={() => {
                      navigate("/notifications");
                      setShowNotifications(false);
                    }}
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
              <User className="h-6 w-6" />
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-sm text-gray-500">{getGreeting()}</span>
              <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
                {email}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;