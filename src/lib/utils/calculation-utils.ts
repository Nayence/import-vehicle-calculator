// src/lib/utils/calculation-utils.ts

import type { CalculationBreakdown } from '@/lib/calculations/total-calculator';
import type { Co2MalusResult } from '@/lib/calculations/malus-co2';
import type { WeightMalusResult } from '@/lib/calculations/malus-weight';

/**
 * Utilitaires pour les calculs d'importation
 */

/**
 * Formate un montant en euros avec séparateurs
 */
export function formatEuros(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formate un pourcentage
 */
export function formatPercentage(rate: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1
  }).format(rate);
}

/**
 * Calcule l'âge d'un véhicule en années et mois
 */
export function calculateVehicleAge(firstRegistrationDate: string): {
  years: number;
  months: number;
  totalMonths: number;
} {
  const registrationDate = new Date(firstRegistrationDate);
  const currentDate = new Date();
  
  const totalMonths = Math.floor(
    (currentDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  );
  
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  
  return { years, months, totalMonths };
}

/**
 * Détermine la catégorie environnementale d'un véhicule
 */
export function getEnvironmentalCategory(co2Emissions: number): {
  category: string;
  color: string;
  description: string;
} {
  if (co2Emissions === 0) {
    return {
      category: 'Zéro émission',
      color: 'green',
      description: 'Véhicule électrique ou hydrogène'
    };
  } else if (co2Emissions < 50) {
    return {
      category: 'Très faibles émissions',
      color: 'emerald',
      description: 'Hybride rechargeable ou très efficient'
    };
  } else if (co2Emissions < 95) {
    return {
      category: 'Faibles émissions',
      color: 'blue',
      description: 'Conforme objectif européen 2021'
    };
  } else if (co2Emissions < 130) {
    return {
      category: 'Émissions modérées',
      color: 'yellow',
      description: 'Proche des standards européens'
    };
  } else if (co2Emissions < 160) {
    return {
      category: 'Émissions élevées',
      color: 'orange',
      description: 'Au-dessus des objectifs environnementaux'
    };
  } else {
    return {
      category: 'Très polluant',
      color: 'red',
      description: 'Véhicule à fortes émissions'
    };
  }
}

/**
 * Obtient la classe de poids d'un véhicule
 */
export function getWeightCategory(weight: number): {
  category: string;
  description: string;
} {
  if (weight < 1200) {
    return {
      category: 'Léger',
      description: 'Citadine ou petite voiture'
    };
  } else if (weight < 1600) {
    return {
      category: 'Moyen',
      description: 'Berline compacte ou break'
    };
  } else if (weight < 2000) {
    return {
      category: 'Lourd',
      description: 'SUV ou berline premium'
    };
  } else {
    return {
      category: 'Très lourd',
      description: 'Grand SUV ou véhicule de luxe'
    };
  }
}

/**
 * Calcule les économies potentielles avec un véhicule plus écologique
 */
export function calculateEcologicalSavings(
  currentCo2: number,
  currentWeight: number,
  firstRegistrationDate: string
): {
  electricSavings: number;
  hybridSavings: number;
  lightweightSavings: number;
} {
  // Simuler un véhicule électrique équivalent
  const electricCo2 = 0;
  const electricWeight = currentWeight + 200; // Batteries plus lourdes
  
  // Simuler un hybride rechargeable
  const hybridCo2 = Math.max(30, currentCo2 * 0.3);
  const hybridWeight = currentWeight + 150;
  
  // Simuler une version allégée
  const lightweightCo2 = currentCo2;
  const lightweightWeight = Math.max(1200, currentWeight - 300);
  
  // Calculs des malus actuels (fonction fictive pour l'exemple)
  const currentMalus = estimateTotalMalus(currentCo2, currentWeight, firstRegistrationDate);
  const electricMalus = estimateTotalMalus(electricCo2, electricWeight, firstRegistrationDate);
  const hybridMalus = estimateTotalMalus(hybridCo2, hybridWeight, firstRegistrationDate);
  const lightweightMalus = estimateTotalMalus(lightweightCo2, lightweightWeight, firstRegistrationDate);
  
  return {
    electricSavings: Math.max(0, currentMalus - electricMalus),
    hybridSavings: Math.max(0, currentMalus - hybridMalus),
    lightweightSavings: Math.max(0, currentMalus - lightweightMalus)
  };
}

/**
 * Estimation rapide du malus total (pour comparaisons)
 */
function estimateTotalMalus(co2: number, weight: number, firstRegistrationDate: string): number {
  // Version simplifiée pour estimation rapide
  let malus = 0;
  
  // Malus CO2 simplifié
  if (co2 >= 113) {
    malus += Math.max(50, (co2 - 113) * 150);
  }
  
  // Malus poids simplifié
  if (weight >= 1600) {
    malus += (weight - 1600) * 20;
  }
  
  // Application décote selon âge
  const age = calculateVehicleAge(firstRegistrationDate);
  if (age.totalMonths > 12) {
    malus *= 0.8; // 20% de décote approximative
  }
  
  return Math.min(malus, 70000); // Plafonnement
}

/**
 * Génère un rapport détaillé du calcul
 */
export function generateCalculationReport(
  breakdown: CalculationBreakdown,
  vehicleInfo: any
): string {
  const lines = [
    '=== RAPPORT DE CALCUL IMPORTATION VÉHICULE ===\n',
    `Véhicule: ${vehicleInfo.name || 'Non spécifié'}`,
    `CO2: ${vehicleInfo.co2}g/km | Poids: ${vehicleInfo.weight}kg | ${vehicleInfo.fuelType}`,
    `Date: ${new Date().toLocaleDateString('fr-FR')}\n`,
    
    '--- DÉTAIL DES COÛTS ---',
    `Prix d'achat: ${formatEuros(breakdown.purchasePrice)}`,
    
    breakdown.vat.vatDue > 0 ? 
      `TVA (${formatPercentage(breakdown.vat.vatRate)}): ${formatEuros(breakdown.vat.vatDue)}` : 
      'TVA: Non applicable',
    
    breakdown.customsDuty > 0 ? 
      `Droits de douane: ${formatEuros(breakdown.customsDuty)}` : 
      'Droits de douane: Non applicable (UE)',
    
    breakdown.co2Malus.finalMalus > 0 ? 
      `Malus CO2: ${formatEuros(breakdown.co2Malus.finalMalus)}` : 
      `Malus CO2: Exempt${breakdown.co2Malus.exemptionReason ? ` (${breakdown.co2Malus.exemptionReason})` : ''}`,
    
    breakdown.weightMalus.finalMalus > 0 ? 
      `Malus poids: ${formatEuros(breakdown.weightMalus.finalMalus)}` : 
      `Malus poids: Exempt${breakdown.weightMalus.exemptionReason ? ` (${breakdown.weightMalus.exemptionReason})` : ''}`,
    
    `Frais DREAL: ${formatEuros(breakdown.drealFees)}`,
    `Carte grise (estimation): ${formatEuros(breakdown.registrationFees)}`,
    '',
    `TOTAL ESTIMÉ: ${formatEuros(breakdown.totalCost)}`,
    '',
    
    '--- RÉPARTITION ---',
    `Taxes: ${formatEuros(breakdown.totalTaxes)} (${formatPercentage(breakdown.totalTaxes / breakdown.totalCost)})`,
    `Frais administratifs: ${formatEuros(breakdown.totalFees)} (${formatPercentage(breakdown.totalFees / breakdown.totalCost)})`,
    `Prix véhicule: ${formatEuros(breakdown.purchasePrice)} (${formatPercentage(breakdown.purchasePrice / breakdown.totalCost)})`,
    ''
  ];
  
  if (breakdown.combinedMalusBeforeCap > breakdown.combinedMalusAfterCap) {
    lines.push(
      '--- PLAFONNEMENT MALUS ---',
      `Malus calculé: ${formatEuros(breakdown.combinedMalusBeforeCap)}`,
      `Malus plafonné: ${formatEuros(breakdown.combinedMalusAfterCap)}`,
      `Économie: ${formatEuros(breakdown.combinedMalusBeforeCap - breakdown.combinedMalusAfterCap)}`,
      ''
    );
  }
  
  lines.push(
    '--- INFORMATIONS LÉGALES ---',
    'Calculs basés sur la réglementation française en vigueur',
    'Estimation fournie à titre indicatif',
    'Consultez votre DREAL pour validation officielle',
    ''
  );
  
  return lines.join('\n');
}

/**
 * Valide la cohérence des données d'entrée
 */
export function validateCalculationInputs(inputs: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validations obligatoires
  if (!inputs.purchasePrice || inputs.purchasePrice <= 0) {
    errors.push('Prix d\'achat requis et doit être positif');
  }
  
  if (inputs.purchasePrice > 1000000) {
    warnings.push('Prix d\'achat très élevé - vérifiez la saisie');
  }
  
  if (!inputs.originCountry) {
    errors.push('Pays d\'origine requis');
  }
  
  if (!inputs.firstRegistrationDate) {
    errors.push('Date de première immatriculation requise');
  }
  
  if (!inputs.department) {
    errors.push('Département de résidence requis');
  }
  
  // Validations véhicule
  if (inputs.vehicle) {
    if (!inputs.vehicle.co2Emissions && inputs.vehicle.co2Emissions !== 0) {
      errors.push('Émissions CO2 requises');
    }
    
    if (inputs.vehicle.co2Emissions < 0 || inputs.vehicle.co2Emissions > 500) {
      errors.push('Émissions CO2 doivent être entre 0 et 500 g/km');
    }
    
    if (!inputs.vehicle.weight || inputs.vehicle.weight <= 0) {
      errors.push('Poids du véhicule requis');
    }
    
    if (inputs.vehicle.weight > 5000) {
      warnings.push('Poids très élevé - vérifiez qu\'il s\'agit d\'un véhicule particulier');
    }
    
    if (!inputs.vehicle.fiscalPower || inputs.vehicle.fiscalPower <= 0) {
      errors.push('Puissance fiscale requise');
    }
  }
  
  // Validations de cohérence
  const registrationDate = new Date(inputs.firstRegistrationDate);
  const currentDate = new Date();
  
  if (registrationDate > currentDate) {
    errors.push('Date d\'immatriculation ne peut pas être dans le futur');
  }
  
  if (registrationDate < new Date('1990-01-01')) {
    warnings.push('Véhicule très ancien - vérifiez les règles spécifiques');
  }
  
  // Cohérence écologique
  if (inputs.vehicle?.isElectric && inputs.vehicle?.co2Emissions > 0) {
    warnings.push('Véhicule électrique avec émissions CO2 > 0 - vérifiez la classification');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Compare deux scénarios de calcul
 */
export function compareCalculationScenarios(
  scenario1: CalculationBreakdown,
  scenario2: CalculationBreakdown,
  labels: { scenario1: string; scenario2: string }
): {
  comparison: Array<{
    item: string;
    scenario1: number;
    scenario2: number;
    difference: number;
    percentChange: number;
  }>;
  summary: {
    totalDifference: number;
    percentageDifference: number;
    winner: string;
  };
} {
  const items = [
    { key: 'purchasePrice', label: 'Prix d\'achat' },
    { key: 'vat.vatDue', label: 'TVA' },
    { key: 'customsDuty', label: 'Droits de douane' },
    { key: 'co2Malus.finalMalus', label: 'Malus CO2' },
    { key: 'weightMalus.finalMalus', label: 'Malus poids' },
    { key: 'drealFees', label: 'Frais DREAL' },
    { key: 'registrationFees', label: 'Carte grise' },
    { key: 'totalCost', label: 'TOTAL' }
  ];
  
  const comparison = items.map(item => {
    const value1 = getNestedValue(scenario1, item.key);
    const value2 = getNestedValue(scenario2, item.key);
    const difference = value2 - value1;
    const percentChange = value1 > 0 ? (difference / value1) * 100 : 0;
    
    return {
      item: item.label,
      scenario1: value1,
      scenario2: value2,
      difference,
      percentChange
    };
  });
  
  const totalDifference = scenario2.totalCost - scenario1.totalCost;
  const percentageDifference = scenario1.totalCost > 0 ? 
    (totalDifference / scenario1.totalCost) * 100 : 0;
  
  return {
    comparison,
    summary: {
      totalDifference,
      percentageDifference,
      winner: totalDifference < 0 ? labels.scenario2 : labels.scenario1
    }
  };
}

/**
 * Récupère une valeur imbriquée dans un objet
 */
function getNestedValue(obj: any, path: string): number {
  return path.split('.').reduce((current, key) => current?.[key] ?? 0, obj);
}

/**
 * Génère des recommandations basées sur le calcul
 */
export function generateRecommendations(breakdown: CalculationBreakdown, vehicleInfo: any): string[] {
  const recommendations: string[] = [];
  
  // Recommandations malus CO2
  if (breakdown.co2Malus.finalMalus > 5000) {
    recommendations.push(
      `💡 Malus CO2 élevé (${formatEuros(breakdown.co2Malus.finalMalus)}) - ` +
      'considérez un véhicule < 130g CO2/km pour réduire significativement les coûts'
    );
  }
  
  // Recommandations malus poids
  if (breakdown.weightMalus.finalMalus > 3000) {
    recommendations.push(
      `⚖️ Malus poids important (${formatEuros(breakdown.weightMalus.finalMalus)}) - ` +
      'un véhicule < 1600kg éviterait ce malus entièrement'
    );
  }
  
  // Recommandations TVA
  if (breakdown.vat.requiresCaution) {
    recommendations.push(
      '🔒 Caution TVA requise - préparez le financement de la caution avant l\'importation'
    );
  }
  
  // Recommandations timing
  if (breakdown.co2Malus.ageInMonths < 12 && breakdown.co2Malus.finalMalus > 0) {
    const potentialSavings = breakdown.co2Malus.baseMalus * 0.2; // 20% à 2 ans
    recommendations.push(
      `⏰ Véhicule récent - attendre 2 ans pourrait économiser ~${formatEuros(potentialSavings)} (décote 20%)`
    );
  }
  
  // Recommandations alternatives écologiques
  if (vehicleInfo.co2 > 150 && !vehicleInfo.isElectric) {
    recommendations.push(
      '🔋 Considérez la version électrique ou hybride rechargeable pour éviter tous les malus écologiques'
    );
  }
  
  // Recommandations prix
  const taxRatio = breakdown.totalTaxes / breakdown.purchasePrice;
  if (taxRatio > 0.3) {
    recommendations.push(
      `📊 Taxes représentent ${formatPercentage(taxRatio)} du prix d'achat - ` +
      'vérifiez si un véhicule équivalent français n\'est pas plus économique'
    );
  }
  
  // Recommandations administratives
  if (breakdown.vat.requiresQuitus) {
    recommendations.push(
      '📋 Quitus fiscal requis - contactez votre DREAL avant l\'achat pour connaître la procédure'
    );
  }
  
  return recommendations;
}

/**
 * Calcule l'impact environnemental relatif
 */
export function calculateEnvironmentalImpact(co2Emissions: number): {
  rating: string;
  score: number;
  comparison: string;
} {
  const score = Math.max(0, Math.min(100, 100 - (co2Emissions / 3))); // Score sur 100
  
  let rating: string;
  let comparison: string;
  
  if (score >= 90) {
    rating = 'A+';
    comparison = 'Excellent - Véhicule très respectueux de l\'environnement';
  } else if (score >= 80) {
    rating = 'A';
    comparison = 'Très bien - Faibles émissions';
  } else if (score >= 70) {
    rating = 'B';
    comparison = 'Bien - Émissions modérées';
  } else if (score >= 60) {
    rating = 'C';
    comparison = 'Moyen - Respecte les standards européens';
  } else if (score >= 50) {
    rating = 'D';
    comparison = 'Médiocre - Émissions élevées';
  } else {
    rating = 'E';
    comparison = 'Mauvais - Véhicule très polluant';
  }
  
  return { rating, score, comparison };
}

/**
 * Exporte les résultats pour partage
 */
export function exportCalculationData(breakdown: CalculationBreakdown, vehicleInfo: any): {
  csv: string;
  json: string;
  summary: string;
} {
  const data = {
    vehicule: vehicleInfo,
    calcul: breakdown,
    date: new Date().toISOString(),
    total: breakdown.totalCost
  };
  
  const csv = [
    'Élément,Montant (€)',
    `Prix d'achat,${breakdown.purchasePrice}`,
    `TVA,${breakdown.vat.vatDue}`,
    `Droits de douane,${breakdown.customsDuty}`,
    `Malus CO2,${breakdown.co2Malus.finalMalus}`,
    `Malus poids,${breakdown.weightMalus.finalMalus}`,
    `Frais DREAL,${breakdown.drealFees}`,
    `Carte grise,${breakdown.registrationFees}`,
    `TOTAL,${breakdown.totalCost}`
  ].join('\n');
  
  const json = JSON.stringify(data, null, 2);
  
  const summary = `Importation ${vehicleInfo.name || 'véhicule'}: ${formatEuros(breakdown.totalCost)} total (${formatEuros(breakdown.totalTaxes)} taxes + ${formatEuros(breakdown.totalFees)} frais)`;
  
  return { csv, json, summary };
}