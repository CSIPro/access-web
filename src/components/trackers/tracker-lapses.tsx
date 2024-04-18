import { format } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { FC } from "react";
import { useQuery } from "react-query";
import { useAuth } from "reactfire";
import { z } from "zod";

import { SerializedTimestamp, TrackerUser } from "./tracker-item";
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
    <div className="flex w-full flex-col items-center gap-2">
      {status === "loading" && <LoadingSpinner size="small" />}
      {data?.map((lapse) => <TrackerLapseItem key={lapse.id} lapse={lapse} />)}
    </div>
  );
};

export const TrackerLapseItem: FC<{ lapse: TrackerLapse }> = ({ lapse }) => {
  const creationDate = new Timestamp(
    lapse.createdAt._seconds,
    lapse.createdAt._nanoseconds,
  ).toDate();
  const formattedCreationDate = format(creationDate, "yyyy/MM/dd HH:mm");

  return (
    <div className="flex w-full flex-col gap-2 border-2 border-primary bg-primary-08 p-2 text-white">
      <div className="flex w-full items-center gap-1">
        <span className="rounded-sm bg-primary-24 px-2 py-1">
          {lapse.changeType.toUpperCase()}
        </span>
        <span className="flex-grow text-lg">{lapse.issuer.name}</span>
        <span>{formattedCreationDate}</span>
      </div>
    </div>
  );
};
