import { cn } from "@/shared/lib/cn";
import styles from "./skeleton.module.css";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className, width, height }: SkeletonProps) {
  return (
    <div className={cn(styles.skeleton, className)} style={{ width, height }} />
  );
}
