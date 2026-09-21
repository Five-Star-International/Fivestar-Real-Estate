(function () {
  var toggle = document.getElementById('menu-button');
  var menu = document.getElementById('mobile-nav');
  var trigger = document.querySelector('.property-menu-trigger');
  var links;
  var i;

  if (!toggle || !menu || !trigger) {
    return;
  }

  function hasClass(element, name) {
    return (' ' + element.className + ' ').indexOf(' ' + name + ' ') !== -1;
  }

  function addClass(element, name) {
    if (!hasClass(element, name)) {
      element.className += (element.className ? ' ' : '') + name;
    }
  }

  function removeClass(element, name) {
    element.className = (' ' + element.className + ' ')
      .replace(new RegExp('\\s' + name + '(?=\\s)', 'g'), ' ')
      .replace(/^\s+|\s+$/g, '');
  }

  function closeMenu() {
    removeClass(menu, 'is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
  }

  function isInside(element, parent) {
    while (element) {
      if (element === parent) {
        return true;
      }
      element = element.parentNode;
    }
    return false;
  }

  toggle.onclick = function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';

    if (open) {
      addClass(menu, 'is-open');
    } else {
      removeClass(menu, 'is-open');
    }

    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  links = menu.querySelectorAll('a');
  for (i = 0; i < links.length; i += 1) {
    links[i].onclick = closeMenu;
  }

  trigger.onclick = function () {
    var expanded = trigger.getAttribute('aria-expanded') !== 'true';
    trigger.setAttribute('aria-expanded', String(expanded));
  };

  document.attachEvent ? document.attachEvent('onkeydown', function (event) {
    event = event || window.event;
    if (event.keyCode === 27) {
      closeMenu();
      trigger.setAttribute('aria-expanded', 'false');
    }
  }) : document.addEventListener('keydown', function (event) {
    if (event.keyCode === 27) {
      closeMenu();
      trigger.setAttribute('aria-expanded', 'false');
    }
  }, false);

  document.attachEvent ? document.attachEvent('onclick', function (event) {
    event = event || window.event;
    if (!isInside(event.srcElement, trigger.parentNode)) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  }) : document.addEventListener('click', function (event) {
    if (!isInside(event.target, trigger.parentNode)) {
      trigger.setAttribute('aria-expanded', 'false');
    }
  }, false);
})();
