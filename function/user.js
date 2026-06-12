const { createCanvas } = require('canvas');
const { urlEndpoint, logoUrl } = require("../config.json");

// Pages disponibles dans le menu déroulant de la commande /user
const PAGES = [
  { id: 'overview', label: "Vue d'ensemble", emoji: '📊', description: 'Visionnage & statuts' },
  { id: 'notes', label: 'Notes', emoji: '⭐', description: 'Tes notes & coups de cœur' },
  { id: 'genres', label: 'Genres', emoji: '🎭', description: 'Tes genres favoris' },
  { id: 'temporal', label: 'Temporalité', emoji: '🗓️', description: 'Saisons & années' },
  { id: 'formats', label: 'Formats & Sources', emoji: '🎬', description: 'Types, sources, origines' },
  { id: 'heatmap', label: 'Heatmap', emoji: '🟩', description: 'Ères : saisons × années' },
];

const SEASON_ORDER = ['Hiver', 'Printemps', 'Été', 'Automne'];

const typeLabels = { TV: 'Série TV', Movie: 'Film', OVA: 'OVA', ONA: 'ONA', Special: 'Spécial', Music: 'Clip' };
const topEntries = (obj, n = 99) => Object.entries(obj || {}).sort((a, b) => b[1] - a[1]).slice(0, n);

// Titre d'affichage d'un média : certains animes ont `title` vide mais une variante EN/romanji/JP.
const mediaTitle = (m) => {
  const t = m?.title || m?.titleEN || m?.romanji || m?.titleJP || (m?.alt || [])[0] || '';
  return String(t).trim() || '—';
};

// Nombre d'utilisateurs ayant ajouté cet anime (popularité globale). null si indisponible.
async function fetchAddedBy(id) {
  if (id == null) return null;
  try {
    const j = JSON.parse(await (await fetch(urlEndpoint + '/anime/stats/' + id)).text());
    return typeof j.UsersAdd === 'number' ? j.UsersAdd : null;
  } catch { return null; }
}

// Récupère et agrège toutes les données d'un utilisateur (un seul appel réseau par source).
// Retourne un objet sérialisable (mis en cache), ou null si l'utilisateur est introuvable.
async function fetchUserData(pseudo) {
  const response = await fetch(urlEndpoint + "/user/" + pseudo);
  const data = await response.text();
  let result = JSON.parse(data);
  if (result?.message) {
    const response2 = await fetch(urlEndpoint + "/search/user/" + pseudo);
    const result2 = JSON.parse(await response2.text());
    if (result2.length == 0) return null;
    result = result2[0];
  }

  const resultatProgression = JSON.parse(await (await fetch(urlEndpoint + "/progression/anime/" + result.uid)).text());
  const episodes = resultatProgression.length;
  let addition = 0, revisionageEpisode = 0, revisionageAnime = 0, tempsVisionnage = 0, tempsRevisionage = 0;
  const genreCount = {}, typeCount = {}, seasonCount = {}, yearCount = {}, sourceCount = {}, originCount = {};
  const eraCount = {}; // eraCount[année][saison] = épisodes vus
  let plusLong = { title: null, ep: 0 };
  let totalEpisodesCatalogue = 0;
  const scoreCount = {}, genreScore = {}; // scoreCount[1..10] = nb ; genreScore[g] = { sum, n }
  let scoreSum = 0, scoredAnime = 0;
  const scoredList = []; // { title, score } des titres réellement notés (score > 0)

  for (let i = 0; i < episodes; i++) {
    const progression = resultatProgression[i].progression.progression;
    const media = resultatProgression[i].media;
    const epAverage = media?.EpAverage || 24;
    addition += progression;
    tempsVisionnage += progression * epAverage;
    if (resultatProgression[i].progression.rewatch != undefined) {
      revisionageEpisode += resultatProgression[i].progression.rewatch * progression;
      revisionageAnime += resultatProgression[i].progression.rewatch;
      tempsRevisionage += resultatProgression[i].progression.rewatch * progression * epAverage;
    }
    if (media) {
      (media.genre || []).forEach(g => { if (g) genreCount[g] = (genreCount[g] || 0) + 1; });
      if (media.type) typeCount[media.type] = (typeCount[media.type] || 0) + 1;
      if (media.season) {
        const parts = String(media.season).trim().split(' ');
        const s = parts[0];
        const y = parts[1];
        seasonCount[s] = (seasonCount[s] || 0) + 1;
        if (SEASON_ORDER.includes(s) && /^\d{4}$/.test(y || '')) {
          if (!eraCount[y]) eraCount[y] = {};
          eraCount[y][s] = (eraCount[y][s] || 0) + progression; // épisodes vus de ce titre
        }
      }
      if (media.start?.year) yearCount[media.start.year] = (yearCount[media.start.year] || 0) + 1;
      if (media.source) sourceCount[media.source] = (sourceCount[media.source] || 0) + 1;
      if (media.origin) originCount[media.origin] = (originCount[media.origin] || 0) + 1;
      if ((media.NbEpisodes || 0) > plusLong.ep) plusLong = { title: media.title, ep: media.NbEpisodes };
      totalEpisodesCatalogue += media.NbEpisodes || 0;
    }

    // Note perso : présente uniquement sur les titres notés. score 0 = vu mais non noté.
    // Les notes peuvent être décimales (ex. 8.6) : on bucketise sur l'entier le plus proche
    // pour l'histogramme, mais on garde la valeur brute pour la moyenne et l'affichage.
    const note = resultatProgression[i].progression.score;
    if (typeof note === 'number' && note > 0 && note <= 10) {
      const bucket = Math.min(10, Math.max(1, Math.round(note)));
      scoreCount[bucket] = (scoreCount[bucket] || 0) + 1;
      scoreSum += note; scoredAnime++;
      scoredList.push({ title: mediaTitle(media), score: note, id: media?.id });
      (media?.genre || []).forEach(g => {
        if (!g) return;
        if (!genreScore[g]) genreScore[g] = { sum: 0, n: 0 };
        genreScore[g].sum += note; genreScore[g].n++;
      });
    }
  }

  const stats = await (await fetch(urlEndpoint + '/progression/anime/stats/status/' + result.uid)).json();
  const total = stats.total || 0;

  // Genres triés par note moyenne (au moins 2 titres notés pour être significatif)
  const genreNotes = Object.entries(genreScore)
    .filter(([, v]) => v.n >= 2)
    .map(([g, v]) => [g, +(v.sum / v.n).toFixed(2)])
    .sort((a, b) => b[1] - a[1]);

  // Coup de cœur / déception : on départage les ex æquo par popularité globale.
  // Meilleur = la meilleure note la MOINS ajoutée (pépite) ; pire = la pire note la PLUS ajoutée (blockbuster déçu).
  let topNotes = [], flopNotes = [];
  if (scoredList.length) {
    const maxS = Math.max(...scoredList.map(s => s.score));
    const minS = Math.min(...scoredList.map(s => s.score));
    const uniqById = arr => { const m = new Map(); arr.forEach(s => { if (!m.has(s.id)) m.set(s.id, s); }); return [...m.values()]; };
    const bestC = uniqById(scoredList.filter(s => s.score === maxS)).slice(0, 30);
    const worstC = uniqById(scoredList.filter(s => s.score === minS)).slice(0, 30);
    const ids = [...new Set([...bestC, ...worstC].map(s => s.id).filter(id => id != null))];
    const addedBy = {};
    await Promise.all(ids.map(async id => { addedBy[id] = await fetchAddedBy(id); }));
    // Popularité inconnue → écartée du départage (reléguée en fin de tri dans les deux sens).
    topNotes = bestC.slice().sort((a, b) => (addedBy[a.id] ?? Infinity) - (addedBy[b.id] ?? Infinity)).slice(0, 3);   // moins ajouté d'abord
    flopNotes = worstC.slice().sort((a, b) => (addedBy[b.id] ?? -1) - (addedBy[a.id] ?? -1)).slice(0, 3); // plus ajouté d'abord
  }

  return {
    username: result.username,
    isPremium: !!result.isPremium,
    photoURL: result.photoURL,
    createdAt: result.createdAt,
    uid: result.uid,
    stats,
    episodes, addition, revisionageAnime, revisionageEpisode, tempsVisionnage, tempsRevisionage,
    genreCount, typeCount, seasonCount, yearCount, sourceCount, originCount,
    eraCount, plusLong, totalEpisodesCatalogue,
    scoreCount, scoredAnime,
    noteMoyenne: scoredAnime ? (scoreSum / scoredAnime).toFixed(2) : "0",
    tauxNotation: episodes ? Math.round((scoredAnime / episodes) * 100) : 0,
    genreNotes,
    topNotes,
    flopNotes,
    tauxCompletion: total ? Math.round(((stats["3"] || 0) / total) * 100) : 0,
    moyenneEpisodes: episodes ? (addition / episodes).toFixed(1) : "0",
    genresExplores: Object.keys(genreCount).length,
  };
}

// Construit l'embed + l'image canvas pour une page donnée.
async function buildUserPage(pageId, userData, { EmbedBuilder, AttachmentBuilder }) {
  const page = PAGES.find(p => p.id === pageId) || PAGES[0];
  const date = new Date(userData.createdAt * 1);

  let buffer;
  if (page.id === 'notes') buffer = createNotesCanvas(userData);
  else if (page.id === 'genres') buffer = createGenresCanvas(userData);
  else if (page.id === 'temporal') buffer = createTemporalCanvas(userData);
  else if (page.id === 'formats') buffer = createFormatsCanvas(userData);
  else if (page.id === 'heatmap') buffer = createHeatmapCanvas(userData);
  else buffer = createOverviewCanvas(userData);

  const fileName = `stats-${page.id}.png`;
  const attachment = new AttachmentBuilder(buffer, { name: fileName });

  const embed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle(`${userData.username} ${userData.isPremium ? "★" : ""}`.trim())
    .setURL("https://hyakanime.fr/user/" + userData.username)
    .setAuthor({ name: "Hyakanime", iconURL: logoUrl, url: "https://hyakanime.fr" })
    .setDescription(`${page.emoji} **${page.label}** — ${page.description}`)
    .setThumbnail(userData.photoURL)
    .setImage(`attachment://${fileName}`)
    .setTimestamp()
    .setFooter({ text: `Compte créé le ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` });

  return { embed, attachment };
}

const colors = {
  aVoir: '#9f9f9f', enPause: '#A16EFF', enCours: '#0099FF',
  termine: '#00CC33', abandonne: '#FF3333', text: '#FFFFFF',
};

// ---------- Page 1 : Vue d'ensemble (identique à l'historique) ----------
function createOverviewCanvas(userData) {
  const canvas = createCanvas(490, 230);
  const ctx = canvas.getContext('2d');
  const statsHyak = userData.stats;
  const stats = {
    aVoir: statsHyak["2"] || 0, enPause: statsHyak["4"] || 0, enCours: statsHyak["1"] || 0,
    termine: statsHyak["3"] || 0, abandonne: statsHyak["5"] || 0, total: statsHyak["total"] || 0,
  };

  ctx.font = 'bold 16px Arial';
  const userLabels = [
    { label: 'Titres ajoutés', value: userData.episodes },
    { label: 'Titres rewatch', value: userData.revisionageAnime },
    { label: 'Épisodes vus', value: userData.addition },
    { label: 'Épisodes rewatch', value: userData.revisionageEpisode },
    { label: 'Temps visionnage', value: formatWatchTime(userData.tempsVisionnage) },
    { label: 'Temps rewatch', value: formatWatchTime(userData.tempsRevisionage) },
  ];
  ctx.fillStyle = '#FFFFFF';
  userLabels.forEach((data, i) => {
    const x = i < 3 ? 25 : 260;
    const y = 40 + (i % 3) * 20;
    ctx.fillText(`${data.label}: ${data.value}`, x, y);
  });

  const statsLabels = [
    { label: 'Total', value: stats.total, color: colors.text },
    { label: 'À voir', value: stats.aVoir, color: colors.aVoir },
    { label: 'En Pause', value: stats.enPause, color: colors.enPause },
    { label: 'En cours', value: stats.enCours, color: colors.enCours },
    { label: 'Terminé', value: stats.termine, color: colors.termine },
    { label: 'Abandonné', value: stats.abandonne, color: colors.abandonne },
  ];
  statsLabels.forEach(({ label, value, color }, index) => {
    const x = index < 3 ? 25 : 260;
    const y = 130 + (index % 3) * 20;
    ctx.fillStyle = color;
    ctx.fillText(`${label}: ${value}`, x, y);
  });

  drawProgressBar(ctx, 20, 210, 430, 15, stats, colors);
  return canvas.toBuffer();
}

// ---------- Page 2 : Genres ----------
function createGenresCanvas(userData) {
  const canvas = createCanvas(490, 230);
  const ctx = canvas.getContext('2d');
  drawTitle(ctx, 'Genres favoris', 25, 30);

  const entries = topEntries(userData.genreCount, 8);
  if (!entries.length) return drawEmpty(ctx, canvas);
  drawBars(ctx, { x: 25, y: 50, width: 440, entries, barColor: colors.enCours, suffix: '' });
  return canvas.toBuffer();
}

// ---------- Page Notes ----------
function createNotesCanvas(userData) {
  const canvas = createCanvas(490, 250);
  const ctx = canvas.getContext('2d');
  drawTitle(ctx, 'Notes', 25, 28);

  if (!userData.scoredAnime) {
    ctx.fillStyle = '#888888';
    ctx.font = '13px Arial';
    ctx.fillText("Aucun anime noté sur ce profil.", 25, 60);
    return canvas.toBuffer();
  }

  // Résumé
  ctx.font = '13px Arial';
  ctx.fillStyle = '#DDDDDD';
  ctx.fillText(`Moyenne ${userData.noteMoyenne}/10   ·   ${userData.scoredAnime} animes notés   ·   ${userData.tauxNotation}% de ta liste`, 25, 50);

  // Distribution (histogramme vertical 1→10), à gauche
  drawTitle(ctx, 'Distribution', 25, 80);
  const counts = [];
  for (let n = 1; n <= 10; n++) counts.push(userData.scoreCount?.[n] || 0);
  drawHistogram(ctx, { x: 25, y: 96, width: 210, height: 96, counts });

  // Genres : préférés (barres vertes) + le pire (ligne rouge), par note moyenne
  drawTitle(ctx, 'Genres préférés', 260, 80);
  const gn = userData.genreNotes || [];
  const best = gn.slice(0, 4);
  if (best.length) {
    drawBars(ctx, { x: 260, y: 96, width: 205, entries: best, barColor: colors.termine, labelW: 95, rowH: 21 });
    // Pire genre : uniquement s'il y a plus de genres que ceux déjà affichés (évite la redite)
    if (gn.length > 4) {
      const worst = gn[gn.length - 1];
      const wy = 96 + best.length * 21 + 12;
      triangle(ctx, 265, wy - 4, 4, false, colors.abandonne);
      ctx.font = '12px Arial';
      ctx.fillStyle = '#FF6666';
      ctx.fillText(`Pire : ${trunc(worst[0], 16)} (${worst[1]})`, 277, wy);
    }
  } else { ctx.fillStyle = '#888888'; ctx.font = '12px Arial'; ctx.fillText('Pas assez de notes', 260, 112); }

  // Coup de cœur / déception (triangles dessinés : la police canvas n'a pas ★/▼)
  const top = userData.topNotes?.[0];
  const flop = userData.flopNotes?.[0];
  ctx.font = '12px Arial';
  if (top) {
    triangle(ctx, 30, 230, 5, true, '#00CC33');
    ctx.fillStyle = '#00CC33';
    ctx.fillText(`${trunc(top.title, 24)} (${top.score})`, 42, 234);
  }
  if (flop && flop.score < (top?.score ?? 10)) {
    triangle(ctx, 265, 230, 5, false, '#FF6666');
    ctx.fillStyle = '#FF6666';
    ctx.fillText(`${trunc(flop.title, 24)} (${flop.score})`, 277, 234);
  }

  return canvas.toBuffer();
}

// ---------- Page 3 : Temporalité ----------
function createTemporalCanvas(userData) {
  const canvas = createCanvas(490, 230);
  const ctx = canvas.getContext('2d');

  // Saisons (ordre fixe)
  drawTitle(ctx, 'Saisons', 25, 30);
  const seasonOrder = ['Hiver', 'Printemps', 'Été', 'Automne'];
  const seasonEntries = seasonOrder
    .map(s => [s, userData.seasonCount?.[s] || 0])
    .filter(([, c]) => c > 0);
  if (seasonEntries.length) drawBars(ctx, { x: 25, y: 48, width: 200, entries: seasonEntries, barColor: colors.enPause, labelW: 70, rowH: 22 });
  else drawNone(ctx, 25, 60);

  // Années (top 6 par nombre de titres)
  drawTitle(ctx, 'Années les plus suivies', 260, 30);
  const yearEntries = topEntries(userData.yearCount, 6);
  if (yearEntries.length) drawBars(ctx, { x: 260, y: 48, width: 205, entries: yearEntries, barColor: colors.termine, labelW: 50, rowH: 22 });
  else drawNone(ctx, 260, 60);

  return canvas.toBuffer();
}

// ---------- Page 4 : Formats & Sources ----------
function createFormatsCanvas(userData) {
  const canvas = createCanvas(490, 230);
  const ctx = canvas.getContext('2d');

  drawTitle(ctx, 'Formats', 25, 30);
  const typeEntries = topEntries(userData.typeCount, 5).map(([t, c]) => [typeLabels[t] || t, c]);
  if (typeEntries.length) drawBars(ctx, { x: 25, y: 48, width: 200, entries: typeEntries, barColor: colors.enCours, labelW: 75, rowH: 22 });
  else drawNone(ctx, 25, 60);

  drawTitle(ctx, 'Sources', 260, 30);
  const sourceEntries = topEntries(userData.sourceCount, 5);
  if (sourceEntries.length) drawBars(ctx, { x: 260, y: 48, width: 205, entries: sourceEntries, barColor: colors.abandonne, labelW: 80, rowH: 22 });
  else drawNone(ctx, 260, 60);

  // Origines (ligne texte en bas)
  drawTitle(ctx, 'Origines', 25, 195);
  const originEntries = topEntries(userData.originCount, 4);
  ctx.font = '13px Arial';
  ctx.fillStyle = '#DDDDDD';
  ctx.fillText(originEntries.length ? originEntries.map(([o, c]) => `${o} (${c})`).join('   ') : 'Aucune donnée', 25, 215);

  return canvas.toBuffer();
}

// ---------- Page 5 : Heatmap (saisons × années, style GitHub) ----------
const HEATMAP_COLORS = ['#40444b', '#0e4429', '#006d32', '#26a641', '#39d353'];

function createHeatmapCanvas(userData) {
  const canvas = createCanvas(490, 250);
  const ctx = canvas.getContext('2d');
  drawTitle(ctx, 'Heatmap par saison & année', 25, 28);

  const era = userData.eraCount || {};
  const years = Object.keys(era)
    .filter(y => /^\d{4}$/.test(y) && SEASON_ORDER.some(s => (era[y][s] || 0) > 0))
    .map(Number).sort((a, b) => a - b);
  if (!years.length) return drawEmpty(ctx, canvas);

  // Colonnes : 10 dernières années en détail (1 an/colonne), plus anciennes regroupées.
  // Plafond de 15 colonnes au total.
  const MAX_COLS = 15;
  const two = y => String(y).slice(2);
  const nowYear = new Date().getFullYear();
  const recentStart = nowYear - 9;
  const recentEnd = Math.min(Math.max(nowYear, years[years.length - 1]), nowYear + 2);

  // Moyenne titres/an (comparable entre colonnes simples et groupées)
  const mkData = ys => {
    const data = {};
    SEASON_ORDER.forEach(s => { data[s] = ys.reduce((a, y) => a + (era[y]?.[s] || 0), 0) / ys.length; });
    return data;
  };

  // Bloc récent : années continues recentStart..recentEnd, 1 colonne par année
  const recentCols = [];
  for (let y = recentStart; y <= recentEnd; y++) recentCols.push({ data: mkData([y]), label: "'" + two(y), grouped: false });

  // Bloc ancien : années présentes avant recentStart, regroupées dans le budget restant
  const oldPresent = years.filter(y => y < recentStart);
  const oldBudget = Math.max(1, MAX_COLS - recentCols.length);
  const oldCols = [];
  if (oldPresent.length) {
    const gs = Math.ceil(oldPresent.length / oldBudget);
    for (let i = 0; i < oldPresent.length; i += gs) {
      const grp = oldPresent.slice(i, i + gs);
      oldCols.push({ data: mkData(grp), label: "'" + two(grp[0]), grouped: grp.length > 1 });
    }
  }

  const cols = [...oldCols, ...recentCols];

  // Échelle par quartiles (style GitHub) : répartit les couleurs selon la distribution
  // réelle, pour ne pas écraser tout le reste à cause d'une série très longue (One Piece…).
  const allVals = [];
  cols.forEach(col => SEASON_ORDER.forEach(s => { if (col.data[s] > 0) allVals.push(col.data[s]); }));
  allVals.sort((a, b) => a - b);
  const q = p => allVals.length ? allVals[Math.min(allVals.length - 1, Math.floor(p * allVals.length))] : 0;
  const t1 = q(0.25), t2 = q(0.5), t3 = q(0.75);
  const levelOf = v => v <= 0 ? 0 : (v <= t1 ? 1 : (v <= t2 ? 2 : (v <= t3 ? 3 : 4)));

  const leftMargin = 80;
  const topMargin = 70;        // espace généreux sous le titre
  const gap = 4;
  const availW = 490 - leftMargin - 12;
  const rowH = 34;
  const sepGap = oldCols.length ? 8 : 0;       // espace supplémentaire autour du séparateur
  const colW = Math.min(34, Math.floor((availW - sepGap) / cols.length));
  const cell = Math.max(12, Math.min(colW, rowH) - gap);
  const xAt = c => leftMargin + c * colW + (c >= oldCols.length ? sepGap : 0);

  // Libellés de saisons (lignes), alignés à droite contre la grille
  ctx.font = '13px Arial';
  ctx.textAlign = 'right';
  SEASON_ORDER.forEach((s, r) => {
    ctx.fillStyle = '#DDDDDD';
    ctx.fillText(s, leftMargin - 8, topMargin + r * rowH + cell / 2 + 4);
  });
  ctx.textAlign = 'left';

  // Libellés de colonnes (année de début, centrés)
  const labelStep = colW >= 22 ? 1 : 2;
  ctx.font = '11px Arial';
  ctx.textAlign = 'center';
  cols.forEach((col, c) => {
    if (c % labelStep !== 0) return;
    ctx.fillStyle = col.grouped ? '#888888' : '#AAAAAA';
    ctx.fillText(col.label, xAt(c) + cell / 2, topMargin - 12);
  });
  ctx.textAlign = 'left';

  // Cases
  cols.forEach((col, c) => {
    SEASON_ORDER.forEach((s, r) => {
      const level = levelOf(col.data[s]);
      roundedBar(ctx, xAt(c), topMargin + r * rowH, cell, cell, 3, HEATMAP_COLORS[level]);
    });
  });

  // Séparateur entre anciens (groupés) et récents (détaillés) + note
  if (oldCols.length) {
    const oldEnd = leftMargin + (oldCols.length - 1) * colW + cell;
    const recStart = leftMargin + oldCols.length * colW + sepGap;
    const sepX = (oldEnd + recStart) / 2;
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(sepX, topMargin - 8);
    ctx.lineTo(sepX, topMargin + 4 * rowH - gap + 2);
    ctx.stroke();

    ctx.fillStyle = '#888888';
    ctx.font = 'italic 11px Arial';
    ctx.textAlign = 'right';
    ctx.fillText('10 dern. années détaillées →', 478, 28);
    ctx.textAlign = 'left';
  }

  // Légende "Moins ▢▢▢▢▢ Plus"
  const legY = 226;
  ctx.fillStyle = '#AAAAAA';
  ctx.font = '12px Arial';
  ctx.fillText('Moins', 300, legY + 10);
  HEATMAP_COLORS.forEach((color, i) => roundedBar(ctx, 345 + i * 16, legY, 12, 12, 3, color));
  ctx.fillStyle = '#AAAAAA';
  ctx.fillText('Plus', 345 + HEATMAP_COLORS.length * 16 + 4, legY + 10);

  return canvas.toBuffer();
}

// ---------- Helpers de dessin ----------
function drawTitle(ctx, text, x, y) {
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(text, x, y);
}

function drawNone(ctx, x, y) {
  ctx.fillStyle = '#888888';
  ctx.font = '13px Arial';
  ctx.fillText('Aucune donnée', x, y);
}

function drawEmpty(ctx, canvas) {
  ctx.fillStyle = '#888888';
  ctx.font = '14px Arial';
  ctx.fillText('Aucune donnée disponible pour ce profil.', 25, 120);
  return canvas.toBuffer();
}

// Mini graphique à barres horizontales : entries = [[label, value], ...]
function drawBars(ctx, { x, y, width, entries, barColor, labelW = 110, rowH = 22, maxBars = 8 }) {
  const items = entries.slice(0, maxBars);
  const max = Math.max(1, ...items.map(e => e[1]));
  const barX = x + labelW;
  const valueW = 28;
  const barMaxW = Math.max(10, width - labelW - valueW);
  ctx.font = '13px Arial';
  ctx.textAlign = 'left';

  let cy = y;
  items.forEach(([label, value]) => {
    const lbl = String(label).length > 15 ? String(label).slice(0, 14) + '…' : String(label);
    ctx.fillStyle = '#DDDDDD';
    ctx.fillText(lbl, x, cy + 11);

    const w = Math.max(2, (value / max) * barMaxW);
    roundedBar(ctx, barX, cy, w, 14, 4, barColor);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(String(value), barX + w + 5, cy + 11);
    cy += rowH;
  });
}

// Histogramme à barres verticales. counts = tableau (ex. notes 1→10).
function drawHistogram(ctx, { x, y, width, height, counts }) {
  const max = Math.max(1, ...counts);
  const n = counts.length;
  const gap = 5;
  const bw = (width - gap * (n - 1)) / n;
  ctx.textAlign = 'center';
  counts.forEach((c, i) => {
    const bx = x + i * (bw + gap);
    const bh = Math.max(2, (c / max) * height);
    const by = y + height - bh;
    roundedBar(ctx, bx, by, bw, bh, 3, noteColor(i + 1));
    if (c > 0) { ctx.fillStyle = '#FFFFFF'; ctx.font = '10px Arial'; ctx.fillText(String(c), bx + bw / 2, by - 3); }
    ctx.fillStyle = '#AAAAAA'; ctx.font = '11px Arial';
    ctx.fillText(String(i + 1), bx + bw / 2, y + height + 13);
  });
  ctx.textAlign = 'left';
}

// Couleur d'une note sur l'échelle rouge → vert.
function noteColor(n) {
  if (n <= 3) return '#FF3333';
  if (n <= 5) return '#FF8C1A';
  if (n <= 7) return '#0099FF';
  return '#00CC33';
}

function trunc(s, n) {
  s = String(s);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

// Petit triangle plein (up = coup de cœur, down = déception).
function triangle(ctx, cx, cy, size, up, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (up) { ctx.moveTo(cx, cy - size); ctx.lineTo(cx + size, cy + size); ctx.lineTo(cx - size, cy + size); }
  else { ctx.moveTo(cx, cy + size); ctx.lineTo(cx + size, cy - size); ctx.lineTo(cx - size, cy - size); }
  ctx.closePath();
  ctx.fill();
}

function roundedBar(ctx, x, y, w, h, r, color) {
  r = Math.min(r, h / 2, w / 2);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

function formatWatchTime(minutes) {
  const totalMinutes = Math.round(minutes || 0);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const remainingMinutes = totalMinutes % 60;
  if (days > 0) return hours > 0 ? `${days}j ${hours}h` : `${days}j`;
  if (hours > 0) return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  return `${remainingMinutes}min`;
}

function drawProgressBar(ctx, x, y, width, height, stats, colors) {
  let currentX = x;
  const borderRadius = 7;
  const sections = [
    { value: stats.enCours, color: colors.enCours },
    { value: stats.aVoir, color: colors.aVoir },
    { value: stats.termine, color: colors.termine },
    { value: stats.enPause, color: colors.enPause },
    { value: stats.abandonne, color: colors.abandonne }
  ].filter(section => section.value > 0);

  sections.forEach((section, index) => {
    let sectionWidth = (section.value / stats.total) * width;
    drawRoundedRect(ctx, currentX, y, sectionWidth, height, borderRadius, section.color,
      index === 0, index === sections.length - 1);
    currentX += sectionWidth;
  });
}

function drawRoundedRect(ctx, x, y, width, height, radius, color, leftRound, rightRound) {
  ctx.fillStyle = color;
  ctx.beginPath();
  if (leftRound) {
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x, y, x, y + radius, radius);
    ctx.lineTo(x, y + height - radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
  } else {
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + height);
  }
  if (rightRound) {
    ctx.lineTo(x + width - radius, y + height);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.lineTo(x + width, y + radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
  } else {
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x + width, y);
  }
  ctx.closePath();
  ctx.fill();
}

module.exports = { fetchUserData, buildUserPage, PAGES };
