import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { PatternInstanceManager, PatternInstance } from '../services/PatternInstanceManager';
import { PrototypeService } from '../services/PrototypeService';
import { Prototype, CreatePrototypeInput, UpdatePrototypeInput } from '../types/prototype';

export interface PatternInfo {
  name: string;
  status: 'pending' | 'accepted' | 'subcomponent';
  category: string;
  instanceId: string;
  props: Record<string, unknown>;
  element: HTMLElement;
  rect: DOMRect;
  hasConfig?: boolean;
  configPath?: string;
  // Sub-component specific fields
  isSubComponent?: boolean;
  parentInstanceId?: string;
  componentType?: string;
}

export interface PrototypeState {
  id?: string;
  name?: string;
  description?: string;
  configuration?: Record<string, unknown>;
  isDirty?: boolean;
  lastSaved?: Date;
}

interface ConfigurationModeContextType {
  // Core mode state
  isEnabled: boolean;
  toggleEnabled: () => void;
  
  // Pattern selection
  hoveredPattern: PatternInfo | null;
  setHoveredPattern: (info: PatternInfo | null) => void;
  selectedPattern: PatternInfo | null;
  setSelectedPattern: (info: PatternInfo | null) => void;
  selectedInstanceId: string | null;
  setSelectedInstanceId: (id: string | null) => void;
  
  // UI state
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  drawerWidth: number;
  setDrawerWidth: (width: number) => void;
  
  // Pattern instance management
  patternInstances: Map<string, PatternInfo[]>;
  registerPatternInstance: (pattern: PatternInfo) => void;
  unregisterPatternInstance: (instanceId: string) => void;
  updatePatternInstance: (instanceId: string, props: Record<string, unknown>) => void;
  updateAllPatternInstances: (patternName: string, props: Record<string, unknown>) => void;
  getPatternInstances: (patternName: string) => PatternInstance[];
  getPatternInstanceCount: (patternName: string) => number;
  findPatternInstanceById: (instanceId: string) => PatternInstance | null;
  
  // Prototype management
  currentPrototype: PrototypeState | null;
  setCurrentPrototype: (prototype: PrototypeState | null) => void;
  
  // Prototype operations
  savePrototype: (input?: CreatePrototypeInput | UpdatePrototypeInput) => Promise<Prototype | null>;
  loadPrototype: (id: string) => Promise<boolean>;
  createNewPrototype: (name: string, description?: string) => Promise<boolean>;
  exportConfiguration: () => Record<string, unknown>;
  importConfiguration: (config: Record<string, unknown>) => void;
  
  // Configuration history
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  
  // Auto-save
  autoSaveEnabled: boolean;
  setAutoSaveEnabled: (enabled: boolean) => void;
  lastAutoSave: Date | null;
}

export const ConfigurationModeContext = createContext<ConfigurationModeContextType | undefined>(undefined);

export const useConfigurationMode = () => {
  const context = useContext(ConfigurationModeContext);
  if (!context) {
    throw new Error('useConfigurationMode must be used within ConfigurationModeProvider');
  }
  return context;
};

interface ConfigurationModeProviderProps {
  children: ReactNode;
}

export const ConfigurationModeProvider: React.FC<ConfigurationModeProviderProps> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hoveredPattern, setHoveredPattern] = useState<PatternInfo | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<PatternInfo | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(400);
  const [patternInstances, setPatternInstances] = useState<Map<string, PatternInfo[]>>(new Map());
  
  // Prototype state
  const [currentPrototype, setCurrentPrototype] = useState<PrototypeState | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  
  // Configuration history
  const [configHistory, setConfigHistory] = useState<Record<string, unknown>[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const toggleEnabled = useCallback(() => {
    setIsEnabled((prev) => !prev);
    if (!isEnabled) {
      // Clear states when disabling
      setHoveredPattern(null);
      setSelectedPattern(null);
      setSelectedInstanceId(null);
      setDrawerOpen(false);
    }
  }, [isEnabled]);

  const registerPatternInstance = useCallback((pattern: PatternInfo) => {
    setPatternInstances((prev) => {
      const newMap = new Map(prev);
      const instances = newMap.get(pattern.name) || [];

      // Check if instance already exists
      const existingIndex = instances.findIndex((p) => p.instanceId === pattern.instanceId);
      if (existingIndex >= 0) {
        // Update existing instance
        instances[existingIndex] = pattern;
      } else {
        // Add new instance
        instances.push(pattern);
      }

      newMap.set(pattern.name, instances);
      return newMap;
    });
  }, []);

  const unregisterPatternInstance = useCallback((instanceId: string) => {
    setPatternInstances((prev) => {
      const newMap = new Map(prev);

      newMap.forEach((instances, patternName) => {
        const filtered = instances.filter((p) => p.instanceId !== instanceId);
        if (filtered.length === 0) {
          newMap.delete(patternName);
        } else {
          newMap.set(patternName, filtered);
        }
      });

      return newMap;
    });
  }, []);

  const updatePatternInstance = useCallback(
    (instanceId: string, props: Record<string, unknown>) => {
      // Notify the pattern instance that it should update
      PatternInstanceManager.notifyInstanceUpdate(instanceId);

      // Also emit a custom event for the specific instance
      const event = new CustomEvent('pattern-update-request', {
        detail: { instanceId, props },
        bubbles: true,
      });
      window.dispatchEvent(event);

      // Mark prototype as dirty if we have one
      if (currentPrototype) {
        setCurrentPrototype(prev => prev ? { ...prev, isDirty: true } : null);
      }
    },
    [currentPrototype]
  );

  const updateAllPatternInstances = useCallback(
    (patternName: string, props: Record<string, unknown>) => {
      // Notify all instances of this pattern
      PatternInstanceManager.notifyAllInstancesUpdate(patternName);

      // Also emit a custom event for all instances
      const event = new CustomEvent('pattern-update-request', {
        detail: { patternName, props, updateAll: true },
        bubbles: true,
      });
      window.dispatchEvent(event);

      // Mark prototype as dirty if we have one
      if (currentPrototype) {
        setCurrentPrototype(prev => prev ? { ...prev, isDirty: true } : null);
      }
    },
    [currentPrototype]
  );

  const getPatternInstances = useCallback((patternName: string) => {
    return PatternInstanceManager.getInstances(patternName);
  }, []);

  const getPatternInstanceCount = useCallback((patternName: string) => {
    return PatternInstanceManager.getInstanceCount(patternName);
  }, []);

  const findPatternInstanceById = useCallback((instanceId: string) => {
    return PatternInstanceManager.findInstanceById(instanceId);
  }, []);

  // Prototype operations
  const savePrototype = useCallback(async (input?: CreatePrototypeInput | UpdatePrototypeInput): Promise<Prototype | null> => {
    try {
      if (!currentPrototype) {
        throw new Error('No prototype to save');
      }

      // Collect current configuration from all patterns
      const configuration = exportConfiguration();

      let prototype: Prototype;

      if (currentPrototype.id && !input) {
        // Update existing prototype
        prototype = await PrototypeService.update(currentPrototype.id, {
          configuration,
          metadata: { updatedAt: new Date() }
        });
      } else if (input) {
        if ('name' in input) {
          // Create new prototype
          prototype = await PrototypeService.create({
            ...input,
            configuration,
            schema: {
              type: 'pattern-collection',
              data: configuration
            }
          });
        } else {
          // Update with input
          if (!currentPrototype.id) {
            throw new Error('Cannot update prototype without ID');
          }
          prototype = await PrototypeService.update(currentPrototype.id, {
            ...input,
            configuration,
            metadata: { updatedAt: new Date() }
          });
        }
      } else {
        throw new Error('Cannot save prototype: no input provided for new prototype');
      }

      // Update current prototype state
      setCurrentPrototype({
        id: prototype.id,
        name: prototype.name,
        description: prototype.description,
        configuration: prototype.configuration,
        isDirty: false,
        lastSaved: new Date()
      });

      setLastAutoSave(new Date());
      return prototype;
    } catch (error) {
      console.error('Failed to save prototype:', error);
      return null;
    }
  }, [currentPrototype]);

  const loadPrototype = useCallback(async (id: string): Promise<boolean> => {
    try {
      const prototype = await PrototypeService.get(id);
      if (!prototype) {
        console.error('Prototype not found:', id);
        return false;
      }

      // Set current prototype
      setCurrentPrototype({
        id: prototype.id,
        name: prototype.name,
        description: prototype.description,
        configuration: prototype.configuration,
        isDirty: false,
        lastSaved: prototype.metadata.updatedAt
      });

      // Import configuration
      importConfiguration(prototype.configuration);
      
      return true;
    } catch (error) {
      console.error('Failed to load prototype:', error);
      return false;
    }
  }, []);

  const createNewPrototype = useCallback(async (name: string, description?: string): Promise<boolean> => {
    try {
      const currentConfig = exportConfiguration();
      
      const prototype = await PrototypeService.create({
        name,
        description: description || `Prototype created on ${new Date().toLocaleDateString()}`,
        schema: {
          type: 'pattern-collection',
          data: currentConfig
        },
        configuration: currentConfig
      });

      setCurrentPrototype({
        id: prototype.id,
        name: prototype.name,
        description: prototype.description,
        configuration: prototype.configuration,
        isDirty: false,
        lastSaved: new Date()
      });

      return true;
    } catch (error) {
      console.error('Failed to create new prototype:', error);
      return false;
    }
  }, []);

  const exportConfiguration = useCallback((): Record<string, unknown> => {
    const config: Record<string, unknown> = {};
    
    // Collect configurations from all pattern instances
    patternInstances.forEach((instances, patternName) => {
      config[patternName] = instances.map(instance => ({
        instanceId: instance.instanceId,
        props: instance.props,
        element: {
          tagName: instance.element.tagName,
          className: instance.element.className,
          dataset: { ...instance.element.dataset }
        },
        rect: {
          x: instance.rect.x,
          y: instance.rect.y,
          width: instance.rect.width,
          height: instance.rect.height
        }
      }));
    });

    return {
      patterns: config,
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        totalPatterns: patternInstances.size,
        totalInstances: Array.from(patternInstances.values()).reduce((sum, instances) => sum + instances.length, 0)
      }
    };
  }, [patternInstances]);

  const importConfiguration = useCallback((config: Record<string, unknown>) => {
    try {
      if (!config.patterns || typeof config.patterns !== 'object') {
        console.warn('Invalid configuration format');
        return;
      }

      const patterns = config.patterns as Record<string, any[]>;
      
      // Apply configurations to existing patterns
      Object.entries(patterns).forEach(([patternName, instances]) => {
        instances.forEach(instanceConfig => {
          if (instanceConfig.instanceId && instanceConfig.props) {
            updatePatternInstance(instanceConfig.instanceId, instanceConfig.props);
          }
        });
      });

      console.log('Configuration imported successfully');
    } catch (error) {
      console.error('Failed to import configuration:', error);
    }
  }, [updatePatternInstance]);

  // Configuration history functions
  const addToHistory = useCallback((config: Record<string, unknown>) => {
    setConfigHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(config);
      // Keep only last 20 states
      if (newHistory.length > 20) {
        newHistory.shift();
      }
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  }, [historyIndex]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousConfig = configHistory[historyIndex - 1];
      importConfiguration(previousConfig);
      setHistoryIndex(prev => prev - 1);
    }
  }, [historyIndex, configHistory, importConfiguration]);

  const redo = useCallback(() => {
    if (historyIndex < configHistory.length - 1) {
      const nextConfig = configHistory[historyIndex + 1];
      importConfiguration(nextConfig);
      setHistoryIndex(prev => prev + 1);
    }
  }, [historyIndex, configHistory, importConfiguration]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < configHistory.length - 1;

  // Auto-save effect
  useEffect(() => {
    if (!autoSaveEnabled || !currentPrototype?.isDirty || !currentPrototype?.id) {
      return;
    }

    const autoSaveTimer = setTimeout(async () => {
      await savePrototype();
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [autoSaveEnabled, currentPrototype, savePrototype]);

  // Load drawer width from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('configuration-drawer-width');
    if (savedWidth) {
      setDrawerWidth(parseInt(savedWidth, 10));
    }
  }, []);

  // Save drawer width to localStorage
  const handleSetDrawerWidth = useCallback((width: number) => {
    setDrawerWidth(width);
    localStorage.setItem('configuration-drawer-width', width.toString());
  }, []);

  // Track configuration changes for history
  useEffect(() => {
    if (isEnabled && patternInstances.size > 0) {
      const config = exportConfiguration();
      if (configHistory.length === 0 || JSON.stringify(config) !== JSON.stringify(configHistory[historyIndex])) {
        addToHistory(config);
      }
    }
  }, [patternInstances, isEnabled, exportConfiguration, configHistory, historyIndex, addToHistory]);

  const value = {
    // Core mode state
    isEnabled,
    toggleEnabled,
    
    // Pattern selection
    hoveredPattern,
    setHoveredPattern,
    selectedPattern,
    setSelectedPattern,
    selectedInstanceId,
    setSelectedInstanceId,
    
    // UI state
    drawerOpen,
    setDrawerOpen,
    drawerWidth,
    setDrawerWidth: handleSetDrawerWidth,
    
    // Pattern instance management
    patternInstances,
    registerPatternInstance,
    unregisterPatternInstance,
    updatePatternInstance,
    updateAllPatternInstances,
    getPatternInstances,
    getPatternInstanceCount,
    findPatternInstanceById,
    
    // Prototype management
    currentPrototype,
    setCurrentPrototype,
    
    // Prototype operations
    savePrototype,
    loadPrototype,
    createNewPrototype,
    exportConfiguration,
    importConfiguration,
    
    // Configuration history
    canUndo,
    canRedo,
    undo,
    redo,
    
    // Auto-save
    autoSaveEnabled,
    setAutoSaveEnabled,
    lastAutoSave,
  };

  return <ConfigurationModeContext.Provider value={value}>{children}</ConfigurationModeContext.Provider>;
};