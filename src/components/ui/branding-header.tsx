import { FC, HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const sizes = {
  small: "text-base",
  normal: "text-3xl",
  large: "text-5xl",
};

interface Props {
  children: ReactNode;
  className?: HTMLAttributes<HTMLDivElement>["className"];
  highlight: string;
  highlightClassName?: HTMLAttributes<HTMLDivElement>["className"];
  size?: keyof typeof sizes;
}

export const BrandingHeader: FC<Props> = ({
  children,
  className,
  highlight,
  highlightClassName,
  size = "normal",
}) => {
  return (
    <span
      className={cn(
        "flex items-center justify-center gap-1 font-sans font-normal uppercase",
        sizes[size],
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "rounded-sm bg-primary px-1 font-medium text-white",
          highlightClassName,
        )}
      >
        {highlight}
      </span>
    </span>
  );
};
