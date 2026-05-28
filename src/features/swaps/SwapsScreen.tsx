import type { Album, UserStickerMap } from '../../core/album/album.types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';

interface SwapsScreenProps {
    album: Album;
    stickers: UserStickerMap;
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
                                onAddDuplicate,
                                onRemoveDuplicate,
                            }: SwapsScreenProps) {
    const duplicates = Object.values(stickers).filter((sticker) => sticker.quantityDuplicate > 0);
    const missing = Object.values(stickers).filter((sticker) => sticker.status !== 'owned');

    function copySwapList() {
        const duplicatesText = buildGroupedList(
            album,
            stickers,
            (stickerId) => (stickers[stickerId]?.quantityDuplicate ?? 0) > 0,
            (stickerId) => `${stickerId}: ${stickers[stickerId]?.quantityDuplicate ?? 0}`,
        );

        const missingText = buildGroupedList(
            album,
            stickers,
            (stickerId) => stickers[stickerId]?.status !== 'owned',
            (stickerId) => stickerId,
        );

        const text = [
            `Mis repetidas - ${album.name}`,
            duplicatesText || 'No tengo repetidas registradas.',
            '',
            `Me faltan - ${album.name}`,
            missingText || 'No tengo faltantes registradas.',
        ].join('\n');

        void navigator.clipboard?.writeText(text);
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
                        {duplicates.map((sticker) => (
                            <Card key={sticker.stickerId}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                    <div>
                                        <strong>{sticker.stickerId}</strong>
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
                        ))}
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
            </div>
        </main>
    );
}