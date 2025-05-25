import { useParams } from "react-router-dom";

import { Header } from "@/components/header/header";
import { PibleScanner } from "@/components/pible/pible-scanner";
import { RestrictionForm } from "@/components/restrictions/restriction-form";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useRestriction } from "@/hooks/use-restrictions";

export const EditRestriction = () => {
  const { restrictionId } = useParams();

  const restriction = useRestriction(restrictionId!);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Editar restricción" />
      <main className="flex h-full min-h-[100svh] w-full flex-col items-center gap-2 p-2">
        {restriction.isLoading && <LoadingSpinner />}
        {restriction.isError && (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-white">No fue posible obtener la restricción</p>
          </div>
        )}
        {restriction.isSuccess && (
          <RestrictionForm restriction={restriction.data} />
        )}
        <div className="h-64" />
        {!!navigator.bluetooth && <PibleScanner />}
      </main>
    </div>
  );
};
