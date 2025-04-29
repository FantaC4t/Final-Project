import React, { useState, useEffect } from 'react';
import { 
  FiCpu, FiHardDrive, FiServer, FiMonitor, FiGrid, FiBox, 
  FiBattery, FiWind, FiPlus, FiTrash2, FiAlertCircle, 
  FiCheck, FiX, FiActivity, FiDollarSign,
  FiSliders, FiTool 
} from 'react-icons/fi';
import { IoGameController } from 'react-icons/io5'; // or use any other icon set
import axios from 'axios';
import '../../styles/pages/pc-builder.css';

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
  
  // State for price summary
  const [priceSummary, setPriceSummary] = useState({
    total: 0,
    lowestPrice: 0,
    savings: 0
  });
  
  // State for compatibility issues
  const [compatibilityIssues, setCompatibilityIssues] = useState([]);
  
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
const getCompatibilityClass = () => {
  // Check if we have any compatibility issues
  if (compatibilityIssues && compatibilityIssues.length > 0) {
    console.log('Incompatible: ', compatibilityIssues); // Add logging to debug
    return 'incompatible';
  }
  
  // Check if any component is selected
  const hasComponents = Object.values(components).some(component => component !== null);
  
  if (hasComponents) {
    return 'compatible';
  }
  
  return '';
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
          <div className="compatibility-status">
            <h3>Build Status</h3>
            <div className={`status-indicator ${getCompatibilityClass()}`}>
              {compatibilityIssues.length > 0 ? (
                <>
                  <FiAlertCircle size={18} />
                  <span>Compatibility Issues Detected</span>
                </>
              ) : Object.values(components).some(component => component !== null) ? (
                <>
                  <FiCheck size={18} />
                  <span>Compatible Build</span>
                </>
              ) : (
                <span>Start by selecting components</span>
              )}
            </div>
            
            {compatibilityIssues.length > 0 && (
              <div className="compatibility-issues">
                {compatibilityIssues.map((issue, index) => (
                  <div key={index} className="issue">
                    <FiAlertCircle size={16} />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="price-summary">
            <h3>Price Summary</h3>
            <div className="price-breakdown">
              <div className="price-row">
                <span>Total:</span>
                <span className="price">${priceSummary.total}</span>
              </div>
              <div className="price-row">
                <span>Lowest Prices:</span>
                <span className="price best">${priceSummary.lowestPrice}</span>
              </div>
              <div className="price-row savings">
                <span>Potential Savings:</span>
                <span className="price savings">${priceSummary.savings}</span>
              </div>
            </div>
          </div>
          
          <div className="action-buttons">
            <button 
              className="pyro-button primary"
              disabled={Object.values(components).every(comp => comp === null) || compatibilityIssues.length > 0}
            >
              Save Build
            </button>
            <button className="pyro-button secondary">
              Share Build
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
  </div>
);
}

export default PCBuilder;