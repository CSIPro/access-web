import { LoadingSpinner } from "@/components/ui/spinner";
import { useUserLogs } from "@/hooks/use-logs";

export const UserAttempts = () => {
  const { status, logs } = useUserLogs();

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
    <div className="col-span-full flex w-full flex-col items-start justify-between gap-4 rounded-lg bg-primary p-4 text-white md:col-span-2">
      <span className="text-7xl">{logs?.length || 0}</span>
      <span className="text-lg">your attempts</span>
    </div>
  );
};
