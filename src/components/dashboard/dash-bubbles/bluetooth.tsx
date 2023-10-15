import { LoadingSpinner } from "@/components/ui/spinner";
import { useBluetoothLogs } from "@/hooks/use-logs";

export const BluetoothAttempts = () => {
  const { status, logs } = useBluetoothLogs();

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
    <div className="bg-tertiary col-span-full flex w-full flex-col items-start justify-between gap-4 rounded-lg p-4 text-white sm:col-span-1 md:col-span-3">
      <span className="text-7xl">{logs?.length || 0}</span>
      <span className="text-lg">bluetooth attempts</span>
    </div>
  );
};
