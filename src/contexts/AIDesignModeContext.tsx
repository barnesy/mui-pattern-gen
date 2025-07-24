import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PatternInstanceManager, PatternInstance } from '../services/PatternInstanceManager';

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

interface AIDesignModeContextType {
  isEnabled: boolean;
  toggleEnabled: () => void;
  hoveredPattern: PatternInfo | null;
  setHoveredPattern: (info: PatternInfo | null) => void;
  selectedPattern: PatternInfo | null;
  setSelectedPattern: (info: PatternInfo | null) => void;
  selectedInstanceId: string | null;
  setSelectedInstanceId: (id: string | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  drawerWidth: number;
  setDrawerWidth: (width: number) => void;
  patternInstances: Map<string, PatternInfo[]>;
  registerPatternInstance: (pattern: PatternInfo) => void;
  unregisterPatternInstance: (instanceId: string) => void;
  updatePatternInstance: (instanceId: string, props: Record<string, unknown>) => void;
  updateAllPatternInstances: (patternName: string, props: Record<string, unknown>) => void;
  getPatternInstances: (patternName: string) => PatternInstance[];
  getPatternInstanceCount: (patternName: string) => number;
  findPatternInstanceById: (instanceId: string) => PatternInstance | null;
}

export const AIDesignModeContext = createContext<AIDesignModeContextType | undefined>(undefined);

export const useAIDesignMode = () => {
  const context = useContext(AIDesignModeContext);
  if (!context) {
    throw new Error('useAIDesignMode must be used within AIDesignModeProvider');
  }
  return context;
};

interface AIDesignModeProviderProps {
  children: ReactNode;
}

export const AIDesignModeProvider: React.FC<AIDesignModeProviderProps> = ({ children }) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [hoveredPattern, setHoveredPattern] = useState<PatternInfo | null>(null);
  const [selectedPattern, setSelectedPattern] = useState<PatternInfo | null>(null);
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(400);
  const [patternInstances, setPatternInstances] = useState<Map<string, PatternInfo[]>>(new Map());

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (!isEnabled) {
      // Clear states when disabling
      setHoveredPattern(null);
      setSelectedPattern(null);
      setSelectedInstanceId(null);
      setDrawerOpen(false);
    }
  }, [isEnabled]);

  const registerPatternInstance = useCallback((pattern: PatternInfo) => {
    setPatternInstances(prev => {
      const newMap = new Map(prev);
      const instances = newMap.get(pattern.name) || [];
      
      // Check if instance already exists
      const existingIndex = instances.findIndex(p => p.instanceId === pattern.instanceId);
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
    setPatternInstances(prev => {
      const newMap = new Map(prev);
      
      newMap.forEach((instances, patternName) => {
        const filtered = instances.filter(p => p.instanceId !== instanceId);
        if (filtered.length === 0) {
          newMap.delete(patternName);
        } else {
          newMap.set(patternName, filtered);
        }
      });
      
      return newMap;
    });
    
  }, []);

  const updatePatternInstance = useCallback((instanceId: string, props: Record<string, unknown>) => {
    
    // Notify the pattern instance that it should update
    PatternInstanceManager.notifyInstanceUpdate(instanceId);
    
    // Also emit a custom event for the specific instance
    const event = new CustomEvent('pattern-update-request', {
      detail: { instanceId, props },
      bubbles: true,
    });
    window.dispatchEvent(event);
  }, []);

  const updateAllPatternInstances = useCallback((patternName: string, props: Record<string, unknown>) => {
    
    // Notify all instances of this pattern
    PatternInstanceManager.notifyAllInstancesUpdate(patternName);
    
    // Also emit a custom event for all instances
    const event = new CustomEvent('pattern-update-request', {
      detail: { patternName, props, updateAll: true },
      bubbles: true,
    });
    window.dispatchEvent(event);
  }, []);

  const getPatternInstances = useCallback((patternName: string) => {
    return PatternInstanceManager.getInstances(patternName);
  }, []);

  const getPatternInstanceCount = useCallback((patternName: string) => {
    return PatternInstanceManager.getInstanceCount(patternName);
  }, []);

  const findPatternInstanceById = useCallback((instanceId: string) => {
    return PatternInstanceManager.findInstanceById(instanceId);
  }, []);

  // Load drawer width from localStorage
  React.useEffect(() => {
    const savedWidth = localStorage.getItem('ai-design-drawer-width');
    if (savedWidth) {
      setDrawerWidth(parseInt(savedWidth, 10));
    }
  }, []);

  // Save drawer width to localStorage
  const handleSetDrawerWidth = useCallback((width: number) => {
    setDrawerWidth(width);
    localStorage.setItem('ai-design-drawer-width', width.toString());
  }, []);

  const value = {
    isEnabled,
    toggleEnabled,
    hoveredPattern,
    setHoveredPattern,
    selectedPattern,
    setSelectedPattern,
    selectedInstanceId,
    setSelectedInstanceId,
    drawerOpen,
    setDrawerOpen,
    drawerWidth,
    setDrawerWidth: handleSetDrawerWidth,
    patternInstances,
    registerPatternInstance,
    unregisterPatternInstance,
    updatePatternInstance,
    updateAllPatternInstances,
    getPatternInstances,
    getPatternInstanceCount,
    findPatternInstanceById,
  };

  return (
    <AIDesignModeContext.Provider value={value}>
      {children}
    </AIDesignModeContext.Provider>
  );
};