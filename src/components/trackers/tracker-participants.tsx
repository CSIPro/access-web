import { FC, useContext, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useAuth } from "reactfire";
import { z } from "zod";

import { RoomContext } from "@/context/room-context";
import { APIMember, APIMembersResponse } from "@/hooks/use-room-members";
import { cn } from "@/lib/utils";

import { TrackerUser } from "./tracker-item";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { LoadingSpinner } from "../ui/spinner";

export const APIPostParticipantsResponse = z.object({
  message: z.string(),
  participants: z.array(z.string()),
});
export type APIPostParticipantsResponse = z.infer<
  typeof APIPostParticipantsResponse
>;

export const APIGetParticipantsResponse = z.object({
  participants: z.array(TrackerUser),
});
export type APIGetParticipantsResponse = z.infer<
  typeof APIGetParticipantsResponse
>;

interface Props {
  trackerId: string;
}

export const TrackerParticipants: FC<Props> = ({ trackerId }) => {
  const auth = useAuth();

  const { status, data, error } = useQuery<
    APIGetParticipantsResponse["participants"],
    Error
  >({
    queryKey: ["tracker-participants", trackerId],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_ACCESS_API_URL
        }/api/trackers/participants/${trackerId}`,
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        switch (res.status) {
          case 403:
            toast.error("You are not authorized to view Time Trackers");
            break;
          case 429:
            toast.error("Too many requests. Please try again later");
            break;
          default:
            toast.error("Failed to fetch Time Trackers");
        }

        throw new Error("Failed to fetch Time Trackers");
      }

      const data = await res.json();
      const participants = APIGetParticipantsResponse.safeParse(data);

      if (!participants.success) {
        throw new Error(participants.error.message);
      }

      return participants.data.participants;
    },
  });

  return (
    <ScrollArea className="w-full whitespace-nowrap rounded-sm border-2 border-primary py-2">
      {status === "loading" ? (
        <div className="flex h-full w-full items-center justify-center">
          <LoadingSpinner size="small" />
        </div>
      ) : data ? (
        <ul className="grid w-max grid-flow-col-dense grid-rows-2 gap-2 px-2">
          {data.map(({ id, name }) => (
            <ParticipantItem key={`Participant item ${id}`} name={name} />
          ))}
        </ul>
      ) : error ? (
        <div className="flex h-full w-full items-center justify-center">
          <p>{error.message}</p>
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <p>Failed to fetch Time Trackers</p>
        </div>
      )}
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export const ParticipantItem: FC<{ name: string }> = ({ name }) => {
  return (
    <li className="rounded bg-primary-16 px-2 py-1 text-lg text-violet-200">
      {name}
    </li>
  );
};

export const AddParticipants: FC<{
  trackerId: string;
  participants: string[];
}> = ({ trackerId, participants }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const auth = useAuth();
  const { selectedRoom } = useContext(RoomContext);
  const queryClient = useQueryClient();

  const { status, data } = useQuery<APIMember[], Error>({
    queryKey: ["users", selectedRoom],
    queryFn: async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_ACCESS_API_URL
        }/api/rooms/${selectedRoom}/members`,
        {
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!res.ok) {
        switch (res.status) {
          case 403:
            toast.error("You are not authorized to view users");
            break;
          case 429:
            toast.error("Too many requests. Please try again later");
            break;
          default:
            toast.error("Failed to fetch users");
        }

        throw new Error("Failed to fetch users");
      }

      const data = await res.json();
      const members = APIMembersResponse.safeParse(data);

      if (!members.success) {
        throw new Error("Failed to parse users");
      }

      return members.data.members;
    },
    enabled: dialogOpen,
  });

  const { status: mutationStatus, mutate } = useMutation<string[], Error>(
    async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_ACCESS_API_URL
        }/api/trackers/add-participants/${trackerId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ participants: selectedIds }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to add participants");
      }

      const data = await res.json();
      const response = APIPostParticipantsResponse.safeParse(data);

      if (!response.success) {
        throw new Error(response.error.message);
      }

      return response.data.participants;
    },
    {
      onSuccess: (_) => {
        toast.success("Participants added successfully");
        queryClient.invalidateQueries(["tracker", trackerId]);
        queryClient.invalidateQueries(["tracker-lapses", trackerId]);
        queryClient.invalidateQueries(["tracker-participants", trackerId]);
        setSelectedIds([]);
        setDialogOpen(false);
      },
      onError: (error) => {
        setDialogOpen(false);
      },
    },
  );

  const handleSubmitParticipants = async () => {
    if (mutationStatus === "loading") return;
    if (selectedIds.length === 0) return;

    mutate();
  };

  const filteredMembers = data?.filter(
    ({ id }) => !participants.some((pUid) => pUid === id),
  );

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedIds([]);
        }

        setDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full text-lg">Add people</Button>
      </DialogTrigger>
      <DialogContent className="h-1/2 w-4/5 rounded-md border-2 border-primary bg-muted font-body text-white">
        <DialogHeader>
          <DialogTitle>Add people to this tracker</DialogTitle>
        </DialogHeader>
        {status === "loading" && (
          <div className="flex h-full w-full items-center justify-center">
            <LoadingSpinner size="small" />
          </div>
        )}
        {status === "error" && (
          <div className="flex h-full w-full items-center justify-center">
            <span>Failed to fetch users</span>
          </div>
        )}
        {status === "success" && (
          <ScrollArea>
            <ul className="flex flex-col gap-1 p-2 text-lg">
              {filteredMembers?.map(({ id, name }) => (
                <li
                  key={`User ${id}`}
                  className={cn(
                    "flex items-center gap-2 rounded-sm px-2 py-1 transition-colors",
                    selectedIds.includes(id) && "bg-primary-16",
                  )}
                >
                  <Checkbox
                    id={id}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedIds((prev) => [...prev, id]);
                      } else {
                        setSelectedIds((prev) => prev.filter((i) => i !== id));
                      }
                    }}
                  />
                  <label htmlFor={id} className="w-full select-none">
                    {name}
                  </label>
                </li>
              ))}
            </ul>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        )}
        <DialogFooter>
          <Button
            disabled={selectedIds.length === 0}
            onClick={handleSubmitParticipants}
            className="select-none text-lg"
          >
            {mutationStatus === "loading" ? (
              <LoadingSpinner size="small" />
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Unusable due to rate limits, way too expensive.
export const RemoveParticipants: FC<{
  trackerId: string;
  ownerId: string;
  participants: string[];
}> = ({ trackerId, ownerId, participants }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const auth = useAuth();
  const queryClient = useQueryClient();

  const { status: mutationStatus, mutate } = useMutation<string[], Error>(
    async () => {
      const res = await fetch(
        `${
          import.meta.env.VITE_ACCESS_API_URL
        }/api/trackers/remove-participants/${trackerId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${await auth.currentUser?.getIdToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ participants: selectedIds }),
        },
      );

      if (!res.ok) {
        throw new Error("Failed to remove participants");
      }

      const data = await res.json();
      const response = APIPostParticipantsResponse.safeParse(data);

      if (!response.success) {
        throw new Error(response.error.message);
      }

      return response.data.participants;
    },
    {
      onSuccess: (_) => {
        toast.success("Participants removed successfully");
        queryClient.invalidateQueries(["tracker", trackerId]);
        queryClient.invalidateQueries(["tracker-lapses", trackerId]);
        setSelectedIds([]);
        setDialogOpen(false);
      },
      onError: (error) => {
        toast.error(error.message);
        setDialogOpen(false);
      },
    },
  );

  const handleSubmitParticipants = async () => {
    if (mutationStatus === "loading") return;
    if (selectedIds.length === 0) return;

    mutate();
  };

  return (
    <Dialog
      open={dialogOpen}
      onOpenChange={(open) => {
        if (!open) {
          setSelectedIds([]);
        }

        setDialogOpen(open);
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-full bg-secondary text-lg">Remove people</Button>
      </DialogTrigger>
      <DialogContent className="h-1/2 w-4/5 rounded-md border-2 border-primary bg-muted font-body text-white">
        <DialogHeader>
          <DialogTitle>Remove people from this tracker</DialogTitle>
        </DialogHeader>
        <ScrollArea>
          <ul className="flex flex-col gap-1 p-2 text-lg">
            {participants.map((pUid) => (
              <li
                key={`User ${pUid}`}
                className={cn(
                  "flex items-center gap-2 rounded-sm px-2 py-1 transition-colors",
                  selectedIds.includes(pUid) && "bg-secondary-16",
                )}
              >
                <Checkbox
                  id={pUid}
                  disabled={pUid === auth.currentUser?.uid || pUid === ownerId}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedIds((prev) => [...prev, pUid]);
                    } else {
                      setSelectedIds((prev) => prev.filter((i) => i !== pUid));
                    }
                  }}
                  className="border-secondary data-[state=checked]:bg-secondary"
                />
                <label
                  htmlFor={pUid}
                  className={cn(
                    "w-full select-none",
                    (pUid === auth.currentUser?.uid || pUid === ownerId) &&
                      "opacity-50",
                  )}
                >
                  Unknown
                </label>
              </li>
            ))}
          </ul>
          <ScrollBar orientation="vertical" />
        </ScrollArea>
        <DialogFooter>
          <Button
            disabled={selectedIds.length === 0}
            onClick={handleSubmitParticipants}
            className="select-none bg-secondary text-lg hover:bg-secondary hover:brightness-110 focus:bg-secondary focus:brightness-110"
          >
            {mutationStatus === "loading" ? (
              <LoadingSpinner size="small" />
            ) : (
              "Remove"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
