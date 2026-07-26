export class HealthDeterministicEngine {
  
  static parseCurrency(val: number | string | undefined): number {
    if (val === undefined) return 0;
    if (typeof val === 'number') return val;
    return parseInt(val.replace(/\D/g, ''), 10) || 0;
  }

  static calculateSavingsRate(income: number, expenses: number): number {
    if (income <= 0) return 0;
    const rate = ((income - expenses) / income) * 100;
    return Math.max(0, Math.min(100, Math.round(rate)));
  }

  static calculateDebtToIncome(income: number, emi: number): number {
    if (income <= 0) return 0;
    const dti = (emi / income) * 100;
    return Math.max(0, Math.round(dti));
  }

  static calculateEmergencyCoverage(expenses: number, emergencyFund: number): number {
    if (expenses <= 0) return 0;
    const coverage = emergencyFund / expenses;
    return Math.round(coverage * 10) / 10;
  }

  static calculateInvestmentReadiness(savingsRate: number, dti: number, emergencyCoverage: number): number {
    let score = 100;
    
    // Deduct points for low savings
    if (savingsRate < 20) score -= (20 - savingsRate) * 1.5;
    
    // Deduct points for high DTI
    if (dti > 40) score -= (dti - 40) * 1.5;
    
    // Deduct points for low emergency fund
    if (emergencyCoverage < 6) score -= (6 - emergencyCoverage) * 5;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  static calculateHealthScore(savingsRate: number, dti: number, emergencyCoverage: number, investmentReadiness: number): number {
    // 30% savings, 25% debt (inverse), 25% emergency, 20% investment
    const savingsScore = Math.min(100, savingsRate * 3.33); // 30% is 100 points
    const debtScore = Math.max(0, 100 - (dti * 2)); // 50% DTI is 0 points
    const emergencyScore = Math.min(100, emergencyCoverage * 16.66); // 6 months is 100 points
    
    const total = (savingsScore * 0.3) + (debtScore * 0.25) + (emergencyScore * 0.25) + (investmentReadiness * 0.2);
    return Math.max(0, Math.min(100, Math.round(total)));
  }
}
