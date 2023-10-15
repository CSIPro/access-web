import { FC, ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Branding: FC<ImgHTMLAttributes<HTMLImageElement>> = ({
  className,
  ...props
}) => {
  return (
    <img
      src={`${import.meta.env.BASE_URL}/images/csipro.svg`}
      alt="Logo de CSI PRO"
      height={40}
      width={40}
      className={cn(
        "absolute bottom-16 left-1/2 -translate-x-1/2 transform sm:bottom-6",
        className,
      )}
      {...props}
    />
  );
};
