interface EmptyStateProps {
    icon?: string;
    title: string;
    description?: string;
}

export function EmptyState({ icon = '📭', title, description }: EmptyStateProps) {
    return (
        <div
            style={{
                padding: 24,
                textAlign: 'center',
                color: 'var(--color-text-muted)',
            }}
        >
            <div style={{ fontSize: 38 }}>{icon}</div>
            <strong style={{ display: 'block', marginTop: 8, color: 'var(--color-text)' }}>
                {title}
            </strong>
            {description && <p style={{ margin: '6px 0 0', lineHeight: 1.4 }}>{description}</p>}
        </div>
    );
}