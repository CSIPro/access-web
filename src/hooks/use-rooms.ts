import { collection } from "firebase/firestore";
import { useFirestore, useFirestoreCollectionData, useUser } from "reactfire";
import * as z from "zod";

export const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  room: z.string(),
  building: z.string(),
});

export const useRooms = () => {
  const firestore = useFirestore();
  const roomsQuery = collection(firestore, "rooms");
  const { status: roomsStatus, data: roomsData } = useFirestoreCollectionData(
    roomsQuery,
    {
      idField: "id",
    },
  );

  if (roomsStatus === "error") {
    return { status: "error", data: [] };
  }

  return {
    status: roomsStatus,
    data: roomsData as z.infer<typeof roomSchema>[],
  };
};

export const userRoomSchema = z.object({
  id: z.string(),
  accessGranted: z.boolean(),
  key: z.string(),
  roleId: z.string(),
});

export const useUserRooms = () => {
  const user = useUser();
  const firestore = useFirestore();
  const userRoomsCol = collection(
    firestore,
    "user_roles",
    user.data?.uid || "invalid",
    "room_roles",
  );
  const { status: userRoomsStatus, data: userRoomsData } =
    useFirestoreCollectionData(userRoomsCol, {
      idField: "id",
    });

  if (userRoomsStatus === "error") {
    return { status: "error", data: [] };
  }

  return {
    status: userRoomsStatus,
    data: userRoomsData as z.infer<typeof userRoomSchema>[],
  };
};
