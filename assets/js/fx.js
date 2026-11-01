/* Живые детали: прелоадер, курсор, рейл разделов, свет на обложке,
   появление заголовков по словам, автоскрытие шапки, переходы страниц */
(function () {
  'use strict';

  var doc = document;
  var body = doc.body;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- прелоадер ---------- */
  var preloader = doc.getElementById('preloader');

  if (preloader) {
    var pctEl = doc.getElementById('preloaderCount');
    var barEl = doc.getElementById('preloaderBar');
    var finished = false;

    body.classList.add('is-loading');

    var finish = function () {
      if (finished) return;
      finished = true;
      body.classList.remove('is-loading');
      preloader.classList.add('is-done');
      window.setTimeout(function () {
        if (preloader.parentNode) preloader.parentNode.removeChild(preloader);
        body.classList.add('is-loaded');
      }, 900);
    };

    if (reduceMotion) {
      finish();
    } else {
      var started = 0;
      var DURATION = 900;

      var tick = function (now) {
        if (!started) started = now;
        var progress = Math.min((now - started) / DURATION, 1);
        var value = Math.round(progress * 100);

        if (pctEl) pctEl.textContent = (value < 10 ? '0' : '') + value;
        if (barEl) barEl.style.transform = 'scaleX(' + progress + ')';

        if (progress < 1) window.requestAnimationFrame(tick);
        else window.setTimeout(finish, 140);
      };

      window.requestAnimationFrame(tick);
      window.setTimeout(finish, 2600);
    }
  } else {
    body.classList.add('is-loaded');
  }

  /* ---------- курсор ---------- */
  var cursor = doc.getElementById('cursor');

  if (cursor && finePointer && !reduceMotion) {
    var ring = cursor.querySelector('.cursor__ring');
    var label = cursor.querySelector('.cursor__label');
    var pointerX = window.innerWidth / 2;
    var pointerY = window.innerHeight / 2;
    var posX = pointerX;
    var posY = pointerY;

    doc.querySelectorAll('.gallery__item a').forEach(function (a) {
      a.setAttribute('data-cursor', 'Смотреть');
    });
    doc.querySelectorAll('a[target="_blank"]').forEach(function (a) {
      a.setAttribute('data-cursor', 'Открыть');
    });

    window.addEventListener('mousemove', function (e) {
      pointerX = e.clientX;
      pointerY = e.clientY;
      cursor.classList.add('is-visible');
      if (!root.classList.contains('has-cursor')) root.classList.add('has-cursor');
    }, { passive: true });

    var follow = function () {
      posX += (pointerX - posX) * 0.22;
      posY += (pointerY - posY) * 0.22;
      cursor.style.transform = 'translate3d(' + posX.toFixed(1) + 'px,' + posY.toFixed(1) + 'px,0)';
      window.requestAnimationFrame(follow);
    };
    window.requestAnimationFrame(follow);

    doc.addEventListener('mouseover', function (e) {
      var target = e.target.closest('a, button, [data-cursor]');

      if (!target) {
        cursor.classList.remove('is-hover', 'is-label');
        return;
      }

      if (target.hasAttribute('data-cursor') && label) {
        label.textContent = target.getAttribute('data-cursor');
        cursor.classList.add('is-label');
        cursor.classList.remove('is-hover');
      } else {
        cursor.classList.add('is-hover');
        cursor.classList.remove('is-label');
      }
    });

    doc.addEventListener('mouseleave', function () {
      cursor.classList.remove('is-visible');
    });
  }

  /* ---------- рейл разделов ---------- */
  var rail = doc.getElementById('rail');
  var sections = Array.prototype.slice.call(doc.querySelectorAll('main section[id]'));

  if (rail && sections.length > 3) {
    var railLinks = [];

    sections.forEach(function (section) {
      var heading = section.querySelector('.h2, .contact__title');
      var name = section.id === 'top' ? 'Обложка' : (heading ? heading.textContent.trim() : '');

      if (!name) return;

      var link = doc.createElement('a');
      link.href = '#' + section.id;
      link.className = 'rail__dot';
      link.setAttribute('aria-label', name);

      var text = doc.createElement('span');
      text.className = 'rail__label';
      text.textContent = name;

      link.appendChild(text);
      rail.appendChild(link);
      railLinks.push({ link: link, section: section });
    });

    if (railLinks.length) {
      var railTick = false;

      var updateRail = function () {
        var mid = window.innerHeight * 0.45;
        var active = railLinks[0];

        railLinks.forEach(function (item) {
          if (item.section.getBoundingClientRect().top <= mid) active = item;
        });

        railLinks.forEach(function (item) {
          item.link.classList.toggle('is-active', item === active);
        });

        railTick = false;
      };

      var requestRail = function () {
        if (railTick) return;
        railTick = true;
        window.requestAnimationFrame(updateRail);
      };

      window.addEventListener('scroll', requestRail, { passive: true });
      window.addEventListener('resize', requestRail, { passive: true });
      updateRail();
    }
  }

  /* ---------- свет на обложке ---------- */
  var stage = doc.querySelector('.hero__stage');
  var glow = doc.getElementById('heroGlow');

  if (stage && glow && finePointer && !reduceMotion) {
    stage.addEventListener('pointermove', function (e) {
      var rect = stage.getBoundingClientRect();
      glow.style.setProperty('--mx', ((e.clientX - rect.left) / rect.width) * 100 + '%');
      glow.style.setProperty('--my', ((e.clientY - rect.top) / rect.height) * 100 + '%');
      glow.classList.add('is-on');
    });

    stage.addEventListener('pointerleave', function () {
      glow.classList.remove('is-on');
    });
  }

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

  /* ---------- шапка прячется при скролле вниз ---------- */
  var head = doc.getElementById('siteHead');
  var lastY = window.scrollY;

  if (head) {
    window.addEventListener('scroll', function () {
      if (head.classList.contains('is-open')) return;

      var y = window.scrollY;
      var delta = y - lastY;

      if (Math.abs(delta) < 4) return;

      if (y > 340 && delta > 0) head.classList.add('is-hidden');
      else if (delta < 0 || y < 120) head.classList.remove('is-hidden');

      lastY = y;
    }, { passive: true });
  }

  /* ---------- перестроение работ в фильтре ---------- */
  var filters = doc.getElementById('filters');
  var cases = doc.getElementById('cases');

  if (filters && cases) {
    filters.addEventListener('click', function (e) {
      if (!e.target.closest('.filter')) return;

      cases.classList.remove('is-filtering');
      void cases.offsetWidth;
      cases.classList.add('is-filtering');

      window.setTimeout(function () {
        cases.classList.remove('is-filtering');
      }, 700);
    });
  }

  /* ---------- поделиться ---------- */
  var shareBtn = doc.getElementById('sharePage');

  if (shareBtn) {
    shareBtn.addEventListener('click', function () {
      var data = { title: doc.title, url: window.location.href };

      if (navigator.share) {
        navigator.share(data).catch(function () {});
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(data.url).then(function () {
          if (window.__toast) window.__toast('Ссылка скопирована');
        }).catch(function () {
          if (window.__toast) window.__toast('Не получилось скопировать');
        });
      }
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
    }, 230);
  }, true);

  window.addEventListener('pageshow', function (event) {
    if (event.persisted) body.classList.remove('is-leaving');
  });
})();
