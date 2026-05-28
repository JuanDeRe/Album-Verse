import type { ActivityEvent } from '../core/activity/activity.types';
import { appStorage } from '../services/storage/appStorage';
import { storageKeys } from '../services/storage/storageKeys';

export const activityRepository = {
    async getActivity(): Promise<ActivityEvent[] | null> {
        return appStorage.get<ActivityEvent[]>(storageKeys.activity);
    },

    async saveActivity(activity: ActivityEvent[]): Promise<void> {
        await appStorage.set(storageKeys.activity, activity);
    },

    async clearActivity(): Promise<void> {
        await appStorage.remove(storageKeys.activity);
    },
};