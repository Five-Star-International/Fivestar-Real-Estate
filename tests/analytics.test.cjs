const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/analytics.js'), 'utf8');

function fixture (choices = {}, hostname = 'fivestar.ie', blockedStorage = false) {
  const scripts = [];
  const window = {
    location: { hostname },
    localStorage: { getItem (name) {
      if (blockedStorage) throw new Error('Storage blocked');
      return choices[name] || null;
    } }
  };
  const document = { createElement: () => ({}), head: { appendChild: node => scripts.push(node) } };
  const context = vm.createContext({ window, document, Date });
  vm.runInContext(source, context);
  const events = () => Array.from(window.dataLayer || []).filter(item => item[0] === 'event');
  return { window, scripts, events, rerun: () => vm.runInContext(source, context) };
}

test('consent defaults precede the shared container and all optional consent starts denied', () => {
  const f = fixture();
  const first = f.window.dataLayer[0];
  assert.equal(first[0], 'consent');
  assert.equal(first[1], 'default');
  for (const key of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) {
    assert.equal(first[2][key], 'denied');
  }
  assert.equal(f.window.dataLayer[1].event, 'gtm.js');
  assert.equal(f.scripts[0].src, 'https://www.googletagmanager.com/gtm.js?id=GTM-5LKD5NV6');
  assert.equal(f.scripts[0].async, true);
  assert.equal(f.window.dataLayer.some(item => item[0] === 'config'), false);
});

test('analytics and advertising choices remain independent', () => {
  const f = fixture({ consent_analytics: 'true', consent_advertising: 'false' });
  assert.equal(f.window.dataLayer[0][2].analytics_storage, 'granted');
  assert.equal(f.window.dataLayer[0][2].ad_storage, 'denied');
});

test('blocked storage fails closed', () => {
  const f = fixture({}, 'fivestar.ie', true);
  assert.equal(f.window.dataLayer[0][2].analytics_storage, 'denied');
  assert.doesNotThrow(() => f.window.fiveStarTrackOwnerEnquiry('sell', { success: true }));
  assert.equal(f.events().length, 0);
});

test('preview/dev hosts do not load production measurement', () => {
  for (const host of ['localhost', 'dev.fivestar.ie', 'preview.example']) {
    const f = fixture({}, host);
    assert.equal(f.scripts.length, 0);
    assert.equal(f.window.fiveStarTrackOwnerEnquiry, undefined);
  }
});

test('initialization is idempotent', () => {
  const f = fixture();
  f.rerun();
  assert.equal(f.scripts.length, 1);
  assert.equal(f.window.dataLayer.length, 2);
});

test('owner services emit one GA4 command each with no contact data or invented value', () => {
  const f = fixture({ consent_analytics: 'true' });
  for (const service of ['sell', 'let', 'value']) {
    f.window.fiveStarTrackOwnerEnquiry(service, { success: true, email: 'private@example.test' });
  }
  assert.equal(f.events().length, 3);
  assert.deepEqual(f.events().map(item => item[2].lead_type), ['property_sale', 'long_term_letting', 'property_valuation']);
  for (const event of f.events()) {
    assert.equal(event[1], 'generate_lead');
    assert.equal(event[2].send_to, 'G-N69L7WZ0NF');
    assert.deepEqual(Object.keys(event[2]).sort(), ['lead_source', 'lead_type', 'method', 'send_to']);
    assert.equal(JSON.stringify(event).includes('private@example.test'), false);
  }
});

test('missing/revoked consent, invalid service, errors and unverified responses never create lead events', () => {
  const choices = { consent_analytics: 'true' };
  const f = fixture(choices);
  for (const payload of [{ success: false }, { error: 'failed' }, { errors: { email: 'invalid' } }, { validation_errors: ['invalid'] }, { _unverifiedResponse: true }]) {
    f.window.fiveStarTrackOwnerEnquiry('sell', payload);
  }
  f.window.fiveStarTrackOwnerEnquiry('other', { success: true });
  choices.consent_analytics = 'false';
  f.window.fiveStarTrackOwnerEnquiry('sell', { success: true });
  assert.equal(f.events().length, 0);
});
