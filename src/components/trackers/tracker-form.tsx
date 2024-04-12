import { zodResolver } from "@hookform/resolvers/zod";
import { useContext } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "react-query";
import { useAuth } from "reactfire";
import { z } from "zod";

import { RoomContext } from "@/context/room-context";

import { Button } from "../ui/button";
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
import { LoadingSpinner } from "../ui/spinner";

export const TrackerFormFields = z.object({
  name: z.string({ required_error: "The tracker must have a name." }),
});
export type TrackerFormFields = z.infer<typeof TrackerFormFields>;

export const TrackerForm = () => {
  const auth = useAuth();
  const { selectedRoom } = useContext(RoomContext);

  const queryClient = useQueryClient();
  const { status, data, mutateAsync } = useMutation(async (name: string) => {
    const res = await fetch(
      `${import.meta.env.VITE_ACCESS_API_URL}/api/trackers/add`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
        },
        body: JSON.stringify({ name, roomId: selectedRoom }),
      },
    );

    const data = await res.json();

    return data;
  });

  const form = useForm<TrackerFormFields>({
    resolver: zodResolver(TrackerFormFields),
  });

  const onSubmit = async (data: TrackerFormFields) => {
    if (status === "loading") return;

    try {
      await mutateAsync(data.name);
      queryClient.invalidateQueries(["trackers", selectedRoom]);

      form.reset();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-2 rounded-sm border-2 border-primary bg-primary-32 p-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tracker name"
                  className="text-muted"
                  {...field}
                />
              </FormControl>
              <FormDescription className="text-white">
                The name of the tracker.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="bg-primary uppercase text-white hover:brightness-110 focus:brightness-110"
        >
          {status === "loading" ? <LoadingSpinner /> : "Submit"}
        </Button>
      </form>
    </Form>
  );
};
