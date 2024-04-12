import { FC } from "react";
import { LinkProps, Link as RouterLink, useLocation } from "react-router-dom";
import { z } from "zod";

import { roleSchema } from "@/hooks/use-roles";
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
  role?: z.infer<typeof roleSchema>;
}

export const Navbar: FC<Props> = ({
  role,
  isRoot = false,
  orientation = "horizontal",
}) => {
  return (
    <NavigationMenu
      orientation={orientation}
      className={cn(
        "hidden bg-muted font-medium md:flex",
        orientation === "vertical" && "flex-col",
      )}
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavbarLink to="/app">Home</NavbarLink>
        </NavigationMenuItem>
        {(role?.canReadLogs || isRoot) && (
          <NavigationMenuItem>
            <NavbarLink to="/app/logs">Logs</NavbarLink>
          </NavigationMenuItem>
        )}
        {(role?.canGrantOrRevokeAccess || role?.canSetRoles || isRoot) && (
          <NavigationMenuItem>
            <NavbarLink to="/app/members">Members</NavbarLink>
          </NavigationMenuItem>
        )}
        <NavigationMenuItem>
          <NavbarLink to="/app/trackers">Trackers</NavbarLink>
        </NavigationMenuItem>
        {/* <NavigationMenuItem>
          <NavbarLink to="/">Access Logs</NavbarLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavbarLink to="/">Rooms</NavbarLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavbarLink to="/">User management</NavbarLink>
        </NavigationMenuItem> */}
        <NavigationMenuItem>
          <NavbarLink to="/app/qr-code">QR Code</NavbarLink>
        </NavigationMenuItem>
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
