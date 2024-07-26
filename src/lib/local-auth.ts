import toast from "react-hot-toast";

import { NestUser } from "@/hooks/use-user-data";

import { formatUserName } from "./utils";

export const authenticateLocal = async (user: NestUser) => {
  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: {
          id: "localhost",
          name: "CSI PRO Access",
        },
        pubKeyCredParams: [
          {
            alg: -8,
            type: "public-key",
          },
        ],
        user: {
          id: new Uint8Array(32),
          name: formatUserName(user),
          displayName: formatUserName(user),
        },
      },
    });

    return !!credential;
  } catch (error) {
    toast.error("La autenticación local falló");

    return false;
  }
};
