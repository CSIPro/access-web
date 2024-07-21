import { LoadingSpinner } from "@/components/ui/spinner";
import { useUserSuccessfulLogs } from "@/hooks/use-logs";

import {
  DashboardItem,
  DashboardItemData,
  DashboardItemTitle,
} from "./dashboard-item";

export const UserSuccessfulAttempts = () => {
  return (
    <DashboardItem color="primary">
      <DashboardItemData size="large">
        {logs?.length.toString().padStart(2, "0") || "00"}
      </DashboardItemData>
      <DashboardItemTitle>Entries</DashboardItemTitle>
    </DashboardItem>
  );
};
