export interface Country {
    code: string;
    name: string;
    vatRate: number;
    isEu: boolean;
    flag: string;
    currency: string;
  }
  
  export const COUNTRIES: Record<string, Country> = {
    DE: {
      code: 'DE',
      name: 'Allemagne',
      vatRate: 19,
      isEu: true,
      flag: '🇩🇪',
      currency: 'EUR'
    },
    BE: {
      code: 'BE',
      name: 'Belgique',
      vatRate: 21,
      isEu: true,
      flag: '🇧🇪',
      currency: 'EUR'
    },
    LU: {
      code: 'LU',
      name: 'Luxembourg',
      vatRate: 17,
      isEu: true,
      flag: '🇱🇺',
      currency: 'EUR'
    },
    IT: {
      code: 'IT',
      name: 'Italie',
      vatRate: 22,
      isEu: true,
      flag: '🇮🇹',
      currency: 'EUR'
    },
    RO: {
      code: 'RO',
      name: 'Roumanie',
      vatRate: 19,
      isEu: true,
      flag: '🇷🇴',
      currency: 'EUR'
    },
    JP: {
      code: 'JP',
      name: 'Japon',
      vatRate: 10,
      isEu: false,
      flag: '🇯🇵',
      currency: 'JPY'
    },
    KR: {
      code: 'KR',
      name: 'Corée du Sud',
      vatRate: 10,
      isEu: false,
      flag: '🇰🇷',
      currency: 'KRW'
    }
  };
  
  export const EU_COUNTRIES = Object.values(COUNTRIES).filter(c => c.isEu);
  export const NON_EU_COUNTRIES = Object.values(COUNTRIES).filter(c => !c.isEu);