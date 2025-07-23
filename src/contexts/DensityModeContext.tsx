import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

export type DensityMode = 'compact' | 'comfortable' | 'spacious';

interface DensityModeContextType {
  density: DensityMode;
  setDensity: (density: DensityMode) => void;
  spacing: number;
}

const DensityModeContext = createContext<DensityModeContextType | undefined>(undefined);

const DENSITY_STORAGE_KEY = 'mui-pattern-gen-density';

export const densitySpacingMap: Record<DensityMode, number> = {
  compact: 6,
  comfortable: 8,
  spacious: 10,
};

export const DensityModeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [density, setDensityState] = useState<DensityMode>(() => {
    const stored = localStorage.getItem(DENSITY_STORAGE_KEY);
    return (stored as DensityMode) || 'comfortable';
  });

  const setDensity = (newDensity: DensityMode) => {
    setDensityState(newDensity);
    localStorage.setItem(DENSITY_STORAGE_KEY, newDensity);
  };

  useEffect(() => {
    // Apply density class to root element for potential CSS usage
    document.documentElement.setAttribute('data-density', density);
  }, [density]);

  const value: DensityModeContextType = {
    density,
    setDensity,
    spacing: densitySpacingMap[density],
  };

  return (
    <DensityModeContext.Provider value={value}>
      {children}
    </DensityModeContext.Provider>
  );
};

export const useDensityMode = () => {
  const context = useContext(DensityModeContext);
  if (!context) {
    throw new Error('useDensityMode must be used within a DensityModeProvider');
  }
  return context;
};

// Helper hook to get component size based on density
export const useComponentSize = () => {
  const { density } = useDensityMode();
  
  return {
    buttonSize: density === 'compact' ? 'small' : density === 'spacious' ? 'large' : 'medium',
    textFieldSize: density === 'compact' ? 'small' : 'medium',
    tableSize: density === 'compact' ? 'small' : 'medium',
    listDense: density === 'compact',
    iconSize: density === 'compact' ? 'small' : density === 'spacious' ? 'large' : 'medium',
  } as const;
};

// Helper hook to get spacing values
export const useDensitySpacing = () => {
  const { density, spacing } = useDensityMode();
  
  return {
    spacing,
    paddingDense: density === 'compact' ? 1 : density === 'spacious' ? 3 : 2,
    paddingNormal: density === 'compact' ? 2 : density === 'spacious' ? 4 : 3,
    gapDense: density === 'compact' ? 1 : density === 'spacious' ? 2.5 : 2,
    gapNormal: density === 'compact' ? 2 : density === 'spacious' ? 4 : 3,
  };
};