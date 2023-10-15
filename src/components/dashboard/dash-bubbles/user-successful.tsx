import { LoadingSpinner } from "@/components/ui/spinner";
import { useUserSuccessfulLogs } from "@/hooks/use-logs";

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
    <div className="flex w-full flex-col items-start gap-4 rounded-lg bg-primary p-4 text-white md:col-span-2">
      <span className="text-7xl">{logs?.length || 0}</span>
      <span className="text-lg">your successful attempts</span>
    </div>
  );
};
