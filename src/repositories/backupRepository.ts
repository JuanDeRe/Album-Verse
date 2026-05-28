import type { AppTab } from '../components/BottomTabs';
import type { ActivityEvent } from '../core/activity/activity.types';
import type { Album, UserStickerMap } from '../core/album/album.types';
import { createInitialStickerMap } from '../core/album/stickerStatus';
import type { CollectionBackup } from '../core/backup/backup.types';
import type { UserProfile } from '../core/profile/profile.types';

interface CreateBackupInput {
    album: Album;
    profile: UserProfile | null;
    stickers: UserStickerMap;
    activity: ActivityEvent[];
    activeTab: AppTab;
    selectedAlbumSectionId: string;
}

interface RestoreBackupInput {
    album: Album;
    backup: CollectionBackup;
}

interface RestoredBackupState {
    profile: UserProfile | null;
    stickers: UserStickerMap;
    activity: ActivityEvent[];
    selectedAlbumSectionId: string;
    activeTab: AppTab;
}

export const backupRepository = {
    createBackup({
                     album,
                     profile,
                     stickers,
                     activity,
                     activeTab,
                     selectedAlbumSectionId,
                 }: CreateBackupInput): CollectionBackup {
        return {
            backupVersion: 1,
            exportedAt: new Date().toISOString(),
            albumId: album.id,
            albumSchemaVersion: album.schemaVersion,
            profile,
            stickers,
            activity,
            activeTab,
            selectedAlbumSectionId,
        };
    },

    restoreBackup({ album, backup }: RestoreBackupInput): RestoredBackupState {
        if (!backup || backup.backupVersion !== 1) {
            throw new Error('Formato de backup no soportado.');
        }

        if (backup.albumId !== album.id) {
            throw new Error('Este backup pertenece a otro álbum.');
        }

        const currentStickerIds = new Set(album.stickers.map((sticker) => sticker.id));
        const initialStickerMap = createInitialStickerMap(album.stickers.map((sticker) => sticker.id));

        for (const [stickerId, userSticker] of Object.entries(backup.stickers ?? {})) {
            if (currentStickerIds.has(stickerId)) {
                initialStickerMap[stickerId] = userSticker;
            }
        }

        const validSectionIds = new Set(album.sections.map((section) => section.id));

        const selectedAlbumSectionId =
            backup.selectedAlbumSectionId && validSectionIds.has(backup.selectedAlbumSectionId)
                ? backup.selectedAlbumSectionId
                : album.sections[0]?.id ?? '';

        const allowedTabs: AppTab[] = ['scanner', 'search', 'album', 'swaps', 'activity'];

        const activeTab = allowedTabs.includes(backup.activeTab as AppTab)
            ? (backup.activeTab as AppTab)
            : 'album';

        return {
            profile: backup.profile ?? null,
            stickers: initialStickerMap,
            activity: backup.activity ?? [],
            selectedAlbumSectionId,
            activeTab,
        };
    },
};