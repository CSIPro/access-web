import { IconContext } from "react-icons";
import { BsPersonFill } from "react-icons/bs";
import { useAuth, useUser } from "reactfire";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
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
    const callbackUrl = import.meta.env.VITE_GITHUB_CALLBACK_URL;

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
      <DialogContent className="w-4/5 rounded-sm">
        <DialogHeader>
          <DialogTitle>User profile</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-2">
          <IconContext.Provider value={{ className: "h-full w-full p-1" }}>
            <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full ring-2 ring-primary">
              {userData?.photoURL ? (
                <img src={userData?.photoURL} alt="User's profile picture" />
              ) : (
                <BsPersonFill />
              )}
            </span>
          </IconContext.Provider>
          <p>{userData?.displayName}</p>
          <Button
            onClick={handleLinkGithub}
            className="flex gap-2 bg-muted hover:bg-muted focus:bg-muted"
          >
            <img
              src="/images/auth/github-white.svg"
              alt="GitHub logo"
              className="aspect-square w-6"
            />
            Link with GitHub
          </Button>
          <Button variant="destructive" onClick={handleSignOut}>
            Sign out
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
