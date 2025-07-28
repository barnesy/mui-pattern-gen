import React, { createContext, useContext, useReducer, useMemo, useCallback } from 'react';
import { ComponentSchema } from '../schemas/types';
import { nanoid } from 'nanoid';

/**
 * Component instance - represents a placed component with configuration
 */
export interface ComponentInstance {
  id: string;
  schemaId: string;
  props: Record<string, any>;
  parentId?: string;
  children?: string[];
  metadata?: {
    createdAt: number;
    updatedAt: number;
    name?: string;
    locked?: boolean;
    isSubComponent?: boolean;
    subComponentType?: string;
  };
}

/**
 * Design system state
 */
interface DesignState {
  schemas: Map<string, ComponentSchema>;
  instances: Map<string, ComponentInstance>;
  selectedId: string | null;
  hoveredId: string | null;
}

/**
 * Design system actions
 */
type DesignAction =
  | { type: 'REGISTER_SCHEMA'; schema: ComponentSchema }
  | { type: 'REGISTER_SCHEMAS'; schemas: ComponentSchema[] }
  | {
      type: 'CREATE_INSTANCE';
      schemaId: string;
      props?: Record<string, any>;
      parentId?: string;
      id: string;
      metadata?: Partial<ComponentInstance['metadata']>;
    }
  | { type: 'UPDATE_INSTANCE'; id: string; updates: Partial<ComponentInstance> }
  | { type: 'DELETE_INSTANCE'; id: string }
  | { type: 'SELECT_INSTANCE'; id: string | null }
  | { type: 'HOVER_INSTANCE'; id: string | null }
  | { type: 'CLEAR_ALL' };

/**
 * Context interface
 */
interface DesignContextValue extends DesignState {
  // Actions
  registerSchema: (schema: ComponentSchema) => void;
  registerSchemas: (schemas: ComponentSchema[]) => void;
  createInstance: (
    schemaId: string,
    props?: Record<string, any>,
    parentId?: string,
    metadata?: Partial<ComponentInstance['metadata']>
  ) => string;
  updateInstance: (id: string, updates: Partial<ComponentInstance>) => void;
  deleteInstance: (id: string) => void;
  selectInstance: (id: string | null) => void;
  hoverInstance: (id: string | null) => void;
  clearAll: () => void;

  // Selectors
  getInstance: (id: string) => ComponentInstance | null;
  getSchema: (id: string) => ComponentSchema | null;
  getChildren: (parentId: string) => ComponentInstance[];
  getAncestors: (id: string) => ComponentInstance[];
}

const DesignContext = createContext<DesignContextValue | null>(null);

/**
 * Initial state
 */
const initialState: DesignState = {
  schemas: new Map(),
  instances: new Map(),
  selectedId: null,
  hoveredId: null,
};

/**
 * Create a new component instance
 */
function createNewInstance(
  schemaId: string,
  props: Record<string, any> = {},
  parentId?: string
): ComponentInstance {
  return {
    id: nanoid(),
    schemaId,
    props,
    parentId,
    children: [],
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  };
}

/**
 * Design system reducer
 */
function designReducer(state: DesignState, action: DesignAction): DesignState {
  switch (action.type) {
    case 'REGISTER_SCHEMA': {
      const schemas = new Map(state.schemas);
      schemas.set(action.schema.id, action.schema);
      return { ...state, schemas };
    }

    case 'REGISTER_SCHEMAS': {
      const schemas = new Map(state.schemas);
      action.schemas.forEach((schema) => {
        schemas.set(schema.id, schema);
      });
      return { ...state, schemas };
    }

    case 'CREATE_INSTANCE': {
      const schema = state.schemas.get(action.schemaId);
      if (!schema) {
        console.error(`Schema ${action.schemaId} not found`);
        return state;
      }

      const instance: ComponentInstance = {
        id: action.id,
        schemaId: action.schemaId,
        props: action.props || {},
        parentId: action.parentId,
        children: [],
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          ...action.metadata,
        },
      };

      // Apply default props from schema
      if (schema.defaultProps) {
        instance.props = { ...schema.defaultProps, ...action.props };
      }

      const instances = new Map(state.instances);
      instances.set(instance.id, instance);

      // Update parent's children
      if (action.parentId) {
        const parent = instances.get(action.parentId);
        if (parent) {
          const updatedParent = {
            ...parent,
            children: [...(parent.children || []), instance.id],
          };
          instances.set(action.parentId, updatedParent);
        }
      }

      return { ...state, instances };
    }

    case 'UPDATE_INSTANCE': {
      const instance = state.instances.get(action.id);
      if (!instance) {return state;}

      const instances = new Map(state.instances);
      const updated = {
        ...instance,
        ...action.updates,
        metadata: {
          ...instance.metadata,
          ...action.updates.metadata,
          updatedAt: Date.now(),
        },
      };

      instances.set(action.id, updated);
      return { ...state, instances };
    }

    case 'DELETE_INSTANCE': {
      const instance = state.instances.get(action.id);
      if (!instance) {return state;}

      const instances = new Map(state.instances);

      // Delete all children recursively
      const deleteRecursive = (instanceId: string) => {
        const inst = instances.get(instanceId);
        if (inst?.children) {
          inst.children.forEach(deleteRecursive);
        }
        instances.delete(instanceId);
      };

      deleteRecursive(action.id);

      // Remove from parent's children
      if (instance.parentId) {
        const parent = instances.get(instance.parentId);
        if (parent) {
          const updatedParent = {
            ...parent,
            children: parent.children?.filter((childId) => childId !== action.id) || [],
          };
          instances.set(instance.parentId, updatedParent);
        }
      }

      // Clear selection if deleted
      const updates: Partial<DesignState> = { instances };
      if (state.selectedId === action.id) {
        updates.selectedId = null;
      }
      if (state.hoveredId === action.id) {
        updates.hoveredId = null;
      }

      return { ...state, ...updates };
    }

    case 'SELECT_INSTANCE':
      return { ...state, selectedId: action.id };

    case 'HOVER_INSTANCE':
      return { ...state, hoveredId: action.id };

    case 'CLEAR_ALL':
      return {
        ...state,
        instances: new Map(),
        selectedId: null,
        hoveredId: null,
      };

    default:
      return state;
  }
}

/**
 * Design System Provider
 */
export const DesignSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(designReducer, initialState);

  // Action creators
  const registerSchema = useCallback((schema: ComponentSchema) => {
    dispatch({ type: 'REGISTER_SCHEMA', schema });
  }, []);

  const registerSchemas = useCallback((schemas: ComponentSchema[]) => {
    dispatch({ type: 'REGISTER_SCHEMAS', schemas });
  }, []);

  const createInstance = useCallback(
    (
      schemaId: string,
      props?: Record<string, any>,
      parentId?: string,
      metadata?: Partial<ComponentInstance['metadata']>
    ) => {
      const newId = nanoid();
      dispatch({ type: 'CREATE_INSTANCE', schemaId, props, parentId, id: newId, metadata });
      return newId;
    },
    []
  );

  const updateInstance = useCallback((id: string, updates: Partial<ComponentInstance>) => {
    dispatch({ type: 'UPDATE_INSTANCE', id, updates });
  }, []);

  const deleteInstance = useCallback((id: string) => {
    dispatch({ type: 'DELETE_INSTANCE', id });
  }, []);

  const selectInstance = useCallback((id: string | null) => {
    dispatch({ type: 'SELECT_INSTANCE', id });
  }, []);

  const hoverInstance = useCallback((id: string | null) => {
    dispatch({ type: 'HOVER_INSTANCE', id });
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  // Selectors
  const getInstance = useCallback(
    (id: string) => {
      return state.instances.get(id) || null;
    },
    [state.instances]
  );

  const getSchema = useCallback(
    (id: string) => {
      return state.schemas.get(id) || null;
    },
    [state.schemas]
  );

  const getChildren = useCallback(
    (parentId: string) => {
      const parent = state.instances.get(parentId);
      if (!parent?.children) {return [];}

      return parent.children
        .map((id) => state.instances.get(id))
        .filter((instance): instance is ComponentInstance => !!instance);
    },
    [state.instances]
  );

  const getAncestors = useCallback(
    (id: string) => {
      const ancestors: ComponentInstance[] = [];

      let currentId = id;
      while (currentId) {
        const instance = state.instances.get(currentId);
        if (!instance) {break;}

        if (instance.parentId) {
          const parent = state.instances.get(instance.parentId);
          if (parent) {
            ancestors.push(parent);
            currentId = instance.parentId;
          } else {
            break;
          }
        } else {
          break;
        }
      }

      return ancestors;
    },
    [state.instances]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      ...state,
      registerSchema,
      registerSchemas,
      createInstance,
      updateInstance,
      deleteInstance,
      selectInstance,
      hoverInstance,
      clearAll,
      getInstance,
      getSchema,
      getChildren,
      getAncestors,
    }),
    [
      state,
      registerSchema,
      registerSchemas,
      createInstance,
      updateInstance,
      deleteInstance,
      selectInstance,
      hoverInstance,
      clearAll,
      getInstance,
      getSchema,
      getChildren,
      getAncestors,
    ]
  );

  return <DesignContext.Provider value={value}>{children}</DesignContext.Provider>;
};

/**
 * Hook to use the design system context
 */
export function useDesignSystem(): DesignContextValue {
  const context = useContext(DesignContext);
  if (!context) {
    throw new Error('useDesignSystem must be used within a DesignSystemProvider');
  }
  return context;
}

// Export types
export type { DesignAction, DesignContextValue };
