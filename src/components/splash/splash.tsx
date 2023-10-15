import { Branding } from "../ui/branding";
import { LoadingSpinner } from "../ui/spinner";

interface Props {
  message?: string;
  loading?: boolean;
}

export const Splash = ({ message, loading = false }: Props) => {
  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-center gap-16 bg-primary text-white">
      <img
        src="/images/access-logo.svg"
        alt="Logo de CSI PRO Access"
        className="w-64"
      />
      <div className="flex w-full flex-col items-center gap-2 md:w-2/3">
        {loading && <LoadingSpinner />}
        {message && <p className="w-2/3 text-center">{message}</p>}
      </div>
      <Branding />
    </main>
  );
};
