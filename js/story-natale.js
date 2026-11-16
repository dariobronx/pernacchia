// "Fili e il Natale che rischiava di sciogliersi": a winter point-and-click adventure.
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m;
  else root.AdvStoryNatale = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function catchFish(g, withRod) {
    if (g.flag('pesce_preso')) {
      return g.say('La buca è ancora piena di pesci, ma per la zuppa degli elfi ne basta uno.');
    }
    if (withRod && !g.has('esca')) {
      return g.say('L’amo è pronto, ma senza un’esca i pesci non abboccano. Il retino, invece, può prendere un pesce al volo!');
    }
    if (withRod) g.remove('esca');
    g.set('pesce_preso');
    g.add('pesce_argento');
    g.sfx('pick');
    return g.say(withRod
      ? 'Tiro piano la lenza: un pesce argentato salta fuori dalla buca!'
      : 'Con un colpo preciso del retino prendo un pesce tra il luccichio del branco!');
  }

  const items = {
    farina: { name: 'farina', look: 'Farina bianca e soffice, pronta per un impasto di festa.' },
    burro: { name: 'burro', look: 'Burro fresco che profuma di latte. È perfetto per i biscotti.' },
    miele: { name: 'miele', look: 'Miele dorato prodotto dalle api del villaggio.' },
    cannella: { name: 'cannella', look: 'Una stecca profumata di cannella: sa già di Natale.' },
    impasto: { name: 'impasto al burro', look: 'Farina e burro lavorati insieme fino a diventare una pasta morbida.' },
    impasto_dolce: { name: 'impasto dolce', look: 'All’impasto al burro ho aggiunto il miele. Manca solo un profumo natalizio.' },
    impasto_speziato: { name: 'impasto alla cannella', look: 'L’impasto dolce ora profuma di cannella. È pronto da infornare.' },
    biscotti: { name: 'biscotti di Natale', look: 'Biscotti a forma di stella, dorati e decorati con glassa rossa e verde.' },
    pattini: { name: 'pattini da ghiaccio', look: 'Pattini robusti, con lame lucide e lacci ben stretti.' },
    canna_pesca: { name: 'canna da pesca', look: 'Una canna leggera con mulinello, filo e un amo piccolo.' },
    retino: { name: 'retino da pesca', look: 'Un retino a maglie fitte, fatto apposta per prendere i pesci senza ferirli.' },
    esca: { name: 'esca', look: 'Un vermetto paffuto, raccolto nella scatola del pescatore.' },
    telo_cerato: { name: 'telo impermeabile', look: 'Un telo cerato rosso, piegato stretto: protegge i pacchi dalla pioggia.' },
    pesce_argento: { name: 'pesce argentato', look: 'Un pesce fresco del lago ghiacciato, pieno di energia e scaglie brillanti.' },
    stella_nord: { name: 'stella di ghiaccio', look: 'Una stella luminosa caduta sulla pista. Sembra fatta di neve e luce.' },
    campanella_magica: { name: 'campanella magica', look: 'Una campanella d’argento riparata dagli elfi. Il suo suono guida la slitta nella bufera.' },
    sacco_regali: { name: 'sacco dei regali', look: 'Un sacco pieno di pacchetti preparati dagli elfi: uno per ogni casa del villaggio.' },
  };

  const combos = {
    'burro+farina': {
      async use(g) {
        g.remove('farina'); g.remove('burro'); g.add('impasto');
        await g.say('Impasto farina e burro: la pasta diventa morbida e profumata.');
      },
    },
    'impasto+miele': {
      async use(g) {
        g.remove('impasto'); g.remove('miele'); g.add('impasto_dolce');
        await g.say('Aggiungo il miele e mescolo finché l’impasto diventa dolce e lucido.');
      },
    },
    'cannella+impasto_dolce': {
      async use(g) {
        g.remove('cannella'); g.remove('impasto_dolce'); g.add('impasto_speziato');
        await g.say('La cannella si sparge nell’impasto: adesso ha proprio il profumo del Natale!');
      },
    },
  };

  const rooms = {
    natale_piazza: {
      name: 'Piazza della Neve', music: 'natale',
      walk: [[5, 105], [315, 105], [315, 138], [5, 138]], scale: [102, 0.82, 138, 1.08],
      async enter(g) {
        if (g.flag('intro_natale')) return;
        g.set('intro_natale');
        g.set('natale_inverno');
        await g.chapter(3, 'Natale che nevica');
        await g.narrate('La notte della Vigilia, Fili raggiunge un villaggio di montagna coperto di neve. Ogni finestra brilla di luci colorate.');
        await g.narrate('Ma una pioggia improvvisa minaccia di rovinare i regali e la campanella della slitta si è spezzata!');
        await g.say('Devo aiutare gli elfi, preparare i biscotti e rimettere in sesto la slitta prima che arrivi Babbo Natale.');
        await g.say('Prima mi serviranno pattini e attrezzi da pesca: poi potrò esplorare il lago ghiacciato.');
      },
      hotspots: [
        { id: 'case_illuminate', name: 'case illuminate', rect: [3, 25, 82, 75], at: [46, 117],
          look: 'Dietro le finestre illuminate si intravedono alberi addobbati e pacchi regalo. Tutto il villaggio aspetta la Vigilia.' },
        { id: 'porta_pasticceria', name: 'casetta dei biscotti', rect: [8, 39, 48, 62], at: [34, 120],
          exit: { to: 'natale_pasticceria', x: 43, y: 128 } },
        { id: 'porta_pattini', name: 'negozio dei pattini', rect: [65, 38, 51, 65], at: [89, 120],
          exit: { to: 'natale_pattini', x: 42, y: 128 } },
        { id: 'porta_babbo', name: 'casa di Babbo Natale', rect: [130, 41, 52, 65], at: [153, 122],
          look: 'Un cottage rosso con una ghirlanda enorme e una finestrella a forma di stella.',
          exit: { to: 'natale_casa_babbo', x: 45, y: 128 } },
        { id: 'porta_laboratorio', name: 'laboratorio degli elfi', rect: [189, 39, 53, 66], at: [215, 121],
          exit: { to: 'natale_laboratorio', x: 42, y: 128 } },
        { id: 'porta_pesca', name: 'negozio di pesca', rect: [251, 39, 50, 64], at: [275, 120],
          exit: { to: 'natale_pesca', x: 42, y: 128 } },
        { id: 'sentiero_lago', name: 'sentiero per il lago', rect: [286, 78, 34, 44], at: [298, 125],
          exit: { to: 'natale_lago', x: 38, y: 130 } },
      ],
    },
    natale_pasticceria: {
      name: 'La casetta dei biscotti', music: 'natale',
      walk: [[4, 105], [316, 105], [316, 138], [4, 138]], scale: [102, 0.82, 138, 1.08],
      hotspots: [
        { id: 'uscita', name: 'porta della casetta', rect: [0, 40, 35, 75], at: [20, 125],
          exit: { to: 'natale_piazza', x: 45, y: 128 } },
        { id: 'sacchetto_farina', name: 'sacchetto di farina', rect: [43, 76, 35, 30], at: [60, 120], pick: true,
          look: 'Farina setacciata e pronta per una nuova infornata.',
          take(g) { g.add('farina'); return g.say('Prendo un sacchetto di farina.'); } },
        { id: 'ciotola_burro', name: 'ciotola di burro', rect: [83, 79, 32, 27], at: [99, 120], pick: true,
          look: 'Una ciotola piena di burro morbido.',
          take(g) { g.add('burro'); return g.say('Prendo una noce di burro.'); } },
        { id: 'vasetto_miele', name: 'vasetto di miele', rect: [123, 66, 27, 40], at: [137, 120], pick: true,
          look: 'Miele dorato, con una piccola ape disegnata sul vetro.',
          take(g) { g.add('miele'); return g.say('Prendo il vasetto di miele.'); } },
        { id: 'cannella', name: 'stecche di cannella', rect: [157, 73, 35, 33], at: [174, 120], pick: true,
          look: 'Stecche di cannella legate con un filo rosso.',
          take(g) { g.add('cannella'); return g.say('Prendo una stecca di cannella.'); } },
        { id: 'forno', name: 'forno a legna', rect: [204, 42, 69, 65], at: [234, 123],
          look: 'Il forno di mattoni è caldo e pronto. La teglia ha sei sagome a forma di stella.',
          useWith: {
            impasto_speziato(g) {
              if (g.has('biscotti')) return g.say('Ho già sfornato una teglia di biscotti per Babbo Natale.');
              g.remove('impasto_speziato'); g.add('biscotti'); g.set('biscotti_pronti');
              g.sfx('fanfare');
              return g.say('Inforno l’impasto. Poco dopo, sei biscotti dorati riempiono la casetta di profumo!');
            },
          },
          use: 'Il forno è già acceso. Prima devo preparare un impasto dolce alla cannella.' },
        { id: 'pasticcera', name: 'elfa pasticcera', rect: [276, 69, 31, 48], at: [281, 125], npc: true,
          look: 'L’elfa pasticcera indossa un grembiule a quadretti e una cuffietta infarinata.',
          talk: 'Per i biscotti mescola farina e burro, aggiungi il miele e poi la cannella. Inforna tutto quando l’impasto profuma di festa!' },
      ],
    },
    natale_pattini: {
      name: 'Il negozio dei pattini', music: 'natale',
      walk: [[4, 105], [316, 105], [316, 138], [4, 138]], scale: [102, 0.82, 138, 1.08],
      hotspots: [
        { id: 'uscita', name: 'porta del negozio', rect: [0, 40, 34, 75], at: [18, 125],
          exit: { to: 'natale_piazza', x: 96, y: 128 } },
        { id: 'pattini_esposti', name: 'pattini sulla mensola', rect: [41, 38, 94, 66], at: [86, 119],
          look: 'Pattini di varie misure sono allineati sulla mensola, con le lame lucidate a specchio.' },
        { id: 'negoziante_pattini', name: 'negoziante dei pattini', rect: [197, 50, 47, 66], at: [214, 125], npc: true,
          look: 'Una negoziante con un maglione verde e una sciarpa rossa controlla le lame.',
          talk(g) {
            if (g.has('pattini')) return g.say('Fai attenzione alle curve! Sul ghiaccio, gambe larghe e passi piccoli.');
            g.add('pattini');
            return g.say('Se aiuti Babbo Natale, ti presto questi pattini. La stella della slitta è rimasta sulla pista ghiacciata!');
          } },
        { id: 'pista_in_miniatura', name: 'pista in miniatura', rect: [255, 74, 58, 34], at: [280, 119],
          look: 'Un modellino del lago mostra una pista liscia e una buca per pescare. Sul ghiaccio brilla qualcosa.' },
      ],
    },
    natale_pesca: {
      name: 'Il negozio di pesca', music: 'natale',
      walk: [[4, 105], [316, 105], [316, 138], [4, 138]], scale: [102, 0.82, 138, 1.08],
      hotspots: [
        { id: 'uscita', name: 'porta del negozio', rect: [0, 40, 34, 75], at: [18, 125],
          exit: { to: 'natale_piazza', x: 270, y: 128 } },
        { id: 'pescatore', name: 'pescatore del villaggio', rect: [191, 44, 49, 73], at: [211, 125], npc: true,
          look: 'Il pescatore ha un cappello di lana e una barba piena di fiocchi di neve.',
          talk(g) {
            if (g.has('canna_pesca')) return g.say('Puoi usare la canna con un’esca o il retino con il branco. Ricorda di rimettere ogni pesce nel lago dopo la festa!');
            g.add('canna_pesca'); g.add('retino'); g.add('telo_cerato');
            return g.say('Per la Vigilia ti presto la canna e il retino. Prendi anche questo telo cerato: se la pioggia arriva, salverà i regali!');
          } },
        { id: 'scatola_esche', name: 'scatola delle esche', rect: [59, 83, 64, 25], at: [91, 122], pick: true,
          look: 'La scatola è piena di esche naturali per pescare con delicatezza.',
          take(g) { g.add('esca'); return g.say('Prendo una sola esca, quanto basta per pescare un pesce.'); } },
        { id: 'insegna_reti', name: 'retini e canne', rect: [57, 34, 82, 43], at: [98, 119],
          look: 'Canne da pesca e retini sono appesi accanto a una mappa del lago.' },
      ],
    },
    natale_lago: {
      name: 'Il lago dei mille pesci', music: 'natale',
      walk: [[5, 105], [315, 105], [315, 138], [5, 138]], scale: [101, 0.82, 138, 1.08],
      async enter(g) {
        if (g.flag('pioggia_arrivata')) return;
        g.set('pioggia_arrivata');
        g.sfx('rumble');
        await g.narrate('Un tuono rotola sopra le montagne. Dalla neve comincia a cadere una pioggia fredda!');
        await g.say('La pioggia bagnerà i regali lasciati fuori. Devo coprirli con il telo del pescatore.');
      },
      hotspots: [
        { id: 'uscita', name: 'sentiero per il villaggio', rect: [0, 55, 39, 66], at: [20, 126],
          exit: { to: 'natale_piazza', x: 293, y: 128 } },
        { id: 'pista', name: 'pista di pattinaggio', rect: [79, 43, 148, 57], at: [149, 122],
          look: (g) => g.flag('stella_recuperata')
            ? 'La pista scintilla sotto le luci. La stella della slitta è già al sicuro.'
            : 'Il ghiaccio è liscio e sicuro. Una stella luminosa luccica al centro della pista.',
          use(g) {
            if (!g.has('pattini')) return g.say('Il ghiaccio è troppo scivoloso con gli stivali. Devo prendere in prestito i pattini.');
            if (g.flag('stella_recuperata')) return g.say('Faccio un giro elegante: uno, due, tre! La stella l’ho già recuperata.');
            g.set('stella_recuperata'); g.add('stella_nord'); g.sfx('fanfare');
            return g.say('Con una piroetta raggiungo la stella e la raccolgo senza cadere. Che scivolata!');
          } },
        { id: 'buca_pesca', name: 'buco per la pesca', rect: [243, 81, 48, 31], at: [264, 124],
          look: 'La buca è stata aperta con cura. Sotto il ghiaccio nuotano tantissimi pesci colorati.',
          useWith: {
            canna_pesca(g) { return catchFish(g, true); },
            retino(g) { return catchFish(g, false); },
          } },
        { id: 'pesci_sotto_ghiaccio', name: 'branco di pesci', rect: [233, 47, 70, 32], at: [270, 120],
          look: 'Decine di pesciolini argentati guizzano in cerchio sotto la superficie trasparente.' },
        { id: 'renne', name: 'renne di Babbo Natale', rect: [40, 68, 51, 42], at: [57, 122],
          look: 'Le renne sono al riparo sotto un abete carico di neve. Una indossa un campanellino rosso.',
          talk: 'Le renne scalpitano impazienti. Non vedono l’ora di trainare la slitta!' },
      ],
    },
    natale_laboratorio: {
      name: 'Il laboratorio degli elfi', music: 'natale',
      walk: [[4, 105], [316, 105], [316, 138], [4, 138]], scale: [102, 0.82, 138, 1.08],
      hotspots: [
        { id: 'uscita', name: 'porta del laboratorio', rect: [0, 40, 34, 75], at: [18, 125],
          exit: { to: 'natale_piazza', x: 210, y: 128 } },
        { id: 'tavolo_officina', name: 'banco della campanella', rect: [57, 73, 93, 34], at: [103, 120],
          look: 'Sul banco c’è una campanella spezzata. Una stella luminosa potrebbe alimentare il suo meccanismo.',
          useWith: {
            stella_nord(g) {
              if (g.flag('campanella_riparata')) return g.say('La campanella è già riparata e pronta per la slitta.');
              g.remove('stella_nord'); g.add('campanella_magica');
              g.set('campanella_riparata'); g.sfx('fanfare');
              return g.say('Gli elfi incastonano la stella nel cuore della campanella. DRIN! Il suo suono magico riempie il laboratorio.');
            },
          } },
        { id: 'cuoco_elfo', name: 'elfo cuoco', rect: [161, 48, 43, 67], at: [180, 125], npc: true,
          look: 'L’elfo cuoco indossa un grembiule a righe e gira una grande pentola fumante.',
          talk: 'Per la cena della Vigilia preparerò una zuppa calda. Mi manca un pesce fresco del lago.' ,
          useWith: {
            pesce_argento(g) {
              if (g.flag('zuppa_pronta')) return g.say('La zuppa è già pronta e gli elfi stanno apparecchiando la tavola.');
              g.remove('pesce_argento'); g.set('zuppa_pronta');
              return g.say('Consegno il pesce all’elfo cuoco. Lo ringrazia e prepara una zuppa fumante per tutta la squadra!');
            },
          } },
        { id: 'sacco_elvesco', name: 'sacco dei pacchi', rect: [220, 68, 53, 41], at: [246, 122],
          look: (g) => g.flag('sacco_pronto')
            ? 'Il sacco è pieno di pacchi colorati, indirizzati a tutte le case del villaggio.'
            : 'Gli elfi stanno preparando i regali. Prima devono riparare la campanella e finire la zuppa della Vigilia.',
          show: (g) => g.flag('campanella_riparata') && g.flag('zuppa_pronta'),
          take(g) {
            if (g.flag('sacco_pronto')) return g.say('Il sacco dei regali è già con me.');
            g.set('sacco_pronto'); g.add('sacco_regali');
            return g.say('Gli elfi riempiono il sacco con i regali per tutte le famiglie. È ora di portarli alla slitta!');
          } },
        { id: 'elfo_aiutante', name: 'elfo aiutante', rect: [274, 48, 35, 68], at: [287, 125], npc: true,
          look: 'Un elfo con gli occhiali controlla una lista lunga fino alle scarpe.',
          talk: 'La campanella guida la slitta, il cuoco prepara la zuppa e poi riempiamo il sacco dei regali. Una cosa alla volta!' },
      ],
    },
    natale_casa_babbo: {
      name: 'La casa di Babbo Natale', music: 'natale',
      walk: [[4, 105], [316, 105], [316, 138], [4, 138]], scale: [102, 0.82, 138, 1.08],
      hotspots: [
        { id: 'uscita', name: 'porta della casa', rect: [0, 40, 34, 75], at: [18, 125],
          exit: { to: 'natale_piazza', x: 151, y: 128 } },
        { id: 'babbo_natale', name: 'Babbo Natale', rect: [91, 40, 57, 74], at: [116, 125], npc: true,
          look: 'Babbo Natale ha una giacca di velluto rosso, un grande cappello e una barba bianca come la neve.',
          talk(g) {
            if (g.flag('natale_completato')) return g.say('Ho già la slitta pronta: grazie, Fili!');
            return g.say('La Vigilia è vicina! Servono biscotti per le renne, regali asciutti e una campanella funzionante.');
          },
          useWith: {
            biscotti(g) {
              if (g.flag('biscotti_consegnati')) return g.say('Grazie! I biscotti sono già pronti per le renne.');
              g.remove('biscotti'); g.set('biscotti_consegnati');
              return g.say('Babbo Natale mette i biscotti nel sacco della slitta: le renne ne saranno felicissime!');
            },
          } },
        { id: 'regali_allaperto', name: 'regali fuori dalla porta', rect: [41, 77, 42, 39], at: [59, 123],
          look: (g) => g.flag('regali_protetti')
            ? 'Il telo impermeabile protegge tutti i pacchi dalla pioggia.'
            : g.flag('pioggia_arrivata')
              ? 'La pioggia sta bagnando i pacchi. Devo coprirli subito con il telo cerato!'
              : 'Alcuni pacchi aspettano sul portico, pronti per essere portati alla slitta.',
          useWith: {
            telo_cerato(g) {
              if (g.flag('regali_protetti')) return g.say('I regali sono già al riparo sotto il telo.');
              g.remove('telo_cerato'); g.set('regali_protetti');
              return g.say('Stendo il telo cerato sopra i pacchi. La pioggia scivola via senza bagnare i regali!');
            },
          } },
        { id: 'slitta', name: 'slitta di Babbo Natale', rect: [157, 75, 110, 39], at: [210, 124],
          look: 'La slitta rossa scintilla sotto le luci. Sul davanti c’è il supporto vuoto della campanella.',
          useWith: {
            campanella_magica(g) {
              if (g.flag('campanella_montata')) return g.say('La campanella è già fissata alla slitta.');
              g.remove('campanella_magica'); g.set('campanella_montata');
              g.sfx('fanfare');
              return g.say('Fisso la campanella alla slitta. DRIN-DRIN! Le renne rispondono da lontano.');
            },
            sacco_regali(g) {
              if (!g.flag('campanella_montata')) return g.say('Prima devo fissare alla slitta la campanella magica.');
              if (!g.flag('biscotti_consegnati')) return g.say('Babbo Natale non parte senza i biscotti per le renne.');
              if (!g.flag('regali_protetti')) return g.say('La pioggia non dà tregua: prima devo proteggere i pacchi con il telo cerato.');
              if (g.flag('natale_completato')) return g.say('Il sacco è già caricato. La slitta è pronta!');
              g.remove('sacco_regali'); g.set('natale_completato');
              g.sfx('fanfare');
              return (async () => {
                await g.narrate('La campanella suona forte e chiara. La pioggia si trasforma in una nevicata leggera.');
                await g.narrate('Babbo Natale carica i regali; le renne si lanciano nel cielo e raggiungono ogni casa illuminata.');
                await g.npc('babbo_natale', 'Il Natale è salvo! Grazie per aver aiutato tutto il villaggio, Fili!');
                await g.say('Dalla slitta piovono saluti e fiocchi di neve. Buon Natale a tutti!');
                await g.ending();
              })();
            },
          } },
        { id: 'renne_casa', name: 'renne sul portico', rect: [271, 57, 44, 60], at: [292, 125], npc: true,
          look: 'Le renne hanno coperte calde e piccoli campanelli al collo.',
          talk: 'Le renne annusano i biscotti e battono gli zoccoli: sono pronte per il viaggio!' },
      ],
    },
  };

  function hint(g) {
    if (!g.flag('intro_natale')) return 'Parla con i negozianti in piazza: ti presteranno pattini e attrezzi da pesca.';
    if (!g.has('pattini')) return 'Nel negozio dei pattini, parla con la negoziante per prenderne un paio in prestito.';
    if (!g.has('canna_pesca')) return 'Nel negozio di pesca, parla con il pescatore: ti darà canna, retino e telo impermeabile.';
    if (!g.has('farina') || !g.has('burro') || !g.has('miele') || !g.has('cannella')) return 'Nella casetta dei biscotti raccogli farina, burro, miele e cannella.';
    if (!g.has('biscotti')) return 'Combina farina e burro, aggiungi miele e cannella, poi usa l’impasto sul forno.';
    if (!g.has('stella_nord')) return 'Al lago usa la pista con i pattini: la stella della slitta brilla sul ghiaccio.';
    if (!g.has('pesce_argento') && !g.flag('zuppa_pronta')) return 'Al lago usa la canna con un’esca sul buco, oppure prova il retino sul buco per pescare.';
    if (!g.flag('campanella_riparata')) return 'Nel laboratorio usa la stella di ghiaccio sul banco per riparare la campanella.';
    if (!g.flag('zuppa_pronta')) return 'Nel laboratorio consegna il pesce argentato all’elfo cuoco.';
    if (!g.has('sacco_regali')) return 'Prendi il sacco preparato dagli elfi nel laboratorio.';
    if (!g.has('telo_cerato') && !g.flag('regali_protetti')) return 'Copri con il telo cerato i regali fuori dalla casa di Babbo Natale.';
    if (!g.flag('biscotti_consegnati')) return 'Consegna i biscotti a Babbo Natale: sono per le renne.';
    if (!g.flag('campanella_montata')) return 'Usa la campanella magica sulla slitta.';
    return 'Carica il sacco dei regali sulla slitta: il Natale è pronto a partire!';
  }

  return {
    title: 'Fili e il Natale che rischiava di sciogliersi',
    subtitle: 'Una Vigilia tra neve, biscotti e stelle',
    start: { room: 'natale_piazza', x: 145, y: 130 },
    actors: {
      fili: { color: '#b8e3ff' }, narr: { color: '#ffffff' },
      babbo_natale: { color: '#ff9e7a' }, elfo: { color: '#b8f0a0' },
      pescatore: { color: '#7be0ff' }, pasticcera: { color: '#ffd27a' },
      renne: { color: '#e8c38b' },
    },
    items, combos, rooms, hint,
  };
});
