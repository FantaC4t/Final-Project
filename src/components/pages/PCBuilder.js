import React, { useState, useEffect, useCallback } from 'react';
import { 
  FiCpu, FiHardDrive, FiServer, FiMonitor, FiGrid, FiBox, 
  FiBattery, FiWind, FiPlus, FiTrash2, FiAlertCircle, 
  FiCheck, FiX, FiActivity, FiDollarSign,
  FiSliders, FiTool, FiShoppingCart, FiSave 
} from 'react-icons/fi';
import { IoGameController } from 'react-icons/io5';
import axios from 'axios';
import '../../styles/pages/pc-builder.css';
import Recommendations from '../Recommendations';
import { Link } from 'react-router-dom';

function PCBuilder() {
  // State for PC components
  const [components, setComponents] = useState({
    cpu: null,
    motherboard: null,
    memory: null,
    gpu: null,
    storage: null,
    psu: null,
    case: null,
    cooling: null,
    monitor: null
  });
  
  // State for component options
  const [options, setOptions] = useState({
    cpu: [],
    motherboard: [],
    memory: [],
    gpu: [],
    storage: [],
    psu: [],
    case: [],
    cooling: [],
    monitor: []
  });
  
  // State for selected category and current selection
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [compatibilityMode, setCompatibilityMode] = useState(true);
  const [compatibilityIssues, setCompatibilityIssues] = useState({});
  const [priceSummary, setPriceSummary] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0
  });
  
  // Helper functions for compatibility checking
  
  // Enhanced socket compatibility check function
  const areSocketsCompatible = (socket1, socket2) => {
    if (!socket1 || !socket2) return true; // If either is missing, assume compatible
    
    // Convert both to strings and lowercase for comparison
    const s1 = String(socket1).toLowerCase();
    const s2 = String(socket2).toLowerCase();
    
    // Direct match
    if (s1 === s2) return true;
    
    // Handle LGA/AM cases - check if one contains the other
    if (s1.includes(s2) || s2.includes(s1)) return true;
    
    // Extract numeric part for partial matching (e.g., "LGA 1151" and "1151")
    const numericPart1 = s1.match(/\d+/g);
    const numericPart2 = s2.match(/\d+/g);
    
    if (numericPart1 && numericPart2) {
      // If both have numeric parts, check if they match
      return numericPart1.some(n1 => numericPart2.includes(n1));
    }
    
    return false;
  };
  
  // Enhanced RAM compatibility check function
  const isRAMCompatible = (motherboardRamType, ramType) => {
    if (!motherboardRamType || !ramType) return true; // If either is missing, assume compatible
    
    const mbRAM = String(motherboardRamType).toLowerCase();
    const ram = String(ramType).toLowerCase();
    
    // Direct match
    if (mbRAM === ram) return true;
    
    // Look for common identifiers: ddr4, ddr5, etc.
    const mbIdentifiers = mbRAM.match(/(ddr\d+)/gi) || [];
    const ramIdentifiers = ram.match(/(ddr\d+)/gi) || [];
    
    return ramIdentifiers.length > 0 && mbIdentifiers.some(id => 
      ramIdentifiers.some(rid => rid.toLowerCase() === id.toLowerCase())
    );
  };
  
  // Function to get value from multiple possible property paths
  const getPropertyValue = (obj, properties) => {
    if (!obj) return null;
    
    for (const prop of properties) {
      const value = prop.split('.').reduce((o, key) => o && o[key] !== undefined ? o[key] : undefined, obj);
      if (value !== undefined) return value;
    }
    
    return null;
  };
  
  // Enhanced function to filter compatible components
  const filterCompatibleComponents = useCallback((category, partsList) => {
    // If compatibility mode is off or no parts to filter, return all
    if (!compatibilityMode || !partsList || partsList.length === 0) return partsList;
    
    let filtered = [...partsList];
    
    // Get current components for compatibility checking
    const currentCPU = components.cpu;
    const currentMotherboard = components.motherboard;
    const currentRAM = components.memory;
    const currentGPU = components.gpu;
    const currentCase = components.case;
    
    switch(category) {
      case 'cpu':
        if (currentMotherboard) {
          // Filter CPUs that match the motherboard socket
          filtered = filtered.filter(cpu => {
            // Get socket info from multiple possible locations
            const cpuSocket = getPropertyValue(cpu, ['socket', 'compatibility.socket', 'specs.socket']);
            const mbSocket = getPropertyValue(currentMotherboard, ['socket', 'compatibility.socket', 'specs.socket']);
            
            return areSocketsCompatible(cpuSocket, mbSocket);
          });
        }
        break;
        
      case 'motherboard':
        if (currentCPU) {
          // Filter motherboards that match the CPU socket
          filtered = filtered.filter(mb => {
            const mbSocket = getPropertyValue(mb, ['socket', 'compatibility.socket', 'specs.socket']);
            const cpuSocket = getPropertyValue(currentCPU, ['socket', 'compatibility.socket', 'specs.socket']);
            
            return areSocketsCompatible(mbSocket, cpuSocket);
          });
        }
        
        if (currentRAM) {
          // Filter motherboards compatible with the selected RAM
          filtered = filtered.filter(mb => {
            const mbRAMType = getPropertyValue(mb, ['memoryType', 'compatibility.memoryType', 'specs.memoryType']);
            const ramType = getPropertyValue(currentRAM, ['type', 'memoryType', 'compatibility.type', 'specs.type']);
            
            return isRAMCompatible(mbRAMType, ramType);
          });
        }
        break;
        
      case 'memory':
        if (currentMotherboard) {
          // Filter RAM compatible with the selected motherboard
          filtered = filtered.filter(ram => {
            const ramType = getPropertyValue(ram, ['type', 'memoryType', 'compatibility.type', 'specs.type']);
            const mbRAMType = getPropertyValue(currentMotherboard, ['memoryType', 'compatibility.memoryType', 'specs.memoryType']);
            
            return isRAMCompatible(mbRAMType, ramType);
          });
        }
        break;
        
      case 'gpu':
        if (currentCase) {
          // Filter GPUs that fit in the case
          filtered = filtered.filter(gpu => {
            const gpuLength = getPropertyValue(gpu, ['length', 'compatibility.length', 'dimensions.length', 'specs.length']);
            const maxGPULength = getPropertyValue(currentCase, ['maxGPULength', 'compatibility.maxGPULength', 'dimensions.maxGPULength', 'specs.maxGPULength']);
            
            // If we can't determine dimensions, assume compatible
            if (!gpuLength || !maxGPULength) return true;
            
            // Convert to numbers and compare
            return Number(gpuLength) <= Number(maxGPULength);
          });
        }
        break;
        
      case 'case':
        if (currentGPU) {
          // Filter cases that can fit the GPU
          filtered = filtered.filter(pc_case => {
            const maxGPULength = getPropertyValue(pc_case, ['maxGPULength', 'compatibility.maxGPULength', 'dimensions.maxGPULength', 'specs.maxGPULength']);
            const gpuLength = getPropertyValue(currentGPU, ['length', 'compatibility.length', 'dimensions.length', 'specs.length']);
            
            // If we can't determine dimensions, assume compatible
            if (!gpuLength || !maxGPULength) return true;
            
            // Convert to numbers and compare
            return Number(maxGPULength) >= Number(gpuLength);
          });
        }
        break;
        
      case 'psu':
        // Calculate estimated power requirements based on components
        let estimatedWattage = 0;
        
        if (currentCPU) {
          const cpuTDP = getPropertyValue(currentCPU, ['tdp', 'compatibility.tdp', 'specs.tdp', 'powerConsumption']);
          estimatedWattage += cpuTDP ? Number(cpuTDP) : 65; // Default TDP
        }
        
        if (currentGPU) {
          const gpuPower = getPropertyValue(currentGPU, ['tdp', 'powerConsumption', 'compatibility.powerRequirement', 'specs.powerConsumption', 'specs.tdp']);
          estimatedWattage += gpuPower ? Number(gpuPower) : 150; // Default GPU power
        }
        
        // Add base system power + 20% buffer
        estimatedWattage = estimatedWattage + 150;
        const recommendedWattage = Math.ceil(estimatedWattage * 1.2);
        
        // Filter PSUs that can handle the estimated wattage
        filtered = filtered.filter(psu => {
          let wattage = getPropertyValue(psu, ['wattage', 'power', 'compatibility.wattage', 'specs.wattage']);
          
          // If wattage is a string, try to extract the number
          if (typeof wattage === 'string') {
            const match = wattage.match(/(\d+)/);
            wattage = match ? Number(match[1]) : 0;
          } else if (typeof wattage === 'number') {
            // Keep it as is
          } else {
            // If no wattage info, check if any spec item contains wattage information
            if (psu.specs && Array.isArray(psu.specs)) {
              for (const spec of psu.specs) {
                if (typeof spec === 'string') {
                  const wattMatch = spec.match(/(\d+)[^\d]*w/i);
                  if (wattMatch) {
                    wattage = Number(wattMatch[1]);
                    break;
                  }
                }
              }
            }
          }
          
          return !wattage || Number(wattage) >= recommendedWattage;
        });
        break;
        
      default:
        // No specific compatibility filtering for other categories
        break;
    }
    
    return filtered;
  }, [components, compatibilityMode]);
  
  // Add these state variables to your PCBuilder component
  const [builderMode, setBuilderMode] = useState('advanced'); // 'simple' or 'advanced'
  const [budget, setBudget] = useState(1000); // Default budget
  const [useCase, setUseCase] = useState('gaming'); // Default use case
  const [gamesList, setGamesList] = useState([]); // Selected games for recommendation
  const [suggestedBuild, setSuggestedBuild] = useState(null); // Suggested build based on requirements
  
  // Load components on mount
  useEffect(() => {
    // In a real app, you would fetch from your backend
    fetchComponentsFromAPI();
  }, []);
  
  // Update price summary whenever components change
  useEffect(() => {
    calculatePriceSummary();
    checkCompatibility();
  }, [components]);
  
  // Add this right after your existing useEffects or update your existing useEffect
useEffect(() => {
  // This will run whenever components change
  if (Object.values(components).some(component => component !== null)) {
    console.log('Running compatibility check');
    checkCompatibility();
  } else {
    // No components selected, clear any compatibility issues
    setCompatibilityIssues([]);
  }
}, [components]);

  // Fetch components from API
  const fetchComponentsFromAPI = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      
      // Check for proper data structure
      if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
        console.error("Invalid API response format:", response.data);
        useMockData();
        return;
      }
      
      const data = response.data.data;
      console.log(`Fetched ${data.length} products from API`);
      
      // Organize products by category
      const categorizedProducts = {
        cpu: data.filter(item => item.category === 'Processors'),
        motherboard: data.filter(item => item.category === 'Motherboards'),
        memory: data.filter(item => item.category === 'Memory'),
        gpu: data.filter(item => item.category === 'Graphics Cards'),
        storage: data.filter(item => item.category === 'Storage'),
        psu: data.filter(item => item.category === 'Power Supplies'),
        case: data.filter(item => item.category === 'Cases'),
        cooling: data.filter(item => item.category === 'Cooling'),
        monitor: data.filter(item => item.category === 'Monitors')
      };
      
      // Log how many products we found in each category
      Object.entries(categorizedProducts).forEach(([category, products]) => {
        console.log(`Found ${products.length} products in category: ${category}`);
      });
      
      setOptions(categorizedProducts);
      
    } catch (error) {
      console.error("Error fetching products:", error);
      // Use mock data if API fails
      useMockData();
    }
  };
  
  // Use mock data if API is not available
  const useMockData = () => {
    const mockData = {
      cpu: [
        { _id: 'c1', name: 'AMD Ryzen 9 5900X', price: 399, specs: ['12 Cores', '24 Threads', '3.7GHz Base', '4.8GHz Boost'], image: '/assets/components/ryzen9.png', socket: 'AM4' },
        { _id: 'c2', name: 'Intel Core i9-12900K', price: 589, specs: ['16 Cores', '24 Threads', '3.2GHz Base', '5.2GHz Boost'], image: '/assets/components/i9.png', socket: 'LGA1700' },
        { _id: 'c3', name: 'AMD Ryzen 7 5800X', price: 299, specs: ['8 Cores', '16 Threads', '3.8GHz Base', '4.7GHz Boost'], image: '/assets/components/ryzen7.png', socket: 'AM4' },
      ],
      motherboard: [
        { _id: 'm1', name: 'ASUS ROG Strix X570-E', price: 329, specs: ['ATX', 'AMD X570', 'DDR4', 'PCIe 4.0'], image: '/assets/components/asus-x570.png', socket: 'AM4', ram: 'DDR4' },
        { _id: 'm2', name: 'MSI MPG Z690 Gaming Edge', price: 289, specs: ['ATX', 'Intel Z690', 'DDR5', 'PCIe 5.0'], image: '/assets/components/msi-z690.png', socket: 'LGA1700', ram: 'DDR5' },
        { _id: 'm3', name: 'Gigabyte B550 AORUS Pro', price: 189, specs: ['ATX', 'AMD B550', 'DDR4', 'PCIe 4.0'], image: '/assets/components/gigabyte-b550.png', socket: 'AM4', ram: 'DDR4' },
      ],
      memory: [
        { _id: 'r1', name: 'Corsair Vengeance RGB Pro 32GB', price: 154, specs: ['32GB (2x16GB)', 'DDR4-3600', 'CL18'], image: '/assets/components/corsair-rgb.png', type: 'DDR4' },
        { _id: 'r2', name: 'G.SKILL Trident Z5 RGB 32GB', price: 229, specs: ['32GB (2x16GB)', 'DDR5-6000', 'CL36'], image: '/assets/components/gskill-z5.png', type: 'DDR5' },
        { _id: 'r3', name: 'Crucial Ballistix 16GB', price: 79, specs: ['16GB (2x8GB)', 'DDR4-3200', 'CL16'], image: '/assets/components/crucial.png', type: 'DDR4' },
      ],
      // Add more mock products for each category
    };
    
    setOptions(mockData);
  };
  
  // Calculate price summary
  const calculatePriceSummary = () => {
    let total = 0;
    let lowestPriceTotal = 0;
    
    // Add up prices of selected components
    Object.values(components).forEach(component => {
      if (component) {
        // Use regular price for total - this would be the first retailer price
        const regularPrice = component.prices && component.prices[0] ? 
                            component.prices[0].price : component.price;
        
        total += regularPrice;
        
        // Use the lowestPrice field from the data
        lowestPriceTotal += component.lowestPrice || regularPrice;
      }
    });
    
    setPriceSummary({
      total: total,
      lowestPrice: lowestPriceTotal,
      savings: total - lowestPriceTotal
    });
  };
  
  // Enhanced compatibility checking function using the improved compatibility data
  const checkCompatibility = () => {
    console.log('Starting compatibility check');
    const issues = [];
    const { cpu, motherboard, memory, gpu, psu, case: pcCase, cooling } = components;
    
    // 1. CPU and Motherboard socket compatibility
    if (cpu && motherboard) {
      // Use compatibility data directly when available
      const cpuSocket = cpu.compatibility?.socket || cpu.socket;
      const moboSocket = motherboard.compatibility?.socket || motherboard.socket;
      
      if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
        issues.push(`CPU socket (${cpuSocket}) is not compatible with motherboard socket (${moboSocket})`);
      }
      
      // Check chipset compatibility when available
      if (cpu.compatibility?.compatibleChipsets && motherboard.compatibility?.chipset) {
        if (!cpu.compatibility.compatibleChipsets.includes(motherboard.compatibility.chipset)) {
          issues.push(`CPU may not be compatible with motherboard chipset (${motherboard.compatibility.chipset})`);
        }
      }
    }
    
    // 2. Memory and Motherboard compatibility
    if (memory && motherboard) {
      // Use compatibility data directly
      const memoryType = memory.compatibility?.type || memory.type;
      const motherboardMemoryType = motherboard.compatibility?.memoryType || motherboard.ram;
      
      if (memoryType && motherboardMemoryType && memoryType !== motherboardMemoryType) {
        issues.push(`Memory type (${memoryType}) is not compatible with motherboard (${motherboardMemoryType})`);
      }
      
      // Check memory speed compatibility
      if (memory.compatibility?.speed && motherboard.compatibility?.maxMemorySpeed) {
        if (memory.compatibility.speed > motherboard.compatibility.maxMemorySpeed) {
          issues.push(`Memory speed (${memory.compatibility.speed}MHz) exceeds motherboard's maximum supported speed (${motherboard.compatibility.maxMemorySpeed}MHz)`);
        }
      }
      
      // Check if motherboard has enough slots
      if (memory.compatibility?.requiredSlots && motherboard.compatibility?.memorySlots) {
        if (memory.compatibility.requiredSlots > motherboard.compatibility.memorySlots) {
          issues.push(`Memory requires ${memory.compatibility.requiredSlots} slots, but motherboard only has ${motherboard.compatibility.memorySlots}`);
        }
      }
    }
    
    // 3. GPU and Case size compatibility
    if (gpu && pcCase) {
      // Use compatibility data directly
      const gpuLength = gpu.compatibility?.length || parseInt(gpu.specs?.find(spec => spec.includes('mm') && spec.includes('Length'))?.match(/\d+/)?.[0] || 0);
      const maxGPULength = pcCase.compatibility?.maxGPULength || parseInt(pcCase.specs?.find(spec => spec.includes('GPU') && spec.includes('mm'))?.match(/\d+/)?.[0] || 0);
      
      if (gpuLength && maxGPULength && gpuLength > maxGPULength) {
        issues.push(`GPU length (${gpuLength}mm) exceeds case maximum GPU length (${maxGPULength}mm)`);
      }
      
      // Check GPU height against case if data available
      if (gpu.compatibility?.height && pcCase.compatibility?.maxGPUHeight) {
        if (gpu.compatibility.height > pcCase.compatibility.maxGPUHeight) {
          issues.push(`GPU height (${gpu.compatibility.height}mm) exceeds case maximum GPU height (${pcCase.compatibility.maxGPUHeight}mm)`);
        }
      }
    }
    
    // 4. Power requirements check
    if (gpu && psu) {
      // Use compatibility data directly
      const recommendedPSU = gpu.compatibility?.recommendedPSU || 
                            parseInt(gpu.specs?.find(spec => spec.includes('PSU') || spec.includes('Watt'))?.match(/\d+/)?.[0] || 0);
      const psuWattage = psu.compatibility?.wattage || 
                        parseInt(psu.specs?.find(spec => spec.includes('W'))?.match(/\d+/)?.[0] || 0);
      
      if (recommendedPSU && psuWattage && psuWattage < recommendedPSU) {
        issues.push(`PSU wattage (${psuWattage}W) is below the recommended wattage for GPU (${recommendedPSU}W)`);
      }
      
      // Check for high-end GPUs needing PCIe 5.0 connectors
      if (gpu.name?.includes('RTX 40') && psu.compatibility && !psu.compatibility.pcie5) {
        issues.push('GPU may require PCIe 5.0 power connectors, but PSU doesn\'t support them');
      }
      
      // Calculate estimated system power
      let estimatedPower = (cpu?.compatibility?.tdp || 125) + (gpu.compatibility?.powerRequirement || 300);
      if (estimatedPower * 1.1 > psuWattage) { // Adding 10% headroom
        issues.push(`Estimated system power (${estimatedPower}W) with 10% headroom exceeds PSU capacity (${psuWattage}W)`);
      }
    }
    
    // 5. CPU Cooler compatibility
    if (cpu && cooling) {
      // Check socket compatibility directly
      const cpuSocket = cpu.compatibility?.socket || cpu.socket;
      const supportedSockets = cooling.compatibility?.supportedSockets || [];
      
      if (cpuSocket && supportedSockets.length > 0 && !supportedSockets.includes(cpuSocket)) {
        issues.push(`CPU cooler is not compatible with CPU socket (${cpuSocket})`);
      }
      
      // TDP check
      const cpuTDP = cpu.compatibility?.tdp || parseInt(cpu.specs?.find(spec => spec.includes('TDP'))?.match(/\d+/)?.[0] || 0);
      const coolerTDP = cooling.compatibility?.tdpSupport || parseInt(cooling.specs?.find(spec => spec.includes('TDP'))?.match(/\d+/)?.[0] || 0);
      
      if (cpuTDP && coolerTDP && cpuTDP > coolerTDP) {
        issues.push(`CPU TDP (${cpuTDP}W) exceeds cooler maximum TDP support (${coolerTDP}W)`);
      }
      
      // Check cooler height with case
      if (cooling.compatibility?.height && pcCase?.compatibility?.maxCPUCoolerHeight) {
        if (cooling.compatibility.height > pcCase.compatibility.maxCPUCoolerHeight) {
          issues.push(`CPU cooler height (${cooling.compatibility.height}mm) exceeds case maximum cooler height (${pcCase.compatibility.maxCPUCoolerHeight}mm)`);
        }
      }
      
      // RAM clearance check
      if (cooling.compatibility?.ramClearance && memory?.compatibility?.height) {
        if (cooling.compatibility.ramClearance < memory.compatibility.height) {
          issues.push(`RAM height (${memory.compatibility.height}mm) exceeds CPU cooler RAM clearance (${cooling.compatibility.ramClearance}mm)`);
        }
      }
    }
    
    // 6. Motherboard and Case form factor compatibility
    if (motherboard && pcCase) {
      const motherboardFF = motherboard.compatibility?.formFactor || 
                           motherboard.specs?.find(spec => ['ATX', 'Micro-ATX', 'Mini-ITX', 'E-ATX'].some(ff => spec.includes(ff)));
      const supportedFormFactors = pcCase.compatibility?.supportedMotherboards || [];
      
      if (motherboardFF && supportedFormFactors.length > 0) {
        // Extract just the form factor name
        let formFactor = "";
        if (typeof motherboardFF === 'string') {
          if (motherboardFF.includes('ATX')) {
            formFactor = motherboardFF.includes('Micro') ? 'Micro-ATX' : 
                         motherboardFF.includes('Mini') ? 'Mini-ITX' : 
                         motherboardFF.includes('E-ATX') ? 'E-ATX' : 'ATX';
          }
        } else {
          formFactor = 'ATX'; // Default if we can't determine
        }
        
        if (formFactor && !supportedFormFactors.includes(formFactor)) {
          issues.push(`Case does not support ${formFactor} motherboards`);
        }
      }
    }
    
    // 7. Radiator compatibility with case (for liquid cooling)
    if (cooling && pcCase && cooling.compatibility?.type === 'Liquid') {
      const radiatorSize = cooling.compatibility?.radiatorSize || parseInt(cooling.specs?.find(spec => spec.includes('mm') && spec.includes('Radiator'))?.match(/\d+/)?.[0] || 0);
      
      if (radiatorSize && pcCase.compatibility?.radiatorSupport) {
        const supportString = `${radiatorSize}mm`;
        const supports = Object.values(pcCase.compatibility.radiatorSupport).some(
          val => val && val.includes(supportString)
        );
        
        if (!supports) {
          issues.push(`Case may not support ${radiatorSize}mm radiator`);
        }
      }
    }
    
    // 8. Storage compatibility checks
    if (motherboard && components.storage) {
      const storage = components.storage;
      const storageInterface = storage.compatibility?.interface || 
                              storage.specs?.find(spec => spec.includes('PCIe') || spec.includes('SATA'))?.trim();
      
      if (storageInterface?.includes('PCIe 4.0') && 
          motherboard.specs && !motherboard.specs.some(spec => spec.includes('PCIe 4.0') || spec.includes('PCIe 5.0'))) {
        issues.push('Storage drive requires PCIe 4.0 support, but motherboard may not support it');
      }
      
      // M.2 slots check
      if (storage.compatibility?.formFactor === 'M.2' && motherboard.compatibility?.m2Slots === 0) {
        issues.push('Storage is M.2 format but motherboard has no M.2 slots');
      }
    }
    
    setCompatibilityIssues(issues);
    console.log('Compatibility issues found:', issues);
  };
  
  // Handle component selection
  const selectComponent = (category) => {
    setSelectedCategory(category);
    setCurrentSelection(components[category]);
  };
  
  // Add component to build - enhanced to handle API data structure
const addToBuild = (component) => {
  // Map API prices to price property for consistent access when API data is used
  let componentToAdd = {...component};
  
  // If component has prices array but no price property, set price to the lowest price
  if (componentToAdd.prices && componentToAdd.prices.length > 0 && !componentToAdd.price) {
    componentToAdd.price = componentToAdd.lowestPrice || componentToAdd.prices[0].price;
  }
  
  // For components that need processing of compatibility data
  if (selectedCategory === 'motherboard') {
    // Ensure RAM type is accessible for compatibility checks
    if (componentToAdd.compatibility && componentToAdd.compatibility.memoryType && !componentToAdd.ram) {
      componentToAdd.ram = componentToAdd.compatibility.memoryType;
    }
  }
  
  else if (selectedCategory === 'memory') {
    // Ensure memory type is accessible for compatibility checks
    if (componentToAdd.compatibility && componentToAdd.compatibility.type && !componentToAdd.type) {
      componentToAdd.type = componentToAdd.compatibility.type;
    }
  }
  
  else if (selectedCategory === 'cpu' || selectedCategory === 'gpu') {
    // Make sure socket or relevant compatibility info is accessible
    if (componentToAdd.compatibility && componentToAdd.compatibility.socket && !componentToAdd.socket) {
      componentToAdd.socket = componentToAdd.compatibility.socket;
    }
  }
  
  setComponents(prev => ({
    ...prev,
    [selectedCategory]: componentToAdd
  }));
  
  setSelectedCategory(null);
};
  
  // Remove component from build
  const removeComponent = (category) => {
    setComponents(prev => ({
      ...prev,
      [category]: null
    }));
  };
  
  // Get icon for component category
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cpu': return <FiCpu size={24} />;
      case 'motherboard': return <FiServer size={24} />;
      case 'memory': return <FiServer size={24} />;
      case 'gpu': return <FiGrid size={24} />;
      case 'storage': return <FiHardDrive size={24} />;
      case 'psu': return <FiBattery size={24} />;
      case 'case': return <FiBox size={24} />;
      case 'cooling': return <FiWind size={24} />;
      case 'monitor': return <FiMonitor size={24} />;
      default: return <FiPlus size={24} />;
    }
  };
  
  // Update the getCompatibilityClass function to properly check for compatibility issues
const getCompatibilityClass = (category) => {
  if (!compatibilityIssues || !compatibilityIssues[category]) {
    return "component-status-neutral";
  }
  
  if (compatibilityIssues[category].length > 0) {
    return "component-status-incompatible";
  }
  
  return "component-status-compatible";
};
  
  // Helper function to get key compatibility features for display
const getCompatibilityFeatures = (component, category) => {
  if (!component || !component.compatibility) return [];
  
  const features = [];
  
  switch (category) {
    case 'cpu':
      if (component.compatibility.socket) features.push(`Socket: ${component.compatibility.socket}`);
      if (component.compatibility.tdp) features.push(`TDP: ${component.compatibility.tdp}W`);
      break;
    case 'motherboard':
      if (component.compatibility.socket) features.push(`Socket: ${component.compatibility.socket}`);
      if (component.compatibility.memoryType) features.push(`RAM: ${component.compatibility.memoryType}`);
      if (component.compatibility.formFactor) features.push(`Form Factor: ${component.compatibility.formFactor}`);
      break;
    case 'memory':
      if (component.compatibility.type) features.push(`Type: ${component.compatibility.type}`);
      if (component.compatibility.speed) features.push(`Speed: ${component.compatibility.speed}MHz`);
      break;
    case 'gpu':
      if (component.compatibility.recommendedPSU) features.push(`Needs: ${component.compatibility.recommendedPSU}W PSU`);
      if (component.compatibility.length) features.push(`Length: ${component.compatibility.length}mm`);
      break;
    case 'psu':
      if (component.compatibility.wattage) features.push(`Wattage: ${component.compatibility.wattage}W`);
      if (component.compatibility.efficiency) features.push(`${component.compatibility.efficiency}`);
      break;
    case 'case':
      if (component.compatibility.maxGPULength) features.push(`Max GPU: ${component.compatibility.maxGPULength}mm`);
      if (component.compatibility.maxCPUCoolerHeight) features.push(`Max Cooler: ${component.compatibility.maxCPUCoolerHeight}mm`);
      break;
    case 'cooling':
      if (component.compatibility.type) features.push(`Type: ${component.compatibility.type}`);
      if (component.compatibility.tdpSupport) features.push(`TDP Support: ${component.compatibility.tdpSupport}W`);
      break;
    default:
      break;
  }
  
  return features;
};

// Add this function to generate PC build based on requirements
const generateSuggestedBuild = () => {
  console.log(`Generating build for ${useCase} with budget $${budget}`);
  
  // Filter components that fit within the budget
  let remainingBudget = budget;
  let build = {
    cpu: null,
    motherboard: null,
    memory: null,
    gpu: null,
    storage: null,
    psu: null,
    case: null,
    cooling: null
  };
  
  // Different allocation strategies based on use case
  let allocation = {};
  
  switch (useCase) {
    case 'gaming':
      allocation = {
        gpu: 0.35, // 35% of budget
        cpu: 0.20, // 20% of budget
        motherboard: 0.12,
        memory: 0.10,
        storage: 0.08,
        psu: 0.07,
        case: 0.05,
        cooling: 0.03
      };
      break;
    case 'productivity':
      allocation = {
        cpu: 0.30, // 30% of budget
        memory: 0.20, // 20% of budget
        gpu: 0.15,
        storage: 0.12,
        motherboard: 0.10,
        psu: 0.06,
        case: 0.04,
        cooling: 0.03
      };
      break;
    case 'streaming':
      allocation = {
        cpu: 0.25,
        gpu: 0.25,
        memory: 0.15,
        storage: 0.12,
        motherboard: 0.10,
        psu: 0.06,
        case: 0.04,
        cooling: 0.03
      };
      break;
    case 'office':
      allocation = {
        cpu: 0.25,
        memory: 0.20,
        storage: 0.20,
        motherboard: 0.15,
        gpu: 0.05,
        psu: 0.06,
        case: 0.05,
        cooling: 0.04
      };
      break;
    default:
      allocation = {
        cpu: 0.25,
        gpu: 0.25,
        motherboard: 0.12,
        memory: 0.12,
        storage: 0.10,
        psu: 0.07,
        case: 0.05,
        cooling: 0.04
      };
  }
  
  // Select components in priority order
  const componentPriority = Object.keys(allocation).sort((a, b) => allocation[b] - allocation[a]);
  
  // Function to find the best component in a category within a budget
  const findBestComponent = (category, maxPrice) => {
    if (!options[category] || options[category].length === 0) return null;
    
    // Filter components by price
    const affordableComponents = options[category].filter(
      comp => (comp.lowestPrice || comp.price) <= maxPrice
    );
    
    if (affordableComponents.length === 0) return null;
    
    // Sort by price descending to get the best within budget
    affordableComponents.sort((a, b) => 
      (b.lowestPrice || b.price) - (a.lowestPrice || a.price)
    );
    
    // For gaming builds, prioritize certain features
    if (useCase === 'gaming' && category === 'gpu') {
      // Prioritize GPUs with better gaming performance
      const gamingGPUs = affordableComponents.filter(
        gpu => gpu.name.includes('RTX') || gpu.name.includes('RX')
      );
      
      if (gamingGPUs.length > 0) {
        return gamingGPUs[0]; // Use best gaming GPU that fits budget
      }
    }
    
    // For productivity, prioritize CPUs with more cores
    if (useCase === 'productivity' && category === 'cpu') {
      // Find CPUs with high core counts
      const highCoreCPUs = affordableComponents.filter(cpu => {
        const coreSpec = cpu.specs?.find(spec => spec.includes('Cores'));
        if (coreSpec) {
          const coreCount = parseInt(coreSpec.match(/\d+/)?.[0] || 0);
          return coreCount >= 6; // Prioritize 6+ core CPUs
        }
        return false;
      });
      
      if (highCoreCPUs.length > 0) {
        return highCoreCPUs[0];
      }
    }
    
    // Return the best component in budget
    return affordableComponents[0];
  };
  
  // Allocate budget and select components
  for (const category of componentPriority) {
    const categoryBudget = budget * allocation[category];
    const component = findBestComponent(category, categoryBudget);
    
    if (component) {
      build[category] = component;
      remainingBudget -= (component.lowestPrice || component.price);
    }
  }
  
  // Check and adjust for compatibility
  const tempComponents = { ...build };
  setComponents(tempComponents);
  checkCompatibility(); // Will update compatibilityIssues
  
  // If compatibility issues, try to fix them
  if (compatibilityIssues.length > 0) {
    // This would be expanded in a real implementation to fix incompatibilities
    console.log("Compatibility issues found, additional adjustments needed");
  }
  
  setSuggestedBuild(build);
  
  return build;
};

const checkCompatibilityIssues = useCallback(() => {
  const issues = {};
  
  // CPU and Motherboard compatibility
  if (components.cpu && components.motherboard) {
    const cpuSocket = getPropertyValue(components.cpu, ['socket', 'compatibility.socket', 'specs.socket']);
    const mbSocket = getPropertyValue(components.motherboard, ['socket', 'compatibility.socket', 'specs.socket']);
    
    if (cpuSocket && mbSocket && !areSocketsCompatible(cpuSocket, mbSocket)) {
      issues.cpu = issues.cpu || [];
      issues.motherboard = issues.motherboard || [];
      
      issues.cpu.push({
        message: `CPU socket ${cpuSocket} may not be compatible with motherboard socket ${mbSocket}`,
        severity: 'high'
      });
      
      issues.motherboard.push({
        message: `Motherboard socket ${mbSocket} may not be compatible with CPU socket ${cpuSocket}`,
        severity: 'high'
      });
    }
  }
  
  // Memory and Motherboard compatibility
  if (components.memory && components.motherboard) {
    const ramType = getPropertyValue(components.memory, ['type', 'memoryType', 'compatibility.type', 'specs.type']);
    const mbRAMType = getPropertyValue(components.motherboard, ['memoryType', 'compatibility.memoryType', 'specs.memoryType']);
    
    if (ramType && mbRAMType && !isRAMCompatible(mbRAMType, ramType)) {
      issues.memory = issues.memory || [];
      issues.motherboard = issues.motherboard || [];
      
      issues.memory.push({
        message: `Memory type ${ramType} may not be compatible with motherboard memory type ${mbRAMType}`,
        severity: 'high'
      });
      
      issues.motherboard.push({
        message: `Motherboard memory type ${mbRAMType} may not be compatible with memory type ${ramType}`,
        severity: 'high'
      });
    }
  }
  
  // GPU and Case compatibility
  if (components.gpu && components.case) {
    const gpuLength = getPropertyValue(components.gpu, ['length', 'compatibility.length', 'dimensions.length', 'specs.length']);
    const maxGPULength = getPropertyValue(components.case, ['maxGPULength', 'compatibility.maxGPULength', 'dimensions.maxGPULength', 'specs.maxGPULength']);
    
    if (gpuLength && maxGPULength && Number(gpuLength) > Number(maxGPULength)) {
      issues.gpu = issues.gpu || [];
      issues.case = issues.case || [];
      
      issues.gpu.push({
        message: `GPU length (${gpuLength}mm) exceeds case's maximum GPU length (${maxGPULength}mm)`,
        severity: 'high'
      });
      
      issues.case.push({
        message: `Case maximum GPU length (${maxGPULength}mm) is less than GPU length (${gpuLength}mm)`,
        severity: 'high'
      });
    }
  }
  
  // Power Supply adequacy
  if ((components.cpu || components.gpu) && components.psu) {
    let estimatedWattage = 0;
    
    if (components.cpu) {
      const cpuTDP = getPropertyValue(components.cpu, ['tdp', 'compatibility.tdp', 'specs.tdp', 'powerConsumption']);
      estimatedWattage += cpuTDP ? Number(cpuTDP) : 65;
    }
    
    if (components.gpu) {
      const gpuPower = getPropertyValue(components.gpu, ['tdp', 'powerConsumption', 'compatibility.powerRequirement', 'specs.powerConsumption', 'specs.tdp']);
      estimatedWattage += gpuPower ? Number(gpuPower) : 150;
    }
    
    // Add base system power + buffer
    estimatedWattage += 150;
    const recommendedWattage = Math.ceil(estimatedWattage * 1.2);
    
    const psuWattage = getPropertyValue(components.psu, ['wattage', 'power', 'compatibility.wattage', 'specs.wattage']);
    let wattageValue = 0;
    
    if (typeof psuWattage === 'string') {
      const match = psuWattage.match(/(\d+)/);
      wattageValue = match ? Number(match[1]) : 0;
    } else if (typeof psuWattage === 'number') {
      wattageValue = psuWattage;
    }
    
    if (wattageValue < recommendedWattage) {
      issues.psu = issues.psu || [];
      
      issues.psu.push({
        message: `Power supply (${wattageValue}W) may be insufficient for system needs (recommended ${recommendedWattage}W)`,
        severity: 'medium'
      });
    }
  }
  
  setCompatibilityIssues(issues);
}, [components, getPropertyValue, areSocketsCompatible, isRAMCompatible]);

// Call the checkCompatibilityIssues function whenever components change
useEffect(() => {
  checkCompatibilityIssues();
}, [components, checkCompatibilityIssues]);

// Add this function to display compatibility issues
const renderCompatibilityIssues = (category) => {
  if (!compatibilityIssues[category] || compatibilityIssues[category].length === 0) {
    return null;
  }
  
  return (
    <div className="compatibility-issues">
      {compatibilityIssues[category].map((issue, index) => (
        <div key={index} className={`compatibility-issue issue-${issue.severity}`}>
          <FiAlertCircle className="issue-icon" />
          <span className="issue-message">{issue.message}</span>
        </div>
      ))}
    </div>
  );
};

// Near line ~1188, replace your renderPriceSummary function with this version:
const renderPriceSummary = () => {
  // Simple helper function defined inline to avoid external dependencies
  const formatPrice = (price) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '$0.00';
    }
    return '$' + price.toFixed(2);
  };
  
  return (
    <div className="price-summary">
      <h3>Price Summary</h3>
      <div className="price-breakdown">
        <div className="price-row">
          <span>Subtotal</span>
          <span>{formatPrice(priceSummary.subtotal)}</span>
        </div>
        <div className="price-row">
          <span>Tax (8%)</span>
          <span>{formatPrice(priceSummary.tax)}</span>
        </div>
        <div className="price-row">
          <span>Shipping</span>
          <span>
            {priceSummary.shipping === 0 
              ? 'Free' 
              : formatPrice(priceSummary.shipping)}
          </span>
        </div>
        <div className="price-row total">
          <span>Total</span>
          <span>{formatPrice(priceSummary.total)}</span>
        </div>
      </div>
    </div>
  );
};

  return (
  <div className="pyro-page pc-builder-page">
    <div className="page-header">
      <h1>Custom PC Builder</h1>
      <p>Select compatible components to build your dream PC</p>
      
      {/* Mode toggle */}
      <div className="builder-mode-toggle">
        <button 
          className={`mode-button ${builderMode === 'simple' ? 'active' : ''}`}
          onClick={() => setBuilderMode('simple')}
        >
          <FiActivity />
          <span>Simple Mode</span>
        </button>
        <button 
          className={`mode-button ${builderMode === 'advanced' ? 'active' : ''}`}
          onClick={() => setBuilderMode('advanced')}
        >
          <FiSliders />
          <span>Advanced Mode</span>
        </button>
      </div>
    </div>
    
    {builderMode === 'simple' ? (
      // Simple Mode UI
      <div className="simple-builder-container">
        <div className="builder-requirements">
          <h2>Build Requirements</h2>
          
          <div className="requirement-section">
            <h3><FiDollarSign /> Budget</h3>
            <div className="budget-slider">
              <input 
                type="range" 
                min="500" 
                max="3000" 
                step="100" 
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
              />
              <div className="budget-display">${budget}</div>
            </div>
            <div className="budget-presets">
              <button onClick={() => setBudget(800)}>Budget<br/>$800</button>
              <button onClick={() => setBudget(1200)}>Mid-range<br/>$1200</button>
              <button onClick={() => setBudget(2000)}>High-end<br/>$2000</button>
              <button onClick={() => setBudget(3000)}>Enthusiast<br/>$3000</button>
            </div>
          </div>
          
          <div className="requirement-section">
            <h3><FiTool /> Use Case</h3>
            <div className="use-case-options">
              <button 
                className={useCase === 'gaming' ? 'active' : ''}
                onClick={() => setUseCase('gaming')}
              >
                <IoGameController />
                <span>Gaming</span>
              </button>
              <button 
                className={useCase === 'productivity' ? 'active' : ''}
                onClick={() => setUseCase('productivity')}
              >
                <FiActivity />
                <span>Productivity</span>
              </button>
              <button 
                className={useCase === 'streaming' ? 'active' : ''}
                onClick={() => setUseCase('streaming')}
              >
                <FiMonitor />
                <span>Streaming</span>
              </button>
              <button 
                className={useCase === 'office' ? 'active' : ''}
                onClick={() => setUseCase('office')}
              >
                <FiTool />
                <span>Office Work</span>
              </button>
            </div>
          </div>
          
          {useCase === 'gaming' && (
            <div className="requirement-section">
              <h3><IoGameController /> Games You'll Play</h3>
              <div className="games-selector">
                <div className="popular-games">
                  {['Cyberpunk 2077', 'Call of Duty', 'Fortnite', 'Minecraft', 'CSGO', 'Apex Legends'].map(game => (
                    <button 
                      key={game}
                      className={gamesList.includes(game) ? 'active' : ''}
                      onClick={() => {
                        if (gamesList.includes(game)) {
                          setGamesList(gamesList.filter(g => g !== game));
                        } else {
                          setGamesList([...gamesList, game]);
                        }
                      }}
                    >
                      {game}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          <button 
            className="pyro-button primary generate-build"
            onClick={generateSuggestedBuild}
          >
            Generate PC Build
          </button>
        </div>
        
        {suggestedBuild && (
          <div className="suggested-build">
            <h2>Recommended Build</h2>
            
            <div className="build-overview">
              <div className="build-score">
                <div className="score-circle">
                  <div className="score-value">
                    {useCase === 'gaming' ? '8.4' : 
                     useCase === 'productivity' ? '9.1' : 
                     useCase === 'streaming' ? '8.7' : '9.4'}
                  </div>
                  <div className="score-label">Build<br/>Score</div>
                </div>
                
                <div className="score-details">
                  <div className="score-detail">
                    <span>Performance:</span>
                    <div className="score-bar">
                      <div 
                        className="score-bar-fill" 
                        style={{width: `${budget > 1500 ? 90 : budget > 1000 ? 75 : 60}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="score-detail">
                    <span>Value:</span>
                    <div className="score-bar">
                      <div 
                        className="score-bar-fill" 
                        style={{width: `${budget > 2500 ? 70 : budget > 1500 ? 85 : 90}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="score-detail">
                    <span>Compatibility:</span>
                    <div className="score-bar">
                      <div 
                        className="score-bar-fill" 
                        style={{width: `${compatibilityIssues.length === 0 ? 100 : 50}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="build-summary">
                <div className="build-price">
                  <span>Total Cost:</span>
                  <span className="price">
                    ${Object.values(suggestedBuild)
                        .filter(Boolean)
                        .reduce((sum, comp) => sum + (comp.lowestPrice || comp.price), 0)
                        .toFixed(2)}
                  </span>
                </div>
                
                <div className="performance-estimate">
                  {useCase === 'gaming' && gamesList.length > 0 && (
                    <div className="gaming-performance">
                      <h4>Estimated Performance</h4>
                      {gamesList.map(game => (
                        <div key={game} className="game-performance">
                          <span>{game}</span>
                          <span className="fps">
                            {budget > 2000 ? '120+ FPS' : 
                             budget > 1500 ? '90+ FPS' : 
                             budget > 1000 ? '60+ FPS' : '40+ FPS'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {useCase === 'productivity' && (
                    <div className="productivity-estimate">
                      <h4>Workload Capability</h4>
                      <div className="workload-item">
                        <span>Video Editing</span>
                        <span className="capability">
                          {budget > 2000 ? 'Excellent' : 
                           budget > 1500 ? 'Very Good' : 
                           budget > 1000 ? 'Good' : 'Basic'}
                        </span>
                      </div>
                      <div className="workload-item">
                        <span>3D Rendering</span>
                        <span className="capability">
                          {budget > 2000 ? 'Excellent' : 
                           budget > 1500 ? 'Good' : 
                           budget > 1000 ? 'Moderate' : 'Basic'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="suggested-components">
              {Object.entries(suggestedBuild).map(([category, component]) => 
                component && (
                  <div key={category} className="suggested-component">
                    <div className="component-icon">
                      {getCategoryIcon(category)}
                    </div>
                    <div className="component-info">
                      <div className="component-name">
                        <span className="category">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                        <span className="selected-name">{component.name}</span>
                      </div>
                      <div className="component-price">
                        ${component.lowestPrice || component.price}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
            
            <div className="suggested-actions">
              <button 
                className="pyro-button primary"
                onClick={() => {
                  // Transfer the suggested build to the advanced mode
                  setComponents(suggestedBuild);
                  setBuilderMode('advanced');
                }}
              >
                Customize in Advanced Mode
              </button>
              <button className="pyro-button secondary">
                Save Build
              </button>
            </div>
          </div>
        )}
      </div>
    ) : (
      // Advanced Mode UI (your existing UI)
      <div className="pc-builder-container">
        <div className="component-selection">
          <h2>Components</h2>
          
          <div className="component-list">
            {/* Your existing component list code */}
            {Object.keys(components).map((category) => (
              <div 
                key={category} 
                className={`component-item ${components[category] ? 'selected' : ''}`}
                onClick={() => selectComponent(category)}
              >
                <div className="component-icon">
                  {getCategoryIcon(category)}
                </div>
                
                <div className="component-details">
                  <div className="component-name">
                    <span className="category">{category.charAt(0).toUpperCase() + category.slice(1)}</span>
                    {components[category] && (
                      <span className="selected-name">{components[category].name}</span>
                    )}
                  </div>
                  
                  {components[category] ? (
                    <>
                      <div className="component-price">
                        ${components[category].price || components[category].lowestPrice || 0}
                      </div>
                      <div className="component-compatibility-features">
                        {getCompatibilityFeatures(components[category], category).map((feature, idx) => (
                          <span key={idx} className="compat-feature">{feature}</span>
                        ))}
                      </div>
                      {renderCompatibilityIssues(category)}
                    </>
                  ) : (
                    <div className="select-prompt">
                      <span>Select {category}</span>
                      <FiPlus size={18} />
                    </div>
                  )}
                </div>
                
                {components[category] && (
                  <button 
                    className="remove-component"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComponent(category);
                    }}
                  >
                    <FiTrash2 size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="build-summary">
          {renderPriceSummary()}
          
          <div className="actions">
            <button className="pyro-button primary">
              <FiShoppingCart className="button-icon" /> Checkout
            </button>
            <button className="pyro-button secondary">
              <FiSave className="button-icon" /> Save Build
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* Component selection modal - keep this unchanged */}
    {selectedCategory && (
      <div className="component-modal-overlay" onClick={() => setSelectedCategory(null)}>
        {/* Your existing modal code */}
        <div className="component-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Select {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}</h2>
            <button className="close-modal" onClick={() => setSelectedCategory(null)}>
              <FiX />
            </button>
          </div>
          
          <div className="component-search">
            <input 
              type="text" 
              placeholder={`Search for ${selectedCategory}...`}
              className="component-search-input"
            />
          </div>
          
          <div className="component-options">
            {options[selectedCategory] && options[selectedCategory].length > 0 ? (
              options[selectedCategory].map(option => (
                <div 
                  key={option._id} 
                  className={`component-option ${currentSelection && currentSelection._id === option._id ? 'selected' : ''}`}
                  onClick={() => addToBuild(option)}
                >
                  <div className="option-image">
                    <img src={option.image || `/assets/placeholder-${selectedCategory}.png`} alt={option.name} />
                  </div>
                  
                  <div className="option-details">
                    <h3>{option.name}</h3>
                    <div className="option-specs">
                      {option.specs && option.specs.map((spec, index) => (
                        <span key={index} className="spec-tag">{spec}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="option-price">
                    ${option.price || option.lowestPrice || (option.prices && option.prices[0] ? option.prices[0].price : 0)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-options">
                <p>No {selectedCategory} options available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    
    {/* Add recommendations at the bottom of the builder page */}
    <div className="builder-section recommendations-section">
      <Recommendations 
        userId={null}  // Set to null since userId isn't needed yet
        currentBuild={components} 
      />
      <div className="see-all-recommendations">
        <Link to="/recommendations" className="see-all-link">
          See all recommendations →
        </Link>
      </div>
    </div>
  </div>
);
}

export default PCBuilder;