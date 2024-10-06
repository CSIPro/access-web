import { format } from "date-fns";
import { es } from "date-fns/locale";
import { FC, ReactNode } from "react";
import { IoPerson } from "react-icons/io5";
import { Link } from "react-router-dom";

import { EventTypes, eventTypesLabels } from "@/hooks/use-events";
import { cn } from "@/lib/utils";

interface EventItemProps {
  eventId: string;
  children?: ReactNode;
  className?: string;
  title: string;
  description?: string | null;
  eventStart: string;
  eventType: EventTypes;
  participants: string[];
}

export const EventItem: FC<EventItemProps> = ({
  eventId,
  className,
  eventStart,
  eventType,
  participants,
  title,
  description,
}) => {
  const eventDate = new Date(eventStart);

  const formattedDate = format(eventDate, "MMM dd yyyy'-'p", {
    locale: es,
  }).split("-");

  const participantsList = (
    <ul>
      {participants.length > 0 ? (
        <>
          {participants.slice(0, 2).map((p) => (
            <Participant key={p} name={p} />
          ))}
          {participants.length > 2 && (
            <li className="flex items-center justify-start gap-2">
              <IoPerson className="text-primary" />
              <span>{`y ${participants.length - 2} más`}</span>
            </li>
          )}
        </>
      ) : (
        <li>No hay participantes</li>
      )}
    </ul>
  );

  return (
    <Link
      to={`/app/events/${eventId}`}
      className={cn(
        "relative flex w-full flex-col gap-2 overflow-hidden rounded-md border-2 border-primary bg-primary/20 p-2 pb-10",
        className,
      )}
    >
      <h2 className="line-clamp-2 text-lg font-medium">{title}</h2>
      <div className="flex items-center justify-between rounded bg-primary px-1 text-lg font-medium uppercase">
        <span>{formattedDate[0]}</span>
        <span>{formattedDate[1]}</span>
      </div>
      {participantsList}
      <p className="line-clamp-2">{description}</p>
      <span className="absolute bottom-0 right-0 rounded-tl-md bg-primary px-2 font-medium uppercase">
        {eventTypesLabels[eventType]}
      </span>
    </Link>
  );
};

const Participant = ({ name }: { name: string }) => {
  return (
    <li className="flex items-center justify-start gap-2">
      <IoPerson className="text-primary" />
      <span>{name}</span>
    </li>
  );
};
