import { Timestamp } from "firebase/firestore";
import { FC, MouseEventHandler } from "react";
import toast from "react-hot-toast";
import { IconContext } from "react-icons";
import { BiReset } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "reactfire";
import { z } from "zod";

import { cn, formatRecord, formatTimer } from "@/lib/utils";

import { TimerSegment } from "./timer-segment";
import { TrackerItemProvider, useTrackerItemContext } from "./tracker-context";
import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/spinner";

export const SerializedTimestamp = z.object({
  _seconds: z.number(),
  _nanoseconds: z.number(),
});
export type SerializedTimestamp = z.infer<typeof SerializedTimestamp>;

export const TrackerUser = z.object({
  id: z.string(),
  name: z.string(),
});
export type TrackerUser = z.infer<typeof TrackerUser>;

export const Tracker = z.object({
  id: z.string(),
  name: z.string(),
  isActive: z.boolean().default(true),
  createdAt: SerializedTimestamp,
  updatedAt: SerializedTimestamp,
  resetAt: SerializedTimestamp.optional(),
  roomId: z.string(),
  timeReference: SerializedTimestamp,
  creator: TrackerUser,
  updatedBy: TrackerUser,
  resetBy: TrackerUser,
  participants: z.array(TrackerUser).optional().default([]),
  record: z.number().optional().nullable(),
  color: z.string().optional(),
});
export type Tracker = z.infer<typeof Tracker>;

export const TrackerResponse = z.object({
  tracker: Tracker,
});
export type TrackerResponse = z.infer<typeof TrackerResponse>;

interface Props {
  trackerId: string;
}

export const TrackerItem: FC<Props> = ({ trackerId }) => {
  const auth = useAuth();
  const navigate = useNavigate();

  const { status: queryStatus, data: queryData } = useQuery({
    queryKey: ["tracker", trackerId],
    queryFn: async () => {
      const res = await fetch(
        `${import.meta.env.VITE_ACCESS_API_URL}/api/trackers/${trackerId}`,
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

  const handleOpenTracker = () => {
    navigate(`/app/tracker/${trackerId}`);
  };

  if (queryStatus === "loading") {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-primary bg-primary-08 p-2 text-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!queryData) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-primary bg-primary-08 p-2 text-white">
        Tracker not found
      </div>
    );
  }

  return (
    <TrackerItemProvider>
      <div
        onClick={handleOpenTracker}
        className="relative flex w-full flex-col gap-2 rounded-sm border-2 border-primary bg-primary-08 p-2 font-body text-white after:absolute after:bottom-1 after:right-1 after:top-1 after:w-1 after:rounded-full after:bg-primary"
      >
        <h3 className="text-xl">{queryData?.name}</h3>
        <TrackerTimer
          id={trackerId}
          timeReference={queryData.timeReference}
          record={queryData.record}
        />
        <TrackerInfo tracker={queryData} />
      </div>
    </TrackerItemProvider>
  );
};

interface TrackerTimerProps {
  id: string;
  timeReference: SerializedTimestamp;
  record?: number | null;
  size?: "normal" | "large";
}

export const TrackerTimer: FC<TrackerTimerProps> = ({
  id,
  timeReference,
  record,
  size = "normal",
}) => {
  const trackerCtx = useTrackerItemContext();
  const auth = useAuth();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ["tracker-timer", id],
    queryFn: () => {
      const trackerDateReference = new Timestamp(
        timeReference._seconds,
        timeReference._nanoseconds,
      )
        .toDate()
        .getTime();

      const beatsRecord = record
        ? Date.now() - trackerDateReference >= record
        : true;

      trackerCtx.setBeatsRecord(beatsRecord);

      return { ...formatTimer(trackerDateReference), beatsRecord };
    },
    refetchInterval: 1000,
  });

  const { status, mutate } = useMutation<{ message: string }, Error>(
    async () => {
      const res = await fetch(
        `${import.meta.env.VITE_ACCESS_API_URL}/api/trackers/reset/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
          },
        },
      );

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("You're not authorized to reset this tracker");
        }
      }

      const data = await res.json();

      queryClient.invalidateQueries(["tracker", id]);
      queryClient.invalidateQueries(["tracker-lapses", id]);

      return data;
    },
    {
      onSuccess: (_) => {
        toast.success("Tracker reset successfully");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    },
  );

  const handleReset: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();

    if (status === "loading") return;

    mutate();
  };

  return (
    <IconContext.Provider value={{ className: "text-3xl" }}>
      <div
        className={cn(
          "flex flex-shrink-0 items-stretch gap-1 font-mono text-lg",
          size === "large" && "text-2xl",
        )}
      >
        <TimerSegment>{`${data?.days}d`}</TimerSegment>
        <TimerSegment>{`${data?.hours}h`}</TimerSegment>
        <TimerSegment>{`${data?.minutes}m`}</TimerSegment>
        <TimerSegment>{`${data?.seconds}s`}</TimerSegment>
        <Button
          onClick={handleReset}
          size="icon"
          className="aspect-square h-auto w-auto rounded-sm bg-primary-64 p-1 hover:bg-primary focus:bg-primary active:bg-primary"
        >
          {status === "loading" ? <LoadingSpinner size="small" /> : <BiReset />}
        </Button>
      </div>
    </IconContext.Provider>
  );
};

export const TrackerInfo: FC<{ tracker: Tracker }> = ({ tracker }) => {
  const record = tracker.record;

  return (
    <IconContext.Provider value={{ className: "text-xl" }}>
      <div className="flex w-full items-stretch gap-1 text-sm">
        <div className="flex items-center gap-1 rounded-sm bg-primary-24 p-1 px-2">
          <BiReset />
          <p className="line-clamp-1">{tracker.resetBy.name}</p>
        </div>
        <div className="flex items-center gap-1 rounded-sm bg-primary-24 p-1 px-2">
          <FaStar />
          <p className="line-clamp-1">
            {record ? formatRecord(record) : "N/A"}
          </p>
        </div>
      </div>
    </IconContext.Provider>
  );
};
