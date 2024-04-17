import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { useAuth } from "reactfire";

import { Header } from "@/components/header/header";
import {
  TrackerResponse,
  TrackerTimer,
} from "@/components/trackers/tracker-item";
import { LoadingSpinner } from "@/components/ui/spinner";

export const TrackerDetails = () => {
  const params = useParams();
  const auth = useAuth();
  const { status, data } = useQuery({
    queryKey: ["tracker", params.trackerId],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_ACCESS_API_URL}/api/trackers/${
          params.trackerId
        }`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        },
      );

      const data = await res.json();
      const tracker = TrackerResponse.parse(data);

      return tracker.tracker;
    },
  });

  if (status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-primary bg-primary-16 p-2 text-white">
        Tracker not found
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Tracker Details" />
      <TrackerTimer
        id={data.id}
        timeReference={data.timeReference}
        record={data.record}
      />
      <h1>{data.name}</h1>
    </div>
  );
};
