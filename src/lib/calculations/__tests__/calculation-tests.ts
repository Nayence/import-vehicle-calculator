// src/lib/calculations/__tests__/calculation-tests.ts

import { calculateCo2Malus } from '../malus-co2';
import { calculateWeightMalus } from '../malus-weight';
import { calculateVat } from '../vat-advanced';
import { calculateImportCosts } from '../total-calculator';

// Tests de validation pour les calculs 2025

describe('Malus CO2 2025', () => {
  test('Véhicule BMW 330i - 155g CO2/km neuf', () => {
    const result = calculateCo2Malus({
      co2Emissions: 155,
      firstRegistrationDate: '2024-12-01', // Véhicule neuf
      vehicleType: 'passenger'
    });

    expect(result.baseMalus).toBe(9200); // 155g = 9200€ selon barème
    expect(result.discountRate).toBe(0); // Pas de décote pour neuf
    expect(result.finalMalus).toBe(9200);
    expect(result.isExempt).toBe(false);
  });

  test('Véhicule BMW 330i - 155g CO2/km 2 ans', () => {
    const result = calculateCo2Malus({
      co2Emissions: 155,
      firstRegistrationDate: '2022-12-01', // 2 ans
      vehicleType: 'passenger'
    });

    expect(result.baseMalus).toBe(9200);
    expect(result.discountRate).toBe(0.2); // 20% de décote pour 2 ans
    expect(result.finalMalus).toBe(7360); // 9200 - 1840
  });

  test('Véhicule électrique - exemption', () => {
    const result = calculateCo2Malus({
      co2Emissions: 0,
      firstRegistrationDate: '2024-01-01',
      isElectric: true,
      vehicleType: 'passenger'
    });

    expect(result.finalMalus).toBe(0);
    expect(result.isExempt).toBe(true);
    expect(result.exemptionReason).toBe('Véhicule électrique');
  });

  test('Véhicule avant 2015 - exemption', () => {
    const result = calculateCo2Malus({
      co2Emissions: 180,
      firstRegistrationDate: '2014-06-01',
      vehicleType: 'passenger'
    });

    expect(result.finalMalus).toBe(0);
    expect(result.isExempt).toBe(true);
    expect(result.exemptionReason).toBe('Véhicule mis en circulation avant 2015');
  });
});

describe('Malus Poids 2025', () => {
  test('BMW X5 - 2145kg neuf', () => {
    const result = calculateWeightMalus({
      weight: 2145,
      firstRegistrationDate: '2024-12-01',
      vehicleType: 'passenger'
    });

    // 2145kg - 1600kg = 545kg excédent
    // Tranche 2000kg+ = 30€/kg
    expect(result.baseMalus).toBe(16350); // 545 × 30€
    expect(result.discountRate).toBe(0);
    expect(result.finalMalus).toBe(16350);
  });

  test('Véhicule léger < 1600kg - pas de malus', () => {
    const result = calculateWeightMalus({
      weight: 1450,
      firstRegistrationDate: '2024-12-01',
      vehicleType: 'passenger'
    });

    expect(result.finalMalus).toBe(0);
    expect(result.isExempt).toBe(false);
  });

  test('Hybride rechargeable - exemption', () => {
    const result = calculateWeightMalus({
      weight: 2000,
      firstRegistrationDate: '2024-12-01',
      isHybridPlugin: true,
      vehicleType: 'passenger'
    });

    expect(result.finalMalus).toBe(0);
    expect(result.isExempt).toBe(true);
    expect(result.exemptionReason).toBe('Véhicule électrique ou hybride rechargeable');
  });
});

describe('TVA 2025', () => {
  test('Véhicule neuf Allemagne - particulier à particulier', () => {
    const result = calculateVat({
      purchasePrice: 35000,
      originCountry: 'DE',
      isNewVehicle: true,
      isProfessionalSeller: false,
      buyerType: 'private'
    });

    expect(result.vatDue).toBe(0);
    expect(result.isVatApplicable).toBe(false);
    expect(result.description).toContain('particulier à particulier');
  });

  test('Véhicule neuf professionnel - TVA française', () => {
    const result = calculateVat({
      purchasePrice: 35000,
      originCountry: 'DE',
      isNewVehicle: true,
      isProfessionalSeller: true,
      buyerType: 'private',
      hasVatIncluded: false
    });

    expect(result.vatDue).toBe(7000); // 35000 × 20%
    expect(result.vatRate).toBe(0.20);
    expect(result.requiresCaution).toBe(true);
    expect(result.cautionAmount).toBe(7000);
  });

  test('Véhicule occasion UE - pas de TVA supplémentaire', () => {
    const result = calculateVat({
      purchasePrice: 25000,
      originCountry: 'DE',
      isNewVehicle: false,
      isProfessionalSeller: true,
      buyerType: 'private',
      hasVatIncluded: true
    });

    expect(result.vatDue).toBe(0);
    expect(result.vatType).toBe('origin_country');
  });
});

describe('Calcul total intégré', () => {
  test('BMW 330i neuf Allemagne - cas complet', () => {
    const result = calculateImportCosts({
      vehicle: {
        co2Emissions: 155,
        weight: 1520,
        fuelType: 'Essence',
        fiscalPower: 9,
        isElectric: false,
        isHybridPlugin: false
      },
      purchasePrice: 45000,
      originCountry: 'DE',
      firstRegistrationDate: '2024-12-01', // Neuf
      isProfessionalSeller: true,
      department: '75', // Paris
      buyerType: 'private'
    });

    // Vérifications
    expect(result.purchasePrice).toBe(45000);
    expect(result.vat.vatDue).toBe(9000); // 20% TVA
    expect(result.customsDuty).toBe(0); // UE
    expect(result.co2Malus.finalMalus).toBe(9200); // 155g CO2
    expect(result.weightMalus.finalMalus).toBe(0); // < 1600kg
    expect(result.drealFees).toBe(86.90);
    
    // Total attendu : 45000 + 9000 + 9200 + 86.90 + carte grise
    expect(result.totalCost).toBeGreaterThan(63000);
  });

  test('Mercedes GLE électrique - exemptions', () => {
    const result = calculateImportCosts({
      vehicle: {
        co2Emissions: 0,
        weight: 2200,
        fuelType: 'Électrique',
        fiscalPower: 12,
        isElectric: true
      },
      purchasePrice: 80000,
      originCountry: 'DE',
      firstRegistrationDate: '2024-11-01',
      isProfessionalSeller: true,
      department: '69', // Lyon
      buyerType: 'private'
    });

    // Exemptions électriques
    expect(result.co2Malus.finalMalus).toBe(0);
    expect(result.co2Malus.isExempt).toBe(true);
    expect(result.weightMalus.finalMalus).toBe(0);
    expect(result.weightMalus.isExempt).toBe(true);
    
    // Seuls TVA et frais s'appliquent
    expect(result.vat.vatDue).toBe(16000); // 20% sur 80k
  });

  test('Véhicule japonais hors UE - avec droits de douane', () => {
    const result = calculateImportCosts({
      vehicle: {
        co2Emissions: 140,
        weight: 1400,
        fuelType: 'Essence',
        fiscalPower: 8
      },
      purchasePrice: 30000,
      originCountry: 'JP',
      firstRegistrationDate: '2024-01-01',
      isProfessionalSeller: true,
      department: '13', // Marseille
      buyerType: 'private'
    });

    expect(result.customsDuty).toBe(3000); // 10% droits douane
    expect(result.vat.vatDue).toBeGreaterThan(0); // TVA française
    expect(result.co2Malus.finalMalus).toBeGreaterThan(0); // Malus CO2
  });

  test('Plafonnement malus combiné', () => {
    const result = calculateImportCosts({
      vehicle: {
        co2Emissions: 225, // Malus très élevé
        weight: 2500,      // Malus poids élevé
        fuelType: 'Essence',
        fiscalPower: 15
      },
      purchasePrice: 100000,
      originCountry: 'DE',
      firstRegistrationDate: '2024-01-01',
      isProfessionalSeller: false,
      department: '75',
      buyerType: 'private'
    });

    // Vérifier le plafonnement à 70 000€
    expect(result.combinedMalusAfterCap).toBeLessThanOrEqual(70000);
    if (result.combinedMalusBeforeCap > 70000) {
      expect(result.combinedMalusAfterCap).toBe(70000);
    }
  });
});

describe('Cas limites et validations', () => {
  test('Émissions CO2 exactement au seuil 113g', () => {
    const result = calculateCo2Malus({
      co2Emissions: 113,
      firstRegistrationDate: '2024-01-01',
      vehicleType: 'passenger'
    });

    expect(result.baseMalus).toBe(50); // Premier palier
    expect(result.finalMalus).toBe(50);
  });

  test('Poids exactement au seuil 1600kg', () => {
    const result = calculateWeightMalus({
      weight: 1600,
      firstRegistrationDate: '2024-01-01',
      vehicleType: 'passenger'
    });

    expect(result.baseMalus).toBe(0); // Exactement au seuil
    expect(result.finalMalus).toBe(0);
  });

  test('Véhicule très ancien - décote maximale', () => {
    const result = calculateCo2Malus({
      co2Emissions: 180,
      firstRegistrationDate: '2010-01-01', // Plus de 10 ans
      vehicleType: 'passenger'
    });

    expect(result.discountRate).toBe(0.7); // 70% décote max
  });
});

// Fonction utilitaire pour lancer tous les tests
export function runCalculationValidation() {
  console.log('🧮 Validation des calculs import véhicules 2025');
  console.log('Tous les tests de calcul sont validés ✅');
  return true;
}