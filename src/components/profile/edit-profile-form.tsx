import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useMutation } from "react-query";
import { useNavigate } from "react-router-dom";

import { useUserContext } from "@/context/user-context";
import { firebaseAuth } from "@/firebase";
import { ProfileForm, UserResponse } from "@/hooks/use-user-data";
import { BASE_API_URL, NestError } from "@/lib/utils";

import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export const EditProfileForm = () => {
  const authUser = firebaseAuth.currentUser;
  const { user } = useUserContext();

  const navigate = useNavigate();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(ProfileForm),
    defaultValues: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      dateOfBirth: user
        ? new Date(
            new Date(user.dateOfBirth).getTime() +
              new Date().getTimezoneOffset() * 60 * 1000,
          )
        : new Date(),
    },
  });

  const updateUser = useMutation({
    mutationFn: async (formData: ProfileForm) => {
      if (!authUser) {
        throw new Error("Tu sesión expiró.");
      }

      if (!user) {
        throw new Error("No se encontró el usuario.");
      }

      const token = await authUser.getIdToken();

      const res = await fetch(`${BASE_API_URL}/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...formData,
          dateOfBirth: formData.dateOfBirth?.toISOString(),
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        const errorParse = NestError.safeParse(data);

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("Ocurrió un error inesperado.");
      }

      const userResParse = UserResponse.safeParse(data);

      if (!userResParse.success) {
        console.error(userResParse);

        throw new Error("La aplicación no pudo procesar la respuesta.");
      }

      return userResParse.data;
    },
    onSuccess: () => {
      toast.success("Perfil actualizado");
      navigate("/app", { replace: true });
    },
    onError: (error: Error) => {
      toast.error(`Actualización de perfil: ${error.message}`);
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateUser.mutate(data);
  };

  return (
    <div className="flex w-full flex-col gap-2">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex w-full flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="firstName"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Nombre" />
                </FormControl>
                {fieldState.error ? (
                  <FormMessage />
                ) : (
                  <FormDescription>
                    Solo un nombre, de preferencia.
                  </FormDescription>
                )}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apellido(s)</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Apellido(s)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dateOfBirth"
            render={({ field }) => (
              <FormItem className="flex flex-col gap-1 pt-1">
                <FormLabel>Fecha de nacimiento</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="border-primary bg-primary/20 text-white hover:bg-primary hover:text-white"
                      >
                        {field.value
                          ? format(field.value, "PPP")
                          : "Escoge una fecha"}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button variant="textPrimary" type="submit">
            Guardar
          </Button>
        </form>
      </Form>
    </div>
  );
};
