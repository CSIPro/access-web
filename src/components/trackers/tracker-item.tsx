import { Timestamp } from "firebase/firestore";
import { FC } from "react";
import { IconContext } from "react-icons";
import { BiReset } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuth } from "reactfire";
import { z } from "zod";

import { formatRecord, formatTimer } from "@/lib/utils";

import { Button } from "../ui/button";
import { LoadingSpinner } from "../ui/spinner";

const SerializedTimestamp = z.object({
  _seconds: z.number(),
  _nanoseconds: z.number(),
});
type SerializedTimestamp = z.infer<typeof SerializedTimestamp>;

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
  record: z.number().optional().nullable(),
  color: z.string().optional(),
});
export type Tracker = z.infer<typeof Tracker>;

const TrackerResponse = z.object({
  tracker: Tracker,
});
type TrackerResponse = z.infer<typeof TrackerResponse>;

interface Props {
  trackerId: string;
}

export const TrackerItem: FC<Props> = ({ trackerId }) => {
  const auth = useAuth();
  const queryClient = useQueryClient();

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

  const { status: mutationStatus, mutateAsync } = useMutation(async () => {
    const res = await fetch(
      `${import.meta.env.VITE_ACCESS_API_URL}/api/trackers/reset/${trackerId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
      },
    );

    const data = await res.json();

    queryClient.invalidateQueries(["tracker", trackerId]);

    return data;
  });

  const handleReset = async () => {
    if (mutationStatus === "loading") return;

    await mutateAsync();
  };

  if (queryStatus === "loading" || mutationStatus === "loading") {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-primary bg-primary-32 p-2 text-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (!queryData) {
    return (
      <div className="flex w-full items-center justify-center gap-2 rounded-sm border-2 border-primary bg-primary-32 p-2 text-white">
        Tracker not found
      </div>
    );
  }

  return (
    <div className="font-body flex w-full flex-col gap-2 rounded-sm border-2 border-primary bg-primary-16 p-2 text-white">
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
        <IconContext.Provider value={{ className: "text-2xl" }}>
          <div className="flex flex-col gap-1">
            <Button
              onClick={handleReset}
              size="icon"
              className="h-fit w-fit rounded-sm bg-primary-64 p-1"
            >
              <BiReset />
            </Button>
            {/* <Button
            size="icon"
            className="h-fit w-fit rounded-sm bg-primary-64 p-1"
          >
            <FiEdit2 />
          </Button> */}
            {/* <div className="flex-grow rounded-sm bg-primary-32 transition-all hover:bg-primary-64 focus:bg-primary-64"></div> */}
          </div>
        </IconContext.Provider>
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

const TrackerTimer: FC<TrackerTimerProps> = ({ id, timeReference, record }) => {
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
    <div className="font-body flex items-center gap-1 text-xl">
      {data?.beatsRecord ? (
        <IconContext.Provider value={{ className: "text-sm text-secondary" }}>
          <FaStar />
        </IconContext.Provider>
      ) : null}
      <span className="">{data?.formattedTime}</span>
    </div>
  );
};

const TrackerInfo: FC<{ tracker: Tracker }> = ({ tracker }) => {
  const record = tracker.record;

  return (
    <div className="flex w-full gap-2 text-sm">
      <div className="flex flex-col items-center gap-1 rounded-sm bg-primary-24 p-1">
        <h4 className="text-xs uppercase">Reset by</h4>
        <p>{tracker.resetBy.name}</p>
      </div>
      <div className="flex flex-col items-center gap-1 rounded-sm bg-primary-24 p-1">
        <h4 className="text-xs uppercase">Record</h4>
        <p>{record ? formatRecord(record) : "None yet"}</p>
      </div>
    </div>
  );
};
