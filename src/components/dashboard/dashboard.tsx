import { BluetoothAttempts } from "./dash-bubbles/bluetooth";
import { FailedAttempts } from "./dash-bubbles/failed";
import { SuccessfulAttempts } from "./dash-bubbles/successful";
import { UserFailedAttempts } from "./dash-bubbles/user-failed";
import { UserSuccessfulAttempts } from "./dash-bubbles/user-successful";
import { UserWirelessAttempts } from "./dash-bubbles/user-wireless";
import { BrandingHeader } from "../ui/branding-header";

export const Dashboard = () => {
  return (
    <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-6">
      <BrandingHeader
        highlight="STATS"
        highlightClassName="bg-primary text-white"
      >
        ROOM
      </BrandingHeader>
      <div className="flex w-full gap-2">
        <SuccessfulAttempts />
        <div className="flex flex-col gap-2">
          <BluetoothAttempts />
          <FailedAttempts />
        </div>
      </div>
      <BrandingHeader
        highlight="STATS"
        highlightClassName="bg-primary text-white"
      >
        PERSONAL
      </BrandingHeader>
      <div className="flex w-full gap-2">
        <div className="flex flex-col gap-2">
          <UserWirelessAttempts />
          <UserFailedAttempts />
        </div>
        <UserSuccessfulAttempts />
      </div>
      <div className="h-64" />
    </div>
  );
};
