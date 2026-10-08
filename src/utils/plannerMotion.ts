// Match the seven CSS grid tracks, including minimum widths on small desktops.
export function plannerColumnWidths(width: number, expanded: number): number[] {
  const available = Math.max(0, width - 60); // Six 10px gaps.
  if (expanded < 0) return Array(7).fill(Math.max(120, available / 7));
  const unit = available / 7.9;
  const narrow = Math.max(100, Math.min(unit, (available - 250) / 6));
  const wide = Math.max(250, unit * 1.9);
  return Array.from({ length: 7 }, (_, index) => index === expanded ? wide : narrow);
}
