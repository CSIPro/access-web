import { AccessLogs } from "@/components/access-logs/access-logs";
import { Header } from "@/components/header/header";
import { PibleScanner } from "@/components/pible/pible-scanner";

export const LogsPage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Access Logs" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <AccessLogs />
        <div className="h-64" />
        <PibleScanner />
      </main>
    </div>
  );
};
