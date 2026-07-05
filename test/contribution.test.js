// test/contribution.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { computeNewEntries } = require('../function/contribution');

test('computeNewEntries: premier run (aucun id connu) => tout est nouveau', () => {
  const entries = [
    { _id: 'a', uid: 'u1' },
    { _id: 'b', uid: 'u2' },
  ];
  const { newEntries, currentIds } = computeNewEntries([], entries);
  assert.strictEqual(newEntries.length, 2);
  assert.deepStrictEqual(currentIds, ['a', 'b']);
});

test('computeNewEntries: run stable => aucune nouveauté', () => {
  const entries = [{ _id: 'a', uid: 'u1' }, { _id: 'b', uid: 'u2' }];
  const { newEntries, currentIds } = computeNewEntries(['a', 'b'], entries);
  assert.strictEqual(newEntries.length, 0);
  assert.deepStrictEqual(currentIds, ['a', 'b']);
});

test('computeNewEntries: transition de statut => le nouvel _id est notifié', () => {
  // "b" n'était pas suivi (il était pending, non interrogé) et apparaît maintenant en refused
  const entries = [{ _id: 'a', uid: 'u1' }, { _id: 'b', uid: 'u2' }];
  const { newEntries } = computeNewEntries(['a'], entries);
  assert.strictEqual(newEntries.length, 1);
  assert.strictEqual(newEntries[0]._id, 'b');
});

test('computeNewEntries: déduplique par _id', () => {
  const entries = [{ _id: 'a', uid: 'u1' }, { _id: 'a', uid: 'u1' }];
  const { newEntries, currentIds } = computeNewEntries([], entries);
  assert.strictEqual(newEntries.length, 1);
  assert.deepStrictEqual(currentIds, ['a']);
});
