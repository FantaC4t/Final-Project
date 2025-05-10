const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Mock data
const mockProducts = [
// Graphics Cards
{
    name: 'NVIDIA RTX 4070 Ti',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['12GB GDDR6X', '7680 CUDA Cores', '2.6 GHz', '285mm Length', 'PCIe 4.0 x16'],
    avgRating: 4.7,
    numReviews: 324,
    prices: [
      { retailer: 'Amazon', price: 799.99, inStock: true },
      { retailer: 'Newegg', price: 789.99, inStock: true },
      { retailer: 'Best Buy', price: 819.99, inStock: false },
      { retailer: 'Micro Center', price: 779.99, inStock: true },
    ],
    lowestPrice: 779.99,
    priceHistory: [800, 820, 810, 790, 780],
    compatibility: {
      powerRequirement: 750, // Watts
      length: 285, // mm
      height: 120, // mm
      pciSlots: 2.5, // How many slots it takes up
      interfaceType: 'PCIe 4.0 x16',
      recommendedPSU: 750 // Watts
    },
    // Added recommendation fields
    brand: 'NVIDIA',
    popularity: 92,
    performanceTier: 'highend',
    useCases: ['gaming', '4k gaming', 'content creation']
  },
  {
    name: 'AMD Radeon RX 7900 XTX',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['24GB GDDR6', '12288 Stream Processors', '2.5 GHz', '287mm Length', 'PCIe 4.0 x16'],
    avgRating: 4.7,
    numReviews: 156,
    prices: [
      { retailer: 'Amazon', price: 949.99, inStock: true },
      { retailer: 'Newegg', price: 969.99, inStock: true },
      { retailer: 'Best Buy', price: 979.99, inStock: true },
      { retailer: 'Micro Center', price: 949.99, inStock: true },
    ],
    lowestPrice: 949.99,
    priceHistory: [1000, 990, 980, 960, 950],
    compatibility: {
      powerRequirement: 800,
      length: 287,
      height: 130,
      pciSlots: 2.5,
      interfaceType: 'PCIe 4.0 x16',
      recommendedPSU: 800
    },
    // Added recommendation fields
    brand: 'AMD',
    popularity: 90,
    performanceTier: 'highend',
    useCases: ['gaming', '4k gaming', 'content creation']
  },
  {
    name: 'NVIDIA GeForce RTX 4060 Ti',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['8GB GDDR6', '4352 CUDA Cores', '2.5 GHz', '238mm Length', 'PCIe 4.0 x16'],
    avgRating: 4.5,
    numReviews: 203,
    prices: [
      { retailer: 'Amazon', price: 399.99, inStock: true },
      { retailer: 'Newegg', price: 409.99, inStock: true },
      { retailer: 'Best Buy', price: 419.99, inStock: true },
      { retailer: 'Micro Center', price: 389.99, inStock: true },
    ],
    lowestPrice: 389.99,
    priceHistory: [420, 410, 400, 390],
    compatibility: {
      powerRequirement: 500,
      length: 238,
      height: 100,
      pciSlots: 2,
      interfaceType: 'PCIe 4.0 x16',
      recommendedPSU: 550
    },
    // Added recommendation fields
    brand: 'NVIDIA',
    popularity: 94,
    performanceTier: 'midrange',
    useCases: ['gaming', '1440p gaming', 'content creation']
  },
  {
    name: 'AMD Radeon RX 6700 XT',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['12GB GDDR6', '2560 Stream Processors', '2.4 GHz', '267mm Length', 'PCIe 4.0 x16'],
    avgRating: 4.4,
    numReviews: 198,
    prices: [
      { retailer: 'Amazon', price: 369.99, inStock: true },
      { retailer: 'Newegg', price: 379.99, inStock: true },
      { retailer: 'Best Buy', price: 389.99, inStock: true },
      { retailer: 'Micro Center', price: 359.99, inStock: true },
    ],
    lowestPrice: 359.99,
    priceHistory: [400, 390, 380, 370, 360],
    compatibility: {
      powerRequirement: 650,
      length: 267,
      height: 110,
      pciSlots: 2,
      interfaceType: 'PCIe 4.0 x16',
      recommendedPSU: 650
    },
    // Added recommendation fields
    brand: 'AMD',
    popularity: 88,
    performanceTier: 'midrange',
    useCases: ['gaming', '1440p gaming', 'content creation']
  },
  {
    name: 'NVIDIA GeForce RTX 4050 Mobile',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['6GB GDDR6', '2560 CUDA Cores', '1.6 GHz', 'Laptop GPU', 'PCIe 4.0 x8'],
    avgRating: 4.2,
    numReviews: 134,
    prices: [
      { retailer: 'Amazon', price: 1099.99, inStock: true, note: 'Part of laptop' },
      { retailer: 'Best Buy', price: 1199.99, inStock: true, note: 'Part of laptop' },
      { retailer: 'Newegg', price: 1149.99, inStock: false, note: 'Part of laptop' },
    ],
    lowestPrice: 1099.99,
    priceHistory: [1200, 1150, 1100],
    compatibility: {
      powerRequirement: 75,
      length: 'N/A (Mobile)',
      height: 'N/A (Mobile)',
      pciSlots: 'N/A (Mobile)',
      interfaceType: 'PCIe 4.0 x8',
      recommendedPSU: 'N/A (Mobile)'
    },
    // Added recommendation fields
    brand: 'NVIDIA',
    popularity: 82,
    performanceTier: 'budget',
    useCases: ['mobile gaming', 'student use', 'productivity']
  },
  
  // CPUs
  {
    name: 'Intel Core i9-14900K',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['24 Cores (8P+16E)', '32 Threads', '3.2 GHz Base', '6.0 GHz Boost', 'LGA 1700 Socket'],
    avgRating: 4.8,
    numReviews: 178,
    prices: [
      { retailer: 'Amazon', price: 589.99, inStock: true },
      { retailer: 'Newegg', price: 579.99, inStock: true },
      { retailer: 'Best Buy', price: 599.99, inStock: true },
      { retailer: 'Micro Center', price: 569.99, inStock: true },
    ],
    lowestPrice: 569.99,
    priceHistory: [599, 589, 579, 569],
    compatibility: {
      socket: 'LGA 1700',
      tdp: 125,
      compatibleChipsets: ['Z790', 'Z690', 'B760', 'B660', 'H770', 'H670']
    },
    // Added recommendation fields
    brand: 'Intel',
    popularity: 93,
    performanceTier: 'highend',
    useCases: ['gaming', 'content creation', 'workstation', 'overclocking']
  },
  {
    name: 'AMD Ryzen 9 7950X',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['16 Cores', '32 Threads', '4.5 GHz Base', '5.7 GHz Boost', 'AM5 Socket'],
    avgRating: 4.9,
    numReviews: 209,
    prices: [
      { retailer: 'Amazon', price: 579.99, inStock: true },
      { retailer: 'Newegg', price: 569.99, inStock: true },
      { retailer: 'Best Buy', price: 589.99, inStock: true },
      { retailer: 'Micro Center', price: 549.99, inStock: true },
    ],
    lowestPrice: 549.99,
    priceHistory: [599, 589, 579, 569, 549],
    compatibility: {
      socket: 'AM5',
      tdp: 170,
      compatibleChipsets: ['X670E', 'X670', 'B650E', 'B650']
    },
    // Added recommendation fields
    brand: 'AMD',
    popularity: 94,
    performanceTier: 'highend',
    useCases: ['gaming', 'content creation', 'workstation', 'multiprocessing']
  },
  {
    name: 'Intel Core i5-14600K',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['14 Cores (6P+8E)', '20 Threads', '3.5 GHz Base', '5.3 GHz Boost', 'LGA 1700 Socket'],
    avgRating: 4.7,
    numReviews: 245,
    prices: [
      { retailer: 'Amazon', price: 329.99, inStock: true },
      { retailer: 'Newegg', price: 319.99, inStock: true },
      { retailer: 'Best Buy', price: 339.99, inStock: true },
      { retailer: 'Micro Center', price: 309.99, inStock: true },
    ],
    lowestPrice: 309.99,
    priceHistory: [349, 339, 329, 319, 309],
    compatibility: {
      socket: 'LGA 1700',
      tdp: 125,
      compatibleChipsets: ['Z790', 'Z690', 'B760', 'B660', 'H770', 'H670']
    },
    // Added recommendation fields
    brand: 'Intel',
    popularity: 96,
    performanceTier: 'midrange',
    useCases: ['gaming', 'productivity', 'streaming', 'everyday use']
  },
  {
    name: 'AMD Ryzen 5 7600X',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['6 Cores', '12 Threads', '4.7 GHz Base', '5.3 GHz Boost', 'AM5 Socket'],
    avgRating: 4.6,
    numReviews: 289,
    prices: [
      { retailer: 'Amazon', price: 249.99, inStock: true },
      { retailer: 'Newegg', price: 239.99, inStock: true },
      { retailer: 'Best Buy', price: 259.99, inStock: true },
      { retailer: 'Micro Center', price: 229.99, inStock: true },
    ],
    lowestPrice: 229.99,
    priceHistory: [279, 269, 259, 249, 239, 229],
    compatibility: {
      socket: 'AM5',
      tdp: 105,
      compatibleChipsets: ['X670E', 'X670', 'B650E', 'B650']
    },
    // Added recommendation fields
    brand: 'AMD',
    popularity: 95,
    performanceTier: 'midrange',
    useCases: ['gaming', 'productivity', 'streaming', 'everyday use']
  },
  
  // Memory/RAM
  {
    name: 'Corsair Vengeance RGB Pro 32GB',
    image: '/assets/hardware/ram.png',
    category: 'Memory',
    specs: ['32GB (2x16GB)', 'DDR4-3600', 'CL18', 'RGB'],
    avgRating: 4.8,
    numReviews: 342,
    prices: [
      { retailer: 'Amazon', price: 109.99, inStock: true },
      { retailer: 'Newegg', price: 114.99, inStock: true },
      { retailer: 'Best Buy', price: 119.99, inStock: true },
      { retailer: 'Micro Center', price: 104.99, inStock: true },
    ],
    lowestPrice: 104.99,
    priceHistory: [129, 119, 114, 109, 104],
    compatibility: {
      memoryType: 'DDR4',
      capacity: 32, // GB
      speed: 3600, // MHz
      latency: 'CL18',
      voltage: 1.35 // V
    },
    // Added recommendation fields
    brand: 'Corsair',
    popularity: 93,
    performanceTier: 'midrange',
    useCases: ['gaming', 'multitasking', 'rgb builds', 'content creation']
  },
  {
    name: 'G.Skill Trident Z5 RGB 32GB',
    image: '/assets/hardware/ram.png',
    category: 'Memory',
    specs: ['32GB (2x16GB)', 'DDR5-6000', 'CL36', 'RGB'],
    avgRating: 4.7,
    numReviews: 167,
    prices: [
      { retailer: 'Amazon', price: 159.99, inStock: true },
      { retailer: 'Newegg', price: 154.99, inStock: true },
      { retailer: 'Best Buy', price: 169.99, inStock: false },
      { retailer: 'Micro Center', price: 149.99, inStock: true },
    ],
    lowestPrice: 149.99,
    priceHistory: [179, 169, 159, 149],
    compatibility: {
      memoryType: 'DDR5',
      capacity: 32, // GB
      speed: 6000, // MHz
      latency: 'CL36',
      voltage: 1.35 // V
    },
    // Added recommendation fields
    brand: 'G.Skill',
    popularity: 90,
    performanceTier: 'highend',
    useCases: ['gaming', 'overclocking', 'content creation', 'enthusiast builds']
  },
  {
    name: 'NVIDIA RTX 4080',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['16GB GDDR6X', '9728 CUDA Cores', '2.5 GHz', '304mm Length', 'PCIe 4.0 x16'],
    avgRating: 4.8,
    numReviews: 312,
    prices: [
      { retailer: 'Amazon', price: 1199.99, inStock: true },
      { retailer: 'Newegg', price: 1189.99, inStock: true },
      { retailer: 'Best Buy', price: 1249.99, inStock: true },
      { retailer: 'Micro Center', price: 1179.99, inStock: false },
    ],
    lowestPrice: 1179.99,
    priceHistory: [1300, 1250, 1230, 1200, 1180],
    compatibility: {
      powerRequirement: 850, // Watts
      length: 304, // mm
      height: 137, // mm
      pciSlots: 3, // How many slots it takes up
      interfaceType: 'PCIe 4.0 x16',
      recommendedPSU: 850 // Watts
    }
  },
  {
    name: 'AMD Radeon RX 6700 XT',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['12GB GDDR6', '2560 Stream Processors', '2.4 GHz', '267mm Length', 'PCIe 4.0 x16'],
    avgRating: 4.4,
    numReviews: 198,
    prices: [
      { retailer: 'Amazon', price: 369.99, inStock: true },
      { retailer: 'Newegg', price: 379.99, inStock: true },
      { retailer: 'Best Buy', price: 389.99, inStock: true },
      { retailer: 'Micro Center', price: 359.99, inStock: true },
    ],
    lowestPrice: 359.99,
    priceHistory: [400, 390, 380, 370, 360],
    compatibility: {
      powerRequirement: 650, // Watts
      length: 267, // mm
      height: 110, // mm
      pciSlots: 2, // How many slots it takes up
      interfaceType: 'PCIe 4.0 x16',
      recommendedPSU: 650 // Watts
    }
  },

  // Processors
  {
    name: 'Intel Core i9-14900K',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['24 Cores (8P+16E)', '5.8 GHz Max Turbo', 'DDR5-5600', '125W TDP', 'LGA1700 Socket'],
    avgRating: 4.8,
    numReviews: 189,
    prices: [
      { retailer: 'Amazon', price: 569.99, inStock: true },
      { retailer: 'Newegg', price: 549.99, inStock: true },
      { retailer: 'Best Buy', price: 589.99, inStock: true },
      { retailer: 'Micro Center', price: 529.99, inStock: true },
    ],
    lowestPrice: 529.99,
    priceHistory: [600, 590, 575, 560, 530],
    releaseDate: new Date('2023-10-17'),
    popularity: 0.90,
    compatibility: {
      socket: 'LGA1700',
      tdp: 125, // Watts
      memorySupport: ['DDR5', 'DDR4'],
      memoryChannels: 2,
      maxMemorySpeed: 5600, // MHz
      pcieLanes: 20,
      compatibleChipsets: ['Z790', 'Z690', 'H770', 'H670', 'B760', 'B660']
    }
  },
  {
    name: 'AMD Ryzen 9 7950X',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['16 Cores / 32 Threads', '5.7 GHz Max Boost', '80MB Cache', '170W TDP', 'AM5 Socket'],
    avgRating: 4.9,
    numReviews: 245,
    prices: [
      { retailer: 'Amazon', price: 549.99, inStock: true },
      { retailer: 'Newegg', price: 559.99, inStock: true },
      { retailer: 'Best Buy', price: 579.99, inStock: false },
      { retailer: 'Micro Center', price: 539.99, inStock: true },
    ],
    lowestPrice: 539.99,
    priceHistory: [700, 650, 600, 570, 540],
    releaseDate: new Date('2022-09-27'),
    popularity: 0.87,
    compatibility: {
      socket: 'AM5',
      tdp: 170, // Watts
      memorySupport: ['DDR5'],
      memoryChannels: 2,
      maxMemorySpeed: 6000, // MHz
      pcieLanes: 28,
      compatibleChipsets: ['X670E', 'X670', 'B650E', 'B650']
    }
  },
  {
    name: 'Intel Core i5-13600K',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['14 Cores (6P+8E)', '5.1 GHz Max Turbo', 'DDR5-5600', '125W TDP', 'LGA1700 Socket'],
    avgRating: 4.7,
    numReviews: 312,
    prices: [
      { retailer: 'Amazon', price: 319.99, inStock: true },
      { retailer: 'Newegg', price: 309.99, inStock: true },
      { retailer: 'Best Buy', price: 329.99, inStock: true },
      { retailer: 'Micro Center', price: 299.99, inStock: true },
    ],
    lowestPrice: 299.99,
    priceHistory: [350, 340, 330, 310, 300],
    releaseDate: new Date('2022-10-20'),
    popularity: 0.85,
    compatibility: {
      socket: 'LGA1700',
      tdp: 125, // Watts
      memorySupport: ['DDR5', 'DDR4'],
      memoryChannels: 2,
      maxMemorySpeed: 5600, // MHz
      pcieLanes: 16,
      compatibleChipsets: ['Z790', 'Z690', 'H770', 'H670', 'B760', 'B660']
    }
  },
  {
    name: 'AMD Ryzen 5 7600X',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['6 Cores / 12 Threads', '5.3 GHz Max Boost', '38MB Cache', '105W TDP', 'AM5 Socket'],
    avgRating: 4.6,
    numReviews: 278,
    prices: [
      { retailer: 'Amazon', price: 249.99, inStock: true },
      { retailer: 'Newegg', price: 239.99, inStock: true },
      { retailer: 'Best Buy', price: 259.99, inStock: true },
      { retailer: 'Micro Center', price: 229.99, inStock: true },
    ],
    lowestPrice: 229.99,
    priceHistory: [300, 280, 270, 250, 230],
    releaseDate: new Date('2022-09-27'),
    popularity: 0.83,
    compatibility: {
      socket: 'AM5',
      tdp: 105, // Watts
      memorySupport: ['DDR5'],
      memoryChannels: 2,
      maxMemorySpeed: 5600, // MHz
      pcieLanes: 24,
      compatibleChipsets: ['X670E', 'X670', 'B650E', 'B650']
    }
  },

  // Memory
  {
    name: 'Corsair Vengeance RGB DDR5',
    image: '/assets/hardware/ram.png',
    category: 'Memory',
    specs: ['32GB (2x16GB)', 'DDR5-6000', 'CL36'],
    avgRating: 4.8,
    numReviews: 156,
    prices: [
      { retailer: 'Amazon', price: 139.99, inStock: true },
      { retailer: 'Newegg', price: 134.99, inStock: true },
      { retailer: 'Best Buy', price: 144.99, inStock: true },
      { retailer: 'Micro Center', price: 129.99, inStock: true },
    ],
    lowestPrice: 129.99,
    priceHistory: [180, 160, 150, 140, 130],
    releaseDate: new Date('2022-03-15'),
    popularity: 0.82,
    compatibility: {
      type: 'DDR5',
      formFactor: 'DIMM',
      capacity: 32, // GB
      modules: 2,
      speed: 6000, // MHz
      voltage: 1.35, // V
      height: 35, // mm - important for large air coolers
      xmp: true,
      requiredSlots: 2
    }
  },
  {
    name: 'G.Skill Trident Z5 RGB',
    image: '/assets/hardware/ram.png',
    category: 'Memory',
    specs: ['32GB (2x16GB)', 'DDR5-6400', 'CL32'],
    avgRating: 4.9,
    numReviews: 132,
    prices: [
      { retailer: 'Amazon', price: 159.99, inStock: true },
      { retailer: 'Newegg', price: 149.99, inStock: true },
      { retailer: 'Best Buy', price: 169.99, inStock: false },
      { retailer: 'B&H Photo', price: 154.99, inStock: true },
    ],
    lowestPrice: 149.99,
    priceHistory: [200, 180, 170, 160, 150],
    releaseDate: new Date('2022-05-10'),
    popularity: 0.84,
    compatibility: {
      type: 'DDR5',
      formFactor: 'DIMM',
      capacity: 32, // GB
      modules: 2,
      speed: 6400, // MHz
      voltage: 1.4, // V
      height: 44, // mm - important for large air coolers
      xmp: true,
      requiredSlots: 2
    }
  },
  {
    name: 'Kingston Fury Beast DDR5',
    image: '/assets/hardware/ram.png',
    category: 'Memory',
    specs: ['64GB (2x32GB)', 'DDR5-5600', 'CL40'],
    avgRating: 4.7,
    numReviews: 89,
    prices: [
      { retailer: 'Amazon', price: 219.99, inStock: true },
      { retailer: 'Newegg', price: 209.99, inStock: true },
      { retailer: 'Best Buy', price: 229.99, inStock: true },
      { retailer: 'B&H Photo', price: 199.99, inStock: false },
    ],
    lowestPrice: 199.99,
    priceHistory: [250, 240, 230, 220, 200],
    releaseDate: new Date('2022-07-15'),
    popularity: 0.81,
    compatibility: {
      type: 'DDR5',
      formFactor: 'DIMM',
      capacity: 64, // GB
      modules: 2,
      speed: 5600, // MHz
      voltage: 1.25, // V
      height: 34.9, // mm - important for large air coolers
      xmp: true,
      requiredSlots: 2
    }
  },

  // Storage
  {
    name: 'Samsung 990 PRO NVMe SSD',
    image: '/assets/hardware/ssd.png',
    category: 'Storage',
    specs: ['2TB', 'PCIe 4.0', '7,450 MB/s Read', 'M.2 2280'],
    avgRating: 4.9,
    numReviews: 312,
    prices: [
      { retailer: 'Amazon', price: 189.99, inStock: true },
      { retailer: 'Newegg', price: 179.99, inStock: true },
      { retailer: 'Best Buy', price: 199.99, inStock: true },
      { retailer: 'B&H Photo', price: 184.99, inStock: true },
    ],
    lowestPrice: 179.99,
    priceHistory: [220, 210, 200, 190, 180],
    releaseDate: new Date('2022-10-18'),
    popularity: 0.89,
    compatibility: {
      interface: 'PCIe 4.0 x4',
      formFactor: 'M.2 2280',
      capacity: 2000, // GB
      readSpeed: 7450, // MB/s
      writeSpeed: 6900, // MB/s
      nvme: true,
      requiresHeatsink: false
    }
  },
  {
    name: 'WD Black SN850X NVMe SSD',
    image: '/assets/hardware/ssd.png',
    category: 'Storage',
    specs: ['1TB', 'PCIe 4.0', '7,300 MB/s Read', 'M.2 2280'],
    avgRating: 4.8,
    numReviews: 245,
    prices: [
      { retailer: 'Amazon', price: 109.99, inStock: true },
      { retailer: 'Newegg', price: 99.99, inStock: true },
      { retailer: 'Best Buy', price: 119.99, inStock: true },
      { retailer: 'Micro Center', price: 94.99, inStock: true },
    ],
    lowestPrice: 94.99,
    priceHistory: [130, 120, 110, 100, 95],
    releaseDate: new Date('2021-11-15'),
    popularity: 0.88,
    compatibility: {
      interface: 'PCIe 4.0 x4',
      formFactor: 'M.2 2280',
      capacity: 1000, // GB
      readSpeed: 7300, // MB/s
      writeSpeed: 6300, // MB/s
      nvme: true,
      requiresHeatsink: false
    }
  },
  {
    name: 'Crucial P5 Plus NVMe SSD',
    image: '/assets/hardware/ssd.png',
    category: 'Storage',
    specs: ['2TB', 'PCIe 4.0', '6,600 MB/s Read', 'M.2 2280'],
    avgRating: 4.7,
    numReviews: 178,
    prices: [
      { retailer: 'Amazon', price: 149.99, inStock: true },
      { retailer: 'Newegg', price: 139.99, inStock: true },
      { retailer: 'Best Buy', price: 159.99, inStock: false },
      { retailer: 'B&H Photo', price: 144.99, inStock: true },
    ],
    lowestPrice: 139.99,
    priceHistory: [180, 170, 160, 150, 140],
    releaseDate: new Date('2021-08-30'),
    popularity: 0.86,
    compatibility: {
      interface: 'PCIe 4.0 x4',
      formFactor: 'M.2 2280',
      capacity: 2000, // GB
      readSpeed: 6600, // MB/s
      writeSpeed: 5000, // MB/s
      nvme: true,
      requiresHeatsink: false
    }
  },
  {
    name: 'Samsung 870 EVO SATA SSD',
    image: '/assets/hardware/ssd.png',
    category: 'Storage',
    specs: ['4TB', 'SATA 6Gb/s', '560 MB/s Read', '2.5-inch'],
    avgRating: 4.9,
    numReviews: 387,
    prices: [
      { retailer: 'Amazon', price: 299.99, inStock: true },
      { retailer: 'Newegg', price: 289.99, inStock: true },
      { retailer: 'Best Buy', price: 309.99, inStock: true },
      { retailer: 'B&H Photo', price: 294.99, inStock: true },
    ],
    lowestPrice: 289.99,
    priceHistory: [350, 330, 320, 300, 290],
    releaseDate: new Date('2020-07-15'),
    popularity: 0.91,
    compatibility: {
      interface: 'SATA 6Gb/s',
      formFactor: '2.5-inch',
      capacity: 4000, // GB
      readSpeed: 560, // MB/s
      writeSpeed: 530, // MB/s
      nvme: false,
      requiresHeatsink: false
    }
  },

  // Motherboards
  {
    name: 'ASUS ROG Maximus Z790 Hero',
    image: '/assets/hardware/motherboard.png',
    category: 'Motherboards',
    specs: ['Intel Z790', 'DDR5', 'ATX', 'LGA1700', '4 x PCIe 5.0', '5 x M.2 Slots'],
    avgRating: 4.7,
    numReviews: 123,
    prices: [
      { retailer: 'Amazon', price: 629.99, inStock: true },
      { retailer: 'Newegg', price: 619.99, inStock: true },
      { retailer: 'Best Buy', price: 649.99, inStock: false },
      { retailer: 'Micro Center', price: 599.99, inStock: true },
    ],
    lowestPrice: 599.99,
    priceHistory: [650, 640, 630, 620, 600],
    releaseDate: new Date('2022-09-15'),
    popularity: 0.87,
    compatibility: {
      socket: 'LGA1700',
      chipset: 'Z790',
      formFactor: 'ATX',
      memoryType: 'DDR5',
      memorySlots: 4,
      maxMemory: 128, // GB
      maxMemorySpeed: 7800, // MHz
      pciSlots: 4,
      m2Slots: 5,
      sataSlots: 6,
      usbPorts: 12,
      supportedProcessors: ['Intel 12th Gen', 'Intel 13th Gen', 'Intel 14th Gen']
    }
  },
  {
    name: 'MSI MPG Z790 Carbon WiFi',
    image: '/assets/hardware/motherboard.png',
    category: 'Motherboards',
    specs: ['Intel Z790', 'DDR5', 'ATX', 'LGA1700', '3 x PCIe 5.0', '4 x M.2 Slots'],
    avgRating: 4.6,
    numReviews: 98,
    prices: [
      { retailer: 'Amazon', price: 459.99, inStock: true },
      { retailer: 'Newegg', price: 449.99, inStock: true },
      { retailer: 'Best Buy', price: 479.99, inStock: true },
      { retailer: 'Micro Center', price: 439.99, inStock: false },
    ],
    lowestPrice: 439.99,
    priceHistory: [500, 490, 480, 460, 440],
    releaseDate: new Date('2022-08-10'),
    popularity: 0.85,
    compatibility: {
      socket: 'LGA1700',
      chipset: 'Z790',
      formFactor: 'ATX',
      memoryType: 'DDR5',
      memorySlots: 4,
      maxMemory: 128, // GB
      maxMemorySpeed: 7600, // MHz
      pciSlots: 3,
      m2Slots: 4,
      sataSlots: 6,
      usbPorts: 10,
      supportedProcessors: ['Intel 12th Gen', 'Intel 13th Gen', 'Intel 14th Gen']
    }
  },
  {
    name: 'ASUS ROG X670E Crosshair',
    image: '/assets/hardware/motherboard.png',
    category: 'Motherboards',
    specs: ['AMD X670E', 'DDR5', 'E-ATX', 'AM5', '3 x PCIe 5.0', '5 x M.2 Slots'],
    avgRating: 4.8,
    numReviews: 87,
    prices: [
      { retailer: 'Amazon', price: 699.99, inStock: true },
      { retailer: 'Newegg', price: 689.99, inStock: true },
      { retailer: 'Best Buy', price: 719.99, inStock: false },
      { retailer: 'Micro Center', price: 679.99, inStock: true },
    ],
    lowestPrice: 679.99,
    priceHistory: [750, 730, 710, 700, 680],
    releaseDate: new Date('2022-09-20'),
    popularity: 0.88,
    compatibility: {
      socket: 'AM5',
      chipset: 'X670E',
      formFactor: 'E-ATX',
      memoryType: 'DDR5',
      memorySlots: 4,
      maxMemory: 128, // GB
      maxMemorySpeed: 6400, // MHz
      pciSlots: 3,
      m2Slots: 5,
      sataSlots: 8,
      usbPorts: 14,
      supportedProcessors: ['AMD Ryzen 7000 Series', 'AMD Ryzen 8000 Series']
    }
  },

  // Power Supplies
  {
    name: 'Corsair RM1000x',
    image: '/assets/hardware/psu.png',
    category: 'Power Supplies',
    specs: ['1000W', '80+ Gold', 'Fully Modular', 'ATX 3.0', 'PCIe 5.0'],
    avgRating: 4.9,
    numReviews: 432,
    prices: [
      { retailer: 'Amazon', price: 189.99, inStock: true },
      { retailer: 'Newegg', price: 179.99, inStock: true },
      { retailer: 'Best Buy', price: 199.99, inStock: true },
      { retailer: 'Micro Center', price: 169.99, inStock: true },
    ],
    lowestPrice: 169.99,
    priceHistory: [220, 210, 200, 190, 170],
    releaseDate: new Date('2021-05-15'),
    popularity: 0.89,
    compatibility: {
      wattage: 1000,
      efficiency: '80+ Gold',
      formFactor: 'ATX',
      modular: 'Fully',
      length: 160, // mm
      atx3: true,
      pcie5: true,
      fanSize: 135, // mm
      connectors: {
        motherboard24Pin: 1,
        cpu8Pin: 2,
        pcie8Pin: 6,
        sata: 12,
        molex: 4
      }
    }
  },
  {
    name: 'EVGA SuperNOVA 850 G6',
    image: '/assets/hardware/psu.png',
    category: 'Power Supplies',
    specs: ['850W', '80+ Gold', 'Fully Modular', 'ATX 2.0'],
    avgRating: 4.8,
    numReviews: 267,
    prices: [
      { retailer: 'Amazon', price: 149.99, inStock: true },
      { retailer: 'Newegg', price: 139.99, inStock: true },
      { retailer: 'Best Buy', price: 159.99, inStock: false },
      { retailer: 'B&H Photo', price: 144.99, inStock: true },
    ],
    lowestPrice: 139.99,
    priceHistory: [180, 170, 160, 150, 140],
    releaseDate: new Date('2021-06-10'),
    popularity: 0.87,
    compatibility: {
      wattage: 850,
      efficiency: '80+ Gold',
      formFactor: 'ATX',
      modular: 'Fully',
      length: 150, // mm
      atx3: false,
      pcie5: false,
      fanSize: 135, // mm
      connectors: {
        motherboard24Pin: 1,
        cpu8Pin: 2,
        pcie8Pin: 4,
        sata: 9,
        molex: 3
      }
    }
  },

  // Cases
  {
    name: 'Lian Li O11 Dynamic EVO',
    image: '/assets/hardware/case.png',
    category: 'Cases',
    specs: ['Mid-Tower', 'Tempered Glass', 'E-ATX Support', 'Max GPU Length: 422mm', 'Max CPU Cooler: 167mm'],
    avgRating: 4.9,
    numReviews: 356,
    prices: [
      { retailer: 'Amazon', price: 169.99, inStock: true },
      { retailer: 'Newegg', price: 159.99, inStock: true },
      { retailer: 'Best Buy', price: 179.99, inStock: true },
      { retailer: 'Micro Center', price: 149.99, inStock: true },
    ],
    lowestPrice: 149.99,
    priceHistory: [190, 180, 170, 160, 150],
    releaseDate: new Date('2021-03-15'),
    popularity: 0.88,
    compatibility: {
      formFactor: 'Mid-Tower',
      supportedMotherboards: ['E-ATX', 'ATX', 'Micro-ATX', 'Mini-ITX'],
      maxGPULength: 422, // mm
      maxCPUCoolerHeight: 167, // mm
      maxPSULength: 210, // mm
      expansionSlots: 7,
      radiatorSupport: {
        top: '360mm',
        front: '360mm',
        side: '360mm',
        bottom: '360mm'
      },
      fanMounts: 10,
      dimensions: {
        width: 285, // mm
        height: 459, // mm
        depth: 459 // mm
      }
    }
  },
  {
    name: 'Corsair 5000D Airflow',
    image: '/assets/hardware/case.png',
    category: 'Cases',
    specs: ['Mid-Tower', 'High Airflow', 'ATX Support', 'Max GPU Length: 400mm', 'Max CPU Cooler: 170mm'],
    avgRating: 4.8,
    numReviews: 278,
    prices: [
      { retailer: 'Amazon', price: 159.99, inStock: true },
      { retailer: 'Newegg', price: 154.99, inStock: true },
      { retailer: 'Best Buy', price: 169.99, inStock: true },
      { retailer: 'Micro Center', price: 149.99, inStock: false },
    ],
    lowestPrice: 149.99,
    priceHistory: [180, 175, 170, 160, 150],
    releaseDate: new Date('2021-04-10'),
    popularity: 0.86,
    compatibility: {
      formFactor: 'Mid-Tower',
      supportedMotherboards: ['ATX', 'Micro-ATX', 'Mini-ITX'],
      maxGPULength: 400, // mm
      maxCPUCoolerHeight: 170, // mm
      maxPSULength: 225, // mm
      expansionSlots: 7,
      radiatorSupport: {
        top: '360mm',
        front: '360mm',
        side: null,
        bottom: null
      },
      fanMounts: 10,
      dimensions: {
        width: 245, // mm
        height: 520, // mm
        depth: 520 // mm
      }
    }
  },

  // Cooling
  {
    name: 'NZXT Kraken X73 RGB',
    image: '/assets/hardware/cooler.png',
    category: 'Cooling',
    specs: ['360mm Radiator', 'RGB Fans', 'Liquid Cooling', 'Supported Sockets: LGA1700, AM5, AM4'],
    avgRating: 4.7,
    numReviews: 213,
    prices: [
      { retailer: 'Amazon', price: 179.99, inStock: true },
      { retailer: 'Newegg', price: 169.99, inStock: true },
      { retailer: 'Best Buy', price: 189.99, inStock: true },
      { retailer: 'Micro Center', price: 159.99, inStock: true },
    ],
    lowestPrice: 159.99,
    priceHistory: [200, 190, 180, 170, 160],
    releaseDate: new Date('2020-11-15'),
    popularity: 0.87,
    compatibility: {
      type: 'Liquid',
      radiatorSize: 360, // mm
      supportedSockets: ['LGA1700', 'LGA1200', 'LGA115x', 'AM5', 'AM4', 'sTRX4'],
      tdpSupport: 300, // Watts
      height: 30, // mm (block height)
      radiatorThickness: 27, // mm
      fanSize: 120, // mm
      fanCount: 3,
      rgbSupport: true,
      softwareControl: 'NZXT CAM'
    }
  },
  {
    name: 'Noctua NH-D15',
    image: '/assets/hardware/cooler.png',
    category: 'Cooling',
    specs: ['Dual Tower', 'Dual 140mm Fans', 'Air Cooling', 'Supported Sockets: LGA1700, AM5, AM4', 'Height: 165mm'],
    avgRating: 4.9,
    numReviews: 543,
    prices: [
      { retailer: 'Amazon', price: 99.99, inStock: true },
      { retailer: 'Newegg', price: 94.99, inStock: true },
      { retailer: 'Best Buy', price: 109.99, inStock: false },
      { retailer: 'B&H Photo', price: 89.99, inStock: true },
    ],
    lowestPrice: 89.99,
    priceHistory: [110, 105, 100, 95, 90],
    releaseDate: new Date('2020-09-10'),
    popularity: 0.89,
    compatibility: {
      type: 'Air',
      height: 165, // mm - critical for case compatibility
      width: 150, // mm - may interfere with tall RAM
      supportedSockets: ['LGA1700', 'LGA1200', 'LGA115x', 'AM5', 'AM4', 'sTRX4'],
      tdpSupport: 250, // Watts
      fanSize: 140, // mm
      fanCount: 2,
      ramClearance: 32, // mm - with fan installed
      rgbSupport: false,
      weight: 1320 // grams - motherboard stress
    }
  }
];

// Import data to database
const importData = async () => {
  try {
    // Clear existing data
    await Product.deleteMany();
    
    // Insert new data
    await Product.insertMany(mockProducts);
    
    console.log('Data imported successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Run the import
importData();