import axios from "axios";
import { User } from "firebase/auth";
import { FC } from "react";
import QRCode from "react-qr-code";
import { useQuery } from "react-query";

import { LoadingSpinner } from "../ui/spinner";

interface Props {
  user: User;
}

export const QRGenerator: FC<Props> = ({ user }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: ["qr-token"],
    queryFn: async () => {
      return axios.get(
        `${import.meta.env.VITE_ACCESS_API_URL}/api/users/generate-token`,
        {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        },
      );
    },
    refetchInterval: 20000,
  });

  if (error) {
    return (
      <p className="text-center">
        Something went wrong while generating your QR Code
      </p>
    );
  }

  return (
    <div className="flex aspect-square w-full items-center justify-center rounded-md bg-white p-2">
      {isLoading && <LoadingSpinner onBackground />}
      {!isLoading && data && (
        <QRCode value={data.data?.token} className="h-full w-full" />
      )}
    </div>
  );
};
