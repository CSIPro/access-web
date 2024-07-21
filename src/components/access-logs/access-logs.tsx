import { FC } from "react";

import { useNestLogs } from "@/hooks/use-logs";
import { formatUserName } from "@/lib/utils";

import { LogItem, LogTimestamp, LogTitle } from "./log-item";
import { LoadingSpinner } from "../ui/spinner";

interface Props {
  limit?: number;
}

export const AccessLogs: FC<Props> = ({ limit }) => {
  const { status: logsStatus, data: logs } = useNestLogs({ limitTo: limit });

  if (logsStatus === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center gap-2">
        <LoadingSpinner />
        <p>Obteniendo registros...</p>
      </div>
    );
  }

  if (logsStatus === "error") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p>No fue posible conectar con el servidor</p>
      </div>
    );
  }

  return (
    <ul className="flex w-full flex-col gap-1">
      {logs?.map((log) => (
        <LogItem
          key={log.id}
          known={!!log.user}
          accessed={log.accessed}
          wireless={log.wireless}
          birthday={log.user?.dateOfBirth}
        >
          <LogTitle>
            {log.user ? formatUserName(log.user) : "Desconocido"}
          </LogTitle>
          <LogTimestamp timestamp={log.createdAt} />
        </LogItem>
      ))}
    </ul>
  );
};
