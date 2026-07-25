export class DeterministicEngine {
  /**
   * Calculates Monthly Surplus
   */
  public static calculateSurplus(income: number | string, expenses: number | string): number {
    const inc = Number(income) || 0;
    const exp = Number(expenses) || 0;
    return Math.max(0, inc - exp);
  }

  /**
   * Calculates Savings Rate (%)
   */
  public static calculateSavingsRate(surplus: number, income: number | string): number {
    const inc = Number(income);
    if (!inc || inc <= 0) return 0;
    return Math.round((surplus / inc) * 100);
  }

  /**
   * Calculates Financial Readiness Score (0-100)
   */
  public static calculateReadinessScore(
    age: number | string, 
    savingsRate: number, 
    existingInvestments: number | string,
    surplus: number
  ): number {
    let score = 50; // Base score

    // Savings rate factor (Up to +20)
    if (savingsRate >= 40) score += 20;
    else if (savingsRate >= 20) score += 10;
    else if (savingsRate < 10) score -= 10;

    // Surplus factor (Up to +15)
    if (surplus > 100000) score += 15;
    else if (surplus > 50000) score += 10;

    // Age factor (Younger = more compounding potential)
    const numAge = Number(age);
    if (numAge && numAge < 30) score += 10;
    else if (numAge && numAge > 50) score -= 5;

    // Existing investments factor
    if (Number(existingInvestments) > 500000) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Compound Wealth Projection
   */
  public static projectWealth(
    monthlyInvestment: number, 
    existingInvestments: number, 
    annualReturnRate: number = 0.12 // 12% default expected return for aggressive equity
  ): { tenYear: number, twentyYear: number, thirtyYear: number } {
    
    const calculateForYears = (years: number) => {
      const months = years * 12;
      const monthlyRate = annualReturnRate / 12;
      let total = existingInvestments;
      
      for (let i = 0; i < months; i++) {
        total = (total + monthlyInvestment) * (1 + monthlyRate);
      }
      return Math.round(total);
    };

    return {
      tenYear: calculateForYears(10),
      twentyYear: calculateForYears(20),
      thirtyYear: calculateForYears(30)
    };
  }
}
