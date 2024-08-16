import {
  GithubAuthProvider,
  getAuth,
  signInWithCredential,
} from "firebase/auth";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFirebaseApp } from "reactfire";

import { Splash } from "@/components/splash/splash";

export const AuthCallback = () => {
  const auth = getAuth(useFirebaseApp());
  const navigate = useNavigate();

  const handleGitHubCallback = useCallback(
    async (code: string) => {
      try {
        const serverUrl = `${
          import.meta.env.VITE_ACCESS_API_URL as string
        }/auth/oauth/callback/web?code=${code}`;

        const res = await fetch(serverUrl, {
          method: "POST",
          headers: { Accept: "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message);
        }

        const token = data.accessToken as string;

        const credential = GithubAuthProvider.credential(token);
        await signInWithCredential(auth, credential);
      } catch (error) {
        console.error(error);
      } finally {
        navigate("/");
      }
    },
    [auth, navigate],
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      void handleGitHubCallback(code);
    }
  }, [handleGitHubCallback]);

  return <Splash loading message="Autenticando..." />;
};
