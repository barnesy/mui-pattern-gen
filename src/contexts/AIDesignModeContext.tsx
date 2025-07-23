import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ComponentInfo {
  name: string;
  props: Record<string, any>;
  variant?: string;
  size?: string;
  color?: string;
  element: HTMLElement;
  rect: DOMRect;
  reference?: string;
  displayReference?: string;
  gridPosition?: string | null;
}

interface AIDesignModeContextType {
  isEnabled: boolean;
  toggleEnabled: () => void;
  hoveredComponent: ComponentInfo | null;
  setHoveredComponent: (info: ComponentInfo | null) => void;
  selectedComponent: ComponentInfo | null;
  setSelectedComponent: (info: ComponentInfo | null) => void;
  showOverlay: boolean;
  setShowOverlay: (show: boolean) => void;
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
  const [hoveredComponent, setHoveredComponent] = useState<ComponentInfo | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentInfo | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev);
    if (!isEnabled) {
      // Clear states when disabling
      setHoveredComponent(null);
      setSelectedComponent(null);
    }
  }, [isEnabled]);

  const value = {
    isEnabled,
    toggleEnabled,
    hoveredComponent,
    setHoveredComponent,
    selectedComponent,
    setSelectedComponent,
    showOverlay,
    setShowOverlay,
  };

  return (
    <AIDesignModeContext.Provider value={value}>
      {children}
    </AIDesignModeContext.Provider>
  );
};