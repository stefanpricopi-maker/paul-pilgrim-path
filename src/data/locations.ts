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
    color: '#E3D9B3', //aged ivory
    
    // Enhanced metadata
    historicalContext: {
      en: 'Antioch in Syria was the third-largest city in the Roman Empire and the birthplace of gentile Christianity. Here believers were first called "Christians".',
      ro: 'Antiohia din Siria era al treilea oraș ca mărime din Imperiul Roman și locul de naștere al creștinismului păgân. Aici credincioșii au fost numiți pentru prima dată "creștini".'
    },
    journeyOrder: 1,
    scriptureReferences: ['Acts 11:19-26', 'Acts 13:1-3', 'Acts 14:26-28'],
    significance: {
      en: 'The launching point of Paul\'s missionary journeys and center of gentile Christianity',
      ro: 'Punctul de plecare al călătoriilor misionare ale lui Pavel și centrul creștinismului păgân'
    },
    backgroundImage: '/backgrounds/antioch-ancient.jpg',
    iconType: 'church-cross',
    nameVariants: {
      en: 'Antioch',
      ro: 'Antiohia',
      historical: 'Ἀντιόχεια'
    },
    journeyPhase: 'departure',
    connections: ['salamina', 'seleucia'],
    events: {
      en: ['First called "Christians"', 'Commissioning of Paul and Barnabas', 'Base for three missionary journeys'],
      ro: ['Primul numit "creștini"', 'Împuternicirea lui Pavel și Barnaba', 'Baza pentru trei călătorii misionare']
    },
    visualTheme: {
      primaryColor: 'hsl(38, 25%, 85%)',
      accentColor: 'hsl(42, 85%, 58%)',
      gradientDirection: '135deg',
      textColor: 'hsl(25, 35%, 25%)'
    },
    shortDescription: {
      en: 'Birthplace of Christian missions',
      ro: 'Locul de naștere al misiunilor creștine'
    },
    extendedDescription: {
      en: 'Antioch served as Paul\'s home base, the place where he was commissioned for his journeys and where he reported back after each mission. It was here that the gospel first reached the gentiles in significant numbers.',
      ro: 'Antiohia a servit ca bază pentru Pavel, locul unde a fost împuternicit pentru călătoriile sale și unde s-a întors după fiecare misiune. Aici evanghelia a ajuns pentru prima dată la păgâni în număr semnificativ.'
    },
    interestingFacts: {
      en: ['Third largest city in Roman Empire', 'Had over 500,000 inhabitants', 'Famous for its chariot races'],
      ro: ['Al treilea oraș ca mărime din Imperiul Roman', 'Avea peste 500.000 de locuitori', 'Faimos pentru cursele cu care']
    }
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
    color: '#6B4A4F', // Brown
    
    // Enhanced metadata
    historicalContext: {
      en: 'Salamis was the largest city and commercial center of Cyprus, with a significant Jewish population and multiple synagogues.',
      ro: 'Salamina era cel mai mare oraș și centru comercial al Ciprului, cu o populație evreiască semnificativă și mai multe sinagogi.'
    },
    journeyOrder: 1,
    scriptureReferences: ['Acts 13:4-5'],
    significance: {
      en: 'First stop on Paul\'s first missionary journey, where he preached in Jewish synagogues',
      ro: 'Prima oprire în prima călătorie misionară a lui Pavel, unde a predicat în sinagogile evreiești'
    },
    backgroundImage: '/backgrounds/salamis-harbor.jpg',
    iconType: 'synagogue',
    nameVariants: {
      en: 'Salamis',
      ro: 'Salamina',
      historical: 'Σαλαμίς'
    },
    journeyPhase: 'ministry',
    connections: ['antiochia', 'pafos'],
    events: {
      en: ['First preaching in synagogues', 'Beginning of Cyprus mission'],
      ro: ['Prima predicare în sinagogi', 'Începutul misiunii din Cipru']
    },
    visualTheme: {
      primaryColor: 'hsl(15, 25%, 45%)',
      accentColor: 'hsl(200, 85%, 62%)',
      gradientDirection: '90deg',
      textColor: 'hsl(35, 25%, 96%)'
    },
    shortDescription: {
      en: 'Gateway to Cyprus mission',
      ro: 'Poarta misiunii din Cipru'
    },
    extendedDescription: {
      en: 'As the chief port of Cyprus, Salamis was Paul and Barnabas\'s first stop after leaving Antioch. Here they established the pattern of preaching first in synagogues.',
      ro: 'Ca portul principal al Ciprului, Salamina a fost prima oprire a lui Pavel și Barnaba după ce au părăsit Antiohia. Aici au stabilit modelul de a predica mai întâi în sinagogi.'
    },
    interestingFacts: {
      en: ['Had multiple synagogues', 'Major trading port', 'Birthplace of Barnabas'],
      ro: ['Avea mai multe sinagogi', 'Port comercial major', 'Locul de naștere al lui Barnaba']
    }
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
    color: '#87CEEB', // Light blue
    
    // Enhanced metadata for special tiles
    historicalContext: {
      en: 'Represents the early Christian community\'s care for one another and sharing of resources.',
      ro: 'Reprezintă grija comunității creștine timpurii una pentru alta și împărtășirea resurselor.'
    },
    iconType: 'community-chest',
    nameVariants: {
      en: 'Community',
      ro: 'Comunitate'
    },
    journeyPhase: 'ministry',
    visualTheme: {
      primaryColor: 'hsl(200, 85%, 62%)',
      accentColor: 'hsl(42, 85%, 58%)',
      gradientDirection: '45deg',
      textColor: 'hsl(25, 35%, 15%)'
    },
    shortDescription: {
      en: 'Early Christian fellowship',
      ro: 'Comuniunea creștină timpurie'
    }
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
    color: '#6B4A4F', // Brown
    
    // Enhanced metadata
    historicalContext: {
      en: 'Paphos was the Roman capital of Cyprus and seat of the proconsul. Here Paul encountered the sorcerer Bar-Jesus and converted the proconsul Sergius Paulus.',
      ro: 'Pafos era capitala romană a Ciprului și sediul proconsulului. Aici Pavel l-a întâlnit pe vrăjitorul Bar-Isus și l-a convertit pe proconsulul Sergiu Paul.'
    },
    journeyOrder: 2,
    scriptureReferences: ['Acts 13:6-12'],
    significance: {
      en: 'First recorded conversion of a high Roman official and Paul\'s first miracle of judgment',
      ro: 'Prima convertire înregistrată a unui înalt oficial roman și prima minune de judecată a lui Pavel'
    },
    backgroundImage: '/backgrounds/paphos-ruins.jpg',
    iconType: 'roman-columns',
    nameVariants: {
      en: 'Paphos',
      ro: 'Pafos',
      historical: 'Πάφος'
    },
    journeyPhase: 'ministry',
    connections: ['salamina', 'perga'],
    events: {
      en: ['Confrontation with Bar-Jesus', 'Conversion of Proconsul Sergius Paulus', 'Paul\'s first miracle of blindness'],
      ro: ['Confruntarea cu Bar-Isus', 'Convertirea proconsulului Sergiu Paul', 'Prima minune a orbiei lui Pavel']
    },
    visualTheme: {
      primaryColor: 'hsl(15, 25%, 45%)',
      accentColor: 'hsl(280, 65%, 45%)',
      gradientDirection: '120deg',
      textColor: 'hsl(35, 25%, 96%)'
    },
    shortDescription: {
      en: 'Capital where power met Gospel',
      ro: 'Capitala unde puterea a întâlnit Evanghelia'
    },
    extendedDescription: {
      en: 'In Paphos, Paul demonstrated the power of the Gospel over pagan sorcery and won his first high-ranking Roman convert. This marked a turning point in his ministry approach.',
      ro: 'În Pafos, Pavel a demonstrat puterea Evangheliei asupra vrăjitoriei păgâne și a câștigat primul său convertit roman de rang înalt. Aceasta a marcat un punct de cotitură în abordarea sa ministerială.'
    },
    interestingFacts: {
      en: ['Capital of Roman Cyprus', 'Center of Aphrodite worship', 'Had beautiful harbor and palace'],
      ro: ['Capitala Ciprului roman', 'Centrul adorației Afroditei', 'Avea un port și un palat frumos']
    }
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
    color: '#6B4A4F', // Brown
    
    // Enhanced metadata
    historicalContext: {
      en: 'Paphos was the Roman capital of Cyprus and seat of the proconsul. Here Paul encountered the sorcerer Bar-Jesus and converted the proconsul Sergius Paulus.',
      ro: 'Pafos era capitala romană a Ciprului și sediul proconsulului. Aici Pavel l-a întâlnit pe vrăjitorul Bar-Isus și l-a convertit pe proconsulul Sergiu Paul.'
    },
    journeyOrder: 2,
    scriptureReferences: ['Acts 13:6-12'],
    significance: {
      en: 'First recorded conversion of a high Roman official and Paul\'s first miracle of judgment',
      ro: 'Prima convertire înregistrată a unui înalt oficial roman și primera minune de judecată a lui Pavel'
    },
    backgroundImage: '/backgrounds/paphos-ruins.jpg',
    iconType: 'roman-columns',
    nameVariants: {
      en: 'Paphos',
      ro: 'Pafos',
      historical: 'Πάφος'
    },
    journeyPhase: 'ministry',
    connections: ['salamina', 'perga'],
    events: {
      en: ['Confrontation with Bar-Jesus', 'Conversion of Proconsul Sergius Paulus', 'Paul\'s first miracle of blindness'],
      ro: ['Confruntarea cu Bar-Isus', 'Convertirea proconsulului Sergiu Paul', 'Prima minune a orbiei lui Pavel']
    },
    visualTheme: {
      primaryColor: 'hsl(15, 25%, 45%)',
      accentColor: 'hsl(280, 65%, 45%)',
      gradientDirection: '120deg',
      textColor: 'hsl(35, 25%, 96%)'
    },
    shortDescription: {
      en: 'Capital where power met Gospel',
      ro: 'Capitala unde puterea a întâlnit Evanghelia'
    },
    extendedDescription: {
      en: 'In Paphos, Paul demonstrated the power of the Gospel over pagan sorcery and won his first high-ranking Roman convert. This marked a turning point in his ministry approach.',
      ro: 'În Pafos, Pavel a demonstrat puterea Evangheliei asupra vrăjitoriei păgâne și a câștigat primul său convertit roman de rang înalt. Aceasta a marcat un punct de cotitură în abordarea sa ministerială.'
    },
    interestingFacts: {
      en: ['Capital of Roman Cyprus', 'Center of Aphrodite worship', 'Had beautiful harbor and palace'],
      ro: ['Capitala Ciprului roman', 'Centrul adorației Afroditei', 'Avea un port și un palat frumos']
    }
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
    color: '#6B4A4F	'// Brown
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
    color: '#4B3F35' //Warm Charcoal
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
    color: '#385562' // Dark blue
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
    color: '#385562' // Dark blue
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
    color: '#385562' // Dark blue
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
    color: '#E3D9B3' //aged ivory
  },
    
  // LEFT COLUMN: positions 11-19 (moving up from PRISON)
  
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
    color: '#A4746B' // dusty rose
  },
  
  {
    id: 'cort',
    name: 'CORT',
    type: 'special',
    journey: 4,
    price: 0,
    rent: 0,
    churchCost: 0,
    synagogueCost: 0,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Immunity tent - Gain temporary immunity',
    color: '#FF0000' // Red
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
    color: '#A4746B' // dusty rose
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
    color: '#A4746B' // dusty rose
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
    color: '#4B3F35' //Warm Charcoal
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
    color: '#C7A14A' // Golden Ochre
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
    color: '#C7A14A' // Golden Ochre
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
    color: '#C7A14A' // Golden Ochre
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
    color: '#E3D9B3' //aged ivory
  },
  
  // TOP ROW: positions 21-29 (moving right from SABAT)
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
    color: '#5E6B3D' //Olive Moss
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
    color: '#5E6B3D' //Olive Moss
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
    color: '#5E6B3D' //Olive Moss
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
    color: '#4B3F35' //Warm Charcoal
  },
    {
    id: 'amfipolis',
    name: 'AMFIPOLIS',
    type: 'city',
    journey: 3,
    price: 260,
    rent: 22,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Paul passed through it',
    color: '#7B8B61' //sage green
  },
    {
    id: 'apolonia',
    name: 'APOLONIA',
    type: 'city',
    journey: 3,
    price: 260,
    rent: 22,
    churchCost: 50,
    synagogueCost: 50,
    buildings: { churches: 0, synagogues: 0 },
    description: 'Paul passed through it',
    color: '#7B8B61' //sage green
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
    color: '#7B8B61' //sage green
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
    color: '#E3D9B3' //aged ivory
  },
  
  // RIGHT COLUMN: positions 31-39 (moving down from GO TO PRISON)
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
    color: '#5F7F82	' // Faded Teal
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
    color: '#5F7F82	' // Faded Teal
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
    color: '#5F7F82	' // Faded Teal
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
    color: '#4B3F35' //Warm Charcoal
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
    color: '#2E4057' // Deep Indigo
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
    color: '#2E4057' // Deep Indigo
  }
];