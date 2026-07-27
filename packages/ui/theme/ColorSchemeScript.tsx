import { COLOR_SCHEME_ATTRIBUTE, COLOR_SCHEME_STORAGE_KEY } from './colorScheme';

const storageKey = JSON.stringify(COLOR_SCHEME_STORAGE_KEY);
const attribute = JSON.stringify(COLOR_SCHEME_ATTRIBUTE);
const prePaintScript = `(()=>{try{const p=localStorage.getItem(${storageKey})||localStorage.getItem('mui-mode');if(p!=='light'&&p!=='dark')return;const e=document.documentElement;e.setAttribute(${attribute},p);e.style.colorScheme=p}catch{}})()`;

export function ColorSchemeScript() {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: The script contains only JSON-encoded constants.
  return <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />;
}
