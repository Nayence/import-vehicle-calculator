// src/lib/calculations/malus-weight.ts

import { 
  WEIGHT_MALUS_2025, 
  WEIGHT_MALUS_THRESHOLD,
  CO2_MALUS_DISCOUNT_RATES 
} from '@/lib/constants/rates-2025';

export interface WeightMalusInput {
  weight: number;                 // Poids en kg
  firstRegistrationDate: string;  // Format YYYY-MM-DD
  isElectric?: boolean;
  isHybridPlugin?: boolean;
  isDisabledPerson?: boolean;
  vehicleType?: 'passenger' | 'commercial';
}

export interface WeightMalusResult {
  baseMalus: number;
  discountRate: number;
  discountAmount: number;
  finalMalus: number;
  isExempt: boolean;
  exemptionReason?: string;
  ageInMonths: number;
  applicableRate: number;
  excessWeight: number;
}

/**
 * Calcule le malus poids selon le barème 2025
 */
export function calculateWeightMalus(input: WeightMalusInput): WeightMalusResult {
  const {
    weight,
    firstRegistrationDate,
    isElectric = false,
    isHybridPlugin = false,
    isDisabledPerson = false,
    vehicleType = 'passenger'
  } = input;

  // Calcul de l'âge du véhicule en mois
  const registrationDate = new Date(firstRegistrationDate);
  const currentDate = new Date();
  const ageInMonths = Math.floor(
    (currentDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );

  // Vérification des exemptions
  const exemption = checkWeightExemptions({
    weight,
    isElectric,
    isHybridPlugin,
    isDisabledPerson,
    vehicleType
  });

  if (exemption.isExempt) {
    return {
      baseMalus: 0,
      discountRate: 0,
      discountAmount: 0,
      finalMalus: 0,
      isExempt: true,
      exemptionReason: exemption.reason,
      ageInMonths,
      applicableRate: 0,
      excessWeight: 0
    };
  }

  // Calcul du malus de base selon le poids
  const baseCalculation = calculateBaseWeightMalus(weight);

  // Si pas de malus de base, pas de calcul supplémentaire
  if (baseCalculation.baseMalus === 0) {
    return {
      baseMalus: 0,
      discountRate: 0,
      discountAmount: 0,
      finalMalus: 0,
      isExempt: false,
      ageInMonths,
      applicableRate: 0,
      excessWeight: 0
    };
  }

  // Calcul de la décote selon l'âge (même système que CO2)
  const discountRate = calculateWeightDiscountRate(ageInMonths);
  const discountAmount = baseCalculation.baseMalus * discountRate;
  const finalMalus = Math.round(baseCalculation.baseMalus - discountAmount);

  return {
    baseMalus: baseCalculation.baseMalus,
    discountRate,
    discountAmount: Math.round(discountAmount),
    finalMalus,
    isExempt: false,
    ageInMonths,
    applicableRate: baseCalculation.applicableRate,
    excessWeight: baseCalculation.excessWeight
  };
}

/**
 * Calcule le malus poids de base
 */
function calculateBaseWeightMalus(weight: number): {
  baseMalus: number;
  applicableRate: number;
  excessWeight: number;
} {
  // Si en dessous du seuil, pas de malus
  if (weight < WEIGHT_MALUS_THRESHOLD) {
    return {
      baseMalus: 0,
      applicableRate: 0,
      excessWeight: 0
    };
  }

  // Recherche de la tranche applicable
  for (const tier of WEIGHT_MALUS_2025) {
    if (weight >= tier.weightMin && weight <= tier.weightMax) {
      const excessWeight = weight - WEIGHT_MALUS_THRESHOLD;
      const baseMalus = excessWeight * tier.ratePerKg;
      
      return {
        baseMalus: Math.round(baseMalus),
        applicableRate: tier.ratePerKg,
        excessWeight
      };
    }
  }

  // Pour les véhicules très lourds (>2000kg)
  const lastTier = WEIGHT_MALUS_2025[WEIGHT_MALUS_2025.length - 1];
  const excessWeight = weight - WEIGHT_MALUS_THRESHOLD;
  const baseMalus = excessWeight * lastTier.ratePerKg;

  return {
    baseMalus: Math.round(baseMalus),
    applicableRate: lastTier.ratePerKg,
    excessWeight
  };
}

/**
 * Calcule le taux de décote selon l'âge (même barème que CO2)
 */
function calculateWeightDiscountRate(ageInMonths: number): number {
  for (const tier of CO2_MALUS_DISCOUNT_RATES) {
    if (ageInMonths >= tier.monthsMin && ageInMonths < tier.monthsMax) {
      return tier.discountRate;
    }
  }
  
  return 0.7; // Véhicules très anciens
}

/**
 * Vérifie les exemptions du malus poids
 */
function checkWeightExemptions(params: {
  weight: number;
  isElectric: boolean;
  isHybridPlugin: boolean;
  isDisabledPerson: boolean;
  vehicleType: string;
}): { isExempt: boolean; reason?: string } {
  
  // Véhicules électriques et hybrides rechargeables
  if (params.isElectric || params.isHybridPlugin) {
    return { isExempt: true, reason: 'Véhicule électrique ou hybride rechargeable' };
  }

  // Personnes en situation de handicap
  if (params.isDisabledPerson) {
    return { isExempt: true, reason: 'Exemption personne en situation de handicap' };
  }

  // Véhicules utilitaires (exemptés du malus poids)
  if (params.vehicleType === 'commercial') {
    return { isExempt: true, reason: 'Véhicule utilitaire' };
  }

  return { isExempt: false };
}

/**
 * Obtient la description détaillée du calcul
 */
export function getWeightMalusDescription(result: WeightMalusResult, weight: number): string {
  if (result.isExempt) {
    return `Exemption : ${result.exemptionReason}`;
  }

  if (result.finalMalus === 0) {
    return `Poids ${weight}kg < ${WEIGHT_MALUS_THRESHOLD}kg : pas de malus`;
  }

  let description = `Poids ${weight}kg : ${result.excessWeight}kg × ${result.applicableRate}€/kg = ${result.baseMalus}€`;
  
  if (result.discountRate > 0) {
    const ageYears = Math.floor(result.ageInMonths / 12);
    const ageMonths = result.ageInMonths % 12;
    description += ` - Décote ${(result.discountRate * 100).toFixed(0)}% (${ageYears}a ${ageMonths}m) : -${result.discountAmount}€`;
  }

  return description;
}

/**
 * Obtient la tranche de malus applicable pour un poids donné
 */
export function getWeightMalusTier(weight: number): typeof WEIGHT_MALUS_2025[0] | null {
  if (weight < WEIGHT_MALUS_THRESHOLD) {
    return null;
  }

  for (const tier of WEIGHT_MALUS_2025) {
    if (weight >= tier.weightMin && weight <= tier.weightMax) {
      return tier;
    }
  }

  // Pour les véhicules très lourds
  return WEIGHT_MALUS_2025[WEIGHT_MALUS_2025.length - 1];
}