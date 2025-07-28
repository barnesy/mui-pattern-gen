# Sub-Component Update Architecture Plan

## Overview
This document outlines the plan to implement proper update mechanisms for sub-components, mirroring the successful pattern update architecture.

## Current State

### Pattern Updates (Working)
1. **PatternWrapper** manages state and listens to events
2. **AIDesignModeContext** provides update methods
3. **Event System** dispatches `pattern-update-request` events
4. **PatternInstanceManager** tracks instances and handles cross-frame updates

### Sub-Component Updates (Not Working)
1. **SubComponentWrapper** only uses `React.cloneElement` (no event listening)
2. **No dedicated update mechanism** for sub-components
3. **Relies on parent re-render** which is unreliable

## Proposed Solution: Event-Driven Architecture

### 1. Extend AIDesignModeContext

```typescript
// Add to AIDesignModeContext interface:
updateSubComponentInstance: (instanceId: string, props: Record<string, unknown>) => void;
```

### 2. Update SubComponentWrapper

Transform SubComponentWrapper to be stateful and event-driven:

```typescript
export const SubComponentWrapper: React.FC<SubComponentWrapperProps> = ({
  componentName,
  componentType,
  index,
  children,
  componentProps = {},
}) => {
  // Add state management
  const [currentProps, setCurrentProps] = useState(componentProps);
  
  // Listen for update events
  useEffect(() => {
    const handleUpdateRequest = (event: CustomEvent) => {
      const { instanceId, props } = event.detail;
      if (instanceId === subInstanceId) {
        setCurrentProps(props);
      }
    };
    
    window.addEventListener('subcomponent-update-request', handleUpdateRequest);
    return () => {
      window.removeEventListener('subcomponent-update-request', handleUpdateRequest);
    };
  }, [subInstanceId]);
  
  // Merge props when selected
  const effectiveProps = useMemo(() => {
    if (isSelected && selectedPattern?.props) {
      return { ...currentProps, ...selectedPattern.props };
    }
    return currentProps;
  }, [currentProps, isSelected, selectedPattern?.props]);
};
```

### 3. Update AIDesignModeDrawer

Modify the handlePropChange to dispatch sub-component events:

```typescript
if (selectedPattern.isSubComponent) {
  // Dispatch sub-component update event
  const event = new CustomEvent('subcomponent-update-request', {
    detail: { 
      instanceId: selectedPattern.instanceId, 
      props: newProps 
    },
    bubbles: true,
  });
  window.dispatchEvent(event);
} else {
  // Existing pattern update logic
}
```

### 4. Extend PatternInstanceManager

Add sub-component update notifications:

```typescript
notifySubComponentUpdate(instanceId: string): void {
  this.emit('subcomponent-update', { instanceId });
  
  // Broadcast to other frames/windows
  if (this.broadcastChannel) {
    this.broadcastChannel.postMessage({
      type: 'SUBCOMPONENT_UPDATE',
      instanceId,
    });
  }
}
```

## Implementation Steps

1. **Phase 1: Core Infrastructure**
   - [ ] Add `updateSubComponentInstance` to AIDesignModeContext
   - [ ] Add sub-component update event dispatching
   - [ ] Update PatternInstanceManager for sub-component tracking

2. **Phase 2: SubComponentWrapper State Management**
   - [ ] Convert SubComponentWrapper to stateful component
   - [ ] Add event listener for `subcomponent-update-request`
   - [ ] Implement proper prop merging with state

3. **Phase 3: Event Dispatching**
   - [ ] Update AIDesignModeDrawer to dispatch sub-component events
   - [ ] Ensure proper event bubbling and capture

4. **Phase 4: Cross-Frame Support**
   - [ ] Add BroadcastChannel support for sub-components
   - [ ] Handle cross-frame sub-component updates

5. **Phase 5: Testing & Refinement**
   - [ ] Test with nested sub-components
   - [ ] Test with multiple instances
   - [ ] Test cross-frame updates

## Benefits

1. **Consistent Architecture**: Mirrors successful pattern update system
2. **Decoupled Updates**: No dependency on parent re-renders
3. **Event-Driven**: Reliable, traceable update flow
4. **Scalable**: Works with any nesting level
5. **Cross-Frame Compatible**: Updates work across iframes

## Migration Path

1. Keep existing `React.cloneElement` as fallback
2. Gradually migrate to event-driven updates
3. Maintain backwards compatibility during transition

## Alternative Considerations

### Context-Only Approach
- Pros: Simpler, uses React patterns
- Cons: Limited to parent-child relationships, no cross-component updates

### Redux/State Management
- Pros: Centralized state, time-travel debugging
- Cons: Over-engineering for this use case

## Conclusion

The event-driven architecture provides the most flexible and reliable solution for sub-component updates, maintaining consistency with the existing pattern update system while providing the necessary decoupling for reliable updates.