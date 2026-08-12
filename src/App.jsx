import { useEffect, lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./stores/useAuthStore";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Spinner from "./components/ui/Spinner";
import BeforeSelling from "./pages/verify/BeforeSelling";
import SellerDetails from "./pages/verify/SellerDetails";
import HelpCenter from "./pages/help/HelpCenter";
import ArticleDetail from "./pages/help/ArticleDetail";
import CategoryPage from "./pages/help/CategoryPage";
import VerifyEmail from "./pages/VerifyEmail";
import useNavbarStore from "./stores/useNavbarStore";
import SellerDashboardLayout from "./components/dashboard/SellerDashboardLayout";
import SellerOverview from "./pages/seller/SellerOverview";
import ListingsManagement from "./pages/seller/ListingsManagement";
import SellerOrders from "./pages/seller/SellerOrders";
import Revenue from "./pages/seller/Revenue";
import Analytics from "./pages/seller/Analytics";
import SellerProfilePage from "./pages/seller/SellerProfile";
import SellerSettings from "./pages/seller/SellerSettings";

// Public Pages - Keep lazy loaded (rarely visited)
import Home from "./pages/Home";
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const BecomeSeller = lazy(() => import("./pages/BecomeSeller"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const GameMarketplace = lazy(() => import("./pages/games/GameMarketplace"));
const SellAccount = lazy(() => import("./pages/sell/SellAccount"));
const ListingDetail = lazy(() => import("./pages/ListingDetail"));
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
import Feedback from "./pages/dashboard/Feedback";
import Support from "./pages/dashboard/Support";

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-arcane-dark">
    <Spinner size="lg" />
  </div>
);

function App() {
  const initialize = useAuthStore((state) => state.initialize);
  const initNavbar = useNavbarStore((state) => state.initialize);
  useEffect(() => {
    initialize();
    initNavbar();
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
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/become-seller" element={<BecomeSeller />} />
            <Route path="/listing/:id" element={<ListingDetail />} />

            <Route
              path="/verify/before-selling"
              element={
                <ProtectedRoute>
                  <BeforeSelling />
                </ProtectedRoute>
              }
            />

            <Route
              path="/verify/seller-details"
              element={
                <ProtectedRoute>
                  <SellerDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route
              path="/marketplace/game/:gameSlug"
              element={<GameMarketplace />}
            />
          </Route>

          {/* Sell Account Route */}
          <Route
            path="/sell"
            element={
              <ProtectedRoute
                allowedRoles={["seller", "admin"]}
                requireSellerVerification
              >
                <SellAccount />
              </ProtectedRoute>
            }
          />

          {/* No Layout */}
          <Route path="/help" element={<HelpCenter />} />
          <Route path="/help/category/:category" element={<CategoryPage />} />
          <Route path="/help/article/:slug" element={<ArticleDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Seller Dashboard Routes */}
          <Route
            path="/seller-dashboard"
            element={
              <ProtectedRoute
                allowedRoles={["seller", "admin"]}
                requireSellerVerification
              >
                <SellerDashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<SellerOverview />} />
            <Route path="listings" element={<ListingsManagement />} />
            <Route path="orders" element={<SellerOrders />} />
            <Route path="revenue" element={<Revenue />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="messages" element={<Messages />} />
            <Route path="profile" element={<SellerProfilePage />} />
            <Route path="settings" element={<SellerSettings />} />
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
            <Route path="feedback" element={<Feedback />} />
            <Route path="support" element={<Support />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
