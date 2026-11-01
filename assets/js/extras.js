/* Мелкие эффекты: прогресс чтения, параллакс обложки,
   счётчики фактов и кнопка «наверх» */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var bar = document.getElementById('scrollBar');
  var toTop = document.getElementById('toTop');
  var heroFigure = document.querySelector('.hero__figure');
  var hero = document.querySelector('.hero');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset || 0;
      var max = document.documentElement.scrollHeight - window.innerHeight;

      if (bar) {
        bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
      }

      if (toTop) {
        toTop.classList.toggle('is-visible', y > 600);
      }

      if (heroFigure && hero && !reduceMotion && window.innerWidth > 767) {
        var limit = hero.offsetTop + hero.offsetHeight;
        if (y < limit) {
          heroFigure.style.transform = 'translate3d(0,' + Math.min(y * 0.1, 72) + 'px,0)';
        } else if (heroFigure.style.transform) {
          heroFigure.style.transform = '';
        }
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- счётчики ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]'));

  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    counters.forEach(function (el) { el.textContent = '0'; });

    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var started = null;

        countObserver.unobserve(el);

        function step(now) {
          if (started === null) started = now;
          var progress = Math.min((now - started) / 900, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = String(Math.round(target * eased));
          if (progress < 1) window.requestAnimationFrame(step);
        }

        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });

    counters.forEach(function (el) { countObserver.observe(el); });
  }
})();
