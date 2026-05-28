import { Capacitor } from '@capacitor/core';
import {
    CapacitorSQLite,
    SQLiteConnection,
    type SQLiteDBConnection,
} from '@capacitor-community/sqlite';
import { createSchemaSql, DATABASE_NAME } from './schema';

let db: SQLiteDBConnection | null = null;

export async function getSQLiteDatabase(): Promise<SQLiteDBConnection | null> {
    if (!Capacitor.isNativePlatform()) {
        return null;
    }

    if (db) {
        return db;
    }

    const sqlite = new SQLiteConnection(CapacitorSQLite);

    const connection = await sqlite.createConnection(
        DATABASE_NAME,
        false,
        'no-encryption',
        1,
        false,
    );

    await connection.open();
    await connection.execute(createSchemaSql);

    db = connection;

    return db;
}