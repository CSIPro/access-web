import { format } from "date-fns";
import es from "date-fns/locale/es";
import { FC, useState } from "react";
import {
  IoCalendar,
  IoEllipsisHorizontal,
  IoLocation,
  IoPerson,
} from "react-icons/io5";
import { MdLocalPolice } from "react-icons/md";

import {
  PopulatedNestRequest,
  RequestStatusLabels,
  useNestRequestHelpers,
} from "@/hooks/use-requests";
import { cn, formatUserName } from "@/lib/utils";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Props {
  request: PopulatedNestRequest;
}

export const RequestItem: FC<Props> = ({ request }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { approveRequest, rejectRequest } = useNestRequestHelpers(request);

  const handleApprove = () => {
    approveRequest.mutate();
    setDialogOpen(false);
  };

  const handleReject = () => {
    rejectRequest.mutate();
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger>
        <li
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-sm border-2 p-2 transition-colors duration-300",
            request.status === "pending" && "border-accent bg-accent-32",
            request.status === "approved" && "border-primary bg-primary-32",
            request.status === "rejected" && "border-secondary bg-secondary-32",
          )}
        >
          <div className="flex flex-col items-start gap-1 text-start">
            <span className="line-clamp-1 overflow-ellipsis">
              {formatUserName(request.user)}
            </span>
            <span className="line-clamp-1 overflow-ellipsis">
              {request.room?.name ?? "Salón desconocido"}
            </span>
          </div>
          <div className="flex flex-col items-end gap-1 text-end">
            <span className="capitalize">
              {RequestStatusLabels[request.status]}
            </span>
            <span className="line-clamp-1 overflow-ellipsis">
              {format(new Date(request.createdAt), "PPp", { locale: es })}
            </span>
          </div>
        </li>
      </DialogTrigger>
      <DialogContent className="w-4/5 rounded-md border-muted bg-muted text-white ring-0">
        <DialogHeader>
          <DialogTitle>Detalles de la solicitud</DialogTitle>
        </DialogHeader>
        <hr />
        <DialogDescription
          asChild
          className="flex flex-col items-start gap-1 text-base text-white"
        >
          <div>
            <div className="flex w-full items-center gap-2">
              <IoPerson className="text-primary" />
              <span>{formatUserName(request.user)}</span>
            </div>
            <div className="flex w-full items-center gap-2">
              <IoLocation className="text-primary" />
              <span>{request.room.name}</span>
            </div>
            {!!request.admin && (
              <div className="flex w-full items-center gap-2">
                <MdLocalPolice className="text-primary" />
                <span>{formatUserName(request.admin)}</span>
              </div>
            )}
            <div className="flex w-full items-center gap-2">
              <IoEllipsisHorizontal className="text-primary" />
              <span className="capitalize">
                {RequestStatusLabels[request.status]}
              </span>
            </div>
            <div className="flex w-full items-center gap-2">
              <IoCalendar className="text-primary" />
              <span>
                {format(new Date(request.createdAt), "PPPp", { locale: es })}
              </span>
            </div>
          </div>
        </DialogDescription>
        {request.status === "pending" && (
          <DialogFooter className="w-full flex-row justify-end gap-2">
            <Button
              onClick={handleApprove}
              className="bg-primary/15 font-bold text-primary hover:text-white focus:text-white"
            >
              Aprobar
            </Button>
            <Button
              onClick={handleReject}
              variant="secondary"
              className="bg-secondary/15 font-bold text-secondary hover:text-white focus:text-white"
            >
              Rechazar
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};
