import { Header } from "@/components/header/header";
import { PibleScanner } from "@/components/pible/pible-scanner";

export const CreateRestriction = () => {
  return (
    <div className="relative flex min-h-[100svh] w-full flex-col items-center gap-2">
      <Header title="Crear restricción" />
      <main className="flex size-full flex-col gap-2 p-2">
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg bg-muted p-4">
          <h2 className="text-xl font-bold">Crear restricción</h2>
          <p className="text-center">
            Aquí puedes crear una nueva restricción para tu sala.
          </p>
        </div>
        <div className="h-64" />
        <PibleScanner />
      </main>
    </div>
  );
};
