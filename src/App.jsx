import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./stores/useAuthStore";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";

function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1E1D24",
            color: "#fff",
            border: "1px solid #2A2932",
          },
        }}
      />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
