import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
  useRef,
} from 'react';

// Types
export interface ComponentProps {
  id: string;
  type: 'pattern' | 'subcomponent';
  name: string;
  props: Record<string, unknown>;
  parentId?: string;
  metadata?: {
    category?: string;
    status?: string;
    componentType?: string;
    index?: number;
  };
}

interface PropsStoreState {
  components: Map<string, ComponentProps>;
  // Track parent-child relationships
  childrenMap: Map<string, Set<string>>;
}

type PropsStoreAction =
  | { type: 'REGISTER_COMPONENT'; payload: ComponentProps }
  | { type: 'UNREGISTER_COMPONENT'; payload: { id: string } }
  | { type: 'UPDATE_PROPS'; payload: { id: string; props: Record<string, unknown> } }
  | { type: 'UPDATE_ALL_BY_NAME'; payload: { name: string; props: Record<string, unknown> } }
  | { type: 'BATCH_UPDATE'; payload: Array<{ id: string; props: Record<string, unknown> }> };

// Reducer
function propsStoreReducer(state: PropsStoreState, action: PropsStoreAction): PropsStoreState {
  switch (action.type) {
    case 'REGISTER_COMPONENT': {
      const { id, parentId } = action.payload;
      const newComponents = new Map(state.components);
      const newChildrenMap = new Map(state.childrenMap);

      // Register component
      newComponents.set(id, action.payload);

      // Update parent-child relationship
      if (parentId) {
        const children = new Set(newChildrenMap.get(parentId) || []);
        children.add(id);
        newChildrenMap.set(parentId, children);
      }

      return {
        components: newComponents,
        childrenMap: newChildrenMap,
      };
    }

    case 'UNREGISTER_COMPONENT': {
      const { id } = action.payload;
      const newComponents = new Map(state.components);
      const newChildrenMap = new Map(state.childrenMap);

      const component = newComponents.get(id);
      if (!component) {return state;}

      // Remove component
      newComponents.delete(id);

      // Remove from parent's children
      if (component.parentId) {
        const children = newChildrenMap.get(component.parentId);
        if (children) {
          children.delete(id);
          if (children.size === 0) {
            newChildrenMap.delete(component.parentId);
          }
        }
      }

      // Remove children recursively
      const childrenToRemove = newChildrenMap.get(id);
      if (childrenToRemove) {
        childrenToRemove.forEach((childId) => {
          newComponents.delete(childId);
        });
        newChildrenMap.delete(id);
      }

      return {
        components: newComponents,
        childrenMap: newChildrenMap,
      };
    }

    case 'UPDATE_PROPS': {
      const { id, props } = action.payload;
      const component = state.components.get(id);
      if (!component) {return state;}

      const newComponents = new Map(state.components);
      newComponents.set(id, {
        ...component,
        props: { ...component.props, ...props },
      });

      return { ...state, components: newComponents };
    }

    case 'UPDATE_ALL_BY_NAME': {
      const { name, props } = action.payload;
      const newComponents = new Map(state.components);

      state.components.forEach((component, id) => {
        if (component.name === name && component.type === 'pattern') {
          newComponents.set(id, {
            ...component,
            props: { ...component.props, ...props },
          });
        }
      });

      return { ...state, components: newComponents };
    }

    case 'BATCH_UPDATE': {
      const newComponents = new Map(state.components);

      action.payload.forEach(({ id, props }) => {
        const component = newComponents.get(id);
        if (component) {
          newComponents.set(id, {
            ...component,
            props: { ...component.props, ...props },
          });
        }
      });

      return { ...state, components: newComponents };
    }

    default:
      return state;
  }
}

// Context
interface PropsStoreContextValue {
  // State
  getComponent: (id: string) => ComponentProps | undefined;
  getComponentProps: (id: string) => Record<string, unknown> | undefined;
  getChildren: (parentId: string) => ComponentProps[];
  getComponentsByName: (name: string) => ComponentProps[];

  // Actions
  registerComponent: (component: ComponentProps) => void;
  unregisterComponent: (id: string) => void;
  updateProps: (id: string, props: Record<string, unknown>) => void;
  updateAllByName: (name: string, props: Record<string, unknown>) => void;
  batchUpdate: (updates: Array<{ id: string; props: Record<string, unknown> }>) => void;

  // Subscribers
  subscribe: (id: string, callback: (props: Record<string, unknown>) => void) => () => void;
}

const PropsStoreContext = createContext<PropsStoreContextValue | undefined>(undefined);

export const usePropsStore = () => {
  const context = useContext(PropsStoreContext);
  if (!context) {
    throw new Error('usePropsStore must be used within PropsStoreProvider');
  }
  return context;
};

// Provider
interface PropsStoreProviderProps {
  children: ReactNode;
}

export const PropsStoreProvider: React.FC<PropsStoreProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(propsStoreReducer, {
    components: new Map(),
    childrenMap: new Map(),
  });

  // Store state in ref for callbacks
  const stateRef = useRef(state);
  stateRef.current = state;

  // Subscribers for prop changes
  const subscribersRef = useRef<Map<string, Set<(props: Record<string, unknown>) => void>>>(
    new Map()
  );

  // Notify subscribers when props change
  const notifySubscribers = useCallback((id: string, props: Record<string, unknown>) => {
    const subscribers = subscribersRef.current.get(id);
    if (subscribers) {
      subscribers.forEach((callback) => callback(props));
    }
  }, []);

  // State getters
  const getComponent = useCallback(
    (id: string) => {
      return state.components.get(id);
    },
    [state.components]
  );

  const getComponentProps = useCallback(
    (id: string) => {
      return state.components.get(id)?.props;
    },
    [state.components]
  );

  const getChildren = useCallback(
    (parentId: string) => {
      const childIds = state.childrenMap.get(parentId);
      if (!childIds) {return [];}

      const children: ComponentProps[] = [];
      childIds.forEach((id) => {
        const child = state.components.get(id);
        if (child) {children.push(child);}
      });

      return children;
    },
    [state.components, state.childrenMap]
  );

  const getComponentsByName = useCallback(
    (name: string) => {
      const components: ComponentProps[] = [];
      state.components.forEach((component) => {
        if (component.name === name) {
          components.push(component);
        }
      });
      return components;
    },
    [state.components]
  );

  // Actions
  const registerComponent = useCallback((component: ComponentProps) => {
    dispatch({ type: 'REGISTER_COMPONENT', payload: component });
  }, []);

  const unregisterComponent = useCallback((id: string) => {
    dispatch({ type: 'UNREGISTER_COMPONENT', payload: { id } });
    // Clean up subscribers
    subscribersRef.current.delete(id);
  }, []);

  const updateProps = useCallback(
    (id: string, props: Record<string, unknown>) => {
      dispatch({ type: 'UPDATE_PROPS', payload: { id, props } });

      // Schedule notification for next tick to ensure state is updated
      setTimeout(() => {
        const component = stateRef.current.components.get(id);
        if (component) {
          const newProps = { ...component.props, ...props };
          notifySubscribers(id, newProps);
        }
      }, 0);
    },
    [notifySubscribers]
  );

  const updateAllByName = useCallback(
    (name: string, props: Record<string, unknown>) => {
      dispatch({ type: 'UPDATE_ALL_BY_NAME', payload: { name, props } });

      // Notify all subscribers of this pattern
      stateRef.current.components.forEach((component, id) => {
        if (component.name === name && component.type === 'pattern') {
          const newProps = { ...component.props, ...props };
          notifySubscribers(id, newProps);
        }
      });
    },
    [notifySubscribers]
  );

  const batchUpdate = useCallback(
    (updates: Array<{ id: string; props: Record<string, unknown> }>) => {
      dispatch({ type: 'BATCH_UPDATE', payload: updates });

      // Notify subscribers for each update
      updates.forEach(({ id, props }) => {
        const component = stateRef.current.components.get(id);
        if (component) {
          const newProps = { ...component.props, ...props };
          notifySubscribers(id, newProps);
        }
      });
    },
    [notifySubscribers]
  );

  // Subscribe to prop changes
  const subscribe = useCallback(
    (id: string, callback: (props: Record<string, unknown>) => void) => {
      if (!subscribersRef.current.has(id)) {
        subscribersRef.current.set(id, new Set());
      }
      subscribersRef.current.get(id)!.add(callback);

      // Return unsubscribe function
      return () => {
        const subscribers = subscribersRef.current.get(id);
        if (subscribers) {
          subscribers.delete(callback);
          if (subscribers.size === 0) {
            subscribersRef.current.delete(id);
          }
        }
      };
    },
    []
  );

  const value: PropsStoreContextValue = {
    getComponent,
    getComponentProps,
    getChildren,
    getComponentsByName,
    registerComponent,
    unregisterComponent,
    updateProps,
    updateAllByName,
    batchUpdate,
    subscribe,
  };

  return <PropsStoreContext.Provider value={value}>{children}</PropsStoreContext.Provider>;
};

// Helper hook for components to use their props from the store
export const useComponentProps = (id: string) => {
  const { getComponentProps, subscribe } = usePropsStore();
  const [props, setProps] = React.useState<Record<string, unknown> | undefined>(() =>
    getComponentProps(id)
  );

  React.useEffect(() => {
    // Get initial props
    setProps(getComponentProps(id));

    // Subscribe to updates
    const unsubscribe = subscribe(id, (newProps) => {
      setProps(newProps);
    });

    return unsubscribe;
  }, [id, getComponentProps, subscribe]);

  return props;
};
