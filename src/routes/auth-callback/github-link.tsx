import { GithubAuthProvider, getAuth, linkWithCredential } from "firebase/auth";
import { useMutation } from "react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { useFirebaseApp } from "reactfire";

import { Splash } from "@/components/splash/splash";

export const GithubLink = () => {
  const auth = getAuth(useFirebaseApp());
  const navigate = useNavigate();
  const params = useParams();
  const { status, mutate } = useMutation({
    mutationKey: "github-link",
    mutationFn: async () => {
      const serverUrl = `${
        import.meta.env.VITE_ACCESS_API_URL
      }/auth/oauth/callback/web?code=${params["code"]}`;

      try {
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
        await linkWithCredential(auth.currentUser!, credential);
      } catch (error) {
        console.error(error);
      } finally {
        navigate("/");
      }
    },
  });

  if (status === "idle" && !!params["code"]) {
    void mutate();
  } else if (!params["code"]) {
    return <Navigate to="/" replace />;
  }

  return <Splash loading message="Verificando..." />;
};
