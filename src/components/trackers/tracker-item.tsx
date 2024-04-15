import { Timestamp } from "firebase/firestore";
import { FC, MouseEventHandler } from "react";
import { IconContext } from "react-icons";
import { BiReset } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "reactfire";
import { z } from "zod";

import { formatRecord, formatTimer } from "@/lib/utils";

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
      <div className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-primary bg-primary-16 p-2 text-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!queryData) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-primary bg-primary-16 p-2 text-white">
        Tracker not found
      </div>
    );
  }

  return (
    <div
      onClick={handleOpenTracker}
      className="flex w-full flex-col gap-2 rounded-sm border-2 border-primary bg-primary-16 p-2 font-body text-white"
    >
      <div className="flex w-full gap-2">
        <div className="flex w-full flex-col gap-1">
          <TrackerTimer
            id={trackerId}
            timeReference={queryData.timeReference}
            record={queryData.record}
          />
          <span className="h-1 w-1/3 rounded-full bg-primary"></span>
          <h3>{queryData?.name}</h3>
        </div>
      </div>
      <TrackerInfo tracker={queryData} />
    </div>
  );
};

interface TrackerTimerProps {
  id: string;
  timeReference: SerializedTimestamp;
  record?: number | null;
}

export const TrackerTimer: FC<TrackerTimerProps> = ({
  id,
  timeReference,
  record,
}) => {
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

      return { formattedTime: formatTimer(trackerDateReference), beatsRecord };
    },
    refetchInterval: 1000,
  });

  return (
    <div className="flex items-center gap-1 font-body text-xl">
      {data?.beatsRecord ? (
        <IconContext.Provider value={{ className: "text-sm text-secondary" }}>
          <FaStar />
        </IconContext.Provider>
      ) : null}
      <span className="">{data?.formattedTime}</span>
    </div>
  );
};

export const TrackerInfo: FC<{ tracker: Tracker }> = ({ tracker }) => {
  const record = tracker.record;

  const auth = useAuth();
  const queryClient = useQueryClient();

  const { status, mutate } = useMutation(async () => {
    const res = await fetch(
      `${import.meta.env.VITE_ACCESS_API_URL}/api/trackers/reset/${tracker.id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
      },
    );

    const data = await res.json();

    queryClient.invalidateQueries(["tracker", tracker.id]);

    return data;
  });

  const handleReset: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();

    if (status === "loading") return;

    mutate();
  };

  return (
    <IconContext.Provider value={{ className: "text-3xl" }}>
      <div className="flex w-full items-end gap-2 text-sm">
        <div className="flex flex-col items-center gap-1 rounded-sm bg-primary-24 p-1 px-2">
          <h4 className="text-xs uppercase">Reset by</h4>
          <p>{tracker.resetBy.name}</p>
        </div>
        <div className="flex flex-col items-center gap-1 rounded-sm bg-primary-24 p-1 px-2">
          <h4 className="text-xs uppercase">Record</h4>
          <p>{record ? formatRecord(record) : "N/A"}</p>
        </div>
        <div className="flex-grow"></div>
        <Button
          onClick={handleReset}
          size="icon"
          className="aspect-square h-full rounded-sm bg-primary-64 p-1 hover:bg-primary focus:bg-primary active:bg-primary"
        >
          {status === "loading" ? <LoadingSpinner size="small" /> : <BiReset />}
        </Button>
      </div>
    </IconContext.Provider>
  );
};
