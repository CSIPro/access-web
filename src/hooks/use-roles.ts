import { collection, orderBy, query } from "firebase/firestore";
import { useFirestore, useFirestoreCollectionData } from "reactfire";
import * as z from "zod";

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
