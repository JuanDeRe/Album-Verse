import type { ReactNode } from 'react';

export type AppTab = 'scanner' | 'album' | 'swaps' | 'activity' | 'settings';

interface BottomTabsProps {
    activeTab: AppTab;
    onChange: (tab: AppTab) => void;
}

function IconWrapper({ children }: { children: ReactNode }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                width: 22,
                height: 22,
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
      {children}
    </span>
    );
}

function ScanIcon() {
    return (
        <IconWrapper>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <path
                    d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.2-1.6A1 1 0 0 1 10 4h4a1 1 0 0 1 .8.4L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8Z"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                <circle cx="12" cy="12.5" r="3.2" stroke="currentColor" strokeWidth="2" />
            </svg>
        </IconWrapper>
    );
}

function AlbumIcon() {
    return (
        <IconWrapper>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <path
                    d="M5 4.5h10.5A3.5 3.5 0 0 1 19 8v11.5H8.5A3.5 3.5 0 0 1 5 16V4.5Z"
                    stroke="currentColor"
                    strokeWidth="2"
                />
                <path d="M8 8h7M8 11.5h7M8 15h5" stroke="currentColor" strokeWidth="2" />
            </svg>
        </IconWrapper>
    );
}

function SwapsIcon() {
    return (
        <IconWrapper>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <path
                    d="M7 7h10l-2.5-2.5M17 17H7l2.5 2.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M17 7a5 5 0 0 1 0 10M7 17a5 5 0 0 1 0-10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </IconWrapper>
    );
}

function ActivityIcon() {
    return (
        <IconWrapper>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
                <path
                    d="M12 7.5V12l3 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
            </svg>
        </IconWrapper>
    );
}

const tabs: Array<{
    id: Exclude<AppTab, 'settings'>;
    label: string;
    icon: ReactNode;
}> = [
    { id: 'scanner', label: 'Scan', icon: <ScanIcon /> },
    { id: 'album', label: 'Álbum', icon: <AlbumIcon /> },
    { id: 'swaps', label: 'Repetidas', icon: <SwapsIcon /> },
    { id: 'activity', label: 'Actividad', icon: <ActivityIcon /> },
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
                            border: isActive ? '1px solid var(--mascot-primary)' : '1px solid transparent',
                            borderRadius: 14,
                            background: isActive ? 'var(--bottom-tab-active-bg)' : 'transparent',
                            color: isActive ? 'var(--bottom-tab-active-text)' : 'var(--color-text-muted)',
                            padding: '8px 4px',
                            cursor: 'pointer',
                            fontSize: 11,
                            fontWeight: 800,
                            transition: 'background 160ms ease, color 160ms ease, border-color 160ms ease',
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 2 }}>
                            {tab.icon}
                        </div>
                        {tab.label}
                    </button>
                );
            })}
        </nav>
    );
}