import { FC, ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { Splash } from "@/components/splash/splash";
import { useNestUser } from "@/hooks/use-user-data";

interface Props {
  isAuthenticated: boolean;
  redirectPath?: string;
  children?: ReactNode;
}

export const AuthedRoute: FC<Props> = ({
  isAuthenticated,
  redirectPath = "/login",
  children,
}) => {
  const { status, data } = useNestUser();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (status === "loading") {
    return <Splash loading message="Obteniendo datos de usuario..." />;
  }

  if (!data) {
    return <Navigate to="/complete-signup" replace />;
  }

  return children ? children : <Outlet />;
};

export const UnauthedRoute: FC<Props> = ({
  isAuthenticated,
  redirectPath = "/",
  children,
}) => {
  const { status, data, error } = useNestUser();

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (status === "loading") {
    return <Splash loading message="Obteniendo datos de usuario..." />;
  }

  if (error) {
    return <Splash message="No fue posible conectar con el servidor" />;
  }

  if (data) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};
