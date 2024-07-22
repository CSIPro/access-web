import { useEffect } from "react";

import { Dashboard } from "@/components/dashboard/dashboard";
import { Header } from "@/components/header/header";
import { PibleScanner } from "@/components/pible/pible-scanner";
import { useUserContext } from "@/context/user-context";

export const AppIndex = () => {
  const { registerForNotifications } = useUserContext();

  useEffect(() => {
    const registerNotifications = async () => {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      registerForNotifications.mutate(registration);
    };

    registerNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Inicio" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <Dashboard />
        <div className="h-64" />
        {!!navigator.bluetooth && <PibleScanner />}
      </main>
    </div>
  );
};
