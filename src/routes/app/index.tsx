import { Dashboard } from "@/components/dashboard/dashboard";
import { Header } from "@/components/header/header";
import { PibleScanner } from "@/components/pible/pible-scanner";

export const AppIndex = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Home" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <Dashboard />
        <div className="h-64" />
        {!!navigator.bluetooth && <PibleScanner />}
      </main>
    </div>
  );
};
