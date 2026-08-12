import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../../stores/useAuthStore";
import Spinner from "../ui/Spinner";

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  requireSellerVerification = false,
}) {
  const { user, profile, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-arcane-dark">
        <Spinner size="lg" />
      </div>
    );
  }

  // User is not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Auth user exists, but profile could not be loaded
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-arcane-dark px-4 text-center">
        <h1 className="text-xl font-bold text-white">Profile unavailable</h1>

        <p className="mt-2 text-sm text-text-muted">
          We could not load your account profile. Please refresh the page or
          sign in again.
        </p>
      </div>
    );
  }

  // Block banned users
  if (profile.banned) {
    return <Navigate to="/" replace />;
  }

  // Check allowed roles when the route requires specific roles
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    const isSellerRoute = allowedRoles.includes("seller");

    return (
      <Navigate to={isSellerRoute ? "/become-seller" : "/dashboard"} replace />
    );
  }

  // Admin can access seller routes without seller KYC
  const isAdmin = profile.role === "admin";

  // Seller verification check
  if (requireSellerVerification && !isAdmin) {
    const isVerifiedSeller =
      profile.role === "seller" &&
      profile.verified_seller === true &&
      profile.kyc_verified === true &&
      profile.kyc_provider === "persona";

    if (!isVerifiedSeller) {
      return <Navigate to="/become-seller" replace />;
    }
  }

  return children;
}
