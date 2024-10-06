import { IoRefresh } from "react-icons/io5";

import { EventItem } from "@/components/events/event-item";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/spinner";
import { useEvents } from "@/hooks/use-events";

export const ArchivedEvents = () => {
  const { status, data, refetch } = useEvents({ past: true });

  if (status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner onBackground />
        <span>Cargando eventos pasados</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2">
        <span>Ocurrió un error al cargar los eventos</span>
        <Button size="icon" className="p-0 text-lg" onClick={() => refetch()}>
          <IoRefresh />
        </Button>
      </div>
    );
  }

  return (
    <section className="flex w-full flex-col items-center justify-start gap-2">
      {data?.map((event) => (
        <EventItem
          key={event.id}
          eventId={event.id}
          title={event.name}
          description={event.description}
          eventStart={event.eventStart}
          eventType={event.eventType}
          participants={event.participants ?? []}
        />
      ))}
    </section>
  );
};
