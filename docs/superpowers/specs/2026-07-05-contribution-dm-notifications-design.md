# Notifications DM des demandes edit/request — Design

Date : 2026-07-05

## Objectif

Prévenir en DM Discord les utilisateurs ayant lié leur compte (`/link`) lorsqu'une de
leurs demandes Hyakanime change de statut vers un statut terminal : **acceptée**,
**refusée** ou **partiellement acceptée**.

On surveille chaque jour 5 endpoints de l'API Hyakanime, on détecte les nouvelles
entrées par rapport au run précédent, et pour chaque nouveauté dont l'`uid` correspond à
un compte lié, on envoie un DM.

## Endpoints surveillés

Tous appelés avec l'en-tête `authorization: Token ${tokenHyakanime}`.

| type | status (param URL) | endpoint |
|---------|--------------------|----------|
| edit | partially | `/edit?status=partially` |
| edit | refused | `/edit?status=refused` |
| edit | accepted | `/edit?status=accepted` |
| request | accepted | `/request?status=accepted` |
| request | refused | `/request?status=refused` |

> Note : le paramètre `status` est **sensible à la casse** et doit être en minuscule
> (`accepted`, pas `Accepted` — ce dernier renvoie un tableau vide).

Chaque endpoint renvoie un tableau JSON. Champs utiles par entrée :

- `_id` : identifiant Mongo unique et stable (clé de déduplication).
- `uid` : uid Hyakanime du **demandeur** → correspond à `UserLink.hyakanimeUid`.
- `title` : titre du média concerné.
- `comment` : commentaire du staff / modérateur (la « raison »). Peut être `""` ou `null`.
- `status` : statut stocké (minuscule : `refused`, `partially` ; `pending` n'est jamais interrogé).
- `createdAt` : date de **soumission** (pas de modération) — voir note ci-dessous.

Le paramètre `status=Accepted` (majuscule) est valide même s'il renvoie `[]` aujourd'hui.

## Point technique : détection des nouveautés

On **ne peut pas** utiliser un watermark sur `createdAt`. Une demande créée il y a
longtemps (statut `pending`) peut être modérée vers `refused`/`accepted` aujourd'hui sans
que `createdAt` change. Un filtre par date raterait ces entrées.

On suit donc un **ensemble d'`_id` déjà vus**. Comme on n'interroge que des statuts
terminaux (jamais `pending`), la **première apparition** d'un `_id` dans une de ces listes
signifie que la décision vient d'être prise → on notifie.

`seenIds` est réécrit à chaque run avec l'union des `_id` présents dans les 5 réponses.
L'état reste ainsi borné au contenu courant de l'API (pas de croissance illimitée) et gère
naturellement le premier lancement.

## Composants

### `models/ContributionState.js`

Document unique :

```
{ key: 'contribution' (unique), seenIds: [String] }
```

### `function/contribution.js`

Découpé pour la testabilité :

- `fetchAll(config)` — lance les 5 requêtes ; retourne un tableau plat d'entrées, chacune
  taguée `{ ...entry, _type: 'edit'|'request', _status: '<param>' }`. Signale si l'une des
  requêtes a échoué (voir gestion d'erreur).
- `computeNewEntries(previousSeenIds, entries)` — **fonction pure**. Retourne
  `{ newEntries, currentIds }` où `newEntries` = entrées dont `_id ∉ previousSeenIds`
  (dédupliquées par `_id`), et `currentIds` = tous les `_id` du run.
- `buildDmEmbed(entry)` — **fonction pure**. Construit l'`EmbedBuilder` (couleur + wording
  selon `_type` & `_status`, champ « Raison » si `comment` non vide).
- `checkContributions(client)` — orchestration :
  1. `fetchAll`
  2. charger tous les `UserLink` une fois → `Map<hyakanimeUid, UserLink>`
  3. `computeNewEntries` avec l'état stocké
  4. premier run (état absent) : sauver `currentIds`, **0 DM**, terminer
  5. pour chaque nouveauté : si `uid` dans la Map → `client.users.fetch(discordId)` puis DM ;
     sinon skip
  6. sauver `seenIds = currentIds` **seulement si les 5 fetch ont réussi**

### `index.js`

Ajout d'un cron quotidien à 8h :

```js
cron.schedule('0 8 * * *', () => checkContributions(client));
```

## Wording du DM

Embed, un par nouveauté :

| _type | _status | titre de l'embed |
|---------|-----------|------------------|
| request | Accepted | ✅ Ta demande d'ajout de **{title}** a été acceptée ! |
| request | refused | ❌ Ta demande d'ajout de **{title}** a été refusée. |
| edit | Accepted | ✅ Ta proposition de modification pour **{title}** a été acceptée ! |
| edit | partially | ⚠️ Ta proposition de modification pour **{title}** a été partiellement acceptée. |
| edit | refused | ❌ Ta proposition de modification pour **{title}** a été refusée. |

- Couleur : vert `0x00FF00` (Accepted) / orange `0xFF9900` (partially) / rouge `0xFF0000` (refused).
- Champ **Raison** = `comment`, ajouté uniquement si `comment` est une chaîne non vide
  (donc omis si `null` ou `""`). Tronqué à 1024 caractères (limite Discord pour un field).
- Footer : « Source : Hyakanime » + logo.

## Cas limites

- **Premier lancement** (état absent) : on enregistre les `_id`, aucun DM.
- **uid sans compte lié** : skip silencieux.
- **DM fermés / utilisateur Discord introuvable** : `try/catch`, log, on continue.
- **Un endpoint en erreur** : log ; on **n'écrit pas** `seenIds` ce run-là (sinon des entrées
  d'un endpoint temporairement KO seraient marquées « vues » sans notification, ou re-notifiées).
- **`comment` `null` ou `""`** : champ Raison omis.
- **Une entrée disparaît puis réapparaît** dans l'API : re-notification possible (rare, accepté).

## Tests

Tests unitaires (style `test/saucy/`, Node test runner) sur les fonctions pures :

- `computeNewEntries` :
  - premier run (previousSeenIds vide) → tout est « nouveau », currentIds complet.
  - run stable (aucune nouveauté) → `newEntries` vide.
  - transition de statut (un `_id` pending non suivi apparaît en refused) → notifié.
  - déduplication par `_id`.
- `buildDmEmbed` :
  - les 5 combinaisons type/status (titre + couleur corrects).
  - `comment` renseigné → field Raison présent ; `comment` `null`/`""` → field absent.

## Hors périmètre (YAGNI)

- Pas d'opt-in/opt-out par utilisateur : le `/link` fait office de consentement.
- Pas de notification pour le statut `pending`.
- Pas de lien cliquable dans le DM (les entrées n'ont pas toujours d'URL exploitable).
- Pas de `partially` pour `/request` (non listé par le besoin).
