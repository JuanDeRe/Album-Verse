import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    fullWidth?: boolean;
}

export function Button({
                           children,
                           variant = 'primary',
                           fullWidth = false,
                           style,
                           ...props
                       }: ButtonProps) {
    const background =
        variant === 'primary'
            ? 'var(--color-primary)'
            : variant === 'danger'
                ? 'var(--color-danger)'
                : 'var(--color-surface)';

    const color = variant === 'secondary' ? 'var(--color-text)' : '#FFFFFF';
    const border = variant === 'secondary' ? '1px solid var(--color-border)' : 'none';

    return (
        <button
            {...props}
            style={{
                width: fullWidth ? '100%' : undefined,
                border,
                borderRadius: 12,
                background,
                color,
                padding: '12px 14px',
                fontWeight: 700,
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                opacity: props.disabled ? 0.55 : 1,
                ...style,
            }}
        >
            {children}
        </button>
    );
}