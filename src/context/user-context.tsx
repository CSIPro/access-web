import { FC, ReactNode, createContext, useContext } from "react";
import { useMutation, UseMutationResult } from "react-query";
import { z } from "zod";

import { Splash } from "@/components/splash/splash";
import { firebaseAuth } from "@/firebase";
import { Membership, useMemberships } from "@/hooks/use-memberships";
import { NestUser, useNestUser } from "@/hooks/use-user-data";
import { BASE_API_URL, NestError } from "@/lib/utils";

import { useRoomContext } from "./room-context";

const KeyResponse = z.object({ publicKey: z.string() });

interface UserContextProps {
  user?: NestUser;
  membership?: Membership;
  submitPasscode: (passcode: string) => Promise<void>;
  registerForNotifications: UseMutationResult<
    void,
    unknown,
    ServiceWorkerRegistration,
    unknown
  >;
}

export const UserContext = createContext<UserContextProps | null>(null);

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { selectedRoom } = useRoomContext();
  const { status, data } = useNestUser();
  const { status: membershipStatus, data: memberships } = useMemberships(
    data?.id,
  );

  const registerForNotifications = useMutation(
    async (registration: ServiceWorkerRegistration) => {
      const authUser = firebaseAuth.currentUser;

      if (!authUser) {
        throw new Error("No user found");
      }

      const keyRes = await fetch(`${BASE_API_URL}/notifications/public-key`, {
        headers: {
          Authorization: `Bearer ${await authUser.getIdToken()}`,
        },
      });

      const keyData = await keyRes.json();

      if (!keyRes.ok) {
        const errorParse = NestError.safeParse(keyData);

        if (errorParse.success) {
          throw new Error(errorParse.data.message);
        }

        throw new Error("Error fetching public key");
      }

      const keyParse = KeyResponse.safeParse(keyData);

      if (!keyParse.success) {
        throw new Error("Error parsing public key");
      }

      const publicKey = keyParse.data.publicKey;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey,
      });

      const subRes = await fetch(
        `${BASE_API_URL}/notifications/subscribe/${data!.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${await authUser.getIdToken()}`,
          },
          body: JSON.stringify({
            subscription,
          }),
        },
      );

      if (!subRes.ok) {
        const data = await subRes.json();

        const error = NestError.safeParse(data);

        if (error.success) {
          throw new Error(error.data.message);
        }

        throw new Error(
          "Something went wrong while subscribing to notifications",
        );
      }

      navigator.serviceWorker.addEventListener("message", (event) => {
        console.log("Message from service worker", event.data);
      });
    },
  );

  const submitPasscode = async (passcode: string) => {
    if (!data) {
      throw new Error("No user data found");
    }

    passcode = passcode.toUpperCase();

    try {
      const authUser = firebaseAuth.currentUser;
      if (!authUser) {
        throw new Error("No user found");
      }

      const token = await authUser.getIdToken();

      const res = await fetch(
        `${BASE_API_URL}/users/${data?.id}/update-passcode`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            passcode,
          }),
        },
      );

      if (!res.ok) {
        const data = await res.json();

        const error = NestError.safeParse(data);

        if (error.success) {
          throw new Error(error.data.message);
        }

        throw new Error("Something went wrong while creating the user");
      }
    } catch (error) {
      console.error(error);

      throw error;
    }
  };

  if (status === "loading" || membershipStatus === "loading") {
    return <Splash loading message="Loading user data..." />;
  }

  if (status === "error") {
    return (
      <UserContext.Provider
        value={{
          submitPasscode,
          registerForNotifications,
        }}
      >
        {children}
      </UserContext.Provider>
    );
  }

  if (membershipStatus === "error") {
    return (
      <UserContext.Provider
        value={{
          user: data,
          submitPasscode,
          registerForNotifications,
        }}
      >
        {children}
      </UserContext.Provider>
    );
  }

  const membership = memberships?.find(
    (membership) => membership.room.id === selectedRoom,
  );

  const providerValue = {
    user: data,
    membership,
    submitPasscode,
    registerForNotifications,
  };

  return (
    <UserContext.Provider value={providerValue}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserContextProvider");
  }

  return context;
};
