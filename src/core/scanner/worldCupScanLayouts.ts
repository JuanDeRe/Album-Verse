import type { ScannerPageLayout, ScannerSlotLayout } from './teamScanner.types';
import { TEAM_DOUBLE_PAGE_SLOTS } from './teamDoublePageLayout';

function createSlots(stickerIds: string[]): ScannerSlotLayout[] {
    return stickerIds.map((stickerId, index) => {
        const template = TEAM_DOUBLE_PAGE_SLOTS[index];

        return {
            stickerId,
            x: template?.x ?? 0.1,
            y: template?.y ?? 0.1,
            w: template?.w ?? 0.1,
            h: template?.h ?? 0.1,
        };
    });
}

function withProfile(
    slots: ScannerSlotLayout[],
    detectionProfile: ScannerPageLayout['detectionProfile'],
): ScannerSlotLayout[] {
    return slots.map((slot) => ({
        ...slot,
        detectionProfile,
    }));
}


/**
 * Layouts fijos para secciones que no son equipos.
 * Las coordenadas son placeholders iniciales.
 * Tú luego ajustas x/y/w/h según las fotos reales.
 */
export const FIXED_WORLD_CUP_SCAN_LAYOUTS: ScannerPageLayout[] = [
    {
        id: 'intro-panini-fwc-1-4',
        label: 'We Are Panini + FWC 1-4',
        description: 'Doble página inicial: 00 + FWC1-FWC4.',
        detectionProfile: 'intro',
        slots: withProfile(
            [
            { stickerId: '00', x: 0.200, y: 0.070, w: 0.160, h: 0.215 },

            { stickerId: 'FWC1', x: 0.840, y: 0.110, w: 0.140, h: 0.190 },
            { stickerId: 'FWC2', x: 0.840, y: 0.300, w: 0.140, h: 0.190 },
            { stickerId: 'FWC3', x: 0.840, y: 0.505, w: 0.140, h: 0.190 },
            { stickerId: 'FWC4', x: 0.875, y: 0.710, w: 0.110, h: 0.250 },
        ],
            'intro',
        ),
    },

    {
        id: 'fwc-5-8',
        label: 'FIFA World Cup 2026 · FWC 5-8',
        description: 'Doble página con FWC5-FWC8.',
        detectionProfile: 'intro',
        slots: withProfile([
            { stickerId: 'FWC5', x: 0.190, y: 0.195, w: 0.115, h: 0.250 },
            { stickerId: 'FWC6', x: 0.300, y: 0.730, w: 0.115, h: 0.250 },

            { stickerId: 'FWC7', x: 0.567, y: 0.055, w: 0.115, h: 0.250 },
            { stickerId: 'FWC8', x: 0.813, y: 0.460, w: 0.115, h: 0.250 },
        ],
        'intro',
        ),
    },

    {
        id: 'host-countries-fwc-5-8',
        label: 'Host Countries and Cities · FWC 5-8',
        description:
            'Doble página compartida con FWC5-FWC8. Útil para escanear la sección de países anfitriones.',
        detectionProfile: 'host-countries',
        slots: withProfile(
            [
                { stickerId: 'FWC5', x: 0.190, y: 0.195, w: 0.115, h: 0.250 },
                { stickerId: 'FWC6', x: 0.300, y: 0.730, w: 0.115, h: 0.250 },

                { stickerId: 'FWC7', x: 0.567, y: 0.055, w: 0.115, h: 0.250 },
                { stickerId: 'FWC8', x: 0.813, y: 0.460, w: 0.115, h: 0.250 },
            ],
            'host-countries',
        ),
    },


    {
        id: 'history-9-13',
        label: 'FIFA World Cup History · FWC 9-13',
        description: 'Doble página history 1: FWC9-FWC13.',
        detectionProfile: 'history',
        slots: withProfile([
            { stickerId: 'FWC9', x: 0.285, y: 0.395, w: 0.150, h: 0.200 },
            { stickerId: 'FWC10', x: 0.285, y: 0.690, w: 0.150, h: 0.200 },

            { stickerId: 'FWC11', x: 0.545, y: 0.120, w: 0.150, h: 0.200 },
            { stickerId: 'FWC12', x: 0.545, y: 0.400, w: 0.150, h: 0.200 },
            { stickerId: 'FWC13', x: 0.770, y: 0.695, w: 0.150, h: 0.200 },
        ],
            'history',
        ),
    },

    {
        id: 'history-14-19',
        label: 'FIFA World Cup History · FWC 14-19',
        description: 'Doble página history 2: FWC14-FWC19.',
        detectionProfile: 'history',
        slots: withProfile([
            { stickerId: 'FWC14', x: 0.057, y: 0.405, w: 0.150, h: 0.200 },
            { stickerId: 'FWC15', x: 0.057, y: 0.700, w: 0.150, h: 0.200 },

            { stickerId: 'FWC16', x: 0.545, y: 0.085, w: 0.150, h: 0.200 },
            { stickerId: 'FWC17', x: 0.775, y: 0.085, w: 0.150, h: 0.200 },
            { stickerId: 'FWC18', x: 0.775, y: 0.400, w: 0.150, h: 0.200 },
            { stickerId: 'FWC19', x: 0.775, y: 0.690, w: 0.150, h: 0.200 },
        ],
            'history',
        ),
    },

    {
        id: 'coca-cola-1-14',
        label: 'Coca-Cola · CC1-CC14',
        description: 'Doble página Coca-Cola.',
        detectionProfile: 'coca-cola',
        slots: withProfile([
            // Página izquierda: CC1-CC6
            { stickerId: 'CC1', x: 0.054, y: 0.345, w: 0.110, h: 0.250 },
            { stickerId: 'CC2', x: 0.203, y: 0.310, w: 0.110, h: 0.250 },
            { stickerId: 'CC3', x: 0.350, y: 0.260, w: 0.110, h: 0.250 },

            { stickerId: 'CC4', x: 0.060, y: 0.675, w: 0.110, h: 0.250 },
            { stickerId: 'CC5', x: 0.203, y: 0.640, w: 0.110, h: 0.250 },
            { stickerId: 'CC6', x: 0.350, y: 0.600, w: 0.110, h: 0.250 },

            // Página derecha: CC7-CC14
            { stickerId: 'CC7', x: 0.554, y: 0.010, w: 0.110, h: 0.250 },
            { stickerId: 'CC8', x: 0.715, y: 0.010, w: 0.110, h: 0.250 },
            { stickerId: 'CC9', x: 0.860, y: 0.065, w: 0.110, h: 0.250 },
            { stickerId: 'CC10', x: 0.554, y: 0.350, w: 0.110, h: 0.250 },

            { stickerId: 'CC11', x: 0.710, y: 0.350, w: 0.110, h: 0.250 },
            { stickerId: 'CC12', x: 0.855, y: 0.400, w: 0.110, h: 0.250 },
            { stickerId: 'CC13', x: 0.554, y: 0.680, w: 0.110, h: 0.250 },
            { stickerId: 'CC14', x: 0.710, y: 0.680, w: 0.110, h: 0.250 },
        ],
            'coca-cola',
        ),

    },
];

export function createTeamScanLayout(
    stickerIds: string[],
    sectionName: string,
): ScannerPageLayout {
    return {
        id: `team-${sectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
        label: `${sectionName} · Equipo completo`,
        description: 'Doble página normal de equipo.',
        detectionProfile: 'team',
        slots: createSlots(stickerIds.slice(0, 20)).map((slot) => ({
            ...slot,
            detectionProfile: 'team',
        })),
    };
}

export function getFixedLayoutsForSectionName(sectionName: string): ScannerPageLayout[] {
    if (sectionName === 'We Are Panini') {
        return FIXED_WORLD_CUP_SCAN_LAYOUTS.filter((layout) =>
            ['intro-panini-fwc-1-4'].includes(layout.id),
        );
    }

    if (sectionName === 'FIFA World Cup 2026') {
        return FIXED_WORLD_CUP_SCAN_LAYOUTS.filter((layout) =>
            ['intro-panini-fwc-1-4', 'fwc-5-8'].includes(layout.id),
        );
    }

    if (sectionName === 'Host Countries and Cities') {
        return FIXED_WORLD_CUP_SCAN_LAYOUTS.filter((layout) =>
            ['host-countries-fwc-5-8'].includes(layout.id),
        );
    }

    if (sectionName === 'FIFA World Cup History') {
        return FIXED_WORLD_CUP_SCAN_LAYOUTS.filter((layout) =>
            ['history-9-13', 'history-14-19'].includes(layout.id),
        );
    }

    if (sectionName === 'Coca-Cola') {
        return FIXED_WORLD_CUP_SCAN_LAYOUTS.filter((layout) => layout.id === 'coca-cola-1-14');
    }

    return [];
}
