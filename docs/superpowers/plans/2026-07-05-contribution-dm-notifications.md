# Notifications DM edit/request — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Envoyer chaque jour un DM Discord aux utilisateurs liés via `/link` quand une de leurs demandes edit/request Hyakanime passe en acceptée / refusée / partiellement acceptée.

**Architecture:** Un job cron quotidien (dans `index.js`) appelle `checkContributions(client)`. Cette fonction interroge 5 endpoints de l'API Hyakanime, détecte les nouvelles entrées via un ensemble d'`_id` déjà vus stocké en Mongo, matche l'`uid` de chaque nouveauté avec `UserLink.hyakanimeUid`, et envoie un DM. La logique de diff et de rendu d'embed est isolée dans deux fonctions pures unit-testées.

**Tech Stack:** Node.js (CommonJS), discord.js 14, mongoose 8, node-cron, `node:test` (test runner intégré), `fetch` global.

## Global Constraints

- CommonJS (`require`/`module.exports`), pas d'ESM.
- En-tête d'authentification API : `authorization: Token ${tokenHyakanime}` (valeurs depuis `config.json`).
- `urlEndpoint` et `tokenHyakanime` lus depuis `../config.json`.
- Tests avec `node:test` + `node:assert`, un fichier par `node --test <path>` (aucun script npm de test).
- Français pour tout texte destiné à l'utilisateur.
- Modèle mongoose nommé de façon unique : `ContributionState`.
- Statuts interrogés uniquement terminaux : `partially`, `refused`, `Accepted` (jamais `pending`).

---

### Task 1: Fonction pure `computeNewEntries`

**Files:**
- Create: `function/contribution.js`
- Test: `test/contribution.test.js`

**Interfaces:**
- Consumes: rien.
- Produces: `computeNewEntries(previousSeenIds: string[], entries: object[]) => { newEntries: object[], currentIds: string[] }`. Déduplique `entries` par `_id` (première occurrence gardée). `newEntries` = entrées dédupliquées dont `_id` n'est pas dans `previousSeenIds`. `currentIds` = liste des `_id` dédupliqués du run. Exporté via `module.exports`.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `test/contribution.test.js` :

```js
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
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `node --test test/contribution.test.js`
Expected: FAIL — `Cannot find module '../function/contribution'` (le fichier n'existe pas encore).

- [ ] **Step 3: Implémentation minimale**

Créer `function/contribution.js` :

```js
// function/contribution.js
function computeNewEntries(previousSeenIds, entries) {
  const seen = new Set(previousSeenIds || []);
  const dedup = new Map();
  for (const entry of entries) {
    if (!dedup.has(entry._id)) dedup.set(entry._id, entry);
  }
  const deduped = Array.from(dedup.values());
  const newEntries = deduped.filter((e) => !seen.has(e._id));
  const currentIds = deduped.map((e) => e._id);
  return { newEntries, currentIds };
}

module.exports = { computeNewEntries };
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `node --test test/contribution.test.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add function/contribution.js test/contribution.test.js
git commit -m "feat: computeNewEntries pour la détection des nouvelles contributions"
```

---

### Task 2: Fonction pure `buildDmEmbed`

**Files:**
- Modify: `function/contribution.js`
- Test: `test/contribution.test.js`

**Interfaces:**
- Consumes: `EmbedBuilder` de `discord.js`.
- Produces: `buildDmEmbed(entry) => EmbedBuilder`. `entry` a `_type` (`'edit'|'request'`), `_status` (`'Accepted'|'refused'|'partially'`), `title` (string), `comment` (string|null). Titre et couleur selon le tableau ci-dessous ; ajoute un field `{ name: 'Raison', value: <comment tronqué à 1024> }` uniquement si `comment` est une chaîne non vide (après `trim`). Exporté via `module.exports`.

Tableau titre/couleur :

| _type | _status | titre | couleur |
|---------|-----------|-------|---------|
| request | Accepted | `✅ Ta demande d'ajout de **{title}** a été acceptée !` | `0x00FF00` |
| request | refused | `❌ Ta demande d'ajout de **{title}** a été refusée.` | `0xFF0000` |
| edit | Accepted | `✅ Ta proposition de modification pour **{title}** a été acceptée !` | `0x00FF00` |
| edit | partially | `⚠️ Ta proposition de modification pour **{title}** a été partiellement acceptée.` | `0xFF9900` |
| edit | refused | `❌ Ta proposition de modification pour **{title}** a été refusée.` | `0xFF0000` |

- [ ] **Step 1: Écrire les tests qui échouent**

Ajouter à la fin de `test/contribution.test.js` :

```js
const { buildDmEmbed } = require('../function/contribution');

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
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

Run: `node --test test/contribution.test.js`
Expected: FAIL — `buildDmEmbed is not a function`.

- [ ] **Step 3: Implémentation**

Dans `function/contribution.js`, ajouter en haut :

```js
const { EmbedBuilder } = require('discord.js');
```

Ajouter avant `module.exports` :

```js
const WORDING = {
  'request:Accepted': { title: (t) => `✅ Ta demande d'ajout de **${t}** a été acceptée !`, color: 0x00FF00 },
  'request:refused': { title: (t) => `❌ Ta demande d'ajout de **${t}** a été refusée.`, color: 0xFF0000 },
  'edit:Accepted': { title: (t) => `✅ Ta proposition de modification pour **${t}** a été acceptée !`, color: 0x00FF00 },
  'edit:partially': { title: (t) => `⚠️ Ta proposition de modification pour **${t}** a été partiellement acceptée.`, color: 0xFF9900 },
  'edit:refused': { title: (t) => `❌ Ta proposition de modification pour **${t}** a été refusée.`, color: 0xFF0000 },
};

function buildDmEmbed(entry) {
  const spec = WORDING[`${entry._type}:${entry._status}`];
  const embed = new EmbedBuilder()
    .setTitle(spec.title(entry.title || 'Titre inconnu'))
    .setColor(spec.color)
    .setFooter({ text: 'Source : Hyakanime' })
    .setTimestamp();

  if (typeof entry.comment === 'string' && entry.comment.trim() !== '') {
    embed.addFields({ name: 'Raison', value: entry.comment.slice(0, 1024) });
  }
  return embed;
}
```

Mettre à jour l'export :

```js
module.exports = { computeNewEntries, buildDmEmbed };
```

- [ ] **Step 4: Lancer les tests pour vérifier qu'ils passent**

Run: `node --test test/contribution.test.js`
Expected: PASS (11 tests au total).

- [ ] **Step 5: Commit**

```bash
git add function/contribution.js test/contribution.test.js
git commit -m "feat: buildDmEmbed pour les DM de statut de contribution"
```

---

### Task 3: Modèle `ContributionState`

**Files:**
- Create: `models/ContributionState.js`

**Interfaces:**
- Consumes: `mongoose`.
- Produces: modèle mongoose `ContributionState` avec schéma `{ key: String (unique, default 'contribution'), seenIds: [String] (default []) }`.

- [ ] **Step 1: Créer le modèle**

Créer `models/ContributionState.js` :

```js
const mongoose = require('mongoose');

const contributionStateSchema = new mongoose.Schema({
  key: { type: String, default: 'contribution', unique: true },
  seenIds: { type: [String], default: [] },
});

module.exports = mongoose.model('ContributionState', contributionStateSchema);
```

- [ ] **Step 2: Vérifier que le modèle se charge sans erreur**

Run: `node -e "require('./models/ContributionState.js'); console.log('ok')"`
Expected: affiche `ok` (pas d'exception de schéma).

- [ ] **Step 3: Commit**

```bash
git add models/ContributionState.js
git commit -m "feat: modèle ContributionState pour le suivi des _id vus"
```

---

### Task 4: `fetchAll` + orchestration `checkContributions`

**Files:**
- Modify: `function/contribution.js`

**Interfaces:**
- Consumes: `computeNewEntries`, `buildDmEmbed` (Task 1-2), modèle `ContributionState` (Task 3), modèle `UserLink` (`models/UserLink.js`, champ `hyakanimeUid` et `discordId`), `urlEndpoint` et `tokenHyakanime` de `config.json`.
- Produces:
  - `fetchAll() => Promise<{ entries: object[], ok: boolean }>`. Interroge les 5 endpoints ; chaque entrée est retournée avec `_type` et `_status` ajoutés. `ok` = false si au moins une requête a échoué (HTTP non-ok ou exception).
  - `checkContributions(client) => Promise<void>`. Orchestration complète.

- [ ] **Step 1: Implémenter `fetchAll` et `checkContributions`**

Dans `function/contribution.js`, ajouter en haut des requires :

```js
const { urlEndpoint, tokenHyakanime } = require('../config.json');
const ContributionState = require('../models/ContributionState');
const UserLink = require('../models/UserLink');
```

Ajouter avant `module.exports` :

```js
const ENDPOINTS = [
  { type: 'edit', status: 'partially' },
  { type: 'edit', status: 'refused' },
  { type: 'edit', status: 'Accepted' },
  { type: 'request', status: 'Accepted' },
  { type: 'request', status: 'refused' },
];

async function fetchAll() {
  const entries = [];
  let ok = true;
  for (const { type, status } of ENDPOINTS) {
    try {
      const res = await fetch(`${urlEndpoint}/${type}?status=${status}`, {
        headers: { authorization: `Token ${tokenHyakanime}` },
      });
      if (!res.ok) { ok = false; continue; }
      const arr = await res.json();
      if (!Array.isArray(arr)) { ok = false; continue; }
      for (const e of arr) {
        entries.push({ ...e, _type: type, _status: status });
      }
    } catch (err) {
      console.error(`[Contribution] Erreur fetch ${type}?status=${status}:`, err.message);
      ok = false;
    }
  }
  return { entries, ok };
}

async function checkContributions(client) {
  try {
    const { entries, ok } = await fetchAll();

    let state = await ContributionState.findOne({ key: 'contribution' });
    const { newEntries, currentIds } = computeNewEntries(state ? state.seenIds : [], entries);

    // Premier lancement : on mémorise sans notifier (uniquement si tous les fetch ont réussi)
    if (!state) {
      if (ok) {
        await ContributionState.create({ key: 'contribution', seenIds: currentIds });
      }
      return;
    }

    if (newEntries.length > 0) {
      const links = await UserLink.find({});
      const byUid = new Map(links.map((l) => [l.hyakanimeUid, l]));

      for (const entry of newEntries) {
        const link = byUid.get(entry.uid);
        if (!link) continue; // uid non lié à un compte Discord
        try {
          const user = await client.users.fetch(link.discordId);
          await user.send({ embeds: [buildDmEmbed(entry)] });
        } catch (err) {
          console.error(`[Contribution] Échec DM à ${link.discordId} (uid ${entry.uid}):`, err.message);
        }
      }
    }

    // On n'écrit l'état que si les 5 fetch ont réussi, pour ne pas marquer
    // « vues » des entrées d'un endpoint temporairement en erreur.
    if (ok) {
      state.seenIds = currentIds;
      await state.save();
    }
  } catch (error) {
    console.error('[Contribution] Erreur lors de la vérification:', error);
  }
}
```

Mettre à jour l'export :

```js
module.exports = { computeNewEntries, buildDmEmbed, fetchAll, checkContributions };
```

- [ ] **Step 2: Vérifier que le module se charge et que `fetchAll` renvoie des entrées taguées**

Run:
```bash
node -e "const c=require('./function/contribution.js'); c.fetchAll().then(r=>{console.log('ok=',r.ok,'n=',r.entries.length); const s=r.entries[0]; console.log('sample tags:', s && s._type, s && s._status, 'hasId:', !!(s && s._id));});"
```
Expected: affiche `ok= true n= <nombre>` et un échantillon avec `_type`/`_status` renseignés et `hasId: true`. (Nécessite l'accès réseau à l'API ; `n` peut varier.)

- [ ] **Step 3: Relancer la suite de tests unitaires (non-régression)**

Run: `node --test test/contribution.test.js`
Expected: PASS (11 tests) — l'ajout de `fetchAll`/`checkContributions` ne casse pas les fonctions pures.

- [ ] **Step 4: Commit**

```bash
git add function/contribution.js
git commit -m "feat: fetchAll et orchestration checkContributions"
```

---

### Task 5: Câblage du cron quotidien dans `index.js`

**Files:**
- Modify: `index.js:1-8` (requires) et `index.js:64-74` (bloc `client.on('ready', ...)`)

**Interfaces:**
- Consumes: `checkContributions` de `function/contribution.js`.
- Produces: rien (effet de bord : planification cron `0 8 * * *`).

- [ ] **Step 1: Ajouter le require**

Dans `index.js`, après la ligne `const { checkFeedbacks } = require('./function/feedback.js');` (ligne ~7), ajouter :

```js
const { checkContributions } = require('./function/contribution.js');
```

- [ ] **Step 2: Ajouter la planification cron**

Dans le bloc `client.on('ready', () => { ... })` (le second, celui avec les `cron.schedule`), après le bloc `checkFeedbacks`, ajouter :

```js
  // notification DM des demandes edit/request traitées, une fois par jour à 8h
  cron.schedule('0 8 * * *', () => {
    checkContributions(client);
  });
```

- [ ] **Step 3: Vérifier que le bot démarre sans erreur de chargement**

Run: `node -e "require('./index.js')"` puis interrompre après ~5 s (Ctrl+C).
Expected: pas d'erreur `Cannot find module` ni de `SyntaxError` au chargement de `index.js` / `function/contribution.js`. (Le bot tentera de se connecter à MongoDB/Discord — c'est attendu ; seule l'absence d'erreur de require/syntaxe est vérifiée ici.)

- [ ] **Step 4: Commit**

```bash
git add index.js
git commit -m "feat: cron quotidien des notifications DM de contribution"
```

---

## Self-Review

**Spec coverage :**
- 5 endpoints surveillés → Task 4 (`ENDPOINTS`). ✅
- Détection par ensemble d'`_id` (pas de watermark) → Task 1 (`computeNewEntries`) + Task 3 (modèle). ✅
- Matching `uid` → `UserLink.hyakanimeUid` → DM → Task 4 (`byUid` Map). ✅
- Wording des 5 combinaisons + Raison via `comment` → Task 2 (`buildDmEmbed`). ✅
- Premier lancement sans DM → Task 4 (`if (!state)`). ✅
- uid non lié / DM fermés / endpoint en erreur → Task 4 (`continue`, `try/catch`, `if (ok)`). ✅
- `comment` null/vide omis → Task 2. ✅
- Cron quotidien 8h → Task 5. ✅
- Tests sur fonctions pures → Task 1 & 2. ✅

**Placeholder scan :** aucun TODO/TBD ; tout le code est fourni.

**Type consistency :** `computeNewEntries` renvoie `{ newEntries, currentIds }` (Task 1) et est consommé tel quel en Task 4. `buildDmEmbed(entry)` avec `_type`/`_status`/`title`/`comment` (Task 2) appelé sur les éléments de `newEntries` tagués par `fetchAll` (Task 4) — cohérent. Modèle `ContributionState` avec `seenIds` (Task 3) utilisé en Task 4. `UserLink` : champs `hyakanimeUid` / `discordId` conformes à `models/UserLink.js`.
