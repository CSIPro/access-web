import { useNavigate } from "react-router-dom";
import { useAuth } from "reactfire";

import { SignupForm } from "@/components/signup/signup-form";
import { Button } from "@/components/ui/button";

export const CompleteSignup = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-2 bg-muted p-4">
      <h1 className="flex items-center gap-2 whitespace-nowrap pb-4 text-4xl md:text-6xl">
        CSI PRO{" "}
        <span className="bg-white px-2 font-bold text-muted">ACCESS</span>
      </h1>
      <h2 className="text-xl">Complete the sign up process</h2>
      <SignupForm />
      <div className="w-full px-4">
        <Button
          variant="destructive"
          onClick={handleSignOut}
          className="w-full"
        >
          Log out
        </Button>
      </div>
    </div>
  );
};
