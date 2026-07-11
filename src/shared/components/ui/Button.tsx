import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

/* ========================================
   TYPES
   ======================================== */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'subtle' | 'outline' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
}

/* ========================================
   STYLES
   ======================================== */

const baseStyles = `
  inline-flex items-center justify-center gap-2
  font-medium transition-apple
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2
  disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none
  select-none
`;

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-sm rounded-lg',
    md: 'h-10 px-4 text-base rounded-xl',
    lg: 'h-12 px-6 text-lg rounded-xl',
};

/* Inline styles use CSS variables so they respond to theme changes */
const variantInlineStyles: Record<ButtonVariant, React.CSSProperties> = {
    primary: { background: 'var(--color-accent)', color: '#fff', border: 'none' },
    secondary: { background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' },
    ghost: { background: 'transparent', color: 'var(--color-text-secondary)', border: 'none' },
    subtle: { background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)', border: 'none' },
    outline: { background: 'transparent', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' },
    destructive: { background: 'var(--color-error-muted)', color: 'var(--color-error)', border: '1px solid var(--color-error-muted)' },
};

/* ========================================
   COMPONENT
   ======================================== */

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            variant = 'primary',
            size = 'md',
            loading = false,
            leftIcon,
            rightIcon,
            fullWidth = false,
            children,
            className = '',
            disabled,
            style,
            ...props
        },
        ref
    ) => {
        const combinedClassName = `
      ${baseStyles}
      ${sizeStyles[size]}
      ${fullWidth ? 'w-full' : ''}
      ${className}
    `.trim().replace(/\s+/g, ' ');

        return (
            <motion.button
                ref={ref}
                className={combinedClassName}
                style={{ ...variantInlineStyles[variant], ...style }}
                disabled={disabled || loading}
                whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
                whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
                transition={{
                    type: 'spring',
                    stiffness: 400,
                    damping: 25,
                    mass: 0.6,
                }}
                {...props}
            >
                {loading ? (
                    <LoadingSpinner size={size} />
                ) : (
                    <>
                        {leftIcon && <span className="inline-flex">{leftIcon}</span>}
                        {children}
                        {rightIcon && <span className="inline-flex">{rightIcon}</span>}
                    </>
                )}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';

/* ========================================
   LOADING SPINNER
   ======================================== */

const LoadingSpinner: React.FC<{ size: ButtonSize }> = ({ size }) => {
    const sizeMap = {
        sm: 14,
        md: 16,
        lg: 18,
    };

    const spinnerSize = sizeMap[size];

    return (
        <motion.svg
            width={spinnerSize}
            height={spinnerSize}
            viewBox="0 0 24 24"
            fill="none"
            animate={{ rotate: 360 }}
            transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'linear',
            }}
        >
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="60"
                strokeDashoffset="15"
                opacity="0.25"
            />
            <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="60"
                strokeDashoffset="45"
            />
        </motion.svg>
    );
};

/* ========================================
   USAGE EXAMPLES
   ======================================== */

/*
// Primary button
<Button variant="primary">
  Continue
</Button>

// Secondary with icon
<Button variant="secondary" leftIcon={<Icon />}>
  Back
</Button>

// Loading state
<Button variant="primary" loading>
  Processing...
</Button>

// Ghost button
<Button variant="ghost">
  Cancel
</Button>

// Full width
<Button variant="primary" fullWidth>
  Sign In
</Button>
*/
