import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

export interface PatternWrapperProps {
  patternName: string;
  status: 'pending' | 'accepted';
  category: string;
  children: React.ReactNode;
  patternProps?: Record<string, any>;
}

/**
 * Wrapper component that identifies patterns for AI Design Mode
 * This wraps all pattern components to make them detectable
 */
export const PatternWrapper: React.FC<PatternWrapperProps> = ({
  patternName,
  status,
  category,
  children,
  patternProps = {},
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Generate unique instance ID
  const instanceId = React.useMemo(() => {
    return `${patternName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, [patternName]);

  return (
    <Box
      ref={wrapperRef}
      data-pattern-name={patternName}
      data-pattern-status={status}
      data-pattern-category={category}
      data-pattern-instance={instanceId}
      data-pattern-props={JSON.stringify(patternProps)}
      sx={{ 
        position: 'relative',
        display: 'block',
        // Inherit sizing from children
        width: 'fit-content',
        height: 'fit-content',
      }}
    >
      {children}
    </Box>
  );
};