import { useMemo, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import type { UserProfile } from '../../core/profile/profile.types';
import { mascots, type Mascot } from '../../data/mascots';
import { teams, type Team } from '../../data/albums/worldCup2026/teams';
import type { CollectionBackup } from '../../core/backup/backup.types';

interface SettingsScreenProps {
    profile: UserProfile;
    onUpdateProfile: (profile: UserProfile) => void;
    onResetAlbum: () => void;
    onResetProfile: () => void;
    onCreateBackup: () => CollectionBackup;
    onRestoreBackup: (backup: CollectionBackup) => void;
    onBack: () => void;
}

export function SettingsScreen({
                                   profile,
                                   onUpdateProfile,
                                   onResetAlbum,
                                   onResetProfile,
                                   onCreateBackup,
                                   onRestoreBackup,
                                   onBack,
                               }: SettingsScreenProps) {
    const [name, setName] = useState(profile.name);
    const [selectedMascotId, setSelectedMascotId] = useState(profile.mascot.id);
    const [selectedTeamId, setSelectedTeamId] = useState(profile.favoriteTeam.id);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showProfileConfirm, setShowProfileConfirm] = useState(false);
    const [backupMessage, setBackupMessage] = useState<string | null>(null);
    const importInputRef = useRef<HTMLInputElement | null>(null);

    const selectedMascot = useMemo(
        () => mascots.find((mascot) => mascot.id === selectedMascotId) ?? profile.mascot,
        [selectedMascotId, profile.mascot],
    );

    const selectedTeam = useMemo(
        () => teams.find((team) => team.id === selectedTeamId) ?? profile.favoriteTeam,
        [selectedTeamId, profile.favoriteTeam],
    );

    function saveProfile() {
        onUpdateProfile({
            ...profile,
            name: name.trim() || profile.name,
            mascot: selectedMascot as Mascot,
            favoriteTeam: selectedTeam as Team,
        });
    }

    function confirmResetAlbum() {
        onResetAlbum();
        setShowResetConfirm(false);
    }

    function confirmResetProfile() {
        onResetProfile();
        setShowProfileConfirm(false);
    }

    function showTemporaryBackupMessage(message: string) {
        setBackupMessage(message);

        window.setTimeout(() => {
            setBackupMessage(null);
        }, 3000);
    }

    function exportBackup() {
        const backup = onCreateBackup();
        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const date = new Date().toISOString().slice(0, 10);
        const link = document.createElement('a');

        link.href = url;
        link.download = `sticker-album-backup-${date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);

        showTemporaryBackupMessage('Backup exportado correctamente.');
    }

    async function importBackupFile(file: File) {
        try {
            const text = await file.text();
            const parsed = JSON.parse(text) as CollectionBackup;

            onRestoreBackup(parsed);

            showTemporaryBackupMessage('Backup importado correctamente.');
        } catch (error) {
            console.error(error);
            showTemporaryBackupMessage('No se pudo importar el backup. Revisa el archivo.');
        }
    }

    return (
        <main>
            <button
                onClick={onBack}
                style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--color-primary)',
                    fontWeight: 800,
                    padding: 0,
                    marginBottom: 16,
                    cursor: 'pointer',
                }}
            >
                ← Volver
            </button>

            <h1 className="screen-title">Configuración</h1>
            <p className="screen-subtitle">
                Cambia tu perfil, mascota, equipo favorito y opciones del álbum.
            </p>

            <section>
                <h2 className="section-title">Perfil</h2>

                <Card>
                    <label style={{ display: 'block', marginBottom: 12 }}>
                        <strong style={{ display: 'block', marginBottom: 6 }}>Nombre</strong>
                        <input
                            className="input"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Tu nombre"
                        />
                    </label>

                    <label style={{ display: 'block', marginBottom: 12 }}>
                        <strong style={{ display: 'block', marginBottom: 6 }}>Mascota</strong>
                        <select
                            className="select"
                            value={selectedMascotId}
                            onChange={(event) => setSelectedMascotId(event.target.value)}
                        >
                            {mascots.map((mascot) => (
                                <option key={mascot.id} value={mascot.id}>
                                    {mascot.emoji} {mascot.name} · {mascot.country.es}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label style={{ display: 'block', marginBottom: 16 }}>
                        <strong style={{ display: 'block', marginBottom: 6 }}>Equipo favorito</strong>
                        <select
                            className="select"
                            value={selectedTeamId}
                            onChange={(event) => setSelectedTeamId(event.target.value)}
                        >
                            {teams.map((team) => (
                                <option key={team.id} value={team.id}>
                                    {team.flag} {team.name}
                                </option>
                            ))}
                        </select>
                    </label>

                    <Button fullWidth onClick={saveProfile}>
                        Guardar cambios
                    </Button>
                </Card>
            </section>

            <section>
                <h2 className="section-title">Datos</h2>

                <Card>
                    <p style={{ marginTop: 0, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                        Exporta tu colección para tener un respaldo o importa un backup anterior.
                    </p>

                    <div className="grid">
                        <Button fullWidth onClick={exportBackup}>
                            Exportar colección
                        </Button>

                        <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => importInputRef.current?.click()}
                        >
                            Importar colección
                        </Button>

                        <input
                            ref={importInputRef}
                            type="file"
                            accept="application/json,.json"
                            style={{ display: 'none' }}
                            onChange={(event) => {
                                const file = event.target.files?.[0];

                                if (file) {
                                    void importBackupFile(file);
                                }

                                event.target.value = '';
                            }}
                        />

                        {backupMessage && (
                            <p
                                style={{
                                    margin: 0,
                                    color: 'var(--color-text-muted)',
                                    fontSize: 13,
                                    textAlign: 'center',
                                }}
                            >
                                {backupMessage}
                            </p>
                        )}
                    </div>
                </Card>
            </section>

            <section>
                <h2 className="section-title">Álbum</h2>

                <Card>
                    <p style={{ marginTop: 0, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                        Reiniciar el álbum borrará tus estados de láminas, faltantes y repetidas.
                        Esta acción no borra tu perfil.
                    </p>

                    {!showResetConfirm ? (
                        <Button variant="danger" fullWidth onClick={() => setShowResetConfirm(true)}>
                            Reiniciar álbum
                        </Button>
                    ) : (
                        <div className="grid">
                            <p style={{ margin: 0, color: 'var(--color-danger)', fontWeight: 800 }}>
                                ¿Seguro que quieres reiniciar todo el álbum?
                            </p>

                            <Button variant="danger" fullWidth onClick={confirmResetAlbum}>
                                Sí, reiniciar álbum
                            </Button>

                            <Button variant="secondary" fullWidth onClick={() => setShowResetConfirm(false)}>
                                Cancelar
                            </Button>
                        </div>
                    )}
                </Card>
            </section>

            <section>
                <h2 className="section-title">Zona avanzada</h2>

                <Card style={{ borderColor: 'var(--color-danger)' }}>
                    <p style={{ marginTop: 0, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                        Restablecer perfil te devuelve al onboarding inicial. Tus datos del álbum
                        pueden mantenerse, pero tendrás que escoger nombre, mascota y equipo de nuevo.
                    </p>

                    {!showProfileConfirm ? (
                        <Button variant="secondary" fullWidth onClick={() => setShowProfileConfirm(true)}>
                            Restablecer perfil
                        </Button>
                    ) : (
                        <div className="grid">
                            <p style={{ margin: 0, color: 'var(--color-danger)', fontWeight: 800 }}>
                                ¿Seguro que quieres restablecer tu perfil?
                            </p>

                            <Button variant="danger" fullWidth onClick={confirmResetProfile}>
                                Sí, restablecer perfil
                            </Button>

                            <Button variant="secondary" fullWidth onClick={() => setShowProfileConfirm(false)}>
                                Cancelar
                            </Button>
                        </div>
                    )}
                </Card>
            </section>
        </main>
    );
}