import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";
import NotificationBar from "./components/Notificationbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MembersArea from "./pages/MembersArea";
import AdminPanel from "./pages/Admin/AdminPanel";
import MembershipPage from "./pages/MembershipPage";
import CausePage from "./pages/CausePage";
import EventBoard from "./pages/EventBoard";
import AdminEventManager from "./components/AdminEventManager";
import PrivateGallery from "./components/PrivateGallery";
import AdminPrivateGallery from "./components/AdminPrivateGallery";
import ImpactReport from "./pages/ImpactReport";
import UserSettings from "./pages/UserSettings";
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <ScrollToTop/>
        <NotificationBar />
        <ChatWidget />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/cause/:id" element={<CausePage />} />
          <Route path="/membership/events" element={<EventBoard />} />
          <Route path="/membership/gallery" element={<PrivateGallery />} />
          <Route path="/membership/impact" element={<ImpactReport/>} />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <UserSettings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute adminOnly>
                <AdminEventManager />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <MembersArea />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/gallery"
            element={
              <ProtectedRoute adminOnly>
                <AdminPrivateGallery />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
