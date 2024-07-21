import { FC } from "react";

import { Member } from "@/hooks/use-room-members";

import { MemberItem } from "./member-item";

interface Props {
  members: Array<Member>;
}

export const MembersList: FC<Props> = ({ members }) => {
  return (
    <ul className="flex w-full flex-col gap-1">
      {members?.map((member) => <MemberItem key={member.id} member={member} />)}
    </ul>
  );
};
