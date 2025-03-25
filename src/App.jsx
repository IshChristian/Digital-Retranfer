import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";

// Layouts
import MainLayout from "./layout/dashboard";

// Pages
import Dashboard from "./pages/dashboard";
import Born from "./pages/born";
import NewBaby from "./pages/baby";
import Users from "./pages/users";
import HealthCenter from "./pages/healthcenter";
import Appointment from "./pages/appointment";
import Feedback from "./pages/feedback";
import Notification from "./pages/notifications";
import Login from "./pages/login";
import NotFound from "./pages/notfound";
import EmailVerification from "./pages/emailVerification"; // New component for verification

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Setup axios instance
  const API_URL = "https://digitalbackend-uobz.onrender.com/api/v1";
  const token = Cookies.get("token");
  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const email = Cookies.get("email");
      const role = Cookies.get("role");
      const userId = Cookies.get("userID");

      if (email && role && userId) {
        try {
          // Check if user needs verification
          const { data } = await axiosInstance.get(`/users/${userId}`);
          if (data.success) {
            setIsAuthenticated(true);
            // Show verification if code is null
            if (data.user.code === null) {
              setNeedsVerification(true);
            }
          }
        } catch (err) {
          console.error("Auth check failed:", err);
          setIsAuthenticated(false);
          Cookies.remove("email");
          Cookies.remove("role");
          Cookies.remove("token");
          Cookies.remove("userID");
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Custom route component to handle verification
  const ProtectedRoute = ({ children }) => {
    const location = useLocation();

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (needsVerification) {
      return <Navigate to="/verify-email" state={{ from: location }} replace />;
    }

    return <MainLayout>{children}</MainLayout>;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} />
        } />
        
        <Route path="/verify-email" element={
          isAuthenticated ? (
            <EmailVerification 
              setNeedsVerification={setNeedsVerification} 
              setIsAuthenticated={setIsAuthenticated}
            />
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        <Route path="/" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/borns" element={
          <ProtectedRoute>
            <NewBaby />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />
        
        <Route path="/healthcenter" element={
          <ProtectedRoute>
            <HealthCenter />
          </ProtectedRoute>
        } />
        
        <Route path="/babies" element={
          <ProtectedRoute>
            <Born />
          </ProtectedRoute>
        } />
        
        <Route path="/appointments" element={
          <ProtectedRoute>
            <Appointment />
          </ProtectedRoute>
        } />
        
        <Route path="/feedbacks" element={
          <ProtectedRoute>
            <Feedback />
          </ProtectedRoute>
        } />
        
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notification />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;