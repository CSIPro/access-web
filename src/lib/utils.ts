import { type ClassValue, clsx } from "clsx";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from "date-fns";
import { es } from "date-fns/locale";
import { twMerge } from "tailwind-merge";
import { z } from "zod";

import { roleSchema } from "@/hooks/use-roles";
import { NestRoom } from "@/hooks/use-rooms";
import { NestUser, userRoomRoleSchema } from "@/hooks/use-user-data";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BASE_API_URL = import.meta.env.VITE_ACCESS_API_URL;

export const NestError = z.object({
  statusCode: z.number(),
  message: z.string(),
});

export type NestError = z.infer<typeof NestError>;

export const formatRoomName = (room: NestRoom) => {
  return `${room.name} (${room.building}${
    room.roomNumber ? `-${room.roomNumber}` : ""
  })`;
};

export const formatUserName = (user: Partial<NestUser>) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }

  return "Desconocido";
};

export const formatBirthday = (date: string) => {
  const birthday = new Date(date);
  const offset = birthday.getTimezoneOffset() * 60000;

  const localDate = new Date(birthday.getTime() + offset);

  return format(localDate, "MMMM dd", { locale: es });
};

export const PASSCODE_REGEX = /^(?=.*[\d])(?=.*[A-D])[\dA-D]{4,10}$/;

export const generatePasscode = (): string => {
  const totalLength = Math.floor(Math.random() * 4 + 4);
  const possible = "0123456789ABCD";

  let text = "";

  for (let i = 0; i < totalLength; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }

  if (!PASSCODE_REGEX.test(text)) {
    return generatePasscode();
  }

  return text;
};

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

  return {
    seconds: secondsDiff.toString().padStart(2, "0"),
    minutes: minutesDiff.toString().padStart(2, "0"),
    hours: hoursDiff.toString().padStart(2, "0"),
    days: daysDiff.toString().padStart(2, "0"),
  };
};

export const formatRecord = (record: number) => {
  const days = Math.floor(record / (24 * 60 * 60 * 1000));
  const hours = Math.floor((record % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  const minutes = Math.floor((record % (60 * 60 * 1000)) / (60 * 1000));
  const seconds = Math.floor((record % (60 * 1000)) / 1000);

  if (days <= 0) {
    if (hours <= 0) {
      if (minutes <= 0) {
        return `${seconds.toString().padStart(2, "0")}s` as const;
      }

      return `${minutes.toString().padStart(2, "0")}m ${seconds
        .toString()
        .padStart(2, "0")}s` as const;
    }

    return `${hours.toString().padStart(2, "0")}h ${minutes
      .toString()
      .padStart(2, "0")}m` as const;
  }

  return `${days.toString().padStart(2, "0")}d ${hours
    .toString()
    .padStart(2, "0")}h ${minutes.toString().padStart(2, "0")}m` as const;
};
