import { Header } from "@/components/header/header";
import { RoleList } from "@/components/members/role-list";
import { RoomSelector } from "@/components/ui/room-selector";

export const RoomMembers = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <Header title="Room Members" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <RoomSelector />
        <RoleList />
      </main>
    </div>
  );
};
