import { Timestamp, collection, query, where } from "firebase/firestore";
import { useFirestore, useFirestoreCollectionData, useUser } from "reactfire";
import * as z from "zod";

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

export const useLogs = () => {
  const firestore = useFirestore();
  const logsCol = collection(firestore, "logs");
  const logsQuery = query(
    logsCol,
    where(
      "timestamp",
      ">=",
      Timestamp.fromDate(new Date(new Date(2023, 9, 13).setHours(0, 0, 0, 0))),
    ),
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

  const successfulLogs = logsData.filter((log) => log.accessed);

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

  const failedLogs = logsData.filter((log) => !log.accessed);

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

  const bluetoothLogs = logsData.filter((log) => log.bluetooth);

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

  const unknownLogs = logsData.filter((log) => !log.user);

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

  const userAttempts = logsData.filter((log) => log.user === userData!.uid);

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

  const successfulLogs = logsData.filter((log) => log.accessed);

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

  const successfulLogs = logsData.filter((log) => !log.accessed);

  return { status: logsStatus, logs: successfulLogs };
};
