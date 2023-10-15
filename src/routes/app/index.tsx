import { useUser } from "reactfire";

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
    <div className="flex min-h-screen w-full flex-col items-center bg-primary">
      <Header title="Home" />
      <h1 className="flex items-center gap-2 text-3xl sm:text-5xl">
        CSI PRO{" "}
        <span className="bg-white px-2 font-bold text-primary">ACCESS</span>
      </h1>
    </div>
  );
};
