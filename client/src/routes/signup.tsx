import { createFileRoute } from "@tanstack/react-router";
import { SignUp } from "@clerk/tanstack-react-start";

export const Route = createFileRoute("/signup")({ component: SignupPage });

function SignupPage() {
  return (
    <div className="flex justify-center px-6 py-12">
      <SignUp routing="hash" signInUrl="/login" fallbackRedirectUrl="/" />
    </div>
  );
}
