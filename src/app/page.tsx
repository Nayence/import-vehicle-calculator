'use client';

import React, { useState } from 'react';
import { VehicleSelector } from '@/components/VehicleSelector';
import { ImportParams } from '@/components/ImportParams';
import { Calculator } from '@/components/Calculator';
import type { ImportParams as ImportParamsType } from '@/components/ImportParams';
import { Calculator as CalculatorIcon, Car, MapPin, Euro, AlertTriangle, Zap, Gauge, Award } from 'lucide-react';

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

export default function HomePage() {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);
  const [importParams, setImportParams] = useState<ImportParamsType | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header amélioré */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <CalculatorIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Import Vehicle Calculator
                </h1>
                <p className="text-sm text-gray-500">
                  Calculateur d'importation de véhicules - Barèmes 2025
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
                <Award className="h-4 w-4" />
                Barèmes officiels 2025
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction améliorée */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Calculez vos coûts d'importation avec précision
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto mb-6">
            Estimation complète avec les <strong>barèmes officiels 2025</strong> : 
            malus CO2/poids avec décotes, TVA selon origine, frais DREAL et carte grise.
          </p>
          
          {/* Badges nouveautés */}
          <div className="flex justify-center gap-4 text-sm">
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Nouveau : Décotes 2025
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center gap-1">
              <Gauge className="h-4 w-4" />
              Malus poids intégré
            </div>
            <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full flex items-center gap-1">
              <Award className="h-4 w-4" />
              Plafonnement 70k€
            </div>
          </div>
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

          {/* Right Column - Results avec nouveau calculateur */}
          <div className="lg:col-span-1">
            <Calculator 
              selectedVehicle={selectedVehicle} 
              importParams={importParams} 
            />
          </div>
        </div>

        {/* Nouveautés 2025 */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Nouveautés barèmes 2025
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-gray-900 mb-2">🎯 Décotes renforcées</h4>
              <p className="text-gray-600">
                Nouveau système de décotes selon l'âge : jusqu'à 70% de réduction 
                sur les malus pour véhicules d'occasion.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-gray-900 mb-2">⚖️ Malus poids étendu</h4>
              <p className="text-gray-600">
                Barème par tranches de 10€ à 30€/kg selon le poids total, 
                avec plafonnement combiné à 70 000€.
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-gray-900 mb-2">🔋 Exemptions étendues</h4>
              <p className="text-gray-600">
                Véhicules électriques, hybrides rechargeables, E85 et 
                adaptations handicap totalement exemptés.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Info amélioré */}
        <div className="mt-12 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            💡 Comment ça marche ?
          </h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">1. Sélectionnez votre véhicule</h4>
              <p>
                Choisissez marque, modèle et version. Les données CO2, poids et puissance 
                fiscale sont automatiquement renseignées pour un calcul précis.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">2. Paramètres d'importation</h4>
              <p>
                Renseignez le prix, pays d'origine, date d'immatriculation et département. 
                Le système détecte automatiquement si le véhicule est neuf ou d'occasion.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">3. Résultats détaillés</h4>
              <p>
                Obtenez le calcul complet avec TVA, malus CO2/poids décotés, 
                frais DREAL et estimation carte grise selon votre région.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">🔢 Conformité réglementaire</h4>
            <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-500">
              <div>
                <strong>Sources officielles :</strong> Barème malus CO2 (Art. 1011 bis CGI), 
                Malus poids (Loi de finances 2025), Tarifs DREAL par région
              </div>
              <div>
                <strong>Dernière mise à jour :</strong> Janvier 2025 - 
                Intégration décrets d'application et circulaires préfectorales
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Import Vehicle Calculator</h3>
            <p className="text-gray-400 text-sm mb-4">
              Calculateur officiel d'estimation des coûts d'importation de véhicules en France
            </p>
            <div className="flex justify-center gap-8 text-sm text-gray-400 mb-4">
              <span>• Barèmes officiels 2025</span>
              <span>• Décotes et exemptions</span>
              <span>• Calculs certifiés conformes</span>
            </div>
            <div className="text-xs text-gray-500">
              <p>⚠️ Les montants calculés sont des estimations basées sur la réglementation en vigueur.</p>
              <p>Pour une validation officielle, consultez votre DREAL de rattachement.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}