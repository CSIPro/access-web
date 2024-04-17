import { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useTrackerItemContext } from "./tracker-context";

interface Props {
  children: ReactNode;
}

export const TimerSegment: FC<Props> = ({ children }) => {
  const trackerCtx = useTrackerItemContext();

  return (
    <span
      className={cn(
        "color-white rounded-sm border-2 border-primary bg-primary-08 p-1 font-mono",
        trackerCtx.beatsRecord && "animate-glow-bg",
      )}
    >
      {children}
    </span>
  );
};
