// src/lib/constants/exemptions.ts

/**
 * Configuration des exemptions de malus pour l'importation de véhicules
 */

export interface ExemptionRule {
  id: string;
  name: string;
  description: string;
  applies_to: ('co2' | 'weight')[];
  conditions: ExemptionCondition[];
}

export interface ExemptionCondition {
  field: string;
  operator: 'equals' | 'less_than' | 'greater_than' | 'contains' | 'before_date';
  value: any;
}

export const EXEMPTION_RULES: ExemptionRule[] = [
  {
    id: 'electric_vehicles',
    name: 'Véhicules électriques',
    description: 'Exemption totale pour les véhicules 100% électriques',
    applies_to: ['co2', 'weight'],
    conditions: [
      { field: 'isElectric', operator: 'equals', value: true }
    ]
  },
  {
    id: 'hybrid_plugin_low_co2',
    name: 'Hybrides rechargeables faibles émissions',
    description: 'Exemption malus CO2 pour hybrides rechargeables < 50g CO2/km',
    applies_to: ['co2'],
    conditions: [
      { field: 'isHybridPlugin', operator: 'equals', value: true },
      { field: 'co2Emissions', operator: 'less_than', value: 50 }
    ]
  },
  {
    id: 'hybrid_plugin_weight',
    name: 'Hybrides rechargeables - malus poids',
    description: 'Exemption malus poids pour tous les hybrides rechargeables',
    applies_to: ['weight'],
    conditions: [
      { field: 'isHybridPlugin', operator: 'equals', value: true }
    ]
  },
  {
    id: 'e85_vehicles',
    name: 'Véhicules E85',
    description: 'Exemption malus CO2 pour véhicules compatibles superéthanol E85',
    applies_to: ['co2'],
    conditions: [
      { field: 'isE85', operator: 'equals', value: true }
    ]
  },
  {
    id: 'disabled_persons',
    name: 'Personnes en situation de handicap',
    description: 'Exemption totale pour les personnes en situation de handicap',
    applies_to: ['co2', 'weight'],
    conditions: [
      { field: 'isDisabledPerson', operator: 'equals', value: true }
    ]
  },
  {
    id: 'vehicles_before_2015',
    name: 'Véhicules mis en circulation avant 2015',
    description: 'Exemption malus CO2 pour véhicules immatriculés avant le 1er janvier 2015',
    applies_to: ['co2'],
    conditions: [
      { field: 'firstRegistrationDate', operator: 'before_date', value: '2015-01-01' }
    ]
  },
  {
    id: 'commercial_vehicles',
    name: 'Véhicules utilitaires',
    description: 'Exemption totale pour les véhicules utilitaires et commerciaux',
    applies_to: ['co2', 'weight'],
    conditions: [
      { field: 'vehicleType', operator: 'equals', value: 'commercial' }
    ]
  },
  {
    id: 'gpl_vehicles',
    name: 'Véhicules GPL',
    description: 'Réduction de 20% du malus CO2 pour véhicules GPL',
    applies_to: ['co2'],
    conditions: [
      { field: 'fuelType', operator: 'contains', value: 'GPL' }
    ]
  }
];

/**
 * Types de carburants éligibles aux avantages fiscaux
 */
export const ECOLOGICAL_FUEL_TYPES = [
  'Electrique',
  'Hybride rechargeable',
  'GPL',
  'GNV', // Gaz Naturel Véhicule
  'Hydrogène',
  'E85' // Superéthanol
];

/**
 * Codes NAF exemptés pour les professionnels
 */
export const PROFESSIONAL_EXEMPTIONS = [
  '4511Z', // Commerce de voitures et de véhicules automobiles légers
  '4519Z', // Commerce d'autres véhicules automobiles
  '4520A', // Entretien et réparation de véhicules automobiles légers
  '4520B', // Entretien et réparation d'autres véhicules automobiles
  '7711A', // Location de courte durée de voitures et de véhicules automobiles légers
  '7711B'  // Location de longue durée de voitures et de véhicules automobiles légers
];

/**
 * Seuils d'émissions CO2 pour les catégories
 */
export const CO2_EMISSION_CATEGORIES = {
  VERY_LOW: 50,      // < 50g : véhicules très propres
  LOW: 95,           // < 95g : objectif européen 2021
  MEDIUM: 130,       // < 130g : objectif européen antérieur
  HIGH: 160,         // < 160g : véhicules émetteurs
  VERY_HIGH: 200     // >= 200g : véhicules très polluants
};

/**
 * Catégories de poids pour les véhicules
 */
export const WEIGHT_CATEGORIES = {
  LIGHT: 1200,       // < 1200kg : véhicules légers
  MEDIUM: 1600,      // < 1600kg : véhicules moyens (seuil malus)
  HEAVY: 2000,       // < 2000kg : véhicules lourds
  VERY_HEAVY: 2500   // >= 2500kg : véhicules très lourds
};

/**
 * Evaluate si une exemption s'applique
 */
export function evaluateExemption(
  rule: ExemptionRule, 
  vehicleData: any, 
  malusType: 'co2' | 'weight'
): boolean {
  // Vérifier si l'exemption s'applique à ce type de malus
  if (!rule.applies_to.includes(malusType)) {
    return false;
  }

  // Évaluer toutes les conditions (ET logique)
  return rule.conditions.every(condition => 
    evaluateCondition(condition, vehicleData)
  );
}

/**
 * Évalue une condition d'exemption
 */
function evaluateCondition(condition: ExemptionCondition, data: any): boolean {
  const fieldValue = getNestedProperty(data, condition.field);
  
  switch (condition.operator) {
    case 'equals':
      return fieldValue === condition.value;
      
    case 'less_than':
      return typeof fieldValue === 'number' && fieldValue < condition.value;
      
    case 'greater_than':
      return typeof fieldValue === 'number' && fieldValue > condition.value;
      
    case 'contains':
      return typeof fieldValue === 'string' && 
             fieldValue.toLowerCase().includes(condition.value.toLowerCase());
      
    case 'before_date':
      return new Date(fieldValue) < new Date(condition.value);
      
    default:
      return false;
  }
}

/**
 * Récupère une propriété imbriquée d'un objet
 */
function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Obtient toutes les exemptions applicables
 */
export function getApplicableExemptions(
  vehicleData: any, 
  malusType: 'co2' | 'weight'
): ExemptionRule[] {
  return EXEMPTION_RULES.filter(rule => 
    evaluateExemption(rule, vehicleData, malusType)
  );
}

/**
 * Vérifie si un véhicule est considéré comme écologique
 */
export function isEcologicalVehicle(vehicleData: {
  isElectric?: boolean;
  isHybridPlugin?: boolean;
  isE85?: boolean;
  fuelType: string;
  co2Emissions: number;
}): boolean {
  // Véhicules électriques ou hybrides rechargeables
  if (vehicleData.isElectric || vehicleData.isHybridPlugin) {
    return true;
  }
  
  // Véhicules E85
  if (vehicleData.isE85) {
    return true;
  }
  
  // Véhicules GPL/GNV avec faibles émissions
  if ((vehicleData.fuelType.includes('GPL') || vehicleData.fuelType.includes('GNV')) 
      && vehicleData.co2Emissions < CO2_EMISSION_CATEGORIES.LOW) {
    return true;
  }
  
  // Véhicules hydrogène
  if (vehicleData.fuelType.includes('Hydrogène')) {
    return true;
  }
  
  return false;
}