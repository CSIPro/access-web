import { SignupForm } from "@/components/signup/signup-form";

export const CompleteSignup = () => {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted p-4">
      <h1 className="text-xl">Complete the sign up process</h1>
      <SignupForm />
    </div>
  );
};
