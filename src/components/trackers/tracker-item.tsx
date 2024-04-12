import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from "date-fns";
import { Timestamp } from "firebase/firestore";
import { FC } from "react";
import { IconContext } from "react-icons";
import { BiReset } from "react-icons/bi";
import { FiEdit2 } from "react-icons/fi";
import { useQuery } from "react-query";
import { z } from "zod";

import { Button } from "../ui/button";

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
  color: z.string().optional(),
});
export type Tracker = z.infer<typeof Tracker>;

interface Props {
  tracker: Tracker;
}

export const TrackerItem: FC<Props> = ({ tracker }) => {
  const { data } = useQuery({
    queryKey: ["tracker", tracker.id],
    queryFn: () => {
      const trackerDateReference = new Timestamp(
        tracker.timeReference._seconds,
        tracker.timeReference._nanoseconds,
      )
        .toDate()
        .getTime();

      const daysDiff = differenceInDays(new Date(), trackerDateReference);
      const hoursDiff = differenceInHours(
        new Date(),
        trackerDateReference + daysDiff * 24 * 60 * 60 * 1000,
      );
      const minutesDiff = differenceInMinutes(
        new Date(),
        trackerDateReference +
          daysDiff * 24 * 60 * 60 * 1000 +
          hoursDiff * 60 * 60 * 1000,
      );
      const secondsDiff = differenceInSeconds(
        new Date(),
        trackerDateReference +
          daysDiff * 24 * 60 * 60 * 1000 +
          hoursDiff * 60 * 60 * 1000 +
          minutesDiff * 60 * 1000,
      );

      return `${daysDiff.toString().padStart(2, "0")}d ${hoursDiff
        .toString()
        .padStart(2, "0")}h ${minutesDiff
        .toString()
        .padStart(2, "0")}m ${secondsDiff.toString().padStart(2, "0")}s`;
    },
    refetchInterval: 1000,
  });

  return (
    <div className="flex w-full gap-2 rounded-sm border-2 border-primary bg-primary-32 p-2 text-white">
      <div className="flex w-full flex-col gap-1">
        <div>{tracker.name}</div>
        <span className="h-1 w-1/3 rounded-full bg-primary"></span>
        <div className="">{data && data}</div>
      </div>
      <IconContext.Provider value={{ className: "text-2xl" }}>
        <div className="flex flex-col gap-1">
          <Button
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
          <div className="flex-grow rounded-sm bg-primary-32 transition-all hover:bg-primary-64 focus:bg-primary-64"></div>
        </div>
      </IconContext.Provider>
    </div>
  );
};
