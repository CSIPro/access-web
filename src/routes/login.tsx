import { AuthButton } from "@/components/ui/auth-button";
import { Branding } from "@/components/ui/branding";

export const Login = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-primary">
      <div className="relative flex min-h-screen w-full flex-col items-center justify-evenly bg-primary md:max-w-md">
        <h1 className="flex items-center justify-center gap-2 whitespace-nowrap text-3xl md:text-5xl">
          CSI PRO{" "}
          <span className="bg-white px-2 font-bold text-primary">ACCESS</span>
        </h1>
        <div className="flex w-4/5 flex-col items-center justify-center gap-2">
          <AuthButton provider="github" />
          <AuthButton provider="google" />
        </div>
        <Branding />
      </div>
    </div>
  );
};
