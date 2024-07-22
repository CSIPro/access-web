import { useNavigate } from "react-router-dom";

import { SignupForm } from "@/components/signup/signup-form";
import { BrandingHeader } from "@/components/ui/branding-header";
import { Button } from "@/components/ui/button";
import { firebaseAuth } from "@/firebase";

export const CompleteSignup = () => {
  const navigate = useNavigate();
  const auth = firebaseAuth;

  const handleSignOut = async () => {
    await auth.signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-2 bg-muted p-4">
      <BrandingHeader highlight="ACCESS">CSI PRO</BrandingHeader>
      <h2 className="text-xl">Termina el proceso de registro</h2>
      <SignupForm />
      <div className="py-4"></div>
      <Button variant="destructive" onClick={handleSignOut} className="w-full">
        Salir
      </Button>
      <div className="py-32"></div>
    </div>
  );
};
