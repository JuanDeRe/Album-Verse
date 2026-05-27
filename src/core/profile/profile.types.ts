import type { Mascot } from '../../data/mascots';
import type { Team } from '../../data/albums/worldCup2026/teams';

export interface UserProfile {
    name: string;
    mascot: Mascot;
    favoriteTeam: Team;
    createdAt: string;
}