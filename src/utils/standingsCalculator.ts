import { Match, StandingTeam } from '../types';
import { normalizeEplTeamId } from '../context/ClubContext';

/**
 * Baseline team templates with verified names and official badges
 */
export const defaultClubTemplates: Record<string, { teamName: string; isHalaba: boolean; badgeUrl?: string }> = {
  cbe_sa: {
    teamName: 'Ethiopia Nigd Bank (CBE SA)',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/fn7am21727368578.png',
  },
  defence: {
    teamName: 'Mechal (Defence Force)',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/5760g91790265354.png',
  },
  bahirdar: {
    teamName: 'Bahir Dar Kenema',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/o25wvi1790265058.png',
  },
  halaba: {
    teamName: 'Halaba Ketema (በርበሬዎቹ)',
    isHalaba: true,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/ol9g9y1790265506.png',
  },
  fasil: {
    teamName: 'Fasil Kenema',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/xivgrb1790265423.png',
  },
  insurance: {
    teamName: 'Ethiopian Medhin (Insurance)',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/oboroa1776295149.png',
  },
  adama: {
    teamName: 'Adama Kenema SC',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/4yijrk1615830040.png',
  },
  shaggar: {
    teamName: 'Shaggar City FC',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/shaggar_city_epl.png',
  },
  electric: {
    teamName: 'Ethio Electric',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/nywmq91790265280.png',
  },
  bunna: {
    teamName: 'Ethiopian Coffee SC (Bunna)',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/welkj51790265316.png',
  },
  welwalo: {
    teamName: 'Welwalo Adigrat Univ.',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/w2p6k41790265538.png',
  },
  wolaitta: {
    teamName: 'Wolaitta Dicha',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/25m67g1790265481.png',
  },
  negelle: {
    teamName: 'Negele Arsi FC',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/negele_arsi_fc.png',
  },
  saintgeorge: {
    teamName: 'Saint George SC (Kidus Giorgis)',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/9d201v1615830018.png',
  },
  hawassa: {
    teamName: 'Hawassa Kenema SC',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/hawassa_city_sc.png',
  },
  hosaena: {
    teamName: 'Hadiya Hossana',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/9f0ozj1790265391.png',
  },
  sidama: {
    teamName: 'Sidama Coffee SC',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/t0057h1615830065.png',
  },
  gamochencha: {
    teamName: 'Gamo Chencha',
    isHalaba: false,
    badgeUrl: 'https://r2.thesportsdb.com/images/media/team/badge/o3yz391790265452.png',
  },
};

/**
 * Automatically computes official league table standings from all finished match fixtures
 */
export function calculateStandingsFromMatches(
  matches: Match[],
  currentStandings: StandingTeam[] = []
): StandingTeam[] {
  // Map of teamId -> stats accumulator
  const statsMap = new Map<string, {
    teamId: string;
    teamName: string;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goalsFor: number;
    goalsAgainst: number;
    points: number;
    form: ('W' | 'D' | 'L')[];
    isHalaba: boolean;
    badgeUrl?: string;
  }>();

  // 1. Initialize all 16 canonical clubs
  Object.entries(defaultClubTemplates).forEach(([id, meta]) => {
    const existing = currentStandings.find((s) => s.teamId === id);
    statsMap.set(id, {
      teamId: id,
      teamName: meta.teamName,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      points: 0,
      form: [],
      isHalaba: meta.isHalaba,
      badgeUrl: meta.badgeUrl || existing?.badgeUrl,
    });
  });

  // 2. Sort finished matches chronologically
  const finishedMatches = matches
    .filter((m) => m.status === 'FINISHED' && m.score !== undefined)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // 3. Process match outcomes
  finishedMatches.forEach((m) => {
    const homeId = normalizeEplTeamId(m.homeTeam.id, m.homeTeam.name);
    const awayId = normalizeEplTeamId(m.awayTeam.id, m.awayTeam.name);

    if (!statsMap.has(homeId)) {
      statsMap.set(homeId, {
        teamId: homeId,
        teamName: m.homeTeam.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: [],
        isHalaba: homeId === 'halaba' || m.homeTeam.isHalaba,
        badgeUrl: m.homeTeam.logo,
      });
    }

    if (!statsMap.has(awayId)) {
      statsMap.set(awayId, {
        teamId: awayId,
        teamName: m.awayTeam.name,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
        form: [],
        isHalaba: awayId === 'halaba' || m.awayTeam.isHalaba,
        badgeUrl: m.awayTeam.logo,
      });
    }

    const homeStats = statsMap.get(homeId)!;
    const awayStats = statsMap.get(awayId)!;
    const homeGoals = Number(m.score!.home) || 0;
    const awayGoals = Number(m.score!.away) || 0;

    homeStats.played += 1;
    awayStats.played += 1;
    homeStats.goalsFor += homeGoals;
    homeStats.goalsAgainst += awayGoals;
    awayStats.goalsFor += awayGoals;
    awayStats.goalsAgainst += homeGoals;

    if (homeGoals > awayGoals) {
      homeStats.won += 1;
      homeStats.points += 3;
      homeStats.form.push('W');
      awayStats.lost += 1;
      awayStats.form.push('L');
    } else if (homeGoals < awayGoals) {
      awayStats.won += 1;
      awayStats.points += 3;
      awayStats.form.push('W');
      homeStats.lost += 1;
      homeStats.form.push('L');
    } else {
      homeStats.drawn += 1;
      homeStats.points += 1;
      homeStats.form.push('D');
      awayStats.drawn += 1;
      awayStats.points += 1;
      awayStats.form.push('D');
    }
  });

  // 4. Convert to StandingTeam array
  const standingsList: StandingTeam[] = Array.from(statsMap.values()).map((s) => ({
    position: 1,
    teamId: s.teamId,
    teamName: s.teamName,
    played: s.played,
    won: s.won,
    drawn: s.drawn,
    lost: s.lost,
    goalsFor: s.goalsFor,
    goalsAgainst: s.goalsAgainst,
    goalDifference: s.goalsFor - s.goalsAgainst,
    points: s.points,
    form: (s.form.length > 0 ? s.form.slice(-5) : ['D', 'W', 'D']) as ('W' | 'D' | 'L')[],
    isHalaba: s.isHalaba,
    badgeUrl: s.badgeUrl,
  }));

  // 5. Canonical EPL sort order: Points DESC, Goal Difference DESC, Goals For DESC, Team Name ASC
  standingsList.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  // 6. Assign numerical rank position
  return standingsList.map((item, idx) => ({
    ...item,
    position: idx + 1,
  }));
}
