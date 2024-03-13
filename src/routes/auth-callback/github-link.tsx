import axios from "axios";
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
      }/api/auth/oauth/callback/web?code=${params["code"]}`;

      try {
        const response = await axios.post(
          serverUrl,
          {},
          { headers: { Accept: "application/json" } },
        );

        console.log(response.status);
        if (response.status === 200) {
          const token = response.data.accessToken as string;
          console.log(token);

          const credential = GithubAuthProvider.credential(token);
          await linkWithCredential(auth.currentUser!, credential);
        }
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

  return <Splash loading message="Verifying..." />;
};
