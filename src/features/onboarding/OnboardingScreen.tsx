import { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import type { UserProfile } from '../../core/profile/profile.types';
import { mascots, type Mascot } from '../../data/mascots';
import { teams, type Team } from '../../data/albums/worldCup2026/teams';

interface OnboardingScreenProps {
    onComplete: (profile: UserProfile) => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [name, setName] = useState('');
    const [selectedMascot, setSelectedMascot] = useState<Mascot | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

    const canContinue = name.trim() && selectedMascot && selectedTeam;

    function handleComplete() {
        if (!selectedMascot || !selectedTeam || !name.trim()) return;

        onComplete({
            name: name.trim(),
            mascot: selectedMascot,
            favoriteTeam: selectedTeam,
            createdAt: new Date().toISOString(),
        });
    }

    return (
        <main className="app-shell">
            <div className="app-container">
                <p className="section-title">Bienvenido</p>
                <h1 className="screen-title">Organiza tu álbum</h1>
                <p className="screen-subtitle">
                    Escoge tu mascota, tu nombre y tu equipo favorito para empezar.
                </p>

                <section>
                    <h2 className="section-title">1. Tu nombre</h2>
                    <input
                        className="input"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Ej: Juan"
                    />
                </section>

                <section>
                    <h2 className="section-title">2. Escoge mascota</h2>
                    <div className="grid">
                        {mascots.map((mascot) => {
                            const selected = selectedMascot?.id === mascot.id;

                            return (
                                <button
                                    key={mascot.id}
                                    onClick={() => setSelectedMascot(mascot)}
                                    style={{
                                        border: `2px solid ${selected ? mascot.primary : 'var(--color-border)'}`,
                                        background: selected ? mascot.primarySoft : 'var(--color-surface)',
                                        color: selected ? '#09090B' : 'var(--color-text)',
                                        borderRadius: 18,
                                        padding: 14,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 14,
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                    }}
                                >
                                    <span style={{ fontSize: 42 }}>{mascot.emoji}</span>
                                    <span>
                    <strong style={{ display: 'block' }}>{mascot.name}</strong>
                    <small>
                      {mascot.flag} {mascot.species.es} · {mascot.role.es}
                    </small>
                  </span>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section>
                    <h2 className="section-title">3. Equipo favorito</h2>
                    <Card>
                        <select
                            className="select"
                            value={selectedTeam?.id ?? ''}
                            onChange={(event) => {
                                const team = teams.find((item) => item.id === event.target.value) ?? null;
                                setSelectedTeam(team);
                            }}
                        >
                            <option value="">Selecciona un equipo</option>
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.flag} Grupo {team.group} · {team.name}
                                </option>
                            ))}
                        </select>
                    </Card>
                </section>

                <div style={{ marginTop: 24 }}>
                    <Button fullWidth disabled={!canContinue} onClick={handleComplete}>
                        Empezar colección
                    </Button>
                </div>
            </div>
        </main>
    );
}