import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { ComponentSchema, DataSourceSchema } from '../schemas/types';
import { validateData } from '../schemas/validation';
import { nanoid } from 'nanoid';

/**
 * Component instance - represents a placed component with configuration
 */
export interface ComponentInstance {
  id: string;
  schemaId: string;
  props: Record<string, any>;
  dataSource?: DataSourceSchema;
  parentId?: string;
  children?: string[];
  position?: {
    x: number;
    y: number;
    width?: number | string;
    height?: number | string;
  };
  metadata?: {
    createdAt: number;
    updatedAt: number;
    name?: string;
    locked?: boolean;
  };
}

/**
 * Design mode state
 */
interface DesignState {
  // Component registry
  schemas: Map<string, ComponentSchema>;
  instances: Map<string, ComponentInstance>;

  // Selection state
  selectedId: string | null;
  hoveredId: string | null;

  // UI state
  mode: 'design' | 'preview' | 'code';
  showGrid: boolean;
  snapToGrid: boolean;
  gridSize: number;

  // History for undo/redo
  history: ComponentInstance[][];
  historyIndex: number;
}

/**
 * Design mode actions
 */
interface DesignActions {
  // Schema management
  registerSchema: (schema: ComponentSchema) => void;
  registerSchemas: (schemas: ComponentSchema[]) => void;
  unregisterSchema: (schemaId: string) => void;

  // Instance management
  createInstance: (schemaId: string, props?: Record<string, any>, parentId?: string) => string;
  updateInstance: (id: string, updates: Partial<ComponentInstance>) => void;
  deleteInstance: (id: string) => void;
  duplicateInstance: (id: string) => string;
  moveInstance: (id: string, newParentId?: string, index?: number) => void;

  // Bulk operations
  updateInstances: (updates: Array<{ id: string; updates: Partial<ComponentInstance> }>) => void;
  deleteInstances: (ids: string[]) => void;

  // Selection
  selectInstance: (id: string | null) => void;
  hoverInstance: (id: string | null) => void;
  selectParent: () => void;
  selectChild: (index?: number) => void;

  // UI state
  setMode: (mode: 'design' | 'preview' | 'code') => void;
  toggleGrid: () => void;
  toggleSnapToGrid: () => void;
  setGridSize: (size: number) => void;

  // History
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // Queries
  getInstance: (id: string) => ComponentInstance | null;
  getSchema: (id: string) => ComponentSchema | null;
  getChildren: (parentId: string) => ComponentInstance[];
  getAncestors: (id: string) => ComponentInstance[];
  validateInstance: (id: string) => { valid: boolean; errors?: any[] };

  // Import/Export
  exportInstances: () => string;
  importInstances: (json: string) => void;
  clearAll: () => void;
}

type DesignStore = DesignState & DesignActions;

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
 * Design store for managing components and their instances
 */
export const useDesignStore = create<DesignStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      schemas: new Map(),
      instances: new Map(),
      selectedId: null,
      hoveredId: null,
      mode: 'design',
      showGrid: false,
      snapToGrid: true,
      gridSize: 8,
      history: [],
      historyIndex: -1,

      // Schema management
      registerSchema: (schema) => {
        set((state) => {
          const schemas = new Map(state.schemas);
          schemas.set(schema.id, schema);
          return { schemas };
        });
      },

      registerSchemas: (newSchemas) => {
        set((state) => {
          const schemas = new Map(state.schemas);
          newSchemas.forEach((schema) => {
            schemas.set(schema.id, schema);
          });
          return { schemas };
        });
      },

      unregisterSchema: (schemaId) => {
        set((state) => {
          const schemas = new Map(state.schemas);
          schemas.delete(schemaId);
          return { schemas };
        });
      },

      // Instance management
      createInstance: (schemaId, props = {}, parentId) => {
        const schema = get().schemas.get(schemaId);
        if (!schema) {
          console.error(`Schema ${schemaId} not found`);
          return '';
        }

        const instance = createNewInstance(schemaId, props, parentId);

        // Apply default props from schema
        if (schema.defaultProps) {
          instance.props = { ...schema.defaultProps, ...props };
        }

        set((state) => {
          const instances = new Map(state.instances);
          instances.set(instance.id, instance);

          // Update parent's children
          if (parentId) {
            const parent = instances.get(parentId);
            if (parent) {
              parent.children = [...(parent.children || []), instance.id];
              instances.set(parentId, { ...parent });
            }
          }

          return { instances };
        });

        return instance.id;
      },

      updateInstance: (id, updates) => {
        set((state) => {
          const instances = new Map(state.instances);
          const instance = instances.get(id);

          if (!instance) {return state;}

          const updated = {
            ...instance,
            ...updates,
            metadata: {
              ...instance.metadata,
              ...updates.metadata,
              updatedAt: Date.now(),
            },
          };

          instances.set(id, updated);
          return { instances };
        });
      },

      deleteInstance: (id) => {
        set((state) => {
          const instances = new Map(state.instances);
          const instance = instances.get(id);

          if (!instance) {return state;}

          // Delete all children recursively
          const deleteRecursive = (instanceId: string) => {
            const inst = instances.get(instanceId);
            if (inst?.children) {
              inst.children.forEach(deleteRecursive);
            }
            instances.delete(instanceId);
          };

          deleteRecursive(id);

          // Remove from parent's children
          if (instance.parentId) {
            const parent = instances.get(instance.parentId);
            if (parent) {
              parent.children = parent.children?.filter((childId) => childId !== id) || [];
              instances.set(instance.parentId, { ...parent });
            }
          }

          // Clear selection if deleted
          const updates: Partial<DesignState> = { instances };
          if (state.selectedId === id) {
            updates.selectedId = null;
          }
          if (state.hoveredId === id) {
            updates.hoveredId = null;
          }

          return updates;
        });
      },

      duplicateInstance: (id) => {
        const instance = get().instances.get(id);
        if (!instance) {return '';}

        const duplicateRecursive = (inst: ComponentInstance, parentId?: string): string => {
          const newId = get().createInstance(inst.schemaId, inst.props, parentId);
          const newInstance = get().instances.get(newId);

          if (newInstance && inst.children) {
            inst.children.forEach((childId) => {
              const child = get().instances.get(childId);
              if (child) {
                duplicateRecursive(child, newId);
              }
            });
          }

          return newId;
        };

        return duplicateRecursive(instance, instance.parentId);
      },

      moveInstance: (id, newParentId, index) => {
        set((state) => {
          const instances = new Map(state.instances);
          const instance = instances.get(id);

          if (!instance) {return state;}

          // Remove from old parent
          if (instance.parentId) {
            const oldParent = instances.get(instance.parentId);
            if (oldParent) {
              oldParent.children = oldParent.children?.filter((childId) => childId !== id) || [];
              instances.set(instance.parentId, { ...oldParent });
            }
          }

          // Add to new parent
          instance.parentId = newParentId;
          if (newParentId) {
            const newParent = instances.get(newParentId);
            if (newParent) {
              const children = [...(newParent.children || [])];
              if (index !== undefined) {
                children.splice(index, 0, id);
              } else {
                children.push(id);
              }
              newParent.children = children;
              instances.set(newParentId, { ...newParent });
            }
          }

          instances.set(id, { ...instance });
          return { instances };
        });
      },

      // Bulk operations
      updateInstances: (updates) => {
        set((state) => {
          const instances = new Map(state.instances);

          updates.forEach(({ id, updates }) => {
            const instance = instances.get(id);
            if (instance) {
              instances.set(id, {
                ...instance,
                ...updates,
                metadata: {
                  ...instance.metadata,
                  ...updates.metadata,
                  updatedAt: Date.now(),
                },
              });
            }
          });

          return { instances };
        });
      },

      deleteInstances: (ids) => {
        ids.forEach((id) => get().deleteInstance(id));
      },

      // Selection
      selectInstance: (id) => set({ selectedId: id }),
      hoverInstance: (id) => set({ hoveredId: id }),

      selectParent: () => {
        const { selectedId, instances } = get();
        if (!selectedId) {return;}

        const instance = instances.get(selectedId);
        if (instance?.parentId) {
          set({ selectedId: instance.parentId });
        }
      },

      selectChild: (index = 0) => {
        const { selectedId, instances } = get();
        if (!selectedId) {return;}

        const instance = instances.get(selectedId);
        if (instance?.children?.[index]) {
          set({ selectedId: instance.children[index] });
        }
      },

      // UI state
      setMode: (mode) => set({ mode }),
      toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
      toggleSnapToGrid: () => set((state) => ({ snapToGrid: !state.snapToGrid })),
      setGridSize: (gridSize) => set({ gridSize }),

      // History
      undo: () => {
        // TODO: Implement undo
      },

      redo: () => {
        // TODO: Implement redo
      },

      clearHistory: () => set({ history: [], historyIndex: -1 }),

      // Queries
      getInstance: (id) => get().instances.get(id) || null,

      getSchema: (id) => get().schemas.get(id) || null,

      getChildren: (parentId) => {
        const { instances } = get();
        const parent = instances.get(parentId);

        if (!parent?.children) {return [];}

        return parent.children
          .map((id) => instances.get(id))
          .filter((instance): instance is ComponentInstance => !!instance);
      },

      getAncestors: (id) => {
        const { instances } = get();
        const ancestors: ComponentInstance[] = [];

        let currentId = id;
        while (currentId) {
          const instance = instances.get(currentId);
          if (!instance) {break;}

          if (instance.parentId) {
            const parent = instances.get(instance.parentId);
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

      validateInstance: (id) => {
        const instance = get().instances.get(id);
        const schema = instance ? get().schemas.get(instance.schemaId) : null;

        if (!instance || !schema) {
          return { valid: false, errors: ['Instance or schema not found'] };
        }

        if (schema.dataShape && instance.props.data) {
          const result = validateData(instance.props.data, schema.dataShape);
          return { valid: result.valid, errors: result.errors };
        }

        return { valid: true };
      },

      // Import/Export
      exportInstances: () => {
        const { instances } = get();
        return JSON.stringify(Array.from(instances.values()), null, 2);
      },

      importInstances: (json) => {
        try {
          const data = JSON.parse(json);
          if (!Array.isArray(data)) {
            throw new Error('Invalid format');
          }

          const instances = new Map<string, ComponentInstance>();
          data.forEach((instance) => {
            instances.set(instance.id, instance);
          });

          set({ instances, selectedId: null, hoveredId: null });
        } catch (error) {
          console.error('Failed to import instances:', error);
        }
      },

      clearAll: () => {
        set({
          instances: new Map(),
          selectedId: null,
          hoveredId: null,
          history: [],
          historyIndex: -1,
        });
      },
    })),
    {
      name: 'design-store',
    }
  )
);

// Selectors for common queries
export const selectInstance = (id: string) => (state: DesignStore) => state.instances.get(id);
export const selectSchema = (id: string) => (state: DesignStore) => state.schemas.get(id);
export const selectChildren = (parentId: string) => (state: DesignStore) =>
  state.getChildren(parentId);
export const selectSelectedInstance = (state: DesignStore) =>
  state.selectedId ? state.instances.get(state.selectedId) : null;
