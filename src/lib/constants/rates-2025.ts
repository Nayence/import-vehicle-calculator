// src/lib/constants/rates-2025.ts

/**
 * Barèmes officiels 2025 pour l'importation de véhicules en France
 * Sources : Service Public, DREAL, Code de l'environnement
 */

// Malus CO2 2025 - Barème complet
export const CO2_MALUS_2025 = [
  { threshold: 113, amount: 50 },
  { threshold: 114, amount: 75 },
  { threshold: 115, amount: 100 },
  { threshold: 116, amount: 125 },
  { threshold: 117, amount: 150 },
  { threshold: 118, amount: 170 },
  { threshold: 119, amount: 190 },
  { threshold: 120, amount: 210 },
  { threshold: 121, amount: 240 },
  { threshold: 122, amount: 270 },
  { threshold: 123, amount: 310 },
  { threshold: 124, amount: 350 },
  { threshold: 125, amount: 400 },
  { threshold: 126, amount: 450 },
  { threshold: 127, amount: 540 },
  { threshold: 128, amount: 630 },
  { threshold: 129, amount: 740 },
  { threshold: 130, amount: 850 },
  { threshold: 131, amount: 980 },
  { threshold: 132, amount: 1100 },
  { threshold: 133, amount: 1320 },
  { threshold: 134, amount: 1500 },
  { threshold: 135, amount: 1700 },
  { threshold: 136, amount: 1900 },
  { threshold: 137, amount: 2100 },
  { threshold: 138, amount: 2300 },
  { threshold: 139, amount: 2600 },
  { threshold: 140, amount: 2900 },
  { threshold: 141, amount: 3200 },
  { threshold: 142, amount: 3500 },
  { threshold: 143, amount: 3800 },
  { threshold: 144, amount: 4100 },
  { threshold: 145, amount: 4500 },
  { threshold: 146, amount: 4900 },
  { threshold: 147, amount: 5300 },
  { threshold: 148, amount: 5700 },
  { threshold: 149, amount: 6200 },
  { threshold: 150, amount: 6700 },
  { threshold: 151, amount: 7200 },
  { threshold: 152, amount: 7700 },
  { threshold: 153, amount: 8200 },
  { threshold: 154, amount: 8700 },
  { threshold: 155, amount: 9200 },
  { threshold: 156, amount: 9700 },
  { threshold: 157, amount: 10300 },
  { threshold: 158, amount: 10900 },
  { threshold: 159, amount: 11500 },
  { threshold: 160, amount: 12100 },
  { threshold: 170, amount: 16900 },
  { threshold: 180, amount: 22800 },
  { threshold: 190, amount: 29700 },
  { threshold: 200, amount: 37600 },
  { threshold: 210, amount: 46500 },
  { threshold: 220, amount: 56400 },
  { threshold: 225, amount: 70000 } // Plafond maximal
];

// Décote malus CO2 pour véhicules d'occasion (système mars 2025)
export const CO2_MALUS_DISCOUNT_RATES = [
  { monthsMin: 0, monthsMax: 6, discountRate: 0 },      // Neuf : pas de décote
  { monthsMin: 6, monthsMax: 12, discountRate: 0.1 },   // 6-12 mois : 10%
  { monthsMin: 12, monthsMax: 24, discountRate: 0.2 },  // 1-2 ans : 20%
  { monthsMin: 24, monthsMax: 36, discountRate: 0.3 },  // 2-3 ans : 30%
  { monthsMin: 36, monthsMax: 48, discountRate: 0.4 },  // 3-4 ans : 40%
  { monthsMin: 48, monthsMax: 60, discountRate: 0.5 },  // 4-5 ans : 50%
  { monthsMin: 60, monthsMax: 120, discountRate: 0.6 }, // 5-10 ans : 60%
  { monthsMin: 120, monthsMax: Infinity, discountRate: 0.7 } // 10+ ans : 70%
];

// Malus poids 2025 - Barème par tranches
export const WEIGHT_MALUS_2025 = [
  { weightMin: 1600, weightMax: 1699, ratePerKg: 10 },
  { weightMin: 1700, weightMax: 1799, ratePerKg: 15 },
  { weightMin: 1800, weightMax: 1899, ratePerKg: 20 },
  { weightMin: 1900, weightMax: 1999, ratePerKg: 25 },
  { weightMin: 2000, weightMax: Infinity, ratePerKg: 30 }
];

// Seuil minimum pour le malus poids
export const WEIGHT_MALUS_THRESHOLD = 1600;

// Plafond combiné CO2 + Poids
export const COMBINED_MALUS_CAP = 70000;

// Exemptions malus CO2
export const CO2_EXEMPTIONS = {
  VEHICLES_BEFORE_2015: true,
  DISABLED_PERSONS: true,
  E85_VEHICLES: true,
  ELECTRIC_VEHICLES: true,
  HYBRID_PLUGIN_VEHICLES: true
};

// Tarifs DREAL par région (2025)
export const DREAL_FEES_2025 = {
  BASE_FEE: 86.90,
  ADDITIONAL_SERVICES: {
    EXPEDITED: 150.00,
    TECHNICAL_CONTROL: 45.00,
    CONFORMITY_CERTIFICATE: 25.00
  }
};

// Estimation frais carte grise par département (2025)
export const REGISTRATION_FEES_2025 = {
  BASE_ADMINISTRATIVE_FEE: 11.00,
  DELIVERY_FEE: 2.76,
  REGIONAL_TAX_PER_CV: {
    // Tarifs par CV par région (exemples principaux)
    'ILE_DE_FRANCE': 59.20,
    'PROVENCE_ALPES_COTE_AZUR': 51.20,
    'AUVERGNE_RHONE_ALPES': 43.00,
    'NOUVELLE_AQUITAINE': 41.00,
    'OCCITANIE': 44.00,
    'HAUTS_DE_FRANCE': 34.00,
    'GRAND_EST': 44.00,
    'NORMANDIE': 33.00,
    'BOURGOGNE_FRANCHE_COMTE': 51.20,
    'BRETAGNE': 51.20,
    'CENTRE_VAL_DE_LOIRE': 46.15,
    'PAYS_DE_LA_LOIRE': 51.20,
    'CORSE': 27.00,
    'DEFAULT': 46.15 // Moyenne nationale
  },
  POLLUTION_TAX: {
    CO2_LESS_THAN_110: 0,
    CO2_110_TO_120: 50,
    CO2_121_TO_140: 75,
    CO2_141_TO_155: 105,
    CO2_156_TO_175: 125,
    CO2_176_TO_200: 160,
    CO2_201_TO_250: 372,
    CO2_ABOVE_250: 500
  }
};

// Correspondance départements -> régions
export const DEPARTMENT_TO_REGION: Record<string, string> = {
  // Île-de-France
  '75': 'ILE_DE_FRANCE', '77': 'ILE_DE_FRANCE', '78': 'ILE_DE_FRANCE', 
  '91': 'ILE_DE_FRANCE', '92': 'ILE_DE_FRANCE', '93': 'ILE_DE_FRANCE', 
  '94': 'ILE_DE_FRANCE', '95': 'ILE_DE_FRANCE',
  
  // Provence-Alpes-Côte d'Azur
  '04': 'PROVENCE_ALPES_COTE_AZUR', '05': 'PROVENCE_ALPES_COTE_AZUR', 
  '06': 'PROVENCE_ALPES_COTE_AZUR', '13': 'PROVENCE_ALPES_COTE_AZUR', 
  '83': 'PROVENCE_ALPES_COTE_AZUR', '84': 'PROVENCE_ALPES_COTE_AZUR',
  
  // Auvergne-Rhône-Alpes
  '01': 'AUVERGNE_RHONE_ALPES', '03': 'AUVERGNE_RHONE_ALPES', '07': 'AUVERGNE_RHONE_ALPES',
  '15': 'AUVERGNE_RHONE_ALPES', '26': 'AUVERGNE_RHONE_ALPES', '38': 'AUVERGNE_RHONE_ALPES',
  '42': 'AUVERGNE_RHONE_ALPES', '43': 'AUVERGNE_RHONE_ALPES', '63': 'AUVERGNE_RHONE_ALPES',
  '69': 'AUVERGNE_RHONE_ALPES', '73': 'AUVERGNE_RHONE_ALPES', '74': 'AUVERGNE_RHONE_ALPES',
  
  // Nouvelle-Aquitaine
  '16': 'NOUVELLE_AQUITAINE', '17': 'NOUVELLE_AQUITAINE', '19': 'NOUVELLE_AQUITAINE',
  '23': 'NOUVELLE_AQUITAINE', '24': 'NOUVELLE_AQUITAINE', '33': 'NOUVELLE_AQUITAINE',
  '40': 'NOUVELLE_AQUITAINE', '47': 'NOUVELLE_AQUITAINE', '64': 'NOUVELLE_AQUITAINE',
  '79': 'NOUVELLE_AQUITAINE', '86': 'NOUVELLE_AQUITAINE', '87': 'NOUVELLE_AQUITAINE',
  
  // Autres régions principales (à compléter selon besoins)
  '59': 'HAUTS_DE_FRANCE', '62': 'HAUTS_DE_FRANCE',
  '67': 'GRAND_EST', '68': 'GRAND_EST',
  '44': 'PAYS_DE_LA_LOIRE', '49': 'PAYS_DE_LA_LOIRE',
  '35': 'BRETAGNE', '29': 'BRETAGNE',
  '2A': 'CORSE', '2B': 'CORSE'
};

// Droits de douane hors UE
export const CUSTOMS_DUTY_RATES = {
  PASSENGER_CARS: 0.10, // 10% pour voitures particulières
  MOTORCYCLES: 0.06,    // 6% pour motos
  COMMERCIAL_VEHICLES: 0.22 // 22% pour véhicules utilitaires
};

// TVA rates
export const VAT_RATES = {
  STANDARD: 0.20,       // 20% TVA standard
  REDUCED: 0.055,       // 5.5% pour certains véhicules adaptés
  CORSICA: 0.13         // 13% en Corse
};

// Années d'exemption malus CO2
export const CO2_EXEMPTION_YEAR_THRESHOLD = 2015;