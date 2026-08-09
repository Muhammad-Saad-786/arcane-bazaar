import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";
import Spinner from "../components/ui/Spinner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    } else {
      const timer = setTimeout(() => {
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          navigate("/", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-text-muted">Completing sign in...</p>
      </div>
    </div>
  );
}
