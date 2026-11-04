/* Денис Воронков — меню, появление блоков, просмотр работ, копирование почты. */
(function () {
  "use strict";

  var doc = document;
  window.__siteReady = true;

  var year = doc.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- меню ---------- */
  var toggle = doc.getElementById("navToggle");
  var nav = doc.getElementById("nav");

  if (toggle && nav) {
    function setMenu(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "Закрыть" : "Меню";
      doc.body.style.overflow = open ? "hidden" : "";
      if (open) {
        var first = nav.querySelector("a");
        if (first) first.focus();
      }
    }

    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });

    doc.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 820) setMenu(false);
    });
  }

  /* ---------- появление блоков ---------- */
  var reveals = Array.prototype.slice.call(doc.querySelectorAll(".reveal"));

  function showAll() {
    reveals.forEach(function (block) { block.classList.add("is-in"); });
  }

  if ("IntersectionObserver" in window && reveals.length) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var kids = entry.target.children;
        for (var i = 0; i < kids.length; i++) {
          kids[i].style.transitionDelay = (i * 70) + "ms";
        }
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.12 });

    reveals.forEach(function (block) { observer.observe(block); });
  } else {
    showAll();
  }

  /* ---------- имя на обложке уходит вглубь при скролле ---------- */
  var word = doc.querySelector("[data-hero-word]");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (word && !still) {
    var ticking = false;

    var update = function () {
      ticking = false;
      var progress = Math.min((window.scrollY || 0) / (window.innerHeight * 1.2 || 1), 1);
      word.style.transform = "scale(" + (1 - progress * 0.07).toFixed(4) + ")";
    };

    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    }, { passive: true });

    update();
  }

  /* ---------- просмотр работ ---------- */
  var box = doc.getElementById("lightbox");

  if (box) {
    var links = Array.prototype.slice.call(doc.querySelectorAll("[data-lightbox]"));
    var lbImg = doc.getElementById("lbImg");
    var lbCaption = doc.getElementById("lbCaption");
    var lbCount = doc.getElementById("lbCount");
    var index = 0;
    var lastFocus = null;

    var pad = function (n) { return (n < 10 ? "0" : "") + n; };

    var show = function (i) {
      if (!links.length) return;
      index = (i + links.length) % links.length;
      var link = links[index];
      var source = link.querySelector("img");
      lbImg.src = link.getAttribute("href");
      lbImg.alt = source ? source.alt : "";
      lbCaption.textContent = link.getAttribute("data-caption") || "";
      lbCount.textContent = pad(index + 1) + " / " + pad(links.length);
    };

    var open = function (i) {
      lastFocus = doc.activeElement;
      show(i);
      box.hidden = false;
      doc.body.style.overflow = "hidden";
      doc.getElementById("lbClose").focus();
    };

    var close = function () {
      box.hidden = true;
      doc.body.style.overflow = "";
      if (lastFocus) lastFocus.focus();
    };

    links.forEach(function (link, i) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        open(i);
      });
    });

    doc.getElementById("lbClose").addEventListener("click", close);
    doc.getElementById("lbPrev").addEventListener("click", function () { show(index - 1); });
    doc.getElementById("lbNext").addEventListener("click", function () { show(index + 1); });

    box.addEventListener("click", function (event) {
      if (event.target === box) close();
    });

    doc.addEventListener("keydown", function (event) {
      if (box.hidden) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);
    });
  }

  /* ---------- копирование почты ---------- */
  var copy = doc.getElementById("copyEmail");

  if (copy) {
    var reset = function () {
      copy.textContent = "Скопировать почту";
    };

    var done = function () {
      copy.textContent = "Скопировано";
      window.setTimeout(reset, 2000);
    };

    var fallback = function (email) {
      var field = doc.createElement("textarea");
      field.value = email;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      doc.body.appendChild(field);
      field.select();
      try {
        doc.execCommand("copy");
        done();
      } catch (error) {
        /* остаётся ручное копирование из ссылки рядом */
      }
      doc.body.removeChild(field);
    };

    copy.addEventListener("click", function () {
      var email = copy.getAttribute("data-email");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(done, function () { fallback(email); });
      } else {
        fallback(email);
      }
    });
  }
})();
