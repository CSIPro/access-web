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
        {(role?.canManageAccess || role?.canManageRoles || isRoot) && (
          <NavigationMenuItem>
            <NavbarLink to="/app/members">Members</NavbarLink>
          </NavigationMenuItem>
        )}
        <NavigationMenuItem>
          <NavbarLink to="/app/passcode">Contraseña</NavbarLink>
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
