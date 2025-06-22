// Utility to map RectangleNode to Android Compose Box, mapping all Figma RectangleNode attributes

import { figmaColorToCompose } from "./transform_color";

function safeStringify(obj: any): string {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'symbol' ? String(value) : value
  );
}

export function generateComposeRectangle(rect: RectangleNode, indent = 0): string {
  const space = "  ".repeat(indent);
  const inner = "  ".repeat(indent + 1);

  // Size and position
  const width = `width = ${rect.width}.dp`;
  const height = `height = ${rect.height}.dp`;
  const x = `x = ${rect.x}`;
  const y = `y = ${rect.y}`;
  const rotation = rect.rotation ? `rotationZ = ${rect.rotation}f` : undefined;

  // Corner radii
  let shape = undefined;
  if (
    rect.topLeftRadius === rect.topRightRadius &&
    rect.topLeftRadius === rect.bottomLeftRadius &&
    rect.topLeftRadius === rect.bottomRightRadius
  ) {
    shape = `shape = RoundedCornerShape(${rect.topLeftRadius}.dp)`;
  } else {
    shape = `shape = RoundedCornerShape(\n${inner}topStart = ${rect.topLeftRadius}.dp,\n${inner}topEnd = ${rect.topRightRadius}.dp,\n${inner}bottomEnd = ${rect.bottomRightRadius}.dp,\n${inner}bottomStart = ${rect.bottomLeftRadius}.dp\n${space})`;
  }
  const cornerSmoothing = rect.cornerSmoothing ? `// cornerSmoothing: ${rect.cornerSmoothing}` : undefined;

  // Fills (only first solid fill for color)
  let color = undefined;
  if (Array.isArray(rect.fills) && rect.fills.length > 0 && rect.fills[0].type === 'SOLID') {
    const fill = rect.fills[0] as SolidPaint;
    const r = Math.round((fill.color.r ?? 0) * 255);
    const g = Math.round((fill.color.g ?? 0) * 255);
    const b = Math.round((fill.color.b ?? 0) * 255);
    const a = fill.opacity !== undefined ? fill.opacity : 1;
    color = `color = ${figmaColorToCompose(fill.color, a)}`;
  } else if (Array.isArray(rect.fills) && rect.fills.length > 0) {
    color = `// fill: ${safeStringify(rect.fills)}`;
  }

  // Strokes
  let border = undefined;
  if (Array.isArray(rect.strokes) && rect.strokes.length > 0 && rect.strokes[0].type === 'SOLID') {
    const stroke = rect.strokes[0] as SolidPaint;
    const r = Math.round((stroke.color.r ?? 0) * 255);
    const g = Math.round((stroke.color.g ?? 0) * 255);
    const b = Math.round((stroke.color.b ?? 0) * 255);
    const a = stroke.opacity !== undefined ? stroke.opacity : 1;
    border = `border = BorderStroke(${String(rect.strokeWeight)}.dp, Color(${r}, ${g}, ${b}, alpha = ${a}f))`;
  } else if (Array.isArray(rect.strokes) && rect.strokes.length > 0) {
    border = `// strokes: ${safeStringify(rect.strokes)}`;
  }

  // Individual stroke weights
  const strokeTop = rect.strokeTopWeight !== undefined ? `// strokeTopWeight: ${rect.strokeTopWeight}` : undefined;
  const strokeBottom = rect.strokeBottomWeight !== undefined ? `// strokeBottomWeight: ${rect.strokeBottomWeight}` : undefined;
  const strokeLeft = rect.strokeLeftWeight !== undefined ? `// strokeLeftWeight: ${rect.strokeLeftWeight}` : undefined;
  const strokeRight = rect.strokeRightWeight !== undefined ? `// strokeRightWeight: ${rect.strokeRightWeight}` : undefined;

  // Opacity
  const opacity = rect.opacity !== undefined ? `alpha = ${rect.opacity}f` : undefined;

  // Blend mode
  const blendMode = rect.blendMode ? `// blendMode: ${rect.blendMode}` : undefined;

  // Effects
  const effects = rect.effects && rect.effects.length > 0 ? `// effects: ${safeStringify(rect.effects)}` : undefined;

  // Constraints
  const constraints = rect.constraints ? `// constraints: ${safeStringify(rect.constraints)}` : undefined;

  // Export settings
  const exportSettings = rect.exportSettings && rect.exportSettings.length > 0 ? `// exportSettings: ${safeStringify(rect.exportSettings)}` : undefined;

  // Annotations
  const annotations = rect.annotations && rect.annotations.length > 0 ? `// annotations: ${safeStringify(rect.annotations)}` : undefined;

  // Compose the Box
  const boxParams = [
    width,
    height,
    shape,
    color,
    border,
    opacity,
    rotation,
    blendMode,
    effects,
    constraints,
    exportSettings,
    annotations,
    cornerSmoothing,
    strokeTop,
    strokeBottom,
    strokeLeft,
    strokeRight,
    x,
    y
  ].filter(Boolean).join(",\n" + inner);

  return `${space}Box(\n${inner}${boxParams}\n${space})`;
} 