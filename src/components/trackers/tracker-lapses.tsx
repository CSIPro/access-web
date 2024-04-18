import { formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { FC } from "react";
import { useQuery } from "react-query";
import { useAuth } from "reactfire";
import { z } from "zod";

import { SerializedTimestamp, TrackerUser } from "./tracker-item";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { LoadingSpinner } from "../ui/spinner";

export const TrackerLapse = z.object({
  id: z.string(),
  trackerId: z.string(),
  issuer: TrackerUser,
  createdAt: SerializedTimestamp,
  message: z.string().optional(),
  changeType: z.enum(["add", "reset", "edit", "delete", "rollback"]),
  payload: z.object({
    participants: z.array(z.string()).optional(),
    record: z.number().optional(),
    resetAt: SerializedTimestamp.optional(),
    timeReference: SerializedTimestamp.optional(),
    name: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
export type TrackerLapse = z.infer<typeof TrackerLapse>;

export const APILapseResponse = z.object({
  lapses: z.array(TrackerLapse),
});
export type APILapseResponse = z.infer<typeof APILapseResponse>;

interface Props {
  trackerId: string;
}

export const TrackerLapses: FC<Props> = ({ trackerId }) => {
  const auth = useAuth();
  const { status, data } = useQuery({
    queryKey: ["tracker-lapses", trackerId],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_ACCESS_API_URL
        }/api/trackers/lapses/${trackerId}`,
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch tracker lapses");
      }

      const data = await res.json();
      const lapses = APILapseResponse.safeParse(data);

      if (!lapses.success) {
        throw new Error("Failed to parse tracker lapses");
      }

      return lapses.data.lapses;
    },
  });

  return (
    <ScrollArea className="rounded-sm border-2 border-primary">
      <div className="flex w-full items-center p-2 py-4">
        {status === "loading" && <LoadingSpinner size="small" />}
        {data?.map((lapse) => (
          <TrackerLapseItem key={lapse.id} lapse={lapse} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export const TrackerLapseItem: FC<{ lapse: TrackerLapse }> = ({ lapse }) => {
  const creationDate = new Timestamp(
    lapse.createdAt._seconds,
    lapse.createdAt._nanoseconds,
  ).toDate();
  const formattedCreationDate = formatDistanceToNow(creationDate, {
    addSuffix: true,
  });

  return (
    <div className="flex w-48 flex-col gap-2 text-white">
      <div className="relative h-16 w-full">
        <span className="absolute left-0 right-0 top-3.5 h-1 bg-primary-32"></span>
        <span className="absolute left-4 top-2 size-4 rounded-full border-2 border-primary bg-muted"></span>
        <span className="absolute bottom-2 left-4 line-clamp-1">
          {formattedCreationDate}
        </span>
      </div>
      <div className="flex w-full items-center gap-1">
        <span className="rounded-sm bg-primary-24 px-2 py-1 font-mono">
          {lapse.changeType.toUpperCase()}
        </span>
        <span className="flex-grow text-lg">{lapse.issuer.name}</span>
      </div>
    </div>
  );
};
