import { FC, ReactNode } from "react";
import { IconContext } from "react-icons";

import { cn } from "@/lib/utils";

const colors = {
  primary: "bg-primary/20 border-primary border-2 text-primary/80",
  secondary: "bg-secondary/20 border-secondary border-2 text-secondary/80",
  tertiary: "bg-tertiary/20 border-tertiary border-2 text-tertiary/80",
};

interface DashboardItemProps {
  color: keyof typeof colors;
  children: ReactNode;
}

export const DashboardItem: FC<DashboardItemProps> = ({ color, children }) => {
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-md border-2 border-muted bg-muted/30 p-6",
        colors[color],
      )}
    >
      {children}
    </div>
  );
};

const iconSizes = {
  small: "4rem",
  normal: "5rem",
  large: "10rem",
};

interface ItemBackgroundProps {
  children: ReactNode;
  iconSize?: keyof typeof iconSizes;
}

export const DashboardItemBackground: FC<ItemBackgroundProps> = ({
  children,
  iconSize = "normal",
}) => {
  return (
    <IconContext.Provider value={{ size: iconSizes[iconSize] }}>
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </IconContext.Provider>
  );
};

const sizes = {
  small: "text-2xl",
  medium: "text-4xl",
  large: "text-7xl",
};

interface DashboardItemDataProps {
  size?: keyof typeof sizes;
  children: ReactNode;
}

export const DashboardItemData: FC<DashboardItemDataProps> = ({
  size = "medium",
  children,
}) => {
  return <span className={cn("z-10 text-white", sizes[size])}>{children}</span>;
};

interface DashboardItemTitleProps {
  children: ReactNode;
}

export const DashboardItemTitle: FC<DashboardItemTitleProps> = ({
  children,
}) => {
  return <span className="z-10 text-lg text-gray-200">{children}</span>;
};
