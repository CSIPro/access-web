import { FC, ReactNode, createContext } from "react";
import * as z from "zod";

import { roleSchema, useRoles } from "@/hooks/use-roles";

interface RoleContextProps {
  status?: "loading" | "error" | "success";
  roles?: z.infer<typeof roleSchema>[];
}

export const RoleContext = createContext<RoleContextProps>({});

export const RoleProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { status: rolesStatus, data: rolesData } = useRoles();

  if (rolesStatus === "loading") {
    return (
      <RoleContext.Provider value={{ status: "loading" }}>
        {children}
      </RoleContext.Provider>
    );
  }

  if (rolesStatus === "error") {
    return (
      <RoleContext.Provider value={{ status: "error" }}>
        {children}
      </RoleContext.Provider>
    );
  }

  if (!rolesData) {
    return (
      <RoleContext.Provider value={{ status: "error" }}>
        {children}
      </RoleContext.Provider>
    );
  }

  const providerValue = {
    roles: rolesData as z.infer<typeof roleSchema>[],
  };

  return (
    <RoleContext.Provider value={providerValue}>
      {children}
    </RoleContext.Provider>
  );
};
