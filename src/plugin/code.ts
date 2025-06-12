figma.showUI(__html__, { width: 400, height: 1000 });

async function serializeNode(node: SceneNode): Promise<any> {
  const previewBytes = await node.exportAsync({ format: "PNG", constraint: { type: "SCALE", value: 1 } });
  const previewBase64 = figma.base64Encode(previewBytes);

  const serialized: any = {
    id: node.id,
    name: node.name,
    type: node.type,
    visible: node.visible,
    width: node.width,
    height: node.height,
    x: node.x,
    y: node.y,
    rotation: (node as any).rotation ?? 0,
    opacity: (node as any).opacity ?? 1,
    preview: `data:image/png;base64,${previewBase64}`,
    children: [],
  };

  if ("children" in node && node.children.length > 0) {
    const childPromises = node.children.map(serializeNode);
    serialized.children = await Promise.all(childPromises);
  }

  return serialized;
}

figma.on("selectionchange", async () => {
  const selection = figma.currentPage.selection[0];
  if (selection) {
    const data = await serializeNode(selection);
    figma.ui.postMessage({ type: "NODE_TREE", data });
  } else {
    figma.ui.postMessage({ type: "NO_SELECTION" });
  }
});
