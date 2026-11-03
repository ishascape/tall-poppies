import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'motion/react';
import { spring } from '../../lib/motion';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const styles: Record<Variant, string> = {
  primary:
    'bg-poppy text-paper shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_18px_-8px_rgba(143,31,28,0.7)] hover:bg-poppy-deep disabled:bg-ink-faint/40 disabled:shadow-none',
  secondary: 'bg-paper text-ink ring-1 ring-line hover:ring-ink/30',
  ghost: 'text-ink-soft hover:text-ink hover:bg-ink/5',
  danger: 'bg-poppy-deep text-paper hover:bg-[#741815]',
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
      whileHover={rest.disabled ? undefined : { y: -1 }}
      transition={spring.press}
      className={`inline-flex select-none items-center justify-center rounded-full font-semibold tracking-[0.01em] transition-colors disabled:cursor-not-allowed ${sizes[size]} ${styles[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  );
});
