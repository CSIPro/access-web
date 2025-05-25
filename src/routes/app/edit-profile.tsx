import { Header } from "@/components/header/header";
import { PibleScanner } from "@/components/pible/pible-scanner";
import { EditProfileForm } from "@/components/profile/edit-profile-form";

export const EditProfilePage = () => {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-muted">
      <Header title="Editar Perfil" />
      <main className="flex h-full w-full flex-col items-center gap-2 p-2">
        <EditProfileForm />
        <div className="h-64" />
        {!!navigator.bluetooth && <PibleScanner />}
      </main>
    </div>
  );
};
