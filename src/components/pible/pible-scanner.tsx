import { Buffer } from "buffer";

import axios from "axios";
import { useUser } from "reactfire";

import { Button } from "../ui/button";
import { RoomSelector } from "../ui/room-selector";

export const PibleScanner = () => {
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
    <div className="fixed bottom-2 flex w-full px-1.5">
      <Button
        onClick={testBluetooth}
        size="icon"
        className="absolute -top-1/2 left-1/2 z-10 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-primary-56 p-2 backdrop-blur-sm transition-all hover:bg-primary focus:bg-primary"
      >
        <img src="/images/access-logo.svg" alt="Logo de CSI PRO Access" />
      </Button>
      <div className="relative flex h-16 w-full items-center justify-between gap-24 overflow-hidden rounded-full border-2 border-primary bg-primary-32 px-2">
        <div className="absolute left-0 top-0 h-full w-full bg-black bg-opacity-20 backdrop-blur-sm"></div>
        <div></div>
        <div className="">
          <RoomSelector
            compact
            className="rounded-full border-2 border-primary bg-primary-48 backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  );
};

import { Buffer } from "buffer";

import axios from "axios";
import { useUser } from "reactfire";

import { Button } from "../ui/button";
import { RoomSelector } from "../ui/room-selector";

export const PibleScanner = () => {
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
    <div className="fixed bottom-8 flex w-full px-1.5">
      <Button
        onClick={testBluetooth}
        size="icon"
        className="absolute -top-1/2 left-1/2 z-10 flex h-20 w-20 -translate-x-1/2 items-center justify-center rounded-full border-2 border-white bg-primary-56 p-2 backdrop-blur-sm transition-all hover:bg-primary focus:bg-primary"
      >
        <img src="/images/access-logo.svg" alt="Logo de CSI PRO Access" />
      </Button>
      <div className="relative flex h-16 w-full items-center justify-between gap-24 overflow-hidden rounded-full border-2 border-primary bg-primary-32 px-2">
        <div className="absolute left-0 top-0 h-full w-full bg-black bg-opacity-20 backdrop-blur-sm"></div>
        <div></div>
        <div className="">
          <RoomSelector
            compact
            className="rounded-full border-2 border-primary bg-primary-48 backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  );
};
