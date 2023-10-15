import { FC } from "react";
import { BiMenu } from "react-icons/bi";
import { Link } from "react-router-dom";
import { useAuth } from "reactfire";

import { Navbar } from "../navbar/navbar";
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

  const handleSignOut = () => {
    void auth.signOut();
  };

  return (
    <Sheet>
      <header className="sticky top-0 z-50 w-full border-b bg-muted">
        <div className="container relative flex h-14 items-center gap-8">
          <SheetTrigger asChild={true}>
            <Button
              size="icon"
              className="bg-white text-2xl text-muted hover:bg-accent hover:text-white focus:bg-accent focus:text-white active:bg-primary active:text-white md:hidden"
            >
              <BiMenu />
            </Button>
          </SheetTrigger>
          <Link to="/app" className="hidden items-center gap-2 md:flex">
            <img
              src={`${import.meta.env.BASE_URL}/images/access-logo.svg`}
              alt="Logo de CSI PRO Access"
              width={24}
            />
            <span className="flex gap-1 whitespace-nowrap">
              CSI PRO{" "}
              <span className="bg-white px-1 font-bold text-muted">ACCESS</span>
            </span>
          </Link>
          <h1 className="text-center md:hidden">{title}</h1>
          <Navbar />
          <div className="block flex-grow" />
          <ProfileButton />
          {/* <Button
            onClick={handleSignOut}
            className="hidden bg-white text-muted hover:bg-destructive hover:text-white md:inline-flex"
          >
            Sign out
          </Button> */}
        </div>
      </header>
      <SheetPortal>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle asChild={true} className="pt-8">
              <Link to="/app" className="flex items-center gap-2">
                <img
                  src={`${import.meta.env.BASE_URL}/images/access-logo.svg`}
                  alt="Logo de CSI PRO Access"
                  width={24}
                />
                <span className="flex gap-1 whitespace-nowrap font-normal">
                  CSI PRO{" "}
                  <span className="bg-white px-1 font-bold text-muted">
                    ACCESS
                  </span>
                </span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="flex h-4/5 flex-col gap-4 pl-8 pt-4 text-lg text-white">
            <Link to="/app">Home</Link>
            {/* <Link to="/app/dashboard">Dashboard</Link> */}
            <Link to="/app/qr-code">QR Code</Link>
            <div className="flex-grow" />
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="w-fit bg-transparent text-white hover:bg-destructive hover:text-white"
            >
              Sign out
            </Button>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  );
};
