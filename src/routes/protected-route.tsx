import { FC, ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "reactfire";

import { Splash } from "@/components/splash/splash";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useNestUser } from "@/hooks/use-user-data";
import { deleteAllFromStorage } from "@/lib/local-storage";

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
  const auth = useAuth();
  const { isLoading, isFetching, data, error, refetch } = useNestUser();

  const signOut = () => {
    deleteAllFromStorage();
    auth.signOut();
  };

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (isLoading) {
    return <Splash loading message="Obteniendo datos de usuario..." />;
  }

  if (error) {
    return (
      <Splash message="No fue posible conectar con el servidor">
        <div className="flex items-center gap-2">
          <Button
            onClick={isFetching || isLoading ? undefined : () => refetch()}
          >
            {isFetching || isLoading ? <LoadingSpinner /> : "Reintentar"}
          </Button>
          <Button
            onClick={() => signOut()}
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
