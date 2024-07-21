import {
  Timestamp,
  collection,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useFirestore, useFirestoreCollectionData, useUser } from "reactfire";
import * as z from "zod";

import { RoomContext, useRoomContext } from "@/context/room-context";
import { firebaseAuth } from "@/firebase";
import { BASE_API_URL, NestError } from "@/lib/utils";

const logSchema = z.object({
  accessed: z.boolean(),
  bluetooth: z.boolean(),
  room: z.string(),
  timestamp: z.custom<Timestamp>(),
  user: z.string().optional(),
  attemptData: z
    .object({
      csiId: z.string(),
      passcode: z.string(),
    })
    .optional(),
});

interface UseLogsProps {
  today?: boolean;
  limit?: number;
}

export const useLogs = ({
  today = true,
  limit: limitTo = 40,
}: UseLogsProps = {}) => {
  const roomCtx = useContext(RoomContext);

  const firestore = useFirestore();
  const logsCol = collection(firestore, "logs");
  const logsQuery = today
    ? query(
        logsCol,
        where("room", "==", roomCtx.selectedRoom || ""),
        where(
          "timestamp",
          ">=",
          Timestamp.fromDate(new Date(new Date().setHours(0, 0, 0, 0))),
        ),
        orderBy("timestamp", "desc"),
      )
    : query(
        logsCol,
        where("room", "==", roomCtx.selectedRoom || ""),
        orderBy("timestamp", "desc"),
        limit(limitTo),
      );
  const { status, data } = useFirestoreCollectionData(logsQuery, {
    idField: "id",
  });

  return {
    status,
    data: data as z.infer<typeof logSchema>[],
  };
};

export const useSuccessfulLogs = () => {
  const { status: logsStatus, data: logsData } = useLogs();

  if (logsStatus === "loading") {
    return { status: "loading", logs: [] };
  }

  if (logsStatus === "error") {
    return { status: "error", logs: [] };
  }

  const successfulLogs = logsData?.filter((log) => log.accessed);

  return { status: logsStatus, logs: successfulLogs };
};

export const useFailedLogs = () => {
  const { status: logsStatus, data: logsData } = useLogs();

  if (logsStatus === "loading") {
    return { status: "loading", logs: [] };
  }

  if (logsStatus === "error") {
    return { status: "error", logs: [] };
  }

  const failedLogs = logsData?.filter((log) => !log.accessed);

  return { status: logsStatus, logs: failedLogs };
};

export const useBluetoothLogs = () => {
  const { status: logsStatus, data: logsData } = useLogs();

  if (logsStatus === "loading") {
    return { status: "loading", logs: [] };
  }

  if (logsStatus === "error") {
    return { status: "error", logs: [] };
  }

  const bluetoothLogs = logsData?.filter((log) => log.bluetooth);

  return { status: logsStatus, logs: bluetoothLogs };
};

export const useUnknownLogs = () => {
  const { status: logsStatus, data: logsData } = useLogs();

  if (logsStatus === "loading") {
    return { status: "loading", logs: [] };
  }

  if (logsStatus === "error") {
    return { status: "error", logs: [] };
  }

  const unknownLogs = logsData?.filter((log) => !log.user);

  return { status: logsStatus, logs: unknownLogs };
};

export const useUserLogs = () => {
  const { status: userStatus, data: userData } = useUser();
  const { status: logsStatus, data: logsData } = useLogs();

  if (logsStatus === "loading" || userStatus === "loading") {
    return { status: "loading", logs: [] };
  }

  if (logsStatus === "error" || userStatus === "error") {
    return { status: "error", logs: [] };
  }

  const userAttempts = logsData?.filter((log) => log.user === userData!.uid);

  return {
    status: logsStatus,
    logs: userAttempts as z.infer<typeof logSchema>[],
  };
};

export const useUserSuccessfulLogs = () => {
  const { status: logsStatus, logs: logsData } = useUserLogs();

  if (logsStatus === "loading") {
    return { status: "loading" };
  }

  if (logsStatus === "error") {
    return { status: "error" };
  }

  const successfulLogs = logsData?.filter((log) => log.accessed);

  return { status: logsStatus, logs: successfulLogs };
};

export const useUserBluetoothLogs = () => {
  const { status: logsStatus, logs: logsData } = useUserSuccessfulLogs();

  if (logsStatus === "loading") {
    return { status: "loading" };
  }

  if (logsStatus === "error") {
    return { status: "error" };
  }

  const successfulLogs = logsData?.filter((log) => log.bluetooth) ?? [];

  return { status: logsStatus, logs: successfulLogs };
};

export const useUserFailedLogs = () => {
  const { status: logsStatus, logs: logsData } = useUserLogs();

  if (logsStatus === "loading") {
    return { status: "loading" };
  }

  if (logsStatus === "error") {
    return { status: "error" };
  }

  const successfulLogs = logsData?.filter((log) => !log.accessed);

  return { status: logsStatus, logs: successfulLogs };
};

export const NestAccessType = z.enum(["keypad", "mobile", "webapp"]);

export const NestLog = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  roomId: z.string(),
  accessed: z.boolean(),
  wireless: z.boolean(),
  accessType: NestAccessType,
  attempt: z
    .object({ csiId: z.string(), passcode: z.string() })
    .optional()
    .nullable(),
  createdAt: z.string().datetime(),
  user: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
      dateOfBirth: z.string().date(),
    })
    .optional()
    .nullable(),
});

export type NestLog = z.infer<typeof NestLog>;

export const useNestLogs = ({ limitTo = 40 }: { limitTo?: number } = {}) => {
  const { selectedRoom } = useRoomContext();

  const logsQuery = useQuery({
    queryKey: ["logs", selectedRoom, limitTo],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_API_URL}/access-logs/room/${selectedRoom}/?limit=${limitTo}`,
      );

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("An error occurred while fetching logs");
      }

      const resData = await res.json();
      const logsParse = NestLog.array().safeParse(resData);

      if (!logsParse.success) {
        throw new Error("An error occurred while parsing logs");
      }

      return logsParse.data;
    },
    refetchInterval: 10000,
  });

  return logsQuery;
};

export const useLogActions = (id: string) => {
  const queryClient = useQueryClient();
  const authUser = firebaseAuth.currentUser;

  const deleteLog = useMutation(async () => {
    if (!authUser) {
      throw new Error("You don't seem to be logged in...");
    }

    const token = await authUser.getIdToken();

    const res = await fetch(`${BASE_API_URL}/access-logs/delete-log/${id}`, {
      method: "DELETE",
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

      throw new Error("Something went wrong while deleting the log");
    }

    queryClient.invalidateQueries(["logs"]);
  });

  return { deleteLog };
};
