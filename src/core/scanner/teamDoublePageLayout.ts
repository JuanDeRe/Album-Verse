export interface RelativeSlot {
    index: number;
    x: number;
    y: number;
    w: number;
    h: number;
}

/**
 * Layout experimental para doble página horizontal de equipos.
 *
 * Coordenadas relativas sobre la imagen recortada.
 *
 * Versión calibrada con fotos reales del álbum.
 * La página izquierda usa cajas más altas y menos anchas para evitar
 * superposición entre ARG5/ARG6 y ARG9/ARG10.
 */
export const TEAM_DOUBLE_PAGE_SLOTS: RelativeSlot[] = [
    // Página izquierda - fila superior
    // ARG1 / ARG2
    { index: 1, x: 0.250, y: 0.025, w: 0.115, h: 0.250 },
    { index: 2, x: 0.370, y: 0.025, w: 0.115, h: 0.250 },

    // Página izquierda - fila media
    // ARG3 / ARG4 / ARG5 / ARG6
    { index: 3, x: 0.015, y: 0.300, w: 0.115, h: 0.250 },
    { index: 4, x: 0.130, y: 0.300, w: 0.115, h: 0.250 },
    { index: 5, x: 0.250, y: 0.300, w: 0.115, h: 0.250 },
    { index: 6, x: 0.370, y: 0.300, w: 0.115, h: 0.250 },

    // Página izquierda - fila inferior
    // ARG7 / ARG8 / ARG9 / ARG10
    { index: 7, x: 0.015, y: 0.580, w: 0.115, h: 0.250 },
    { index: 8, x: 0.130, y: 0.580, w: 0.115, h: 0.250 },
    { index: 9, x: 0.250, y: 0.580, w: 0.115, h: 0.250 },
    { index: 10, x: 0.370, y: 0.580, w: 0.115, h: 0.250 },

    // Página derecha - fila superior
    // ARG11 / ARG12 / ARG13
    { index: 11, x: 0.535, y: 0.045, w: 0.115, h: 0.250 },
    { index: 12, x: 0.650, y: 0.045, w: 0.115, h: 0.250 },
    { index: 13, x: 0.805, y: 0.055, w: 0.155, h: 0.170 },

    // Página derecha - fila media
    // ARG14 / ARG15 / ARG16 / ARG17
    { index: 14, x: 0.535, y: 0.300, w: 0.115, h: 0.250 },
    { index: 15, x: 0.645, y: 0.300, w: 0.115, h: 0.250 },
    { index: 16, x: 0.760, y: 0.300, w: 0.115, h: 0.250 },
    { index: 17, x: 0.875, y: 0.300, w: 0.115, h: 0.250 },

    // Página derecha - fila inferior
    // ARG18 / ARG19 / ARG20
    { index: 18, x: 0.650, y: 0.580, w: 0.115, h: 0.250 },
    { index: 19, x: 0.770, y: 0.580, w: 0.115, h: 0.250 },
    { index: 20, x: 0.885, y: 0.580, w: 0.115, h: 0.250 },
];