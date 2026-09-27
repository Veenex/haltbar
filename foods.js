/* Haltbar – Lebensmittel-Bilder und automatische Erkennung.
 *
 * Bilder: Microsoft Fluent Emoji (3D), MIT-Lizenz – siehe food/LICENSE.
 * Eintrag: [Schlüssel, Fluent-Ordner, Anzeigename, Kategorie, Stufe, Suchwörter]
 *   Stufe 1 = schwaches Wort (Gewürz, Kräuter, Behälter …) – verliert gegen alles andere
 *   Stufe 2 = Zutat, Stufe 3 = Gericht/Produkt (gewinnt z. B. bei „Salami Pizza“)
 *   Suchwörter: mit Komma getrennt. ^ = muss am Wortanfang stehen, $ = am Wortende.
 *   Groß geschriebene Wörter erscheinen auch als Vorschlag beim Tippen.
 * Die Datei läuft auch im Service Worker (importScripts) – kein window/document hier.
 */
(function (root) {
  'use strict';

  const CATEGORIES = [
    ['obst', 'Obst'],
    ['gemuese', 'Gemüse & Kräuter'],
    ['milch', 'Milch, Käse & Eier'],
    ['fleisch', 'Fleisch & Wurst'],
    ['fisch', 'Fisch & Meeresfrüchte'],
    ['brot', 'Brot & Gebäck'],
    ['fertig', 'Gerichte & Fertiges'],
    ['vorrat', 'Vorrat & Zutaten'],
    ['suess', 'Süßes & Snacks'],
    ['getraenke', 'Getränke'],
    ['sonst', 'Sonstiges'],
  ];

  const ICONS = [
    // Obst
    ['apfel', 'Red apple', 'Apfel', 'obst', 2, 'Apfel, Äpfel, Obst, Apfelmus, Boskop, Elstar, Braeburn, Jonagold, Pink Lady, Granatapfel, Apple'],
    ['apfel_gruen', 'Green apple', 'Grüner Apfel', 'obst', 2, 'Grüner Apfel, Grüne Äpfel, Granny Smith'],
    ['birne', 'Pear', 'Birne', 'obst', 2, 'Birne, Birnen, Nashi, Quitte, Quitten'],
    ['banane', 'Banana', 'Banane', 'obst', 2, 'Banane, Bananen, Kochbanane'],
    ['orange', 'Tangerine', 'Orange & Mandarine', 'obst', 2, 'Orange, Orangen, Apfelsine, Apfelsinen, Mandarine, Mandarinen, Clementine, Clementinen, Klementine, Blutorange, Grapefruit, Pampelmuse, Pomelo, Kumquat, ^Kaki$'],
    ['zitrone', 'Lemon', 'Zitrone', 'obst', 2, 'Zitrone, Zitronen, Zitronensaft'],
    ['limette', 'Lime', 'Limette', 'obst', 2, 'Limette, Limetten, Limone, Limonen, Limettensaft'],
    ['trauben', 'Grapes', 'Weintrauben', 'obst', 2, 'Trauben, Traube, Weintrauben, Weintraube, Rosinen, Sultaninen'],
    ['erdbeere', 'Strawberry', 'Erdbeeren', 'obst', 2, 'Erdbeere, Erdbeeren, Himbeere, Himbeeren'],
    ['beeren', 'Blueberries', 'Heidelbeeren', 'obst', 2, 'Heidelbeeren, Heidelbeere, Blaubeeren, Blaubeere, Beeren, Brombeeren, Johannisbeeren, Preiselbeeren, Stachelbeeren, Cranberries, Aroniabeeren'],
    ['kirschen', 'Cherries', 'Kirschen', 'obst', 2, 'Kirsche, Kirschen, Sauerkirschen, Schattenmorellen'],
    ['pfirsich', 'Peach', 'Pfirsich & Pflaume', 'obst', 2, 'Pfirsich, Pfirsiche, Nektarine, Nektarinen, Aprikose, Aprikosen, Marille, Marillen, Pflaume, Pflaumen, Zwetschge, Zwetschgen, Zwetschke, Mirabellen'],
    ['mango', 'Mango', 'Mango', 'obst', 2, 'Mango, Mangos, Papaya, Maracuja, Passionsfrucht'],
    ['ananas', 'Pineapple', 'Ananas', 'obst', 2, 'Ananas, Pineapple'],
    ['kiwi', 'Kiwi fruit', 'Kiwi', 'obst', 2, 'Kiwi, Kiwis'],
    ['melone', 'Melon', 'Melone', 'obst', 2, 'Melone, Melonen, Honigmelone, Galiamelone, Cantaloupe'],
    ['wassermelone', 'Watermelon', 'Wassermelone', 'obst', 2, 'Wassermelone, Wassermelonen'],
    ['kokos', 'Coconut', 'Kokosnuss', 'obst', 2, 'Kokos, Kokosnuss, Kokosmilch, Kokosraspeln, Kokosöl'],
    ['avocado', 'Avocado', 'Avocado', 'obst', 2, 'Avocado, Avocados, Guacamole'],

    // Gemüse & Kräuter
    ['tomate', 'Tomato', 'Tomate', 'gemuese', 2, 'Tomate, Tomaten, Cherrytomaten, Kirschtomaten, Rispentomaten, Strauchtomaten, Tomatenmark, Passata, Ketchup, Tomatensoße, Tomatensauce, Dosentomaten, Pizzatomaten'],
    ['gurke', 'Cucumber', 'Gurke & Zucchini', 'gemuese', 2, 'Gurke, Gurken, Salatgurke, Salatgurken, Zucchini, Zucchinis, Gewürzgurken, Essiggurken, Senfgurken, Dillgurken, Cornichons, Schmorgurken'],
    ['paprika', 'Bell pepper', 'Paprika', 'gemuese', 2, 'Paprika, Paprikas, Paprikaschote, Paprikaschoten, Spitzpaprika'],
    ['chili', 'Hot pepper', 'Chili & Peperoni', 'gemuese', 2, 'Chili, Chilis, Chilischote, Chilischoten, Peperoni, Pfefferoni, Peperoncini, Jalapeño, Jalapeños'],
    ['karotte', 'Carrot', 'Karotten & Rüben', 'gemuese', 2, 'Karotte, Karotten, Möhre, Möhren, Mohrrübe, Mohrrüben, Rüebli, Pastinake, Pastinaken, Petersilienwurzel, Radieschen, Rettich, Rote Bete, Rote Beete, Randen, Steckrübe, Rübe, Rüben'],
    ['kartoffel', 'Potato', 'Kartoffeln', 'gemuese', 2, 'Kartoffel, Kartoffeln, Erdäpfel, Erdapfel, Frühkartoffeln, Drillinge, Salzkartoffeln, Pellkartoffeln, Kartoffelpüree, Kartoffelbrei, Püree'],
    ['suesskartoffel', 'Roasted sweet potato', 'Süßkartoffel', 'gemuese', 2, 'Süßkartoffel, Süßkartoffeln, Batate, Bataten'],
    ['zwiebel', 'Onion', 'Zwiebeln', 'gemuese', 2, 'Zwiebel, Zwiebeln, Schalotte, Schalotten, Frühlingszwiebel, Frühlingszwiebeln, Lauchzwiebel, Lauchzwiebeln, Gemüsezwiebel, Röstzwiebeln'],
    ['knoblauch', 'Garlic', 'Knoblauch', 'gemuese', 2, 'Knoblauch, Knoblauchzehe, Knoblauchzehen, Knofi'],
    ['ingwer', 'Ginger root', 'Ingwer', 'gemuese', 2, 'Ingwer, Kurkuma, Galgant'],
    ['brokkoli', 'Broccoli', 'Brokkoli & Gemüse', 'gemuese', 2, 'Brokkoli, Broccoli, Blumenkohl, Karfiol, Romanesco, Rosenkohl, Gemüse, Gemüsemix, Gemüsemischung, Suppengemüse, Wokgemüse, Rahmgemüse, Tiefkühlgemüse, Grillgemüse, Ofengemüse'],
    ['blattsalat', 'Leafy green', 'Blattsalat & Kohl', 'gemuese', 2, 'Kopfsalat, Eisbergsalat, Eisberg, Feldsalat, Rucola, Rauke, Blattsalat, Römersalat, Romanasalat, Lollo Rosso, Endivie, Endiviensalat, Chicorée, Radicchio, Babyspinat, Spinat, Blattspinat, Rahmspinat, Mangold, Grünkohl, Kohl, Weißkohl, Rotkohl, Blaukraut, Rotkraut, Weißkraut, Wirsing, Chinakohl, Spitzkohl, Pak Choi, Kohlrabi, Lauch, Porree, Sellerie, Staudensellerie, Knollensellerie, Stangensellerie, Fenchel, Sauerkraut, Kraut, Salatherz, Salatherzen, Artischocke, Artischocken'],
    ['mais', 'Ear of corn', 'Mais', 'gemuese', 2, 'Mais, Maiskolben, Zuckermais, Dosenmais, Polenta'],
    ['aubergine', 'Eggplant', 'Aubergine', 'gemuese', 2, 'Aubergine, Auberginen, Melanzani'],
    ['pilze', 'Brown mushroom', 'Pilze', 'gemuese', 2, 'Pilze, Pilz, Champignons, Champignon, Pfifferlinge, Steinpilze, Shiitake, Kräuterseitlinge, Austernpilze, Egerlinge, Schwammerl, Mushrooms'],
    ['erbsen', 'Pea pod', 'Erbsen & grüne Bohnen', 'gemuese', 2, 'Erbsen, Erbse, Zuckerschoten, Kaiserschoten, Edamame, Grüne Bohnen, Brechbohnen, Buschbohnen, Stangenbohnen, Prinzessbohnen, Keniabohnen, Fisolen, Schoten'],
    ['kuerbis', 'Jack-o-lantern', 'Kürbis', 'gemuese', 2, 'Kürbis, Kürbisse, Hokkaido, Butternut, Butternusskürbis, Muskatkürbis'],
    ['oliven', 'Olive', 'Oliven', 'gemuese', 2, 'Olive, Oliven, Olivenöl, Kapern, Antipasti'],
    ['kraeuter', 'Herb', 'Kräuter & Spargel', 'gemuese', 1, 'Kräuter, Wildkräuter, Petersilie, Basilikum, Schnittlauch, Dill, Koriander, Minze, Pfefferminze, Rosmarin, Thymian, Salbei, Oregano, Majoran, Estragon, Bärlauch, Liebstöckel, Zitronengras, Kerbel, Lorbeer, Spargel, Grünspargel, Weißer Spargel'],
    ['sprossen', 'Seedling', 'Kresse & Sprossen', 'gemuese', 2, 'Kresse, Gartenkresse, Sprossen, Keimlinge, Microgreens, Alfalfa, Sojasprossen, Mungbohnensprossen'],

    // Milch, Käse & Eier
    ['milch', 'Glass of milk', 'Milch & Sahne', 'milch', 2, 'Milch, Vollmilch, Frischmilch, H-Milch, Weidemilch, Fettarme Milch, Laktosefreie Milch, Magermilch, Buttermilch, Hafermilch, Haferdrink, Sojamilch, Sojadrink, Mandelmilch, Mandeldrink, Reismilch, Kefir, Ayran, Lassi, Dickmilch, Sahne, Schlagsahne, Kochsahne, Sprühsahne, Kaffeesahne, Rahm, Schlagrahm, Obers, Schlagobers, Kondensmilch, Kaffeeweißer'],
    ['joghurt', 'Bowl with spoon', 'Joghurt & Müsli', 'milch', 3, 'Joghurt, Jogurt, Yoghurt, Yogurt, ghurt, Naturjoghurt, Sojajoghurt, Skyr, Quark, Magerquark, Speisequark, Kräuterquark, Topfen, Schmand, Saure Sahne, Sauerrahm, Crème fraîche, Creme fraiche, Crème double, Müsli, Muesli, Granola, Cornflakes, Haferflocken, Porridge, Haferbrei, Grießbrei, Brei, Cerealien, Chiapudding, Overnight Oats, Actimel, Activia, Almighurt, Froop, Fruchtzwerge, Dessertcreme'],
    ['kaese', 'Cheese wedge', 'Käse', 'milch', 2, 'Käse, Gouda, Emmentaler, Edamer, Tilsiter, Bergkäse, Butterkäse, Camembert, Brie, Mozzarella, Burrata, Feta, Hirtenkäse, Schafskäse, Ziegenkäse, Halloumi, Grillkäse, Parmesan, Grana Padano, Pecorino, Cheddar, Gorgonzola, Roquefort, Blauschimmelkäse, Mascarpone, Ricotta, Frischkäse, Hüttenkäse, Körniger Frischkäse, Harzer, Raclettekäse, Scheibenkäse, Reibekäse, Streukäse, Schmelzkäse, Streichkäse, Käseaufschnitt, Philadelphia, Babybel, Leerdammer, Maasdamer, Appenzeller, Gruyère, Manchego, Obatzda, Cheese'],
    ['butter', 'Butter', 'Butter & Margarine', 'milch', 2, 'Butter, Margarine, Kräuterbutter, Knoblauchbutter, Streichfett, Ghee, Butterschmalz, Schmalz, Halbfettbutter, Süßrahmbutter, Sauerrahmbutter, Pflanzenbutter, ^Rama$, Lätta'],
    ['eier', 'Egg', 'Eier', 'milch', 2, '^Ei$, Eier, Bio-Eier, Freilandeier, Hühnereier, Wachteleier, Ostereier, Frühstücksei, Frühstückseier, Gekochte Eier'],

    // Fleisch & Wurst
    ['fleisch', 'Cut of meat', 'Fleisch & Hack', 'fleisch', 2, 'Fleisch, Steak, Steaks, Rind, Rindfleisch, Rinder, Beef, Hackfleisch, Hack, Gehacktes, Faschiertes, Mett, Hackepeter, Schwein, Schweinefleisch, Schnitzel, Kotelett, Koteletts, Nackensteak, Nacken, Braten, Schweinebraten, Rinderbraten, Sauerbraten, Geschnetzeltes, Rouladen, Roastbeef, Tatar, Carpaccio, Lamm, Lammfleisch, Lammkoteletts, Kalb, Kalbfleisch, Wild, Hirsch, ^Reh, Wildschwein, Leber, Minutensteaks, Entrecote, Rumpsteak, Hüftsteak, Filetsteak, Burger Patties, Patties, Grillfleisch, Schaschlik, Spieße, Medaillons, Cordon Bleu, Veggie-Hack, Sojahack'],
    ['keule', 'Meat on bone', 'Keule & Frikadellen', 'fleisch', 2, 'Keule, Lammkeule, Haxe, Haxen, Schweinshaxe, Eisbein, Rippchen, Spareribs, Ribs, Kassler, Kasseler, Frikadelle, Frikadellen, Bulette, Buletten, Fleischpflanzerl, Fleischküchle, Hackbraten, Leberkäse, Leberkas, Fleischkäse, Köttbullar, Hackbällchen, Fleischbällchen, Knochen, Beinscheibe'],
    ['haehnchen', 'Poultry leg', 'Hähnchen & Pute', 'fleisch', 2, 'Hähnchen, Hühnchen, Huhn, Hühner, Hendl, Chicken, Hähnchenbrust, Hähnchenbrustfilet, Hähnchenschenkel, Hähnchenkeule, Hähnchenkeulen, Hähnchenflügel, Hähnchenschnitzel, Chicken Wings, Wings, Chicken Nuggets, Nuggets, Pute, Puten, Putenbrust, Putenschnitzel, Putenkeule, Truthahn, Geflügel, Ente, Entenbrust, Entenkeule, Gans, Gänsekeule, Gänsebraten, Grillhähnchen, Brathähnchen, Hühnerbrust'],
    ['speck', 'Bacon', 'Speck & Schinken', 'fleisch', 2, 'Speck, Bacon, Frühstücksspeck, Speckwürfel, Schinkenwürfel, Schinken, Kochschinken, Rohschinken, Räucherschinken, Schwarzwälder Schinken, Parmaschinken, Serranoschinken, Serrano, Prosciutto, Pancetta, Bauchspeck, Schweinebauch, Bresaola, Pastrami, Putenschinken, Lachsschinken, Schinkenspeck, Katenschinken, Corned Beef, Schinkenstreifen'],
    ['wurst', 'Hot dog', 'Wurst & Aufschnitt', 'fleisch', 2, 'Wurst, Würstchen, Würste, Wiener, Wienerle, Frankfurter, Bockwurst, Bratwurst, Rostbratwurst, Currywurst, Weißwurst, Leberwurst, Teewurst, Mettwurst, Salami, Chorizo, Cabanossi, Kabanos, Landjäger, Mortadella, Lyoner, Fleischwurst, Gelbwurst, Bierwurst, Jagdwurst, Blutwurst, Aufschnitt, Wurstaufschnitt, Hot Dog, Hotdog, Knacker, Krakauer, Nürnberger, Thüringer, Merguez, Käsekrainer, Salamisticks, Minisalami'],

    // Fisch & Meeresfrüchte
    ['fisch', 'Fish', 'Fisch & Lachs', 'fisch', 2, 'Fisch, Fischfilet, Lachs, Lachsfilet, Räucherlachs, Graved Lachs, Stremellachs, Wildlachs, Thunfisch, Forelle, Forellen, Räucherforelle, Hering, Heringe, Matjes, Bismarckhering, Rollmops, Brathering, Makrele, Makrelen, Räuchermakrele, Kabeljau, Skrei, Seelachs, Dorsch, Scholle, Zander, Pangasius, Tilapia, Sardinen, Sardellen, Anchovis, Rotbarsch, Heilbutt, ^Aal, Karpfen, Dorade, Wolfsbarsch, Saibling, Seehecht, Schillerlocken, Fischfrikadellen'],
    ['garnelen', 'Shrimp', 'Garnelen', 'fisch', 2, 'Garnelen, Garnele, Shrimps, Shrimp, Krabben, Nordseekrabben, Scampi, Gambas, Riesengarnelen, Prawns, Crevetten, Meeresfrüchte, Frutti di Mare'],
    ['krebs', 'Crab', 'Krebs & Surimi', 'fisch', 2, 'Krebs, Krebse, Taschenkrebs, Königskrabbe, Krabbe, Surimi, Krebsfleisch'],
    ['hummer', 'Lobster', 'Hummer', 'fisch', 2, 'Hummer, Languste, Langusten, Flusskrebse, Kaisergranat'],
    ['tintenfisch', 'Squid', 'Tintenfisch', 'fisch', 2, 'Tintenfisch, Tintenfische, Calamari, Calamares, Kalmar, Kalmare, Oktopus, Octopus, Krake, Pulpo, Sepia'],
    ['muscheln', 'Oyster', 'Muscheln', 'fisch', 2, 'Muscheln, Muschel, Miesmuscheln, Venusmuscheln, Jakobsmuscheln, Austern, Auster, Vongole'],
    ['backfisch', 'Fried shrimp', 'Fischstäbchen', 'fisch', 2, 'Fischstäbchen, Backfisch, Tempura, Panierter Fisch, Fish and Chips'],

    // Brot & Gebäck
    ['brot', 'Bread', 'Brot & Brötchen', 'brot', 2, 'Brot, Brote, Toast, Toastbrot, Vollkorntoast, Vollkornbrot, Brötchen, Semmel, Semmeln, Schrippe, Schrippen, ^Weck, Roggenbrot, Mischbrot, Graubrot, Bauernbrot, Sauerteigbrot, Dinkelbrot, Weißbrot, Knäckebrot, Knäcke, Pumpernickel, Sandwichbrot, Brioche, Hefezopf, Stuten, Rosinenbrot, Zwieback, Aufbackbrötchen, Burgerbrötchen, ^Buns$, Körnerbrötchen, Pizzabrötchen, Toastbrötchen, Kaiserbrötchen'],
    ['baguette', 'Baguette bread', 'Baguette', 'brot', 2, 'Baguette, Baguettes, Ciabatta, Stangenweißbrot, Knoblauchbaguette, Kräuterbaguette, Pizzabaguette, Focaccia'],
    ['croissant', 'Croissant', 'Croissant & Plunder', 'brot', 2, 'Croissant, Croissants, Buttercroissant, Schokocroissant, Hörnchen, Plunder, Plundergebäck, Blätterteig, Franzbrötchen, Schnecke, Zimtschnecke, Nussschnecke, Gebäck, Teilchen, Kopenhagener, Pain au Chocolat'],
    ['brezel', 'Pretzel', 'Brezel', 'brot', 2, 'Brezel, Brezeln, Breze, Brezn, Laugenbrezel, Laugenbrötchen, Laugenstange, Laugenstangen, Laugenecken, Laugengebäck, Salzstangen, Salzbrezeln, Butterbrezel'],
    ['bagel', 'Bagel', 'Bagel', 'brot', 2, 'Bagel, Bagels'],
    ['fladenbrot', 'Flatbread', 'Fladenbrot & Wraps', 'brot', 2, 'Fladenbrot, Tortilla, Tortillas, Wraps, Tortillawraps, Naan, Pita, Pitabrot, Lavash, Yufka, Pfannenbrot, Chapati, ^Roti$'],
    ['pfannkuchen', 'Pancakes', 'Pfannkuchen', 'brot', 3, 'Pfannkuchen, Pancakes, Eierkuchen, Crêpes, Crêpe, Crepes, Palatschinken, Kaiserschmarrn, Blinis, Poffertjes'],

    // Gerichte & Fertiges
    ['salat', 'Green salad', 'Salat', 'fertig', 3, 'Salat, Salate, Nudelsalat, Kartoffelsalat, Wurstsalat, Krautsalat, Coleslaw, Eiersalat, Thunfischsalat, Fleischsalat, Obstsalat, Gurkensalat, Tomatensalat, Couscoussalat, Salatmix, Salatmischung, Bowl, Poke Bowl, Buddha Bowl, Caesar Salad, Salatteller'],
    ['pizza', 'Pizza', 'Pizza', 'fertig', 3, 'Pizza, Pizzen, Tiefkühlpizza, Pizzastück, Flammkuchen, Calzone'],
    ['burger', 'Hamburger', 'Burger', 'fertig', 3, 'Burger, Hamburger, Cheeseburger, Veggieburger, Chickenburger'],
    ['pommes', 'French fries', 'Pommes & Kroketten', 'fertig', 3, 'Pommes, Pommes frites, Fritten, Kroketten, Wedges, Kartoffelwedges, Potato Wedges, Country Potatoes, Rösti, Reibekuchen, Kartoffelpuffer, Hash Browns'],
    ['sandwich', 'Sandwich', 'Sandwich', 'fertig', 3, 'Sandwich, Sandwiches, Stulle, Stullen, Butterbrot, Schnittchen, Belegtes Brötchen, Belegte Brötchen, Panini, Club Sandwich, Toast Hawaii'],
    ['taco', 'Taco', 'Taco & Nachos', 'fertig', 3, 'Taco, Tacos, Nachos, Tortillachips, Tacoschalen'],
    ['burrito', 'Burrito', 'Wrap & Burrito', 'fertig', 3, 'Burrito, Burritos, ^Wrap$, wrap$, Enchilada, Enchiladas, Quesadilla, Quesadillas, Fajitas'],
    ['doener', 'Stuffed flatbread', 'Döner & Gyros', 'fertig', 3, 'Döner, Döner Kebab, Kebab, Kebap, Gyros, Dürüm, Falafeltasche, Shawarma, Schawarma, Souvlaki'],
    ['falafel', 'Falafel', 'Falafel', 'fertig', 3, 'Falafel, Falafeln, Gemüsebällchen'],
    ['ramen', 'Steaming bowl', 'Nudelsuppe & Ramen', 'fertig', 3, 'Ramen, Nudelsuppe, Instantnudeln, ^Pho$, Udon, Mie-Nudeln, Mienudeln, Glasnudeln, Reisnudeln, Asia-Nudeln, Yum Yum, Wantan-Suppe, Miso, Misosuppe'],
    ['curry', 'Curry rice', 'Curry & Chili', 'fertig', 3, 'Curry, Currys, ^Dal$, ^Dhal$, Masala, Tikka Masala, Butter Chicken, Korma, Thai-Curry, Chili con Carne, Chili sin Carne'],
    ['suppe', 'Pot of food', 'Suppe & Eintopf', 'fertig', 3, 'Suppe, Suppen, Eintopf, Gulasch, Gulaschsuppe, Kartoffelsuppe, Linsensuppe, Erbsensuppe, Tomatensuppe, Kürbissuppe, Hühnersuppe, Hühnerfrikassee, Frikassee, Brühe, Gemüsebrühe, Hühnerbrühe, Rinderbrühe, Brühwürfel, ^Fond$, Bouillon, Soljanka, Borschtsch, Minestrone, Ragout, Vorgekocht, Selbstgekocht'],
    ['auflauf', 'Shallow pan of food', 'Auflauf & Pfanne', 'fertig', 3, 'Auflauf, Nudelauflauf, Kartoffelauflauf, Gratin, Kartoffelgratin, Lasagne, Lasagna, Moussaka, Paella, Pfanne, Pfannengericht, Gemüsepfanne, Reispfanne, Ofengericht, Wokgericht'],
    ['maultaschen', 'Dumpling', 'Maultaschen & Knödel', 'fertig', 3, 'Maultaschen, Maultasche, Tortellini, Tortelloni, Ravioli, Gnocchi, Teigtaschen, Pierogi, Piroggen, Gyoza, Dim Sum, Wan Tan, Wantan, Knödel, Klöße, Kloß, Semmelknödel, Kartoffelknödel, Kartoffelklöße, Germknödel, Leberknödel, Pelmeni, Empanadas, Empanada, Samosa, Samosas, Frühlingsrollen, Frühlingsrolle'],
    ['spiegelei', 'Cooking', 'Spiegelei & Rührei', 'fertig', 3, 'Spiegelei, Spiegeleier, Rührei, Omelett, Omelette, Frittata, Shakshuka, Bauernfrühstück'],
    ['quiche', 'Pie', 'Quiche & Teig', 'fertig', 3, 'Quiche, Tarte, ^Pie$, Strudel, Apfelstrudel, Topfenstrudel, Pastete, Pasteten, Teig, Pizzateig, Mürbeteig, Hefeteig, Quarkteig'],
    ['sushi', 'Sushi', 'Sushi', 'fertig', 3, 'Sushi, Maki, Nigiri, Sashimi, California Roll, Inside Out Roll'],
    ['onigiri', 'Rice ball', 'Onigiri', 'fertig', 3, 'Onigiri, Reisbällchen'],
    ['fondue', 'Fondue', 'Fondue & Raclette', 'fertig', 3, 'Fondue, Käsefondue, Fleischfondue, Raclette'],
    ['bento', 'Bento box', 'Lunchbox', 'fertig', 1, 'Bento, Lunchbox, Brotdose, Meal Prep, Mealprep, Mittagessen, Pausenbrot'],
    ['reste', 'Takeout box', 'Reste & Takeaway', 'fertig', 1, 'Reste, ^Rest$, Essensreste, Übrig, Übriggebliebenes, Takeaway, Take-away, Lieferessen, Chinesisch, Asiatisch, Nasi Goreng, Bami Goreng, Gebratene Nudeln, Gebratener Reis'],

    // Vorrat & Zutaten
    ['nudeln', 'Spaghetti', 'Nudeln & Pasta', 'vorrat', 3, 'Nudeln, Nudel, Pasta, Spaghetti, Penne, Fusilli, Farfalle, Tagliatelle, Bandnudeln, Makkaroni, Maccheroni, Rigatoni, Linguine, Tortiglioni, Orecchiette, Conchiglie, Lasagneplatten, Spätzle, Knöpfle, Eiernudeln, Vollkornnudeln, Hörnchennudeln, Teigwaren, Bolognese, Carbonara, Mac and Cheese'],
    ['reis', 'Cooked rice', 'Reis & Couscous', 'vorrat', 2, 'Reis, Basmatireis, Basmati, Jasminreis, Langkornreis, Vollkornreis, Wildreis, Parboiled Reis, Risotto, Risottoreis, Milchreis, Sushireis, Couscous, Bulgur, Quinoa, Hirse, Graupen'],
    ['mehl', 'Sheaf of rice', 'Mehl & Getreide', 'vorrat', 2, 'Mehl, Weizenmehl, Dinkelmehl, Roggenmehl, Vollkornmehl, Maismehl, Grieß, Hartweizengrieß, Stärke, Speisestärke, Maisstärke, Kartoffelstärke, Paniermehl, Semmelbrösel, Getreide, Hafer, Dinkel, Haferkleie, Kleie, Backmischung'],
    ['bohnen', 'Beans', 'Bohnen & Linsen', 'vorrat', 2, 'Bohnen, Kidneybohnen, Weiße Bohnen, Baked Beans, Linsen, Rote Linsen, Kichererbsen, Hummus, Tofu, Räuchertofu, Tempeh, Seitan, Sojabohnen, Limabohnen, Dicke Bohnen'],
    ['nuesse', 'Peanuts', 'Nüsse & Kerne', 'vorrat', 2, 'Nüsse, Nuss, Erdnüsse, Erdnuss, Erdnussbutter, Erdnussmus, Nussmischung, Studentenfutter, Mandeln, Mandel, Cashews, Cashewkerne, Pistazien, Walnüsse, Walnuss, Haselnüsse, Haselnuss, Macadamia, Paranüsse, Pekannüsse, Pinienkerne, Sonnenblumenkerne, Kürbiskerne, Kerne, Samen, Chiasamen, Leinsamen, Sesam, Nussmus, Mandelmus'],
    ['kastanien', 'Chestnut', 'Maronen', 'vorrat', 2, 'Kastanien, Maronen, Maroni, Esskastanien'],
    ['dose', 'Canned food', 'Konserven', 'vorrat', 1, 'Dose, Dosen, Konserve, Konserven, Büchse, Dosensuppe'],
    ['glas', 'Jar', 'Glas & Soße', 'vorrat', 3, 'Marmelade, Konfitüre, Gelee, Aufstrich, Brotaufstrich, Nutella, Nuss-Nougat-Creme, Nougatcreme, Schokocreme, Pesto, Senf, Mayonnaise, Mayo, Remoulade, Aioli, ^Dip, dip$, Salsa, Chutney, Relish, Meerrettich, ^Kren$, Tahini, Sambal, Sriracha, Soße, Soßen, Sauce, Saucen, Dressing, Salatdressing, Sojasauce, Sojasoße, BBQ-Sauce, Barbecuesauce, Grillsauce, Hollandaise, Tzatziki, Zaziki, Gläschen, Eingemachtes, Eingelegtes, Mixed Pickles, Glas, Gläser'],
    ['honig', 'Honey pot', 'Honig & Sirup', 'vorrat', 2, 'Honig, Blütenhonig, Waldhonig, Akazienhonig, Ahornsirup, Sirup, Agavendicksaft, Dattelsirup, Rübensirup, Zuckerrübensirup'],
    ['gewuerze', 'Salt', 'Salz & Gewürze', 'vorrat', 1, 'Salz, Meersalz, Pfeffer, Gewürz, Gewürze, Gewürzmischung, Paprikapulver, Currypulver, Chilipulver, Zimt, Muskat, Muskatnuss, Kümmel, Chiliflocken, Zucker, Puderzucker, Rohrzucker, Vanillezucker, Süßstoff, Backpulver, Natron, Hefe, Trockenhefe, Gelatine, Vanille, Kakaopulver, Brühpulver'],
    ['oel', 'Pouring liquid', 'Öl & Essig', 'vorrat', 2, '^Öl$, öl$, Rapsöl, Sonnenblumenöl, Sesamöl, Bratöl, Leinöl, Essig, Balsamico, Apfelessig, Weinessig, Kräuteressig'],

    // Süßes & Snacks
    ['schokolade', 'Chocolate bar', 'Schokolade', 'suess', 3, 'Schokolade, Schoko, Schoki, Chocolate, Schokoriegel, Riegel, Müsliriegel, Proteinriegel, Pralinen, Praline, Kinderschokolade, Milka, Ritter Sport, ^Mars$, Snickers, Twix, Bounty, KitKat, Lindt, Kuvertüre, Zartbitter, Nougat, Schokodrops, Chocolate Chips'],
    ['bonbons', 'Candy', 'Süßigkeiten', 'suess', 3, 'Süßigkeiten, Bonbons, Bonbon, Gummibärchen, Gummibären, Fruchtgummi, Weingummi, Haribo, Lakritz, Lakritze, Kaugummi, Marshmallows, Schaumküsse, Mentos, Karamell, Toffee, Candy'],
    ['lolli', 'Lollipop', 'Lollis', 'suess', 3, 'Lolli, Lollis, Lutscher, Lollipop'],
    ['popcorn', 'Popcorn', 'Chips & Snacks', 'suess', 3, 'Popcorn, Chips, Kartoffelchips, Crisps, Flips, Erdnussflips, Snack, Snacks, Knabberzeug, Pringles'],
    ['cracker', 'Rice cracker', 'Cracker & Reiswaffeln', 'suess', 3, 'Cracker, Kräcker, Reiswaffeln, Reiswaffel, Maiswaffeln, Crispbread'],
    ['keks', 'Cookie', 'Kekse', 'suess', 3, 'Keks, Kekse, Cookies, Cookie, Plätzchen, Butterkekse, Lebkuchen, Spekulatius, Printen, Makronen, Löffelbiskuits, Oreo, Leibniz, Prinzenrolle, Doppelkekse, Haferkekse, Biscotti, Amarettini'],
    ['kuchen', 'Shortcake', 'Kuchen & Torte', 'suess', 3, 'Kuchen, Torte, Torten, Tortenstück, Kuchenstück, Käsekuchen, Cheesecake, Obstkuchen, Streuselkuchen, Rührkuchen, Marmorkuchen, Bienenstich, Kirschtorte, Sahnetorte, Obsttorte, Tiramisu, Brownie, Brownies, Blechkuchen, Zupfkuchen, Apfelkuchen, Rüblitorte, Mohnkuchen, Stollen, Christstollen'],
    ['geburtstag', 'Birthday cake', 'Geburtstagstorte', 'suess', 3, 'Geburtstagstorte, Geburtstagskuchen, Motivtorte'],
    ['muffin', 'Cupcake', 'Muffins', 'suess', 3, 'Muffin, Muffins, Cupcake, Cupcakes, Törtchen, Madeleines'],
    ['donut', 'Doughnut', 'Donuts', 'suess', 3, 'Donut, Donuts, Doughnut, Berliner, Krapfen, Kreppel'],
    ['waffel', 'Waffle', 'Waffeln', 'suess', 3, 'Waffel, Waffeln, Waffelteig'],
    ['pudding', 'Custard', 'Pudding & Dessert', 'suess', 3, 'Pudding, Grießpudding, Schokopudding, Vanillepudding, Panna Cotta, Flan, Crème brûlée, Creme Brulee, Wackelpudding, Götterspeise, Mousse, Mousse au Chocolat, Rote Grütze, Dessert, Desserts, Nachtisch'],
    ['eis', 'Ice cream', 'Eis', 'suess', 3, '^Eis$, eis$, Eiscreme, Eiskrem, Speiseeis, Vanilleeis, Schokoeis, Erdbeereis, Sorbet, Gelato, Eisbecher, Magnum, Frozen Yogurt'],
    ['softeis', 'Soft ice cream', 'Softeis', 'suess', 3, 'Softeis, Eistüte, Eiswaffel, Waffeleis, Frozen Joghurt'],
    ['mochi', 'Dango', 'Mochi', 'suess', 3, 'Mochi, Dango'],

    // Getränke
    ['saft', 'Beverage box', 'Saft', 'getraenke', 3, 'Saft, Säfte, Orangensaft, O-Saft, Apfelsaft, Traubensaft, Multivitaminsaft, Multisaft, ACE-Saft, Direktsaft, Fruchtsaft, Gemüsesaft, Tomatensaft, Karottensaft, Nektar, Capri-Sun, Capri-Sonne, Trinkpäckchen, Juice'],
    ['limo', 'Cup with straw', 'Limo, Cola & Shakes', 'getraenke', 3, 'Cola, Coca-Cola, Pepsi, Limo, Limonade, Fanta, Sprite, Spezi, Mezzo Mix, Softdrink, Softdrinks, Eistee, Iced Tea, Schorle, Apfelschorle, Saftschorle, Smoothie, Smoothies, Milchshake, Shake, Proteinshake, Energydrink, Energy, Red Bull, Ginger Ale, Tonic, Bitter Lemon, Fassbrause, Bionade, Kombucha'],
    ['bubbletea', 'Bubble tea', 'Bubble Tea & Eiskaffee', 'getraenke', 3, 'Bubble Tea, Bubbletea, Eiskaffee, Frappé, Frappuccino, Iced Latte, Cold Brew'],
    ['wasser', 'Droplet', 'Wasser', 'getraenke', 2, 'Wasser, Mineralwasser, Sprudel, Sprudelwasser, Tafelwasser, Stilles Wasser, Kokoswasser'],
    ['kaffee', 'Hot beverage', 'Kaffee & Kakao', 'getraenke', 3, 'Kaffee, Kaffeebohnen, Kaffeepulver, Filterkaffee, Espresso, Cappuccino, Latte Macchiato, ^Latte$, Milchkaffee, Kaffeepads, ^Pads$, Kaffeekapseln, Instantkaffee, Kakao, Heiße Schokolade, Trinkschokolade, Hot Chocolate, Chai Latte'],
    ['tee', 'Teacup without handle', 'Tee', 'getraenke', 3, 'Tee, Grüntee, Grüner Tee, Schwarztee, Schwarzer Tee, Kräutertee, Früchtetee, Pfefferminztee, Kamillentee, Ingwertee, Matcha, Rooibos, ^Chai$, Teebeutel'],
    ['teekanne', 'Teapot', 'Teekanne', 'getraenke', 3, 'Teekanne'],
    ['bier', 'Beer mug', 'Bier', 'getraenke', 3, 'Bier, Biere, Pils, Pilsner, Helles, Weizenbier, Weißbier, Hefeweizen, Radler, Alster, Kölsch, ^Alt$, Altbier, ^Export$, Craft Beer, ^Beer$, ^IPA$, Alkoholfreies Bier, Malzbier, Cider'],
    ['wein', 'Wine glass', 'Wein', 'getraenke', 3, 'Wein, Weine, Rotwein, Weißwein, ^Rosé$, Roséwein, Glühwein, Weinschorle, Riesling, Grauburgunder, Chardonnay, Merlot, Sauvignon, Primitivo, Chianti, Dornfelder, Portwein, Sherry, Wine'],
    ['sekt', 'Bottle with popping cork', 'Sekt & Prosecco', 'getraenke', 3, 'Sekt, Champagner, Prosecco, Crémant, ^Cava$, Schaumwein, Spumante, Secco, Frizzante'],
    ['cocktail', 'Cocktail glass', 'Cocktail & Likör', 'getraenke', 3, 'Cocktail, Cocktails, Martini, Aperol, Aperol Spritz, Spritz, ^Hugo$, Likör, Eierlikör, Baileys, Amaretto, Limoncello, Campari, Gin Tonic, Sangria, Bowle'],
    ['schnaps', 'Tumbler glass', 'Schnaps & Spirituosen', 'getraenke', 3, 'Schnaps, Whisky, Whiskey, ^Rum$, Wodka, Vodka, ^Gin$, ^Korn$, Obstler, Tequila, Brandy, Cognac, Weinbrand, Grappa, Ouzo, Jägermeister, Kräuterlikör, Spirituosen'],
    ['tropisch', 'Tropical drink', 'Tropischer Drink', 'getraenke', 3, 'Piña Colada, Pina Colada, Mojito, Caipirinha, Daiquiri, Mai Tai, Tropical'],
    ['sake', 'Sake', 'Sake & Reiswein', 'getraenke', 3, 'Sake, Reiswein'],
    ['mate', 'Mate', 'Mate', 'getraenke', 3, '^Mate$, Club-Mate, Mate-Tee'],
    ['eiswuerfel', 'Ice', 'Eiswürfel', 'getraenke', 2, 'Eiswürfel, Crushed Ice, ^Ice$'],

    // Sonstiges
    ['teller', 'Fork and knife with plate', 'Mahlzeit', 'sonst', 1, 'Essen, Mahlzeit, Gericht, Menü, Fertiggericht, Tellergericht, Abendessen'],
    ['baby', 'Baby bottle', 'Babynahrung', 'sonst', 2, 'Babymilch, Babynahrung, Babybrei, Pre-Nahrung, Säuglingsnahrung, Folgemilch, Anfangsmilch, Milchpulver'],
    ['katze', 'Cat face', 'Katzenfutter', 'sonst', 2, 'Katzenfutter, Katze, Katzen, Kitten, Katzenleckerli'],
    ['hund', 'Dog face', 'Hundefutter', 'sonst', 2, 'Hundefutter, Hund, Hunde, Welpenfutter, Kauknochen, Hundeleckerli'],
    ['tierfutter', 'Paw prints', 'Tierfutter', 'sonst', 2, 'Tierfutter, Futter, Nassfutter, Trockenfutter, Leckerli, Leckerlis, Vogelfutter, Fischfutter'],
    ['medizin', 'Pill', 'Medikamente', 'sonst', 2, 'Medikament, Medikamente, Tabletten, Tablette, Pillen, Arznei, Vitamine, Vitamin, Nahrungsergänzung, Magnesium, Hustensaft'],
    ['tiefkuehl', 'Snowflake', 'Tiefkühl', 'sonst', 1, 'Tiefkühl, Tiefkühlkost, ^TK$, Gefroren, Eingefroren, Gefriergut'],
    ['einkauf', 'Shopping cart', 'Einkauf', 'sonst', 1, 'Einkauf, Einkäufe, Sonstiges, Lebensmittel'],
  ];

  // Wörter, die nur einen Behälter beschreiben: „Mais Dose“ → Mais.
  const WEAK = new Set(['dose', 'dosen', 'konserve', 'konserven', 'buchse', 'glas', 'glaser']);
  // Alles ab diesen Wörtern zählt nicht mehr: „Milch für Kaffee“ → Milch.
  const PREPS = new Set(['mit', 'fur', 'in', 'im', 'ohne', 'vom', 'von', 'aus', 'und', 'oder', 'am', 'zum', 'zur', 'auf', 'nach']);
  const FALLBACK = 'teller';
  // Alltägliches zuerst vorschlagen („Mi“ → Milch vor Miso)
  const COMMON = new Set([
    'Milch', 'Butter', 'Käse', 'Eier', 'Joghurt', 'Quark', 'Sahne', 'Frischkäse', 'Mozzarella', 'Schmand',
    'Brot', 'Toast', 'Brötchen', 'Hackfleisch', 'Hähnchen', 'Hähnchenbrust', 'Schinken', 'Salami', 'Wurst', 'Lachs',
    'Salat', 'Tomaten', 'Gurke', 'Paprika', 'Karotten', 'Kartoffeln', 'Zwiebeln', 'Zucchini', 'Spinat', 'Champignons',
    'Äpfel', 'Bananen', 'Erdbeeren', 'Trauben', 'Zitronen', 'Nudeln', 'Reis', 'Pizza', 'Tofu', 'Saft', 'Orangensaft',
  ].map(norm));

  function norm(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u').replace(/ß/g, 'ss')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ae/g, 'a').replace(/oe/g, 'o').replace(/ue/g, 'u')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  const list = [];
  const byKey = Object.create(null);
  const single = [];
  const multi = [];
  const suggestions = [];
  const seen = new Set();

  ICONS.forEach(([key, folder, label, cat, tier, words]) => {
    const icon = { key, folder, label, cat, tier, words: [], nwords: [norm(label)] };
    list.push(icon);
    byKey[key] = icon;
    words.split(',').forEach((raw) => {
      raw = raw.trim();
      if (!raw) return;
      const start = raw.charAt(0) === '^';
      const end = raw.charAt(raw.length - 1) === '$';
      const display = raw.replace(/^\^/, '').replace(/\$$/, '');
      const k = norm(display);
      if (!k) return;
      icon.words.push(display);
      icon.nwords.push(k);
      const entry = { k, key, start, end, weak: tier === 1 || WEAK.has(k) };
      (k.indexOf(' ') >= 0 ? multi : single).push(entry);
      if (/^[A-ZÄÖÜ]/.test(display) && !seen.has(k)) {
        seen.add(k);
        suggestions.push({ name: display, n: k, key });
      }
    });
  });

  // Im selben Wort: ganzes Wort > kein schwaches Wort > weiter hinten (Grundwort) > länger.
  function better(a, b) {
    if (a.full !== b.full) return a.full;
    if (a.weak !== b.weak) return !a.weak;
    if (a.end !== b.end) return a.end > b.end;
    return a.len > b.len;
  }

  /** Passendes Bild zu einem Namen, oder null. learned = vom Nutzer gewählte Bilder. */
  function match(name, learned) {
    const n = norm(name);
    if (!n) return null;
    if (learned && learned[n] && byKey[learned[n]]) return learned[n];

    let words = n.split(' ');
    const cut = words.findIndex((w, i) => i > 0 && PREPS.has(w));
    if (cut > 0) words = words.slice(0, cut);

    const padded = ' ' + words.join(' ') + ' ';
    let bestMulti = null;
    for (const e of multi) {
      if (padded.indexOf(' ' + e.k + ' ') >= 0 && (!bestMulti || e.k.length > bestMulti.k.length)) bestMulti = e;
    }
    if (bestMulti) return bestMulti.key;

    let pick = null;
    words.forEach((w, wi) => {
      let wb = null;
      for (const e of single) {
        let i = w.indexOf(e.k);
        while (i !== -1) {
          const end = i + e.k.length;
          if ((!e.start || i === 0) && (!e.end || end === w.length)) {
            const c = { key: e.key, weak: e.weak, full: i === 0 && end === w.length, end, len: e.k.length };
            if (!wb || better(c, wb)) wb = c;
          }
          i = w.indexOf(e.k, i + 1);
        }
      }
      if (!wb) return;
      const tier = wb.weak ? 1 : byKey[wb.key].tier;
      // Zwischen Wörtern: Gericht schlägt Zutat, sonst zählt das hintere Wort („Bio Vollmilch“).
      if (!pick || tier > pick.tier || (tier === pick.tier && wi > pick.wi)) pick = { key: wb.key, tier, wi };
    });
    return pick ? pick.key : null;
  }

  /** Namensvorschläge beim Tippen. */
  function suggest(input, limit) {
    const n = norm(input);
    if (n.length < 2) return [];
    const out = suggestions.filter((s) => s.n !== n && s.n.indexOf(n) === 0);
    out.sort((a, b) => COMMON.has(b.n) - COMMON.has(a.n) || a.n.length - b.n.length || a.name.localeCompare(b.name, 'de'));
    return out.slice(0, limit || 6);
  }

  /** Bilder-Suche in der Auswahl. */
  function search(q) {
    const n = norm(q);
    if (!n) return list;
    const hits = list.filter((ic) => ic.nwords.some((w) => w.indexOf(n) >= 0));
    hits.sort((a, b) => (b.nwords[0].indexOf(n) >= 0) - (a.nwords[0].indexOf(n) >= 0));
    return hits;
  }

  function src(key) {
    return 'food/' + (byKey[key] ? key : FALLBACK) + '.webp';
  }

  root.Foods = { CATEGORIES, list, byKey, FALLBACK, norm, match, suggest, search, src };
})(typeof self !== 'undefined' ? self : this);
