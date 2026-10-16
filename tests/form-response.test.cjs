const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ownerSource = fs.readFileSync(path.join(__dirname, '../assets/owner-combined.js'), 'utf8');
const analyticsSource = fs.readFileSync(path.join(__dirname, '../assets/analytics.js'), 'utf8');

function originalFunction (name, nextName) {
  const start = ownerSource.indexOf('  function ' + name + ' (');
  const end = ownerSource.indexOf('  function ' + nextName + ' (', start);
  assert.ok(start >= 0 && end > start, 'Original response handler must exist');
  return ownerSource.slice(start, end);
}

function fixture (consent = true) {
  let request;
  let resetCount = 0;
  const successText = {};
  const successButton = {};
  const success = { querySelector: selector => selector === 'p' ? successText : successButton };
  const form = { getAttribute: name => name === 'method' ? 'POST' : '/accounts/api/realEstateContact.php', reset: () => resetCount++ };
  const submitButton = { removeAttribute () {}, setAttribute () {} };
  const window = {
    location: { hostname: 'fivestar.ie' },
    localStorage: { getItem: name => name === 'consent_analytics' && consent ? 'true' : null },
    JSON,
    FormData: class {}
  };
  class Request {
    constructor () { request = this; }
    open () {}
    setRequestHeader () {}
    send () {}
  }
  const context = vm.createContext({
    window, Date, XMLHttpRequest: Request,
    document: { createElement: () => ({}), head: { appendChild () {} } },
    form, submitButton, success, choices: {}, title: {},
    getField: () => ({ value: 'sell' }),
    setHidden: (element, hidden) => { element.hidden = hidden; },
    focusElement () {}, errorMessage: message => String(message || ''),
    showFormStatus () {}, showValidationErrors () {}
  });
  vm.runInContext(analyticsSource, context);
  vm.runInContext([
    originalFunction('readResponse', 'showValidationErrors'),
    originalFunction('completeSuccess', 'finishRequest'),
    originalFunction('finishRequest', 'submitForm'),
    originalFunction('submitForm', 'home')
  ].join('\n'), context);
  context.submitForm();
  return {
    window, success,
    respond (status, body, again = false) {
      request.status = status;
      request.responseText = body;
      request.readyState = 4;
      request.onreadystatechange();
      if (again) request.onreadystatechange();
    },
    networkError: () => request.onerror(),
    events: () => window.dataLayer.filter(item => item[0] === 'event'),
    resets: () => resetCount
  };
}

test('one successful JSON response creates one event even if completion runs twice', () => {
  const f = fixture();
  f.respond(200, JSON.stringify({ success: true }), true);
  assert.equal(f.events().length, 1);
  assert.equal(f.resets(), 1);
  assert.equal(f.success.hidden, false);
});

for (const [name, status, body] of [
  ['validation rejection', 422, JSON.stringify({ errors: { email: 'Invalid' } })],
  ['server failure', 500, JSON.stringify({ message: 'Failure' })],
  ['explicit application error', 200, JSON.stringify({ success: false, error: 'Failure' })],
  ['HTML response', 200, '<html>Sign in</html>'],
  ['empty response', 200, ''],
  ['JSON primitive', 200, 'true'],
  ['JSON array', 200, '[]']
]) {
  test(name + ' creates no owner event', () => {
    const f = fixture();
    f.respond(status, body);
    assert.equal(f.events().length, 0);
  });
}

test('network failure creates no owner event', () => {
  const f = fixture();
  f.networkError();
  assert.equal(f.events().length, 0);
  assert.equal(f.resets(), 0);
});

test('analytics denial still permits the owner confirmation', () => {
  const f = fixture(false);
  f.respond(200, JSON.stringify({ success: true }));
  assert.equal(f.events().length, 0);
  assert.equal(f.success.hidden, false);
});

test('analytics exception cannot prevent the owner confirmation', () => {
  const f = fixture();
  f.window.fiveStarTrackOwnerEnquiry = () => { throw new Error('Blocked'); };
  assert.doesNotThrow(() => f.respond(200, JSON.stringify({ success: true })));
  assert.equal(f.resets(), 1);
  assert.equal(f.success.hidden, false);
});
