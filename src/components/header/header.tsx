import { FC, useContext } from "react";
import { BiMenu } from "react-icons/bi";
import { Link } from "react-router-dom";
import { useAuth } from "reactfire";

import { RoleContext } from "@/context/role-context";
import { UserContext } from "@/context/user-context";
import { findRole } from "@/lib/utils";

import { Navbar } from "../navbar/navbar";
import { BrandingHeader } from "../ui/branding-header";
import { Button } from "../ui/button";
import { ProfileButton } from "../ui/profile-button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface Props {
  title: string;
}

export const Header: FC<Props> = ({ title }) => {
  const auth = useAuth();
  const userCtx = useContext(UserContext);
  const roleCtx = useContext(RoleContext);

  const handleSignOut = () => {
    void auth.signOut();
  };

  const role = findRole(userCtx.user?.role, roleCtx.roles);
  const isRoot = userCtx.user?.isRoot;

  return (
    <Sheet>
      <header className="sticky top-0 z-50 w-full border-b border-b-stone-700 bg-muted">
        <div className="container relative flex h-14 items-center gap-2">
          <SheetTrigger asChild={true}>
            <Button
              size="icon"
              className="bg-primary text-2xl text-white hover:text-primary hover:brightness-110 focus:bg-white focus:text-primary active:bg-white active:text-primary md:hidden"
            >
              <BiMenu />
            </Button>
          </SheetTrigger>
          <Link to="/app" className="hidden items-center gap-2 md:flex">
            <img
              src="/images/access-logo.svg"
              alt="Logo de CSI PRO Access"
              width={24}
            />
            <BrandingHeader highlight="ACCESS">CSI PRO</BrandingHeader>
          </Link>
          <h1 className="text-center md:hidden">{title}</h1>
          <Navbar role={role} isRoot={isRoot} />
          <div className="block flex-grow" />
          <ProfileButton />
        </div>
      </header>
      <SheetPortal>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle asChild={true} className="pt-8">
              <Link to="/app" className="flex items-center gap-2">
                <img
                  src="/images/access-logo.svg"
                  alt="Logo de CSI PRO Access"
                  width={24}
                />
                <BrandingHeader highlight="ACCESS" size="small">
                  CSI PRO
                </BrandingHeader>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 pl-8 pt-4 text-lg text-white">
            <Link to="/app">Home</Link>
            {/* <Link to="/app/dashboard">Dashboard</Link> */}
            <Link to="/app/logs">Access Logs</Link>
            {/* {(role?.canReadLogs || isRoot) && (
              <Link to="/app/qr-code">QR Code</Link>
            )} */}
            {(role?.canGrantOrRevokeAccess || role?.canSetRoles || isRoot) && (
              <Link to="/app/members">Room Members</Link>
            )}
          </div>
          <div className="py-2"></div>
          <SheetHeader>
            <SheetTitle asChild={true} className="pt-8">
              <span className="flex items-center gap-2">
                <img
                  src="/images/access-logo.svg"
                  alt="Logo de CSI PRO Access"
                  width={24}
                />
                <BrandingHeader highlight="TRACKER" size="small">
                  CSI PRO
                </BrandingHeader>
              </span>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-4 pl-8 pt-4 text-lg text-white">
            <Link to="/app/tracker">Trackers</Link>
            <div className="flex-grow" />
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-fit bg-transparent text-white hover:bg-secondary hover:text-white focus:bg-secondary active:bg-secondary"
            >
              Sign out
            </Button>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
};
