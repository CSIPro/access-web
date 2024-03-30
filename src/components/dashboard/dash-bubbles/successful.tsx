import { LoadingSpinner } from "@/components/ui/spinner";
import { useSuccessfulLogs } from "@/hooks/use-logs";

import {
  DashboardItem,
  DashboardItemData,
  DashboardItemTitle,
} from "./dashboard-item";

export const SuccessfulAttempts = () => {
  const { status, logs } = useSuccessfulLogs();

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

  // return (
  //   <div className="bg-primary-56 flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-primary p-4 text-white sm:col-span-1 md:col-span-3">
  //     <span className="text-4xl">
  //       {logs?.length.toString().padStart(2, "0") || "00"}
  //     </span>
  //     <span>Entries</span>
  //   </div>
  // );
};
