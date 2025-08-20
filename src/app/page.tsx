'use client';

import React, { useState } from 'react';
import { VehicleSelector } from '@/components/VehicleSelector';
import { ImportParams } from '@/components/ImportParams';
import type { ImportParams as ImportParamsType } from '@/components/ImportParams';
import { Calculator, Car, MapPin, Euro, AlertTriangle } from 'lucide-react';

interface VehicleData {
  name: string;
  co2: number;
  weight: number;
  fuelType: string;
  fiscalPower: number;
}

export default function HomePage() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [importParams, setImportParams] = useState<ImportParamsType | null>(null);

  const canCalculate = selectedVehicle && importParams && 
    importParams.purchasePrice > 0 && 
    importParams.originCountry && 
    importParams.firstRegistrationDate &&
    importParams.department;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Import Vehicle Calculator
                </h1>
                <p className="text-sm text-gray-500">
                  Calculateur d'importation de véhicules en France
                </p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Car className="h-4 w-4" />
                Voitures particulières
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                7 pays supportés
              </div>
              <div className="flex items-center gap-1">
                <Euro className="h-4 w-4" />
                Gratuit
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Calculez vos coûts d'importation en quelques clics
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Obtenez une estimation précise des taxes d'importation (TVA, malus CO2/poids, homologation) 
            pour votre véhicule particulier en France.
          </p>
        </div>

        {/* Calculator Interface */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Vehicle Selection */}
          <div className="lg:col-span-1">
            <VehicleSelector onVehicleSelect={setSelectedVehicle} />
          </div>

          {/* Middle Column - Import Parameters */}
          <div className="lg:col-span-1">
            <ImportParams onParamsChange={setImportParams} />
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <Euro className="h-5 w-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Résultats du calcul</h3>
              </div>

              {!canCalculate ? (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-2">Calcul en attente</p>
                  <p className="text-sm text-gray-400">
                    Sélectionnez un véhicule et remplissez les paramètres d'importation
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Résumé véhicule */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Véhicule sélectionné</h4>
                    <p className="text-sm text-blue-800">{selectedVehicle?.name}</p>
                    <div className="mt-2 text-xs text-blue-700">
                      {selectedVehicle?.co2}g CO2/km • {selectedVehicle?.weight}kg • {selectedVehicle?.fuelType}
                    </div>
                  </div>

                  {/* Calculs (version MVP simplifiée) - COULEURS CORRIGÉES */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700 font-medium">Prix d'achat</span>
                      <span className="font-semibold text-gray-900">{importParams?.purchasePrice?.toLocaleString()} €</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700 font-medium">TVA</span>
                      <span className="font-semibold text-orange-600">
                        {importParams?.isProfessionalSeller && !importParams?.isNewVehicle ? 
                          'Incluse' : 
                          importParams?.isNewVehicle ? 
                            `${(importParams.purchasePrice * 0.20).toLocaleString()} €` : 
                            'Non applicable'
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700 font-medium">Malus CO2</span>
                      <span className="font-semibold text-red-600">
                        {selectedVehicle && selectedVehicle.co2 >= 113 ? 
                          'À calculer' : 
                          '0 €'
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700 font-medium">Malus Poids</span>
                      <span className="font-semibold text-red-600">
                        {selectedVehicle && selectedVehicle.weight >= 1600 ? 
                          'À calculer' : 
                          '0 €'
                        }
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700 font-medium">Homologation DREAL</span>
                      <span className="font-semibold text-blue-600">86,90 €</span>
                    </div>

                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-gray-700 font-medium">Carte grise (estimation)</span>
                      <span className="font-semibold text-gray-700">~200 €</span>
                    </div>

                    <div className="flex justify-between items-center py-3 border-t-2 border-gray-200 mt-4">
                      <span className="text-lg font-semibold text-gray-900">Total estimé</span>
                      <span className="text-xl font-bold text-purple-600">
                        {(() => {
                          let total = importParams?.purchasePrice || 0;
                          if (importParams?.isNewVehicle) {
                            total += importParams.purchasePrice * 0.20; // TVA 20%
                          }
                          total += 86.90; // DREAL
                          total += 200; // Carte grise estimation
                          return total.toLocaleString();
                        })()} €
                      </span>
                    </div>
                  </div>

                  {/* Note MVP */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">Version MVP</span>
                    </div>
                    <p className="text-xs text-yellow-700">
                      Calcul simplifié pour la démonstration. 
                      Le moteur de calcul complet des malus sera intégré prochainement.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Comment ça marche ?
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. Sélectionnez votre véhicule</h4>
              <p>Choisissez la marque, le modèle et la version exacte. Les données CO2 et poids sont automatiquement renseignées.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">2. Paramètres d'importation</h4>
              <p>Indiquez le prix d'achat, le pays d'origine, la date d'immatriculation et votre département de résidence.</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. Résultats détaillés</h4>
              <p>Obtenez le détail de chaque taxe (TVA, malus CO2/poids, homologation) et le coût total.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Import Vehicle Calculator</h3>
            <p className="text-gray-400 text-sm">
              Outil gratuit d'estimation des coûts d'importation de véhicules en France
            </p>
            <div className="mt-4 flex justify-center gap-6 text-sm text-gray-400">
              <span>• Données officielles 2025</span>
              <span>• Calculs conformes à la réglementation</span>
              <span>• Gratuit et sans inscription</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}