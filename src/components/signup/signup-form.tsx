import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";

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

const formSchema = z.object({
  name: z
    .string({
      required_error: "Your name is required",
    })
    .min(4, {
      message: "Your name should be at least 4 characters long",
    })
    .max(50, {
      message: "Your name should be at most 50 characters long",
    }),
  unisonId: z
    .string({
      required_error: "Your UniSon ID is required",
    })
    .min(5, {
      message: "Your UniSon ID must be at least 5 digits long",
    })
    .max(9, {
      message: "Your UniSon ID must be at most 9 digits long",
    })
    .regex(/^[0-9]{5,9}$/),
  passcode: z
    .string({
      required_error: "Your passcode is required",
    })
    .min(4, {
      message: "Your passcode must be at least 4 characters long",
    })
    .max(10, {
      message: "Your passcode must be at most 10 characters long",
    })
    .regex(/^(?=.*[\d])(?=.*[A-D])[\dA-D]{4,10}$/, {
      message: "Your passcode must contain numbers and letters from A to D",
    }),
  dateOfBirth: z
    .date({
      required_error: "Your date of birth is required",
    })
    .min(new Date(1900, 1, 1), {
      message: "I don't think you're that old",
    })
    .max(new Date(), {
      message: "Time traveler alert!",
    }),
});

export const SignupForm = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const response = await fetch("http://localhost:8080/passcode-encrypt", {
      method: "POST",
      body: JSON.stringify({
        passcode: data.passcode,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return;
    }

    const { encryptedPasscode } = await response.json();

    const userData = {
      name: data.name,
      unisonId: data.unisonId,
      dateOfBirth: data.dateOfBirth,
      encryptedPasscode,
    };

    console.log(userData);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid w-4/5 grid-cols-1 gap-2 text-muted md:grid-cols-2"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Name</FormLabel>
              <FormControl>
                <Input placeholder="Saúl Ramos" {...field} />
              </FormControl>
              <FormDescription className="text-white">
                This will be your public display name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unisonId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">UniSon ID</FormLabel>
              <FormControl>
                <Input placeholder="217200160" {...field} />
              </FormControl>
              <FormDescription className="text-white">
                This is your UniSon ID or Employee ID
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="passcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Passcode</FormLabel>
              <FormControl>
                <Input placeholder="123A" type="password" {...field} />
              </FormControl>
              <FormDescription className="text-white">
                This will be your private passcode
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem className="flex flex-col gap-2 py-px">
              <FormLabel className="text-white">Date of birth</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button variant="outline">
                      {field.value ? format(field.value, "PPP") : "Pick a date"}
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
              <FormDescription className="text-white">
                Your date of birth is used to calculate your age
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="col-span-full bg-white text-muted hover:bg-primary hover:text-white"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
};
