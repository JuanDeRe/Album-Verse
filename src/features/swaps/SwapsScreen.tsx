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

export function SwapsScreen({
                                album,
                                stickers,
                                onAddDuplicate,
                                onRemoveDuplicate,
                            }: SwapsScreenProps) {
    const duplicates = Object.values(stickers).filter((sticker) => sticker.quantityDuplicate > 0);
    const missing = Object.values(stickers).filter((sticker) => sticker.status === 'missing');

    function copySwapList() {
        const text = [
            `Mis repetidas - ${album.name}`,
            ...duplicates.map((sticker) => `- ${sticker.stickerId}: ${sticker.quantityDuplicate}`),
            '',
            `Me faltan`,
            ...missing.map((sticker) => `- ${sticker.stickerId}`),
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
                            description="Agrega repetidas desde el álbum tocando el botón + rep."
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
                                        <button onClick={() => onRemoveDuplicate(sticker.stickerId)}>-</button>
                                        <button onClick={() => onAddDuplicate(sticker.stickerId)}>+</button>
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
                        <p style={{ margin: 0, lineHeight: 1.7 }}>
                            {missing.map((sticker) => sticker.stickerId).join(', ')}
                        </p>
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