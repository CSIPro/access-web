import { collection, orderBy, query } from "firebase/firestore";
import { useQuery } from "react-query";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import * as z from "zod";

import { BASE_API_URL, NestError } from "@/lib/utils";

export const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
  canSetRoles: z.boolean().default(false),
  canReadLogs: z.boolean().default(false),
  canHandleRequests: z.boolean().default(false),
  canGrantOrRevokeAccess: z.boolean().default(false),
  canCreateUsers: z.boolean().default(false),
});

export const useRoles = () => {
  const firestore = useFirestore();

  const rolesCol = collection(firestore, "roles");
  const rolesQuery = query(rolesCol, orderBy("level", "asc"));
  const { status, data } = useFirestoreCollectionData(rolesQuery, {
    idField: "id",
  });

  return {
    status,
    data: data as z.infer<typeof roleSchema>[],
  };
};

export const NestRole = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
  canReadLogs: z.boolean(),
  canManageAccess: z.boolean(),
  canManageRoles: z.boolean(),
  canHandleRequests: z.boolean(),
  canManageRoom: z.boolean(),
  oldId: z.string().optional().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type NestRole = z.infer<typeof NestRole>;

export const useNestRoles = () => {
  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await fetch(`${BASE_API_URL}/roles`);

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("An error occurred while fetching roles");
      }

      const rolesParse = NestRole.array().safeParse(await res.json());

      if (!rolesParse.success) {
        throw new Error("An error occurred while parsing roles");
      }

      return rolesParse.data;
    },
  });

  return rolesQuery;
};
