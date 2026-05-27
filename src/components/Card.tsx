import type { CSSProperties, ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    style?: CSSProperties;
}

export function Card({ children, style }: CardProps) {
    return (
        <div
            style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text)',
                border: '1px solid var(--color-border)',
                borderRadius: 18,
                padding: 16,
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
                ...style,
            }}
        >
            {children}
        </div>
    );
}