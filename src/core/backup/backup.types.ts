import type { ActivityEvent } from '../activity/activity.types';
import type { UserStickerMap } from '../album/album.types';
import type { UserProfile } from '../profile/profile.types';

export interface CollectionBackup {
    backupVersion: 1;
    exportedAt: string;
    albumId: string;
    albumSchemaVersion: number;
    profile: UserProfile | null;
    stickers: UserStickerMap;
    activity: ActivityEvent[];
    activeTab?: string;
    selectedAlbumSectionId?: string;
}
