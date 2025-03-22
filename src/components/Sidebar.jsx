import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import {
  Home,
  BarChart2,
  Users,
  Calendar,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  Baby,
  Heart,
  Clock,
  Activity,
  UserPlus,
  Clipboard,
  Hospital,
  UserCheck
} from "lucide-react";

function Sidebar({ sidebarOpen, toggleSidebar }) {
  const location = useLocation();
  const [institution, setInstitution] = useState("");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  useEffect(() => {
    const userInstitution = Cookies.get("institution");
    if (userInstitution) {
      setInstitution(userInstitution);
    }

    // Add window resize listener
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Reset mobile expanded state when resizing
      if (window.innerWidth >= 768) {
        setIsMobileExpanded(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isSmallScreen = windowWidth < 768;
  
  // Logic for sidebar state:
  // 1. On large screens: Use sidebarOpen from props (toggle with menu button)
  // 2. On small screens: Default to collapsed, but can be expanded with menu button
  const effectiveSidebarOpen = isSmallScreen 
    ? isMobileExpanded 
    : sidebarOpen;

  const handleMobileToggle = () => {
    setIsMobileExpanded(!isMobileExpanded);
  };

  // Use the appropriate toggle function based on screen size
  const handleToggleSidebar = isSmallScreen ? handleMobileToggle : toggleSidebar;

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    Cookies.remove("username");
    Cookies.remove("institution");
    window.location.href = "/login";
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const adminMenuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/new-baby", icon: Baby, label: "Newborns" },
    { path: "/mothers", icon: Users, label: "Mothers" },
    { path: "/health-records", icon: Heart, label: "Health Records" },
    { path: "/hospitals", icon: Hospital, label: "Hospitals" },
    { path: "/users", icon: UserPlus, label: "Manage Users" },
    { path: "/statistics", icon: BarChart2, label: "Statistics" },
    { path: "/reports", icon: FileText, label: "Reports" },
  ];

  const userMenuItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/new-baby", icon: Baby, label: "Newborns" },
    { path: "/mothers", icon: Users, label: "Mothers" },
    { path: "/appointments", icon: Calendar, label: "Appointments" },
    { path: "/birth-timeline", icon: Clock, label: "Birth Timeline" },
    { path: "/vitals", icon: Activity, label: "Vitals" },
    { path: "/daily-records", icon: Clipboard, label: "Daily Records" },
  ];

  const bottomMenuItems = [
    { path: "/settings", icon: Settings, label: "Settings" },
    { path: "/help", icon: HelpCircle, label: "Help" },
    { 
      path: "#",
      icon: LogOut,
      label: "Logout",
      onClick: handleLogout
    },
  ];

  const menuItems = institution === "admin" ? adminMenuItems : userMenuItems;

  // Handle menu item click on mobile to collapse the sidebar
  const handleNavItemClick = (onClick) => {
    if (isSmallScreen && isMobileExpanded) {
      setIsMobileExpanded(false);
    }
    if (onClick) onClick();
  };

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
            <Baby className={`${isSmallScreen ? 'h-6 w-6' : 'h-8 w-8'} text-green-700`} />
            {effectiveSidebarOpen && <span className="text-xl font-bold">BabyRecorder</span>}
          </div>
          <button onClick={handleToggleSidebar} className="text-green-700">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className={`${effectiveSidebarOpen ? "px-4" : "px-2"} py-2`}>
          <div className={`flex items-center ${effectiveSidebarOpen ? "justify-start" : "justify-center"} bg-green-100 rounded-md p-2`}>
            <UserCheck className={`${isSmallScreen ? 'h-4 w-4' : 'h-5 w-5'} text-green-700`} />
            {effectiveSidebarOpen && (
              <div className="ml-2">
                <p className="text-xs text-green-600">Logged in as:</p>
                <p className="text-sm font-medium capitalize">{institution}</p>
              </div>
            )}
          </div>
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
          className="fixed inset-0 bg-black bg-opacity-20"
          onClick={() => setIsMobileExpanded(false)}
        ></div>
      )}

      {/* Logout Confirmation Dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
            <p className="mt-2 text-sm text-gray-500">
              Are you sure you want to logout? Your session will be ended.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={cancelLogout}
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

/* Component to display grouped menu sections */
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