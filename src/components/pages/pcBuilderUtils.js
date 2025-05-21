// --- Helper Functions ---
export const getPropertyValue = (obj, properties) => {
    if (!obj || !properties || properties.length === 0) {
      return undefined;
    }
    let current = obj;
    for (const prop of properties) {
      if (current && typeof current === 'object' && prop in current) {
        current = current[prop];
      } else if (current && current.specs && Array.isArray(current.specs)) {
        const spec = current.specs.find(s => s.name === prop);
        if (spec) {
          current = spec.value;
        } else {
          return undefined;
        }
      } else {
        return undefined;
      }
    }
    return current;
  };
  
  export const areSocketsCompatible = (socket1, socket2) => {
    if (!socket1 || !socket2) return false;
    // Normalize by removing spaces and converting to lowercase for robust comparison
    const normalize = (s) => String(s).replace(/\s+/g, '').toLowerCase();
    return normalize(socket1) === normalize(socket2);
  };
  
  export const isRAMCompatible = (motherboardRamType, ramType) => {
    if (!motherboardRamType || !ramType) return false;
    const normalize = (s) => String(s).replace(/\s+/g, '').toUpperCase(); // DDR4 vs ddr4
    const normMoboType = normalize(motherboardRamType);
    const normRAMType = normalize(ramType);
  
    // Motherboard might list multiple supported types e.g., "DDR4, DDR3" (unlikely but possible)
    // Or more commonly, "DDR4" and RAM is "DDR4"
    return normMoboType.includes(normRAMType);
  };
  
  // --- Main Compatibility Checker ---
  // Note: This function now takes components, getPropertyValue, areSocketsCompatible, isRAMCompatible as arguments
  // This makes it more testable and decouples it from being defined inside a React component's scope directly.
  export const calculateAllCompatibilityIssues = (
      components, 
      getPropertyValueFunc, 
      areSocketsCompatibleFunc, 
      isRAMCompatibleFunc
  ) => {
    const newIssues = {
      cpu: [], motherboard: [], memory: [], gpu: [], storage: [], psu: [], case: [], cooling: [], monitor: []
    };
    const { cpu, motherboard, memory, gpu, psu, case: pcCase, cooling } = components;
  
    // 1. CPU and Motherboard socket compatibility
    if (cpu && motherboard) {
      const cpuSocket = getPropertyValueFunc(cpu, ['socket', 'compatibility.socket', 'specs.socket']);
      const mbSocket = getPropertyValueFunc(motherboard, ['socket', 'compatibility.socket', 'specs.socket']);
      if (cpuSocket && mbSocket && !areSocketsCompatibleFunc(cpuSocket, mbSocket)) {
        const msg = `CPU socket (${cpuSocket}) is not compatible with motherboard socket (${mbSocket})`;
        newIssues.cpu.push({ message: msg, severity: 'error' });
        newIssues.motherboard.push({ message: msg, severity: 'error' });
      }
    }
  
    // 2. Memory and Motherboard compatibility
    if (memory && motherboard) {
      const ramType = getPropertyValueFunc(memory, ['type', 'memoryType', 'compatibility.type', 'specs.type']);
      const mbRAMType = getPropertyValueFunc(motherboard, ['memoryType', 'compatibility.memoryType', 'specs.memoryType', 'ram']);
      if (ramType && mbRAMType && !isRAMCompatibleFunc(mbRAMType, ramType)) {
        const msg = `Memory type (${ramType}) is not compatible with motherboard (${mbRAMType})`;
        newIssues.memory.push({ message: msg, severity: 'error' });
        newIssues.motherboard.push({ message: msg, severity: 'error' });
      }
      if (memory.compatibility?.requiredSlots && motherboard.compatibility?.memorySlots) {
        if (memory.compatibility.requiredSlots > motherboard.compatibility.memorySlots) {
          const msg = `Not enough memory slots on motherboard for selected RAM configuration.`;
          newIssues.memory.push({ message: msg, severity: 'error' });
          newIssues.motherboard.push({ message: msg, severity: 'error' });
        }
      }
    }
    
      // 3. GPU and Case size compatibility
    if (gpu && pcCase) {
      const gpuLength = parseFloat(getPropertyValueFunc(gpu, ['length', 'compatibility.length', 'dimensions.length', 'specs.length']));
      const maxGPULength = parseFloat(getPropertyValueFunc(pcCase, ['maxGPULength', 'compatibility.maxGPULength', 'dimensions.maxGPULength', 'specs.maxGPULength']));
      if (!isNaN(gpuLength) && !isNaN(maxGPULength) && gpuLength > maxGPULength) {
        newIssues.gpu.push({ message: `GPU length (${gpuLength}mm) exceeds case maximum (${maxGPULength}mm)`, severity: 'error' });
        newIssues.case.push({ message: `Case max GPU length (${maxGPULength}mm) too short for GPU (${gpuLength}mm)`, severity: 'error' });
      }
    }
  
    // 4. Power requirements check
    if (psu && (cpu || gpu)) {
      let estimatedWattage = 0;
      if (cpu) {
        estimatedWattage += parseFloat(getPropertyValueFunc(cpu, ['tdp', 'compatibility.tdp'])) || 125;
      }
      if (gpu) {
        estimatedWattage += parseFloat(getPropertyValueFunc(gpu, ['powerRequirement', 'compatibility.powerRequirement', 'specs.powerConsumption'])) || 200;
      }
      estimatedWattage += 100; 
      const recommendedWattage = Math.ceil(estimatedWattage * 1.3);
  
      const psuWattageStr = getPropertyValueFunc(psu, ['wattage', 'power', 'compatibility.wattage', 'specs.wattage']);
      let psuWattageValue = 0;
      if (typeof psuWattageStr === 'string') {
          psuWattageValue = parseFloat(psuWattageStr.replace(/\D/g, ''));
      } else if (typeof psuWattageStr === 'number') {
          psuWattageValue = psuWattageStr;
      }
  
      if (psuWattageValue > 0 && psuWattageValue < recommendedWattage) {
        newIssues.psu.push({ message: `PSU wattage (${psuWattageValue}W) may be insufficient. Recommended: ~${recommendedWattage}W`, severity: 'warning' });
      }
      if (gpu?.name?.includes('RTX 40') && psu?.compatibility && !psu.compatibility.pcie5) {
          newIssues.psu.push({ message: 'High-end GPU may require PCIe 5.0 power, PSU might lack it.', severity: 'warning' });
          newIssues.gpu.push({ message: 'This GPU may require PCIe 5.0 power from PSU.', severity: 'warning' });
      }
    }
  
    // 5. CPU Cooler compatibility
    if (cpu && cooling) {
      const cpuSocket = getPropertyValueFunc(cpu, ['socket', 'compatibility.socket']);
      const coolerSockets = getPropertyValueFunc(cooling, ['supportedSockets', 'compatibility.supportedSockets']) || [];
      if (cpuSocket && coolerSockets.length > 0 && !coolerSockets.some(s => areSocketsCompatibleFunc(s, cpuSocket))) {
        newIssues.cooling.push({ message: `Cooler does not support CPU socket (${cpuSocket})`, severity: 'error' });
        newIssues.cpu.push({ message: `CPU socket (${cpuSocket}) not supported by cooler`, severity: 'error' });
      }
  
      const cpuTDP = parseFloat(getPropertyValueFunc(cpu, ['tdp', 'compatibility.tdp']));
      const coolerMaxTDP = parseFloat(getPropertyValueFunc(cooling, ['tdpSupport', 'compatibility.tdpMax']));
      if (!isNaN(cpuTDP) && !isNaN(coolerMaxTDP) && cpuTDP > coolerMaxTDP) {
        newIssues.cooling.push({ message: `Cooler TDP (${coolerMaxTDP}W) is less than CPU TDP (${cpuTDP}W)`, severity: 'warning' });
      }
      
      if (pcCase) {
          const coolerHeight = parseFloat(getPropertyValueFunc(cooling, ['height', 'compatibility.height']));
          const caseMaxCoolerHeight = parseFloat(getPropertyValueFunc(pcCase, ['maxCPUCoolerHeight', 'compatibility.maxCPUCoolerHeight']));
          if (!isNaN(coolerHeight) && !isNaN(caseMaxCoolerHeight) && coolerHeight > caseMaxCoolerHeight) {
              newIssues.cooling.push({ message: `Cooler height (${coolerHeight}mm) exceeds case limit (${caseMaxCoolerHeight}mm)`, severity: 'error' });
              newIssues.case.push({ message: `Case max cooler height (${caseMaxCoolerHeight}mm) too short for cooler (${coolerHeight}mm)`, severity: 'error' });
          }
      }
      if (memory) {
          const coolerRamClearance = parseFloat(getPropertyValueFunc(cooling, ['ramClearance', 'compatibility.ramClearance']));
          const ramHeight = parseFloat(getPropertyValueFunc(memory, ['height', 'compatibility.height']));
          if (!isNaN(coolerRamClearance) && !isNaN(ramHeight) && ramHeight > coolerRamClearance) {
              newIssues.cooling.push({ message: `Cooler RAM clearance (${coolerRamClearance}mm) too low for RAM height (${ramHeight}mm)`, severity: 'warning' });
              newIssues.memory.push({ message: `RAM height (${ramHeight}mm) may conflict with cooler RAM clearance (${coolerRamClearance}mm)`, severity: 'warning' });
          }
      }
    }
    
    // 6. Motherboard and Case form factor
    if (motherboard && pcCase) {
      const mbFF = getPropertyValueFunc(motherboard, ['formFactor', 'compatibility.formFactor']);
      const caseSupportedFF = getPropertyValueFunc(pcCase, ['supportedMotherboards', 'compatibility.supportedMotherboards']) || [];
      if (mbFF && caseSupportedFF.length > 0 && !caseSupportedFF.includes(mbFF)) {
        newIssues.motherboard.push({ message: `Mobo form factor (${mbFF}) not supported by case (supports: ${caseSupportedFF.join(', ')})`, severity: 'error' });
        newIssues.case.push({ message: `Case (supports: ${caseSupportedFF.join(', ')}) does not support mobo form factor (${mbFF})`, severity: 'error' });
      }
    }
  
    // 7. Radiator compatibility (Liquid Cooling)
    if (cooling && pcCase && getPropertyValueFunc(cooling, ['type', 'compatibility.type']) === 'Liquid') {
      const radSize = getPropertyValueFunc(cooling, ['radiatorSize', 'compatibility.radiatorSize']);
      const caseRadSupport = getPropertyValueFunc(pcCase, ['radiatorSupport', 'compatibility.radiatorSupport']) || {};
      
      if (radSize) {
          const numericRadSize = parseInt(String(radSize).replace(/\D/g, ''));
          let supported = false;
          for (const position in caseRadSupport) {
              if (parseInt(String(caseRadSupport[position]).replace(/\D/g, '')) >= numericRadSize) {
                  supported = true;
                  break;
              }
          }
          if (!supported) {
              newIssues.cooling.push({ message: `Case may not support ${radSize} radiator. Check specific mounting points.`, severity: 'warning' });
              newIssues.case.push({ message: `Radiator (${radSize}) support unclear. Verify mounting options.`, severity: 'warning' });
          }
      }
    }
  
    // 8. Storage compatibility
    if (motherboard && components.storage) {
      const storageItem = components.storage;
      const storageInterface = getPropertyValueFunc(storageItem, ['interface', 'compatibility.interface']);
      const storageFF = getPropertyValueFunc(storageItem, ['formFactor', 'compatibility.formFactor']);
  
      if (storageFF === 'M.2-2280' || String(storageFF).startsWith('M.2')) {
          const m2Slots = parseInt(getPropertyValueFunc(motherboard, ['m2Slots', 'compatibility.m2Slots'])) || 0;
          if (m2Slots === 0) {
              newIssues.storage.push({ message: `Motherboard has no M.2 slots for M.2 SSD.`, severity: 'error' });
              newIssues.motherboard.push({ message: `No M.2 slots available for M.2 SSD.`, severity: 'error' });
          }
      }
      if (storageInterface && storageInterface.includes('PCIe 4.0') && motherboard.specs) {
          const moboPcieSupport = motherboard.specs.some(spec => String(spec).includes('PCIe 4.0') || String(spec).includes('PCIe 5.0'));
          if (!moboPcieSupport) {
              newIssues.storage.push({ message: `PCIe 4.0 SSD performance may be limited by motherboard's PCIe 3.0.`, severity: 'warning' });
              newIssues.motherboard.push({ message: `Motherboard may not fully support PCIe 4.0 SSD speed.`, severity: 'warning' });
          }
      }
    }
    // ... (all your other compatibility checks from the original checkCompatibilityIssues)
    return newIssues;
  };
  
  
  // --- Build Generation Helpers ---
  export const findBestComponentUtil = (category, maxPrice, availableOptions, currentBuild = {}, getPropertyValueFunc, areSocketsCompatibleFunc) => {
    if (!availableOptions || availableOptions.length === 0) {
      // console.warn(`No options available for category: ${category}`);
      return null;
    }
  
    let budgetFriendlyOptions = availableOptions.filter(item => {
      const price = item.lowestPrice || item.price;
      return price && typeof price === 'number' && price > 0 && price <= maxPrice;
    });
  
    if (budgetFriendlyOptions.length === 0) {
      // console.warn(`No options found within budget ($${maxPrice.toFixed(2)}) for category: ${category}`);
      return null;
    }
    
    // Add more specific filtering based on category and currentBuild if needed
    if (category === 'motherboard' && currentBuild.cpu) {
      const cpuSocket = getPropertyValueFunc(currentBuild.cpu, ['socket', 'compatibility.socket']);
      if (cpuSocket) {
        budgetFriendlyOptions = budgetFriendlyOptions.filter(mobo => {
          const moboSocket = getPropertyValueFunc(mobo, ['socket', 'compatibility.socket']);
          return moboSocket && areSocketsCompatibleFunc(cpuSocket, moboSocket);
        });
      }
    }
    // Add similar logic for RAM compatibility with motherboard, cooler with CPU socket & case, etc.
  
    if (budgetFriendlyOptions.length === 0) {
      // console.warn(`No compatible options found after filtering for ${category}`);
      return null;
    }
  
    // Strategy: Pick the most expensive component that fits the budget and compatibility.
    return budgetFriendlyOptions.reduce((best, current) => {
      const bestPrice = best.lowestPrice || best.price;
      const currentPrice = current.lowestPrice || current.price;
      return currentPrice > bestPrice ? current : best;
    }, budgetFriendlyOptions[0]);
  };
  