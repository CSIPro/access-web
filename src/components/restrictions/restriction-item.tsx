import { createContext, FC } from "react";
import { Link } from "react-router-dom";

import { PopulatedRestriction } from "@/hooks/use-restrictions";

const RestrictionContext = createContext<PopulatedRestriction | null>(null);

interface Props {
  restriction: PopulatedRestriction;
}

export const RestrictionItem: FC<Props> = ({ restriction }) => {
  const startTime = restriction.startTime.substring(0, 5);
  const endTime = restriction.endTime.substring(0, 5);

  return (
    <Link
      to={`/app/restrictions/${restriction.id}`}
      data-active={restriction.isActive}
      className="group relative flex w-full flex-col gap-2 overflow-hidden rounded border-2 border-primary bg-primary/20 p-2 transition-colors duration-300 hover:brightness-110 active:brightness-95 data-[active=false]:border-secondary data-[active=false]:bg-secondary/20"
    >
      <h2 className="text-lg font-medium">{restriction.role.name}</h2>
      <span className="absolute right-0 top-0 max-w-[50%] rounded-bl bg-primary px-2 py-0.5 text-center font-bold text-white transition-colors duration-300 group-data-[active=false]:bg-secondary">
        {restriction.room.name}
      </span>
      <div className="flex w-full items-center justify-between gap-2">
        <RestrictionDays
          restrictionId={restriction.id}
          bitmask={restriction.daysBitmask}
        />
        <div className="flex items-center gap-0.5 font-mono font-bold text-white">
          <span className="rounded bg-primary/40 p-1 transition-colors duration-300 group-data-[active=false]:bg-secondary/40">
            {startTime}
          </span>
          <span>-</span>
          <span className="rounded bg-primary/40 p-1 transition-colors duration-300 group-data-[active=false]:bg-secondary/40">
            {endTime}
          </span>
        </div>
      </div>
    </Link>
  );
};

interface RestrictionDaysProps {
  restrictionId: string;
  bitmask: number;
}

export const RestrictionDays: FC<RestrictionDaysProps> = ({
  restrictionId,
  bitmask,
}) => {
  const days = ["D", "L", "M", "X", "J", "V", "S"];

  const selectedDays: Array<string> = [];

  for (let i = 0; i < 7; i++) {
    if (bitmask & (1 << i)) {
      selectedDays.push(days[i]);
    }
  }

  return (
    <div className="flex gap-1">
      {days.map((d) => (
        <span
          key={`${restrictionId}-${d}`}
          data-active-day={selectedDays.includes(d)}
          className="w-6 items-center justify-center rounded bg-primary/40 p-1 text-center font-mono font-bold text-white opacity-100 transition-all duration-300 data-[active-day=false]:opacity-30 group-data-[active=false]:bg-secondary/40"
        >
          {d}
        </span>
      ))}
    </div>
  );
};
