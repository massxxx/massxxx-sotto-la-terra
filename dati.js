// Sotto la terra — dati dei 12 siti
// Strati dall'alto verso il basso. h: durezza (1 sciolto, 2 compatto, 3 duro: solo piccone). r: righe.
// Reperti: s = indice dello strato, w/h = celle, t:'s' = si trova solo col setaccio,
// d = disegno [tipo, parametri], pz = pezzi di base da ricomporre, x = iscrizione da decifrare, p = reperto principale.
const COLS = 11, ROWS = 24;

const SITI = [
{
  id:'pompei', nome:'Pompei', paese:'Italia', lon:14.49, lat:40.75, musica:'pompei',
  cielo:['#9fc6e8','#f3dcc0'], sfondo:'vesuvio',
  intro:'Città romana sepolta dall\'eruzione del Vesuvio nel 79 d.C. Sotto la cenere le case sono rimaste come quel giorno.',
  strati:[
    {n:'Terreno agricolo', e:'Oggi', c:'#6b4a2f', h:1, r:2, i:'Terra dei campi coltivati sopra la città.'},
    {n:'Terra degli scavi antichi', e:'1700–1800', c:'#8a6a4a', h:1, r:2, i:'Terra smossa dai primi scavi dei Borbone.'},
    {n:'Ceneri e flussi piroclastici', e:'79 d.C. (seconda fase)', c:'#9b9790', h:2, r:5, i:'Nubi di gas e cenere bollente scese dal Vesuvio: hanno conservato forme e oggetti.'},
    {n:'Lapilli di pomice', e:'79 d.C. (prima fase)', c:'#d8d0bd', h:1, r:5, i:'Sassolini di pomice leggeri caduti per ore come una grandinata.'},
    {n:'Pavimento della casa', e:'I secolo d.C.', c:'#b0533c', h:2, r:4, i:'Cocciopesto: calce mescolata a cocci di terracotta tritati.'},
    {n:'Strato sannitico', e:'II secolo a.C.', c:'#7d5b44', h:2, r:3, i:'La Pompei più antica, prima che diventasse colonia romana nell\'80 a.C.'},
    {n:'Lava antica', e:'Preistoria', c:'#3d3a3b', h:3, r:3, i:'Colata di lava molto più antica, su cui fu costruita la città.'}
  ],
  reperti:[
    {id:'pom-mosaico', n:'Mosaico «Cave canem»', s:4, w:3, h:2, d:['mosaicoCane'], pz:6, x:'latino', p:true,
     i:'All\'ingresso della Casa del Poeta Tragico un mosaico mostra un cane alla catena con la scritta CAVE CANEM, «attenti al cane».'},
    {id:'pom-affresco', n:'Frammento di affresco', s:4, w:2, h:2, d:['affresco',{c:'#a8322a',m:'uccello'}], pz:4,
     i:'Le pareti erano dipinte su intonaco ancora fresco. Il famoso rosso pompeiano veniva da ocre e, nelle case ricche, dal cinabro.'},
    {id:'pom-anfora', n:'Anfora da vino', s:3, w:1, h:3, d:['anfora',{c:'#c27a4b'}], pz:0,
     i:'Le anfore trasportavano vino, olio e garum, la salsa di pesce. Il fondo a punta si piantava nella sabbia o nei sostegni.'},
    {id:'pom-lucerna', n:'Lucerna in terracotta', s:4, w:2, h:1, d:['lucerna',{c:'#b9744a'}], pz:0,
     i:'Lampada a olio d\'oliva: lo stoppino usciva dal beccuccio. Era la luce di tutte le sere.'},
    {id:'pom-pane', n:'Pagnotta carbonizzata', s:4, w:2, h:2, d:['pane'], pz:0,
     i:'Nei forni di Pompei sono state trovate pagnotte diventate carbone, divise in otto spicchi per spezzarle a mano.'},
    {id:'pom-iscrizione', n:'Iscrizione elettorale', s:2, w:3, h:1, d:['iscrizione',{t:'C·IVLIVM·POLYBIVM·AED·O·V·F'}], pz:3,
     i:'I muri erano pieni di scritte dipinte per le elezioni. O·V·F voleva dire «oro vos faciatis», «vi prego di eleggerlo».'},
    {id:'pom-moneta', n:'Sesterzio di bronzo', s:4, t:'s', d:['moneta',{c:'#a8783c',g:'S·C'}], pz:0,
     i:'Il sesterzio era la moneta dei conti di tutti i giorni: un denario d\'argento valeva quattro sesterzi.'},
    {id:'pom-dado', n:'Dado d\'osso', s:3, t:'s', d:['dado'], pz:0,
     i:'I Romani giocavano a dadi con passione, anche se il gioco d\'azzardo era permesso solo in certe feste.'}
  ]
},
{
  id:'egitto', nome:'Valle dei Re', paese:'Egitto', lon:32.60, lat:25.74, musica:'egitto',
  cielo:['#7fb6e0','#f6e1b0'], sfondo:'colline',
  intro:'La valle di Tebe dove furono sepolti i faraoni del Nuovo Regno, con il villaggio degli artigiani di Deir el-Medina.',
  strati:[
    {n:'Sabbia portata dal vento', e:'Oggi', c:'#e3c48d', h:1, r:3, i:'Sabbia fine che il vento accumula ogni anno.'},
    {n:'Detriti di scavi antichi', e:'1800–1900', c:'#cdb187', h:1, r:3, i:'Terra gettata dagli esploratori dell\'Ottocento.'},
    {n:'Fango di piena', e:'Varie epoche', c:'#9c7a58', h:2, r:3, i:'Rari acquazzoni trasformavano la valle in un torrente di fango.'},
    {n:'Scaglie di calcare', e:'Nuovo Regno, 1500–1070 a.C.', c:'#e8dcc4', h:1, r:8, i:'I frammenti tolti scavando le tombe nella roccia, buttati davanti agli ingressi.'},
    {n:'Pavimento del villaggio', e:'Nuovo Regno', c:'#b9a07a', h:2, r:3, i:'Il villaggio degli operai che scavavano e decoravano le tombe.'},
    {n:'Calcare tebano', e:'Milioni di anni fa', c:'#cfc2a4', h:3, r:4, i:'La roccia in cui sono tagliate le tombe.'}
  ],
  reperti:[
    {id:'egi-canopo', n:'Vaso canopo', s:3, w:2, h:3, d:['canopo'], pz:5, p:true,
     i:'Nei quattro vasi canopi si conservavano gli organi del defunto. Il coperchio a testa di sciacallo è di Duamutef, protettore dello stomaco.'},
    {id:'egi-ushabti', n:'Ushabti', s:3, w:1, h:2, d:['ushabti'], pz:0,
     i:'Statuine che nell\'aldilà avrebbero lavorato al posto del defunto. In certe tombe ce n\'erano 365, una per ogni giorno.'},
    {id:'egi-scarabeo', n:'Scarabeo', s:3, w:1, h:1, d:['scarabeo'], pz:0,
     i:'Lo scarabeo era il simbolo del sole che rinasce ogni mattina. Si metteva sul cuore della mummia.'},
    {id:'egi-ostrakon', n:'Ostrakon dello scriba', s:4, w:2, h:2, d:['ostrakon'], pz:3, x:'geroglifici',
     i:'Gli scribi si esercitavano su schegge di calcare, che costavano meno del papiro. Ne sono state trovate migliaia a Deir el-Medina.'},
    {id:'egi-poggiatesta', n:'Poggiatesta in legno', s:3, w:2, h:2, d:['poggiatesta'], pz:0,
     i:'Gli Egizi dormivano appoggiando la testa su questi sostegni al posto del cuscino.'},
    {id:'egi-alabastro', n:'Vaso di alabastro', s:4, w:1, h:2, d:['vaso',{c:'#efe6d2',b:.7,n:.35,f:1}], pz:4,
     i:'L\'«alabastro» egizio è in realtà calcite, una pietra traslucida usata per vasi da profumi e unguenti.'},
    {id:'egi-perle', n:'Perle di faience', s:3, t:'s', d:['perle',{c:'#2fa7a0'}], pz:0,
     i:'La faience è una pasta di quarzo che cuocendo diventa lucida e azzurra, il colore della rinascita.'},
    {id:'egi-palma', n:'Frutto di palma dum', s:4, t:'s', d:['frutto',{c:'#8a5a2b'}], pz:0,
     i:'Nelle tombe si lasciavano cibi per il viaggio nell\'aldilà, come i frutti della palma dum.'}
  ]
},
{
  id:'lascaux', nome:'Grotta di Lascaux', paese:'Francia', lon:1.17, lat:45.05, musica:'lascaux',
  cielo:['#2a2622','#4a3d33'], sfondo:'grotta',
  intro:'Grotta scoperta nel 1940 da quattro ragazzi, con centinaia di animali dipinti circa 17.000 anni fa.',
  strati:[
    {n:'Terriccio e radici', e:'Oggi', c:'#4c3b2c', h:1, r:2, i:'Il suolo del bosco entrato dall\'ingresso.'},
    {n:'Crollo dell\'ingresso', e:'Dopo il Paleolitico', c:'#8f8576', h:2, r:5, i:'Massi e terra che chiusero la grotta per migliaia di anni, proteggendo le pitture.'},
    {n:'Suolo di frequentazione', e:'Circa 17.000 anni fa', c:'#5a4637', h:1, r:6, i:'Il pavimento dove camminavano i pittori, con carboni e strumenti.'},
    {n:'Argilla della grotta', e:'Più antica', c:'#a8794a', h:2, r:6, i:'Argilla depositata dall\'acqua che ha scavato la grotta.'},
    {n:'Calcare', e:'Circa 90 milioni di anni fa', c:'#c9bba0', h:3, r:5, i:'La roccia della collina, formata sul fondo di un mare antico.'}
  ],
  reperti:[
    {id:'las-lampada', n:'Lampada di arenaria', s:2, w:3, h:2, d:['lampadaPietra'], pz:4, p:true,
     i:'Una lampada scolpita in arenaria rossa: bruciava grasso animale e illuminava le pareti mentre si dipingeva.'},
    {id:'las-ocra', n:'Ocra rossa', s:2, w:1, h:1, d:['sasso',{c:'#b2462a'}], pz:0,
     i:'Il rosso delle pitture veniva dall\'ocra, una terra ricca di ferro, macinata e mescolata.'},
    {id:'las-manganese', n:'Ossido di manganese', s:2, w:1, h:1, d:['sasso',{c:'#2b2726'}], pz:0,
     i:'Il nero dei contorni era carbone o ossido di manganese.'},
    {id:'las-lama', n:'Lama di selce', s:2, w:2, h:1, d:['lama',{c:'#8f8f86'}], pz:0,
     i:'La selce si spezza in lame taglienti come vetro. Serviva per tagliare pelli e incidere le pareti.'},
    {id:'las-zagaglia', n:'Punta di zagaglia', s:2, w:3, h:1, d:['zagaglia'], pz:3,
     i:'Punta di lancia ricavata dal corno di renna, che allora viveva in Francia.'},
    {id:'las-conchiglia', n:'Conchiglia forata', s:3, w:1, h:1, d:['conchiglia',{c:'#e9dcc7'}], pz:0,
     i:'Conchiglie bucate per farne collane: alcune arrivavano dalla costa, a centinaia di chilometri.'},
    {id:'las-carbone', n:'Carboni del focolare', s:2, t:'s', d:['carbone'], pz:0,
     i:'Dai carboni si misura l\'età con il radiocarbonio: così si è saputo quando la grotta era frequentata.'},
    {id:'las-ago', n:'Ago d\'osso', s:3, t:'s', d:['ago'], pz:0,
     i:'Aghi con la cruna per cucire vestiti di pelle: un\'invenzione di quell\'epoca.'}
  ]
},
{
  id:'troia', nome:'Troia', paese:'Turchia', lon:26.24, lat:39.96, musica:'troia',
  cielo:['#8dbfe2','#f1e6c8'], sfondo:'collina',
  intro:'La collina di Hisarlik contiene nove città una sopra l\'altra: è il sito degli strati per eccellenza.',
  strati:[
    {n:'Troia IX, città romana', e:'Circa 85 a.C.–500 d.C.', c:'#7d6650', h:1, r:3, i:'La Ilio romana, visitata da imperatori che si credevano discendenti di Enea.'},
    {n:'Troia VIII, città greca', e:'Circa 700–85 a.C.', c:'#a07e5e', h:2, r:3, i:'Città greca con un tempio di Atena.'},
    {n:'Troia VII', e:'Circa 1300–950 a.C.', c:'#6a5547', h:2, r:4, i:'Lo strato distrutto da un incendio verso il 1180 a.C.: forse la Troia della guerra di Omero.'},
    {n:'Troia VI', e:'Circa 1700–1300 a.C.', c:'#b79470', h:2, r:5, i:'La città con le grandi mura in pietra.'},
    {n:'Troia II', e:'Circa 2550–2300 a.C.', c:'#8e5f43', h:2, r:4, i:'Qui Schliemann trovò il tesoro che chiamò, sbagliando epoca, «di Priamo».'},
    {n:'Troia I', e:'Circa 2900–2550 a.C.', c:'#5c4a3d', h:2, r:3, i:'Il primo villaggio fortificato sulla collina.'},
    {n:'Roccia', e:'Prima delle città', c:'#bdb09a', h:3, r:2, i:'Il calcare della collina.'}
  ],
  reperti:[
    {id:'tro-depas', n:'Depas amphikypellon', s:4, w:2, h:2, d:['depas'], pz:5, p:true,
     i:'Coppa alta a due anse di Troia II. Schliemann le diede il nome di una coppa descritta da Omero.'},
    {id:'tro-pithos', n:'Pithos', s:2, w:2, h:3, d:['vaso',{c:'#b06f45',b:1,n:.55,f:.5,a:1}], pz:6,
     i:'Grandi giare interrate nei pavimenti delle case di Troia VII per conservare grano, olio e vino.'},
    {id:'tro-freccia', n:'Punta di freccia in bronzo', s:2, w:1, h:1, d:['punta',{c:'#9a6b34'}], pz:0,
     i:'Punte di freccia tra le rovine bruciate di Troia VII fanno pensare a un assedio.'},
    {id:'tro-grigia', n:'Ceramica grigia', s:3, w:2, h:2, d:['vaso',{c:'#8a8f93',b:.85,n:.6,f:.7}], pz:4,
     i:'La ceramica grigia lucidata è tipica di Troia VI.'},
    {id:'tro-idolo', n:'Idolo di marmo', s:5, w:1, h:2, d:['idolo'], pz:0,
     i:'Piccole figure piatte con occhi incisi, dei primi villaggi della collina.'},
    {id:'tro-fusaiola', n:'Fusaiola', s:4, w:1, h:1, d:['fusaiola'], pz:0,
     i:'Peso forato per il fuso che serviva a filare la lana. A Troia ne sono state trovate migliaia.'},
    {id:'tro-moneta', n:'Moneta di Ilio', s:0, t:'s', d:['moneta',{c:'#a37a45',g:'ΙΛΙ'}], pz:0,
     i:'Le monete della città romana mostravano Atena o Ettore, l\'eroe troiano.'},
    {id:'tro-orecchino', n:'Orecchino d\'oro', s:4, t:'s', d:['orecchino'], pz:0,
     i:'Gioielli d\'oro lavorati con migliaia di granellini: facevano parte del tesoro di Troia II.'}
  ]
},
{
  id:'xian', nome:'Esercito di terracotta', paese:'Cina', lon:109.27, lat:34.38, musica:'xian',
  cielo:['#a9c3d6','#ead9bd'], sfondo:'campi',
  intro:'Nel 1974 alcuni contadini, scavando un pozzo, trovarono le statue dei soldati sepolti accanto al primo imperatore Qin Shi Huang.',
  strati:[
    {n:'Terreno agricolo', e:'Oggi', c:'#7a5b3c', h:1, r:3, i:'Campi di grano e cachi.'},
    {n:'Loess', e:'Dopo il 200 a.C.', c:'#c9a46a', h:1, r:5, i:'Terra gialla finissima portata dal vento dai deserti dell\'Asia.'},
    {n:'Crollo del tetto bruciato', e:'Fine del III secolo a.C.', c:'#4b3a30', h:2, r:4, i:'Il tetto di travi sopra le fosse bruciò e crollò sulle statue, rompendole.'},
    {n:'Pavimento di mattoni', e:'Circa 210 a.C.', c:'#6f6a66', h:2, r:5, i:'Le statue stavano in file su un pavimento di mattoni.'},
    {n:'Loess profondo', e:'Molto più antico', c:'#b8935d', h:2, r:7, i:'Terra mai scavata.'}
  ],
  reperti:[
    {id:'xia-guerriero', n:'Guerriero di terracotta', s:3, w:2, h:4, d:['guerriero'], pz:8, p:true,
     i:'Ogni soldato ha un volto diverso. Quasi tutti sono stati trovati in pezzi e ricomposti uno alla volta.'},
    {id:'xia-cavallo', n:'Testa di cavallo', s:3, w:2, h:2, d:['testaCavallo'], pz:4,
     i:'Nelle fosse c\'erano anche cavalli di terracotta a grandezza naturale che tiravano carri da guerra.'},
    {id:'xia-balestra', n:'Grilletto di balestra', s:3, w:2, h:1, d:['grilletto'], pz:0,
     i:'Meccanismo di bronzo così preciso che i pezzi di balestre diverse si potevano scambiare.'},
    {id:'xia-spada', n:'Spada di bronzo', s:3, w:3, h:1, d:['spada',{c:'#8f7a4a'}], pz:3,
     i:'Spade di bronzo con la lama ancora lucida dopo oltre duemila anni.'},
    {id:'xia-mattone', n:'Mattone del pavimento', s:3, w:2, h:1, d:['mattone',{c:'#6f6a66'}], pz:0,
     i:'Mattoni grigi cotti, posati uno per uno sotto le file di soldati.'},
    {id:'xia-colore', n:'Scaglia di pittura', s:2, w:1, h:1, d:['sasso',{c:'#c0392b'}], pz:0,
     i:'Le statue erano dipinte con colori vivaci sopra uno strato di lacca: all\'aria si sono staccati in pochi minuti.'},
    {id:'xia-freccia', n:'Punta di freccia a tre facce', s:3, t:'s', d:['punta',{c:'#7d6b3e'}], pz:0,
     i:'Nelle fosse sono state trovate decine di migliaia di punte di freccia tutte uguali.'},
    {id:'xia-banliang', n:'Moneta Ban Liang', s:2, t:'s', d:['moneta',{c:'#7a6a40',q:1,g:'半兩'}], pz:0,
     i:'Moneta rotonda con il foro quadrato, introdotta in tutta la Cina dal primo imperatore. Il nome vuol dire «mezza oncia».'}
  ]
},
{
  id:'mohenjo', nome:'Mohenjo-daro', paese:'Pakistan', lon:68.14, lat:27.33, musica:'mohenjo',
  cielo:['#a5c9e2','#f2dcae'], sfondo:'pianura',
  intro:'Una delle città più grandi della civiltà dell\'Indo, con strade diritte, pozzi e fognature, fiorita verso il 2500 a.C.',
  strati:[
    {n:'Sabbia e sale', e:'Oggi', c:'#e2cfa6', h:1, r:3, i:'Il sale che risale dal terreno sbriciola i mattoni antichi.'},
    {n:'Città tarda', e:'Circa 1900 a.C.', c:'#a8805c', h:2, r:4, i:'Case rifatte con mattoni riusati, quando la città stava declinando.'},
    {n:'Città matura', e:'Circa 2500 a.C.', c:'#b56a48', h:2, r:8, i:'Case di mattoni cotti, bagni privati e canali di scolo coperti.'},
    {n:'Livelli antichi', e:'Prima del 2600 a.C.', c:'#7f6450', h:2, r:5, i:'Gli strati più antichi stanno sotto il livello dell\'acqua del sottosuolo e sono quasi inesplorati.'},
    {n:'Limo dell\'Indo', e:'Più antico', c:'#9b8b70', h:2, r:4, i:'Il fango portato dal fiume.'}
  ],
  reperti:[
    {id:'moh-sigillo', n:'Sigillo dell\'«unicorno»', s:2, w:2, h:2, d:['sigillo'], pz:3, x:'indo', p:true,
     i:'Sigilli di pietra con animali e segni di scrittura, forse usati dai mercanti per marcare le merci.'},
    {id:'moh-pesi', n:'Pesi cubici', s:2, w:2, h:1, d:['pesi'], pz:0,
     i:'Pesi di pietra perfettamente uguali in tutta la valle: il sistema raddoppia, 1, 2, 4, 8, 16, 32, 64.'},
    {id:'moh-carretto', n:'Carretto giocattolo', s:2, w:2, h:2, d:['carretto'], pz:4,
     i:'Carretti in miniatura con le ruote, giocattoli dei bambini di 4.500 anni fa.'},
    {id:'moh-braccialetto', n:'Braccialetto di conchiglia', s:1, w:1, h:1, d:['anello',{c:'#efe5d6',s:.3}], pz:0,
     i:'Braccialetti ricavati da grandi conchiglie marine, tagliate con seghe sottilissime.'},
    {id:'moh-vaso', n:'Vaso dipinto', s:2, w:2, h:2, d:['vaso',{c:'#b4523a',b:.9,n:.5,f:.6,dec:'nero'}], pz:5,
     i:'Ceramica rossa decorata in nero con cerchi intrecciati e foglie di pipal.'},
    {id:'moh-mattone', n:'Mattone cotto', s:2, w:2, h:1, d:['mattone',{c:'#b56a48'}], pz:0,
     i:'I mattoni avevano quasi sempre le stesse proporzioni, 1 : 2 : 4.'},
    {id:'moh-dado', n:'Dado di terracotta', s:1, t:'s', d:['dado',{c:'#b98a63'}], pz:0,
     i:'Anche qui si giocava a dadi: sono tra i più antichi del mondo.'},
    {id:'moh-perle', n:'Perle di cornalina', s:2, t:'s', d:['perle',{c:'#c2502d'}], pz:0,
     i:'Perle lunghe forate da parte a parte con trapani di pietra: venivano vendute fino in Mesopotamia.'}
  ]
},
{
  id:'machu', nome:'Machu Picchu', paese:'Perù', lon:-72.55, lat:-13.16, musica:'machu',
  cielo:['#7fb0d8','#d9e7e2'], sfondo:'montagne',
  intro:'Città inca costruita verso il 1450 su una cresta delle Ande. Metà del lavoro è sottoterra: i terrazzamenti hanno strati fatti apposta.',
  strati:[
    {n:'Erba e humus', e:'Oggi', c:'#4b5a2e', h:1, r:2, i:'Il prato che copre i terrazzamenti.'},
    {n:'Terra coltivabile', e:'Circa 1450 d.C.', c:'#5e4430', h:1, r:5, i:'Terra fertile portata dal fondovalle, anche a spalla.'},
    {n:'Sabbia', e:'Circa 1450 d.C.', c:'#cdb88e', h:1, r:3, i:'Uno strato di sabbia per far scolare l\'acqua delle piogge.'},
    {n:'Ghiaia', e:'Circa 1450 d.C.', c:'#9a948a', h:2, r:4, i:'Pietrisco che drena ancora meglio.'},
    {n:'Pietre di drenaggio', e:'Circa 1450 d.C.', c:'#7b7770', h:2, r:5, i:'Grandi pietre: con questi strati la città non è mai franata, nonostante le piogge.'},
    {n:'Granito', e:'Circa 250 milioni di anni fa', c:'#a6a39e', h:3, r:5, i:'La roccia della montagna, tagliata per costruire i muri.'}
  ],
  reperti:[
    {id:'mac-khipu', n:'Khipu', s:2, w:3, h:2, d:['khipu'], pz:0, x:'khipu', p:true,
     i:'Gli Inca non usavano la scrittura ma le cordicelle annodate: i nodi segnano unità, decine e centinaia. Nei luoghi asciutti si sono conservati.'},
    {id:'mac-aryballo', n:'Aryballo', s:1, w:2, h:3, d:['aryballo'], pz:6,
     i:'Vaso inca a collo lungo e fondo a punta, per trasportare la chicha, la bevanda di mais, legato sulla schiena.'},
    {id:'mac-tupu', n:'Tupu', s:1, w:1, h:2, d:['tupu'], pz:0,
     i:'Grande spillo di bronzo o argento con cui le donne chiudevano il mantello.'},
    {id:'mac-tumi', n:'Tumi', s:1, w:1, h:2, d:['tumi'], pz:0,
     i:'Coltello a mezzaluna usato nelle cerimonie.'},
    {id:'mac-lama', n:'Statuetta di lama', s:2, w:1, h:1, d:['lama3d'], pz:0,
     i:'Piccoli lama d\'argento o di pietra venivano offerti alla montagna per proteggere le greggi.'},
    {id:'mac-bolas', n:'Pietre da boleadora', s:3, w:2, h:1, d:['bolas'], pz:0,
     i:'Pietre legate a corde: lanciate, si avvolgevano alle zampe degli animali.'},
    {id:'mac-mais', n:'Chicchi di mais', s:1, t:'s', d:['chicchi'], pz:0,
     i:'Sui terrazzamenti si coltivavano mais e patate a quote diverse, come in un laboratorio.'},
    {id:'mac-spondylus', n:'Conchiglia spondylus', s:2, t:'s', d:['conchiglia',{c:'#d8573a'}], pz:0,
     i:'Conchiglia rossa del mare dell\'Ecuador, preziosa più dell\'oro per gli Inca.'}
  ]
},
{
  id:'olduvai', nome:'Gola di Olduvai', paese:'Tanzania', lon:35.35, lat:-2.99, musica:'olduvai',
  cielo:['#8cc0e6','#f4d9a6'], sfondo:'savana',
  intro:'Una gola lunga 50 km dove gli strati raccontano quasi due milioni di anni di storia umana. Qui hanno lavorato Mary e Louis Leakey.',
  strati:[
    {n:'Strato di Naisiusiu', e:'Circa 20.000 anni fa', c:'#c8a77a', h:1, r:2, i:'Lo strato più recente in cima alla gola.'},
    {n:'Letti III e IV', e:'Circa 1,2–0,6 milioni di anni fa', c:'#b4573b', h:2, r:5, i:'Argille rosse di fiumi e piane alluvionali.'},
    {n:'Letto II', e:'Circa 1,7–1,2 milioni di anni fa', c:'#a68c6a', h:2, r:6, i:'Qui compaiono le prime amigdale, strumenti lavorati su due facce.'},
    {n:'Tufo vulcanico', e:'Circa 1,75 milioni di anni fa', c:'#d9d1bf', h:2, r:2, i:'Cenere di vulcano: i cristalli si possono datare con grande precisione.'},
    {n:'Letto I', e:'Circa 2–1,75 milioni di anni fa', c:'#7e715f', h:2, r:6, i:'Sponde di un antico lago, con i primi strumenti di pietra detti olduvaiani.'},
    {n:'Basalto', e:'Circa 2 milioni di anni fa', c:'#3e3d40', h:3, r:3, i:'Colata di lava alla base della gola.'}
  ],
  reperti:[
    {id:'old-amigdala', n:'Amigdala', s:2, w:2, h:3, d:['amigdala'], pz:4, p:true,
     i:'Strumento a goccia lavorato su entrambe le facce: il «coltellino svizzero» usato per più di un milione di anni.'},
    {id:'old-chopper', n:'Chopper', s:4, w:2, h:2, d:['chopper'], pz:0,
     i:'Ciottolo con qualche colpo per fare un bordo tagliente: tra gli strumenti più antichi del mondo.'},
    {id:'old-dente', n:'Dente di ominino', s:4, w:1, h:1, d:['dente'], pz:0,
     i:'Nel 1959 Mary Leakey trovò qui un cranio con denti enormi, di un parente lontano detto «Schiaccianoci».'},
    {id:'old-osso', n:'Osso con segni di taglio', s:4, w:3, h:1, d:['osso',{tagli:1}], pz:3,
     i:'Righe sottili lasciate da strumenti di pietra: la prova che si staccava la carne dalle ossa.'},
    {id:'old-percussore', n:'Percussore', s:2, w:1, h:1, d:['sasso',{c:'#5d5a57',r:1}], pz:0,
     i:'Il sasso usato come martello per scheggiare gli altri.'},
    {id:'old-ippo', n:'Dente di ippopotamo fossile', s:1, w:2, h:1, d:['zanna'], pz:0,
     i:'Ippopotami, elefanti e antilopi vivevano attorno al lago.'},
    {id:'old-scheggia', n:'Scheggia tagliente', s:4, t:'s', d:['lama',{c:'#b9b2a2'}], pz:0,
     i:'Le schegge staccate dal ciottolo erano già lame taglienti.'},
    {id:'old-cenere', n:'Cristalli di cenere', s:3, t:'s', d:['cristalli'], pz:0,
     i:'Dai cristalli della cenere vulcanica si calcola l\'età degli strati sopra e sotto.'}
  ]
},
{
  id:'birka', nome:'Birka', paese:'Svezia', lon:17.54, lat:59.34, musica:'birka',
  cielo:['#9db8cf','#e4e8ea'], sfondo:'lago',
  intro:'Città mercantile vichinga su un\'isola del lago Mälaren, viva fra il 750 e il 975 circa.',
  strati:[
    {n:'Prato', e:'Oggi', c:'#4f6b35', h:1, r:2, i:'L\'isola oggi è un prato con le pecore.'},
    {n:'Terra nera', e:'Circa 750–975', c:'#2f2a27', h:1, r:7, i:'Strato scuro pieno di rifiuti, carbone e ossa: il terreno della città vichinga.'},
    {n:'Fondazioni di case', e:'Circa 800', c:'#6a5240', h:2, r:5, i:'Pali e travi delle case di legno.'},
    {n:'Spiaggia antica', e:'Circa 700', c:'#c8b893', h:1, r:5, i:'Il lago era più alto: la terra si solleva ancora oggi dopo la fine dell\'era glaciale.'},
    {n:'Granito', e:'Molto antico', c:'#8f8a87', h:3, r:5, i:'La roccia dell\'isola.'}
  ],
  reperti:[
    {id:'bir-rune', n:'Osso con rune', s:1, w:3, h:1, d:['ossoRune'], pz:3, x:'rune', p:true,
     i:'Le rune del Futhark recente erano solo 16 per tutti i suoni: si incidevano su legno, osso e pietra.'},
    {id:'bir-pettine', n:'Pettine d\'osso', s:1, w:2, h:1, d:['pettine'], pz:3,
     i:'I Vichinghi si pettinavano spesso: i pettini di corno di cervo sono tra gli oggetti più comuni.'},
    {id:'bir-fibula', n:'Fibula ovale', s:1, w:2, h:1, d:['fibula'], pz:0,
     i:'Le donne portavano due fibule ovali di bronzo sulle spalle per tenere il vestito.'},
    {id:'bir-bilancia', n:'Bilancia pieghevole', s:2, w:2, h:1, d:['bilancia'], pz:0,
     i:'I mercanti pesavano l\'argento con bilance che si chiudevano in una scatolina.'},
    {id:'bir-ascia', n:'Ascia di ferro', s:2, w:2, h:2, d:['ascia'], pz:0,
     i:'Ascia da lavoro e da combattimento, con il manico di legno ormai sparito.'},
    {id:'bir-pattino', n:'Pattino d\'osso', s:1, w:3, h:1, d:['osso',{}], pz:0,
     i:'Ossa di cavallo levigate legate sotto le scarpe per scivolare sul lago ghiacciato.'},
    {id:'bir-dirham', n:'Dirham d\'argento', s:1, t:'s', d:['moneta',{c:'#c9c9c9',g:'ﻻ'}], pz:0,
     i:'Monete d\'argento arabe arrivate dal Mar Caspio lungo i fiumi della Russia.'},
    {id:'bir-perle', n:'Perle di vetro', s:1, t:'s', d:['perle',{c:'#3f74b5',m:1}], pz:0,
     i:'Perle colorate di vetro. Il viaggiatore arabo Ibn Fadlan scrisse che i Vichinghi pagavano una perla verde un dirham d\'argento.'}
  ]
},
{
  id:'palenque', nome:'Palenque', paese:'Messico', lon:-92.05, lat:17.48, musica:'palenque',
  cielo:['#8dbad6','#d8ebd2'], sfondo:'giungla',
  intro:'Città maya nella foresta del Chiapas, al massimo splendore nel VII secolo con il re Pakal.',
  strati:[
    {n:'Foresta e radici', e:'Oggi', c:'#3f4a2a', h:1, r:3, i:'La giungla ha coperto la città per secoli.'},
    {n:'Crollo di volte e stucco', e:'Dopo l\'800', c:'#c9c2b2', h:2, r:5, i:'Pietre e stucchi caduti dai tetti quando la città fu abbandonata.'},
    {n:'Pavimento del tempio', e:'Circa 650–700', c:'#e6dfcf', h:2, r:4, i:'Pavimento di stucco bianco, un tempo dipinto di rosso.'},
    {n:'Riempimento della piramide', e:'VII secolo', c:'#8b7d68', h:2, r:7, i:'Pietre e terra che formano il corpo della piramide.'},
    {n:'Calcare', e:'Molto antico', c:'#bfb7a3', h:3, r:5, i:'La roccia della collina.'}
  ],
  reperti:[
    {id:'pal-maschera', n:'Maschera di giada', s:3, w:3, h:3, d:['maschera'], pz:10, p:true,
     i:'Il re Pakal fu sepolto con una maschera fatta di centinaia di tessere di giada: era a pezzi ed è stata ricomposta.'},
    {id:'pal-glifi', n:'Pannello con numeri', s:2, w:3, h:2, d:['pannelloMaya'], pz:4, x:'maya',
     i:'I Maya contavano in base venti con punti (uno), barre (cinque) e una conchiglia per lo zero.'},
    {id:'pal-ossidiana', n:'Lama di ossidiana', s:2, w:2, h:1, d:['lama',{c:'#1f1d24',lucido:1}], pz:0,
     i:'Vetro vulcanico nero, più tagliente di un bisturi d\'acciaio.'},
    {id:'pal-cacao', n:'Vaso per il cacao', s:2, w:2, h:2, d:['vaso',{c:'#d9a66e',b:.8,n:.85,f:.85,dec:'maya'}], pz:5,
     i:'Il cacao si beveva amaro e schiumoso; nei vasi sono rimaste tracce chimiche della bevanda.'},
    {id:'pal-incensiere', n:'Incensiere', s:1, w:2, h:3, d:['incensiere'], pz:6,
     i:'Tubi di terracotta decorati con il volto di un dio, dove si bruciava la resina copal.'},
    {id:'pal-metate', n:'Macina e pestello', s:3, w:3, h:1, d:['metate'], pz:0,
     i:'Sul metate di pietra si macinava il mais ogni giorno per fare le tortillas.'},
    {id:'pal-giada', n:'Perle di giada', s:3, t:'s', d:['perle',{c:'#3f9a6a'}], pz:0,
     i:'La giada verde era la pietra più preziosa: simbolo di acqua e mais.'},
    {id:'pal-spondylus', n:'Conchiglia rossa', s:3, t:'s', d:['conchiglia',{c:'#c94a2b'}], pz:0,
     i:'Conchiglie spondylus arrivavano dalla costa e si mettevano nelle tombe dei re.'}
  ]
},
{
  id:'cnosso', nome:'Cnosso', paese:'Grecia (Creta)', lon:25.16, lat:35.30, musica:'cnosso',
  cielo:['#85bde6','#f3e6c8'], sfondo:'ulivi',
  intro:'Il palazzo minoico più grande di Creta, con centinaia di stanze: forse l\'origine della leggenda del labirinto.',
  strati:[
    {n:'Terra e ulivi', e:'Oggi', c:'#7b5d3f', h:1, r:3, i:'Un uliveto copriva la collina prima degli scavi.'},
    {n:'Crollo e incendio', e:'Circa 1375 a.C.', c:'#4d3b33', h:2, r:5, i:'Il palazzo bruciò: il fuoco cosse le tavolette d\'argilla e le conservò.'},
    {n:'Pavimento del palazzo', e:'Circa 1450 a.C.', c:'#d8c9a8', h:2, r:4, i:'Lastre di gesso e pietra delle sale.'},
    {n:'Palazzo antico', e:'Circa 1900–1700 a.C.', c:'#a77d58', h:2, r:5, i:'Il primo palazzo, distrutto forse da un terremoto e ricostruito.'},
    {n:'Villaggio neolitico', e:'Circa 7000 a.C.', c:'#6d5a48', h:2, r:4, i:'Uno degli insediamenti agricoli più antichi d\'Europa.'},
    {n:'Calcare', e:'Molto antico', c:'#cbbd9f', h:3, r:3, i:'La roccia della collina.'}
  ],
  reperti:[
    {id:'cno-tavoletta', n:'Tavoletta in Lineare B', s:1, w:2, h:2, d:['tavoletta'], pz:4, x:'lineareb', p:true,
     i:'Registri del palazzo scritti in Lineare B, la scrittura del greco più antico. La decifrò Michael Ventris nel 1952.'},
    {id:'cno-delfini', n:'Affresco dei delfini', s:2, w:3, h:2, d:['affresco',{c:'#8cc4dc',m:'delfino'}], pz:6,
     i:'Delfini e pesci dipinti nelle stanze del palazzo: i Minoici amavano il mare.'},
    {id:'cno-pithos', n:'Pithos dei magazzini', s:2, w:2, h:3, d:['vaso',{c:'#c08857',b:1,n:.6,f:.55,a:1,dec:'corde'}], pz:6,
     i:'Nei magazzini c\'erano file di giare alte come un uomo, per olio, vino e grano.'},
    {id:'cno-labrys', n:'Doppia ascia', s:2, w:2, h:2, d:['labrys'], pz:0,
     i:'La labrys era un simbolo sacro. Da questa parola forse viene «labirinto».'},
    {id:'cno-rhyton', n:'Rhyton a testa di toro', s:1, w:2, h:2, d:['rhyton'], pz:5,
     i:'Vaso per offerte liquide a forma di testa di toro, l\'animale più importante per i Minoici.'},
    {id:'cno-kamares', n:'Tazza di Kamares', s:3, w:1, h:1, d:['vaso',{c:'#2c2a2f',b:.8,n:.9,f:.6,dec:'kamares'}], pz:3,
     i:'Ceramica dalle pareti sottili come un guscio d\'uovo, dipinta a spirali su fondo scuro.'},
    {id:'cno-sigillo', n:'Sigillo di pietra', s:2, t:'s', d:['sigilloTondo'], pz:0,
     i:'Pietre dure incise con animali, usate per chiudere e firmare vasi e documenti.'},
    {id:'cno-ascia', n:'Ascia di pietra levigata', s:4, t:'s', d:['asciaPietra'], pz:0,
     i:'I primi contadini di Cnosso tagliavano il bosco con asce di pietra levigata.'}
  ]
},
{
  id:'sutton', nome:'Sutton Hoo', paese:'Inghilterra', lon:1.34, lat:52.09, musica:'sutton',
  cielo:['#a9bfcf','#e9e6dc'], sfondo:'tumuli',
  intro:'Nel 1939 sotto un tumulo fu trovata l\'impronta di una nave di 27 metri: la tomba di un re anglosassone, forse Rædwald, morto verso il 625.',
  strati:[
    {n:'Brughiera', e:'Oggi', c:'#5f5b36', h:1, r:2, i:'Erica e felci sopra i tumuli.'},
    {n:'Sabbia del tumulo', e:'Circa 625 d.C.', c:'#d3b47d', h:1, r:7, i:'Sabbia ammucchiata sopra la nave per formare la collinetta.'},
    {n:'Impronta della nave', e:'Circa 625 d.C.', c:'#7e5a3c', h:1, r:3, i:'Il legno è sparito: restano la sua ombra nella sabbia e le file di chiodi.'},
    {n:'Camera funeraria', e:'Circa 625 d.C.', c:'#5b4433', h:2, r:5, i:'La stanza al centro della nave con il tesoro.'},
    {n:'Sabbia naturale', e:'Glaciale', c:'#e0c99a', h:2, r:7, i:'Sabbie lasciate dai ghiacciai.'}
  ],
  reperti:[
    {id:'sut-elmo', n:'Elmo di Sutton Hoo', s:3, w:3, h:3, d:['elmo'], pz:10, p:true,
     i:'L\'elmo era schiacciato in centinaia di frammenti di ferro: c\'è voluto un lavoro di anni per ricomporlo.'},
    {id:'sut-fibbia', n:'Fibbia d\'oro', s:3, w:2, h:1, d:['fibbia'], pz:0,
     i:'Una grande fibbia d\'oro cava, decorata con animali intrecciati, che pesa più di 400 grammi.'},
    {id:'sut-fermagli', n:'Fermagli da spalla', s:3, w:2, h:1, d:['fermagli'], pz:0,
     i:'Oro con granati rossi tagliati sottilissimi, incastonati uno per uno.'},
    {id:'sut-umbone', n:'Umbone dello scudo', s:3, w:2, h:2, d:['umbone'], pz:3,
     i:'La cupola di metallo al centro dello scudo, che proteggeva la mano.'},
    {id:'sut-corno', n:'Corno potorio', s:3, w:3, h:1, d:['corno'], pz:3,
     i:'Corni di uro decorati d\'argento per bere durante i banchetti.'},
    {id:'sut-cucchiai', n:'Cucchiai d\'argento', s:3, w:2, h:1, d:['cucchiai'], pz:0,
     i:'Due cucchiai con incisi i nomi SAVLOS e PAVLOS, forse un dono legato al battesimo.'},
    {id:'sut-rivetto', n:'Chiodo della nave', s:2, t:'s', d:['rivetto'], pz:0,
     i:'Le file di chiodi arrugginiti hanno permesso di ridisegnare tutta la nave.'},
    {id:'sut-moneta', n:'Moneta d\'oro merovingia', s:3, t:'s', d:['moneta',{c:'#d4a83a',g:'+'}], pz:0,
     i:'Nella borsa c\'erano 37 monete d\'oro dalla Francia, tutte di zecche diverse.'}
  ]
}
];

// Iscrizioni da decifrare
const ISCRIZIONI = {
  latino:{k:'parole', titolo:'Traduci dal latino',
    righe:[{w:'CAVE', ok:'attento a', alt:['vieni da','casa del']},{w:'CANEM', ok:'il cane', alt:['la cena','il pane']}],
    aiuto:'cavēre = stare in guardia · canis = cane (canem quando è il complemento)',
    lettura:'CAVE CANEM: «Attenti al cane»'},
  geroglifici:{k:'segni', font:'eg', titolo:'Leggi i segni-suono',
    aiuto:'Gli Egizi avevano una ventina di segni che valevano un solo suono. Champollion lo capì nel 1822.',
    tab:[['𓄿','a'],['𓇋','i'],['𓂝','ʿa'],['𓅱','u'],['𓃀','b'],['𓊪','p'],['𓆑','f'],['𓅓','m'],['𓈖','n'],['𓂋','r'],['𓉔','h'],['𓐍','kh'],['𓋴','s'],['𓎡','k'],['𓏏','t'],['𓂧','d']],
    parole:[{g:['𓈖','𓆑','𓂋'], let:'nefer', sig:'bello, buono'},{g:['𓂝','𓈖','𓐍'], let:'ankh', sig:'vita'},{g:['𓇋','𓅓','𓈖'], let:'Amon', sig:'il dio Amon'}],
    lettura:'Esercizio dello scriba: nefer «bello», ankh «vita», Amon. Le vocali non si scrivevano: le aggiungiamo noi.'},
  rune:{k:'segni', font:'ru', titolo:'Leggi le rune',
    aiuto:'Futhark recente: 16 rune in tutto, ogni runa vale un suono.',
    tab:[['ᚠ','f'],['ᚢ','u'],['ᚦ','th'],['ᚬ','o'],['ᚱ','r'],['ᚴ','k'],['ᚼ','h'],['ᚾ','n'],['ᛁ','i'],['ᛅ','a'],['ᛋ','s'],['ᛏ','t'],['ᛒ','b'],['ᛘ','m'],['ᛚ','l'],['ᛦ','R']],
    parole:[{g:['ᚴ','ᛅ','ᛘ','ᛒ'], let:'kamb', sig:'pettine'},{g:['ᛋ','ᛏ','ᛅ','ᛁ','ᚾ'], let:'stain', sig:'pietra'}],
    lettura:'Esercizio di rune: kamb «pettine», stain «pietra».'},
  lineareb:{k:'segni', font:'lb', titolo:'Leggi la Lineare B',
    aiuto:'Ogni segno è una sillaba. Ventris partì dai nomi delle città di Creta.',
    tab:[['𐀀','a'],['𐀂','i'],['𐀒','ko'],['𐀜','no'],['𐀰','so'],['𐀖','mi'],['𐀛','ni'],['𐀞','pa'],['𐀵','to'],['𐀏','ka'],['𐀴','ti'],['𐀪','ri'],['𐀡','po'],['𐀅','da']],
    parole:[{g:['𐀒','𐀜','𐀰'], let:'ko-no-so', sig:'Cnosso'},{g:['𐀀','𐀖','𐀛','𐀰'], let:'a-mi-ni-so', sig:'Amniso, il porto'},{g:['𐀞','𐀂','𐀵'], let:'pa-i-to', sig:'Festo'}],
    lettura:'Tre città di Creta scritte sulle tavolette: Cnosso, Amniso e Festo.'},
  maya:{k:'maya', titolo:'Leggi i numeri maya',
    aiuto:'Punto = 1 · barra = 5 · conchiglia = 0. Il piano di sopra vale 20 volte di più.',
    numeri:[13,7,0,25],
    lettura:'13, 7, 0 e 25 (un 20 nel piano di sopra più 5 sotto).'},
  khipu:{k:'khipu', titolo:'Leggi il khipu',
    aiuto:'Nodi in alto = centinaia, in mezzo = decine, in basso = unità. L\'ultima corda è la somma.',
    corde:[243,105,348],
    lettura:'243 + 105 = 348: un conto di raccolti o di persone, controllato con la corda della somma.'},
  indo:{k:'indo', titolo:'Prova a leggere il sigillo',
    lettura:'La scrittura dell\'Indo non è ancora stata decifrata: i testi sono troppo brevi e non c\'è una «stele di Rosetta». Forse un giorno ci riuscirà qualcuno.'}
};
