import { type ClassValue, clsx } from "clsx";
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
