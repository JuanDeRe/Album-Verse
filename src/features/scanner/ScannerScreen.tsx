import { useEffect, useMemo, useState } from 'react';
import type { Album, Sticker, UserStickerMap } from '../../core/album/album.types';
import { getNormalTeamStickerIdsForSection } from '../../core/scanner/teamStickerUtils';
import type {
    ScannerCropBox,
    ScannerPageLayout,
    TeamPageScanResult,
} from '../../core/scanner/teamScanner.types';
import {
    createTeamScanLayout,
    getFixedLayoutsForSectionName,
} from '../../core/scanner/worldCupScanLayouts';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { scannerSettingsRepository } from '../../repositories/scannerSettingsRepository';
import { suggestCropBoxFromImage } from '../../services/scanner/autoCrop';
import { analyzeTeamPageImage } from '../../services/scanner/teamPageScanner';
import { ScannerCropPreview } from './ScannerCropPreview';
import { ScannerResultReview } from './ScannerResultReview';

interface ScannerScreenProps {
    album: Album;
    stickers: UserStickerMap;
    stickerById: Record<string, Sticker>;
    selectedSectionId: string;
    onSelectedSectionChange: (sectionId: string) => void;
    onMarkOwned: (stickerId: string) => void;
    onRemoveOwned: (stickerId: string) => void;
}

const DEFAULT_CROP_BOX: ScannerCropBox = {
    left: 0.04,
    top: 0.04,
    right: 0.04,
    bottom: 0.06,
};

export function ScannerScreen({
                                  album,
                                  stickers,
                                  stickerById,
                                  selectedSectionId,
                                  onSelectedSectionChange,
                                  onMarkOwned,
                                  onRemoveOwned,
                              }: ScannerScreenProps) {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [rotationDegrees, setRotationDegrees] = useState(0);
    const [cropBox, setCropBox] = useState<ScannerCropBox>(DEFAULT_CROP_BOX);
    const [selectedLayoutId, setSelectedLayoutId] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSuggestingCrop, setIsSuggestingCrop] = useState(false);
    const [scanResult, setScanResult] = useState<TeamPageScanResult | null>(null);
    const [scanMessage, setScanMessage] = useState<string | null>(null);
    const [cropMessage, setCropMessage] = useState<string | null>(null);

    const selectedSection =
        album.sections.find((section) => section.id === selectedSectionId) ?? album.sections[0];

    const teamStickerIds = useMemo(() => {
        if (!selectedSection) return [];

        return getNormalTeamStickerIdsForSection(selectedSection, stickerById);
    }, [selectedSection, stickerById]);

    const availableScanLayouts = useMemo<ScannerPageLayout[]>(() => {
        if (!selectedSection) return [];

        const fixedLayouts = getFixedLayoutsForSectionName(selectedSection.name);

        if (fixedLayouts.length > 0) {
            return fixedLayouts;
        }

        if (teamStickerIds.length > 0) {
            return [createTeamScanLayout(teamStickerIds, selectedSection.name)];
        }

        return [];
    }, [selectedSection, teamStickerIds]);

    const selectedScanLayout =
        availableScanLayouts.find((layout) => layout.id === selectedLayoutId) ??
        availableScanLayouts[0] ??
        null;

    const scanStickerIds = selectedScanLayout?.slots.map((slot) => slot.stickerId) ?? [];

    const canAnalyze = Boolean(imageFile && selectedSection && selectedScanLayout);

    useEffect(() => {
        let cancelled = false;

        async function loadSavedCrop() {
            if (!selectedScanLayout) {
                setCropBox(DEFAULT_CROP_BOX);
                setCropMessage(null);
                return;
            }

            const savedCrop = await scannerSettingsRepository.getCropForLayout(selectedScanLayout.id);

            if (cancelled) return;

            setCropBox(savedCrop ?? DEFAULT_CROP_BOX);
            setCropMessage(savedCrop ? 'Se cargó el último recorte usado para este layout.' : null);
        }

        void loadSavedCrop();

        return () => {
            cancelled = true;
        };
    }, [selectedScanLayout?.id]);

    function handleFileChange(file: File | undefined) {
        if (!file) return;

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setRotationDegrees(0);
        setScanResult(null);
        setScanMessage(null);
        setCropMessage(null);
    }

    function rotateImage() {
        setRotationDegrees((current) => (current + 90) % 360);
        setScanResult(null);
        setScanMessage(null);
        setCropMessage(null);
    }

    function updateCropBox(key: keyof ScannerCropBox, value: number) {
        setCropBox((current) => ({
            ...current,
            [key]: value,
        }));

        setScanResult(null);
        setScanMessage(null);
        setCropMessage(null);
    }

    function resetCropBox() {
        setCropBox(DEFAULT_CROP_BOX);
        setScanResult(null);
        setScanMessage(null);
        setCropMessage(null);
    }

    async function suggestAutoCrop() {
        if (!imageFile) return;

        setIsSuggestingCrop(true);
        setCropMessage(null);
        setScanResult(null);
        setScanMessage(null);

        try {
            const suggestedCrop = await suggestCropBoxFromImage({
                imageFile,
                rotationDegrees,
            });

            setCropBox(suggestedCrop);
            setCropMessage('Se sugirió un recorte automático. Revísalo y ajusta si hace falta.');
        } catch (error) {
            console.error(error);
            setCropMessage('No se pudo sugerir un recorte automático.');
        } finally {
            setIsSuggestingCrop(false);
        }
    }

    async function analyzeImage() {
        if (!imageFile || !selectedSection || !selectedScanLayout) return;

        setIsAnalyzing(true);
        setScanMessage(null);

        try {
            await scannerSettingsRepository.saveCropForLayout(selectedScanLayout.id, cropBox);

            const result = await analyzeTeamPageImage({
                imageFile,
                sectionId: selectedSection.id,
                layoutId: selectedScanLayout.id,
                scanSlots: selectedScanLayout.slots,
                rotationDegrees,
                cropBox,
            });

            setScanResult(result);
            setScanMessage('Análisis completado. Revisa y corrige el resultado antes de guardar.');
            setCropMessage('Se guardó este recorte para la próxima vez.');
        } catch (error) {
            console.error(error);
            setScanMessage('No se pudo analizar la imagen.');
        } finally {
            setIsAnalyzing(false);
        }
    }

    function confirmScan(ownedStickerIds: string[], replaceSection: boolean) {
        const currentScanStickerIds = scanResult?.results.map((result) => result.stickerId) ?? [];
        const ownedSet = new Set(ownedStickerIds);

        if (replaceSection) {
            currentScanStickerIds.forEach((stickerId) => {
                if (ownedSet.has(stickerId)) {
                    onMarkOwned(stickerId);
                } else {
                    onRemoveOwned(stickerId);
                }
            });

            setScanMessage(
                `Se actualizó la página escaneada: ${ownedStickerIds.length} conseguida(s), ${
                    currentScanStickerIds.length - ownedStickerIds.length
                } faltante(s).`,
            );
        } else {
            ownedStickerIds.forEach((stickerId) => {
                onMarkOwned(stickerId);
            });

            setScanMessage(`Se agregaron ${ownedStickerIds.length} lámina(s) a tu álbum.`);
        }

        setScanResult(null);
    }

    function clearScanResult() {
        setScanResult(null);
        setScanMessage(null);
    }

    return (
        <main>
            <h1 className="screen-title">Scanner</h1>
            <p className="screen-subtitle">
                Sube una foto horizontal de la página o doble página. El scanner intentará detectar qué
                espacios tienen lámina pegada y luego podrás corregir antes de guardar.
            </p>

            <section>
                <h2 className="section-title">1. Sección</h2>

                <select
                    className="select"
                    value={selectedSection?.id ?? ''}
                    onChange={(event) => {
                        onSelectedSectionChange(event.target.value);
                        setSelectedLayoutId('');
                        setScanResult(null);
                        setScanMessage(null);
                        setCropMessage(null);
                    }}
                >
                    {album.sections.map((section) => (
                        <option key={section.id} value={section.id}>
                            {section.flag ?? '📄'} {section.name}
                        </option>
                    ))}
                </select>

                {availableScanLayouts.length > 1 && (
                    <div style={{ marginTop: 12 }}>
                        <label>
                            <strong style={{ display: 'block', marginBottom: 8 }}>Página a escanear</strong>

                            <select
                                className="select"
                                value={selectedScanLayout?.id ?? ''}
                                onChange={(event) => {
                                    setSelectedLayoutId(event.target.value);
                                    setScanResult(null);
                                    setScanMessage(null);
                                    setCropMessage(null);
                                }}
                            >
                                {availableScanLayouts.map((layout) => (
                                    <option key={layout.id} value={layout.id}>
                                        {layout.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {selectedScanLayout?.description && (
                            <p
                                style={{
                                    margin: '8px 0 0',
                                    color: 'var(--color-text-muted)',
                                    fontSize: 13,
                                    lineHeight: 1.4,
                                }}
                            >
                                {selectedScanLayout.description}
                            </p>
                        )}
                    </div>
                )}

                {availableScanLayouts.length === 0 && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: 13, lineHeight: 1.4 }}>
                        Esta sección todavía no tiene layout de scanner configurado.
                    </p>
                )}
            </section>

            <section>
                <h2 className="section-title">2. Foto</h2>

                <Card>
                    <div className="grid">
                        <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                            Para equipos, la foto ideal debe tomarse con el celular horizontal, mostrando las dos
                            páginas completas y lo más derechas posible.
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
                            <>
                                <div
                                    style={{
                                        width: '100%',
                                        maxHeight: 360,
                                        overflow: 'hidden',
                                        borderRadius: 18,
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-surface-alt)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <img
                                        src={previewUrl}
                                        alt="Preview de la página del álbum"
                                        style={{
                                            maxWidth: rotationDegrees % 180 === 0 ? '100%' : 360,
                                            maxHeight: rotationDegrees % 180 === 0 ? 360 : '100%',
                                            transform: `rotate(${rotationDegrees}deg)`,
                                            transition: 'transform 160ms ease',
                                            display: 'block',
                                        }}
                                    />
                                </div>

                                <Button variant="secondary" fullWidth onClick={rotateImage}>
                                    Rotar imagen 90°
                                </Button>
                            </>
                        ) : (
                            <EmptyState
                                icon="📷"
                                title="Sin foto todavía"
                                description="Sube una foto para iniciar el análisis."
                            />
                        )}
                    </div>
                </Card>
            </section>

            <section>
                <h2 className="section-title">3. Ajustar recorte</h2>

                <Card>
                    {previewUrl ? (
                        <div className="grid">
                            <p style={{ margin: 0, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                                Ajusta el recorte para que el análisis use solo el área del álbum. Los cuadros
                                morados deben quedar encima de las láminas o espacios vacíos.
                            </p>

                            {selectedScanLayout ? (
                                <ScannerCropPreview
                                    imageUrl={previewUrl}
                                    rotationDegrees={rotationDegrees}
                                    cropBox={cropBox}
                                    scanSlots={selectedScanLayout.slots}
                                />
                            ) : (
                                <EmptyState
                                    icon="📐"
                                    title="Sin layout disponible"
                                    description="Esta sección todavía no tiene una página de scanner configurada."
                                />
                            )}

                            <Button
                                variant="secondary"
                                fullWidth
                                disabled={!imageFile || isSuggestingCrop}
                                onClick={suggestAutoCrop}
                            >
                                {isSuggestingCrop ? 'Sugiriendo recorte...' : 'Sugerir recorte automático'}
                            </Button>

                            {cropMessage && (
                                <p
                                    style={{
                                        margin: 0,
                                        color: 'var(--color-text-muted)',
                                        textAlign: 'center',
                                        fontSize: 13,
                                        lineHeight: 1.4,
                                    }}
                                >
                                    {cropMessage}
                                </p>
                            )}

                            {[
                                { key: 'left' as const, label: 'Izquierda' },
                                { key: 'right' as const, label: 'Derecha' },
                                { key: 'top' as const, label: 'Arriba' },
                                { key: 'bottom' as const, label: 'Abajo' },
                            ].map((item) => (
                                <label key={item.key}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: 12,
                                            marginBottom: 6,
                                            color: 'var(--color-text-muted)',
                                            fontSize: 13,
                                            fontWeight: 800,
                                        }}
                                    >
                                        <span>{item.label}</span>
                                        <span>{Math.round(cropBox[item.key] * 100)}%</span>
                                    </div>

                                    <input
                                        type="range"
                                        min={0}
                                        max={25}
                                        step={1}
                                        value={Math.round(cropBox[item.key] * 100)}
                                        onChange={(event) => {
                                            updateCropBox(item.key, Number(event.target.value) / 100);
                                        }}
                                        style={{ width: '100%' }}
                                    />
                                </label>
                            ))}

                            <Button variant="secondary" fullWidth onClick={resetCropBox}>
                                Restablecer recorte
                            </Button>
                        </div>
                    ) : (
                        <EmptyState
                            icon="✂️"
                            title="Primero sube una foto"
                            description="Cuando haya una foto, podrás ajustar el recorte antes de analizar."
                        />
                    )}
                </Card>
            </section>

            <section>
                <h2 className="section-title">4. Análisis</h2>

                <Card>
                    <div className="grid">
                        <div>
                            <strong>
                                {selectedSection?.flag} {selectedSection?.name}
                            </strong>

                            <p
                                style={{
                                    margin: '6px 0 0',
                                    color: 'var(--color-text-muted)',
                                    lineHeight: 1.45,
                                }}
                            >
                                Láminas en esta página/layout: {scanStickerIds.length}
                            </p>

                            {selectedScanLayout?.label && (
                                <p
                                    style={{
                                        margin: '4px 0 0',
                                        color: 'var(--color-text-muted)',
                                        fontSize: 13,
                                    }}
                                >
                                    Layout: {selectedScanLayout.label}
                                </p>
                            )}
                        </div>

                        <Button fullWidth disabled={!canAnalyze || isAnalyzing} onClick={analyzeImage}>
                            {isAnalyzing ? 'Analizando...' : 'Analizar foto'}
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
                </Card>
            </section>

            {scanResult && (
                <ScannerResultReview
                    key={`${scanResult.layoutId}-${scanResult.analyzedAt}`}
                    scanResult={scanResult}
                    stickers={stickers}
                    stickerById={stickerById}
                    onConfirm={confirmScan}
                    onClear={clearScanResult}
                />
            )}
        </main>
    );
}