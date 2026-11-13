import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { spring } from '../../lib/motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const styles: Record<Variant, string> = {
  primary:
    'bg-poppy text-paper border-[2.5px] border-ink shadow-[4px_4px_0_var(--color-ink)] hover:bg-poppy-deep active:shadow-[1px_1px_0_var(--color-ink)] disabled:border-ink/40 disabled:bg-blush disabled:text-ink disabled:shadow-none',
  secondary:
    'bg-paper text-ink border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] hover:bg-mint active:shadow-[1px_1px_0_var(--color-ink)] disabled:shadow-none disabled:opacity-50',
  ghost: 'text-ink-soft hover:text-ink hover:bg-pink/20',
  danger: 'bg-poppy-deep text-paper border-[2.5px] border-ink shadow-[3px_3px_0_var(--color-ink)] hover:bg-ink',
};

export type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: Variant;
  size?: 'md' | 'lg' | 'sm';
  icon?: ReactNode;
  children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', size = 'md', icon, children, className = '', type = 'button', ...rest },
  ref,
) {
  const sizes = { sm: 'h-9 px-3.5 text-sm gap-1.5', md: 'h-11 px-5 text-[0.95rem] gap-2', lg: 'h-14 px-7 text-base gap-2.5' };
  return (
    <motion.button
      ref={ref}
      type={type as ButtonHTMLAttributes<HTMLButtonElement>['type']}
      whileTap={rest.disabled ? undefined : { scale: 0.96 }}
      whileHover={rest.disabled ? undefined : { y: -2 }}
      transition={spring.press}
      className={`inline-flex select-none items-center justify-center rounded-full font-display font-normal tracking-[0.02em] transition-colors disabled:cursor-not-allowed ${sizes[size]} ${styles[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
});
