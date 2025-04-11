import { Link } from "react-router-dom";

import { useRoomRestrictions } from "@/hooks/use-restrictions";

import { AddRestriction } from "./add-restriction";
import { RestrictionItem } from "./restriction-item";
import { LoadingSpinner } from "../ui/spinner";

export const RestrictionsList = () => {
  const restrictions = useRoomRestrictions();

  if (restrictions.isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center gap-2">
        <LoadingSpinner />
        <p>Cargando restricciones...</p>
      </div>
    );
  }

  if (restrictions.isError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>Ocurrió un error al obtener las restricciones</p>
      </div>
    );
  }

  if (restrictions.data?.length === 0) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
        <p>No hay restricciones activas</p>
        <Link
          to="/app/restrictions/create"
          className="rounded bg-primary/10 px-4 py-2 text-primary transition-all hover:brightness-110 active:brightness-95"
        >
          Crea una
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex w-full flex-col gap-2">
      <AddRestriction />
      {restrictions.data?.map((restriction) => (
        <li key={restriction.id} className="w-full">
          <RestrictionItem restriction={restriction} />
        </li>
      ))}
    </ul>
  );
};
