import { FC, ReactNode, createContext, useContext } from "react";

import { Splash } from "@/components/splash/splash";
import { NestRole, useNestRoles } from "@/hooks/use-roles";

interface RoleContextProps {
  roles?: Array<NestRole>;
}

export const RoleContext = createContext<RoleContextProps>({});

export const RoleProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const { status: rolesStatus, data: rolesData } = useNestRoles();

  if (rolesStatus === "loading") {
    return <Splash loading message="Loading roles..." />;
  }

  if (rolesStatus === "error") {
    return (
      <RoleContext.Provider value={{ roles: [] }}>
        {children}
      </RoleContext.Provider>
    );
  }

  const providerValue = { roles: rolesData };

  return (
    <RoleContext.Provider value={providerValue}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRoleContext = () => {
  const context = useContext(RoleContext);

  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }

  return context;
};
