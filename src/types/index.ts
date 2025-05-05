export type Candidate = string;

export type VotePercentages = {
  [candidate: string]: number;
};

export type IdeologyType = 'progressive' | 'moderate' | 'conservative';

export type CandidateIdeology = {
  [candidate: string]: IdeologyType;
};

export type IdeologyModifiers = {
  [ideology in IdeologyType]: {
    [candidate: string]: number;
  }
};

export type PreferenceMatrix = {
  [voter: string]: {
    [ranked: string]: number;
  }
};

export type RoundResult = {
  round: number;
  votes: VotePercentages;
  remainingPercentages: VotePercentages;
  previousRoundPercentages?: VotePercentages;
  votesGained: VotePercentages;
  eliminated: string | null;
  exhaustedVotes?: number;
  votesToRedistribute?: number;
  isLastRound?: boolean;
  totalVotesRemaining: number;
  activeVotesTotal: number;
};

export type Winner = {
  candidate: string;
  votes: number;
  percentage: number;
  remainingPercentage: number;
  finalRound: number;
  totalInitialVotes: number;
  totalRemainingVotes: number;
};