export interface GamblingSession {
  id: string;
  date: Date;
  gameType: string;
  betAmount: number;
  winAmount: number;
  lossAmount: number;
  netResult: number;
  duration: number; // in minutes
  location?: string;
  notes?: string;
}

export interface GameType {
  name: string;
  theoreticalEdge: number; // percentage
  description: string;
}

export interface DebtInfo {
  totalDebt: number;
  monthlyPayment: number;
  interestRate: number;
  originalPayoffDate: Date;
  currentPayoffDate: Date;
}

export interface InvestmentScenario {
  name: string;
  annualReturn: number;
  description: string;
}

export interface UserProfile {
  totalGambled: number;
  totalLost: number;
  totalWon: number;
  netLoss: number;
  sessionsCount: number;
  averageSessionLoss: number;
  personalEdge: number; // calculated from actual results
  theoreticalEdge: number; // based on game types played
}

export interface ProfitabilityAnalysis {
  bankroll: number;
  averageBet: number;
  gameEdge: number;
  sessionsPerMonth: number;
  monthlyLoss: number;
  timeToZero: number; // months
  probabilityOfProfit: number; // percentage
}

export interface InvestmentComparison {
  scenario: InvestmentScenario;
  currentValue: number;
  projectedValue: number;
  yearsToProjection: number;
  opportunityCost: number; // money lost to gambling
} 