import type { StickerStatus } from '../core/album/album.types';

interface StatusPillProps {
    status: StickerStatus;
}

export function StatusPill({ status }: StatusPillProps) {
    const isOwned = status === 'owned';

    const label = isOwned ? 'Tengo' : 'Falta';

    const background = isOwned
        ? 'var(--color-success-soft)'
        : 'var(--color-surface-alt)';

    const color = isOwned
        ? 'var(--color-success)'
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
``