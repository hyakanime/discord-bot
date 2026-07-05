// test/contribution.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { computeNewEntries, buildContributionLine, buildUserDigestEmbeds } = require('../function/contribution');

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

test('buildContributionLine: les 5 combinaisons type/status', () => {
  assert.strictEqual(
    buildContributionLine({ _type: 'request', _status: 'accepted', title: 'Naruto', comment: null }),
    '✅ Ajout accepté : **Naruto**');
  assert.strictEqual(
    buildContributionLine({ _type: 'request', _status: 'refused', title: 'Ash Again', comment: '' }),
    '❌ Ajout refusé : **Ash Again**');
  assert.strictEqual(
    buildContributionLine({ _type: 'edit', _status: 'accepted', title: 'One Piece', comment: null }),
    '✅ Modif acceptée : **One Piece**');
  assert.strictEqual(
    buildContributionLine({ _type: 'edit', _status: 'partially', title: 'Yu Gi Oh', comment: null }),
    '⚠️ Modif partielle : **Yu Gi Oh**');
  assert.strictEqual(
    buildContributionLine({ _type: 'edit', _status: 'refused', title: 'Honey Lemon Soda', comment: null }),
    '❌ Modif refusée : **Honey Lemon Soda**');
});

test('buildContributionLine: comment renseigné => raison ajoutée après un tiret', () => {
  const line = buildContributionLine({ _type: 'request', _status: 'refused', title: 'X', comment: 'Doublon' });
  assert.strictEqual(line, '❌ Ajout refusé : **X** — Doublon');
});

test('buildContributionLine: comment null ou vide => pas de raison', () => {
  assert.strictEqual(
    buildContributionLine({ _type: 'request', _status: 'refused', title: 'X', comment: null }),
    '❌ Ajout refusé : **X**');
  assert.strictEqual(
    buildContributionLine({ _type: 'request', _status: 'refused', title: 'X', comment: '   ' }),
    '❌ Ajout refusé : **X**');
});

test('buildContributionLine: comment multi-lignes aplati et tronqué', () => {
  const long = 'a\nb'.padEnd(500, 'x');
  const line = buildContributionLine({ _type: 'edit', _status: 'refused', title: 'T', comment: long });
  assert.ok(!line.includes('\n'), 'pas de saut de ligne dans la raison');
  assert.ok(line.length < 360, 'raison tronquée');
});

test('buildUserDigestEmbeds: peu de contributions => 1 seul embed listant toutes les lignes', () => {
  const entries = [
    { _type: 'request', _status: 'accepted', title: 'Naruto', comment: null },
    { _type: 'edit', _status: 'refused', title: 'One Piece', comment: 'Doublon' },
  ];
  const embeds = buildUserDigestEmbeds(entries);
  assert.strictEqual(embeds.length, 1);
  assert.strictEqual(embeds[0].data.title, '📬 Mise à jour de tes contributions Hyakanime');
  assert.ok(embeds[0].data.description.includes('✅ Ajout accepté : **Naruto**'));
  assert.ok(embeds[0].data.description.includes('❌ Modif refusée : **One Piece** — Doublon'));
});

test('buildUserDigestEmbeds: beaucoup de contributions => découpage en plusieurs embeds', () => {
  const entries = [];
  for (let i = 0; i < 200; i++) {
    entries.push({ _type: 'edit', _status: 'accepted', title: 'Titre '.padEnd(60, 'x') + i, comment: null });
  }
  const embeds = buildUserDigestEmbeds(entries);
  assert.ok(embeds.length > 1, 'plusieurs embeds attendus');
  for (const e of embeds) {
    assert.ok(e.data.description.length <= 4096, 'description sous la limite Discord');
  }
});
