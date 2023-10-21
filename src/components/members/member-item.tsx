import { updateDoc } from "firebase/firestore";
import { FC, ReactNode } from "react";

import { useUserDataWithId, useUserRoleWithId } from "@/hooks/use-user-data";

import { Label } from "../ui/label";
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

  return (
    <li className="flex w-full items-center justify-between gap-2 rounded-md bg-primary p-4">
      <MemberName>{userData?.name}</MemberName>
      <MemberAccess
        uid={uid}
        access={userRoleData?.accessGranted ?? false}
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
    <p className="overflow-hidden text-ellipsis whitespace-nowrap text-xl font-bold text-white md:text-3xl">
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
    <div className="flex items-center gap-2 rounded-full bg-muted px-2 py-2">
      <Switch
        id={`${uid} access switch`}
        checked={access}
        onCheckedChange={setAccess}
      />
      <Label htmlFor={`${uid} access switch`} className="hidden sm:block">
        Access
      </Label>
    </div>
  );
};
