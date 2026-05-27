export interface LocalizedText {
    es: string;
    en: string;
}

export interface Mascot {
    id: string;
    name: string;
    role: LocalizedText;
    country: LocalizedText;
    flag: string;
    emoji: string;
    primary: string;
    primaryDark: string;
    primarySoft: string;
    species: LocalizedText;
    type: string;
}

export const mascots: Mascot[] = [
    {
        id: 'bruno',
        name: 'Bruno',
        role: {
            es: 'Arquero',
            en: 'Goalkeeper',
        },
        country: {
            es: 'Canadá',
            en: 'Canada',
        },
        flag: '🇨🇦',
        emoji: '🫎',
        primary: '#E63946',
        primaryDark: '#A02633',
        primarySoft: '#FEE2E4',
        species: {
            es: 'Alce',
            en: 'Moose',
        },
        type: 'Ice/Normal',
    },
    {
        id: 'tito',
        name: 'Tito',
        role: {
            es: 'Delantero',
            en: 'Forward',
        },
        country: {
            es: 'México',
            en: 'Mexico',
        },
        flag: '🇲🇽',
        emoji: '🐆',
        primary: '#15803D',
        primaryDark: '#0B4D26',
        primarySoft: '#DCFCE7',
        species: {
            es: 'Jaguar',
            en: 'Jaguar',
        },
        type: 'Grass/Dark',
    },
    {
        id: 'liberty',
        name: 'Liberty',
        role: {
            es: 'Mediocampista',
            en: 'Midfielder',
        },
        country: {
            es: 'Estados Unidos',
            en: 'USA',
        },
        flag: '🇺🇸',
        emoji: '🦅',
        primary: '#3B82F6',
        primaryDark: '#1D4ED8',
        primarySoft: '#DBEAFE',
        species: {
            es: 'Águila',
            en: 'Bald Eagle',
        },
        type: 'Flying/Electric',
    },
];