import type { Album, AlbumSection, Sticker, UserStickerMap } from '../../core/album/album.types';
import { calculateAlbumProgress, calculateSectionProgress } from '../../core/album/albumProgress';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { ProgressBar } from '../../components/ProgressBar';
import { StickerGrid } from './StickerGrid';

interface AlbumScreenProps {
    album: Album;
    stickers: UserStickerMap;
    stickerById: Record<string, Sticker>;
    selectedSectionId: string;
    onSelectedSectionChange: (sectionId: string) => void;
    onMarkOwned: (stickerId: string) => void;
    onRemoveOwned: (stickerId: string) => void;
    onAddDuplicate: (stickerId: string) => void;
    onRemoveDuplicate: (stickerId: string) => void;
}

export function AlbumScreen({
                                album,
                                stickers,
                                stickerById,
                                selectedSectionId,
                                onSelectedSectionChange,
                                onMarkOwned,
                                onRemoveOwned,
                                onAddDuplicate,
                                onRemoveDuplicate,
                            }: AlbumScreenProps) {
    const progress = calculateAlbumProgress(stickers);

    const totalDuplicates = Object.values(stickers).reduce(
        (sum, sticker) => sum + sticker.quantityDuplicate,
        0,
    );

    const selectedSection =
        album.sections.find((section) => section.id === selectedSectionId) ?? album.sections[0];

    const sectionProgress = selectedSection
        ? calculateSectionProgress(selectedSection, stickers)
        : null;

    const visibleSection: AlbumSection | null = selectedSection
        ? {
            ...selectedSection,
            stickerIds: selectedSection.stickerIds,
        }
        : null;

    return (
        <main>
            <h1 className="screen-title">{album.name}</h1>
            <p className="screen-subtitle">
                Trabaja por sección del álbum. Toca una lámina para marcar que la tienes.
            </p>

            <section style={{ marginTop: 18 }}>
                <Card>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                        <div>
                            <strong style={{ fontSize: 24 }}>{progress.percentage}%</strong>
                            <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)' }}>
                                {progress.owned} de {progress.total} láminas
                            </p>
                        </div>

                        <div style={{ textAlign: 'right', color: 'var(--color-text-muted)', fontSize: 13 }}>
                            <div>Faltan: {progress.missing}</div>
                            <div>Repetidas: {totalDuplicates}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 14 }}>
                        <ProgressBar value={progress.percentage} />
                    </div>
                </Card>
            </section>

            <section>
                <h2 className="section-title">Sección</h2>

                <select
                    className="select"
                    value={selectedSection?.id ?? ''}
                    onChange={(event) => onSelectedSectionChange(event.target.value)}
                >
                    {album.sections.map((section) => (
                        <option key={section.id} value={section.id}>
                            {section.flag ?? '📄'} {section.group ? `Grupo ${section.group} · ` : ''}
                            {section.name}
                        </option>
                    ))}
                </select>
            </section>

            <section style={{ marginTop: 16 }}>
                <Card>
                    {visibleSection ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                                <div>
                                    <strong>
                                        {visibleSection.flag} {visibleSection.name}
                                    </strong>

                                    <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                                        {sectionProgress?.owned ?? 0} / {sectionProgress?.total ?? 0} completas
                                    </p>
                                </div>

                                <strong>{sectionProgress?.percentage ?? 0}%</strong>
                            </div>

                            <StickerGrid
                                section={visibleSection}
                                stickers={stickers}
                                stickerById={stickerById}
                                onMarkOwned={onMarkOwned}
                                onRemoveOwned={onRemoveOwned}
                                onAddDuplicate={onAddDuplicate}
                                onRemoveDuplicate={onRemoveDuplicate}
                            />
                        </>
                    ) : (
                        <EmptyState
                            icon="📖"
                            title="Selecciona una sección"
                            description="Escoge una sección del álbum para ver sus láminas."
                        />
                    )}
                </Card>
            </section>
        </main>
    );
}