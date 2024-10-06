import { FC, useEffect } from "react";
import {
  Link,
  LinkProps,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { Header } from "@/components/header/header";
import { BrandingHeader } from "@/components/ui/branding-header";
import { cn } from "@/lib/utils";

export const Events = () => {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();

  useEffect(() => {
    if (pathname === "/app/events") {
      navigate("/app/events/incoming");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Events" />
      <nav className="flex w-full items-center justify-between gap-2 border-b border-stone-700">
        <EventsNavItem to="/app/events/incoming">
          <BrandingHeader
            highlight="EVENTS"
            className="border-primary text-base"
          >
            INCOMING
          </BrandingHeader>
        </EventsNavItem>
        <EventsNavItem to="/app/events/archived">
          <BrandingHeader
            highlight="EVENTS"
            className="border-primary text-base"
          >
            Archived
          </BrandingHeader>
        </EventsNavItem>
      </nav>
      <main className="flex w-full flex-col items-stretch gap-2 p-2">
        <Outlet />
      </main>
    </div>
  );
};

export const EventsNavItem: FC<LinkProps> = ({ to, className, ...props }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "flex w-full items-center justify-center py-2 saturate-50",
        isActive && "border-b border-b-primary saturate-100",
      )}
      {...props}
    />
  );
};
