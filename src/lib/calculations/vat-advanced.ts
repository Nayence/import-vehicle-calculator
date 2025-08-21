// src/lib/calculations/vat-advanced.ts

import { VAT_RATES } from '@/lib/constants/rates-2025';
import { COUNTRIES } from '@/lib/constants/countries';

export interface VatCalculationInput {
  purchasePrice: number;
  originCountry: string;
  isNewVehicle: boolean;
  isProfessionalSeller: boolean;
  buyerType: 'private' | 'professional';
  department?: string;
  hasVatIncluded?: boolean;
}

export interface VatCalculationResult {
  vatDue: number;
  vatRate: number;
  vatIncludedInPrice: number;
  netPrice: number;
  totalPrice: number;
  isVatApplicable: boolean;
  vatType: 'none' | 'french' | 'origin_country' | 'reverse_charge';
  description: string;
  requiresQuitus: boolean;
  requiresCaution: boolean;
  cautionAmount?: number;
}

/**
 * Calcule la TVA selon les règles d'importation 2025
 */
export function calculateVat(input: VatCalculationInput): VatCalculationResult {
  const {
    purchasePrice,
    originCountry,
    isNewVehicle,
    isProfessionalSeller,
    buyerType = 'private',
    department,
    hasVatIncluded = false
  } = input;

  const originCountryData = COUNTRIES[originCountry];
  
  // Cas 1: Vente particulier à particulier
  if (!isProfessionalSeller && buyerType === 'private') {
    return handlePrivateToPrivateSale(purchasePrice, originCountryData, isNewVehicle);
  }

  // Cas 2: Vente professionnel à particulier
  if (isProfessionalSeller && buyerType === 'private') {
    return handleProfessionalToPrivateSale(
      purchasePrice, 
      originCountryData, 
      isNewVehicle, 
      hasVatIncluded,
      department
    );
  }

  // Cas 3: Vente professionnel à professionnel
  if (isProfessionalSeller && buyerType === 'professional') {
    return handleProfessionalToProfessionalSale(
      purchasePrice, 
      originCountryData, 
      isNewVehicle
    );
  }

  // Cas par défaut
  return createNoVatResult(purchasePrice, 'Configuration non supportée');
}

/**
 * Vente particulier à particulier
 */
function handlePrivateToPrivateSale(
  purchasePrice: number, 
  originCountry: any, 
  isNewVehicle: boolean
): VatCalculationResult {
  
  if (isNewVehicle) {
    // Véhicule neuf vendu par un particulier = situation exceptionnelle
    return {
      vatDue: 0,
      vatRate: 0,
      vatIncludedInPrice: 0,
      netPrice: purchasePrice,
      totalPrice: purchasePrice,
      isVatApplicable: false,
      vatType: 'none',
      description: 'Vente particulier à particulier - Véhicule neuf : vérifier la situation fiscale du vendeur',
      requiresQuitus: false,
      requiresCaution: false
    };
  }

  return createNoVatResult(
    purchasePrice, 
    'Vente particulier à particulier - Véhicule d\'occasion : pas de TVA'
  );
}

/**
 * Vente professionnel à particulier
 */
function handleProfessionalToPrivateSale(
  purchasePrice: number,
  originCountry: any,
  isNewVehicle: boolean,
  hasVatIncluded: boolean,
  department?: string
): VatCalculationResult {
  
  const isEuCountry = originCountry?.isEu || false;
  const vatRate = getApplicableVatRate(department);
  
  if (isNewVehicle) {
    // Véhicule neuf : TVA française toujours applicable
    if (hasVatIncluded) {
      // TVA déjà incluse dans le prix
      const netPrice = purchasePrice / (1 + vatRate);
      const vatIncluded = purchasePrice - netPrice;
      
      return {
        vatDue: 0, // Déjà payée
        vatRate,
        vatIncludedInPrice: Math.round(vatIncluded),
        netPrice: Math.round(netPrice),
        totalPrice: purchasePrice,
        isVatApplicable: true,
        vatType: 'french',
        description: 'Véhicule neuf - TVA française incluse dans le prix',
        requiresQuitus: false,
        requiresCaution: false
      };
    } else {
      // TVA à ajouter
      const vatDue = purchasePrice * vatRate;
      
      return {
        vatDue: Math.round(vatDue),
        vatRate,
        vatIncludedInPrice: 0,
        netPrice: purchasePrice,
        totalPrice: Math.round(purchasePrice + vatDue),
        isVatApplicable: true,
        vatType: 'french',
        description: 'Véhicule neuf - TVA française à acquitter',
        requiresQuitus: true,
        requiresCaution: true,
        cautionAmount: Math.round(vatDue)
      };
    }
  } else {
    // Véhicule d'occasion
    if (isEuCountry) {
      // UE : TVA du pays d'origine si vendu par professionnel
      if (hasVatIncluded) {
        const originVatRate = (originCountry?.vatRate || 20) / 100;
        const netPrice = purchasePrice / (1 + originVatRate);
        const vatIncluded = purchasePrice - netPrice;
        
        return {
          vatDue: 0,
          vatRate: originVatRate,
          vatIncludedInPrice: Math.round(vatIncluded),
          netPrice: Math.round(netPrice),
          totalPrice: purchasePrice,
          isVatApplicable: true,
          vatType: 'origin_country',
          description: `Véhicule d'occasion UE - TVA ${originCountry?.name || 'origine'} incluse`,
          requiresQuitus: false,
          requiresCaution: false
        };
      } else {
        return createNoVatResult(
          purchasePrice,
          'Véhicule d\'occasion UE - TVA à vérifier selon le statut du vendeur'
        );
      }
    } else {
      // Hors UE : TVA française applicable
      const vatDue = purchasePrice * vatRate;
      
      return {
        vatDue: Math.round(vatDue),
        vatRate,
        vatIncludedInPrice: 0,
        netPrice: purchasePrice,
        totalPrice: Math.round(purchasePrice + vatDue),
        isVatApplicable: true,
        vatType: 'french',
        description: 'Véhicule hors UE - TVA française à acquitter',
        requiresQuitus: true,
        requiresCaution: false
      };
    }
  }
}

/**
 * Vente professionnel à professionnel
 */
function handleProfessionalToProfessionalSale(
  purchasePrice: number,
  originCountry: any,
  isNewVehicle: boolean
): VatCalculationResult {
  
  const isEuCountry = originCountry?.isEu || false;
  
  if (isEuCountry) {
    // Autoliquidation de la TVA (reverse charge)
    return {
      vatDue: 0, // L'acheteur professionnel gère la TVA
      vatRate: VAT_RATES.STANDARD,
      vatIncludedInPrice: 0,
      netPrice: purchasePrice,
      totalPrice: purchasePrice,
      isVatApplicable: true,
      vatType: 'reverse_charge',
      description: 'Vente B2B UE - Autoliquidation de la TVA par l\'acheteur',
      requiresQuitus: false,
      requiresCaution: false
    };
  } else {
    // Hors UE : TVA française + droits de douane
    const vatDue = purchasePrice * VAT_RATES.STANDARD;
    
    return {
      vatDue: Math.round(vatDue),
      vatRate: VAT_RATES.STANDARD,
      vatIncludedInPrice: 0,
      netPrice: purchasePrice,
      totalPrice: Math.round(purchasePrice + vatDue),
      isVatApplicable: true,
      vatType: 'french',
      description: 'Vente B2B hors UE - TVA française + droits de douane',
      requiresQuitus: true,
      requiresCaution: false
    };
  }
}

/**
 * Crée un résultat sans TVA
 */
function createNoVatResult(purchasePrice: number, description: string): VatCalculationResult {
  return {
    vatDue: 0,
    vatRate: 0,
    vatIncludedInPrice: 0,
    netPrice: purchasePrice,
    totalPrice: purchasePrice,
    isVatApplicable: false,
    vatType: 'none',
    description,
    requiresQuitus: false,
    requiresCaution: false
  };
}

/**
 * Détermine le taux de TVA applicable selon le département
 */
function getApplicableVatRate(department?: string): number {
  // Corse : taux réduit
  if (department === '2A' || department === '2B') {
    return VAT_RATES.CORSICA;
  }
  
  // DOM-TOM : cas particuliers (à implémenter si nécessaire)
  
  // France métropolitaine : taux standard
  return VAT_RATES.STANDARD;
}

/**
 * Calcule la caution TVA pour véhicules neufs
 */
export function calculateVatCaution(vatAmount: number): number {
  // La caution correspond généralement au montant de la TVA
  return Math.round(vatAmount);
}

/**
 * Vérifie si un quitus fiscal est nécessaire
 */
export function requiresFiscalQuitus(vatResult: VatCalculationResult): boolean {
  return vatResult.requiresQuitus && vatResult.vatDue > 0;
}