import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const Card = ({ children, className }) => (
    <div className={cn('glass-card p-6', className)}>
        {children}
    </div>
);

export const Button = ({ children, className, variant = 'primary', ...props }) => (
    <button
        className={cn(
            variant === 'primary' ? 'btn-primary' : 'btn-secondary',
            className
        )}
        {...props}
    >
        {children}
    </button>
);

export const Badge = ({ children, type = 'neutral' }) => {
    const styles = {
        neutral: 'bg-gray-800 text-gray-300',
        success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
        danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    };

    return (
        <span className={cn('px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider', styles[type])}>
            {children}
        </span>
    );
};

export const Input = ({ className, ...props }) => (
    <input
        className={cn(
            'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all',
            className
        )}
        {...props}
    />
);
