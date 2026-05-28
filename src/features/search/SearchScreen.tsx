import { useMemo, useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { EmptyState } from '../../components/EmptyState';
import { StatusPill } from '../../components/StatusPill';
import type { Album, Sticker, UserStickerMap } from '../../core/album/album.types';

type SearchFilter = 'all' | 'missing' | 'owned' | 'duplicates';

interface SearchScreenProps {
    album: Album;
    stickers: UserStickerMap;
    onMarkOwned: (stickerId: string) => void;
    onRemoveOwned: (stickerId: string) => void;
    onAddDuplicate: (stickerId: string) => void;
    onRemoveDuplicate: (stickerId: string) => void;
}

function normalize(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '');
}

function matchesFilter(stickerId: string, stickers: UserStickerMap, filter: SearchFilter): boolean {
    const userSticker = stickers[stickerId];

    if (!userSticker) return false;

    if (filter === 'all') return true;
    if (filter === 'missing') return userSticker.status !== 'owned';
    if (filter === 'owned') return userSticker.status === 'owned';
    if (filter === 'duplicates') return userSticker.quantityDuplicate > 0;

    return true;
}

function matchesSearch(sticker: Sticker, searchTerm: string): boolean {
    const normalizedSearch = normalize(searchTerm.trim());

    if (!normalizedSearch) return false;

    const searchableText = normalize(
        [
            sticker.id,
            sticker.code,
            sticker.name,
            sticker.team,
            sticker.displayLabel,
        ].join(' '),
    );

    return searchableText.includes(normalizedSearch);
}

export function SearchScreen({
                                 album,
                                 stickers,
                                 onMarkOwned,
                                 onRemoveOwned,
                                 onAddDuplicate,
                                 onRemoveDuplicate,
                             }: SearchScreenProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<SearchFilter>('all');
    const sectionById = useMemo(
        () => Object.fromEntries(album.sections.map((section) => [section.id, section])),
        [album.sections],
    );

    const results = useMemo(() => {
        const trimmedSearch = searchTerm.trim();

        if (!trimmedSearch) return [];

        return album.stickers
            .filter((sticker) => matchesSearch(sticker, trimmedSearch))
            .filter((sticker) => matchesFilter(sticker.id, stickers, filter))
            .slice(0, 80);
    }, [album.stickers, filter, searchTerm, stickers]);

    const filterButtons: Array<{ id: SearchFilter; label: string }> = [
        { id: 'all', label: 'Todas' },
        { id: 'missing', label: 'Faltan' },
        { id: 'owned', label: 'Tengo' },
        { id: 'duplicates', label: 'Repetidas' },
    ];

    return (
        <main>
            <h1 className="screen-title">Buscar láminas</h1>
            <p className="screen-subtitle">
                Busca por país, jugador, código o sección. Ej: Colombia, Messi, COL20, Official Ball.
            </p>

            <section>
                <h2 className="section-title">Búsqueda global</h2>

                <input
                    className="input"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar en todo el álbum..."
                    autoCapitalize="none"
                />

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(4, 1fr)',
                        gap: 8,
                        marginTop: 10,
                    }}
                >
                    {filterButtons.map((item) => {
                        const selected = item.id === filter;

                        return (
                            <button
                                key={item.id}
                                onClick={() => setFilter(item.id)}
                                style={{
                                    border: selected
                                        ? '1px solid var(--color-primary)'
                                        : '1px solid var(--color-border)',
                                    borderRadius: 12,
                                    background: selected ? 'var(--color-primary)' : 'var(--color-surface)',
                                    color: selected ? '#FFFFFF' : 'var(--color-text-muted)',
                                    padding: '9px 6px',
                                    fontSize: 12,
                                    fontWeight: 900,
                                    cursor: 'pointer',
                                }}
                            >
                                {item.label}
                            </button>
                        );
                    })}
                </div>
            </section>

            <section style={{ marginTop: 18 }}>
                {!searchTerm.trim() ? (
                    <Card>
                        <EmptyState
                            icon="🔍"
                            title="Busca en todo el álbum"
                            description="Escribe un código, nombre de jugador, país o sección para ver resultados."
                        />
                    </Card>
                ) : results.length === 0 ? (
                    <Card>
                        <EmptyState
                            icon="📭"
                            title="No encontramos resultados"
                            description="Prueba con otro texto o cambia el filtro seleccionado."
                        />
                    </Card>
                ) : (
                    <div className="grid">
                        {results.map((catalogSticker) => {
                            const userSticker = stickers[catalogSticker.id];

                            if (!userSticker) return null;

                            const isOwned = userSticker.status === 'owned';
                            const section = sectionById[catalogSticker.sectionId];

                            return (
                                <Card key={catalogSticker.id}>
                                    <div style={{ display: 'grid', gap: 12 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                gap: 12,
                                                alignItems: 'flex-start',
                                            }}
                                        >
                                            <div>
                                                <strong style={{ display: 'block', fontSize: 18 }}>
                                                    {catalogSticker.code}
                                                </strong>

                                                <p
                                                    style={{
                                                        margin: '4px 0 0',
                                                        color: 'var(--color-text)',
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    {catalogSticker.name}
                                                </p>

                                                <p
                                                    style={{
                                                        margin: '4px 0 0',
                                                        color: 'var(--color-text-muted)',
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {section?.flag ?? '📄'} {catalogSticker.team}
                                                </p>
                                            </div>

                                            <StatusPill status={userSticker.status} />
                                        </div>

                                        {isOwned ? (
                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr auto',
                                                    gap: 10,
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 8,
                                                    }}
                                                >
                                                    <button
                                                        onClick={() => onRemoveDuplicate(catalogSticker.id)}
                                                        disabled={userSticker.quantityDuplicate <= 0}
                                                        style={{
                                                            width: 36,
                                                            height: 36,
                                                            borderRadius: 12,
                                                            border: '1px solid var(--color-border)',
                                                            background: 'var(--color-surface-alt)',
                                                            color: 'var(--color-text)',
                                                            fontSize: 20,
                                                            fontWeight: 900,
                                                            opacity: userSticker.quantityDuplicate <= 0 ? 0.45 : 1,
                                                            cursor:
                                                                userSticker.quantityDuplicate <= 0 ? 'not-allowed' : 'pointer',
                                                        }}
                                                    >
                                                        -
                                                    </button>

                                                    <strong
                                                        style={{
                                                            color: 'var(--color-text-muted)',
                                                            fontSize: 13,
                                                        }}
                                                    >
                                                        rep {userSticker.quantityDuplicate}
                                                    </strong>

                                                    <button
                                                        onClick={() => onAddDuplicate(catalogSticker.id)}
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

                                                <Button
                                                    variant="secondary"
                                                    onClick={() => onRemoveOwned(catalogSticker.id)}
                                                    style={{ padding: '10px 12px' }}
                                                >
                                                    Quitar
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button fullWidth onClick={() => onMarkOwned(catalogSticker.id)}>
                                                Marcar como tengo
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}

                        {results.length >= 80 && (
                            <Card>
                                <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
                                    Mostrando los primeros 80 resultados. Escribe una búsqueda más específica para
                                    reducir la lista.
                                </p>
                            </Card>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}