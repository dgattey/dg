// Literal script text keeps CodeQL happy. Keys must match colorScheme.ts constants
// (enforced by theme/__tests__/colorScheme.test.ts).
const prePaintScript =
  "(()=>{try{const p=localStorage.getItem('color-scheme')||localStorage.getItem('mui-mode');if(p!=='light'&&p!=='dark')return;const e=document.documentElement;e.setAttribute('data-color-scheme',p);e.style.colorScheme=p}catch{}})()";

export function ColorSchemeScript() {
  // biome-ignore lint/security/noDangerouslySetInnerHtml: Fixed literal bootstrap; no user input.
  return <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />;
}
