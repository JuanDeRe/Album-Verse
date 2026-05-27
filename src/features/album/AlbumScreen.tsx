import { useState } from 'react';
import type { Album, UserStickerMap } from '../../core/album/album.types';
import { calculateAlbumProgress, calculateSectionProgress } from '../../core/album/albumProgress';
import { Card } from '../../components/Card';
import { ProgressBar } from '../../components/ProgressBar';
import { StickerGrid } from './StickerGrid';

interface AlbumScreenProps {
    album: Album;
    stickers: UserStickerMap;
    onMarkOwned: (stickerId: string) => void;
    onRemoveOwned: (stickerId: string) => void;
    onAddDuplicate: (stickerId: string) => void;
    onRemoveDuplicate: (stickerId: string) => void;
}

export function AlbumScreen({
                                album,
                                stickers,
                                onMarkOwned,
                                onRemoveOwned,
                                onAddDuplicate,
                                onRemoveDuplicate,
                            }: AlbumScreenProps) {
    const [selectedSectionId, setSelectedSectionId] = useState(album.sections[0]?.id ?? '');
    const progress = calculateAlbumProgress(stickers);
    const selectedSection =
        album.sections.find((section) => section.id === selectedSectionId) ?? album.sections[0];

    const sectionProgress = selectedSection
        ? calculateSectionProgress(selectedSection, stickers)
        : null;

    return (
        <main>
            <h1 className="screen-title">{album.name}</h1>
            <p className="screen-subtitle">
                Todas empiezan como faltantes. Toca una lámina para marcar que la tienes.
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
                            <div>Sin revisar: {progress.unknown}</div>
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
                    value={selectedSectionId}
                    onChange={(event) => setSelectedSectionId(event.target.value)}
                >
                    {album.sections.map((section) => (
                        <option key={section.id} value={section.id}>
                            {section.flag ?? '📄'} {section.group ? `Grupo ${section.group} · ` : ''}
                            {section.name}
                        </option>
                    ))}
                </select>
            </section>

            {selectedSection && (
                <section style={{ marginTop: 16 }}>
                    <Card>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <div>
                                <strong>
                                    {selectedSection.flag} {selectedSection.name}
                                </strong>
                                <p style={{ margin: '4px 0 0', color: 'var(--color-text-muted)', fontSize: 13 }}>
                                    {sectionProgress?.owned ?? 0} / {sectionProgress?.total ?? 0} completas
                                </p>
                            </div>
                            <strong>{sectionProgress?.percentage ?? 0}%</strong>
                        </div>

                        <StickerGrid
                            section={selectedSection}
                            stickers={stickers}
                            onMarkOwned={onMarkOwned}
                            onRemoveOwned={onRemoveOwned}
                            onAddDuplicate={onAddDuplicate}
                            onRemoveDuplicate={onRemoveDuplicate}
                        />
                    </Card>
                </section>
            )}
        </main>
    );
}