import { useContext, useState } from "react";
import { useQuery } from "react-query";
import { z } from "zod";

import { RoleContext } from "@/context/role-context";
import { RoomContext } from "@/context/room-context";
import { UserContext } from "@/context/user-context";
import { findRole } from "@/lib/utils";

import { TrackerForm } from "./tracker-form";
import { TrackerItem } from "./tracker-item";
import { BrandingHeader } from "../ui/branding-header";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/spinner";

export const TrackersResponse = z.object({
  trackers: z.array(
    z.object({
      id: z.string(),
    }),
  ),
});
export type TrackersResponse = z.infer<typeof TrackersResponse>;

export const TrackersDashboard = () => {
  const roleCtx = useContext(RoleContext);
  const userCtx = useContext(UserContext);
  const { selectedRoom } = useContext(RoomContext);

  const [isAdding, setIsAdding] = useState(false);
  const { status, data } = useQuery({
    queryKey: ["trackers", selectedRoom],
    queryFn: async () => {
      setIsAdding(false);
      const res = await fetch(
        `${
          import.meta.env.VITE_ACCESS_API_URL
        }/api/trackers/active/${selectedRoom}`,
      );

      const data = await res.json();
      const trackers = TrackersResponse.parse(data);

      return trackers.trackers;
    },
  });

  if (status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const userRole = findRole(userCtx.user?.role, roleCtx.roles);
  const canAddTrackers = userCtx.user?.isRoot || (userRole?.level ?? 0) >= 20;

  return (
    <div className="flex h-full w-full flex-col gap-2">
      <BrandingHeader
        highlight="TRACKER"
        highlightClassName="bg-primary text-white"
      >
        CSI PRO
      </BrandingHeader>
      {isAdding && (
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => setIsAdding(false)}
            className="bg-secondary uppercase hover:bg-white hover:text-secondary focus:bg-secondary focus:text-white"
          >
            Cancel
          </Button>
          <TrackerForm />
        </div>
      )}
      {canAddTrackers
        ? !isAdding && (
            <Button
              onClick={() => setIsAdding(true)}
              className="uppercase hover:bg-white hover:text-primary focus:bg-white focus:text-primary"
            >
              Add Tracker
            </Button>
          )
        : null}
      {data && data.map(({ id }) => <TrackerItem key={id} trackerId={id} />)}
      {data && <div className="h-96 w-full"></div>}
    </div>
  );
};
