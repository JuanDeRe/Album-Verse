import type { StickerStatus } from '../core/album/album.types';

interface StatusPillProps {
    status: StickerStatus;
}

export function StatusPill({ status }: StatusPillProps) {
    const label =
        status === 'owned' ? 'Tengo' : status === 'missing' ? 'Falta' : 'Sin revisar';

    const background =
        status === 'owned'
            ? 'var(--color-success-soft)'
            : status === 'missing'
                ? 'var(--color-danger-soft)'
                : 'var(--color-surface-alt)';

    const color =
        status === 'owned'
            ? 'var(--color-success)'
            : status === 'missing'
                ? 'var(--color-danger)'
                : 'var(--color-text-muted)';

    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                borderRadius: 999,
                background,
                color,
                padding: '3px 8px',
                fontSize: 11,
                fontWeight: 800,
            }}
        >
      {label}
    </span>
    );
}