import { LoadingSpinner } from "@/components/ui/spinner";
import { useSuccessfulLogs } from "@/hooks/use-logs";

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
    <div className="col-span-full flex w-full flex-col items-start gap-4 rounded-lg bg-primary p-4 text-white sm:col-span-1 md:col-span-3">
      <span className="text-7xl">{logs?.length || 0}</span>
      <span className="text-lg">successful attempts</span>
    </div>
  );
};
