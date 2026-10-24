/**
 * Makes a `<details>` dropdown open on mouse hover as well as click, and close
 * on Escape, an outside press, or a pick inside it. Arrow keys, Home, and End
 * move focus between the items matching `itemSelector`. A ref callback: it
 * returns the cleanup, so the listeners live exactly as long as the element.
 */
export function bindHoverMenu(
  details: HTMLDetailsElement | null,
  itemSelector = 'a[href], button',
) {
  const summary = details?.querySelector('summary');
  if (!details || !summary) {
    return;
  }
  /** Hover only closes what hover opened, and a mouse click can't toggle that shut. */
  let openedByHover = false;

  const setOpen = (open: boolean) => {
    details.open = open;
    openedByHover = false;
  };
  const hover = (open: boolean) => (event: PointerEvent) => {
    if (event.pointerType !== 'mouse' || details.open === open) {
      return;
    }
    if (open || openedByHover) {
      details.open = open;
      openedByHover = open;
    }
  };
  const enter = hover(true);
  const leave = hover(false);
  const keepHoverOpen = (event: MouseEvent) => {
    if (openedByHover) {
      event.preventDefault();
    }
  };
  const items = () => [
    ...details.querySelectorAll<HTMLElement>(`:scope > :not(summary) ${itemSelector}`),
  ];
  const onKeyDown = (event: KeyboardEvent) => {
    if (!details.open) {
      return;
    }
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      summary.focus();
      return;
    }
    const list = items();
    if (list.length === 0) {
      return;
    }
    const at = list.indexOf(document.activeElement as HTMLElement);
    const next = {
      ArrowDown: at < 0 ? 0 : (at + 1) % list.length,
      ArrowLeft: at <= 0 ? list.length - 1 : at - 1,
      ArrowRight: at < 0 ? 0 : (at + 1) % list.length,
      ArrowUp: at <= 0 ? list.length - 1 : at - 1,
      End: list.length - 1,
      Home: 0,
    }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      list[next]?.focus();
    }
  };
  const closeOnOutsidePress = (event: PointerEvent) => {
    if (details.open && event.target instanceof Node && !details.contains(event.target)) {
      setOpen(false);
    }
  };
  const closeOnPick = (event: MouseEvent) => {
    if (
      event.target instanceof Element &&
      !summary.contains(event.target) &&
      event.target.closest(itemSelector)
    ) {
      setOpen(false);
    }
  };

  details.addEventListener('pointerenter', enter);
  details.addEventListener('pointerleave', leave);
  details.addEventListener('click', closeOnPick);
  summary.addEventListener('click', keepHoverOpen);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('pointerdown', closeOnOutsidePress);
  return () => {
    details.removeEventListener('pointerenter', enter);
    details.removeEventListener('pointerleave', leave);
    details.removeEventListener('click', closeOnPick);
    summary.removeEventListener('click', keepHoverOpen);
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('pointerdown', closeOnOutsidePress);
  };
}
