import { format, formatDistanceToNow } from "date-fns";
import { Timestamp } from "firebase/firestore";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import { IconContext } from "react-icons";
import { IoArrowDown } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuth } from "reactfire";
import { z } from "zod";

import { formatRecord } from "@/lib/utils";

import { SerializedTimestamp, TrackerUser } from "./tracker-item";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
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
    record: z.number().optional().nullable(),
    resetAt: SerializedTimestamp.optional(),
    timeReference: SerializedTimestamp.optional(),
    name: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
  previousState: z
    .object({
      participants: z.array(z.string()).optional(),
      record: z.number().optional().nullable(),
      resetAt: SerializedTimestamp.optional(),
      timeReference: SerializedTimestamp.optional(),
      name: z.string().optional(),
      isActive: z.boolean().optional(),
    })
    .nullable()
    .optional(),
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
      <div className="flex w-full items-start p-2 py-4">
        {status === "loading" && (
          <div className="flex h-full w-full items-center justify-center">
            <LoadingSpinner size="small" />
          </div>
        )}
        {data?.map((lapse) => (
          <TrackerLapseItem key={lapse.id} lapse={lapse} />
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export const TrackerLapseItem: FC<{ lapse: TrackerLapse }> = ({ lapse }) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const creationDate = new Timestamp(
    lapse.createdAt._seconds,
    lapse.createdAt._nanoseconds,
  ).toDate();
  const formattedCreationDate = formatDistanceToNow(creationDate, {
    addSuffix: true,
  });

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <div className="flex w-56 flex-col text-white">
        <div className="relative h-12 w-full">
          <span className="absolute left-0 right-0 top-3.5 h-1 bg-primary-32"></span>
          <span className="absolute bottom-0 left-3.5 top-5 w-1 bg-primary"></span>
          <span className="absolute left-2 top-2 size-4 rounded-full border-2 border-primary bg-muted"></span>
        </div>
        <DialogTrigger asChild>
          <div className="px-2">
            <div className="flex w-full flex-col items-start gap-1 rounded-md border-2 border-primary bg-primary-08 p-2">
              <div className="flex w-full items-center justify-between gap-1">
                <span className="rounded-sm bg-primary-24 px-2 py-1 font-mono font-medium uppercase text-violet-300">
                  {lapse.changeType}
                </span>
                <span className="text-balance text-right text-xs">
                  {formattedCreationDate}
                </span>
              </div>
              <span className="flex-grow text-lg font-medium text-violet-300">
                {lapse.issuer.name}
              </span>
              {lapse.message ? (
                <p className="text-sm">{lapse.message}</p>
              ) : null}
            </div>
          </div>
        </DialogTrigger>
        <DialogContent className="w-5/6 rounded-md border-2 border-primary bg-muted font-body text-white">
          <DialogHeader>
            <DialogTitle>Revert time lapse</DialogTitle>
          </DialogHeader>
          <LapseDetails lapse={lapse} onSubmit={() => setDialogOpen(false)} />
        </DialogContent>
      </div>
    </Dialog>
  );
};

const LapseDetails: FC<{ lapse: TrackerLapse; onSubmit: () => void }> = ({
  lapse,
  onSubmit,
}) => {
  const auth = useAuth();

  const queryClient = useQueryClient();
  const { status, mutate } = useMutation(
    async () => {
      const res = await fetch(
        `${import.meta.env.VITE_ACCESS_API_URL}/api/trackers/revert/${
          lapse.id
        }`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to revert time lapse");
      }
    },
    {
      onSuccess: () => {
        toast.success("Time lapse reverted successfully");
        onSubmit();
      },
      onError: () => {
        toast.error("Failed to revert time lapse");
      },
      onSettled: () => {
        queryClient.invalidateQueries(["tracker-lapses", lapse.trackerId]);
        queryClient.invalidateQueries(["tracker", lapse.trackerId]);
      },
    },
  );

  const formatDate = (timestamp?: SerializedTimestamp) => {
    if (!timestamp) return "N/A";

    const date = new Timestamp(
      timestamp._seconds,
      timestamp._nanoseconds,
    ).toDate();

    return format(date, "yyyy/MM/dd HH:mm");
  };

  if (!lapse.previousState) {
    return <p className="text-center">This time lapse is not reversible.</p>;
  }

  return (
    <IconContext.Provider value={{ className: "text-violet-400 text-2xl" }}>
      <div className="flex w-full flex-col gap-2">
        {lapse.message ? <p>{lapse.message}</p> : null}
        {lapse.payload.name ? (
          <div className="flex w-full flex-col items-center gap-1 rounded-sm bg-primary-16 p-2">
            <h2 className="self-start font-medium text-violet-300">
              Tracker name
            </h2>
            <span className="rounded-sm border-2 border-primary bg-muted px-2 py-1">
              {lapse.payload.name}
            </span>
            <IoArrowDown />
            <span className="rounded-sm border-2 border-primary bg-muted px-2 py-1">
              {lapse.previousState.name ? lapse.previousState.name : "N/A"}
            </span>
          </div>
        ) : null}
        {lapse.payload.timeReference ? (
          <div className="flex w-full flex-col items-center gap-1 rounded-sm bg-primary-16 p-2">
            <h2 className="self-start font-medium text-violet-300">
              Base time
            </h2>
            <span className="rounded-sm border-2 border-primary bg-muted px-2 py-1">
              {formatDate(lapse.payload.timeReference)}
            </span>
            <IoArrowDown />
            <span className="rounded-sm border-2 border-primary bg-muted px-2 py-1">
              {formatDate(lapse.previousState.timeReference)}
            </span>
          </div>
        ) : null}
        {lapse.payload.record ? (
          <div className="flex w-full flex-col items-center gap-1 rounded-sm bg-primary-16 p-2">
            <h2 className="self-start font-medium text-violet-300">Record</h2>
            <span className="rounded-sm border-2 border-primary bg-muted px-2 py-1">
              {formatRecord(lapse.payload.record)}
            </span>
            <IoArrowDown />
            <span className="rounded-sm border-2 border-primary bg-muted px-2 py-1">
              {lapse.previousState.record
                ? formatRecord(lapse.previousState.record)
                : "N/A"}
            </span>
          </div>
        ) : null}
        {lapse.payload.participants ? (
          <div className="flex w-full flex-col items-center gap-1 rounded-sm bg-primary-16 p-2">
            <h2 className="self-start font-medium text-violet-300">
              Participants
            </h2>
            <p className="text-center">
              There were changes to participants in this time lapse, but this
              app doesn&apos;t show participant diffs due to it being
              computationally expensive.
            </p>
          </div>
        ) : null}
        <Button
          disabled={status === "loading" || lapse.changeType === "rollback"}
          onClick={() => {
            if (status === "loading") return;
            mutate();
          }}
          className="bg-secondary hover:bg-secondary hover:brightness-110 focus:bg-secondary focus:brightness-110 active:bg-secondary active:brightness-110"
        >
          {status === "loading" ? (
            <LoadingSpinner size="small" />
          ) : lapse.changeType === "rollback" ? (
            "No revertceptions allowed"
          ) : (
            "Revert"
          )}
        </Button>
      </div>
    </IconContext.Provider>
  );
};
