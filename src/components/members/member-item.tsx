import { updateDoc } from "firebase/firestore";
import { FC, ReactNode } from "react";

import { useUserDataWithId, useUserRoleWithId } from "@/hooks/use-user-data";
import { cn } from "@/lib/utils";

import { LoadingSpinner } from "../ui/spinner";
import { Switch } from "../ui/switch";

interface Props {
  uid?: string;
}

export const MemberItem: FC<Props> = ({ uid = "invalid" }) => {
  const { status: userStatus, data: userData } = useUserDataWithId(uid);
  const {
    status: userRoleStatus,
    doc: userRoleDoc,
    data: userRoleData,
  } = useUserRoleWithId(uid);

  const handleAccessChange = (access: boolean) => {
    if (!userRoleDoc) {
      return;
    }

    updateDoc(userRoleDoc, { accessGranted: access });
  };

  if (userStatus === "loading" || userRoleStatus === "loading") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <LoadingSpinner onBackground />
      </div>
    );
  }

  if (userStatus === "error" || userRoleStatus === "error") {
    return (
      <div className="flex h-full w-full items-center justify-center">
        Something went wrong
      </div>
    );
  }

  const hasAccess = userRoleData?.accessGranted ?? false;

  return (
    <li
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-sm border-2 border-primary bg-primary-32 p-2 transition-colors duration-300",
        !hasAccess && "border-secondary bg-secondary-32",
      )}
    >
      <MemberName>{userData?.name}</MemberName>
      <MemberAccess
        uid={uid}
        access={hasAccess}
        setAccess={handleAccessChange}
      />
    </li>
  );
};

const MemberName = ({ children }: { children: ReactNode }) => {
  if (!children) {
    return <p className="text-white">Unknown user</p>;
  }

  return (
    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-lg font-medium text-white md:text-3xl">
      {children}
    </p>
  );
};

interface MemberAccessProps {
  uid: string;
  access: boolean;
  setAccess: (access: boolean) => void;
}

const MemberAccess: FC<MemberAccessProps> = ({ uid, access, setAccess }) => {
  return (
    <Switch
      id={`${uid} access switch`}
      checked={access}
      onCheckedChange={setAccess}
      className="data-[state=unchecked]:bg-secondary"
    />
  );
};
