import { Timestamp, doc } from "firebase/firestore";
import { useContext } from "react";
import { useFirestore, useFirestoreDocData, useUser } from "reactfire";
import * as z from "zod";

import { RoomContext } from "@/context/room-context";

export const userRoomRoleSchema = z.object({
  id: z.string(),
  key: z.string(),
  accessGranted: z.boolean().default(false),
  roleId: z.string(),
});

export const userSchema = z.object({
  csiId: z.number(),
  name: z.string(),
  passcode: z.string(),
  unisonId: z.string(),
  createdAt: z.custom<Timestamp>(),
  dateOfBirth: z.custom<Timestamp>(),
  isRoot: z.boolean().optional().default(false),
  role: userRoomRoleSchema,
});

export const useUserData = () => {
  const user = useUser();
  const firestore = useFirestore();
  const userQuery = doc(firestore, "users", user.data?.uid || "invalid");
  const userRoleQuery = doc(
    firestore,
    "user_roles",
    user.data?.uid || "invalid",
  );

  const { status: userRoomRoleStatus, data: userRoomRoleData } = useUserRole();
  const { status: userStatus, data: userData } = useFirestoreDocData(
    userQuery,
    {
      idField: "id",
    },
  );

  const { status: userRoleStatus, data: userRoleData } = useFirestoreDocData(
    userRoleQuery,
    {
      idField: "id",
    },
  );

  if (
    userStatus === "loading" ||
    userRoleStatus === "loading" ||
    userRoomRoleStatus === "loading"
  ) {
    return { status: "loading", data: null };
  }

  if (
    userStatus === "error" ||
    userRoleStatus === "error" ||
    userRoomRoleStatus === "error"
  ) {
    return { status: "error", data: null };
  }

  const mergedData = {
    ...userData,
    isRoot: userRoleData?.isRoot || false,
    role: userRoomRoleData,
  } as z.infer<typeof userSchema>;

  return {
    status: userStatus,
    data: mergedData,
  };
};

export const useUserDataWithId = (uid: string) => {
  const firestore = useFirestore();
  const userQuery = doc(firestore, "users", uid);
  const userRoleQuery = doc(firestore, "user_roles", uid);

  const { status: userRoomRoleStatus, data: userRoomRoleData } = useUserRole();
  const { status: userStatus, data: userData } = useFirestoreDocData(
    userQuery,
    {
      idField: "id",
    },
  );

  const { status: userRoleStatus, data: userRoleData } = useFirestoreDocData(
    userRoleQuery,
    {
      idField: "id",
    },
  );

  if (
    userStatus === "loading" ||
    userRoleStatus === "loading" ||
    userRoomRoleStatus === "loading"
  ) {
    return { status: "loading", data: null };
  }

  if (
    userStatus === "error" ||
    userRoleStatus === "error" ||
    userRoomRoleStatus === "error"
  ) {
    return { status: "error", data: null };
  }

  const mergedData = {
    ...userData,
    isRoot: userRoleData?.isRoot || false,
    role: userRoomRoleData,
  } as z.infer<typeof userSchema>;

  return {
    status: userStatus,
    data: mergedData,
  };
};

export const useUserRole = () => {
  const { selectedRoom } = useContext(RoomContext);
  const user = useUser();
  const firestore = useFirestore();
  const userRoleQuery = doc(
    firestore,
    "user_roles",
    user.data?.uid || "invalid",
    "room_roles",
    selectedRoom || "invalid",
  );

  const { status: userRoleStatus, data: userRoleData } = useFirestoreDocData(
    userRoleQuery,
    {
      idField: "id",
    },
  );

  if (userRoleStatus === "loading") {
    return { status: "loading", data: null };
  }

  if (userRoleStatus === "error") {
    return { status: "error", data: null };
  }

  return {
    status: userRoleStatus,
    data: userRoleData as z.infer<typeof userRoomRoleSchema>,
  };
};

export const useUserRoleWithId = (uid: string) => {
  const { selectedRoom } = useContext(RoomContext);
  const firestore = useFirestore();
  const userRoleDoc = doc(
    firestore,
    "user_roles",
    uid,
    "room_roles",
    selectedRoom || "invalid",
  );

  const { status: userRoleStatus, data: userRoleData } = useFirestoreDocData(
    userRoleDoc,
    {
      idField: "id",
    },
  );

  if (userRoleStatus === "loading") {
    return { status: "loading", data: null };
  }

  if (userRoleStatus === "error") {
    return { status: "error", data: null };
  }

  return {
    status: userRoleStatus,
    doc: userRoleDoc,
    data: userRoleData as z.infer<typeof userRoomRoleSchema>,
  };
};
