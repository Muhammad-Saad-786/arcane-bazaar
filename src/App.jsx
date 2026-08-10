import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./stores/useAuthStore";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Spinner from "./components/ui/Spinner";

// Public Pages - Keep lazy loaded (rarely visited)
import Home from "./pages/Home";
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const BecomeSeller = lazy(() => import("./pages/BecomeSeller"));

// Dashboard - DIRECT imports (no lazy loading for instant navigation)
import DashboardLayout from "./components/dashboard/DashboardLayout";
import DashboardOverview from "./pages/dashboard/DashboardOverview";
import Orders from "./pages/dashboard/Orders";
import Wishlist from "./pages/dashboard/Wishlist";
import Offers from "./pages/dashboard/Offers";
import Boosting from "./pages/dashboard/Boosting";
import Messages from "./pages/dashboard/Messages";
import Notifications from "./pages/dashboard/Notifications";
import ProfileSettings from "./pages/dashboard/ProfileSettings";
import Wallet from "./pages/dashboard/Wallet";
import Loyalty from "./pages/dashboard/Loyalty";

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-arcane-dark">
    <Spinner size="lg" />
  </div>
);

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const user = useAuthStore((state) => state.user);

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
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/become-seller" element={<BecomeSeller />} />
          </Route>

          {/* Dashboard Routes - NO lazy loading */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            <Route path="orders" element={<Orders />} />
            <Route path="wishlist" element={<Wishlist />} />
            <Route path="offers" element={<Offers />} />
            <Route path="boosting" element={<Boosting />} />
            <Route path="messages" element={<Messages />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="settings" element={<ProfileSettings />} />
            <Route path="wallet" element={<Wallet />} />
            <Route path="loyalty" element={<Loyalty />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
