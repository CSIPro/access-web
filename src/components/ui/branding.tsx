import { FC, ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export const Branding: FC<ImgHTMLAttributes<HTMLImageElement>> = ({
  className,
  ...props
}) => {
  return (
    <div className="flex items-center justify-center gap-2 rounded-full border-2 border-primary bg-primary/20 px-4 py-1 font-poppins text-sm">
      <span>from</span>
      <img
        src="/images/csipro.svg"
        alt="Logo de CSI PRO"
        className={cn("w-6", className)}
        {...props}
      />
      <span>CSI PRO</span>
    </div>
  );
};
