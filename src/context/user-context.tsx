import { FC, ReactNode, createContext } from "react";
import * as z from "zod";

import { useUserData, userSchema } from "@/hooks/use-user-data";

interface UserContextProps {
  status?: "loading" | "error" | "success";
  user?: z.infer<typeof userSchema>;
}

export const UserContext = createContext<UserContextProps>({});

export const UserProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { status, data } = useUserData();

  if (status === "loading") {
    return (
      <UserContext.Provider value={{ status: "loading" }}>
        {children}
      </UserContext.Provider>
    );
  }

  if (status === "error") {
    return (
      <UserContext.Provider value={{ status: "error" }}>
        {children}
      </UserContext.Provider>
    );
  }

  if (!data) {
    return (
      <UserContext.Provider value={{ status: "error" }}>
        {children}
      </UserContext.Provider>
    );
  }

  const providerValue = {
    status,
    user: data,
  };

  return (
    <UserContext.Provider value={providerValue}>
      {children}
    </UserContext.Provider>
  );
};
