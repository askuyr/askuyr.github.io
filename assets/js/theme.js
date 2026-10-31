/* Тема: авто по настройке Windows и переключатель в шапке */
(function () {
  'use strict';

  var root = document.documentElement;
  var button = document.getElementById('themeToggle');
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var meta = document.querySelector('meta[name="theme-color"]');

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme, save) {
    var dark = theme === 'dark';
    root.setAttribute('data-theme', theme);
    root.style.colorScheme = theme;

    if (meta) meta.setAttribute('content', dark ? '#0B0A09' : '#F2EFE8');

    if (button) {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Включить светлую тему' : 'Включить тёмную тему');
    }

    if (save) {
      try { localStorage.setItem('theme', theme); } catch (e) {}
    }
  }

  function savedTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }

  apply(current(), false);

  if (button) {
    button.addEventListener('click', function () {
      apply(current() === 'dark' ? 'light' : 'dark', true);
    });
  }

  function onSystemChange(event) {
    if (!savedTheme()) apply(event.matches ? 'dark' : 'light', false);
  }

  if (media.addEventListener) {
    media.addEventListener('change', onSystemChange);
  } else if (media.addListener) {
    media.addListener(onSystemChange);
  }
})();
