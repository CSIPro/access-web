import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { useQuery } from "react-query";
import { useAuth } from "reactfire";
import { z } from "zod";

import { RoleContext } from "@/context/role-context";
import { RoomContext } from "@/context/room-context";
import { UserContext } from "@/context/user-context";
import { findRole } from "@/lib/utils";

import { TrackerForm } from "./tracker-form";
import { TrackerItem } from "./tracker-item";
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
  const [isAdding, setIsAdding] = useState(false);

  const roleCtx = useContext(RoleContext);
  const userCtx = useContext(UserContext);
  const { selectedRoom } = useContext(RoomContext);

  const auth = useAuth();

  const { status, data, error } = useQuery<TrackersResponse["trackers"], Error>(
    {
      queryKey: ["trackers", selectedRoom],
      queryFn: async () => {
        setIsAdding(false);
        const res = await fetch(
          `${
            import.meta.env.VITE_ACCESS_API_URL
          }/api/trackers/active/${selectedRoom}`,
          {
            headers: {
              Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (!res.ok) {
          switch (res.status) {
            case 401:
              toast.error("You are not logged in.");
              break;
            case 403:
              toast.error("You do not have permission to view trackers.");
              break;
            case 429:
              toast.error("Too many requests. Please try again later.");
              break;
            default:
              toast.error("An error occurred. Please try again later.");
              break;
          }

          throw new Error("Too many requests. Please try again later.");
        }

        const data = await res.json();
        const trackers = TrackersResponse.parse(data);

        return trackers.trackers;
      },
      enabled: !!selectedRoom,
    },
  );

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
      {error && <p className="text-center font-body">{error.message}</p>}
    </div>
  );
};
