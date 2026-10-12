import type { ReactNode } from "react";
import { cn } from "@/core/utils/cn";

interface ContainerProps {  
  className?: string;
  children?: ReactNode;
}

export function Container({ className, children }: ContainerProps) {
  return <div className={cn("container-page", className)}>{children}</div>;
}
