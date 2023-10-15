import { doc } from "firebase/firestore";
import { FC, ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useFirestore, useFirestoreDocData } from "reactfire";

import { Splash } from "@/components/splash/splash";

interface Props {
  isAuthenticated: boolean;
  userUid?: string;
  redirectPath?: string;
  children?: ReactNode;
}

export const AuthedRoute: FC<Props> = ({
  isAuthenticated,
  userUid = "invalid",
  redirectPath = "/login",
  children,
}) => {
  const firestore = useFirestore();
  const { status, data, error } = useFirestoreDocData(
    doc(firestore, "users", `${userUid}`),
  );

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (status === "loading") {
    return <Splash loading />;
  }

  if (error) {
    return <Splash message="Error connecting to the Firestore database" />;
  }

  if (!data) {
    return <Navigate to="/complete-signup" replace />;
  }

  return children ? children : <Outlet />;
};

export const UnauthedRoute: FC<Props> = ({
  isAuthenticated,
  redirectPath = "/",
  userUid = "invalid",
  children,
}) => {
  const firestore = useFirestore();
  const { status, data, error } = useFirestoreDocData(
    doc(firestore, "users", `${userUid}`),
  );

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  if (status === "loading") {
    return <Splash loading />;
  }

  if (error) {
    return <Splash message="Error connecting to the Firestore database" />;
  }

  if (data) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};
