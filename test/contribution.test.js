// test/contribution.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { computeNewEntries, buildDmEmbed } = require('../function/contribution');

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

test('buildDmEmbed: request Accepted => titre + couleur verte', () => {
  const embed = buildDmEmbed({ _type: 'request', _status: 'Accepted', title: 'Naruto', comment: null });
  assert.strictEqual(embed.data.title, "✅ Ta demande d'ajout de **Naruto** a été acceptée !");
  assert.strictEqual(embed.data.color, 0x00FF00);
});

test('buildDmEmbed: request refused => couleur rouge', () => {
  const embed = buildDmEmbed({ _type: 'request', _status: 'refused', title: 'Ash Again', comment: '' });
  assert.strictEqual(embed.data.title, "❌ Ta demande d'ajout de **Ash Again** a été refusée.");
  assert.strictEqual(embed.data.color, 0xFF0000);
});

test('buildDmEmbed: edit Accepted', () => {
  const embed = buildDmEmbed({ _type: 'edit', _status: 'Accepted', title: 'One Piece', comment: null });
  assert.strictEqual(embed.data.title, '✅ Ta proposition de modification pour **One Piece** a été acceptée !');
  assert.strictEqual(embed.data.color, 0x00FF00);
});

test('buildDmEmbed: edit partially => couleur orange', () => {
  const embed = buildDmEmbed({ _type: 'edit', _status: 'partially', title: 'Yu Gi Oh', comment: null });
  assert.strictEqual(embed.data.title, '⚠️ Ta proposition de modification pour **Yu Gi Oh** a été partiellement acceptée.');
  assert.strictEqual(embed.data.color, 0xFF9900);
});

test('buildDmEmbed: edit refused', () => {
  const embed = buildDmEmbed({ _type: 'edit', _status: 'refused', title: 'Honey Lemon Soda', comment: null });
  assert.strictEqual(embed.data.title, '❌ Ta proposition de modification pour **Honey Lemon Soda** a été refusée.');
  assert.strictEqual(embed.data.color, 0xFF0000);
});

test('buildDmEmbed: comment renseigné => field Raison présent', () => {
  const embed = buildDmEmbed({ _type: 'request', _status: 'refused', title: 'X', comment: 'Doublon' });
  assert.ok(Array.isArray(embed.data.fields));
  assert.strictEqual(embed.data.fields[0].name, 'Raison');
  assert.strictEqual(embed.data.fields[0].value, 'Doublon');
});

test('buildDmEmbed: comment null ou vide => pas de field Raison', () => {
  const e1 = buildDmEmbed({ _type: 'request', _status: 'refused', title: 'X', comment: null });
  const e2 = buildDmEmbed({ _type: 'request', _status: 'refused', title: 'X', comment: '   ' });
  assert.ok(!e1.data.fields || e1.data.fields.length === 0);
  assert.ok(!e2.data.fields || e2.data.fields.length === 0);
});
