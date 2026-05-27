export type AppTab = 'scanner' | 'album' | 'swaps' | 'activity' | 'settings';

interface BottomTabsProps {
    activeTab: AppTab;
    onChange: (tab: AppTab) => void;
}

const tabs: Array<{ id: Exclude<AppTab, 'settings'>; label: string; icon: string }> = [
    { id: 'scanner', label: 'Scan', icon: '📷' },
    { id: 'album', label: 'Álbum', icon: '📖' },
    { id: 'swaps', label: 'Repetidas', icon: '🔁' },
    { id: 'activity', label: 'Actividad', icon: '🕒' },
];

export function BottomTabs({ activeTab, onChange }: BottomTabsProps) {
    return (
        <nav
            style={{
                position: 'fixed',
                left: 12,
                right: 12,
                bottom: 'calc(12px + env(safe-area-inset-bottom))',
                maxWidth: 520,
                margin: '0 auto',
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 20,
                padding: 8,
                boxShadow: '0 16px 40px rgba(15, 23, 42, 0.18)',
                zIndex: 20,
            }}
        >
            {tabs.map((tab) => {
                const isActive = tab.id === activeTab;

                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        style={{
                            border: 'none',
                            borderRadius: 14,
                            background: isActive ? 'var(--color-primary-soft)' : 'transparent',
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            padding: '8px 4px',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: 800,
                        }}
                    >
                        <div style={{ fontSize: 18 }}>{tab.icon}</div>
                        {tab.label}
                    </button>
                );
            })}
        </nav>
    );
}