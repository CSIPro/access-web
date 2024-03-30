import { LoadingSpinner } from "@/components/ui/spinner";
import { useUserFailedLogs } from "@/hooks/use-logs";

import {
  DashboardItem,
  DashboardItemData,
  DashboardItemTitle,
} from "./dashboard-item";

export const UserFailedAttempts = () => {
  const { status, logs } = useUserFailedLogs();

  if (status === "loading") {
    return (
      <div className="flex h-24 w-full flex-col items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-24 w-full flex-col items-center justify-center text-white">
        Something went wrong
      </div>
    );
  }

  return (
    <DashboardItem color="secondary">
      <DashboardItemData size="large">
        {logs?.length.toString().padStart(2, "0") || "00"}
      </DashboardItemData>
      <DashboardItemTitle>Failed</DashboardItemTitle>
    </DashboardItem>
  );
};
