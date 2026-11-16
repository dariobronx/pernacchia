// Proves the adventure can be finished from start to end, and that the story data is consistent.
const test = require('node:test');
const assert = require('node:assert');
const Core = require('../js/core.js');
const story = require('../js/story.js');
const storyMaya = require('../js/story-maya.js');
const storyNatale = require('../js/story-natale.js');

// A fake "screen": records what is said and answers dialogues from a list of wanted topics.
function makeIo(wanted) {
  const io = {
    lines: [], ended: false,
    say: async (who, text) => { io.lines.push(who + ': ' + text); },
    walkTo: async () => {}, wait: async () => {}, enterRoom: async () => {}, sfx: () => {},
    choose: async (list) => {
      const pick = list.find((o) => wanted.has(o.id));
      if (pick) { wanted.delete(pick.id); return pick.id; }
      return list.find((o) => o.end).id;
    },
    ending: async () => { io.ended = true; },
  };
  return io;
}

// Each step: [kind, verb, target, extra]. kind h = hotspot, i = inventory item.
const WALKTHROUGH = [
  ['h', 'take', 'lanterna'], ['h', 'open', 'barile'], ['h', 'talk', 'baccala'],
  ['h', 'walk', 'exit_spiaggia'],
  ['h', 'take', 'sasso'], ['h', 'take', 'bottiglia'], ['i', 'open', 'bottiglia'],
  ['h', 'walk', 'exit_molo'],
  ['h', 'give', 'baccala', 'verme'],
  ['h', 'walk', 'exit_piazza'],
  ['h', 'talk', 'sindaca'],
  ['h', 'walk', 'porta_taverna'], ['h', 'use', 'camino', 'pesce'], ['h', 'walk', 'exit'],
  ['h', 'walk', 'exit_molo'],
  ['h', 'give', 'gabbiano', 'pesce'], // raw fish is refused
  ['h', 'give', 'gabbiano', 'pesce_fritto'],
  ['h', 'walk', 'exit_piazza'], ['h', 'walk', 'sentiero'],
  ['h', 'take', 'pala'], // refused: no permission yet
  ['h', 'talk', 'sbadiglio'], ['h', 'take', 'pala'], ['h', 'use', 'porta_faro', 'chiave'],
  ['h', 'walk', 'exit'], ['h', 'walk', 'exit_molo'], ['h', 'walk', 'exit_spiaggia'],
  ['h', 'use', 'x_segno', 'pala'], ['h', 'use', 'palma', 'pala'],
  ['h', 'walk', 'porta_grotta'], // refused: door closed
  ['h', 'walk', 'exit_molo'], ['h', 'walk', 'exit_piazza'], ['h', 'walk', 'porta_bottega'],
  ['h', 'take', 'olio'], ['h', 'take', 'fiammiferi'], ['h', 'give', 'pappagallo', 'galletta'],
  ['i', 'use', 'olio', 'lanterna'], ['i', 'use', 'lanterna_piena', 'fiammiferi'],
  ['h', 'walk', 'exit'], ['h', 'walk', 'porta_taverna'], ['h', 'give', 'cuoca', 'cocco'], ['h', 'walk', 'exit'],
  ['h', 'walk', 'exit_molo'], ['h', 'walk', 'exit_spiaggia'],
  ['h', 'use', 'simbolo_luna'], ['h', 'use', 'simbolo_luna'], ['h', 'use', 'simbolo_luna'], // wrong order
  ['h', 'use', 'simbolo_pesce'], ['h', 'use', 'simbolo_luna'], ['h', 'use', 'simbolo_teschio'],
  ['h', 'walk', 'porta_grotta'],
  ['h', 'take', 'cristallo'], // not visible yet: nothing happens
  ['h', 'use', 'scheletro', 'dentiera'], ['h', 'take', 'cristallo'], ['h', 'walk', 'exit'],
  ['h', 'walk', 'exit_molo'], ['h', 'walk', 'exit_piazza'], ['h', 'walk', 'sentiero'], ['h', 'walk', 'porta_faro'],
  ['h', 'walk', 'scale'], // refused: trapdoor closed
  ['h', 'use', 'meccanismo', 'manovella'], ['h', 'walk', 'scale'],
  ['h', 'use', 'lampada', 'fiammiferi'], // refused: nothing mounted
  ['h', 'use', 'lampada', 'cristallo'], ['h', 'use', 'lampada', 'olio'],
  ['h', 'use', 'lampada', 'fiammiferi'], // the Admiral shows up
  ['h', 'use', 'lampada', 'fiammiferi'], // refused: he is in the way
  ['h', 'give', 'ammiraglio', 'fagioli'],
  ['h', 'use', 'lampada', 'fiammiferi'], // lamp lit: chapter 2 starts
  ['h', 'use', 'lampada', 'fiammiferi'], // refused: already lit
  ['h', 'walk', 'botola'], ['h', 'walk', 'exit'],
  ['h', 'talk', 'sbadiglio'], // gives the sleeping tea
  ['h', 'walk', 'sentiero_cala'],
  ['h', 'talk', 'tricheco'], ['h', 'walk', 'passerella'], // refused: no wig
  ['h', 'walk', 'exit'], ['h', 'walk', 'exit'], ['h', 'walk', 'exit_molo'],
  ['h', 'talk', 'baccala'], // he fished the wig
  ['i', 'use', 'parrucca_bagnata'], // refused: wet
  ['h', 'walk', 'exit_piazza'], ['h', 'walk', 'porta_taverna'], ['h', 'use', 'camino', 'parrucca_bagnata'], ['h', 'walk', 'exit'],
  ['i', 'use', 'parrucca'],
  ['h', 'walk', 'sentiero'], ['h', 'walk', 'sentiero_cala'],
  ['h', 'talk', 'tricheco'], ['h', 'walk', 'passerella'],
  ['h', 'take', 'secchio'], ['h', 'take', 'pentola'],
  ['h', 'walk', 'porta_cabina'], // refused: he is awake
  ['h', 'use', 'porta_cabina', 'zuppa'], // refused: plain soup
  ['i', 'use', 'tisana', 'zuppa'], ['h', 'use', 'porta_cabina', 'zuppa_sonno'], ['h', 'walk', 'porta_cabina'],
  ['h', 'take', 'chiavetta'], ['h', 'walk', 'exit'], ['h', 'walk', 'botola_stiva'],
  ['h', 'take', 'occhio'], // not visible yet: nothing happens
  ['h', 'use', 'gabbia', 'chiavetta'], ['h', 'take', 'occhio'], ['h', 'walk', 'exit'],
  ['h', 'walk', 'passerella'], // refused: the cannon still works
  ['h', 'use', 'cannone', 'secchio'],
  ['h', 'walk', 'passerella'], // the end
];
const WANTED = ['bac_pesca', 'sin_faro', 'sba_pala', 'sba_tisana', 'tri_roba'];
const MAYA_WANTED = ['chaac_vulcano', 'capo_ricetta', 'nonna_ingredienti', 'sac_braciere'];

const MAYA_WALKTHROUGH = [
  ['h', 'take', 'conchiglia'],
  ['h', 'use', 'palma', 'conchiglia_rosa'],
  ['h', 'take', 'cocco_terra'],
  ['h', 'use', 'pescatore', 'cocco'],
  ['h', 'talk', 'pescatore'],
  ['h', 'walk', 'exit_giungla'],
  ['h', 'look', 'stela'],
  ['h', 'walk', 'exit_villaggio'],
  ['h', 'talk', 'capo'],
  ['h', 'use', 'albero_cacao', 'bastone_selce'],
  ['h', 'walk', 'porta_capanna'],
  ['h', 'talk', 'nonna'],
  ['h', 'take', 'cesto'],
  ['h', 'walk', 'exit'],
  ['h', 'walk', 'exit_giungla'],
  ['h', 'use', 'scimmia', 'mais'],
  ['h', 'walk', 'exit_cenote'],
  ['h', 'use', 'rana', 'conchiglia_rosa'],
  ['h', 'take', 'ninfea'],
  ['h', 'use', 'altare', 'amuleto_giada'],
  ['h', 'take', 'maschera'],
  ['h', 'walk', 'exit_giungla'],
  ['h', 'walk', 'exit_villaggio'],
  ['h', 'walk', 'porta_capanna'],
  ['h', 'use', 'nonna', 'fave_cacao'],
  ['h', 'use', 'nonna', 'ninfea_sacra'],
  ['h', 'walk', 'exit'],
  ['h', 'walk', 'exit_giungla'],
  ['h', 'walk', 'exit_tempio'],
  ['h', 'use', 'simbolo_giaguaro'],
  ['h', 'use', 'simbolo_sole'],
  ['h', 'use', 'simbolo_serpente'],
  ['h', 'talk', 'sacerdote'],
  ['h', 'use', 'sacerdote', 'maschera_oro'],
  ['h', 'use', 'braciere', 'cioccolata_sacra'],
];

async function play(steps, onStep) {
  const io = makeIo(new Set(WANTED));
  const game = Core.createGame(story, io);
  await game.begin();
  for (const [kind, verb, target, extra] of steps) {
    if (onStep) onStep(game, [kind, verb, target, extra]);
    if (kind === 'h') await game.act(verb, target, extra);
    else await game.actItem(verb, target, extra);
  }
  return { io, game };
}

test('the adventure can be finished', async () => {
  const hints = new Set();
  const { io, game } = await play(WALKTHROUGH, (gm) => {
    const h = story.hint(gm.g);
    assert.strictEqual(typeof h, 'string');
    assert.ok(h.length > 10);
    hints.add(h);
  });
  assert.strictEqual(game.g.flag('faro_acceso'), true);
  assert.ok(io.ended, 'ending shown');
  assert.strictEqual(game.state.room, 'cala');
  assert.ok(game.g.flag('finito') && game.g.has('occhio') && !game.g.has('secchio'));
  assert.ok(hints.size >= 26, 'hints change along the way, got ' + hints.size);
});

test('wrong moves are refused and nothing is lost', async () => {
  const { game, io } = await play(WALKTHROUGH.slice(0, 20)); // up to "take pala" without permission
  assert.ok(!game.g.has('pala'));
  assert.ok(game.g.has('chiave'));
  assert.ok(!game.g.has('pesce'), 'the raw fish became fried fish');
  assert.strictEqual(game.state.room, 'faro_esterno');
});

test('money: 5 doubloons buy oil (3) and matches (2)', async () => {
  const upTo = WALKTHROUGH.findIndex((s) => s[2] === 'fiammiferi' && s[1] === 'take');
  const { game } = await play(WALKTHROUGH.slice(0, upTo + 1));
  assert.ok(game.g.has('olio') && game.g.has('fiammiferi'));
  assert.strictEqual(game.g.flag('dobloni'), 0);
  assert.ok(!game.g.has('dobloni'));
});

// A child clicks everything on everything. Before each step of the solution we try random
// actions in the current room: nothing may crash, and the adventure must still be finishable.
test('random clicking never crashes and never blocks the adventure', async () => {
  const verbs = Core.VERBS.map((v) => v.id);
  for (let seed = 1; seed <= 25; seed++) {
    let s = seed * 7919;
    const rnd = (n) => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s % n; };
    const pick = (list) => list[rnd(list.length)];
    const wanted = new Set(WANTED);
    let chaos = false, asked = 0;
    const io = makeIo(wanted);
    const solve = io.choose;
    io.choose = async (list) => (chaos && asked++ < 6 ? pick(list).id : solve(list));
    let game = Core.createGame(story, io);
    await game.begin();
    const where = () => 'seed ' + seed + ' in ' + game.state.room;
    for (const [kind, verb, target, extra] of WALKTHROUGH) {
      for (let k = 0; k < 6 && !io.ended; k++) {
        const snapshot = JSON.stringify(game.state);
        const inv = game.state.inv, spots = game.hotspots().filter((h) => !h.exit);
        const item = inv.length && rnd(2) ? pick(inv) : undefined;
        chaos = true; asked = 0;
        try {
          if (spots.length && rnd(4)) await game.act(item ? pick(['use', 'give']) : pick(verbs), pick(spots).id, item);
          else if (item) await game.actItem(pick(verbs), item, rnd(2) ? pick(inv) : undefined);
        } catch (err) { assert.fail(where() + ': ' + err.stack); }
        chaos = false;
        // a random action that walks away would desync the solution: undo it
        if (JSON.parse(snapshot).room !== game.state.room) game = Core.createGame(story, io, JSON.parse(snapshot));
      }
      if (io.ended) break;
      if (kind === 'h') await game.act(verb, target, extra);
      else await game.actItem(verb, target, extra);
    }
    assert.ok(io.ended, 'blocked: ' + where() + ' with ' + game.state.inv.join(','));
  }
});

test('the Maya adventure can be finished', async () => {
  const wanted = new Set(MAYA_WANTED);
  const io = makeIo(wanted), game = Core.createGame(storyMaya, io), hints = new Set();
  await game.begin();
  for (const [kind, verb, target, extra] of MAYA_WALKTHROUGH) {
    const hint = storyMaya.hint(game.g);
    assert.strictEqual(typeof hint, 'string');
    assert.ok(hint.length > 10);
    hints.add(hint);
    if (kind === 'h') await game.act(verb, target, extra);
    else await game.actItem(verb, target, extra);
  }
  assert.ok(io.ended, 'ending shown');
  assert.strictEqual(game.state.room, 'maya_tempio');
  assert.ok(game.g.flag('maya_completata'));
  assert.ok(game.g.flag('tempio_sbloccato') && game.g.flag('sacerdote_mascherato'));
  assert.ok(!game.g.has('cioccolata_sacra') && !game.g.has('maschera_oro'));
  assert.ok(hints.size >= 15, 'hints change along the way, got ' + hints.size);
  assert.deepStrictEqual([...wanted], [], 'all selected conversations were reached');
});

test('the Christmas adventure can be finished and saves Christmas', async () => {
  const io = makeIo(new Set()), game = Core.createGame(storyNatale, io);
  await game.begin();
  await game.act('walk', 'porta_pattini');
  await game.act('talk', 'negoziante_pattini');
  await game.act('walk', 'uscita');
  await game.act('walk', 'porta_pesca');
  await game.act('talk', 'pescatore');
  await game.act('take', 'scatola_esche');
  await game.act('walk', 'uscita');
  await game.act('walk', 'porta_pasticceria');
  for (const id of ['sacchetto_farina', 'ciotola_burro', 'vasetto_miele', 'cannella']) await game.act('take', id);
  await game.actItem('use', 'burro', 'farina');
  await game.actItem('use', 'impasto', 'miele');
  await game.actItem('use', 'cannella', 'impasto_dolce');
  await game.act('use', 'forno', 'impasto_speziato');
  await game.act('walk', 'uscita');
  await game.act('walk', 'sentiero_lago');
  assert.ok(game.g.flag('pioggia_arrivata'));
  await game.act('use', 'pista');
  await game.act('use', 'buca_pesca', 'canna_pesca');
  assert.ok(game.g.has('stella_nord') && game.g.has('pesce_argento'));
  await game.act('walk', 'uscita');
  await game.act('walk', 'porta_laboratorio');
  await game.act('use', 'tavolo_officina', 'stella_nord');
  await game.act('use', 'cuoco_elfo', 'pesce_argento');
  await game.act('take', 'sacco_elvesco');
  assert.ok(game.g.has('sacco_regali'));
  await game.act('walk', 'uscita');
  await game.act('walk', 'porta_babbo');
  await game.act('use', 'babbo_natale', 'biscotti');
  await game.act('use', 'regali_allaperto', 'telo_cerato');
  await game.act('use', 'slitta', 'campanella_magica');
  await game.act('use', 'slitta', 'sacco_regali');
  assert.ok(io.ended, 'ending shown');
  assert.ok(game.g.flag('natale_completato'));
  assert.ok(!game.g.has('sacco_regali'));
});

test('the Maya story opens with Filippo shipwrecked on the beach', async () => {
  const io = makeIo(new Set()), game = Core.createGame(storyMaya, io);
  await game.begin();
  const opening = io.lines.join('\n');
  assert.match(opening, /Filippo, che tutti chiamano Fili/);
  assert.match(opening, /burrasca/);
  assert.match(opening, /nave è incagliata/);
  assert.match(opening, /800 dopo Cristo/);
  assert.deepStrictEqual(storyMaya.start, { room: 'maya_spiaggia', x: 130, y: 124 });

  const targets = {
    relitto: [68, 98],
    conchiglia: [154, 121],
    pescatore: [196, 106],
    palma: [270, 70],
    cocco_terra: [257, 123],
    granchio: [178, 124],
  };
  for (const [id, [x, y]] of Object.entries(targets)) {
    const hotspot = storyMaya.rooms.maya_spiaggia.hotspots.find((h) => h.id === id);
    assert.ok(hotspot, 'missing beach hotspot ' + id);
    const [left, top, width, height] = hotspot.rect;
    assert.ok(x >= left && x <= left + width && y >= top && y <= top + height, 'visible ' + id + ' is outside its clickable area');
  }
});

test('each Maya temple disc confirms its press and the selected discs stay highlighted', async () => {
  const io = makeIo(new Set()), game = Core.createGame(storyMaya, io);
  await game.begin();
  await game.g.goto('maya_tempio', 160, 114);
  io.lines.length = 0;

  await game.act('use', 'simbolo_giaguaro');
  assert.match(io.lines[io.lines.length - 1], /disco del Giaguaro gira e si illumina.*Simbolo 1 di 3/);
  assert.strictEqual(game.g.flag('combo_maya'), 'G');

  await game.act('use', 'simbolo_sole');
  assert.match(io.lines[io.lines.length - 1], /disco del Sole gira e si illumina.*Simbolo 2 di 3/);
  assert.strictEqual(game.g.flag('combo_maya'), 'GS');

  await game.act('use', 'simbolo_serpente');
  assert.ok(game.g.flag('tempio_sbloccato'));
  assert.match(io.lines.join('\n'), /La grande grata di pietra si ritrae/);
});

test('Maya scene landmarks are inside their clickable areas', () => {
  const landmarks = {
    maya_giungla: {
      liana: [71, 55], stela: [125, 81], scimmia: [200, 45],
      exit_spiaggia: [8, 118], exit_villaggio: [250, 98], exit_cenote: [162, 106], exit_tempio: [312, 112],
    },
    maya_villaggio: {
      case_maya: [85, 76], porta_capanna: [80, 84], albero_cacao: [282, 77],
      capo: [188, 95], focolare: [142, 103], exit_giungla: [8, 112],
    },
    maya_capanna: {
      nonna: [196, 90], cesto: [104, 99], amaca: [36, 70], vasi: [265, 92], exit: [8, 78],
    },
    maya_cenote: {
      acqua: [100, 100], rana: [142, 84], ninfea: [178, 83],
      altare: [262, 82], maschera: [262, 94], exit_giungla: [10, 100],
    },
    maya_tempio: {
      vulcano_lontano: [45, 37], scala_piramide: [160, 74],
      simbolo_giaguaro: [96, 98], simbolo_sole: [158, 98], simbolo_serpente: [220, 98],
      sacerdote: [160, 24], braciere: [191, 33], exit_giungla: [8, 105],
    },
  };
  for (const [roomId, targets] of Object.entries(landmarks)) {
    const hotspots = storyMaya.rooms[roomId].hotspots;
    for (const [id, [x, y]] of Object.entries(targets)) {
      const hotspot = hotspots.find((entry) => entry.id === id);
      assert.ok(hotspot, 'missing ' + roomId + '/' + id);
      const [left, top, width, height] = hotspot.rect;
      assert.ok(x >= left && x <= left + width && y >= top && y <= top + height, 'visible ' + roomId + '/' + id + ' is outside its clickable area');
    }
  }
});

function assertStoryDataConsistent(data) {
  const items = Object.keys(data.items);
  assert.ok(data.rooms[data.start.room]);
  for (const [roomId, room] of Object.entries(data.rooms)) {
    assert.ok(room.walk.length >= 3 && room.scale.length === 4 && room.music, roomId);
    const ids = new Set();
    for (const h of room.hotspots) {
      const where = roomId + '/' + h.id;
      assert.ok(!ids.has(h.id), 'duplicate id ' + where);
      ids.add(h.id);
      assert.ok(h.name && h.rect.length === 4 && h.at.length === 2, where);
      assert.ok(Core.pointInPoly(h.at[0], h.at[1], room.walk), 'stand point outside the floor: ' + where);
      if (h.exit) {
        const target = data.rooms[h.exit.to];
        assert.ok(target, 'unknown room: ' + where);
        assert.ok(Core.pointInPoly(h.exit.x, h.exit.y, target.walk), 'arrival outside the floor: ' + where);
      }
      for (const it of Object.keys(h.useWith || {})) assert.ok(items.includes(it), 'unknown item ' + it + ' in ' + where);
    }
  }
  for (const key of Object.keys(data.combos)) {
    const pair = key.split('+');
    assert.deepStrictEqual(pair, [...pair].sort(), 'combo key not sorted: ' + key);
    for (const it of pair) assert.ok(items.includes(it), 'unknown item in combo ' + key);
  }
  for (const id of items) assert.ok(data.items[id].name && data.items[id].look, 'item ' + id);
}

test('first story data is consistent', () => assertStoryDataConsistent(story));
test('Maya story data is consistent', () => assertStoryDataConsistent(storyMaya));
test('Christmas story data is consistent', () => assertStoryDataConsistent(storyNatale));

test('geometry helpers', () => {
  const sq = [[0, 0], [10, 0], [10, 10], [0, 10]];
  assert.ok(Core.pointInPoly(5, 5, sq));
  assert.ok(!Core.pointInPoly(15, 5, sq));
  const [x, y] = Core.nearestInPoly(20, 5, sq);
  assert.ok(Core.pointInPoly(x, y, sq));
});
