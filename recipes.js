/* Haltbar – Rezeptideen für das, was im Kühlschrank liegt.
 *
 * Eigene, kurze Alltagsrezepte für 2 Personen.
 * Rezept: [Titel, Bild aus foods.js, Minuten, Zutaten, Schritte]
 * Zutat:  ['Menge|Name', Erkennung, Art]
 *   Erkennung: Name aus M (unten) oder direkt: Wortteile mit | getrennt, die im Namen des
 *              Lebensmittels stehen; @schlüssel = Bildgruppe aus foods.js; !wort = passt nicht;
 *              ^ / $ = Wortanfang / -ende des ganzen Namens.
 *   Art: '' = gehört dazu, 'o' = optional, 'g' = Grundzutat (hat man meist da, zählt nicht)
 */
(function (root) {
  'use strict';

  const F = root.Foods;

  const M = {
    hack: 'hack|gehacktes|faschiertes|patties|!braten',
    haehnchen: '@haehnchen|!nugget',
    fleischPfanne: '@haehnchen|schnitzel|geschnetzeltes|steak|filet|schwein|kalb|rind|!wurst|!hack|!schmalz|!schinken|!bruhe|!nugget|!speck|!bauch|!fisch|!lachs',
    schnitzel: 'schnitzel|kotelett',
    speck: '@speck',
    schinken: 'schinken|!palatschinken',
    schinkenSpeck: '@speck|schinken|!palatschinken',
    aufschnitt: '@aufschnitt|@speck|schinken|salami|!palatschinken|!leberwurst|!teewurst|!streich|!mett|!blut|!pressack|!sulze',
    brotzeit: '@aufschnitt|@speck|schinken|!palatschinken|!wurfel',
    wurstsalat: 'lyoner|fleischwurst|gelbwurst|jagdwurst|bierwurst|schinkenwurst|^wurst$|aufschnitt|!kase',
    wuerstchen: '@wurst|!curry|!salamistick|!landjager|!cabanossi|!kabanos',
    wurstAlle: '@aufschnitt|@wurst|!leberwurst|!teewurst|!streich|!mett|!blut|!curry|!kase|!pressack|!sulze',
    lachs: 'lachs|forelle|!schinken',
    lachsFrisch: 'lachs|!raucher|!graved|!schinken|!stremel',
    fischFilet: 'lachs|kabeljau|seelachs|dorsch|fischfilet|forelle|zander|pangasius|rotbarsch|scholle|skrei|seehecht|!raucher|!graved|!schinken|!stabchen',
    thunfisch: 'thunfisch',
    garnelen: '@garnelen',
    eier: '@eier',
    milch: '@milch|!sahne|!rahm|!obers|!kondens|!kaffeeweisser|!kefir|!ayran|!lassi|!dickmilch',
    sahne: 'sahne|rahm|obers|creme fraiche|creme double|schmand|!joghurt|!torte|!pudding|!eis|!butter|!spruh|!spinat|!gemuse',
    sahneMilch: 'sahne|rahm|obers|creme fraiche|@milch|!joghurt|!torte|!pudding|!eis|!butter|!spruh|!spinat|!gemuse|!kondens',
    kokosSahne: 'kokosmilch|sahne|rahm|creme fraiche|!joghurt|!torte|!pudding|!eis|!butter|!spinat|!gemuse',
    schmand: 'schmand|creme fraiche|creme double|saure sahne|sauerrahm|!butter',
    joghurt: 'joghurt|jogurt|yoghurt|yogurt|skyr|!frozen',
    joghurtSchmand: 'joghurt|jogurt|yoghurt|skyr|schmand|creme fraiche|saure sahne|sauerrahm|!frozen|!butter',
    joghurtMayo: 'joghurt|jogurt|yoghurt|skyr|mayo|remoulade|salatcreme|!frozen',
    joghurtQuark: 'joghurt|jogurt|yoghurt|skyr|quark|topfen|!frozen',
    milchJoghurt: '@milch|joghurt|jogurt|yoghurt|skyr|!sahne|!rahm|!kondens|!frozen',
    quark: 'quark|topfen|skyr',
    frischkaese: 'frischkase|philadelphia|!korniger',
    schmelzFrisch: 'schmelzkase|frischkase|streichkase|philadelphia|!korniger',
    sahneSchmelz: 'sahne|rahm|schmelzkase|frischkase|creme fraiche|!joghurt|!torte|!butter|!spinat|!gemuse|!eis|!pudding',
    kaese: '@kaese|!frischkase|!mascarpone|!ricotta|!huttenkase|!korniger|!streichkase|!schmelzkase|!philadelphia',
    parmesan: 'parmesan|grana|pecorino|bergkase',
    mozzarella: 'mozzarella|burrata',
    feta: 'feta|hirtenkase|schafskase',
    fetaKaese: 'feta|hirtenkase|schafskase|@kaese|!frischkase|!mascarpone|!ricotta|!streich',
    kaeseAufschnitt: '@kaese|@aufschnitt|schinken|!frischkase|!mascarpone|!ricotta|!streich|!leberwurst|!teewurst|!mett|!blut|!palatschinken',
    butter: '@butter',
    tomate: '@tomate|!ketchup|!suppe',
    tomateAnanas: '@tomate|@ananas|!ketchup|!suppe|!saft',
    radTom: 'radieschen|@tomate|!ketchup|!suppe',
    paprika: '@paprika',
    zucchini: 'zucchini',
    zucchiniPaprika: 'zucchini|@paprika',
    aubergine: '@aubergine',
    gurke: 'gurke|!gewurz|!essig|!senf|!dill|!cornichon|!schmor|!glas|!gurkensalat',
    gurkeAlle: '@gurke|!zucchini|!gurkensalat',
    gurkeRadieschen: 'gurke|radieschen|!gewurz|!essig|!senf|!dill|!cornichon|!gurkensalat',
    gewuerzgurke: 'gewurzgurke|essiggurke|cornichon|senfgurke|dillgurke|saure gurke|gurken im glas',
    zwiebel: '@zwiebel|!rost',
    fruehlingszwiebel: 'fruhlingszwiebel|lauchzwiebel',
    roestzwiebeln: 'rostzwiebel',
    knoblauch: '@knoblauch',
    ingwer: '@ingwer',
    ingwerKnoblauch: '@ingwer|@knoblauch',
    chili: '@chili',
    karotte: 'karotte|mohre|mohrrube|rubli|!saft|!kuchen|!torte',
    kartoffel: '@kartoffel|!puree|!brei',
    kartoffelSuess: '@kartoffel|@suesskartoffel|!puree|!brei',
    brokkoli: 'brokkoli|broccoli|blumenkohl|romanesco|karfiol',
    spinat: 'spinat|mangold',
    spinatErbsen: 'spinat|mangold|erbsen|!kicher|!suppe',
    pilze: '@pilze',
    lauch: 'lauch|porree|!knoblauch|!schnittlauch|!barlauch|!zwiebel',
    lauchSellerie: 'lauch|porree|sellerie|!knoblauch|!schnittlauch|!barlauch|!zwiebel',
    salat: '@blattsalat|^salat$|salatmix|salatmischung|!kohl|!kraut|!spinat|!lauch|!porree|!sellerie|!fenchel|!artischock|!mangold',
    salatGurke: '@blattsalat|^salat$|salatmix|gurke|!kohl|!kraut|!spinat|!lauch|!porree|!sellerie|!fenchel|!gewurz|!essig|!gurkensalat',
    kohl: 'weisskohl|spitzkohl|weisskraut|^kohl$|^kraut$|chinakohl|rotkohl|blaukraut|rotkraut',
    kuerbis: '@kuerbis|!kerne',
    mais: '@mais|!starke|!waffel',
    maisBohnen: '@mais|kidney|bohnen|!grune|!brech|!busch|!stangen|!prinzess|!kenia|!kaffee|!soja|!starke|!waffel',
    erbsen: 'erbsen|!kicher|!suppe',
    bohnen: 'kidney|bohnen|!grune|!brech|!busch|!stangen|!prinzess|!kenia|!kaffee|!soja',
    linsen: 'linsen|!suppe',
    kokosmilch: 'kokosmilch',
    tofu: 'tofu|tempeh',
    oliven: '@oliven|!olivenol',
    apfel: '@apfel|@apfel_gruen|!mus|!saft|!schorle|!essig|!kuchen|!strudel',
    apfelmus: 'apfelmus|apfelmark',
    apfelmusApfel: 'apfelmus|@apfel|@apfel_gruen|!saft|!schorle|!essig|!kuchen|!strudel',
    banane: '@banane|!chips',
    bananeBeeren: '@banane|@erdbeere|@beeren|!marmelade|!konfiture|!joghurt|!eis|!chips',
    beeren: '@erdbeere|@beeren|@kirschen|!marmelade|!konfiture|!joghurt|!eis|!saft|!kuchen|!torte',
    obst: '@apfel|@apfel_gruen|@birne|@banane|@orange|@trauben|@erdbeere|@beeren|@kirschen|@pfirsich|@mango|@ananas|@kiwi|@melone|@wassermelone|!mus|!saft|!marmelade|!konfiture|!chips|!essig|!kuchen|!torte|!joghurt|!eis|!rosinen',
    obstMus: '@apfel|@apfel_gruen|@birne|@banane|@erdbeere|@beeren|@kirschen|@pfirsich|@mango|apfelmus|!saft|!marmelade|!konfiture|!chips|!essig|!kuchen|!torte|!joghurt|!eis',
    zitrone: '@zitrone|@limette',
    dillZitrone: 'dill|@zitrone|@limette|krauter',
    kraeuter: '@kraeuter|!spargel|!lorbeer',
    schnittlauch: 'schnittlauch|petersilie|dill|krauter|barlauch|kresse',
    dill: 'dill|krauter|petersilie|schnittlauch|!gurke',
    honig: '@honig',
    brot: '@brot|@baguette|!knacke|!zwieback|!pumpernickel|!brosel|!paniermehl',
    toast: 'toast|brotchen|weissbrot|baguette|ciabatta|@brot|!knacke|!zwieback|!pumpernickel|!brosel',
    broetchen: 'brotchen|semmel|schrippe|weck|toast|weissbrot|baguette|ciabatta|!brosel',
    broetchenBurger: 'burgerbrotchen|buns|brotchen|semmel',
    baguetteBrot: '@baguette|@brot|!knacke|!zwieback|!pumpernickel|!brosel',
    wraps: 'wraps|tortilla|fladenbrot|pita|^wrap$|!chips',
    tacoWraps: 'taco|wraps|tortilla|^wrap$|!chips',
    teig: 'pizzateig|flammkuchenteig|blatterteig|murbeteig|quicheteig|hefeteig|^teig$',
    teigWraps: 'pizzateig|flammkuchenteig|hefeteig|^teig$|wraps|tortilla|^wrap$|!chips',
    blaetterteig: 'blatterteig',
    nudeln: '@nudeln|!bolognese|!carbonara|!mac and|!lasagneplatten|!spatzle|!knopfle',
    reisNudeln: '@reis|@nudeln|!milchreis|!bolognese|!carbonara|!couscous|!bulgur',
    brotNudeln: '@baguette|@brot|@nudeln|!knacke|!zwieback|!bolognese|!carbonara',
    spaetzle: 'spatzle|knopfle',
    lasagne: 'lasagneplatten|lasagneblatter',
    gnocchi: 'gnocchi',
    tortellini: 'tortellini|tortelloni|ravioli',
    reis: '@reis|!milchreis|!couscous|!bulgur|!quinoa|!hirse|!graupen|!waffel',
    risotto: 'risotto|reis|!milchreis|!waffel|!nudel|!wein',
    reisBrot: '@reis|@brot|@baguette|!milchreis|!knacke|!zwieback',
    milchreis: 'milchreis|rundkornreis',
    couscous: 'couscous|bulgur|quinoa',
    haferflocken: 'haferflocken|musli|granola|porridge|!riegel',
    griess: 'griess|!brei|!pudding',
    gemueseBunt: 'erbsen|karotte|mohre|paprika|brokkoli|broccoli|zucchini|@mais|bohnen|zuckerschoten|pak choi|lauch|@pilze|gemuse|!kicher|!kidney|!kaffee|!saft|!bruhe|!suppe|!starke|!waffel',
    gemueseOmelett: '@paprika|@pilze|spinat|zucchini|@tomate|brokkoli|erbsen|@mais|lauch|!ketchup|!suppe|!kicher|!starke|!waffel',
    nuesseSchoko: '@nuesse|@schokolade',
    eis: '@eis|@softeis',
    eisSahne: '@eis|@softeis|sahne|!joghurt|!butter|!torte',
    rosinen: 'rosinen|sultaninen',
    haehnchenHack: '@haehnchen|hack|gehacktes|reste|!nugget|!braten',
  };

  const R = [
    // ----- Nudeln -----
    ['Spaghetti Bolognese', 'nudeln', 40, [
      ['250 g|Hackfleisch', 'hack'], ['200 g|Spaghetti', 'nudeln'], ['1 Dose|Tomaten (oder 4 frische)', 'tomate'],
      ['1|Karotte', 'karotte', 'o'], ['1|Zwiebel', 'zwiebel', 'g'], ['1|Knoblauchzehe', 'knoblauch', 'g'],
      ['|Parmesan zum Bestreuen', 'parmesan', 'o'], ['|Öl, Salz, Pfeffer, Oregano', '', 'g']], [
      'Zwiebel, Knoblauch und Karotte klein würfeln.',
      'Hackfleisch in etwas Öl krümelig anbraten, das Gemüse kurz mitbraten.',
      'Tomaten dazugeben, würzen und etwa 20 Minuten leise köcheln lassen.',
      'Spaghetti nach Packungsangabe kochen und mit der Soße und Parmesan servieren.']],

    ['Nudeln in Tomaten-Sahne-Soße', 'nudeln', 20, [
      ['200 g|Nudeln', 'nudeln'], ['4|Tomaten (oder 1 Dose)', 'tomate'], ['100 ml|Sahne', 'sahne'],
      ['|Käse zum Bestreuen', 'kaese', 'o'], ['|Basilikum', 'kraeuter', 'o'],
      ['1|Zwiebel', 'zwiebel', 'g'], ['1|Knoblauchzehe', 'knoblauch', 'g'], ['|Öl, Salz, Pfeffer', '', 'g']], [
      'Nudeln kochen.',
      'Zwiebel und Knoblauch würfeln und in Öl glasig dünsten, Tomaten dazugeben und 5 Minuten köcheln.',
      'Sahne einrühren, würzen und mit den Nudeln mischen.',
      'Mit Käse und Basilikum servieren.']],

    ['Spaghetti Carbonara', 'nudeln', 20, [
      ['200 g|Spaghetti', 'nudeln'], ['100 g|Speck oder Schinken', 'schinkenSpeck'], ['2|Eier', 'eier'],
      ['50 g|Parmesan oder Bergkäse', 'kaese'], ['|Salz, viel Pfeffer', '', 'g']], [
      'Spaghetti in Salzwasser kochen, eine Tasse Nudelwasser aufheben.',
      'Speck in einer Pfanne knusprig braten.',
      'Eier mit dem geriebenen Käse und viel Pfeffer verquirlen.',
      'Nudeln abgießen, mit dem Speck mischen, Pfanne vom Herd nehmen und die Eiermasse unterrühren – mit etwas Nudelwasser cremig machen.']],

    ['Nudeln mit Brokkoli-Käse-Soße', 'nudeln', 20, [
      ['200 g|Nudeln', 'nudeln'], ['1 kleiner|Brokkoli', 'brokkoli'], ['150 ml|Sahne oder Milch', 'sahneMilch'],
      ['80 g|geriebener Käse', 'kaese'], ['|Salz, Pfeffer, Muskat', '', 'g']], [
      'Brokkoli in Röschen teilen und die letzten 4 Minuten mit den Nudeln kochen.',
      'Sahne erhitzen, den Käse darin schmelzen und würzen.',
      'Nudeln und Brokkoli abgießen und mit der Soße mischen.']],

    ['Pasta mit Spinat und Feta', 'nudeln', 20, [
      ['200 g|Nudeln', 'nudeln'], ['150 g|Spinat (frisch oder TK)', 'spinat'], ['100 g|Feta', 'feta'],
      ['2 EL|Frischkäse oder Sahne', 'schmelzFrisch', 'o'], ['1|Knoblauchzehe', 'knoblauch', 'g'], ['|Öl, Salz, Pfeffer', '', 'g']], [
      'Nudeln kochen.',
      'Knoblauch in Öl andünsten, Spinat dazugeben und zusammenfallen lassen.',
      'Frischkäse oder Sahne einrühren, den Feta darüberbröseln.',
      'Mit den Nudeln mischen und kräftig pfeffern.']],

    ['Pilz-Rahm-Nudeln', 'nudeln', 20, [
      ['200 g|Nudeln', 'nudeln'], ['250 g|Champignons oder andere Pilze', 'pilze'], ['150 ml|Sahne', 'sahne'],
      ['|Petersilie', 'kraeuter', 'o'], ['1|Zwiebel', 'zwiebel', 'g'], ['|Butter, Salz, Pfeffer', '', 'g']], [
      'Nudeln kochen.',
      'Pilze in Scheiben schneiden und mit der gewürfelten Zwiebel in Butter kräftig anbraten.',
      'Sahne angießen, kurz einkochen lassen und würzen.',
      'Mit den Nudeln mischen und mit Petersilie bestreuen.']],

    ['Zucchini-Pasta mit Frischkäse', 'nudeln', 20, [
      ['200 g|Nudeln', 'nudeln'], ['1|Zucchini', 'zucchini'], ['100 g|Frischkäse', 'frischkaese'],
      ['|etwas Zitrone', 'zitrone', 'o'], ['|Parmesan', 'parmesan', 'o'], ['1|Knoblauchzehe', 'knoblauch', 'g'], ['|Öl, Salz, Pfeffer', '', 'g']], [
      'Nudeln kochen, eine Tasse Nudelwasser aufheben.',
      'Zucchini würfeln und mit dem Knoblauch in Öl goldbraun braten.',
      'Frischkäse und etwas Nudelwasser einrühren, mit Zitrone, Salz und Pfeffer abschmecken.',
      'Nudeln untermischen und mit Parmesan servieren.']],

    ['Lachs-Sahne-Nudeln', 'nudeln', 20, [
      ['200 g|Nudeln', 'nudeln'], ['200 g|Lachs (frisch oder geräuchert)', 'lachs'], ['150 ml|Sahne', 'sahne'],
      ['1 Handvoll|Spinat oder Erbsen', 'spinatErbsen', 'o'], ['|Dill oder Zitrone', 'dillZitrone', 'o'], ['|Salz, Pfeffer', '', 'g']], [
      'Nudeln kochen.',
      'Frischen Lachs würfeln und kurz anbraten – Räucherlachs erst am Ende in Streifen dazugeben.',
      'Sahne und Spinat oder Erbsen dazugeben, 3 Minuten köcheln und mit Dill, Zitrone, Salz und Pfeffer abschmecken.',
      'Mit den Nudeln mischen.']],

    ['Thunfisch-Tomaten-Nudeln', 'nudeln', 20, [
      ['200 g|Nudeln', 'nudeln'], ['1 Dose|Thunfisch', 'thunfisch'], ['1 Dose|Tomaten (oder 4 frische)', 'tomate'],
      ['|Oliven oder Kapern', 'oliven', 'o'], ['1|Zwiebel', 'zwiebel', 'g'], ['|Öl, Salz, Pfeffer, Oregano', '', 'g']], [
      'Nudeln kochen.',
      'Zwiebel in Öl andünsten, Tomaten dazugeben und 10 Minuten köcheln.',
      'Thunfisch abtropfen lassen, zerpflücken und mit den Oliven unterheben.',
      'Würzen und mit den Nudeln mischen.']],

    ['Spaghetti Aglio e Olio', 'nudeln', 15, [
      ['200 g|Spaghetti', 'nudeln'], ['3|Knoblauchzehen', 'knoblauch'], ['1|Chilischote oder Chiliflocken', 'chili', 'o'],
      ['|Petersilie', 'kraeuter', 'o'], ['|Parmesan', 'parmesan', 'o'], ['5 EL|Olivenöl, Salz', '', 'g']], [
      'Spaghetti in gut gesalzenem Wasser kochen.',
      'Knoblauch in dünne Scheiben schneiden und mit der Chili in Olivenöl sanft goldgelb werden lassen.',
      'Spaghetti tropfnass dazugeben, mit Petersilie mischen und mit Parmesan servieren.']],

    ['Nudelauflauf mit Schinken', 'auflauf', 45, [
      ['200 g|Nudeln', 'nudeln'], ['150 g|Kochschinken', 'schinken'], ['2|Eier', 'eier'],
      ['200 ml|Milch oder Sahne', 'sahneMilch'], ['100 g|geriebener Käse', 'kaese'],
      ['1 Handvoll|Erbsen, Paprika oder Brokkoli', 'gemueseBunt', 'o'], ['|Salz, Pfeffer, Muskat', '', 'g']], [
      'Nudeln etwas kürzer als angegeben kochen, den Ofen auf 200 °C vorheizen.',
      'Schinken würfeln und mit den Nudeln und dem Gemüse in eine Auflaufform geben.',
      'Eier mit der Milch verquirlen, würzen und darübergießen.',
      'Mit Käse bestreuen und etwa 25 Minuten goldbraun backen.']],

    ['Käsespätzle', 'nudeln', 30, [
      ['400 g|Spätzle (Kühlregal)', 'spaetzle'], ['150 g|würziger Käse, z. B. Bergkäse', 'kaese'],
      ['|Schnittlauch', 'schnittlauch', 'o'], ['2|Zwiebeln', 'zwiebel', 'g'], ['|Butter, Salz, Pfeffer', '', 'g']], [
      'Zwiebeln in Ringe schneiden und in Butter langsam goldbraun braten.',
      'Spätzle in einer Pfanne erhitzen und schichtweise mit dem geriebenen Käse mischen, bis er schmilzt.',
      'Mit Röstzwiebeln und Schnittlauch servieren.']],

    ['Nudelsalat', 'salat', 25, [
      ['200 g|Nudeln', 'nudeln'], ['1|Paprika', 'paprika'], ['½|Gurke oder 3 Gewürzgurken', 'gurkeAlle'],
      ['100 g|Käse, Schinken oder Wurst', 'kaeseAufschnitt'], ['150 g|Joghurt oder Mayonnaise', 'joghurtMayo'],
      ['1|Frühlingszwiebel', 'fruehlingszwiebel', 'o'], ['|Salz, Pfeffer, etwas Essig', '', 'g']], [
      'Nudeln kochen und kalt abschrecken.',
      'Paprika, Gurke und Käse oder Wurst klein würfeln.',
      'Joghurt oder Mayonnaise mit Salz, Pfeffer und einem Schuss Essig verrühren.',
      'Alles mischen und mindestens 15 Minuten durchziehen lassen.']],

    ['Nudelpfanne mit Wurst und Ei', 'nudeln', 20, [
      ['250 g|gekochte Nudeln (gern vom Vortag)', 'nudeln'], ['150 g|Fleischwurst, Lyoner oder Würstchen', 'wurstAlle'],
      ['2|Eier', 'eier'], ['|Schnittlauch', 'schnittlauch', 'o'], ['1|Zwiebel', 'zwiebel', 'g'], ['|Butter, Salz, Pfeffer, Paprikapulver', '', 'g']], [
      'Wurst in Streifen oder Scheiben schneiden, die Zwiebel würfeln.',
      'Beides in Butter anbraten, die Nudeln dazugeben und knusprig braten.',
      'Eier verquirlen, darübergießen und unter Rühren stocken lassen.',
      'Würzen und mit Schnittlauch bestreuen.']],

    ['Tortellini in Schinken-Sahne-Soße', 'maultaschen', 15, [
      ['400 g|Tortellini (Kühlregal)', 'tortellini'], ['100 g|Kochschinken', 'schinken'], ['150 ml|Sahne', 'sahne'],
      ['1 Handvoll|Erbsen', 'erbsen', 'o'], ['|Parmesan', 'parmesan', 'o'], ['|Salz, Pfeffer', '', 'g']], [
      'Tortellini nach Packungsangabe garen.',
      'Schinken würfeln und kurz anbraten, Sahne und Erbsen dazugeben und 3 Minuten köcheln.',
      'Würzen, die Tortellini untermischen und mit Parmesan bestreuen.']],

    ['Gnocchi-Pfanne mit Tomaten und Mozzarella', 'maultaschen', 15, [
      ['400 g|Gnocchi', 'gnocchi'], ['250 g|Kirschtomaten', 'tomate'], ['1|Mozzarella', 'mozzarella'],
      ['|Basilikum', 'kraeuter', 'o'], ['1|Knoblauchzehe', 'knoblauch', 'g'], ['|Öl, Salz, Pfeffer', '', 'g']], [
      'Gnocchi in Öl rundum goldbraun braten.',
      'Halbierte Tomaten und Knoblauch dazugeben, 3 Minuten mitbraten und würzen.',
      'Mozzarella zerzupfen, darauf verteilen und kurz schmelzen lassen, mit Basilikum servieren.']],

    ['Lasagne', 'auflauf', 75, [
      ['300 g|Hackfleisch', 'hack'], ['9|Lasagneplatten', 'lasagne'], ['1 Dose|Tomaten', 'tomate'],
      ['500 ml|Milch', 'milch'], ['100 g|geriebener Käse', 'kaese'], ['1|Zwiebel', 'zwiebel', 'g'],
      ['30 g|Butter und 30 g Mehl', 'butter', 'g'], ['|Salz, Pfeffer, Muskat', '', 'g']], [
      'Hackfleisch mit der gewürfelten Zwiebel anbraten, Tomaten dazugeben, würzen und 10 Minuten köcheln.',
      'Für die helle Soße Butter schmelzen, Mehl einrühren, nach und nach die Milch dazugeben, aufkochen und würzen.',
      'Abwechselnd Platten, Hacksoße und helle Soße in eine Form schichten.',
      'Mit Käse bestreuen und bei 180 °C etwa 40 Minuten backen.']],

    // ----- Reis & Getreide -----
    ['Gebratener Reis mit Ei und Gemüse', 'reis', 20, [
      ['250 g|gekochter Reis (am besten vom Vortag)', 'reis'], ['2|Eier', 'eier'],
      ['200 g|Gemüse, z. B. Erbsen, Karotte, Paprika', 'gemueseBunt'], ['2|Frühlingszwiebeln', 'fruehlingszwiebel', 'o'],
      ['|Sojasauce, Öl', '', 'g']], [
      'Gemüse klein schneiden und in Öl kräftig anbraten.',
      'Den Reis dazugeben und unter Rühren knusprig braten.',
      'Eier in die Pfanne schlagen, verrühren und stocken lassen.',
      'Mit Sojasauce abschmecken und Frühlingszwiebeln darüberstreuen.']],

    ['Hähnchen-Curry mit Reis', 'curry', 30, [
      ['300 g|Hähnchenbrust', 'haehnchen'], ['1 Dose|Kokosmilch (oder 200 ml Sahne)', 'kokosSahne'],
      ['150 g|Reis', 'reis'], ['1|Paprika', 'paprika', 'o'], ['1|Zwiebel', 'zwiebel', 'g'],
      ['2 TL|Currypulver, Öl, Salz', '', 'g']], [
      'Reis kochen.',
      'Hähnchen in Stücke schneiden und in Öl rundum anbraten.',
      'Zwiebel und Paprika dazugeben, das Currypulver kurz mitrösten.',
      'Kokosmilch angießen, 10 Minuten köcheln lassen und salzen.']],

    ['Pilzrisotto', 'reis', 35, [
      ['150 g|Risottoreis', 'risotto'], ['250 g|Pilze', 'pilze'], ['40 g|Parmesan', 'parmesan'],
      ['1|Zwiebel', 'zwiebel', 'g'], ['1 EL|Butter', 'butter', 'g'], ['600 ml|Gemüsebrühe', '', 'g']], [
      'Zwiebel würfeln und in Butter glasig dünsten, den Reis kurz mitdünsten.',
      'Nach und nach heiße Brühe angießen und unter Rühren etwa 18 Minuten garen.',
      'Pilze in einer zweiten Pfanne kräftig anbraten.',
      'Pilze und Parmesan unter den Reis rühren und abschmecken.']],

    ['Chili con Carne', 'curry', 40, [
      ['300 g|Hackfleisch', 'hack'], ['1 Dose|Kidneybohnen', 'bohnen'], ['1 Dose|Tomaten', 'tomate'],
      ['1 kleine Dose|Mais', 'mais', 'o'], ['1|Paprika', 'paprika', 'o'], ['1|Zwiebel', 'zwiebel', 'g'],
      ['|Chili, Kreuzkümmel, Salz, Öl', '', 'g']], [
      'Hackfleisch mit der gewürfelten Zwiebel in Öl anbraten.',
      'Paprika würfeln und mit den Tomaten dazugeben, kräftig würzen.',
      'Bohnen und Mais abgießen, dazugeben und 20 Minuten köcheln lassen.',
      'Dazu passen Brot, Reis oder ein Klecks Schmand.']],

    ['Gefüllte Paprika', 'paprika', 50, [
      ['4|Paprika', 'paprika'], ['250 g|Hackfleisch', 'hack'], ['80 g|Reis', 'reis'], ['1 Dose|Tomaten', 'tomate'],
      ['50 g|geriebener Käse', 'kaese', 'o'], ['1|Zwiebel', 'zwiebel', 'g'], ['|Salz, Pfeffer, Paprikapulver', '', 'g']], [
      'Reis halb gar kochen, den Ofen auf 180 °C vorheizen.',
      'Hackfleisch mit Reis, gewürfelter Zwiebel und Gewürzen mischen.',
      'Paprika aufschneiden, entkernen und füllen.',
      'In eine Form mit den Tomaten stellen, mit Käse bestreuen und etwa 35 Minuten backen.']],

    ['Couscous-Salat', 'salat', 20, [
      ['150 g|Couscous', 'couscous'], ['1|Gurke', 'gurke'], ['2|Tomaten', 'tomate'], ['1|Paprika', 'paprika', 'o'],
      ['100 g|Feta', 'feta', 'o'], ['|Petersilie oder Minze', 'kraeuter', 'o'], ['|Saft einer Zitrone', 'zitrone', 'o'],
      ['|Olivenöl, Salz, Pfeffer', '', 'g']], [
      'Couscous mit der gleichen Menge kochendem Salzwasser übergießen und 5 Minuten quellen lassen.',
      'Gemüse würfeln, Kräuter hacken.',
      'Alles mit Zitronensaft, Öl, Salz und Pfeffer mischen und den Feta darüberbröseln.']],

    ['Gemüsepfanne mit Tofu', 'reis', 25, [
      ['200 g|Tofu', 'tofu'], ['300 g|Gemüse, z. B. Brokkoli, Paprika, Karotte', 'gemueseBunt'], ['150 g|Reis', 'reis', 'o'],
      ['1 Stück|Ingwer oder Knoblauch', 'ingwerKnoblauch', 'o'], ['|Sojasauce, Öl', '', 'g']], [
      'Reis kochen.',
      'Tofu würfeln, trocken tupfen und in Öl rundum knusprig braten, dann herausnehmen.',
      'Gemüse in Streifen schneiden und mit dem Ingwer kräftig anbraten.',
      'Tofu zurück in die Pfanne geben, mit Sojasauce ablöschen und mit Reis servieren.']],

    // ----- Fleisch & Fisch -----
    ['Frikadellen', 'keule', 30, [
      ['400 g|Hackfleisch', 'hack'], ['1|altes Brötchen oder 2 Scheiben Toast', 'broetchen'], ['1|Ei', 'eier'],
      ['1|Zwiebel', 'zwiebel', 'g'], ['1 TL|Senf, Salz, Pfeffer, Öl', '', 'g']], [
      'Das Brötchen in Wasser einweichen und gut ausdrücken.',
      'Mit Hackfleisch, Ei, fein gewürfelter Zwiebel, Senf, Salz und Pfeffer verkneten.',
      'Flache Frikadellen formen und in Öl von beiden Seiten je 5–6 Minuten braten.']],

    ['Hähnchen mit Ofengemüse', 'haehnchen', 45, [
      ['2|Hähnchenbrüste oder -keulen', 'haehnchen'], ['400 g|Kartoffeln', 'kartoffel'], ['1|Paprika', 'paprika', 'o'],
      ['1|Zucchini', 'zucchini', 'o'], ['1|Zwiebel', 'zwiebel', 'g'], ['|Olivenöl, Salz, Pfeffer, Paprikapulver, Rosmarin', '', 'g']], [
      'Den Ofen auf 200 °C vorheizen.',
      'Kartoffeln und Gemüse in Stücke schneiden und mit Öl und Gewürzen auf einem Blech mischen.',
      'Hähnchen würzen und auf das Gemüse legen.',
      'Etwa 35 Minuten backen, bis alles goldbraun und das Fleisch durchgegart ist.']],

    ['Geschnetzeltes in Rahmsoße', 'fleisch', 30, [
      ['300 g|Hähnchen- oder Schweinefleisch', 'fleischPfanne'], ['150 ml|Sahne', 'sahne'],
      ['200 g|Champignons', 'pilze', 'o'], ['150 g|Reis oder Nudeln', 'reisNudeln', 'o'],
      ['1|Zwiebel', 'zwiebel', 'g'], ['|Öl, Salz, Pfeffer, Paprikapulver', '', 'g']], [
      'Fleisch in Streifen schneiden, portionsweise scharf anbraten und herausnehmen.',
      'Zwiebel und Pilze im Bratfett anbraten.',
      'Sahne angießen, das Fleisch zurück in die Pfanne geben, 5 Minuten köcheln und würzen.',
      'Mit Reis oder Nudeln servieren.']],

    ['Hähnchen-Wraps', 'burrito', 20, [
      ['250 g|Hähnchenbrust', 'haehnchen'], ['4|Wraps', 'wraps'], ['150 g|Joghurt oder Schmand', 'joghurtSchmand'],
      ['|Salat', 'salat', 'o'], ['2|Tomaten', 'tomate', 'o'], ['50 g|Käse', 'kaese', 'o'],
      ['|Salz, Pfeffer, Paprikapulver, Öl', '', 'g']], [
      'Hähnchen in Streifen schneiden, würzen und in Öl braten.',
      'Joghurt mit Salz, Pfeffer und nach Wunsch etwas Knoblauch verrühren.',
      'Wraps kurz erwärmen, mit der Soße bestreichen, mit Salat, Tomaten, Hähnchen und Käse belegen und einrollen.']],

    ['Paniertes Schnitzel', 'fleisch', 25, [
      ['2|Schnitzel (Schwein, Pute oder Kalb)', 'schnitzel'], ['1|Ei', 'eier'], ['|Zitrone', 'zitrone', 'o'],
      ['|Mehl und Paniermehl', '', 'g'], ['|Öl oder Butterschmalz, Salz, Pfeffer', '', 'g']], [
      'Schnitzel flach klopfen, salzen und pfeffern.',
      'Nacheinander in Mehl, verquirltem Ei und Paniermehl wenden.',
      'In reichlich heißem Fett von jeder Seite 2–3 Minuten goldbraun braten.',
      'Mit Zitronenspalten servieren – dazu passen Kartoffelsalat oder Bratkartoffeln.']],

    ['Hackfleisch-Kartoffel-Auflauf', 'auflauf', 60, [
      ['300 g|Hackfleisch', 'hack'], ['600 g|Kartoffeln', 'kartoffel'], ['200 ml|Sahne oder Milch', 'sahneMilch'],
      ['100 g|geriebener Käse', 'kaese'], ['1|Zwiebel', 'zwiebel', 'g'], ['|Salz, Pfeffer, Paprikapulver, Öl', '', 'g']], [
      'Den Ofen auf 200 °C vorheizen, Kartoffeln schälen und in dünne Scheiben schneiden.',
      'Hackfleisch mit der Zwiebel anbraten und kräftig würzen.',
      'Kartoffeln und Hack abwechselnd in eine Form schichten, die gewürzte Sahne darübergießen.',
      'Mit Käse bestreuen, abgedeckt 30 Minuten und offen weitere 15 Minuten backen.']],

    ['Zucchini-Hack-Pfanne', 'auflauf', 25, [
      ['300 g|Hackfleisch', 'hack'], ['2|Zucchini', 'zucchini'], ['1 Dose|Tomaten (oder 3 frische)', 'tomate', 'o'],
      ['100 g|Feta', 'feta', 'o'], ['|Reis oder Brot', 'reisBrot', 'o'], ['1|Zwiebel, 1 Knoblauchzehe', 'zwiebel', 'g'],
      ['|Öl, Salz, Pfeffer, Oregano', '', 'g']], [
      'Hackfleisch mit Zwiebel und Knoblauch in Öl anbraten.',
      'Zucchini würfeln, dazugeben und 5 Minuten mitbraten.',
      'Tomaten dazugeben, würzen und 10 Minuten köcheln.',
      'Mit zerbröseltem Feta servieren, dazu Reis oder Brot.']],

    ['Burger', 'burger', 25, [
      ['300 g|Hackfleisch (Rind)', 'hack'], ['2|Burgerbrötchen', 'broetchenBurger'], ['2 Scheiben|Käse', 'kaese', 'o'],
      ['|Salat', 'salat', 'o'], ['1|Tomate', 'tomate', 'o'], ['|Gewürzgurken', 'gewuerzgurke', 'o'],
      ['|Salz, Pfeffer, Ketchup, Senf', '', 'g']], [
      'Hackfleisch zu zwei flachen Patties formen, salzen und pfeffern.',
      'In einer heißen Pfanne von jeder Seite 3–4 Minuten braten, zum Schluss den Käse darauf schmelzen lassen.',
      'Brötchen aufschneiden und rösten.',
      'Mit Salat, Tomate, Gurken, Patty und Soße belegen.']],

    ['Tacos mit Hackfleisch', 'taco', 25, [
      ['300 g|Hackfleisch', 'hack'], ['6|Tacoschalen oder Tortillas', 'tacoWraps'], ['|Salat', 'salat', 'o'],
      ['2|Tomaten', 'tomate', 'o'], ['80 g|geriebener Käse', 'kaese', 'o'], ['|Mais oder Bohnen', 'maisBohnen', 'o'],
      ['|Schmand oder Joghurt', 'joghurtSchmand', 'o'], ['|Chili, Kreuzkümmel, Paprikapulver, Salz, Öl', '', 'g']], [
      'Hackfleisch in Öl krümelig braten und kräftig würzen.',
      'Salat, Tomaten und Käse vorbereiten.',
      'Tacoschalen kurz im Ofen erwärmen.',
      'Mit Hack, Mais oder Bohnen, Salat, Tomaten, Käse und Schmand füllen.']],

    ['Käse-Lauch-Suppe', 'suppe', 35, [
      ['300 g|Hackfleisch', 'hack'], ['2 Stangen|Lauch', 'lauch'], ['150 g|Schmelzkäse oder Frischkäse', 'schmelzFrisch'],
      ['1|Zwiebel', 'zwiebel', 'g'], ['800 ml|Brühe, Öl, Salz, Pfeffer, Muskat', '', 'g']], [
      'Hackfleisch mit der Zwiebel in Öl krümelig braten.',
      'Lauch in Ringe schneiden, dazugeben und kurz mitdünsten.',
      'Mit Brühe auffüllen und 15 Minuten köcheln.',
      'Käse einrühren, bis er geschmolzen ist, und würzen.']],

    ['Lachs mit Brokkoli und Kartoffeln', 'fisch', 30, [
      ['2|Lachsfilets', 'lachsFrisch'], ['1|Brokkoli', 'brokkoli'], ['400 g|Kartoffeln', 'kartoffel'],
      ['1|Zitrone', 'zitrone', 'o'], ['|Butter, Salz, Pfeffer', '', 'g']], [
      'Kartoffeln kochen.',
      'Brokkoli in Röschen teilen und die letzten 5 Minuten mitgaren.',
      'Lachs salzen und pfeffern und in Butter von jeder Seite 3–4 Minuten braten.',
      'Mit Zitrone beträufeln und servieren.']],

    ['Fischfilet aus dem Ofen mit Tomaten', 'fisch', 30, [
      ['2|Fischfilets, z. B. Kabeljau oder Seelachs', 'fischFilet'], ['250 g|Kirschtomaten', 'tomate'],
      ['|Oliven', 'oliven', 'o'], ['1|Zitrone', 'zitrone', 'o'], ['|Brot, Reis oder Kartoffeln', 'reisBrot', 'o'],
      ['1|Knoblauchzehe', 'knoblauch', 'g'], ['|Olivenöl, Salz, Pfeffer, Kräuter', '', 'g']], [
      'Den Ofen auf 200 °C vorheizen.',
      'Tomaten halbieren und mit Oliven, Knoblauch und Olivenöl in eine Form geben.',
      'Fisch salzen, pfeffern, darauflegen und mit Zitrone beträufeln.',
      'Etwa 15–18 Minuten garen, bis sich der Fisch leicht zerpflücken lässt.']],

    ['Knoblauch-Garnelen', 'garnelen', 15, [
      ['250 g|Garnelen', 'garnelen'], ['3|Knoblauchzehen', 'knoblauch'], ['1|Chilischote', 'chili', 'o'],
      ['|Petersilie', 'kraeuter', 'o'], ['1|Zitrone', 'zitrone', 'o'], ['|Baguette oder Nudeln', 'brotNudeln', 'o'],
      ['|Olivenöl, Salz', '', 'g']], [
      'Knoblauch und Chili in Scheiben schneiden und in Olivenöl sanft erhitzen.',
      'Garnelen dazugeben und 2–3 Minuten braten, bis sie rosa sind.',
      'Mit Salz, Zitronensaft und Petersilie abschmecken – mit Baguette zum Tunken oder mit Nudeln servieren.']],

    ['Würstchen-Kartoffel-Pfanne', 'wurst', 30, [
      ['4|Würstchen oder 2 Bratwürste', 'wuerstchen'], ['500 g|Kartoffeln (am besten gekocht)', 'kartoffel'],
      ['1|Paprika', 'paprika', 'o'], ['1|Zwiebel', 'zwiebel', 'g'], ['|Öl, Salz, Pfeffer, Paprikapulver', '', 'g']], [
      'Gekochte Kartoffeln in Scheiben schneiden – rohe vorher etwa 15 Minuten kochen.',
      'In Öl knusprig braten, Zwiebel und Paprika dazugeben.',
      'Würstchen in Scheiben schneiden, mitbraten und alles würzen.']],

    ['Hot Dogs', 'wurst', 15, [
      ['4|Würstchen', 'wuerstchen'], ['4|Brötchen oder Hot-Dog-Brötchen', 'broetchen'], ['|Gewürzgurken', 'gewuerzgurke', 'o'],
      ['|Röstzwiebeln', 'roestzwiebeln', 'o'], ['|Senf, Ketchup', '', 'g']], [
      'Würstchen in heißem, nicht kochendem Wasser 8 Minuten ziehen lassen.',
      'Brötchen aufschneiden und kurz im Ofen aufbacken.',
      'Mit Würstchen, Gurkenscheiben, Röstzwiebeln, Senf und Ketchup füllen.']],

    // ----- Wurst & Brot -----
    ['Wurstsalat', 'aufschnitt', 15, [
      ['250 g|Lyoner oder Fleischwurst', 'wurstsalat'], ['3|Gewürzgurken', 'gewuerzgurke'],
      ['100 g|Emmentaler (Schweizer Art)', 'kaese', 'o'], ['|Schnittlauch', 'schnittlauch', 'o'],
      ['1|Zwiebel', 'zwiebel', 'g'], ['|Essig, Öl, Salz, Pfeffer', '', 'g']], [
      'Wurst und Käse in feine Streifen schneiden, die Zwiebel in dünne Ringe.',
      'Gurken in Scheiben schneiden.',
      'Aus Essig, etwas Gurkenwasser, Öl, Salz und Pfeffer eine Marinade rühren.',
      'Alles mischen, 15 Minuten ziehen lassen und mit Schnittlauch servieren – dazu Brot.']],

    ['Brotzeit-Brett', 'aufschnitt', 10, [
      ['|Brot', 'brot'], ['|Wurst oder Schinken', 'brotzeit'], ['|Käse', 'kaese', 'o'],
      ['|Gewürzgurken', 'gewuerzgurke', 'o'], ['|Radieschen oder Tomaten', 'radTom', 'o'], ['|Butter oder Frischkäse', '', 'g']], [
      'Brot in Scheiben schneiden und mit Butter oder Frischkäse bestreichen.',
      'Wurst, Käse, Gurken und Gemüse auf einem Brett anrichten.',
      'Jeder belegt sich sein Brot selbst.']],

    ['Pizzabrötchen', 'pizza', 20, [
      ['4|Brötchen oder 6 Scheiben Toast', 'toast'], ['100 g|Salami oder Schinken', 'aufschnitt'],
      ['100 g|geriebener Käse', 'kaese'], ['2 EL|Tomatenmark oder passierte Tomaten', 'tomate'],
      ['1|Paprika', 'paprika', 'o'], ['|Oregano', '', 'g']], [
      'Den Ofen auf 200 °C vorheizen und die Brötchen halbieren.',
      'Tomatenmark mit etwas Wasser und Oregano verrühren und daraufstreichen.',
      'Wurst und Paprika klein schneiden, darauf verteilen und mit Käse bestreuen.',
      'Etwa 10 Minuten backen, bis der Käse schmilzt.']],

    ['Schinken-Käse-Toast', 'sandwich', 15, [
      ['4 Scheiben|Toast', 'toast'], ['4 Scheiben|Schinken oder Salami', 'aufschnitt'], ['4 Scheiben|Käse', 'kaese'],
      ['|Tomate oder Ananas', 'tomateAnanas', 'o'], ['|Butter', 'butter', 'g']], [
      'Den Ofen auf 200 °C (Grill) vorheizen.',
      'Toast buttern und mit Schinken, Tomaten- oder Ananasscheiben und Käse belegen.',
      '8–10 Minuten backen, bis der Käse schmilzt.']],

    ['Strammer Max', 'brot', 10, [
      ['2 Scheiben|Brot', 'brot'], ['2 Scheiben|Schinken', 'schinkenSpeck'], ['2|Eier', 'eier'],
      ['|Gewürzgurke', 'gewuerzgurke', 'o'], ['|Butter, Salz, Pfeffer', '', 'g']], [
      'Brot mit Butter bestreichen und mit Schinken belegen.',
      'Spiegeleier braten, salzen und pfeffern.',
      'Auf das Schinkenbrot legen, dazu Gewürzgurken.']],

    ['Flammkuchen', 'pizza', 25, [
      ['1 Rolle|Flammkuchen- oder Pizzateig (oder 2 Wraps)', 'teigWraps'], ['150 g|Schmand oder Crème fraîche', 'schmand'],
      ['100 g|Speckwürfel', 'speck'], ['1|rote Zwiebel', 'zwiebel', 'g'], ['|Salz, Pfeffer', '', 'g']], [
      'Den Ofen auf 220 °C vorheizen.',
      'Teig ausrollen und mit dem gewürzten Schmand bestreichen.',
      'Mit Speck und dünnen Zwiebelringen belegen.',
      '12–15 Minuten knusprig backen – Wraps brauchen nur 6–8 Minuten.']],

    ['Quesadillas', 'taco', 20, [
      ['4|Tortillas oder Wraps', 'wraps'], ['150 g|geriebener Käse', 'kaese'], ['1|Paprika', 'paprika', 'o'],
      ['1 kleine Dose|Mais oder Bohnen', 'maisBohnen', 'o'], ['|Hähnchen- oder Hackreste', 'haehnchenHack', 'o'],
      ['|Salsa oder Schmand', '', 'g']], [
      'Eine Tortilla-Hälfte mit Käse, Paprika, Mais oder Bohnen und Fleischresten belegen.',
      'Zuklappen und in einer Pfanne ohne Fett von beiden Seiten goldbraun braten, bis der Käse schmilzt.',
      'In Stücke schneiden und mit Salsa oder Schmand servieren.']],

    ['Bruschetta', 'baguette', 15, [
      ['1|Baguette oder Ciabatta', 'baguetteBrot'], ['4|Tomaten', 'tomate'], ['1|Knoblauchzehe', 'knoblauch'],
      ['|Basilikum', 'kraeuter', 'o'], ['|Olivenöl, Salz, Pfeffer', '', 'g']], [
      'Tomaten fein würfeln und mit Olivenöl, Salz, Pfeffer und Basilikum mischen.',
      'Brot in Scheiben schneiden und im Ofen oder in der Pfanne rösten.',
      'Mit einer halbierten Knoblauchzehe einreiben und mit den Tomaten belegen.']],

    ['Arme Ritter', 'brot', 15, [
      ['4 Scheiben|Toast oder altes Brot', 'toast'], ['2|Eier', 'eier'], ['150 ml|Milch', 'milch'],
      ['|Obst oder Apfelmus', 'obstMus', 'o'], ['|Butter, Zimt und Zucker', '', 'g']], [
      'Eier mit Milch verquirlen.',
      'Brotscheiben darin von beiden Seiten einweichen.',
      'In Butter goldbraun braten.',
      'Mit Zimt und Zucker bestreuen, dazu Obst oder Apfelmus.']],

    ['Semmelknödel mit Pilzsoße', 'maultaschen', 50, [
      ['4|alte Brötchen', 'broetchen'], ['250 ml|Milch', 'milch'], ['2|Eier', 'eier'], ['250 g|Pilze', 'pilze', 'o'],
      ['150 ml|Sahne', 'sahne', 'o'], ['1|Zwiebel, Petersilie', 'zwiebel', 'g'], ['|Butter, Salz, Pfeffer, Muskat', '', 'g']], [
      'Brötchen würfeln, mit warmer Milch übergießen und 15 Minuten ziehen lassen.',
      'Zwiebel in Butter dünsten und mit Eiern, Petersilie und Gewürzen unter die Brötchen kneten.',
      'Mit nassen Händen Knödel formen und in siedendem Salzwasser 20 Minuten ziehen lassen.',
      'Dazu Pilze anbraten, mit Sahne ablöschen und würzen.']],

    // ----- Eier -----
    ['Rührei mit Tomaten', 'spiegelei', 10, [
      ['4|Eier', 'eier'], ['2|Tomaten', 'tomate', 'o'], ['|Schnittlauch', 'schnittlauch', 'o'], ['2 EL|Milch', 'milch', 'o'],
      ['|Brot', 'brot', 'o'], ['|Butter, Salz, Pfeffer', '', 'g']], [
      'Eier mit Milch, Salz und Pfeffer verquirlen.',
      'Tomaten würfeln und in Butter kurz anbraten.',
      'Eier dazugeben und bei mittlerer Hitze langsam stocken lassen, dabei vom Rand zur Mitte schieben.',
      'Mit Schnittlauch bestreuen, dazu Brot.']],

    ['Gemüse-Omelett mit Käse', 'spiegelei', 15, [
      ['4|Eier', 'eier'], ['1 Handvoll|Gemüse, z. B. Paprika, Pilze, Spinat', 'gemueseOmelett'], ['50 g|Käse', 'kaese'],
      ['2 EL|Milch', 'milch', 'o'], ['|Butter, Salz, Pfeffer', '', 'g']], [
      'Gemüse klein schneiden und in Butter anbraten.',
      'Eier mit Milch, Salz und Pfeffer verquirlen und darübergießen.',
      'Bei kleiner Hitze stocken lassen, Käse darüberstreuen und zusammenklappen.']],

    ['Bauernfrühstück', 'spiegelei', 25, [
      ['500 g|gekochte Kartoffeln', 'kartoffel'], ['3|Eier', 'eier'], ['100 g|Speck oder Schinken', 'schinkenSpeck'],
      ['|Gewürzgurken', 'gewuerzgurke', 'o'], ['|Schnittlauch', 'schnittlauch', 'o'], ['1|Zwiebel', 'zwiebel', 'g'],
      ['|Öl, Salz, Pfeffer', '', 'g']], [
      'Kartoffeln in Scheiben schneiden und in Öl knusprig braten.',
      'Speck und Zwiebel würfeln und mitbraten.',
      'Eier verquirlen, würzen, darübergießen und stocken lassen.',
      'Mit Schnittlauch und Gewürzgurken servieren.']],

    ['Shakshuka', 'spiegelei', 25, [
      ['4|Eier', 'eier'], ['1 Dose|Tomaten (oder 5 frische)', 'tomate'], ['1|Paprika', 'paprika'],
      ['50 g|Feta', 'feta', 'o'], ['|Brot', 'brot', 'o'], ['1|Zwiebel, 1 Knoblauchzehe', 'zwiebel', 'g'],
      ['|Kreuzkümmel, Paprikapulver, Salz, Öl', '', 'g']], [
      'Zwiebel, Knoblauch und Paprika in Öl weich dünsten, die Gewürze kurz mitrösten.',
      'Tomaten dazugeben und 10 Minuten zu einer dicken Soße einkochen.',
      'Mulden hineindrücken, die Eier hineinschlagen und zugedeckt 6–8 Minuten stocken lassen.',
      'Mit Feta bestreuen und mit Brot servieren.']],

    ['Kartoffel-Frittata', 'spiegelei', 25, [
      ['300 g|gekochte Kartoffeln', 'kartoffel'], ['5|Eier', 'eier'], ['1|Zucchini oder Paprika', 'zucchiniPaprika', 'o'],
      ['60 g|Käse', 'kaese', 'o'], ['1|Zwiebel', 'zwiebel', 'g'], ['|Öl, Salz, Pfeffer', '', 'g']], [
      'Kartoffeln und Gemüse würfeln und mit der Zwiebel in einer ofenfesten Pfanne anbraten.',
      'Eier verquirlen, würzen und darübergießen.',
      'Mit Käse bestreuen, bei kleiner Hitze stocken lassen und zum Schluss 5 Minuten unter den Backofengrill stellen.']],

    ['Quiche mit Lauch und Schinken', 'quiche', 60, [
      ['1 Rolle|Mürbe- oder Blätterteig', 'teig'], ['1 Stange|Lauch', 'lauch'], ['150 g|Schinken oder Speck', 'schinkenSpeck'],
      ['3|Eier', 'eier'], ['200 ml|Sahne oder Milch', 'sahneMilch'], ['100 g|geriebener Käse', 'kaese'],
      ['|Butter, Salz, Pfeffer, Muskat', '', 'g']], [
      'Den Ofen auf 190 °C vorheizen und den Teig in eine Form legen.',
      'Lauch in Ringe schneiden und mit dem Schinken in Butter andünsten.',
      'Eier mit Sahne und Käse verquirlen und würzen.',
      'Lauch auf dem Teig verteilen, die Eiermasse darübergießen und etwa 35 Minuten backen.']],

    ['Eiersalat', 'salat', 20, [
      ['5|Eier', 'eier'], ['3 EL|Mayonnaise oder Joghurt', 'joghurtMayo'], ['2|Gewürzgurken', 'gewuerzgurke', 'o'],
      ['|Schnittlauch', 'schnittlauch', 'o'], ['|Salz, Pfeffer, Senf', '', 'g']], [
      'Eier 10 Minuten hart kochen, abschrecken und pellen.',
      'Eier und Gurken würfeln.',
      'Mit Mayonnaise oder Joghurt, Senf, Salz und Pfeffer mischen und mit Schnittlauch bestreuen. Schmeckt auf Brot.']],

    ['Pfannkuchen', 'pfannkuchen', 25, [
      ['300 ml|Milch', 'milch'], ['3|Eier', 'eier'], ['|Äpfel, Bananen oder Apfelmus', 'obstMus', 'o'],
      ['200 g|Mehl', '', 'g'], ['|Salz, Butter zum Braten', '', 'g']], [
      'Mehl, Milch, Eier und eine Prise Salz glatt verrühren und 10 Minuten quellen lassen.',
      'Etwas Butter in einer Pfanne erhitzen und eine dünne Schicht Teig hineingeben.',
      'Von beiden Seiten goldbraun backen.',
      'Süß mit Obst oder Apfelmus füllen – oder herzhaft mit Käse und Schinken.']],

    ['Kaiserschmarrn', 'pfannkuchen', 25, [
      ['3|Eier', 'eier'], ['250 ml|Milch', 'milch'], ['|Rosinen', 'rosinen', 'o'], ['|Apfelmus', 'apfelmus', 'o'],
      ['125 g|Mehl, 2 EL Zucker, 1 Prise Salz', '', 'g'], ['|Butter, Puderzucker', '', 'g']], [
      'Eier trennen und das Eiweiß steif schlagen.',
      'Eigelb mit Milch, Mehl, Zucker und Salz verrühren und den Eischnee unterheben.',
      'In Butter in einer großen Pfanne anbacken, wenden, mit zwei Gabeln in Stücke reißen und die Rosinen dazugeben.',
      'Mit Puderzucker bestäuben und mit Apfelmus servieren.']],

    // ----- Suppen -----
    ['Gemüsesuppe', 'suppe', 35, [
      ['2|Karotten', 'karotte'], ['2|Kartoffeln', 'kartoffel'], ['1 Stange|Lauch oder Sellerie', 'lauchSellerie'],
      ['1|Zucchini', 'zucchini', 'o'], ['|Würstchen oder Nudeln', 'wuerstchen', 'o'], ['|Petersilie', 'kraeuter', 'o'],
      ['1 l|Gemüsebrühe, Salz, Pfeffer, Öl', '', 'g']], [
      'Gemüse putzen und in kleine Würfel schneiden.',
      'In einem Topf in Öl kurz andünsten.',
      'Mit Brühe auffüllen und 20 Minuten köcheln lassen.',
      'Abschmecken und mit Petersilie servieren – Würstchen oder Nudeln passen gut hinein.']],

    ['Tomatensuppe', 'suppe', 30, [
      ['6|Tomaten (oder 1 große Dose)', 'tomate'], ['100 ml|Sahne', 'sahne', 'o'], ['|Basilikum', 'kraeuter', 'o'],
      ['1|Zwiebel, 1 Knoblauchzehe', 'zwiebel', 'g'], ['400 ml|Gemüsebrühe, Salz, Pfeffer, Zucker, Öl', '', 'g']], [
      'Zwiebel und Knoblauch in Öl andünsten.',
      'Tomaten grob schneiden, dazugeben und mit Brühe aufgießen.',
      '20 Minuten köcheln lassen und fein pürieren.',
      'Mit Salz, Pfeffer, einer Prise Zucker und Sahne abschmecken.']],

    ['Kartoffelsuppe mit Würstchen', 'suppe', 40, [
      ['600 g|Kartoffeln', 'kartoffel'], ['2|Karotten', 'karotte', 'o'], ['1 Stange|Lauch', 'lauch', 'o'],
      ['2|Würstchen', 'wuerstchen', 'o'], ['100 ml|Sahne', 'sahne', 'o'], ['1|Zwiebel', 'zwiebel', 'g'],
      ['800 ml|Gemüsebrühe, Majoran, Salz, Pfeffer, Butter', '', 'g']], [
      'Kartoffeln, Karotten, Lauch und Zwiebel klein schneiden und in Butter andünsten.',
      'Mit Brühe auffüllen und 20 Minuten weich kochen.',
      'Etwa die Hälfte pürieren, Sahne dazugeben und würzen.',
      'Würstchen in Scheiben schneiden und in der Suppe erwärmen.']],

    ['Kürbissuppe', 'suppe', 35, [
      ['800 g|Kürbis, z. B. Hokkaido', 'kuerbis'], ['200 ml|Kokosmilch oder Sahne', 'kokosSahne', 'o'],
      ['1 Stück|Ingwer', 'ingwer', 'o'], ['1|Zwiebel', 'zwiebel', 'g'], ['600 ml|Gemüsebrühe, Salz, Pfeffer, Öl', '', 'g']], [
      'Kürbis entkernen und würfeln – Hokkaido muss nicht geschält werden.',
      'Mit Zwiebel und Ingwer in Öl andünsten.',
      'Mit Brühe aufgießen und 20 Minuten weich kochen.',
      'Pürieren, Kokosmilch einrühren und abschmecken.']],

    ['Brokkoli-Cremesuppe', 'suppe', 30, [
      ['1|Brokkoli', 'brokkoli'], ['1|Kartoffel', 'kartoffel', 'o'], ['100 ml|Sahne oder 50 g Schmelzkäse', 'sahneSchmelz', 'o'],
      ['1|Zwiebel', 'zwiebel', 'g'], ['600 ml|Gemüsebrühe, Salz, Pfeffer, Muskat, Öl', '', 'g']], [
      'Zwiebel und Kartoffel würfeln und in Öl andünsten.',
      'Brokkoli in Röschen teilen (Strunk schälen und würfeln) und mit der Brühe dazugeben.',
      '15 Minuten köcheln, pürieren und mit Sahne oder Käse verfeinern.']],

    ['Rote-Linsen-Suppe', 'suppe', 30, [
      ['150 g|rote Linsen', 'linsen'], ['1 Dose|Kokosmilch', 'kokosmilch', 'o'], ['1 Dose|Tomaten', 'tomate', 'o'],
      ['1|Karotte', 'karotte', 'o'], ['1|Zwiebel, 1 Knoblauchzehe', 'zwiebel', 'g'], ['600 ml|Gemüsebrühe, Currypulver, Salz, Öl', '', 'g']], [
      'Zwiebel, Knoblauch und Karotte würfeln und in Öl andünsten, das Currypulver kurz mitrösten.',
      'Linsen, Tomaten und Brühe dazugeben und 15 Minuten köcheln.',
      'Kokosmilch einrühren, nach Wunsch pürieren und abschmecken.']],

    // ----- Gemüse, Kartoffeln & Salate -----
    ['Ofengemüse mit Kräuterquark', 'brokkoli', 40, [
      ['500 g|Kartoffeln oder Süßkartoffeln', 'kartoffelSuess'], ['250 g|Quark', 'quark'], ['1|Paprika', 'paprika', 'o'],
      ['1|Zucchini', 'zucchini', 'o'], ['100 g|Feta', 'feta', 'o'], ['|Kräuter oder Schnittlauch', 'schnittlauch', 'o'],
      ['1|rote Zwiebel', 'zwiebel', 'g'], ['|Olivenöl, Salz, Pfeffer, Rosmarin', '', 'g']], [
      'Den Ofen auf 200 °C vorheizen und das Gemüse in Stücke schneiden.',
      'Mit Öl und Gewürzen auf einem Blech mischen und den Feta darüberbröseln.',
      '30–35 Minuten backen.',
      'Quark mit etwas Milch, Kräutern, Salz und Pfeffer glatt rühren und dazu servieren.']],

    ['Ratatouille', 'auflauf', 45, [
      ['1|Zucchini', 'zucchini'], ['1|Paprika', 'paprika'], ['4|Tomaten (oder 1 Dose)', 'tomate'],
      ['1|Aubergine', 'aubergine', 'o'], ['1|Zwiebel, 2 Knoblauchzehen', 'zwiebel', 'g'], ['|Thymian, Olivenöl, Salz, Pfeffer', '', 'g']], [
      'Gemüse in mundgerechte Würfel schneiden.',
      'Zwiebel und Knoblauch in Olivenöl andünsten, Aubergine und Paprika dazugeben und 5 Minuten braten.',
      'Zucchini und Tomaten dazugeben, würzen und 20 Minuten schmoren.',
      'Dazu passen Reis, Baguette oder Kartoffeln.']],

    ['Bratkartoffeln mit Speck und Spiegelei', 'kartoffel', 30, [
      ['600 g|gekochte Kartoffeln (vom Vortag)', 'kartoffel'], ['100 g|Speckwürfel', 'speck', 'o'], ['2|Eier', 'eier', 'o'],
      ['1|Zwiebel', 'zwiebel', 'g'], ['|Öl oder Butterschmalz, Salz, Pfeffer, Majoran', '', 'g']], [
      'Kartoffeln in Scheiben schneiden.',
      'In reichlich heißem Fett ohne viel Wenden goldbraun und knusprig braten.',
      'Speck und Zwiebel dazugeben, mitbraten und würzen.',
      'Nach Wunsch mit Spiegeleiern servieren.']],

    ['Kartoffelpuffer mit Apfelmus', 'pommes', 30, [
      ['800 g|Kartoffeln', 'kartoffel'], ['1|Ei', 'eier'], ['|Apfelmus', 'apfelmusApfel', 'o'], ['1|Zwiebel', 'zwiebel', 'g'],
      ['2 EL|Mehl, Salz, Öl', '', 'g']], [
      'Kartoffeln und Zwiebel fein reiben und gut ausdrücken.',
      'Mit Ei, Mehl und Salz vermengen.',
      'Portionsweise flach in heißes Öl geben und von beiden Seiten knusprig braten.',
      'Mit Apfelmus servieren.']],

    ['Kartoffelpüree mit Spinat und Spiegelei', 'spiegelei', 30, [
      ['600 g|Kartoffeln', 'kartoffel'], ['150 ml|Milch', 'milch'], ['2–4|Eier', 'eier'],
      ['300 g|Spinat (frisch oder Rahmspinat)', 'spinat'], ['|Butter, Salz, Muskat', '', 'g']], [
      'Kartoffeln schälen und in Salzwasser weich kochen.',
      'Abgießen, mit warmer Milch und Butter stampfen und mit Salz und Muskat würzen.',
      'Spinat erhitzen – frischen mit etwas Butter zusammenfallen lassen.',
      'Spiegeleier braten und alles zusammen servieren.']],

    ['Schwäbischer Kartoffelsalat', 'salat', 40, [
      ['800 g|festkochende Kartoffeln', 'kartoffel'], ['3|Gewürzgurken', 'gewuerzgurke', 'o'], ['|Schnittlauch', 'schnittlauch', 'o'],
      ['|Würstchen dazu', 'wuerstchen', 'o'], ['1|Zwiebel', 'zwiebel', 'g'], ['150 ml|Brühe, 3 EL Essig, 3 EL Öl, Senf, Salz, Pfeffer', '', 'g']], [
      'Kartoffeln mit Schale kochen, pellen und noch warm in Scheiben schneiden.',
      'Zwiebel fein würfeln und in der heißen Brühe kurz aufkochen, mit Essig, Senf, Salz und Pfeffer abschmecken.',
      'Über die Kartoffeln gießen, Gurken dazugeben und das Öl unterheben.',
      'Mindestens 30 Minuten ziehen lassen und mit Schnittlauch bestreuen. Dazu passen Würstchen.']],

    ['Pellkartoffeln mit Kräuterquark', 'kartoffel', 30, [
      ['800 g|Kartoffeln', 'kartoffel'], ['250 g|Quark', 'quark'], ['3 EL|Milch oder Joghurt', 'milchJoghurt', 'o'],
      ['|Schnittlauch oder andere Kräuter', 'schnittlauch', 'o'], ['|Gurke oder Radieschen', 'gurkeRadieschen', 'o'],
      ['|Leinöl oder Olivenöl, Salz, Pfeffer', '', 'g']], [
      'Kartoffeln waschen und mit Schale etwa 20 Minuten kochen.',
      'Quark mit Milch glatt rühren, Kräuter hacken und unterrühren, mit Salz und Pfeffer würzen.',
      'Gurke oder Radieschen fein würfeln und dazugeben.',
      'Kartoffeln mit dem Quark und einem Schuss Leinöl servieren.']],

    ['Zucchini-Puffer mit Joghurt-Dip', 'gurke', 25, [
      ['2|Zucchini', 'zucchini'], ['2|Eier', 'eier'], ['50 g|Feta oder geriebener Käse', 'fetaKaese', 'o'],
      ['150 g|Joghurt', 'joghurt', 'o'], ['4 EL|Mehl, Salz, Pfeffer, Öl', '', 'g']], [
      'Zucchini grob raspeln, salzen, 10 Minuten ziehen lassen und kräftig ausdrücken.',
      'Mit Eiern, Mehl und Käse mischen und würzen.',
      'Kleine Puffer in Öl von beiden Seiten goldbraun braten.',
      'Joghurt mit Salz, Pfeffer und etwas Knoblauch verrühren und dazu servieren.']],

    ['Überbackener Blumenkohl', 'brokkoli', 35, [
      ['1|Blumenkohl oder Brokkoli', 'brokkoli'], ['300 ml|Milch', 'milch'], ['80 g|geriebener Käse', 'kaese'],
      ['|Kochschinken', 'schinken', 'o'], ['30 g|Butter, 2 EL Mehl, Salz, Pfeffer, Muskat', '', 'g']], [
      'Blumenkohl in Röschen teilen und 8 Minuten in Salzwasser vorgaren, den Ofen auf 200 °C vorheizen.',
      'Butter schmelzen, Mehl einrühren, die Milch nach und nach dazugeben, zu einer Soße aufkochen und würzen.',
      'Blumenkohl und Schinkenwürfel in eine Form geben, die Soße darüber und mit Käse bestreuen.',
      '15 Minuten überbacken.']],

    ['Spinat-Feta-Taschen', 'croissant', 35, [
      ['1 Rolle|Blätterteig', 'blaetterteig'], ['200 g|Spinat', 'spinat'], ['100 g|Feta', 'feta'], ['1|Ei', 'eier'],
      ['1|Knoblauchzehe', 'knoblauch', 'g'], ['|Salz, Pfeffer', '', 'g']], [
      'Den Ofen auf 200 °C vorheizen.',
      'Spinat mit Knoblauch andünsten, gut ausdrücken, abkühlen lassen und mit dem Feta mischen.',
      'Blätterteig in Quadrate schneiden, füllen, zu Dreiecken falten und die Ränder festdrücken.',
      'Mit verquirltem Ei bestreichen und etwa 20 Minuten goldbraun backen.']],

    ['Rahmpilze auf Brot', 'pilze', 20, [
      ['400 g|Champignons', 'pilze'], ['150 ml|Sahne', 'sahne'], ['4 Scheiben|Brot', 'brot', 'o'], ['|Petersilie', 'kraeuter', 'o'],
      ['1|Zwiebel', 'zwiebel', 'g'], ['|Butter, Salz, Pfeffer', '', 'g']], [
      'Pilze in Scheiben schneiden und in Butter bei großer Hitze anbraten.',
      'Die gewürfelte Zwiebel dazugeben und kurz mitbraten.',
      'Sahne angießen, cremig einkochen lassen und würzen.',
      'Auf geröstetem Brot mit Petersilie servieren.']],

    ['Gurkensalat mit Joghurt und Dill', 'salat', 10, [
      ['1|Gurke', 'gurke'], ['150 g|Joghurt oder saure Sahne', 'joghurtSchmand'], ['|Dill', 'dill', 'o'],
      ['1 kleine|Zwiebel', 'zwiebel', 'g'], ['|Salz, Pfeffer, 1 Prise Zucker, etwas Essig', '', 'g']], [
      'Gurke in feine Scheiben hobeln und leicht salzen.',
      'Joghurt mit fein gewürfelter Zwiebel, Dill, Essig, Zucker und Pfeffer verrühren.',
      'Gurke dazugeben und kurz durchziehen lassen.']],

    ['Tomate-Mozzarella', 'salat', 10, [
      ['3|Tomaten', 'tomate'], ['1|Mozzarella', 'mozzarella'], ['|Basilikum', 'kraeuter', 'o'],
      ['|Olivenöl, Balsamico, Salz, Pfeffer', '', 'g']], [
      'Tomaten und Mozzarella in Scheiben schneiden und abwechselnd auf einen Teller legen.',
      'Mit Salz, Pfeffer, Olivenöl und etwas Balsamico beträufeln.',
      'Mit Basilikum belegen – dazu passt frisches Brot.']],

    ['Griechischer Salat', 'salat', 15, [
      ['3|Tomaten', 'tomate'], ['1|Gurke', 'gurke'], ['150 g|Feta', 'feta'], ['1|Paprika', 'paprika', 'o'],
      ['|Oliven', 'oliven', 'o'], ['1|rote Zwiebel', 'zwiebel', 'g'], ['|Olivenöl, Essig, Oregano, Salz', '', 'g']], [
      'Tomaten, Gurke und Paprika in grobe Stücke schneiden, die Zwiebel in Ringe.',
      'Mit den Oliven mischen und mit Öl, Essig, Oregano und Salz anmachen.',
      'Den Feta in Würfeln oder als ganzes Stück obendrauf legen.']],

    ['Bunter Salat mit Ei und Käse', 'salat', 15, [
      ['1 Kopf|Salat oder 1 Beutel Salatmix', 'salat'], ['2|Tomaten', 'tomate', 'o'], ['½|Gurke', 'gurke', 'o'],
      ['2|Eier', 'eier', 'o'], ['80 g|Käse oder Schinken', 'kaeseAufschnitt', 'o'], ['|Öl, Essig, Senf, Salz, Pfeffer', '', 'g']], [
      'Eier 10 Minuten hart kochen, abschrecken und vierteln.',
      'Salat waschen und zerpflücken, das Gemüse schneiden, Käse oder Schinken in Streifen.',
      'Aus Öl, Essig, Senf, Salz und Pfeffer ein Dressing rühren und alles mischen.']],

    ['Caesar Salad mit Hähnchen', 'salat', 25, [
      ['250 g|Hähnchenbrust', 'haehnchen'], ['1|Römersalat oder anderer Blattsalat', 'salat'], ['2 Scheiben|Brot für Croutons', 'brot', 'o'],
      ['30 g|Parmesan', 'parmesan', 'o'], ['3 EL|Joghurt oder Mayonnaise', 'joghurtMayo', 'o'],
      ['|Zitrone, Senf, Knoblauch, Öl, Salz, Pfeffer', '', 'g']], [
      'Hähnchen würzen, in Öl braten und in Streifen schneiden.',
      'Brot würfeln und in der Pfanne knusprig rösten.',
      'Joghurt mit Zitronensaft, Senf, etwas Knoblauch, Parmesan, Salz und Pfeffer verrühren.',
      'Salat mit dem Dressing mischen, Hähnchen und Croutons darauf verteilen.']],

    ['Krautsalat', 'salat', 20, [
      ['½ Kopf|Weiß- oder Spitzkohl', 'kohl'], ['1|Karotte', 'karotte', 'o'], ['3 EL|Joghurt oder Mayonnaise', 'joghurtMayo', 'o'],
      ['|Essig, Öl, Salz, Zucker', '', 'g']], [
      'Kohl sehr fein hobeln oder schneiden und mit Salz kräftig durchkneten.',
      'Karotte raspeln und dazugeben.',
      'Mit Essig, Öl, Zucker und nach Wunsch Joghurt oder Mayonnaise anmachen und 20 Minuten ziehen lassen.']],

    ['Tzatziki', 'glas', 10, [
      ['250 g|griechischer Joghurt oder Quark', 'joghurtQuark'], ['½|Gurke', 'gurke'], ['1–2|Knoblauchzehen', 'knoblauch'],
      ['|Dill', 'dill', 'o'], ['|Olivenöl, Salz, Pfeffer', '', 'g']], [
      'Gurke grob raspeln, salzen und gut ausdrücken.',
      'Mit Joghurt, gepresstem Knoblauch, Dill und Olivenöl verrühren.',
      'Abschmecken – passt zu Brot, Kartoffeln und Gegrilltem.']],

    ['Lachs-Frischkäse-Wraps', 'burrito', 10, [
      ['4|Wraps', 'wraps'], ['150 g|Räucherlachs', 'lachs'], ['150 g|Frischkäse', 'frischkaese'],
      ['|Salat oder Gurke', 'salatGurke', 'o'], ['|Dill oder Zitrone', 'dillZitrone', 'o']], [
      'Wraps mit Frischkäse bestreichen.',
      'Mit Lachs, Salat oder Gurkenscheiben und etwas Dill belegen.',
      'Fest einrollen und schräg halbieren.']],

    // ----- Süßes & Frühstück -----
    ['Bananenbrot', 'kuchen', 70, [
      ['3|sehr reife Bananen', 'banane'], ['2|Eier', 'eier'], ['|Nüsse oder Schokostücke', 'nuesseSchoko', 'o'],
      ['250 g|Mehl, 80 g Zucker, 1 Päckchen Backpulver, Salz', '', 'g'], ['80 ml|Öl oder 80 g weiche Butter', '', 'g']], [
      'Den Ofen auf 175 °C vorheizen und eine Kastenform einfetten.',
      'Bananen zerdrücken und mit Eiern, Zucker und Öl verrühren.',
      'Mehl, Backpulver und Salz unterrühren, nach Wunsch Nüsse oder Schokostücke dazugeben.',
      'Etwa 55 Minuten backen (Stäbchenprobe).']],

    ['Bananen-Beeren-Smoothie', 'limo', 5, [
      ['1|Banane', 'banane'], ['150 g|Beeren oder anderes Obst', 'beeren', 'o'], ['200 g|Joghurt oder 200 ml Milch', 'milchJoghurt'],
      ['1 TL|Honig', 'honig', 'o']], [
      'Obst waschen und klein schneiden.',
      'Mit Joghurt oder Milch und Honig im Mixer fein pürieren.',
      'Nach Wunsch mit etwas Wasser oder Milch verdünnen.']],

    ['Milchshake', 'limo', 5, [
      ['400 ml|kalte Milch', 'milch'], ['1|Banane oder 200 g Erdbeeren', 'bananeBeeren'], ['2 Kugeln|Vanilleeis', 'eis', 'o'],
      ['1 TL|Zucker oder Honig', '', 'g']], [
      'Obst klein schneiden.',
      'Mit Milch, Eis und Zucker im Mixer schaumig pürieren.',
      'Sofort servieren.']],

    ['Overnight Oats', 'joghurt', 5, [
      ['80 g|Haferflocken', 'haferflocken'], ['150 g|Joghurt', 'joghurt'], ['100 ml|Milch', 'milch', 'o'],
      ['|Obst, z. B. Beeren, Banane oder Apfel', 'obst', 'o'], ['|Honig oder Ahornsirup', 'honig', 'o']], [
      'Haferflocken mit Joghurt und Milch verrühren.',
      'Über Nacht, mindestens 4 Stunden, im Kühlschrank quellen lassen.',
      'Morgens mit Obst und etwas Honig servieren.']],

    ['Quarkspeise mit Früchten', 'joghurt', 10, [
      ['250 g|Quark', 'quark'], ['250 g|Obst oder Beeren', 'obst'], ['150 g|Joghurt oder 50 ml Milch', 'milchJoghurt', 'o'],
      ['2 EL|Zucker oder Honig, Vanillezucker', '', 'g']], [
      'Quark mit Joghurt oder Milch, Zucker und Vanillezucker cremig rühren.',
      'Obst waschen und klein schneiden.',
      'Schichtweise in Gläser füllen oder einfach unterheben.']],

    ['Obstsalat', 'apfel', 10, [
      ['|3–4 Sorten Obst, z. B. Apfel, Banane, Trauben, Beeren', 'obst'], ['|Saft einer halben Zitrone', 'zitrone', 'o'],
      ['1 EL|Honig', 'honig', 'o'], ['|Joghurt', 'joghurt', 'o']], [
      'Obst waschen, schälen und in mundgerechte Stücke schneiden.',
      'Mit Zitronensaft und Honig mischen, damit nichts braun wird.',
      'Pur oder mit einem Klecks Joghurt servieren.']],

    ['Apfel-Crumble', 'kuchen', 40, [
      ['4|Äpfel', 'apfel'], ['40 g|Haferflocken', 'haferflocken', 'o'], ['|Vanilleeis oder Sahne', 'eisSahne', 'o'],
      ['70 g|kalte Butter', 'butter', 'g'], ['100 g|Mehl, 60 g Zucker, Zimt', '', 'g']], [
      'Den Ofen auf 190 °C vorheizen.',
      'Äpfel schälen, in Stücke schneiden und mit Zimt in eine Form geben.',
      'Mehl, Butter, Zucker und Haferflocken mit den Fingern zu Streuseln verkneten und darüberstreuen.',
      '25–30 Minuten goldbraun backen und warm mit Eis oder Sahne servieren.']],

    ['Käsekuchen ohne Boden', 'kuchen', 70, [
      ['500 g|Quark', 'quark'], ['3|Eier', 'eier'], ['|Saft einer halben Zitrone', 'zitrone', 'o'], ['|Beeren', 'beeren', 'o'],
      ['50 g|weiche Butter', 'butter', 'g'], ['100 g|Zucker, 1 Päckchen Vanillepuddingpulver', '', 'g']], [
      'Den Ofen auf 170 °C vorheizen und eine Springform einfetten.',
      'Alle Zutaten zu einer glatten Masse verrühren.',
      'In die Form füllen und etwa 55 Minuten backen, dann im ausgeschalteten Ofen abkühlen lassen.',
      'Nach Wunsch mit Beeren servieren.']],

    ['Milchreis', 'reis', 35, [
      ['125 g|Milchreis', 'milchreis'], ['500 ml|Milch', 'milch'], ['|Obst oder Apfelmus', 'obstMus', 'o'],
      ['2 EL|Zucker, Zimt', '', 'g']], [
      'Milch mit Zucker aufkochen und den Reis einrühren.',
      'Bei kleiner Hitze etwa 30 Minuten quellen lassen, dabei öfter umrühren.',
      'Mit Zimt und Zucker, Obst oder Apfelmus servieren.']],

    ['Grießbrei', 'joghurt', 15, [
      ['500 ml|Milch', 'milch'], ['60 g|Grieß', 'griess'], ['|Obst oder Kompott', 'obstMus', 'o'], ['2 EL|Zucker, Zimt', '', 'g']], [
      'Milch mit Zucker aufkochen.',
      'Grieß unter Rühren einrieseln lassen und bei kleiner Hitze 5 Minuten quellen lassen.',
      'Mit Zimt, Obst oder Kompott servieren.']],
  ];

  function compile(spec) {
    if (!spec) return null;
    const src = M[spec] || spec;
    const c = { icons: [], words: [], neg: [] };
    src.split('|').forEach((raw) => {
      raw = raw.trim();
      if (!raw) return;
      if (raw.charAt(0) === '@') { c.icons.push(raw.slice(1)); return; }
      const not = raw.charAt(0) === '!';
      if (not) raw = raw.slice(1);
      const start = raw.charAt(0) === '^';
      const end = raw.charAt(raw.length - 1) === '$';
      const w = F.norm(raw.replace(/^\^/, '').replace(/\$$/, ''));
      if (w) (not ? c.neg : c.words).push({ w, start, end });
    });
    return c;
  }

  function hit(t, n) {
    if (t.start && t.end) return n === t.w;
    if (t.start) return n.indexOf(t.w) === 0;
    if (t.end) return n.slice(-t.w.length) === t.w;
    return n.indexOf(t.w) >= 0;
  }

  function matches(c, item) {
    if (c.neg.some((t) => hit(t, item.n))) return false;
    return c.icons.indexOf(item.key) >= 0 || c.words.some((t) => hit(t, item.n));
  }

  const list = R.map(([title, icon, min, ing, steps], id) => ({
    id, title, icon, min, steps,
    ing: ing.map(([text, spec, flag]) => {
      const [amount, name] = text.indexOf('|') >= 0 ? text.split('|') : ['', text];
      return { amount, name, full: (amount ? amount + ' ' : '') + name, flag: flag || '', c: compile(spec) };
    }),
  }));

  // Wie dringend: heute 10 Punkte (muss weg!), morgen 6 … in über einer Woche 1 Punkt
  const urgency = (d) => (d <= 0 ? 10 : d === 1 ? 6 : d === 2 ? 4 : d === 3 ? 3 : d <= 7 ? 2 : 1);

  /**
   * Passende Rezepte zu den Lebensmitteln, das Dringendste zuerst.
   * fridge: [{ id, name, n (norm), key (Bild), d (Tage übrig, nur ≥ 0) }]
   * focusId: nur Rezepte, die dieses Lebensmittel verwenden
   * Ergebnis: [{ r, have: [{ g, item }], missing: [g], score }]
   */
  function suggest(fridge, focusId) {
    const out = [];
    list.forEach((r) => {
      const used = new Set();
      const have = [];
      const missing = [];
      r.ing.forEach((g) => {
        if (!g.c) return;
        let best = null;
        fridge.forEach((it) => {
          if (used.has(it.id) || !matches(g.c, it)) return;
          if (!best || it.d < best.d) best = it;
        });
        if (best) {
          used.add(best.id);
          have.push({ g, item: best });
        } else if (!g.flag) {
          missing.push(g);
        }
      });
      if (focusId) {
        if (!have.some((h) => h.item.id === focusId)) return;
      } else if (!have.some((h) => !h.g.flag)) {
        return;   // mindestens eine richtige Zutat muss da sein, Grundzutaten allein zählen nicht
      }
      const counted = have.filter((h) => h.g.flag !== 'g');
      const score = counted.reduce((s, h) => s + urgency(h.item.d), 0) + counted.length - missing.length * 1.2;
      out.push({ r, have, missing, score });
    });
    out.sort((a, b) => b.score - a.score || a.missing.length - b.missing.length || a.r.min - b.r.min);
    return out;
  }

  function chefkoch(query) {
    return 'https://www.chefkoch.de/rs/s0/' + encodeURIComponent(String(query).trim()).replace(/%20/g, '+') + '/Rezepte.html';
  }

  root.Recipes = { list, suggest, chefkoch };
})(typeof self !== 'undefined' ? self : this);
