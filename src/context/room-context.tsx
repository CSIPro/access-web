import { FC, ReactNode, createContext, useState } from "react";
import * as z from "zod";

import { useRooms, useUserRooms } from "@/hooks/use-rooms";

const roomSchema = z.object({
  id: z.string(),
  name: z.string(),
  building: z.string(),
  room: z.string(),
});

interface RoomContextProps {
  status?: "loading" | "error" | "success";
  selectedRoom?: string;
  setSelectedRoom?: (roomId: string) => void;
  rooms?: z.infer<typeof roomSchema>[];
  userRooms?: z.infer<typeof roomSchema>[];
}

export const RoomContext = createContext<RoomContextProps>({});

export const RoomProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const { status: roomsStatus, data: roomsData } = useRooms();
  const { status: userRoomsStatus, data: userRoomsData } = useUserRooms();

  if (roomsStatus === "loading" || userRoomsStatus === "loading") {
    return (
      <RoomContext.Provider value={{ status: "loading" }}>
        {children}
      </RoomContext.Provider>
    );
  }

  if (roomsStatus === "error" || userRoomsStatus === "error") {
    return (
      <RoomContext.Provider value={{ status: "error" }}>
        {children}
      </RoomContext.Provider>
    );
  }

  const rooms = roomsData?.filter((room) =>
    userRoomsData.some((userRoom) => userRoom.id === room.id),
  );

  const providerValue = {
    selectedRoom: selectedRoom || rooms.at(0)?.id,
    setSelectedRoom,
    rooms: roomsData,
    userRooms: rooms,
  };

  return (
    <RoomContext.Provider value={providerValue}>
      {children}
    </RoomContext.Provider>
  );
};
