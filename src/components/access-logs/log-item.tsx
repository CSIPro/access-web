import { format } from "date-fns";
import { Timestamp, doc } from "firebase/firestore";
import { FC, ReactNode } from "react";
import { useFirestore, useFirestoreDocData } from "reactfire";
import * as z from "zod";

import { cn } from "@/lib/utils";

interface Props {
  user?: string;
  accessed?: boolean;
  bluetooth?: boolean;
  timestamp: Timestamp;
}

const baseStyle =
  "flex w-full items-center justify-between rounded-lg gap-4 p-2 bg-muted";

const userSchema = z.object({
  csiId: z.number(),
  name: z.string(),
  passcode: z.string(),
  unisonId: z.string(),
  createdAt: z.custom<Timestamp>(),
  dateOfBirth: z.custom<Timestamp>(),
});

export const LogItem: FC<Props> = ({
  user,
  accessed = false,
  bluetooth = false,
  timestamp,
}) => {
  if (user) {
    return (
      <KnownLog
        accessed={accessed}
        bluetooth={bluetooth}
        user={user}
        timestamp={timestamp}
      />
    );
  }

  return <UnknownLog timestamp={timestamp} />;
};

interface KnownLogProps {
  accessed: boolean;
  bluetooth: boolean;
  user: string;
  timestamp: Timestamp;
}

const KnownLog: FC<KnownLogProps> = ({
  accessed,
  bluetooth,
  user,
  timestamp,
}) => {
  const firestore = useFirestore();
  const userDoc = doc(firestore, "users", user);
  const { status, data } = useFirestoreDocData(userDoc, {
    idField: "id",
  });

  if (status === "loading") {
    return (
      <li className={cn(baseStyle)}>
        <span>Loading...</span>
        <LogTimestamp timestamp={timestamp} />
      </li>
    );
  }

  if (status === "error") {
    return (
      <li className={cn(baseStyle)}>
        <span>Error</span>
        <LogTimestamp timestamp={timestamp} />
      </li>
    );
  }

  const userData = userSchema.parse(data);

  if (accessed && !bluetooth) {
    return <SuccessLog user={userData} timestamp={timestamp} />;
  }

  if (accessed && bluetooth) {
    return <BluetoothLog user={userData} timestamp={timestamp} />;
  }

  return <FailedLog user={userData} timestamp={timestamp} />;
};

interface UnknownLogProps {
  timestamp: Timestamp;
}

const UnknownLog: FC<UnknownLogProps> = ({ timestamp }) => {
  return (
    <li className={cn(baseStyle, "bg-secondary")}>
      <LogTitle failed>Unknown user</LogTitle>
      <LogTimestamp failed timestamp={timestamp} />
    </li>
  );
};

interface KnownProcessedLogProps {
  user: z.infer<typeof userSchema>;
  timestamp: Timestamp;
}

const SuccessLog: FC<KnownProcessedLogProps> = ({ user, timestamp }) => {
  return (
    <li className={cn(baseStyle, "bg-primary")}>
      <LogTitle>{user.name}</LogTitle>
      <LogTimestamp timestamp={timestamp} />
    </li>
  );
};

const FailedLog: FC<KnownProcessedLogProps> = ({ user, timestamp }) => {
  return (
    <li className={cn(baseStyle, "bg-secondary")}>
      <LogTitle failed>{user.name}</LogTitle>
      <LogTimestamp failed timestamp={timestamp} />
    </li>
  );
};

const BluetoothLog: FC<KnownProcessedLogProps> = ({ user, timestamp }) => {
  return (
    <li className={cn(baseStyle, "bg-tertiary")}>
      <LogTitle>{user.name}</LogTitle>
      <LogTimestamp timestamp={timestamp} />
    </li>
  );
};

const LogTitle: FC<{ children: ReactNode; failed?: boolean }> = ({
  children,
  failed = false,
}) => {
  return (
    <span
      className={cn(
        "overflow-hidden overflow-ellipsis whitespace-nowrap text-2xl font-bold md:text-3xl",
        failed && "text-md md:text-md font-normal",
      )}
    >
      {children}
    </span>
  );
};

const LogTimestamp: FC<{ timestamp: Timestamp; failed?: boolean }> = ({
  timestamp,
  failed = false,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-end",
        failed && "flex-row items-center gap-2",
      )}
    >
      <p>{format(timestamp.toDate(), "HH:mm:ss")}</p>
      <p className="whitespace-nowrap">{format(timestamp.toDate(), "PPP")}</p>
    </div>
  );
};
