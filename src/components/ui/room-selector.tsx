import { useContext } from "react";

import { RoomContext } from "@/context/room-context";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export const RoomSelector = () => {
  const { userRooms, selectedRoom, setSelectedRoom } = useContext(RoomContext);

  return (
    <Select value={selectedRoom} onValueChange={setSelectedRoom}>
      <SelectTrigger className="bg-primary text-white">
        <SelectValue placeholder="Select a room" />
      </SelectTrigger>
      <SelectContent>
        {userRooms?.map((room) => (
          <SelectItem value={room.id} key={room.id}>
            {`${room.name} (${room.building}-${room.room})`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
