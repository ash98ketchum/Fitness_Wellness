import { cn } from '../../lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';

interface CardProps extends HTMLMotionProps<"div"> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <motion.div
      className={cn(
        'rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur-xl p-6 shadow-2xl',
        className
      )}
      {...props}
    />
  );
}
