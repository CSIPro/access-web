import { AccessLogs } from "@/components/access-logs/access-logs";
import { Header } from "@/components/header/header";
import { RoomSelector } from "@/components/ui/room-selector";

export const LogsPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Access Logs" />
      <main className="flex h-full w-full flex-col gap-2 p-2">
        <RoomSelector />
        <AccessLogs />
      </main>
    </div>
  );
};
