import type { Album, Sticker, UserStickerMap } from '../../core/album/album.types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { useMemo, useState } from 'react';

interface SwapsScreenProps {
    album: Album;
    stickers: UserStickerMap;
    stickerById: Record<string, Sticker>;
    onAddDuplicate: (stickerId: string) => void;
    onRemoveDuplicate: (stickerId: string) => void;
}

function buildGroupedList(
    album: Album,
    _stickers: UserStickerMap,
    predicate: (stickerId: string) => boolean,
    formatLine: (stickerId: string) => string,
) {
    const lines: string[] = [];

    for (const section of album.sections) {
        const sectionStickerIds = section.stickerIds.filter(predicate);

        if (sectionStickerIds.length === 0) continue;

        lines.push(`${section.flag ?? ''} ${section.name}`.trim());

        for (const stickerId of sectionStickerIds) {
            lines.push(`  - ${formatLine(stickerId)}`);
        }

        lines.push('');
    }

    return lines.join('\n').trim();
}

export function SwapsScreen({
                                album,
                                stickers,
                                stickerById,
                                onAddDuplicate,
                                onRemoveDuplicate,
                            }: SwapsScreenProps) {
    const [copyMessage, setCopyMessage] = useState<string | null>(null);

    const sectionById = useMemo(
        () => Object.fromEntries(album.sections.map((section) => [section.id, section])),
        [album.sections],
    );

    const duplicates = Object.values(stickers).filter((sticker) => sticker.quantityDuplicate > 0);
    const missing = Object.values(stickers).filter((sticker) => sticker.status !== 'owned');

    async function copySwapList() {
        const duplicatesText = buildGroupedList(
            album,
            stickers,
            (stickerId) => (stickers[stickerId]?.quantityDuplicate ?? 0) > 0,
            (stickerId) => {
                const catalogSticker = stickerById[stickerId];
                const quantity = stickers[stickerId]?.quantityDuplicate ?? 0;

                return catalogSticker?.name
                    ? `${stickerId} - ${catalogSticker.name}: ${quantity}`
                    : `${stickerId}: ${quantity}`;
            },
        );

        const missingText = buildGroupedList(
            album,
            stickers,
            (stickerId) => stickers[stickerId]?.status !== 'owned',
            (stickerId) => {
                const catalogSticker = stickerById[stickerId];

                return catalogSticker?.name
                    ? `${stickerId} - ${catalogSticker.name}`
                    : stickerId;
            },
        );

        const text = [
            `Mis repetidas - ${album.name}`,
            duplicatesText || 'No tengo repetidas registradas.',
            '',
            `Me faltan - ${album.name}`,
            missingText || 'No tengo faltantes registradas.',
        ].join('\n');

        try {
            if (navigator.clipboard?.writeText && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = text;
                textarea.style.position = 'fixed';
                textarea.style.left = '-9999px';
                textarea.style.top = '-9999px';

                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();

                const copied = document.execCommand('copy');
                document.body.removeChild(textarea);

                if (!copied) {
                    throw new Error('No se pudo copiar automáticamente.');
                }
            }

            setCopyMessage('Lista copiada al portapapeles.');
        } catch {
            setCopyMessage('No se pudo copiar automáticamente. Mantén presionado el texto para copiarlo.');
            console.log(text);
        }

        window.setTimeout(() => {
            setCopyMessage(null);
        }, 2500);
    }

    return (
        <main>
            <h1 className="screen-title">Repetidas</h1>
            <p className="screen-subtitle">
                Lleva el conteo de tus repetidas y genera una lista para intercambiar.
            </p>

            <section>
                <h2 className="section-title">Tus repetidas</h2>

                {duplicates.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon="🔁"
                            title="Aún no tienes repetidas"
                            description="Agrega repetidas desde el álbum tocando el botón +."
                        />
                    </Card>
                ) : (
                    <div className="grid">
                        {duplicates.map((sticker) => {
                            const catalogSticker = stickerById[sticker.stickerId];
                            const section = catalogSticker ? sectionById[catalogSticker.sectionId] : null;

                            return (
                                <Card key={sticker.stickerId}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                        <div>
                                            <strong style={{ display: 'block' }}>{sticker.stickerId}</strong>

                                            {catalogSticker?.team && (
                                                <p
                                                    style={{
                                                        margin: '4px 0 0',
                                                        color: 'var(--color-text-muted)',
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {section?.flag ?? '📄'} {catalogSticker.team}
                                                </p>
                                            )}

                                            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)' }}>
                                                {sticker.quantityDuplicate} repetida(s)
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                onClick={() => onRemoveDuplicate(sticker.stickerId)}
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 12,
                                                    border: '1px solid var(--color-border)',
                                                    background: 'var(--color-surface-alt)',
                                                    color: 'var(--color-text)',
                                                    fontSize: 20,
                                                    fontWeight: 900,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                -
                                            </button>

                                            <button
                                                onClick={() => onAddDuplicate(sticker.stickerId)}
                                                style={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 12,
                                                    border: '1px solid var(--color-border)',
                                                    background: 'var(--color-primary)',
                                                    color: '#FFFFFF',
                                                    fontSize: 20,
                                                    fontWeight: 900,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </section>

            <section>
                <h2 className="section-title">Te faltan</h2>
                <Card>
                    {missing.length === 0 ? (
                        <EmptyState icon="✅" title="No tienes faltantes marcadas" />
                    ) : (
                        <div style={{ display: 'grid', gap: 12 }}>
                            {album.sections.map((section) => {
                                const sectionMissing = section.stickerIds.filter(
                                    (stickerId) => stickers[stickerId]?.status !== 'owned',
                                );

                                if (sectionMissing.length === 0) return null;

                                return (
                                    <div key={section.id}>
                                        <strong style={{ display: 'block', marginBottom: 4 }}>
                                            {section.flag} {section.name}
                                        </strong>
                                        <p
                                            style={{
                                                margin: 0,
                                                color: 'var(--color-text-muted)',
                                                lineHeight: 1.5,
                                                fontSize: 14,
                                            }}
                                        >
                                            {sectionMissing.join(', ')}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </section>

            <div style={{ marginTop: 20 }}>
                <Button fullWidth onClick={copySwapList}>
                    Copiar lista de intercambio
                </Button>

                {copyMessage && (
                    <p
                        style={{
                            margin: '10px 0 0',
                            color: 'var(--color-text-muted)',
                            fontSize: 13,
                            textAlign: 'center',
                        }}
                    >
                        {copyMessage}
                    </p>
                )}
            </div>
        </main>
    );
}