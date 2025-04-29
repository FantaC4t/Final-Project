const axios = require('axios');
const cheerio = require('cheerio');
const { parsePrice, cleanText } = require('../utils/parseUtils');
const Product = require('../models/Product');
const mongoose = require('mongoose');
// Correct import for NaiveBayes - it's in the classifiers namespace
const natural = require('natural');
const NaiveBayes = natural.BayesClassifier;
// Replace tf import with the pure JavaScript version, matching what pricePredService uses
const tf = require('@tensorflow/tfjs');

class DataCollector {
  constructor() {
    // Initialize the classifier with correct constructor
    this.classifier = new NaiveBayes();
    
    // Updated sources for Israeli hardware retailers
    this.sources = [
      { 
        name: 'ksp', 
        baseUrl: 'https://ksp.co.il', 
        patterns: [
          '/web/cat/31635..35', // GPUs - updated URL
          '/catalog/c/183_185', // CPUs
          '/catalog/c/183_186', // Motherboards
          '/catalog/c/192_193', // RAM
          '/catalog/c/196_197', // Storage
          '/catalog/c/183_187', // Cases
          '/catalog/c/204_205'  // Power Supplies
        ],
        language: 'he'
      },
      { 
        name: 'plonter', 
        baseUrl: 'https://www.plonter.co.il', 
        patterns: [
          '/detail/c99', // CPUs
          '/detail/c137', // GPUs
          '/detail/c100', // Motherboards
          '/detail/c114', // RAM
          '/detail/c133'  // Storage
        ],
        language: 'he'
      },
      { 
        name: 'ivory', 
        baseUrl: 'https://www.ivory.co.il', 
        patterns: [
          '/catalog/cpu_all.php', // CPUs
          '/catalog/vga_nvidia.php', // NVIDIA GPUs
          '/catalog/vga_amd.php', // AMD GPUs
          '/catalog/motherboard_all.php', // Motherboards
          '/catalog/memory_all.php' // RAM
        ],
        language: 'he'
      },
      { 
        name: 'tms', 
        baseUrl: 'https://tms.co.il', 
        patterns: [
          '/cat/131/%D7%9E%D7%A2%D7%91%D7%93%D7%99%D7%9D', // CPUs (Hebrew URL)
          '/cat/139/%D7%9B%D7%A8%D7%98%D7%99%D7%A1%D7%99-%D7%9E%D7%A1%D7%9A', // GPUs (Hebrew URL)
          '/cat/132/%D7%9C%D7%95%D7%97%D7%95%D7%AA-%D7%90%D7%9D' // Motherboards (Hebrew URL)
        ],
        language: 'he'
      },
      { 
        name: 'bug', 
        baseUrl: 'https://www.bug.co.il', 
        patterns: [
          '/c/1/2/1', // CPUs
          '/c/1/3/1', // GPUs
          '/c/1/1/1'  // Motherboards
        ],
        language: 'he'
      },
      { 
        name: 'zap', 
        baseUrl: 'https://www.zap.co.il', 
        patterns: [
          '/computers/hardware/videocards', // GPUs
          '/computers/hardware/processors', // CPUs
          '/computers/hardware/motherboards', // Motherboards
          '/computers/hardware/memory', // RAM
          '/computers/hardware/internalstorage', // Storage
          '/computers/hardware/cases', // Cases
          '/computers/hardware/powersupplies' // Power Supplies
        ],
        language: 'he'
      }
    ];
    
    this.compatibilityRules = {
      'cpu': ['socket', 'tdp', 'memorySupport'],
      'gpu': ['powerRequirement', 'length', 'pciSlots'],
      'motherboard': ['socket', 'formFactor', 'memoryType']
    };
    
    this.embeddingModel = null;
    
    // Hebrew category mappings for classification
    this.hebrewCategoryMap = {
      'מעבד': 'cpu',
      'מעבדים': 'cpu',
      'כרטיס מסך': 'gpu',
      'כרטיסי מסך': 'gpu',
      'לוח אם': 'motherboard',
      'לוחות אם': 'motherboard',
      'זיכרון': 'memory',
      'זכרון': 'memory',
      'אחסון': 'storage',
      'כונן': 'storage',
      'ספק כוח': 'psu',
      'מארז': 'case',
      'קירור': 'cooling'
    };
    
    // Add Hebrew-specific parsing utilities
    this.hebrewPriceRegex = /₪\s*([\d,]+(?:\.\d+)?)|(?:([\d,]+(?:\.\d+)?)\s*₪)/;
  }

  async initialize() {
    // Set CPU backend for TensorFlow.js similar to pricePredService
    tf.setBackend('cpu');
    console.log('TensorFlow.js initialized with backend:', tf.getBackend());
    
    // Load training data for the classifier - include Hebrew examples
    const trainingData = await this.loadTrainingData();
    
    // Train the classifier with known hardware data
    for (const item of trainingData) {
      this.classifier.addDocument(item.text, item.category);
    }
    this.classifier.train();
    
    // Create a simple model for any embedding needs
    // Instead of loading from a file, create a small model on-the-fly
    this.embeddingModel = tf.sequential();
    this.embeddingModel.add(tf.layers.dense({
      units: 16,
      inputShape: [10],
      activation: 'relu'
    }));
    this.embeddingModel.add(tf.layers.dense({
      units: 8,
      activation: 'relu'
    }));
    
    console.log('DataCollector initialized successfully with TensorFlow.js');
  }

  async loadTrainingData() {
    // Include Hebrew product names and descriptions for training
    return [
      // English examples
      { text: 'RTX 4080 16GB GDDR6X', category: 'gpu' },
      { text: 'Core i9-14900K 5.8GHz Processor', category: 'cpu' },
      { text: 'DDR5-6000 32GB Memory', category: 'memory' },
      { text: 'X670E Motherboard', category: 'motherboard' },
      
      // Hebrew examples
      { text: 'מעבד אינטל Core i9-14900K', category: 'cpu' },
      { text: 'מעבד AMD Ryzen 9 7950X', category: 'cpu' },
      { text: 'כרטיס מסך Nvidia GeForce RTX 4090', category: 'gpu' },
      { text: 'כרטיס מסך AMD Radeon RX 7900 XTX', category: 'gpu' },
      { text: 'לוח אם ASUS ROG Maximus Z790', category: 'motherboard' },
      { text: 'זיכרון Kingston FURY Beast 32GB DDR5', category: 'memory' },
      { text: 'כונן SSD Samsung 990 PRO 2TB', category: 'storage' },
      { text: 'ספק כוח Corsair RM850x', category: 'psu' },
      { text: 'מארז Lian Li O11 Dynamic', category: 'case' },
      { text: 'מערכת קירור נוזלית NZXT Kraken', category: 'cooling' }
    ];
  }

  async startCollection() {
    console.log('Starting hardware data collection from Israeli retailers...');
    
    const allProducts = [];
    
    for (const source of this.sources) {
      console.log(`Collecting from ${source.name}...`);
      
      for (const pattern of source.patterns) {
        try {
          const products = await this.scrapeSourcePage(`${source.baseUrl}${pattern}`, source.name, source.language);
          allProducts.push(...products);
          console.log(`Collected ${products.length} products from ${source.name}${pattern}`);
          
          // Add a delay between requests to avoid overloading the server
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`Error scraping ${source.name} - ${pattern}:`, error);
        }
      }
    }
    
    console.log(`Total products collected: ${allProducts.length}`);
    return await this.processCollectedData(allProducts);
  }

  async scrapeSourcePage(url, sourceName, language) {
    console.log(`Scraping ${sourceName}: ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept-Language': language === 'he' ? 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7' : 'en-US,en;q=0.9'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      // Different scraping logic based on the source
      switch (sourceName) {
        case 'ksp':
          return this.parseKSPProducts($, sourceName, url);
        case 'plonter':
          return this.parsePlonterProducts($, sourceName, url);
        case 'ivory':
          return this.parseIvoryProducts($, sourceName, url);
        case 'tms':
          return this.parseTMSProducts($, sourceName, url);
        case 'bug':
          return this.parseBugProducts($, sourceName, url);
        case 'zap':
          return this.parseZapProducts($, sourceName, url);
        default:
          console.log(`No parser for ${sourceName}`);
          return [];
      }
    } catch (error) {
      console.error(`Error in scrapeSourcePage for ${url}:`, error);
      return [];
    }
  }

  parseKSPProducts($, sourceName, url) {
    const products = [];
    
    // Update selectors based on KSP's current layout
    // Try both the current selectors and new ones for the updated URL format
    
    // First try the new "item-wrap" selector structure
    $('.item-wrap').each((i, el) => {
      try {
        const name = $(el).find('.item-title').text().trim();
        const priceText = $(el).find('.price').text().trim();
        const price = this.parseHebrewPrice(priceText);
        const image = $(el).find('.img-wrap img').attr('src') || $(el).find('.item-img img').attr('src');
        const productUrl = $(el).find('a.item-link').attr('href') || $(el).find('a').first().attr('href');
        
        // Extract category from URL or page structure
        let category = this.getCategoryFromUrl(url);
        
        // Extract specs
        const specs = [];
        $(el).find('.item-features li').each((i, spec) => {
          specs.push($(spec).text().trim());
        });
        
        // For debugging
        console.log(`Found product: ${name}, Price: ${price}`);
        
        if (name && price) {
          // Add product
          products.push({
            name,
            price,
            image: image ? (image.startsWith('http') ? image : `https://ksp.co.il${image}`) : null,
            specs,
            category,
            source: sourceName,
            url: productUrl ? (productUrl.startsWith('http') ? productUrl : `https://ksp.co.il${productUrl}`) : null
          });
        }
      } catch (error) {
        console.error('Error parsing KSP product:', error);
      }
    });
    
    // If no products found, try the old "category-card" structure
    if (products.length === 0) {
      $('.category-card').each((i, el) => {
        try {
          const name = $(el).find('.category-card-name').text().trim();
          const priceText = $(el).find('.category-card-price').text().trim();
          const price = this.parseHebrewPrice(priceText);
          const image = $(el).find('.category-card-image img').attr('src');
          const productUrl = $(el).find('a').attr('href');
          
          // Extract category from URL or page structure
          let category = this.getCategoryFromUrl(url);
          
          // Extract specs
          const specs = [];
          $(el).find('.category-card-specs li').each((i, spec) => {
            specs.push($(spec).text().trim());
          });
          
          if (name && price) {
            // Add product
            products.push({
              name,
              price,
              image: image ? (image.startsWith('http') ? image : `https://ksp.co.il${image}`) : null,
              specs,
              category,
              source: sourceName,
              url: productUrl ? (productUrl.startsWith('http') ? productUrl : `https://ksp.co.il${productUrl}`) : null
            });
          }
        } catch (error) {
          console.error('Error parsing KSP product (old format):', error);
        }
      });
    }
    
    // For debugging
    console.log(`Total KSP products found: ${products.length}`);
    
    return products;
  }

  parsePlonterProducts($, sourceName, url) {
    const products = [];
    
    // Plonter product selector
    $('.productItem').each((i, el) => {
      try {
        const name = $(el).find('.title a').text().trim();
        const priceText = $(el).find('.price').text().trim();
        const price = this.parseHebrewPrice(priceText);
        const image = $(el).find('.img_container img').attr('src');
        const productUrl = $(el).find('.title a').attr('href');
        
        // Get category from URL
        let category = this.getCategoryFromUrl(url);
        
        // Extract specs
        const specs = [];
        $(el).find('.description li').each((i, spec) => {
          specs.push($(spec).text().trim());
        });
        
        if (name && price) {
          products.push({
            name,
            price,
            image: image ? (image.startsWith('http') ? image : `https://www.plonter.co.il${image}`) : null,
            specs,
            category,
            source: sourceName,
            url: productUrl ? (productUrl.startsWith('http') ? productUrl : `https://www.plonter.co.il${productUrl}`) : null
          });
        }
      } catch (error) {
        console.error('Error parsing Plonter product:', error);
      }
    });
    
    return products;
  }

  parseIvoryProducts($, sourceName, url) {
    const products = [];
    
    // Ivory product selector
    $('.product-box').each((i, el) => {
      try {
        const name = $(el).find('.product-name').text().trim();
        const priceText = $(el).find('.product-price').text().trim();
        const price = this.parseHebrewPrice(priceText);
        const image = $(el).find('.product-image img').attr('src');
        const productUrl = $(el).find('a.product-link').attr('href');
        
        // Get category from URL
        let category = this.getCategoryFromUrl(url);
        
        // Extract specs from description
        const specText = $(el).find('.product-desc').text().trim();
        const specs = specText.split(',').map(s => s.trim()).filter(s => s.length > 0);
        
        if (name && price) {
          products.push({
            name,
            price,
            image: image ? (image.startsWith('http') ? image : `https://www.ivory.co.il${image}`) : null,
            specs,
            category,
            source: sourceName,
            url: productUrl ? (productUrl.startsWith('http') ? productUrl : `https://www.ivory.co.il${productUrl}`) : null
          });
        }
      } catch (error) {
        console.error('Error parsing Ivory product:', error);
      }
    });
    
    return products;
  }

  parseTMSProducts($, sourceName, url) {
    const products = [];
    
    // TMS product selector
    $('.product-list .product-item').each((i, el) => {
      try {
        const name = $(el).find('.product-name').text().trim();
        const priceText = $(el).find('.product-price').text().trim();
        const price = this.parseHebrewPrice(priceText);
        const image = $(el).find('.product-image img').attr('src');
        const productUrl = $(el).find('a.product-link').attr('href');
        
        // Get category from URL
        let category = this.getCategoryFromUrl(url);
        
        // Extract specs
        const specs = [];
        $(el).find('.product-specs li').each((i, spec) => {
          specs.push($(spec).text().trim());
        });
        
        if (name && price) {
          products.push({
            name,
            price,
            image: image ? (image.startsWith('http') ? image : `https://tms.co.il${image}`) : null,
            specs,
            category,
            source: sourceName,
            url: productUrl ? (productUrl.startsWith('http') ? productUrl : `https://tms.co.il${productUrl}`) : null
          });
        }
      } catch (error) {
        console.error('Error parsing TMS product:', error);
      }
    });
    
    return products;
  }

  parseBugProducts($, sourceName, url) {
    const products = [];
    
    // Bug product selector
    $('.product_box').each((i, el) => {
      try {
        const name = $(el).find('.product_name').text().trim();
        const priceText = $(el).find('.price').text().trim();
        const price = this.parseHebrewPrice(priceText);
        const image = $(el).find('.product_img img').attr('src');
        const productUrl = $(el).find('a.product_link').attr('href');
        
        // Get category from URL
        let category = this.getCategoryFromUrl(url);
        
        // Extract specs
        const specs = [];
        $(el).find('.product_info .specs li').each((i, spec) => {
          specs.push($(spec).text().trim());
        });
        
        if (name && price) {
          products.push({
            name,
            price,
            image: image ? (image.startsWith('http') ? image : `https://www.bug.co.il${image}`) : null,
            specs,
            category,
            source: sourceName,
            url: productUrl ? (productUrl.startsWith('http') ? productUrl : `https://www.bug.co.il${productUrl}`) : null
          });
        }
      } catch (error) {
        console.error('Error parsing Bug product:', error);
      }
    });
    
    return products;
  }

  parseZapProducts($, sourceName, url) {
    const products = [];
    
    // Zap product listing selector
    $('.ProdInfo').each((i, el) => {
      try {
        const name = $(el).find('.ProdInfoTitle').text().trim();
        const priceText = $(el).find('.price').text().trim();
        const price = this.parseHebrewPrice(priceText);
        const image = $(el).find('.ProdInfoImg img').attr('src');
        const productUrl = $(el).find('a.ProdInfoTitle').attr('href');
        
        // Extract category from URL
        let category = this.getCategoryFromUrl(url);
        
        // Extract specs
        const specs = [];
        $(el).find('.ProdInfoText').each((i, spec) => {
          specs.push($(spec).text().trim());
        });
        
        if (name && price) {
          // Add product
          products.push({
            name,
            price,
            image: image ? (image.startsWith('http') ? image : `https://www.zap.co.il${image}`) : null,
            specs,
            category,
            source: sourceName,
            url: productUrl ? (productUrl.startsWith('http') ? productUrl : `https://www.zap.co.il${productUrl}`) : null
          });
        }
      } catch (error) {
        console.error('Error parsing Zap product:', error);
      }
    });
    
    return products;
  }

  // Hebrew price parsing function
  parseHebrewPrice(priceText) {
    if (!priceText) return null;
    
    // Remove non-breaking spaces and other whitespace
    priceText = priceText.replace(/\s+/g, ' ').trim();
    
    // Match Hebrew price format (₪ followed by number or number followed by ₪)
    const match = priceText.match(this.hebrewPriceRegex);
    
    if (match) {
      // Get the matched price (either group 1 or group 2)
      const priceStr = (match[1] || match[2]).replace(/,/g, '');
      return parseFloat(priceStr);
    }
    
    // Try to find just the number in the string
    const numericMatch = priceText.match(/[\d,]+(?:\.\d+)?/);
    if (numericMatch) {
      return parseFloat(numericMatch[0].replace(/,/g, ''));
    }
    
    return null;
  }

  // Helper function to extract category from URL
  getCategoryFromUrl(url) {
    if (!url) return null;
    
    // Extract category based on URL patterns
    if (url.includes('cpu') || url.includes('מעבד')) return 'cpu';
    if (url.includes('gpu') || url.includes('vga') || url.includes('כרטיס') || url.includes('מסך')) return 'gpu';
    if (url.includes('motherboard') || url.includes('לוח') || url.includes('אם')) return 'motherboard';
    if (url.includes('memory') || url.includes('ram') || url.includes('זיכרון') || url.includes('זכרון')) return 'memory';
    if (url.includes('storage') || url.includes('ssd') || url.includes('hdd') || url.includes('אחסון') || url.includes('כונן')) return 'storage';
    if (url.includes('psu') || url.includes('power') || url.includes('ספק')) return 'psu';
    if (url.includes('case') || url.includes('מארז')) return 'case';
    if (url.includes('cooling') || url.includes('קירור')) return 'cooling';
    
    return null;
  }

  async processCollectedData(rawData) {
    // Normalize the raw data
    const normalizedData = this.normalizeData(rawData);
    
    // Generate compatibility information
    const enrichedData = this.enrichWithCompatibility(normalizedData);
    
    // Save to database
    return await this.saveToDatabase(enrichedData);
  }

  normalizeData(rawData) {
    return rawData.map(item => {
      // Standardize naming conventions
      const normalizedName = this.normalizeProductName(item.name);
      
      // Determine category if not already assigned
      const category = item.category || this.determineCategory(item);
      
      // Extract common specs into structured data
      const extractedSpecs = this.extractSpecifications(item, category);
      
      return {
        ...item,
        name: normalizedName,
        category,
        specs: item.specs || [],
        extractedSpecs
      };
    });
  }

  normalizeProductName(name) {
    // Special processing for Hebrew product names
    // Remove common prefixes like "מעבד" (processor), "כרטיס מסך" (graphics card)
    name = name.replace(/^(מעבד|כרטיס מסך|לוח אם|זיכרון|כונן|ספק כוח|מארז|מערכת קירור)\s+/i, '');
    
    // Clean up spacing and special characters
    return name
      .replace(/\s+/g, ' ')
      .replace(/(\d+)\s*(GB|TB|MHz|GHz)/gi, '$1$2')
      .trim();
  }

  determineCategory(item) {
    // Check if the item name contains Hebrew category indicators
    const name = item.name.toLowerCase();
    
    for (const [hebrewKey, category] of Object.entries(this.hebrewCategoryMap)) {
      if (name.includes(hebrewKey.toLowerCase())) {
        return category;
      }
    }
    
    // If no Hebrew category found, use the classifier
    const text = `${item.name} ${(item.specs || []).join(' ')}`;
    return this.classifier.classify(text);
  }

  extractSpecifications(item, category) {
    const specs = {};
    const allText = `${item.name} ${(item.specs || []).join(' ')}`;
    
    // Parse specs based on product category
    switch (category) {
      case 'cpu':
        // Extract CPU specs - look for both English and Hebrew patterns
        
        // Core count - look for patterns like "10 Cores" or "10 ליבות"
        const coreMatch = allText.match(/(\d+)\s*(cores?|ליבות)/i);
        if (coreMatch) specs.cores = parseInt(coreMatch[1]);
        
        // Socket - look for common socket names
        const socketMatch = allText.match(/(AM[4-5]|AM5|AM4|LGA\s*\d+|LGA1700|LGA1200)/i);
        if (socketMatch) specs.socket = socketMatch[1].replace(/\s+/g, '').toUpperCase();
        
        // Look for base/boost clock speeds
        const clockMatch = allText.match(/(\d+(?:\.\d+)?)\s*GHz/i);
        if (clockMatch) specs.clockSpeed = parseFloat(clockMatch[1]);
        break;
        
      case 'gpu':
        // Extract VRAM - might be specified in GB
        const vramMatch = allText.match(/(\d+)\s*GB/i);
        if (vramMatch) specs.vram = parseInt(vramMatch[1]);
        
        // For Israeli retailers, you might need to look for model numbers directly
        if (allText.includes('RTX 30')) specs.series = 'RTX 30';
        else if (allText.includes('RTX 40')) specs.series = 'RTX 40';
        else if (allText.includes('RX 6')) specs.series = 'RX 6000';
        else if (allText.includes('RX 7')) specs.series = 'RX 7000';
        break;
        
      case 'memory':
        // Extract capacity - look for patterns like "32GB" or "32 GB"
        const capacityMatch = allText.match(/(\d+)\s*GB/i);
        if (capacityMatch) specs.capacity = parseInt(capacityMatch[1]);
        
        // Extract speed - look for patterns like "3600MHz" or "DDR5-6000"
        const speedMatch = allText.match(/(\d+)\s*MHz/i) || allText.match(/DDR[4-5]-(\d+)/i);
        if (speedMatch) specs.speed = parseInt(speedMatch[1]);
        break;
        
      // Add cases for other components
    }
    
    return specs;
  }

  enrichWithCompatibility(products) {
    return products.map(product => {
      const compatibility = {};
      
      // Add appropriate compatibility information based on category
      switch (product.category) {
        case 'cpu':
          if (product.extractedSpecs.socket) {
            compatibility.socket = product.extractedSpecs.socket;
          }
          
          // Estimate TDP based on similar products or model name
          compatibility.tdp = this.estimateTDP(product);
          break;
          
        case 'gpu':
          // Estimate power requirement based on model
          compatibility.powerRequirement = this.estimatePowerRequirement(product);
          
          // Extract length if available, or estimate based on model
          const lengthMatch = (product.specs || []).join(' ').match(/(\d+)\s*mm/i);
          if (lengthMatch) {
            compatibility.length = parseInt(lengthMatch[1]);
          } else {
            compatibility.length = this.estimateGPULength(product);
          }
          break;
          
        case 'motherboard':
          // Extract form factor
          const formFactorMatch = product.name.match(/(ATX|Micro-ATX|Mini-ITX|E-ATX|mATX)/i);
          if (formFactorMatch) {
            compatibility.formFactor = formFactorMatch[1].toUpperCase().replace('MATX', 'Micro-ATX');
          }
          
          // Extract socket
          const socketMatch = product.name.match(/(AM[4-5]|LGA\d+)/i);
          if (socketMatch) {
            compatibility.socket = socketMatch[1].toUpperCase();
          }
          break;
          
        // Add cases for other component types
      }
      
      return {
        ...product,
        compatibility
      };
    });
  }

  estimateTDP(cpuProduct) {
    const name = cpuProduct.name.toLowerCase();
    
    // Intel CPUs
    if (name.includes('i9')) {
      if (name.includes('14900') || name.includes('13900')) return 253;
      if (name.includes('12900')) return 241;
      return 125;
    } 
    else if (name.includes('i7')) {
      if (name.includes('14700') || name.includes('13700')) return 219;
      if (name.includes('12700')) return 190;
      return 95;
    } 
    else if (name.includes('i5')) {
      if (name.includes('14600') || name.includes('13600')) return 181;
      if (name.includes('12600')) return 150;
      return 65;
    }
    
    // AMD CPUs
    if (name.includes('ryzen 9')) {
      if (name.includes('7950') || name.includes('7900')) return 170;
      if (name.includes('5950') || name.includes('5900')) return 105;
      return 105;
    } 
    else if (name.includes('ryzen 7')) {
      if (name.includes('7700')) return 105;
      if (name.includes('5800')) return 105;
      return 95;
    } 
    else if (name.includes('ryzen 5')) {
      if (name.includes('7600')) return 65;
      if (name.includes('5600')) return 65;
      return 65;
    }
    
    return 95; // Default value
  }

  estimatePowerRequirement(gpuProduct) {
    const name = gpuProduct.name.toLowerCase();
    
    // NVIDIA GPUs
    if (name.includes('rtx 4090')) return 450;
    if (name.includes('rtx 4080')) return 320;
    if (name.includes('rtx 4070 ti')) return 285;
    if (name.includes('rtx 4070')) return 200;
    if (name.includes('rtx 4060 ti')) return 160;
    if (name.includes('rtx 4060')) return 115;
    
    if (name.includes('rtx 3090 ti')) return 450;
    if (name.includes('rtx 3090')) return 350;
    if (name.includes('rtx 3080 ti')) return 350;
    if (name.includes('rtx 3080')) return 320;
    if (name.includes('rtx 3070 ti')) return 290;
    if (name.includes('rtx 3070')) return 220;
    if (name.includes('rtx 3060 ti')) return 200;
    if (name.includes('rtx 3060')) return 170;
    
    // AMD GPUs
    if (name.includes('rx 7900 xtx')) return 355;
    if (name.includes('rx 7900 xt')) return 300;
    if (name.includes('rx 7800 xt')) return 263;
    if (name.includes('rx 7700 xt')) return 245;
    if (name.includes('rx 7600')) return 165;
    
    if (name.includes('rx 6950 xt')) return 335;
    if (name.includes('rx 6900 xt')) return 300;
    if (name.includes('rx 6800 xt')) return 280;
    if (name.includes('rx 6800')) return 250;
    if (name.includes('rx 6700 xt')) return 230;
    if (name.includes('rx 6600 xt')) return 160;
    if (name.includes('rx 6600')) return 132;
    
    // If nothing matches, use a safe default based on typical high-end GPU
    return 300;
  }

  estimateGPULength(gpuProduct) {
    const name = gpuProduct.name.toLowerCase();
    
    // High-end cards tend to be longer
    if (name.includes('rtx 4090')) return 336;
    if (name.includes('rtx 4080')) return 304;
    if (name.includes('rtx 3090')) return 313;
    if (name.includes('rx 7900 xtx')) return 287;
    
    // Mid-range cards
    if (name.includes('rtx 4070') || name.includes('rtx 3070')) return 267;
    if (name.includes('rx 7800 xt') || name.includes('rx 6800 xt')) return 267;
    
    // Budget cards are typically smaller
    if (name.includes('rtx 4060') || name.includes('rtx 3060')) return 242;
    if (name.includes('rx 7600') || name.includes('rx 6600')) return 240;
    
    // Default average length
    return 270;
  }

  async saveToDatabase(products) {
    let savedCount = 0;
    let updatedCount = 0;
    
    for (const product of products) {
      try {
        // Skip products without essential fields
        if (!product.name || !product.price || !product.category) {
          console.log(`Skipping incomplete product: ${product.name || 'Unknown'}`);
          continue;
        }
        
        // Check if a similar product already exists
        const existingProduct = await Product.findOne({
          name: { $regex: new RegExp(this.getSearchRegex(product.name), 'i') }
        });
        
        if (existingProduct) {
          // Update prices and availability
          const newPrice = {
            retailer: product.source,
            price: product.price,
            inStock: true
          };
          
          // Check if this retailer already exists in the prices array
          const retailerIndex = existingProduct.prices.findIndex(p => p.retailer === product.source);
          
          if (retailerIndex >= 0) {
            // Update existing retailer price
            existingProduct.prices[retailerIndex] = newPrice;
          } else {
            // Add new retailer
            existingProduct.prices.push(newPrice);
          }
          
          // Update lowest price
          const lowestPrice = Math.min(...existingProduct.prices.map(p => p.price));
          existingProduct.lowestPrice = lowestPrice;
          
          // Add new price to history if significantly different
          const lastPrice = existingProduct.priceHistory[existingProduct.priceHistory.length - 1];
          if (!lastPrice || Math.abs(lowestPrice - lastPrice) / lastPrice > 0.03) {
            existingProduct.priceHistory.push(lowestPrice);
          }
          
          // Enhance compatibility data if needed
          if (product.compatibility && Object.keys(product.compatibility).length > 0) {
            existingProduct.compatibility = {
              ...existingProduct.compatibility,
              ...product.compatibility
            };
          }
          
          // Enhance specs if the new product has more
          if (product.specs && product.specs.length > 0) {
            // Add any new specs that don't already exist
            product.specs.forEach(spec => {
              if (!existingProduct.specs.includes(spec)) {
                existingProduct.specs.push(spec);
              }
            });
          }
          
          await existingProduct.save();
          updatedCount++;
        } else {
          // Create a new product
          const newProduct = new Product({
            name: product.name,
            image: product.image || '/assets/placeholder.png',
            category: product.category,
            specs: product.specs || [],
            avgRating: 0,
            numReviews: 0,
            prices: [{
              retailer: product.source,
              price: product.price,
              inStock: true
            }],
            lowestPrice: product.price,
            priceHistory: [product.price],
            compatibility: product.compatibility || {}
          });
          
          await newProduct.save();
          savedCount++;
        }
      } catch (error) {
        console.error(`Error saving product ${product.name}:`, error);
      }
    }
    
    return { savedCount, updatedCount };
  }

  getSearchRegex(name) {
    // Create a search pattern that matches similar product names
    // For Hebrew product names, first remove any Hebrew category indicators
    let searchName = name;
    
    // Remove Hebrew component type indicators
    for (const hebrewKey of Object.keys(this.hebrewCategoryMap)) {
      searchName = searchName.replace(new RegExp(`${hebrewKey}\\s+`, 'i'), '');
    }
    
    // Remove model numbers and non-essential details
    return searchName
      .replace(/\b(RTX|GTX|RX)\s+\d+\s*(Ti|XT|SUPER)?\b/i, '$1 $2')
      .replace(/\b(Core i[3579]|Ryzen [3579])\s+\d+\w*\b/i, '$1')
      .replace(/\s+/g, '.*');
  }
  
  // Add a method for text encoding (simple one-hot approach)
  encodeText(text, maxLength = 10) {
    // Simple encoding - just count frequencies of certain keywords
    const keywords = [
      'cpu', 'gpu', 'motherboard', 'memory', 'storage', 
      'intel', 'amd', 'nvidia', 'rtx', 'ryzen'
    ];
    
    // Initialize encoding with zeros
    const encoding = Array(keywords.length).fill(0);
    
    // Convert text to lowercase for case-insensitive matching
    const lowercaseText = text.toLowerCase();
    
    // Count occurrences of each keyword
    keywords.forEach((keyword, index) => {
      const regex = new RegExp(keyword, 'g');
      const matches = lowercaseText.match(regex);
      if (matches) {
        encoding[index] = matches.length / maxLength; // Normalize by max length
      }
    });
    
    return encoding;
  }
  
  // Use the model for similarity scoring if needed
  getSimilarityScore(text1, text2) {
    const encoding1 = this.encodeText(text1);
    const encoding2 = this.encodeText(text2);
    
    // Convert to tensors
    const tensor1 = tf.tensor([encoding1]);
    const tensor2 = tf.tensor([encoding2]);
    
    // Get embeddings
    const embedding1 = this.embeddingModel.predict(tensor1);
    const embedding2 = this.embeddingModel.predict(tensor2);
    
    // Calculate cosine similarity
    const dotProduct = tf.sum(tf.mul(embedding1, embedding2));
    const norm1 = tf.sqrt(tf.sum(tf.square(embedding1)));
    const norm2 = tf.sqrt(tf.sum(tf.square(embedding2)));
    
    const similarity = tf.div(dotProduct, tf.mul(norm1, norm2));
    
    // Get the value and clean up tensors
    const similarityValue = similarity.dataSync()[0];
    
    // Cleanup tensors to prevent memory leaks
    tensor1.dispose();
    tensor2.dispose();
    embedding1.dispose();
    embedding2.dispose();
    dotProduct.dispose();
    norm1.dispose();
    norm2.dispose();
    similarity.dispose();
    
    return similarityValue;
  }
}

module.exports = DataCollector;