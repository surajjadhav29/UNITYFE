import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'md' | 'sm';

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 disabled:pointer-events-none';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-2 text-sm',
  secondary:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 px-3 py-1.5 text-sm',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 text-sm',
};

const sizes: Record<ButtonSize, string> = {
  md: '',
  sm: 'text-xs px-2.5 py-1.5',
};

type CommonButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className,
  children,
  ...props
}: CommonButtonProps) {
  return (
    <button
      type="button"
      className={cn(base, variants[variant], size === 'sm' ? sizes.sm : '', className)}
      {...props}
    >
      {children}
    </button>
  );
}

type CommonLinkButtonProps = {
  to: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  children: ReactNode;
};

export function LinkButton({
  to,
  variant = 'primary',
  size = 'md',
  className,
  children,
}: CommonLinkButtonProps) {
  return (
    <Link
      to={to}
      className={cn(base, variants[variant], size === 'sm' ? sizes.sm : '', className)}
    >
      {children}
    </Link>
  );
}
