import type { AppTab } from '../components/BottomTabs';
import { appStorage } from '../services/storage/appStorage';
import { storageKeys } from '../services/storage/storageKeys';

export const settingsRepository = {
  async getActiveTab(): Promise<AppTab | null> {
    return appStorage.get<AppTab>(storageKeys.activeTab);
  },

  async saveActiveTab(activeTab: AppTab): Promise<void> {
    if (activeTab === 'settings') return;

    await appStorage.set(storageKeys.activeTab, activeTab);
  },

  async getSelectedAlbumSectionId(): Promise<string | null> {
    return appStorage.get<string>(storageKeys.selectedAlbumSectionId);
  },

  async saveSelectedAlbumSectionId(sectionId: string): Promise<void> {
    await appStorage.set(storageKeys.selectedAlbumSectionId, sectionId);
  },

  async clearSettings(): Promise<void> {
    await appStorage.remove(storageKeys.activeTab);
    await appStorage.remove(storageKeys.selectedAlbumSectionId);
  },
};