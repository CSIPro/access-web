import { Buffer } from "buffer";

import toast from "react-hot-toast";
import { z } from "zod";

import { useUserContext } from "@/context/user-context";
import { firebaseAuth } from "@/firebase";
import { authenticateLocal } from "@/lib/local-auth";
import { NestError } from "@/lib/utils";

import { Button } from "../ui/button";
import { RoomSelector } from "../ui/room-selector";

const serviceUuid = import.meta.env.VITE_BLE_SERVICE_UUID;
const characteristicUuid = import.meta.env.VITE_BLE_CHARACTERISTIC_UUID;

const TokenRes = z.object({
  token: z.string(),
});

export const PibleScanner = () => {
  const { user } = useUserContext();

  const bluetoothScan = async () => {
    const authUser = firebaseAuth.currentUser;

    try {
      if (!authUser) {
        throw new Error("No pareces estar autenticado");
      }

      if (!(await authenticateLocal(user!))) {
        return;
      }

      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: [serviceUuid] }],
      });

      const res = await fetch(
        `${import.meta.env.VITE_ACCESS_API_URL}/users/generate-token`,
        {
          headers: {
            Authorization: `Bearer ${await authUser.getIdToken()}`,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        const errorParse = NestError.safeParse(data);

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("La llave no pudo ser generada");
      }

      const resParse = TokenRes.safeParse(data);

      if (!resParse.success) {
        throw new Error("La llave no pudo ser generada");
      }

      const token = resParse.data.token;

      const server = await device.gatt?.connect();
      const service = await server?.getPrimaryService(serviceUuid);
      const characteristic =
        await service?.getCharacteristic(characteristicUuid);

      const encodedToken = Buffer.from(token).toString("base64");
      await characteristic?.writeValue(new TextEncoder().encode(encodedToken));

      server?.disconnect();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Ocurrió un problema al conectar con el dispositivo",
      );
    }
  };

  return (
    <div className="fixed bottom-8 z-10 flex w-full px-1.5">
      <Button
        onClick={bluetoothScan}
        size="icon"
        className="absolute -top-1/2 left-1/2 z-10 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-primary-56 p-2 backdrop-blur-sm transition-all hover:bg-primary focus:bg-primary"
      >
        <img src="/images/access-logo.svg" alt="Logo de CSI PRO Access" />
      </Button>
      <div className="relative flex h-16 w-full flex-grow-0 items-center justify-between gap-24 overflow-hidden rounded-full border-2 border-primary bg-primary/30 px-2">
        <div className="absolute left-0 top-0 h-full w-full bg-muted/20 backdrop-blur-sm"></div>
        <div className="w-2/5"></div>
        <div className="w-2/5">
          <RoomSelector
            compact
            className="rounded-full border-2 border-primary bg-primary/40 backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  );
};
