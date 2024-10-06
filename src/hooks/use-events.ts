import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { z } from "zod";

import { firebaseAuth } from "@/firebase";
import { BASE_API_URL, NestError } from "@/lib/utils";

import { NestRoom } from "./use-rooms";
import { NestUser } from "./use-user-data";

export const EventAttendee = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  userId: z.string().uuid().optional().nullable(),
  unisonId: z.string().max(9).nullable(),
  enrolled: z.string().datetime({ offset: true }).nullable(),
  verified: z.string().datetime({ offset: true }).nullable(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  user: NestUser.partial().nullable().optional(),
});

export type EventAttendee = z.infer<typeof EventAttendee>;

export const EventTypes = z.enum(
  [
    "conference",
    "workshop",
    "hackathon",
    "seminar",
    "webinar",
    "csipro_talks",
    "csipro_workshop",
    "csipro_insights",
  ],
  { required_error: "El tipo de evento es obligatorio" },
);

export type EventTypes = z.infer<typeof EventTypes>;

export const eventTypesLabels: Record<keyof typeof EventTypes.enum, string> = {
  conference: "Conferencia",
  workshop: "Taller",
  hackathon: "Hackatón",
  seminar: "Seminario",
  webinar: "Webinario",
  csipro_talks: "CSI PRO Talks",
  csipro_workshop: "CSI PRO Workshop",
  csipro_insights: "CSI PRO Insights",
};

export const Event = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  eventStart: z.string().datetime({ offset: true }),
  eventEnd: z.string().datetime({ offset: true }),
  eventType: EventTypes,
  eventSchedule: z.object({}).nullable(),
  participants: z.array(z.string()).nullable(),
  spots: z.number(),
  createdAt: z.string().datetime({ offset: true }),
  updatedAt: z.string().datetime({ offset: true }),
  room: NestRoom.partial(),
  owner: NestUser.partial(),
});

export type Event = z.infer<typeof Event>;

interface UseEventsProps {
  past?: boolean;
  limit?: number;
}

export const useEvents = ({
  past = false,
  limit = 20,
}: UseEventsProps = {}) => {
  const authUser = firebaseAuth.currentUser;

  const { status, data, error, refetch } = useQuery({
    queryKey: ["events", { past, limit }],
    queryFn: async () => {
      const authToken = await authUser?.getIdToken();

      const res = await fetch(
        `${BASE_API_URL}/events?past=${past ? "true" : "false"}&limit=${limit}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      if (!res.ok) {
        const error = NestError.safeParse(await res.json());

        if (error.success) {
          throw new Error(error.data.message);
        }

        throw new Error("Couldn't fetch events");
      }

      const eventsParse = Event.array().safeParse(await res.json());

      if (!eventsParse.success) {
        console.log(eventsParse.error);

        throw new Error("Couldn't parse events");
      }

      return eventsParse.data;
    },
    refetchInterval: 30000,
    retryDelay: 10000,
  });

  return {
    status,
    data,
    error,
    refetch,
  };
};

export const useEvent = (eventId: string) => {
  const authUser = firebaseAuth.currentUser;
  const queryClient = useQueryClient();

  const { status, data, error, refetch } = useQuery({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const authToken = await authUser?.getIdToken();

      const eventRes = await fetch(`${BASE_API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const attendeesRes = await fetch(
        `${BASE_API_URL}/events/${eventId}/attendees`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      if (!eventRes.ok) {
        const error = NestError.safeParse(await eventRes.json());

        if (error.success) {
          throw new Error(error.data.message);
        }

        throw new Error("Couldn't fetch event");
      }

      if (!attendeesRes.ok) {
        const error = NestError.safeParse(await attendeesRes.json());

        if (error.success) {
          throw new Error(error.data.message);
        }

        throw new Error("Couldn't fetch attendees");
      }

      const eventData = await eventRes.json();
      const attendeesData = await attendeesRes.json();

      const eventParse = Event.safeParse(eventData);
      const attendeesParse = EventAttendee.array().safeParse(attendeesData);

      if (!eventParse.success) {
        console.log(eventParse.error);

        throw new Error("Couldn't parse event");
      }

      if (!attendeesParse.success) {
        console.log(attendeesParse.error);

        throw new Error("Couldn't parse attendees");
      }

      return { event: eventParse.data, attendees: attendeesParse.data };
    },
  });

  const addAttendee = useMutation(async (unisonId: string) => {
    const authToken = await authUser?.getIdToken();

    const res = await fetch(`${BASE_API_URL}/events/${eventId}/add-attendee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ unisonId }),
    });

    if (!res.ok) {
      const error = NestError.safeParse(await res.json());

      if (error.success) {
        console.log(error.data.message);

        throw new Error(error.data.message);
      }

      throw new Error("Couldn't add attendee");
    }

    queryClient.invalidateQueries(["events"]);
    queryClient.invalidateQueries(["event", eventId]);
  });

  // const exportAttendees = useMutation(
  //   async (eventId: string) => {
  //     const authToken = await authUser?.getIdToken();

  //     const res = await fetch(`${BASE_API_URL}/events/${eventId}/csv`, {
  //       headers: {
  //         Authorization: `Bearer ${authToken}`,
  //       },
  //     });

  //     if (!res.ok) {
  //       const error = NestError.safeParse(await res.json());

  //       if (error.success) {
  //         console.log(error.data.message);

  //         throw new Error(error.data.message);
  //       }

  //       throw new Error("No se pudo exportar la lista de asistentes");
  //     }

  //     if (!res.headers.get("content-type")?.includes("text/csv")) {
  //       throw new Error("El archivo recibido no es un archivo CSV");
  //     }

  //     const hasPermission = await requestFileWritePermission();
  //     if (!hasPermission.access) {
  //       throw new Error("No otorgaste permiso para escribir archivos");
  //     }

  //     const contents = await res.text();

  //     const filePath = hasPermission.directoryUri;
  //     const fileName = res.headers
  //       .get("content-disposition")
  //       ?.split("filename=")[1];

  //     const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
  //       filePath,
  //       fileName,
  //       "text/csv",
  //     );

  //     await FileSystem.writeAsStringAsync(fileUri, contents, {
  //       encoding: FileSystem.EncodingType.UTF8,
  //     });
  //   },
  //   {
  //     onSuccess: () => {
  //       toast.showToast({
  //         title: "Lista de asistentes exportada",
  //         description: "El archivo fue guardado en la carpeta seleccionada",
  //         variant: "success",
  //       });
  //     },
  //     onError: (error: Error) => {
  //       toast.showToast({
  //         title: "Error al exportar lista de asistentes",
  //         description: error.message,
  //         variant: "error",
  //       });
  //     },
  //   },
  // );

  return {
    status,
    data,
    error,
    refetch,
    addAttendee,
    // exportAttendees,
  };
};

export const EventForm = z.object({
  name: z
    .string({ required_error: "El nombre del evento es obligatorio" })
    .max(200, {
      message: "El nombre del evento no puede exceder 200 caracteres",
    })
    .min(1, {
      message: "El nombre del evento no puede estar vacío",
    }),
  description: z.string().nullable().optional(),
  eventStart: z.date(),
  eventEnd: z.date(),
  eventType: EventTypes,
  roomId: z
    .string({
      required_error: "El lugar del evento es obligatorio",
    })
    .uuid(),
  spots: z
    .number({ required_error: "La disponibilidad es obligatoria" })
    .min(1, { message: "La disponibilidad debe ser mayor a 0" }),
  participants: z.array(
    z.object({
      name: z.string().max(75, {
        message:
          "El nombre de los participantes no debe exceder de 75 caracteres",
      }),
    }),
  ),
});

export type EventForm = z.infer<typeof EventForm>;

export const useSubmitEvent = () => {
  const queryClient = useQueryClient();
  const authUser = firebaseAuth.currentUser;

  const mutation = useMutation(
    async (data: Event) => {
      const authToken = await authUser?.getIdToken();

      if (!authToken) {
        throw new Error("Ocurrió un error de autenticación");
      }

      const res = await fetch(`${BASE_API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = NestError.safeParse(await res.json());

        if (error.success) {
          throw new Error(error.data.message);
        }

        throw new Error("Ocurrió un problema al crear el evento");
      }

      queryClient.invalidateQueries(["events"]);
    },
    {
      onSuccess: () => {
        toast.success("El evento ha sido creado exitosamente");
      },
      onError: (error: Error) => {
        toast.error("Error al crear evento");
      },
    },
  );

  return mutation;
};
