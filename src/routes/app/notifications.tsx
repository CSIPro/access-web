import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Header } from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useRoomContext } from "@/context/room-context";
import { useUserContext } from "@/context/user-context";
import { firebaseAuth } from "@/firebase";
import { useMemberships } from "@/hooks/use-memberships";
import {
  BASE_API_URL,
  formatRoomName,
  formatUserName,
  NestError,
} from "@/lib/utils";

const NotificationForm = z.object({
  title: z
    .string()
    .min(1, { message: "El título es obligatorio" })
    .max(100, { message: "El título no puede tener más de 100 caracteres" }),
  body: z
    .string()
    .min(1, { message: "El mensaje es obligatorio" })
    .max(250, { message: "El mensaje no puede tener más de 250 caracteres" }),
  roomId: z.string({ required_error: "El salón es obligatorio" }),
  appendAuthor: z.boolean(),
});

type NotificationForm = z.infer<typeof NotificationForm>;

const pushNotification = async (form: NotificationForm) => {
  const authUser = firebaseAuth.currentUser;

  const { title, body, roomId } = form;

  const res = await fetch(
    `${BASE_API_URL}/notifications/send-to-room/${roomId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${await authUser?.getIdToken()}`,
      },
      body: JSON.stringify({ title, body }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    const errorParse = NestError.safeParse(data);

    if (errorParse.success) {
      switch (errorParse.data.statusCode) {
        case 400:
          throw new Error("La solicitud no tiene el formato correcto.");
        case 401:
          throw new Error("No estás autorizado para enviar notificaciones.");
        case 403:
          throw new Error("No tienes permisos para enviar notificaciones.");
        default:
          throw new Error("Error al enviar la notificación");
      }
    } else {
      throw new Error("Error al enviar la notificación");
    }
  }
};

export const NotificationsPage = () => {
  const navigate = useNavigate();

  const sendNotification = useMutation<void, Error, NotificationForm, void>(
    pushNotification,
    {
      onSuccess: () => {
        toast.success("Notificación enviada");
        navigate("/app");
      },
      onError: (error) => {
        toast.error(error.message);
      },
    },
  );
  const { user } = useUserContext();
  const { rooms } = useRoomContext();
  const { status: membershipsStatus, data: memberships } = useMemberships(
    user!.id,
  );

  const form = useForm<NotificationForm>({
    resolver: zodResolver(NotificationForm),
    defaultValues: {
      title: "",
      body: "",
      roomId: undefined,
      appendAuthor: true,
    },
  });

  if (membershipsStatus === "loading") {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
        <Header title="Notificaciones" />
        <main className="flex h-full w-full flex-col items-center justify-center gap-2 p-2">
          <LoadingSpinner onBackground />
        </main>
      </div>
    );
  }

  if (membershipsStatus === "error") {
    return (
      <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
        <Header title="Notificaciones" />
        <main className="flex h-full w-full flex-col items-center gap-2 p-2">
          <p>Error al cargar tus salones</p>
        </main>
      </div>
    );
  }

  const onChangeAppendSender = (value: boolean) => {
    form.setValue("appendAuthor", value);
  };

  const onSubmit = (data: NotificationForm) => {
    data.title = data.title.trim();
    data.body = data.body.trim();

    if (data.appendAuthor) {
      data.body += `\n\n- ${formatUserName(user!)}.`;
    }

    sendNotification.mutate(data);
  };

  const items = user?.isRoot
    ? rooms ?? []
    : (rooms ?? []).filter((room) =>
        (memberships ?? []).some((m) => m.room.id === room.id),
      );

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Notificaciones" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <p>
          Puedes enviar notificaciones a todos los miembros del salón
          seleccionado
        </p>
        <Form {...form}>
          <div className="flex w-full flex-col gap-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Título de la notificación" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contenido</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contenido de la notificación"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roomId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Salón</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-primary bg-primary/20 text-white ring-primary hover:bg-primary hover:text-white focus:ring-offset-0">
                        <SelectValue placeholder="Elige un salón" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {items.map((room) => (
                        <SelectItem value={room.id} key={room.id}>
                          {formatRoomName(room)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="appendAuthor"
              render={({ field }) => (
                <FormItem className="flex items-end gap-2 pb-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={onChangeAppendSender}
                    />
                  </FormControl>
                  <FormLabel>Incluir remitente</FormLabel>
                </FormItem>
              )}
            />
            {sendNotification.isLoading ? (
              <div className="flex w-full items-center justify-center">
                <LoadingSpinner onBackground />
              </div>
            ) : (
              <Button onClick={form.handleSubmit(onSubmit)}>Enviar</Button>
            )}
          </div>
        </Form>
      </main>
    </div>
  );
};
