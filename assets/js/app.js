/* Tria — payout selection.
   Switching the radio re-writes the hero copy and the CTA label,
   mirroring the "Points selected" / "Cashback selected" Figma frames.

   The card / radio states are pure CSS transitions. The copy is swapped
   at the bottom of a short cross-fade so the text never changes mid-flight,
   and the headline's height is animated because the two variants can differ
   by a line. */
(function () {
  'use strict';

  var FADE = 150;    // keep in sync with --t-copy
  var RESIZE = 240;  // keep in sync with --t-resize

  var COPY = {
    points: {
      title: 'Get More From Your Rewards With <span class="accent">Points</span>',
      sub: 'Turn your rewards into marketplace points.',
      cta: 'Choose Points',
      href: 'confirmation-points.html'
    },
    cashback: {
      title: 'Get Cashback of Eligible Rewards',
      sub: 'Turn your rewards into cashback.',
      cta: 'Choose Cashback',
      href: 'confirmation-cashback.html'
    }
  };

  var options = Array.prototype.slice.call(document.querySelectorAll('.option'));
  var title = document.querySelector('[data-title]');
  var sub = document.querySelector('[data-sub]');
  var cta = document.querySelector('[data-cta]');
  var ctaLink = document.querySelector('[data-cta-link]');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var fadeTimer = null;
  var resizeTimer = null;

  function markCards(choice) {
    options.forEach(function (option) {
      var selected = option.dataset.option === choice;
      option.classList.toggle('is-selected', selected);
      option.querySelector('.option__input').checked = selected;
    });
    document.body.dataset.choice = choice;
  }

  function writeCopy(choice) {
    var copy = COPY[choice];
    title.innerHTML = copy.title;
    sub.textContent = copy.sub;
    cta.textContent = copy.cta;
    ctaLink.setAttribute('href', copy.href);   // the CTA carries the choice forward
  }

  /* Swap the headline while animating from its old height to its new one. */
  function writeCopyAnimated(choice) {
    var from = title.offsetHeight;

    writeCopy(choice);
    var to = title.offsetHeight;

    if (from === to) return;

    title.classList.add('is-resizing');
    title.style.height = from + 'px';
    void title.offsetHeight;          // commit the start height before changing it
    title.style.height = to + 'px';

    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(function () {
      title.classList.remove('is-resizing');
      title.style.height = '';
    }, RESIZE);
  }

  function select(choice) {
    if (!COPY[choice] || choice === document.body.dataset.choice) return;

    markCards(choice);

    if (reduced.matches) {
      writeCopy(choice);
      return;
    }

    window.clearTimeout(fadeTimer);
    document.body.classList.add('is-swapping');
    fadeTimer = window.setTimeout(function () {
      writeCopyAnimated(choice);
      document.body.classList.remove('is-swapping');
    }, FADE);
  }

  options.forEach(function (option) {
    option.querySelector('.option__input').addEventListener('change', function () {
      select(option.dataset.option);
    });
  });

  var start = document.body.dataset.choice || 'points';
  markCards(start);
  writeCopy(start);
})();

/* Tria — photo gallery inside the Points card.
   Autoplays, loops, pauses on hover, advances on click. The track carries a
   clone of the first slide so the wrap-around slides forward like any other
   step, then snaps back with the transition switched off. */
(function () {
  'use strict';

  var DWELL = 4000;

  var root = document.querySelector('[data-gallery]');
  if (!root) return;

  var track = root.querySelector('[data-track]');
  var dots = Array.prototype.slice.call(root.querySelectorAll('.dot'));
  var peeks = { prev: root.querySelector('.peek--prev'), next: root.querySelector('.peek--next') };
  var N = dots.length;                       // real slides; the 4th is the clone
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  var i = 0;
  var timer = null;
  var paused = { hover: false, hidden: false, offscreen: false };

  function sliver(peek, index) {
    var real = index >= 0 && index < N;      // Figma shows no sliver past either end
    peek.classList.toggle('is-empty', !real);
    Array.prototype.forEach.call(peek.children, function (img) {
      img.classList.toggle('is-on', real && Number(img.dataset.peek) === index);
    });
  }

  function place(n) {
    track.style.transform = 'translateX(' + (n * -100) + '%)';
    track.dataset.i = n;
  }

  function paint() {
    var at = i % N;
    place(i);
    dots.forEach(function (dot, n) { dot.classList.toggle('is-on', n === at); });
    sliver(peeks.prev, at - 1);
    sliver(peeks.next, at + 1);
  }

  /* Jump from the clone back to the real first slide, unanimated. */
  function snap() {
    track.classList.add('is-snapping');
    i = 0;
    place(0);
    void track.offsetWidth;                  // commit before the transition returns
    track.classList.remove('is-snapping');
  }

  function advance() {
    if (i >= N) snap();                      // a click can land mid-wrap
    i += 1;
    paint();
  }

  track.addEventListener('transitionend', function (e) {
    if (e.target === track && e.propertyName === 'transform' && i >= N) snap();
  });

  function awake() {
    return !paused.hover && !paused.hidden && !paused.offscreen && !reduced.matches;
  }
  function stop() { window.clearTimeout(timer); timer = null; }
  function schedule() {
    stop();
    if (awake()) timer = window.setTimeout(function () { advance(); schedule(); }, DWELL);
  }

  root.addEventListener('mouseenter', function () { paused.hover = true; stop(); });
  root.addEventListener('mouseleave', function () { paused.hover = false; schedule(); });
  root.addEventListener('click', function () { advance(); schedule(); });

  document.addEventListener('visibilitychange', function () {
    paused.hidden = document.hidden;
    schedule();
  });

  if (window.IntersectionObserver) {
    new IntersectionObserver(function (entries) {
      paused.offscreen = !entries[0].isIntersecting;
      schedule();
    }, { threshold: 0.2 }).observe(root);
  }

  reduced.addEventListener('change', schedule);

  paint();
  schedule();
})();
