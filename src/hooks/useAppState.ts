import { useEffect, useMemo, useState } from 'react';
import type { ActivityEvent } from '../core/activity/activity.types';
import type { UserProfile } from '../core/profile/profile.types';
import type { UserStickerMap } from '../core/album/album.types';
import {
    addDuplicate,
    createInitialStickerMap,
    markStickerMissing,
    markStickerOwned,
    removeDuplicate,
} from '../core/album/stickerStatus';
import { worldCup2026Album } from '../data/albums/worldCup2026';
import { appStorage } from '../services/storage/appStorage';
import { storageKeys } from '../services/storage/storageKeys';
import type { AppTab } from '../components/BottomTabs';

function createId() {
    return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createActivity(
    type: ActivityEvent['type'],
    title: string,
    description?: string,
): ActivityEvent {
    return {
        id: createId(),
        type,
        title,
        description,
        createdAt: new Date().toISOString(),
    };
}

export function useAppState() {
    const album = worldCup2026Album;

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [stickers, setStickers] = useState<UserStickerMap>(() =>
        createInitialStickerMap(album.stickers.map((sticker) => sticker.id)),
    );
    const [activity, setActivity] = useState<ActivityEvent[]>([]);
    const [activeTab, setActiveTab] = useState<AppTab>('album');
    const [previousTab, setPreviousTab] = useState<AppTab>('album');
    const [selectedAlbumSectionId, setSelectedAlbumSectionId] = useState(
        album.sections[0]?.id ?? '',
    );
    const [isReady, setIsReady] = useState(false);


    useEffect(() => {
        async function load() {
            const savedProfile = await appStorage.get<UserProfile>(storageKeys.profile);
            const savedStickers = await appStorage.get<UserStickerMap>(storageKeys.stickers);
            const savedActivity = await appStorage.get<ActivityEvent[]>(storageKeys.activity);
            const savedActiveTab = await appStorage.get<AppTab>(storageKeys.activeTab);
            const savedSelectedAlbumSectionId = await appStorage.get<string>(
                storageKeys.selectedAlbumSectionId,
            );

            if (savedProfile) setProfile(savedProfile);
            if (savedStickers) setStickers(savedStickers);
            if (savedActivity) setActivity(savedActivity);
            if (savedActiveTab) setActiveTab(savedActiveTab);
            if (savedSelectedAlbumSectionId) {
                setSelectedAlbumSectionId(savedSelectedAlbumSectionId)
            }

            setIsReady(true);
        }

        void load();
    }, []);

    useEffect(() => {
        if (!isReady) return;
        void appStorage.set(storageKeys.profile, profile);
    }, [profile, isReady]);

    useEffect(() => {
        if (!isReady) return;
        void appStorage.set(storageKeys.stickers, stickers);
    }, [stickers, isReady]);

    useEffect(() => {
        if (!isReady) return;
        void appStorage.set(storageKeys.activity, activity);
    }, [activity, isReady]);

    useEffect(() => {
        if (!isReady) return;
        if (activeTab !== 'settings') {
            void appStorage.set(storageKeys.activeTab, activeTab);
        }
    }, [activeTab, isReady]);

    useEffect(() => {
        if (!isReady) return;
        void appStorage.set(storageKeys.selectedAlbumSectionId, selectedAlbumSectionId);
    }, [selectedAlbumSectionId, isReady]);

    const stickerById = useMemo(
        () => Object.fromEntries(album.stickers.map((sticker) => [sticker.id, sticker])),
        [album.stickers],
    );

    function addActivity(event: ActivityEvent) {
        setActivity((current) => [event, ...current].slice(0, 100));
    }

    function completeOnboarding(nextProfile: UserProfile) {
        setProfile(nextProfile);
        addActivity(
            createActivity(
                'profile_created',
                'Perfil creado',
                `${nextProfile.name} eligió a ${nextProfile.mascot.name} y apoya a ${nextProfile.favoriteTeam.name}.`,
            ),
        );
    }

    function updateProfile(nextProfile: UserProfile) {
        setProfile(nextProfile);
        addActivity(createActivity('profile_created', 'Perfil actualizado'));
    }

    function openSettings() {
        setPreviousTab(activeTab === 'settings' ? 'album' : activeTab);
        setActiveTab('settings');
    }

    function closeSettings() {
        setActiveTab(previousTab === 'settings' ? 'album' : previousTab);
    }

    function markOwned(stickerId: string) {
        setStickers((current) => {
            const sticker = current[stickerId];
            if (!sticker) return current;

            const updated = markStickerOwned(sticker);

            addActivity(
                createActivity(
                    'sticker_updated',
                    `Lámina agregada`,
                    `Marcaste ${stickerId} como conseguida.`,
                ),
            );

            return {
                ...current,
                [stickerId]: updated,
            };
        });
    }

    function removeOwned(stickerId: string) {
        setStickers((current) => {
            const sticker = current[stickerId];
            if (!sticker) return current;

            const updated = markStickerMissing(sticker);

            addActivity(
                createActivity(
                    'sticker_updated',
                    `Lámina quitada`,
                    `${stickerId} volvió a faltantes.`,
                ),
            );

            return {
                ...current,
                [stickerId]: updated,
            };
        });
    }

    function incrementDuplicate(stickerId: string) {
        setStickers((current) => {
            const sticker = current[stickerId];
            if (!sticker) return current;

            const updated = addDuplicate(sticker);

            addActivity(
                createActivity(
                    'duplicate_updated',
                    `Repetida agregada`,
                    `Ahora tienes ${updated.quantityDuplicate} repetida(s) de ${stickerId}.`,
                ),
            );

            return {
                ...current,
                [stickerId]: updated,
            };
        });
    }

    function decrementDuplicate(stickerId: string) {
        setStickers((current) => {
            const sticker = current[stickerId];
            if (!sticker) return current;

            const updated = removeDuplicate(sticker);

            addActivity(
                createActivity(
                    'duplicate_updated',
                    `Repetida quitada`,
                    `Ahora tienes ${updated.quantityDuplicate} repetida(s) de ${stickerId}.`,
                ),
            );

            return {
                ...current,
                [stickerId]: updated,
            };
        });
    }

    function resetAlbum() {
        setStickers(createInitialStickerMap(album.stickers.map((sticker) => sticker.id)));
        addActivity(createActivity('album_reset', 'Álbum reiniciado'));
    }

    function resetProfile() {
        setProfile(null);
        setActivity([]);
        setActiveTab('album');
    }

    function clearActivity() {
        setActivity([]);
    }

    return {
        isReady,
        album,
        profile,
        stickers,
        activity,
        activeTab,
        selectedAlbumSectionId,
        stickerById,
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
        clearActivity,
    };
}