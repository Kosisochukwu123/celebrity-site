import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import ChatWidget from "./components/ChatWidget";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MembersArea from "./pages/MembersArea";
import AdminPanel from "./pages/AdminPanel";
import MembershipPage from "./pages/MembershipPage";
// import MembershipPage from './pages/MembershipPage';
import CausePage from './pages/CausePage';


console.log('=== Environment Variables Debug ===');
console.log('VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
console.log('Mode:', import.meta.env.MODE);
console.log('Is Prod:', import.meta.env.PROD);
console.log('===================================');

const API = import.meta.env.VITE_BACKEND_URL;
console.log('API URL being used:', API);

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
