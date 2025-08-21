// src/lib/calculations/malus-co2.ts

import { 
  CO2_MALUS_2025, 
  CO2_MALUS_DISCOUNT_RATES, 
  CO2_EXEMPTIONS,
  CO2_EXEMPTION_YEAR_THRESHOLD 
} from '@/lib/constants/rates-2025';

export interface Co2MalusInput {
  co2Emissions: number;           // g/km WLTP
  firstRegistrationDate: string;  // Format YYYY-MM-DD
  isElectric?: boolean;
  isHybridPlugin?: boolean;
  isE85?: boolean;
  isDisabledPerson?: boolean;
  vehicleType?: 'passenger' | 'commercial';
}

export interface Co2MalusResult {
  baseMalus: number;
  discountRate: number;
  discountAmount: number;
  finalMalus: number;
  isExempt: boolean;
  exemptionReason?: string;
  ageInMonths: number;
}

/**
 * Calcule le malus CO2 selon le barème 2025
 */
export function calculateCo2Malus(input: Co2MalusInput): Co2MalusResult {
  const {
    co2Emissions,
    firstRegistrationDate,
    isElectric = false,
    isHybridPlugin = false,
    isE85 = false,
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
  const exemption = checkCo2Exemptions({
    co2Emissions,
    firstRegistrationDate,
    isElectric,
    isHybridPlugin,
    isE85,
    isDisabledPerson,
    vehicleType,
    ageInMonths
  });

  if (exemption.isExempt) {
    return {
      baseMalus: 0,
      discountRate: 0,
      discountAmount: 0,
      finalMalus: 0,
      isExempt: true,
      exemptionReason: exemption.reason,
      ageInMonths
    };
  }

  // Calcul du malus de base selon les émissions CO2
  const baseMalus = calculateBaseCo2Malus(co2Emissions);

  // Si pas de malus de base, pas de calcul supplémentaire
  if (baseMalus === 0) {
    return {
      baseMalus: 0,
      discountRate: 0,
      discountAmount: 0,
      finalMalus: 0,
      isExempt: false,
      ageInMonths
    };
  }

  // Calcul de la décote selon l'âge
  const discountRate = calculateDiscountRate(ageInMonths);
  const discountAmount = baseMalus * discountRate;
  const finalMalus = Math.round(baseMalus - discountAmount);

  return {
    baseMalus,
    discountRate,
    discountAmount: Math.round(discountAmount),
    finalMalus,
    isExempt: false,
    ageInMonths
  };
}

/**
 * Calcule le malus CO2 de base selon les émissions
 */
function calculateBaseCo2Malus(co2Emissions: number): number {
  // Arrondi à l'entier supérieur selon la réglementation
  const roundedCo2 = Math.ceil(co2Emissions);

  // Si en dessous du seuil minimum, pas de malus
  if (roundedCo2 < 113) {
    return 0;
  }

  // Recherche dans le barème
  for (let i = CO2_MALUS_2025.length - 1; i >= 0; i--) {
    const tier = CO2_MALUS_2025[i];
    if (roundedCo2 >= tier.threshold) {
      return tier.amount;
    }
  }

  return 0;
}

/**
 * Calcule le taux de décote selon l'âge du véhicule
 */
function calculateDiscountRate(ageInMonths: number): number {
  for (const tier of CO2_MALUS_DISCOUNT_RATES) {
    if (ageInMonths >= tier.monthsMin && ageInMonths < tier.monthsMax) {
      return tier.discountRate;
    }
  }
  
  // Par défaut, si très ancien (plus de 10 ans)
  return 0.7;
}

/**
 * Vérifie les exemptions du malus CO2
 */
function checkCo2Exemptions(params: {
  co2Emissions: number;
  firstRegistrationDate: string;
  isElectric: boolean;
  isHybridPlugin: boolean;
  isE85: boolean;
  isDisabledPerson: boolean;
  vehicleType: string;
  ageInMonths: number;
}): { isExempt: boolean; reason?: string } {
  
  // Véhicules électriques
  if (params.isElectric) {
    return { isExempt: true, reason: 'Véhicule électrique' };
  }

  // Véhicules hybrides rechargeables (émissions < 50g CO2/km)
  if (params.isHybridPlugin && params.co2Emissions < 50) {
    return { isExempt: true, reason: 'Véhicule hybride rechargeable faibles émissions' };
  }

  // Véhicules E85 (superéthanol)
  if (params.isE85) {
    return { isExempt: true, reason: 'Véhicule compatible E85' };
  }

  // Personnes en situation de handicap
  if (params.isDisabledPerson) {
    return { isExempt: true, reason: 'Exemption personne en situation de handicap' };
  }

  // Véhicules mis en circulation avant 2015
  const registrationYear = new Date(params.firstRegistrationDate).getFullYear();
  if (registrationYear < CO2_EXEMPTION_YEAR_THRESHOLD) {
    return { isExempt: true, reason: 'Véhicule mis en circulation avant 2015' };
  }

  // Véhicules utilitaires (exemptés du malus CO2)
  if (params.vehicleType === 'commercial') {
    return { isExempt: true, reason: 'Véhicule utilitaire' };
  }

  return { isExempt: false };
}

/**
 * Obtient la description détaillée du calcul
 */
export function getCo2MalusDescription(result: Co2MalusResult, co2Emissions: number): string {
  if (result.isExempt) {
    return `Exemption : ${result.exemptionReason}`;
  }

  if (result.finalMalus === 0) {
    return `Émissions ${Math.ceil(co2Emissions)}g CO2/km < 113g/km : pas de malus`;
  }

  let description = `Émissions ${Math.ceil(co2Emissions)}g CO2/km : ${result.baseMalus}€`;
  
  if (result.discountRate > 0) {
    const ageYears = Math.floor(result.ageInMonths / 12);
    const ageMonths = result.ageInMonths % 12;
    description += ` - Décote ${(result.discountRate * 100).toFixed(0)}% (${ageYears}a ${ageMonths}m) : -${result.discountAmount}€`;
  }

  return description;
}