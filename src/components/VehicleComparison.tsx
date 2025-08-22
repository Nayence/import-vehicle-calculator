// src/components/VehicleComparison.tsx

'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { VehicleSelector } from '@/components/VehicleSelector';
import { ImportParams } from '@/components/ImportParams';
import { Calculator } from '@/components/Calculator';
import { ComparisonChart } from '@/components/ComparisonChart';
import { 
  Plus, 
  X, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Award,
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { calculateImportCosts, type ImportCalculationInput, type CalculationBreakdown } from '@/lib/calculations/total-calculator';
import type { ImportParams as ImportParamsType } from '@/components/ImportParams';

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

interface ComparisonVehicle {
  id: string;
  vehicle: VehicleData | null;
  params: ImportParamsType | null;
  calculation: CalculationBreakdown | null;
  name: string;
  color: string;
}

const VEHICLE_COLORS = [
  '#3B82F6', // Bleu
  '#EF4444', // Rouge
  '#10B981', // Vert
  '#F59E0B', // Orange
  '#8B5CF6', // Violet
  '#EC4899'  // Rose
];

export function VehicleComparison() {
  const [vehicles, setVehicles] = useState<ComparisonVehicle[]>([
    {
      id: '1',
      vehicle: null,
      params: null,
      calculation: null,
      name: 'Véhicule 1',
      color: VEHICLE_COLORS[0]
    },
    {
      id: '2',
      vehicle: null,
      params: null,
      calculation: null,
      name: 'Véhicule 2',
      color: VEHICLE_COLORS[1]
    }
  ]);

  const [showCharts, setShowCharts] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'total' | 'taxes' | 'malus'>('total');

  // Calcul automatique lors des changements
  const updateVehicleCalculation = (vehicleId: string, vehicle: VehicleData | null, params: ImportParamsType | null) => {
    setVehicles(prev => prev.map(v => {
      if (v.id !== vehicleId) return v;

      let calculation: CalculationBreakdown | null = null;
      
      if (vehicle && params && params.purchasePrice && params.department) {
        try {
          const input: ImportCalculationInput = {
            vehicle: {
              co2Emissions: vehicle.co2,
              weight: vehicle.weight,
              fuelType: vehicle.fuelType,
              fiscalPower: vehicle.fiscalPower,
              isElectric: vehicle.isElectric || vehicle.fuelType.toLowerCase().includes('électrique'),
              isHybridPlugin: vehicle.isHybridPlugin || vehicle.fuelType.toLowerCase().includes('hybride'),
              isE85: vehicle.isE85 || vehicle.fuelType.toLowerCase().includes('e85')
            },
            purchasePrice: params.purchasePrice,
            originCountry: params.originCountry,
            firstRegistrationDate: params.firstRegistrationDate,
            isProfessionalSeller: params.isProfessionalSeller,
            department: params.department,
            buyerType: 'private'
          };
          calculation = calculateImportCosts(input);
        } catch (error) {
          console.error('Erreur calcul véhicule', vehicleId, error);
        }
      }

      return {
        ...v,
        vehicle,
        params,
        calculation
      };
    }));
  };

  const addVehicle = () => {
    if (vehicles.length >= 6) return;
    
    const newVehicle: ComparisonVehicle = {
      id: Date.now().toString(),
      vehicle: null,
      params: null,
      calculation: null,
      name: `Véhicule ${vehicles.length + 1}`,
      color: VEHICLE_COLORS[vehicles.length % VEHICLE_COLORS.length]
    };
    
    setVehicles([...vehicles, newVehicle]);
  };

  const removeVehicle = (vehicleId: string) => {
    if (vehicles.length <= 2) return;
    setVehicles(vehicles.filter(v => v.id !== vehicleId));
  };

  const validVehicles = vehicles.filter(v => v.calculation);
  const bestDeal = validVehicles.reduce((best, current) => 
    !best || current.calculation!.totalCost < best.calculation!.totalCost ? current : best
  , null as ComparisonVehicle | null);

  return (
    <div className="space-y-6">
      {/* Header avec contrôles */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Comparaison Multi-Véhicules
            </CardTitle>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCharts(!showCharts)}
                className="flex items-center gap-2"
              >
                {showCharts ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showCharts ? 'Masquer' : 'Afficher'} graphiques
              </Button>
              <Button
                onClick={addVehicle}
                disabled={vehicles.length >= 6}
                size="sm"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Ajouter véhicule
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Grille de véhicules */}
      <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((vehicle, index) => (
          <VehicleComparisonCard
            key={vehicle.id}
            vehicle={vehicle}
            index={index}
            canRemove={vehicles.length > 2}
            isBestDeal={bestDeal?.id === vehicle.id}
            onVehicleChange={(vehicleData) => 
              updateVehicleCalculation(vehicle.id, vehicleData, vehicle.params)
            }
            onParamsChange={(params) => 
              updateVehicleCalculation(vehicle.id, vehicle.vehicle, params)
            }
            onRemove={() => removeVehicle(vehicle.id)}
          />
        ))}
      </div>

      {/* Tableaux et graphiques de comparaison */}
      {validVehicles.length >= 2 && (
        <>
          {/* Tableau de comparaison */}
          <ComparisonTable vehicles={validVehicles} />
          
          {/* Graphiques */}
          {showCharts && (
            <div className="grid lg:grid-cols-2 gap-6">
              <ComparisonChart 
                vehicles={validVehicles} 
                metric={selectedMetric}
                onMetricChange={setSelectedMetric}
              />
              <CostBreakdownChart vehicles={validVehicles} />
            </div>
          )}

          {/* Recommandations */}
          <ComparisonRecommendations vehicles={validVehicles} bestDeal={bestDeal} />
        </>
      )}
    </div>
  );
}

// Composant carte véhicule individuel
function VehicleComparisonCard({
  vehicle,
  index,
  canRemove,
  isBestDeal,
  onVehicleChange,
  onParamsChange,
  onRemove
}: {
  vehicle: ComparisonVehicle;
  index: number;
  canRemove: boolean;
  isBestDeal: boolean;
  onVehicleChange: (vehicle: VehicleData | null) => void;
  onParamsChange: (params: ImportParamsType | null) => void;
  onRemove: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'vehicle' | 'params' | 'result'>('vehicle');

  return (
    <Card className={`relative ${isBestDeal ? 'ring-2 ring-green-500 bg-green-50' : ''}`}>
      {/* Badge meilleure affaire */}
      {isBestDeal && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Award className="h-3 w-3" />
            Meilleure affaire
          </div>
        </div>
      )}

      {/* Header avec couleur et nom */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-4 h-4 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: vehicle.color }}
            />
            <span className="font-medium text-gray-900">{vehicle.name}</span>
          </div>
          {canRemove && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Onglets */}
        <div className="flex border-b">
          {[
            { id: 'vehicle', label: '🚗 Véhicule', color: vehicle.vehicle ? 'text-blue-600' : 'text-gray-400' },
            { id: 'params', label: '📋 Import', color: vehicle.params ? 'text-green-600' : 'text-gray-400' },
            { id: 'result', label: '💰 Résultat', color: vehicle.calculation ? 'text-purple-600' : 'text-gray-400' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 px-1 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? `${tab.color} border-current` 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenu onglets */}
        <div className="min-h-[300px]">
          {activeTab === 'vehicle' && (
            <VehicleSelector onVehicleSelect={onVehicleChange} />
          )}
          
          {activeTab === 'params' && (
            <ImportParams onParamsChange={onParamsChange} />
          )}
          
          {activeTab === 'result' && (
            <Calculator 
              selectedVehicle={vehicle.vehicle} 
              importParams={vehicle.params} 
            />
          )}
        </div>

        {/* Résumé rapide */}
        {vehicle.calculation && (
          <div className="bg-gray-50 rounded-lg p-3 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {vehicle.calculation.totalCost.toLocaleString()} €
              </div>
              <div className="text-sm text-gray-700 font-medium">
                dont {vehicle.calculation.totalTaxes.toLocaleString()}€ de taxes
              </div>
              {isBestDeal && (
                <div className="text-xs text-green-700 font-semibold mt-1">
                  💰 Solution la plus économique
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Tableau de comparaison détaillé
function ComparisonTable({ vehicles }: { vehicles: ComparisonVehicle[] }) {
  const rows = [
    { label: 'Prix d\'achat', key: 'purchasePrice', format: 'currency' },
    { label: 'TVA', key: 'vat.vatDue', format: 'currency' },
    { label: 'Droits douane', key: 'customsDuty', format: 'currency' },
    { label: 'Malus CO2', key: 'co2Malus.finalMalus', format: 'currency' },
    { label: 'Malus poids', key: 'weightMalus.finalMalus', format: 'currency' },
    { label: 'Frais DREAL', key: 'drealFees', format: 'currency' },
    { label: 'Carte grise', key: 'registrationFees', format: 'currency' },
    { label: 'TOTAL', key: 'totalCost', format: 'currency', isTotal: true }
  ];

  const getNestedValue = (obj: any, path: string): number => {
    return path.split('.').reduce((current, key) => current?.[key] ?? 0, obj);
  };

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return value > 0 ? `${value.toLocaleString()} €` : '-';
    }
    return value.toString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparaison détaillée</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium text-gray-900">Élément</th>
                {vehicles.map(vehicle => (
                  <th key={vehicle.id} className="text-center p-3 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: vehicle.color }}
                      />
                      <span className="text-gray-900">{vehicle.name}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(row => {
                const values = vehicles.map(v => getNestedValue(v.calculation, row.key));
                const minValue = Math.min(...values.filter(v => v > 0));
                
                return (
                  <tr key={row.key} className={`border-b ${row.isTotal ? 'bg-gray-50 font-semibold' : ''}`}>
                    <td className="p-3 text-gray-900 font-medium">{row.label}</td>
                    {vehicles.map((vehicle, index) => {
                      const value = values[index];
                      const isMin = value === minValue && value > 0 && !row.isTotal;
                      
                      return (
                        <td 
                          key={vehicle.id} 
                          className={`p-3 text-center font-medium ${
                            isMin ? 'text-green-600 font-bold' : 
                            row.isTotal ? 'text-lg font-bold text-gray-900' : 'text-gray-900'
                          }`}
                        >
                          {formatValue(value, row.format)}
                          {isMin && <TrendingDown className="inline h-4 w-4 ml-1" />}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Graphique de répartition des coûts
function CostBreakdownChart({ vehicles }: { vehicles: ComparisonVehicle[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition des coûts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicles.map(vehicle => (
            <CostBreakdownBar key={vehicle.id} vehicle={vehicle} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CostBreakdownBar({ vehicle }: { vehicle: ComparisonVehicle }) {
  if (!vehicle.calculation) return null;

  const { calculation } = vehicle;
  const total = calculation.totalCost;
  
  const segments = [
    { label: 'Prix d\'achat', value: calculation.purchasePrice, color: '#6B7280' },
    { label: 'TVA', value: calculation.vat.vatDue, color: '#F59E0B' },
    { label: 'Malus CO2', value: calculation.co2Malus.finalMalus, color: '#EF4444' },
    { label: 'Malus poids', value: calculation.weightMalus.finalMalus, color: '#DC2626' },
    { label: 'Droits douane', value: calculation.customsDuty, color: '#7C2D12' },
    { label: 'Frais admin', value: calculation.drealFees + calculation.registrationFees, color: '#3B82F6' }
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: vehicle.color }}
        />
        <span className="font-semibold text-gray-900">{vehicle.name}</span>
        <span className="text-sm text-gray-800 font-medium">
          {total.toLocaleString()} €
        </span>
      </div>
      
      <div className="flex h-6 rounded-lg overflow-hidden bg-gray-100">
        {segments.map((segment, index) => (
          <div
            key={index}
            className="h-full flex items-center justify-center text-xs text-white font-medium"
            style={{
              backgroundColor: segment.color,
              width: `${(segment.value / total) * 100}%`
            }}
            title={`${segment.label}: ${segment.value.toLocaleString()} €`}
          >
            {segment.value / total > 0.1 && 
              `${Math.round((segment.value / total) * 100)}%`
            }
          </div>
        ))}
      </div>
      
      <div className="flex flex-wrap gap-2 text-xs">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center gap-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: segment.color }}
            />
            <span className="text-gray-800 font-medium">{segment.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Recommandations basées sur la comparaison
function ComparisonRecommendations({ 
  vehicles, 
  bestDeal 
}: { 
  vehicles: ComparisonVehicle[];
  bestDeal: ComparisonVehicle | null;
}) {
  const recommendations = useMemo(() => {
    const recs: string[] = [];
    
    if (!bestDeal) return recs;
    
    const worstDeal = vehicles.reduce((worst, current) => 
      !worst || current.calculation!.totalCost > worst.calculation!.totalCost ? current : worst
    );
    
    const savings = worstDeal.calculation!.totalCost - bestDeal.calculation!.totalCost;
    
    if (savings > 1000) {
      recs.push(
        `💰 Le ${bestDeal.name} permet d'économiser ${savings.toLocaleString()}€ par rapport au ${worstDeal.name}`
      );
    }
    
    // Analyser les malus
    const vehiclesWithHighCo2Malus = vehicles.filter(v => v.calculation!.co2Malus.finalMalus > 5000);
    if (vehiclesWithHighCo2Malus.length > 0) {
      recs.push(
        `🌱 ${vehiclesWithHighCo2Malus.length} véhicule(s) avec malus CO2 > 5000€ - privilégiez les alternatives plus propres`
      );
    }
    
    // Analyser la TVA
    const avgVat = vehicles.reduce((sum, v) => sum + v.calculation!.vat.vatDue, 0) / vehicles.length;
    const lowVatVehicles = vehicles.filter(v => v.calculation!.vat.vatDue < avgVat * 0.5);
    if (lowVatVehicles.length > 0) {
      recs.push(
        `📊 ${lowVatVehicles.map(v => v.name).join(', ')} bénéficient de conditions TVA avantageuses`
      );
    }
    
    return recs;
  }, [vehicles, bestDeal]);
  
  if (recommendations.length === 0) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5 text-yellow-500" />
          Recommandations
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-blue-800 text-sm font-medium">{rec}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}