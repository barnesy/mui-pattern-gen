import React, { createContext, useContext, ReactNode } from 'react';

export interface PatternPropsContextValue {
  props: Record<string, unknown>;
  instanceId: string;
  patternName: string;
  updateProp: (name: string, value: unknown) => void;
}

export const PatternPropsContext = createContext<PatternPropsContextValue | undefined>(undefined);

export const usePatternProps = () => {
  const context = useContext(PatternPropsContext);
  return context; // Can be undefined if not in a pattern
};

export const useRequiredPatternProps = () => {
  const context = useContext(PatternPropsContext);
  if (!context) {
    throw new Error('useRequiredPatternProps must be used within PatternPropsProvider');
  }
  return context;
};

interface PatternPropsProviderProps {
  children: ReactNode;
  props: Record<string, unknown>;
  instanceId: string;
  patternName: string;
  updateProp: (name: string, value: unknown) => void;
}

export const PatternPropsProvider: React.FC<PatternPropsProviderProps> = ({
  children,
  props,
  instanceId,
  patternName,
  updateProp,
}) => {
  const value = React.useMemo(
    () => ({
      props,
      instanceId,
      patternName,
      updateProp,
    }),
    [props, instanceId, patternName, updateProp]
  );

  return <PatternPropsContext.Provider value={value}>{children}</PatternPropsContext.Provider>;
};
