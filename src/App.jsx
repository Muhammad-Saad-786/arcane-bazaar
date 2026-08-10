import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./stores/useAuthStore";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Spinner from "./components/ui/Spinner";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthCallback from "./pages/AuthCallback";

// Dashboard Layout
const DashboardLayout = lazy(
  () => import("./components/dashboard/DashboardLayout"),
);

// Dashboard Pages
const DashboardOverview = lazy(
  () => import("./pages/dashboard/DashboardOverview"),
);
const Orders = lazy(() => import("./pages/dashboard/Orders"));
const Wishlist = lazy(() => import("./pages/dashboard/Wishlist"));
const Offers = lazy(() => import("./pages/dashboard/Offers"));
const Boosting = lazy(() => import("./pages/dashboard/Boosting"));
const Messages = lazy(() => import("./pages/dashboard/Messages"));
const Notifications = lazy(() => import("./pages/dashboard/Notifications"));
const ProfileSettings = lazy(() => import("./pages/dashboard/ProfileSettings"));
const Wallet = lazy(() => import("./pages/dashboard/Wallet"));
const Loyalty = lazy(() => import("./pages/dashboard/Loyalty"));

// Loading Fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-arcane-dark">
    <Spinner size="lg" />
  </div>
);

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
          </Route>

          {/* Dashboard Routes */}
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
