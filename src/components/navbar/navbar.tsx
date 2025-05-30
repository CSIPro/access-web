import { FC } from "react";
import { LinkProps, Link as RouterLink, useLocation } from "react-router-dom";

import { NestRole } from "@/hooks/use-roles";
import { cn } from "@/lib/utils";

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuViewport,
  navigationMenuTriggerStyle,
} from "../ui/navigation-menu";

interface Props {
  orientation?: "horizontal" | "vertical";
  isRoot?: boolean;
  role?: Partial<NestRole>;
}

export const Navbar: FC<Props> = ({
  role,
  isRoot = false,
  orientation = "horizontal",
}) => {
  const canSendNotifications = isRoot || (role?.level ?? 0) >= 50;

  return (
    <NavigationMenu orientation={orientation}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavbarLink to="/app">Inicio</NavbarLink>
        </NavigationMenuItem>
        {(role?.canReadLogs || isRoot) && (
          <NavigationMenuItem>
            <NavbarLink to="/app/logs">Access Logs</NavbarLink>
          </NavigationMenuItem>
        )}
        {(role?.canManageAccess || role?.canManageRoles || isRoot) && (
          <NavigationMenuItem>
            <NavbarLink to="/app/members">Miembros</NavbarLink>
          </NavigationMenuItem>
        )}
        {(role?.canHandleRequests || isRoot) && (
          <NavigationMenuItem>
            <NavbarLink to="/app/room-requests">Solicitudes</NavbarLink>
          </NavigationMenuItem>
        )}
        {(role?.canManageRoom || isRoot) && (
          <NavigationMenuItem>
            <NavbarLink to="/app/restrictions">Restricciones</NavbarLink>
          </NavigationMenuItem>
        )}
        <NavigationMenuItem>
          <NavbarLink to="/app/passcode">Contraseña</NavbarLink>
        </NavigationMenuItem>
        {canSendNotifications && (
          <NavigationMenuItem>
            <NavbarLink to="/app/notifications">Notificaciones</NavbarLink>
          </NavigationMenuItem>
        )}
      </NavigationMenuList>
      <NavigationMenuViewport />
    </NavigationMenu>
  );
};

export const NavbarLink: FC<LinkProps> = ({ to, className, ...props }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <NavigationMenuLink
      asChild={true}
      active={isActive}
      className={cn(
        navigationMenuTriggerStyle(),
        "bg-transparent hover:bg-primary hover:text-white active:text-muted data-[active]:bg-white data-[active]:font-bold data-[active]:text-muted lg:text-lg",
      )}
    >
      <RouterLink to={to} className={className} {...props}>
        {props.children}
      </RouterLink>
    </NavigationMenuLink>
  );
};
