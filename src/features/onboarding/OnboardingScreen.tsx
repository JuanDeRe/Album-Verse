import { useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import type { UserProfile } from '../../core/profile/profile.types';
import { mascots, type Mascot } from '../../data/mascots';
import { teams, type Team } from '../../data/albums/worldCup2026/teams';

interface OnboardingScreenProps {
    onComplete: (profile: UserProfile) => void;
}

type OnboardingStep = 0 | 1 | 2;

const steps = [
    {
        title: 'Escoge tu mascota',
        subtitle: 'Tu mascota acompañará tu colección y personalizará algunos detalles visuales.',
    },
    {
        title: '¿Cómo te llamas?',
        subtitle: 'Usaremos tu nombre para personalizar la experiencia dentro de la app.',
    },
    {
        title: 'Equipo favorito',
        subtitle: 'Escoge el equipo que vas a apoyar durante la colección.',
    },
];
const REGION_TO_TEAM_ID: Record<string, string> = {
    AR: 'argentina',
    AU: 'australia',
    AT: 'austria',
    BE: 'belgium',
    BR: 'brazil',
    CA: 'canada',
    CO: 'colombia',
    CR: 'costa-rica',
    HR: 'croatia',
    DK: 'denmark',
    EC: 'ecuador',
    EG: 'egypt',
    FR: 'france',
    DE: 'germany',
    GH: 'ghana',
    IR: 'iran',
    JP: 'japan',
    KR: 'south-korea',
    MX: 'mexico',
    MA: 'morocco',
    NL: 'netherlands',
    NZ: 'new-zealand',
    NO: 'norway',
    PA: 'panama',
    PY: 'paraguay',
    PT: 'portugal',
    QA: 'qatar',
    SA: 'saudi-arabia',
    SN: 'senegal',
    ZA: 'south-africa',
    ES: 'spain',
    CH: 'switzerland',
    TN: 'tunisia',
    TR: 'turkiye',
    US: 'usa',
    UY: 'uruguay',
    UZ: 'uzbekistan',
};

const TIMEZONE_TO_TEAM_ID: Record<string, string> = {
    'America/Bogota': 'colombia',
    'America/Mexico_City': 'mexico',
    'America/Monterrey': 'mexico',
    'America/Tijuana': 'mexico',
    'America/New_York': 'usa',
    'America/Chicago': 'usa',
    'America/Denver': 'usa',
    'America/Los_Angeles': 'usa',
    'America/Toronto': 'canada',
    'America/Vancouver': 'canada',
    'America/Argentina/Buenos_Aires': 'argentina',
    'America/Sao_Paulo': 'brazil',
    'America/Guayaquil': 'ecuador',
    'America/Montevideo': 'uruguay',
    'America/Asuncion': 'paraguay',
    'America/Panama': 'panama',
    'Europe/Madrid': 'spain',
    'Europe/Paris': 'france',
    'Europe/Berlin': 'germany',
    'Europe/Rome': 'italy',
    'Europe/Lisbon': 'portugal',
    'Europe/Amsterdam': 'netherlands',
    'Europe/Brussels': 'belgium',
    'Europe/Zurich': 'switzerland',
    'Europe/Vienna': 'austria',
    'Europe/Zagreb': 'croatia',
    'Europe/Istanbul': 'turkiye',
    'Africa/Cairo': 'egypt',
    'Africa/Casablanca': 'morocco',
    'Africa/Tunis': 'tunisia',
    'Africa/Dakar': 'senegal',
    'Asia/Tokyo': 'japan',
    'Asia/Seoul': 'south-korea',
    'Asia/Tehran': 'iran',
    'Asia/Qatar': 'qatar',
    'Asia/Riyadh': 'saudi-arabia',
    'Asia/Tashkent': 'uzbekistan',
    'Australia/Sydney': 'australia',
    'Pacific/Auckland': 'new-zealand',
};

function getRegionFromLocaleValue(locale: string): string | null {
    const normalizedLocale = locale.replace('_', '-');
    const parts = normalizedLocale.split('-');

    // Ej: es-CO -> CO, en-US -> US
    const possibleRegion = parts.find((part) => part.length === 2 && part === part.toUpperCase());

    return possibleRegion ?? null;
}

function getDefaultFavoriteTeam(): Team | null {
    const localeCandidates = [
        navigator.language,
        ...Array.from(navigator.languages ?? []),
        Intl.DateTimeFormat().resolvedOptions().locale,
    ].filter(Boolean);

    for (const locale of localeCandidates) {
        const region = getRegionFromLocaleValue(locale);

        if (!region) continue;

        const teamId = REGION_TO_TEAM_ID[region];

        if (!teamId) continue;

        const team = teams.find((item) => item.id === teamId);

        if (team) return team;
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const teamIdFromTimeZone = TIMEZONE_TO_TEAM_ID[timeZone];

    if (teamIdFromTimeZone) {
        return teams.find((item) => item.id === teamIdFromTimeZone) ?? null;
    }

    return null;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
    const [step, setStep] = useState<OnboardingStep>(0);
    const [name, setName] = useState('');
    const [selectedMascot, setSelectedMascot] = useState<Mascot | null>(null);
    const defaultFavoriteTeam = getDefaultFavoriteTeam();

    const [selectedTeam, setSelectedTeam] = useState<Team | null>(defaultFavoriteTeam);
    const [suggestedTeamId, setSuggestedTeamId] = useState<string | null>(
        defaultFavoriteTeam?.id ?? null,
    );

    const [teamSearch, setTeamSearch] = useState('');

    const currentStep = steps[step];

    const filteredTeams = teams.filter((team) => {
        const search = teamSearch.trim().toLowerCase();

        if (!search) return true;

        return team.name.toLowerCase().includes(search);
    });

    const canContinue =
        step === 0
            ? Boolean(selectedMascot)
            : step === 1
                ? Boolean(name.trim())
                : Boolean(selectedTeam);

    function goNext() {
        if (!canContinue) return;

        if (step < 2) {
            setStep((current) => (current + 1) as OnboardingStep);
            return;
        }

        handleComplete();
    }

    function goBack() {
        if (step === 0) return;
        setStep((current) => (current - 1) as OnboardingStep);
    }

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
                <section
                    style={{
                        minHeight: 'calc(100vh - 130px)',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div style={{ marginBottom: 28 }}>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: 8,
                                marginBottom: 24,
                            }}
                        >
                            {[0, 1, 2].map((item) => {
                                const active = item === step;
                                const completed = item < step;

                                return (
                                    <div
                                        key={item}
                                        style={{
                                            height: 6,
                                            width: active ? 34 : 18,
                                            borderRadius: 999,
                                            background:
                                                active || completed
                                                    ? 'var(--color-primary)'
                                                    : 'var(--color-border)',
                                            transition: 'width 180ms ease, background 180ms ease',
                                        }}
                                    />
                                );
                            })}
                        </div>

                        <p className="section-title">Paso {step + 1} de 3</p>
                        <h1 className="screen-title">{currentStep.title}</h1>
                        <p className="screen-subtitle">{currentStep.subtitle}</p>
                    </div>

                    <div style={{ flex: 1 }}>
                        {step === 0 && (
                            <div className="grid">
                                {mascots.map((mascot) => {
                                    const selected = selectedMascot?.id === mascot.id;

                                    return (
                                        <button
                                            key={mascot.id}
                                            onClick={() => setSelectedMascot(mascot)}
                                            style={{
                                                border: `2px solid ${
                                                    selected ? mascot.primary : 'var(--color-border)'
                                                }`,
                                                background: selected ? mascot.primaryDark : 'var(--color-surface)',
                                                color: selected ? '#FFFFFF' : 'var(--color-text)',
                                                borderRadius: 20,
                                                padding: 14,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 14,
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                boxShadow: selected ? `0 0 0 1px ${mascot.primary}` : 'none',
                                            }}
                                        >
                      <span
                          style={{
                              width: 58,
                              height: 58,
                              borderRadius: 18,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: selected
                                  ? 'rgba(255,255,255,0.14)'
                                  : 'var(--color-surface-alt)',
                              fontSize: 34,
                              flexShrink: 0,
                          }}
                      >
                        {mascot.emoji}
                      </span>

                                            <span style={{ flex: 1, minWidth: 0 }}>
                        <strong
                            style={{
                                display: 'block',
                                fontSize: 18,
                                marginBottom: 4,
                            }}
                        >
                          {mascot.name}
                        </strong>

                        <small
                            style={{
                                color: selected ? 'rgba(255,255,255,0.82)' : 'var(--color-text-muted)',
                                lineHeight: 1.35,
                            }}
                        >
                          {mascot.flag} {mascot.species.es} · {mascot.role.es}
                        </small>
                      </span>

                                            <span
                                                aria-hidden="true"
                                                style={{
                                                    width: 28,
                                                    height: 28,
                                                    borderRadius: '50%',
                                                    border: selected
                                                        ? '1px solid rgba(255,255,255,0.7)'
                                                        : '1px solid var(--color-border)',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 900,
                                                    color: selected ? '#FFFFFF' : 'transparent',
                                                    flexShrink: 0,
                                                }}
                                            >
                        ✓
                      </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {step === 1 && (
                            <Card>
                                <div className="grid">
                                    {selectedMascot && (
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 12,
                                                padding: 12,
                                                borderRadius: 16,
                                                background: 'var(--color-surface-alt)',
                                            }}
                                        >
                                            <span style={{ fontSize: 32 }}>{selectedMascot.emoji}</span>

                                            <div>
                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color: 'var(--color-text-muted)',
                                                        fontSize: 12,
                                                        fontWeight: 800,
                                                    }}
                                                >
                                                    Tu mascota
                                                </p>

                                                <strong>
                                                    {selectedMascot.name} {selectedMascot.flag}
                                                </strong>
                                            </div>
                                        </div>
                                    )}

                                    <label>
                                        <strong style={{ display: 'block', marginBottom: 8 }}>
                                            Nombre
                                        </strong>

                                        <input
                                            className="input"
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' && name.trim()) {
                                                    goNext();
                                                }
                                            }}
                                            placeholder="Ej: Juan"
                                            autoFocus
                                            autoCapitalize="words"
                                            autoComplete="given-name"
                                        />
                                    </label>
                                </div>
                            </Card>
                        )}

                        {step === 2 && (
                            <div className="grid">
                                <Card>
                                    <label>
                                        <strong style={{ display: 'block', marginBottom: 8 }}>
                                            Buscar equipo
                                        </strong>

                                        <input
                                            className="input"
                                            value={teamSearch}
                                            onChange={(event) => setTeamSearch(event.target.value)}
                                            placeholder="Ej: Colombia, Argentina, Mexico..."
                                        />

                                        {selectedTeam && suggestedTeamId === selectedTeam.id && (
                                            <p
                                                style={{
                                                    margin: '10px 0 0',
                                                    color: 'var(--color-text-muted)',
                                                    fontSize: 13,
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                Sugerimos {selectedTeam.flag} {selectedTeam.name} según la región del dispositivo. Puedes cambiarlo si quieres.
                                            </p>
                                        )}
                                    </label>
                                </Card>
                                <div
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                                        gap: 10,
                                    }}
                                >
                                    {filteredTeams.map((team) => {

                                        const selected = selectedTeam?.id === team.id;

                                        return (
                                            <button
                                                key={team.id}
                                                onClick={() => {
                                                    setSelectedTeam(team);
                                                    setSuggestedTeamId(null);
                                                }}
                                                style={{
                                                    border: selected
                                                        ? '1.5px solid var(--color-primary)'
                                                        : '1px solid var(--color-border)',
                                                    borderRadius: 16,
                                                    background: selected ? 'var(--color-primary)' : 'var(--color-surface)',
                                                    color: selected ? '#FFFFFF' : 'var(--color-text)',
                                                    padding: 12,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    textAlign: 'left',
                                                    cursor: 'pointer',
                                                    minHeight: 58,
                                                }}
                                            >
                                                <span style={{ fontSize: 22 }}>{team.flag}</span>

                                                <span style={{ flex: 1, minWidth: 0 }}>
    <strong
        style={{
            display: 'block',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: 13,
        }}
    >
      {team.name}
    </strong>
  </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: step === 0 ? '1fr' : 'auto 1fr',
                            gap: 10,
                            marginTop: 24,
                            paddingBottom: 'env(safe-area-inset-bottom)',
                        }}
                    >
                        {step > 0 && (
                            <Button variant="secondary" onClick={goBack}>
                                Atrás
                            </Button>
                        )}

                        <Button fullWidth disabled={!canContinue} onClick={goNext}>
                            {step === 2 ? 'Empezar colección' : 'Continuar'}
                        </Button>
                    </div>
                </section>
            </div>
        </main>
    );
}