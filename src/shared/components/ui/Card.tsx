
"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

/* ========================================
   TYPES
   ======================================== */

export type CardVariant = 'elevated' | 'glass' | 'outlined' | 'flat';

export interface CardProps extends HTMLMotionProps<'div'> {
    variant?: CardVariant;
    hoverable?: boolean;
    padding?: 'none' | 'sm' | 'md' | 'lg';
}

/* ========================================
   STYLES
   ======================================== */

const baseStyles = `
  rounded-2xl
  transition-apple
`;

/* Inline styles use CSS variables so they respond to theme changes */
const variantInlineStyles: Record<CardVariant, React.CSSProperties> = {
    elevated: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)' },
    glass: { background: 'var(--color-surface-glass)', border: '1px solid var(--color-accent-muted)', backdropFilter: 'blur(20px)' },
    outlined: { background: 'var(--color-bg-card)', border: '1px solid var(--color-border)' },
    flat: { background: 'var(--color-bg-elevated)' },
};

const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
};

/* ========================================
   COMPONENT
   ======================================== */

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    (
        {
            variant = 'elevated',
            hoverable = false,
            padding = 'md',
            children,
            className = '',
            style,
            ...props
        },
        ref
    ) => {
        const combinedClassName = `
      ${baseStyles}
      ${paddingStyles[padding]}
      ${className}
    `.trim().replace(/\s+/g, ' ');

        const hoverAnimation = hoverable
            ? {
                whileHover: { y: -4, scale: 1.01 },
                transition: {
                    type: 'spring' as const,
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                },
            }
            : {};

        return (
            <motion.div
                ref={ref}
                className={combinedClassName}
                style={{ ...variantInlineStyles[variant], ...style }}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.22,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                {...hoverAnimation}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = 'Card';

/* ========================================
   SUB-COMPONENTS
   ======================================== */

export const CardHeader: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => (
    <div
        className={`mb-4 pb-4 border-b ${className}`}
        style={{ borderColor: 'var(--color-border-subtle)' }}
    >
        {children}
    </div>
);

export const CardTitle: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => (
    <h3
        className={`text-xl font-semibold mb-1 ${className}`}
        style={{ fontFamily: 'Syne, sans-serif', color: 'var(--color-text-primary)' }}
    >
        {children}
    </h3>
);

export const CardDescription: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => (
    <p className={`text-sm ${className}`} style={{ color: 'var(--color-text-muted)' }}>{children}</p>
);

export const CardContent: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => (
    <div className={className}>{children}</div>
);

export const CardFooter: React.FC<{
    children: React.ReactNode;
    className?: string;
}> = ({ children, className = '' }) => (
    <div className={`mt-6 flex items-center gap-3 ${className}`}>{children}</div>
);

/* ========================================
   USAGE EXAMPLES
   ======================================== */

/*
// Basic elevated card
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content...</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Glass card with hover
<Card variant="glass" hoverable>
  <p>Hoverable glass card</p>
</Card>

// Outlined card with custom padding
<Card variant="outlined" padding="lg">
  <p>Large padding card</p>
</Card>
*/
