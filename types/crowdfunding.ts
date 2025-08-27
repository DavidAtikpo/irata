export type ContributionStatus = 'pending' | 'confirmed' | 'processed' | 'cancelled';

export interface BaseContribution {
  id: string;
  donorName: string;
  amount: number;
  type: 'preformation' | 'financial' | 'material';
  date: string;
  status: ContributionStatus;
}

export interface FullContribution extends BaseContribution {
  donorEmail: string;
  donorPhone?: string;
  returnAmount: number;
  returnDescription?: string;
  paymentMethod: string;
  notes?: string;
  userId?: string;
  stripePaymentIntentId?: string;
}

export interface ContributionStats {
  totalRaised: number;
  goal: number;
  contributorCount: number;
  averageContribution: number;
  progressPercentage?: number;
}

export interface InvestorStats extends ContributionStats {
  myTotalInvestment: number;
  myExpectedReturn: number;
  nextMilestone: {
    name: string;
    amount: number;
    progress: number;
  };
}

export interface ProjectUpdate {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'progress' | 'financial' | 'milestone' | 'communication';
  images?: string[];
  impact: 'low' | 'medium' | 'high';
}

export interface InvestmentFormData {
  name: string;
  email: string;
  phone?: string;
  amount: number;
  contributionType: 'preformation' | 'financial' | 'material';
  acceptTerms: boolean;
  marketingConsent: boolean;
}

export interface PaymentIntentData {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  contributionType: string;
  returnAmount: number;
  returnDescription: string;
  contributorName: string;
  contributorEmail: string;
}

export interface FinancingOption {
  id: 'preformation' | 'financial' | 'material';
  title: string;
  description: string;
  icon: string;
  baseReturn: number;
  returnType: 'discount' | 'interest' | 'material';
  minAmount: number;
  maxAmount: number;
  currency: string;
}

export interface TrustDocument {
  id: string;
  title: string;
  description: string;
  size: string;
  pages: string;
  category: 'Stratégie' | 'Légal' | 'Finances' | 'Qualité' | 'Infrastructure' | 'Risques';
  downloadUrl: string;
  preview: {
    sections: string[];
  };
}

export interface TeamMember {
  name: string;
  role: string;
  experience: string;
  certifications: string[];
  photo: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ContributionsResponse {
  contributions: FullContribution[];
  stats: ContributionStats;
  pagination?: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ProjectUpdatesResponse {
  updates: ProjectUpdate[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
    stats: {
      totalUpdates: number;
      recentHighImpact: number;
      categoryCounts: {
        progress: number;
        financial: number;
        milestone: number;
        communication: number;
      };
    };
  };
}

export interface InvestorDashboardData {
  investments: FullContribution[];
  stats: InvestorStats;
  recentUpdates: ProjectUpdate[];
}

export const FINANCING_OPTIONS: FinancingOption[] = [
  {
    id: 'preformation',
    title: '🎓 Pré-financement Formation',
    description: 'Investissez dans votre future formation avec une remise de 10%',
    icon: '📚',
    baseReturn: 10,
    returnType: 'discount',
    minAmount: 50000,
    maxAmount: 500000,
    currency: 'FCFA'
  },
  {
    id: 'financial',
    title: '💰 Don Financier à Rendement',
    description: 'Recevez 8% de rendement en maximum 4 mois',
    icon: '💸',
    baseReturn: 8,
    returnType: 'interest',
    minAmount: 100000,
    maxAmount: 1000000,
    currency: 'FCFA'
  },
  {
    id: 'material',
    title: '🎁 Récompenses Matérielles',
    description: 'Recevez des objets de marque exclusifs du centre',
    icon: '🏆',
    baseReturn: 0,
    returnType: 'material',
    minAmount: 25000,
    maxAmount: 200000,
    currency: 'FCFA'
  }
];

export const PROJECT_GOAL = 50000000; // 50M FCFA

export const MILESTONES = [
  {
    name: 'Premier équipement cordiste',
    amount: 15000000,
    description: 'Achat et installation des équipements de formation cordiste IRATA'
  },
  {
    name: 'Appareil ultrasons CND',
    amount: 30000000,
    description: 'Installation des 6 appareils de contrôle non destructif'
  },
  {
    name: 'Équipement SST complet',
    amount: 50000000,
    description: 'Équipement complet et ouverture officielle du centre'
  }
];


