// "Fili e l'Isola Maya": the second adventure.
// Set in ancient Maya times with jungle, traditional Maya houses, island, beach and palms!
// Rooms, hotspots, items, dialogues, puzzles and hints.
(function (root, factory) {
  const m = factory();
  if (typeof module === 'object' && module.exports) module.exports = m;
  else root.AdvStoryMaya = m;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const TEMPLE_CODE = 'GSP'; // Giaguaro, Sole, Serpente

  async function pressMayaSymbol(g, letter) {
    if (g.flag('tempio_sbloccato')) {
      await g.say('I gradini sono già sbloccati. La via per la cima è aperta!');
      return;
    }
    g.sfx('click');
    const seq = (g.flag('combo_maya') || '') + letter;
    if (seq.length < 3) {
      g.set('combo_maya', seq);
      const symbols = { G: 'Giaguaro', S: 'Sole', P: 'Serpente' };
      await g.say('CLAC! Il disco del ' + symbols[letter] + ' gira e si illumina. Simbolo ' + seq.length + ' di 3 premuto.');
      return;
    }
    g.set('combo_maya', '');
    if (seq === TEMPLE_CODE) {
      g.set('tempio_sbloccato');
      g.sfx('rumble');
      await g.narrate('GRRRRRUUUUUUMBLE!');
      await g.narrate('La grande grata di pietra si ritrae nei gradini della piramide!');
      await g.say('Ha funzionato! Giaguaro, Sole e Serpente: la stele aveva ragione!');
    } else {
      g.sfx('wrong');
      await g.say('GRR-CLAC! I dischi di pietra sono scattati indietro: ordine sbagliato.');
    }
  }

  async function grandFinale(g) {
    g.remove('cioccolata_sacra');
    g.sfx('pour');
    await g.say('Verso tutta la Sacra Cioccolata Calma-Pancia nel braciere ardente!');
    g.sfx('match');
    await g.narrate('FWOOOOOOOOSH!');
    await g.narrate('Una gigantesca nuvola profumata di cacao, vaniglia e fiori sacri sale alta verso il cielo!');
    await g.narrate('La nuvola raggiunge la cima del vulcano ed entra dentro al cratere...');
    await g.wait(0.8);
    g.sfx('rumble');
    await g.narrate('Il vulcano smette di tremare. Si sente solo un piccolo gorgoglio sotterraneo:');
    await g.say('Gurgle... gurgle... gurgle...');
    await g.wait(0.6);
    g.sfx('fart');
    await g.narrate('PRRRRRRRRRRRRRROOOOOOOOOOOOOOOTTTTTTTTTTTTTTTTTTTTTTTT!!!');
    await g.narrate('Un\'epica, titanica pernacchia fa tremare la giungla, spazza via le nuvole nere e fa volare tutte le piume!');
    await g.wait(0.5);
    g.sfx('fanfare');
    await g.narrate('Dal cratere si ode un sospiro cosmico di sollievo: "Aaaaaah... che buona la cioccolata!"');
    await g.npc('sacerdote', 'È UN MIRACOLO! Il Vulcano è guarito! Il sole brilla di nuovo sull\'Isola Maya!');
    await g.npc('capo', 'Evviva Fili! Per il tuo coraggio ti nominiamo Nobile Signore del Cacao e Fratello della Giungla!');
    await g.say('Evviva! Che avventura! E adesso... una bella scorpacciata di tortillas per tutti!');
    g.set('maya_completata');
    await g.ending();
  }

  // ---------- inventory items ----------
  const items = {
    conchiglia_rosa: {
      name: 'conchiglia rosa',
      look: 'Una grande conchiglia rosa lucida. I Maya la usano come tromba rituale nelle feste.',
      async use(g) {
        g.sfx('conch');
        await g.say('Prendo fiato e soffio... POOOOOOOOOOOOOOOOH!');
        await g.say('Che polmoni! Ha rimbombato in tutta la spiaggia.');
      },
    },
    cocco: {
      name: 'noce di cocco',
      look: 'Una noce di cocco caduta dalla palma. Piena di fresco latte dissetante.',
      use: 'Non riesco ad aprirla con le unghie. Qualcuno con la gola secca la gradirebbe molto!',
    },
    bastone_selce: {
      name: 'bastone di selce',
      look: 'Un lungo bastone di bambù con una punta di selce affilata e legacci di corda.',
      use: 'Ottimo per raggiungere rami alti, tagliare frutti o spingere cose galleggianti.',
    },
    fave_cacao: {
      name: 'fave di cacao',
      look: 'Preziose fave di cacao dell\'albero del villaggio. Per i Maya valgono più delle monete d\'oro!',
      use: 'Profumano di cioccolato fondente. Sono l\'ingrediente principale per la ricetta di Nonna Ixchel.',
    },
    mais: {
      name: 'spiga di mais dorato',
      look: 'Una bella spiga di mais maturo e dolce, appena colto dal cesto della capanna.',
      use: 'Dolce e croccante! Le scimmie della giungla farebbero carte false per averne una.',
    },
    amuleto_giada: {
      name: 'amuleto di giada',
      look: 'Un prezioso amuleto di giada verde intagliato a forma di sole splendente.',
      use: 'È fatto per essere incastrato in un meccanismo o su un altare sacro.',
    },
    ninfea_sacra: {
      name: 'ninfea sacra',
      look: 'Un fiore acquatico raro dai petali azzurri e profumati, raccolto nel Cenote Sacro.',
      use: 'Le sue foglie e i suoi petali hanno proprietà calmanti leggendarie.',
    },
    maschera_oro: {
      name: 'maschera del serpente',
      look: 'La leggendaria Maschera d\'Oro del Serpente Piumato. Pesa un bel po\' e risplende come il fuoco.',
      use: 'È una maschera cerimoniale: solo il Sommo Sacerdote in cima al tempio può indossarla!',
    },
    cioccolata_sacra: {
      name: 'sacra cioccolata',
      look: 'Una ciotola di terracotta fumante con la Sacra Cioccolata Calma-Pancia. Ha una schiuma deliziosa.',
      use: 'Va versata nel Grande Braciere in cima alla piramide per calmare i brontolii del vulcano!',
    },
  };

  // Combinations
  const combos = {
    'bastone_selce+cocco': 'La selce è affilata, ma per spaccare un cocco serve un colpo secco o un bevitore assetato.',
    'cocco+conchiglia_rosa': 'Suonare la conchiglia sopra il cocco non lo farà aprire.',
    'fave_cacao+mais': 'Cacao e mais: le due ricchezze dei Maya! Ma la ricetta della Nonna richiede altri ingredienti.',
    'amuleto_giada+maschera_oro': 'Due tesori sacri della civiltà maya.',
    'bastone_selce+conchiglia_rosa': 'Se infilo il bastone nella conchiglia rovino l\'acustica!',
    'amuleto_giada+bastone_selce': 'Non voglio scalfire la giada preziosa con la selce.',
    'conchiglia_rosa+mais': 'Il mais non suona, per quanto ci soffi dentro.',
    'fave_cacao+ninfea_sacra': 'Nonna Ixchel è l\'unica che sa mescolarli nel mortaio con le giuste proporzioni.',
    'cioccolata_sacra+conchiglia_rosa': 'Non verso la cioccolata nella conchiglia!',
  };

  // ---------- rooms ----------
  const rooms = {};

  // 1. SPIAGGIA DELLE PALME
  rooms.maya_spiaggia = {
    name: 'Spiaggia delle Palme', music: 'maya_spiaggia',
    walk: [[10, 110], [310, 110], [310, 136], [10, 136]], scale: [110, 0.85, 136, 1.0],
    async enter(g) {
      if (g.flag('intro_maya')) return;
      g.set('intro_maya');
      await g.chapter(1, "L'Isola Maya");
      await g.narrate('Filippo, che tutti chiamano Fili, naviga sulla sua nave quando una burrasca improvvisa travolge il mare.');
      await g.narrate('Onde gigantesche sbattono la nave contro la costa. Poi, finalmente, il mare si calma.');
      await g.narrate('All’alba Fili si risveglia sulla spiaggia: la sua nave è incagliata e ha l’albero spezzato.');
      await g.say('Per tutte le onde! Dove sono finito? E come rimetterò in mare la mia nave?');
      await g.narrate('Sulla spiaggia di un’isola tropicale, nell’anno 800 dopo Cristo, comincia una nuova avventura.');
      await g.say('Laggiù tra gli alberi vedo un villaggio di case maya. Forse qualcuno può aiutarmi!');
      g.sfx('rumble');
      await g.narrate('BRRRRUUUUUMMMMM!');
      await g.say('E quello? Un vulcano brontola dietro l’isola! Prima chiedo aiuto al pescatore.');
    },
    hotspots: [
      { id: 'mare', name: 'mare caraibico', rect: [0, 60, 320, 30], at: [160, 112],
        look: 'Un mare cristallino dai colori smeraldo e turchese. Si vedono pesciolini tropicali nuotare sul fondale.',
        take: 'Non posso mettermi il mare in tasca.',
        use: 'Una nuotata sarebbe fantastica, ma prima devo salvare l\'isola dal vulcano!' },
      { id: 'palma', name: 'palma gigante', rect: [250, 24, 48, 88], at: [257, 117],
        look: (g) => g.flag('cocco_caduto') ? 'Una splendida palma maya. Ora che il cocco è caduto è più leggera.' : 'Una palma altissima piegata dalla brezza marina. Lassù in cima c\'è una bella noce di cocco matura!',
        take: 'È piantata saldamente nella sabbia da cent\'anni.',
        async use(g) {
          if (g.flag('cocco_caduto')) await g.say('Non ci sono altri cocchi maturi lassù.');
          else await g.say('Provo a scuotere il tronco... Ufff! È solidissimo, ci vorrebbe qualcosa di sonoro o potente per farlo vibrare!');
        },
        useWith: {
          async conchiglia_rosa(g) {
            if (g.flag('cocco_caduto')) { await g.say('I cocchi sono già tutti caduti!'); return; }
            g.sfx('conch');
            await g.say('Prendo fiato e... POOOOOOOOOOOOOOOOOH!!!');
            await g.narrate('Il profondo boato della conchiglia fa vibrare l\'aria e la cima della palma!');
            g.sfx('bonk');
            g.set('cocco_caduto');
            await g.narrate('SDONK! Una bella noce di cocco matura si stacca e atterra sulla sabbia morbida!');
            await g.say('Che colpo! La conchiglia ha una potenza incredibile.');
          },
          bastone_selce: 'Il bastone è lungo, ma la palma è ancora più alta. Serve una vibrazione forte!',
        } },
      { id: 'cocco_terra', name: 'noce di cocco', rect: [248, 116, 18, 15], at: [249, 121], pick: true,
        show: (g) => g.flag('cocco_caduto') && !g.flag('cocco_preso'),
        look: 'Una noce di cocco fresca caduta dalla palma. È piena zeppa di latte dissetante.',
        async take(g) {
          g.set('cocco_preso'); g.add('cocco');
          await g.say('Presa! È bella pesante e si sente il latte sciacquare dentro.');
        } },
      { id: 'relitto', name: 'nave di Filippo', rect: [18, 68, 96, 42], at: [71, 116],
        look: 'La mia nave è finita di traverso sulla sabbia. L’albero è spezzato e lo scafo si è riempito d’acqua. Dopo aver salvato l’isola cercherò di ripararla.',
        take: 'È troppo grande e incagliata nella sabbia.',
        use: 'Prima devo salvare l’isola e trovare il modo di riparare lo scafo.' },
      { id: 'conchiglia', name: 'grande conchiglia', rect: [145, 114, 18, 15], at: [145, 119], pick: true,
        show: (g) => !g.flag('conchiglia_presa'),
        look: 'Una magnifica conchiglia rosa lucente portata a riva dalle onde. Ha la forma perfetta per suonare.',
        async take(g) {
          g.set('conchiglia_presa'); g.add('conchiglia_rosa');
          await g.say('Raccolta! È liscia, rosata e se ci soffio dentro farà un baccano infernale.');
        } },
      { id: 'granchio', name: 'granchietto', rect: [169, 119, 18, 13], at: [174, 122],
        look: 'Un simpatico granchio dei Caraibi che cammina tutto fiero di sbieco.',
        talk: (g) => g.say('Ciao piccolo! ...Lui batte le chelette tipo nacchere. Che ballerino!'),
        take: 'Ha le chele aguzze. Meglio che continui la sua passeggiata sulla sabbia.' },
      { id: 'pescatore', name: 'pescatore Chaac', rect: [179, 76, 35, 40], at: [198, 118], npc: true,
        look: (g) => g.flag('pescatore_dissetato') ? 'Chaac il pescatore. Ora è felice, rilassato e con la pancia piena di latte di cocco.' : 'Un pescatore maya seduto accanto alla rete. Ha la fronte sudata e la lingua secca per il gran caldo.',
        async talk(g) {
          await g.dialog([
            { id: 'chaac_isola', text: 'Ciao! Mi confermi che isola è questa?',
              async run(gm) { await gm.npc('pescatore', 'Sei sull\'Isola Maya, giovanotto! Io sono Chaac. E tra poco mi sciolgo come cera sotto questo sole cocente!'); } },
            { id: 'chaac_aiuto', text: 'Hai qualcosa per aiutarmi a esplorare l\'isola?',
              async run(gm) {
                if (gm.flag('pescatore_dissetato')) await gm.npc('pescatore', 'Ti ho già dato il mio miglior bastone di bambù e selce. Trattamelo bene!');
                else await gm.npc('pescatore', 'Ho qui il mio fedele bastone di bambù con la punta di selce. Te lo regalerei volentieri... ma ho una sete micidiale! Se solo avessi un cocco fresco!');
              } },
            { id: 'chaac_vulcano', text: 'Cos\'è questo tremolio sotto i piedi?',
              async run(gm) { await gm.npc('pescatore', 'È il Vulcano Pernacchione! Da stamattina ha un attacco di mal di pancia epico. Se non lo calmano farà esplodere tutta l\'isola!'); } },
            { id: 'chaac_fine', text: 'Ci vediamo dopo, Chaac!', end: true },
          ]);
        },
        useWith: {
          async cocco(g) {
            g.remove('cocco');
            g.set('pescatore_dissetato');
            g.sfx('splash');
            await g.npc('pescatore', 'GLU GLU GLU! Ahhhhhhhh! Che delizia, latte di cocco fresco di palma!');
            await g.npc('pescatore', 'Mi hai rimesso al mondo, ragazzino dalla cuffia rossa! Prendi il mio bastone di bambù con punta di selce.');
            g.sfx('pick');
            g.add('bastone_selce');
            await g.npc('pescatore', 'Taglia liane, stacca frutti alti e fa da scudo nella giungla.');
            await g.say('Grazie Chaac! È perfetto per avventurarmi tra la vegetazione.');
          },
          conchiglia_rosa: 'Non ha fame di conchiglie, sta morendo di sete!',
        } },
      { id: 'exit_giungla', name: 'sentiero per la giungla', rect: [304, 88, 16, 50], at: [308, 118],
        exit: { to: 'maya_giungla', x: 20, y: 120 },
        look: 'Un varco tra le palme che si addentra nella folta giungla tropicale.' },
    ],
  };

  // 2. GIUNGLA TROPICALE
  rooms.maya_giungla = {
    name: 'La Giungla Tropicale', music: 'maya_giungla',
    walk: [[10, 112], [310, 112], [310, 136], [10, 136]], scale: [112, 0.85, 136, 1.0],
    async enter(g) {
      if (g.flag('giungla_vista')) return;
      g.set('giungla_vista');
      await g.say('Mamma mia, quanta vegetazione! Alberi di Ceiba altissimi, felci giganti e liane dappertutto.');
    },
    hotspots: [
      { id: 'alberi', name: 'alberi sacri', rect: [0, 0, 320, 50], at: [160, 114],
        look: 'Alberi giganti di Ceiba, l\'albero sacro dell\'universo maya. Uniscono la terra al cielo.',
        take: 'Sono alti trenta metri, impossibile!' },
      { id: 'liana', name: 'liana robusta', rect: [60, 20, 22, 70], at: [70, 114],
        look: 'Una robusta liana tropicale che scende dalla volta della foresta.',
        use: 'Tiro con forza... È saldissima! Ottima per dondolarsi, ma adesso ho una missione.',
        take: 'È abbarbicata all\'albero lassù in cima.' },
      { id: 'stela', name: 'stele di pietra', rect: [110, 50, 30, 56], at: [124, 114],
        look: async (g) => {
          g.set('stela_letta');
          await g.say('Una stele di pietra scolpita con minuziosi bassorilievi maya.');
          await g.narrate('Sulla stele sono incisi chiaramente tre simboli in fila: 1° GIAGUARO, 2° SOLE, 3° SERPENTE.');
          await g.say('Giaguaro, Sole, Serpente! Questo ordine deve essere la combinazione segreta di qualcosa.');
        } },
      { id: 'scimmia', name: 'scimmia Balamito', rect: [190, 32, 28, 30], at: [200, 114], npc: true,
        look: (g) => g.flag('scimmia_sazia') ? 'Balamito la scimmietta, sdraiata a pancia all\'aria sul ramo, felice e sazia.' : 'Una scimmia ragno con una coda lunghissima. Tra le zampette stringe un luccicante amuleto verde di giada!',
        async talk(g) {
          if (g.flag('scimmia_sazia')) {
            await g.npc('scimmia', 'U-u-ah-ah! *burp*');
            await g.say('Ha la pancia piena di mais dolce e fa ciao con la manina.');
          } else {
            await g.npc('scimmia', 'U-u-ah-ah! Ciiik-ciiik!');
            await g.say('Si tocca il pancino vuoto e mi mostra l\'amuleto. Sembra dire: niente dolcezze, niente tesoro!');
          }
        },
        async take(g) {
          if (g.flag('scimmia_sazia')) await g.say('Lasciamola riposare sul suo ramo.');
          else await g.say('Allungo la mano ma lei salta più in alto e mi fa una linguaccia dispettosa!');
        },
        useWith: {
          async mais(g) {
            g.remove('mais');
            g.set('scimmia_sazia');
            g.sfx('pick');
            await g.say('Tieni, Balamito! Una splendida pannocchia di mais dorato e zuccherino.');
            await g.npc('scimmia', 'U-U-AH-AH! Sgranocch, sgranocch, sgranocch!');
            g.sfx('coin');
            g.add('amuleto_giada');
            await g.narrate('La scimmietta entusiasta molla l\'amuleto verde, che cade dritto tra le mani di Fili!');
            await g.say('Preso! L\'Amuleto di Giada del Sole! Splende di un verde smeraldo purissimo.');
          },
          cocco: 'Il cocco con la scorza dura è troppo grosso per i suoi dentini.',
          fave_cacao: 'Il cacao crudo è troppo amaro per la scimmia, vuole qualcosa di dolce!',
        } },
      { id: 'exit_spiaggia', name: 'spiaggia delle palme', rect: [0, 94, 16, 42], at: [12, 118],
        exit: { to: 'maya_spiaggia', x: 290, y: 118 },
        look: 'Torna indietro alla spiaggia delle palme.' },
      { id: 'exit_villaggio', name: 'villaggio maya', rect: [238, 78, 28, 36], at: [250, 114],
        exit: { to: 'maya_villaggio', x: 30, y: 120 },
        look: 'Un comodo sentiero che porta alla piazza delle case maya.' },
      { id: 'exit_cenote', name: 'scala per il cenote', rect: [148, 96, 28, 22], at: [162, 114],
        exit: { to: 'maya_cenote', x: 40, y: 118 },
        look: 'Gradini intagliati nella roccia calcarea che scendono verso una grotta sotterranea con acqua smeraldo.' },
      { id: 'exit_tempio', name: 'sentiero della piramide', rect: [304, 88, 16, 48], at: [308, 118],
        exit: { to: 'maya_tempio', x: 30, y: 124 },
        look: 'La scalinata sacra che sale verso l\'imponente Piramide Maya.' },
    ],
  };

  // 3. VILLAGGIO MAYA
  rooms.maya_villaggio = {
    name: 'Il Villaggio Maya', music: 'maya_villaggio',
    walk: [[10, 110], [310, 110], [310, 136], [10, 136]], scale: [110, 0.85, 136, 1.0],
    async enter(g) {
      if (g.flag('villaggio_visto')) return;
      g.set('villaggio_visto');
      await g.say('Ecco il villaggio maya! Le case sono bellissime: pareti di tronchi chiari e tetti spioventi di foglie di palma.');
    },
    hotspots: [
      { id: 'case_maya', name: 'case maya', rect: [40, 28, 115, 78], at: [90, 112],
        look: 'Le caratteristiche capanne maya (chiamate "naah"). Hanno forme arrotondate, fresche e resistenti alle tempeste.',
        open: 'La porta della capanna principale è spalancata, si può entrare liberamente!' },
      { id: 'porta_capanna', name: 'ingresso capanna', rect: [68, 62, 24, 40], at: [80, 112],
        exit: { to: 'maya_capanna', x: 50, y: 124 },
        look: 'L\'ingresso ombreggiato della capanna di Nonna Ixchel.' },
      { id: 'albero_cacao', name: 'albero del cacao', rect: [255, 38, 50, 72], at: [255, 114],
        look: (g) => g.flag('cacao_preso') ? 'Un albero di cacao. I frutti più bassi sono stati raccolti con cura.' : 'Un albero di cacao rigoglioso. Dal tronco pendono grossi baccelli ovali color rosso mattone, pieni di fave di cacao!',
        async take(g) {
          if (g.flag('cacao_preso')) await g.say('Ne ho già preso un bel baccello pieno di fave.');
          else await g.say('Il picciolo è duro come il cuoio, non riesco a staccarlo con le sole dita. Mi serve una lama o una selce affilata!');
        },
        useWith: {
          async bastone_selce(g) {
            if (g.flag('cacao_preso')) { await g.say('Ho già raccolto le fave di cacao che servono.'); return; }
            g.set('cacao_preso'); g.add('fave_cacao'); g.sfx('fry');
            await g.say('ZAC! Con la punta di selce incido il picciolo del baccello di cacao!');
            await g.say('Si apre ed ecco decine di preziosissime fave di cacao profumate!');
          },
        } },
      { id: 'capo', name: 'Capo Naso di Giaguaro', rect: [175, 68, 28, 42], at: [195, 114], npc: true,
        look: 'Il Capovillaggio Naso di Giaguaro. Porta un grandioso copricapo con piume verdi di quetzal e una fascia di giada.',
        async talk(g) {
          await g.dialog([
            { id: 'capo_saluto', text: 'Onore a te, grande Capo del villaggio!',
              async run(gm) { await gm.npc('capo', 'Salute a te, piccolo esploratore dalla berretta rossa! Sei capitato in un giorno di grande agitazione!'); } },
            { id: 'capo_vulcano', text: 'Cosa succede al vulcano dell\'isola?',
              async run(gm) {
                await gm.npc('capo', 'Il Dio del Vulcano ha mangiato peperoncini habanero sacri e ora ha un mal di pancia devastante!');
                await gm.npc('capo', 'Se non riceve la Sacra Cioccolata Calma-Pancia prima di stasera, erutterà una tempesta di fumo e fuoco!');
              } },
            { id: 'capo_ricetta', text: 'Chi sa preparare questa cioccolata?',
              async run(gm) {
                await gm.npc('capo', 'Nonna Ixchel, dentro la capanna qui accanto! Ma le mancano due ingredienti rari: il Cacao e la Ninfea Sacra del Cenote.');
              } },
            { id: 'capo_tempio', text: 'E la grande piramide in fondo?',
              async run(gm) {
                await gm.npc('capo', 'La scalinata è sbarrata da tre dischi con geroglifici. Solo il Sommo Sacerdote conosce i riti, e la sequenza è scritta nella giungla.');
              } },
            { id: 'capo_fine', text: 'Non temere, Capo: ci penso io!', end: true },
          ]);
        },
        useWith: {
          cocco: 'Il Capo ha già la sua corte che gli porta da bere, grazie comunque!',
        } },
      { id: 'focolare', name: 'focolare comune', rect: [128, 92, 28, 18], at: [142, 114],
        look: 'Un focolare di pietre tonde con ceneri calde e braci profumate di legna di cedro.',
        use: 'È caldissimo, serve a scaldare le piastre per il cibo del villaggio.' },
      { id: 'exit_giungla', name: 'giungla', rect: [0, 88, 16, 48], at: [12, 118],
        exit: { to: 'maya_giungla', x: 230, y: 116 },
        look: 'Rientra nella giungla tropicale.' },
    ],
  };

  // 4. INTERNO CAPANNA MAYA
  rooms.maya_capanna = {
    name: 'Interno Casa Maya', music: 'maya_villaggio',
    walk: [[10, 108], [306, 108], [306, 136], [10, 136]], scale: [108, 0.9, 136, 1.05],
    async enter(g) {
      if (g.flag('capanna_vista')) return;
      g.set('capanna_vista');
      await g.say('Che frescura qui dentro! Le pareti di pali lasciano passare la brezza e il tetto di paglia tiene fuori il sole cocente.');
    },
    hotspots: [
      { id: 'nonna', name: 'Nonna Ixchel', rect: [188, 70, 32, 40], at: [181, 114], npc: true,
        look: 'Nonna Ixchel, la saggia guaritrice del villaggio. È inginocchiata davanti alla sua macina di pietra lavica (metate).',
        async talk(g) {
          await g.dialog([
            { id: 'nonna_saluto', text: 'Buongiorno Nonna! Il Capo mi manda per la cura del vulcano.',
              async run(gm) {
                await gm.npc('nonna', 'Benvenuto nella mia umile dimora, piccolo caro! Povero vulcano, ha una gastrite terribile.');
                await gm.npc('nonna', 'Solo la Sacra Cioccolata Calma-Pancia può placarlo, ma ho finito gli ingredienti freschi!');
              } },
            { id: 'nonna_ingredienti', text: 'Quali ingredienti ti servono esattamente?',
              async run(gm) {
                await gm.npc('nonna', 'Mi servono due meraviglie della natura:');
                await gm.npc('nonna', '1. Le Fave di Cacao appena colte dall\'albero fuori in piazza.');
                await gm.npc('nonna', '2. La Ninfea Sacra che fiorisce nell\'acqua del Cenote segreto.');
              } },
            { id: 'nonna_mais', text: 'Cosa c\'è in quel bel cesto di vimini?',
              async run(gm) {
                await gm.npc('nonna', 'È il nostro raccolto di mais dorato! Prendine pure una spiga: è dolcissima, le scimmiette della foresta ne vanno pazze!');
              } },
            { id: 'nonna_fine', text: 'Vado subito a cercarli, Nonna!', end: true },
          ]);
        },
        useWith: {
          async fave_cacao(g) {
            if (g.flag('ninfea_consegnata')) {
              g.remove('fave_cacao');
              await preparaPozione(g);
            } else {
              g.remove('fave_cacao');
              g.set('cacao_consegnato');
              g.sfx('pick');
              await g.npc('nonna', 'Meravigliose fave di cacao profumate! Ora manca solo la Ninfea Sacra del Cenote.');
            }
          },
          async ninfea_sacra(g) {
            if (g.flag('cacao_consegnato')) {
              g.remove('ninfea_sacra');
              await preparaPozione(g);
            } else {
              g.remove('ninfea_sacra');
              g.set('ninfea_consegnata');
              g.sfx('pick');
              await g.npc('nonna', 'Che petali azzurri e vellutati! Ora mi mancano solo le fave di cacao del villaggio.');
            }
          },
        } },
      { id: 'cesto', name: 'cesto di mais', rect: [90, 82, 28, 26], at: [102, 112],
        look: (g) => g.flag('mais_preso') ? 'Un cesto di vimini con foglie di mais essiccate.' : 'Un cesto di vimini intrecciato colmo di deliziose pannocchie di mais dorato.',
        async take(g) {
          if (g.flag('mais_preso')) await g.say('Ho già preso una bella pannocchia, lasciamone un po\' per la cena del villaggio.');
          else {
            g.set('mais_preso'); g.add('mais'); g.sfx('pick');
            await g.say('Prendo una pannocchia di mais dorato! I chicchi sono turgidi e dolcissimi.');
          }
        } },
      { id: 'amaca', name: 'amaca di cotone', rect: [14, 42, 48, 52], at: [45, 112],
        look: 'Una comoda amaca maya sospesa tra due travi di legno. I Maya sono stati i primi al mondo a tesserle!',
        use: 'Mi dondolo due secondi... Ahhh, che pace! Ma non c\'è tempo per schiacciare un pisolino.' },
      { id: 'vasi', name: 'vasi dipinti', rect: [250, 76, 40, 32], at: [245, 112],
        look: 'Grandi vasi di argilla cotti al forno con decorazioni geometriche e spirali sacre.',
        open: 'Contengono spezie di giungla essiccate e semi di vaniglia profumati.' },
      { id: 'exit', name: 'uscita capanna', rect: [0, 48, 14, 60], at: [12, 120],
        exit: { to: 'maya_villaggio', x: 80, y: 114 },
        look: 'Torna fuori nella piazza del villaggio.' },
    ],
  };

  async function preparaPozione(g) {
    g.sfx('gears');
    await g.npc('nonna', 'Cacao e Ninfea Sacra insieme! Ora macino tutto con il mio metate di pietra...');
    await g.wait(0.6);
    g.sfx('fry');
    await g.narrate('CRUNCH... CRUNCH... SSSSSSHHHH!');
    await g.npc('nonna', 'Aggiungo una goccia di miele di melipona e un pizzico di vaniglia selvatica...');
    g.sfx('fanfare');
    g.set('pozione_pronta');
    g.add('cioccolata_sacra');
    await g.npc('nonna', 'Ecco a te la Sacra Cioccolata Calma-Pancia! Fumante, densa e con una schiuma vellutata.');
    await g.npc('nonna', 'Portala in cima alla Piramide Maya e versala nel Grande Braciere. Salverà l\'isola intera!');
    await g.say('Grazie Nonna Ixchel! Vado di corsa!');
  }

  // 5. CENOTE SACRO
  rooms.maya_cenote = {
    name: 'Il Cenote Sacro', music: 'grotta',
    walk: [[10, 110], [310, 110], [310, 136], [10, 136]], scale: [110, 0.85, 136, 1.0],
    async enter(g) {
      if (g.flag('cenote_visto')) return;
      g.set('cenote_visto');
      await g.say('Uaoooo! Un\'immensa cavità naturale con un lago sotterraneo d\'acqua turchese!');
      await g.say('Dall\'apertura in alto scendono fasci di luce solare e liane lunghissime.');
    },
    hotspots: [
      { id: 'acqua', name: 'acqua sacra', rect: [75, 74, 160, 38], at: [160, 114],
        look: 'Acqua dolce limpidissima, color smeraldo e zaffiro. È così trasparente che si vede il fondo bianco di roccia calcarea.',
        take: 'È fresca e dissetante, ma non ho un recipiente per portarla via.' },
      { id: 'rana', name: 'grande rana maya', rect: [130, 74, 26, 20], at: [142, 114], npc: true,
        show: (g) => !g.flag('rana_fuggita'),
        look: 'Una gigantesca rana verde con una foglia di ninfea in testa a mo\' di cappello. Ha uno sguardo severo e fa la guardia ai fiori sacri.',
        async talk(g) {
          await g.npc('rana', 'CRAAAK! Cra-cra-craaaaaak!');
          await g.say('Mi guarda storto e gonfia la gola. Dice che nessun umano può avvicinarsi ai fiori sacri!');
        },
        take: 'È troppo viscida e scivolosa.',
        useWith: {
          async conchiglia_rosa(g) {
            g.sfx('conch');
            await g.say('Prendo fiato e... POOOOOOOOOOOOOOOOH!!!');
            await g.narrate('Il rimbombo cavernoso della conchiglia scuote l\'intera grotta del cenote!');
            g.sfx('splash');
            g.set('rana_fuggita');
            await g.narrate('La rana fa un salto acrobatico all\'indietro e si tuffa con un grande SPLASH nelle profondità dell\'acqua!');
            await g.say('Evviva! La via per il fiore è libera!');
          },
        } },
      { id: 'ninfea', name: 'ninfea sacra', rect: [168, 78, 26, 18], at: [168, 114], pick: true,
        show: (g) => !g.flag('ninfea_raccolta'),
        look: 'La leggendaria Ninfea Sacra dei Maya. Galleggia sull\'acqua con petali azzurri luminosi.',
        async take(g) {
          if (!g.flag('rana_fuggita')) {
            await g.npc('rana', 'CRAAAAAAK!');
            await g.say('La rana mi sbarra la strada con un balzo! Devo prima trovare il modo di allontanarla.');
            return;
          }
          if (!g.has('bastone_selce')) {
            await g.say('Il fiore galleggia troppo al largo per le mie braccia. Mi serve un bastone lungo per agganciarlo!');
            return;
          }
          g.set('ninfea_raccolta'); g.add('ninfea_sacra'); g.sfx('pick');
          await g.say('Allungo il bastone di bambù e aggancio delicatamente il gambo del fiore... Presa!');
          await g.say('La Ninfea Sacra del Cenote profuma di rugiada e frescura.');
        } },
      { id: 'altare', name: 'altare di pietra', rect: [240, 56, 44, 52], at: [238, 114],
        look: (g) => g.flag('altare_aperto') ? 'L\'altare di pietra del cenote. Il meccanismo a scatto è sbloccato.' : 'Un antico altare di pietra scolpito con volti di divinità dell\'acqua. Al centro c\'è una nicchia circolare a forma di sole.',
        open: (g) => g.say(g.flag('altare_aperto') ? 'È già spalancato.' : 'È un unico masso di pietra sigillato: serve una chiave o un amuleto.'),
        useWith: {
          async amuleto_giada(g) {
            if (g.flag('altare_aperto')) { await g.say('L\'altare è già sbloccato.'); return; }
            g.sfx('click');
            g.set('altare_aperto');
            g.remove('amuleto_giada');
            await g.narrate('CLIC! L\'amuleto di giada entra a pennello nella nicchia del sole!');
            g.sfx('rumble');
            await g.narrate('Un pannello di pietra scorre verso il basso con un cupo rimbombo, rivelando uno scrigno segreto!');
            await g.say('C\'è dentro un tesoro dorato!');
          },
          bastone_selce: 'Non è facendo leva con un bastone che si apre un altare sacro.',
        } },
      { id: 'maschera', name: 'maschera d\'oro', rect: [248, 68, 28, 34], at: [248, 114], pick: true,
        show: (g) => g.flag('altare_aperto') && !g.flag('maschera_presa'),
        look: 'La magnifica Maschera d\'Oro del Serpente Piumato. Gli occhi sono intarsiati di giada e madreperla.',
        async take(g) {
          g.set('maschera_presa'); g.add('maschera_oro'); g.sfx('fanfare');
          await g.say('L\'ho presa! La sacra Maschera d\'Oro del Serpente Piumato!');
          await g.say('È il tesoro più prezioso dell\'isola. Servirà al Sommo Sacerdote sul tempio.');
        } },
      { id: 'exit_giungla', name: 'scala per la giungla', rect: [0, 78, 22, 58], at: [12, 118],
        exit: { to: 'maya_giungla', x: 160, y: 120 },
        look: 'Risali i gradini di roccia per tornare nella giungla.' },
    ],
  };

  // 6. LA PIRAMIDE MAYA
  rooms.maya_tempio = {
    name: 'La Piramide Maya', music: 'faro',
    walk: [[10, 110], [310, 110], [310, 136], [10, 136]], scale: [110, 0.85, 136, 1.0],
    async enter(g) {
      if (g.flag('tempio_visto')) return;
      g.set('tempio_visto');
      await g.say('Per tutte le tortillas! Che piramide imponente! Sembra El Castillo di Chichen Itza.');
      await g.say('In cima c\'è il tempio del Sole, ma la scalinata è sbarrata da tre grandi dischi di pietra!');
    },
    hotspots: [
      { id: 'vulcano_lontano', name: 'Vulcano Pernacchione', rect: [15, 8, 55, 42], at: [60, 114],
        look: 'Il Vulcano Pernacchione. Emette sbuffi di fumo nero e fa vibrare tutta l\'isola. Ha un disperato bisogno della cioccolata calmante!' },
      { id: 'scala_piramide', name: 'scalinata della piramide', rect: [125, 38, 70, 72], at: [160, 114],
        look: (g) => g.flag('tempio_sbloccato') ? 'La scalinata sacra con i serpenti piumati scolpiti ai lati. Ora è libera e si può salire in cima!' : 'La monumentale scalinata di pietra. È sbarrata da una grata di pietra collegata a tre dischi con simboli scolpiti.',
        async use(g) {
          if (g.flag('tempio_sbloccato')) await g.say('I gradini sono liberi, posso raggiungere il Sommo Sacerdote in cima.');
          else await g.say('Una pesante grata di pietra blocca il passaggio. Devo premere i tre dischi nell\'ordine corretto!');
        } },
      { id: 'simbolo_giaguaro', name: 'disco del Giaguaro', rect: [86, 88, 22, 22], at: [96, 114],
        look: 'Un disco di pietra scolpito con la testa ruggente del GIAGUARO maya.',
        use: async (g) => pressMayaSymbol(g, 'G') },
      { id: 'simbolo_sole', name: 'disco del Sole', rect: [148, 88, 22, 22], at: [158, 114],
        look: 'Un disco di pietra scolpito con il SOLE raggiante.',
        use: async (g) => pressMayaSymbol(g, 'S') },
      { id: 'simbolo_serpente', name: 'disco del Serpente', rect: [210, 88, 22, 22], at: [220, 114],
        look: 'Un disco di pietra scolpito con il SERPENTE PIUMATO (Kukulcan).',
        use: async (g) => pressMayaSymbol(g, 'P') },
      { id: 'sacerdote', name: 'Sacerdote Kukul-Pop', rect: [144, 12, 32, 38], at: [160, 114], npc: true,
        show: (g) => g.flag('tempio_sbloccato'),
        look: (g) => g.flag('sacerdote_mascherato') ? 'Il Sommo Sacerdote indossa fiero la Maschera d\'Oro del Serpente Piumato ed esegue la danza sacra!' : 'Il Sommo Sacerdote Kukul-Pop in cima alla piramide. Porta un mantello di piume smeraldo e trema per i boati del vulcano.',
        async talk(g) {
          await g.dialog([
            { id: 'sac_saluto', text: 'Sommo Sacerdote, sono qui per salvare l\'isola!',
              async run(gm) {
                await gm.npc('sacerdote', 'Che gli dei ti benedicano, ragazzo! Il vulcano ha i minuti contati!');
                await gm.npc('sacerdote', 'Per placare il suo fuoco mi serve la Sacra Maschera d\'Oro per la Grande Danza, e la Sacra Cioccolata di Nonna Ixchel!');
              } },
            { id: 'sac_braciere', text: 'Cosa devo fare con la cioccolata?',
              async run(gm) {
                await gm.npc('sacerdote', 'Versala nel Grande Braciere Sacro proprio qui accanto: il fumo dolce salirà dritto al cratere!');
              } },
            { id: 'sac_fine', text: 'Tutto chiaro, ci penso io!', end: true },
          ]);
        },
        useWith: {
          async maschera_oro(g) {
            g.remove('maschera_oro');
            g.set('sacerdote_mascherato');
            g.sfx('fanfare');
            await g.npc('sacerdote', 'LA MASCHERA D\'ORO DEL SERPENTE PIUMATO! È tornata sul tempio!');
            await g.npc('sacerdote', 'La indosso subito! Oooooh Kukulcan... Spirito della Giungla, ascolta la nostra preghiera!');
            await g.say('Che spettacolo! Ora manca solo versare la Sacra Cioccolata nel braciere!');
          },
        } },
      { id: 'braciere', name: 'Grande Braciere Sacro', rect: [184, 18, 24, 30], at: [170, 114],
        show: (g) => g.flag('tempio_sbloccato'),
        look: 'Il Grande Braciere di pietra vulcanica. È acceso e arde con una fiamma cerimoniale turchese e dorata.',
        useWith: {
          async cioccolata_sacra(g) {
            if (!g.flag('sacerdote_mascherato')) {
              await g.say('Prima devo dare la Maschera d\'Oro al Sommo Sacerdote affinché celebri la Danza Sacra!');
              return;
            }
            await grandFinale(g);
          },
        } },
      { id: 'exit_giungla', name: 'giungla', rect: [0, 88, 16, 48], at: [12, 118],
        exit: { to: 'maya_giungla', x: 280, y: 118 },
        look: 'Riscendi il sentiero per tornare nella giungla.' },
    ],
  };

  // ---------- hint system ----------
  function hint(g) {
    const f = g.flag, h = g.has;

    if (!f('pescatore_dissetato')) {
      if (h('cocco')) return 'Porta la noce di cocco fresca al pescatore Chaac sulla spiaggia.';
      if (f('cocco_caduto')) return 'Raccogli la noce di cocco caduta sulla sabbia.';
      if (h('conchiglia_rosa')) return 'Usa la conchiglia rosa sulla grande palma per far cadere il cocco!';
      return 'Raccogli la grande conchiglia rosa sulla spiaggia delle palme.';
    }

    if (!f('stela_letta')) return 'Entra nella giungla a destra ed esamina la stele di pietra scolpita con i simboli sacri.';

    if (!f('villaggio_visto')) return 'Segui il sentiero della giungla verso destra per raggiungere il villaggio delle case maya.';

    if (!f('cacao_preso')) {
      if (h('bastone_selce')) return 'Usa il bastone di selce sull\'albero del cacao nel villaggio per tagliare un frutto.';
      return 'Chiedi aiuto al pescatore Chaac sulla spiaggia per avere il bastone di selce.';
    }

    if (!f('mais_preso')) return 'Entra nella capanna di Nonna Ixchel e prendi una spiga di mais dal cesto di vimini.';

    if (!f('scimmia_sazia')) {
      if (h('mais')) return 'Torna nella giungla e dai la spiga di mais dorato alla scimmietta Balamito!';
      return 'Prendi la spiga di mais dal cesto nella capanna di Nonna Ixchel.';
    }

    if (!f('altare_aperto')) {
      if (h('amuleto_giada')) return 'Scendi nel Cenote Sacro (dalla giungla) e usa l\'Amuleto di Giada sulla fessura dell\'altare di pietra.';
      return 'Dai il mais alla scimmietta nella giungla per ottenere l\'Amuleto di Giada.';
    }

    if (!f('maschera_presa')) return 'Prendi la Maschera d\'Oro del Serpente dallo scrigno aperto nell\'altare del Cenote!';

    if (!f('ninfea_raccolta')) {
      if (!f('rana_fuggita')) return 'Nel Cenote c\'è una grossa rana guardiana: usa la conchiglia rosa per spaventarla con un gran boato!';
      return 'Usa il bastone di selce per agganciare la Ninfea Sacra che galleggia nell\'acqua del Cenote.';
    }

    if (!f('pozione_pronta')) {
      if (!f('cacao_consegnato')) return 'Porta le fave di cacao a Nonna Ixchel nella capanna.';
      if (!f('ninfea_consegnata')) return 'Porta la Ninfea Sacra a Nonna Ixchel nella capanna.';
      return 'Nonna Ixchel sta per finire la Sacra Cioccolata Calma-Pancia!';
    }

    if (!f('tempio_sbloccato')) return 'Raggiungi la grande Piramide Maya e premi i dischi nell\'ordine della stele: prima GIAGUARO, poi SOLE, infine SERPENTE!';

    if (!f('sacerdote_mascherato')) return 'Sali in cima alla Piramide Maya e consegna la Maschera d\'Oro al Sommo Sacerdote Kukul-Pop!';

    return 'Tutto pronto: versa la Sacra Cioccolata nel Grande Braciere in cima alla piramide per calmare il vulcano!';
  }

  return {
    title: "Fili e l'Isola Maya",
    subtitle: 'Il Mistero del Vulcano Pernacchione',
    start: { room: 'maya_spiaggia', x: 130, y: 124 },
    actors: {
      fili: { color: '#ffe066' }, narr: { color: '#ffffff' },
      pescatore: { color: '#7be0ff' }, scimmia: { color: '#ffb86c' },
      capo: { color: '#ff9e7a' }, nonna: { color: '#ffd27a' },
      sacerdote: { color: '#7dff8a' }, rana: { color: '#b8f0ff' },
      vulcano: { color: '#ff6b6b' },
    },
    items, combos, rooms, hint,
  };
});
