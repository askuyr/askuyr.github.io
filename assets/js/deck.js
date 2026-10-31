/* Стопка избранных работ: автоперелистывание раз в 7 секунд */
(function () {
  'use strict';

  var deck = document.getElementById('heroDeck');
  var stack = document.getElementById('deckStack');
  if (!deck || !stack) return;

  var cards = Array.prototype.slice.call(stack.children);
  var total = cards.length;
  if (!total) return;

  var caption = document.getElementById('deckCaption');
  var now = document.getElementById('deckNow');
  var prevBtn = document.getElementById('deckPrev');
  var nextBtn = document.getElementById('deckNext');
  var pauseBtn = document.getElementById('deckPause');
  var progress = document.getElementById('deckProgress');

  var DELAY = 7000;
  var LEAVE = 640;
  var index = 0;
  var timer = null;
  var busy = false;
  var userPaused = false;
  var hovering = false;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function pad(n) {
    return (n < 10 ? '0' : '') + n;
  }

  function updateUI() {
    var top = stack.firstElementChild;
    if (caption && top) caption.textContent = top.getAttribute('data-title') || '';
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
    timer = window.setTimeout(flip, DELAY);
  }

  function syncState() {
    var paused = isPaused();
    deck.classList.toggle('is-paused', paused);
    if (paused) {
      clearTimer();
    } else {
      restartProgress();
      schedule();
    }
  }

  function flip() {
    if (busy || stack.children.length < 2) return;

    busy = true;
    var top = stack.firstElementChild;
    var next = top.nextElementSibling;
    var nextIndex = (index + 1) % total;

    if (next && caption) caption.textContent = next.getAttribute('data-title') || '';
    if (now) now.textContent = pad(nextIndex + 1);

    top.classList.add('is-leaving');

    window.setTimeout(function () {
      top.style.transition = 'none';
      top.classList.remove('is-leaving');
      stack.appendChild(top);
      void top.offsetWidth;
      top.style.transition = '';

      index = (index + 1) % total;
      updateUI();
      busy = false;
      restartProgress();
      schedule();
    }, reduceMotion ? 0 : LEAVE);
  }

  function previous() {
    if (busy || stack.children.length < 2) return;

    busy = true;
    var last = stack.lastElementChild;
    stack.insertBefore(last, stack.firstElementChild);
    last.classList.add('is-entering');
    void last.offsetWidth;
    window.requestAnimationFrame(function () {
      last.classList.remove('is-entering');
    });

    index = (index - 1 + total) % total;
    updateUI();

    window.setTimeout(function () {
      busy = false;
      restartProgress();
      schedule();
    }, reduceMotion ? 0 : LEAVE);
  }

  function setUserPaused(value) {
    userPaused = value;
    if (pauseBtn) {
      pauseBtn.textContent = userPaused ? 'Продолжить' : 'Пауза';
      pauseBtn.setAttribute('aria-pressed', String(userPaused));
    }
    syncState();
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      previous();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      flip();
    });
  }

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
    deck.addEventListener('mouseenter', function () {
      hovering = true;
      syncState();
    });
    deck.addEventListener('mouseleave', function () {
      hovering = false;
      syncState();
    });
  }

  document.addEventListener('visibilitychange', syncState);

  updateUI();
  if (reduceMotion) {
    deck.classList.add('is-paused');
  } else {
    restartProgress();
    schedule();
  }
})();
