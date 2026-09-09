import { CostBreakdown, Hospital } from '@medimatch/shared';

export const costEngineService = {
  /**
   * Generates a realistic, itemized surgical package breakdown for a hospital
   * that stays under or within the patient's budget limit.
   */
  calculatePackage(hospital: Hospital, procedure: string, budgetCap: number): CostBreakdown {
    // Determine base factor based on accreditation & beds
    let discountRatio = 0.85; // 85% of budget cap
    if (hospital.accreditation.includes('JCI')) {
      discountRatio = 0.90;
    } else if (hospital.beds > 500) {
      discountRatio = 0.82;
    } else {
      discountRatio = 0.76;
    }

    // Hash hospital ID to introduce consistent deterministic variation (+- 5%)
    let hash = 0;
    for (let i = 0; i < hospital.id.length; i++) {
      hash = (hash << 5) - hash + hospital.id.charCodeAt(i);
      hash |= 0;
    }
    const variance = ((Math.abs(hash) % 10) - 5) / 100; // -0.05 to +0.05
    const effectiveRatio = Math.max(0.65, Math.min(0.95, discountRatio + variance));

    // Calculate total package rounded to nearest 500
    const rawTotal = Math.round((budgetCap * effectiveRatio) / 500) * 500;
    const totalPackagePrice = Math.min(rawTotal, budgetCap - 5000); // ensure at least 5k savings

    // Line item distribution
    // Surgeon Fee: 36%
    // OT Charges: 24%
    // Room Rate: 20%
    // Medicines & Consumables: 20%
    const surgeonFee = Math.round((totalPackagePrice * 0.36) / 100) * 100;
    const otCharges = Math.round((totalPackagePrice * 0.24) / 100) * 100;
    const roomRate = Math.round((totalPackagePrice * 0.20) / 100) * 100;
    const medicines = totalPackagePrice - (surgeonFee + otCharges + roomRate);

    const budgetSavings = budgetCap - totalPackagePrice;
    const stayDurationDays = totalPackagePrice > 300000 ? 5 : totalPackagePrice > 150000 ? 3 : 2;

    return {
      surgeonFee,
      otCharges,
      roomRate,
      medicines,
      totalPackagePrice,
      budgetSavings,
      stayDurationDays
    };
  }
};

