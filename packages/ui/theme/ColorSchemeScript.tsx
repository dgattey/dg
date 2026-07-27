import { COLOR_SCHEME_ATTRIBUTE, COLOR_SCHEME_STORAGE_KEY } from './colorScheme';

const storageKey = JSON.stringify(COLOR_SCHEME_STORAGE_KEY);
const attribute = JSON.stringify(COLOR_SCHEME_ATTRIBUTE);
const prePaintScript = `(()=>{try{const p=localStorage.getItem(${storageKey})||localStorage.getItem('mui-mode');if(p!=='light'&&p!=='dark')return;const e=document.documentElement;e.setAttribute(${attribute},p);e.style.colorScheme=p}catch{}})()`;

/**
 * Blocking head script. Must be rendered under <head> in the root layout so it
 * runs before body paint when an explicit preference is stored.
 */
export function ColorSchemeScript() {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: Bootstrap only interpolates JSON-encoded constants from this package.
  return <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />;
}
