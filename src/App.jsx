import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ForgetPassword from "./pages/emailVerification";
import NotFound from "./pages/notfound";
import Login from "./pages/login";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <Dashboard />
          </MainLayout>
        } />
        
        <Route path="/borns" element={
          <MainLayout>
            <NewBaby />
          </MainLayout>
        } />
        
        <Route path="/users" element={
          <MainLayout>
            <Users />
          </MainLayout>
        } />
        
        <Route path="/healthcenter" element={
          <MainLayout>
            <HealthCenter />
          </MainLayout>
        } />
        
        <Route path="/babies" element={
          <MainLayout>
            <Born />
          </MainLayout>
        } />
        
        <Route path="/appointments" element={
          <MainLayout>
            <Appointment />
          </MainLayout>
        } />
        
        <Route path="/feedbacks" element={
          <MainLayout>
            <Feedback />
          </MainLayout>
        } />
        
        <Route path="/notifications" element={
          <MainLayout>
            <Notification />
          </MainLayout>
        } />
        
        <Route path="*" element={<NotFound />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgotten-password" element={<ForgetPassword />} />
      </Routes>
    </Router>
  );
}

export default App;