import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { FC } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { z } from "zod";

import { useRoomContext } from "@/context/room-context";
import {
  PopulatedRestriction,
  Restriction,
  useRestrictionActions,
} from "@/hooks/use-restrictions";
import { useNestRoles } from "@/hooks/use-roles";
import { cn } from "@/lib/utils";

import { RestrictionDayButton } from "./restriction-day-button";
import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LoadingSpinner } from "../ui/spinner";
import { Switch } from "../ui/switch";

const RestrictionFormSchema = z.object({
  roomId: z
    .string({ required_error: "Debes escoger un salón" })
    .uuid({ message: "El salón no es válido" }),
  roleId: z
    .string({ required_error: "Debes escoger un rol" })
    .uuid({ message: "El rol no es válido" }),
  daysBitmask: z
    .array(z.boolean())
    .length(7)
    .default(() => Array(7).fill(true)),
  startTime: z.date(),
  endTime: z.date(),
  isActive: z.boolean().default(true),
});

type RestrictionFormType = z.infer<typeof RestrictionFormSchema>;

interface Props {
  restriction?: PopulatedRestriction | null;
}

export const RestrictionForm: FC<Props> = ({ restriction }) => {
  const { selectedRoom, rooms } = useRoomContext();
  const rolesQuery = useNestRoles();
  const { createRestriction, updateRestriction, deleteRestriction } =
    useRestrictionActions();

  const bitmask = restriction?.daysBitmask
    ? Array.from(
        { length: 7 },
        (_, i) => (restriction?.daysBitmask & (1 << i)) !== 0,
      )
    : Array(7).fill(true);

  const startTime = restriction?.startTime ?? "00:00:00";
  const endTime = restriction?.endTime ?? "23:59:59";

  const startHour = startTime.substring(0, 2);
  const startMinute = startTime.substring(3, 5);
  const startSecond = startTime.substring(6, 8);

  const endHour = endTime.substring(0, 2);
  const endMinute = endTime.substring(3, 5);
  const endSecond = endTime.substring(6, 8);

  const form = useForm<RestrictionFormType>({
    resolver: zodResolver(RestrictionFormSchema),
    defaultValues: {
      roomId: restriction?.room.id ?? selectedRoom ?? "",
      roleId: restriction?.role.id ?? "",
      daysBitmask: bitmask ?? Array(7).fill(true),
      startTime: new Date(
        new Date().setHours(+startHour, +startMinute, +startSecond),
      ),
      endTime: new Date(new Date().setHours(+endHour, +endMinute, +endSecond)),
      isActive: restriction?.isActive ?? true,
    },
  });

  const onSubmit = (data: RestrictionFormType) => {
    const daysBitmask = data.daysBitmask.reduce(
      (acc, curr, index) => acc + (curr ? 1 << index : 0),
      0,
    );

    const startTime = format(data.startTime, "HH:mm:ss");
    const endTime = format(data.endTime, "HH:mm:ss");

    const restrictionData: Restriction = {
      ...data,
      startTime,
      endTime,
      daysBitmask,
      id: restriction?.id ?? "",
    };

    if (!restriction) {
      createRestriction.mutate(restrictionData);
      return;
    }

    updateRestriction.mutate(restrictionData);
  };

  const handleTimeChange = (
    type: "hour" | "minute",
    field: "start" | "end",
    value: string,
  ) => {
    const newDate = new Date(
      field === "start" ? form.getValues().startTime : form.getValues().endTime,
    );

    switch (type) {
      case "hour":
        newDate.setHours(parseInt(value));
        break;
      case "minute":
        newDate.setMinutes(parseInt(value));
        break;
    }

    if (field === "start") {
      form.setValue("startTime", newDate);
    } else {
      form.setValue("endTime", newDate);
    }
  };

  const handleDeleteRestriction = async () => {
    if (!restriction) return;
    if (deleteRestriction.isLoading) return;

    try {
      deleteRestriction.mutate(restriction.id);
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar la restricción");
    }
  };

  // const resetMutations = () => {
  //   createRestriction.reset();
  //   updateRestriction.reset();
  //   deleteRestriction.reset();
  // };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-2"
      >
        <div
          className={cn(
            "flex w-full items-center justify-between gap-2",
            (form.formState.errors.roleId || form.formState.errors.roomId) &&
              "items-start",
          )}
        >
          <FormField
            control={form.control}
            name="roleId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Rol</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-primary bg-primary/20 text-white ring-primary hover:bg-primary hover:text-white focus:ring-offset-0">
                      <SelectValue placeholder="Elige un rol" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {rolesQuery.data?.map((role) => (
                      <SelectItem value={role.id} key={role.id}>
                        {role.name}
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
            name="roomId"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Salón</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={true}
                >
                  <FormControl>
                    <SelectTrigger className="border-primary bg-primary/20 text-white ring-primary hover:bg-primary hover:text-white focus:ring-offset-0">
                      <SelectValue placeholder="Elige un salón" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(rooms ?? []).map((room) => (
                      <SelectItem value={room.id} key={room.id}>
                        {room.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="daysBitmask"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Días de la semana</FormLabel>
              <FormControl>
                <div className="flex w-full items-center justify-between gap-2">
                  {["D", "L", "M", "X", "J", "V", "S"].map((day, index) => (
                    <RestrictionDayButton
                      type="button"
                      key={index}
                      isActive={field.value[index]}
                      onClick={() => {
                        const newBitmask = [...field.value];
                        newBitmask[index] = !newBitmask[index];
                        field.onChange(newBitmask);
                      }}
                    >
                      {day}
                    </RestrictionDayButton>
                  ))}
                </div>
              </FormControl>
              <FormMessage />
              <p className="text-sm">
                Los días en que los usuarios tienen acceso
              </p>
            </FormItem>
          )}
        />
        <div className="flex w-full flex-col gap-1">
          <div
            className={cn(
              "flex w-full items-center justify-between gap-2",
              (form.formState.errors.startTime ||
                form.formState.errors.endTime) &&
                "items-start",
            )}
          >
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel>Hora de inicio</FormLabel>
                  <Popover>
                    <FormControl>
                      <PopoverTrigger asChild>
                        <Button variant="textPrimary">
                          {format(field.value, "HH:mm")}
                        </Button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent className="flex h-64 w-fit flex-row divide-y">
                      <ScrollArea className="w-auto">
                        <div className="flex flex-col gap-1 p-2">
                          {hours.map((hour) => (
                            <Button
                              key={`Start time hour ${hour}`}
                              size="icon"
                              variant={
                                field.value.getHours() === hour
                                  ? "default"
                                  : "ghost"
                              }
                              onClick={() =>
                                handleTimeChange(
                                  "hour",
                                  "start",
                                  hour.toString(),
                                )
                              }
                              className={cn(
                                "bg-primary/20",
                                field.value.getHours() === hour && "bg-primary",
                              )}
                            >
                              {hour}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                      <ScrollArea className="w-auto">
                        <div className="flex flex-col gap-1 p-2">
                          {Array.from({ length: 12 }, (_, i) => i * 5).map(
                            (minute) => (
                              <Button
                                key={`Start time minute ${minute}`}
                                size="icon"
                                variant={
                                  field.value.getMinutes() === minute
                                    ? "default"
                                    : "ghost"
                                }
                                onClick={() =>
                                  handleTimeChange(
                                    "minute",
                                    "start",
                                    minute.toString(),
                                  )
                                }
                                className={cn(
                                  "bg-primary/20",
                                  field.value.getMinutes() === minute &&
                                    "bg-primary",
                                )}
                              >
                                {minute.toString().padStart(2, "0")}
                              </Button>
                            ),
                          )}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="flex w-full flex-col">
                  <FormLabel>Hora de fin</FormLabel>
                  <Popover>
                    <FormControl>
                      <PopoverTrigger asChild>
                        <Button variant="textPrimary">
                          {format(field.value, "HH:mm")}
                        </Button>
                      </PopoverTrigger>
                    </FormControl>
                    <PopoverContent className="flex h-64 w-fit flex-row divide-y">
                      <ScrollArea className="w-auto">
                        <div className="flex flex-col gap-1 p-2">
                          {hours.map((hour) => (
                            <Button
                              key={`End time hour ${hour}`}
                              size="icon"
                              variant={
                                field.value.getHours() === hour
                                  ? "default"
                                  : "ghost"
                              }
                              onClick={() =>
                                handleTimeChange("hour", "end", hour.toString())
                              }
                              className={cn(
                                "bg-primary/20",
                                field.value.getHours() === hour && "bg-primary",
                              )}
                            >
                              {hour}
                            </Button>
                          ))}
                        </div>
                      </ScrollArea>
                      <ScrollArea className="w-auto">
                        <div className="flex flex-col gap-1 p-2">
                          {Array.from({ length: 12 }, (_, i) => i * 5).map(
                            (minute) => (
                              <Button
                                key={`End time minute ${minute}`}
                                size="icon"
                                variant={
                                  field.value.getMinutes() === minute
                                    ? "default"
                                    : "ghost"
                                }
                                onClick={() =>
                                  handleTimeChange(
                                    "minute",
                                    "end",
                                    minute.toString(),
                                  )
                                }
                                className={cn(
                                  "bg-primary/20",
                                  field.value.getMinutes() === minute &&
                                    "bg-primary",
                                )}
                              >
                                {minute.toString().padStart(2, "0")}
                              </Button>
                            ),
                          )}
                        </div>
                      </ScrollArea>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <p className="text-sm">
            Las horas entre las que los usuarios tienen acceso
          </p>
        </div>
        {restriction && (
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "flex w-full flex-row items-center justify-between rounded bg-primary/20 p-2 transition-colors duration-300 ease-linear",
                  !field.value && "bg-secondary/20",
                )}
              >
                <FormLabel className="w-full">
                  {field.value ? "Activa" : "Inactiva"}
                </FormLabel>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="!mt-0"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="textSecondary"
            type="button"
            asChild
            className="basis-1/3"
          >
            <Link to="/app/restrictions">Volver</Link>
          </Button>
          <Button
            variant="textPrimary"
            type="submit"
            className="basis-2/3"
            disabled={
              createRestriction.isLoading ||
              updateRestriction.isLoading ||
              deleteRestriction.isLoading
            }
          >
            {restriction ? "Guardar restricción" : "Crear restricción"}
          </Button>
        </div>
        {restriction && (
          <Button
            variant="textSecondary"
            type="button"
            onClick={handleDeleteRestriction}
            disabled={deleteRestriction.isLoading}
          >
            Eliminar restricción
          </Button>
        )}
        {(createRestriction.isLoading ||
          updateRestriction.isLoading ||
          deleteRestriction.isLoading) && (
          <div className="flex w-full items-center justify-center pt-4">
            <LoadingSpinner />
          </div>
        )}
      </form>
    </Form>
  );
};
