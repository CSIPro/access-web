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
        "w-full bg-primary/40 text-white hover:bg-primary/50 focus:bg-primary/50 active:bg-primary/50",
        isActive &&
          "bg-primary text-white hover:bg-primary/70 focus:bg-primary/70 active:bg-primary/70",
        className,
      )}
      {...props}
    >
      {children}
    </Button>
  );
};
