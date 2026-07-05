// test/link.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { pickBestMatch } = require('../commands/link.js');

const results = [
  { username: 'JulienToutain', uid: 'uid-toutain' },
  { username: 'JulienGiambrone', uid: 'uid-giambrone' },
  { username: 'Julien', uid: 'uid-julien' },
];

test('pickBestMatch: privilégie la correspondance exacte, pas le premier résultat', () => {
  const m = pickBestMatch(results, 'Julien');
  assert.strictEqual(m.uid, 'uid-julien');
});

test('pickBestMatch: correspondance exacte insensible à la casse', () => {
  const m = pickBestMatch(results, 'julien');
  assert.strictEqual(m.uid, 'uid-julien');
});

test('pickBestMatch: sans correspondance exacte => premier résultat', () => {
  const m = pickBestMatch(results, 'Jul');
  assert.strictEqual(m.uid, 'uid-toutain');
});

test('pickBestMatch: liste vide ou invalide => null', () => {
  assert.strictEqual(pickBestMatch([], 'Julien'), null);
  assert.strictEqual(pickBestMatch(null, 'Julien'), null);
});
