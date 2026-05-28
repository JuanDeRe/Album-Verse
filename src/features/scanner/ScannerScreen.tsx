import { useEffect, useMemo, useState } from 'react';
import type { Album, Sticker, UserStickerMap } from '../../core/album/album.types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { StatusPill } from '../../components/StatusPill';

interface ScannerScreenProps {
    album: Album;
    stickers: UserStickerMap;
    stickerById: Record<string, Sticker>;
    selectedSectionId: string;
    onSelectedSectionChange: (sectionId: string) => void;
    onMarkOwned: (stickerId: string) => void;
    onRemoveOwned: (stickerId: string) => void;
}

export function ScannerScreen({
                                  album,
                                  stickers,
                                  stickerById,
                                  selectedSectionId,
                                  onSelectedSectionChange,
                                  onMarkOwned,
                                  onRemoveOwned,
                              }: ScannerScreenProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedStickerIds, setSelectedStickerIds] = useState<string[]>([]);
    const [replaceSection, setReplaceSection] = useState(false);
    const [scanMessage, setScanMessage] = useState<string | null>(null);

    const selectedSection =
        album.sections.find((section) => section.id === selectedSectionId) ?? album.sections[0];

    useEffect(() => {
        if (!selectedSection) return;

        const alreadyOwnedInSection = selectedSection.stickerIds.filter(
            (stickerId) => stickers[stickerId]?.status === 'owned',
        );

        setSelectedStickerIds(alreadyOwnedInSection);
    }, [selectedSection?.id, stickers, selectedSection]);

    const selectedCount = selectedStickerIds.length;
    const totalInSection = selectedSection?.stickerIds.length ?? 0;

    const sectionStickerIds = useMemo(() => {
        return selectedSection?.stickerIds ?? [];
    }, [selectedSection]);

    function toggleSticker(stickerId: string) {
        setSelectedStickerIds((current) => {
            if (current.includes(stickerId)) {
                return current.filter((id) => id !== stickerId);
            }

            return [...current, stickerId].sort();
        });
    }

    function selectAll() {
        setSelectedStickerIds(sectionStickerIds);
    }

    function clearSelection() {
        setSelectedStickerIds([]);
    }

    function handleFileChange(file: File | undefined) {
        if (!file) return;

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        const nextPreviewUrl = URL.createObjectURL(file);
        setPreviewUrl(nextPreviewUrl);
        setScanMessage(null);
    }

    function confirmScan() {
        if (!selectedSection) return;

        const selectedSet = new Set(selectedStickerIds);

        if (replaceSection) {
            selectedSection.stickerIds.forEach((stickerId) => {
                if (selectedSet.has(stickerId)) {
                    onMarkOwned(stickerId);
                } else {
                    onRemoveOwned(stickerId);
                }
            });

            setScanMessage(
                `Se actualizó toda la sección: ${selectedStickerIds.length} como conseguidas y ${
                    selectedSection.stickerIds.length - selectedStickerIds.length
                } como faltantes.`,
            );

            return;
        }

        selectedStickerIds.forEach((stickerId) => {
            onMarkOwned(stickerId);
        });

        setScanMessage(`Se agregaron ${selectedStickerIds.length} lámina(s) a tu álbum.`);
    }

    return (
        <main>
            <h1 className="screen-title">Scanner</h1>
            <p className="screen-subtitle">
                Toma una foto de una página del álbum y marca las láminas que aparecen pegadas.
            </p>

            <section>
                <h2 className="section-title">1. Selecciona sección</h2>

                <select
                    className="select"
                    value={selectedSection?.id ?? ''}
                    onChange={(event) => onSelectedSectionChange(event.target.value)}
                >
                    {album.sections.map((section) => (
                        <option key={section.id} value={section.id}>
                            {section.flag ?? '📄'} {section.name}
                        </option>
                    ))}
                </select>
            </section>

            <section>
                <h2 className="section-title">2. Foto de la página</h2>

                <Card>
                    <div className="grid">
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                            Por ahora el scanner es asistido: subes o tomas una foto y luego marcas manualmente
                            qué láminas se ven en la página. Después conectaremos detección automática.
                        </p>

                        <label
                            style={{
                                display: 'block',
                                border: '1px dashed var(--color-border)',
                                borderRadius: 16,
                                padding: 16,
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: 'var(--color-surface-alt)',
                            }}
                        >
                            <strong>Tomar foto o subir imagen</strong>
                            <p
                                style={{
                                    margin: '6px 0 0',
                                    color: 'var(--color-text-muted)',
                                    fontSize: 13,
                                }}
                            >
                                En celular debería abrir cámara o galería.
                            </p>

                            <input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                style={{ display: 'none' }}
                                onChange={(event) => {
                                    handleFileChange(event.target.files?.[0]);
                                    event.target.value = '';
                                }}
                            />
                        </label>

                        {previewUrl ? (
                            <img
                                src={previewUrl}
                                alt="Preview de la página del álbum"
                                style={{
                                    width: '100%',
                                    maxHeight: 420,
                                    objectFit: 'contain',
                                    borderRadius: 16,
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-surface-alt)',
                                }}
                            />
                        ) : (
                            <EmptyState
                                icon="📷"
                                title="Sin foto todavía"
                                description="Sube una foto de la página para revisarla mientras marcas las láminas."
                            />
                        )}
                    </div>
                </Card>
            </section>

            <section>
                <h2 className="section-title">3. Marca las láminas visibles</h2>

                <Card>
                    {selectedSection ? (
                        <div className="grid">
                            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                                <div>
                                    <strong>
                                        {selectedSection.flag} {selectedSection.name}
                                    </strong>
                                    <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)' }}>
                                        Seleccionadas: {selectedCount} de {totalInSection}
                                    </p>
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: 8,
                                }}
                            >
                                <Button variant="secondary" fullWidth onClick={selectAll}>
                                    Seleccionar todas
                                </Button>

                                <Button variant="secondary" fullWidth onClick={clearSelection}>
                                    Limpiar
                                </Button>
                            </div>

                            <label
                                style={{
                                    display: 'flex',
                                    gap: 10,
                                    alignItems: 'flex-start',
                                    color: 'var(--color-text-muted)',
                                    fontSize: 13,
                                    lineHeight: 1.4,
                                }}
                            >
                                <input
                                    type="checkbox"
                                    checked={replaceSection}
                                    onChange={(event) => setReplaceSection(event.target.checked)}
                                    style={{ marginTop: 2 }}
                                />

                                <span>
                  Actualizar toda la sección. Si activas esta opción, las no seleccionadas quedarán
                  como faltantes. Si la dejas apagada, solo se agregan las seleccionadas.
                </span>
                            </label>

                            <div
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                                    gap: 8,
                                }}
                            >
                                {sectionStickerIds.map((stickerId) => {
                                    const catalogSticker = stickerById[stickerId];
                                    const userSticker = stickers[stickerId];
                                    const selected = selectedStickerIds.includes(stickerId);

                                    return (
                                        <button
                                            key={stickerId}
                                            onClick={() => toggleSticker(stickerId)}
                                            style={{
                                                border: selected
                                                    ? '1.5px solid var(--color-primary)'
                                                    : '1px solid var(--color-border)',
                                                borderRadius: 14,
                                                background: selected
                                                    ? 'var(--color-primary-soft)'
                                                    : 'var(--color-surface)',
                                                color: 'var(--color-text)',
                                                padding: 10,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                minHeight: 112,
                                                display: 'grid',
                                                gridTemplateRows: 'auto 1fr auto',
                                                gap: 6,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    gap: 8,
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <strong>{stickerId}</strong>

                                                <span
                                                    aria-hidden="true"
                                                    style={{
                                                        width: 24,
                                                        height: 24,
                                                        borderRadius: '50%',
                                                        border: selected
                                                            ? '1px solid var(--color-primary)'
                                                            : '1px solid var(--color-border)',
                                                        background: selected
                                                            ? 'var(--color-primary)'
                                                            : 'var(--color-surface-alt)',
                                                        color: selected ? '#FFFFFF' : 'transparent',
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontWeight: 900,
                                                        fontSize: 14,
                                                        flexShrink: 0,
                                                    }}
                                                >
                          ✓
                        </span>
                                            </div>

                                            {catalogSticker?.name && (
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color: 'var(--color-text-muted)',
                                                        fontSize: 11,
                                                        lineHeight: 1.2,
                                                        overflow: 'hidden',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                    }}
                                                >
                                                    {catalogSticker.name}
                                                </p>
                                            )}

                                            {userSticker && <StatusPill status={userSticker.status} />}
                                        </button>
                                    );
                                })}
                            </div>

                            <Button fullWidth disabled={selectedStickerIds.length === 0} onClick={confirmScan}>
                                Confirmar selección
                            </Button>

                            {scanMessage && (
                                <p
                                    style={{
                                        margin: 0,
                                        color: 'var(--color-text-muted)',
                                        textAlign: 'center',
                                        fontSize: 13,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {scanMessage}
                                </p>
                            )}
                        </div>
                    ) : (
                        <EmptyState
                            icon="📖"
                            title="Selecciona una sección"
                            description="Escoge la sección del álbum que corresponde a la foto."
                        />
                    )}
                </Card>
            </section>
        </main>
    );
}