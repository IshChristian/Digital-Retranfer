import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";

// Layouts
import MainLayout from "./layout/dashboard";

// Pages
import Dashboard from "./pages/dashboard";
import NewBaby from "./pages/baby";
// import ViewDetails from "./pages/ViewDetails";
import Login from "./pages/login";
import NotFound from "./pages/notfound";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const username = Cookies.get("username");
    const institution = Cookies.get("institution");
    
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
        
        <Route path="/new-baby" element={
          isAuthenticated ? (
            <MainLayout>
              <NewBaby />
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