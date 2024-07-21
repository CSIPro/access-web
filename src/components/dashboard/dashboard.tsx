import { useRoomStats } from "@/hooks/use-room-stats";
import { useUserStats } from "@/hooks/use-user-stats";

import {
  BluetoothAttempts,
  FailedAttempts,
  SuccessfulAttempts,
} from "./dash-bubbles/stats-item";
import { AccessLogs } from "../access-logs/access-logs";
import { BrandingHeader } from "../ui/branding-header";

export const Dashboard = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-6">
      <BrandingHeader
        highlight="STATS"
        highlightClassName="bg-primary text-white"
      >
        ROOM
      </BrandingHeader>
      <RoomStats />
      <div className="w-full rounded-md border-2 border-primary p-1">
        <AccessLogs limit={3} />
      </div>
      <BrandingHeader
        highlight="STATS"
        highlightClassName="bg-primary text-white"
      >
        PERSONAL
      </BrandingHeader>
      <PersonalStats />
    </div>
  );
};

const RoomStats = () => {
  const { data: stats } = useRoomStats();

  return (
    <div className="flex w-full gap-2">
      <SuccessfulAttempts value={stats?.successful} />
      <div className="flex flex-col gap-2">
        <BluetoothAttempts value={stats?.wireless} />
        <FailedAttempts value={stats?.failed} />
      </div>
    </div>
  );
};

const PersonalStats = () => {
  const { data: stats } = useUserStats();

  return (
    <div className="flex w-full gap-2">
      <div className="flex flex-col gap-2">
        <BluetoothAttempts value={stats?.wireless} />
        <FailedAttempts value={stats?.failed} />
      </div>
      <SuccessfulAttempts value={stats?.successful} />
    </div>
  );
};
