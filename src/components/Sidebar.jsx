import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import {
  Home,
  Users,
  Calendar,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  FileText,
  User,
  Heart,
  Hospital,
  X
} from "lucide-react";

function Sidebar({ sidebarOpen, toggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);
  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    gender: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const userRole = Cookies.get("role");
    if (userRole) {
      setRole(userRole);
    }

    fetchUserData();

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= 768) {
        setIsMobileExpanded(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchUserData = async () => {
    try {
      const token = Cookies.get("token");
      const userId = Cookies.get("userID");
      const response = await axios.get(
        `https://digitalbackend-uobz.onrender.com/api/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { user } = response.data;
      setUserData(user);
      setFormData({
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        phone: user.phone,
        gender: user.gender
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const token = Cookies.get("token");
      const userId = Cookies.get("userID");
      await axios.put(
        `https://digitalbackend-uobz.onrender.com/api/v1/users/update/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Profile updated successfully");
      fetchUserData();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match");
      return;
    }

    try {
      const token = Cookies.get("token");
      const userId = Cookies.get("userID");
      await axios.put(
        `https://digitalbackend-uobz.onrender.com/api/v1/users/update/${userId}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Password changed successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (error) {
      console.error("Error changing password:", error);
      alert(error.response?.data?.message || "Failed to change password");
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    Cookies.remove("email");
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("userID");
    navigate("/login");
  };

  const isSmallScreen = windowWidth < 768;
  const effectiveSidebarOpen = isSmallScreen ? isMobileExpanded : sidebarOpen;

  const handleMobileToggle = () => {
    setIsMobileExpanded(!isMobileExpanded);
  };

  const handleToggleSidebar = isSmallScreen ? handleMobileToggle : toggleSidebar;

  const handleNavItemClick = (onClick) => {
    if (isSmallScreen && isMobileExpanded) {
      setIsMobileExpanded(false);
    }
    if (onClick) onClick();
  };

  const adminMenuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/users", icon: User, label: "Users" },
    { path: "/healthcenter", icon: Hospital, label: "Health Center" },
    { path: "/borns", icon: FileText, label: "Borns" },
    { path: "/babies", icon: Heart, label: "Babies" },
    { path: "/appointments", icon: Calendar, label: "Appointments" },
    { path: "/feedbacks", icon: Calendar, label: "Feedbacks" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
  ];

  const userMenuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/borns", icon: FileText, label: "Borns" },
    { path: "/babies", icon: Heart, label: "Babies" },
    { path: "/appointments", icon: Calendar, label: "Appointments" },
    { path: "/notifications", icon: Bell, label: "Notifications" },
  ];

  const bottomMenuItems = [
    { 
      path: "#",
      icon: Settings, 
      label: "Settings",
      onClick: () => setShowSettingsModal(true)
    },
    { 
      path: "#",
      icon: HelpCircle, 
      label: "Help",
      onClick: () => setShowHelpModal(true)
    },
    { 
      path: "#",
      icon: LogOut,
      label: "Logout",
      onClick: handleLogout
    },
  ];

  const menuItems = role === "admin" ? adminMenuItems : userMenuItems;

  return (
    <>
      <aside 
        className={`${
          effectiveSidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300 bg-white text-green-700 h-screen shadow-sm bg-opacity-95 flex flex-col md:relative`}
      >
        {/* Sidebar Header */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {effectiveSidebarOpen && <span className="text-xl font-bold">Digital Retransfer</span>}
          </div>
          <button onClick={handleToggleSidebar} className="text-green-700">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto mt-4">
          <MenuGroup title="Main" sidebarOpen={effectiveSidebarOpen} />
          {menuItems.map((item, index) => (
            <NavItem
              key={index}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
              expanded={effectiveSidebarOpen}
              onClick={() => handleNavItemClick(item.onClick)}
              isSmallScreen={isSmallScreen}
            />
          ))}

          {/* Bottom Menu Items */}
          <MenuGroup title="Settings" sidebarOpen={effectiveSidebarOpen} />
          {bottomMenuItems.map((item, index) => (
            <NavItem
              key={index}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
              expanded={effectiveSidebarOpen}
              onClick={() => handleNavItemClick(item.onClick)}
              isSmallScreen={isSmallScreen}
            />
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile when sidebar is expanded */}
      {isSmallScreen && isMobileExpanded && (
        <div 
          className="fixed inset-0 bg-green-300 bg-opacity-20"
          onClick={() => setIsMobileExpanded(false)}
        ></div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-green-300 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`${activeTab === "profile" ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Profile
                  </button>
                  <button
                    onClick={() => setActiveTab("password")}
                    className={`${activeTab === "password" ? 'border-green-500 text-green-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    Change Password
                  </button>
                </nav>
              </div>

              {activeTab === "profile" && userData && (
                <div className="mt-6">
                  <form onSubmit={handleUpdateProfile}>
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
                          First name
                        </label>
                        <input
                          type="text"
                          name="firstname"
                          id="firstname"
                          value={formData.firstname}
                          onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                          Last name
                        </label>
                        <input
                          type="text"
                          name="lastname"
                          id="lastname"
                          value={formData.lastname}
                          onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email address
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone number
                        </label>
                        <input
                          type="text"
                          name="phone"
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                          Gender
                        </label>
                        <select
                          name="gender"
                          id="gender"
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowSettingsModal(false)}
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "password" && (
                <div className="mt-6">
                  <form onSubmit={handleChangePassword}>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                          Current Password
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          id="currentPassword"
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          id="newPassword"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          id="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowSettingsModal(false)}
                        className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Change Password
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-green-300 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Help & Support</h3>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="prose prose-sm text-gray-500">
                <p>
                  Welcome to the Digital Retransfer system. If you need any assistance or have questions about using the application, please don't hesitate to reach out to our support team.
                </p>
                <h4 className="text-sm font-medium text-gray-900 mt-4">Support Contact</h4>
                <ul className="mt-2">
                  <li>Email: support@digitalretransfer.com</li>
                  <li>Phone: +250 788 123 456</li>
                  <li>Working Hours: Mon-Fri, 8:00 AM - 5:00 PM</li>
                </ul>
                <h4 className="text-sm font-medium text-gray-900 mt-4">Frequently Asked Questions</h4>
                <p className="mt-2">
                  Visit our <a href="#" className="text-green-600 hover:text-green-800">FAQ page</a> for answers to common questions about using the system.
                </p>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="rounded-md border border-transparent bg-green-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-green-300 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to logout? Your session will be ended.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MenuGroup({ title, sidebarOpen }) {
  return (
    <div className={`text-xs font-semibold uppercase text-green-600 ${sidebarOpen ? "px-4" : "px-2"} mt-4 mb-2`}>
      {sidebarOpen ? title : "•"}
    </div>
  );
}

function NavItem({ icon: Icon, label, path, active = false, expanded, onClick, isSmallScreen }) {
  return (
    <Link
      to={path}
      onClick={onClick}
      className={`flex items-center py-2 ${expanded ? "px-4" : "px-0 justify-center"} ${
        active ? "bg-green-200 text-green-900 font-semibold" : "text-green-700 hover:bg-green-100"
      } transition-colors duration-200 rounded-md my-1`}
    >
      <span className={`${isSmallScreen ? 'text-lg' : 'text-xl'}`}>
        <Icon size={isSmallScreen ? 18 : 24} />
      </span>
      {expanded && <span className="ml-3 text-sm">{label}</span>}
    </Link>
  );
}

export default Sidebar;