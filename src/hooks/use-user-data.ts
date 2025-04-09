import { Timestamp, doc } from "firebase/firestore";
import { useContext } from "react";
import { useMutation, useQuery } from "react-query";
import { useFirestore, useFirestoreDocData, useUser } from "reactfire";
import * as z from "zod";

import { RoomContext } from "@/context/room-context";
import { firebaseAuth } from "@/firebase";
import { BASE_API_URL, NestError, PASSCODE_REGEX } from "@/lib/utils";

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

export const NestUser = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  passcode: z.string().optional().nullable(),
  csiId: z.number(),
  unisonId: z.string(),
  authId: z.string(),
  dateOfBirth: z.string(),
  isRoot: z.boolean(),
  isEventOrganizer: z.boolean(),
  notificationToken: z.string().optional().nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type NestUser = z.infer<typeof NestUser>;

export const useNestUser = (userId?: string) => {
  const authUser = firebaseAuth.currentUser;

  const userQuery = useQuery({
    queryKey: ["user", userId ?? authUser?.uid],
    queryFn: async () => {
      const fullApiUrl = `${BASE_API_URL}/users/find-one/?${
        userId ? `id=${userId}` : `authId=${authUser?.uid}`
      }`;

      const res = await fetch(fullApiUrl, {
        headers: { Authorization: `Bearer ${await authUser?.getIdToken()}` },
      });

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        } else {
          throw new Error("Failed to fetch user data");
        }
      }

      const userParse = NestUser.safeParse(await res.json());

      if (!userParse.success) {
        console.error(userParse);

        throw new Error("Failed to parse user data");
      }

      return userParse.data;
    },
    refetchInterval: 20000,
    retryDelay: 5000,
  });

  return userQuery;
};


export const SignUpForm = z.object({
  firstName: z
    .string({
      required_error: "El nombre es obligatorio",
    })
    .min(3, {
      message: "Tu nombre debe tener al menos 3 caracteres",
    })
    .max(50, {
      message: "Tu nombre no puede exceder los 50 caracteres",
    }),
  lastName: z
    .string({
      required_error: "Los apellidos son obligatorios",
    })
    .min(3, {
      message: "Tus apellidos deben tener al menos 3 caracteres",
    })
    .max(50, {
      message: "Tus apellidos no pueden exceder los 50 caracteres",
    }),
  unisonId: z
    .string({
      required_error: "Tu expediente es obligatorio",
    })
    .min(4, {
      message: "El expediente debe tener al menos 4 dígitos",
    })
    .max(9, {
      message: "El expediente no puede exceder los 9 dígitos",
    })
    .regex(/^[0-9]{4,9}$/, {
      message: "El expediente debe contener solo dígitos",
    }),
  passcode: z
    .string({
      required_error: "Tu contraseña es obligatoria",
    })
    .min(4, {
      message: "Tu contraseña debe tener al menos 4 caracteres",
    })
    .max(10, {
      message: "Tu contraseña no puede exceder los 10 caracteres",
    })
    .regex(PASSCODE_REGEX, {
      message:
        "Tu contraseña debe contener al menos un número y una letra de la A a la D",
    }),
  dateOfBirth: z
    .date({
      required_error: "Tu fecha de nacimiento es obligatoria",
    })
    .min(new Date(1900, 0, 1), {
      message: "I don't think you're that old",
    })
    .max(new Date(), {
      message: "Time traveler alert!",
    }),
  room: z.string({
    required_error: "Debes seleccionar un salón",
  }),
});

export type SignUpForm = z.infer<typeof SignUpForm>;

const UserResponse = z.object({
  user: NestUser.partial(),
  message: z.string(),
});

type UserResponse = z.infer<typeof UserResponse>;

export const useCreateUser = () => {
  const authUser = firebaseAuth.currentUser;

  const createUser = useMutation<UserResponse, Error, SignUpForm>(
    async (formData: SignUpForm) => {
      if (!authUser) {
        throw new Error("You don't seem to be logged in...");
      }

      const token = await authUser.getIdToken();

      const res = await fetch(`${BASE_API_URL}/users`, {
        method: "POST",
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          unisonId: formData.unisonId,
          passcode: formData.passcode,
          dateOfBirth: formData.dateOfBirth.toISOString(),
          roomId: formData.room,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        const errorParse = NestError.safeParse(data);

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("Something went wrong while creating the user");
      }

      const userResParse = UserResponse.safeParse(data);

      if (!userResParse.success) {
        console.error(userResParse);

        throw new Error("Failed to parse response data");
      }

      return userResParse.data;
    },
  );

  return createUser;
};
