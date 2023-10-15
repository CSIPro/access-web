import { LoadingSpinner } from "@/components/ui/spinner";
import { useUnknownLogs } from "@/hooks/use-logs";

export const UnknownAttempts = () => {
  const { status, logs } = useUnknownLogs();

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
    <div className="flex w-full flex-col items-start justify-between gap-4 rounded-lg bg-accent p-4 text-white md:col-span-3">
      <span className="text-7xl">{logs?.length || 0}</span>
      <span className="text-lg">unknown attempts</span>
    </div>
  );
};
