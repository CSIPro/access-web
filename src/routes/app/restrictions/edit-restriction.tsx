import { useParams } from "react-router-dom";

import { Header } from "@/components/header/header";
import { PibleScanner } from "@/components/pible/pible-scanner";

export const EditRestriction = () => {
  const { restrictionId } = useParams();

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Editar restricción" />
      <main className="flex h-full min-h-[100svh] w-full flex-col items-center gap-2 p-2">
        <div className="h-64" />
        {!!navigator.bluetooth && <PibleScanner />}
      </main>
    </div>
  );
};
