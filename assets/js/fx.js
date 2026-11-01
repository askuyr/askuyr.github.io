/* Эффекты: прогресс чтения, заголовки по словам, шторки на фото,
   скрытие шапки, кнопка «наверх» и переходы между страницами */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var bar = document.getElementById('scrollBar');
  var toTop = document.getElementById('toTop');
  var head = doc.getElementById('siteHead');
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(function () {
      var y = window.scrollY || 0;
      var max = doc.documentElement.scrollHeight - window.innerHeight;

      if (bar) {
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      }

      if (toTop) {
        toTop.classList.toggle('is-visible', y > 600);
      }

      if (head && !head.classList.contains('is-open')) {
        var delta = y - lastY;
        if (Math.abs(delta) > 4) {
          if (y > 340 && delta > 0) head.classList.add('is-hidden');
          else if (delta < 0 || y < 120) head.classList.remove('is-hidden');
          lastY = y;
        }
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- заголовки по словам ---------- */
  if (!reduceMotion) {
    doc.querySelectorAll('.h2').forEach(function (heading) {
      var words = heading.textContent.trim().split(/\s+/);
      if (words.length < 2) return;

      heading.textContent = '';

      words.forEach(function (word, i) {
        var outer = doc.createElement('span');
        outer.className = 'word';

        var inner = doc.createElement('span');
        inner.className = 'word__in';
        inner.textContent = word;
        inner.style.transitionDelay = i * 45 + 'ms';

        outer.appendChild(inner);
        heading.appendChild(outer);
        if (i < words.length - 1) heading.appendChild(doc.createTextNode(' '));
      });
    });
  }

  /* ---------- мягкий переход между страницами ---------- */
  doc.addEventListener('click', function (e) {
    var link = e.target.closest('a');
    if (!link) return;

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (link.target === '_blank' || link.hasAttribute('download') || link.hasAttribute('data-lightbox')) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

    var url;
    try { url = new URL(link.href, window.location.href); } catch (err) { return; }

    if (url.origin !== window.location.origin) return;
    if (!/\.html?$/.test(url.pathname) && url.pathname !== '/') return;
    if (url.href === window.location.href) return;

    e.preventDefault();
    body.classList.add('is-leaving');

    window.setTimeout(function () {
      window.location.href = link.href;
    }, 220);
  }, true);

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) body.classList.remove('is-leaving');
  });
})();
