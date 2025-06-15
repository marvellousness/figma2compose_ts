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

  // Handle specific node types
  switch (node.type) {
    case "TEXT": {
      const textNode = node as TextNode;
      serialized.characters = textNode.characters;
      serialized.fontSize = textNode.fontSize;
      if (textNode.fontName && typeof textNode.fontName === 'object') {
        const fontName = textNode.fontName as FontName;
        serialized.fontName = {
          family: fontName.family,
          style: fontName.style
        };
      }
      serialized.textStyleId = textNode.textStyleId ? String(textNode.textStyleId) : null;
      serialized.fontWeight = typeof textNode.fontWeight === 'number' ? textNode.fontWeight : null;
      serialized.lineHeight = textNode.lineHeight;
      serialized.letterSpacing = textNode.letterSpacing;
      serialized.textDecoration = textNode.textDecoration ? String(textNode.textDecoration) : null;
      serialized.textAlignHorizontal = textNode.textAlignHorizontal ? String(textNode.textAlignHorizontal) : null;
      serialized.fills = serializeFills(textNode.fills);
      break;
    }
    case "FRAME": {
      const frameNode = node as FrameNode;
      serialized.layoutMode = frameNode.layoutMode;
      serialized.primaryAxisSizingMode = frameNode.primaryAxisSizingMode;
      serialized.counterAxisSizingMode = frameNode.counterAxisSizingMode;
      serialized.paddingLeft = frameNode.paddingLeft;
      serialized.paddingRight = frameNode.paddingRight;
      serialized.paddingTop = frameNode.paddingTop;
      serialized.paddingBottom = frameNode.paddingBottom;
      serialized.itemSpacing = frameNode.itemSpacing;
      serialized.layoutWrap = frameNode.layoutWrap;
      serialized.layoutAlign = frameNode.layoutAlign;
      serialized.fills = serializeFills(frameNode.fills);
      break;
    }
    case "RECTANGLE": {
      const rectNode = node as RectangleNode;
      serialized.cornerRadius = rectNode.cornerRadius;
      serialized.fills = serializeFills(rectNode.fills);
      break;
    }
    case "INSTANCE": {
      const instanceNode = node as InstanceNode;
      serialized.componentId = (instanceNode as any).componentId;
      try {
        const mainComponent = await instanceNode.getMainComponentAsync();
        if (mainComponent) {
          serialized.mainComponent = {
            id: mainComponent.id,
            name: mainComponent.name
          };
        }
      } catch (error) {
        console.warn('Error getting main component:', error);
      }
      break;
    }
    case "ELLIPSE": {
      const ellipseNode = node as EllipseNode;
      serialized.fills = serializeFills(ellipseNode.fills);
      break;
    }
    case "VECTOR": {
      const vectorNode = node as VectorNode;
      serialized.fills = serializeFills(vectorNode.fills);
      if (vectorNode.strokes) {
        serialized.strokes = vectorNode.strokes.map(stroke => {
          if (stroke.type === 'SOLID') {
            return {
              type: stroke.type,
              color: stroke.color,
              opacity: stroke.opacity,
              weight: (stroke as any).weight
            };
          }
          return null;
        }).filter(Boolean);
      }
      break;
    }
    case "GROUP": {
      const groupNode = node as GroupNode;
      serialized.layoutMode = (groupNode as any).layoutMode;
      break;
    }
    case "BOOLEAN_OPERATION": {
      const boolNode = node as BooleanOperationNode;
      serialized.booleanOperation = boolNode.booleanOperation;
      break;
    }
  }

  if ("children" in node && node.children.length > 0) {
    const childPromises = node.children.map(serializeNode);
    serialized.children = await Promise.all(childPromises);
  }

  return serialized;
}

function serializeFills(fills: ReadonlyArray<Paint> | symbol): any[] | null {
  if (!fills || fills === figma.mixed || !Array.isArray(fills)) {
    return null;
  }
  return fills.map(fill => {
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