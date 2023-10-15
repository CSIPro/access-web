import { SignupForm } from "@/components/signup/signup-form";

export const CompleteSignup = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center gap-2 bg-muted p-4">
      <h1 className="flex items-center gap-2 whitespace-nowrap pb-4 text-4xl md:text-6xl">
        CSI PRO{" "}
        <span className="bg-white px-2 font-bold text-muted">ACCESS</span>
      </h1>
      <h2 className="text-xl">Complete the sign up process</h2>
      <SignupForm />
    </div>
  );
};
