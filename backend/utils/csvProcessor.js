const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const axios = require('axios');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); // Ensure .env from backend folder is loaded

// --- Google Gemini API Data Transformation Function ---
async function transformHardwareItem(item, category) {
  const combinedPrompt = `
    You are an AI assistant specializing in computer hardware. Your task is to convert raw hardware data into a strict JSON format for a PC Builder application.
    The output MUST be a single, valid JSON object and NOTHING ELSE. Do not include any explanatory text, markdown, or any characters outside the JSON structure.

    The JSON schema is as follows:
    {
      "name": "Full product name (e.g., 'AMD Ryzen 7 5800X 8-Core Processor')",
      "image": "/assets/hardware/${category.toLowerCase().replace(/\s+/g, '')}.png",
      "category": "${category}",
      "specs": ["Spec 1 (e.g., '8 Cores / 16 Threads')", "Spec 2 (e.g., '3.8 GHz Base Clock')", "Spec 3", "Spec 4", "Spec 5 (be concise and informative)"],
      "avgRating": 4.7, /* number, 3.5 to 5.0, one decimal place */
      "numReviews": 127, /* number, 50 to 500 */
      "prices": [
        { "retailer": "Amazon", "price": 299.99, "inStock": true },
        { "retailer": "Newegg", "price": 295.50, "inStock": true },
        { "retailer": "Best Buy", "price": 305.00, "inStock": false }
      ],
      "lowestPrice": 295.50, /* number, the lowest price from the prices array */
      "priceHistory": [320.00, 315.00, 310.00, 305.00, 300.00], /* array of 5 historical prices, numbers only */
      "compatibility": { /* See category-specific details below for ${category} */ },
      "brand": "AMD", /* Manufacturer name */
      "popularity": 85, /* number, 70 to 98 */
      "performanceTier": "midrange", /* 'budget', 'midrange', or 'highend' */
      "useCases": ["Gaming", "Streaming", "Productivity"] /* Array of 3 strings */
    }

    Category-specific "compatibility" details:
    - Processors: { "socket": "AM4", "tdp": 105, "compatibleChipsets": ["B550", "X570"] }
    - Graphics Cards: { "powerRequirement": 250, "length": 280, "height": 120, "pciSlots": 2, "interfaceType": "PCIe 4.0 x16", "recommendedPSU": 650 }
    - Motherboards: { "socket": "AM4", "formFactor": "ATX", "memoryType": "DDR4", "memorySlots": 4, "maxMemory": 128 }
    - Memory: { "memoryType": "DDR4", "capacity": 16, "speed": 3200, "latency": "CL16", "voltage": 1.35 }
    - Storage: { "interface": "NVMe PCIe 4.0", "formFactor": "M.2 2280", "capacity": 1000 } /* capacity in GB */
    - Power Supplies: { "wattage": 750, "formFactor": "ATX", "certification": "80+ Gold", "modular": "Fully-Modular"}
    - Cases: { "formFactor": "Mid-Tower ATX", "maxGPULength": 380, "maxCoolerHeight": 165 }
    - Cooling: { "type": "Air Cooler", "tdpRating": 180, "socketCompatibility": ["AM4", "LGA1700"] }

    Use the provided data to fill fields. For missing information, infer reasonable, typical values for the given hardware category and item.
    Ensure all string values are enclosed in double quotes. Ensure all numbers are actual numbers (e.g., 4.7, not "4.7"). Ensure booleans are true/false (not "true"/"false").
    The final output must be only the JSON object.

    Transform this ${category} data into the specified JSON format: ${JSON.stringify(item)}
  `;

  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("❌ Google API key (GOOGLE_API_KEY) is not set in .env file. Check backend/.env");
    console.log(`⚠️ Falling back to manual data creation for item: ${item.Name || item.name || JSON.stringify(item)}...`);
    return createFallbackData(item, category);
  }

  try {
    // Try using Gemini 1.5 Flash - latest version
    const model = 'gemini-1.5-flash-latest'; 
    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const requestBody = {
      contents: [{
        parts: [{ text: combinedPrompt }]
      }],
      generationConfig: {
        temperature: 0.4, 
        responseMimeType: "application/json",
      }
    };


    const response = await axios.post(apiEndpoint, requestBody, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    let aiResponseText = '';
    if (response.data && response.data.candidates && response.data.candidates.length > 0) {
      const candidate = response.data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0 && candidate.content.parts[0].text) {
        aiResponseText = candidate.content.parts[0].text;
      } else if (candidate.finishReason === "SAFETY" || (candidate.promptFeedback && candidate.promptFeedback.blockReason)) {
        const blockReason = candidate.promptFeedback ? candidate.promptFeedback.blockReason : (candidate.finishReason || "Unknown Safety Block");
        const safetyRatings = candidate.promptFeedback ? candidate.promptFeedback.safetyRatings : (candidate.safetyRatings || "N/A");
        console.error(`❌ Gemini API request blocked for item '${item.Name || item.name || JSON.stringify(item)}'. Reason: ${blockReason}`);
        console.error('Safety Ratings:', JSON.stringify(safetyRatings, null, 2));
        throw new Error(`Gemini API request blocked. Reason: ${blockReason}`);
      } else {
        console.error(`❌ Unexpected response structure from Gemini API (no text part or block reason):`, JSON.stringify(response.data, null, 2));
        throw new Error('Invalid response structure from Gemini API (no text part or block reason found)');
      }
    } else {
      console.error('❌ Unexpected response structure from Gemini API (no candidates):', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid response structure from Gemini API (no candidates found)');
    }
        
    let jsonData;
    try {
      jsonData = JSON.parse(aiResponseText);
    } catch (e1) {
      console.warn(`⚠️ Direct JSON.parse failed for Gemini response. Attempting to extract from markdown for item: ${item.Name || item.name || JSON.stringify(item)}`);
      console.warn(`Original Gemini response text (first 500 chars): ${aiResponseText.substring(0, 500)}...`);
      const jsonMatch = aiResponseText.match(/```json\s*([\s\S]*?)\s*```|({[\s\S]*})/);
      if (jsonMatch && (jsonMatch[1] || jsonMatch[2])) {
        const extractedJson = jsonMatch[1] || jsonMatch[2];
        try {
          jsonData = JSON.parse(extractedJson);
        } catch (e2) {
          console.error(`❌ Failed to parse extracted JSON block for item '${item.Name || item.name || JSON.stringify(item)}':`, e2.message);
          console.error('Extracted text was:', extractedJson);
          throw new Error('Failed to parse JSON from Gemini response after extraction.');
        }
      } else {
        console.error(`❌ No JSON block found in Gemini response for item '${item.Name || item.name || JSON.stringify(item)}'. Response (first 500 chars): ${aiResponseText.substring(0,500)}...`);
        throw new Error('No JSON block found in Gemini response.');
      }
    }
    return jsonData;

  } catch (error) {
    console.error(`❌ Error in transformHardwareItem for '${item.Name || item.name || JSON.stringify(item)}' with Gemini API:`);
    if (error.response) { 
      console.error('API Response Status:', error.response.status);
      console.error('API Response Headers:', JSON.stringify(error.response.headers, null, 2));
      console.error('API Response Data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) { 
      console.error('API Request Error: No response received.');
    } else { 
      console.error('Error Message:', error.message);
      if (error.stack) {
        console.error('Error Stack (partial):', error.stack.split('\n').slice(0, 10).join('\n'));
      }
    }
    console.log(`⚠️ Falling back to manual data creation for item: ${item.Name || item.name || JSON.stringify(item)}...`);
    return createFallbackData(item, category);
  }
}
// --- End of Google Gemini API Data Transformation Function ---


// --- Fallback Data Generation Functions ---
function createFallbackData(item, category) {
  const basePrice = parseFloat(item.Price || item.price) || getRandomPrice(category);
  const lowestPrice = Math.floor(basePrice * 0.95);
  
  return {
    name: item.Name || item.name || `${item.Producer || item.brand || 'Generic'} ${category} Model ${Math.floor(Math.random() * 1000)}`,
    image: `/assets/hardware/${category.toLowerCase().replace(/\s+/g, '')}.png`,
    category: category,
    specs: generateFallbackSpecs(item, category),
    avgRating: parseFloat((3.8 + Math.random() * 1.2).toFixed(1)),
    numReviews: Math.floor(50 + Math.random() * 450),
    prices: [
      { retailer: 'Amazon', price: parseFloat(basePrice.toFixed(2)), inStock: Math.random() > 0.1 },
      { retailer: 'Newegg', price: parseFloat((basePrice * 0.98).toFixed(2)), inStock: Math.random() > 0.15 },
      { retailer: 'Best Buy', price: parseFloat((basePrice * 1.02).toFixed(2)), inStock: Math.random() > 0.2 },
      { retailer: 'Micro Center', price: parseFloat(lowestPrice.toFixed(2)), inStock: Math.random() > 0.1 }
    ],
    lowestPrice: parseFloat(lowestPrice.toFixed(2)),
    priceHistory: [
      parseFloat((basePrice * 1.15).toFixed(2)),
      parseFloat((basePrice * 1.12).toFixed(2)),
      parseFloat((basePrice * 1.08).toFixed(2)),
      parseFloat((basePrice * 1.03).toFixed(2)),
      parseFloat(basePrice.toFixed(2))
    ],
    compatibility: generateFallbackCompatibility(item, category),
    brand: item.Producer || item.brand || 'GenericBrand',
    popularity: Math.floor(70 + Math.random() * 28),
    performanceTier: determineFallbackTier(basePrice, category),
    useCases: generateFallbackUseCases(determineFallbackTier(basePrice, category), category)
  };
}

function getRandomPrice(category) {
  const priceRanges = {
    'Processors': { min: 100, max: 800 },
    'Graphics Cards': { min: 150, max: 1500 },
    'Motherboards': { min: 80, max: 500 },
    'Memory': { min: 40, max: 300 },
    'Storage': { min: 30, max: 400 },
    'Power Supplies': { min: 50, max: 250 },
    'Cases': { min: 40, max: 200 },
    'Cooling': { min: 20, max: 150 },
    'default': { min: 50, max: 300 }
  };
  const range = priceRanges[category] || priceRanges.default;
  return Math.floor(range.min + Math.random() * (range.max - range.min));
}

function generateFallbackSpecs(item, category) {
  const specs = [];
  const getVal = (key1, key2) => item[key1] || item[key2];

  switch(category) {
    case 'Processors':
      specs.push(getVal('Cores','cores') ? `${getVal('Cores','cores')} Cores / ${getVal('Threads','threads') || parseInt(getVal('Cores','cores')) * 2} Threads` : '8 Cores / 16 Threads');
      specs.push(getVal('Base Clock','base_clock') ? `${getVal('Base Clock','base_clock')} GHz Base Clock` : '3.5 GHz Base Clock');
      specs.push(getVal('Boost Clock','boost_clock') ? `${getVal('Boost Clock','boost_clock')} GHz Boost Clock` : '4.7 GHz Boost Clock');
      specs.push(getVal('Socket','socket') ? `Socket ${getVal('Socket','socket')}` : 'Socket AM4');
      specs.push(getVal('TDP','tdp') ? `${getVal('TDP','tdp')}W TDP` : '65W TDP');
      break;
    case 'Graphics Cards':
      specs.push(getVal('Memory','memory') ? `${getVal('Memory','memory')}GB ${getVal('Memory Type','memory_type') || 'GDDR6X'}` : '8GB GDDR6X');
      specs.push(getVal('Boost Clock','boost_clock') ? `${getVal('Boost Clock','boost_clock')} MHz Boost Clock` : '1750 MHz Boost Clock');
      specs.push(getVal('Interface','interface') ? getVal('Interface','interface') : 'PCIe 4.0 x16');
      specs.push(getVal('Length','length') ? `${getVal('Length','length')}mm Length` : '280mm Length');
      specs.push(getVal('TDP','tdp') ? `${getVal('TDP','tdp')}W TDP` : '220W TDP');
      break;
    case 'Motherboards':
      specs.push(getVal('Socket','socket') ? `Socket ${getVal('Socket','socket')}` : 'Socket AM4');
      specs.push(getVal('Form Factor','form_factor') ? getVal('Form Factor','form_factor') : 'ATX Form Factor');
      specs.push(getVal('Chipset','chipset') ? `${getVal('Chipset','chipset')} Chipset` : 'B550 Chipset');
      specs.push(getVal('Memory Type','memory_type') ? `${getVal('Memory Type','memory_type')} Support` : 'DDR4 Support');
      specs.push(getVal('Memory Slots','memory_slots') ? `${getVal('Memory Slots','memory_slots')} Memory Slots` : '4 Memory Slots');
      break;
    case 'Memory':
      specs.push(getVal('Capacity','capacity') ? `${getVal('Capacity','capacity')}GB Kit` : '16GB (2x8GB) Kit');
      specs.push(getVal('Speed','speed') ? `${getVal('Speed','speed')}MHz Speed` : '3200MHz Speed');
      specs.push(getVal('Type','type') ? getVal('Type','type') : 'DDR4');
      specs.push(getVal('Latency','latency') ? `CAS Latency ${getVal('Latency','latency')}` : 'CAS Latency 16');
      specs.push(getVal('Voltage','voltage') ? `${getVal('Voltage','voltage')}V` : '1.35V');
      break;
    case 'Storage':
      specs.push(getVal('Capacity','capacity') ? `${getVal('Capacity','capacity')} Capacity` : '1TB Capacity');
      specs.push(getVal('Type','type') ? getVal('Type','type') : 'NVMe SSD');
      specs.push(getVal('Interface','interface') ? getVal('Interface','interface') : 'PCIe Gen4 x4');
      specs.push(getVal('Form Factor','form_factor') ? getVal('Form Factor','form_factor') : 'M.2 2280');
      specs.push(getVal('Read Speed','read_speed') ? `Up to ${getVal('Read Speed','read_speed')} MB/s Read` : 'Up to 5000 MB/s Read');
      break;
    case 'Power Supplies':
      specs.push(getVal('Wattage','wattage') ? `${getVal('Wattage','wattage')}W Wattage` : '650W Wattage');
      specs.push(getVal('Efficiency Rating','efficiency_rating') ? getVal('Efficiency Rating','efficiency_rating') : '80+ Gold Certified');
      specs.push(getVal('Modular','modular') ? getVal('Modular','modular') : 'Fully Modular');
      specs.push(getVal('Form Factor','form_factor') ? getVal('Form Factor','form_factor') : 'ATX');
      specs.push('Multiple Protections (OVP, UVP, SCP)');
      break;
    case 'Cases':
      specs.push(getVal('Type','type') ? getVal('Type','type') : 'Mid-Tower');
      specs.push(getVal('Motherboard Support','motherboard_support') ? getVal('Motherboard Support','motherboard_support') : 'ATX, Micro-ATX, Mini-ITX');
      specs.push(getVal('Max GPU Length','max_gpu_length') ? `Max GPU Length: ${getVal('Max GPU Length','max_gpu_length')}mm` : 'Max GPU Length: 380mm');
      specs.push(getVal('Included Fans','included_fans') ? `${getVal('Included Fans','included_fans')} Fans Included` : '3 Fans Included');
      specs.push('Tempered Glass Side Panel');
      break;
    case 'Cooling':
      specs.push(getVal('Type','type') ? getVal('Type','type') : 'Air Cooler');
      specs.push(item['140mm Fans'] > 0 ? `${item['140mm Fans']}x 140mm Fans` : (item['120mm Fans'] > 0 ? `${item['120mm Fans']}x 120mm Fans` : '120mm Fan(s)'));
      specs.push(getVal('Supported Sockets','socket_compatibility') ? `Sockets: ${getVal('Supported Sockets','socket_compatibility')}` : 'Sockets: AM4, LGA1700, LGA1200');
      specs.push(getVal('TDP','tdp_rating') ? `TDP Rating: ${getVal('TDP','tdp_rating')}W` : 'TDP Rating: 180W');
      specs.push('Quiet Operation');
      break;
    default:
      for (let i = 1; i <= 5; i++) {
        specs.push(item[`spec${i}`] || `Generic Spec ${i}`);
      }
  }
  return specs.slice(0, 5);
}

function generateFallbackCompatibility(item, category) {
  const getVal = (key1, key2, key3) => item[key1] || item[key2] || item[key3];
  const parseToInt = (val1, val2, val3, defaultVal) => parseInt(getVal(val1, val2, val3)) || defaultVal;
  const splitToArray = (val1, val2, defaultArr) => {
    const val = getVal(val1, val2);
    return val ? val.split(',').map(s => s.trim()) : defaultArr;
  };

  switch(category) {
    case 'Processors':
      return {
        socket: getVal('Socket','socket') || 'AM4',
        tdp: parseToInt('TDP','tdp', null, 65),
        compatibleChipsets: splitToArray('Compatible Chipsets','compatible_chipsets', ['B550', 'X570', 'B450'])
      };
    case 'Graphics Cards':
      return {
        powerRequirement: parseToInt('Power Requirement','power_requirement', 'TDP', 220),
        length: parseToInt('Length','length', null, 280),
        height: parseToInt('Height','height', null, 120),
        pciSlots: parseToInt('PCI Slots','pci_slots', null, 2),
        interfaceType: getVal('Interface Type','interface_type') || 'PCIe 4.0 x16',
        recommendedPSU: parseToInt('Recommended PSU','recommended_psu', null, 650)
      };
    case 'Motherboards':
      return {
        socket: getVal('Socket','socket') || 'AM4',
        formFactor: getVal('Form Factor','form_factor') || 'ATX',
        memoryType: getVal('Memory Type','memory_type') || 'DDR4',
        memorySlots: parseToInt('Memory Slots','memory_slots', null, 4),
        maxMemory: parseToInt('Max Memory','max_memory', null, 128)
      };
    case 'Memory':
      return {
        memoryType: getVal('Type','type') || 'DDR4',
        capacity: parseToInt('Capacity GB','capacity_gb', 'Capacity', 16),
        speed: parseToInt('Speed MHz','speed_mhz', 'Speed', 3200),
        latency: getVal('Latency','latency') || 'CL16',
        voltage: parseFloat(getVal('Voltage V','voltage_v', 'Voltage')) || 1.35
      };
    case 'Storage':
      return {
        interface: getVal('Interface','interface') || 'NVMe PCIe 4.0',
        formFactor: getVal('Form Factor','form_factor') || 'M.2 2280',
        capacity: parseToInt('Capacity GB','capacity_gb', 'Capacity', 1000)
      };
    case 'Power Supplies':
        return {
            wattage: parseToInt('Wattage','wattage', null, 650),
            formFactor: getVal('Form Factor','form_factor') || 'ATX',
            certification: getVal('Efficiency Rating','efficiency_rating') || '80+ Gold',
            modular: getVal('Modular','modular') || 'Fully-Modular'
        };
    case 'Cases':
        return {
            formFactor: getVal('Type','type') || 'Mid-Tower ATX',
            maxGPULength: parseToInt('Max GPU Length','max_gpu_length', null, 380),
            maxCoolerHeight: parseToInt('Max Cooler Height','max_cooler_height', null, 165),
            motherboardCompatibility: splitToArray('Motherboard Support','motherboard_support', ['ATX', 'Micro-ATX', 'Mini-ITX'])
        };
    case 'Cooling':
        return {
            type: getVal('Type','type') || 'Liquid Cooler',
            tdpRating: parseToInt('TDP','tdp_rating', null, 180),
            socketCompatibility: splitToArray('Supported Sockets','socket_compatibility', ['AM4', 'LGA1700', 'LGA1200']),
            fanSize: item['140mm Fans'] > 0 ? 140 : (item['120mm Fans'] > 0 ? 120 : 120)
        };
    default:
      return { info: "Generic compatibility information" };
  }
}

function determineFallbackTier(price, category) {
  const thresholds = {
    'Processors': { budget: 200, midrange: 400 },
    'Graphics Cards': { budget: 250, midrange: 550 },
    'Motherboards': { budget: 120, midrange: 220 },
    'Memory': { budget: 70, midrange: 130 },
    'Storage': { budget: 80, midrange: 150 },
    'Power Supplies': { budget: 70, midrange: 120 },
    'Cases': { budget: 60, midrange: 100 },
    'Cooling': { budget: 70, midrange: 150 },
    'default': { budget: 100, midrange: 200 }
  };
  const limits = thresholds[category] || thresholds.default;
  if (price < limits.budget) return 'budget';
  if (price < limits.midrange) return 'midrange';
  return 'highend';
}

function generateFallbackUseCases(performanceTier, category) {
  const commonUseCases = {
    budget: ["General Use", "Office Work", "Web Browsing"],
    midrange: ["Gaming", "Productivity", "Streaming"],
    highend: ["High-End Gaming", "Content Creation", "Professional Workloads"]
  };
  const categorySpecific = {
    'Processors': {
      budget: ["Light Multitasking", "Basic Productivity"],
      midrange: ["1080p/1440p Gaming", "Video Editing (Light)"],
      highend: ["4K Gaming", "Heavy Rendering", "Virtualization"]
    },
    'Graphics Cards': {
      budget: ["Esports Titles", "1080p (Low/Medium Settings)"],
      midrange: ["1080p (High/Ultra)", "1440p Gaming"],
      highend: ["4K Gaming", "VR Gaming", "Ray Tracing"]
    },
    'Memory': {
      budget: ["Standard Multitasking"],
      midrange: ["Gaming Builds", "Moderate Content Creation"],
      highend: ["RAM-Intensive Applications", "Heavy Multitasking"]
    },
    'Storage': {
      budget: ["OS & Essential Apps"],
      midrange: ["Game Libraries", "Fast Boot & Load Times"],
      highend: ["Large Project Files", "Scratch Disks"]
    },
    'Cooling': {
        budget: ["Quiet Operation", "Stock CPU Cooling"],
        midrange: ["Overclocking (Mild)", "Improved Thermals"],
        highend: ["Aggressive Overclocking", "Custom Loop Potential"]
    }
  };
  let useCases = [...(commonUseCases[performanceTier] || commonUseCases.midrange)];
  if (categorySpecific[category] && categorySpecific[category][performanceTier]) {
    useCases.push(...categorySpecific[category][performanceTier]);
  }
  const uniqueUseCases = [...new Set(useCases)];
  return uniqueUseCases.slice(0, 3);
}
// --- End of Fallback Data Generation Functions ---


// --- Main function to process all CSV files ---
async function processAllCSVFiles() {
  try {
    const csvDirectory = path.join(__dirname, '..', 'csv');
    const outputDirectory = path.join(__dirname, '..', 'data', 'transformed');
    
    fs.mkdirSync(outputDirectory, { recursive: true });
    
    const csvFiles = findCSVFiles(csvDirectory);
    if (csvFiles.length === 0) {
      console.warn(`⚠️ No CSV files found in ${csvDirectory}. Make sure your CSV files are in the 'backend/csv' directory.`);
      return;
    }
    console.log(`📁 Found ${csvFiles.length} CSV files to process.`);
    
    for (const file of csvFiles) {
      try {
        console.log(`\n🔄 Processing ${file.name} (category: ${file.category})...`);
        const transformedData = await processCSVFile(file.path, file.category);
        
        const outputPath = path.join(outputDirectory, `${file.name}.json`);
        fs.writeFileSync(outputPath, JSON.stringify(transformedData, null, 2));
        
        console.log(`✅ Saved ${transformedData.length} transformed items to ${outputPath}`);
      } catch (fileError) {
        console.error(`❌ Failed to process ${file.name}:`, fileError.message);
      }
    } // Closes: for (const file of csvFiles)
    
    console.log('\n🎉 All CSV files processed.');
  } catch (error) {
    console.error('❌ Error in processAllCSVFiles:', error.message);
  }
} // Closes: async function processAllCSVFiles()
// --- End of Main function to process all CSV files ---


// --- Function to process a single CSV file ---
async function processCSVFile(filePath, category) {
  return new Promise((resolve, reject) => {
    const results = [];
    let rowCount = 0;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
        rowCount++;
      })
      .on('end', async () => {
        try {
          if (rowCount === 0) {
            console.warn(`⚠️ No data found in ${path.basename(filePath)}.`);
            resolve([]);
            return;
          }
          console.log(`📊 Read ${rowCount} rows from ${path.basename(filePath)}. Transforming...`);
          
          const transformedItems = [];
          const itemsToProcess = results; 
          
          for (const [index, item] of itemsToProcess.entries()) {
            try {
              const transformedItem = await transformHardwareItem(item, category);
              if (transformedItem) {
                transformedItems.push(transformedItem);
              } else {
                console.warn(`  ⚠️ Skipped item due to transformation failure: ${item.Name || item.name || JSON.stringify(item)}`);
              }
            } catch (itemError) {
              console.error(`  ❌ Failed to process item: ${item.Name || item.name || JSON.stringify(item)} - ${itemError.message}`);
            }
          } // Closes: for (const [index, item] of itemsToProcess.entries())
          
          resolve(transformedItems);
        } catch (error) {
          console.error(`❌ Error during transformation for ${path.basename(filePath)}: ${error.message}`);
          reject(error);
        }
      }) // Closes: .on('end', async () => { ... })
      .on('error', (err) => {
        console.error(`❌ Error reading CSV file ${filePath}: ${err.message}`);
        reject(err);
      }); // Closes: .on('error', (err) => { ... }) and the stream chain
  }); // Closes: return new Promise((resolve, reject) => { ... })
} // Closes: async function processCSVFile(filePath, category)
// --- End of Function to process a single CSV file ---


// --- Helper to find CSV files and determine category ---
function findCSVFiles(directory) {
  if (!fs.existsSync(directory)) {
    console.error(`❌ Directory not found: ${directory}. Cannot find CSV files.`);
    return [];
  }
  return fs.readdirSync(directory)
    .filter(file => file.toLowerCase().endsWith('.csv'))
    .map(file => ({
      path: path.join(directory, file),
      name: path.basename(file, '.csv'),
      category: getCategoryFromFilename(path.basename(file, '.csv'))
    }));
} // Closes: function findCSVFiles(directory)

function getCategoryFromFilename(filename) {
  const categoryMap = {
    'cpu': 'Processors', 'cpus': 'Processors',
    'processor': 'Processors', 'processors': 'Processors',
    'gpu': 'Graphics Cards', 'gpus': 'Graphics Cards',
    'graphic': 'Graphics Cards', 'graphics': 'Graphics Cards', 'videocard': 'Graphics Cards',
    'motherboard': 'Motherboards', 'motherboards': 'Motherboards', 'mobo': 'Motherboards',
    'memory': 'Memory', 'memories': 'Memory',
    'ram': 'Memory',
    'storage': 'Storage', 'storages': 'Storage',
    'ssd': 'Storage', 'ssds': 'Storage',
    'hdd': 'Storage', 'hdds': 'Storage', 'harddrive': 'Storage',
    'psu': 'Power Supplies', 'psus': 'Power Supplies',
    'power': 'Power Supplies', 'powersupply': 'Power Supplies',
    'case': 'Cases', 'cases': 'Cases', 'chassis': 'Cases',
    'cooling': 'Cooling', 'coolings': 'Cooling',
    'cooler': 'Cooling', 'coolers': 'Cooling',
    'monitor': 'Monitors', 'monitors': 'Monitors',
    'keyboard': 'Peripherals', 'keyboards': 'Peripherals',
    'mouse': 'Peripherals', 'mice': 'Peripherals',
  };
  
  const lowerFilename = filename.toLowerCase().replace(/data/i, '').replace(/_/g, '').replace(/-/g, '').trim();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (lowerFilename.includes(key)) {
      return value;
    }
  }
  console.warn(`⚠️ Could not determine category for filename: ${filename}. Defaulting to 'Uncategorized'.`);
  return 'Uncategorized';
} // Closes: function getCategoryFromFilename(filename)
// --- End of Helper to find CSV files and determine category ---


module.exports = {
  transformHardwareItem,
  createFallbackData,
  processCSVFile,
  processAllCSVFiles,
};

// Optional: For direct testing of this file
if (require.main === module) {
  console.log("Running csvProcessor.js directly for testing processAllCSVFiles...");
  processAllCSVFiles()
    .then(() => console.log('✅ Direct CSV processing test completed.'))
    .catch(err => console.error('❌ Direct CSV processing test failed:', err));
}