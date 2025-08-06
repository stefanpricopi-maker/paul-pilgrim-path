import { GameLocation } from '@/types/game';

export const GAME_LOCATIONS: GameLocation[] = [
  // CORNER: Starting position - ANTIOCHIA (bottom-right corner)
  {
    id: 'antiochia',
    name: 'ANTIOCHIA',
    type: 'special',
    journey: 1,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Starting point of Paul\'s missionary journeys',
    color: '#FFD700' // Gold color for start
  },
  
  // BOTTOM ROW: positions 1-9 (moving left from ANTIOCHIA)
{
    id: 'salamina',
    name: 'SALAMINA',
    type: 'city',
    journey: 1,
    price: 60,
    rent: 2,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'First port in Cyprus where Paul preached',
    color: '#8B4513' // Brown
  },
   {
    id: 'comunitate1',
    name: 'COMUNITATE',
    type: 'community-chest',
    journey: 1,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Community Chest - Draw a card',
    color: '#87CEEB' // Light blue
  },
  {
    id: 'iconia',
    name: 'ICONIA',
    type: 'city',
    journey: 1,
    price: 120,
    rent: 8,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'City where Paul and Barnabas preached boldly',
    color: '#FF4500' // Orange red
  },
  
  {
    id: 'antiochia-pisidia',
    name: 'ANTIOCHIA PISIDIEI',
    type: 'city',
    journey: 1,
    price: 100,
    rent: 6,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Paul\'s famous sermon in the synagogue',
    color: '#FF4500' // Orange red
  },
  
  {
    id: 'har1',
    name: 'HAR',
    type: 'chance',
    journey: 1,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Chance - Draw a card',
    color: '#FFA500' // Orange
  },
  
  {
    id: 'perga',
    name: 'PERGA',
    type: 'city',
    journey: 1,
    price: 100,
    rent: 6,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'City in Pamphylia where John Mark left them',
    color: '#FF4500' // Orange red
  },
  
  {
    id: 'port1',
    name: 'PORT',
    type: 'port',
    journey: 1,
    price: 200,
    rent: 25,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Mediterranean Port',
    color: '#000000' // Black
  },
  
  {
    id: 'jertfa1',
    name: 'JERTFA',
    type: 'sacrifice',
    journey: 1,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Pay sacrifice tax',
    color: '#DC143C' // Crimson
  },
  
  {
    id: 'pafos',
    name: 'PAFOS',
    type: 'city',
    journey: 1,
    price: 60,
    rent: 4,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Capital of Cyprus, where Paul met the proconsul',
    color: '#8B4513' // Brown
  },
  
 

  // CORNER: PRISON (bottom-left corner) - position 10
  {
    id: 'prison',
    name: 'PRISON',
    type: 'prison',
    journey: 2,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Just visiting or in prison',
    color: '#808080' // Gray
  },
  
  // LEFT COLUMN: positions 11-19 (moving up from PRISON)
  {
    id: 'listra',
    name: 'LISTRA',
    type: 'city',
    journey: 1,
    price: 140,
    rent: 10,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Where Paul healed a lame man',
    color: '#FF1493' // Deep pink
  },
  
  {
    id: 'port2',
    name: 'PORT',
    type: 'port',
    journey: 2,
    price: 200,
    rent: 25,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Mediterranean Port',
    color: '#000000' // Black
  },
  
  {
    id: 'derbe',
    name: 'DERBE',
    type: 'city',
    journey: 1,
    price: 140,
    rent: 10,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Eastern end of first journey',
    color: '#FF1493' // Deep pink
  },
  
  {
    id: 'troas',
    name: 'TROAS',
    type: 'city',
    journey: 2,
    price: 160,
    rent: 12,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Port where Paul had his Macedonian vision',
    color: '#FF1493' // Deep pink
  },
  
  {
    id: 'filipi',
    name: 'FILIPI',
    type: 'city',
    journey: 2,
    price: 180,
    rent: 14,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'First European city where Paul preached',
    color: '#FFFF00' // Yellow
  },
  
  {
    id: 'har2',
    name: 'HAR',
    type: 'chance',
    journey: 2,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Chance - Draw a card',
    color: '#FFA500' // Orange
  },
  
  {
    id: 'tesalonic',
    name: 'TESALONIC',
    type: 'city',
    journey: 2,
    price: 180,
    rent: 14,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Important port city in Macedonia',
    color: '#FFFF00' // Yellow
  },
  
  {
    id: 'bereea',
    name: 'BEREEA',
    type: 'city',
    journey: 2,
    price: 200,
    rent: 16,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Noble Bereans who searched the Scriptures',
    color: '#FFFF00' // Yellow
  },

  // CORNER: SABAT (top-left corner) - position 20
  {
    id: 'sabat',
    name: 'SABAT',
    type: 'special',
    journey: 2,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Sabbath - Skip next turn',
    color: '#4B0082' // Indigo
  },
  
  // TOP ROW: positions 21-29 (moving right from SABAT)
  {
    id: 'atena',
    name: 'ATENA',
    type: 'city',
    journey: 2,
    price: 220,
    rent: 18,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Paul\'s speech at the Areopagus',
    color: '#FF0000' // Red
  },
  
  {
    id: 'comunitate2',
    name: 'COMUNITATE',
    type: 'community-chest',
    journey: 2,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Community Chest - Draw a card',
    color: '#87CEEB' // Light blue
  },
  
  {
    id: 'corint',
    name: 'CORINT',
    type: 'city',
    journey: 2,
    price: 220,
    rent: 18,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Where Paul stayed 18 months',
    color: '#FF0000' // Red
  },
  
  {
    id: 'port3',
    name: 'PORT',
    type: 'port',
    journey: 3,
    price: 200,
    rent: 25,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Mediterranean Port',
    color: '#000000' // Black
  },
  
  {
    id: 'efes',
    name: 'EFES',
    type: 'city',
    journey: 3,
    price: 240,
    rent: 20,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Great commercial center, Paul stayed 3 years',
    color: '#FF0000' // Red
  },
  
  {
    id: 'milet',
    name: 'MILET',
    type: 'city',
    journey: 3,
    price: 260,
    rent: 22,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Paul\'s farewell to Ephesian elders',
    color: '#00FF00' // Green
  },
  
  {
    id: 'har3',
    name: 'HAR',
    type: 'chance',
    journey: 3,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Chance - Draw a card',
    color: '#FFA500' // Orange
  },
  
  {
    id: 'rodos',
    name: 'RODOS',
    type: 'city',
    journey: 3,
    price: 260,
    rent: 22,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Island stop on return journey',
    color: '#00FF00' // Green
  },
  
  {
    id: 'tars',
    name: 'TARS',
    type: 'city',
    journey: 3,
    price: 280,
    rent: 24,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Paul\'s birthplace',
    color: '#00FF00' // Green
  },

  // CORNER: GO TO PRISON (top-right corner) - position 30
  {
    id: 'go-to-prison',
    name: 'GO TO PRISON',
    type: 'go-to-prison',
    journey: 4,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Go directly to prison',
    color: '#8B0000' // Dark red
  },
  
  // RIGHT COLUMN: positions 31-39 (moving down from GO TO PRISON)
  {
    id: 'cort',
    name: 'CORT',
    type: 'court',
    journey: 4,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Free Parking - Court',
    color: '#FF0000' // Red
  },
  
  {
    id: 'sidonia',
    name: 'SIDON',
    type: 'city',
    journey: 4,
    price: 300,
    rent: 26,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Phoenician port city',
    color: '#0000FF' // Blue
  },
  
  {
    id: 'comunitate3',
    name: 'COMUNITATE',
    type: 'community-chest',
    journey: 4,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Community Chest - Draw a card',
    color: '#87CEEB' // Light blue
  },
  
  {
    id: 'cezareea',
    name: 'CEZAREEA',
    type: 'city',
    journey: 4,
    price: 300,
    rent: 26,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Roman capital of Judea',
    color: '#0000FF' // Blue
  },
  
  {
    id: 'port4',
    name: 'PORT',
    type: 'port',
    journey: 4,
    price: 200,
    rent: 25,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Mediterranean Port',
    color: '#000000' // Black
  },
  
  {
    id: 'malta',
    name: 'MALTA',
    type: 'city',
    journey: 4,
    price: 320,
    rent: 28,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Island where Paul was shipwrecked',
    color: '#0000FF' // Blue
  },
  
  {
    id: 'jertfa2',
    name: 'JERTFA',
    type: 'sacrifice',
    journey: 4,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Pay sacrifice tax',
    color: '#DC143C' // Crimson
  },
  
  {
    id: 'roma',
    name: 'ROMA',
    type: 'city',
    journey: 4,
    price: 400,
    rent: 50,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'The eternal city, Paul\'s final destination',
    color: '#800080' // Purple
  },

  // Special location (not part of board movement)
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
    description: 'The holy city, center of early Christianity',
    color: '#FFD700' // Gold
  }
];