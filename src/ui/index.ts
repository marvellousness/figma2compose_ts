import FrameNodeType from "@figma/plugin-typings";
import NodeType from "@figma/plugin-typings";
import { mapTextNodeToMaterialText } from "./transform_text_node";

interface Node {
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

interface PluginMessage {
  type: 'NO_SELECTION' | 'NODE_TREE';
  data?: Node;
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

window.onmessage = (event: MessageEvent) => {
  const msg = event.data.pluginMessage as PluginMessage;  
  const tree = document.getElementById("tree");

  if (!tree) {
    console.log("Tree element not found");
    return;
  }

  if (msg.type === "NO_SELECTION") {
    console.log("No selection message received");
    tree.innerHTML = "<p>Please select a node.</p>";
  }

  if (msg.type === "NODE_TREE" && msg.data) {    
    const html = renderNode(msg.data);
    tree.innerHTML = html;
  }
  
  if (msg.data?.type === "TEXT") {    
    const html = mapTextNodeToMaterialText(msg.data as unknown as TextNode);
    tree.innerHTML = html;
  }
};
