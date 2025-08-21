// src/lib/calculations/dreal-fees.ts

import { DREAL_FEES_2025 } from '@/lib/constants/rates-2025';

export interface DrealFeesInput {
  originCountry: string;
  vehicleType: 'passenger' | 'commercial' | 'motorcycle';
  isExpedited?: boolean;
  needsTechnicalControl?: boolean;
  needsConformityCertificate?: boolean;
  region?: string;
}

export interface DrealFeesResult {
  baseFee: number;
  expeditedFee: number;
  technicalControlFee: number;
  conformityCertificateFee: number;
  totalFees: number;
  processingTime: string;
  description: string[];
}

/**
 * Calcule les frais DREAL pour l'homologation
 */
export function calculateDrealFees(input: DrealFeesInput): DrealFeesResult {
  const {
    originCountry,
    vehicleType = 'passenger',
    isExpedited = false,
    needsTechnicalControl = false,
    needsConformityCertificate = false,
    region
  } = input;

  const result: DrealFeesResult = {
    baseFee: DREAL_FEES_2025.BASE_FEE,
    expeditedFee: 0,
    technicalControlFee: 0,
    conformityCertificateFee: 0,
    totalFees: DREAL_FEES_2025.BASE_FEE,
    processingTime: getStandardProcessingTime(vehicleType),
    description: ['Frais d\'homologation DREAL de base']
  };

  // Frais supplémentaires selon les options
  if (isExpedited) {
    result.expeditedFee = DREAL_FEES_2025.ADDITIONAL_SERVICES.EXPEDITED;
    result.totalFees += result.expeditedFee;
    result.processingTime = getExpeditedProcessingTime(vehicleType);
    result.description.push('Traitement accéléré (2-3 jours ouvrés)');
  }

  if (needsTechnicalControl) {
    result.technicalControlFee = DREAL_FEES_2025.ADDITIONAL_SERVICES.TECHNICAL_CONTROL;
    result.totalFees += result.technicalControlFee;
    result.description.push('Contrôle technique complémentaire');
  }

  if (needsConformityCertificate) {
    result.conformityCertificateFee = DREAL_FEES_2025.ADDITIONAL_SERVICES.CONFORMITY_CERTIFICATE;
    result.totalFees += result.conformityCertificateFee;
    result.description.push('Certificat de conformité supplémentaire');
  }

  return result;
}

/**
 * Délais de traitement standard par type de véhicule
 */
function getStandardProcessingTime(vehicleType: string): string {
  switch (vehicleType) {
    case 'passenger':
      return '5-10 jours ouvrés';
    case 'commercial':
      return '10-15 jours ouvrés';
    case 'motorcycle':
      return '3-7 jours ouvrés';
    default:
      return '5-10 jours ouvrés';
  }
}

/**
 * Délais de traitement accéléré
 */
function getExpeditedProcessingTime(vehicleType: string): string {
  switch (vehicleType) {
    case 'passenger':
      return '2-3 jours ouvrés';
    case 'commercial':
      return '3-5 jours ouvrés';
    case 'motorcycle':
      return '1-2 jours ouvrés';
    default:
      return '2-3 jours ouvrés';
  }
}

/**
 * Vérifie si un contrôle technique est requis
 */
export function requiresTechnicalControl(input: {
  originCountry: string;
  vehicleAge: number;
  hasEuropeanApproval: boolean;
}): boolean {
  const { originCountry, vehicleAge, hasEuropeanApproval } = input;

  // Véhicules hors UE : contrôle technique souvent requis
  if (!isEuCountry(originCountry)) {
    return true;
  }

  // Véhicules anciens sans homologation européenne
  if (vehicleAge > 10 && !hasEuropeanApproval) {
    return true;
  }

  // Véhicules modifiés ou avec des équipements non conformes
  return false;
}

/**
 * Vérifie si un pays fait partie de l'UE
 */
function isEuCountry(countryCode: string): boolean {
  const euCountries = [
    'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
    'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
    'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
  ];
  
  return euCountries.includes(countryCode);
}

/**
 * Obtient les documents requis pour la DREAL
 */
export function getRequiredDrealDocuments(input: DrealFeesInput): string[] {
  const documents = [
    'Certificat de conformité européen (COC) ou réception à titre isolé (RTI)',
    'Facture d\'achat du véhicule',
    'Justificatif de dédouanement (si hors UE)',
    'Demande d\'immatriculation (Cerfa 13750*07)',
    'Justificatif de domicile de moins de 6 mois',
    'Pièce d\'identité en cours de validité'
  ];

  if (input.needsTechnicalControl) {
    documents.push('Procès-verbal de contrôle technique favorable');
  }

  if (!isEuCountry(input.originCountry)) {
    documents.push('Certificat de dédouanement complet');
    documents.push('Facture de transport international');
  }

  return documents;
}

/**
 * Calcule le délai total d'immatriculation
 */
export function calculateTotalProcessingTime(
  drealProcessing: string,
  hasCompleteDocuments: boolean = true
): string {
  const drealDays = extractDaysFromString(drealProcessing);
  
  if (!hasCompleteDocuments) {
    return `${drealDays.max + 5}-${drealDays.max + 10} jours ouvrés (documents incomplets)`;
  }

  // Ajout du délai préfecture pour émission carte grise
  const prefectureDays = 2;
  
  return `${drealDays.min + prefectureDays}-${drealDays.max + prefectureDays} jours ouvrés au total`;
}

/**
 * Extrait les jours min/max d'une chaîne de délai
 */
function extractDaysFromString(timeString: string): { min: number; max: number } {
  const matches = timeString.match(/(\d+)-(\d+)/);
  
  if (matches) {
    return {
      min: parseInt(matches[1]),
      max: parseInt(matches[2])
    };
  }
  
  // Fallback pour formats non standard
  const singleMatch = timeString.match(/(\d+)/);
  const days = singleMatch ? parseInt(singleMatch[1]) : 7;
  
  return { min: days, max: days };
}