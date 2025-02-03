import { useNestRoomRequests } from "@/hooks/use-requests";
import { RequestItem } from "./request-item";
import { LoadingSpinner } from "../ui/spinner";

export const RequestsList = () => {
  const { status, data } = useNestRoomRequests();

  if (status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center gap-2">
        <LoadingSpinner />
        <p>Obteniendo solicitudes...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <p>No fue posible conectar con el servidor</p>
      </div>
    );
  }

  if (data?.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p>No hay solicitudes pendientes</p>
      </div>
    );
  }

  return (
    <ul className="flex w-full flex-col gap-1">
      {data?.map((req) => <RequestItem key={req.id} request={req} />)}
    </ul>
  );
};
