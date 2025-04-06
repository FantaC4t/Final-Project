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
    specs: ['12GB GDDR6X', '7680 CUDA Cores', '2.6 GHz'],
    avgRating: 4.7,
    numReviews: 324,
    prices: [
      { retailer: 'Amazon', price: 799.99, inStock: true },
      { retailer: 'Newegg', price: 789.99, inStock: true },
      { retailer: 'Best Buy', price: 819.99, inStock: false },
      { retailer: 'Micro Center', price: 779.99, inStock: true },
    ],
    lowestPrice: 779.99,
    priceHistory: [800, 820, 810, 790, 780]
  },
  {
    name: 'AMD Radeon RX 7900 XTX',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['24GB GDDR6', '12288 Stream Processors', '2.5 GHz'],
    avgRating: 4.5,
    numReviews: 256,
    prices: [
      { retailer: 'Amazon', price: 929.99, inStock: true },
      { retailer: 'Newegg', price: 949.99, inStock: true },
      { retailer: 'Best Buy', price: 969.99, inStock: true },
      { retailer: 'B&H Photo', price: 939.99, inStock: false },
    ],
    lowestPrice: 929.99,
    priceHistory: [1000, 980, 950, 940, 930]
  },
  {
    name: 'NVIDIA RTX 4080',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['16GB GDDR6X', '9728 CUDA Cores', '2.5 GHz'],
    avgRating: 4.8,
    numReviews: 312,
    prices: [
      { retailer: 'Amazon', price: 1199.99, inStock: true },
      { retailer: 'Newegg', price: 1189.99, inStock: true },
      { retailer: 'Best Buy', price: 1249.99, inStock: true },
      { retailer: 'Micro Center', price: 1179.99, inStock: false },
    ],
    lowestPrice: 1179.99,
    priceHistory: [1300, 1250, 1230, 1200, 1180]
  },
  {
    name: 'AMD Radeon RX 6700 XT',
    image: '/assets/hardware/gpu.png',
    category: 'Graphics Cards',
    specs: ['12GB GDDR6', '2560 Stream Processors', '2.4 GHz'],
    avgRating: 4.4,
    numReviews: 198,
    prices: [
      { retailer: 'Amazon', price: 369.99, inStock: true },
      { retailer: 'Newegg', price: 379.99, inStock: true },
      { retailer: 'Best Buy', price: 389.99, inStock: true },
      { retailer: 'Micro Center', price: 359.99, inStock: true },
    ],
    lowestPrice: 359.99,
    priceHistory: [400, 390, 380, 370, 360]
  },

  // Processors
  {
    name: 'Intel Core i9-14900K',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['24 Cores (8P+16E)', '5.8 GHz Max Turbo', 'DDR5-5600'],
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
    popularity: 0.90
  },
  {
    name: 'AMD Ryzen 9 7950X',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['16 Cores / 32 Threads', '5.7 GHz Max Boost', '80MB Cache'],
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
    popularity: 0.87
  },
  {
    name: 'Intel Core i5-13600K',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['14 Cores (6P+8E)', '5.1 GHz Max Turbo', 'DDR5-5600'],
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
    popularity: 0.85
  },
  {
    name: 'AMD Ryzen 5 7600X',
    image: '/assets/hardware/cpu.png',
    category: 'Processors',
    specs: ['6 Cores / 12 Threads', '5.3 GHz Max Boost', '38MB Cache'],
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
    popularity: 0.83
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
    popularity: 0.82
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
    popularity: 0.84
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
    popularity: 0.81
  },

  // Storage
  {
    name: 'Samsung 990 PRO NVMe SSD',
    image: '/assets/hardware/ssd.png',
    category: 'Storage',
    specs: ['2TB', 'PCIe 4.0', '7,450 MB/s Read'],
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
    popularity: 0.89
  },
  {
    name: 'WD Black SN850X NVMe SSD',
    image: '/assets/hardware/ssd.png',
    category: 'Storage',
    specs: ['1TB', 'PCIe 4.0', '7,300 MB/s Read'],
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
    popularity: 0.88
  },
  {
    name: 'Crucial P5 Plus NVMe SSD',
    image: '/assets/hardware/ssd.png',
    category: 'Storage',
    specs: ['2TB', 'PCIe 4.0', '6,600 MB/s Read'],
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
    popularity: 0.86
  },
  {
    name: 'Samsung 870 EVO SATA SSD',
    image: '/assets/hardware/ssd.png',
    category: 'Storage',
    specs: ['4TB', 'SATA 6Gb/s', '560 MB/s Read'],
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
    popularity: 0.91
  },

  // Motherboards
  {
    name: 'ASUS ROG Maximus Z790 Hero',
    image: '/assets/hardware/motherboard.png',
    category: 'Motherboards',
    specs: ['Intel Z790', 'DDR5', 'ATX'],
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
    popularity: 0.87
  },
  {
    name: 'MSI MPG Z790 Carbon WiFi',
    image: '/assets/hardware/motherboard.png',
    category: 'Motherboards',
    specs: ['Intel Z790', 'DDR5', 'ATX'],
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
    popularity: 0.85
  },
  {
    name: 'ASUS ROG X670E Crosshair',
    image: '/assets/hardware/motherboard.png',
    category: 'Motherboards',
    specs: ['AMD X670E', 'DDR5', 'E-ATX'],
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
    popularity: 0.88
  },

  // Power Supplies
  {
    name: 'Corsair RM1000x',
    image: '/assets/hardware/psu.png',
    category: 'Power Supplies',
    specs: ['1000W', '80+ Gold', 'Fully Modular'],
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
    popularity: 0.89
  },
  {
    name: 'EVGA SuperNOVA 850 G6',
    image: '/assets/hardware/psu.png',
    category: 'Power Supplies',
    specs: ['850W', '80+ Gold', 'Fully Modular'],
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
    popularity: 0.87
  },

  // Cases
  {
    name: 'Lian Li O11 Dynamic EVO',
    image: '/assets/hardware/case.png',
    category: 'Cases',
    specs: ['Mid-Tower', 'Tempered Glass', 'E-ATX Support'],
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
    popularity: 0.88
  },
  {
    name: 'Corsair 5000D Airflow',
    image: '/assets/hardware/case.png',
    category: 'Cases',
    specs: ['Mid-Tower', 'High Airflow', 'ATX Support'],
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
    popularity: 0.86
  },

  // Cooling
  {
    name: 'NZXT Kraken X73 RGB',
    image: '/assets/hardware/cooler.png',
    category: 'Cooling',
    specs: ['360mm Radiator', 'RGB Fans', 'Liquid Cooling'],
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
    popularity: 0.87
  },
  {
    name: 'Noctua NH-D15',
    image: '/assets/hardware/cooler.png',
    category: 'Cooling',
    specs: ['Dual Tower', 'Dual 140mm Fans', 'Air Cooling'],
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
    popularity: 0.89
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