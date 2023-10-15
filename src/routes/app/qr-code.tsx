import { useUser } from "reactfire";

import { Header } from "@/components/header/header";
import { QRGenerator } from "@/components/qr-generator/qr-generator";
import { Splash } from "@/components/splash/splash";

export const QRCodePage = () => {
  const { status: userStatus, data: userData, error: userError } = useUser();

  if (userStatus === "loading") {
    return <Splash loading />;
  }

  if (userStatus === "error") {
    return <Splash message={userError?.message ?? "Something went wrong"} />;
  }

  if (!userData) {
    return <Splash message="You don't seem to be logged in" />;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center">
      <Header title="QR Code" />
      <div className="flex w-full flex-col items-center justify-center gap-2 p-4 sm:max-w-sm md:max-w-md lg:max-w-lg">
        <h1 className="text-center text-lg">
          Show your QR code on the scanner
        </h1>
        <div className="w-full p-6">
          <QRGenerator user={userData} />
        </div>
        <p className="text-center text-sm">
          Your code will regenerate every 20 seconds and it&apos;s only valid
          for up to 25 seconds
        </p>
      </div>
    </div>
  );
};
