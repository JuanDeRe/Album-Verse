import { BottomTabs } from '../components/BottomTabs';
import { OnboardingScreen } from '../features/onboarding/OnboardingScreen';
import { AlbumScreen } from '../features/album/AlbumScreen';
import { SwapsScreen } from '../features/swaps/SwapsScreen';
import { ActivityScreen } from '../features/activity/ActivityScreen';
import { ScannerScreen } from '../features/scanner/ScannerScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { useAppState } from '../hooks/useAppState';
function SettingsIcon() {
    return (
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
            <path
                d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z"
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M19.4 13.5c.1-.5.1-1 .1-1.5s0-1-.1-1.5l2-1.5-2-3.5-2.4 1a8.2 8.2 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.5A8.2 8.2 0 0 0 7 6.5l-2.4-1-2 3.5 2 1.5A9.9 9.9 0 0 0 4.5 12c0 .5 0 1 .1 1.5l-2 1.5 2 3.5 2.4-1a8.2 8.2 0 0 0 2.6 1.5L10 21.5h4l.4-2.5a8.2 8.2 0 0 0 2.6-1.5l2.4 1 2-3.5-2-1.5Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
            />
        </svg>
    );
}
export function App() {
    const {
        isReady,
        album,
        profile,
        stickers,
        activity,
        activeTab,
        selectedAlbumSectionId,
        setActiveTab,
        setSelectedAlbumSectionId,
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
              '--bottom-tab-active-bg': profile.mascot.primaryDark,
              '--bottom-tab-active-text': '#FFFFFF',
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
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            color: 'var(--color-text)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        <SettingsIcon />
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
                  selectedSectionId={selectedAlbumSectionId}
                  onSelectedSectionChange={setSelectedAlbumSectionId}
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