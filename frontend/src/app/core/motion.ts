/** Small helpers for motion and input type, so every component asks the same question the same way. */
export const prefersReducedMotion = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches;
/** True on devices with a mouse or trackpad (not touch screens). */
export const hasFinePointer = (): boolean => matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Smooth-scroll to a section and keep the address bar in step. */
export function scrollToId(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  history.replaceState(null, '', `#${id}`);
}
