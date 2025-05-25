import { ButtonHTMLAttributes, FC } from "react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

export const RestrictionDayButton: FC<Props> = ({
  children,
  isActive = false,
  onClick,
  className,
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "w-full bg-primary/40 text-white",
        isActive && "bg-primary",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
