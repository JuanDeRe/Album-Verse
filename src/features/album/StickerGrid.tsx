import { useRef, useState } from 'react';
import type { AlbumSection, Sticker, UserStickerMap } from '../../core/album/album.types';
import {StatusPill} from "../../components/StatusPill.tsx";
import {formatStickerLabel} from "../../data/albums/worldCup2026";

interface StickerGridProps {
    section: AlbumSection;
    stickers: UserStickerMap;
    stickerById: Record<string, Sticker>;
    onMarkOwned: (stickerId: string) => void;
    onRemoveOwned: (stickerId: string) => void;
    onAddDuplicate: (stickerId: string) => void;
    onRemoveDuplicate: (stickerId: string) => void;
}

export function StickerGrid({
                                section,
                                stickers,
                                stickerById,
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
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',                gap: 8,
            }}
        >
            {section.stickerIds.map((stickerId) => {
                const sticker = stickers[stickerId];
                if (!sticker) return null;

                const catalogSticker = stickerById[stickerId];
                const isOwned = sticker.status === 'owned';
                const isRevealed = revealedStickerId === stickerId;

                return (
                    <div
                        key={stickerId}
                        style={{
                            border: isOwned
                                ? '1.5px solid var(--color-primary)'
                                : '1px solid var(--color-border)',
                            borderRadius: 14,
                            padding: 8,
                            background: isOwned ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                            color: 'var(--color-text)',
                            minHeight: 112,
                            overflow: 'hidden',
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
                                minWidth: 0,
                            }}
                        >
                            <strong
                                style={{
                                    display: 'block',
                                    fontSize: 18,
                                    lineHeight: 1,
                                    marginBottom: 6,
                                }}
                            >
                                {formatStickerLabel(stickerId)}
                            </strong>
                            {catalogSticker?.name && (
                                <div
                                    style={{
                                        fontSize: 10,
                                        lineHeight: 1.15,
                                        color: 'var(--color-text-muted)',
                                        marginBottom: 6,
                                        minHeight: 24,
                                        overflow: 'hidden',
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                    }}
                                >
                                    {catalogSticker.name}
                                </div>
                            )}

                            <StatusPill status={sticker.status} />
                        </button>

                        {isOwned ? (
                            <>
                                <div
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: 5,
                                        minWidth: 0,
                                    }}
                                >
                                    <button
                                        onClick={() => onRemoveDuplicate(stickerId)}
                                        disabled={sticker.quantityDuplicate <= 0}
                                        aria-label={`Quitar repetida de ${stickerId}`}
                                        style={{
                                            width: 28,
                                            height: 28,
                                            flex: '0 0 28px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 9,
                                            background: 'var(--color-surface)',
                                            color: 'var(--color-text)',
                                            padding: 0,
                                            fontSize: 18,
                                            lineHeight: '26px',
                                            fontWeight: 900,
                                            cursor: sticker.quantityDuplicate <= 0 ? 'not-allowed' : 'pointer',
                                            opacity: sticker.quantityDuplicate <= 0 ? 0.45 : 1,
                                        }}
                                    >
                                        -
                                    </button>

                                    <div
                                        style={{
                                            minWidth: 34,
                                            flex: '0 1 42px',
                                            textAlign: 'center',
                                            fontSize: 11,
                                            lineHeight: 1.05,
                                            fontWeight: 900,
                                            color: 'var(--color-text-muted)',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <div>rep</div>
                                        <div>{sticker.quantityDuplicate}</div>
                                    </div>

                                    <button
                                        onClick={() => onAddDuplicate(stickerId)}
                                        aria-label={`Agregar repetida de ${stickerId}`}
                                        style={{
                                            width: 28,
                                            height: 28,
                                            flex: '0 0 28px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 9,
                                            background: 'var(--color-surface)',
                                            color: 'var(--color-text)',
                                            padding: 0,
                                            fontSize: 20,
                                            lineHeight: '26px',
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
                                            width: '100%',
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
                                    lineHeight: 1.15,
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