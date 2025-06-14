figma.showUI(__html__, { width: 400, height: 1000 });

async function serializeNode(node: SceneNode): Promise<any> {
  console.log("Serializing node:", node);
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

  // Add text-specific properties if the node is a text node
  if (node.type === "TEXT") {
    console.log("Processing text node");
    const textNode = node as TextNode;
    serialized.characters = textNode.characters;
    serialized.fontSize = textNode.fontSize;
    
    // Handle fontName which is a FontName object
    if (textNode.fontName && typeof textNode.fontName === 'object') {
      const fontName = textNode.fontName as FontName;
      serialized.fontName = {
        family: fontName.family,
        style: fontName.style
      };
    }

    // Handle textStyleId which might be a symbol
    serialized.textStyleId = textNode.textStyleId ? String(textNode.textStyleId) : null;
    
    // Handle fontWeight which might be a symbol
    serialized.fontWeight = typeof textNode.fontWeight === 'number' ? textNode.fontWeight : null;
    
    serialized.lineHeight = textNode.lineHeight;
    serialized.letterSpacing = textNode.letterSpacing;
    
    // Handle textDecoration which might be a symbol
    serialized.textDecoration = textNode.textDecoration ? String(textNode.textDecoration) : null;
    
    // Handle textAlignHorizontal which might be a symbol
    serialized.textAlignHorizontal = textNode.textAlignHorizontal ? String(textNode.textAlignHorizontal) : null;
    
    // Handle fills which is an array of Paint objects
    if (textNode.fills && Array.isArray(textNode.fills)) {
      serialized.fills = textNode.fills.map(fill => {
        if (fill.type === 'SOLID') {
          return {
            type: 'SOLID',
            color: {
              r: fill.color.r,
              g: fill.color.g,
              b: fill.color.b
            },
            opacity: fill.opacity
          };
        }
        return null;
      }).filter(Boolean);
    }

    console.log("Text node serialized:", serialized);
  }

  if ("children" in node && node.children.length > 0) {
    const childPromises = node.children.map(serializeNode);
    serialized.children = await Promise.all(childPromises);
  }

  return serialized;
}

figma.on("selectionchange", async () => {
  const selection = figma.currentPage.selection[0];
  console.log("Selection changed:", selection);
  if (selection) {
    const data = await serializeNode(selection);
    console.log("Sending data to UI:", data);
    figma.ui.postMessage({ type: "NODE_TREE", data });
  } else {
    console.log("No selection, sending NO_SELECTION message");
    figma.ui.postMessage({ type: "NO_SELECTION" });
  }
});