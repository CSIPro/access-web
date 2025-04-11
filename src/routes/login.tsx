import { AuthButton } from "@/components/ui/auth-button";
import { Branding } from "@/components/ui/branding";

export const Login = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-muted">
      <div className="relative flex h-[100svh] w-full flex-col items-center justify-between bg-muted py-16 md:max-w-md">
        <div className="flex w-full flex-col items-center gap-16">
          <h1 className="flex items-center justify-center gap-2 whitespace-nowrap text-3xl md:text-5xl">
            CSI PRO{" "}
            <span className="rounded bg-primary px-2 font-bold text-white">
              ACCESS
            </span>
          </h1>
          <img
            src="/images/access-logo.svg"
            alt="Logo de CSI PRO Access"
            className="w-40"
          />
        </div>
        <div className="flex w-full flex-col items-center gap-20">
          <div className="flex w-4/5 flex-col items-center justify-center gap-2">
            <AuthButton provider="github" />
            <AuthButton provider="google" />
          </div>
          <Branding />
        </div>
      </div>
    </div>
  );
};
