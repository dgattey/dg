(() => {
  try {
    const preference = localStorage.getItem('color-scheme') || localStorage.getItem('mui-mode');
    if (preference !== 'light' && preference !== 'dark') {
      return;
    }
    const root = document.documentElement;
    root.setAttribute('data-color-scheme', preference);
    root.style.colorScheme = preference;
  } catch {}
})();
