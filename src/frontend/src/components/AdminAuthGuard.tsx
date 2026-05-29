import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { adminAuthApi } from "../api/adminAuthApi";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export default function AdminAuthGuard() {
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    adminAuthApi
      .checkStatus()
      .then(({ authenticated }) =>
        setStatus(authenticated ? "authenticated" : "unauthenticated"),
      )
      .catch(() => setStatus("unauthenticated"));
  }, []);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
