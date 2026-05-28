import type { UserStickerMap } from '../core/album/album.types';
import { appStorage } from '../services/storage/appStorage';
import { storageKeys } from '../services/storage/storageKeys';

export const stickerRepository = {
    async getStickers(): Promise<UserStickerMap | null> {
        return appStorage.get<UserStickerMap>(storageKeys.stickers);
    },

    async saveStickers(stickers: UserStickerMap): Promise<void> {
        await appStorage.set(storageKeys.stickers, stickers);
    },

    async clearStickers(): Promise<void> {
        await appStorage.remove(storageKeys.stickers);
    },
};