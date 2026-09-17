/* Tria — confirm-change modal, shared by the confirmation and preference pages.
   Opened from the "Switch to …" button, dismissed by "Keep …", the scrim, the
   desktop close button or Escape. The confirm button is a plain link, so the
   navigation works with or without this script. */
(function () {
  'use strict';

  var modal = document.querySelector('[data-modal]');
  if (!modal) return;

  var sheet = modal.querySelector('.sheet');
  var opener = document.querySelector('[data-open-modal]');
  var lastFocus = null;
  var scrollLock = 0;

  function focusables() {
    return Array.prototype.filter.call(
      sheet.querySelectorAll('a[href],button:not([disabled])'),
      function (el) { return el.offsetParent !== null; }
    );
  }

  function open() {
    sheetSwiped = false;          // a previous swipe must not swallow a click in here
    lastFocus = document.activeElement;
    scrollLock = window.scrollY;
    document.body.classList.add('is-modal');
    modal.removeAttribute('aria-hidden');
    if (opener) opener.setAttribute('aria-expanded', 'true');

    // hold the page still behind the scrim without losing the scroll position
    document.body.style.position = 'fixed';
    document.body.style.top = -scrollLock + 'px';
    document.body.style.width = '100%';

    var first = focusables()[0];
    if (first) first.focus();
  }

  function close() {
    document.body.classList.remove('is-modal');
    modal.setAttribute('aria-hidden', 'true');
    if (opener) opener.setAttribute('aria-expanded', 'false');

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    window.scrollTo(0, scrollLock);

    // a click leaves focus on the opener; a programmatic open may not, so fall back
    var back = (lastFocus && lastFocus !== document.body) ? lastFocus : opener;
    if (back) back.focus();
  }

  if (opener) {
    opener.addEventListener('click', function (e) {
      e.preventDefault();
      open();
    });
  }

  Array.prototype.forEach.call(modal.querySelectorAll('[data-close]'), function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      close();
    });
  });

  /* Swipe the sheet down to dismiss — what the grabber promises. Only in the
     bottom-sheet layout; above 1000px it is a centred dialog with a close button.
     A gesture that moved swallows the click after it, so a swipe that starts on
     a button never also presses it. */
  var DOWN_START = 8;
  var sheetDrag = null;
  var sheetSwiped = false;

  function isBottomSheet() {
    return window.matchMedia('(max-width: 999px)').matches;
  }

  sheet.addEventListener('pointerdown', function (e) {
    if (!isBottomSheet() || !document.body.classList.contains('is-modal')) return;
    if (e.button !== undefined && e.button !== 0) return;
    sheetSwiped = false;
    sheetDrag = { x: e.clientX, y: e.clientY, dy: 0, moved: false, id: e.pointerId };
  });

  sheet.addEventListener('pointermove', function (e) {
    if (!sheetDrag || e.pointerId !== sheetDrag.id) return;
    var dy = e.clientY - sheetDrag.y;
    var dx = e.clientX - sheetDrag.x;

    if (!sheetDrag.moved) {
      if (dy < DOWN_START || Math.abs(dx) > dy) return;   // downward gestures only
      sheetDrag.moved = true;
      sheet.classList.add('is-dragging');
      try { sheet.setPointerCapture(e.pointerId); } catch (err) { /* pointer already gone */ }
    }

    e.preventDefault();
    sheetDrag.dy = Math.max(0, dy);
    sheet.style.transform = 'translateY(' + sheetDrag.dy + 'px)';
  });

  function endSheetDrag() {
    if (!sheetDrag) return;
    var moved = sheetDrag.moved;
    var dy = sheetDrag.dy;
    sheetDrag = null;
    if (!moved) return;                      // a tap — leave it to the buttons

    sheet.classList.remove('is-dragging');
    sheetSwiped = true;
    sheet.style.transform = '';               // spring back, or animate out on close
    if (dy > Math.max(90, sheet.offsetHeight * 0.25)) close();
  }

  sheet.addEventListener('pointerup', endSheetDrag);
  sheet.addEventListener('pointercancel', endSheetDrag);

  sheet.addEventListener('click', function (e) {
    if (!sheetSwiped) return;
    e.preventDefault();
    e.stopPropagation();                      // must not reach the button underneath
    sheetSwiped = false;
  }, true);

  document.addEventListener('keydown', function (e) {
    if (!document.body.classList.contains('is-modal')) return;

    if (e.key === 'Escape') { close(); return; }

    if (e.key === 'Tab') {                 // keep focus inside the dialog
      var items = focusables();
      if (!items.length) return;
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
})();
