import { Capacitor } from '@capacitor/core';
import type { AppStorage } from './storage.types';
import { browserStorage } from './browserStorage';
import { sqliteKeyValueStorage } from './sqliteKeyValueStorage';

export const appStorage: AppStorage = {
    async get<T>(key: string): Promise<T | null> {
        if (Capacitor.isNativePlatform()) {
            const value = await sqliteKeyValueStorage.get<T>(key);
            return value;
        }

        return browserStorage.get<T>(key);
    },

    async set<T>(key: string, value: T): Promise<void> {
        if (Capacitor.isNativePlatform()) {
            await sqliteKeyValueStorage.set(key, value);
            return;
        }

        await browserStorage.set(key, value);
    },

    async remove(key: string): Promise<void> {
        if (Capacitor.isNativePlatform()) {
            await sqliteKeyValueStorage.remove(key);
            return;
        }

        await browserStorage.remove(key);
    },
};