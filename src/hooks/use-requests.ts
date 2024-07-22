import { useMutation, useQuery, useQueryClient } from "react-query";
import { z } from "zod";

import { useRoomContext } from "@/context/room-context";
import { firebaseAuth } from "@/firebase";
import { BASE_API_URL, NestError } from "@/lib/utils";

export const NestRequestStatus = z.enum(["pending", "approved", "rejected"]);
export type NestRequestStatus = z.infer<typeof NestRequestStatus>;

export const PlainNestRequest = z.object({
  id: z.string(),
  userId: z.string(),
  roomId: z.string(),
  adminId: z.string().optional().nullable(),
  status: NestRequestStatus,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
});

export type PlainNestRequest = z.infer<typeof PlainNestRequest>;

export const PopulatedNestRequest = z.object({
  id: z.string(),
  status: NestRequestStatus,
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  user: z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
  }),
  admin: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string(),
    })
    .optional()
    .nullable(),
  room: z.object({
    id: z.string(),
    name: z.string(),
    building: z.string(),
    roomNumber: z.string(),
  }),
});

export type PopulatedNestRequest = z.infer<typeof PopulatedNestRequest>;

export const useNestRoomRequests = (roomId?: string) => {
  const authUser = firebaseAuth.currentUser;
  const { selectedRoom } = useRoomContext();

  const requestsQuery = useQuery({
    queryKey: ["requests", roomId ?? selectedRoom],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_API_URL}/rooms/${roomId ?? selectedRoom}/requests`,
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

        throw new Error("An error occurred while fetching requests");
      }

      const requestsParse = PopulatedNestRequest.array().safeParse(
        await res.json(),
      );

      if (!requestsParse.success) {
        throw new Error("An error occurred while parsing requests");
      }

      return requestsParse.data;
    },
  });

  return requestsQuery;
};

export const useNestUserRequests = (userId: string) => {
  const authUser = firebaseAuth.currentUser;

  const requestsQuery = useQuery({
    queryKey: ["requests", userId],
    queryFn: async () => {
      const res = await fetch(`${BASE_API_URL}/users/${userId}/requests`, {
        headers: {
          Authorization: `Bearer ${await authUser?.getIdToken()}`,
        },
      });

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("An error occurred while fetching requests");
      }

      const requestsParse = PopulatedNestRequest.array().safeParse(
        await res.json(),
      );

      if (!requestsParse.success) {
        throw new Error("An error occurred while parsing requests");
      }

      return requestsParse.data;
    },
    refetchInterval: 120000,
  });

  return requestsQuery;
};

export const useNestRequestHelpers = (request?: PopulatedNestRequest) => {
  const authUser = firebaseAuth.currentUser;
  const queryClient = useQueryClient();

  const approval = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${BASE_API_URL}/requests/${request?.id}/approve`,
        {
          method: "POST",
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

        throw new Error("An error occurred while approving request");
      }

      queryClient.invalidateQueries(["requests", request?.room.id]);
      queryClient.invalidateQueries(["members", request?.room.id]);
    },
  });

  const rejection = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${BASE_API_URL}/requests/${request?.id}/reject`,
        {
          method: "POST",
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

        throw new Error("An error occurred while rejecting request");
      }

      queryClient.invalidateQueries(["requests", request?.room.id]);
      queryClient.invalidateQueries(["members", request?.room.id]);
    },
  });

  const createRequest = useMutation<void, Error, string>({
    mutationFn: async (roomId: string) => {
      const res = await fetch(`${BASE_API_URL}/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authUser?.getIdToken()}`,
        },
        body: JSON.stringify({ roomId }),
      });

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("An error occurred while creating request");
      }

      queryClient.invalidateQueries(["requests", roomId]);
    },
  });

  return {
    approveRequest: approval,
    rejectRequest: rejection,
    createRequest: createRequest,
  };
};
