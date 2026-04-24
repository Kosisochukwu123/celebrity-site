import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MembersArea from "./pages/MembersArea";
import AdminPanel from "./pages/Admin/AdminPanel";
import MembershipPage from "./pages/MembershipPage";
import CausePage from './pages/CausePage';
import EventBoard from "./pages/EventBoard";
import AdminEventManager from "./pages/Admin/AdminEventManager ";



function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <ChatWidget />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/membership" element={<MembershipPage />} />
          <Route path="/cause/:id" element={<CausePage />} />
          <Route path="/events" element={<EventBoard />} />
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
