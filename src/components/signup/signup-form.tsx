import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { MdAutoAwesome, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { Navigate } from "react-router-dom";

import { useNestRequestHelpers } from "@/hooks/use-requests";
import { useNestRooms } from "@/hooks/use-rooms";
import { SignUpForm, useCreateUser } from "@/hooks/use-user-data";
import { formatRoomName, generatePasscode } from "@/lib/utils";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LoadingSpinner } from "../ui/spinner";

export const SignupForm = () => {
  const [showPasscode, setShowPasscode] = useState(false);
  const createUser = useCreateUser();
  const { createRequest } = useNestRequestHelpers();
  const { status, data: rooms } = useNestRooms();

  const form = useForm<SignUpForm>({
    resolver: zodResolver(SignUpForm),
    defaultValues: {
      firstName: "",
      lastName: "",
      unisonId: "",
      passcode: "",
      dateOfBirth: new Date(),
      room: undefined,
    },
  });

  const onSubmit = async (data: SignUpForm) => {
    const dob = data.dateOfBirth;
    const offsetDob = new Date(
      data.dateOfBirth.getTime() - dob.getTimezoneOffset() * 60 * 1000,
    );
    const normalizedDob = new Date(offsetDob.setHours(0, 0, 0, 0));

    await createUser.mutateAsync({ ...data, dateOfBirth: normalizedDob });
    await createRequest.mutateAsync(data.room);
  };

  useEffect(() => {
    if (createUser.error) {
      toast(createUser.error.message);
    }

    if (createRequest.error) {
      toast(createRequest.error.message);
    }
  }, [createUser, createRequest]);

  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center pt-12">
        <LoadingSpinner />
        <p>Cargando formulario...</p>
      </div>
    );
  }

  if (status === "error") {
    return <p>No fue posible conectar con el servidor</p>;
  }

  const toggleShowPasscode = () => {
    setShowPasscode((prev) => !prev);
  };

  const autoGeneratePasscode = () => {
    form.setValue("passcode", generatePasscode());
    setShowPasscode(true);
  };

  const passcodeType = showPasscode ? "text" : "password";

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 text-muted md:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Saúl Alberto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Apellidos</FormLabel>
              <FormControl>
                <Input placeholder="Ramos Laborín" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unisonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Expediente</FormLabel>
              <FormControl>
                <Input placeholder="217200160" {...field} />
              </FormControl>
              <FormDescription className="text-stone-400">
                Expediente o número de empleado
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passcode"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-white">Contraseña</FormLabel>
              <div className="flex w-full items-center gap-2">
                <FormControl>
                  <Input placeholder="A1B2C3" type={passcodeType} {...field} />
                </FormControl>
                <Button
                  type="button"
                  size="icon"
                  className="text-lg"
                  onClick={toggleShowPasscode}
                >
                  {showPasscode ? <MdVisibility /> : <MdVisibilityOff />}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  className="text-lg"
                  onClick={autoGeneratePasscode}
                >
                  <MdAutoAwesome />
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 py-px">
              <FormLabel className="text-white">Fecha de nacimiento</FormLabel>
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
        <FormField
          control={form.control}
          name="room"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Salón</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="border-primary bg-primary/20 text-white ring-primary hover:bg-primary hover:text-white focus:ring-offset-0">
                    <SelectValue placeholder="Elige un salón" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms?.map((room) => (
                    <SelectItem value={room.id} key={room.id}>
                      {formatRoomName(room)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-stone-400">
                Al terminar, se enviará una solicitud al salón seleccionado
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {createUser.isLoading || createRequest.isLoading ? (
          <LoadingSpinner />
        ) : (
          <Button
            type="submit"
            className="col-span-full bg-primary text-muted text-white hover:bg-primary/80 hover:text-white"
          >
            Enviar
          </Button>
        )}
        {createUser.isSuccess && createRequest.isSuccess && (
          <Navigate to="/app" />
        )}
      </form>
    </Form>
  );
};
