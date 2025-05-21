import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  FiCpu, FiServer, FiGrid, FiHardDrive, FiBattery, FiBox, FiWind, FiMonitor, FiPlus, FiTrash2, FiX, FiDollarSign, FiTool, FiActivity, FiSliders, FiShoppingCart, FiSave, FiAlertCircle
} from 'react-icons/fi';
import { IoGameController } from "react-icons/io5";
import Recommendations from './Recommendations'; // Assuming this path is correct
import '/src/styles/pages/pc-builder.css'; // Assuming you have styles

import {
  getPropertyValue as utilGetPropertyValue,
  areSocketsCompatible as utilAreSocketsCompatible,
  isRAMCompatible as utilIsRAMCompatible,
  calculateAllCompatibilityIssues,
  findBestComponentUtil
} from './pcBuilderUtils';

function PCBuilder() {
  // State for PC components
  const [components, setComponents] = useState({
    cpu: null, motherboard: null, memory: null, gpu: null, storage: null, psu: null, case: null, cooling: null, monitor: null
  });

  // State for component options
  const [options, setOptions] = useState({
    cpu: [], motherboard: [], memory: [], gpu: [], storage: [], psu: [], case: [], cooling: [], monitor: []
  });

  // State for selected category and current selection
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentSelection, setCurrentSelection] = useState(null); // Used for highlighting in modal, can be removed if not used
  // const [modalOpen, setModalOpen] = useState(false); // Not used in provided JSX, selectedCategory handles modal visibility
  const [isLoading, setIsLoading] = useState(false); // For loading states
  const [compatibilityMode, setCompatibilityMode] = useState(true); // For modal filtering
  
  const [compatibilityIssues, setCompatibilityIssues] = useState({ // Initialized as an object
    cpu: [], motherboard: [], memory: [], gpu: [], storage: [], psu: [], case: [], cooling: [], monitor: []
  });

  const [priceSummary, setPriceSummary] = useState({
    subtotal: 0, tax: 0, shipping: 0, total: 0, lowestPrice: 0, savings: 0
  });

  // State variables for Simple Mode
  const [builderMode, setBuilderMode] = useState('advanced');
  const [budget, setBudget] = useState(1000);
  const [useCase, setUseCase] = useState('gaming');
  const [gamesList, setGamesList] = useState([]);
  const [suggestedBuild, setSuggestedBuild] = useState(null);

  // --- Core Logic Wrappers using Utility Functions ---

  // Wrapper for the main compatibility checking utility
  const checkCompatibilityIssues = useCallback(() => {
    return calculateAllCompatibilityIssues(
      components,
      utilGetPropertyValue,
      utilAreSocketsCompatible,
      utilIsRAMCompatible
    );
  }, [components]); // Depends only on components as utils are stable

  // Wrapper for finding the best component utility
  const findBestComponent = (category, maxPrice, currentBuild = {}) => {
    const availableOptions = options[category] || [];
    return findBestComponentUtil(
      category,
      maxPrice,
      availableOptions,
      currentBuild,
      utilGetPropertyValue,
      utilAreSocketsCompatible
    );
  };

  // --- useEffect Hooks ---

  // Load components on mount
  useEffect(() => {
    fetchComponentsFromAPI();
  }, []);

  // Update price summary whenever components change
  useEffect(() => {
    calculatePriceSummary();
  }, [components]);

  // Central useEffect for updating compatibility issues
  useEffect(() => {
    if (Object.values(components).every(component => component === null)) {
      // Clear issues if no components are selected
      if (Object.keys(compatibilityIssues).some(key => compatibilityIssues[key]?.length > 0)) {
        setCompatibilityIssues({
          cpu: [], motherboard: [], memory: [], gpu: [], storage: [], psu: [], case: [], cooling: [], monitor: []
        });
      }
      return;
    }

    const newCalculatedIssues = checkCompatibilityIssues();
    if (JSON.stringify(newCalculatedIssues) !== JSON.stringify(compatibilityIssues)) {
      setCompatibilityIssues(newCalculatedIssues);
    }
  }, [components, checkCompatibilityIssues, compatibilityIssues]); // Depends on components and the memoized checker

  // --- Data Fetching and Handling ---

  const fetchComponentsFromAPI = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
        console.error("Invalid API response format:", response.data);
        useMockData(); // Fallback to mock data
        return;
      }
      const data = response.data.data;
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
      setOptions(categorizedProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      useMockData(); // Fallback to mock data
    } finally {
      setIsLoading(false);
    }
  };

  const useMockData = () => {
    console.warn("Using mock data as API fetch failed or returned invalid format.");
    const mockData = {
      cpu: [
        { _id: 'c1', name: 'AMD Ryzen 9 5900X', price: 399, lowestPrice: 390, specs: ['12 Cores', '24 Threads', '3.7GHz Base', '4.8GHz Boost'], image: '/assets/components/ryzen9.png', compatibility: { socket: 'AM4', tdp: 105 } },
        { _id: 'c2', name: 'Intel Core i9-12900K', price: 589, lowestPrice: 570, specs: ['16 Cores', '24 Threads', '3.2GHz Base', '5.2GHz Boost'], image: '/assets/components/i9.png', compatibility: { socket: 'LGA1700', tdp: 125 } },
        { _id: 'c3', name: 'AMD Ryzen 7 5800X', price: 299, lowestPrice: 280, specs: ['8 Cores', '16 Threads', '3.8GHz Base', '4.7GHz Boost'], image: '/assets/components/ryzen7.png', compatibility: { socket: 'AM4', tdp: 105 } },
      ],
      motherboard: [
        { _id: 'm1', name: 'ASUS ROG Strix X570-E', price: 329, lowestPrice: 315, specs: ['ATX', 'AMD X570', 'DDR4', 'PCIe 4.0'], image: '/assets/components/asus-x570.png', compatibility: { socket: 'AM4', memoryType: 'DDR4', formFactor: 'ATX', m2Slots: 2 } },
        { _id: 'm2', name: 'MSI MPG Z690 Gaming Edge', price: 289, lowestPrice: 275, specs: ['ATX', 'Intel Z690', 'DDR5', 'PCIe 5.0'], image: '/assets/components/msi-z690.png', compatibility: { socket: 'LGA1700', memoryType: 'DDR5', formFactor: 'ATX', m2Slots: 3 } },
        { _id: 'm3', name: 'Gigabyte B550 AORUS Pro', price: 189, lowestPrice: 180, specs: ['ATX', 'AMD B550', 'DDR4', 'PCIe 4.0'], image: '/assets/components/gigabyte-b550.png', compatibility: { socket: 'AM4', memoryType: 'DDR4', formFactor: 'ATX', m2Slots: 2 } },
      ],
      memory: [
        { _id: 'r1', name: 'Corsair Vengeance RGB Pro 32GB', price: 154, lowestPrice: 145, specs: ['32GB (2x16GB)', 'DDR4-3600', 'CL18'], image: '/assets/components/corsair-rgb.png', compatibility: { type: 'DDR4', speed: 3600, requiredSlots: 2, height: 44 } },
        { _id: 'r2', name: 'G.SKILL Trident Z5 RGB 32GB', price: 229, lowestPrice: 215, specs: ['32GB (2x16GB)', 'DDR5-6000', 'CL36'], image: '/assets/components/gskill-z5.png', compatibility: { type: 'DDR5', speed: 6000, requiredSlots: 2, height: 42 } },
        { _id: 'r3', name: 'Crucial Ballistix 16GB', price: 79, lowestPrice: 70, specs: ['16GB (2x8GB)', 'DDR4-3200', 'CL16'], image: '/assets/components/crucial.png', compatibility: { type: 'DDR4', speed: 3200, requiredSlots: 2, height: 39 } },
      ],
      gpu: [
        { _id: 'g1', name: 'NVIDIA GeForce RTX 3080', price: 799, lowestPrice: 750, compatibility: { recommendedPSU: 750, length: 285, powerRequirement: 320 } },
        { _id: 'g2', name: 'AMD Radeon RX 6700 XT', price: 479, lowestPrice: 450, compatibility: { recommendedPSU: 650, length: 267, powerRequirement: 230 } },
      ],
      storage: [
        { _id: 's1', name: 'Samsung 970 EVO Plus 1TB NVMe', price: 129, lowestPrice: 120, compatibility: { interface: 'PCIe 3.0', formFactor: 'M.2' } },
        { _id: 's2', name: 'Crucial MX500 2TB SATA SSD', price: 179, lowestPrice: 170, compatibility: { interface: 'SATA III', formFactor: '2.5"' } },
      ],
      psu: [
        { _id: 'p1', name: 'Corsair RM850x (850W)', price: 134, lowestPrice: 125, compatibility: { wattage: 850, efficiency: '80+ Gold', pcie5: false } },
        { _id: 'p2', name: 'EVGA SuperNOVA 650 G5 (650W)', price: 99, lowestPrice: 90, compatibility: { wattage: 650, efficiency: '80+ Gold', pcie5: false } },
      ],
      case: [
        { _id: 'cs1', name: 'NZXT H510', price: 79, lowestPrice: 75, compatibility: { maxGPULength: 381, maxCPUCoolerHeight: 165, supportedMotherboards: ['ATX', 'Micro-ATX', 'Mini-ITX'], radiatorSupport: { front: '280mm', top: '120mm'} } },
        { _id: 'cs2', name: 'Lian Li Lancool II Mesh', price: 109, lowestPrice: 100, compatibility: { maxGPULength: 384, maxCPUCoolerHeight: 176, supportedMotherboards: ['E-ATX', 'ATX', 'Micro-ATX', 'Mini-ITX'], radiatorSupport: { front: '360mm', top: '240mm'} } },
      ],
      cooling: [
        { _id: 'cl1', name: 'Noctua NH-D15', price: 99, lowestPrice: 95, compatibility: { type: 'Air', tdpSupport: 220, supportedSockets: ['AM4', 'LGA1700', 'LGA1200'], height: 165, ramClearance: 32 } },
        { _id: 'cl2', name: 'Corsair H100i RGB Elite', price: 129, lowestPrice: 120, compatibility: { type: 'Liquid', radiatorSize: '240mm', tdpSupport: 250, supportedSockets: ['AM4', 'LGA1700', 'LGA1200'] } },
      ],
      monitor: [
        { _id: 'mo1', name: 'LG 27GL850-B 27 Inch QHD', price: 379, lowestPrice: 360 },
      ]
    };
    setOptions(mockData);
  };
  
  const calculatePriceSummary = () => {
    let subtotal = 0;
    let lowestPriceSubtotal = 0;

    Object.values(components).forEach(component => {
      if (component) {
        const price = component.price || 0; // Use 0 if price is undefined
        const lowestPrice = component.lowestPrice || price; // Fallback to regular price if lowest is not available
        
        subtotal += price;
        lowestPriceSubtotal += lowestPrice;
      }
    });

    const taxRate = 0.08; // Example 8% tax
    const tax = subtotal * taxRate;
    const shipping = subtotal > 50 ? 0 : 10; // Example: Free shipping over $50
    const total = subtotal + tax + shipping;

    setPriceSummary({
      subtotal: subtotal,
      lowestPrice: lowestPriceSubtotal, // This is the subtotal of lowest prices
      savings: subtotal - lowestPriceSubtotal, // Savings based on subtotal differences
      tax: tax,
      shipping: shipping,
      total: total
    });
  };

  // --- Component Interaction ---

  const selectComponent = (category) => {
    setSelectedCategory(category);
    setCurrentSelection(components[category]); // For highlighting in modal
  };

  const addToBuild = (component) => {
    let componentToAdd = { ...component };
    // Ensure price property is set, defaulting from lowestPrice or first price in array
    if (!componentToAdd.price) {
      if (componentToAdd.lowestPrice) {
        componentToAdd.price = componentToAdd.lowestPrice;
      } else if (componentToAdd.prices && componentToAdd.prices.length > 0) {
        componentToAdd.price = componentToAdd.prices[0].price;
      } else {
        componentToAdd.price = 0; // Default to 0 if no price info
      }
    }
    setComponents(prev => ({
      ...prev,
      [selectedCategory]: componentToAdd
    }));
    setSelectedCategory(null); // Close modal
  };

  const removeComponent = (category) => {
    setComponents(prev => ({
      ...prev,
      [category]: null
    }));
  };

  // --- Simple Mode: Build Generation ---
  const generateSuggestedBuild = () => {
    setIsLoading(true);
    console.log(`Generating build for ${useCase} with budget $${budget}`);
    
    let currentBudget = parseFloat(budget);
    let build = {
      cpu: null, motherboard: null, memory: null, gpu: null, storage: null, psu: null, case: null, cooling: null, monitor: null
    };
  
    let allocation = {};
    switch (useCase) {
      case 'gaming':
        allocation = { gpu: 0.35, cpu: 0.20, motherboard: 0.12, memory: 0.10, storage: 0.08, psu: 0.07, case: 0.05, cooling: 0.03, monitor: 0.00 };
        break;
      case 'productivity':
        allocation = { cpu: 0.30, memory: 0.20, storage: 0.12, motherboard: 0.10, gpu: 0.15, psu: 0.06, case: 0.04, cooling: 0.03, monitor: 0.00 };
        break;
      case 'streaming':
        allocation = { cpu: 0.25, gpu: 0.25, memory: 0.15, storage: 0.12, motherboard: 0.10, psu: 0.06, case: 0.04, cooling: 0.03, monitor: 0.00 };
        break;
      case 'office':
        allocation = { cpu: 0.25, memory: 0.20, storage: 0.20, motherboard: 0.15, psu: 0.06, case: 0.05, cooling: 0.04, gpu: 0.05, monitor: 0.00 };
        break;
      default: // Fallback, similar to gaming but more balanced
        allocation = { cpu: 0.25, gpu: 0.25, motherboard: 0.12, memory: 0.12, storage: 0.10, psu: 0.07, case: 0.05, cooling: 0.04, monitor: 0.00 };
    }
  
    const componentPriority = Object.keys(allocation).sort((a, b) => {
        // Prioritize categories with higher allocation, then by a predefined essential order
        if (allocation[b] !== allocation[a]) return allocation[b] - allocation[a];
        const essentialsOrder = ['cpu', 'motherboard', 'memory', 'storage', 'psu', 'case', 'gpu', 'cooling', 'monitor'];
        return essentialsOrder.indexOf(a) - essentialsOrder.indexOf(b);
    });
    
    let tempBuildForCompatChecks = {}; // Used to pass to findBestComponent for smarter choices

    for (const category of componentPriority) {
      if (allocation[category] === 0 && category !== 'cooling') continue; // Skip if 0 allocation unless it's cooling (might be needed)

      const categoryBudget = currentBudget * allocation[category];
      // For cooling, if CPU is selected and has no stock cooler, allocate a small fixed budget or remaining if allocation is 0
      let actualCategoryBudget = categoryBudget;
      if (category === 'cooling' && allocation[category] === 0 && tempBuildForCompatChecks.cpu) {
          // A simple check, real CPUs might need a flag for "stock_cooler_included"
          const cpuNeedsCooler = !(tempBuildForCompatChecks.cpu.name?.toLowerCase().includes(' tray') || tempBuildForCompatChecks.cpu.name?.toLowerCase().includes(' oem'));
          if (cpuNeedsCooler) {
              actualCategoryBudget = Math.min(currentBudget * 0.05, 70); // Allocate up to 5% or $70 for a cooler
          } else {
              continue; // Skip if CPU likely has a cooler or doesn't need one explicitly
          }
      }


      const component = findBestComponent(category, actualCategoryBudget, tempBuildForCompatChecks);
      
      if (component) {
        const price = component.lowestPrice || component.price || 0;
        if (currentBudget >= price) {
          build[category] = component;
          tempBuildForCompatChecks[category] = component; // Add to temp build for next iteration's compatibility
          currentBudget -= price;
        }
      }
    }
    
    setComponents(build); 
    setSuggestedBuild(build);
    setIsLoading(false);
    return build;
  };

  // --- UI Helper Functions ---

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'cpu': return <FiCpu size={24} />;
      case 'motherboard': return <FiServer size={24} />; // FiHardDrive might be better for mobo
      case 'memory': return <FiServer size={24} />; // FiChip might be better for RAM
      case 'gpu': return <FiGrid size={24} />;
      case 'storage': return <FiHardDrive size={24} />;
      case 'psu': return <FiBattery size={24} />;
      case 'case': return <FiBox size={24} />;
      case 'cooling': return <FiWind size={24} />;
      case 'monitor': return <FiMonitor size={24} />;
      default: return <FiPlus size={24} />;
    }
  };

  const getCompatibilityClass = (category) => {
    if (!compatibilityIssues || !compatibilityIssues[category] || compatibilityIssues[category].length === 0) {
      return components[category] ? "component-status-compatible" : "component-status-neutral";
    }
    if (compatibilityIssues[category].some(issue => issue.severity === 'error')) {
      return "component-status-incompatible";
    }
    if (compatibilityIssues[category].some(issue => issue.severity === 'warning')) {
      return "component-status-warning";
    }
    return "component-status-compatible"; // Should have issues, but none are error/warning
  };

  const renderCompatibilityIssues = (category) => {
    if (!compatibilityIssues || !compatibilityIssues[category] || compatibilityIssues[category].length === 0) {
      return null;
    }
    return (
      <div className="compatibility-issues-list">
        {compatibilityIssues[category].map((issue, index) => (
          <div key={index} className={`compatibility-issue issue-${issue.severity || 'warning'}`}>
            <FiAlertCircle className="issue-icon" />
            <span className="issue-message">{issue.message}</span>
          </div>
        ))}
      </div>
    );
  };
  
  const getCompatibilityFeatures = (component, category) => {
    if (!component || !component.compatibility) return [];
    const features = [];
    const compat = component.compatibility;

    switch (category) {
      case 'cpu':
        if (compat.socket) features.push(`Socket: ${compat.socket}`);
        if (compat.tdp) features.push(`TDP: ${compat.tdp}W`);
        break;
      case 'motherboard':
        if (compat.socket) features.push(`Socket: ${compat.socket}`);
        if (compat.memoryType) features.push(`RAM: ${compat.memoryType}`);
        if (compat.formFactor) features.push(`Form Factor: ${compat.formFactor}`);
        break;
      case 'memory':
        if (compat.type) features.push(`Type: ${compat.type}`);
        if (compat.speed) features.push(`Speed: ${compat.speed}MHz`);
        break;
      case 'gpu':
        if (compat.recommendedPSU) features.push(`Needs: ${compat.recommendedPSU}W PSU`);
        if (compat.length) features.push(`Length: ${compat.length}mm`);
        break;
      case 'psu':
        if (compat.wattage) features.push(`Wattage: ${compat.wattage}W`);
        if (compat.efficiency) features.push(`${compat.efficiency}`);
        break;
      case 'case':
        if (compat.maxGPULength) features.push(`Max GPU: ${compat.maxGPULength}mm`);
        if (compat.maxCPUCoolerHeight) features.push(`Max Cooler: ${compat.maxCPUCoolerHeight}mm`);
        break;
      case 'cooling':
        if (compat.type) features.push(`Type: ${compat.type}`);
        if (compat.tdpSupport) features.push(`TDP Support: ${compat.tdpSupport}W`);
        break;
      default:
        break;
    }
    return features;
  };

  const renderPriceSummary = () => {
    const formatPrice = (price) => {
      if (price === undefined || price === null || isNaN(price)) return '$0.00';
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
          {priceSummary.savings > 0 && (
            <div className="price-row savings">
                <span>Savings (Lowest Prices)</span>
                <span>-{formatPrice(priceSummary.savings)}</span>
            </div>
          )}
          <div className="price-row">
            <span>Tax (8%)</span>
            <span>{formatPrice(priceSummary.tax)}</span>
          </div>
          <div className="price-row">
            <span>Shipping</span>
            <span>{priceSummary.shipping === 0 ? 'Free' : formatPrice(priceSummary.shipping)}</span>
          </div>
          <div className="price-row total">
            <span>Total</span>
            <span>{formatPrice(priceSummary.total)}</span>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced function to filter compatible components for the modal
  // This is a simpler filter than the main checkCompatibilityIssues, focused on quick modal filtering.
  const filterCompatibleComponents = useCallback((category, partsList) => {
    if (!compatibilityMode || !partsList || partsList.length === 0) return partsList;

    let filtered = [...partsList];
    const { cpu, motherboard, memory, gpu: currentGPU, case: currentCase } = components; // Renamed for clarity

    switch (category) {
      case 'cpu':
        if (motherboard && motherboard.compatibility?.socket) {
          filtered = filtered.filter(c => c.compatibility?.socket && utilAreSocketsCompatible(c.compatibility.socket, motherboard.compatibility.socket));
        }
        break;
      case 'motherboard':
        if (cpu && cpu.compatibility?.socket) {
          filtered = filtered.filter(m => m.compatibility?.socket && utilAreSocketsCompatible(m.compatibility.socket, cpu.compatibility.socket));
        }
        if (memory && memory.compatibility?.type) {
          filtered = filtered.filter(m => m.compatibility?.memoryType && utilIsRAMCompatible(m.compatibility.memoryType, memory.compatibility.type));
        }
        break;
      case 'memory':
        if (motherboard && motherboard.compatibility?.memoryType) {
          filtered = filtered.filter(mem => mem.compatibility?.type && utilIsRAMCompatible(motherboard.compatibility.memoryType, mem.compatibility.type));
        }
        break;
      case 'gpu':
        if (currentCase && currentCase.compatibility?.maxGPULength) {
          filtered = filtered.filter(g => !g.compatibility?.length || g.compatibility.length <= currentCase.compatibility.maxGPULength);
        }
        // Could add PSU check here if PSU is selected
        break;
      case 'case':
        if (currentGPU && currentGPU.compatibility?.length) {
          filtered = filtered.filter(cs => !cs.compatibility?.maxGPULength || cs.compatibility.maxGPULength >= currentGPU.compatibility.length);
        }
        if (motherboard && motherboard.compatibility?.formFactor) {
            filtered = filtered.filter(cs => cs.compatibility?.supportedMotherboards && cs.compatibility.supportedMotherboards.includes(motherboard.compatibility.formFactor));
        }
        break;
      case 'cooling':
        if (cpu && cpu.compatibility?.socket) {
            filtered = filtered.filter(cool => cool.compatibility?.supportedSockets && cool.compatibility.supportedSockets.some(s => utilAreSocketsCompatible(s, cpu.compatibility.socket)));
        }
        if (currentCase && currentCase.compatibility?.maxCPUCoolerHeight) {
            filtered = filtered.filter(cool => cool.compatibility?.type !== 'Air' || !cool.compatibility?.height || cool.compatibility.height <= currentCase.compatibility.maxCPUCoolerHeight);
        }
        break;
      case 'psu':
        let estimatedWattage = 0;
        if (cpu && cpu.compatibility?.tdp) estimatedWattage += cpu.compatibility.tdp;
        if (currentGPU && currentGPU.compatibility?.powerRequirement) estimatedWattage += currentGPU.compatibility.powerRequirement;
        estimatedWattage += 100; // Base for mobo, ram, storage
        const recommendedWattage = Math.ceil(estimatedWattage * 1.3); // 30% buffer
        filtered = filtered.filter(p => p.compatibility?.wattage && p.compatibility.wattage >= recommendedWattage);
        break;
      default:
        break;
    }
    return filtered;
  }, [components, compatibilityMode, utilAreSocketsCompatible, utilIsRAMCompatible]);


  // Determine which options to show in the modal (filtered or all)
  const modalOptions = selectedCategory ? filterCompatibleComponents(selectedCategory, options[selectedCategory]) : [];


  // JSX remains the same as provided by the user
  return (
  <div className="pyro-page pc-builder-page">
    <div className="page-header">
      <h1>Custom PC Builder</h1>
      <p>Select compatible components to build your dream PC</p>
      
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
      <div className="simple-builder-container">
        <div className="builder-requirements">
          <h2>Build Requirements</h2>
          
          <div className="requirement-section">
            <h3><FiDollarSign /> Budget</h3>
            <div className="budget-slider">
              <input 
                type="range" 
                min="500" 
                max="5000" // Increased max budget
                step="50" 
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
              <h3><IoGameController /> Games You'll Play (Optional)</h3>
              <div className="games-selector">
                <div className="popular-games">
                  {['Cyberpunk 2077', 'Call of Duty', 'Fortnite', 'Minecraft', 'CSGO', 'Apex Legends', 'Valorant', 'League of Legends'].map(game => (
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
            disabled={isLoading}
          >
            {isLoading ? 'Generating...' : 'Generate PC Build'}
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
                        style={{width: `${Object.values(compatibilityIssues).every(arr => arr.length === 0) ? 100 : 50}%`}}
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
                        .reduce((sum, comp) => sum + (comp.lowestPrice || comp.price || 0), 0)
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
                        ${(component.lowestPrice || component.price || 0).toFixed(2)}
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
      <div className="pc-builder-container">
        <div className="component-selection">
          <h2>Components</h2>
          <div className="component-list">
            {Object.keys(components).map((category) => (
              <div 
                key={category} 
                className={`component-item ${components[category] ? 'selected' : ''} ${getCompatibilityClass(category)}`}
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
                        ${(components[category].price || components[category].lowestPrice || 0).toFixed(2)}
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
    
    {selectedCategory && (
      <div className="component-modal-overlay" onClick={() => setSelectedCategory(null)}>
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
              // onChange={(e) => setSearchTerm(e.target.value)} // Add search term state and logic if needed
            />
            <label className="compatibility-filter-toggle">
                <input 
                    type="checkbox" 
                    checked={compatibilityMode} 
                    onChange={() => setCompatibilityMode(!compatibilityMode)} 
                />
                Show only compatible parts
            </label>
          </div>
          <div className="component-options">
            {isLoading && <p>Loading options...</p>}
            {!isLoading && modalOptions.length > 0 ? (
              modalOptions.map(option => (
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
                     <div className="option-compatibility-features">
                        {getCompatibilityFeatures(option, selectedCategory).map((feature, idx) => (
                          <span key={idx} className="compat-feature-modal">{feature}</span>
                        ))}
                      </div>
                  </div>
                  <div className="option-price">
                    ${(option.price || option.lowestPrice || (option.prices && option.prices[0] ? option.prices[0].price : 0)).toFixed(2)}
                  </div>
                </div>
              ))
            ) : (
              !isLoading && <div className="no-options">
                <p>No {compatibilityMode ? "compatible " : ""}{selectedCategory} options available for the current selection or search.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )}
    
    <div className="builder-section recommendations-section">
      <Recommendations 
        userId={null} 
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