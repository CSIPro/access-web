import { useLogs } from "@/hooks/use-logs";

import { LogItem } from "./log-item";
import { LoadingSpinner } from "../ui/spinner";

export const AccessLogs = () => {
  const { status: logsStatus, data: logs } = useLogs({ today: false });

  if (logsStatus === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center gap-2">
        <LoadingSpinner />
        <p>Loading logs...</p>
      </div>
    );
  }

  if (logsStatus === "error") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p>Something went wrong while retrieving logs</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {logs?.map((log) => (
        <LogItem
          key={log.timestamp.toMillis()}
          user={log.user}
          accessed={log.accessed}
          bluetooth={log.bluetooth}
          timestamp={log.timestamp}
        />
      ))}
    </ul>
  );
};
