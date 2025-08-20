'use client';

import React, { useState, useEffect } from 'react';
import { Select } from '@/components/ui/Select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Car, Fuel, Weight, Gauge } from 'lucide-react';

// Données mockées pour le MVP - VERSION COMPLÈTE
const MOCK_VEHICLES = {
  brands: ['BMW', 'AUDI', 'MERCEDES', 'VOLKSWAGEN', 'PEUGEOT', 'RENAULT'],
  models: {
    'BMW': ['Serie 1', 'Serie 3', 'Serie 5', 'X1', 'X3', 'X5'],
    'AUDI': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7'],
    'MERCEDES': ['Classe A', 'Classe C', 'Classe E', 'GLA', 'GLC', 'GLE'],
    'VOLKSWAGEN': ['Polo', 'Golf', 'Passat', 'Tiguan', 'Touareg'],
    'PEUGEOT': ['208', '308', '3008', '5008'],
    'RENAULT': ['Clio', 'Megane', 'Captur', 'Kadjar']
  },
  versions: {
    // BMW
    'BMW-Serie 1': [
      { name: '118d', co2: 125, weight: 1380, fuelType: 'Diesel', fiscalPower: 7 },
      { name: '120i', co2: 142, weight: 1420, fuelType: 'Essence', fiscalPower: 8 },
      { name: 'M135i xDrive', co2: 178, weight: 1520, fuelType: 'Essence', fiscalPower: 12 }
    ],
    'BMW-Serie 3': [
      { name: '320d xDrive', co2: 142, weight: 1590, fuelType: 'Diesel', fiscalPower: 8 },
      { name: '330i', co2: 155, weight: 1520, fuelType: 'Essence', fiscalPower: 9 },
      { name: '318d', co2: 128, weight: 1480, fuelType: 'Diesel', fiscalPower: 7 },
      { name: 'M340i xDrive', co2: 195, weight: 1665, fuelType: 'Essence', fiscalPower: 14 }
    ],
    'BMW-Serie 5': [
      { name: '520d', co2: 152, weight: 1650, fuelType: 'Diesel', fiscalPower: 9 },
      { name: '530i', co2: 168, weight: 1620, fuelType: 'Essence', fiscalPower: 11 },
      { name: 'M550i xDrive', co2: 228, weight: 1920, fuelType: 'Essence', fiscalPower: 18 }
    ],
    'BMW-X1': [
      { name: 'sDrive18d', co2: 135, weight: 1570, fuelType: 'Diesel', fiscalPower: 7 },
      { name: 'xDrive20i', co2: 158, weight: 1650, fuelType: 'Essence', fiscalPower: 9 }
    ],
    'BMW-X3': [
      { name: 'xDrive20d', co2: 168, weight: 1835, fuelType: 'Diesel', fiscalPower: 9 },
      { name: 'xDrive30i', co2: 185, weight: 1815, fuelType: 'Essence', fiscalPower: 12 }
    ],
    'BMW-X5': [
      { name: 'xDrive30d', co2: 195, weight: 2145, fuelType: 'Diesel', fiscalPower: 12 },
      { name: 'xDrive40i', co2: 215, weight: 2100, fuelType: 'Essence', fiscalPower: 15 }
    ],

    // AUDI
    'AUDI-A3': [
      { name: '30 TDI', co2: 128, weight: 1395, fuelType: 'Diesel', fiscalPower: 7 },
      { name: '35 TFSI', co2: 148, weight: 1380, fuelType: 'Essence', fiscalPower: 8 },
      { name: 'RS3', co2: 195, weight: 1590, fuelType: 'Essence', fiscalPower: 17 }
    ],
    'AUDI-A4': [
      { name: '35 TDI', co2: 138, weight: 1480, fuelType: 'Diesel', fiscalPower: 7 },
      { name: '40 TFSI', co2: 162, weight: 1520, fuelType: 'Essence', fiscalPower: 9 },
      { name: '45 TDI Quattro', co2: 158, weight: 1680, fuelType: 'Diesel', fiscalPower: 12 },
      { name: 'S4', co2: 195, weight: 1720, fuelType: 'Essence', fiscalPower: 15 }
    ],
    'AUDI-A6': [
      { name: '40 TDI', co2: 155, weight: 1650, fuelType: 'Diesel', fiscalPower: 9 },
      { name: '45 TFSI', co2: 172, weight: 1630, fuelType: 'Essence', fiscalPower: 11 }
    ],
    'AUDI-Q3': [
      { name: '35 TDI', co2: 152, weight: 1640, fuelType: 'Diesel', fiscalPower: 8 },
      { name: '40 TFSI', co2: 168, weight: 1620, fuelType: 'Essence', fiscalPower: 10 }
    ],
    'AUDI-Q5': [
      { name: '40 TDI Quattro', co2: 175, weight: 1870, fuelType: 'Diesel', fiscalPower: 9 },
      { name: '45 TFSI Quattro', co2: 192, weight: 1850, fuelType: 'Essence', fiscalPower: 12 }
    ],
    'AUDI-Q7': [
      { name: '50 TDI Quattro', co2: 208, weight: 2240, fuelType: 'Diesel', fiscalPower: 13 },
      { name: '55 TFSI Quattro', co2: 225, weight: 2200, fuelType: 'Essence', fiscalPower: 15 }
    ],

    // MERCEDES
    'MERCEDES-Classe A': [
      { name: 'A180d', co2: 132, weight: 1420, fuelType: 'Diesel', fiscalPower: 7 },
      { name: 'A200', co2: 148, weight: 1395, fuelType: 'Essence', fiscalPower: 8 },
      { name: 'A35 AMG', co2: 185, weight: 1550, fuelType: 'Essence', fiscalPower: 13 }
    ],
    'MERCEDES-Classe C': [
      { name: 'C220d', co2: 145, weight: 1615, fuelType: 'Diesel', fiscalPower: 8 },
      { name: 'C300', co2: 168, weight: 1590, fuelType: 'Essence', fiscalPower: 11 },
      { name: 'C200', co2: 152, weight: 1540, fuelType: 'Essence', fiscalPower: 9 },
      { name: 'C63 AMG', co2: 225, weight: 1825, fuelType: 'Essence', fiscalPower: 18 }
    ],
    'MERCEDES-Classe E': [
      { name: 'E220d', co2: 158, weight: 1720, fuelType: 'Diesel', fiscalPower: 9 },
      { name: 'E300', co2: 175, weight: 1695, fuelType: 'Essence', fiscalPower: 11 }
    ],
    'MERCEDES-GLA': [
      { name: 'GLA200d', co2: 152, weight: 1680, fuelType: 'Diesel', fiscalPower: 8 },
      { name: 'GLA250', co2: 168, weight: 1650, fuelType: 'Essence', fiscalPower: 10 }
    ],
    'MERCEDES-GLC': [
      { name: 'GLC220d 4MATIC', co2: 175, weight: 1910, fuelType: 'Diesel', fiscalPower: 9 },
      { name: 'GLC300 4MATIC', co2: 192, weight: 1885, fuelType: 'Essence', fiscalPower: 12 }
    ],
    'MERCEDES-GLE': [
      { name: 'GLE350d 4MATIC', co2: 205, weight: 2245, fuelType: 'Diesel', fiscalPower: 12 },
      { name: 'GLE450 4MATIC', co2: 218, weight: 2200, fuelType: 'Essence', fiscalPower: 15 }
    ],

    // VOLKSWAGEN
    'VOLKSWAGEN-Polo': [
      { name: '1.0 TSI', co2: 118, weight: 1145, fuelType: 'Essence', fiscalPower: 5 },
      { name: '1.6 TDI', co2: 125, weight: 1195, fuelType: 'Diesel', fiscalPower: 6 },
      { name: 'GTI', co2: 158, weight: 1280, fuelType: 'Essence', fiscalPower: 9 }
    ],
    'VOLKSWAGEN-Golf': [
      { name: '1.5 TSI', co2: 125, weight: 1320, fuelType: 'Essence', fiscalPower: 6 },
      { name: '2.0 TDI', co2: 135, weight: 1380, fuelType: 'Diesel', fiscalPower: 7 },
      { name: 'GTI', co2: 169, weight: 1430, fuelType: 'Essence', fiscalPower: 11 },
      { name: 'R', co2: 188, weight: 1580, fuelType: 'Essence', fiscalPower: 14 }
    ],
    'VOLKSWAGEN-Passat': [
      { name: '2.0 TDI', co2: 148, weight: 1520, fuelType: 'Diesel', fiscalPower: 8 },
      { name: '2.0 TSI', co2: 165, weight: 1495, fuelType: 'Essence', fiscalPower: 10 }
    ],
    'VOLKSWAGEN-Tiguan': [
      { name: '2.0 TDI', co2: 162, weight: 1685, fuelType: 'Diesel', fiscalPower: 8 },
      { name: '2.0 TSI 4Motion', co2: 178, weight: 1720, fuelType: 'Essence', fiscalPower: 11 }
    ],
    'VOLKSWAGEN-Touareg': [
      { name: '3.0 V6 TDI', co2: 192, weight: 2165, fuelType: 'Diesel', fiscalPower: 12 },
      { name: '3.0 V6 TSI', co2: 215, weight: 2140, fuelType: 'Essence', fiscalPower: 15 }
    ],

    // PEUGEOT
    'PEUGEOT-208': [
      { name: '1.2 PureTech', co2: 118, weight: 1090, fuelType: 'Essence', fiscalPower: 5 },
      { name: '1.5 BlueHDi', co2: 125, weight: 1150, fuelType: 'Diesel', fiscalPower: 6 },
      { name: 'GTi', co2: 158, weight: 1230, fuelType: 'Essence', fiscalPower: 9 }
    ],
    'PEUGEOT-308': [
      { name: '1.2 PureTech', co2: 125, weight: 1240, fuelType: 'Essence', fiscalPower: 6 },
      { name: '1.5 BlueHDi', co2: 132, weight: 1310, fuelType: 'Diesel', fiscalPower: 7 },
      { name: 'GTi', co2: 168, weight: 1380, fuelType: 'Essence', fiscalPower: 11 }
    ],
    'PEUGEOT-3008': [
      { name: '1.2 PureTech', co2: 142, weight: 1410, fuelType: 'Essence', fiscalPower: 7 },
      { name: '1.5 BlueHDi', co2: 138, weight: 1485, fuelType: 'Diesel', fiscalPower: 7 },
      { name: '1.6 PureTech', co2: 158, weight: 1455, fuelType: 'Essence', fiscalPower: 9 }
    ],
    'PEUGEOT-5008': [
      { name: '1.2 PureTech', co2: 148, weight: 1565, fuelType: 'Essence', fiscalPower: 7 },
      { name: '1.5 BlueHDi', co2: 142, weight: 1640, fuelType: 'Diesel', fiscalPower: 7 }
    ],

    // RENAULT
    'RENAULT-Clio': [
      { name: 'TCe 90', co2: 125, weight: 1150, fuelType: 'Essence', fiscalPower: 5 },
      { name: 'dCi 85', co2: 132, weight: 1195, fuelType: 'Diesel', fiscalPower: 6 },
      { name: 'RS', co2: 175, weight: 1340, fuelType: 'Essence', fiscalPower: 12 }
    ],
    'RENAULT-Megane': [
      { name: 'TCe 140', co2: 135, weight: 1285, fuelType: 'Essence', fiscalPower: 7 },
      { name: 'dCi 110', co2: 128, weight: 1350, fuelType: 'Diesel', fiscalPower: 6 },
      { name: 'RS', co2: 185, weight: 1430, fuelType: 'Essence', fiscalPower: 13 }
    ],
    'RENAULT-Captur': [
      { name: 'TCe 90', co2: 138, weight: 1285, fuelType: 'Essence', fiscalPower: 6 },
      { name: 'dCi 95', co2: 132, weight: 1340, fuelType: 'Diesel', fiscalPower: 6 }
    ],
    'RENAULT-Kadjar': [
      { name: 'TCe 140', co2: 152, weight: 1485, fuelType: 'Essence', fiscalPower: 8 },
      { name: 'dCi 115', co2: 145, weight: 1540, fuelType: 'Diesel', fiscalPower: 7 }
    ]
  }
};

interface VehicleData {
  name: string;
  co2: number;
  weight: number;
  fuelType: string;
  fiscalPower: number;
}

interface VehicleSelectorProps {
  onVehicleSelect: (vehicle: VehicleData | null) => void;
}

export function VehicleSelector({ onVehicleSelect }: VehicleSelectorProps) {
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVersion, setSelectedVersion] = useState('');
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);

  const availableModels = selectedBrand ? MOCK_VEHICLES.models[selectedBrand as keyof typeof MOCK_VEHICLES.models] || [] : [];
  const availableVersions = selectedBrand && selectedModel ? 
    MOCK_VEHICLES.versions[`${selectedBrand}-${selectedModel}` as keyof typeof MOCK_VEHICLES.versions] || [] : [];

  // Reset des sélections en cascade
  useEffect(() => {
    setSelectedModel('');
    setSelectedVersion('');
    setVehicleData(null);
  }, [selectedBrand]);

  useEffect(() => {
    setSelectedVersion('');
    setVehicleData(null);
  }, [selectedModel]);

  useEffect(() => {
    if (selectedVersion && availableVersions.length > 0) {
      const version = availableVersions.find(v => v.name === selectedVersion);
      if (version) {
        setVehicleData(version);
        onVehicleSelect(version);
      }
    } else {
      setVehicleData(null);
      onVehicleSelect(null);
    }
  }, [selectedVersion, availableVersions, onVehicleSelect]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="h-5 w-5 text-blue-600" />
          Sélection du véhicule
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Sélection Marque */}
        <Select
          label="Marque"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="">Choisir une marque</option>
          {MOCK_VEHICLES.brands.map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </Select>

        {/* Sélection Modèle */}
        <Select
          label="Modèle"
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          disabled={!selectedBrand}
        >
          <option value="">Choisir un modèle</option>
          {availableModels.map(model => (
            <option key={model} value={model}>{model}</option>
          ))}
        </Select>

        {/* Sélection Version */}
        <Select
          label="Version / Motorisation"
          value={selectedVersion}
          onChange={(e) => setSelectedVersion(e.target.value)}
          disabled={!selectedModel}
        >
          <option value="">Choisir une version</option>
          {availableVersions.map(version => (
            <option key={version.name} value={version.name}>
              {version.name}
            </option>
          ))}
        </Select>

        {/* Affichage des données véhicule - COULEURS AMÉLIORÉES */}
        {vehicleData && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3">Caractéristiques du véhicule</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700 font-medium">Émissions CO2:</span>
                <span className="font-bold text-gray-900">{vehicleData.co2} g/km</span>
              </div>
              <div className="flex items-center gap-2">
                <Weight className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700 font-medium">Poids:</span>
                <span className="font-bold text-gray-900">{vehicleData.weight} kg</span>
              </div>
              <div className="flex items-center gap-2">
                <Fuel className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700 font-medium">Carburant:</span>
                <span className="font-bold text-gray-900">{vehicleData.fuelType}</span>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4 text-blue-600" />
                <span className="text-gray-700 font-medium">Puissance fiscale:</span>
                <span className="font-bold text-gray-900">{vehicleData.fiscalPower} CV</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}