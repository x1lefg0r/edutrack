import { cn } from "@/shared/lib/cn";
import styles from "./card.module.css";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className, hoverable }: CardProps) {
  return (
    <div className={cn(styles.card, hoverable && styles.hoverable, className)}>
      {children}
    </div>
  );
}
