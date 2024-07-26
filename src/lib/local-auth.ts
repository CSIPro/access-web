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
            alg: -7,
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
    throw new Error("No se pudo autenticar con tu dispositivo");
  }
};
