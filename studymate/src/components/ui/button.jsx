import React from "react";
import { clsx } from "clsx";

const variants = {
  default: "bg-primary text-white hover:bg-primary/90",
  outline:
    "border border-border text-foreground hover:bg-muted hover:text-foreground",
  ghost: "hover:bg-muted",
};

const sizes = {
  default: "h-10 px-4",
  sm: "h-8 px-3 text-sm",
  lg: "h-12 px-6 text-lg",
  icon: "h-10 w-10",
};

export const Button = ({ variant = "default", size = "default", className, ...props }) => {
  return (
    <button
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
