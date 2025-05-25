import { useMutation, useQuery, useQueryClient } from "react-query";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { useRoomContext } from "@/context/room-context";
import { firebaseAuth } from "@/firebase";
import { BASE_API_URL, NestError } from "@/lib/utils";

export const Restriction = z.object({
  id: z.string(),
  roomId: z.string(),
  roleId: z.string(),
  daysBitmask: z.number().optional().default(127),
  startTime: z.string().optional().default("00:00:00"),
  endTime: z.string().optional().default("23:59:59"),
  isActive: z.boolean().default(true),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  deletedAt: z.string().datetime().optional().nullable(),
});

export type Restriction = z.infer<typeof Restriction>;

export const PopulatedRestriction = Restriction.omit({
  roomId: true,
  roleId: true,
}).extend({
  room: z.object({
    id: z.string(),
    name: z.string(),
  }),
  role: z.object({
    id: z.string(),
    name: z.string(),
    level: z.number(),
  }),
});

export type PopulatedRestriction = z.infer<typeof PopulatedRestriction>;

export const useRestriction = (restrictionId: string) => {
  const authUser = firebaseAuth.currentUser;

  const restrictionQuery = useQuery({
    queryKey: ["restriction", restrictionId],
    queryFn: async () => {
      const res = await fetch(`${BASE_API_URL}/restrictions/${restrictionId}`, {
        headers: {
          Authorization: `Bearer ${await authUser?.getIdToken()}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("Error al obtener la restricción");
      }

      const data = await res.json();
      const restrictionParse = PopulatedRestriction.safeParse(data);

      if (!restrictionParse.success) {
        throw new Error("La aplicación recibió datos inválidos");
      }

      return restrictionParse.data;
    },
  });

  return restrictionQuery;
};

export const useRoomRestrictions = (roomId?: string) => {
  const authUser = firebaseAuth.currentUser;
  const { selectedRoom } = useRoomContext();

  const restrictionsQuery = useQuery({
    queryKey: ["restrictions", roomId ?? selectedRoom],
    queryFn: async () => {
      const res = await fetch(
        `${BASE_API_URL}/rooms/${roomId ?? selectedRoom}/restrictions`,
        {
          headers: {
            Authorization: `Bearer ${await authUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("Error al obtener las restricciones");
      }

      const data = await res.json();

      const restrictionsParse = PopulatedRestriction.array().safeParse(data);

      if (!restrictionsParse.success) {
        throw new Error("La aplicación recibió datos inválidos");
      }

      return restrictionsParse.data;
    },
  });

  return restrictionsQuery;
};

export const useRestrictionActions = () => {
  const authUser = firebaseAuth.currentUser;
  const queryClient = useQueryClient();
  const { selectedRoom } = useRoomContext();
  const navigate = useNavigate();

  const createRestriction = useMutation({
    mutationFn: async (restriction: Omit<Restriction, "id">) => {
      const restrictionParse = Restriction.omit({ id: true }).safeParse(
        restriction,
      );

      if (!restrictionParse.success) {
        throw new Error("Los datos de la restricción son inválidos");
      }

      const res = await fetch(
        `${BASE_API_URL}/rooms/${selectedRoom}/restrictions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await authUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(restrictionParse.data),
        },
      );

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("Error al crear la restricción");
      }

      const data = await res.json();

      const createdRestrictionParse = Restriction.safeParse(data);

      if (!createdRestrictionParse.success) {
        throw new Error("La aplicación recibió datos inválidos");
      }

      queryClient.invalidateQueries({
        queryKey: ["restriction", createdRestrictionParse.data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["restrictions", selectedRoom],
      });
    },
    onSuccess: () => {
      navigate("/app/restrictions");
    },
  });

  const updateRestriction = useMutation({
    mutationFn: async (restriction: Restriction) => {
      const restrictionParse = Restriction.safeParse(restriction);

      if (!restrictionParse.success) {
        throw new Error("Los datos de la restricción son inválidos");
      }

      const res = await fetch(
        `${BASE_API_URL}/rooms/${selectedRoom}/restrictions/${restriction.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${await authUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(restrictionParse.data),
        },
      );

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("Error al actualizar la restricción");
      }

      queryClient.invalidateQueries({
        queryKey: ["restriction", restriction.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["restrictions", selectedRoom],
      });
    },
    onSuccess: () => {
      navigate("/app/restrictions");
    },
  });

  const deleteRestriction = useMutation({
    mutationFn: async (restrictionId: string) => {
      const res = await fetch(
        `${BASE_API_URL}/rooms/${selectedRoom}/restrictions/${restrictionId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${await authUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        const errorParse = NestError.safeParse(await res.json());

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("Error al eliminar la restricción");
      }

      queryClient.invalidateQueries({
        queryKey: ["restriction", restrictionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["restrictions", selectedRoom],
      });
    },
    onSuccess: () => {
      navigate("/app/restrictions");
    },
  });

  return {
    createRestriction,
    updateRestriction,
    deleteRestriction,
  } as const;
};
