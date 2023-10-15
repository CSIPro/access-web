import { BluetoothAttempts } from "./dash-bubbles/bluetooth";
import { FailedAttempts } from "./dash-bubbles/failed";
import { SuccessfulAttempts } from "./dash-bubbles/successful";
import { UnknownAttempts } from "./dash-bubbles/unknown";
import { UserAttempts } from "./dash-bubbles/user-attempts";
import { UserFailedAttempts } from "./dash-bubbles/user-failed";
import { UserSuccessfulAttempts } from "./dash-bubbles/user-successful";

export const Dashboard = () => {
  return (
    <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-6">
      <SuccessfulAttempts />
      <BluetoothAttempts />
      <FailedAttempts />
      <UnknownAttempts />
      <UserAttempts />
      <UserSuccessfulAttempts />
      <UserFailedAttempts />
    </div>
  );
};
