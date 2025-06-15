import FrameNodeType from "@figma/plugin-typings";
import NodeType from "@figma/plugin-typings";
import { mapTextNodeToMaterialText } from "./transform_text_node";

// Base node interface
interface BaseNode {
  type: string;
  name: string;
  preview: string;
  id: string;
  visible: boolean;
  width: number;
  height: number;
  x: number;
  y: number;
  rotation: number;
  opacity: number;
  children?: Node[];
}

// Text node specific interface
interface TextNodeData extends BaseNode {
  type: 'TEXT';
  characters: string;
  fontSize: number;
  fontName?: {
    family: string;
    style: string;
  };
  textStyleId: string | null;
  fontWeight: number | null;
  lineHeight: number | null;
  letterSpacing: number | null;
  textDecoration: string | null;
  textAlignHorizontal: string | null;
  fills: Array<{
    type: 'SOLID';
    color: {
      r: number;
      g: number;
      b: number;
    };
    opacity: number;
  }> | null;
}

// Frame node specific interface
interface FrameNodeData extends BaseNode {
  type: 'FRAME';
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
  primaryAxisSizingMode?: 'FIXED' | 'AUTO';
  counterAxisSizingMode?: 'FIXED' | 'AUTO';
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
  layoutWrap?: 'NO_WRAP' | 'WRAP';
  layoutAlign?: 'STRETCH' | 'INHERIT';
}

// Rectangle node specific interface
interface RectangleNodeData extends BaseNode {
  type: 'RECTANGLE';
  cornerRadius?: number;
  fills?: Array<{
    type: 'SOLID';
    color: {
      r: number;
      g: number;
      b: number;
    };
    opacity: number;
  }>;
}

// Instance node specific interface
interface InstanceNodeData extends BaseNode {
  type: 'INSTANCE';
  componentId: string;
  mainComponent?: {
    id: string;
    name: string;
  };
}

// Ellipse node specific interface
interface EllipseNodeData extends BaseNode {
  type: 'ELLIPSE';
  fills?: Array<{
    type: 'SOLID';
    color: {
      r: number;
      g: number;
      b: number;
    };
    opacity: number;
  }>;
}

// Vector node specific interface
interface VectorNodeData extends BaseNode {
  type: 'VECTOR';
  fills?: Array<{
    type: 'SOLID';
    color: {
      r: number;
      g: number;
      b: number;
    };
    opacity: number;
  }>;
  strokes?: Array<{
    type: 'SOLID';
    color: {
      r: number;
      g: number;
      b: number;
    };
    opacity: number;
    weight: number;
  }>;
}

// Group node specific interface
interface GroupNodeData extends BaseNode {
  type: 'GROUP';
  layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE';
}

// Boolean operation node specific interface
interface BooleanOperationNodeData extends BaseNode {
  type: 'BOOLEAN_OPERATION';
  booleanOperation: 'UNION' | 'INTERSECT' | 'SUBTRACT' | 'EXCLUDE';
}

// Component node specific interface
interface ComponentNodeData extends BaseNode {
  type: 'COMPONENT' | 'INSTANCE';
  componentId: string;
  mainComponent?: {
    id: string;
    name: string;
  } | null;
  componentProperties?: {
    [key: string]: {
      value: string;
      type: 'VARIANT';
      boundVariables: Record<string, any>;
    };
  };
}

// Union type of all possible node types
type Node = TextNodeData | FrameNodeData | RectangleNodeData | InstanceNodeData | 
           EllipseNodeData | VectorNodeData | GroupNodeData | BooleanOperationNodeData |
           ComponentNodeData;

interface PluginMessage {
  type: 'NO_SELECTION' | 'NODE_TREE';
  data?: Node;
}

// Type guard functions
function isTextNode(node: BaseNode): node is TextNodeData {
  return node.type === 'TEXT';
}

function isFrameNode(node: BaseNode): node is FrameNodeData {
  return node.type === 'FRAME';
}

function isRectangleNode(node: BaseNode): node is RectangleNodeData {
  return node.type === 'RECTANGLE';
}

function isInstanceNode(node: BaseNode): node is InstanceNodeData {
  return node.type === 'INSTANCE';
}

function isEllipseNode(node: BaseNode): node is EllipseNodeData {
  return node.type === 'ELLIPSE';
}

function isVectorNode(node: BaseNode): node is VectorNodeData {
  return node.type === 'VECTOR';
}

function isGroupNode(node: BaseNode): node is GroupNodeData {
  return node.type === 'GROUP';
}

function isBooleanOperationNode(node: BaseNode): node is BooleanOperationNodeData {
  return node.type === 'BOOLEAN_OPERATION';
}

function isComponentNode(node: BaseNode): node is ComponentNodeData {
  return node.type === 'COMPONENT' || node.type === 'INSTANCE';
}

// Custom deserializer
async function deserializeNode(data: any): Promise<Node> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid node data');
  }

  const baseNode = {
    name: data.name,
    preview: data.preview,
    id: data.id,
    visible: data.visible,
    width: data.width,
    height: data.height,
    x: data.x,
    y: data.y,
    rotation: data.rotation ?? 0,
    opacity: data.opacity ?? 1,
    children: data.children ? await Promise.all(data.children.map(deserializeNode)) : undefined
  };

  // Handle specific node types
  switch (data.type) {
    case 'TEXT':
      return {
        ...baseNode,
        type: 'TEXT' as const,
        characters: data.characters,
        fontSize: data.fontSize,
        fontName: data.fontName,
        textStyleId: data.textStyleId,
        fontWeight: data.fontWeight,
        lineHeight: data.lineHeight,
        letterSpacing: data.letterSpacing,
        textDecoration: data.textDecoration,
        textAlignHorizontal: data.textAlignHorizontal,
        fills: data.fills
      };
    case 'FRAME':
      return {
        ...baseNode,
        type: 'FRAME' as const,
        layoutMode: data.layoutMode,
        primaryAxisSizingMode: data.primaryAxisSizingMode,
        counterAxisSizingMode: data.counterAxisSizingMode,
        paddingLeft: data.paddingLeft,
        paddingRight: data.paddingRight,
        paddingTop: data.paddingTop,
        paddingBottom: data.paddingBottom,
        itemSpacing: data.itemSpacing,
        layoutWrap: data.layoutWrap,
        layoutAlign: data.layoutAlign
      };
    case 'RECTANGLE':
      return {
        ...baseNode,
        type: 'RECTANGLE' as const,
        cornerRadius: data.cornerRadius,
        fills: data.fills
      };
    case 'INSTANCE':
      return {
        ...baseNode,
        type: 'INSTANCE' as const,
        componentId: data.componentId,
        mainComponent: data.mainComponent
      };
    case 'ELLIPSE':
      return {
        ...baseNode,
        type: 'ELLIPSE' as const,
        fills: data.fills
      };
    case 'VECTOR':
      return {
        ...baseNode,
        type: 'VECTOR' as const,
        fills: data.fills,
        strokes: data.strokes
      };
    case 'GROUP':
      return {
        ...baseNode,
        type: 'GROUP' as const,
        layoutMode: data.layoutMode
      };
    case 'BOOLEAN_OPERATION':
      return {
        ...baseNode,
        type: 'BOOLEAN_OPERATION' as const,
        booleanOperation: data.booleanOperation
      };
    case 'COMPONENT':
    case 'INSTANCE':
      return {
        ...baseNode,
        type: data.type,
        componentId: data.componentId,
        mainComponent: data.mainComponent || null,
        componentProperties: data.componentProperties
      };
    default:
      throw new Error(`Unknown node type: ${data.type}`);
  }
}

function renderNode(node: Node): string {
  let html = `
    <div class="node">
      <div class="node-title">${node.type} - ${node.name}</div>
      <img class="preview" src="${node.preview}" alt="Preview of ${node.name}" />
      <div class="attribute">ID: ${node.id}</div>
      <div class="attribute">Visible: ${node.visible}</div>
      <div class="attribute">Size: ${node.width} × ${node.height}</div>
      <div class="attribute">Position: (${node.x}, ${node.y})</div>
      <div class="attribute">Rotation: ${node.rotation}</div>
      <div class="attribute">Opacity: ${node.opacity}</div>
  `;

  if (node.children && node.children.length > 0) {
    html += `<div class="attribute">Children:</div>`;
    node.children.forEach((child) => {
      html += renderNode(child);
    });
  }

  html += `</div>`;
  return html;
}

window.onmessage = async (event: MessageEvent) => {
  const msg = event.data.pluginMessage as PluginMessage;
  const tree = document.getElementById("tree");

  if (!tree) {
    console.log("Tree element not found");
    return;
  }

  if (msg.type === "NO_SELECTION") {
    console.log("No selection message received");
    tree.innerHTML = "<p>Please select a node.</p>";
    return;
  }

  if (msg.type === "NODE_TREE" && msg.data) {
    try {
      const node = await deserializeNode(msg.data);
      console.log("Deserialized node:", node);

      if (isTextNode(node)) {
        console.log("Processing text node");
        const html = mapTextNodeToMaterialText(node as unknown as TextNode);
        tree.innerHTML = html;
      } else {
        console.log("Processing other node type:", node.type);
        const html = renderNode(node);
        tree.innerHTML = html;
      }
    } catch (error) {
      console.error("Error deserializing node:", error);
      tree.innerHTML = "<p>Error processing node data</p>";
    }
  }
};
