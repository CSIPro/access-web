import { collectionGroup, query, where } from "firebase/firestore";
import { useContext } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useFirestore, useFirestoreCollection } from "reactfire";
import { z } from "zod";

import { SerializedTimestamp } from "@/components/trackers/tracker-item";
import { RoomContext, useRoomContext } from "@/context/room-context";
import { firebaseAuth } from "@/firebase";
import { BASE_API_URL, NestError } from "@/lib/utils";

import { NestRole } from "./use-roles";
import { NestRoom } from "./use-rooms";
import { NestUser } from "./use-user-data";

export const APIRole = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
});
export type APIRole = z.infer<typeof APIRole>;

export const APIMember = z.object({
  id: z.string(),
  name: z.string(),
  csiId: z.number(),
  unisonId: z.string(),
  dateOfBirth: SerializedTimestamp,
  createdAt: SerializedTimestamp,
  isRoot: z.boolean().optional().default(false),
  role: APIRole,
});
export type APIMember = z.infer<typeof APIMember>;

export const APIMembersResponse = z.object({
  members: z.array(APIMember),
});
export type APIMembersResponse = z.infer<typeof APIMembersResponse>;

export const useRoomMembers = () => {
  const { selectedRoom } = useContext(RoomContext);

  const firestore = useFirestore();
  const roomRoles = collectionGroup(firestore, "room_roles");
  const roomRolesQuery = query(roomRoles, where("key", "==", selectedRoom));
  const { status, data } = useFirestoreCollection(roomRolesQuery, {
    idField: "id",
  });

  if (status === "loading") {
    return { status: "loading", data: null };
  }

  if (status === "error") {
    return { status: "error", data: null };
  }

  return {
    status,
    data,
  };
};

export const useRoomMembersByRole = (roleId: string) => {
  const { selectedRoom } = useContext(RoomContext);

  const firestore = useFirestore();
  const roomRoles = collectionGroup(firestore, "room_roles");
  const roomRolesQuery = query(
    roomRoles,
    where("key", "==", selectedRoom),
    where("roleId", "==", roleId),
  );
  const { status, data } = useFirestoreCollection(roomRolesQuery, {
    idField: "id",
  });

  if (status === "loading") {
    return { status: "loading", data: null };
  }

  if (status === "error") {
    return { status: "error", data: null };
  }

  return {
    status,
    data,
  };
};

export const Member = z.object({
  id: z.string(),
  canAccess: z.boolean(),
  user: NestUser.partial(),
  role: NestRole.partial(),
  room: NestRoom.partial(),
});

export type Member = z.infer<typeof Member>;

export const RoleWithMembers = z.object({
  id: z.string(),
  name: z.string(),
  level: z.number(),
  members: Member.array(),
});

export type RoleWithMembers = z.infer<typeof RoleWithMembers>;

export const useNestMembers = (roomId?: string) => {
  const authUser = firebaseAuth.currentUser;
  const { selectedRoom } = useRoomContext();

  const membersQuery = useQuery({
    queryKey: ["members", roomId ?? selectedRoom],
    queryFn: async () => {
      const fullApiUrl = `${BASE_API_URL}/rooms/${
        roomId ?? selectedRoom
      }/members`;

      const res = await fetch(fullApiUrl, {
        headers: {
          Authorization: `Bearer ${await authUser?.getIdToken()}`,
        },
      });

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        } else {
          throw new Error("Failed to fetch members data");
        }
      }

      const membersParse = Member.array().safeParse(await res.json());

      if (!membersParse.success) {
        console.log(membersParse);

        throw new Error("An error occurred while parsing members data");
      }

      return membersParse.data;
    },
  });

  return membersQuery;
};

export const useNestMembersByRole = (roomId?: string) => {
  const authUser = firebaseAuth.currentUser;
  const { selectedRoom } = useRoomContext();

  const membersQuery = useQuery({
    queryKey: ["members", roomId ?? selectedRoom],
    queryFn: async () => {
      const fullApiUrl = `${BASE_API_URL}/rooms/${
        roomId ?? selectedRoom
      }/members?groupByRole=true`;

      const res = await fetch(fullApiUrl, {
        headers: {
          Authorization: `Bearer ${await authUser?.getIdToken()}`,
        },
      });

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        } else {
          throw new Error("Failed to fetch members data");
        }
      }

      const data = await res.json();
      const groupedMembersParse = RoleWithMembers.array().safeParse(data);

      if (!groupedMembersParse.success) {
        console.log(groupedMembersParse);

        throw new Error("An error occurred while parsing members data");
      }

      const mappedData = groupedMembersParse.data.map((group) => {
        return {
          key: group.id,
          title: group.name,
          level: group.level,
          data: [...group.members],
        };
      });

      return mappedData;
    },
    retryDelay: 5000,
    refetchInterval: 20000,
  });

  return membersQuery;
};

export const useMemberActions = (userId: string) => {
  const queryClient = useQueryClient();
  const { selectedRoom } = useRoomContext();

  const accessUpdate = useMutation({
    mutationFn: async (accessGranted: boolean) => {
      const res = await fetch(
        `${BASE_API_URL}/rooms/${selectedRoom}/update-member-access`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await firebaseAuth.currentUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            canAccess: accessGranted,
          }),
        },
      );

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        } else {
          throw new Error("Failed to update member access");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user", userId]);
      queryClient.invalidateQueries(["members", selectedRoom]);
    },
  });

  const roleUpdate = useMutation({
    mutationFn: async (roleId: string) => {
      const res = await fetch(
        `${BASE_API_URL}/rooms/${selectedRoom}/update-member-role`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await firebaseAuth.currentUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            roleId,
          }),
        },
      );

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        } else {
          throw new Error("Failed to update member role");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["user", userId]);
      queryClient.invalidateQueries(["members", selectedRoom]);
    },
  });

  const kickMember = useMutation(async () => {
    const res = await fetch(
      `${BASE_API_URL}/rooms/${selectedRoom}/member/${userId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await firebaseAuth.currentUser?.getIdToken()}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      const errorParse = NestError.safeParse(await res.json());

      if (errorParse.success) {
        throw new Error(errorParse.data.message);
      } else {
        throw new Error("Failed to kick member");
      }
    }

    queryClient.invalidateQueries(["user", userId]);
    queryClient.invalidateQueries(["members", selectedRoom]);
  });

  return {
    accessUpdate,
    roleUpdate,
    kickMember,
  };
};
