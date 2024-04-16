import { FC, ReactNode } from "react";

import { cn } from "@/lib/utils";

const colors = {
  primary: "bg-primary-16 border-primary border-2",
  secondary: "bg-secondary-16 border-secondary border-2",
  tertiary: "bg-tertiary-16 border-tertiary border-2",
};

interface DashboardItemProps {
  color: keyof typeof colors;
  children: ReactNode;
}

export const DashboardItem: FC<DashboardItemProps> = ({ color, children }) => {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center rounded-md border-2 border-muted bg-muted-32 p-6",
        colors[color],
      )}
    >
      {children}
    </div>
  );
};

const sizes = {
  small: "text-2xl",
  medium: "text-4xl",
  large: "text-5xl",
};

interface DashboardItemDataProps {
  size?: keyof typeof sizes;
  children: ReactNode;
}

export const DashboardItemData: FC<DashboardItemDataProps> = ({
  size = "medium",
  children,
}) => {
  return (
    <span className={cn("text-4xl text-white", sizes[size])}>{children}</span>
  );
};

interface DashboardItemTitleProps {
  children: ReactNode;
}

export const DashboardItemTitle: FC<DashboardItemTitleProps> = ({
  children,
}) => {
  return <span className="text-lg text-white">{children}</span>;
};
