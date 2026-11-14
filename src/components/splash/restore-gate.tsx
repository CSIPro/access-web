import { useIsRestoring } from "@tanstack/react-query";
import { FC, ReactNode } from "react";

import { Splash } from "./splash";

export const RestoreGate: FC<{ children: ReactNode }> = ({ children }) => {
  const isRestoring = useIsRestoring();

  if (isRestoring) {
    return <Splash loading />;
  }

  return children;
};
