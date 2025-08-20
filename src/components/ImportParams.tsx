'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { MapPin, Euro, Building } from 'lucide-react';
import { COUNTRIES } from '@/lib/constants/countries';

export interface ImportParams {
  purchasePrice: number;
  originCountry: string;
  firstRegistrationDate: string;
  isNewVehicle: boolean;
  isProfessionalSeller: boolean;
  department: string;
}

interface ImportParamsProps {
  onParamsChange: (params: ImportParams) => void;
}

export function ImportParams({ onParamsChange }: ImportParamsProps) {
  const [params, setParams] = useState<ImportParams>({
    purchasePrice: 0,
    originCountry: 'DE', // Allemagne par défaut
    firstRegistrationDate: '',
    isNewVehicle: false,
    isProfessionalSeller: false,
    department: ''
  });

  const handleChange = (field: keyof ImportParams, value: any) => {
    const newParams = { ...params, [field]: value };
    setParams(newParams);
    onParamsChange(newParams);
  };

  // Calculer automatiquement si le véhicule est neuf
  const calculateIsNew = (registrationDate: string) => {
    if (!registrationDate) return false;
    
    try {
      const regDate = new Date(registrationDate);
      const now = new Date();
      const monthsDiff = (now.getFullYear() - regDate.getFullYear()) * 12 + (now.getMonth() - regDate.getMonth());
      
      return monthsDiff < 6;
    } catch (error) {
      return false;
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value; // Format YYYY-MM-DD
    
    if (dateValue) {
      const isNew = calculateIsNew(dateValue);
      setParams(prev => ({
        ...prev,
        firstRegistrationDate: dateValue,
        isNewVehicle: isNew
      }));
      
      const newParams = {
        ...params,
        firstRegistrationDate: dateValue,
        isNewVehicle: isNew
      };
      onParamsChange(newParams);
    }
  };

  // Date maximum (aujourd'hui)
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-green-600" />
          Paramètres d'importation
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Prix d'achat */}
        <Input
          label="Prix d'achat (€)"
          type="number"
          min="0"
          step="100"
          placeholder="Ex: 25000"
          value={params.purchasePrice > 0 ? params.purchasePrice : ''}
          onChange={(e) => handleChange('purchasePrice', parseFloat(e.target.value) || 0)}
          icon={<Euro className="h-4 w-4" />}
        />

        {/* Pays d'origine */}
        <Select
          label="Pays d'origine"
          value={params.originCountry}
          onChange={(e) => handleChange('originCountry', e.target.value)}
        >
          <option value="">Choisir un pays</option>
          {Object.values(COUNTRIES).map(country => (
            <option key={country.code} value={country.code}>
              {country.flag} {country.name}
            </option>
          ))}
        </Select>

        {/* Date de première immatriculation - COULEURS AMÉLIORÉES */}
        <div className="w-full">
          <label htmlFor="registration-date" className="block text-sm font-medium text-gray-900 mb-1">
            Date de 1ère immatriculation à l'étranger
          </label>
          <input
            id="registration-date"
            type="date"
            value={params.firstRegistrationDate}
            onChange={handleDateChange}
            max={today}
            min="2010-01-01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900 bg-white"
            placeholder=""
          />
        </div>

        {/* Type de vendeur */}
        <Select
          label="Type de vendeur"
          value={params.isProfessionalSeller ? 'professional' : 'private'}
          onChange={(e) => handleChange('isProfessionalSeller', e.target.value === 'professional')}
        >
          <option value="private">Particulier</option>
          <option value="professional">Professionnel / Concessionnaire</option>
        </Select>

        {/* Département de résidence */}
        <Input
          label="Département de résidence (pour la carte grise)"
          type="text"
          placeholder="Ex: 75, 13, 69..."
          value={params.department}
          onChange={(e) => handleChange('department', e.target.value)}
          icon={<Building className="h-4 w-4" />}
          maxLength={3}
        />

        {/* Informations automatiques */}
        {params.firstRegistrationDate && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Détection automatique</h4>
            <div className="space-y-1 text-sm text-gray-700">
              <div>• Véhicule considéré comme: {params.isNewVehicle ? '🆕 Neuf' : '🚗 D\'occasion'}</div>
              <div>• TVA applicable: {params.isProfessionalSeller ? 
                `${COUNTRIES[params.originCountry]?.vatRate || 0}% (${COUNTRIES[params.originCountry]?.name || 'N/A'})` : 
                'Aucune (vente particulier)'
              }</div>
            </div>
          </div>
        )}


      </CardContent>
    </Card>
  );
}