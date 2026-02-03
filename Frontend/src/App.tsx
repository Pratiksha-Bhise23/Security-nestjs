import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Otp from "./pages/Otp";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/otp" element={<Otp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}
