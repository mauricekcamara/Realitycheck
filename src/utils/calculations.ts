import { GamblingSession, UserProfile, ProfitabilityAnalysis, InvestmentComparison, InvestmentScenario } from '../types';

// Game types with their theoretical house edges
export const GAME_TYPES = {
  'Blackjack (Basic Strategy)': { edge: 0.5, description: 'Best odds with perfect basic strategy' },
  'Blackjack (No Strategy)': { edge: 2.0, description: 'Typical player without strategy' },
  'Roulette (American)': { edge: 5.26, description: 'Double zero roulette' },
  'Roulette (European)': { edge: 2.7, description: 'Single zero roulette' },
  'Craps (Pass Line)': { edge: 1.41, description: 'Best bet in craps' },
  'Slots (Low Variance)': { edge: 3.0, description: 'Low volatility slot machines' },
  'Slots (High Variance)': { edge: 8.0, description: 'High volatility slot machines' },
  'Video Poker (Jacks or Better)': { edge: 0.46, description: 'Good video poker game' },
  'Keno': { edge: 25.0, description: 'Very poor odds' },
  'Lottery': { edge: 50.0, description: 'Extremely poor odds' },
};

// Investment scenarios
export const INVESTMENT_SCENARIOS: InvestmentScenario[] = [
  {
    name: 'S&P 500 Index Fund',
    annualReturn: 10.0,
    description: 'Historical average return of S&P 500'
  },
  {
    name: 'High-Yield Savings',
    annualReturn: 4.0,
    description: 'Current high-yield savings account rates'
  },
  {
    name: 'Debt Payoff',
    annualReturn: 15.0,
    description: 'Average credit card interest saved'
  },
  {
    name: '401(k) Match',
    annualReturn: 100.0,
    description: 'Employer 401(k) matching contribution'
  }
];

export function calculatePersonalEdge(sessions: GamblingSession[]): number {
  if (sessions.length === 0) return 0;
  
  const totalWagered = sessions.reduce((sum, session) => sum + session.betAmount, 0);
  const totalNetResult = sessions.reduce((sum, session) => sum + session.netResult, 0);
  
  // Personal edge = (Amount Wagered - Amount Returned) / Amount Wagered * 100
  // Amount Returned = Amount Wagered + Net Result
  // So: (Amount Wagered - (Amount Wagered + Net Result)) / Amount Wagered * 100
  // = (-Net Result) / Amount Wagered * 100
  return totalWagered > 0 ? (-totalNetResult / totalWagered) * 100 : 0;
}

export function calculateUserProfile(sessions: GamblingSession[]): UserProfile {
  const totalGambled = sessions.reduce((sum, session) => sum + session.betAmount, 0);
  const totalWon = sessions.reduce((sum, session) => sum + Math.max(0, session.netResult), 0);
  const totalLost = sessions.reduce((sum, session) => sum + Math.abs(Math.min(0, session.netResult)), 0);
  const netLoss = totalLost - totalWon;
  const sessionsCount = sessions.length;
  const averageSessionLoss = sessionsCount > 0 ? netLoss / sessionsCount : 0;
  const personalEdge = calculatePersonalEdge(sessions);
  
  // Calculate theoretical edge based on games played (weighted by amount wagered)
  const gameTypeStats: { [key: string]: { sessions: number; totalWagered: number } } = {};
  sessions.forEach(session => {
    if (!gameTypeStats[session.gameType]) {
      gameTypeStats[session.gameType] = { sessions: 0, totalWagered: 0 };
    }
    gameTypeStats[session.gameType].sessions++;
    gameTypeStats[session.gameType].totalWagered += session.betAmount;
  });
  
  let theoreticalEdge = 0;
  let totalWagered = 0;
  
  Object.entries(gameTypeStats).forEach(([gameType, stats]) => {
    const gameInfo = GAME_TYPES[gameType as keyof typeof GAME_TYPES];
    if (gameInfo) {
      theoreticalEdge += gameInfo.edge * stats.totalWagered;
      totalWagered += stats.totalWagered;
    }
  });
  
  theoreticalEdge = totalWagered > 0 ? theoreticalEdge / totalWagered : 0;
  
  return {
    totalGambled,
    totalLost,
    totalWon,
    netLoss,
    sessionsCount,
    averageSessionLoss,
    personalEdge,
    theoreticalEdge
  };
}

export function calculateProfitabilityAnalysis(
  bankroll: number,
  averageBet: number,
  gameEdge: number,
  sessionsPerMonth: number
): ProfitabilityAnalysis {
  const monthlyLoss = (averageBet * gameEdge / 100) * sessionsPerMonth;
  const timeToZero = monthlyLoss > 0 ? bankroll / monthlyLoss : Infinity;
  
  // More realistic probability calculation based on house edge
  // For most casino games, probability of long-term profit is very low
  // This is a simplified but more accurate estimate
  const probabilityOfProfit = Math.max(0, Math.min(100, 50 - (gameEdge * 5)));
  
  return {
    bankroll,
    averageBet,
    gameEdge,
    sessionsPerMonth,
    monthlyLoss,
    timeToZero,
    probabilityOfProfit
  };
}

export function calculateInvestmentComparison(
  totalLost: number,
  yearsToProjection: number = 10
): InvestmentComparison[] {
  return INVESTMENT_SCENARIOS.map(scenario => {
    const projectedValue = totalLost * Math.pow(1 + scenario.annualReturn / 100, yearsToProjection);
    const currentValue = totalLost;
    const opportunityCost = projectedValue - currentValue;
    
    return {
      scenario,
      currentValue,
      projectedValue,
      yearsToProjection,
      opportunityCost
    };
  });
}

export function calculateDebtImpact(
  debtAmount: number,
  monthlyPayment: number,
  interestRate: number,
  gamblingLoss: number
): { originalPayoffDate: Date; newPayoffDate: Date; delayInWeeks: number } {
  // Proper loan payoff calculation
  const monthlyInterest = interestRate / 12 / 100;
  
  // Calculate original payoff time using the loan amortization formula
  // n = -log(1 - (P * r) / A) / log(1 + r)
  // where n = number of payments, P = principal, r = monthly rate, A = monthly payment
  const originalMonths = monthlyPayment > debtAmount * monthlyInterest ? 
    -Math.log(1 - (debtAmount * monthlyInterest) / monthlyPayment) / Math.log(1 + monthlyInterest) : 
    Infinity;
  
  const originalPayoffDate = new Date();
  originalPayoffDate.setMonth(originalPayoffDate.getMonth() + Math.ceil(originalMonths));
  
  // Calculate new payoff time with increased debt
  const newDebtAmount = debtAmount + gamblingLoss;
  const newMonths = monthlyPayment > newDebtAmount * monthlyInterest ? 
    -Math.log(1 - (newDebtAmount * monthlyInterest) / monthlyPayment) / Math.log(1 + monthlyInterest) : 
    Infinity;
  
  const newPayoffDate = new Date();
  newPayoffDate.setMonth(newPayoffDate.getMonth() + Math.ceil(newMonths));
  
  const delayInWeeks = Math.ceil((newMonths - originalMonths) * 4.33); // 4.33 weeks per month
  
  return {
    originalPayoffDate,
    newPayoffDate,
    delayInWeeks
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
} 