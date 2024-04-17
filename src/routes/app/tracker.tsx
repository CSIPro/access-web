import { Header } from "@/components/header/header";
import { TrackersDashboard } from "@/components/trackers/trackers-dashboard";

export const TrackersPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Trackers" />
      <main className="flex w-full flex-col items-center gap-2 p-2">
        <TrackersDashboard />
      </main>
    </div>
  );
};
