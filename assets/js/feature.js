/* Избранная работа: смена раз в 7 секунд, стрелки и пауза */
(function () {
  'use strict';

  var feature = document.getElementById('feature');
  if (!feature) return;

  var slides = Array.prototype.slice.call(feature.querySelectorAll('.feature__slide'));
  if (slides.length < 2) return;

  var title = document.getElementById('featureTitle');
  var now = document.getElementById('featureNow');
  var prevBtn = document.getElementById('featurePrev');
  var nextBtn = document.getElementById('featureNext');
  var pauseBtn = document.getElementById('featurePause');
  var progress = document.getElementById('featureProgress');

  var DELAY = 7000;
  var index = 0;
  var timer = null;
  var userPaused = false;
  var hovering = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function show(i) {
    index = (i + slides.length) % slides.length;

    slides.forEach(function (slide, n) {
      slide.classList.toggle('is-active', n === index);
    });

    if (title) title.textContent = slides[index].getAttribute('data-title') || '';
    if (now) now.textContent = pad(index + 1);
  }

  function restartProgress() {
    if (!progress || reduceMotion) return;
    progress.style.animation = 'none';
    void progress.offsetWidth;
    progress.style.animation = '';
  }

  function isPaused() {
    return userPaused || hovering || document.hidden || reduceMotion;
  }

  function clearTimer() {
    window.clearTimeout(timer);
    timer = null;
  }

  function schedule() {
    clearTimer();
    if (isPaused()) return;
    timer = window.setTimeout(function () {
      show(index + 1);
      restartProgress();
      schedule();
    }, DELAY);
  }

  function syncState() {
    var paused = isPaused();
    feature.classList.toggle('is-paused', paused);
    if (paused) {
      clearTimer();
    } else {
      restartProgress();
      schedule();
    }
  }

  function next() {
    show(index + 1);
    restartProgress();
    schedule();
  }

  function previous() {
    show(index - 1);
    restartProgress();
    schedule();
  }

  function setUserPaused(value) {
    userPaused = value;
    if (pauseBtn) {
      pauseBtn.textContent = userPaused ? 'Продолжить' : 'Пауза';
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
    }
    syncState();
  }

  if (prevBtn) prevBtn.addEventListener('click', previous);
  if (nextBtn) nextBtn.addEventListener('click', next);

  if (pauseBtn) {
    if (reduceMotion) {
      pauseBtn.hidden = true;
    } else {
      pauseBtn.addEventListener('click', function () {
        setUserPaused(!userPaused);
      });
    }
  }

  if (canHover && !reduceMotion) {
    feature.addEventListener('mouseenter', function () {
      hovering = true;
      syncState();
    });
    feature.addEventListener('mouseleave', function () {
      hovering = false;
      syncState();
    });
  }

  document.addEventListener('visibilitychange', syncState);

  show(0);
  if (reduceMotion) {
    feature.classList.add('is-paused');
  } else {
    restartProgress();
    schedule();
  }
})();
