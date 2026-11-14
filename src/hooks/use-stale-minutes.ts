import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

/** How long a refetch may run before the screen is called out of date. */
const SLOW_REFETCH_MS = 2000;

const CHECK_INTERVAL_MS = 1000;

const appStartedAt = Date.now();

/**
 * Minutes since the oldest data on screen was last refreshed, or null when
 * everything on screen is fresh. Data is out of date when it comes from a
 * previous session and its refetch has run longer than SLOW_REFETCH_MS (a
 * refetch that is waiting for a connection counts as running), or when its
 * latest refetch failed.
 */
export const useStaleMinutes = () => {
  const queryClient = useQueryClient();
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    const queryCache = queryClient.getQueryCache();
    let refetchStartedAt = new Map<string, number>();

    const check = () => {
      const now = Date.now();
      const nextStartedAt = new Map<string, number>();
      let oldestUpdate: number | null = null;

      for (const query of queryCache.findAll({ type: "active" })) {
        const { data, dataUpdatedAt, status, fetchStatus } = query.state;

        if (data === undefined) continue;

        const isRefetching = fetchStatus !== "idle";
        const startedAt = refetchStartedAt.get(query.queryHash) ?? now;

        if (isRefetching) {
          nextStartedAt.set(query.queryHash, startedAt);
        }

        const failed = status === "error";
        const slow =
          isRefetching &&
          dataUpdatedAt < appStartedAt &&
          now - startedAt >= SLOW_REFETCH_MS;

        if (failed || slow) {
          oldestUpdate = Math.min(oldestUpdate ?? dataUpdatedAt, dataUpdatedAt);
        }
      }

      refetchStartedAt = nextStartedAt;
      setMinutes(
        oldestUpdate === null
          ? null
          : Math.max(1, Math.floor((now - oldestUpdate) / 60000)),
      );
    };

    check();
    const unsubscribe = queryCache.subscribe(check);
    const interval = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [queryClient]);

  return minutes;
};
