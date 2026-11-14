import { queryOptions, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { User } from "firebase/auth";

export const qrTokenQueryOptions = (user: Pick<User, "getIdToken">) =>
  queryOptions({
    queryKey: ["qr-token"],
    queryFn: async () => {
      return axios.get(
        `${import.meta.env.VITE_ACCESS_API_URL}/api/users/generate-token`,
        {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        },
      );
    },
    refetchInterval: 20000,
    // The token expires after 25s, so a restored one is always invalid.
    meta: { persist: false },
  });

export const useQrToken = (user: User) => useQuery(qrTokenQueryOptions(user));
