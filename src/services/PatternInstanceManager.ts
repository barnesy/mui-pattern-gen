import { EventEmitter } from 'events';

export interface PatternInstance {
  id: string;
  patternName: string;
  location: {
    pathname: string;
    componentTree: string[];
    iframe?: string;
  };
  element: WeakRef<HTMLElement>;
  timestamp: number;
}

export interface PatternUpdateEvent {
  patternName: string;
  instanceId?: string;
  props: Record<string, unknown>;
  updateAll?: boolean;
}

class PatternInstanceManagerClass extends EventEmitter {
  private static instance: PatternInstanceManagerClass;
  private registry: Map<string, Set<PatternInstance>> = new Map();
  private broadcastChannel: BroadcastChannel | null = null;
  private frameMessageHandlers: Map<string, (event: MessageEvent) => void> = new Map();

  private constructor() {
    super();
    this.initializeBroadcastChannel();
    this.setupGlobalListeners();
  }

  static getInstance(): PatternInstanceManagerClass {
    if (!PatternInstanceManagerClass.instance) {
      PatternInstanceManagerClass.instance = new PatternInstanceManagerClass();
    }
    return PatternInstanceManagerClass.instance;
  }

  private initializeBroadcastChannel() {
    try {
      this.broadcastChannel = new BroadcastChannel('pattern-updates');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data.type === 'PATTERN_UPDATE') {
          this.handleRemoteUpdate(event.data);
        }
      };
    } catch (error) {
      console.warn('BroadcastChannel not supported, falling back to localStorage events');
    }
  }

  private setupGlobalListeners() {
    // Listen for cross-frame messages
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'PATTERN_UPDATE') {
        this.handleRemoteUpdate(event.data);
      }
    });

    // Clean up dead references periodically
    setInterval(() => this.cleanupDeadReferences(), 30000);
  }

  registerInstance(instance: Omit<PatternInstance, 'id' | 'timestamp'>, providedId?: string): string {
    const id = providedId || this.generateInstanceId();
    const fullInstance: PatternInstance = {
      ...instance,
      id,
      timestamp: Date.now(),
    };

    const instances = this.registry.get(instance.patternName) || new Set();
    instances.add(fullInstance);
    this.registry.set(instance.patternName, instances);

    this.emit('instance-registered', fullInstance);
    return id;
  }

  unregisterInstance(instanceId: string) {
    for (const [patternName, instances] of this.registry.entries()) {
      const instance = Array.from(instances).find(inst => inst.id === instanceId);
      if (instance) {
        instances.delete(instance);
        if (instances.size === 0) {
          this.registry.delete(patternName);
        }
        this.emit('instance-unregistered', { patternName, instanceId });
        break;
      }
    }
  }

  notifyInstanceUpdate(instanceId: string) {
    const instance = this.findInstanceById(instanceId);
    if (instance) {
      this.broadcastUpdate({
        patternName: instance.patternName,
        instanceId,
      });
    }
  }

  notifyAllInstancesUpdate(patternName: string) {
    const instances = this.registry.get(patternName);
    if (instances) {
      this.broadcastUpdate({
        patternName,
        updateAll: true,
      });
    }
  }

  getInstances(patternName: string): PatternInstance[] {
    const instances = this.registry.get(patternName);
    return instances ? Array.from(instances) : [];
  }

  getAllPatterns(): string[] {
    return Array.from(this.registry.keys());
  }

  getInstanceCount(patternName: string): number {
    return this.registry.get(patternName)?.size || 0;
  }

  getTotalInstanceCount(): number {
    let total = 0;
    for (const instances of this.registry.values()) {
      total += instances.size;
    }
    return total;
  }

  private findInstanceById(instanceId: string): PatternInstance | null {
    for (const instances of this.registry.values()) {
      const instance = Array.from(instances).find(inst => inst.id === instanceId);
      if (instance) return instance;
    }
    return null;
  }

  private broadcastUpdate(update: PatternUpdateEvent) {
    // Emit local event
    this.emit('pattern-update', update);

    // Broadcast to other tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'PATTERN_UPDATE',
        ...update,
      });
    }

    // Send to all iframes
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      try {
        iframe.contentWindow?.postMessage({
          type: 'PATTERN_UPDATE',
          ...update,
        }, '*');
      } catch (error) {
        console.warn('Failed to send update to iframe:', error);
      }
    });

    // Send to parent if in iframe
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'PATTERN_UPDATE',
        ...update,
      }, '*');
    }
  }

  private handleRemoteUpdate(data: PatternUpdateEvent & { type: string }) {
    const { patternName, instanceId, props, updateAll } = data;

    if (updateAll) {
      const instances = this.registry.get(patternName);
      if (instances) {
        instances.forEach(instance => {
          instance.props = { ...instance.props, ...props };
          this.notifyInstanceUpdate(instance);
        });
      }
    } else if (instanceId) {
      const instance = this.findInstanceById(instanceId);
      if (instance) {
        instance.props = { ...instance.props, ...props };
        this.notifyInstanceUpdate(instance);
      }
    }
  }

  scrollToInstance(instanceId: string) {
    const instance = this.findInstanceById(instanceId);
    if (!instance) return;

    const element = instance.element.deref();
    if (!element) return;

    // Scroll into view
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    });

    // Emit event for other components to react
    this.emit('instance-scrolled', { instanceId, element });
  }


  private cleanupDeadReferences() {
    for (const [patternName, instances] of this.registry.entries()) {
      const aliveInstances = new Set<PatternInstance>();
      
      instances.forEach(instance => {
        // Check if element still exists
        if (instance.element.deref()) {
          aliveInstances.add(instance);
        }
      });

      if (aliveInstances.size === 0) {
        this.registry.delete(patternName);
      } else if (aliveInstances.size < instances.size) {
        this.registry.set(patternName, aliveInstances);
      }
    }
  }

  private generateInstanceId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup method for testing
  reset() {
    this.registry.clear();
    this.removeAllListeners();
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
  }
}

// Export singleton instance
export const PatternInstanceManager = PatternInstanceManagerClass.getInstance();