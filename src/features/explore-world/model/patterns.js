export function coinPattern(pattern, i, count, centerX, centerY) {
  const t = i / (count - 1);
  const angle = t * Math.PI * 2;
  if (pattern === 1) return { x: centerX + Math.sin(t * Math.PI) * 3 - 1.5, y: centerY + Math.sin(t * Math.PI) * 2 };
  if (pattern === 2) return { x: centerX + Math.cos(angle) * 2, y: centerY + Math.sin(angle) * 1.8 };
  if (pattern === 3) return { x: centerX + Math.sin(angle) ** 3 * 2.5, y: centerY + (13 * Math.cos(angle) - 5 * Math.cos(2 * angle) - 2 * Math.cos(3 * angle) - Math.cos(4 * angle)) / 9 };
  return { x: centerX, y: centerY };
}
