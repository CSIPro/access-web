import { useQuery } from "react-query";
import { z } from "zod";

import { useUserContext } from "@/context/user-context";
import { firebaseAuth } from "@/firebase";
import { BASE_API_URL, NestError } from "@/lib/utils";

export const UserStats = z.object({
  successful: z.number(),
  failed: z.number(),
  wireless: z.number(),
  total: z.number(),
});

export type UserStats = z.infer<typeof UserStats>;

export const useUserStats = () => {
  const authUser = firebaseAuth.currentUser;
  const { user } = useUserContext();

  const statsQuery = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: async () => {
      if (!authUser || !user) {
        throw new Error("No user found");
      }

      const fromDate = new Date(new Date().setHours(0, 0, 0, 0));

      const res = await fetch(
        `${BASE_API_URL}/users/${user?.id}/stats?from=${fromDate}`,
        {
          headers: {
            Authorization: `Bearer ${await authUser?.getIdToken()}`,
          },
        },
      );

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("An error occurred while fetching room stats");
      }

      const statsParse = UserStats.safeParse(await res.json());

      if (!statsParse.success) {
        throw new Error("An error occurred while parsing room stats");
      }

      return statsParse.data;
    },
    refetchInterval: 10000,
  });

  return statsQuery;
};
