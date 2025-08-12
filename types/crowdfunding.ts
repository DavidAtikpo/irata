export type ContributionStatus = 'pending' | 'confirmed' | 'processed' | 'cancelled';

export interface BaseContribution {
  id: string;
  donorName: string;
  amount: number;
  type: 'preformation' | 'financial' | 'material';
  date: string;
  status: ContributionStatus;
}

export interface ContributionStats {
  totalRaised: number;
  goal: number;
  contributorCount: number;
  averageContribution: number;
  // Optional progress percentage for callers that precompute it
  progressPercentage?: number;
}


