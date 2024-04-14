import { type ClassValue, clsx } from "clsx";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
} from "date-fns";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

import { roleSchema } from "@/hooks/use-roles";
import { userRoomRoleSchema } from "@/hooks/use-user-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const findRole = (
  userRole: z.infer<typeof userRoomRoleSchema> | undefined,
  roles: z.infer<typeof roleSchema>[] | undefined,
) => {
  if (!userRole || !roles || roles.length === 0) {
    return undefined;
  }

  return roles.find((role) => role.id === userRole.roleId);
};

export const formatTimer = (time: number) => {
  const currentDate = new Date();
  const daysDiff = differenceInDays(currentDate, time);
  const hoursDiff = differenceInHours(
    currentDate,
    time + daysDiff * 24 * 60 * 60 * 1000,
  );
  const minutesDiff = differenceInMinutes(
    currentDate,
    time + daysDiff * 24 * 60 * 60 * 1000 + hoursDiff * 60 * 60 * 1000,
  );
  const secondsDiff = differenceInSeconds(
    currentDate,
    time +
      daysDiff * 24 * 60 * 60 * 1000 +
      hoursDiff * 60 * 60 * 1000 +
      minutesDiff * 60 * 1000,
  );

  if (daysDiff <= 0) {
    return `${hoursDiff.toString().padStart(2, "0")}h ${minutesDiff
      .toString()
      .padStart(2, "0")}m ${secondsDiff.toString().padStart(2, "0")}s` as const;
  }

  return `${daysDiff.toString().padStart(2, "0")}d ${hoursDiff
    .toString()
    .padStart(2, "0")}h ${minutesDiff
    .toString()
    .padStart(2, "0")}m ${secondsDiff.toString().padStart(2, "0")}s` as const;
};

export const formatRecord = (record: number) => {
  const days = Math.floor(record / (24 * 60 * 60 * 1000));
  const hours = Math.floor((record % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((record % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((record % (60 * 1000)) / 1000);

  if (days <= 0) {
    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  }

  return `${days.toString().padStart(2, "0")}d ${hours
    .toString()
    .padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m ${seconds
    .toString()
    .padStart(2, "0")}s`;
};
