import type { AppStorage } from './storage.types';

const PREFIX = 'sticker-album:';

export const browserStorage: AppStorage = {
    async get<T>(key: string): Promise<T | null> {
        try {
            const raw = localStorage.getItem(`${PREFIX}${key}`);
            return raw ? (JSON.parse(raw) as T) : null;
        } catch {
            return null;
        }
    },

    async set<T>(key: string, value: T): Promise<void> {
        localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
    },

    async remove(key: string): Promise<void> {
        localStorage.removeItem(`${PREFIX}${key}`);
    },
};