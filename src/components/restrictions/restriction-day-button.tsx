import { FC, HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

interface Props extends HTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export const RestrictionDayButton: FC<Props> = ({
  children,
  isActive = false,
  onClick,
  className,
}) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "w-full bg-primary/40 text-white",
        isActive && "bg-primary",
        className,
      )}
    >
      {children}
    </Button>
  );
};
