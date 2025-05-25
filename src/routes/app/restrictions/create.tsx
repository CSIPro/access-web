import { Header } from "@/components/header/header";
import { PibleScanner } from "@/components/pible/pible-scanner";
import { RestrictionForm } from "@/components/restrictions/restriction-form";

export const CreateRestriction = () => {
  return (
    <div className="relative flex min-h-[100svh] w-full flex-col items-center gap-2">
      <Header title="Crear restricción" />
      <main className="flex size-full flex-col gap-2 p-2">
        <p className="text-center">
          Aquí puedes crear una nueva restricción de acceso
        </p>
        <hr className="w-full border-primary/70" />
        <RestrictionForm />
        <div className="h-64" />
      </main>
      {!!navigator.bluetooth && <PibleScanner />}
    </div>
  );
};
