import { useStaleMinutes } from "@/hooks/use-stale-minutes";

export const StaleLabel = () => {
  const minutes = useStaleMinutes();

  if (minutes === null) {
    return null;
  }

  return (
    <span className="whitespace-nowrap text-xs text-neutral-400">
      actualizado hace {minutes} min
    </span>
  );
};
