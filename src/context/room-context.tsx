import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { Splash } from "@/components/splash/splash";
import { NestRoom, useNestRooms } from "@/hooks/use-rooms";
import { getFromStorage, saveToStorage } from "@/lib/local-storage";

interface RoomContextProps {
  selectedRoom?: string;
  setSelectedRoom?: (roomId: string) => void;
  rooms?: NestRoom[];
  // userRooms?: NestRoom[];
}

export const RoomContext = createContext<RoomContextProps>({});

export const RoomProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const { status: roomsStatus, data: roomsData } = useNestRooms();
  // const { status: userRoomsStatus, data: userRoomsData } = useUserRooms();

  useEffect(() => {
    const retrieveSelectedRoom = async () => {
      const roomId = getFromStorage("SELECTED_ROOM");

      if (!roomId) {
        setSelectedRoom(roomsData?.at(0)?.id);
        return;
      }

      setSelectedRoom(roomId);
    };

    if (selectedRoom) {
      saveToStorage("SELECTED_ROOM", selectedRoom);
    } else if (roomsData) {
      retrieveSelectedRoom();
    }
  }, [selectedRoom, roomsData]);

  if (roomsStatus === "loading") {
    return <Splash loading message="Loading rooms..." />;
  }

  if (roomsStatus === "error") {
    return <Splash message="Unable to reach server" />;
  }

  const providerValue = {
    selectedRoom: selectedRoom || roomsData!.at(0)?.id,
    setSelectedRoom,
    rooms: roomsData,
  };

  return (
    <RoomContext.Provider value={providerValue}>
      {children}
    </RoomContext.Provider>
  );
};

export const useRoomContext = () => {
  const context = useContext(RoomContext);

  if (!context) {
    throw new Error("useRoom must be used within a RoomProvider");
  }

  return context;
};
