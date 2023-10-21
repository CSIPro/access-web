import { useContext } from "react";

import { RoomContext } from "@/context/room-context";
import { UserContext } from "@/context/user-context";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export const RoomSelector = () => {
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

  const selectContent = user?.isRoot
    ? rooms?.map((room) => (
        <SelectItem
          value={room.id}
          key={room.id}
        >{`${room.name} (${room.building}-${room.room})`}</SelectItem>
      ))
    : userRooms?.map((room) => (
        <SelectItem value={room.id} key={room.id}>
          {`${room.name} (${room.building}-${room.room})`}
        </SelectItem>
      ));

  return (
    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
      <SelectTrigger className="bg-primary text-white">
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
