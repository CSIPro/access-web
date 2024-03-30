import { LoadingSpinner } from "@/components/ui/spinner";
import { useUserSuccessfulLogs } from "@/hooks/use-logs";

import {
  DashboardItem,
  DashboardItemData,
  DashboardItemTitle,
} from "./dashboard-item";

export const UserSuccessfulAttempts = () => {
  const { status, logs } = useUserSuccessfulLogs();

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
    <DashboardItem color="primary">
      <DashboardItemData size="large">
        {logs?.length.toString().padStart(2, "0") || "00"}
      </DashboardItemData>
      <DashboardItemTitle>Entries</DashboardItemTitle>
    </DashboardItem>
  );
};
