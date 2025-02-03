import { FC, ReactNode, useState } from "react";

import { useUserContext } from "@/context/user-context";
import { Member, useMemberActions } from "@/hooks/use-room-members";
import { useNestUser } from "@/hooks/use-user-data";
import { cn, formatUserName } from "@/lib/utils";

import { LoadingSpinner } from "../ui/spinner";
import { Switch } from "../ui/switch";

interface Props {
  member: Member;
}

export const MemberItem: FC<Props> = ({ member }) => {
  const { user, membership } = useUserContext();

  const [localAccess, setLocalAccess] = useState(member.canAccess);

  const memberQuery = useNestUser(member.user.id);
  const { accessUpdate } = useMemberActions(member.user.id!);

  if (memberQuery.status === "loading") {
    return (
      <li className="flex w-full items-center justify-center gap-2 p-2">
        <LoadingSpinner />
      </li>
    );
  }

  if (memberQuery.status === "error") {
    return (
      <li className="flex w-full items-center justify-center gap-2 p-2">
        <p>Error al cargar el usuario</p>
      </li>
    );
  }

  const canSetAccess =
    user!.isRoot ||
    (membership!.role.canManageAccess &&
      membership!.role.level! > member.role.level!);
  // const canManageRoles =
  //   user!.isRoot ||
  //   (membership!.role.canManageRoles &&
  //     membership!.role.level! > member.role.level!);

  const handleUpdateAccess = async (value: boolean) => {
    if (!canSetAccess) return;

    try {
      setLocalAccess(value);
      accessUpdate.mutate(value);
    } catch (error) {
      setLocalAccess(!value);
      console.error(error);
    }
  };

  const memberName = formatUserName(member.user);

  return (
    <li
      className={cn(
        "flex w-full items-center justify-between gap-2 rounded-sm border-2 border-primary bg-primary-32 p-2 transition-colors duration-300",
        !localAccess && "border-secondary bg-secondary-32",
      )}
    >
      <MemberName>{memberName}</MemberName>
      <MemberAccess
        accessGranted={localAccess}
        setAccess={handleUpdateAccess}
        disabled={!canSetAccess}
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
  accessGranted?: boolean;
  setAccess: (value: boolean) => void;
  disabled?: boolean;
}

const MemberAccess: FC<MemberAccessProps> = ({
  accessGranted,
  setAccess,
  disabled,
}) => {
  return (
    <Switch
      checked={accessGranted}
      onCheckedChange={disabled ? () => {} : setAccess}
      disabled={disabled}
      className="data-[state=unchecked]:bg-secondary"
    />
  );
};
