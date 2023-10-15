import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth, useFirestore, useFirestoreCollectionData } from "reactfire";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { LoadingSpinner } from "../ui/spinner";
import { useToast } from "../ui/use-toast";

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
  room: z.string({
    required_error: "You must select a room",
  }),
});

const roomSchema = z.object({
  building: z.string(),
  id: z.string(),
  name: z.string(),
  room: z.string(),
});

const userSchema = z.object({
  csiId: z.number(),
  name: z.string(),
  passcode: z.string(),
  unisonId: z.string(),
  createdAt: z.custom<Timestamp>(),
  dateOfBirth: z.custom<Timestamp>(),
});

export const SignupForm = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const firestore = useFirestore();
  const { toast } = useToast();
  const roomsCollection = collection(firestore, "rooms");
  const { status: roomsStatus, data: roomsData } = useFirestoreCollectionData(
    roomsCollection,
    {
      idField: "id",
    },
  );
  const auth = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);

    try {
      if (!auth.currentUser) {
        toast({
          variant: "destructive",
          title: "Uh, oh",
          description: "You don't seem to be signed in",
        });

        return;
      }

      const userUid = auth.currentUser.uid;

      const response = await fetch(
        "http://192.168.100.24:8080/passcode-encrypt",
        {
          method: "POST",
          body: JSON.stringify({
            passcode: data.passcode,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        toast({
          variant: "destructive",
          title: "Uh, oh",
          description: "Something went wrong while encrypting your passcode",
        });

        return;
      }

      const { encryptedPasscode } = await response.json();

      // TODO: Submit data to Firestore
      if (await unisonIdExists(data.unisonId)) {
        toast({
          title: "Invalid UniSon ID",
          description: "The UniSon ID you provided is already in use",
        });

        return;
      }

      const csiId = await getNextId();

      const userData = {
        csiId,
        name: data.name,
        unisonId: data.unisonId,
        dateOfBirth: Timestamp.fromDate(data.dateOfBirth),
        passcode: encryptedPasscode,
      };

      const userDoc = doc(firestore, "users", userUid);
      const userRolesDoc = doc(firestore, "user_roles", userUid);

      await setDoc(userDoc, { ...userData, createdAt: Timestamp.now() });
      await setDoc(userRolesDoc, { key: userUid });

      const requestsCollection = collection(firestore, "requests");
      await addDoc(requestsCollection, {
        status: 0,
        userId: userUid,
        roomId: data.room,
        userComment: "Sign up request from Access Web",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      navigate("/app");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Uh, oh",
        description: "Something went wrong while submitting your data",
      });
    } finally {
      setLoading(false);
    }
  };

  const unisonIdExists = async (unisonId: string) => {
    const usersCollection = collection(firestore, "users");
    const usersQuery = query(
      usersCollection,
      where("unisonId", "==", unisonId),
    );
    const users = await getDocs(usersQuery);

    return users.docs.length > 0;
  };

  const getNextId = async () => {
    const usersCollection = collection(firestore, "users");
    const usersQuery = query(
      usersCollection,
      orderBy("csiId", "desc"),
      limit(1),
    );
    const users = await getDocs(usersQuery);

    const lastUser = users.docs[0].data() as z.infer<typeof userSchema>;

    return lastUser.csiId + 1;
  };

  if (roomsStatus === "loading") {
    return (
      <div className="flex flex-col items-center justify-center pt-12">
        <LoadingSpinner />
        <p>Loading form...</p>
      </div>
    );
  }

  if (roomsStatus === "error") {
    return <p>Unable to retrieve data from Firebase</p>;
  }

  const rooms = roomsData as z.infer<typeof roomSchema>[];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-4 text-muted md:grid-cols-2"
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
              <FormDescription className="text-stone-400">
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
              <FormDescription className="text-stone-400">
                This is your UniSon or Employee ID
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
              <FormDescription className="text-stone-400">
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
                    <Button
                      variant="outline"
                      className="hover:bg-primary hover:text-white"
                    >
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
              <FormDescription className="text-stone-400">
                Your date of birth is used to calculate your age
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="room"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Room</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room to request access" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem value={room.id} key={room.id}>
                      {`${room.name} (${room.building}-${room.room})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription className="text-stone-400">
                After submitting, a request will be sent to the selected room
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
      {loading && <LoadingSpinner />}
    </Form>
  );
};
