import { useNestMembersByRole } from "@/hooks/use-room-members";

import { MembersList } from "./members-list";
import { LoadingSpinner } from "../ui/spinner";

export const RoleList = () => {
  const { status, data } = useNestMembersByRole();

  if (status === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner onBackground />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        No fue posible conectar con el servidor
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {data?.map((role) => (
        <div key={role.key} className="flex w-full flex-col gap-2">
          <h2 className="w-full rounded-sm bg-primary p-2 text-center">
            {role.title}
          </h2>
          <MembersList members={role.data} />
        </div>
      ))}
    </div>
  );
};
