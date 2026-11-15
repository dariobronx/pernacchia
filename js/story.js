// "Fili e il Faro di Isola Pernacchia": all the content of the adventure.
// Rooms, hotspots (things you can click), items, dialogues, puzzles and hints.
// Coordinates are in scene pixels (320 x 140). `rect` = clickable area [x, y, w, h],
// `at` = where Fili walks before acting. A handler is a line, a list of lines, or a script.
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m;
  else root.AdvStory = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CAVE_CODE = 'PLT'; // Pesce, Luna, Teschio

  // ---------- small shared scripts ----------
  async function buy(g, item, price, flag, line) {
    const have = g.flag('dobloni') || 0;
    if (have < price) {
      await g.npc('madama', 'Costa ' + price + ' dobloni, tesoro. E tu ne hai ' + have + '. La matematica è crudele.');
      return;
    }
    g.set('dobloni', have - price);
    if (have - price === 0) g.remove('dobloni');
    g.set(flag);
    g.sfx('coin');
    g.add(item);
    await g.npc('madama', line);
  }
  const buyOil = (g) => buy(g, 'olio', 3, 'olio_comprato', "Olio per lampade, l'ultima bottiglia dell'isola. Trattala bene.");
  const buyMatches = (g) => buy(g, 'fiammiferi', 2, 'fiammiferi_comprati', 'Fiammiferi "Scintilla Sicura". Sicura più o meno.');

  async function pressSymbol(g, letter) {
    if (g.flag('grotta_aperta')) { await g.say('La porta è già aperta. Meglio non toccare più niente.'); return; }
    g.sfx('click');
    const seq = (g.flag('combo') || '') + letter;
    if (seq.length < 3) { g.set('combo', seq); return; }
    g.set('combo', '');
    if (seq === CAVE_CODE) {
      g.set('grotta_aperta');
      g.sfx('rumble');
      await g.narrate('GRRRRRUMMMBLE!');
      await g.say('La porta di pietra si è aperta! Grazie, pappagallo.');
    } else {
      g.sfx('wrong');
      await g.say('GRRUM. Niente. I simboli sono tornati su: ordine sbagliato.');
    }
  }

  async function lightTheLamp(g) {
    if (g.flag('faro_acceso')) { await g.say('È già accesa, e guai a chi la tocca.'); return; }
    if (!g.flag('lente_montata') && !g.flag('olio_versato')) { await g.say('Accendere cosa? Qui mancano la lente e pure l\'olio.'); return; }
    if (!g.flag('lente_montata')) { await g.say("L'olio c'è, ma senza lente farebbe la luce di una candelina."); return; }
    if (!g.flag('olio_versato')) { await g.say("La lente c'è, ma il serbatoio dell'olio è vuoto."); return; }
    if (!g.flag('ammiraglio_arrivato')) {
      await g.say('Lente a posto, olio a posto. E adesso... fuoco!');
      g.sfx('match');
      await g.wait(0.6);
      g.set('ammiraglio_arrivato');
      g.sfx('boss');
      await g.npc('ammiraglio', 'FERMO LÌ, MOCCIOSO!');
      await g.npc('ammiraglio', 'Pfffff!');
      await g.say('Ehi! Mi ha spento il fiammifero! Ammiraglio Parruccone?!');
      await g.npc('ammiraglio', 'Tre giorni di duro lavoro! Ho rubato la lente. Ho comprato tutto l\'olio dell\'isola.');
      await g.npc('ammiraglio', 'Ho perfino pagato un gabbiano per rubare la chiave. In acciughe!');
      await g.say('Ma perché?');
      await g.npc('ammiraglio', 'Faro spento, navi sugli scogli. Navi sugli scogli, tesori in mare. Tesori in mare... tesori MIEI!');
      await g.npc('ammiraglio', 'E tu non accenderai un bel niente. Di qui non mi sposto.');
      await g.say('Devo togliermelo di torno. Ma è grosso come un galeone...');
      return;
    }
    if (!g.flag('ammiraglio_volato')) { await g.say('Con quel parruccone davanti alla lampada? Me lo spegne di nuovo.'); return; }
    await g.say('Stavolta nessuno soffia. Tre... due... uno...');
    g.sfx('match');
    await g.wait(0.5);
    g.set('faro_acceso');
    g.sfx('fanfare');
    await g.narrate('FWOOOSH!');
    await g.say('FUNZIONA! Il faro di Isola Pernacchia è di nuovo acceso!');
    await g.narrate('Il fascio di luce tornò a spazzare il mare, e tutte le navi ritrovarono la rotta.');
    await g.narrate('Ma la luce illuminò anche un\'altra cosa: una nave nera, nascosta nella cala dietro il faro.');
    g.sfx('boss');
    await g.npc('finestra', 'CIURMA! Tiratemi fuori dall\'acqua! E ridatemi una parrucca!');
    await g.npc('finestra', 'Caricate il cannone: all\'alba facciamo a pezzi quel faro. Poi si salpa, con tutto il bottino!');
    await g.say('L\'Ammiraglio! Ha una nave piena di roba rubata... e un cannone puntato proprio qui.');
    await g.say('Devo salire su quella nave prima dell\'alba.');
    g.set('cap2');
    await g.chapter(2, 'La nave nera');
  }

  async function feedAdmiral(g) {
    await g.say('Ammiraglio, assaggi: specialità dell\'isola.');
    await g.npc('ammiraglio', "Dammi qua! Tutto quello che c'è su quest'isola è MIO!");
    g.remove('fagioli');
    await g.npc('ammiraglio', 'Gnam. Gnam. Gnam. Mmm... piccantino.');
    await g.wait(0.6);
    await g.npc('ammiraglio', '...Cos\'è questo brontolio?');
    g.sfx('rumble');
    await g.wait(0.5);
    g.set('ammiraglio_volato');
    g.sfx('fart');
    await g.narrate('PRRRRRRRROOOOOOOT!!!');
    await g.npc('finestra', 'LA MIA PARRUCCAAAaaaa...');
    await g.say('Fagioli Esplosivi della Peperina. Non adatti ai bambini. E nemmeno agli ammiragli.');
    await g.say('Via libera! Ora posso accendere la lampada.');
  }

  // ---------- inventory items ----------
  const items = {
    lanterna: { name: 'lanterna vuota', look: 'Una vecchia lanterna da marinaio. Senza olio non fa luce nemmeno a pregarla.', use: 'È vuota. Prima ci vuole dell\'olio.' },
    lanterna_piena: { name: 'lanterna con olio', look: 'Adesso è piena di olio. Manca solo una fiammella.', use: 'Mi serve qualcosa per accenderla.' },
    lanterna_accesa: { name: 'lanterna accesa', look: 'Fa una bella luce calda. Addio, paura del buio!', use: 'È già accesa. Devo solo andare dove è buio.' },
    galletta: { name: 'galletta', look: 'Una galletta da marinaio. Dura come un sasso, ma i pappagalli hanno il becco buono.', use: 'Ci ho provato. Per poco non ci lascio un dente.' },
    verme: { name: 'verme ciccione', look: 'Un verme bello cicciotto. Si chiama Ugo. Non affezionarti, Fili.', use: 'Non so cosa farci, a parte regalarlo a un pescatore.' },
    pesce: { name: 'pesce crudo', look: 'Un pesce appena pescato. Mi guarda con disapprovazione.', use: 'Crudo non lo mangio nemmeno io.' },
    pesce_fritto: { name: 'pesce fritto', look: 'Dorato e croccante. Profuma di cose buone.', use: 'Mmm... no! Mi serve per uno scambio.' },
    chiave: { name: 'chiave del faro', look: 'Una grossa chiave di ferro con un piccolo faro inciso. E un po\' di cacca di gabbiano.', use: 'È la chiave del faro. La devo usare sulla sua porta.' },
    bottiglia: {
      name: 'bottiglia con messaggio',
      look: 'Una bottiglia tappata. Dentro c\'è un foglio arrotolato!',
      async use(g) {
        g.sfx('pop');
        await g.say('Stappo... POP! È una mappa del tesoro!');
        await g.say('"Scava dove l\'ombra della palma storta fa la X. Firmato: Capitan Barbacalzino."');
        g.swap('bottiglia', 'mappa');
        g.set('mappa_letta');
      },
    },
    mappa: { name: 'mappa del tesoro', look: '"Scava dove l\'ombra della palma storta fa la X." La palma storta è in spiaggia.', use: 'Devo seguirla: la X è in spiaggia, vicino alla palma.' },
    pala: { name: 'pala', look: 'La pala del guardiano. Buona per scavare e per scuotere le cose alte.', use: 'Devo usarla su qualcosa.' },
    dobloni: { name: (g) => 'dobloni (' + (g.flag('dobloni') || 0) + ')', look: (g) => g.say('Ho ' + (g.flag('dobloni') || 0) + ' dobloni d\'oro. Sono ricco! Più o meno.'), use: 'Meglio spenderli nella bottega di Madama Cianfrusaglia.' },
    dentiera: { name: "dentiera d'oro", look: "Una dentiera d'oro massiccio. Dietro c'è inciso: \"proprietà di B.C.\"", use: 'No grazie. Non è della mia misura.' },
    olio: { name: 'olio per lampade', look: 'Una bottiglia di olio per lampade. Basta per una lanterna e per un faro intero.', use: 'Devo versarlo in qualcosa che fa luce.' },
    fiammiferi: { name: 'fiammiferi', look: 'Fiammiferi "Scintilla Sicura". Sulla scatola c\'è scritto: tenere lontano dai pirati.', use: 'Devo usarli su qualcosa da accendere.' },
    cocco: { name: 'noce di cocco', look: 'Una noce di cocco. Mi ha lasciato un bernoccolo come ricordo.', use: 'Non riesco ad aprirla. Magari serve a un bravo cuoco.' },
    manovella: { name: 'manovella', look: 'Una manovella di ferro. Sa ancora di sugo.', use: 'Va infilata in un meccanismo.' },
    fagioli: { name: 'fagioli esplosivi', look: 'Una ciotola di Fagioli Esplosivi della Peperina. Borbottano da soli.', use: 'La Peperina ha detto: non adatti ai bambini. E io le credo.' },
    parrucca_bagnata: { name: 'parrucca fradicia', look: 'La parrucca dell\'Ammiraglio. Gocciola, puzza di alghe e dentro c\'è un gamberetto.', use: 'Bagnata così non la metto nemmeno morto. Va asciugata davanti a un bel fuoco.' },
    parrucca: {
      name: 'parrucca asciutta', look: 'Asciutta, gonfia e vaporosa come una nuvola. Profuma di camino e un po\' di fritto.',
      async use(g) {
        g.remove('parrucca');
        g.set('parrucca_indossata');
        g.sfx('pop');
        await g.say('Mi sta enorme. Però adesso sembro un vero marinaio dell\'Ammiraglio. Più o meno.');
      },
    },
    secchio: { name: 'secchio d\'acqua', look: 'Un secchio pieno d\'acqua di mare. Dentro nuota un pesciolino offeso.', use: 'Devo rovesciarlo su qualcosa che NON deve prendere fuoco.' },
    zuppa: { name: 'zuppa di cipolle', look: 'Una scodella di zuppa di cipolle. È la cena dell\'Ammiraglio.', use: 'Non mi piacciono le cipolle. E poi non è per me.' },
    zuppa_sonno: { name: 'zuppa della buonanotte', look: 'Zuppa di cipolle corretta con la Tisana Sonnobello. Solo a guardarla mi viene da sbadigliare.', use: 'Non la assaggio nemmeno! Devo portarla a chi deve dormire.' },
    tisana: { name: 'Tisana Sonnobello', look: 'La tisana del guardiano Sbadiglio. Sull\'etichetta: "Una goccia e dormi fino a giovedì."', use: 'Non la bevo, se no domani mi trovano sull\'amaca. Meglio versarla nel piatto di qualcun altro.' },
    chiavetta: { name: 'chiavetta d\'oro', look: 'Una chiavetta d\'oro. L\'Ammiraglio la teneva al collo: deve aprire qualcosa di prezioso.', use: 'Devo trovare il lucchetto giusto.' },
    occhio: { name: 'Occhio del Kraken (quello vero)', look: 'L\'Occhio del Kraken originale, la lente rubata al faro. Brilla come una stella.', use: 'Devo portarlo via da questa nave. Subito!' },
    cristallo: { name: 'Occhio del Kraken', look: 'Un cristallo grande come un melone. Dentro sembra che giri una piccola tempesta.', use: 'È la lente del faro! Va montata nella lampada, lassù in cima.' },
  };

  // Two inventory items used together. The key is the two ids in alphabetical order.
  const combos = {
    'lanterna+olio': async (g) => { g.sfx('pour'); g.swap('lanterna', 'lanterna_piena'); await g.say('Glu glu glu. Lanterna piena! E mi resta ancora un sacco di olio.'); },
    'fiammiferi+lanterna_piena': async (g) => { g.sfx('match'); g.swap('lanterna_piena', 'lanterna_accesa'); await g.say('Fssst! La lanterna è accesa.'); },
    'fiammiferi+lanterna': 'Senza olio non si accende. Brucerei solo il fiammifero.',
    'lanterna_piena+olio': 'È già piena fino all\'orlo.',
    'lanterna_accesa+olio': 'È già piena. E accesa. Meglio non fare pasticci.',
    'fiammiferi+lanterna_accesa': 'Più accesa di così diventa un falò.',
    'fiammiferi+pesce': 'Con un fiammifero al massimo gli scaldo un baffo. Serve un fuoco vero.',
    'fiammiferi+olio': 'Olio e fuoco insieme, in tasca? Nemmeno i pirati sono così matti.',
    'cocco+pala': 'Se la rompo, addio ingrediente segreto.',
    'dentiera+galletta': 'Nemmeno una dentiera d\'oro ce la fa con questa galletta.',
    'fagioli+fiammiferi': 'NO. Esplosivi vuol dire esplosivi.',
    'tisana+zuppa': async (g) => { g.sfx('pour'); g.remove('tisana'); g.swap('zuppa', 'zuppa_sonno'); await g.say('Glu glu. Tutta la tisana nella zuppa. Mescolo con il dito... Ecco una bella zuppa della buonanotte!'); },
    'fiammiferi+parrucca_bagnata': 'Asciugarla con un fiammifero? Ci metto fino a Natale. Serve un fuoco vero.',
    'fiammiferi+parrucca': 'NO! Una parrucca così gonfia prende fuoco solo a guardarla.',
    'secchio+zuppa': 'Allungare la zuppa con l\'acqua di mare? Sono un guardiano, non un avvelenatore.',
    'parrucca_bagnata+secchio': 'È già bagnata abbastanza.',
    'pesce+verme': 'Il pesce è già stato pescato. Troppo tardi per l\'esca.',
  };

  // ---------- rooms ----------
  const rooms = {};

  rooms.molo = {
    name: 'Il molo', music: 'mare',
    walk: [[6, 110], [314, 110], [314, 136], [6, 136]], scale: [110, 0.85, 136, 1],
    async enter(g) {
      if (g.flag('intro')) return;
      g.set('intro');
      await g.chapter(1, 'Il faro spento');
      await g.narrate('Isola Pernacchia. Un\'isola così piccola che sulle mappe la scambiano per una macchia di sugo.');
      await g.narrate('Da tre notti il suo faro è spento. E senza faro, le navi finiscono dritte sugli scogli.');
      await g.say('Eccomi arrivato! Io sono Fili. Da grande farò il guardiano del faro.');
      await g.say('...O il pirata. O il pizzaiolo. Devo ancora decidere.');
      await g.say('Intanto scopriamo perché quel faro è spento!');
    },
    hotspots: [
      { id: 'mare', name: 'mare', rect: [0, 72, 320, 22], at: [160, 112], look: 'Il mare. Bagnato come sempre.', take: 'Mi servirebbe un secchio enorme.', use: 'Ho già fatto il bagno. Un mese fa.' },
      { id: 'faro_lontano', name: 'faro lontano', rect: [262, 22, 20, 30], at: [270, 112], look: 'Il faro, lassù sulla scogliera. Spento come un fiammifero bagnato.' },
      { id: 'barca', name: 'barchetta', rect: [24, 86, 50, 18], at: [50, 112], look: 'La mia barchetta. Ho remato per due giorni. Le braccia non me le sento più.', use: 'Non me ne vado finché il faro non si riaccende!', take: 'Pesa più di me.', open: 'È una barca, non un armadio.' },
      { id: 'lanterna', name: 'lanterna', rect: [118, 78, 12, 14], at: [124, 112], pick: true, show: (g) => !g.flag('lanterna_presa'),
        look: 'Una lanterna appesa al palo. Spenta anche lei: su quest\'isola è un vizio.',
        async take(g) { g.set('lanterna_presa'); g.add('lanterna'); await g.say('Presa. È vuota, ma una lanterna fa sempre comodo.'); } },
      { id: 'baccala', name: 'vecchio Baccalà', rect: [150, 82, 30, 32], at: [192, 116], npc: true,
        look: 'Un vecchio pescatore con la barba piena di sale. Fissa il galleggiante da chissà quanto.',
        async talk(g) {
          if (g.flag('cap2') && !g.flag('parrucca_pescata')) {
            await g.npc('baccala', 'Ragazzo! Bravo, il faro è acceso. I pesci sono di nuovo tranquilli.');
            await g.npc('baccala', 'Però guarda cos\'ho tirato su poco fa. È piovuto dal cielo con un gran PRRROT.');
            await g.say('Un polpo bianco e peloso?');
            await g.npc('baccala', 'Una PARRUCCA. Tienila tu, che a me spaventa le acciughe.');
            g.set('parrucca_pescata');
            g.add('parrucca_bagnata');
            await g.say('La parrucca dell\'Ammiraglio! È fradicia... ma potrebbe servirmi.');
            return;
          }
          if (g.flag('pesce_avuto')) { await g.npc('baccala', 'Con quel verme ho pescato per una settimana. Sei un bravo mozzo, ragazzo.'); return; }
          g.set('baccala_parlato');
          await g.npc('baccala', 'Ssst! Fai piano, che spaventi i pesci.');
          await g.dialog([
            { id: 'bac_pesca', text: 'Abbocca qualcosa?', run: async () => {
              await g.npc('baccala', 'Macché. Tre giorni che non tiro su niente. Ho finito le esche.');
              await g.npc('baccala', 'Portami un bel verme ciccione e il primo pesce che prendo è tuo. Parola di Baccalà.'); } },
            { id: 'bac_faro', text: 'Sa perché il faro è spento?', once: true, run: async () => {
              await g.npc('baccala', 'Chiedi alla Sindaca, in piazza. Io so solo che da quando è buio i pesci sono nervosi.');
              await g.npc('baccala', 'E che quel gabbiano lassù ha il nido pieno di roba luccicante.'); } },
            { id: 'bac_nome', text: 'Perché si chiama Baccalà?', once: true, run: async () => {
              await g.npc('baccala', 'Perché mi chiamo Baccalà. Mio padre si chiamava Stoccafisso. Tradizione di famiglia.'); } },
            { id: 'bac_ciao', text: 'Buona pesca!', end: true, run: async () => { await g.npc('baccala', 'Ssst!'); } },
          ]);
        },
        useWith: {
          async verme(g) {
            await g.say('Ecco un verme ciccione, come promesso. Si chiama Ugo.');
            g.remove('verme');
            await g.npc('baccala', 'Che bellezza! Guarda che roba. Fermo lì...');
            g.sfx('splash');
            await g.wait(0.8);
            await g.npc('baccala', 'ABBOCCATO! Ah ah! Tieni, ragazzo: promessa mantenuta.');
            g.set('pesce_avuto');
            g.add('pesce');
            await g.say('Grazie! Puzza un po\'.');
            await g.npc('baccala', 'Non è puzza. È carattere.');
          },
          galletta: (g) => g.npc('baccala', 'I pesci non mangiano gallette. Nemmeno io, se è per questo.'),
          pesce: (g) => g.npc('baccala', 'Tienilo, è tuo. Io i patti li rispetto.'),
        } },
      { id: 'barile', name: 'barile', rect: [203, 90, 22, 24], at: [214, 118],
        look: (g) => g.say(g.flag('galletta_presa') ? 'Un barile vuoto. Sa di biscotto vecchio.' : 'Un barile con scritto "PROVVISTE". Chissà cosa c\'è dentro.'),
        async open(g) {
          if (g.flag('galletta_presa')) { await g.say('Vuoto. Ho già preso l\'ultima galletta.'); return; }
          g.set('galletta_presa'); g.sfx('door');
          await g.say('Sul fondo c\'è una galletta da marinaio. Dura come un sasso!');
          g.add('galletta');
        },
        take: 'Troppo pesante. Ma potrei aprirlo.',
        use: (g) => rooms.molo.hotspots.find((h) => h.id === 'barile').open(g) },
      { id: 'gabbiano', name: 'gabbiano', rect: [242, 42, 22, 20], at: [254, 116], npc: true,
        look: (g) => g.say(g.flag('chiave_avuta') ? 'Il gabbiano Gino. Ha la pancia piena e l\'aria soddisfatta.' : 'Un gabbiano con il nido pieno di cose luccicanti: un cucchiaio, un bottone... e una CHIAVE!'),
        async talk(g) {
          if (g.flag('chiave_avuta')) { await g.npc('gabbiano', 'QUA. (Traduzione: "Ottimo fritto. Torna quando vuoi.")'); return; }
          await g.say('Ehi, gabbiano! Quella chiave non è tua!');
          await g.npc('gabbiano', 'QUA! (Traduzione: "Adesso sì. Ma faccio scambi, se porti qualcosa di buono da mangiare.")');
        },
        take: 'È troppo in alto. E becca.',
        useWith: {
          async pesce(g) {
            await g.say('Guarda che bel pesce fresco!');
            await g.npc('gabbiano', 'QUAK! (Traduzione: "Crudo? Mi hai preso per un pellicano? Io lo mangio solo FRITTO.")');
            await g.say('Un gabbiano schizzinoso. Mi mancava.');
          },
          async pesce_fritto(g) {
            await g.say('Pesce fritto, dorato e croccante. Scambio con la chiave?');
            g.remove('pesce_fritto');
            g.sfx('gull');
            await g.npc('gabbiano', 'QUAAA! (Traduzione: "AFFARE FATTO!")');
            g.set('chiave_avuta');
            g.add('chiave');
            await g.say('La chiave del faro! ...Bleah, è tutta sporca.');
          },
          galletta: (g) => g.npc('gabbiano', 'QUA. (Traduzione: "Secca. Passo.")'),
          verme: (g) => g.npc('gabbiano', 'QUA! (Traduzione: "Non sono mica una gallina.")'),
        } },
      { id: 'exit_spiaggia', name: 'spiaggia', rect: [0, 98, 10, 42], at: [9, 123], exit: { to: 'spiaggia', x: 304, y: 122 } },
      { id: 'exit_piazza', name: 'piazza', rect: [310, 98, 10, 42], at: [311, 123], exit: { to: 'piazza', x: 14, y: 122 } },
    ],
  };

  rooms.piazza = {
    name: 'La piazza', music: 'mare',
    walk: [[6, 108], [314, 108], [314, 136], [6, 136]], scale: [108, 0.85, 136, 1],
    hotspots: [
      { id: 'faro', name: 'faro', rect: [216, 2, 22, 32], at: [200, 112], look: 'Eccolo lassù. Buio. Sembra un gigante che dorme in piedi.' },
      { id: 'insegna', name: 'insegna', rect: [76, 34, 18, 18], at: [80, 112], look: 'L\'insegna dice "La Polpetta Bollente". Sotto, più in piccolo: "Si mangia. Forse."' },
      { id: 'fontana', name: 'fontana', rect: [112, 66, 32, 42], at: [128, 113],
        look: ['Una fontana con la statua di Capitan Barbacalzino, il pirata con la barba fatta di calzini.', 'Sulla targa c\'è scritto: "Il suo tesoro lo sa a memoria solo il suo pappagallo."'],
        use: 'Bevo un sorso. Sa di calzino.', take: 'La statua è cementata. E poi dove la metto?' },
      { id: 'bacheca', name: 'bacheca', rect: [186, 72, 16, 24], at: [194, 111],
        look: ['Vediamo gli avvisi...', '"CERCASI chiave del faro. Chi la trova la riporti al guardiano. Se è sveglio."', '"VENDESI olio per lampade. ESAURITO."', '"L\'Ammiraglio Parruccone recupera GRATIS i carichi delle navi naufragate. Che cuore!"'] },
      { id: 'sindaca', name: 'Sindaca Acciuga', rect: [86, 82, 18, 38], at: [116, 122], npc: true,
        look: 'La Sindaca Acciuga. Ha la fascia tricolore e due occhiaie da tre notti senza faro.',
        async talk(g) {
          if (g.flag('cap2')) {
            await g.npc('sindaca', 'Il faro è acceso! Sei un eroe, piccolo guardiano!');
            await g.dialog([
              { id: 'si2_nave', text: 'L\'Ammiraglio ha una nave nascosta!', run: async () => {
                await g.npc('sindaca', 'Nella Cala Nascosta, dietro il faro! Ecco dov\'erano finiti i nostri tesori.');
                await g.npc('sindaca', 'A bordo fanno salire solo la sua ciurma. Li riconosci: portano tutti la parrucca.'); } },
              { id: 'si2_aiuto', text: 'Mi manda qualcuno ad aiutarmi?', once: true, run: async () => {
                await g.npc('sindaca', 'Ho chiesto ai tre pirati della taverna. Hanno detto: "Domani".'); } },
              { id: 'si2_ciao', text: 'Ci penso io!', end: true, run: async () => { await g.npc('sindaca', 'Fai attenzione. E copriti, che in mare tira vento.'); } },
            ]);
            return;
          }
          await g.npc('sindaca', g.flag('sindaca_parlato') ? 'Novità sul faro, giovanotto?' : 'Oh, un forestiero! Benvenuto a Isola Pernacchia. Scusa il buio.');
          await g.dialog([
            { id: 'sin_faro', text: 'Perché il faro è spento?', run: async () => {
              g.set('sindaca_parlato');
              await g.npc('sindaca', 'Un disastro! Tre guai in tre notti.');
              await g.npc('sindaca', 'Primo: il guardiano ha perso la CHIAVE della porta.');
              await g.npc('sindaca', 'Secondo: qualcuno ha rubato la LENTE, il famoso Occhio del Kraken.');
              await g.npc('sindaca', 'Terzo: in tutta l\'isola è finito l\'OLIO per lampade.');
              await g.say('Chiave, lente e olio. Ci penso io!');
              await g.npc('sindaca', 'Tu? Ma se sei alto come un barile! ...Va bene. Peggio di così non può andare.'); } },
            { id: 'sin_amm', text: 'Chi è quel signore con la parrucca?', once: true, run: async () => {
              await g.npc('sindaca', "L'Ammiraglio Parruccone. È arrivato tre giorni fa, proprio quando si è spento il faro.");
              await g.npc('sindaca', 'Che coincidenza fortunata: recupera lui i carichi delle navi naufragate. Gratis!');
              await g.say('Mmm. Fortunata per chi?'); } },
            { id: 'sin_nome', text: 'Perché si chiama Isola Pernacchia?', once: true, run: async () => {
              await g.npc('sindaca', 'Per il vento che fischia tra gli scogli. Fa PRRRR tutta la notte.');
              await g.npc('sindaca', 'E un pochino anche per i fagioli della cuoca Peperina.'); } },
            { id: 'sin_guard', text: 'Dove trovo il guardiano?', once: true, if: (gg) => gg.flag('sindaca_parlato'), run: async () => {
              await g.npc('sindaca', 'Su per il sentiero, accanto al faro. Lo riconosci subito: è quello che russa.'); } },
            { id: 'sin_ciao', text: 'Torno al lavoro!', end: true, run: async () => { await g.npc('sindaca', 'Buona fortuna, piccolo guardiano.'); } },
          ]);
        } },
      { id: 'ammiraglio', name: 'Ammiraglio Parruccone', rect: [212, 78, 26, 42], at: [198, 124], npc: true, show: (g) => !g.flag('cristallo_preso'),
        look: 'Un omone con una giacca piena di bottoni d\'oro e una parrucca grande come una nuvola.',
        async talk(g) {
          await g.npc('ammiraglio', 'Sono l\'Ammiraglio Parruccone! Signore dei sette mari. E di una vasca da bagno.');
          await g.dialog([
            { id: 'amm_faro', text: 'Brutta storia, il faro spento.', run: async () => {
              await g.npc('ammiraglio', 'Una tragedia! Tutte quelle povere navi sugli scogli...');
              await g.npc('ammiraglio', 'Per fortuna ci sono IO a raccogliere i loro tesori. Per custodirli, s\'intende.'); } },
            { id: 'amm_parr', text: 'Bella parrucca.', once: true, run: async () => {
              await g.npc('ammiraglio', 'NON è una parrucca! Sono capelli veri.');
              await g.npc('ammiraglio', 'Di qualcun altro. Ma veri.'); } },
            { id: 'amm_aiuto', text: 'Io riaccenderò il faro!', once: true, run: async () => {
              await g.npc('ammiraglio', 'AH AH AH! Lascia perdere, moccioso. Quel faro non si accenderà MAI PIÙ.');
              await g.npc('ammiraglio', 'Ehm. Volevo dire: che peccato. Sigh. Sob.'); } },
            { id: 'amm_fame', text: 'Cosa le piace mangiare?', once: true, run: async () => {
              await g.npc('ammiraglio', 'TUTTO. Se è di qualcun altro, ancora di più.'); } },
            { id: 'amm_ciao', text: 'Arrivederci.', end: true, run: async () => { await g.npc('ammiraglio', 'Fila via. Mi fai ombra alla parrucca.'); } },
          ]);
        },
        take: 'Non mi entrerebbe in tasca nemmeno la sua parrucca.',
        useWith: {
          fagioli: (g) => g.say('Non qui in piazza, davanti a tutti. E poi non mi ha ancora fatto niente di male. Credo.'),
          dobloni: (g) => g.npc('ammiraglio', 'Dobloni? Dove li hai trovati?! ...Cioè, tienili pure, moccioso. Per ora.'),
        } },
      { id: 'porta_taverna', name: 'taverna', rect: [52, 70, 22, 36], at: [63, 110], exit: { to: 'taverna', x: 26, y: 120 }, look: 'La porta della taverna. Si sente profumo di sugo e russare di pirati.' },
      { id: 'porta_bottega', name: 'bottega', rect: [246, 70, 22, 36], at: [257, 110], exit: { to: 'bottega', x: 26, y: 120 }, look: 'La bottega di Madama Cianfrusaglia. In vetrina c\'è di tutto, soprattutto polvere.' },
      { id: 'sentiero', name: 'sentiero del faro', rect: [148, 54, 32, 52], at: [164, 110], exit: { to: 'faro_esterno', x: 22, y: 124 }, look: 'Un sentiero che sale fino al faro. Duecento gradini. Li ho contati con gli occhi.' },
      { id: 'exit_molo', name: 'molo', rect: [0, 98, 8, 42], at: [9, 123], exit: { to: 'molo', x: 304, y: 122 } },
    ],
  };

  rooms.taverna = {
    name: 'La Polpetta Bollente', music: 'taverna',
    walk: [[8, 106], [312, 106], [312, 136], [8, 136]], scale: [106, 0.9, 136, 1.05],
    hotspots: [
      { id: 'quadro', name: 'quadro', rect: [86, 28, 26, 30], at: [100, 108], look: ['Il ritratto di Capitan Barbacalzino.', 'Aveva una barba fatta di calzini spaiati. Un genio incompreso.'], take: 'È inchiodato. E mi fissa.' },
      { id: 'camino', name: 'camino', rect: [14, 42, 52, 62], at: [66, 112],
        look: 'Un bel fuoco scoppiettante con una padella appesa. Qui si frigge di tutto.',
        use: 'Per friggere mi serve qualcosa da friggere.', take: 'Il fuoco non si prende. Semmai è lui che prende te.',
        useWith: {
          async pesce(g) {
            g.sfx('fry');
            await g.say('Nella padella! Sfrigola che è una meraviglia...');
            await g.wait(0.8);
            g.swap('pesce', 'pesce_fritto');
            await g.say('Pesce fritto! Dorato, croccante e profumato.');
          },
          pesce_fritto: 'È già fritto al punto giusto. Un altro giro e diventa carbone.',
          async parrucca_bagnata(g) {
            await g.say('La stendo davanti al fuoco, come un calzino bagnato...');
            g.sfx('fry');
            await g.wait(0.8);
            g.swap('parrucca_bagnata', 'parrucca');
            g.sfx('pop');
            await g.narrate('PUFF!');
            await g.say('Asciutta! Si è gonfiata come un soufflé. Il gamberetto è scappato.');
          },
          parrucca: 'È già asciutta. Un altro po\' e diventa una torcia.',
          verme: 'No, povero Ugo!',
          galletta: 'Una galletta tostata resta una galletta. Solo più triste.',
          cocco: 'Il cocco arrosto non l\'ha ancora inventato nessuno. Ci sarà un motivo.',
          lanterna_piena: 'Infilare nel camino una lanterna piena d\'olio? Meglio i fiammiferi, che sono più educati.',
          fagioli: 'NO. Esplosivi vuol dire esplosivi.',
        } },
      { id: 'pirati', name: 'pirati pigri', rect: [120, 60, 74, 38], at: [156, 118], npc: true,
        look: 'Tre pirati che giocano a carte. Anzi: dormono con le carte in mano.',
        async talk(g) {
          await g.npc('pirati', 'Noi siamo la ciurma più temuta dei sette mari!');
          await g.npc('pirati', '...Ma oggi è il nostro giorno di riposo. Come ieri. E come domani.');
          await g.dialog([
            { id: 'pir_tesoro', text: 'Conoscete qualche tesoro?', run: async () => {
              await g.npc('pirati', 'Il tesoro di Capitan Barbacalzino! Sta in una grotta sulla spiaggia, dietro una porta di pietra.');
              await g.npc('pirati', 'Per aprirla ci vuole una filastrocca. La sapeva solo il suo pappagallo.');
              await g.npc('pirati', 'Che adesso vive nella bottega e non la dice a nessuno. Vuole sempre un biscotto.');
              await g.say('E voi non gliel\'avete mai portato, un biscotto?');
              await g.npc('pirati', 'Bisognava alzarsi.'); } },
            { id: 'pir_kraken', text: 'Cos\'è l\'Occhio del Kraken?', once: true, run: async () => {
              await g.npc('pirati', 'Un cristallo magico. Barbacalzino ne trovò DUE, gemelli.');
              await g.npc('pirati', 'Uno lo regalò al faro. L\'altro se lo tenne. Insieme alla sua dentiera d\'oro, che perdeva sempre.'); } },
            { id: 'pir_amm', text: 'Che ne pensate dell\'Ammiraglio?', once: true, run: async () => {
              await g.npc('pirati', 'Un pirata con la giacca stirata. Non ci fidiamo di chi ha la giacca stirata.'); } },
            { id: 'pir_aiuto', text: 'Mi aiutate a riaccendere il faro?', once: true, run: async () => {
              await g.npc('pirati', 'Volentieri!');
              await g.npc('pirati', 'Domani.'); } },
            { id: 'pir_nave', text: 'L\'Ammiraglio scappa con i tesori dell\'isola! Venite?', once: true, if: (gg) => gg.flag('cap2'), run: async () => {
              await g.npc('pirati', 'Con i tesori di Barbacalzino?! Questo è un affronto! Un oltraggio!');
              await g.npc('pirati', 'Lo fermeremo. Parola di pirata.');
              await g.npc('pirati', 'Domani.');
              await g.say('Me lo sentivo.'); } },
            { id: 'pir_ciao', text: 'Buon riposo.', end: true, run: async () => { await g.npc('pirati', 'Zzz...'); } },
          ]);
        },
        useWith: { galletta: (g) => g.npc('pirati', 'Per mangiarla bisogna masticare. Troppa fatica.'), dobloni: (g) => g.npc('pirati', 'Dobloni! Dovremmo rubarteli. Domani.') } },
      { id: 'pentolone', name: 'pentolone', rect: [228, 60, 24, 20], at: [238, 110],
        look: 'Un pentolone di fagioli che fa blub blub. Ogni tanto una bolla esplode con un piccolo PRRT.',
        take: 'La Peperina mi guarda malissimo. Meglio chiedere a lei.', use: 'La Peperina mi guarda malissimo. Meglio chiedere a lei.', open: 'È già aperto. Purtroppo.' },
      { id: 'manovella', name: 'manovella', rect: [290, 32, 12, 22], at: [286, 110], show: (g) => !g.flag('manovella_avuta'),
        look: 'Una manovella di ferro appesa al muro, tutta sporca di sugo.',
        take: (g) => g.npc('cuoca', 'Giù le mani dal mio mestolo gira-sugo! Se lo vuoi, parliamone.') },
      { id: 'cuoca', name: 'cuoca Peperina', rect: [250, 46, 24, 32], at: [262, 110], npc: true,
        look: 'La cuoca Peperina. Capelli rossi come il peperoncino, e pure il carattere.',
        async talk(g) {
          await g.npc('cuoca', 'Benvenuto alla Polpetta Bollente! Oggi il menù è: fagioli. Come sempre.');
          await g.dialog([
            { id: 'cuo_man', text: 'Mi serve quella manovella.', if: (gg) => !gg.flag('manovella_avuta'), run: async () => {
              g.set('cuoca_parlato');
              await g.npc('cuoca', 'Il mio mestolo gira-sugo? Me l\'ha prestato il guardiano del faro, e funziona benissimo.');
              await g.npc('cuoca', 'Te lo do solo in cambio dell\'ingrediente segreto per la mia zuppa: una NOCE DI COCCO.');
              await g.npc('cuoca', 'Ce n\'è una sola su tutta l\'isola, in cima alla palma storta. E io soffro di vertigini.'); } },
            { id: 'cuo_fag', text: 'Cosa c\'è nel pentolone?', once: true, run: async () => {
              await g.npc('cuoca', 'Fagioli Esplosivi della Peperina! Ricetta di famiglia.');
              await g.npc('cuoca', 'Un cucchiaio e voli fino alla luna. Non adatti ai bambini. Né ai tipi prepotenti.'); } },
            { id: 'cuo_fuoco', text: 'Posso usare il camino?', once: true, run: async () => {
              await g.npc('cuoca', 'Friggi quello che vuoi, tesoro. Basta che dopo non mi lasci la padella sporca.'); } },
            { id: 'cuo_ciao', text: 'A dopo!', end: true, run: async () => { await g.npc('cuoca', 'E mangia qualcosa, che sei tutto ossa!'); } },
          ]);
        },
        useWith: {
          async cocco(g) {
            await g.say('Una noce di cocco, appena caduta. Sulla mia testa.');
            g.remove('cocco');
            await g.npc('cuoca', 'L\'INGREDIENTE SEGRETO! Finalmente la zuppa perfetta!');
            g.set('manovella_avuta');
            g.add('manovella');
            await g.npc('cuoca', 'Tieni la manovella, un patto è un patto. E prendi anche questi, omaggio della casa.');
            g.add('fagioli');
            await g.say('Fagioli Esplosivi?');
            await g.npc('cuoca', 'Non mangiarli, per carità. Ma se incontri un prepotente affamato... sai cosa fare.');
          },
          pesce: (g) => g.npc('cuoca', 'Il camino è lì, tesoro. Qui ognuno si frigge il suo.'),
          pesce_fritto: (g) => g.npc('cuoca', 'Bella frittura! Quasi quasi ti assumo.'),
          galletta: (g) => g.npc('cuoca', 'Quella roba non entra nella mia cucina.'),
          dobloni: (g) => g.npc('cuoca', 'Qui non si paga. Si porta il cocco.'),
        } },
      { id: 'exit', name: 'piazza', rect: [0, 48, 12, 58], at: [12, 120], exit: { to: 'piazza', x: 63, y: 113 } },
    ],
  };

  rooms.bottega = {
    name: 'La bottega di Madama Cianfrusaglia', music: 'taverna',
    walk: [[8, 106], [312, 106], [312, 136], [8, 136]], scale: [106, 0.9, 136, 1.05],
    hotspots: [
      { id: 'scaffali', name: 'scaffali', rect: [60, 12, 252, 56], at: [150, 110], look: 'Scaffali pieni di cianfrusaglie: ancore, mappamondi, una gamba di legno usata, un polpo impagliato...', take: 'Madama Cianfrusaglia ha sei occhi. Due suoi e quattro del polpo impagliato.' },
      { id: 'pesce_palla', name: 'pesce palla impagliato', rect: [52, 12, 18, 16], at: [70, 110], look: 'Un pesce palla impagliato appeso al soffitto. Ha la stessa espressione dell\'Ammiraglio.', take: 'Punge solo a guardarlo.' },
      { id: 'sfera', name: 'sfera di cristallo', rect: [185, 64, 12, 14], at: [196, 110], look: 'Una sfera di cristallo. Dentro vedo... la mia faccia. Storta.', take: (g) => g.npc('madama', 'Quella non è in vendita. Mi serve per sapere chi entra senza comprare.') },
      { id: 'olio', name: 'olio per lampade', rect: [173, 36, 13, 18], at: [182, 110], show: (g) => !g.flag('olio_comprato'),
        look: 'Una bottiglia di olio per lampade. Cartellino: 3 dobloni.', take: buyOil, use: buyOil },
      { id: 'fiammiferi', name: 'fiammiferi', rect: [266, 70, 14, 10], at: [262, 110], show: (g) => !g.flag('fiammiferi_comprati'),
        look: 'Una scatola di fiammiferi sul bancone. Cartellino: 2 dobloni.', take: buyMatches, use: buyMatches },
      { id: 'pappagallo', name: 'pappagallo Cocò', rect: [98, 42, 22, 24], at: [130, 114], npc: true,
        look: 'Un pappagallo verde e rosso molto, molto vecchio. Sul trespolo c\'è scritto: "Cocò, ex pirata".',
        async talk(g) {
          if (g.flag('filastrocca')) { await g.npc('pappagallo', 'CRAAA! Prima il PESCE che fa glu glu! Poi la LUNA che sta lassù! Poi il TESCHIO... e la porta non c\'è più!'); return; }
          await g.npc('pappagallo', 'CRAAA! Cocò sa un segreto! Cocò sa una filastrocca!');
          await g.say('Me la dici?');
          await g.npc('pappagallo', 'Cocò vuole un BISCOTTO! Niente biscotto, niente filastrocca! CRAAA!');
        },
        take: 'Mi ha quasi staccato un dito.',
        useWith: {
          async galletta(g) {
            await g.say('Ecco un biscotto. Più o meno.');
            g.remove('galletta');
            g.sfx('crunch');
            await g.npc('pappagallo', 'CRUNCH! CRUNCH! Buona! Dura al punto giusto! CRAAA!');
            await g.npc('pappagallo', 'La filastrocca di Capitan Barbacalzino:');
            await g.npc('pappagallo', 'Prima il PESCE che fa glu glu...');
            await g.npc('pappagallo', '...poi la LUNA che sta lassù...');
            await g.npc('pappagallo', '...poi il TESCHIO, e la porta non c\'è più! CRAAA!');
            g.set('filastrocca');
            await g.say('Pesce, luna, teschio. Sono i simboli sulla porta di pietra!');
          },
          pesce: (g) => g.npc('pappagallo', 'CRAAA! Cocò non è un gabbiano! Che maleducato!'),
          verme: (g) => g.npc('pappagallo', 'BLEAH! Cocò è un pappagallo di classe!'),
          cocco: (g) => g.npc('pappagallo', 'Troppo grosso! Cocò vuole un BISCOTTO!'),
        } },
      { id: 'madama', name: 'Madama Cianfrusaglia', rect: [218, 48, 26, 32], at: [214, 110], npc: true,
        look: 'Madama Cianfrusaglia: turbante viola, orecchini grandi come ancore e sguardo da affarista.',
        async talk(g) {
          await g.npc('madama', 'Benvenuto, tesoro! Qui trovi tutto quello che non ti serve. E qualcosa che ti serve.');
          await g.dialog([
            { id: 'mad_olio', text: 'Vorrei l\'olio per lampade.', silent: false, if: (gg) => !gg.flag('olio_comprato'), run: buyOil },
            { id: 'mad_fiam', text: 'Vorrei i fiammiferi.', if: (gg) => !gg.flag('fiammiferi_comprati'), run: buyMatches },
            { id: 'mad_fine', text: 'Come mai l\'olio è finito in tutta l\'isola?', once: true, run: async () => {
              await g.npc('madama', 'Tre giorni fa l\'Ammiraglio Parruccone me l\'ha comprato TUTTO. Venti casse!');
              await g.npc('madama', 'Tutto tranne una bottiglia, che tenevo nascosta per le emergenze. E per i clienti simpatici.'); } },
            { id: 'mad_sfera', text: 'Cosa vede nella sfera di cristallo?', once: true, run: async () => {
              await g.npc('madama', 'Vedo... vedo... un ragazzino che fa tante domande e compra poco.'); } },
            { id: 'mad_soldi', text: 'Dove trovo dei dobloni?', once: true, run: async () => {
              await g.npc('madama', 'Su quest\'isola? Sottoterra, tesoro. I pirati di una volta seppellivano tutto.');
              await g.npc('madama', 'Ogni tanto il mare porta a riva una bottiglia con una mappa. Tieni gli occhi aperti in spiaggia.'); } },
            { id: 'mad_ciao', text: 'Arrivederci, Madama.', end: true, run: async () => { await g.npc('madama', 'Torna presto. E porta dobloni.'); } },
          ]);
        },
        useWith: {
          dobloni: (g) => g.npc('madama', 'Dimmi cosa vuoi comprare, tesoro, e i dobloni li prendo io.'),
          dentiera: (g) => g.npc('madama', 'Una dentiera d\'oro! Te la pago bene... No? Peccato. Con quella aprirei qualsiasi sorriso.'),
        } },
      { id: 'exit', name: 'piazza', rect: [0, 48, 12, 58], at: [12, 120], exit: { to: 'piazza', x: 257, y: 113 } },
    ],
  };

  rooms.spiaggia = {
    name: 'La spiaggia', music: 'mare',
    walk: [[40, 108], [314, 104], [314, 136], [30, 136]], scale: [104, 0.85, 136, 1],
    hotspots: [
      { id: 'mare', name: 'mare', rect: [76, 62, 244, 26], at: [200, 108], look: 'Il mare al tramonto. Bellissimo. Peccato per tutti quegli scogli al buio.', use: 'Ho già fatto il bagno. Un mese fa.' },
      { id: 'relitto', name: 'relitto', rect: [102, 42, 40, 24], at: [124, 108], look: 'Una nave finita sugli scogli. Ecco cosa succede quando un faro si spegne.' },
      { id: 'porta_grotta', name: (g) => (g.flag('grotta_aperta') ? 'grotta' : 'porta di pietra'), rect: [20, 56, 34, 50], at: [46, 113],
        exit: { to: 'grotta', x: 30, y: 122 },
        look: (g) => g.say(g.flag('grotta_aperta') ? 'La grotta di Capitan Barbacalzino. Dentro è buio pesto.' : 'Una porta di pietra nella scogliera. Di fianco ci sono tre simboli: un pesce, una luna e un teschio.'),
        async canExit(g) {
          if (!g.flag('grotta_aperta')) { await g.say('È chiusa. Niente maniglia, niente serratura: solo quei tre simboli di fianco.'); return false; }
          if (!g.has('lanterna_accesa')) { await g.say('Lì dentro è buio pesto. Senza una luce accesa non ci entro nemmeno per un tesoro.'); return false; }
          return true;
        },
        useWith: { pala: 'Scavare la pietra con una pala? Ci metterei cent\'anni.', chiave: 'Non c\'è nessuna serratura.' } },
      { id: 'simbolo_pesce', name: 'simbolo del pesce', rect: [58, 58, 12, 12], at: [72, 113], look: 'Un pesce scolpito nella pietra. Si può premere.', use: (g) => pressSymbol(g, 'P'), open: (g) => pressSymbol(g, 'P'), take: 'È scolpito nella roccia. Però si può premere.' },
      { id: 'simbolo_luna', name: 'simbolo della luna', rect: [58, 71, 12, 12], at: [72, 113], look: 'Una luna scolpita nella pietra. Si può premere.', use: (g) => pressSymbol(g, 'L'), open: (g) => pressSymbol(g, 'L'), take: 'È scolpita nella roccia. Però si può premere.' },
      { id: 'simbolo_teschio', name: 'simbolo del teschio', rect: [58, 84, 12, 12], at: [72, 113], look: 'Un teschio scolpito nella pietra. Sorride. Si può premere.', use: (g) => pressSymbol(g, 'T'), open: (g) => pressSymbol(g, 'T'), take: 'È scolpito nella roccia. Però si può premere.' },
      { id: 'sasso', name: 'sasso', rect: [126, 104, 28, 14], at: [158, 122],
        look: (g) => g.say(g.flag('sasso_spostato') ? 'Un sasso. Sotto non c\'è più nessuno.' : 'Un grosso sasso piatto. Da sotto spunta qualcosa che si muove...'),
        async take(g) {
          if (g.flag('sasso_spostato')) { await g.say('L\'ho già spostato. Una volta basta e avanza.'); return; }
          g.set('sasso_spostato'); g.sfx('rumble');
          await g.say('Uff... spostato! E sotto c\'è un verme bello ciccione!');
          g.add('verme');
        },
        use: (g) => rooms.spiaggia.hotspots.find((h) => h.id === 'sasso').take(g),
        open: (g) => rooms.spiaggia.hotspots.find((h) => h.id === 'sasso').take(g),
        useWith: { pala: (g) => rooms.spiaggia.hotspots.find((h) => h.id === 'sasso').take(g) } },
      { id: 'bottiglia', name: 'bottiglia', rect: [175, 88, 14, 12], at: [182, 108], pick: true, show: (g) => !g.flag('bottiglia_presa'),
        look: 'Una bottiglia che galleggia vicino alla riva. Dentro c\'è qualcosa!',
        async take(g) { g.set('bottiglia_presa'); g.sfx('splash'); g.add('bottiglia'); await g.say('Presa! C\'è un messaggio dentro. Devo aprirla.'); } },
      { id: 'palma', name: 'palma storta', rect: [216, 46, 44, 74], at: [222, 124],
        look: (g) => g.say(g.flag('cocco_caduto') ? 'La palma storta. Senza più noci di cocco.' : 'Una palma tutta storta. In cima c\'è una sola noce di cocco.'),
        take: 'Una palma intera? Ho le tasche grandi, ma non così.',
        use: (g) => g.say(g.flag('cocco_caduto') ? 'Ha già dato tutto quello che aveva.' : 'La scuoto con le mani... niente. Mi serve qualcosa di lungo e robusto.'),
        useWith: {
          async pala(g) {
            if (g.flag('cocco_caduto')) { await g.say('Non c\'è più niente lassù. Lasciamo in pace la palma.'); return; }
            await g.say('Una bella botta al tronco con la pala...');
            g.sfx('bonk');
            g.set('cocco_caduto');
            await g.narrate('TONK!');
            await g.say('AHIA! Dritta sulla testa! ...Però ho una noce di cocco.');
            g.add('cocco');
          },
        } },
      { id: 'x_segno', name: (g) => (g.flag('scavato') ? 'buca' : 'X sulla sabbia'), rect: [262, 119, 18, 13], at: [258, 126], show: (g) => g.flag('mappa_letta'),
        look: (g) => g.say(g.flag('scavato') ? 'Una buca vuota. Il tesoro ormai è nelle mie tasche.' : "L'ombra della palma fa una X proprio qui. Come dice la mappa!"),
        take: (g) => g.say(g.flag('scavato') ? 'Una buca non si porta via.' : 'Scavare con le mani? Mi serve una pala.'),
        use: (g) => g.say(g.flag('scavato') ? 'Ho già scavato.' : 'Scavare con le mani? Mi serve una pala.'),
        useWith: {
          async pala(g) {
            if (g.flag('scavato')) { await g.say('Ho già scavato. Sotto c\'è solo altra sabbia.'); return; }
            g.sfx('dig');
            await g.say('Scavo... scavo... scavo...');
            g.sfx('dig');
            await g.wait(0.6);
            g.set('scavato');
            await g.say('TOC! Uno scrigno piccolo piccolo!');
            g.set('dobloni', 5);
            g.sfx('coin');
            g.add('dobloni');
            g.add('dentiera');
            await g.say('Dentro ci sono 5 dobloni d\'oro e... una DENTIERA D\'ORO?!');
            await g.say('I pirati di una volta erano strani.');
          },
        } },
      { id: 'granchio', name: 'granchio', rect: [92, 123, 32, 11], at: [108, 126], npc: true,
        look: 'Un granchio che cammina di lato. Sembra molto impegnato.',
        talk: ['Buonasera, signor granchio.', '...Clac clac. O è timido, o non parla la mia lingua.'],
        take: 'AHI! Pizzica! Lasciamolo dov\'è.',
        useWith: { verme: 'Ugo ha già abbastanza problemi.', galletta: 'L\'ha assaggiata e ha fatto una faccia... Anche i granchi hanno dei gusti.' } },
      { id: 'exit_molo', name: 'molo', rect: [310, 98, 10, 42], at: [311, 123], exit: { to: 'molo', x: 14, y: 122 } },
    ],
  };

  rooms.grotta = {
    name: 'La grotta di Barbacalzino', music: 'grotta',
    walk: [[12, 108], [300, 108], [300, 136], [12, 136]], scale: [108, 0.9, 136, 1.05],
    async enter(g) {
      if (g.flag('grotta_vista')) return;
      g.set('grotta_vista');
      await g.say('Wow. La grotta segreta di Capitan Barbacalzino!');
      await g.say('E quello laggiù... dev\'essere proprio lui. O quello che ne resta.');
    },
    hotspots: [
      { id: 'stalattiti', name: 'stalattiti', rect: [60, 0, 200, 30], at: [150, 112], look: 'Stalattiti. O stalagmiti? Quelle che pendono dall\'alto, insomma.' },
      { id: 'cristallini', name: 'cristallini', rect: [268, 58, 32, 34], at: [272, 112], look: 'Piccoli cristalli azzurri che brillano nel buio. Bellissimi, ma troppo piccoli per un faro.', take: 'Sono incastrati nella roccia. E poi mi serve quello grosso.' },
      { id: 'scheletro', name: 'scheletro di Barbacalzino', rect: [186, 62, 28, 44], at: [182, 120], npc: true,
        look: (g) => g.say(g.flag('scrigno_aperto') ? 'Capitan Barbacalzino. Con la dentiera d\'oro ha tutto un altro sorriso.' : 'Lo scheletro di Capitan Barbacalzino, con la barba di calzini e una mano sullo scrigno. Gli mancano tutti i denti.'),
        talk: (g) => g.say(g.flag('scrigno_aperto') ? 'Grazie del cristallo, Capitano. Ne farò buon uso!' : 'Capitano? ...Non risponde. Forse perché non ha i denti. O perché è uno scheletro.'),
        take: 'Porto rispetto ai capitani. Soprattutto a quelli così magri.',
        useWith: {
          async dentiera(g) {
            if (g.flag('scrigno_aperto')) return;
            await g.say('Capitano, credo che questa sia sua.');
            g.remove('dentiera');
            g.sfx('click');
            await g.wait(0.4);
            g.sfx('clack');
            await g.npc('scheletro', 'CLAC! CLAC! CLAC!');
            g.set('scrigno_aperto');
            g.sfx('door');
            await g.say('La mascella ha fatto scattare la mano... e la mano ha aperto lo scrigno!');
            await g.say('Dentro c\'è un cristallo ENORME!');
          },
          galletta: 'Senza denti non può mangiarla. E nemmeno con.',
          dobloni: 'Sono già suoi, a pensarci bene. Meglio non ricordarglielo.',
        } },
      { id: 'scrigno', name: 'scrigno', rect: [216, 84, 38, 22], at: [204, 122],
        look: (g) => g.say(g.flag('scrigno_aperto') ? (g.flag('cristallo_preso') ? 'Lo scrigno è vuoto. C\'è solo un calzino spaiato.' : 'Lo scrigno è aperto. Dentro brilla un cristallo enorme!') : 'Uno scrigno robusto. Lo scheletro ci tiene sopra la mano: non si apre.'),
        open: (g) => g.say(g.flag('scrigno_aperto') ? 'È già aperto.' : 'Non si apre: la mano dello scheletro lo tiene chiuso. Stringe ancora forte, il Capitano!'),
        take: 'Troppo pesante. Mi interessa quello che c\'è dentro.',
        useWith: { pala: 'Non voglio fare leva sul Capitano. Porta sfortuna.', chiave: 'Non ha serratura. Lo tiene chiuso la mano dello scheletro.' } },
      { id: 'cristallo', name: 'Occhio del Kraken', rect: [224, 76, 18, 14], at: [204, 122], pick: true, show: (g) => g.flag('scrigno_aperto') && !g.flag('cristallo_preso'),
        look: 'Il gemello dell\'Occhio del Kraken! Con questo il faro tornerebbe a brillare.',
        async take(g) {
          g.set('cristallo_preso');
          g.sfx('fanfare');
          g.add('cristallo');
          await g.say('L\'Occhio del Kraken! La lente perfetta per il faro!');
          await g.say('Grazie, Capitano. Glielo riporto appena... ehm. Vedremo.');
        } },
      { id: 'exit', name: 'spiaggia', rect: [0, 48, 14, 62], at: [14, 122], exit: { to: 'spiaggia', x: 50, y: 114 } },
    ],
  };

  rooms.faro_esterno = {
    name: 'Ai piedi del faro', music: 'mare',
    walk: [[6, 108], [300, 108], [300, 136], [6, 136]], scale: [108, 0.85, 136, 1],
    hotspots: [
      { id: 'paese', name: 'paese', rect: [4, 74, 92, 24], at: [50, 112], look: 'Da quassù si vede tutto il paese. Tre case, una fontana e una taverna. Fine del paese.' },
      { id: 'torre', name: 'faro', rect: [204, 0, 56, 70], at: [200, 112], look: 'Visto da vicino è altissimo. A righe bianche e rosse, come un calzino gigante.' },
      { id: 'orto', name: 'aiuola', rect: [58, 104, 44, 14], at: [80, 118], look: 'L\'aiuola del guardiano. Ci crescono solo fiori che non hanno bisogno di cure.', take: 'Lasciamo stare i fiori.',
        useWith: { pala: 'Qui non c\'è niente da scavare, a parte le radici dei fiori.' } },
      { id: 'pala', name: 'pala', rect: [79, 90, 12, 24], at: [94, 116], pick: true, show: (g) => !g.flag('pala_presa'),
        look: 'Una pala piantata nell\'aiuola. Ha le ragnatele: nessuno la usa da un pezzo.',
        async take(g) {
          if (!g.flag('pala_ok')) { await g.say('È del tizio che russa. Meglio chiedergli il permesso, prima.'); return; }
          g.set('pala_presa'); g.add('pala');
          await g.say('Una pala tutta mia! In prestito.');
        } },
      { id: 'sbadiglio', name: 'guardiano Sbadiglio', rect: [140, 78, 44, 22], at: [162, 114], npc: true,
        look: 'Il guardiano del faro, sdraiato sull\'amaca con il berretto sugli occhi. Russa come una sega.',
        async talk(g) {
          if (g.flag('cap2')) {
            await g.npc('sbadiglio', 'Yaaawn... chi ha acceso la luce? Non si riesce più a dormire, qui.');
            await g.dialog([
              { id: 'sba_tisana', text: 'Come fa a dormire sempre così bene?', if: (gg) => !gg.flag('tisana_avuta'), run: async () => {
                await g.npc('sbadiglio', 'Il segreto è la Tisana Sonnobello di mia nonna. Una goccia e dormi fino a giovedì.');
                await g.npc('sbadiglio', 'Prendi, ne ho una cassa. Ma non darla a chi deve lavorare.');
                g.set('tisana_avuta');
                g.add('tisana');
                await g.say('A chi deve lavorare no. A chi deve smettere di fare danni, magari sì.'); } },
              { id: 'sba_cala', text: 'Cosa c\'è oltre il faro?', once: true, run: async () => {
                await g.npc('sbadiglio', 'La Cala Nascosta. Si chiama così perché è nascosta. Ci si arriva dal sentierino qui a destra.'); } },
              { id: 'sba_ciao2', text: 'Dorma pure.', end: true, run: async () => { await g.npc('sbadiglio', 'Con questa luce? Ci provo. Zzz.'); } },
            ]);
            return;
          }
          if (!g.flag('sbadiglio_parlato')) {
            await g.say('Signor guardiano? SIGNOR GUARDIANO!');
            await g.npc('sbadiglio', 'Zzz... eh? Chi è? È già mattina?');
            await g.say('Sono Fili. Voglio riaccendere il faro!');
            await g.npc('sbadiglio', 'Ah, il faro. Yaaawn. Auguri.');
            g.set('sbadiglio_parlato');
          } else {
            await g.npc('sbadiglio', 'Yaaawn... ancora tu?');
          }
          await g.dialog([
            { id: 'sba_chiave', text: 'Dov\'è finita la chiave?', run: async () => {
              await g.npc('sbadiglio', 'Dormivo qui, con la chiave appesa alla cintura. È arrivato un gabbiano e ZAC.');
              await g.npc('sbadiglio', 'Vive sul palo più alto del molo. Gli piacciono le cose luccicanti. E il pesce fritto.'); } },
            { id: 'sba_lente', text: 'E la lente?', once: true, run: async () => {
              await g.npc('sbadiglio', 'L\'Occhio del Kraken. Sparito due notti fa mentre... riposavo gli occhi.');
              await g.npc('sbadiglio', 'Dicono che ne esista un gemello, nella grotta del vecchio Barbacalzino. Ma chi ha voglia di cercarlo?'); } },
            { id: 'sba_pala', text: 'Posso prendere la pala?', if: (gg) => !gg.flag('pala_presa'), run: async () => {
              g.set('pala_ok');
              await g.npc('sbadiglio', 'Prendila pure. Scavare stanca. Anche solo guardarla, stanca.'); } },
            { id: 'sba_mecc', text: 'Come si sale in cima al faro?', once: true, run: async () => {
              await g.npc('sbadiglio', 'Dentro c\'è una botola. Si apre con il meccanismo, girando la manovella.');
              await g.npc('sbadiglio', 'Che però ho prestato alla Peperina. Ci gira il sugo. Yaaawn.'); } },
            { id: 'sba_ciao', text: 'Torni pure a dormire.', end: true, run: async () => { await g.npc('sbadiglio', 'Era quello che stavo... Zzz.'); } },
          ]);
        },
        take: 'Con tutta l\'amaca? Pesa come un tricheco.',
        useWith: {
          chiave: (g) => g.npc('sbadiglio', 'Zzz... la mia chiave... usala tu, ragazzo. Io sono occupato. Zzz.'),
          fagioli: 'Se si sveglia per davvero poi mi tocca lavorare con lui. No grazie.',
          cristallo: (g) => g.npc('sbadiglio', 'Zzz... che bella lucina... montala tu, lassù in cima. Zzz.'),
        } },
      { id: 'porta_faro', name: 'porta del faro', rect: [220, 72, 20, 34], at: [230, 110],
        exit: { to: 'faro_interno', x: 26, y: 122 },
        look: (g) => g.say(g.flag('porta_faro_aperta') ? 'La porta del faro è aperta.' : 'Una porta di legno massiccio, chiusa a chiave. La serratura ha la forma di un piccolo faro.'),
        async canExit(g) {
          if (g.flag('porta_faro_aperta')) return true;
          await g.say('Chiusa a chiave. E il guardiano la chiave non ce l\'ha più.');
          return false;
        },
        useWith: {
          async chiave(g) {
            if (g.flag('porta_faro_aperta')) { await g.say('È già aperta.'); return; }
            g.sfx('click');
            g.set('porta_faro_aperta');
            g.remove('chiave');
            g.sfx('door');
            await g.say('CLAC! La porta del faro è aperta! La chiave la lascio nella serratura.');
          },
          pala: 'Sfondare la porta di un faro con una pala? Sono un guardiano, non un vandalo.',
        } },
      { id: 'sentiero_cala', name: 'sentierino per la cala', rect: [292, 92, 28, 48], at: [298, 124], show: (g) => g.flag('cap2'),
        exit: { to: 'cala', x: 22, y: 122 }, look: 'Un sentierino tra i cespugli che scende dietro il faro. Con il faro spento non si vedeva nemmeno.' },
      { id: 'exit', name: 'piazza', rect: [0, 98, 8, 42], at: [9, 124], exit: { to: 'piazza', x: 164, y: 113 } },
    ],
  };

  rooms.faro_interno = {
    name: 'Dentro il faro', music: 'faro',
    walk: [[10, 108], [304, 108], [304, 136], [10, 136]], scale: [108, 0.9, 136, 1.05],
    hotspots: [
      { id: 'barili', name: 'barili', rect: [26, 80, 32, 28], at: [48, 112], look: 'Barili con scritto "OLIO". Tutti vuoti. Qualcuno ha fatto piazza pulita.', open: 'Vuoti. Non c\'è nemmeno una goccia.' },
      { id: 'meccanismo', name: 'meccanismo', rect: [98, 40, 78, 66], at: [136, 112],
        look: (g) => g.say(g.flag('botola_aperta') ? 'Gli ingranaggi hanno fatto il loro dovere: la botola lassù è aperta.' : 'Un grande meccanismo a ingranaggi. Al centro c\'è un buco quadrato, proprio della misura di una manovella.'),
        use: (g) => g.say(g.flag('botola_aperta') ? 'Ha già funzionato. Meglio non toccare.' : 'Provo a girare gli ingranaggi a mano... Macché. Ci vuole la manovella.'),
        useWith: {
          async manovella(g) {
            if (g.flag('botola_aperta')) return;
            await g.say('La manovella entra giusta giusta. Giro!');
            g.remove('manovella');
            g.sfx('gears');
            await g.narrate('CLANK! CLANK! CLANK!');
            g.set('botola_aperta');
            await g.say('La botola in cima alle scale si è aperta!');
          },
          pala: 'Una pala negli ingranaggi? Poi chi lo sente il guardiano. Quando si sveglia.',
        } },
      { id: 'scale', name: 'scale', rect: [226, 12, 74, 94], at: [238, 110],
        exit: { to: 'faro_cima', x: 44, y: 124 },
        look: 'Una scala a chiocciola che sale, sale, sale...',
        async canExit(g) {
          if (g.flag('botola_aperta')) return true;
          await g.say('Salgo... 198, 199, 200 gradini... e la botola in cima è chiusa. Si apre dal meccanismo, giù.');
          return false;
        } },
      { id: 'exit', name: 'uscita', rect: [0, 48, 12, 58], at: [12, 122], exit: { to: 'faro_esterno', x: 230, y: 113 } },
    ],
  };

  rooms.faro_cima = {
    name: 'In cima al faro', music: 'faro',
    walk: [[14, 108], [306, 108], [306, 136], [14, 136]], scale: [108, 0.9, 136, 1.05],
    async enter(g) {
      if (g.flag('cima_vista')) return;
      g.set('cima_vista');
      await g.say('Che vista! Da quassù si vede tutto il mare. E tutti gli scogli.');
      await g.say('Ecco la grande lampada. Manca la lente, e il serbatoio dell\'olio è a secco.');
    },
    hotspots: [
      { id: 'finestre', name: 'vetrate', rect: [0, 0, 320, 82], at: [160, 112], look: (g) => g.say(g.flag('ammiraglio_volato') ? 'In una vetrata c\'è un buco a forma di ammiraglio.' : 'Vetrate tutto intorno. Si vedono le stelle, il mare e un sacco di buio.') },
      { id: 'finestra', name: 'buco nella vetrata', rect: [262, 20, 40, 50], at: [270, 112], show: (g) => g.flag('ammiraglio_volato'), look: 'Un buco a forma di ammiraglio. Con tanto di parrucca.' },
      { id: 'lampada', name: 'lampada del faro', rect: [138, 26, 44, 80], at: [128, 116],
        look: (g) => g.say(
          g.flag('lente_montata') && g.flag('olio_versato') ? 'Lente montata, olio versato. Manca solo una fiammella!'
            : g.flag('lente_montata') ? 'La lente è al suo posto. Manca l\'olio nel serbatoio.'
              : g.flag('olio_versato') ? 'Il serbatoio è pieno. Manca la lente.'
                : 'La grande lampada del faro. Senza lente e senza olio è solo un trespolo per gabbiani.'),
        use: 'Per accenderla mi servono la lente, l\'olio e una fiammella.',
        useWith: {
          async cristallo(g) {
            g.sfx('click');
            g.remove('cristallo');
            g.set('lente_montata');
            await g.say('L\'Occhio del Kraken entra perfettamente nel suo sostegno. Che spettacolo!');
          },
          async olio(g) {
            if (g.flag('olio_versato')) { await g.say('Il serbatoio è già pieno.'); return; }
            g.sfx('pour');
            g.remove('olio');
            g.set('olio_versato');
            await g.say('Glu glu glu glu... Serbatoio pieno fino all\'orlo!');
          },
          fiammiferi: lightTheLamp,
          lanterna_accesa: 'La fiamma della lanterna è chiusa dietro il vetro. Meglio un fiammifero.',
        } },
      { id: 'ammiraglio', name: 'Ammiraglio Parruccone', rect: [186, 60, 28, 48], at: [226, 122], npc: true, show: (g) => g.flag('ammiraglio_arrivato') && !g.flag('ammiraglio_volato'),
        look: 'L\'Ammiraglio Parruccone, piantato davanti alla lampada come uno scoglio. Uno scoglio con la parrucca.',
        async talk(g) {
          await g.npc('ammiraglio', 'Sei ancora qui, moccioso?');
          await g.dialog([
            { id: 'am2_arr', text: 'Si arrenda, Ammiraglio!', run: async () => { await g.npc('ammiraglio', 'MAI! Un Parruccone non si arrende. Al massimo si pettina.'); } },
            { id: 'am2_parr', text: 'Le si è storta la parrucca.', once: true, run: async () => {
              await g.npc('ammiraglio', 'Dove?! ...Non ci casco. E NON è una parrucca.'); } },
            { id: 'am2_fame', text: 'Sarà stanco, dopo tutto quel rubare.', once: true, run: async () => {
              await g.npc('ammiraglio', 'Stanco e AFFAMATO. Rubare mette un appetito...');
              await g.npc('ammiraglio', 'Se hai qualcosa da mangiare, dammelo. Subito. È un ordine.'); } },
            { id: 'am2_ciao', text: 'Aspetti lì, torno subito.', end: true, run: async () => { await g.npc('ammiraglio', 'Io non mi muovo. Ho messo radici.'); } },
          ]);
        },
        take: 'Nemmeno con dieci pale.',
        useWith: {
          fagioli: feedAdmiral,
          galletta: (g) => g.npc('ammiraglio', 'Una galletta secca? A ME? Io mangio solo roba calda e saporita.'),
          pesce_fritto: (g) => g.npc('ammiraglio', 'Gnam. Buono. Ancora! ...Non ne hai più? Allora resto qui.'),
          dobloni: (g) => g.npc('ammiraglio', 'Quattro monetine? Io voglio i tesori di TUTTE le navi.'),
          pala: 'Una palata a un ammiraglio? Mi arrestano. E poi è troppo alto.',
          fiammiferi: 'Me li spegne tutti con un soffio. Ha due polmoni come due vele.',
        } },
      { id: 'botola', name: 'botola', rect: [20, 112, 32, 14], at: [44, 124], exit: { to: 'faro_interno', x: 238, y: 113 }, look: 'La botola per scendere. Duecento gradini. Li conosco tutti per nome.' },
    ],
  };

  // ================= CHAPTER 2: the black ship =================
  async function finale(g) {
    await g.say('Ho la lente e il cannone è a mollo. Via di qui, prima che si svegli!');
    await g.goto('cala', 250, 120);
    g.sfx('boss');
    await g.npc('capitano', 'LA MIA LENTE! Chi ha preso la mia lente?! E chi mi ha messo a letto?!');
    await g.npc('capitano', 'CIURMA! FUOCO SUL FARO!');
    g.sfx('pop');
    await g.narrate('Pfffft. Blub.');
    await g.npc('tricheco', 'Ammiraglio, il cannone ha sparato un pesciolino.');
    await g.npc('capitano', 'ALLORA SALPATE! SI SCAPPA!');
    g.set('pirati_arrivati');
    g.sfx('fanfare');
    await g.npc('ciurma', 'FERMI TUTTI! Siamo la ciurma più temuta dei sette mari!');
    await g.say('I pirati della taverna?! Ma non avevate detto "domani"?');
    await g.npc('ciurma', 'È passata la mezzanotte, ragazzo. È domani.');
    await g.npc('tricheco', 'Io mi arrendo. Tanto volevo solo dormire.');
    await g.narrate('I tre pirati legarono la nave nera al molo con un nodo solo. Fatto bene, però.');
    await g.narrate('L\'Ammiraglio restituì ogni tesoro, lucidò il faro per un mese e chiese scusa a tutti. Anche al gabbiano.');
    await g.narrate('Con DUE Occhi del Kraken, il faro di Isola Pernacchia adesso si vede fino in capo al mondo.');
    await g.narrate('E Fili fu nominato Guardiano Onorario del Faro. E pizzaiolo onorario, già che c\'erano.');
    g.set('finito');
    await g.ending();
  }

  rooms.cala = {
    name: 'La Cala Nascosta', music: 'nave',
    walk: [[6, 108], [312, 108], [312, 136], [6, 136]], scale: [108, 0.85, 136, 1],
    async enter(g) {
      if (g.flag('cala_vista')) return;
      g.set('cala_vista');
      await g.say('Eccola: la nave nera dell\'Ammiraglio. Con il faro spento non l\'avrebbe trovata nessuno.');
      await g.say('C\'è un marinaio enorme di guardia alla passerella.');
    },
    hotspots: [
      { id: 'nave', name: 'nave nera', rect: [150, 6, 170, 76], at: [180, 114],
        look: ['Una nave nera come la pece. Sulla fiancata c\'è scritto "LA PARRUCCA DEI MARI".', 'Dal ponte spunta un cannone. Puntato dritto sul faro.'],
        take: 'Una nave intera? Non ho tasche così grandi.' },
      { id: 'faro_su', name: 'faro acceso', rect: [14, 4, 34, 54], at: [30, 112], look: 'Il MIO faro, lassù. La luce arriva fino qui. Che soddisfazione.' },
      { id: 'casse', name: 'casse', rect: [58, 92, 44, 18], at: [80, 114],
        look: ['Casse pronte da caricare. Sopra c\'è scritto "RECUPERATO GRATIS".', 'Dentro si intravedono le campane del municipio. Altro che gratis.'],
        open: 'Inchiodate. E piene di roba che non è sua.', take: 'Pesano troppo. Le riprenderemo quando l\'Ammiraglio sarà sistemato.',
        useWith: { pala: 'I chiodi sono più testardi della pala.' } },
      { id: 'cartello', name: 'cartello', rect: [116, 84, 16, 24], at: [124, 112], look: '"VIETATO SALIRE A BORDO SENZA PARRUCCA. Firmato: l\'Ammiraglio. (NON è una parrucca.)"' },
      { id: 'tricheco', name: 'marinaio Tricheco', rect: [218, 74, 26, 38], at: [204, 120], npc: true,
        look: 'Un marinaio grande come un armadio, con due baffoni da tricheco. In testa ha una parrucca minuscola.',
        take: 'Pesa come un tricheco. Non a caso.',
        async talk(g) {
          if (g.flag('a_bordo_ok')) { await g.npc('tricheco', 'Sali, sali, collega. E pulisciti i piedi.'); return; }
          if (!g.flag('parrucca_indossata')) {
            g.set('tricheco_parlato');
            await g.npc('tricheco', 'ALT! Qui sale solo la ciurma dell\'Ammiraglio.');
            await g.dialog([
              { id: 'tri_chi', text: 'Come fa a sapere che non sono della ciurma?', run: async () => {
                await g.npc('tricheco', 'Semplice: la ciurma porta la parrucca. Tu porti un berretto. Io ho studiato.'); } },
              { id: 'tri_nome', text: 'Perché la chiamano Tricheco?', once: true, run: async () => {
                await g.npc('tricheco', 'Per i baffi. E perché quando mi siedo non mi sposta più nessuno.'); } },
              { id: 'tri_cannone', text: 'A cosa serve quel cannone?', once: true, run: async () => {
                await g.npc('tricheco', 'All\'alba facciamo BUM sul faro. Ordini dell\'Ammiraglio.');
                await g.npc('tricheco', 'Io volevo solo dormire.'); } },
              { id: 'tri_ciao', text: 'Torno dopo.', end: true, run: async () => { await g.npc('tricheco', 'Con la parrucca, magari.'); } },
            ]);
            return;
          }
          await g.npc('tricheco', 'Oh, un collega! Bella parrucca. Un po\' gonfia.');
          await g.npc('tricheco', 'Però devo farti la domanda di sicurezza. Qual è la cosa che l\'Ammiraglio ama di più al mondo?');
          await g.dialog([
            { id: 'tri_mare', text: 'Il mare!', run: async () => { await g.npc('tricheco', 'Sbagliato. Il mare gli bagna le calze.'); } },
            { id: 'tri_parr', text: 'La sua parrucca!', run: async () => { await g.npc('tricheco', 'Sbagliato. Lui dice che NON è una parrucca.'); } },
            { id: 'tri_roba', text: 'La roba degli altri!', end: true, run: async () => {
              g.set('a_bordo_ok');
              await g.npc('tricheco', 'ESATTO! Sali pure, collega.');
              await g.say('Ha funzionato! Su, a bordo.'); } },
            { id: 'tri_boh', text: 'Ci devo pensare.', end: true, run: async () => { await g.npc('tricheco', 'Pensa pure. Io da qui non mi muovo.'); } },
          ]);
        },
        useWith: {
          parrucca_bagnata: (g) => g.npc('tricheco', 'Bleah! Un marinaio con la parrucca in mano non è un marinaio. E quella gocciola.'),
          parrucca: 'Non devo regalargliela: devo mettermela in testa.',
          pala: 'Con una palata non lo sposto. Gli farei solo il solletico.',
          tisana: (g) => g.npc('tricheco', 'In servizio non bevo. Dopo, volentieri.'),
        } },
      { id: 'passerella', name: 'passerella', rect: [252, 82, 36, 28], at: [262, 112],
        exit: { to: 'ponte', x: 40, y: 122 },
        look: 'Una passerella di legno che sale sulla nave. Scricchiola solo a guardarla.',
        async canExit(g) {
          if (g.flag('a_bordo_ok')) return true;
          await g.npc('tricheco', 'ALT! Dove credi di andare? Prima parla con me.');
          return false;
        } },
      { id: 'exit', name: 'sentierino per il faro', rect: [0, 90, 10, 50], at: [10, 124], exit: { to: 'faro_esterno', x: 290, y: 122 } },
    ],
  };

  rooms.ponte = {
    name: 'Il ponte della nave', music: 'nave',
    walk: [[10, 108], [310, 108], [310, 136], [10, 136]], scale: [108, 0.9, 136, 1.05],
    async enter(g) {
      if (g.flag('ponte_visto')) return;
      g.set('ponte_visto');
      await g.say('Sono a bordo! Piano, Fili. Fai finta di essere uno della ciurma.');
      await g.say('La lente rubata deve essere qui da qualche parte.');
    },
    hotspots: [
      { id: 'faro_visto', name: 'faro acceso', rect: [16, 8, 40, 52], at: [40, 112], look: 'Il mio faro! Visto dalla nave fa ancora più luce. E quel cannone lo guarda storto.' },
      { id: 'albero', name: 'albero maestro', rect: [152, 26, 12, 80], at: [158, 112], look: 'L\'albero maestro. Le vele sono nere, rammendate con pezzi di parrucca.', use: 'Arrampicarmi? Soffro di vertigini. Da cinque minuti.' },
      { id: 'vedetta', name: 'vedetta', rect: [142, 2, 32, 24], at: [158, 114], npc: true,
        look: 'Un marinaio nella coffa, in cima all\'albero. Guarda il mare con un cannocchiale al contrario.',
        async talk(g) {
          await g.say('Tutto bene, lassù?');
          await g.npc('vedetta', g.flag('vedetta_parlato') ? 'Vedo ancora tutto bianco! Bellissimo!' : 'Tutto tranquillo! Vedo solo una luce fortissima. Anzi: adesso non vedo più niente!');
          g.set('vedetta_parlato');
        } },
      { id: 'cannone', name: 'cannone', rect: [34, 84, 46, 24], at: [72, 114],
        look: (g) => g.say(g.flag('cannone_bagnato') ? 'Fradicio dalla bocca alla miccia. Dalla canna spunta la coda di un pesciolino.' : 'Un cannone carico, puntato sul faro. La miccia è bella asciutta. Purtroppo.'),
        use: 'Non lo voglio certo far sparare!', take: 'Pesa come dieci Fili.',
        useWith: {
          async secchio(g) {
            g.remove('secchio');
            g.sfx('splash');
            g.set('cannone_bagnato');
            await g.narrate('SPLASH!');
            await g.say('Polvere bagnata, miccia fradicia. E il pesciolino si è infilato nella canna. Questo cannone non spara più.');
          },
          fiammiferi: 'NO! È puntato sul MIO faro!',
          pala: 'Troppo pesante da ribaltare, anche facendo leva.',
          zuppa: 'La zuppa mi serve. E poi le cipolle nel cannone puzzano.',
        } },
      { id: 'secchio', name: 'secchio', rect: [92, 96, 12, 12], at: [100, 112], pick: true, show: (g) => !g.flag('secchio_preso'),
        look: 'Un secchio pieno d\'acqua di mare, per lavare il ponte. Nessuno lo usa da un pezzo.',
        async take(g) { g.set('secchio_preso'); g.add('secchio'); await g.say('Un secchio d\'acqua di mare. Con pesciolino incluso.'); } },
      { id: 'pentola', name: 'pentolone', rect: [188, 80, 26, 26], at: [200, 112],
        look: 'Zuppa di cipolle che bolle. Sul coperchio c\'è scritto: "CENA DELL\'AMMIRAGLIO. GIÙ LE MANI."',
        use: 'Non ho fame di cipolle. Però una scodella potrei prenderla.',
        async take(g) {
          if (g.flag('zuppa_presa')) { await g.say('Una scodella basta e avanza.'); return; }
          g.set('zuppa_presa'); g.add('zuppa');
          await g.say('Riempio una scodella. La cena dell\'Ammiraglio la servo io, stasera.');
        },
        useWith: {
          tisana: 'Nel pentolone intero si annacqua troppo. Meglio in una scodella sola.',
          secchio: 'Acqua di mare nella zuppa? Poi se ne accorge.',
        } },
      { id: 'botola_stiva', name: 'botola della stiva', rect: [222, 112, 34, 14], at: [240, 121], exit: { to: 'stiva', x: 40, y: 122 }, look: 'Una botola aperta. Sotto c\'è la stiva: buio pesto e odore di formaggio.' },
      { id: 'porta_cabina', name: 'cabina dell\'Ammiraglio', rect: [272, 56, 26, 50], at: [284, 110],
        exit: { to: 'cabina', x: 30, y: 122 },
        look: (g) => g.say(g.flag('ammiraglio_dorme') ? 'Da dentro arriva un russare che fa tremare i vetri.' : 'La cabina dell\'Ammiraglio. Sulla porta: "NON DISTURBARE. TRANNE PER LA CENA."'),
        async canExit(g) {
          if (g.flag('ammiraglio_dorme')) return true;
          await g.npc('cabina', 'CHI È?! Se non è la cena, SPARISCI!');
          await g.say('Finché è sveglio, lì dentro non ci entro.');
          return false;
        },
        useWith: {
          async zuppa(g) {
            await g.npc('cabina', 'Sento odore di cipolle! Passa la cena dallo sportello!');
            await g.say('Un momento... se la mangia e resta sveglio, io resto chiuso fuori. Devo renderla più... soporifera.');
          },
          async zuppa_sonno(g) {
            if (g.flag('ammiraglio_dorme')) return;
            g.remove('zuppa_sonno');
            await g.say('La cena, signor Ammiraglio!');
            await g.npc('cabina', 'Era ora! Slurp. Slurp. Sluuurp.');
            await g.wait(0.6);
            await g.npc('cabina', 'Mmm... sa di camomilla... e di... yaaawn...');
            g.sfx('snore');
            await g.narrate('RONF!');
            g.set('ammiraglio_dorme');
            await g.say('Dorme! Grazie, nonna di Sbadiglio.');
          },
          tisana: 'Uno così non beve tisane. Devo nasconderla nella sua cena.',
        } },
      { id: 'passerella', name: 'passerella', rect: [0, 84, 14, 52], at: [14, 122],
        exit: { to: 'cala', x: 250, y: 120 },
        look: 'La passerella per tornare a terra.',
        async canExit(g) {
          if (!g.has('occhio')) return true;
          if (!g.flag('cannone_bagnato')) { await g.say('Non posso andarmene così: all\'alba quel cannone spara sul faro. Devo metterlo fuori uso.'); return false; }
          await finale(g);
          return false;
        } },
    ],
  };

  rooms.cabina = {
    name: 'La cabina dell\'Ammiraglio', music: 'nave',
    walk: [[10, 108], [306, 108], [306, 136], [10, 136]], scale: [108, 0.9, 136, 1.05],
    async enter(g) {
      if (g.flag('cabina_vista')) return;
      g.set('cabina_vista');
      await g.say('Ssst... in punta di piedi.');
    },
    hotspots: [
      { id: 'ritratto', name: 'ritratto', rect: [58, 22, 32, 38], at: [76, 112], look: ['Un ritratto dell\'Ammiraglio. Dipinto dall\'Ammiraglio.', 'Sotto c\'è scritto: "Al più bello dei sette mari, con affetto. Io."'], take: 'Non lo voglio in camera mia.' },
      { id: 'baule', name: 'baule', rect: [104, 84, 36, 22], at: [122, 112], look: 'Un baule con l\'etichetta "NON SONO PARRUCCHE".',
        open: 'Parrucche. Parrucche. Parrucche. E una spazzola.', take: 'Ne ho già una in testa, grazie.' },
      { id: 'piano', name: 'mappa dei naufragi', rect: [150, 20, 46, 32], at: [172, 112],
        look: ['Una mappa del mare, piena di crocette.', '"Piano geniale: 1. Spegnere il faro. 2. Aspettare. 3. Raccogliere i tesori. 4. Comprare altre NON parrucche."'] },
      { id: 'capitano', name: 'Ammiraglio addormentato', rect: [208, 62, 86, 42], at: [236, 114], npc: true,
        look: 'Dorme come un sasso, abbracciato alla scodella vuota. Senza parrucca ha la testa lucida come una boa.',
        talk: (g) => g.npc('capitano', 'Ronf... tesori miei... ronf... no, mamma, la parrucca no...'),
        take: 'Non lo sposto nemmeno con un argano.',
        useWith: { pala: 'Niente palate. Lasciamolo dormire, che è meglio per tutti.', secchio: 'Se lo bagno si sveglia. E io sono nella sua cabina.' } },
      { id: 'chiavetta', name: 'chiavetta d\'oro', rect: [236, 74, 12, 10], at: [240, 114], pick: true, show: (g) => !g.flag('chiavetta_presa'),
        look: 'Una chiavetta d\'oro appesa al collo dell\'Ammiraglio. Sale e scende a ogni ronfata.',
        async take(g) {
          await g.say('Piano... piano... pianissimo...');
          g.set('chiavetta_presa'); g.add('chiavetta');
          await g.npc('capitano', 'Ronf.');
          await g.say('Presa! Non si è accorto di niente.');
        } },
      { id: 'exit', name: 'ponte', rect: [0, 48, 12, 58], at: [12, 122], exit: { to: 'ponte', x: 284, y: 112 } },
    ],
  };

  rooms.stiva = {
    name: 'La stiva', music: 'grotta',
    walk: [[10, 108], [306, 108], [306, 136], [10, 136]], scale: [108, 0.9, 136, 1.05],
    async enter(g) {
      if (g.flag('stiva_vista')) return;
      g.set('stiva_vista');
      await g.say('Che buio. Meno male che ho ancora la mia lanterna.');
      await g.say('Ecco dov\'è finita tutta la roba dell\'isola!');
    },
    hotspots: [
      { id: 'barili_olio', name: 'barili d\'olio', rect: [56, 72, 50, 34], at: [84, 112], look: 'Tutto l\'olio per lampade di Isola Pernacchia. Ecco perché era ESAURITO.', take: 'Ne basta uno per ungere il mondo. Li riporteremo con calma.', open: 'Pieni fino all\'orlo.' },
      { id: 'tesori', name: 'mucchio di tesori', rect: [116, 78, 62, 28], at: [146, 112],
        look: ['Le campane del municipio. Il lampadario della taverna. Un pianoforte.', 'E la collezione di tappi della Sindaca. Questo sì che è un colpo basso.'],
        take: 'Li riporteremo tutti. Ma ci vuole un carro, non le mie tasche.' },
      { id: 'topo', name: 'topo di bordo', rect: [182, 96, 14, 10], at: [192, 114], npc: true,
        look: 'Un topolino con un minuscolo berretto da marinaio.',
        async talk(g) {
          await g.npc('topo', 'Squit. Squit squit!');
          await g.say(g.flag('topo_parlato') ? 'Dice che, se sistemo l\'Ammiraglio, mi nomina topo onorario.' : 'Dice che l\'Ammiraglio gli ha rubato perfino il formaggio. Che tipaccio.');
          g.set('topo_parlato');
        },
        take: 'È un marinaio libero. Niente tasche per lui.' },
      { id: 'gabbia', name: 'gabbia', rect: [222, 56, 52, 50], at: [240, 112],
        look: (g) => g.say(g.flag('occhio_preso') ? 'Una gabbia vuota. Aperta.' : g.flag('gabbia_aperta') ? 'La gabbia è aperta! La lente è lì che aspetta.' : 'Una gabbia di ferro chiusa con un lucchetto d\'oro. Dentro brilla la lente del faro: l\'Occhio del Kraken!'),
        open: (g) => g.say(g.flag('gabbia_aperta') ? 'È già aperta.' : 'Chiusa. Il lucchetto è d\'oro: ci vorrà una chiave d\'oro.'),
        useWith: {
          async chiavetta(g) {
            g.remove('chiavetta');
            g.sfx('click');
            g.set('gabbia_aperta');
            await g.say('CLIC! Il lucchetto d\'oro si è aperto!');
          },
          pala: 'Le sbarre sono più dure della pala.',
        } },
      { id: 'occhio', name: 'Occhio del Kraken', rect: [236, 72, 24, 24], at: [240, 112], pick: true, show: (g) => g.flag('gabbia_aperta') && !g.flag('occhio_preso'),
        look: 'La lente originale del faro. Brilla come una stella in gabbia.',
        async take(g) {
          g.set('occhio_preso'); g.add('occhio');
          g.sfx('fanfare');
          await g.say('L\'Occhio del Kraken, quello vero! Torna a casa con me.');
          await g.say('Adesso via da questa nave. Ma prima... c\'è quel cannone.');
        } },
      { id: 'exit', name: 'scala per il ponte', rect: [14, 18, 30, 88], at: [36, 112], exit: { to: 'ponte', x: 240, y: 121 } },
    ],
  };

  // ---------- hints: the next useful thing to do ----------
  function hint(g) {
    const f = g.flag, h = g.has;
    if (!f('sindaca_parlato')) return 'Fai due chiacchiere con la Sindaca in piazza: lei sa cosa serve per riaccendere il faro.';

    if (!f('porta_faro_aperta')) {
      if (h('chiave')) return 'Hai la chiave! Usala sulla porta del faro, in cima al sentiero.';
      if (h('pesce_fritto')) return 'Il gabbiano sul molo va matto per il pesce fritto. Daglielo!';
      if (h('pesce')) return 'Il gabbiano vuole il pesce FRITTO. Nella taverna c\'è un camino con la padella.';
      if (h('verme')) return 'Il vecchio Baccalà, sul molo, cerca un\'esca. Dagli il verme.';
      if (!f('baccala_parlato')) return 'La chiave ce l\'ha il gabbiano sul molo. Lì vicino c\'è un pescatore: parlaci.';
      return 'Al pescatore serve un verme. In spiaggia c\'è un sasso con qualcosa che si muove sotto.';
    }

    if (!f('cristallo_preso')) {
      if (!h('lanterna_accesa')) {
        if (!f('lanterna_presa')) return 'Per entrare nella grotta serve una luce. Sul molo c\'è una lanterna appesa a un palo.';
        if (!f('olio_comprato') || !f('fiammiferi_comprati')) {
          if (!f('scavato')) {
            if (!f('bottiglia_presa')) return 'Servono dobloni per la bottega. In spiaggia galleggia una bottiglia: prendila.';
            if (!f('mappa_letta')) return 'Apri la bottiglia che hai in tasca: usa il verbo "Apri" o "Usa" sulla bottiglia.';
            if (!h('pala')) return f('pala_ok') ? 'Prendi la pala nell\'aiuola accanto al faro.' : 'Per scavare serve una pala. Il guardiano del faro ne ha una: chiedigli il permesso.';
            return 'Usa la pala sulla X in spiaggia, vicino alla palma.';
          }
          return 'Con i dobloni compra olio e fiammiferi da Madama Cianfrusaglia, nella bottega.';
        }
        if (h('lanterna')) return 'Usa l\'olio con la lanterna.';
        return 'Usa i fiammiferi con la lanterna piena di olio.';
      }
      if (!f('grotta_aperta')) {
        if (f('filastrocca')) return 'Ricorda la filastrocca: premi PESCE, poi LUNA, poi TESCHIO, di fianco alla porta di pietra in spiaggia.';
        if (h('galletta')) return 'Il pappagallo della bottega vuole un biscotto. La galletta va benissimo.';
        if (!f('galletta_presa')) return 'Il pappagallo della bottega sa come aprire la grotta, ma vuole un biscotto. Prova ad aprire il barile sul molo.';
        return 'Premi i simboli nell\'ordine giusto: pesce, luna, teschio.';
      }
      if (!f('scrigno_aperto')) return h('dentiera') ? 'Allo scheletro mancano i denti... e tu hai una dentiera d\'oro.' : 'Entra nella grotta con la lanterna accesa.';
      return 'Prendi il cristallo dallo scrigno!';
    }

    if (!f('botola_aperta')) {
      if (h('manovella')) return 'Usa la manovella sul meccanismo dentro il faro.';
      if (h('cocco')) return 'Porta la noce di cocco alla cuoca Peperina, nella taverna.';
      if (!h('pala')) return f('pala_ok') ? 'Prendi la pala nell\'aiuola accanto al faro.' : 'Chiedi la pala al guardiano del faro.';
      return 'La cuoca vuole una noce di cocco. Dai una botta alla palma storta con la pala.';
    }

    if (!f('lente_montata')) return 'Sali in cima al faro e monta il cristallo nella lampada.';
    if (!f('olio_versato')) {
      if (!f('olio_comprato')) return 'Serve l\'olio: lo vende Madama Cianfrusaglia per 3 dobloni.';
      return 'Versa l\'olio nella lampada del faro.';
    }
    if (!f('fiammiferi_comprati')) return 'Servono i fiammiferi: li vende Madama Cianfrusaglia per 2 dobloni.';
    if (!f('ammiraglio_arrivato')) return 'Tutto pronto: usa i fiammiferi sulla lampada!';
    if (!f('ammiraglio_volato')) return 'L\'Ammiraglio ha sempre fame... e tu hai in tasca qualcosa di esplosivo.';
    if (!f('faro_acceso')) return 'Via libera: usa i fiammiferi sulla lampada!';

    // chapter 2: the black ship
    if (!f('a_bordo_ok')) {
      if (f('parrucca_indossata')) return 'Hai la parrucca in testa: vai alla Cala Nascosta e parla con il Tricheco. Ricorda: l\'Ammiraglio ama soprattutto la roba degli altri.';
      if (h('parrucca')) return 'Mettiti la parrucca: usa il verbo "Usa" sulla parrucca che hai in tasca.';
      if (h('parrucca_bagnata')) return 'La parrucca è fradicia. Asciugala al camino della taverna.';
      if (!f('tricheco_parlato')) return 'Scendi alla Cala Nascosta: c\'è un sentierino nuovo a destra del faro. Parla con la guardia della nave.';
      return 'Per salire a bordo serve una parrucca. Il vecchio Baccalà, sul molo, ha pescato qualcosa di strano...';
    }
    if (!f('occhio_preso')) {
      if (!f('ammiraglio_dorme')) {
        if (h('zuppa_sonno')) return 'Porta la zuppa della buonanotte alla porta della cabina, sul ponte della nave.';
        if (h('zuppa') && h('tisana')) return 'Usa la Tisana Sonnobello con la zuppa di cipolle.';
        if (!h('zuppa')) return 'L\'Ammiraglio è chiuso in cabina e aspetta la cena. Prendi una scodella di zuppa dal pentolone, sul ponte.';
        return 'Bisogna far addormentare l\'Ammiraglio. Chi è il più grande esperto di sonno dell\'isola? Chiedi al guardiano Sbadiglio.';
      }
      if (!f('chiavetta_presa')) return 'L\'Ammiraglio dorme: entra nella cabina e prendi la chiavetta che ha al collo.';
      if (!f('gabbia_aperta')) return 'Scendi nella stiva dalla botola sul ponte e apri la gabbia con la chiavetta d\'oro.';
      return 'La gabbia è aperta: prendi la lente!';
    }
    if (!f('cannone_bagnato')) return h('secchio') ? 'Rovescia il secchio d\'acqua sul cannone.' : 'Prima di andartene metti fuori uso il cannone: sul ponte c\'è un secchio d\'acqua.';
    return 'Hai la lente e il cannone è fuori uso: scendi dalla nave lungo la passerella!';
  }

  return {
    title: 'Fili e il Faro di Isola Pernacchia',
    start: { room: 'molo', x: 50, y: 124 },
    // who speaks: text colour, and where the text appears if the speaker is not a hotspot of the room
    actors: {
      fili: { color: '#ffe066' }, narr: { color: '#ffffff' },
      baccala: { color: '#9fd3ff' }, gabbiano: { color: '#f2f2f2' }, sindaca: { color: '#ffb3e6' },
      ammiraglio: { color: '#ff9e7a' }, cuoca: { color: '#ff7b7b' }, pirati: { color: '#c5e1a5' },
      madama: { color: '#d7b0ff' }, pappagallo: { color: '#7dff8a' }, sbadiglio: { color: '#d7c4b8' },
      scheletro: { color: '#b2ebf2' }, finestra: { color: '#ff9e7a', at: [290, 30] },
      tricheco: { color: '#a8d8ff' }, cabina: { color: '#ff9e7a', at: [270, 52] }, topo: { color: '#d8d8d8' }, vedetta: { color: '#ffd9a0' },
      capitano: { color: '#ff9e7a', at: [236, 34] }, ciurma: { color: '#c5e1a5', at: [70, 70] },
    },
    items, combos, rooms, hint,
  };
});
