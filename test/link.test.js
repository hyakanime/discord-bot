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

test('pickBestMatch: sans correspondance exacte => null (pas de fallback)', () => {
  // "Jul" est contenu dans les 3 pseudos mais n'en égale aucun => null
  assert.strictEqual(pickBestMatch(results, 'Jul'), null);
});

test('pickBestMatch: pseudo inexistant => null', () => {
  const partiels = [{ username: 'testaccount', uid: 'uid-1' }, { username: 'testarossa', uid: 'uid-2' }];
  assert.strictEqual(pickBestMatch(partiels, 'testa'), null);
});

test('pickBestMatch: liste vide ou invalide => null', () => {
  assert.strictEqual(pickBestMatch([], 'Julien'), null);
  assert.strictEqual(pickBestMatch(null, 'Julien'), null);
});
