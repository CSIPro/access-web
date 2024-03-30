import { FC, HTMLAttributes, useContext } from "react";

import { RoomContext } from "@/context/room-context";
import { UserContext } from "@/context/user-context";
import { cn } from "@/lib/utils";

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

export const RoomSelector: FC<Props> = ({ compact = false, className }) => {
  const {
    status: roomsStatus,
    rooms,
    userRooms,
    selectedRoom,
    setSelectedRoom,
  } = useContext(RoomContext);
  const { status: userStatus, user } = useContext(UserContext);

  const loading = roomsStatus === "loading" || userStatus === "loading";
  const error = roomsStatus === "error" || userStatus === "error";

  const formatRoomName = (
    roomName: string,
    roomBuilding: string,
    roomNumber: string,
  ) => {
    if (compact) {
      return roomName;
    }

    return `${roomName} (${roomBuilding}-${roomNumber})`;
  };

  const selectContent = user?.isRoot
    ? rooms?.map((room) => (
        <SelectItem value={room.id} key={room.id}>
          {formatRoomName(room.name, room.building, room.room)}
        </SelectItem>
      ))
    : userRooms?.map((room) => (
        <SelectItem value={room.id} key={room.id}>
          {formatRoomName(room.name, room.building, room.room)}
        </SelectItem>
      ));

  return (
    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
      <SelectTrigger className={cn("bg-primary text-white", className)}>
        <SelectValue
          placeholder={
            loading
              ? "Loading..."
              : error
              ? "Something went wrong"
              : "Select a room"
          }
        />
      </SelectTrigger>
      <SelectContent>{selectContent}</SelectContent>
    </Select>
  );
};
