import { forwardRef, ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Input, InputProps } from "./input";

interface Props extends InputProps {
  leading?: ReactNode;
  trailing?: ReactNode;
}

export const RichInput = forwardRef<HTMLInputElement, Props>(
  ({ leading, trailing, className, ...props }, ref) => {
    return (
      <div className="relative flex w-full items-center">
        {leading && (
          <div className="absolute left-0 top-0 flex size-8 items-center justify-center p-1">
            {leading}
          </div>
        )}
        <Input
          ref={ref}
          className={cn(leading && "pl-8", trailing && "pr-8", className)}
          {...props}
        />
        {trailing && (
          <div className="absolute right-0 top-0 flex size-8 items-center justify-center">
            {trailing}
          </div>
        )}
      </div>
    );
  },
);
RichInput.displayName = "RichInput";
