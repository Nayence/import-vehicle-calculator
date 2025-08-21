// src/components/Calculator.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { AlertTriangle, Calculator, TrendingUp, TrendingDown, Info, CheckCircle } from 'lucide-react';
import { calculateImportCosts, type ImportCalculationInput, type CalculationBreakdown } from '@/lib/calculations/total-calculator';
import { getCo2MalusDescription } from '@/lib/calculations/malus-co2';
import { getWeightMalusDescription } from '@/lib/calculations/malus-weight';

interface VehicleData {
  name: string;
  co2: number;
  weight: number;
  fuelType: string;
  fiscalPower: number;
  isElectric?: boolean;
  isHybridPlugin?: boolean;
  isE85?: boolean;
}

interface ImportParams {
  purchasePrice: number;
  originCountry: string;
  firstRegistrationDate: string;
  isNewVehicle: boolean;
  isProfessionalSeller: boolean;
  department: string;
}

interface CalculatorProps {
  selectedVehicle: VehicleData | null;
  importParams: ImportParams | null;
}

export function Calculator({ selectedVehicle, importParams }: CalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calcul principal
  const calculation = useMemo(() => {
    if (!selectedVehicle || !importParams || !importParams.purchasePrice || !importParams.department) {
      return null;
    }

    const input: ImportCalculationInput = {
      vehicle: {
        co2Emissions: selectedVehicle.co2,
        weight: selectedVehicle.weight,
        fuelType: selectedVehicle.fuelType,
        fiscalPower: selectedVehicle.fiscalPower,
        isElectric: selectedVehicle.isElectric || selectedVehicle.fuelType.toLowerCase().includes('électrique'),
        isHybridPlugin: selectedVehicle.isHybridPlugin || selectedVehicle.fuelType.toLowerCase().includes('hybride'),
        isE85: selectedVehicle.isE85 || selectedVehicle.fuelType.toLowerCase().includes('e85')
      },
      purchasePrice: importParams.purchasePrice,
      originCountry: importParams.originCountry,
      firstRegistrationDate: importParams.firstRegistrationDate,
      isProfessionalSeller: importParams.isProfessionalSeller,
      department: importParams.department,
      buyerType: 'private'
    };

    try {
      return calculateImportCosts(input);
    } catch (error) {
      console.error('Erreur de calcul:', error);
      return null;
    }
  }, [selectedVehicle, importParams]);

  if (!selectedVehicle || !importParams) {
    return <CalculatorPlaceholder />;
  }

  if (!calculation) {
    return <CalculatorError />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-purple-600" />
          Résultats du calcul
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Résumé véhicule */}
        <VehicleSummary vehicle={selectedVehicle} />

        {/* Calculs principaux */}
        <div className="space-y-3">
          <CalculationLine 
            label="Prix d'achat" 
            amount={calculation.purchasePrice} 
            type="base" 
          />
          
          {calculation.vat.vatDue > 0 && (
            <CalculationLine 
              label="TVA" 
              amount={calculation.vat.vatDue} 
              type="tax"
              description={calculation.vat.description}
            />
          )}

          {calculation.customsDuty > 0 && (
            <CalculationLine 
              label="Droits de douane" 
              amount={calculation.customsDuty} 
              type="tax"
              description="Véhicule hors UE - 10%"
            />
          )}

          {calculation.co2Malus.finalMalus > 0 && (
            <CalculationLine 
              label="Malus CO2" 
              amount={calculation.co2Malus.finalMalus} 
              type="malus"
              description={getCo2MalusDescription(calculation.co2Malus, selectedVehicle.co2)}
            />
          )}

          {calculation.weightMalus.finalMalus > 0 && (
            <CalculationLine 
              label="Malus poids" 
              amount={calculation.weightMalus.finalMalus} 
              type="malus"
              description={getWeightMalusDescription(calculation.weightMalus, selectedVehicle.weight)}
            />
          )}

          <CalculationLine 
            label="Homologation DREAL" 
            amount={calculation.drealFees} 
            type="fee"
            description="Frais d'homologation obligatoires"
          />

          <CalculationLine 
            label="Carte grise (estimation)" 
            amount={calculation.registrationFees} 
            type="fee"
            description={`Tarif région + taxe pollution (${selectedVehicle.co2}g CO2/km)`}
          />
        </div>

        {/* Total */}
        <div className="border-t-2 border-gray-200 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-gray-900">Total estimé</span>
            <span className="text-2xl font-bold text-purple-600">
              {calculation.totalCost.toLocaleString()} €
            </span>
          </div>
          
          {calculation.combinedMalusBeforeCap > calculation.combinedMalusAfterCap && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <TrendingDown className="h-4 w-4" />
              Plafonnement malus appliqué : 
              -{(calculation.combinedMalusBeforeCap - calculation.combinedMalusAfterCap).toLocaleString()}€
            </div>
          )}
        </div>

        {/* Détails supplémentaires */}
        <CalculationDetails 
          calculation={calculation} 
          isExpanded={isExpanded}
          onToggle={() => setIsExpanded(!isExpanded)}
        />

        {/* Avertissements et informations */}
        <CalculationWarnings calculation={calculation} vehicle={selectedVehicle} />
      </CardContent>
    </Card>
  );
}

function CalculatorPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-purple-600" />
          Résultats du calcul
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Calcul en attente</p>
          <p className="text-sm text-gray-400">
            Sélectionnez un véhicule et remplissez les paramètres d'importation
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function CalculatorError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-red-600" />
          Erreur de calcul
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <AlertTriangle className="h-8 w-8 text-red-400 mx-auto mb-2" />
          <p className="text-red-600">Impossible de calculer les coûts</p>
          <p className="text-sm text-gray-500">Vérifiez vos données d'entrée</p>
        </div>
      </CardContent>
    </Card>
  );
}

function VehicleSummary({ vehicle }: { vehicle: VehicleData }) {
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
      <h4 className="font-medium text-blue-900 mb-2">Véhicule sélectionné</h4>
      <p className="text-sm text-blue-800 mb-2">{vehicle.name}</p>
      <div className="grid grid-cols-2 gap-2 text-xs text-blue-700">
        <div>📊 {vehicle.co2}g CO2/km</div>
        <div>⚖️ {vehicle.weight}kg</div>
        <div>⛽ {vehicle.fuelType}</div>
        <div>🔧 {vehicle.fiscalPower} CV</div>
      </div>
    </div>
  );
}

interface CalculationLineProps {
  label: string;
  amount: number;
  type: 'base' | 'tax' | 'malus' | 'fee';
  description?: string;
}

function CalculationLine({ label, amount, type, description }: CalculationLineProps) {
  const getColor = () => {
    switch (type) {
      case 'base': return 'text-gray-900';
      case 'tax': return 'text-orange-600';
      case 'malus': return 'text-red-600';
      case 'fee': return 'text-blue-600';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
      <div className="flex-1">
        <span className="text-gray-700 font-medium">{label}</span>
        {description && (
          <div className="text-xs text-gray-500 mt-1">{description}</div>
        )}
      </div>
      <span className={`font-semibold ${getColor()}`}>
        {amount.toLocaleString()} €
      </span>
    </div>
  );
}

function CalculationDetails({ 
  calculation, 
  isExpanded, 
  onToggle 
}: { 
  calculation: CalculationBreakdown; 
  isExpanded: boolean; 
  onToggle: () => void; 
}) {
  return (
    <div className="border-t border-gray-200 pt-4">
      <button
        onClick={onToggle}
        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        <Info className="h-4 w-4" />
        {isExpanded ? 'Masquer les détails' : 'Voir les détails'}
      </button>
      
      {isExpanded && (
        <div className="mt-4 space-y-2 text-sm text-gray-600">
          <div>💰 Total taxes : {calculation.totalTaxes.toLocaleString()}€</div>
          <div>📋 Total frais : {calculation.totalFees.toLocaleString()}€</div>
          {calculation.vat.requiresCaution && (
            <div>🔒 Caution TVA : {calculation.vat.cautionAmount?.toLocaleString()}€</div>
          )}
          {calculation.vat.requiresQuitus && (
            <div>📄 Quitus fiscal requis</div>
          )}
        </div>
      )}
    </div>
  );
}

function CalculationWarnings({ 
  calculation, 
  vehicle 
}: { 
  calculation: CalculationBreakdown; 
  vehicle: VehicleData; 
}) {
  const warnings = [];
  const infos = [];

  // Vérifications et avertissements
  if (calculation.co2Malus.isExempt) {
    infos.push(`✅ Exemption malus CO2 : ${calculation.co2Malus.exemptionReason}`);
  }

  if (calculation.weightMalus.isExempt) {
    infos.push(`✅ Exemption malus poids : ${calculation.weightMalus.exemptionReason}`);
  }

  if (vehicle.co2 > 200) {
    warnings.push('⚠️ Véhicule très polluant (>200g CO2/km)');
  }

  if (vehicle.weight > 2000) {
    warnings.push('⚠️ Véhicule lourd (>2000kg) - malus poids élevé');
  }

  if (calculation.vat.requiresCaution) {
    warnings.push('💰 Caution TVA requise pour véhicule neuf');
  }

  return (
    <div className="space-y-3">
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm text-yellow-800 space-y-1">
            {warnings.map((warning, index) => (
              <div key={index}>{warning}</div>
            ))}
          </div>
        </div>
      )}

      {infos.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm text-green-800 space-y-1">
            {infos.map((info, index) => (
              <div key={index}>{info}</div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <div className="text-xs text-gray-600">
          ⚖️ Calculs selon barèmes officiels 2025 • 
          Estimation basée sur les données fournies • 
          Vérifiez auprès de votre DREAL pour confirmation
        </div>
      </div>
    </div>
  );
}