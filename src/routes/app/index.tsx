import { Buffer } from "buffer";

import axios from "axios";
import { Bluetooth } from "lucide-react";
import { useUser } from "reactfire";

import { Dashboard } from "@/components/dashboard/dashboard";
import { Header } from "@/components/header/header";
import { Button } from "@/components/ui/button";
import { RoomSelector } from "@/components/ui/room-selector";

export const AppIndex = () => {
  const { data: userData } = useUser();

  const testBluetooth = async () => {
    const serviceUuid = import.meta.env.VITE_BLE_SERVICE_UUID;
    const characteristicUuid = import.meta.env.VITE_BLE_CHARACTERISTIC_UUID;

    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [serviceUuid] }],
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
      const service = await server?.getPrimaryService(serviceUuid);
      const characteristic =
        await service?.getCharacteristic(characteristicUuid);

      const encodedToken = Buffer.from(token).toString("base64");
      await characteristic?.writeValue(new TextEncoder().encode(encodedToken));

      server?.disconnect();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-white">
      <Header title="Home" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <RoomSelector />
        <Dashboard />
        {!!navigator.bluetooth && !!userData && (
          <Button
            onClick={testBluetooth}
            size="icon"
            className="fixed bottom-4 right-4 flex h-14 w-14 items-center justify-center rounded-full p-2 hover:bg-primary focus:bg-primary"
          >
            <img src="/images/access-logo.svg" alt="Logo de CSI PRO Access" />
          </Button>
        )}
      </main>
    </div>
  );
};
