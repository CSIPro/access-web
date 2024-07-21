import { collection } from "firebase/firestore";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useFirestore, useFirestoreCollectionData, useUser } from "reactfire";
import * as z from "zod";

import { firebaseAuth } from "@/firebase";
import { BASE_API_URL, NestError } from "@/lib/utils";

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

export const NestRoom = z.object({
  id: z.string(),
  roomNumber: z.string().optional().nullable(),
  name: z.string(),
  building: z.string(),
  ownerId: z.string(),
  macAddress: z.string().nullable(),
  active: z.boolean(),
  oldId: z.string().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type NestRoom = z.infer<typeof NestRoom>;

export const useNestRooms = () => {
  const authUser = firebaseAuth.currentUser;

  const roomsQuery = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await fetch(`${BASE_API_URL}/rooms`, {
        headers: {
          Authorization: `Bearer ${await authUser?.getIdToken()}`,
        },
      });

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("An error occurred while fetching rooms");
      }

      const roomsParse = NestRoom.array().safeParse(await res.json());

      if (!roomsParse.success) {
        throw new Error("An error occurred while parsing rooms");
      }

      return roomsParse.data;
    },
  });

  return roomsQuery;
};

export const useNestRoom = (roomId: string) => {
  const roomQuery = useQuery({
    queryKey: ["room", roomId],
    queryFn: async () => {
      const res = await fetch(`${BASE_API_URL}/rooms/${roomId}`);

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("An error occurred while fetching room data");
      }

      const roomParse = NestRoom.safeParse(await res.json());

      if (!roomParse.success) {
        throw new Error("An error occurred while parsing room data");
      }

      return roomParse.data;
    },
    refetchInterval: 120000,
  });

  return roomQuery;
};

export const RoomForm = z.object({
  building: z.string({
    required_error: "El edificio es obligatorio",
  }),
  roomNumber: z.string().optional(),
  name: z.string({ required_error: "El nombre es obligatorio" }),
});

export type RoomForm = z.infer<typeof RoomForm>;

export const useSubmitRoom = () => {
  const queryClient = useQueryClient();
  const authUser = firebaseAuth.currentUser;

  const mutation = useMutation(async (data: RoomForm) => {
    const authToken = await authUser?.getIdToken();

    const res = await fetch(`${BASE_API_URL}/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorParse = NestError.safeParse(await res.json());

      if (errorParse.success) {
        throw new Error(errorParse.data.message);
      }

      throw new Error("An error occurred while creating the room");
    }

    queryClient.invalidateQueries(["rooms"]);
    queryClient.invalidateQueries(["memberships"]);
  });

  return mutation;
};
