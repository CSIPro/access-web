import { DialogClose } from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { AtSign, Cake, Mail, User } from "lucide-react";
import { IconContext } from "react-icons";
import { Link } from "react-router-dom";
import { useAuth, useUser } from "reactfire";

import { useUserContext } from "@/context/user-context";
import { deleteAllFromStorage } from "@/lib/local-storage";
import { formatUserName } from "@/lib/utils";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { LoadingSpinner } from "./spinner";

export const ProfileButton = () => {
  const auth = useAuth();
  const { status: userStatus, data: userData } = useUser();
  const { user } = useUserContext();

  const handleLinkGithub = () => {
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const callbackUrl = `${
      import.meta.env.VITE_ACCESS_API_URL
    }/auth/oauth/callback/link`;

    const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      callbackUrl,
    )}&scope=user:email`;
    window.location.href = authUrl;
  };

  const handleSignOut = () => {
    deleteAllFromStorage();
    void auth.signOut();
  };

  if (userStatus === "loading") {
    return <LoadingSpinner />;
  }

  if (userStatus === "error") {
    return <span>Ocurrió un error al cargar los datos del usuario</span>;
  }

  const hasGoogle =
    userData?.providerData.some(
      (provider) => provider.providerId === "google.com",
    ) ?? false;
  const hasGithub =
    userData?.providerData.some(
      (provider) => provider.providerId === "github.com",
    ) ?? false;

  return (
    <Dialog>
      <DialogTrigger>
        <IconContext.Provider value={{ className: "p-1 h-full w-full" }}>
          <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full p-0 ring-2 ring-primary">
            <span className="h-full w-full">
              {userData?.photoURL ? (
                <img
                  src={userData.photoURL}
                  alt={`Foto de perfil de ${user ? formatUserName(user) : userData?.displayName}`}
                />
              ) : (
                <User className="text-primary" />
              )}
            </span>
          </span>
        </IconContext.Provider>
      </DialogTrigger>
      <DialogContent className="w-5/6 rounded-md border-muted bg-muted text-white ">
        <DialogHeader>
          <DialogTitle>Perfil de Usuario</DialogTitle>
        </DialogHeader>
        <hr />
        <DialogDescription asChild className="flex text-white">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full ring-2 ring-primary">
                {userData?.photoURL ? (
                  <img
                    src={userData?.photoURL}
                    alt={`Foto de perfil de ${user ? formatUserName(user) : userData?.displayName}`}
                  />
                ) : (
                  <User className="text-primary" />
                )}
              </span>
              <div className="flex flex-col justify-center gap-0.5">
                <h3 className="line-clamp-1 text-lg">
                  {user ? formatUserName(user) : userData?.displayName}
                </h3>
                {user && (
                  <span className="text-neutral-500">{user.unisonId}</span>
                )}
              </div>
            </div>
            {user && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <User className="text-primary" />
                  <span className="space-x-2">
                    <span>{user.csiId}</span>
                    <span>&#8226;</span>
                    <span className="text-neutral-500">CSI ID</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="text-primary" />
                  <span className="space-x-2">
                    <span>{userData?.email}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Cake className="text-primary" />
                  <span className="space-x-2">
                    <span>
                      {format(new Date(user.dateOfBirth), "dd 'de' MMMM")}
                    </span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <AtSign className="text-primary" />
                  {hasGoogle && (
                    <img
                      src="/images/auth/google-g.png"
                      alt="Google logo"
                      className="aspect-square w-6"
                    />
                  )}
                  {hasGithub && (
                    <img
                      src="/images/auth/github-white.svg"
                      alt="GitHub logo"
                      className="aspect-square w-6"
                    />
                  )}
                </div>
              </div>
            )}
            <DialogFooter className="flex-col gap-2">
              {!hasGithub && (
                <Button
                  variant="textPrimary"
                  onClick={handleLinkGithub}
                  className="flex gap-2"
                >
                  <img
                    src="/images/auth/github-white.svg"
                    alt="GitHub logo"
                    className="aspect-square w-6"
                  />
                  Vincular con GitHub
                </Button>
              )}
              <Button variant="textPrimary" asChild>
                <Link to="/app/edit-profile">Editar perfil</Link>
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="textSecondary">Cerrar sesión</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Cerrar sesión</DialogTitle>
                  </DialogHeader>
                  <DialogDescription>
                    <div className="flex flex-col gap-4">
                      <span className="text-center text-white">
                        ¿Estás seguro de que deseas cerrar sesión?
                      </span>
                    </div>
                  </DialogDescription>
                  <DialogFooter className="flex-row items-center gap-2">
                    <Button
                      variant="textSecondary"
                      onClick={handleSignOut}
                      className="basis-2/5"
                    >
                      Cerrar sesión
                    </Button>
                    <DialogClose asChild>
                      <Button variant="textPrimary" className="basis-3/5">
                        Cancelar
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </DialogFooter>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
