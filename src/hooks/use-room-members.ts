import { collectionGroup, query, where } from "firebase/firestore";
import { useContext } from "react";
import { useFirestore, useFirestoreCollection } from "reactfire";
import { z } from "zod";

import { SerializedTimestamp } from "@/components/trackers/tracker-item";
import { RoomContext } from "@/context/room-context";

export const APIRole = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
});
export type APIRole = z.infer<typeof APIRole>;

export const APIMember = z.object({
  id: z.string(),
  name: z.string(),
  csiId: z.number(),
  unisonId: z.string(),
  dateOfBirth: SerializedTimestamp,
  createdAt: SerializedTimestamp,
  isRoot: z.boolean().optional().default(false),
  role: APIRole,
});
export type APIMember = z.infer<typeof APIMember>;

export const APIMembersResponse = z.object({
  members: z.array(APIMember),
});
export type APIMembersResponse = z.infer<typeof APIMembersResponse>;

export const useRoomMembers = () => {
  const { selectedRoom } = useContext(RoomContext);

  const firestore = useFirestore();
  const roomRoles = collectionGroup(firestore, "room_roles");
  const roomRolesQuery = query(roomRoles, where("key", "==", selectedRoom));
  const { status, data } = useFirestoreCollection(roomRolesQuery, {
    idField: "id",
  });

  if (status === "loading") {
    return { status: "loading", data: null };
  }

  if (status === "error") {
    return { status: "error", data: null };
  }

  return {
    status,
    data,
  };
};

export const useRoomMembersByRole = (roleId: string) => {
  const { selectedRoom } = useContext(RoomContext);

  const firestore = useFirestore();
  const roomRoles = collectionGroup(firestore, "room_roles");
  const roomRolesQuery = query(
    roomRoles,
    where("key", "==", selectedRoom),
    where("roleId", "==", roleId),
  );
  const { status, data } = useFirestoreCollection(roomRolesQuery, {
    idField: "id",
  });

  if (status === "loading") {
    return { status: "loading", data: null };
  }

  if (status === "error") {
    return { status: "error", data: null };
  }

  return {
    status,
    data,
  };
};
