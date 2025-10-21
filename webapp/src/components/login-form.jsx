import { Button } from "@/components/ui/button";

export function LoginForm({ onSignIn }) {
    return (
        <div className="w-full max-w-md space-y-6">
            <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">Focus on the build — we handle the hassle</h1>
                <p className="mt-3 text-base md:text-lg text-muted-foreground">Centralize your construction projects, suppliers, materials, tasks, and finance in one simple workspace.</p>
            </div>

            <div className="mt-3">
                <Button
                    className="h-11 w-full rounded-none shadow-none bg-neutral-900 hover:cursor-pointer text-neutral-50 border-0 hover:bg-neutral-800 transition-colors duration-200 ease"
                    onClick={() => onSignIn()}
                >
                    Sign in with Asgardeo
                </Button>
            </div>
        </div>
    );
}


