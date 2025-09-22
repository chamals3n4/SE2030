import { useAuthContext } from "@asgardeo/auth-react";
import { Button } from "../components/ui/button";
export default function Hero() {
  const { state, signIn, signOut } = useAuthContext();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold">
          better landing page needed here 🤗
        </h1>
        <div className="pt-6">
          {state.isAuthenticated ? (
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Hi 👋 {state.username}
              </h1>
              <Button
                className="flex items-center gap-2"
                onClick={() => signOut()}
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <Button
              className="flex items-center gap-2"
              onClick={() => signIn()}
            >
              Sign in
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
