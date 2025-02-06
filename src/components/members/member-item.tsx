import { FC, ReactNode, useState } from "react";
import { FaBirthdayCake } from "react-icons/fa";
import { IoLogIn, IoPerson } from "react-icons/io5";
import { MdBadge, MdGrade } from "react-icons/md";

import { useUserContext } from "@/context/user-context";
import { useNestRoles } from "@/hooks/use-roles";
import { Member, useMemberActions } from "@/hooks/use-room-members";
import { useNestUser } from "@/hooks/use-user-data";
import { cn, formatBirthday, formatUserName } from "@/lib/utils";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { LoadingSpinner } from "../ui/spinner";
import { Switch } from "../ui/switch";

interface Props {
  member: Member;
}

export const MemberItem: FC<Props> = ({ member }) => {
  const { user, membership } = useUserContext();

  const [dialogOpen, setDialogOpen] = useState(false);
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
  const canManageRoles =
    user!.isRoot ||
    (membership!.role.canManageRoles &&
      membership!.role.level! > member.role.level!);

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
  const memberData = memberQuery.data;

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
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
      </DialogTrigger>
      <DialogContent className="w-4/5 rounded-md border-muted bg-muted text-white ring-0">
        <DialogHeader>
          <DialogTitle>Detalles de usuario</DialogTitle>
        </DialogHeader>
        <hr />
        <DialogDescription
          asChild
          className="flex flex-col items-start gap-2 text-base text-white"
        >
          <div>
            <div className="flex w-full items-center gap-2">
              <IoPerson className="text-primary" />
              <span>
                {memberName} &#x2022; {memberData?.csiId}
              </span>
            </div>
            <div className="flex w-full items-center gap-2">
              <MdBadge className="text-primary" />
              <span>{memberData?.unisonId}</span>
            </div>
            {memberData ? (
              <div className="flex w-full items-center gap-2">
                <FaBirthdayCake className="text-primary" />
                <span>{formatBirthday(memberData?.dateOfBirth)}</span>
              </div>
            ) : null}
            <MemberRole
              canManageRoles={canManageRoles}
              userId={member.user.id!}
              roleId={member.role.id!}
            >
              {member.role.name}
            </MemberRole>
            <div
              className={cn(
                "flex w-full items-center gap-2",
                member.canAccess ? "text-primary" : "text-secondary",
              )}
            >
              <IoLogIn />
              <span>{member.canAccess ? "Autorizado" : "No autorizado"}</span>
            </div>
          </div>
        </DialogDescription>
        <DialogFooter className="w-full flex-row justify-end gap-2">
          {canManageRoles ? (
            <KickMemberButton
              userId={member.user.id!}
              userName={formatUserName(member.user!)}
            />
          ) : null}
          <Button variant="textPrimary" onClick={() => setDialogOpen(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
      onClick={(e) => e.stopPropagation()}
      disabled={disabled}
      className="data-[state=unchecked]:bg-secondary"
    />
  );
};

interface MemberRoleProps {
  canManageRoles?: boolean;
  roleId: string;
  userId: string;
  children: ReactNode;
}

const MemberRole: FC<MemberRoleProps> = ({
  canManageRoles = false,
  roleId,
  userId,
  children,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(roleId);

  const { data: roles } = useNestRoles();
  const { roleUpdate } = useMemberActions(userId);

  const handleClose = () => setDialogOpen(false);

  const handleSubmit = async () => {
    try {
      roleUpdate.mutate(selectedRole);
      handleClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex w-full items-center gap-2">
      <MdGrade className="text-primary" />
      <span className="pr-2">{children}</span>
      {canManageRoles ? (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="textPrimary" className="h-6 px-3 text-xs">
              Cambiar
            </Button>
          </DialogTrigger>
          <DialogContent className="w-4/5 rounded-md border-muted bg-muted text-white ring-0">
            <DialogHeader>
              <DialogTitle>Cambiar rol</DialogTitle>
            </DialogHeader>
            <hr />
            <DialogDescription
              asChild
              className="flex flex-col items-start gap-1 text-base font-bold text-white"
            >
              <ul>
                {roles?.map((role) => (
                  <li key={role.id} className="w-full">
                    <Button
                      variant="ghost"
                      onClick={() => setSelectedRole(role.id)}
                      className={cn(
                        "w-full text-left text-white",
                        selectedRole === role.id &&
                          "bg-primary/15 text-primary hover:bg-primary/15 hover:text-primary focus:bg-primary/15 focus:text-primary",
                      )}
                    >
                      {role.name}
                    </Button>
                  </li>
                ))}
              </ul>
            </DialogDescription>
            <hr />
            <DialogFooter className="w-full flex-row justify-end gap-2">
              <Button variant="textSecondary" onClick={handleClose}>
                Cancelar
              </Button>
              <Button variant="textPrimary" onClick={handleSubmit}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
};

interface KickMemberProps {
  userId: string;
  userName: string;
}

const KickMemberButton: FC<KickMemberProps> = ({ userId, userName }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { kickMember } = useMemberActions(userId);

  const handleKick = async () => {
    try {
      kickMember.mutate();
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="textSecondary">Expulsar</Button>
      </DialogTrigger>
      <DialogContent className="w-4/5 rounded-md border-muted bg-muted text-white ring-0">
        <DialogHeader>
          <DialogTitle>Expulsar miembro</DialogTitle>
        </DialogHeader>
        <hr />
        <DialogDescription className="flex flex-col items-start gap-1 text-base text-white">
          {`¿Estás seguro de que deseas expulsar a ${userName}?`}
        </DialogDescription>
        <DialogFooter className="w-full flex-row justify-end gap-2">
          <Button variant="textSecondary" onClick={handleKick}>
            Expulsar
          </Button>
          <Button variant="textPrimary" onClick={() => setDialogOpen(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
