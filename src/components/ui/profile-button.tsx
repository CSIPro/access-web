import { IconContext } from "react-icons";
import { BsPersonFill } from "react-icons/bs";
import { useAuth, useUser } from "reactfire";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { LoadingSpinner } from "./spinner";

export const ProfileButton = () => {
  const auth = useAuth();
  const { status: userStatus, data: userData } = useUser();

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
    void auth.signOut();
  };

  if (userStatus === "loading") {
    return <LoadingSpinner />;
  }

  if (userStatus === "error") {
    return <span>Something went wrong while fetching user data</span>;
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
                <img src={userData.photoURL} alt="User's profile picture" />
              ) : (
                <BsPersonFill />
              )}
            </span>
          </span>
        </IconContext.Provider>
      </DialogTrigger>
      <DialogContent className="w-4/5 rounded-md border-muted bg-muted text-white ">
        <DialogHeader>
          <DialogTitle>User profile</DialogTitle>
        </DialogHeader>
        <hr />
        <DialogDescription asChild className="flex text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <IconContext.Provider
                value={{ className: "h-full w-full p-2 text-primary" }}
              >
                <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-2 ring-primary">
                  {userData?.photoURL ? (
                    <img
                      src={userData?.photoURL}
                      alt="User's profile picture"
                    />
                  ) : (
                    <BsPersonFill />
                  )}
                </span>
              </IconContext.Provider>
              <p>{userData?.displayName}</p>
            </div>
            <div className="flex items-center justify-center gap-2">
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
            {!hasGithub && (
              <Button
                onClick={handleLinkGithub}
                className="flex gap-2 bg-primary/50"
              >
                <img
                  src="/images/auth/github-white.svg"
                  alt="GitHub logo"
                  className="aspect-square w-6"
                />
                Link with GitHub
              </Button>
            )}
            <Button variant="destructive" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
