export type ActivityType =
    | 'profile_created'
    | 'sticker_updated'
    | 'duplicate_updated'
    | 'scan_completed'
    | 'album_reset'
    | 'backup_imported';

export interface ActivityEvent {
    id: string;
    type: ActivityType;
    title: string;
    description?: string;
    createdAt: string;
    metadata?: Record<string, unknown>;
}