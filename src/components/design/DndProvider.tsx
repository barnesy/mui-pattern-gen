import React from 'react';
import { DndProvider as ReactDndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Detect if we're on a touch device
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export interface DndProviderProps {
  children: React.ReactNode;
}

/**
 * DnD Provider that automatically selects the right backend
 */
export const DndProvider: React.FC<DndProviderProps> = ({ children }) => {
  const backend = isTouchDevice ? TouchBackend : HTML5Backend;

  return <ReactDndProvider backend={backend}>{children}</ReactDndProvider>;
};
