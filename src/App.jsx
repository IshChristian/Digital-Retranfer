import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

// Layouts
import MainLayout from "./layout/dashboard";

// Pages
import Dashboard from "./pages/dashboard";
import NewBaby from "./pages/baby";
import Born from "./pages/born";
import Users from "./pages/users";
import HealthCenter from "./pages/healthcenter";
// import ViewDetails from "./pages/ViewDetails";
import Login from "./pages/login";
import NotFound from "./pages/notfound";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const username = Cookies.get("email");
    const institution = Cookies.get("role");
    
    if (username && institution) {
      setIsAuthenticated(true);
    }
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" /> : <Login setIsAuthenticated={setIsAuthenticated} />
        } />
        
        <Route path="/" element={
          isAuthenticated ? (
            <MainLayout>
              <Dashboard />
            </MainLayout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        <Route path="/borns" element={
          isAuthenticated ? (
            <MainLayout>
              <NewBaby />
            </MainLayout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/users" element={
          isAuthenticated ? (
            <MainLayout>
              <Users />
            </MainLayout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/healthcenter" element={
          isAuthenticated ? (
            <MainLayout>
              <HealthCenter />
            </MainLayout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        <Route path="/babies" element={
          isAuthenticated ? (
            <MainLayout>
              <Born />
            </MainLayout>
          ) : (
            <Navigate to="/login" />
          )
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;