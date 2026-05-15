const languageSwitcher = document.querySelector('[data-language-switcher]');

if (languageSwitcher) {
  languageSwitcher.addEventListener('change', (event) => {
    const nextLocale = event.target.value;
    const pathParts = window.location.pathname.split('/').filter(Boolean);

    if (pathParts.length === 0) {
      window.location.href = `/${nextLocale}/`;
      return;
    }

    pathParts[0] = nextLocale;
    localStorage.setItem('batip.locale', nextLocale);
    window.location.href = `/${pathParts.join('/')}/`;
  });
}
