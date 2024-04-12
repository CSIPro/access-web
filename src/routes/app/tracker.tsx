import { Header } from "@/components/header/header";

export const Tracker = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Trackers" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2"></main>
    </div>
  );
};
