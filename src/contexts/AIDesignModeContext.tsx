import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface PatternInfo {
  name: string;
  status: 'pending' | 'accepted';
  category: string;
  instanceId: string;
  props: Record<string, any>;
  element: HTMLElement;
  rect: DOMRect;
  hasConfig?: boolean;
  configPath?: string;
}

interface AIDesignModeContextType {
  isEnabled: boolean;
  toggleEnabled: () => void;
  hoveredPattern: PatternInfo | null;
  setHoveredPattern: (info: PatternInfo | null) => void;
  selectedPattern: PatternInfo | null;
  setSelectedPattern: (info: PatternInfo | null) => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
  drawerWidth: number;
  setDrawerWidth: (width: number) => void;
  patternInstances: Map<string, PatternInfo[]>;
  registerPatternInstance: (pattern: PatternInfo) => void;
  unregisterPatternInstance: (instanceId: string) => void;
}

const AIDesignModeContext = createContext<AIDesignModeContextType | undefined>(undefined);

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerWidth, setDrawerWidth] = useState(400);
  const [patternInstances] = useState<Map<string, PatternInfo[]>>(new Map());

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (!isEnabled) {
      // Clear states when disabling
      setHoveredPattern(null);
      setSelectedPattern(null);
      setDrawerOpen(false);
    }
  }, [isEnabled]);

  const registerPatternInstance = useCallback((pattern: PatternInfo) => {
    const instances = patternInstances.get(pattern.name) || [];
    instances.push(pattern);
    patternInstances.set(pattern.name, instances);
  }, [patternInstances]);

  const unregisterPatternInstance = useCallback((instanceId: string) => {
    patternInstances.forEach((instances, patternName) => {
      const filtered = instances.filter(p => p.instanceId !== instanceId);
      if (filtered.length === 0) {
        patternInstances.delete(patternName);
      } else {
        patternInstances.set(patternName, filtered);
      }
    });
  }, [patternInstances]);

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
    drawerOpen,
    setDrawerOpen,
    drawerWidth,
    setDrawerWidth: handleSetDrawerWidth,
    patternInstances,
    registerPatternInstance,
    unregisterPatternInstance,
  };

  return (
    <AIDesignModeContext.Provider value={value}>
      {children}
    </AIDesignModeContext.Provider>
  );
};