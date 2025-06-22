// Remove import of node types, use global types
// import { SceneNode, TextNode, FrameNode, RectangleNode, InstanceNode, EllipseNode, VectorNode, GroupNode, BooleanOperationNode, ComponentNode } from "@figma/plugin-typings";
import { generateComposeRectangle } from "./transform_rectangle_node";
import { mapTextNodeToMaterialText } from "./transform_text_node";

// PluginMessage interface updated to use SceneNode
interface PluginMessage {
  type: 'NO_SELECTION' | 'NODE_TREE';
  data?: SceneNode;
}

// Type guard functions using official typings
function isTextNode(node: SceneNode): node is TextNode {
  return node.type === 'TEXT';
}

function isFrameNode(node: SceneNode): node is FrameNode {
  return node.type === 'FRAME';
}

function isRectangleNode(node: SceneNode): node is RectangleNode {
  return node.type === 'RECTANGLE';
}

function isInstanceNode(node: SceneNode): node is InstanceNode {
  return node.type === 'INSTANCE';
}

function isEllipseNode(node: SceneNode): node is EllipseNode {
  return node.type === 'ELLIPSE';
}

function isVectorNode(node: SceneNode): node is VectorNode {
  return node.type === 'VECTOR';
}

function isGroupNode(node: SceneNode): node is GroupNode {
  return node.type === 'GROUP';
}

function isBooleanOperationNode(node: SceneNode): node is BooleanOperationNode {
  return node.type === 'BOOLEAN_OPERATION';
}

function isComponentNode(node: SceneNode): node is ComponentNode {
  return node.type === 'COMPONENT';
}

// Update renderNode to accept SceneNode
function renderNode(node: SceneNode): string {
  let html = `
    <div class="node">
      <div class="node-title">${node.type} - ${node.name}</div>
      <div class="attribute">ID: ${node.id}</div>
      <div class="attribute">Visible: ${node.visible}</div>
      <div class="attribute">Size: ${node.width} × ${node.height}</div>
      <div class="attribute">Position: (${node.x}, ${node.y})</div>
      <div class="attribute">Rotation: ${(node as any).rotation ?? 0}</div>
      <div class="attribute">Opacity: ${(node as any).opacity ?? 1}</div>
  `;

  if ('children' in node && node.children && node.children.length > 0) {
    html += `<div class="attribute">Children:</div>`;
    node.children.forEach((child) => {
      html += renderNode(child as SceneNode);
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
      const node = msg.data;
      console.log("Received node:", node);

      if (isTextNode(node)) {
        console.log("Processing text node");
        const html = mapTextNodeToMaterialText(node);
        tree.innerHTML = html;
      } if(isRectangleNode(node)) {
        console.log("Processing rectangle node");
        const html = generateComposeRectangle(node);
        tree.innerHTML = html;
      } else {
        console.log("Processing other node type:", node.type);
        const html = renderNode(node);
        tree.innerHTML = html;
      }
    } catch (error) {
      console.error("Error processing node:", error);
      tree.innerHTML = "<p>Error processing node data</p>";
    }
  }
};
