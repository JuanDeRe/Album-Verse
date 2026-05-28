import type { UserProfile } from '../core/profile/profile.types';
import { appStorage } from '../services/storage/appStorage';
import { storageKeys } from '../services/storage/storageKeys';

export const profileRepository = {
    async getProfile(): Promise<UserProfile | null> {
        return appStorage.get<UserProfile>(storageKeys.profile);
    },

    async saveProfile(profile: UserProfile | null): Promise<void> {
        if (!profile) {
            await appStorage.remove(storageKeys.profile);
            return;
        }

        await appStorage.set(storageKeys.profile, profile);
    },

    async clearProfile(): Promise<void> {
        await appStorage.remove(storageKeys.profile);
    },
};