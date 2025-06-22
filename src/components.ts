// Use Figma plugin typings for node types
// Remove custom ComponentNode, ComponentInstance, etc.
// Use SceneNode, ComponentNode, InstanceNode, etc. as needed

// Component registry for Figma nodes
class ComponentRegistry {
  private static instance: ComponentRegistry;
  private components: Map<string, ComponentNode>;

  private constructor() {
    this.components = new Map();
  }

  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  public registerComponent(componentId: string, component: ComponentNode): void {
    this.components.set(componentId, component);
  }

  public getComponent(componentId: string): ComponentNode | undefined {
    return this.components.get(componentId);
  }

  // Example: createInstance returns InstanceNode (or undefined if not found)
  public createInstance(componentId: string): InstanceNode | undefined {
    // This is a mock; in a real plugin, you would use figma.createInstance or similar
    // Here, we just return undefined as a placeholder
    return undefined;
  }
}

// Example usage with the button component from the design
const buttonComponent: ComponentNode = {
  id: '222:46',
  name: 'Button',
  type: 'COMPONENT',
  parent: null as any, // In real Figma, this would be set by the document
  removed: false,
  // Add other required properties as needed for your use case
} as ComponentNode;

// Register the button component
const registry = ComponentRegistry.getInstance();
registry.registerComponent('222:46', buttonComponent);

// Export the registry for use in other files
export { ComponentRegistry }; 