import type { ScannerCropBox } from '../core/scanner/teamScanner.types';
import { appStorage } from '../services/storage/appStorage';
import { storageKeys } from '../services/storage/storageKeys';

interface ScannerSettings {
    cropsByLayoutId: Record<string, ScannerCropBox>;
}

const DEFAULT_SETTINGS: ScannerSettings = {
    cropsByLayoutId: {},
};

async function getSettings(): Promise<ScannerSettings> {
    return (await appStorage.get<ScannerSettings>(storageKeys.scannerSettings)) ?? DEFAULT_SETTINGS;
}

export const scannerSettingsRepository = {
    async getCropForLayout(layoutId: string): Promise<ScannerCropBox | null> {
        const settings = await getSettings();

        return settings.cropsByLayoutId[layoutId] ?? null;
    },

    async saveCropForLayout(layoutId: string, cropBox: ScannerCropBox): Promise<void> {
        const settings = await getSettings();

        await appStorage.set<ScannerSettings>(storageKeys.scannerSettings, {
            ...settings,
            cropsByLayoutId: {
                ...settings.cropsByLayoutId,
                [layoutId]: cropBox,
            },
        });
    },
};
