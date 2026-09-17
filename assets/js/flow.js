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
