function mapTextNodeToMaterialText(textNode: TextNode, indent = 0): string {
  const space = "  ".repeat(indent);
  const inner = "  ".repeat(indent + 1);

  const text = JSON.stringify(textNode.characters);
  const styleName = getTextStyleName(textNode);
  const typography = styleName ? mapFigmaStyleToComposeToken(styleName) : null;

  // Style modifiers
  const modifiers: string[] = [];

  // Font weight
  if (textNode.fontWeight && typeof textNode.fontWeight === "number") {
    const weight = mapFontWeight(textNode.fontWeight);

    modifiers.push(`fontWeight = ${weight}`);
  }

  if (textNode.lineHeight && typeof textNode.lineHeight === "number") {
    modifiers.push(
      `lineHeight = ${textNode.lineHeight}px`.replace("px", ".sp")
    );
  }

  if (textNode.letterSpacing && typeof textNode.letterSpacing === "number") {
    modifiers.push(
      `letterSpacing = ${textNode.letterSpacing}px`.replace("px", ".sp")
    );
  }

  if (textNode.textDecoration && textNode.textDecoration !== figma.mixed) {
    const decos = [];
    if (textNode.textDecoration.includes("UNDERLINE"))
      decos.push("TextDecoration.Underline");
    if (textNode.textDecoration.includes("STRIKETHROUGH"))
      decos.push("TextDecoration.LineThrough");
    if (decos.length) modifiers.push(`textDecoration = ${decos.join(" + ")}`);
  }

  const style = typography
    ? `MaterialTheme.typography.${typography}` +
      (modifiers.length > 0
        ? `.copy(\n${inner}${modifiers.join(`,\n${inner}`)}\n${space})`
        : "")
    : `TextStyle(\n${inner}${modifiers.join(`,\n${inner}`)}\n${space})`;

  // Alignment
  let textAlign = "";
  if (textNode.textAlignHorizontal) {
    const alignMap: any = {
      LEFT: "TextAlign.Left",
      CENTER: "TextAlign.Center",
      RIGHT: "TextAlign.Right",
      JUSTIFIED: "TextAlign.Justify",
    };
    textAlign = `textAlign = ${alignMap[textNode.textAlignHorizontal]}`;
  }

  // Color
  let color = "";
  if (textNode.fills && textNode.fills !== figma.mixed) {
    const fill = textNode.fills[0];
    if (fill?.type === "SOLID") {
      const c = fill.color;
      const a = fill.opacity ?? 1;
      color = `color = Color(${(c.r * 255).toFixed(0)}, ${(c.g * 255).toFixed(
        0
      )}, ${(c.b * 255).toFixed(0)}, ${a})`;
    }
  }

  const extraProps = [color, textAlign].filter(Boolean).join(",\n" + inner);

  return (
    `${space}Text(\n` +
    `${inner}text = ${JSON.stringify(text)},\n` +
    `${inner}style = ${style},\n` +
    (extraProps ? `${inner}${extraProps},\n` : "") +
    `${space})`
  );
}

function mapFontWeight(weight: number): string {
  switch (weight) {
    case 100:
      return "FontWeight.Thin";
    case 200:
      return "FontWeight.ExtraLight";
    case 300:
      return "FontWeight.Light";
    case 400:
      return "FontWeight.Normal";
    case 500:
      return "FontWeight.Medium";
    case 600:
      return "FontWeight.SemiBold";
    case 700:
      return "FontWeight.Bold";
    case 800:
      return "FontWeight.ExtraBold";
    case 900:
      return "FontWeight.Black";
    default:
      return "FontWeight.Normal"; // Fallback
  }
}
function getTextStyleName(node: TextNode): string | null {
  try {
    const styleId = node.textStyleId;
    const style = figma.getStyleById(styleId as string);
    return style?.name ?? null;
  } catch {
    return null;
  }
}

function mapFigmaStyleToComposeToken(styleName: string): string {
  const lower = styleName.toLowerCase();

  if (lower.includes("headline") || lower.includes("h1"))
    return "headlineLarge";
  if (lower.includes("h2")) return "headlineMedium";
  if (lower.includes("h3")) return "headlineSmall";
  if (lower.includes("title")) return "titleMedium";
  if (lower.includes("body")) return "bodyMedium";
  if (lower.includes("caption") || lower.includes("small")) return "labelSmall";

  return "bodyMedium"; // fallback
}
