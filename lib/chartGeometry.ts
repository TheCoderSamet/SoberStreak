export function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleRad: number
): { x: number; y: number } {
  return {
    x: centerX + radius * Math.cos(angleRad),
    y: centerY + radius * Math.sin(angleRad),
  };
}

/** SVG path for a donut segment (angles in radians, 0 = east, clockwise). */
export function describeDonutSlice(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
  startAngle: number,
  endAngle: number
): string {
  const startOuter = polarToCartesian(centerX, centerY, outerRadius, startAngle);
  const endOuter = polarToCartesian(centerX, centerY, outerRadius, endAngle);
  const startInner = polarToCartesian(centerX, centerY, innerRadius, endAngle);
  const endInner = polarToCartesian(centerX, centerY, innerRadius, startAngle);
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ');
}
