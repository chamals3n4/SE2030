import { useAuthContext } from "@asgardeo/auth-react";
import { Button } from "../components/ui/button";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
export default function Hero() {
  const { state, signIn, signOut } = useAuthContext();
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Construction Management Portal</h1>
          <div className="pt-2">
            {state.isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-700">Hi 👋 {state.username}</span>
                <Button className="flex items-center gap-2" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button className="flex items-center gap-2" onClick={() => signIn()}>
                Sign in
              </Button>
            )}
          </div>
        </div>

        {state.isAuthenticated && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">Stakeholder Management</h2>
              <p className="text-gray-600 mb-4">Manage external suppliers and partners.</p>
              <div className="flex gap-3">
                <Link to="/suppliers">
                  <Button>Suppliers Management</Button>
                </Link>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-2">Construction Management</h2>
              <p className="text-gray-600 mb-4">Projects, marketplace, and your company store.</p>
              <div className="flex gap-3">
                <Link to="/construction">
                  <Button>Open Construction</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Theme toggle - bottom right */}
      <div className="fixed bottom-4 right-4 z-50">
        <ModeToggle />
      </div>
    </div>
  );
}
