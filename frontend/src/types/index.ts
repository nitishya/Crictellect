// Shared TypeScript types for Crictellect

export interface MatchInfo {
  team_a: string;
  team_b: string;
  status: string;
  venue: string;
  toss: string;
}

export interface LiveScore {
  team_a_total: number;
  team_a_wickets: number;
  team_a_overs: number;
  team_b_total: number;
  team_b_wickets: number;
  team_b_overs: number;
  current_run_rate: number;
  required_run_rate: number;
  target: number;
}

export interface BatterStat {
  name: string;
  runs: number;
  balls: number;
}

export interface Partnership {
  runs: number;
  balls: number;
  player1: BatterStat;
  player2: BatterStat;
}

export interface MatchData {
  match_info: MatchInfo;
  live_score: LiveScore;
  partnership: Partnership;
}

export interface MomentumPoint {
  over: number;
  momentum: number;
  win_prob_a: number;
  win_prob_b: number;
}

export interface Player {
  id: number;
  name: string;
  team: string;
  runs: number;
  strike_rate: number;
  average: number;
  boundaries: number;
  recent_form: number[];
}

export interface TeamStats {
  win_percentage: number;
  powerplay_sr: number;
  death_over_sr: number;
  chase_success: number;
}

export interface FantasyPick {
  name: string;
  reasoning: string;
}

export interface FantasyData {
  top_captain: FantasyPick;
  top_vice_captain: FantasyPick;
  differential: FantasyPick;
}

export interface InsightMessage {
  query: string;
  response: string;
}
