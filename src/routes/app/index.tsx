import { Dashboard } from "@/components/dashboard/dashboard";
import { Header } from "@/components/header/header";
import { RoomSelector } from "@/components/ui/room-selector";

export const AppIndex = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <Header title="Home" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <RoomSelector />
        <Dashboard />
      </main>
    </div>
  );
};
