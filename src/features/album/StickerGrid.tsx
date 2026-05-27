import { useRef, useState } from 'react';
import type { AlbumSection, UserStickerMap } from '../../core/album/album.types';
import { StatusPill } from '../../components/StatusPill';
import { formatStickerLabel } from '../../data/albums/worldCup2026';

interface StickerGridProps {
    section: AlbumSection;
    stickers: UserStickerMap;
    onMarkOwned: (stickerId: string) => void;
    onRemoveOwned: (stickerId: string) => void;
    onAddDuplicate: (stickerId: string) => void;
    onRemoveDuplicate: (stickerId: string) => void;
}

export function StickerGrid({
                                section,
                                stickers,
                                onMarkOwned,
                                onRemoveOwned,
                                onAddDuplicate,
                                onRemoveDuplicate,
                            }: StickerGridProps) {
    const [revealedStickerId, setRevealedStickerId] = useState<string | null>(null);
    const longPressTimer = useRef<number | null>(null);

    function startLongPress(stickerId: string) {
        if (longPressTimer.current) {
            window.clearTimeout(longPressTimer.current);
        }

        longPressTimer.current = window.setTimeout(() => {
            setRevealedStickerId(stickerId);
        }, 550);
    }

    function cancelLongPress() {
        if (longPressTimer.current) {
            window.clearTimeout(longPressTimer.current);
            longPressTimer.current = null;
        }
    }

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 8,
            }}
        >
            {section.stickerIds.map((stickerId) => {
                const sticker = stickers[stickerId];
                if (!sticker) return null;

                const isOwned = sticker.status === 'owned';
                const isRevealed = revealedStickerId === stickerId;

                return (
                    <div
                        key={stickerId}
                        style={{
                            border: isOwned
                                ? '1.5px solid var(--mascot-primary)'
                                : '1px solid var(--color-border)',
                            borderRadius: 14,
                            padding: 8,
                            background: isOwned ? 'var(--mascot-soft)' : 'var(--color-surface)',
                            color: 'var(--color-text)',
                            minHeight: 104,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 8,
                        }}
                    >
                        <button
                            onClick={() => {
                                if (!isOwned) onMarkOwned(stickerId);
                            }}
                            onPointerDown={() => {
                                if (isOwned) startLongPress(stickerId);
                            }}
                            onPointerUp={cancelLongPress}
                            onPointerLeave={cancelLongPress}
                            onContextMenu={(event) => {
                                event.preventDefault();
                                if (isOwned) setRevealedStickerId(stickerId);
                            }}
                            style={{
                                border: 'none',
                                background: 'transparent',
                                color: 'var(--color-text)',
                                cursor: 'pointer',
                                padding: 0,
                                textAlign: 'left',
                                width: '100%',
                            }}
                        >
                            <strong style={{ display: 'block', fontSize: 18 }}>
                                {formatStickerLabel(stickerId)}
                            </strong>
                            <StatusPill status={sticker.status} />
                        </button>

                        {isOwned ? (
                            <>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '28px 1fr 28px',
                                        alignItems: 'center',
                                        gap: 4,
                                    }}
                                >
                                    <button
                                        onClick={() => onRemoveDuplicate(stickerId)}
                                        disabled={sticker.quantityDuplicate <= 0}
                                        style={{
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 8,
                                            background: 'var(--color-surface)',
                                            color: 'var(--color-text)',
                                            padding: '5px 0',
                                            fontWeight: 900,
                                            cursor: sticker.quantityDuplicate <= 0 ? 'not-allowed' : 'pointer',
                                            opacity: sticker.quantityDuplicate <= 0 ? 0.45 : 1,
                                        }}
                                    >
                                        -
                                    </button>

                                    <div
                                        style={{
                                            textAlign: 'center',
                                            fontSize: 11,
                                            fontWeight: 900,
                                            color: 'var(--color-text-muted)',
                                        }}
                                    >
                                        rep {sticker.quantityDuplicate}
                                    </div>

                                    <button
                                        onClick={() => onAddDuplicate(stickerId)}
                                        style={{
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 8,
                                            background: 'var(--color-surface)',
                                            color: 'var(--color-text)',
                                            padding: '5px 0',
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        +
                                    </button>
                                </div>

                                {isRevealed && (
                                    <button
                                        onClick={() => {
                                            onRemoveOwned(stickerId);
                                            setRevealedStickerId(null);
                                        }}
                                        style={{
                                            border: 'none',
                                            borderRadius: 10,
                                            background: 'var(--color-danger)',
                                            color: '#FFFFFF',
                                            padding: '7px 8px',
                                            fontSize: 12,
                                            fontWeight: 900,
                                            cursor: 'pointer',
                                        }}
                                    >
                                        Quitar
                                    </button>
                                )}
                            </>
                        ) : (
                            <div
                                style={{
                                    fontSize: 11,
                                    color: 'var(--color-text-muted)',
                                    fontWeight: 800,
                                }}
                            >
                                Tocar para agregar
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}