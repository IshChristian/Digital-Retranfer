import { useState, useEffect } from "react";
import { 
  Search, 
  Trash2, 
  Eye, 
  X, 
  Check, 
  Bell, 
  BellOff,
  Mail,
  MailOpen,
  Trash
} from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  // Setup axios instance with token
  const API_URL = "https://digitalbackend-uobz.onrender.com/api/v1";
  const token = Cookies.get("token");
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  // Fetch notifications on component mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Filter notifications based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredNotifications(notifications);
    } else {
      const filtered = notifications.filter(notification => 
        (notification.title && notification.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (notification.message && notification.message.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredNotifications(filtered);
    }
  }, [searchTerm, notifications]);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/notification");
      
      if (data.success) {
        setNotifications(data.data || []);
        setFilteredNotifications(data.data || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // View notification (marks as read when opened)
  const viewNotification = async (notification) => {
    try {
      if (!notification.isRead) {
        await axiosInstance.put(`/notification/read/${notification.id}`);
      }
      setCurrentNotification(notification);
      setIsModalOpen(true);
      await fetchNotifications(); // Refresh to update read status
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axiosInstance.put("/notification/read-all");
      await fetchNotifications();
      showAlert('success', 'All notifications marked as read');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    try {
      await axiosInstance.delete(`/notification/delete/${id}`);
      await fetchNotifications();
      showAlert('success', 'Notification deleted');
    } catch (err) {
      showAlert('error', err.response?.data?.message || err.message);
    }
  };

  // Delete all notifications
  const deleteAllNotifications = async () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "This will delete all notifications and cannot be undone!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#EF4444',
      confirmButtonText: 'Yes, delete all!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete("/notification/delete-all");
          await fetchNotifications();
          showAlert('success', 'All notifications deleted');
        } catch (err) {
          showAlert('error', err.response?.data?.message || err.message);
        }
      }
    });
  };

  // Show alert
  const showAlert = (icon, title) => {
    Swal.fire({
      icon,
      title,
      showConfirmButton: false,
      timer: 1500
    });
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="bg-white min-h-screen p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-green-600">Notifications</h1>
        <p className="text-gray-600">
          {unreadCount > 0 ? (
            <span className="flex items-center">
              <Bell className="h-5 w-5 mr-2 text-yellow-500" />
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          ) : (
            <span className="flex items-center">
              <BellOff className="h-5 w-5 mr-2 text-gray-400" />
              All caught up!
            </span>
          )}
        </p>
      </div>
      
      {/* Filters and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="Search notifications..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isLoading || unreadCount === 0}
          >
            <Check className="h-5 w-5 mr-1" />
            Mark All Read
          </button>
          <button
            onClick={deleteAllNotifications}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            disabled={isLoading || notifications.length === 0}
          >
            <Trash className="h-5 w-5 mr-1" />
            Clear All
          </button>
        </div>
      </div>
      
      {/* Notifications Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading && (
          <div className="p-4 text-center text-gray-500">
            Loading notifications...
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-green-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Preview</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <tr 
                    key={notification.id} 
                    className={`${notification.isRead ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-100 cursor-pointer`}
                    onClick={() => viewNotification(notification)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {notification.isRead ? (
                        <MailOpen className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Mail className="h-5 w-5 text-blue-500" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${notification.isRead ? 'text-gray-900' : 'text-blue-800'}`}>
                        {notification.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 truncate max-w-xs">
                        {notification.message.split('\n')[0]}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(notification.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    {isLoading ? 'Loading...' : 'No notifications found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Notification Detail Modal */}
      {isModalOpen && currentNotification && (
        <div className="fixed inset-0 bg-green-300 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h2 className="text-xl font-semibold text-green-700">
                {currentNotification.title}
              </h2>
              <button 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-1">
                  {formatDate(currentNotification.createdAt)}
                </div>
                <div className="text-sm text-gray-500">
                  Status: {currentNotification.isRead ? 'Read' : 'Unread'}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                {currentNotification.message}
              </div>
            </div>
            
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;