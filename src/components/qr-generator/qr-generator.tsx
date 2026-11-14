import { User } from "firebase/auth";
import { FC } from "react";
import QRCode from "react-qr-code";

import { useQrToken } from "@/hooks/use-qr-token";

import { LoadingSpinner } from "../ui/spinner";

interface Props {
  user: User;
}

export const QRGenerator: FC<Props> = ({ user }) => {
  const { isPending, error, data } = useQrToken(user);

  if (!data && error) {
    return (
      <p className="text-center">
        Something went wrong while generating your QR Code
      </p>
    );
  }

  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-md bg-white p-2">
      {isPending && <LoadingSpinner onBackground />}
      {!isPending && data && (
        <QRCode value={data.data?.token} className="h-full w-full" />
      )}
    </div>
  );
};
