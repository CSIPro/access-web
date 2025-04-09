import { Header } from "@/components/header/header";
import { PibleScanner } from "@/components/pible/pible-scanner";
import { RestrictionsList } from "@/components/restrictions/restrictions-list";

export const RoomRestrictions = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Restricciones" />
      <main className="flex h-full min-h-[100svh] w-full flex-col items-center gap-2 p-2">
        <RestrictionsList />
        <div className="h-64" />
        <PibleScanner />
      </main>
    </div>
  );
};
