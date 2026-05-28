import type { AppStorage } from './storage.types';
import { getSQLiteDatabase } from '../database/sqliteClient';

export const sqliteKeyValueStorage: AppStorage = {
    async get<T>(key: string): Promise<T | null> {
        const db = await getSQLiteDatabase();
        if (!db) return null;

        const result = await db.query(
            'SELECT value FROM app_settings WHERE key = ? LIMIT 1',
            [key],
        );

        const value = result.values?.[0]?.value;

        if (!value) return null;

        return JSON.parse(value) as T;
    },

    async set<T>(key: string, value: T): Promise<void> {
        const db = await getSQLiteDatabase();
        if (!db) return;

        const now = new Date().toISOString();

        await db.run(
            `
      INSERT INTO app_settings (key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key)
      DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `,
            [key, JSON.stringify(value), now],
        );
    },

    async remove(key: string): Promise<void> {
        const db = await getSQLiteDatabase();
        if (!db) return;

        await db.run('DELETE FROM app_settings WHERE key = ?', [key]);
    },
};