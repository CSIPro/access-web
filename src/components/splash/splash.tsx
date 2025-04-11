import { ReactNode } from "react";

import { Branding } from "../ui/branding";
import { LoadingSpinner } from "../ui/spinner";

interface Props {
  message?: string;
  loading?: boolean;
  children?: ReactNode;
}

export const Splash = ({ message, loading = false, children }: Props) => {
  return (
    <main className="relative flex h-[100svh] w-full flex-col items-center justify-end bg-muted pb-16 text-white">
      <img
        src="/images/access-logo.svg"
        alt="Logo de CSI PRO Access"
        className="absolute left-1/2 top-1/3 w-64 -translate-x-1/2 -translate-y-1/2"
      />
      <div className="flex w-full flex-col items-center justify-center gap-12">
        <div className="flex w-full flex-col items-center gap-2 px-4 md:w-2/3">
          {loading && <LoadingSpinner />}
          {message && <p className="text-center">{message}</p>}
          {children}
        </div>
        <Branding />
      </div>
    </main>
  );
};
