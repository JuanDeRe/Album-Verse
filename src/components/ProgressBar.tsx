interface ProgressBarProps {
    value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
    const safeValue = Math.max(0, Math.min(100, value));

    return (
        <div
            style={{
                height: 10,
                width: '100%',
                background: 'var(--color-border)',
                borderRadius: 999,
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    height: '100%',
                    width: `${safeValue}%`,
                    background: 'var(--color-primary)',
                    borderRadius: 999,
                    transition: 'width 180ms ease',
                }}
            />
        </div>
    );
}