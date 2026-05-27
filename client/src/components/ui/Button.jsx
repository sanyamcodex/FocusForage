import { cn } from "../../lib/utils";

const variants = {
  primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow",
  secondary: "bg-muted text-foreground hover:bg-muted/80",
  ghost: "hover:bg-muted text-foreground",
  outline: "border bg-card hover:bg-muted",
  danger: "bg-red-500 text-white hover:bg-red-600"
};

export function Button({ className, variant = "primary", size = "md", ...props }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition disabled:pointer-events-none disabled:opacity-50",
        size === "sm" && "h-9 px-3 text-sm",
        size === "md" && "h-11 px-4",
        size === "icon" && "h-10 w-10",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

