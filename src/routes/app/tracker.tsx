import { Header } from "@/components/header/header";
import { TrackersDashboard } from "@/components/trackers/trackers-dashboard";
import { BrandingHeader } from "@/components/ui/branding-header";

export const TrackersPage = () => {
  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Trackers" />
      <main className="flex w-full flex-col items-center gap-2 p-2">
        <BrandingHeader
          highlight="TRACKER"
          highlightClassName="bg-primary text-white"
        >
          CSI PRO
        </BrandingHeader>
        <TrackersDashboard />
      </main>
    </div>
  );
};
