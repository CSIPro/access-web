import { Header } from "@/components/header/header";
import { PibleScanner } from "@/components/pible/pible-scanner";
import { RequestsList } from "@/components/room-requests/requests-list";

export const RoomRequests = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Room Requests" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <RequestsList />
        <div className="h-64" />
        <PibleScanner />
      </main>
    </div>
  );
};
