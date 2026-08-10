import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import useAuthStore from "../stores/useAuthStore";
import Spinner from "../components/ui/Spinner";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { fetchProfile } = useAuthStore();
  const [status, setStatus] = useState("Processing...");

  useEffect(() => {
    // Supabase OAuth puts the tokens in the URL hash
    const handleAuth = async () => {
      try {
        console.log("Full URL:", window.location.href);
        console.log("Hash:", window.location.hash);

        // If hash exists with access_token, Supabase will handle it
        const { data, error } = await supabase.auth.getSession();

        console.log("Session:", {
          hasSession: !!data.session,
          user: data.session?.user?.email,
          error: error?.message,
        });

        if (data.session?.user) {
          setStatus("Loading profile...");
          await fetchProfile(data.session.user.id);
          navigate("/", { replace: true });
        } else {
          // Try to exchange the code
          setStatus("Exchanging code...");
          setTimeout(async () => {
            const { data: retryData } = await supabase.auth.getSession();
            if (retryData.session?.user) {
              await fetchProfile(retryData.session.user.id);
              navigate("/", { replace: true });
            } else {
              setStatus("Failed. Redirecting...");
              setTimeout(() => navigate("/login"), 2000);
            }
          }, 2000);
        }
      } catch (err) {
        console.error("Error:", err);
        setStatus("Error: " + err.message);
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-text-muted">Completing sign in...</p>
        <p className="text-xs text-text-muted mt-2">{status}</p>
      </div>
    </div>
  );
}
