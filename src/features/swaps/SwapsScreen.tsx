import { useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { Album, Sticker, UserStickerMap } from '../../core/album/album.types';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import {
    compareSwapPayloadWithMyCollection,
    createSwapShareCode,
    parseSwapShareCode,
} from '../../core/swaps/swapShare';
import { QrScanner } from '../../components/qr/QrScanner';

interface SwapsScreenProps {
    album: Album;
    stickers: UserStickerMap;
    stickerById: Record<string, Sticker>;
    onMarkOwned: (stickerId: string) => void;
    onRemoveOwned: (stickerId: string) => void;
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

async function copyText(text: string) {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return;
    }

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
        throw new Error('No se pudo copiar.');
    }
}

export function SwapsScreen({
                                album,
                                stickers,
                                stickerById,
                                onMarkOwned,
                                onRemoveOwned,
                                onAddDuplicate,
                                onRemoveDuplicate,
                            }: SwapsScreenProps){
    const [copyMessage, setCopyMessage] = useState<string | null>(null);
    const [swapCodeInput, setSwapCodeInput] = useState('');
    const [comparisonStickerIds, setComparisonStickerIds] = useState<string[] | null>(null);
    const [comparisonMessage, setComparisonMessage] = useState<string | null>(null);
    const [selectedUsefulStickerIds, setSelectedUsefulStickerIds] = useState<string[]>([]);
    const [lastAddedStickerIds, setLastAddedStickerIds] = useState<string[]>([]);

    const sectionById = useMemo(
        () => Object.fromEntries(album.sections.map((section) => [section.id, section])),
        [album.sections],
    );

    const duplicates = Object.values(stickers).filter((sticker) => sticker.quantityDuplicate > 0);
    const missing = Object.values(stickers).filter((sticker) => sticker.status !== 'owned');

    const swapShareCode = useMemo(
        () => createSwapShareCode(album.id, stickers),
        [album.id, stickers],
    );

    function showTemporaryCopyMessage(message: string) {
        setCopyMessage(message);

        window.setTimeout(() => {
            setCopyMessage(null);
        }, 2500);
    }

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

                return catalogSticker?.name ? `${stickerId} - ${catalogSticker.name}` : stickerId;
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
            await copyText(text);
            showTemporaryCopyMessage('Lista copiada al portapapeles.');
        } catch {
            showTemporaryCopyMessage('No se pudo copiar automáticamente.');
            console.log(text);
        }
    }

    async function copySwapCode() {
        try {
            await copyText(swapShareCode);
            showTemporaryCopyMessage('Código QR copiado.');
        } catch {
            showTemporaryCopyMessage('No se pudo copiar el código automáticamente.');
            console.log(swapShareCode);
        }
    }

    function compareReceivedCode(codeOverride?: string) {
        const codeToCompare = codeOverride ?? swapCodeInput;

        try {
            const payload = parseSwapShareCode(codeToCompare);

            if (payload.a !== album.id) {
                setComparisonStickerIds([]);
                setSelectedUsefulStickerIds([]);
                setComparisonMessage('Ese código pertenece a otro álbum.');
                setLastAddedStickerIds([]);
                return;
            }

            const comparison = compareSwapPayloadWithMyCollection(payload, stickers);

            setComparisonStickerIds(comparison.usefulStickerIds);
            setSelectedUsefulStickerIds(comparison.usefulStickerIds);
            setLastAddedStickerIds([]);

            if (comparison.usefulStickerIds.length === 0) {
                setComparisonMessage('No hay repetidas del otro usuario que te falten.');
            } else {
                setComparisonMessage(
                    `Te sirven ${comparison.usefulStickerIds.length} lámina(s) del otro usuario.`,
                );
            }
        } catch {
            setComparisonStickerIds([]);
            setSelectedUsefulStickerIds([]);
            setComparisonMessage('Código inválido. Revisa que lo hayas copiado completo.');
            setLastAddedStickerIds([]);
        }
    }
    function handleQrScan(scannedCode: string) {
        setSwapCodeInput(scannedCode);
        compareReceivedCode(scannedCode);
    }

    function toggleUsefulStickerSelection(stickerId: string) {
        setSelectedUsefulStickerIds((current) => {
            if (current.includes(stickerId)) {
                return current.filter((id) => id !== stickerId);
            }

            return [...current, stickerId].sort();
        });
    }

    function selectAllUsefulStickers() {
        setSelectedUsefulStickerIds(comparisonStickerIds ?? []);
    }

    function clearUsefulStickerSelection() {
        setSelectedUsefulStickerIds([]);
    }

    function confirmSelectedUsefulStickers() {
        if (selectedUsefulStickerIds.length === 0) return;

        selectedUsefulStickerIds.forEach((stickerId) => {
            onMarkOwned(stickerId);
        });

        setLastAddedStickerIds(selectedUsefulStickerIds);

        setComparisonStickerIds((current) =>
            current
                ? current.filter((stickerId) => !selectedUsefulStickerIds.includes(stickerId))
                : current,
        );

        setComparisonMessage(
            `Agregaste ${selectedUsefulStickerIds.length} lámina(s) seleccionada(s) a tu álbum.`,
        );

        setSelectedUsefulStickerIds([]);
    }

    function undoLastAddedStickers() {
        if (lastAddedStickerIds.length === 0) return;

        lastAddedStickerIds.forEach((stickerId) => {
            onRemoveOwned(stickerId);
        });

        setComparisonStickerIds((current) => {
            const existing = current ?? [];
            return Array.from(new Set([...lastAddedStickerIds, ...existing])).sort();
        });

        setSelectedUsefulStickerIds(lastAddedStickerIds);
        setComparisonMessage('Se deshizo el último agregado.');
        setLastAddedStickerIds([]);
    }

    return (
        <main>
            <h1 className="screen-title">Repetidas</h1>
            <p className="screen-subtitle">
                Lleva el conteo de tus repetidas y compara con otros coleccionistas usando QR.
            </p>

            <section>
                <h2 className="section-title">QR de intercambio</h2>

                <Card>
                    {duplicates.length === 0 ? (
                        <EmptyState
                            icon="🔁"
                            title="Aún no tienes repetidas"
                            description="Agrega repetidas desde el álbum para generar tu QR de intercambio."
                        />
                    ) : (
                        <div style={{ display: 'grid', gap: 14 }}>
                            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                                Este QR contiene los códigos de tus láminas repetidas. No incluye cantidades, solo
                                si tienes o no tienes una lámina repetida.
                            </p>

                            <div
                                style={{
                                    background: '#FFFFFF',
                                    padding: 16,
                                    borderRadius: 18,
                                    display: 'flex',
                                    justifyContent: 'center',
                                }}
                            >
                                <QRCodeSVG value={swapShareCode} size={220} level="M" includeMargin />
                            </div>

                            <Button fullWidth onClick={copySwapCode}>
                                Copiar código QR
                            </Button>

                            <details>
                                <summary
                                    style={{
                                        color: 'var(--color-text-muted)',
                                        cursor: 'pointer',
                                        fontWeight: 800,
                                    }}
                                >
                                    Ver código
                                </summary>

                                <pre
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                        background: 'var(--color-surface-alt)',
                                        color: 'var(--color-text-muted)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: 12,
                                        padding: 10,
                                        fontSize: 11,
                                    }}
                                >
                  {swapShareCode}
                </pre>
                            </details>
                        </div>
                    )}
                </Card>
            </section>

            <section>
                <h2 className="section-title">Escanear QR recibido</h2>

                <QrScanner onScan={handleQrScan} />
            </section>


            <section>
                <h2 className="section-title">Comparar código recibido</h2>

                <Card>
                    <div className="grid">
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                            Pega el código de intercambio de otra persona. La app te dirá cuáles de sus repetidas
                            te faltan.
                        </p>

                        <textarea
                            className="input"
                            value={swapCodeInput}
                            onChange={(event) => setSwapCodeInput(event.target.value)}
                            placeholder="Pega aquí el código SA1:..."
                            rows={4}
                            style={{
                                resize: 'vertical',
                                minHeight: 92,
                            }}
                        />

                        <Button fullWidth onClick={() => compareReceivedCode()} disabled={!swapCodeInput.trim()}>
                            Comparar con mis faltantes
                        </Button>

                        {comparisonMessage && (
                            <p
                                style={{
                                    margin: 0,
                                    color: 'var(--color-text-muted)',
                                    fontWeight: 800,
                                    lineHeight: 1.4,
                                }}
                            >
                                {comparisonMessage}
                            </p>
                        )}

                        {comparisonStickerIds && comparisonStickerIds.length > 0 && (
                            <div className="grid">
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '1fr 1fr',
                                        gap: 8,
                                    }}
                                >
                                    <Button variant="secondary" fullWidth onClick={selectAllUsefulStickers}>
                                        Seleccionar todas
                                    </Button>

                                    <Button variant="secondary" fullWidth onClick={clearUsefulStickerSelection}>
                                        Limpiar selección
                                    </Button>
                                </div>

                                <p
                                    style={{
                                        margin: 0,
                                        color: 'var(--color-text-muted)',
                                        fontSize: 13,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    Seleccionadas: {selectedUsefulStickerIds.length} de {comparisonStickerIds.length}
                                </p>

                                {comparisonStickerIds.map((stickerId) => {
                                    const catalogSticker = stickerById[stickerId];
                                    const section = catalogSticker ? sectionById[catalogSticker.sectionId] : null;
                                    const selected = selectedUsefulStickerIds.includes(stickerId);

                                    return (
                                        <button
                                            key={stickerId}
                                            onClick={() => toggleUsefulStickerSelection(stickerId)}
                                            style={{
                                                border: selected
                                                    ? '1.5px solid var(--color-primary)'
                                                    : '1px solid var(--color-border)',
                                                borderRadius: 14,
                                                padding: 12,
                                                background: selected ? 'var(--color-primary-soft)' : 'var(--color-surface-alt)',
                                                color: 'var(--color-text)',
                                                display: 'grid',
                                                gridTemplateColumns: '1fr auto',
                                                gap: 10,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            <div>
                                                <strong style={{ display: 'block' }}>{stickerId}</strong>

                                                {catalogSticker?.name && (
                                                    <p
                                                        style={{
                                                            margin: '4px 0 0',
                                                            color: 'var(--color-text)',
                                                            fontWeight: 800,
                                                        }}
                                                    >
                                                        {catalogSticker.name}
                                                    </p>
                                                )}

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
                                            </div>

                                            <span
                                                aria-hidden="true"
                                                style={{
                                                    width: 30,
                                                    height: 30,
                                                    borderRadius: '50%',
                                                    border: selected
                                                        ? '1px solid var(--color-primary)'
                                                        : '1px solid var(--color-border)',
                                                    background: selected ? 'var(--color-primary)' : 'var(--color-surface)',
                                                    color: selected ? '#FFFFFF' : 'var(--color-text-muted)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 900,
                                                    fontSize: 16,
                                                    flexShrink: 0,
                                                }}
                                            >
            {selected ? '✓' : ''}
          </span>
                                        </button>
                                    );
                                })}

                                <Button
                                    fullWidth
                                    disabled={selectedUsefulStickerIds.length === 0}
                                    onClick={confirmSelectedUsefulStickers}
                                >
                                    Confirmar y agregar seleccionadas
                                </Button>
                            </div>
                        )}
                        {lastAddedStickerIds.length > 0 && (
                            <Button variant="secondary" fullWidth onClick={undoLastAddedStickers}>
                                Deshacer último agregado
                            </Button>
                        )}
                    </div>
                </Card>
            </section>

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

                                            {catalogSticker?.name && (
                                                <p
                                                    style={{
                                                        margin: '4px 0 0',
                                                        color: 'var(--color-text)',
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    {catalogSticker.name}
                                                </p>
                                            )}

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