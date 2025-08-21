// src/lib/calculations/total-calculator.ts

import { calculateCo2Malus, type Co2MalusInput, type Co2MalusResult } from './malus-co2';
import { calculateWeightMalus, type WeightMalusInput, type WeightMalusResult } from './malus-weight';
import { calculateVat, type VatCalculationInput, type VatCalculationResult } from './vat-advanced';
import { DREAL_FEES_2025, REGISTRATION_FEES_2025, DEPARTMENT_TO_REGION, COMBINED_MALUS_CAP, CUSTOMS_DUTY_RATES } from '@/lib/constants/rates-2025';
import { COUNTRIES } from '@/lib/constants/countries';

export interface VehicleData {
  co2Emissions: number;
  weight: number;
  fuelType: string;
  fiscalPower: number;
  isElectric?: boolean;
  isHybridPlugin?: boolean;
  isE85?: boolean;
}

export interface ImportCalculationInput {
  // Véhicule
  vehicle: VehicleData;
  
  // Paramètres d'importation
  purchasePrice: number;
  originCountry: string;
  firstRegistrationDate: string;
  isProfessionalSeller: boolean;
  department: string;
  
  // Options
  isDisabledPerson?: boolean;
  buyerType?: 'private' | 'professional';
  expeditedDreal?: boolean;
}

export interface CalculationBreakdown {
  // Prix de base
  purchasePrice: number;
  
  // TVA
  vat: VatCalculationResult;
  
  // Malus
  co2Malus: Co2MalusResult;
  weightMalus: WeightMalusResult;
  combinedMalusBeforeCap: number;
  combinedMalusAfterCap: number;
  
  // Droits de douane (hors UE)
  customsDuty: number;
  
  // Frais administratifs
  drealFees: number;
  registrationFees: number;
  
  // Totaux
  totalTaxes: number;
  totalFees: number;
  totalCost: number;
}

/**
 * Calcule tous les coûts d'importation
 */
export function calculateImportCosts(input: ImportCalculationInput): CalculationBreakdown {
  const {
    vehicle,
    purchasePrice,
    originCountry,
    firstRegistrationDate,
    isProfessionalSeller,
    department,
    isDisabledPerson = false,
    buyerType = 'private',
    expeditedDreal = false
  } = input;

  // 1. Calcul TVA
  const vatInput: VatCalculationInput = {
    purchasePrice,
    originCountry,
    isNewVehicle: isNewVehicle(firstRegistrationDate),
    isProfessionalSeller,
    buyerType,
    department
  };
  const vat = calculateVat(vatInput);

  // 2. Calcul Malus CO2
  const co2Input: Co2MalusInput = {
    co2Emissions: vehicle.co2Emissions,
    firstRegistrationDate,
    isElectric: vehicle.isElectric,
    isHybridPlugin: vehicle.isHybridPlugin,
    isE85: vehicle.isE85,
    isDisabledPerson,
    vehicleType: 'passenger'
  };
  const co2Malus = calculateCo2Malus(co2Input);

  // 3. Calcul Malus Poids
  const weightInput: WeightMalusInput = {
    weight: vehicle.weight,
    firstRegistrationDate,
    isElectric: vehicle.isElectric,
    isHybridPlugin: vehicle.isHybridPlugin,
    isDisabledPerson,
    vehicleType: 'passenger'
  };
  const weightMalus = calculateWeightMalus(weightInput);

  // 4. Application du plafond combiné malus
  const combinedMalusBeforeCap = co2Malus.finalMalus + weightMalus.finalMalus;
  const combinedMalusAfterCap = Math.min(combinedMalusBeforeCap, COMBINED_MALUS_CAP);

  // Répartition proportionnelle si plafonnement
  let finalCo2Malus = co2Malus.finalMalus;
  let finalWeightMalus = weightMalus.finalMalus;
  
  if (combinedMalusBeforeCap > COMBINED_MALUS_CAP) {
    const ratio = COMBINED_MALUS_CAP / combinedMalusBeforeCap;
    finalCo2Malus = Math.round(co2Malus.finalMalus * ratio);
    finalWeightMalus = Math.round(weightMalus.finalMalus * ratio);
  }

  // 5. Droits de douane (hors UE uniquement)
  const originCountryData = COUNTRIES[originCountry];
  const customsDuty = calculateCustomsDuty(purchasePrice, originCountryData?.isEu || false);

  // 6. Frais DREAL
  const drealFees = calculateDrealFees(expeditedDreal);

  // 7. Frais de carte grise
  const registrationFees = calculateRegistrationFees(vehicle, department);

  // 8. Calculs totaux
  const totalTaxes = vat.vatDue + finalCo2Malus + finalWeightMalus + customsDuty;
  const totalFees = drealFees + registrationFees;
  const totalCost = purchasePrice + totalTaxes + totalFees;

  return {
    purchasePrice,
    vat,
    co2Malus: { ...co2Malus, finalMalus: finalCo2Malus },
    weightMalus: { ...weightMalus, finalMalus: finalWeightMalus },
    combinedMalusBeforeCap,
    combinedMalusAfterCap,
    customsDuty,
    drealFees,
    registrationFees,
    totalTaxes,
    totalFees,
    totalCost
  };
}

/**
 * Détermine si un véhicule est considéré comme neuf
 */
function isNewVehicle(firstRegistrationDate: string): boolean {
  const registrationDate = new Date(firstRegistrationDate);
  const currentDate = new Date();
  const monthsDiff = (currentDate.getFullYear() - registrationDate.getFullYear()) * 12 + 
                     (currentDate.getMonth() - registrationDate.getMonth());
  
  return monthsDiff < 6;
}

/**
 * Calcule les droits de douane pour véhicules hors UE
 */
function calculateCustomsDuty(purchasePrice: number, isEuCountry: boolean): number {
  if (isEuCountry) {
    return 0; // Pas de droits de douane dans l'UE
  }
  
  return Math.round(purchasePrice * CUSTOMS_DUTY_RATES.PASSENGER_CARS);
}

/**
 * Calcule les frais DREAL
 */
function calculateDrealFees(expedited: boolean = false): number {
  let fees = DREAL_FEES_2025.BASE_FEE;
  
  if (expedited) {
    fees += DREAL_FEES_2025.ADDITIONAL_SERVICES.EXPEDITED;
  }
  
  return fees;
}

/**
 * Calcule les frais de carte grise
 */
function calculateRegistrationFees(vehicle: VehicleData, department: string): number {
  const region = DEPARTMENT_TO_REGION[department] || 'DEFAULT';
  const regionalRate = REGISTRATION_FEES_2025.REGIONAL_TAX_PER_CV[region as keyof typeof REGISTRATION_FEES_2025.REGIONAL_TAX_PER_CV] || 
                       REGISTRATION_FEES_2025.REGIONAL_TAX_PER_CV.DEFAULT;
  
  // Taxe régionale (par CV fiscal)
  const regionalTax = vehicle.fiscalPower * regionalRate;
  
  // Taxe pollution selon CO2
  const pollutionTax = calculatePollutionTax(vehicle.co2Emissions);
  
  // Frais fixes
  const fixedFees = REGISTRATION_FEES_2025.BASE_ADMINISTRATIVE_FEE + REGISTRATION_FEES_2025.DELIVERY_FEE;
  
  return Math.round(regionalTax + pollutionTax + fixedFees);
}

/**
 * Calcule la taxe pollution selon les émissions CO2
 */
function calculatePollutionTax(co2Emissions: number): number {
  const rates = REGISTRATION_FEES_2025.POLLUTION_TAX;
  
  if (co2Emissions < 110) return rates.CO2_LESS_THAN_110;
  if (co2Emissions <= 120) return rates.CO2_110_TO_120;
  if (co2Emissions <= 140) return rates.CO2_121_TO_140;
  if (co2Emissions <= 155) return rates.CO2_141_TO_155;
  if (co2Emissions <= 175) return rates.CO2_156_TO_175;
  if (co2Emissions <= 200) return rates.CO2_176_TO_200;
  if (co2Emissions <= 250) return rates.CO2_201_TO_250;
  
  return rates.CO2_ABOVE_250;
}

/**
 * Obtient un résumé textuel du calcul
 */
export function getCalculationSummary(breakdown: CalculationBreakdown): string {
  const parts = [
    `Prix d'achat: ${breakdown.purchasePrice.toLocaleString()}€`
  ];
  
  if (breakdown.vat.vatDue > 0) {
    parts.push(`TVA: ${breakdown.vat.vatDue.toLocaleString()}€`);
  }
  
  if (breakdown.customsDuty > 0) {
    parts.push(`Droits de douane: ${breakdown.customsDuty.toLocaleString()}€`);
  }
  
  if (breakdown.combinedMalusAfterCap > 0) {
    parts.push(`Malus écologique: ${breakdown.combinedMalusAfterCap.toLocaleString()}€`);
  }
  
  parts.push(`Frais administratifs: ${breakdown.totalFees.toLocaleString()}€`);
  
  return parts.join(' + ') + ` = ${breakdown.totalCost.toLocaleString()}€`;
}

/**
 * Vérifie si des documents spéciaux sont requis
 */
export function getRequiredDocuments(breakdown: CalculationBreakdown, originCountry: string): string[] {
  const documents = [
    'Certificat de conformité européen (COC)',
    'Facture d\'achat',
    'Certificat de cession (ou équivalent européen)',
    'Justificatif de domicile',
    'Pièce d\'identité'
  ];
  
  const originCountryData = COUNTRIES[originCountry];
  
  if (!originCountryData?.isEu) {
    documents.push('Déclaration en douane');
    documents.push('Certificat de dédouanement');
  }
  
  if (breakdown.vat.requiresQuitus) {
    documents.push('Quitus fiscal');
  }
  
  if (breakdown.vat.requiresCaution) {
    documents.push('Attestation de caution TVA');
  }
  
  return documents;
}