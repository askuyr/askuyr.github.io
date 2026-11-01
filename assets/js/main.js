/* Меню, появление блоков, фильтр работ, просмотр и копирование почты */
(function () {
  'use strict';

  window.__siteReady = true;

  var head = document.getElementById('siteHead');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('siteNav');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- мобильное меню ---------- */
  if (burger && head && nav) {
    burger.addEventListener('click', function () {
      var open = head.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        head.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && head.classList.contains('is-open')) {
        head.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
        burger.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (head.classList.contains('is-open') && !head.contains(e.target)) {
        head.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- появление блоков ---------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealItems.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    document.querySelectorAll('.skill-list, .process__grid, .reviews, .more-grid').forEach(function (group) {
      Array.prototype.forEach.call(group.children, function (child, i) {
        child.style.setProperty('--reveal-delay', (i % 4) * 60 + 'ms');
      });
    });

    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });

    revealItems.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- активный пункт меню ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var linkMap = {};

  Array.prototype.forEach.call(document.querySelectorAll('.site-nav a'), function (a) {
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#') linkMap[href.slice(1)] = a;
  });

  if ('IntersectionObserver' in window && sections.length) {
    var spyState = {};
    var spyOrder = sections.filter(function (s) { return linkMap[s.id]; })
      .map(function (s) { return s.id; });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { spyState[entry.target.id] = entry.isIntersecting; });

      var activeId = null;
      spyOrder.forEach(function (id) { if (spyState[id]) activeId = id; });

      Object.keys(linkMap).forEach(function (id) {
        linkMap[id].classList.toggle('is-active', id === activeId);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- фильтр работ ---------- */
  var filters = document.getElementById('filters');
  var projects = Array.prototype.slice.call(document.querySelectorAll('#cases .project'));

  if (filters && projects.length) {
    filters.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;

      var value = btn.getAttribute('data-filter');

      Array.prototype.forEach.call(filters.querySelectorAll('.filter'), function (b) {
        var on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });

      projects.forEach(function (card) {
        var show = value === 'all' || card.getAttribute('data-cat') === value;
        card.classList.toggle('is-hidden', !show);
      });
    });
  }

  /* ---------- просмотр изображений ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCaption = document.getElementById('lbCaption');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbCount = document.getElementById('lbCount');
  var items = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox]'));
  var current = 0;
  var lastFocus = null;

  if (lightbox && lbImg && items.length) {
    var zoomed = false;

    function pad2(n) {
      return (n < 10 ? '0' : '') + n;
    }

    function resetZoom() {
      zoomed = false;
      lbImg.classList.remove('is-zoomed');
      lbImg.style.transformOrigin = '';
    }

    function setItem(i) {
      current = (i + items.length) % items.length;
      var link = items[current];
      var img = link.querySelector('img');
      lbImg.src = link.getAttribute('href');
      lbImg.alt = img ? img.getAttribute('alt') || '' : '';
      lbCaption.textContent = link.getAttribute('data-caption') || '';
      if (lbCount) lbCount.textContent = pad2(current + 1) + ' / ' + pad2(items.length);
      resetZoom();
      var many = items.length > 1;
      lbPrev.disabled = !many;
      lbNext.disabled = !many;
    }

    function openLightbox(i) {
      lastFocus = document.activeElement;
      setItem(i);
      lightbox.hidden = false;
      document.body.classList.add('is-locked');
      lbClose.focus();
    }

    function closeLightbox() {
      lightbox.hidden = true;
      document.body.classList.remove('is-locked');
      lbImg.removeAttribute('src');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    items.forEach(function (link, i) {
      link.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        openLightbox(i);
      });
    });

    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', function () { setItem(current - 1); });
    lbNext.addEventListener('click', function () { setItem(current + 1); });

    /* увеличение по клику — точка клика становится центром */
    lbImg.addEventListener('click', function (e) {
      var rect = lbImg.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      zoomed = !zoomed;
      lbImg.style.transformOrigin = x + '% ' + y + '%';
      lbImg.classList.toggle('is-zoomed', zoomed);
    });

    /* свайп на телефоне */
    var touchStartX = null;

    lightbox.addEventListener('touchstart', function (e) {
      if (e.touches.length === 1) touchStartX = e.touches[0].clientX;
    }, { passive: true });

    lightbox.addEventListener('touchend', function (e) {
      if (touchStartX === null || zoomed) { touchStartX = null; return; }
      var dx = e.changedTouches[0].clientX - touchStartX;
      touchStartX = null;
      if (Math.abs(dx) > 48) {
        if (dx < 0) setItem(current + 1);
        else setItem(current - 1);
      }
    }, { passive: true });

    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (e) {
      if (lightbox.hidden) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        setItem(current - 1);
      } else if (e.key === 'ArrowRight') {
        setItem(current + 1);
      } else if (e.key === 'Tab') {
        var focusable = lightbox.querySelectorAll('button');
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------- копирование почты ---------- */
  var copyBtn = document.getElementById('copyEmail');
  var toast = null;

  function showToast(text) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      toast.setAttribute('role', 'status');
      toast.style.cssText = 'position:fixed;left:50%;bottom:26px;transform:translateX(-50%);padding:12px 20px;background:var(--ink);color:var(--bg);font-family:var(--mono);font-size:9px;letter-spacing:.12em;text-transform:uppercase;z-index:400;';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    window.clearTimeout(showToast._t);
    showToast._t = window.setTimeout(function () {
      if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
      toast = null;
    }, 2200);
  }

  window.__toast = showToast;

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = copyBtn.getAttribute('data-email');
      var done = function () { showToast('Почта скопирована'); };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done).catch(fallback);
      } else {
        fallback();
      }

      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = email;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); }
        catch (err) { showToast('Не получилось — выделите вручную'); }
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- год ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
