import { GameLocation } from '@/types/game';

export const GAME_LOCATIONS: GameLocation[] = [
  // Starting position
  {
    id: 'start',
    name: 'ANTIOCHIA',
    type: 'special',
    journey: 1,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Starting point of Paul\'s missionary journeys'
  },
  
  // Journey 1 locations (clockwise from Antioch)
  {
    id: 'salamina',
    name: 'SALAMINA',
    type: 'port',
    journey: 1,
    price: 100,
    rent: 10,
    churchCost: 50,
    synagogueCost: 40,
    buildings: { churches: 0, synagogues: 0 },
    description: 'First port in Cyprus where Paul preached'
  },
  
  {
    id: 'pafos',
    name: 'PAFOS',
    type: 'city',
    journey: 1,
    price: 120,
    rent: 12,
    churchCost: 60,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Capital of Cyprus, where Paul met the proconsul'
  },
  
  {
    id: 'perga',
    name: 'PERGA',
    type: 'city',
    journey: 1,
    price: 110,
    rent: 11,
    churchCost: 55,
    synagogueCost: 45,
    buildings: { churches: 0, synagogues: 0 },
    description: 'City in Pamphylia where John Mark left them'
  },
  
  {
    id: 'antiochia-pisidia',
    name: 'ANTIOCHIA PISIDIEI',
    type: 'city',
    journey: 1,
    price: 140,
    rent: 14,
    churchCost: 70,
    synagogueCost: 60,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Paul\'s famous sermon in the synagogue'
  },
  
  {
    id: 'iconia',
    name: 'ICONIA',
    type: 'city',
    journey: 1,
    price: 130,
    rent: 13,
    churchCost: 65,
    synagogueCost: 55,
    buildings: { churches: 0, synagogues: 0 },
    description: 'City where Paul and Barnabas preached boldly'
  },
  
  {
    id: 'listra',
    name: 'LISTRA',
    type: 'city',
    journey: 1,
    price: 120,
    rent: 12,
    churchCost: 60,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Where Paul healed a lame man'
  },
  
  {
    id: 'derbe',
    name: 'DERBE',
    type: 'city',
    journey: 1,
    price: 115,
    rent: 11,
    churchCost: 55,
    synagogueCost: 45,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Eastern end of first journey'
  },
  
  // Journey 2 locations
  {
    id: 'troas',
    name: 'TROAS',
    type: 'port',
    journey: 2,
    price: 150,
    rent: 15,
    churchCost: 75,
    synagogueCost: 65,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Port where Paul had his Macedonian vision'
  },
  
  {
    id: 'filipi',
    name: 'FILIPI',
    type: 'city',
    journey: 2,
    price: 160,
    rent: 16,
    churchCost: 80,
    synagogueCost: 70,
    buildings: { churches: 0, synagogues: 0 },
    description: 'First European city where Paul preached'
  },
  
  {
    id: 'tesalonic',
    name: 'TESALONIC',
    type: 'city',
    journey: 2,
    price: 170,
    rent: 17,
    churchCost: 85,
    synagogueCost: 75,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Important port city in Macedonia'
  },
  
  {
    id: 'bereea',
    name: 'BEREEA',
    type: 'city',
    journey: 2,
    price: 155,
    rent: 15,
    churchCost: 75,
    synagogueCost: 65,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Noble Bereans who searched the Scriptures'
  },
  
  {
    id: 'atena',
    name: 'ATENA',
    type: 'city',
    journey: 2,
    price: 200,
    rent: 20,
    churchCost: 100,
    synagogueCost: 90,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Paul\'s speech at the Areopagus'
  },
  
  {
    id: 'corint',
    name: 'CORINT',
    type: 'city',
    journey: 2,
    price: 180,
    rent: 18,
    churchCost: 90,
    synagogueCost: 80,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Where Paul stayed 18 months'
  },
  
  // Journey 3 locations
  {
    id: 'efes',
    name: 'EFES',
    type: 'city',
    journey: 3,
    price: 220,
    rent: 22,
    churchCost: 110,
    synagogueCost: 100,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Great commercial center, Paul stayed 3 years'
  },
  
  {
    id: 'milet',
    name: 'MILET',
    type: 'port',
    journey: 3,
    price: 190,
    rent: 19,
    churchCost: 95,
    synagogueCost: 85,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Paul\'s farewell to Ephesian elders'
  },
  
  {
    id: 'rodos',
    name: 'RODOS',
    type: 'port',
    journey: 3,
    price: 175,
    rent: 17,
    churchCost: 85,
    synagogueCost: 75,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Island stop on return journey'
  },
  
  {
    id: 'tars',
    name: 'TARS',
    type: 'city',
    journey: 3,
    price: 140,
    rent: 14,
    churchCost: 70,
    synagogueCost: 60,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Paul\'s birthplace'
  },
  
  // Journey 4 (to Rome) locations
  {
    id: 'sidonia',
    name: 'SIDON',
    type: 'port',
    journey: 4,
    price: 160,
    rent: 16,
    churchCost: 80,
    synagogueCost: 70,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Phoenician port city'
  },
  
  {
    id: 'cezareea',
    name: 'CEZAREEA',
    type: 'port',
    journey: 4,
    price: 180,
    rent: 18,
    churchCost: 90,
    synagogueCost: 80,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Roman capital of Judea'
  },
  
  {
    id: 'malta',
    name: 'MALTA',
    type: 'city',
    journey: 4,
    price: 170,
    rent: 17,
    churchCost: 85,
    synagogueCost: 75,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Island where Paul was shipwrecked'
  },
  
  {
    id: 'roma',
    name: 'ROMA',
    type: 'city',
    journey: 4,
    price: 300,
    rent: 30,
    churchCost: 150,
    synagogueCost: 140,
    buildings: { churches: 0, synagogues: 0 },
    description: 'The eternal city, Paul\'s final destination'
  },
  
  // Special locations
  {
    id: 'ierusalem',
    name: 'IERUSALEM',
    type: 'special',
    journey: 1,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'The holy city, center of early Christianity'
  }
];