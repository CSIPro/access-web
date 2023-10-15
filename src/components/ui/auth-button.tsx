import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { FC } from "react";
import toast from "react-hot-toast";
import { useAuth } from "reactfire";

import { Button, ButtonProps } from "./button";

interface Props extends ButtonProps {
  provider: "google" | "github";
}

export const AuthButton: FC<Props> = ({ provider, ...rest }) => {
  const auth = useAuth();

  const providers = {
    github: {
      name: "GitHub",
      icon: "/images/auth/github-dark.svg",
      onClick: () => {
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        const callbackUrl = import.meta.env.VITE_GITHUB_CALLBACK_URL;

        const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
          callbackUrl,
        )}&scope=user:email`;
        window.location.href = authUrl;
      },
    },
    google: {
      name: "Google",
      icon: "/images/auth/google-g.png",
      onClick: async () => {
        const google = new GoogleAuthProvider();

        const result = await signInWithPopup(auth, google);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (!credential) {
          toast.error("Unable to sign in with Google");
          return;
        }
      },
    },
  };

  return (
    <Button
      onClick={providers[provider].onClick}
      size="lg"
      className="text-md relative w-full rounded-full bg-white font-roboto text-slate-800 transition-all hover:bg-white hover:brightness-90 active:scale-[0.99] active:brightness-110 sm:text-lg"
      {...rest}
    >
      <img
        src={`${import.meta.env.BASE_URL}${providers[provider].icon}`}
        alt={`Logo de ${providers[provider].name}`}
        width={24}
        className="absolute left-4 top-1/2 -translate-y-1/2 transform"
      />
      {`Sign in with ${providers[provider].name}`}
    </Button>
  );
};
