import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/useUsers";

export default function Home() {
  const { data: profile, isLoading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) return;
    const role = (profile?.role || "").toLowerCase();
    if (role === "student") {
      navigate("/timetable", { replace: true });
    } else if (role === "admin" || role === "instructor") {
      navigate("/dashboard", { replace: true });
    } else {
      navigate("/timetable", { replace: true });
    }
  }, [profile, isLoading, navigate]);

  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
