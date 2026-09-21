(function () {
  var services = {
    sell: ['Sell my property', 'Selling my property'],
    'let': ['Let & manage', 'Letting or management'],
    value: ['Get a valuation', 'A property valuation']
  };

  var counties = [
    'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry',
    'Donegal', 'Down', 'Dublin', 'Fermanagh', 'Galway', 'Kerry', 'Kildare',
    'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford', 'Louth', 'Mayo',
    'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary',
    'Tyrone', 'Waterford', 'Westmeath', 'Wexford', 'Wicklow'
  ];

  var enquiryForm = document.getElementById('enquiry-form');
  if (!enquiryForm) {
    return;
  }

  var start = document.createElement('div');
  start.className = 'owner-start';
  start.innerHTML = '<h3>How can we help?</h3>' +
    '<button class="button gold" type="button" data-start>Choose a service &rarr;</button>';
  enquiryForm.parentNode.replaceChild(start, enquiryForm);

  var backdrop = document.createElement('div');
  backdrop.className = 'owner-modal-backdrop';
  backdrop.setAttribute('aria-hidden', 'true');
  backdrop.style.display = 'none';
  document.body.appendChild(backdrop);

  var dialog = document.createElement('div');
  dialog.className = 'owner-dialog owner-simple owner-modal';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.setAttribute('aria-hidden', 'true');
  dialog.setAttribute('aria-labelledby', 'simple-title');
  dialog.tabIndex = -1;
  dialog.style.display = 'none';
  dialog.innerHTML = '<button class="owner-close" type="button" aria-label="Close enquiry">&times;</button>' +
    '<p class="eyebrow">Five Star property team</p>' +
    '<h2 id="simple-title" tabindex="-1">Choose a service</h2>' +
    '<div class="owner-choices">' +
    '<button type="button" class="owner-choice" data-service-key="sell"><strong>Sell my property</strong></button>' +
    '<button type="button" class="owner-choice" data-service-key="let"><strong>Let &amp; manage</strong></button>' +
    '<button type="button" class="owner-choice" data-service-key="value"><strong>Get a valuation</strong></button>' +
    '</div>' +
    '<form action="/accounts/api/realEstateContact.php" method="post" hidden novalidate>' +
    '<input type="hidden" name="service"><input type="hidden" name="package">' +
    '<button type="button" class="owner-back" data-change>&larr; Change service</button>' +
    '<div class="field"><label for="simple-county">Property county</label>' +
    '<select id="simple-county" name="county" required><option value="">Choose county</option>' +
    counties.map(function (county) { return '<option>' + county + '</option>'; }).join('') +
    '<option>Outside Ireland</option></select>' +
    '<p class="field-error" data-field-error-for="county" role="alert" hidden></p></div>' +
    '<div class="field"><label for="simple-name">Name</label>' +
    '<input id="simple-name" name="name" autocomplete="name" required>' +
    '<p class="field-error" data-field-error-for="name" role="alert" hidden></p></div>' +
    '<div class="field"><label for="simple-email">Email</label>' +
    '<input id="simple-email" name="email" type="email" autocomplete="email" required>' +
    '<p class="field-error" data-field-error-for="email" role="alert" hidden></p></div>' +
    '<div class="field"><label for="simple-phone">Phone (optional)</label>' +
    '<input id="simple-phone" name="phone" type="tel" autocomplete="tel">' +
    '<p class="field-error" data-field-error-for="phone" role="alert" hidden></p></div>' +
    '<p class="form-status" data-form-status role="status" aria-live="polite" hidden></p>' +
    '<button type="submit" class="button gold">Send enquiry</button>' +
    '<p class="form-note">No obligation. We&rsquo;ll only use your details to reply.</p></form>' +
    '<div class="owner-success" hidden role="status"><p>Thanks, your enquiry has been sent.</p>' +
    '<button class="button gold" type="button" data-done>Done</button></div>';
  document.body.appendChild(dialog);

  var title = dialog.querySelector('h2');
  var choices = dialog.querySelector('.owner-choices');
  var form = dialog.querySelector('form');
  var success = dialog.querySelector('.owner-success');
  var formStatus = dialog.querySelector('[data-form-status]');
  var submitButton = form.querySelector('button[type="submit"]');
  var fieldErrors = {};
  var errorNodes = form.querySelectorAll('[data-field-error-for]');
  var opener = null;
  var isOpen = false;
  var i;

  for (i = 0; i < errorNodes.length; i += 1) {
    fieldErrors[errorNodes[i].getAttribute('data-field-error-for')] = errorNodes[i];
  }

  function setHidden (element, hidden) {
    element.style.display = hidden ? 'none' : '';
    if (hidden) {
      element.setAttribute('hidden', 'hidden');
    } else {
      element.removeAttribute('hidden');
    }
  }

  function addClass (element, name) {
    if ((' ' + element.className + ' ').indexOf(' ' + name + ' ') === -1) {
      element.className += (element.className ? ' ' : '') + name;
    }
  }

  function removeClass (element, name) {
    var classes = element.className.split(' ');
    var kept = [];
    var classIndex;

    for (classIndex = 0; classIndex < classes.length; classIndex += 1) {
      if (classes[classIndex] && classes[classIndex] !== name) {
        kept.push(classes[classIndex]);
      }
    }
    element.className = kept.join(' ');
  }

  function trim (value) {
    return String(value || '').replace(/^\s+|\s+$/g, '');
  }

  function getField (name) {
    return form.elements[name] || form.elements.namedItem(name);
  }

  function focusElement (element) {
    if (element && element.focus) {
      element.focus();
    }
  }

  function focusHeading () {
    dialog.scrollTop = 0;
    focusElement(title);
  }

  function clearValidationErrors () {
    var name;
    var invalidFields = form.querySelectorAll('[aria-invalid="true"]');

    for (name in fieldErrors) {
      if (fieldErrors.hasOwnProperty(name)) {
        fieldErrors[name].textContent = '';
        setHidden(fieldErrors[name], true);
      }
    }

    for (i = 0; i < invalidFields.length; i += 1) {
      invalidFields[i].removeAttribute('aria-invalid');
      invalidFields[i].removeAttribute('aria-describedby');
    }

    formStatus.textContent = '';
    setHidden(formStatus, true);
    removeClass(formStatus, 'is-error');
    removeClass(formStatus, 'is-success');
  }

  function showFormStatus (message, type) {
    formStatus.textContent = message;
    setHidden(formStatus, !message);

    if (type === 'success') {
      addClass(formStatus, 'is-success');
      removeClass(formStatus, 'is-error');
    } else {
      addClass(formStatus, 'is-error');
      removeClass(formStatus, 'is-success');
    }
  }

  function errorMessage (value) {
    var messages;
    var key;

    if (Object.prototype.toString.call(value) === '[object Array]') {
      messages = [];
      for (i = 0; i < value.length; i += 1) {
        if (value[i]) {
          messages.push(errorMessage(value[i]));
        }
      }
      return messages.join(' ');
    }

    if (value && typeof value === 'object') {
      if (value.message || value.error) {
        return errorMessage(value.message || value.error);
      }
      messages = [];
      for (key in value) {
        if (value.hasOwnProperty(key)) {
          messages.push(errorMessage(value[key]));
        }
      }
      return messages.join(' ');
    }

    return String(value || '');
  }

  function readResponse (text) {
    if (!text) {
      return {};
    }
    try {
      return window.JSON.parse(text);
    } catch (error) {
      return { message: text };
    }
  }

  function showValidationErrors (payload) {
    var errors = payload && (payload.errors || payload.validation_errors);
    var generalErrors = [];
    var firstInvalidField = null;
    var name;
    var message;
    var errorNode;
    var field;

    if (!errors) {
      errors = {};

      if (payload && typeof payload === 'object') {
        for (name in payload) {
          if (payload.hasOwnProperty(name) && name !== 'message' && name !== 'error') {
            errors[name] = payload[name];
          }
        }
      }
    }

    if (Object.prototype.toString.call(errors) === '[object Array]') {
      for (i = 0; i < errors.length; i += 1) {
        message = errorMessage(errors[i]);
        if (message) {
          generalErrors.push(message);
        }
      }
    } else if (typeof errors === 'object') {
      for (name in errors) {
        if (!errors.hasOwnProperty(name)) {
          continue;
        }
        message = errorMessage(errors[name]);
        errorNode = fieldErrors[name];
        field = getField(name);

        if (!message) {
          continue;
        }
        if (!errorNode || !field) {
          generalErrors.push(name + ': ' + message);
          continue;
        }

        errorNode.textContent = message;
        setHidden(errorNode, false);
        errorNode.id = errorNode.id || field.id + '-error';
        field.setAttribute('aria-invalid', 'true');
        field.setAttribute('aria-describedby', errorNode.id);
        firstInvalidField = firstInvalidField || field;
      }
    } else if (errors) {
      generalErrors.push(errorMessage(errors));
    }

    if (payload && payload.message) {
      generalErrors.unshift(errorMessage(payload.message));
    } else if (payload && payload.error) {
      generalErrors.unshift(errorMessage(payload.error));
    }

    showFormStatus(generalErrors.join(' ') || 'Please check the highlighted fields.');
    title.textContent = 'Please check your details';
    focusElement(firstInvalidField);
  }

  function validateForm () {
    var errors = {};
    var county = getField('county');
    var nameField = getField('name');
    var email = getField('email');
    var name;

    if (!trim(county.value)) {
      errors.county = 'Please choose a county.';
    }
    if (!trim(nameField.value)) {
      errors.name = 'Please enter your name.';
    }
    if (!/^\S+@\S+\.\S+$/.test(trim(email.value))) {
      errors.email = 'Please enter a valid email address.';
    }

    for (name in errors) {
      if (errors.hasOwnProperty(name)) {
        return errors;
      }
    }
    return null;
  }

  function serializeForm () {
    var values = [];
    var controls = form.elements;
    var control;
    var optionIndex;

    for (i = 0; i < controls.length; i += 1) {
      control = controls[i];
      if (!control.name || control.disabled || /^(submit|button|reset)$/.test(control.type)) {
        continue;
      }
      if ((control.type === 'checkbox' || control.type === 'radio') && !control.checked) {
        continue;
      }
      if (control.type === 'select-multiple') {
        for (optionIndex = 0; optionIndex < control.options.length; optionIndex += 1) {
          if (control.options[optionIndex].selected) {
            values.push(encodeURIComponent(control.name) + '=' + encodeURIComponent(control.options[optionIndex].value));
          }
        }
      } else {
        values.push(encodeURIComponent(control.name) + '=' + encodeURIComponent(control.value));
      }
    }
    return values.join('&');
  }

  function completeSuccess (payload) {
    var message = payload && payload.message;
    setHidden(form, true);
    setHidden(choices, true);
    setHidden(success, false);
    title.textContent = 'Enquiry sent';
    success.querySelector('p').textContent = errorMessage(message) || 'Thanks, your enquiry has been sent.';
    form.reset();
    focusElement(success.querySelector('button'));
  }

  function finishRequest () {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  }

  function submitForm () {
    var xhr = new XMLHttpRequest();
    var method = (form.getAttribute('method') || 'POST').toUpperCase();
    var action = form.getAttribute('action');
    var body;

    xhr.open(method, action, true);
    xhr.setRequestHeader('Accept', 'application/json');
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    showFormStatus('Sending enquiry...', 'success');

    xhr.onreadystatechange = function () {
      var payload;
      if (xhr.readyState !== 4) {
        return;
      }
      payload = readResponse(xhr.responseText);

      if (xhr.status >= 200 && xhr.status < 300) {
        completeSuccess(payload);
      } else if (xhr.status === 422) {
        showValidationErrors(payload);
      } else {
        showFormStatus(payload.message || 'We could not send your enquiry. Please try again.');
      }
      finishRequest();
    };

    xhr.onerror = function () {
      showFormStatus('We could not send your enquiry. Please try again.');
      finishRequest();
    };

    try {
      if (window.FormData) {
        body = new window.FormData(form);
        xhr.send(body);
      } else {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.send(serializeForm());
      }
    } catch (error) {
      showFormStatus('We could not send your enquiry. Please try again.');
      finishRequest();
    }
  }

  function home () {
    clearValidationErrors();
    title.textContent = 'Choose a service';
    setHidden(choices, false);
    setHidden(form, true);
    setHidden(success, true);
    focusHeading();
  }

  function choose (key, packageName) {
    var service = services[key];
    if (!service) {
      return;
    }
    clearValidationErrors();
    getField('service').value = key;
    getField('package').value = packageName || '';
    title.textContent = packageName || service[0];
    setHidden(choices, true);
    setHidden(form, false);
    setHidden(success, true);
    focusHeading();
  }

  function closeModal () {
    if (!isOpen) {
      return;
    }
    isOpen = false;
    setHidden(dialog, true);
    backdrop.style.display = 'none';
    dialog.setAttribute('aria-hidden', 'true');
    removeClass(document.body, 'owner-open');
    focusElement(opener);
    opener = null;
  }

  function showModal () {
    isOpen = true;
    setHidden(dialog, false);
    dialog.style.display = 'block';
    backdrop.style.display = 'block';
    dialog.setAttribute('aria-hidden', 'false');
    addClass(document.body, 'owner-open');
  }

  var serviceButtons = dialog.querySelectorAll('[data-service-key]');
  for (i = 0; i < serviceButtons.length; i += 1) {
    serviceButtons[i].onclick = (function (button) {
      return function () {
        choose(button.getAttribute('data-service-key'));
      };
    })(serviceButtons[i]);
  }

  dialog.querySelector('[data-change]').onclick = home;
  dialog.querySelector('.owner-close').onclick = closeModal;
  dialog.querySelector('[data-done]').onclick = closeModal;
  backdrop.onclick = closeModal;

  document.attachEvent ? document.attachEvent('onkeydown', function (event) {
    event = event || window.event;
    if (isOpen && event.keyCode === 27) {
      closeModal();
    }
  }) : document.addEventListener('keydown', function (event) {
    if (isOpen && event.keyCode === 27) {
      closeModal();
    }
  }, false);

  form.onsubmit = function (event) {
    var clientErrors;
    event = event || window.event;
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      event.returnValue = false;
    }
    clearValidationErrors();
    clientErrors = validateForm();

    if (clientErrors) {
      showValidationErrors({ errors: clientErrors });
      return false;
    }
    submitForm();
    return false;
  };

  var valuationButtons = document.querySelectorAll('[data-valuation]');
  for (i = 0; i < valuationButtons.length; i += 1) {
    valuationButtons[i].onclick = (function (button) {
      return function () {
        opener = document.activeElement;
        showModal();
        choose('value', button.getAttribute('data-valuation'));
      };
    })(valuationButtons[i]);
  }

  var contactLinks = document.querySelectorAll('a[href="#contact"],[data-start]');
  for (i = 0; i < contactLinks.length; i += 1) {
    contactLinks[i].onclick = function (event) {
      event = event || window.event;
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
      opener = document.activeElement;
      showModal();
      home();
      return false;
    };
  }

  var feeCards = document.querySelectorAll('.fee-card');
  for (i = 0; i < feeCards.length; i += 1) {
    (function (card) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'button gold';
      button.textContent = 'Get in touch';
      button.onclick = function () {
        opener = document.activeElement;
        showModal();
        choose('let', card.querySelector('h3').textContent);
      };
      card.appendChild(button);
    })(feeCards[i]);
  }
})();
