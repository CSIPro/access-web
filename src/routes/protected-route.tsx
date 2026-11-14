import { FC, ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

import { Splash } from "@/components/splash/splash";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useNestUser } from "@/hooks/use-user-data";
import { signOut } from "@/lib/session-cache";

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
  const { isPending, isFetching, data, error, refetch } = useNestUser();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (isPending) {
    return <Splash loading message="Obteniendo datos de usuario..." />;
  }

  if (data === undefined && error) {
    return (
      <Splash message="No fue posible conectar con el servidor">
        <div className="flex items-center gap-2">
          <Button
            onClick={isFetching || isPending ? undefined : () => refetch()}
          >
            {isFetching || isPending ? <LoadingSpinner /> : "Reintentar"}
          </Button>
          <Button
            onClick={() => void signOut()}
            variant="secondary"
            className="text-white"
          >
            Cerrar sesión
          </Button>
        </div>
      </Splash>
    );
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

  if (status === "pending") {
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
