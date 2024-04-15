import { cn } from "@/lib/utils";

export const LoadingSpinner = ({
  onBackground = false,
  size = "normal",
}: {
  onBackground?: boolean;
  size?: "normal" | "small";
}) => {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-4 border-solid border-y-transparent",
        onBackground ? "border-x-primary" : "border-x-white",
        size === "small" ? "h-6 w-6" : "h-8 w-8",
      )}
    />
  );
};
