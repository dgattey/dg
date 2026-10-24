import { invariant } from '@dg/shared-core/assertions/invariant';
import { screen } from '@testing-library/react';

/**
 * The one button with this name outside the phone-only menus, which repeat the filters
 * that fold away on phones. Jsdom applies no media queries, so both layouts render.
 */
export function getDesktopButton(name: string, pressed?: boolean) {
  const [match, ...rest] = screen
    .getAllByRole('button', { name, pressed })
    .filter((button) => !button.closest('.pillPhoneOnly'));
  invariant(match && rest.length === 0, `Expected one ${name} button outside the phone menus`);
  return match;
}
