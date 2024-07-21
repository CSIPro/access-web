import { FC, HTMLAttributes, useContext } from "react";

import { RoomContext } from "@/context/room-context";
import { useUserContext } from "@/context/user-context";
import { useMemberships } from "@/hooks/use-memberships";
import { cn, formatRoomName } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface Props {
  compact?: boolean;
  className?: HTMLAttributes<HTMLDivElement>["className"];
}

export const RoomSelector: FC<Props> = ({ className }) => {
  const { user } = useUserContext();
  const { rooms, selectedRoom, setSelectedRoom } = useContext(RoomContext);
  const { status: membershipsStatus, data: memberships } = useMemberships(
    user?.id,
  );

  const loading = membershipsStatus === "loading";
  const error = membershipsStatus === "error";

  const selectContent = user?.isRoot
    ? rooms?.map((room) => (
        <SelectItem value={room.id} key={room.id}>
          {formatRoomName(room)}
        </SelectItem>
      ))
    : rooms
        ?.filter((r) => memberships?.some((m) => m.room.id === r.id))
        .map((room) => (
          <SelectItem value={room.id} key={room.id}>
            {formatRoomName(room)}
          </SelectItem>
        ));

  return (
    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
      <SelectTrigger
        className={cn(
          "overflow-hidden text-ellipsis whitespace-nowrap bg-primary text-white",
          className,
        )}
      >
        <SelectValue
          placeholder={
            loading ? "Loading..." : error ? "Error" : "Select a room"
          }
        />
      </SelectTrigger>
      <SelectContent>{selectContent}</SelectContent>
    </Select>
  );
};
