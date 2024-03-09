import { Buffer } from "buffer";

import axios from "axios";
import { useUser } from "reactfire";

import { Dashboard } from "@/components/dashboard/dashboard";
import { Header } from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { RoomSelector } from "@/components/ui/room-selector";
import { Bluetooth } from "lucide-react";

export const AppIndex = () => {
  const { data: userData } = useUser();

  const testBluetooth = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ["4655318c-0b41-4725-9c64-44f9fb6098a2"] }],
      });

      const res = await axios.get(
        `${import.meta.env.VITE_ACCESS_API_URL}/api/users/generate-token`,
        {
          headers: {
            Authorization: `Bearer ${await userData?.getIdToken()}`,
          },
        },
      );

      const token = res.data?.token;

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(
        import.meta.env.VITE_BLE_SERVICE_UUID,
      );
      const characteristic = await service?.getCharacteristic(
        import.meta.env.VITE_BLE_CHARACTERISTIC_UUID,
      );

      const encodedToken = Buffer.from(token).toString("base64");
      await characteristic?.writeValue(new TextEncoder().encode(encodedToken));

      server.disconnect();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-white">
      <Header title="Home" />
      <main className="relative flex h-full w-full flex-col items-center gap-2 p-2">
        <RoomSelector />
        <Dashboard />
        {!!navigator.bluetooth && !!userData && (
          <Button
            onClick={testBluetooth}
            size="icon"
            className="absolute bottom-4 right-4 rounded-full hover:bg-primary focus:bg-primary"
          >
            <Bluetooth size="24" />
          </Button>
        )}
      </main>
    </div>
  );
};
