import { useEffect, useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import type { Sticker, UserStickerMap } from '../../core/album/album.types';
import type { TeamPageScanResult } from '../../core/scanner/teamScanner.types';

interface ScannerResultReviewProps {
    scanResult: TeamPageScanResult;
    stickers: UserStickerMap;
    stickerById: Record<string, Sticker>;
    onConfirm: (ownedStickerIds: string[], replaceSection: boolean) => void;
    onClear: () => void;
}

export function ScannerResultReview({
                                        scanResult,
                                        stickers,
                                        stickerById,
                                        onConfirm,
                                        onClear,
                                    }: ScannerResultReviewProps) {
    const initialSelectedIds = useMemo(() => {
        return scanResult.results
            .filter((result) => result.detectedStatus === 'owned')
            .map((result) => result.stickerId);
    }, [scanResult.results]);

    const [selectedStickerIds, setSelectedStickerIds] = useState<string[]>(initialSelectedIds);
    const [replaceSection, setReplaceSection] = useState(false);

    useEffect(() => {
        setSelectedStickerIds(initialSelectedIds);
    }, [initialSelectedIds]);

    function toggleSticker(stickerId: string) {
        setSelectedStickerIds((current) => {
            if (current.includes(stickerId)) {
                return current.filter((id) => id !== stickerId);
            }

            return [...current, stickerId].sort();
        });
    }

    function selectAll() {
        setSelectedStickerIds(scanResult.results.map((result) => result.stickerId));
    }

    function clearSelection() {
        setSelectedStickerIds([]);
    }

    return (
        <section>
            <h2 className="section-title">Resultado del scanner</h2>

            <Card>
                <div className="grid">
                    <div>
                        <strong>Revisión antes de guardar</strong>
                        <p style={{ margin: '6px 0 0', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                            Marca con chulito las láminas que quieres guardar como conseguidas. Cuando tengamos
                            detección real, la app las preseleccionará automáticamente.
                        </p>
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

                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: 13 }}>
                        Seleccionadas: {selectedStickerIds.length} de {scanResult.results.length}
                    </p>

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
              Actualizar toda la sección. Si activas esta opción, las no seleccionadas quedarán como
              faltantes. Si la dejas apagada, solo se agregan las seleccionadas.
            </span>
                    </label>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                            gap: 8,
                        }}
                    >
                        {scanResult.results.map((result) => {
                            const catalogSticker = stickerById[result.stickerId];
                            const userSticker = stickers[result.stickerId];
                            const selected = selectedStickerIds.includes(result.stickerId);

                            return (
                                <button
                                    key={result.stickerId}
                                    onClick={() => toggleSticker(result.stickerId)}
                                    style={{
                                        border: selected
                                            ? '1.5px solid var(--color-primary)'
                                            : '1px solid var(--color-border)',
                                        borderRadius: 14,
                                        background: selected ? 'var(--color-primary-soft)' : 'var(--color-surface)',
                                        color: 'var(--color-text)',
                                        padding: 10,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        minHeight: 120,
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
                                        }}
                                    >
                                        <strong>{result.stickerId}</strong>

                                        <span
                                            aria-hidden="true"
                                            style={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                border: selected
                                                    ? '1px solid var(--color-primary)'
                                                    : '1px solid var(--color-border)',
                                                background: selected ? 'var(--color-primary)' : 'var(--color-surface-alt)',
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
                                    <p
                                        style={{
                                            margin: 0,
                                            color:
                                                result.detectedStatus === 'owned'
                                                    ? 'var(--color-success)'
                                                    : result.detectedStatus === 'missing'
                                                        ? 'var(--color-text-muted)'
                                                        : 'var(--color-primary)',
                                            fontSize: 10,
                                            fontWeight: 900,
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        Scanner: {result.detectedStatus === 'owned'
                                        ? 'pegada'
                                        : result.detectedStatus === 'missing'
                                            ? 'vacía'
                                            : 'dudosa'} · {Math.round(result.confidence * 100)}%
                                    </p>

                                    {userSticker && <StatusPill status={userSticker.status} />}
                                </button>
                            );
                        })}
                    </div>

                    <Button
                        fullWidth
                        disabled={selectedStickerIds.length === 0}
                        onClick={() => onConfirm(selectedStickerIds, replaceSection)}
                    >
                        Confirmar y guardar
                    </Button>

                    <Button variant="secondary" fullWidth onClick={onClear}>
                        Descartar resultado
                    </Button>
                </div>
            </Card>
        </section>
    );
}
