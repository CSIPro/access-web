import { useUser } from "reactfire";

import { Dashboard } from "@/components/dashboard/dashboard";
import { Header } from "@/components/header/header";

export const AppIndex = () => {
  const { status, error } = useUser();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "error") {
    return <div>{error?.message}</div>;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <Header title="Home" />
      <Dashboard />
    </div>
  );
};
