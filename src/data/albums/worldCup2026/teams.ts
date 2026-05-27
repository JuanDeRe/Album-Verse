export interface Team {
    id: string;
    name: string;
    flag: string;
    group: string;
    host?: boolean;
}

export const teams: Team[] = [
    { id: 'mexico', name: 'Mexico', flag: '🇲🇽', group: 'A', host: true },
    { id: 'uzbekistan', name: 'Uzbekistan', flag: '🇺🇿', group: 'A' },
    { id: 'egypt', name: 'Egypt', flag: '🇪🇬', group: 'A' },
    { id: 'south-korea', name: 'South Korea', flag: '🇰🇷', group: 'A' },

    { id: 'canada', name: 'Canada', flag: '🇨🇦', group: 'B', host: true },
    { id: 'ecuador', name: 'Ecuador', flag: '🇪🇨', group: 'B' },
    { id: 'tunisia', name: 'Tunisia', flag: '🇹🇳', group: 'B' },
    { id: 'japan', name: 'Japan', flag: '🇯🇵', group: 'B' },

    { id: 'usa', name: 'USA', flag: '🇺🇸', group: 'C', host: true },
    { id: 'iran', name: 'Iran', flag: '🇮🇷', group: 'C' },
    { id: 'australia', name: 'Australia', flag: '🇦🇺', group: 'C' },
    { id: 'senegal', name: 'Senegal', flag: '🇸🇳', group: 'C' },

    { id: 'argentina', name: 'Argentina', flag: '🇦🇷', group: 'D' },
    { id: 'morocco', name: 'Morocco', flag: '🇲🇦', group: 'D' },
    { id: 'jordan', name: 'Jordan', flag: '🇯🇴', group: 'D' },
    { id: 'new-zealand', name: 'New Zealand', flag: '🇳🇿', group: 'D' },

    { id: 'france', name: 'France', flag: '🇫🇷', group: 'E' },
    { id: 'croatia', name: 'Croatia', flag: '🇭🇷', group: 'E' },
    { id: 'saudi-arabia', name: 'Saudi Arabia', flag: '🇸🇦', group: 'E' },
    { id: 'qatar', name: 'Qatar', flag: '🇶🇦', group: 'E' },

    { id: 'spain', name: 'Spain', flag: '🇪🇸', group: 'F' },
    { id: 'netherlands', name: 'Netherlands', flag: '🇳🇱', group: 'F' },
    { id: 'ghana', name: 'Ghana', flag: '🇬🇭', group: 'F' },
    { id: 'cape-verde', name: 'Cape Verde', flag: '🇨🇻', group: 'F' },

    { id: 'england', name: 'England', flag: '🏴', group: 'G' },
    { id: 'switzerland', name: 'Switzerland', flag: '🇨🇭', group: 'G' },
    { id: 'colombia', name: 'Colombia', flag: '🇨🇴', group: 'G' },
    { id: 'south-africa', name: 'South Africa', flag: '🇿🇦', group: 'G' },

    { id: 'brazil', name: 'Brazil', flag: '🇧🇷', group: 'H' },
    { id: 'portugal', name: 'Portugal', flag: '🇵🇹', group: 'H' },
    { id: 'norway', name: 'Norway', flag: '🇳🇴', group: 'H' },
    { id: 'curacao', name: 'Curaçao', flag: '🇨🇼', group: 'H' },

    { id: 'germany', name: 'Germany', flag: '🇩🇪', group: 'I' },
    { id: 'belgium', name: 'Belgium', flag: '🇧🇪', group: 'I' },
    { id: 'ivory-coast', name: 'Ivory Coast', flag: '🇨🇮', group: 'I' },
    { id: 'haiti', name: 'Haiti', flag: '🇭🇹', group: 'I' },

    { id: 'italy', name: 'Italy', flag: '🇮🇹', group: 'J' },
    { id: 'uruguay', name: 'Uruguay', flag: '🇺🇾', group: 'J' },
    { id: 'panama', name: 'Panama', flag: '🇵🇦', group: 'J' },
    { id: 'paraguay', name: 'Paraguay', flag: '🇵🇾', group: 'J' },

    { id: 'austria', name: 'Austria', flag: '🇦🇹', group: 'K' },
    { id: 'denmark', name: 'Denmark', flag: '🇩🇰', group: 'K' },
    { id: 'algeria', name: 'Algeria', flag: '🇩🇿', group: 'K' },
    { id: 'uganda', name: 'Uganda', flag: '🇺🇬', group: 'K' },

    { id: 'turkiye', name: 'Türkiye', flag: '🇹🇷', group: 'L' },
    { id: 'scotland', name: 'Scotland', flag: '🏴', group: 'L' },
    { id: 'nigeria', name: 'Nigeria', flag: '🇳🇬', group: 'L' },
    { id: 'costa-rica', name: 'Costa Rica', flag: '🇨🇷', group: 'L' },
];

export const teamsByGroup = teams.reduce<Record<string, Team[]>>((acc, team) => {
    acc[team.group] ??= [];
    acc[team.group].push(team);
    return acc;
}, {});