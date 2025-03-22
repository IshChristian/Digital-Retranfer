import { useState, useEffect, useRef } from "react";
import { Bell, Menu, User, ChevronDown } from "lucide-react";
import Cookies from "js-cookie";

function Navbar({ toggleSidebar }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [username, setUsername] = useState("");
  const notificationsRef = useRef(null);

  const notifications = [
    {
      id: 1,
      title: "New Birth",
      description: "Baby Smith was born at 9:45 AM",
      timestamp: "10 minutes ago"
    },
    {
      id: 2,
      title: "NICU Alert",
      description: "Baby Johnson needs immediate attention",
      timestamp: "25 minutes ago"
    },
    {
      id: 3,
      title: "Discharge Ready",
      description: "Baby Williams ready for discharge",
      timestamp: "1 hour ago"
    }
  ];

  useEffect(() => {
    const name = Cookies.get("username");
    if (name) {
      setUsername(name);
    }

    function handleClickOutside(event) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <button 
            onClick={toggleSidebar}
            className="p-1 mr-4 text-gray-600 rounded-md hover:bg-gray-100 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative" ref={notificationsRef}>
            <button 
              className="relative p-2 rounded-full hover:bg-gray-100"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-6 w-6 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                <div className="p-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map(notification => (
                    <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-gray-50">
                      <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{notification.timestamp}</p>
                    </div>
                  ))}
                </div>
                <div className="p-2 text-center">
                  <button className="text-xs text-green-600 hover:text-green-800 font-medium">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
              <User className="h-6 w-6" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-700">
                {getGreeting()}, {username}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {Cookies.get("institution") || "Staff"}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;