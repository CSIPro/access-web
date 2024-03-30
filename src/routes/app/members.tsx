import { Header } from "@/components/header/header";
import { RoleList } from "@/components/members/role-list";
import { PibleScanner } from "@/components/pible/pible-scanner";

export const RoomMembers = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Room Members" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <RoleList />
        <div className="h-64" />
        <PibleScanner />
      </main>
    </div>
  );
};
