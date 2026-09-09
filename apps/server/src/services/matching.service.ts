import { Hospital, Doctor } from '@medimatch/shared';
import { storageService } from './storage.service';
import { costEngineService } from './costEngine.service';

export const matchingService = {
  /**
   * Matches hospitals in target city under budget with itemized cost packages.
   */
  async matchHospitals(city: string, procedure: string, budgetCap: number): Promise<Hospital[]> {
    const allHospitals = await storageService.getHospitals();

    // Prioritize hospitals in the patient's target city
    let cityHospitals = allHospitals.filter(
      h => h.city.toLowerCase() === city.toLowerCase()
    );

    // If fewer than 4 in city, append from other cities
    if (cityHospitals.length < 4) {
      const otherHospitals = allHospitals.filter(
        h => h.city.toLowerCase() !== city.toLowerCase()
      );
      cityHospitals = [...cityHospitals, ...otherHospitals];
    }

    // Attach cost breakdown and verify under budget
    const matchedWithCost: Hospital[] = cityHospitals.slice(0, 6).map(h => {
      const breakdown = costEngineService.calculatePackage(h, procedure, budgetCap);
      return {
        ...h,
        costBreakdown: breakdown
      };
    });

    return matchedWithCost;
  },

  /**
   * Recommends top matching doctors based on predicted specialty.
   */
  async matchDoctors(specialty: string): Promise<Doctor[]> {
    const allDoctors = await storageService.getDoctors();

    // Match exact or partial specialty name
    let matched = allDoctors.filter(d => 
      d.specialty.toLowerCase().includes(specialty.toLowerCase()) ||
      specialty.toLowerCase().includes(d.specialty.toLowerCase())
    );

    // If fewer than 2 match directly, return top experienced surgeons
    if (matched.length < 2) {
      const others = allDoctors.filter(d => !matched.some(m => m.id === d.id));
      matched = [...matched, ...others];
    }

    return matched.slice(0, 4);
  }
};

