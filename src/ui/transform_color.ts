export function figmaColorToCompose(color: RGB, opacity: number = 1): string {
    const r = Math.round((color.r ?? 0) * 255);
    const g = Math.round((color.g ?? 0) * 255);
    const b = Math.round((color.b ?? 0) * 255);
    const a = Math.round((opacity ?? 1) * 255);
    // Compose expects ARGB hex: 0xAARRGGBB
    const hex = (a << 24) | (r << 16) | (g << 8) | b;
    // Pad with zeros and uppercase
    const hexStr = hex.toString(16).padStart(8, '0').toUpperCase();
    return `Color(0x${hexStr})`;
}