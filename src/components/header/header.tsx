import { FC } from "react";
import { BiMenu } from "react-icons/bi";
import { IoArrowBack } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "reactfire";

import { useUserContext } from "@/context/user-context";

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
  backTo?: string;
}

export const Header: FC<Props> = ({ title, backTo }) => {
  const navigate = useNavigate();
  const auth = useAuth();
  const { user, membership } = useUserContext();

  const handleBack = () => {
    if (!backTo) return;

    navigate(backTo);
  };

  const handleSignOut = () => {
    void auth.signOut();
  };

  return (
    <Sheet>
      <header className="sticky top-0 z-50 w-full border-b border-b-stone-700 bg-muted">
        <div className="container relative flex h-14 items-center gap-2">
          {backTo ? (
            <Button
              size="icon"
              onClick={handleBack}
              className="bg-primary text-2xl text-white hover:text-primary hover:brightness-110 focus:bg-white focus:text-primary active:bg-white active:text-primary md:hidden"
            >
              <IoArrowBack />
            </Button>
          ) : (
            <SheetTrigger asChild={true}>
              <Button
                size="icon"
                className="bg-primary text-2xl text-white hover:text-primary hover:brightness-110 focus:bg-white focus:text-primary active:bg-white active:text-primary md:hidden"
              >
                <BiMenu />
              </Button>
            </SheetTrigger>
          )}
          <Link to="/app" className="hidden items-center gap-2 md:flex">
            <img
              src="/images/access-logo.svg"
              alt="Logo de CSI PRO Access"
              width={24}
            />
            <BrandingHeader highlight="ACCESS">CSI PRO</BrandingHeader>
          </Link>
          <h1 className="text-center font-poppins md:hidden">{title}</h1>
          <div className="hidden md:inline-flex">
            <Navbar role={membership?.role} isRoot={user?.isRoot} />
          </div>
          <div className="block flex-grow" />
          <ProfileButton />
        </div>
      </header>
      <SheetPortal>
        <SheetContent side="left" className="border-r-0">
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
          <div className="flex h-3/4 flex-col gap-4 pl-8 pt-4 text-lg text-white">
            <Navbar
              orientation="vertical"
              role={membership?.role}
              isRoot={user?.isRoot}
            />
            <div className="flex-grow" />
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-fit bg-transparent text-white hover:bg-secondary hover:text-white focus:bg-secondary active:bg-secondary"
            >
              Cerrar sesión
            </Button>
            <span className="text-sm text-gray-500">{`${
              import.meta.env.VITE_APP_TITLE
            } v${APP_VERSION}`}</span>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
};
