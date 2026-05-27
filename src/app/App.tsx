import { BottomTabs } from '../components/BottomTabs';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { AlbumScreen } from '../features/album/AlbumScreen';
import { SwapsScreen } from '../features/swaps/SwapsScreen';
import { ActivityScreen } from '../features/activity/ActivityScreen';
import { ScannerScreen } from '../features/scanner/ScannerScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { useAppState } from '../hooks/useAppState';

export function App() {
  const {
    isReady,
    album,
    profile,
    stickers,
    activity,
    activeTab,
    setActiveTab,
    completeOnboarding,
    updateProfile,
    openSettings,
    closeSettings,
    markOwned,
    removeOwned,
    incrementDuplicate,
    decrementDuplicate,
    resetAlbum,
    resetProfile,
  } = useAppState();

  if (!isReady) {
    return (
        <main className="app-shell">
          <div className="app-container">
            <p>Cargando colección...</p>
          </div>
        </main>
    );
  }

  if (!profile) {
    return <OnboardingScreen onComplete={completeOnboarding} />;
  }

  return (
      <main
          className="app-shell"
          style={
            {
              '--mascot-primary': profile.mascot.primary,
              '--mascot-primary-dark': profile.mascot.primaryDark,
              '--mascot-soft': profile.mascot.primarySoft,
              '--color-primary': profile.mascot.primary,
              '--color-primary-dark': profile.mascot.primaryDark,
              '--color-primary-soft': profile.mascot.primarySoft,
            } as React.CSSProperties
          }
      >
        <div className="app-container">
          {activeTab !== 'settings' && (
              <header style={{ marginBottom: 22 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                  <div>
                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontWeight: 700 }}>
                      Hola, {profile.name}
                    </p>
                    <strong>
                      {profile.mascot.emoji} {profile.mascot.name} · {profile.favoriteTeam.flag}{' '}
                      {profile.favoriteTeam.name}
                    </strong>
                  </div>

                  <button
                      onClick={openSettings}
                      aria-label="Abrir configuración"
                      title="Configuración"
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 14,
                        border: '1px solid var(--mascot-primary)',
                        background: 'var(--color-surface)',
                        color: 'var(--color-text)',
                        fontSize: 20,
                        cursor: 'pointer',
                      }}
                  >
                    ⚙️
                  </button>
                </div>
              </header>
          )}

          {activeTab === 'settings' && (
              <SettingsScreen
                  profile={profile}
                  onUpdateProfile={updateProfile}
                  onResetAlbum={resetAlbum}
                  onResetProfile={resetProfile}
                  onBack={closeSettings}
              />
          )}

          {activeTab === 'scanner' && <ScannerScreen />}

          {activeTab === 'album' && (
              <AlbumScreen
                  album={album}
                  stickers={stickers}
                  onMarkOwned={markOwned}
                  onRemoveOwned={removeOwned}
                  onAddDuplicate={incrementDuplicate}
                  onRemoveDuplicate={decrementDuplicate}
              />
          )}

          {activeTab === 'swaps' && (
              <SwapsScreen
                  album={album}
                  stickers={stickers}
                  onAddDuplicate={incrementDuplicate}
                  onRemoveDuplicate={decrementDuplicate}
              />
          )}

          {activeTab === 'activity' && <ActivityScreen activity={activity} />}
        </div>

        {activeTab !== 'settings' && <BottomTabs activeTab={activeTab} onChange={setActiveTab} />}
      </main>
  );
}