import { useContext } from "react";

import { RoleContext } from "@/context/role-context";

import { MembersList } from "./members-list";
import { LoadingSpinner } from "../ui/spinner";

export const RoleList = () => {
  const { status, roles } = useContext(RoleContext);

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
        Something went wrong
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {roles?.map((role) => (
        <div key={role.id} className="flex w-full flex-col gap-2">
          <h2 className="w-full rounded-sm bg-primary p-2 text-center">
            {role.name}
          </h2>
          <MembersList roleId={role.id} />
        </div>
      ))}
    </div>
  );
};
