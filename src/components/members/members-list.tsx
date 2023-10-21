import { FC } from "react";

import { useRoomMembersByRole } from "@/hooks/use-room-members";

import { MemberItem } from "./member-item";
import { LoadingSpinner } from "../ui/spinner";

interface Props {
  roleId: string;
}

export const MembersList: FC<Props> = ({ roleId }) => {
  const { status, data } = useRoomMembersByRole(roleId);

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

  const members = data?.docs.map((member) => member.ref.parent.parent?.id);

  return (
    <ul className="flex w-full flex-col gap-2">
      {members?.map((uid) => <MemberItem key={uid} uid={uid} />)}
    </ul>
  );
};
