// src/components/ComparisonChart.tsx

'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  DollarSign,
  Zap,
  Weight,
  ShoppingCart
} from 'lucide-react';
import type { CalculationBreakdown } from '@/lib/calculations/total-calculator';

interface ComparisonVehicle {
  id: string;
  name: string;
  color: string;
  calculation: CalculationBreakdown | null;
  vehicle: any;
}

interface ComparisonChartProps {
  vehicles: ComparisonVehicle[];
  metric: 'total' | 'taxes' | 'malus';
  onMetricChange: (metric: 'total' | 'taxes' | 'malus') => void;
}

export function ComparisonChart({ vehicles, metric, onMetricChange }: ComparisonChartProps) {
  const [chartType, setChartType] = useState<'bar' | 'radar' | 'breakdown'>('bar');

  const validVehicles = vehicles.filter(v => v.calculation);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Analyse comparative
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Sélection métrique */}
            <div className="flex border rounded-lg bg-gray-50">
              {[
                { id: 'total', label: 'Total', icon: DollarSign },
                { id: 'taxes', label: 'Taxes', icon: TrendingUp },
                { id: 'malus', label: 'Malus', icon: Zap }
              ].map(m => (
                <Button
                  key={m.id}
                  variant={metric === m.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => onMetricChange(m.id as typeof metric)}
                  className="border-0 rounded-none first:rounded-l-lg last:rounded-r-lg"
                >
                  <m.icon className="h-3 w-3 mr-1" />
                  {m.label}
                </Button>
              ))}
            </div>

            {/* Type de graphique */}
            <div className="flex border rounded-lg bg-gray-50">
              {[
                { id: 'bar', label: 'Barres', icon: BarChart3 },
                { id: 'radar', label: 'Radar', icon: PieChart },
                { id: 'breakdown', label: 'Détail', icon: Weight }
              ].map(c => (
                <Button
                  key={c.id}
                  variant={chartType === c.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setChartType(c.id as typeof chartType)}
                  className="border-0 rounded-none first:rounded-l-lg last:rounded-r-lg"
                >
                  <c.icon className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {chartType === 'bar' && (
          <BarComparisonChart vehicles={validVehicles} metric={metric} />
        )}
        
        {chartType === 'radar' && (
          <RadarComparisonChart vehicles={validVehicles} />
        )}
        
        {chartType === 'breakdown' && (
          <DetailedBreakdownChart vehicles={validVehicles} />
        )}
      </CardContent>
    </Card>
  );
}

// Graphique en barres pour comparaison
function BarComparisonChart({ 
  vehicles, 
  metric 
}: { 
  vehicles: ComparisonVehicle[]; 
  metric: 'total' | 'taxes' | 'malus';
}) {
  const getValue = (vehicle: ComparisonVehicle): number => {
    if (!vehicle.calculation) return 0;
    
    switch (metric) {
      case 'total':
        return vehicle.calculation.totalCost;
      case 'taxes':
        return vehicle.calculation.totalTaxes;
      case 'malus':
        return vehicle.calculation.co2Malus.finalMalus + vehicle.calculation.weightMalus.finalMalus;
      default:
        return 0;
    }
  };

  const maxValue = Math.max(...vehicles.map(getValue));
  const minValue = Math.min(...vehicles.map(getValue));

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-900 mb-4 font-medium">
        Comparaison {metric === 'total' ? 'des coûts totaux' : 
                   metric === 'taxes' ? 'des taxes' : 'des malus écologiques'}
      </div>
      
      <div className="space-y-3">
        {vehicles.map((vehicle, index) => {
          const value = getValue(vehicle);
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const isMin = value === minValue;
          const isMax = value === maxValue;
          
          return (
            <div key={vehicle.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: vehicle.color }}
                  />
                  <span className="font-semibold text-gray-900">{vehicle.name}</span>
                  {isMin && vehicles.length > 1 && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                      Le moins cher
                    </span>
                  )}
                  {isMax && vehicles.length > 1 && (
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                      Le plus cher
                    </span>
                  )}
                </div>
                <span className="font-bold text-gray-900 text-lg">
                  {value.toLocaleString()} €
                </span>
              </div>
              
              <div className="relative">
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div 
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-3"
                    style={{ 
                      backgroundColor: vehicle.color,
                      width: `${percentage}%`,
                      minWidth: percentage > 0 ? '60px' : '0'
                    }}
                  >
                    {percentage > 15 && (
                      <span className="text-white text-sm font-bold">
                        {Math.round(percentage)}%
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Différence avec le moins cher */}
                {!isMin && vehicles.length > 1 && (
                  <div className="text-sm text-red-700 mt-1 font-medium">
                    +{(value - minValue).toLocaleString()}€ vs moins cher
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Statistiques */}
      {vehicles.length > 1 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {(maxValue - minValue).toLocaleString()}€
              </div>
              <div className="text-gray-800 font-medium">Écart max</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {Math.round((vehicles.reduce((sum, v) => sum + getValue(v), 0) / vehicles.length)).toLocaleString()}€
              </div>
              <div className="text-gray-800 font-medium">Moyenne</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-gray-900 text-lg">
                {vehicles.length > 1 ? Math.round(((maxValue - minValue) / minValue) * 100) : 0}%
              </div>
              <div className="text-gray-800 font-medium">Variation</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Graphique radar pour analyse multidimensionnelle
function RadarComparisonChart({ vehicles }: { vehicles: ComparisonVehicle[] }) {
  const metrics = [
    { label: 'Prix', key: 'purchasePrice', max: 100000 },
    { label: 'CO2', key: 'co2', max: 250, reverse: true },
    { label: 'Poids', key: 'weight', max: 2500, reverse: true },
    { label: 'Malus', key: 'totalMalus', max: 30000 },
    { label: 'TVA', key: 'vat', max: 20000 },
    { label: 'Total', key: 'total', max: 150000 }
  ];

  const getMetricValue = (vehicle: ComparisonVehicle, metricKey: string): number => {
    if (!vehicle.calculation || !vehicle.vehicle) return 0;
    
    switch (metricKey) {
      case 'purchasePrice':
        return vehicle.calculation.purchasePrice;
      case 'co2':
        return vehicle.vehicle.co2;
      case 'weight':
        return vehicle.vehicle.weight;
      case 'totalMalus':
        return vehicle.calculation.co2Malus.finalMalus + vehicle.calculation.weightMalus.finalMalus;
      case 'vat':
        return vehicle.calculation.vat.vatDue;
      case 'total':
        return vehicle.calculation.totalCost;
      default:
        return 0;
    }
  };

  const normalizeValue = (value: number, max: number, reverse = false): number => {
    const normalized = Math.min(value / max, 1) * 100;
    return reverse ? 100 - normalized : normalized;
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-900 mb-4 font-medium">
        Analyse radar - Plus la surface est grande, mieux c'est
      </div>

      {/* SVG Radar Chart */}
      <div className="relative">
        <svg viewBox="0 0 400 400" className="w-full h-80">
          {/* Grille radar */}
          <g className="opacity-30">
            {[20, 40, 60, 80, 100].map(radius => (
              <polygon
                key={radius}
                points={metrics.map((_, i) => {
                  const angle = (i * 2 * Math.PI) / metrics.length - Math.PI / 2;
                  const x = 200 + (radius * 1.5) * Math.cos(angle);
                  const y = 200 + (radius * 1.5) * Math.sin(angle);
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="#64748b"
                strokeWidth="1"
              />
            ))}
            
            {/* Lignes radiales */}
            {metrics.map((_, i) => {
              const angle = (i * 2 * Math.PI) / metrics.length - Math.PI / 2;
              const x = 200 + 150 * Math.cos(angle);
              const y = 200 + 150 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1="200"
                  y1="200"
                  x2={x}
                  y2={y}
                  stroke="#64748b"
                  strokeWidth="1"
                />
              );
            })}
          </g>

          {/* Labels des métriques */}
          {metrics.map((metric, i) => {
            const angle = (i * 2 * Math.PI) / metrics.length - Math.PI / 2;
            const x = 200 + 170 * Math.cos(angle);
            const y = 200 + 170 * Math.sin(angle);
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                className="text-sm font-bold fill-gray-900"
              >
                {metric.label}
              </text>
            );
          })}

          {/* Polygones des véhicules */}
          {vehicles.map((vehicle, vehicleIndex) => {
            const points = metrics.map((metric, i) => {
              const value = getMetricValue(vehicle, metric.key);
              const normalizedValue = normalizeValue(value, metric.max, metric.reverse);
              const angle = (i * 2 * Math.PI) / metrics.length - Math.PI / 2;
              const radius = (normalizedValue / 100) * 150;
              const x = 200 + radius * Math.cos(angle);
              const y = 200 + radius * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ');

            return (
              <g key={vehicle.id}>
                <polygon
                  points={points}
                  fill={vehicle.color}
                  fillOpacity="0.1"
                  stroke={vehicle.color}
                  strokeWidth="2"
                />
                {/* Points sur chaque métrique */}
                {metrics.map((metric, i) => {
                  const value = getMetricValue(vehicle, metric.key);
                  const normalizedValue = normalizeValue(value, metric.max, metric.reverse);
                  const angle = (i * 2 * Math.PI) / metrics.length - Math.PI / 2;
                  const radius = (normalizedValue / 100) * 150;
                  const x = 200 + radius * Math.cos(angle);
                  const y = 200 + radius * Math.sin(angle);
                  return (
                    <circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={vehicle.color}
                      className="opacity-80"
                    />
                  );
                })}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap justify-center gap-4">
        {vehicles.map(vehicle => (
          <div key={vehicle.id} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: vehicle.color }}
            />
            <span className="text-sm font-semibold text-gray-900">{vehicle.name}</span>
          </div>
        ))}
      </div>

      {/* Explication */}
      <div className="text-sm text-gray-800 text-center font-medium bg-gray-50 p-3 rounded-lg">
        Les valeurs sont normalisées : plus la surface est grande, plus le véhicule est performant
        (prix bas, émissions faibles, coûts réduits)
      </div>
    </div>
  );
}

// Graphique détaillé de répartition
function DetailedBreakdownChart({ vehicles }: { vehicles: ComparisonVehicle[] }) {
  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-900 mb-4 font-medium">
        Répartition détaillée des coûts par véhicule
      </div>

      {vehicles.map(vehicle => {
        if (!vehicle.calculation) return null;

        const { calculation } = vehicle;
        const total = calculation.totalCost;
        
        const segments = [
          { 
            label: 'Prix d\'achat', 
            value: calculation.purchasePrice, 
            color: '#6B7280',
            icon: ShoppingCart,
            description: 'Prix d\'achat du véhicule'
          },
          { 
            label: 'TVA', 
            value: calculation.vat.vatDue, 
            color: '#F59E0B',
            icon: DollarSign,
            description: `TVA ${Math.round(calculation.vat.vatRate * 100)}%`
          },
          { 
            label: 'Malus CO2', 
            value: calculation.co2Malus.finalMalus, 
            color: '#EF4444',
            icon: Zap,
            description: `${vehicle.vehicle?.co2 || 0}g CO2/km`
          },
          { 
            label: 'Malus poids', 
            value: calculation.weightMalus.finalMalus, 
            color: '#DC2626',
            icon: Weight,
            description: `${vehicle.vehicle?.weight || 0}kg`
          },
          { 
            label: 'Droits douane', 
            value: calculation.customsDuty, 
            color: '#7C2D12',
            icon: TrendingUp,
            description: 'Véhicule hors UE'
          },
          { 
            label: 'Frais admin', 
            value: calculation.drealFees + calculation.registrationFees, 
            color: '#3B82F6',
            icon: BarChart3,
            description: 'DREAL + Carte grise'
          }
        ].filter(s => s.value > 0);

        return (
          <div key={vehicle.id} className="border rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-4">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: vehicle.color }}
              />
              <h4 className="font-bold text-gray-900">{vehicle.name}</h4>
              <span className="text-sm text-gray-800 font-medium">
                Total: {total.toLocaleString()} €
              </span>
            </div>

            {/* Barre de progression globale */}
            <div className="flex h-8 rounded-lg overflow-hidden bg-gray-100 mb-4">
              {segments.map((segment, index) => (
                <div
                  key={index}
                  className="h-full flex items-center justify-center"
                  style={{
                    backgroundColor: segment.color,
                    width: `${(segment.value / total) * 100}%`
                  }}
                  title={`${segment.label}: ${segment.value.toLocaleString()} €`}
                />
              ))}
            </div>

            {/* Détail des segments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {segments.map((segment, index) => {
                const percentage = (segment.value / total) * 100;
                const Icon = segment.icon;
                
                return (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <Icon className="h-4 w-4 text-gray-800" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900">
                        {segment.label}
                      </div>
                      <div className="text-xs text-gray-700 font-medium">
                        {segment.description}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900">
                        {segment.value.toLocaleString()} €
                      </div>
                      <div className="text-xs text-gray-700 font-medium">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Indicateurs clés */}
            <div className="mt-4 flex justify-between text-sm border-t pt-3 bg-gray-50 -mx-4 px-4 -mb-4 pb-4 rounded-b-lg">
              <div className="text-gray-900">
                <span className="font-bold">Taxes: </span>
                <span className="font-semibold">{calculation.totalTaxes.toLocaleString()}€</span>
                <span className="text-gray-700"> ({Math.round((calculation.totalTaxes / total) * 100)}%)</span>
              </div>
              <div className="text-gray-900">
                <span className="font-bold">Frais: </span>
                <span className="font-semibold">{calculation.totalFees.toLocaleString()}€</span>
                <span className="text-gray-700"> ({Math.round((calculation.totalFees / total) * 100)}%)</span>
              </div>
              <div className="text-gray-900">
                <span className="font-bold">Base: </span>
                <span className="font-semibold">{calculation.purchasePrice.toLocaleString()}€</span>
                <span className="text-gray-700"> ({Math.round((calculation.purchasePrice / total) * 100)}%)</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}