import { useAuthContext } from "@asgardeo/auth-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
// GradientCanvas removed; using static hero image instead
import { LoginForm } from "@/components/login-form";
export default function Hero() {
  const { state, signIn, signOut } = useAuthContext();
  return (
    <main className="w-screen h-screen flex">
      <div className="w-1/2 h-full flex items-center justify-center p-6 md:p-10">
        {state.isAuthenticated ? (
          <div className="w-full max-w-md">
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Focus on the build — we handle the hassle</h1>
            <p className="mt-3 text-base md:text-lg text-muted-foreground">Centralize your construction projects, suppliers, materials, tasks, and finance in one simple workspace.</p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <Link to="/suppliers">
                <Button className="h-11 w-full sm:w-auto rounded-none shadow-none bg-neutral-900 text-neutral-50 border-0 hover:bg-neutral-800 transition-colors duration-200 ease">Stakeholder Management</Button>
              </Link>
              <Link to="/construction">
                <Button className="h-11 w-full sm:w-auto rounded-none shadow-none bg-neutral-900 text-neutral-50 border-0 hover:bg-neutral-800 transition-colors duration-200 ease">Construction Management</Button>
              </Link>
            </div>
          </div>
        ) : (
          <LoginForm onSignIn={signIn} />
        )}
      </div>
      <div className="w-1/2 h-full">
        <img
          src="/images/hero.png"
          alt="Construction site hero"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        <ModeToggle />
      </div>
    </main>
  );
}
