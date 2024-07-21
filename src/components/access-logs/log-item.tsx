import { cva } from "class-variance-authority";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion, useTime, useTransform } from "framer-motion";
import { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";

const logVariants = cva(
  [
    "flex gap-8 justify-between items-center w-full px-4 py-2 rounded-lg border-2",
  ],
  {
    variants: {
      procedence: {
        known: "border-primary bg-primary/20 animate-flash-success",
        unknown: "border-accent bg-accent/20 animate-flash-unknown",
        wireless: "border-tertiary bg-tertiary/20 animate-flash-wireless",
        error: "border-secondary bg-secondary/20 animate-flash-error",
      },
    },
    defaultVariants: {
      procedence: "known",
    },
  },
);

interface Props {
  known?: boolean;
  accessed?: boolean;
  wireless?: boolean;
  birthday?: string;
  children: ReactNode;
}

export const LogItem: FC<Props> = ({
  known = false,
  accessed = false,
  wireless = false,
  birthday,
  children,
}) => {
  const procedence = known
    ? accessed
      ? wireless
        ? "wireless"
        : "known"
      : "error"
    : "unknown";

  const baseDate = new Date();
  const dateOfBirth = known ? new Date(birthday!) : null;

  const isBirthday = dateOfBirth
    ? dateOfBirth.getDate() === baseDate.getDate() &&
      dateOfBirth.getMonth() === baseDate.getMonth()
    : false;

  if (isBirthday) {
    return (
      <BirthdayLog className={logVariants({ procedence })}>
        {children}
      </BirthdayLog>
    );
  }

  return (
    <motion.div layout className={logVariants({ procedence })}>
      {children}
    </motion.div>
  );
};

interface BirthdayLogProps {
  className?: string;
  children: ReactNode;
}

const BirthdayLog: FC<BirthdayLogProps> = ({ children, className }) => {
  const time = useTime();
  const rotate = useTransform(time, [0, 6000], [0, 360], { clamp: false });

  return (
    <motion.div
      layout
      className={cn("relative flex h-20 overflow-hidden rounded-lg border-0")}
    >
      <motion.div
        style={{ rotate }}
        className="absolute -left-[50%] -right-[50%] -top-[50vw] aspect-square rounded-lg  bg-[linear-gradient(90deg,rgba(223,0,0,1)_0%,rgba(214,91,0,1)_15%,rgba(233,245,0,1)_30%,rgba(23,255,17,1)45%,rgba(29,255,255,1)_60%,rgba(5,17,255,1)_75%,rgba(202,0,253,1)_90%)] bg-center"
      ></motion.div>
      <div className="absolute inset-1.5 rounded-md bg-muted"></div>
      <div
        className={cn(
          className,
          "absolute inset-1.5 flex w-auto items-center justify-between gap-8 rounded-md border-0 px-4 py-2",
        )}
      >
        {children}
      </div>
    </motion.div>
  );
};

export const LogTitle: FC<{ children: ReactNode; failed?: boolean }> = ({
  children,
  failed = false,
}) => {
  return (
    <span
      className={cn(
        "overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-medium md:text-3xl",
        failed && "text-md md:text-md font-normal",
      )}
    >
      {children}
    </span>
  );
};

export const LogTimestamp: FC<{ timestamp: string }> = ({ timestamp }) => {
  const timestampDate = new Date(timestamp);

  return (
    <div className={cn("flex flex-col items-end text-sm")}>
      <p>{format(timestampDate, "HH:mm:ss", { locale: es })}</p>
      <p className="whitespace-nowrap">
        {format(timestampDate, "PPP", { locale: es })}
      </p>
    </div>
  );
};
