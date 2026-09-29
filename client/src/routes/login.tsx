import { createFileRoute } from "@tanstack/react-router";
import { SignIn } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  return (
    <div className="flex justify-center px-6 py-12">
      <SignIn routing="hash" signUpUrl="/signup" fallbackRedirectUrl="/" />
    </div>
  );
}
