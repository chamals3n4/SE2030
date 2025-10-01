import { useAuthContext } from "@asgardeo/auth-react";
import { useAuth } from "@/hooks/use-auth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const { state } = useAuthContext();
  useAuth();


  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-500 text-lg">loading...</div>
        </div>
      </div>
    );
  }

  if (!state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
