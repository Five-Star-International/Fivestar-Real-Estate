(() => {
  const services = {
    sell: ['Sell my property', 'Selling my property'],
    let: ['Let & manage', 'Letting or management'],
    value: ['Get a valuation', 'A property valuation']
  };

  const counties = [
    'Antrim',
    'Armagh',
    'Carlow',
    'Cavan',
    'Clare',
    'Cork',
    'Derry',
    'Donegal',
    'Down',
    'Dublin',
    'Fermanagh',
    'Galway',
    'Kerry',
    'Kildare',
    'Kilkenny',
    'Laois',
    'Leitrim',
    'Limerick',
    'Longford',
    'Louth',
    'Mayo',
    'Meath',
    'Monaghan',
    'Offaly',
    'Roscommon',
    'Sligo',
    'Tipperary',
    'Tyrone',
    'Waterford',
    'Westmeath',
    'Wexford',
    'Wicklow'
  ];

  const start = document.createElement('div');
  start.className = 'owner-start';
  start.innerHTML = `
    <h3>How can we help?</h3>
    <button class="button gold" type="button" data-start>
      Choose a service →
    </button>
  `;
  document.getElementById('enquiry-form').replaceWith(start);

  const dialog = document.createElement('dialog');
  dialog.className = 'owner-dialog owner-simple';
  dialog.setAttribute('aria-labelledby', 'simple-title');
  dialog.innerHTML = `
    <button class="owner-close" type="button" aria-label="Close enquiry">×</button>
    <p class="eyebrow">Five Star property team</p>
    <h2 id="simple-title" tabindex="-1">Choose a service</h2>

    <div class="owner-choices">
      ${Object.entries(services)
      .map(
        ([key, service]) => `
            <button type="button" class="owner-choice" data-service-key="${key}">
              <strong>${service[0]}</strong>
            </button>
          `
      )
      .join('')}
    </div>

    <form hidden novalidate>
      <input type="hidden" name="service">
      <input type="hidden" name="package">

      <button type="button" class="owner-back" data-change>
        ← Change service
      </button>

      <div class="field">
        <label for="simple-county">Property county</label>
        <select id="simple-county" name="county" required>
          <option value="">Choose county</option>
          ${counties.map(county => `<option>${county}</option>`).join('')}
          <option>Outside Ireland</option>
        </select>
      </div>

      <div class="field">
        <label for="simple-name">Name</label>
        <input id="simple-name" name="name" autocomplete="name" required>
      </div>

      <div class="field">
        <label for="simple-email">Email</label>
        <input id="simple-email" name="email" type="email" autocomplete="email" required>
      </div>

      <div class="field">
        <label for="simple-phone">Phone (optional)</label>
        <input id="simple-phone" name="phone" type="tel" autocomplete="tel">
      </div>

      <button type="submit" class="button gold">Send enquiry</button>
      <p class="form-note">
        No obligation. We’ll only use your details to reply.
      </p>
    </form>

    <div class="owner-success" hidden role="status">
      <p>Preview complete. Nothing has been sent.</p>
      <button class="button gold" type="button" data-done>Done</button>
    </div>
  `;
  document.body.append(dialog);

  const title = dialog.querySelector('h2');
  const choices = dialog.querySelector('.owner-choices');
  const form = dialog.querySelector('form');
  const success = dialog.querySelector('.owner-success');
  let opener;

  const focusHeading = () => {
    dialog.scrollTop = 0;
    title.focus({ preventScroll: true });
  };

  const home = () => {
    title.textContent = 'Choose a service';
    choices.hidden = false;
    form.hidden = true;
    success.hidden = true;
    focusHeading();
  };

  const choose = (key, packageName = '') => {
    form.elements.service.value = key;
    form.elements.package.value = packageName;
    title.textContent = packageName || services[key][0];
    choices.hidden = true;
    form.hidden = false;
    success.hidden = true;
    focusHeading();
  };

  const open = (key, packageName) => {
    opener = document.activeElement;
    dialog.showModal();
    document.body.classList.add('owner-open');

    if (services[key]) {
      choose(key, packageName);
    } else {
      home();
    }
  };

  dialog.querySelectorAll('[data-service-key]').forEach(button => {
    button.onclick = () => choose(button.dataset.serviceKey);
  });

  dialog.querySelector('[data-change]').onclick = home;
  dialog.querySelector('.owner-close').onclick = () => dialog.close();
  dialog.querySelector('[data-done]').onclick = () => dialog.close();

  dialog.addEventListener('close', () => {
    document.body.classList.remove('owner-open');
    opener?.focus({ preventScroll: true });
  });

  dialog.addEventListener('click', event => {
    if (event.target !== dialog) {
      return;
    }

    const bounds = dialog.getBoundingClientRect();
    const clickedOutside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (clickedOutside) {
      dialog.close();
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    if (!form.reportValidity()) {
      return;
    }

    form.hidden = true;
    choices.hidden = true;
    success.hidden = false;
    title.textContent = 'Preview complete';
    form.reset();
    success.querySelector('button').focus();
  });

  document.querySelectorAll('[data-valuation]').forEach(button => {
    button.addEventListener('click', () => {
      open('value', button.dataset.valuation);
    });
  });

  const routes = {
    '#sell': 'sell',
    '#manage': 'let',
    '#valuations': 'value'
  };

  document.querySelectorAll('a[href="#contact"],[data-start]').forEach(element => {
    element.addEventListener('click', event => {
      event.preventDefault();
      open();
    });
  });

  document.querySelectorAll('.fee-card').forEach(card => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'button gold';
    button.textContent = 'Get in touch';
    button.onclick = () => open('let', card.querySelector('h3').textContent);
    card.append(button);
  });
})();
