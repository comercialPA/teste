declare const L: any;

type LangCode = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ar' | 'ru' | 'hi';
type BenefitKind = 'wine' | 'starter' | 'dessert' | 'discount' | 'twoforone' | 'coffee' | 'gift' | 'none';
type Place = {
  id: string;
  name: string;
  typeKey: string;
  rating: number;
  reviews: number;
  address: string;
  phone: string;
  whatsapp?: string;
  hours: string;
  accent: string;
  initials: string;
  icon: string;
  lat: number | null;
  lng: number | null;
  description: string;
  items: string[];
  food: boolean;
  benefitKind: BenefitKind;
  benefitValue?: string;
};

const VERSION = '1.0.9 perla andina';
const DEFAULT_WHATSAPP = '5492901498474';
const CATALOG_URL = 'https://catalogoperlaandina.vercel.app/';

const GOOGLE_PLACE_IDS: Record<string, string> = {
  'perla-andina': 'ChIJlSCtOgANu70RBnKHRvnI54c',
  'dona-mecha': 'ChIJy2KPE8AMu70Rs86xzyOmizM',
  'don-pichon': 'ChIJXQubnKQMu70RjdXEBMq0K1g',
  bokado: 'ChIJue9YfAANu70RFmDHCPCA2ak',
  acuarela: 'ChIJ0zC-Vb4Mu70RIpMyAl7IWbI',
  'el-gaita': 'ChIJQ0BrCIINu70REnwvhv2lCBU',
  'panaderia-libertador': 'ChIJsTcf2sMMu70Ry11DJoSODgI',
  'coffee-roasters': 'ChIJIfdQUR0Nu70Rd9nXokUR6-g',
  'taxi-kehek': 'ChIJcXbG1ZgNu70RzoH5sM6oNcA',
  isabel: 'ChIJAZUCHbwMu70R-tIP5tPERew',
  'la-zorra': 'ChIJKxM8x70Mu70RfoOhMrxcERM',
  'las-huellas': 'ChIJVV8Le74Mu70R8OWnSjg1mfs',
  'farmacia-central': 'ChIJYZ_jTZYNu70RdMcGIgi_aZg',
  'posada-alamos': 'ChIJy2KPE8AMu70RdKJ662iTI-s',
  'farmacia-el-calafate': 'ChIJi4_PVL4Mu70RJzBlbnHJylQ',
  'farmacia-franco-sur': 'ChIJgUi7lMAMu70RKnUTkiTKCGw',
  'farmacia-santa-lucia': 'ChIJ5w5vf8YNu70ROaM6sUbZDWw',
  'farmacia-del-rosario': 'ChIJYSSXTR4Nu70R3VoFw6jcD9A',
  'farmacia-libertador': 'ChIJm_jWdwANu70R0LYQnutuWqg',
  'farmacia-don-bosco': 'ChIJPyhs878Mu70RzpBt-W7W0_s',
  'farmacia-the-pharmacy': 'ChIJGR2xPM0Nu70R0i2dFWaFdvA',
  'remis-calafate-viajes': 'ChIJ6fYyOr4Mu70RfJHkWUtbjHg',
  'ofc-traslados': 'ChIJvZ-4L9cNu70Rq5zHb0lBy0c',
  'calafate-central': 'ChIJqziR5BYNu70R5ozEnP4erpg',
  'remis-lago-argentino': 'ChIJfQKVxL0Mu70RtihbOFREN78',
  'calafate-taxi': 'ChIJ-fqkvKwNu70RSgR8ABkl2FE',
  'remises-otilnau': 'ChIJGyWNDMMMu70Rj8vtKZ5deds',
  'blue-calafate': 'ChIJvUQiqn4Nu70RWU-tQ1Xn-Ys',
  'taxi-remises-terminal': 'ChIJKSOCW-UNu70RaPWxVEOdVe8',
  'taxiremis-region': 'ChIJxVFDlL4Mu70R4dqVXhDd8MI',
  'traslados-privados-calafate': 'ChIJTYFqWVMM6a0RiECGOdraBsY',
  'remis-nueva-libertador': 'ChIJ-xBX-pcMu70R9hVA_1p8HsY',
  'traslados-en-calafate': 'ChIJzyT0rLANu70RKulJJ0HGOyU',
  'remis-rolando': 'ChIJEQS3SAANu70RfX0hsPuU-_s',
  'laguna-nimez': 'ChIJzwXU0bAMu70R-QBzN82Q9xw',
  'centro-interpretacion': 'ChIJc0JJHLoMu70R4hoFI8EXX5o',
  'walichu': 'ChIJuSaSPSd1u70RAPUXo4C5HKw',
  'plaza-perito-moreno': 'ChIJIRZ1dNcNu70Rpvsh7Lmp0j4',
  'heroes-malvinas': 'ChIJl_5hbsEMu70R1zEaowSARK8',
  glaciarium: 'ChIJw2emLNkMu70RsSBZVLW7fVQ',
  'museo-regional': 'ChIJ56Ja4ZcMu70RwnmpUkIjloA',
  'mirador-lago-argentino': 'ChIJ_48zt6wMu70RkJTPhZBKdVA',
  'mirador-ciudad': 'ChIJv1q7Rb0Mu70RlGOl8UdM3aQ',
  'plaza-pioneros': 'ChIJPwMQPZEMu70RqihzR_Uqec0',
  'paseo-costanera': 'ChIJXUNgnFgNu70R6McyK5xwaKM',
  'anfiteatro-bosque': 'ChIJ4Zk8h8AMu70RYDDBoyJKBZY',
  'punta-soberana': 'ChIJ3yUQW1Rzu70R_SzbZ8TJyfQ',
  'playita-punta-soberana': 'ChIJxZuDoA9zu70RBGiucIz7Lcw',
  'estancia-25-mayo': 'ChIJWQsuS3UNu70R-_lKwI17LXc',
  'punto-panoramico': 'ChIJpcOLa3cNu70RThWkFzEMAAs',
  'glaciar-perito-moreno': 'ChIJHWK7u4gNu70RDarZKsIOulQ',
  'parque-los-glaciares': 'ChIJVZJRWSiypL0R3dHwpGmtXeY',
  'pasarelas-perito-moreno': 'ChIJ5Q5bDs3KpL0Rp3C9P3Lq5Ik',
  'lago-roca': 'ChIJU-l9av4wu70RCrYhPp83pD0',
  'lago-argentino': 'ChIJPbd8bugMu70RJi6kz2HWhY4',
  'puerto-bajo-sombras': 'ChIJDQl78d80u70Ryg4SL2d48Nc',
  'puerto-bandera': 'ChIJ1d4GABFEu70RB65ZzsJizRY',
  'glaciar-upsala': 'ChIJm8arDp8Mu70RGFggC5MLecY',
  'glaciar-spegazzini': 'ChIJ_24H2kCvpL0Rt1K8ojIRBSg',
  'canadon-arroyo-calafate': 'ChIJp7cZr48Mu70RawTCDajp9gI',
  'mountain-park': 'ChIJDw49J_ENu70Ri6V80MwyJYY',
  'yeti-ice-bar': 'ChIJUceKgr8Mu70RNFYzr4fDeh4',
  'letras-calafate': 'ChIJC-VMldQNu70RVS0s7-XCvvs',
  'casa-verde': 'ChIJ_VYFTbkNu70RYfLpaahof4k',
  'nativo-experience': 'ChIJVUwQ5ix1u70R3QyQMrAMwJY',
  napoles: 'ChIJG5XpAEcNu70RMBiIga1PKvc',
  'la-lechuza': 'ChIJ2_oWoL8Mu70R34Jij3h9nJs',
  'don-pancho': 'ChIJiaL62sMMu70RDTKLRc1U5iE',
  'wolly-burgers': 'ChIJX8kf0r0Mu70RdeEdXbEnz98',
  'reich-burgers': 'ChIJR4_SLQANu70RkWJ6HoQK1vY',
  'rotiseria-bokado': 'ChIJcRiCipUMu70RwGBFYoQBe6w',
  'casimiro-bigua': 'ChIJaRNi1r0Mu70RKdnABhtBjag',
  'la-candelaria': 'ChIJ07FeZgANu70RNc6TdEdLpKA',
  'el-quincho-asador': 'ChIJnxbRiZAMu70R4Gp-G6TYpp8',
  'estilo-campo': 'ChIJSeJvdk0Nu70RP-SR7atBAXI',
  'los-baguales': 'ChIJH3VAUAANu70R0CmlBaov_aQ',
  'lavanderia-patagonia': 'ChIJQZSB3I8Nu70RR6WkNFiI7Oc',
  'laundry-club': 'ChIJiYPfHh8Nu70R9MkjxR4u-rU',
  'lava-andina': 'ChIJc-G1gb4Mu70RKk_SjUDw64M',
  'lavanderia-mancha': 'ChIJ0yUwHr8Mu70R92m6IVqdW8g',
  'lavanderia-delsur': 'ChIJEStXQBINu70RjiUhJpHGgZg',
  'lavanderia-burbujas': 'ChIJbycPkm8Nu70RB-I2Ib-zRQc',
  'taxi-remis-alem': 'ChIJZVnSoS8Nu70RxB0hM9FAlr8',
  'parque-manuel-belgrano': 'ChIJ3x4UT5UMu70RtkLW_BygIl4',
  'centro-cultural': 'ChIJu66dzL8Mu70RfTSB5KX3dPg',
  'mural-mosaico': 'ChIJ4WKDlCcNu70RqDXF8Ogqy2U',
  'intendencia-parque': 'ChIJ9QV5c78Mu70RMD6pPwdLiB4',
  enclave: 'ChIJSYTKSgBzu70RsiDg-67h3cQ',
};

const languages: Array<{ code: LangCode; flag: string; name: string }> = [
  { code: 'es', flag: '🇦🇷', name: 'Español' },
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'pt', flag: '🇧🇷', name: 'Português' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'ar', flag: '🇸🇦', name: 'العربية' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
];

const copy: Record<LangCode, Record<string, string>> = {
  es: {
    brand_sub: 'Tu guía en El Calafate',
    choose_language: 'Elegí tu idioma',
    choose_language_sub: 'Podés cambiarlo cuando quieras.',
    home: 'Inicio',
    explore: 'Explorar',
    map: 'Mapa',
    benefits: 'Beneficios',
    profile: 'Perfil',
    map_title: 'Explorá El Calafate',
    map_sub: 'Lugares reales, beneficios y servicios en un solo mapa.',
    search: 'Buscar lugares, comida, café, taxi...',
    all: 'Todos',
    see_place: 'Ver lugar',
    map_benefit: 'Beneficio demo disponible',
    demo: 'DEMO · NO VIGENTE',
    demo_notice: 'Los beneficios son ejemplos comerciales para presentar la propuesta a cada negocio. No están vigentes hasta que el comercio los confirme.',
    categories: 'Categorías',
    places: 'Lugares',
    no_results: 'No encontramos lugares con ese filtro.',
    route: 'Cómo llegar',
    whatsapp: 'WhatsApp',
    reserve: 'Consultar',
    save: 'Guardar',
    saved: 'Guardado',
    address: 'Dirección',
    phone: 'Teléfono público',
    hours: 'Horario',
    menu: 'Menú digital',
    services: 'Servicios',
    add: 'Agregar',
    ask: 'Consultar',
    public_data: 'Datos públicos del establecimiento',
    benefit_wine: '1 copa de vino de cortesía',
    benefit_starter: 'Entrada de cortesía',
    benefit_dessert: 'Postre de cortesía',
    benefit_coffee: 'Café de cortesía',
    benefit_gift: 'Regalo de bienvenida',
    benefit_selected: 'en una selección',
    benefit_off: 'OFF',
    benefit_detail: 'Ejemplo de beneficio exclusivo para usuarios de Perla Andina.',
    coupons_title: 'Beneficios y cupones',
    coupons_sub: 'Descuentos, regalos y experiencias para descubrir en el mapa.',
    consult: 'Consultar',
    my_account: 'Mi experiencia',
    visitor: 'Visitante',
    favorites: 'Favoritos',
    selected: 'Selección',
    allies: 'Lugares demo',
    contact: 'Hablar con Perla Andina',
    version: 'Versión',
    cart: 'Mi selección',
    empty_cart: 'Todavía no agregaste ningún producto o servicio.',
    send_whatsapp: 'Enviar consulta por WhatsApp',
    locate: 'Mi ubicación',
    map_error: 'El mapa necesita conexión a internet.',
    added: 'Agregado a tu selección',
    favorite_added: 'Guardado en favoritos',
    favorite_removed: 'Eliminado de favoritos',
    language: 'Idioma',
    type_quick: 'Comida rápida',
    type_grill: 'Parrilla',
    type_pasta: 'Pastas',
    type_icecream: 'Heladería',
    type_pizza: 'Pizzería',
    type_bakery: 'Panadería',
    type_coffee: 'Cafetería',
    type_taxi: 'Taxi',
    type_disco: 'Cocina al disco',
    type_brewery: 'Cervecería',
    type_souvenir: 'Souvenirs',
    type_pharmacy: 'Farmacia',
    type_hotel: 'Hotel',
    type_agency: 'Agencia de turismo',
    type_attraction: 'Puntos turísticos',
    type_bar: 'Bar',
    type_buffet: 'Tenedor libre',
    type_laundry: 'Lavandería',
  },
  en: {
    brand_sub: 'Your guide in El Calafate',
    choose_language: 'Choose your language',
    choose_language_sub: 'You can change it anytime.',
    home: 'Home',
    explore: 'Explore',
    map: 'Map',
    benefits: 'Benefits',
    profile: 'Profile',
    map_title: 'Explore El Calafate',
    map_sub: 'Real places, benefits and services on one map.',
    search: 'Search food, coffee, taxi, places...',
    all: 'All',
    see_place: 'View place',
    map_benefit: 'Demo benefit available',
    demo: 'DEMO · NOT ACTIVE',
    demo_notice: 'Benefits are commercial examples and are not active until each business confirms them.',
    categories: 'Categories',
    places: 'Places',
    no_results: 'No places found with this filter.',
    route: 'Directions',
    whatsapp: 'WhatsApp',
    reserve: 'Ask',
    save: 'Save',
    saved: 'Saved',
    address: 'Address',
    phone: 'Public phone',
    hours: 'Hours',
    menu: 'Digital menu',
    services: 'Services',
    add: 'Add',
    ask: 'Ask',
    public_data: 'Public business information',
    benefit_wine: 'Complimentary glass of wine',
    benefit_starter: 'Complimentary starter',
    benefit_dessert: 'Complimentary dessert',
    benefit_coffee: 'Complimentary coffee',
    benefit_gift: 'Welcome gift',
    benefit_selected: 'on selected items',
    benefit_off: 'OFF',
    benefit_detail: 'Example exclusive benefit for Perla Andina users.',
    coupons_title: 'Benefits & coupons',
    coupons_sub: 'Discounts, gifts and experiences to discover on the map.',
    consult: 'Ask',
    my_account: 'My experience',
    visitor: 'Visitor',
    favorites: 'Favorites',
    selected: 'Selected',
    allies: 'Demo places',
    contact: 'Talk to Perla Andina',
    version: 'Version',
    cart: 'My selection',
    empty_cart: 'You have not added any product or service yet.',
    send_whatsapp: 'Send inquiry on WhatsApp',
    locate: 'My location',
    map_error: 'The map needs an internet connection.',
    added: 'Added to your selection',
    favorite_added: 'Saved to favorites',
    favorite_removed: 'Removed from favorites',
    language: 'Language',
    type_quick: 'Fast food',
    type_grill: 'Grill',
    type_pasta: 'Pasta',
    type_icecream: 'Ice cream',
    type_pizza: 'Pizza',
    type_bakery: 'Bakery',
    type_coffee: 'Coffee',
    type_taxi: 'Taxi',
    type_disco: 'Disc-cooked cuisine',
    type_brewery: 'Brewery',
    type_souvenir: 'Souvenirs',
    type_pharmacy: 'Pharmacy',
    type_hotel: 'Hotel',
    type_agency: 'Travel agency',
    type_attraction: 'Tourist attractions',
    type_bar: 'Bar',
    type_buffet: 'All-you-can-eat',
    type_laundry: 'Laundry',
  },
  pt: {
    brand_sub: 'Seu guia em El Calafate',
    choose_language: 'Escolha seu idioma',
    choose_language_sub: 'Você pode trocar quando quiser.',
    home: 'Início',
    explore: 'Explorar',
    map: 'Mapa',
    benefits: 'Benefícios',
    profile: 'Perfil',
    map_title: 'Explore El Calafate',
    map_sub: 'Lugares reais, benefícios e serviços em um só mapa.',
    search: 'Buscar lugares, comida, café, táxi...',
    all: 'Todos',
    see_place: 'Ver local',
    map_benefit: 'Benefício demo disponível',
    demo: 'DEMO · NÃO VIGENTE',
    demo_notice: 'Os benefícios são exemplos comerciais e só passam a valer após confirmação de cada negócio.',
    categories: 'Categorias',
    places: 'Lugares',
    no_results: 'Nenhum lugar encontrado com esse filtro.',
    route: 'Como chegar',
    whatsapp: 'WhatsApp',
    reserve: 'Consultar',
    save: 'Salvar',
    saved: 'Salvo',
    address: 'Endereço',
    phone: 'Telefone público',
    hours: 'Horário',
    menu: 'Menu digital',
    services: 'Serviços',
    add: 'Adicionar',
    ask: 'Consultar',
    public_data: 'Dados públicos do estabelecimento',
    benefit_wine: '1 taça de vinho de cortesia',
    benefit_starter: 'Entrada de cortesia',
    benefit_dessert: 'Sobremesa de cortesia',
    benefit_coffee: 'Café de cortesia',
    benefit_gift: 'Presente de boas-vindas',
    benefit_selected: 'em itens selecionados',
    benefit_off: 'OFF',
    benefit_detail: 'Exemplo de benefício exclusivo para usuários Perla Andina.',
    coupons_title: 'Benefícios e cupons',
    coupons_sub: 'Descontos, presentes e experiências para descobrir no mapa.',
    consult: 'Consultar',
    my_account: 'Minha experiência',
    visitor: 'Visitante',
    favorites: 'Favoritos',
    selected: 'Seleção',
    allies: 'Locais demo',
    contact: 'Falar com a Perla Andina',
    version: 'Versão',
    cart: 'Minha seleção',
    empty_cart: 'Você ainda não adicionou nenhum produto ou serviço.',
    send_whatsapp: 'Enviar consulta por WhatsApp',
    locate: 'Minha localização',
    map_error: 'O mapa precisa de conexão com a internet.',
    added: 'Adicionado à sua seleção',
    favorite_added: 'Salvo nos favoritos',
    favorite_removed: 'Removido dos favoritos',
    language: 'Idioma',
    type_quick: 'Comida rápida',
    type_grill: 'Parrilla',
    type_pasta: 'Massas',
    type_icecream: 'Sorveteria',
    type_pizza: 'Pizzaria',
    type_bakery: 'Padaria',
    type_coffee: 'Cafeteria',
    type_taxi: 'Táxi',
    type_disco: 'Cozinha no disco',
    type_brewery: 'Cervejaria',
    type_souvenir: 'Souvenires',
    type_pharmacy: 'Farmácia',
    type_hotel: 'Hotel',
    type_agency: 'Agência de turismo',
    type_attraction: 'Pontos turísticos',
    type_bar: 'Bar',
    type_buffet: 'Tenedor livre',
    type_laundry: 'Lavanderia',
  },
  fr: {
    brand_sub: 'Votre guide à El Calafate',
    choose_language: 'Choisissez votre langue',
    choose_language_sub: 'Vous pouvez la changer à tout moment.',
    home: 'Accueil',
    explore: 'Explorer',
    map: 'Carte',
    benefits: 'Avantages',
    profile: 'Profil',
    map_title: 'Explorez El Calafate',
    map_sub: 'Lieux réels, avantages et services sur une seule carte.',
    search: 'Rechercher restaurant, café, taxi...',
    all: 'Tous',
    see_place: 'Voir le lieu',
    map_benefit: 'Avantage démo disponible',
    demo: 'DÉMO · NON ACTIF',
    demo_notice: 'Ces avantages sont des exemples commerciaux et ne sont pas actifs sans confirmation du commerce.',
    categories: 'Catégories',
    places: 'Lieux',
    no_results: 'Aucun lieu avec ce filtre.',
    route: 'Itinéraire',
    whatsapp: 'WhatsApp',
    reserve: 'Consulter',
    save: 'Enregistrer',
    saved: 'Enregistré',
    address: 'Adresse',
    phone: 'Téléphone public',
    hours: 'Horaires',
    menu: 'Menu numérique',
    services: 'Services',
    add: 'Ajouter',
    ask: 'Consulter',
    public_data: 'Informations publiques',
    benefit_wine: 'Verre de vin offert',
    benefit_starter: 'Entrée offerte',
    benefit_dessert: 'Dessert offert',
    benefit_coffee: 'Café offert',
    benefit_gift: 'Cadeau de bienvenue',
    benefit_selected: 'sur une sélection',
    benefit_off: 'OFF',
    benefit_detail: 'Exemple d’avantage exclusif pour les utilisateurs Perla Andina.',
    coupons_title: 'Avantages et coupons',
    coupons_sub: 'Réductions, cadeaux et expériences à découvrir.',
    consult: 'Consulter',
    my_account: 'Mon expérience',
    visitor: 'Visiteur',
    favorites: 'Favoris',
    selected: 'Sélection',
    allies: 'Lieux démo',
    contact: 'Contacter Perla Andina',
    version: 'Version',
    cart: 'Ma sélection',
    empty_cart: 'Aucun produit ou service ajouté.',
    send_whatsapp: 'Envoyer sur WhatsApp',
    locate: 'Ma position',
    map_error: 'La carte nécessite une connexion internet.',
    added: 'Ajouté à votre sélection',
    favorite_added: 'Ajouté aux favoris',
    favorite_removed: 'Retiré des favoris',
    language: 'Langue',
    type_quick: 'Restauration rapide',
    type_grill: 'Grillades',
    type_pasta: 'Pâtes',
    type_icecream: 'Glacier',
    type_pizza: 'Pizzeria',
    type_bakery: 'Boulangerie',
    type_coffee: 'Café',
    type_taxi: 'Taxi',
    type_disco: 'Cuisine au disque',
    type_brewery: 'Brasserie',
    type_souvenir: 'Souvenirs',
    type_pharmacy: 'Pharmacie',
    type_hotel: 'Hôtel',
    type_agency: 'Agence de voyages',
    type_attraction: 'Sites touristiques',
    type_bar: 'Bar',
    type_buffet: 'Buffet à volonté',
    type_laundry: 'Blanchisserie',
  },
  de: {
    brand_sub: 'Ihr Guide in El Calafate',
    choose_language: 'Sprache wählen',
    choose_language_sub: 'Sie können sie jederzeit ändern.',
    home: 'Start',
    explore: 'Entdecken',
    map: 'Karte',
    benefits: 'Vorteile',
    profile: 'Profil',
    map_title: 'El Calafate entdecken',
    map_sub: 'Echte Orte, Vorteile und Services auf einer Karte.',
    search: 'Orte, Essen, Kaffee, Taxi suchen...',
    all: 'Alle',
    see_place: 'Ort ansehen',
    map_benefit: 'Demo-Vorteil verfügbar',
    demo: 'DEMO · NICHT AKTIV',
    demo_notice: 'Die Vorteile sind Beispiele und erst nach Bestätigung des Betriebs gültig.',
    categories: 'Kategorien',
    places: 'Orte',
    no_results: 'Keine Orte mit diesem Filter.',
    route: 'Route',
    whatsapp: 'WhatsApp',
    reserve: 'Anfragen',
    save: 'Speichern',
    saved: 'Gespeichert',
    address: 'Adresse',
    phone: 'Öffentliche Telefonnummer',
    hours: 'Öffnungszeiten',
    menu: 'Digitales Menü',
    services: 'Services',
    add: 'Hinzufügen',
    ask: 'Anfragen',
    public_data: 'Öffentliche Geschäftsdaten',
    benefit_wine: 'Ein Glas Wein gratis',
    benefit_starter: 'Vorspeise gratis',
    benefit_dessert: 'Dessert gratis',
    benefit_coffee: 'Kaffee gratis',
    benefit_gift: 'Willkommensgeschenk',
    benefit_selected: 'auf ausgewählte Artikel',
    benefit_off: 'OFF',
    benefit_detail: 'Beispielvorteil für Perla-Andina-Nutzer.',
    coupons_title: 'Vorteile & Coupons',
    coupons_sub: 'Rabatte, Geschenke und Erlebnisse auf der Karte.',
    consult: 'Anfragen',
    my_account: 'Meine Erfahrung',
    visitor: 'Besucher',
    favorites: 'Favoriten',
    selected: 'Auswahl',
    allies: 'Demo-Orte',
    contact: 'Perla Andina kontaktieren',
    version: 'Version',
    cart: 'Meine Auswahl',
    empty_cart: 'Noch nichts hinzugefügt.',
    send_whatsapp: 'Über WhatsApp senden',
    locate: 'Mein Standort',
    map_error: 'Die Karte benötigt Internet.',
    added: 'Zur Auswahl hinzugefügt',
    favorite_added: 'Als Favorit gespeichert',
    favorite_removed: 'Aus Favoriten entfernt',
    language: 'Sprache',
    type_quick: 'Fast Food',
    type_grill: 'Grill',
    type_pasta: 'Pasta',
    type_icecream: 'Eisdiele',
    type_pizza: 'Pizzeria',
    type_bakery: 'Bäckerei',
    type_coffee: 'Café',
    type_taxi: 'Taxi',
    type_disco: 'Disco-Küche',
    type_brewery: 'Brauerei',
    type_souvenir: 'Souvenirs',
    type_pharmacy: 'Apotheke',
    type_hotel: 'Hotel',
    type_agency: 'Reisebüro',
    type_attraction: 'Sehenswürdigkeiten',
    type_bar: 'Bar',
    type_buffet: 'All-you-can-eat',
    type_laundry: 'Wäscherei',
  },
  it: {
    brand_sub: 'La tua guida a El Calafate',
    choose_language: 'Scegli la lingua',
    choose_language_sub: 'Puoi cambiarla in qualsiasi momento.',
    home: 'Home',
    explore: 'Esplora',
    map: 'Mappa',
    benefits: 'Vantaggi',
    profile: 'Profilo',
    map_title: 'Esplora El Calafate',
    map_sub: 'Luoghi reali, vantaggi e servizi in un’unica mappa.',
    search: 'Cerca luoghi, cibo, caffè, taxi...',
    all: 'Tutti',
    see_place: 'Vedi luogo',
    map_benefit: 'Vantaggio demo disponibile',
    demo: 'DEMO · NON ATTIVO',
    demo_notice: 'I vantaggi sono esempi commerciali e diventano validi solo dopo conferma del locale.',
    categories: 'Categorie',
    places: 'Luoghi',
    no_results: 'Nessun luogo trovato.',
    route: 'Indicazioni',
    whatsapp: 'WhatsApp',
    reserve: 'Consulta',
    save: 'Salva',
    saved: 'Salvato',
    address: 'Indirizzo',
    phone: 'Telefono pubblico',
    hours: 'Orari',
    menu: 'Menù digitale',
    services: 'Servizi',
    add: 'Aggiungi',
    ask: 'Consulta',
    public_data: 'Dati pubblici',
    benefit_wine: 'Calice di vino offerto',
    benefit_starter: 'Antipasto offerto',
    benefit_dessert: 'Dessert offerto',
    benefit_coffee: 'Caffè offerto',
    benefit_gift: 'Omaggio di benvenuto',
    benefit_selected: 'su una selezione',
    benefit_off: 'OFF',
    benefit_detail: 'Esempio di vantaggio per gli utenti Perla Andina.',
    coupons_title: 'Vantaggi e coupon',
    coupons_sub: 'Sconti, omaggi ed esperienze da scoprire.',
    consult: 'Consulta',
    my_account: 'La mia esperienza',
    visitor: 'Visitatore',
    favorites: 'Preferiti',
    selected: 'Selezione',
    allies: 'Luoghi demo',
    contact: 'Contatta Perla Andina',
    version: 'Versione',
    cart: 'La mia selezione',
    empty_cart: 'Non hai ancora aggiunto prodotti o servizi.',
    send_whatsapp: 'Invia su WhatsApp',
    locate: 'La mia posizione',
    map_error: 'La mappa richiede internet.',
    added: 'Aggiunto alla selezione',
    favorite_added: 'Salvato nei preferiti',
    favorite_removed: 'Rimosso dai preferiti',
    language: 'Lingua',
    type_quick: 'Fast food',
    type_grill: 'Griglia',
    type_pasta: 'Pasta',
    type_icecream: 'Gelateria',
    type_pizza: 'Pizzeria',
    type_bakery: 'Panetteria',
    type_coffee: 'Caffetteria',
    type_taxi: 'Taxi',
    type_disco: 'Cucina al disco',
    type_brewery: 'Birreria',
    type_souvenir: 'Souvenir',
    type_pharmacy: 'Farmacia',
    type_hotel: 'Hotel',
    type_agency: 'Agenzia di viaggi',
    type_attraction: 'Attrazioni turistiche',
    type_bar: 'Bar',
    type_buffet: 'Buffet libero',
    type_laundry: 'Lavanderia',
  },
  zh: {
    brand_sub: '埃尔卡拉法特旅行指南',
    choose_language: '选择语言',
    choose_language_sub: '您可以随时更改。',
    home: '首页',
    explore: '探索',
    map: '地图',
    benefits: '优惠',
    profile: '我的',
    map_title: '探索埃尔卡拉法特',
    map_sub: '真实地点、优惠和服务集中在一张地图上。',
    search: '搜索餐厅、咖啡、出租车...',
    all: '全部',
    see_place: '查看地点',
    map_benefit: '有演示优惠',
    demo: '演示 · 尚未生效',
    demo_notice: '这些优惠仅为商业示例，商家确认后才会生效。',
    categories: '分类',
    places: '地点',
    no_results: '没有符合条件的地点。',
    route: '路线',
    whatsapp: 'WhatsApp',
    reserve: '咨询',
    save: '收藏',
    saved: '已收藏',
    address: '地址',
    phone: '公开电话',
    hours: '营业时间',
    menu: '电子菜单',
    services: '服务',
    add: '添加',
    ask: '咨询',
    public_data: '公开商家信息',
    benefit_wine: '赠送一杯葡萄酒',
    benefit_starter: '赠送前菜',
    benefit_dessert: '赠送甜点',
    benefit_coffee: '赠送咖啡',
    benefit_gift: '欢迎礼物',
    benefit_selected: '指定项目',
    benefit_off: '优惠',
    benefit_detail: 'Perla Andina 用户专属优惠示例。',
    coupons_title: '优惠与礼券',
    coupons_sub: '在地图上发现折扣、礼物与体验。',
    consult: '咨询',
    my_account: '我的体验',
    visitor: '游客',
    favorites: '收藏',
    selected: '已选',
    allies: '演示地点',
    contact: '联系 Perla Andina',
    version: '版本',
    cart: '我的选择',
    empty_cart: '尚未添加任何产品或服务。',
    send_whatsapp: '通过 WhatsApp 咨询',
    locate: '我的位置',
    map_error: '地图需要联网。',
    added: '已添加',
    favorite_added: '已收藏',
    favorite_removed: '已取消收藏',
    language: '语言',
    type_quick: '快餐',
    type_grill: '烤肉',
    type_pasta: '意面',
    type_icecream: '冰淇淋',
    type_pizza: '披萨',
    type_bakery: '面包店',
    type_coffee: '咖啡馆',
    type_taxi: '出租车',
    type_disco: '铁盘料理',
    type_brewery: '精酿啤酒',
    type_souvenir: '纪念品',
    type_pharmacy: '药店',
    type_hotel: '酒店',
    type_agency: '旅行社',
    type_attraction: '旅游景点',
    type_bar: '酒吧',
    type_buffet: '自助餐',
    type_laundry: '洗衣店',
  },
  ar: {
    brand_sub: 'دليلك في إل كالافاتي',
    choose_language: 'اختر اللغة',
    choose_language_sub: 'يمكنك تغييرها في أي وقت.',
    home: 'الرئيسية',
    explore: 'استكشف',
    map: 'الخريطة',
    benefits: 'المزايا',
    profile: 'الملف',
    map_title: 'استكشف إل كالافاتي',
    map_sub: 'أماكن حقيقية ومزايا وخدمات على خريطة واحدة.',
    search: 'ابحث عن مطعم أو قهوة أو تاكسي...',
    all: 'الكل',
    see_place: 'عرض المكان',
    map_benefit: 'ميزة تجريبية متاحة',
    demo: 'تجريبي · غير مفعل',
    demo_notice: 'المزايا أمثلة تجارية ولا تصبح سارية إلا بعد تأكيد المنشأة.',
    categories: 'الفئات',
    places: 'الأماكن',
    no_results: 'لا توجد نتائج.',
    route: 'الاتجاهات',
    whatsapp: 'واتساب',
    reserve: 'استفسار',
    save: 'حفظ',
    saved: 'محفوظ',
    address: 'العنوان',
    phone: 'الهاتف العام',
    hours: 'ساعات العمل',
    menu: 'القائمة الرقمية',
    services: 'الخدمات',
    add: 'إضافة',
    ask: 'استفسار',
    public_data: 'معلومات عامة',
    benefit_wine: 'كأس نبيذ مجاني',
    benefit_starter: 'مقبلات مجانية',
    benefit_dessert: 'حلوى مجانية',
    benefit_coffee: 'قهوة مجانية',
    benefit_gift: 'هدية ترحيبية',
    benefit_selected: 'على عناصر مختارة',
    benefit_off: 'خصم',
    benefit_detail: 'مثال على ميزة حصرية لمستخدمي Perla Andina.',
    coupons_title: 'المزايا والقسائم',
    coupons_sub: 'خصومات وهدايا وتجارب لاكتشافها.',
    consult: 'استفسار',
    my_account: 'تجربتي',
    visitor: 'زائر',
    favorites: 'المفضلة',
    selected: 'المختار',
    allies: 'أماكن تجريبية',
    contact: 'تواصل مع Perla Andina',
    version: 'الإصدار',
    cart: 'اختياراتي',
    empty_cart: 'لم تضف أي منتج أو خدمة بعد.',
    send_whatsapp: 'إرسال عبر واتساب',
    locate: 'موقعي',
    map_error: 'الخريطة تحتاج إلى الإنترنت.',
    added: 'تمت الإضافة',
    favorite_added: 'تم الحفظ في المفضلة',
    favorite_removed: 'تمت الإزالة من المفضلة',
    language: 'اللغة',
    type_quick: 'وجبات سريعة',
    type_grill: 'مشاوي',
    type_pasta: 'باستا',
    type_icecream: 'آيس كريم',
    type_pizza: 'بيتزا',
    type_bakery: 'مخبز',
    type_coffee: 'مقهى',
    type_taxi: 'تاكسي',
    type_disco: 'مطبخ القرص',
    type_brewery: 'مصنع جعة',
    type_souvenir: 'هدايا تذكارية',
    type_pharmacy: 'صيدلية',
    type_hotel: 'فندق',
    type_agency: 'وكالة سفر',
    type_attraction: 'معالم سياحية',
    type_bar: 'بار',
    type_buffet: 'بوفيه مفتوح',
    type_laundry: 'مغسلة',
  },
  ru: {
    brand_sub: 'Ваш гид по Эль-Калафате',
    choose_language: 'Выберите язык',
    choose_language_sub: 'Язык можно изменить в любое время.',
    home: 'Главная',
    explore: 'Места',
    map: 'Карта',
    benefits: 'Бонусы',
    profile: 'Профиль',
    map_title: 'Исследуйте Эль-Калафате',
    map_sub: 'Реальные места, бонусы и услуги на одной карте.',
    search: 'Поиск мест, еды, кофе, такси...',
    all: 'Все',
    see_place: 'Открыть',
    map_benefit: 'Есть демо-бонус',
    demo: 'ДЕМО · НЕ ДЕЙСТВУЕТ',
    demo_notice: 'Бонусы являются примерами и действуют только после подтверждения заведением.',
    categories: 'Категории',
    places: 'Места',
    no_results: 'Ничего не найдено.',
    route: 'Маршрут',
    whatsapp: 'WhatsApp',
    reserve: 'Узнать',
    save: 'Сохранить',
    saved: 'Сохранено',
    address: 'Адрес',
    phone: 'Телефон',
    hours: 'Часы работы',
    menu: 'Цифровое меню',
    services: 'Услуги',
    add: 'Добавить',
    ask: 'Узнать',
    public_data: 'Публичная информация',
    benefit_wine: 'Бокал вина в подарок',
    benefit_starter: 'Закуска в подарок',
    benefit_dessert: 'Десерт в подарок',
    benefit_coffee: 'Кофе в подарок',
    benefit_gift: 'Приветственный подарок',
    benefit_selected: 'на выбранные позиции',
    benefit_off: 'СКИДКА',
    benefit_detail: 'Пример бонуса для пользователей Perla Andina.',
    coupons_title: 'Бонусы и купоны',
    coupons_sub: 'Скидки, подарки и впечатления на карте.',
    consult: 'Узнать',
    my_account: 'Мой опыт',
    visitor: 'Гость',
    favorites: 'Избранное',
    selected: 'Выбрано',
    allies: 'Демо-места',
    contact: 'Связаться с Perla Andina',
    version: 'Версия',
    cart: 'Мой выбор',
    empty_cart: 'Пока ничего не добавлено.',
    send_whatsapp: 'Отправить в WhatsApp',
    locate: 'Моё местоположение',
    map_error: 'Для карты нужен интернет.',
    added: 'Добавлено',
    favorite_added: 'Добавлено в избранное',
    favorite_removed: 'Удалено из избранного',
    language: 'Язык',
    type_quick: 'Фастфуд',
    type_grill: 'Гриль',
    type_pasta: 'Паста',
    type_icecream: 'Мороженое',
    type_pizza: 'Пицца',
    type_bakery: 'Пекарня',
    type_coffee: 'Кофейня',
    type_taxi: 'Такси',
    type_disco: 'Кухня на диске',
    type_brewery: 'Пивоварня',
    type_souvenir: 'Сувениры',
    type_pharmacy: 'Аптека',
    type_hotel: 'Отель',
    type_agency: 'Туристическое агентство',
    type_attraction: 'Достопримечательности',
    type_bar: 'Бар',
    type_buffet: 'Шведский стол',
    type_laundry: 'Прачечная',
  },
  hi: {
    brand_sub: 'एल कालाफाते में आपकी गाइड',
    choose_language: 'अपनी भाषा चुनें',
    choose_language_sub: 'आप इसे कभी भी बदल सकते हैं।',
    home: 'होम',
    explore: 'खोजें',
    map: 'मानचित्र',
    benefits: 'लाभ',
    profile: 'प्रोफ़ाइल',
    map_title: 'एल कालाफाते खोजें',
    map_sub: 'एक ही मानचित्र पर वास्तविक स्थान, लाभ और सेवाएँ।',
    search: 'स्थान, खाना, कॉफी, टैक्सी खोजें...',
    all: 'सभी',
    see_place: 'स्थान देखें',
    map_benefit: 'डेमो लाभ उपलब्ध',
    demo: 'डेमो · सक्रिय नहीं',
    demo_notice: 'ये लाभ व्यावसायिक उदाहरण हैं और व्यवसाय की पुष्टि के बाद ही सक्रिय होंगे।',
    categories: 'श्रेणियाँ',
    places: 'स्थान',
    no_results: 'कोई स्थान नहीं मिला।',
    route: 'रास्ता',
    whatsapp: 'WhatsApp',
    reserve: 'पूछें',
    save: 'सेव करें',
    saved: 'सेव किया',
    address: 'पता',
    phone: 'सार्वजनिक फोन',
    hours: 'समय',
    menu: 'डिजिटल मेनू',
    services: 'सेवाएँ',
    add: 'जोड़ें',
    ask: 'पूछें',
    public_data: 'सार्वजनिक व्यवसाय जानकारी',
    benefit_wine: 'एक ग्लास वाइन कॉम्प्लिमेंटरी',
    benefit_starter: 'स्टार्टर कॉम्प्लिमेंटरी',
    benefit_dessert: 'डेज़र्ट कॉम्प्लिमेंटरी',
    benefit_coffee: 'कॉफी कॉम्प्लिमेंटरी',
    benefit_gift: 'स्वागत उपहार',
    benefit_selected: 'चुनी वस्तुओं पर',
    benefit_off: 'OFF',
    benefit_detail: 'Perla Andina उपयोगकर्ताओं के लिए उदाहरण लाभ।',
    coupons_title: 'लाभ और कूपन',
    coupons_sub: 'मानचित्र पर छूट, उपहार और अनुभव खोजें।',
    consult: 'पूछें',
    my_account: 'मेरा अनुभव',
    visitor: 'यात्री',
    favorites: 'पसंदीदा',
    selected: 'चयन',
    allies: 'डेमो स्थान',
    contact: 'Perla Andina से बात करें',
    version: 'संस्करण',
    cart: 'मेरा चयन',
    empty_cart: 'अभी तक कुछ नहीं जोड़ा गया।',
    send_whatsapp: 'WhatsApp पर भेजें',
    locate: 'मेरा स्थान',
    map_error: 'मानचित्र के लिए इंटरनेट चाहिए।',
    added: 'चयन में जोड़ा गया',
    favorite_added: 'पसंदीदा में सेव किया',
    favorite_removed: 'पसंदीदा से हटाया',
    language: 'भाषा',
    type_quick: 'फास्ट फूड',
    type_grill: 'ग्रिल',
    type_pasta: 'पास्ता',
    type_icecream: 'आइसक्रीम',
    type_pizza: 'पिज़्ज़ा',
    type_bakery: 'बेकरी',
    type_coffee: 'कैफ़े',
    type_taxi: 'टैक्सी',
    type_disco: 'डिस्क कुकिंग',
    type_brewery: 'ब्रुअरी',
    type_souvenir: 'स्मृति चिन्ह',
    type_pharmacy: 'फार्मेसी',
    type_hotel: 'होटल',
    type_agency: 'यात्रा एजेंसी',
    type_attraction: 'पर्यटन स्थल',
    type_bar: 'बार',
    type_buffet: 'बुफे',
    type_laundry: 'लॉन्ड्री',
  },
};

const places: Place[] = [
  {
    id: 'perla-andina',
    name: 'Perla Andina Travel',
    typeKey: 'type_agency',
    rating: 5.0,
    reviews: 52,
    address: 'Av. del Libertador 1150, El Calafate',
    phone: '+54 9 2966 67-8951',
    whatsapp: DEFAULT_WHATSAPP,
    hours: 'Lun a Sáb · 09:00–20:30 · Dom 12:00–20:00',
    accent: '#079ac3',
    initials: 'PA',
    icon: '🏔️',
    lat: -50.33821,
    lng: -72.26558,
    description: 'Agencia de turismo con sede en El Calafate, especializada en excursiones, traslados y atención personalizada para viajeros.',
    items: ['City Tour Perlas del Sur', 'Excursiones en El Calafate', 'Traslados', 'Pasarelas Perito Moreno', 'Todo Glaciares'],
    food: false,
    benefitKind: 'gift',
  },
  {
    id: 'dona-mecha',
    name: 'Doña Mecha',
    typeKey: 'type_quick',
    rating: 4.0,
    reviews: 919,
    address: 'Cmte. Tomás Espora 22, El Calafate',
    phone: '+54 2902 49-6288',
    whatsapp: '5492966488204',
    hours: '10:00–15:00 / 19:00–00:00 · fines de semana con horario extendido',
    accent: '#f09a2a',
    initials: 'DM',
    icon: '🥪',
    lat: -50.3377,
    lng: -72.2635,
    description: 'Restaurante familiar de comida rápida argentina, con opciones abundantes para compartir.',
    items: ['Pizza muzzarella', 'Milanesa napolitana', 'Sándwich de milanesa', 'Empanadas'],
    food: true,
    benefitKind: 'starter',
  },
  {
    id: 'don-pichon',
    name: 'Parrilla Don Pichón',
    typeKey: 'type_grill',
    rating: 4.5,
    reviews: 3638,
    address: 'Puerto Deseado 242, El Calafate',
    phone: '+54 2902 49-2577',
    whatsapp: '5492902402858',
    hours: 'Todos los días · 19:00–00:00',
    accent: '#9a633b',
    initials: 'DP',
    icon: '🥩',
    lat: -50.33304,
    lng: -72.25509,
    description: 'Parrilla patagónica especializada en carnes, asado y cordero.',
    items: ['Cordero patagónico', 'Parrillada', 'Bife de chorizo'],
    food: true,
    benefitKind: 'wine',
  },
  {
    id: 'bokado',
    name: 'BOkADO Trattoria',
    typeKey: 'type_pasta',
    rating: 4.9,
    reviews: 656,
    address: 'Cmte. Tomás Espora 46, El Calafate',
    phone: '+54 9 2966 30-5938',
    whatsapp: '5492966305938',
    hours: 'Todos los días · 11:30–15:30 / 17:30–23:00',
    accent: '#ef532d',
    initials: 'BK',
    icon: '🍝',
    lat: -50.3374939,
    lng: -72.2629395,
    description: 'Trattoria de cocina italiana y pastas en el centro de El Calafate.',
    items: ['Ravioles', 'Tagliatelle cacio e pepe', 'Lasaña', 'Croquetas de cordero'],
    food: true,
    benefitKind: 'discount',
    benefitValue: '10%',
  },
  {
    id: 'acuarela',
    name: 'Heladería Acuarela',
    typeKey: 'type_icecream',
    rating: 4.3,
    reviews: 3688,
    address: 'Av. del Libertador 1197, El Calafate',
    phone: '+54 2902 49-1315',
    hours: 'Todos los días · 10:00–00:00',
    accent: '#8a5fd3',
    initials: 'AC',
    icon: '🍦',
    lat: -50.33834,
    lng: -72.26636,
    description: 'Heladería, chocolatería y casa de té sobre la avenida principal.',
    items: ['Helados', 'Chocolatería', 'Casa de té'],
    food: true,
    benefitKind: 'twoforone',
  },
  {
    id: 'el-gaita',
    name: 'El Gaita Pizza Bar',
    typeKey: 'type_pizza',
    rating: 4.8,
    reviews: 1858,
    address: 'Gdor. Moyano 1089, El Calafate',
    phone: '+54 2902 49-0500',
    hours: 'Lun, Mié a Dom · 17:00–00:00 · Martes cerrado',
    accent: '#d85835',
    initials: 'EG',
    icon: '🍕',
    lat: -50.336,
    lng: -72.2649,
    description: 'Pizzería y bar con pizza artesanal en El Calafate.',
    items: ['Mozzarella', 'Margarita', 'Napolitana', 'Pepperoni'],
    food: true,
    benefitKind: 'twoforone',
  },
  {
    id: 'panaderia-libertador',
    name: 'Panadería Libertador',
    typeKey: 'type_bakery',
    rating: 4.4,
    reviews: 231,
    address: 'Av. del Libertador 1893, El Calafate',
    phone: '+54 2902 49-6850',
    hours: 'Atención amplia · consultar horario del día',
    accent: '#cc8a3b',
    initials: 'PL',
    icon: '🥐',
    lat: null,
    lng: null,
    description: 'Panadería local con productos de desayuno, empanadas, scones y panificados.',
    items: ['Empanadas', 'Scones', 'Bizcochitos', 'Pastelitos'],
    food: true,
    benefitKind: 'coffee',
  },
  {
    id: 'coffee-roasters',
    name: 'Calafate Coffee Roasters',
    typeKey: 'type_coffee',
    rating: 4.9,
    reviews: 770,
    address: 'José Pantin 31 local 2, El Calafate',
    phone: '+54 2966 54-5454',
    whatsapp: '5492966707059',
    hours: 'Lun a Sáb · 08:00–20:00',
    accent: '#795548',
    initials: 'CR',
    icon: '☕',
    lat: null,
    lng: null,
    description: 'Café de especialidad y tostador local, con opciones de desayuno y brunch.',
    items: ['Café de especialidad', 'Desayuno', 'Brunch', 'Take away'],
    food: true,
    benefitKind: 'coffee',
  },
  {
    id: 'taxi-kehek',
    name: 'Agencia de Taxi KEHEK AIKE',
    typeKey: 'type_taxi',
    rating: 4.9,
    reviews: 151,
    address: 'Av. del Libertador 1876, El Calafate',
    phone: '+54 351 684-1765',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'TX',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Agencia de taxi de El Calafate.',
    items: ['Solicitar taxi', 'Consultar traslado', 'Consultar viaje'],
    food: false,
    benefitKind: 'discount',
    benefitValue: '10%',
  },
  {
    id: 'isabel',
    name: 'Isabel Cocina al Disco',
    typeKey: 'type_disco',
    rating: 4.6,
    reviews: 7449,
    address: 'José Pantin 64, El Calafate',
    phone: '+54 2902 48-9000',
    hours: 'Lun y Mié a Dom · 12:00–23:30 · Martes cerrado',
    accent: '#b38348',
    initials: 'IS',
    icon: '🍲',
    lat: -50.3379,
    lng: -72.2603,
    description: 'Cocina argentina en discos de arado, con platos abundantes para compartir.',
    items: ['Cordero al disco', 'Lomo al disco', 'Mariscos al disco'],
    food: true,
    benefitKind: 'dessert',
  },
  {
    id: 'la-zorra',
    name: 'La Zorra Taproom',
    typeKey: 'type_brewery',
    rating: 4.5,
    reviews: 6272,
    address: 'Av. del Libertador 832, El Calafate',
    phone: '+54 2902 48-8042',
    hours: 'Mar a Dom · desde 12:00',
    accent: '#d97822',
    initials: 'LZ',
    icon: '🍺',
    lat: -50.3382,
    lng: -72.2595,
    description: 'Taproom y cervecería artesanal sobre la avenida principal.',
    items: ['Cerveza artesanal', 'Gastronomía', 'Consultar carta'],
    food: true,
    benefitKind: 'twoforone',
  },
  {
    id: 'las-huellas',
    name: 'Las Huellas',
    typeKey: 'type_souvenir',
    rating: 4.5,
    reviews: 26,
    address: 'Av. del Libertador 1018, El Calafate',
    phone: '+54 2902 49-4467',
    hours: 'Todos los días · 10:00–21:30',
    accent: '#28a38f',
    initials: 'LH',
    icon: '🎁',
    lat: -50.33785,
    lng: -72.26341,
    description: 'Tienda de regalos y recuerdos de El Calafate.',
    items: ['Regalos', 'Recuerdos', 'Consultar productos'],
    food: false,
    benefitKind: 'discount',
    benefitValue: '15%',
  },
  {
    id: 'farmacia-central',
    name: 'Farmacia Central',
    typeKey: 'type_pharmacy',
    rating: 4.7,
    reviews: 92,
    address: 'Av. del Libertador 932, El Calafate',
    phone: '+54 2966 74-7183',
    hours: 'Todos los días · 09:00–23:00',
    accent: '#2f9f65',
    initials: 'FC',
    icon: '💊',
    lat: -50.33772,
    lng: -72.26216,
    description: 'Farmacia ubicada sobre Av. del Libertador.',
    items: ['Consultar disponibilidad', 'Productos de farmacia'],
    food: false,
    benefitKind: 'discount',
    benefitValue: '5%',
  },
  {
    id: 'posada-alamos',
    name: 'Posada Los Álamos',
    typeKey: 'type_hotel',
    rating: 4.7,
    reviews: 4363,
    address: 'Ing. Guatti 1135, El Calafate',
    phone: '+54 2902 49-1145',
    hours: 'Recepción 24 h',
    accent: '#34698a',
    initials: 'PA',
    icon: '🏨',
    lat: -50.336353,
    lng: -72.269526,
    description: 'Hotel de categoría superior ubicado a metros de la avenida principal.',
    items: ['Consultar alojamiento', 'Consultar servicios'],
    food: false,
    benefitKind: 'gift',
  },

  {
    id: 'farmacia-el-calafate',
    name: 'Farmacia El Calafate',
    typeKey: 'type_pharmacy',
    rating: 3.8,
    reviews: 37,
    address: 'Av. del Libertador 1190, El Calafate',
    phone: '+54 2902 49-1407',
    hours: 'Lun a Sáb · 08:00–22:00 · Dom 11:00–14:00 / 17:00–22:00',
    accent: '#2f9f65',
    initials: 'FE',
    icon: '💊',
    lat: null,
    lng: null,
    description: 'Farmacia sobre la avenida principal de El Calafate.',
    items: ['Consultar disponibilidad', 'Productos de farmacia'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'farmacia-franco-sur',
    name: 'Farmacias La Franco del Sur',
    typeKey: 'type_pharmacy',
    rating: 3.7,
    reviews: 63,
    address: 'Av. del Libertador 1337, El Calafate',
    phone: '+54 2902 49-1496',
    hours: 'Lun a Sáb · 09:00–21:00',
    accent: '#2f9f65',
    initials: 'FS',
    icon: '💊',
    lat: null,
    lng: null,
    description: 'Sucursal El Calafate de Farmacias La Franco del Sur.',
    items: ['Consultar disponibilidad', 'Productos de farmacia'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'farmacia-santa-lucia',
    name: 'Farmacia Santa Lucia',
    typeKey: 'type_pharmacy',
    rating: 3.5,
    reviews: 17,
    address: 'Av. Salvador Lara 1162, Local 1, El Calafate',
    phone: '+54 2902 49-4666',
    hours: 'Todos los días · 08:00–00:00',
    accent: '#2f9f65',
    initials: 'SL',
    icon: '💊',
    lat: null,
    lng: null,
    description: 'Farmacia en Av. Salvador Lara.',
    items: ['Consultar disponibilidad', 'Productos de farmacia'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'farmacia-del-rosario',
    name: 'Farmacia del Rosario',
    typeKey: 'type_pharmacy',
    rating: 4.6,
    reviews: 23,
    address: '9 de Julio 28, El Calafate',
    phone: '+54 2902 50-0700',
    hours: 'Consultar horario del día',
    accent: '#2f9f65',
    initials: 'FR',
    icon: '💊',
    lat: null,
    lng: null,
    description: 'Farmacia ubicada en 9 de Julio.',
    items: ['Consultar disponibilidad', 'Productos de farmacia'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'farmacia-libertador',
    name: 'Farmacia Libertador',
    typeKey: 'type_pharmacy',
    rating: 4.3,
    reviews: 12,
    address: 'Av. del Libertador 1536, El Calafate',
    phone: '+54 2966 78-6857',
    hours: 'Lun a Vie · 08:00–23:00 · Sáb y Dom 09:00–23:00',
    accent: '#2f9f65',
    initials: 'FL',
    icon: '💊',
    lat: null,
    lng: null,
    description: 'Farmacia sobre Av. del Libertador.',
    items: ['Consultar disponibilidad', 'Productos de farmacia'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'farmacia-don-bosco',
    name: 'Farmacia Don Bosco',
    typeKey: 'type_pharmacy',
    rating: 4.5,
    reviews: 62,
    address: 'Julio Argentino Roca 1350, El Calafate',
    phone: '+54 2902 40-4438',
    hours: 'Todos los días · 08:00–03:00',
    accent: '#2f9f65',
    initials: 'DB',
    icon: '💊',
    lat: null,
    lng: null,
    description: 'Farmacia Don Bosco en El Calafate.',
    items: ['Consultar disponibilidad', 'Productos de farmacia'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'farmacia-the-pharmacy',
    name: 'Farmacia The Pharmacy',
    typeKey: 'type_pharmacy',
    rating: 4.7,
    reviews: 6,
    address: 'Monseñor Fagnano y Av. 17 de Octubre 1414, El Calafate',
    phone: '+54 2902 48-9748',
    hours: 'Lun a Sáb · 07:00–23:00 · Dom 09:00–23:00',
    accent: '#2f9f65',
    initials: 'TP',
    icon: '💊',
    lat: null,
    lng: null,
    description: 'Farmacia en la zona de Av. 17 de Octubre.',
    items: ['Consultar disponibilidad', 'Productos de farmacia'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'remis-calafate-viajes',
    name: 'Taxi Remis Calafate Viajes Turísticos',
    typeKey: 'type_taxi',
    rating: 4.7,
    reviews: 372,
    address: 'Julio Argentino Roca 1104, El Calafate',
    phone: '+54 2902 48-4111',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'RC',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Servicio de taxi y remis en El Calafate.',
    items: ['Solicitar remis', 'Consultar traslado'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'calafate-central',
    name: 'Calafate Central',
    typeKey: 'type_taxi',
    rating: 5.0,
    reviews: 16,
    address: '9 de Julio 133, El Calafate',
    phone: '+54 2966 38-7340',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'CC',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Servicio de taxi en El Calafate.',
    items: ['Solicitar taxi', 'Consultar traslado'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'remis-lago-argentino',
    name: 'Remis Lago Argentino',
    typeKey: 'type_taxi',
    rating: 3.5,
    reviews: 102,
    address: 'Av. del Libertador y 15 de Febrero, El Calafate',
    phone: '+54 2902 49-1479',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'LA',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Parada y servicio de remis en el centro de El Calafate.',
    items: ['Solicitar remis', 'Consultar traslado'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'calafate-taxi',
    name: 'Calafate Taxi',
    typeKey: 'type_taxi',
    rating: 5.0,
    reviews: 4,
    address: 'Av. Jorge Newbery 438, El Calafate',
    phone: '+54 2966 63-4179',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'CT',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Servicio de taxi y traslado al aeropuerto.',
    items: ['Solicitar taxi', 'Consultar aeropuerto'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'remises-otilnau',
    name: 'Remises Otil-nau',
    typeKey: 'type_taxi',
    rating: 4.2,
    reviews: 106,
    address: 'Av. del Libertador 2107, El Calafate',
    phone: '+54 2966 50-1271',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'ON',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Servicio de remis en El Calafate.',
    items: ['Solicitar remis', 'Consultar traslado'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'blue-calafate',
    name: 'Blue Calafate',
    typeKey: 'type_taxi',
    rating: 5.0,
    reviews: 1,
    address: '9 de Julio, El Calafate',
    phone: '+54 9 2966 76-4900',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'BC',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Servicio de taxi en El Calafate.',
    items: ['Solicitar taxi', 'Consultar traslado'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'taxi-remises-terminal',
    name: 'Taxi/Remises La Terminal',
    typeKey: 'type_taxi',
    rating: 5.0,
    reviews: 1,
    address: 'Juan Esteban 222, El Calafate',
    phone: '+54 9 2966 34-5696',
    hours: 'Todos los días · 07:30–11:00',
    accent: '#f6c945',
    initials: 'LT',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Servicio de taxi y remis junto a la terminal.',
    items: ['Solicitar taxi', 'Solicitar remis'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'taxiremis-region',
    name: 'Taxi Remis Región',
    typeKey: 'type_taxi',
    rating: 4.2,
    reviews: 5,
    address: '9 de Julio 119, El Calafate',
    phone: '+54 2902 49-1403',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'TR',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Servicio de taxi y remis en El Calafate.',
    items: ['Solicitar taxi', 'Solicitar remis'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'remis-nueva-libertador',
    name: 'Remis La Nueva Libertador',
    typeKey: 'type_taxi',
    rating: 4.3,
    reviews: 58,
    address: 'Av. del Libertador 522, El Calafate',
    phone: '+54 2902 49-0155',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'NL',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Servicio de remis y traslados.',
    items: ['Solicitar remis', 'Consultar traslado'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'remis-rolando',
    name: 'Remis Rolando',
    typeKey: 'type_taxi',
    rating: 5.0,
    reviews: 2,
    address: 'Francisco M. Pontoriero 182, El Calafate',
    phone: '+54 9 2966 72-5738',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'RR',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Servicio de remis en El Calafate.',
    items: ['Solicitar remis', 'Consultar traslado'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'laguna-nimez',
    name: 'Reserva Laguna Nimez',
    typeKey: 'type_attraction',
    rating: 4.3,
    reviews: 6289,
    address: 'Av. Costanera Pres. Néstor Carlos Kirchner 2075, El Calafate',
    phone: '+54 2902 49-5536',
    hours: 'Todos los días · 09:30–19:30',
    accent: '#1d9b83',
    initials: 'LN',
    icon: '🦩',
    lat: null,
    lng: null,
    description: 'Reserva natural urbana con sendero interpretativo y observación de aves.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'centro-interpretacion',
    name: 'Centro de Interpretación Histórica Calafate',
    typeKey: 'type_attraction',
    rating: 4.4,
    reviews: 2309,
    address: 'Almirante G. Brown 1175, El Calafate',
    phone: '+54 2902 49-2799',
    hours: 'Todos los días · 10:00–18:00',
    accent: '#5276a4',
    initials: 'CI',
    icon: '🏛️',
    lat: null,
    lng: null,
    description: 'Museo y centro cultural dedicado a la historia natural y humana de la Patagonia austral.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'walichu',
    name: 'Cuevas de Walichu / Punta Walichu',
    typeKey: 'type_attraction',
    rating: 4.4,
    reviews: 2777,
    address: 'Punta Walichu, El Calafate',
    phone: '+54 2902 40-2073',
    hours: 'Todos los días · 11:00–19:00',
    accent: '#a05e39',
    initials: 'PW',
    icon: '🪨',
    lat: null,
    lng: null,
    description: 'Reserva natural y arqueológica con arte rupestre y patrimonio de los pueblos originarios.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'plaza-perito-moreno',
    name: 'Plaza Perito Moreno',
    typeKey: 'type_attraction',
    rating: 4.7,
    reviews: 10,
    address: 'Av. del Libertador 917-895, El Calafate',
    phone: '',
    hours: 'Abierto 24 horas',
    accent: '#4b9a63',
    initials: 'PM',
    icon: '🌳',
    lat: null,
    lng: null,
    description: 'Espacio público céntrico de El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'heroes-malvinas',
    name: 'Plazoleta Héroes de Malvinas',
    typeKey: 'type_attraction',
    rating: 4.2,
    reviews: 230,
    address: 'Av. del Libertador 1799-1849, El Calafate',
    phone: '',
    hours: 'Abierto 24 horas',
    accent: '#4b9a63',
    initials: 'HM',
    icon: '🇦🇷',
    lat: null,
    lng: null,
    description: 'Plazoleta y punto de interés sobre Av. del Libertador.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'glaciarium',
    name: 'Glaciarium',
    typeKey: 'type_attraction',
    rating: 4.4,
    reviews: 6340,
    address: 'RP11, El Calafate',
    phone: '+54 2902 49-7912',
    hours: 'Todos los días · 12:00–19:00',
    accent: '#3e9ed0',
    initials: 'GL',
    icon: '🧊',
    lat: null,
    lng: null,
    description: 'Centro de interpretación dedicado al hielo y los glaciares patagónicos.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'museo-regional',
    name: 'Museo de Historia Regional Horacio Echeverría',
    typeKey: 'type_attraction',
    rating: 3.8,
    reviews: 85,
    address: 'Av. del Libertador 575, El Calafate',
    phone: '+54 2966 69-2304',
    hours: 'Todos los días · 10:00–20:00',
    accent: '#5276a4',
    initials: 'MR',
    icon: '🏛️',
    lat: null,
    lng: null,
    description: 'Museo dedicado a la historia regional de El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'museo-juguete',
    name: 'Museo Argentino del Juguete',
    typeKey: 'type_attraction',
    rating: 4.4,
    reviews: 656,
    address: 'Av. del Libertador 975, El Calafate',
    phone: '+54 2902 49-1400',
    whatsapp: '5492966459544',
    hours: 'Todos los días · 11:00–21:00',
    accent: '#8a5fd3',
    initials: 'MJ',
    icon: '🧸',
    lat: null,
    lng: null,
    description: 'Museo con miles de juguetes y objetos históricos de distintas generaciones.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'mirador-lago-argentino',
    name: 'Mirador Lago Argentino',
    typeKey: 'type_attraction',
    rating: 4.7,
    reviews: 1175,
    address: 'Calle 2, El Calafate',
    phone: '',
    hours: 'Abierto 24 horas',
    accent: '#3b87a5',
    initials: 'ML',
    icon: '👀',
    lat: null,
    lng: null,
    description: 'Mirador panorámico con vistas sobre el Lago Argentino y la ciudad.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'mirador-ciudad',
    name: 'Mirador de la Ciudad',
    typeKey: 'type_attraction',
    rating: 4.5,
    reviews: 288,
    address: 'El Calafate, Santa Cruz',
    phone: '',
    hours: 'Consultar acceso',
    accent: '#3b87a5',
    initials: 'MC',
    icon: '👀',
    lat: null,
    lng: null,
    description: 'Punto panorámico con vistas de El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'plaza-pioneros',
    name: 'Plaza de Los Pioneros',
    typeKey: 'type_attraction',
    rating: 4.5,
    reviews: 1293,
    address: 'Av. del Libertador 599-699, El Calafate',
    phone: '',
    hours: 'Abierto 24 horas',
    accent: '#4b9a63',
    initials: 'PP',
    icon: '🌳',
    lat: null,
    lng: null,
    description: 'Plaza histórica y espacio verde sobre la avenida principal.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'paseo-costanera',
    name: 'Paseo Costanera Presidente Néstor Kirchner',
    typeKey: 'type_attraction',
    rating: 4.3,
    reviews: 318,
    address: 'Costanera de El Calafate',
    phone: '',
    hours: 'Abierto 24 horas',
    accent: '#3b87a5',
    initials: 'PC',
    icon: '🌊',
    lat: null,
    lng: null,
    description: 'Paseo costero junto al Lago Argentino.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'anfiteatro-bosque',
    name: 'Anfiteatro del Bosque',
    typeKey: 'type_attraction',
    rating: 4.6,
    reviews: 728,
    address: 'Av. del Libertador 1500, El Calafate',
    phone: '+54 2902 49-6497',
    hours: 'Todos los días · 08:00–20:00',
    accent: '#4b9a63',
    initials: 'AB',
    icon: '🎭',
    lat: null,
    lng: null,
    description: 'Anfiteatro y punto de información sobre la avenida principal.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'punta-soberana',
    name: 'Punta Soberana',
    typeKey: 'type_attraction',
    rating: 4.7,
    reviews: 40,
    address: 'Punta Soberana, El Calafate',
    phone: '',
    hours: 'Consultar acceso',
    accent: '#3b87a5',
    initials: 'PS',
    icon: '🏞️',
    lat: null,
    lng: null,
    description: 'Reserva natural y zona costera de El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'playita-punta-soberana',
    name: 'Playita Punta Soberana',
    typeKey: 'type_attraction',
    rating: 4.6,
    reviews: 269,
    address: 'Punta Soberana, El Calafate',
    phone: '',
    hours: 'Consultar acceso',
    accent: '#3b87a5',
    initials: 'PS',
    icon: '🏖️',
    lat: null,
    lng: null,
    description: 'Punto costero de Punta Soberana.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'estancia-25-mayo',
    name: 'Estancia 25 de Mayo',
    typeKey: 'type_attraction',
    rating: 4.7,
    reviews: 1221,
    address: 'Ushuaia 200, El Calafate',
    phone: '+54 2902 49-1450',
    hours: 'Todos los días · 17:00–21:30',
    accent: '#8b633f',
    initials: '25M',
    icon: '🐑',
    lat: null,
    lng: null,
    description: 'Estancia y experiencia rural patagónica en El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'punto-panoramico',
    name: 'Punto Panorámico',
    typeKey: 'type_attraction',
    rating: 4.6,
    reviews: 29,
    address: 'MPJW+77, El Calafate',
    phone: '',
    hours: 'Abierto 24 horas',
    accent: '#3b87a5',
    initials: 'PP',
    icon: '📷',
    lat: null,
    lng: null,
    description: 'Punto panorámico de la zona de El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'canadon-arroyo-calafate',
    name: 'Cañadón del Arroyo Calafate',
    typeKey: 'type_attraction',
    rating: 4.5,
    reviews: 301,
    address: 'El Calafate, Santa Cruz',
    phone: '',
    hours: 'Consultar acceso',
    accent: '#866a49',
    initials: 'CA',
    icon: '🥾',
    lat: null,
    lng: null,
    description: 'Área natural y sendero en las cercanías de la ciudad.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'mountain-park',
    name: 'Mountain Park',
    typeKey: 'type_attraction',
    rating: 4.6,
    reviews: 102,
    address: 'Calle 3015 Nº 2028, El Calafate',
    phone: '+54 9 2902 41-6200',
    hours: 'Todos los días · 09:00–17:00',
    accent: '#5c7a42',
    initials: 'MP',
    icon: '🏔️',
    lat: null,
    lng: null,
    description: 'Atracción turística de montaña en El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'glaciar-perito-moreno',
    name: 'Glaciar Perito Moreno',
    typeKey: 'type_attraction',
    rating: 4.9,
    reviews: 2373,
    address: 'Parque Nacional Los Glaciares, Santa Cruz',
    phone: '',
    hours: 'Consultar horario del Parque Nacional',
    accent: '#3e9ed0',
    initials: 'GPM',
    icon: '🧊',
    lat: null,
    lng: null,
    description: 'Uno de los principales atractivos del Parque Nacional Los Glaciares, a unos 80 km de El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'parque-los-glaciares',
    name: 'Parque Nacional Los Glaciares',
    typeKey: 'type_attraction',
    rating: 4.9,
    reviews: 6457,
    address: 'Santa Cruz, Argentina',
    phone: '+54 2902 49-1005',
    hours: 'Todos los días · 08:00–18:00',
    accent: '#3e9ed0',
    initials: 'PN',
    icon: '🏔️',
    lat: null,
    lng: null,
    description: 'Parque nacional que protege glaciares, lagos y bosques andino-patagónicos.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'pasarelas-perito-moreno',
    name: 'Pasarelas del Glaciar Perito Moreno',
    typeKey: 'type_attraction',
    rating: 4.9,
    reviews: 9432,
    address: 'Parque Nacional Los Glaciares, Santa Cruz',
    phone: '',
    hours: 'Todos los días · 08:00–18:00',
    accent: '#3e9ed0',
    initials: 'PG',
    icon: '🥾',
    lat: null,
    lng: null,
    description: 'Circuito de pasarelas y miradores frente al Glaciar Perito Moreno.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'lago-roca',
    name: 'Lago Roca',
    typeKey: 'type_attraction',
    rating: 4.7,
    reviews: 151,
    address: 'Parque Nacional Los Glaciares, Santa Cruz',
    phone: '',
    hours: 'Consultar acceso',
    accent: '#3b87a5',
    initials: 'LR',
    icon: '🏞️',
    lat: null,
    lng: null,
    description: 'Área lacustre del Parque Nacional Los Glaciares.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'lago-argentino',
    name: 'Lago Argentino',
    typeKey: 'type_attraction',
    rating: 0,
    reviews: 0,
    address: 'El Calafate, Santa Cruz',
    phone: '',
    hours: 'Acceso según el sector',
    accent: '#3b87a5',
    initials: 'LA',
    icon: '🌊',
    lat: null,
    lng: null,
    description: 'El gran lago patagónico sobre cuya costa se encuentra El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {    id: 'puerto-bajo-sombras',
    name: 'Puerto Bajo las Sombras',
    typeKey: 'type_attraction',
    rating: 4.7,
    reviews: 4978,
    address: 'Parque Nacional Los Glaciares, El Calafate',
    phone: '+54 2902 49-9105',
    hours: 'Todos los días · 09:00–18:00',
    accent: '#3b87a5',
    initials: 'PBS',
    icon: '⛴️',
    lat: null,
    lng: null,
    description: 'Puerto sobre el Lago Rico utilizado para navegaciones y actividades próximas al glaciar.',
    items: [],
    food: false,    benefitKind: 'none',
  },
  {
    id: 'puerto-bandera',
    name: 'Puerto Bandera',
    typeKey: 'type_attraction',
    rating: 0,
    reviews: 0,
    address: 'Santa Cruz, Argentina',
    phone: '',
    hours: 'Consultar operaciones',
    accent: '#3b87a5',
    initials: 'PB',
    icon: '⛴️',
    lat: null,
    lng: null,
    description: 'Puerto de salida de navegaciones por el Brazo Norte del Lago Argentino.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'glaciar-upsala',
    name: 'Glaciar Upsala',
    typeKey: 'type_attraction',
    rating: 0,
    reviews: 0,
    address: 'Parque Nacional Los Glaciares, Santa Cruz',
    phone: '',
    hours: 'Acceso mediante navegaciones habilitadas',
    accent: '#3e9ed0',
    initials: 'GU',
    icon: '🧊',
    lat: null,
    lng: null,
    description: 'Glaciar del Parque Nacional Los Glaciares visible en circuitos de navegación.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'glaciar-spegazzini',
    name: 'Glaciar Spegazzini',
    typeKey: 'type_attraction',
    rating: 5.0,
    reviews: 161,
    address: 'Parque Nacional Los Glaciares, Santa Cruz',
    phone: '',
    hours: 'Acceso mediante navegaciones habilitadas',
    accent: '#3e9ed0',
    initials: 'GS',
    icon: '🧊',
    lat: null,
    lng: null,
    description: 'Glaciar del Brazo Spegazzini del Lago Argentino.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'enclave',
    name: 'ENCLAVE',
    typeKey: 'type_bar',
    rating: 4.6,
    reviews: 27,
    address: 'Punta Soberana, Casimiro Biguá, El Calafate',
    phone: '+54 9 2966 52-7235',
    hours: 'Jue y Vie 14:00–22:00 · Sáb 14:00–22:00 · Dom 12:00–20:00',
    accent: '#7c4f38',
    initials: 'EN',
    icon: '🍷',
    lat: null,
    lng: null,
    description: 'Bar ubicado en la zona de Punta Soberana.',
    items: ['Consultar propuesta', 'Consultar disponibilidad'],
    food: true,
    benefitKind: 'none',
  },

  {
    id: 'glacio-bar',
    name: 'Glacio Bar - Glaciarium',
    typeKey: 'type_bar',
    rating: 0,
    reviews: 0,
    address: 'Mza. 1543, Calle sin nombre 1111, El Calafate',
    phone: '+54 2902 49-7912',
    hours: 'Abierto todo el año · consultar turnos',
    accent: '#70b9d5',
    initials: 'GB',
    icon: '🧊',
    lat: null,
    lng: null,
    description: 'Bar de hielo ubicado en el subsuelo del Glaciarium, con ambiente a aproximadamente -10 °C.',
    items: ['Ingreso a Glacio Bar', 'Consultar turnos'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'yeti-ice-bar',
    name: 'Yeti Ice Bar',
    typeKey: 'type_bar',
    rating: 4.3,
    reviews: 3390,
    address: 'Av. del Libertador 1359, El Calafate',
    phone: '+54 2902 49-2993',
    whatsapp: '5492966649667',
    hours: 'Todos los días · 16:00–00:00',
    accent: '#79c4df',
    initials: 'YI',
    icon: '❄️',
    lat: null,
    lng: null,
    description: 'Bar de hielo en el centro de El Calafate, con experiencia bajo cero y equipamiento térmico.',
    items: ['Ingreso Yeti Ice Bar', 'Consultar disponibilidad'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'letras-calafate',
    name: 'Letras de El Calafate',
    typeKey: 'type_attraction',
    rating: 4.6,
    reviews: 140,
    address: 'Av. del Libertador, El Calafate',
    phone: '',
    hours: 'Abierto 24 horas',
    accent: '#4384a4',
    initials: 'EC',
    icon: '📸',
    lat: null,
    lng: null,
    description: 'El clásico cartel de El Calafate para fotografías y paseo urbano.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'casa-verde',
    name: 'Casa Verde',
    typeKey: 'type_attraction',
    rating: 5.0,
    reviews: 3,
    address: 'Paseo Kirchner, El Calafate',
    phone: '',
    hours: 'Consultar acceso',
    accent: '#4d9b62',
    initials: 'CV',
    icon: '🌿',
    lat: null,
    lng: null,
    description: 'Punto de interés natural en el entorno de El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'nativo-experience',
    name: 'Nativo Experience',
    typeKey: 'type_attraction',
    rating: 4.8,
    reviews: 851,
    address: 'Reserva Natural Estancia 25 de Mayo, El Calafate',
    phone: '+54 9 2966 66-0054',
    whatsapp: '5492966660054',
    hours: 'Consultar salidas',
    accent: '#8a5c3f',
    initials: 'NE',
    icon: '🪨',
    lat: null,
    lng: null,
    description: 'Experiencia turística en el entorno natural de la Estancia 25 de Mayo.',
    items: [],
    food: false,
    benefitKind: 'none',
  },

  {
    id: 'napoles',
    name: 'Nápoles',
    typeKey: 'type_pizza',
    rating: 4.2,
    reviews: 945,
    address: 'Av. del Libertador, El Calafate',
    phone: '+54 2902 48-8333',
    hours: 'Todos los días · 12:00–00:00',
    accent: '#d85835',
    initials: 'NP',
    icon: '🍕',
    lat: null,
    lng: null,
    description: 'Pizzería sobre la avenida principal de El Calafate.',
    items: ['Pizza', 'Consultar carta'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'la-lechuza',
    name: 'La Lechuza Pizza y Pastas',
    typeKey: 'type_pizza',
    rating: 4.2,
    reviews: 6768,
    address: 'Av. del Libertador 1301, El Calafate',
    phone: '+54 2902 49-1610',
    hours: 'Todos los días · 12:00–23:30',
    accent: '#d85835',
    initials: 'LL',
    icon: '🍕',
    lat: null,
    lng: null,
    description: 'Restaurante de pizza y pastas en el centro de El Calafate.',
    items: ['Pizza', 'Pastas', 'Consultar carta'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'don-pancho',
    name: 'Don Pancho',
    typeKey: 'type_quick',
    rating: 4.3,
    reviews: 585,
    address: 'Av. del Libertador 1873, El Calafate',
    phone: '+54 2902 49-4900',
    hours: 'Abierto 24 horas',
    accent: '#e27731',
    initials: 'DP',
    icon: '🍔',
    lat: null,
    lng: null,
    description: 'Opción de comida rápida sobre Av. del Libertador.',
    items: ['Comida rápida', 'Consultar carta'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'wolly-burgers',
    name: 'Wolly Burgers',
    typeKey: 'type_quick',
    rating: 4.4,
    reviews: 990,
    address: 'Av. del Libertador 932, El Calafate',
    phone: '+54 2902 49-4660',
    hours: 'Todos los días · 12:00–00:30 aprox.',
    accent: '#e27731',
    initials: 'WB',
    icon: '🍔',
    lat: null,
    lng: null,
    description: 'Hamburguesería en el centro de El Calafate.',
    items: ['Hamburguesas', 'Papas', 'Consultar carta'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'reich-burgers',
    name: 'Hamburguesería REICH',
    typeKey: 'type_quick',
    rating: 4.9,
    reviews: 423,
    address: 'Gdor. Gregores 997, El Calafate',
    phone: '',
    hours: 'Todos los días · 13:00–00:00',
    accent: '#e27731',
    initials: 'RH',
    icon: '🍔',
    lat: null,
    lng: null,
    description: 'Hamburguesería y gastropub en El Calafate.',
    items: ['Hamburguesas', 'Consultar carta'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'rotiseria-bokado',
    name: 'Bokado Cocina Artesanal',
    typeKey: 'type_quick',
    rating: 4.2,
    reviews: 379,
    address: '9 de Julio 145, El Calafate',
    phone: '+54 2902 49-0323',
    hours: '11:30–15:00 / 19:30–23:30',
    accent: '#e27731',
    initials: 'BA',
    icon: '🥡',
    lat: null,
    lng: null,
    description: 'Rotisería y cocina artesanal para llevar.',
    items: ['Comida para llevar', 'Consultar menú'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'casimiro-bigua',
    name: 'Casimiro Biguá',
    typeKey: 'type_grill',
    rating: 4.3,
    reviews: 5984,
    address: 'Av. del Libertador 963, El Calafate',
    phone: '+54 9 2966 71-0284',
    whatsapp: '5492966710284',
    hours: 'Todos los días · 12:00–00:00',
    accent: '#9a633b',
    initials: 'CB',
    icon: '🥩',
    lat: null,
    lng: null,
    description: 'Parrilla y restaurante patagónico en el centro.',
    items: ['Parrilla', 'Carnes', 'Consultar carta'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'la-candelaria',
    name: 'La Candelaria Steak House',
    typeKey: 'type_grill',
    rating: 4.6,
    reviews: 1037,
    address: 'Av. del Libertador 1610, El Calafate',
    phone: '+54 2966 26-6416',
    hours: 'Todos los días · tarde/noche',
    accent: '#9a633b',
    initials: 'LC',
    icon: '🥩',
    lat: null,
    lng: null,
    description: 'Steak house y parrilla en Av. del Libertador.',
    items: ['Carnes', 'Parrilla', 'Consultar carta'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'el-quincho-asador',
    name: 'El Quincho Asador Parrilla',
    typeKey: 'type_grill',
    rating: 4.6,
    reviews: 199,
    address: 'Ushuaia 200, El Calafate',
    phone: '+54 2902 49-1450',
    hours: 'Consultar horario',
    accent: '#9a633b',
    initials: 'EQ',
    icon: '🥩',
    lat: null,
    lng: null,
    description: 'Asador y parrilla con cordero patagónico.',
    items: ['Cordero patagónico', 'Parrilla', 'Consultar carta'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'estilo-campo',
    name: 'Estilo Campo Parrilla y Tenedor Libre',
    typeKey: 'type_buffet',
    rating: 4.7,
    reviews: 2106,
    address: 'Gdor. Gregores 1102, El Calafate',
    phone: '+54 11 5160-8022',
    hours: 'Almuerzo y cena · consultar horario del día',
    accent: '#a86c3d',
    initials: 'EC',
    icon: '🍽️',
    lat: null,
    lng: null,
    description: 'Parrilla y tenedor libre con cordero patagónico y buffet.',
    items: ['Tenedor libre', 'Parrilla', 'Cordero patagónico'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'los-baguales',
    name: 'Los Baguales Parrilla y Tenedor Libre',
    typeKey: 'type_buffet',
    rating: 4.7,
    reviews: 946,
    address: 'Perito Moreno 95, El Calafate',
    phone: '+54 2966 41-5389',
    hours: 'Todos los días · 11:30–23:30',
    accent: '#a86c3d',
    initials: 'LB',
    icon: '🍽️',
    lat: null,
    lng: null,
    description: 'Parrilla y tenedor libre en El Calafate.',
    items: ['Tenedor libre', 'Parrilla', 'Consultar carta'],
    food: true,
    benefitKind: 'none',
  },
  {
    id: 'lavanderia-patagonia',
    name: 'Lavandería Patagonia',
    typeKey: 'type_laundry',
    rating: 4.9,
    reviews: 34,
    address: 'Gdor. Gregores 1114, El Calafate',
    phone: '+54 2966 78-7960',
    hours: 'Lun a Vie · 08:00–21:00 · fin de semana horario reducido',
    accent: '#3d8aa8',
    initials: 'LP',
    icon: '🧺',
    lat: null,
    lng: null,
    description: 'Servicio de lavandería y guarda de equipaje.',
    items: ['Lavado de ropa', 'Consultar servicio'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'laundry-club',
    name: 'Laundry Club - Lavadero de Ropa',
    typeKey: 'type_laundry',
    rating: 4.9,
    reviews: 530,
    address: 'Haro 482 esq. Mermoz, El Calafate',
    phone: '+54 9 2902 41-6034',
    whatsapp: '5492902416034',
    hours: 'Lun a Sáb · 10:00–13:00 / 15:00–19:00',
    accent: '#3d8aa8',
    initials: 'LC',
    icon: '🧺',
    lat: null,
    lng: null,
    description: 'Lavadero de ropa y servicio de lavandería.',
    items: ['Lavado de ropa', 'Consultar servicio'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'lava-andina',
    name: 'LAVA Andina - Laundry',
    typeKey: 'type_laundry',
    rating: 4.3,
    reviews: 86,
    address: 'Cmte. Tomás Espora 88, El Calafate',
    phone: '+54 2902 49-3980',
    hours: 'Lun a Sáb · 09:00–13:30 / 14:00–19:00',
    accent: '#3d8aa8',
    initials: 'LA',
    icon: '🧺',
    lat: null,
    lng: null,
    description: 'Lavandería en el centro de El Calafate.',
    items: ['Lavado de ropa', 'Consultar servicio'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'lavanderia-mancha',
    name: 'Lavandería y Tintorería De la Mancha',
    typeKey: 'type_laundry',
    rating: 3.7,
    reviews: 146,
    address: 'Gdor. Gregores 1224, El Calafate',
    phone: '+54 2902 41-6476',
    hours: 'Lun a Vie · 09:00–21:00 · Sáb 10:00–20:00',
    accent: '#3d8aa8',
    initials: 'DM',
    icon: '🧺',
    lat: null,
    lng: null,
    description: 'Lavandería y tintorería.',
    items: ['Lavado', 'Tintorería', 'Consultar servicio'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'lavanderia-delsur',
    name: 'Lavandería DELSUR',
    typeKey: 'type_laundry',
    rating: 4.8,
    reviews: 105,
    address: 'Av. Juan Domingo Perón 1881, El Calafate',
    phone: '+54 2902 41-7260',
    hours: 'Todos los días · consultar horario',
    accent: '#3d8aa8',
    initials: 'DS',
    icon: '🧺',
    lat: null,
    lng: null,
    description: 'Lavandería de ropa en El Calafate.',
    items: ['Lavado de ropa', 'Consultar servicio'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'lavanderia-burbujas',
    name: 'Lavandería Las Burbujas',
    typeKey: 'type_laundry',
    rating: 4.9,
    reviews: 434,
    address: '25 de Mayo 168, El Calafate',
    phone: '+54 2966 76-2511',
    hours: 'Todos los días · 08:00–21:00 aprox.',
    accent: '#3d8aa8',
    initials: 'LB',
    icon: '🧺',
    lat: null,
    lng: null,
    description: 'Servicio de lavandería en El Calafate.',
    items: ['Lavado de ropa', 'Consultar servicio'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'taxi-remis-alem',
    name: 'Taxi Remis Alem',
    typeKey: 'type_taxi',
    rating: 4.2,
    reviews: 23,
    address: 'Cabo Merillanca 150, El Calafate',
    phone: '+54 2966 40-8172',
    hours: 'Consultar disponibilidad',
    accent: '#f6c945',
    initials: 'TA',
    icon: '🚕',
    lat: null,
    lng: null,
    description: 'Servicio de taxi y remis en El Calafate.',
    items: ['Solicitar taxi', 'Solicitar remis'],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'parque-manuel-belgrano',
    name: 'Parque Manuel Belgrano',
    typeKey: 'type_attraction',
    rating: 4.4,
    reviews: 538,
    address: 'Av. Juan Domingo Perón 1509, El Calafate',
    phone: '',
    hours: 'Acceso libre',
    accent: '#4d9b62',
    initials: 'MB',
    icon: '🌳',
    lat: null,
    lng: null,
    description: 'Parque municipal y espacio verde de El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'centro-cultural',
    name: 'Centro Cultural Municipal',
    typeKey: 'type_attraction',
    rating: 4.6,
    reviews: 330,
    address: 'Julio Argentino Roca 1100, El Calafate',
    phone: '+54 9 2966 69-2307',
    whatsapp: '5492966692307',
    hours: 'Lun a Vie · 08:00–22:00 · fin de semana 10:00–22:00',
    accent: '#5276a4',
    initials: 'CC',
    icon: '🎭',
    lat: null,
    lng: null,
    description: 'Centro cultural municipal con actividades y propuestas culturales.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'mural-mosaico',
    name: 'Mural de Mosaico 4E',
    typeKey: 'type_attraction',
    rating: 4.6,
    reviews: 14,
    address: '7 de Diciembre y Av. del Libertador, El Calafate',
    phone: '',
    hours: 'Abierto 24 horas',
    accent: '#8a5fd3',
    initials: 'MM',
    icon: '🎨',
    lat: null,
    lng: null,
    description: 'Mural urbano de mosaico en el centro de El Calafate.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
  {
    id: 'intendencia-parque',
    name: 'Intendencia Parque Nacional Los Glaciares',
    typeKey: 'type_attraction',
    rating: 4.6,
    reviews: 3529,
    address: 'Av. del Libertador 1302, El Calafate',
    phone: '+54 2902 49-1005',
    hours: 'Lun a Vie · 08:00–16:00',
    accent: '#3e9ed0',
    initials: 'APN',
    icon: 'ℹ️',
    lat: null,
    lng: null,
    description: 'Centro de información del Parque Nacional Los Glaciares.',
    items: [],
    food: false,
    benefitKind: 'none',
  },
];


const groupKeys = ['all', 'food', 'tourism', 'mobility', 'services', 'agency'];

const ATTRACTION_SUBTYPES: Record<string, string> = {
  'laguna-nimez': 'nature',
  'punta-soberana': 'nature',
  'playita-punta-soberana': 'nature',
  'lago-roca': 'lakes',
  'lago-argentino': 'lakes',
  'casa-verde': 'nature',
  'glaciarium': 'museum',
  'centro-interpretacion': 'museum',
  'museo-regional': 'museum',
  'museo-juguete': 'museum',
  'walichu': 'culture',
  'plaza-perito-moreno': 'culture',
  'heroes-malvinas': 'culture',
  'plaza-pioneros': 'culture',
  'paseo-costanera': 'lakes',
  'anfiteatro-bosque': 'culture',
  'letras-calafate': 'culture',
  'mirador-lago-argentino': 'viewpoint',
  'mirador-ciudad': 'viewpoint',
  'punto-panoramico': 'viewpoint',
  'glaciar-perito-moreno': 'glacier',
  'parque-los-glaciares': 'glacier',
  'pasarelas-perito-moreno': 'glacier',
  'puerto-bajo-sombras': 'lakes',
  'puerto-bandera': 'lakes',
  'glaciar-upsala': 'glacier',
  'glaciar-spegazzini': 'glacier',
  'estancia-25-mayo': 'experience',
  'canadon-arroyo-calafate': 'experience',
  'mountain-park': 'experience',
  'nativo-experience': 'experience',
  'parque-manuel-belgrano': 'nature',
  'centro-cultural': 'culture',
  'mural-mosaico': 'culture',
  'intendencia-parque': 'info',
  'glacio-bar': 'icebar',
  'yeti-ice-bar': 'icebar',
};

function groupLabel(key: string): string {
  const labels: Record<LangCode, Record<string, string>> = {
    es: { all: 'Todo', food: 'Comer & Beber', tourism: 'Turismo', mobility: 'Remis & Taxi', services: 'Servicios', agency: 'Perla Andina' },
    en: { all: 'All', food: 'Food & Drink', tourism: 'Tourism', mobility: 'Taxi & Remis', services: 'Services', agency: 'Perla Andina' },
    pt: { all: 'Tudo', food: 'Comer & Beber', tourism: 'Turismo', mobility: 'Remis & Táxi', services: 'Serviços', agency: 'Perla Andina' },
    fr: { all: 'Tout', food: 'Manger & Boire', tourism: 'Tourisme', mobility: 'Taxi & Remis', services: 'Services', agency: 'Perla Andina' },
    de: { all: 'Alle', food: 'Essen & Trinken', tourism: 'Tourismus', mobility: 'Taxi & Remis', services: 'Services', agency: 'Perla Andina' },
    it: { all: 'Tutto', food: 'Mangiare & Bere', tourism: 'Turismo', mobility: 'Taxi & Remis', services: 'Servizi', agency: 'Perla Andina' },
    zh: { all: '全部', food: '餐饮', tourism: '旅游', mobility: '出租车', services: '服务', agency: 'Perla Andina' },
    ar: { all: 'الكل', food: 'طعام وشراب', tourism: 'السياحة', mobility: 'تاكسي', services: 'الخدمات', agency: 'Perla Andina' },
    ru: { all: 'Все', food: 'Еда и напитки', tourism: 'Туризм', mobility: 'Такси', services: 'Сервисы', agency: 'Perla Andina' },
    hi: { all: 'सभी', food: 'खाना और पेय', tourism: 'पर्यटन', mobility: 'टैक्सी', services: 'सेवाएँ', agency: 'Perla Andina' },
  };
  return labels[currentLang][key] || key;
}

function subcategoryLabel(key: string): string {
  if (key === 'all') return t('all');
  if (key.startsWith('type_')) return t(key);
  const labels: Record<LangCode, Record<string, string>> = {
    es: { museum: 'Museos', nature: 'Naturaleza', lakes: 'Lagos & Puertos', glacier: 'Glaciares', viewpoint: 'Miradores', culture: 'Ciudad & Cultura', icebar: 'Bares de hielo', experience: 'Experiencias', info: 'Información turística' },
    en: { museum: 'Museums', nature: 'Nature', lakes: 'Lakes & Ports', glacier: 'Glaciers', viewpoint: 'Viewpoints', culture: 'City & Culture', icebar: 'Ice bars', experience: 'Experiences', info: 'Tourist information' },
    pt: { museum: 'Museus', nature: 'Natureza', lakes: 'Lagos & Portos', glacier: 'Glaciares', viewpoint: 'Mirantes', culture: 'Cidade & Cultura', icebar: 'Bares de gelo', experience: 'Experiências', info: 'Informação turística' },
    fr: { museum: 'Musées', nature: 'Nature', lakes: 'Lacs & Ports', glacier: 'Glaciers', viewpoint: 'Miradors', culture: 'Ville & Culture', icebar: 'Bars de glace', experience: 'Expériences', info: 'Information touristique' },
    de: { museum: 'Museen', nature: 'Natur', lakes: 'Seen & Häfen', glacier: 'Gletscher', viewpoint: 'Aussichtspunkte', culture: 'Stadt & Kultur', icebar: 'Eisbars', experience: 'Erlebnisse', info: 'Touristeninformation' },
    it: { museum: 'Musei', nature: 'Natura', lakes: 'Laghi & Porti', glacier: 'Ghiacciai', viewpoint: 'Belvedere', culture: 'Città & Cultura', icebar: 'Ice bar', experience: 'Esperienze', info: 'Informazioni turistiche' },
    zh: { museum: '博物馆', nature: '自然', lakes: '湖泊与港口', glacier: '冰川', viewpoint: '观景点', culture: '城市与文化', icebar: '冰吧', experience: '体验', info: '旅游信息' },
    ar: { museum: 'متاحف', nature: 'طبيعة', lakes: 'بحيرات وموانئ', glacier: 'أنهار جليدية', viewpoint: 'إطلالات', culture: 'مدينة وثقافة', icebar: 'بارات جليدية', experience: 'تجارب', info: 'معلومات سياحية' },
    ru: { museum: 'Музеи', nature: 'Природа', lakes: 'Озёра и порты', glacier: 'Ледники', viewpoint: 'Смотровые', culture: 'Город и культура', icebar: 'Ледяные бары', experience: 'Впечатления', info: 'Туристическая информация' },
    hi: { museum: 'संग्रहालय', nature: 'प्रकृति', lakes: 'झील और बंदरगाह', glacier: 'ग्लेशियर', viewpoint: 'व्यू पॉइंट', culture: 'शहर और संस्कृति', icebar: 'आइस बार', experience: 'अनुभव', info: 'पर्यटक जानकारी' },
  };
  return labels[currentLang][key] || key;
}

function placeGroups(place: Place): string[] {
  if (place.id === 'perla-andina') return ['agency'];
  if (place.typeKey === 'type_attraction') return ['tourism'];
  if (place.id === 'glacio-bar' || place.id === 'yeti-ice-bar') return ['tourism', 'food'];
  if (place.typeKey === 'type_taxi') return ['mobility'];
  if (['type_pharmacy', 'type_souvenir', 'type_hotel', 'type_laundry'].includes(place.typeKey)) return ['services'];
  return ['food'];
}

function placeSubcategory(place: Place): string {
  if (place.typeKey === 'type_attraction' || place.id === 'glacio-bar' || place.id === 'yeti-ice-bar') {
    return ATTRACTION_SUBTYPES[place.id] || 'experience';
  }
  return place.typeKey;
}

function groupCount(key: string): number {
  if (key === 'all') return places.length;
  return places.filter(place => placeGroups(place).includes(key)).length;
}

function groupChips(): string {
  return groupKeys.map(key =>
    '<button data-group="' + key + '" class="' + (currentGroup === key ? 'active' : '') + '">' +
      groupLabel(key) + '<b>' + groupCount(key) + '</b>' +
    '</button>'
  ).join('');
}

function subcategoryChips(): string {
  if (currentGroup === 'all') return '';
  const groupPlaces = places.filter(place => placeGroups(place).includes(currentGroup));
  const keys = Array.from(new Set(groupPlaces.map(place => placeSubcategory(place))));
  if (keys.length <= 1) return '';
  return ['all', ...keys].map(key => {
    const count = key === 'all' ? groupPlaces.length : groupPlaces.filter(place => placeSubcategory(place) === key).length;
    return '<button data-subcategory="' + key + '" class="' + (currentSubcategory === key ? 'active' : '') + '">' + subcategoryLabel(key) + '<b>' + count + '</b></button>';
  }).join('');
}

function filterControls(context = ''): string {
  const secondary = subcategoryChips();
  return '<div class="filter-stack ' + context + '">' +
    '<div class="filter-level group-chips">' + groupChips() + '</div>' +
    (secondary ? '<div class="filter-level sub-chips">' + secondary + '</div>' : '') +
  '</div>';
}

let currentLang: LangCode = (localStorage.getItem('pa-language') as LangCode) || 'es';
let currentTab = 'home';
let currentGroup = 'all';
let currentSubcategory = 'all';
let searchTerm = '';
let favorites: string[] = JSON.parse(localStorage.getItem('pa-favorites') || '[]') as string[];
let selection: Array<{ placeId: string; item: string; qty: number }> = JSON.parse(localStorage.getItem('pa-selection') || '[]') as Array<{ placeId: string; item: string; qty: number }>;
let mapInstance: any = null;
let userMarker: any = null;
const markers = new Map<string, any>();

const view = document.querySelector<HTMLElement>('#view')!;
const sheet = document.querySelector<HTMLElement>('#sheet')!;
const sheetContent = document.querySelector<HTMLElement>('#sheetContent')!;
const toast = document.querySelector<HTMLElement>('#toast')!;


let mapRunId = 0;
let diagnosticsInstalled = false;
let diagnosticsOpen = false;
let diagEntries: Array<{ time: string; type: string; detail: string }> = (() => {
  try {
    return JSON.parse(localStorage.getItem('pa-diag-log') || '[]') as Array<{ time: string; type: string; detail: string }>;
  } catch {
    return [];
  }
})();

function recordDiag(type: string, detail: string): void {
  const entry = { time: new Date().toLocaleTimeString(), type, detail };
  diagEntries.push(entry);
  if (diagEntries.length > 220) diagEntries = diagEntries.slice(-220);
  try { localStorage.setItem('pa-diag-log', JSON.stringify(diagEntries)); } catch {}
  refreshDiagnosticPanel();
}

function diagnosticSummaryHtml(): string {
  const filtered = filteredPlaces();
  const withCoords = filtered.filter(place => place.lat !== null && place.lng !== null).length;
  return '<div class="diag-summary">' +
    '<div><span>Versión</span><b>' + VERSION + '</b></div>' +
    '<div><span>Pestaña</span><b>' + currentTab + '</b></div>' +
    '<div><span>Filtro</span><b>' + currentGroup + ' / ' + currentSubcategory + '</b></div>' +
    '<div><span>Esperados</span><b>' + filtered.length + '</b></div>' +
    '<div><span>Con coordenadas</span><b>' + withCoords + '</b></div>' +
    '<div><span>Markers cargados</span><b>' + markers.size + '</b></div>' +
  '</div>';
}

function refreshDiagnosticPanel(): void {
  if (!diagnosticsOpen) return;
  const panel = document.querySelector<HTMLElement>('#diagnosticPanel');
  if (!panel) return;
  const body = panel.querySelector<HTMLElement>('.diag-body');
  const summary = panel.querySelector<HTMLElement>('.diag-summary-wrap');
  if (summary) summary.innerHTML = diagnosticSummaryHtml();
  if (body) {
    body.innerHTML = diagEntries.slice(-90).reverse().map(entry =>
      '<div class="diag-line"><time>' + entry.time + '</time><b>' + entry.type + '</b><span>' + entry.detail.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span></div>'
    ).join('');
  }
}

function openDiagnostics(): void {
  let panel = document.querySelector<HTMLElement>('#diagnosticPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'diagnosticPanel';
    panel.className = 'diagnostic-panel';
    panel.innerHTML =
      '<div class="diag-card">' +
        '<div class="diag-head"><div><strong>Diagnóstico Perla Andina</strong><small>Clicks, filtros y carga del mapa</small></div><button id="diagClose">×</button></div>' +
        '<div class="diag-summary-wrap"></div>' +
        '<div class="diag-actions"><button id="diagCopy">Copiar diagnóstico</button><button id="diagClear">Limpiar</button></div>' +
        '<div class="diag-body"></div>' +
      '</div>';
    document.body.appendChild(panel);
    panel.querySelector<HTMLButtonElement>('#diagClose')?.addEventListener('click', () => {
      diagnosticsOpen = false;
      panel?.classList.remove('open');
    });
    panel.querySelector<HTMLButtonElement>('#diagClear')?.addEventListener('click', () => {
      diagEntries = [];
      try { localStorage.removeItem('pa-diag-log'); } catch {}
      recordDiag('DIAG', 'Registro limpiado');
    });
    panel.querySelector<HTMLButtonElement>('#diagCopy')?.addEventListener('click', async () => {
      const text = [
        'PERLA ANDINA DIAGNÓSTICO',
        VERSION,
        'tab=' + currentTab,
        'group=' + currentGroup,
        'subcategory=' + currentSubcategory,
        'filtered=' + filteredPlaces().length,
        'markers=' + markers.size,
        '',
        ...diagEntries.map(entry => entry.time + ' | ' + entry.type + ' | ' + entry.detail)
      ].join('\n');
      try {
        await navigator.clipboard.writeText(text);
        showToast('Diagnóstico copiado');
      } catch {
        showToast('No se pudo copiar');
      }
    });
  }
  diagnosticsOpen = true;
  panel.classList.add('open');
  refreshDiagnosticPanel();
}

function installDiagnostics(): void {
  if (diagnosticsInstalled) return;
  diagnosticsInstalled = true;
  const topbar = document.querySelector<HTMLElement>('.topbar');
  const langButton = document.querySelector<HTMLButtonElement>('#favShortcut');
  if (topbar && langButton) {
    let actions = topbar.querySelector<HTMLElement>('.top-actions');
    if (!actions) {
      actions = document.createElement('div');
      actions.className = 'top-actions';
      topbar.insertBefore(actions, langButton);
      actions.appendChild(langButton);
    }
    const button = document.createElement('button');
    button.id = 'diagShortcut';
    button.className = 'round diag-shortcut';
    button.textContent = 'DIAG';
    button.title = 'Diagnóstico';
    button.addEventListener('click', openDiagnostics);
    actions.appendChild(button);
  }
  document.addEventListener('click', event => {
    const target = event.target as HTMLElement | null;
    if (!target) return;
    const interactive = target.closest('button, a, [data-place], [data-group], [data-subcategory], input');
    if (!interactive) return;
    const label = (interactive.textContent || interactive.getAttribute('aria-label') || interactive.tagName).trim().replace(/\s+/g, ' ').slice(0, 90);
    const data = interactive instanceof HTMLElement ? JSON.stringify(interactive.dataset || {}) : '{}';
    recordDiag('CLICK', label + ' ' + data);
  }, true);
  recordDiag('BOOT', 'Diagnóstico instalado');
}

function t(key: string): string {
  return copy[currentLang][key] || copy.es[key] || key;
}

function flag(): string {
  return languages.find(item => item.code === currentLang)?.flag || '🌐';
}

function typeLabel(place: Place): string {
  return t(place.typeKey);
}

function benefitPendingLabel(): string {
  const labels: Record<LangCode, string> = {
    es: 'Beneficio a definir',
    en: 'Benefit to be defined',
    pt: 'Benefício a definir',
    fr: 'Avantage à définir',
    de: 'Vorteil noch festzulegen',
    it: 'Vantaggio da definire',
    zh: '优惠待确定',
    ar: 'الميزة قيد التحديد',
    ru: 'Бонус будет определён',
    hi: 'लाभ तय होना बाकी है',
  };
  return labels[currentLang];
}

function benefitLabel(place: Place): string {
  if (place.benefitKind === 'none') return benefitPendingLabel();
  if (place.benefitKind === 'wine') return t('benefit_wine');
  if (place.benefitKind === 'starter') return t('benefit_starter');
  if (place.benefitKind === 'dessert') return t('benefit_dessert');
  if (place.benefitKind === 'coffee') return t('benefit_coffee');
  if (place.benefitKind === 'gift') return t('benefit_gift');
  if (place.benefitKind === 'twoforone') return '2x1 · ' + t('benefit_selected');
  return (place.benefitValue || '10%') + ' ' + t('benefit_off');
}

function benefitStatusLabel(): string {
  const labels: Record<LangCode, string> = {
    es: 'NO HABILITADO',
    en: 'NOT ENABLED',
    pt: 'NÃO HABILITADO',
    fr: 'NON ACTIVÉ',
    de: 'NICHT AKTIVIERT',
    it: 'NON ABILITATO',
    zh: '未启用',
    ar: 'غير مفعّل',
    ru: 'НЕ АКТИВИРОВАНО',
    hi: 'सक्रिय नहीं',
  };
  return labels[currentLang];
}

function illustrativePhotoLabel(): string {
  const labels: Record<LangCode, string> = {
    es: 'Foto ilustrativa',
    en: 'Illustrative photo',
    pt: 'Foto ilustrativa',
    fr: 'Photo illustrative',
    de: 'Beispielfoto',
    it: 'Foto illustrativa',
    zh: '示意图片',
    ar: 'صورة توضيحية',
    ru: 'Иллюстративное фото',
    hi: 'उदाहरण फोटो',
  };
  return labels[currentLang];
}

function productImage(place: Place, item: string): string | null {
  if (!place.food) return null;
  const value = (place.typeKey + ' ' + item).toLowerCase();
  if (value.includes('pizza')) return 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=420&q=78';
  if (value.includes('pasta') || value.includes('raviol') || value.includes('tagliatelle') || value.includes('lasa')) return 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=420&q=78';
  if (value.includes('café') || value.includes('cafe') || value.includes('coffee')) return 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=420&q=78';
  if (value.includes('helado') || value.includes('icecream')) return 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=420&q=78';
  if (value.includes('pan') || value.includes('scone') || value.includes('bizco') || value.includes('pastelito')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=420&q=78';
  if (value.includes('cordero') || value.includes('bife') || value.includes('parrill') || value.includes('lomo')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=420&q=78';
  return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=420&q=78';
}

function googlePlaceId(place: Place): string | undefined {
  return GOOGLE_PLACE_IDS[place.id];
}

function mapsUrl(place: Place): string {
  const base = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(place.name + ', ' + place.address);
  const placeId = googlePlaceId(place);
  return placeId ? base + '&query_place_id=' + encodeURIComponent(placeId) : base;
}

function googleWriteReviewUrl(place: Place): string {
  const placeId = googlePlaceId(place);
  return placeId ? 'https://search.google.com/local/writereview?placeid=' + encodeURIComponent(placeId) : mapsUrl(place);
}

function googleReviewsLabel(): string {
  const labels: Record<LangCode, string> = { es:'Ver reseñas en Google', en:'View Google reviews', pt:'Ver avaliações no Google', fr:'Voir les avis Google', de:'Google-Bewertungen ansehen', it:'Vedi recensioni Google', zh:'查看 Google 评价', ar:'عرض مراجعات Google', ru:'Отзывы Google', hi:'Google समीक्षाएँ देखें' };
  return labels[currentLang];
}

function writeGoogleReviewLabel(): string {
  const labels: Record<LangCode, string> = { es:'Escribir reseña', en:'Write a review', pt:'Escrever avaliação', fr:'Écrire un avis', de:'Bewertung schreiben', it:'Scrivi una recensione', zh:'撰写评价', ar:'اكتب مراجعة', ru:'Оставить отзыв', hi:'समीक्षा लिखें' };
  return labels[currentLang];
}

function googleRatingHtml(place: Place): string {
  if (place.rating <= 0 || place.reviews <= 0) return '<span class="google-rating"><b>Google Maps</b><small>Ver ubicación</small></span>';
  return '<span class="google-rating"><b>Google</b><strong>★ ' + place.rating.toFixed(1) + '</strong><small>' + place.reviews.toLocaleString('es-AR') + ' reviews</small></span>';
}

function catalogLabel(): string {
  const labels: Record<LangCode, string> = {
    es: 'Ver en el catálogo',
    en: 'Open catalog',
    pt: 'Ver no catálogo',
    fr: 'Voir le catalogue',
    de: 'Katalog öffnen',
    it: 'Apri catalogo',
    zh: '打开目录',
    ar: 'فتح الكتالوج',
    ru: 'Открыть каталог',
    hi: 'कैटलॉग खोलें',
  };
  return labels[currentLang];
}

function callUrl(place: Place): string {
  return 'tel:' + place.phone.replace(/[^\d+]/g, '');
}

function openWhats(message: string, number: string = DEFAULT_WHATSAPP): void {
  window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(message), '_blank', 'noopener');
}

function openPlaceWhats(place: Place, context: 'info' | 'benefit' = 'info'): void {
  const direct = Boolean(place.whatsapp);
  const message = direct
    ? 'Hola 👋 Vi *' + place.name + '* en la guía digital de Perla Andina. ' + (context === 'benefit' ? 'Quiero consultar por el beneficio publicado en la guía.' : 'Quiero hacer una consulta.')
    : 'Hola Perla Andina 👋 Estoy viendo *' + place.name + '* en la guía digital y quiero hacer una consulta.';
  openWhats(message, place.whatsapp || DEFAULT_WHATSAPP);
}

function showToast(message: string): void {
  toast.textContent = message;
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1700);
}

function updateChrome(): void {
  document.documentElement.lang = currentLang;
  document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
  const brandSub = document.querySelector<HTMLElement>('.brand small');
  if (brandSub) brandSub.textContent = t('brand_sub');
  const langButton = document.querySelector<HTMLButtonElement>('#favShortcut');
  if (langButton) {
    langButton.textContent = flag();
    langButton.title = t('language');
  }
  const navLabels: Record<string, { icon: string; label: string }> = {
    home: { icon: '⌖', label: t('home') },
    explore: { icon: '⌕', label: t('explore') },
    map: { icon: '◎', label: t('map') },
    benefits: { icon: '◇', label: t('benefits') },
    profile: { icon: '◯', label: t('profile') },
  };
  document.querySelectorAll<HTMLButtonElement>('.bottom-nav button').forEach(button => {
    const key = button.dataset.tab || 'home';
    const item = navLabels[key];
    if (item) button.innerHTML = '<span>' + item.icon + '</span>' + item.label;
    button.classList.toggle('active', key === currentTab);
  });
}

function filteredPlaces(): Place[] {
  const q = searchTerm.trim().toLowerCase();
  return places.filter(place => {
    const groupOk = currentGroup === 'all' || placeGroups(place).includes(currentGroup);
    const subOk = currentSubcategory === 'all' || placeSubcategory(place) === currentSubcategory;
    const text = [place.name, place.address, place.description, typeLabel(place), subcategoryLabel(placeSubcategory(place)), ...place.items].join(' ').toLowerCase();
    return groupOk && subOk && (!q || text.includes(q));
  });
}

function renderHome(): string {
  return (
    '<section class="map-home">' +
      '<div class="map-shell">' +
        '<div id="map"></div>' +
        '<div class="map-top">' +
          '<div class="map-title"><span>PERLA ANDINA</span><strong>' + t('map_title') + '</strong><small>' + t('map_sub') + '</small></div>' +
          '<label class="map-search"><span>⌕</span><input id="homeSearch" value="' + searchTerm.replace(/"/g, '&quot;') + '" placeholder="' + t('search') + '"></label>' +
          filterControls('map-overlay') +
        '</div>' +
        '<button class="locate-btn" id="locateButton" title="' + t('locate') + '">◎</button>' +
        '<div class="map-legend"><span>🎁</span><div><strong>' + t('map_benefit') + '</strong><small>' + benefitStatusLabel() + '</small></div></div>' +
      '</div>' +
      '<div id="mapSelectionCard" class="map-selection-card" hidden></div>' +
      '<div class="map-after">' +
        '<div><span>' + t('places') + '</span><strong>' + filteredPlaces().length + '</strong></div>' +
        '<div><span>' + t('categories') + '</span><strong>' + (groupKeys.length - 1) + '</strong></div>' +
        '<button data-action="go-benefits">🎁 ' + t('benefits') + '</button>' +
      '</div>' +
    '</section>'
  );
}

function renderMapPage(): string {
  return (
    '<section>' +
      '<div class="page-head compact"><span>PERLA ANDINA</span><h1>' + t('map_title') + '</h1><p>' + t('map_sub') + '</p></div>' +
      '<div class="map-page-wrap"><div id="map"></div><button class="locate-btn page" id="locateButton" title="' + t('locate') + '">◎</button></div>' +
      '<div id="mapSelectionCard" class="map-selection-card page" hidden></div>' +
      filterControls('page') +
      '<div class="map-list">' +
        filteredPlaces().map(place => miniPlace(place)).join('') +
      '</div>' +
    '</section>'
  );
}

function miniPlace(place: Place): string {
  return (
    '<article class="mini-place refined" data-place="' + place.id + '">' +
      '<div class="mini-icon" style="--accent:' + place.accent + '">' + place.icon + '</div>' +
      '<div class="place-card-copy">' +
        '<div class="place-card-head"><span class="type-pill">' + subcategoryLabel(placeSubcategory(place)) + '</span>' + googleRatingHtml(place) + '</div>' +
        '<strong>' + place.name + '</strong>' +
        '<em class="place-address">📍 ' + place.address + '</em>' +
        '<small class="place-benefit">🎁 ' + benefitStatusLabel() + '</small>' +
      '</div>' +
      '<button aria-label="' + t('see_place') + '">›</button>' +
    '</article>'
  );
}

function renderExplore(): string {
  const list = filteredPlaces();
  return (
    '<section>' +
      '<div class="page-head"><span>PERLA ANDINA</span><h1>' + t('explore') + '</h1><p>' + t('map_sub') + '</p></div>' +
      '<label class="search"><span>⌕</span><input id="searchInput" value="' + searchTerm.replace(/"/g, '&quot;') + '" placeholder="' + t('search') + '"></label>' +
      filterControls('explore') +
      '<div class="list refined-list">' +
        (list.length ? list.map(place => miniPlace(place)).join('') : '<div class="empty">' + t('no_results') + '</div>') +
      '</div>' +
    '</section>'
  );
}

function renderBenefits(): string {
  return (
    '<section>' +
      '<div class="page-head"><span>PERLA ANDINA</span><h1>' + t('coupons_title') + '</h1><p>' + t('coupons_sub') + '</p></div>' +
      '<div class="notice"><strong>' + t('demo') + '</strong><br>' + t('demo_notice') + '</div>' +
      '<div class="coupons">' +
        places.map(place =>
          '<article class="coupon" style="background:linear-gradient(135deg,' + place.accent + ',#09263d)">' +
            '<div class="coupon-top"><span>' + place.icon + '</span><small>' + place.name + '</small></div>' +
            '<span class="benefit-status">' + benefitStatusLabel() + '</span>' +
            '<h3>' + benefitLabel(place) + '</h3>' +
            '<p>' + t('benefit_detail') + '</p>' +
            '<div class="coupon-foot"><span class="coupon-code">' + t('demo') + '</span><button data-coupon="' + place.id + '">' + t('consult') + '</button></div>' +
          '</article>'
        ).join('') +
      '</div>' +
    '</section>'
  );
}

function renderProfile(): string {
  const totalQty = selection.reduce((sum, row) => sum + row.qty, 0);
  return (
    '<section>' +
      '<div class="page-head"><span>PERLA ANDINA</span><h1>' + t('my_account') + '</h1></div>' +
      '<div class="profile">' +
        '<div class="profile-mark">▲</div><h2>' + t('visitor') + '</h2><p>' + t('brand_sub') + '</p>' +
        '<div class="profile-stats">' +
          '<div><strong>' + favorites.length + '</strong><span>' + t('favorites') + '</span></div>' +
          '<div><strong>' + totalQty + '</strong><span>' + t('selected') + '</span></div>' +
          '<div><strong>' + places.length + '</strong><span>' + t('allies') + '</span></div>' +
        '</div>' +
      '</div>' +
      '<button class="wide" data-action="cart">🛍️ ' + t('cart') + '</button>' +
      '<button class="wide secondary" data-action="language">🌐 ' + t('language') + '</button>' +
      '<button class="wide whatsapp-wide" data-action="contact">💬 ' + t('contact') + '</button>' +
      '<div class="notice"><strong>' + t('version') + ':</strong> ' + VERSION + '</div>' +
    '</section>'
  );
}

function render(): void {
  mapRunId += 1;
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
    markers.clear();
  }
  if (currentTab === 'home') view.innerHTML = renderHome();
  if (currentTab === 'explore') view.innerHTML = renderExplore();
  if (currentTab === 'map') view.innerHTML = renderMapPage();
  if (currentTab === 'benefits') view.innerHTML = renderBenefits();
  if (currentTab === 'profile') view.innerHTML = renderProfile();
  recordDiag('RENDER', currentTab + ' · ' + currentGroup + '/' + currentSubcategory + ' · resultados=' + filteredPlaces().length);
  updateChrome();
  bindViewEvents();
  if (currentTab === 'home' || currentTab === 'map') window.setTimeout(() => void initMap(), 80);
}

function switchTab(tab: string): void {
  recordDiag('TAB', currentTab + ' → ' + tab);
  currentTab = tab;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function bindViewEvents(): void {
  view.querySelectorAll<HTMLElement>('[data-place]').forEach(element => {
    element.addEventListener('click', () => openPlace(element.dataset.place || ''));
  });

  view.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => {
    button.addEventListener('click', () => handleAction(button.dataset.action || ''));
  });

  view.querySelectorAll<HTMLButtonElement>('[data-group]').forEach(button => {
    button.addEventListener('click', () => {
      currentGroup = button.dataset.group || 'all';
      currentSubcategory = 'all';
      recordDiag('FILTER_GROUP', currentGroup + ' · resultados=' + filteredPlaces().length);
      render();
    });
  });

  view.querySelectorAll<HTMLButtonElement>('[data-subcategory]').forEach(button => {
    button.addEventListener('click', () => {
      currentSubcategory = button.dataset.subcategory || 'all';
      recordDiag('FILTER_SUB', currentSubcategory + ' · resultados=' + filteredPlaces().length);
      render();
    });
  });

  view.querySelectorAll<HTMLButtonElement>('[data-coupon]').forEach(button => {
    button.addEventListener('click', () => useCoupon(button.dataset.coupon || ''));
  });

  const search = document.querySelector<HTMLInputElement>('#searchInput');
  if (search) {
    search.addEventListener('input', () => {
      searchTerm = search.value;
      render();
    });
  }

  const homeSearch = document.querySelector<HTMLInputElement>('#homeSearch');
  if (homeSearch) {
    homeSearch.addEventListener('change', () => {
      searchTerm = homeSearch.value;
      render();
    });
    homeSearch.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        searchTerm = homeSearch.value;
        currentTab = 'explore';
        render();
      }
    });
  }

  document.querySelector<HTMLButtonElement>('#locateButton')?.addEventListener('click', locateUser);
}

function handleAction(action: string): void {
  if (action === 'go-benefits') switchTab('benefits');
  if (action === 'cart') openSelection();
  if (action === 'language') showLanguagePicker();
  if (action === 'contact') openWhats('Hola Perla Andina 👋 Quiero información sobre El Calafate.');
}

function openSheet(html: string): void {
  sheetContent.innerHTML = html;
  sheet.classList.add('open');
  sheet.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeSheet(): void {
  sheet.classList.remove('open');
  sheet.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function openPlace(id: string): void {
  const place = places.find(item => item.id === id);
  if (!place) {
    recordDiag('OPEN_FAIL', id);
    return;
  }
  recordDiag('OPEN_PLACE', place.name + ' · ' + placeSubcategory(place));
  const sectionLabel = place.food ? t('menu') : t('services');
  const rows = place.items
    .map(item => {
      const image = productImage(place, item);
      const isPerlaTour = place.id === 'perla-andina';
      return (
        '<div class="menu-row">' +
          (image ? '<div class="product-photo"><img src="' + image + '" alt="' + item.replace(/"/g, '&quot;') + '" loading="lazy"><small>' + illustrativePhotoLabel() + '</small></div>' : '<div class="product-photo fallback"><span>' + place.icon + '</span></div>') +
          '<div class="menu-copy"><strong>' + item + '</strong><p>' + (isPerlaTour ? catalogLabel() : t('ask')) + '</p></div>' +
          '<div class="menu-side">' + (isPerlaTour ? '<a class="tour-link" href="' + CATALOG_URL + '" target="_blank" rel="noopener">↗</a>' : '<button class="add" data-add="' + place.id + '::' + item.replace(/"/g, '&quot;') + '">+</button>') + '</div>' +
        '</div>'
      );
    })
    .join('');

  openSheet(
    '<div class="place-hero" style="--accent:' + place.accent + '"><span>' + place.icon + '</span><small>' + typeLabel(place) + '</small></div>' +
    '<div class="place-info">' +
      '<div class="meta"><span>' + typeLabel(place) + '</span></div>' +
      googleRatingHtml(place) +
      '<h2>' + place.name + '</h2><p>' + place.description + '</p>' +
      '<div class="actions">' +
        '<a href="' + mapsUrl(place) + '" target="_blank" rel="noopener"><span>📍</span>' + t('route') + '</a>' +
        '<button data-place-whats="' + place.id + '"><span>💬</span>' + t('whatsapp') + '</button>' +
        (place.phone ? '<a href="' + callUrl(place) + '"><span>☎️</span>' + t('phone') + '</a>' : '') +
        '<button data-fav="' + place.id + '"><span>' + (favorites.includes(place.id) ? '♥' : '♡') + '</span>' + (favorites.includes(place.id) ? t('saved') : t('save')) + '</button>' +
      '</div>' +
      '<div class="google-review-actions"><a href="' + mapsUrl(place) + '" target="_blank" rel="noopener">🔎 ' + googleReviewsLabel() + '</a><a href="' + googleWriteReviewUrl(place) + '" target="_blank" rel="noopener">⭐ ' + writeGoogleReviewLabel() + '</a></div>' +
      '<div class="info"><strong>' + t('address') + '</strong><br>' + place.address + (place.phone ? '<br><strong>' + t('phone') + ':</strong> ' + place.phone : '') + '<br><strong>' + t('hours') + ':</strong> ' + place.hours + '</div>' +
      (place.items.length ? '<div class="menu"><h3>' + sectionLabel + '</h3>' + rows + '</div>' : '') +
      '<div class="demo-box"><span class="benefit-status">' + benefitStatusLabel() + '</span><small>' + t('demo') + '</small><h3>' + benefitLabel(place) + '</h3><p>' + t('benefit_detail') + '</p><button class="primary" data-coupon="' + place.id + '">' + t('consult') + ' · WhatsApp</button></div>' +
      '<div class="info"><strong>' + t('public_data') + '</strong><br>' + place.name + ' · ' + place.address + '</div>' +
    '</div>'
  );

  sheetContent.querySelectorAll<HTMLButtonElement>('[data-add]').forEach(button => {
    button.addEventListener('click', () => addToSelection(button.dataset.add || ''));
  });
  sheetContent.querySelectorAll<HTMLButtonElement>('[data-place-whats]').forEach(button => {
    button.addEventListener('click', () => {
      const selectedPlace = places.find(item => item.id === button.dataset.placeWhats);
      if (selectedPlace) openPlaceWhats(selectedPlace);
    });
  });
  sheetContent.querySelectorAll<HTMLButtonElement>('[data-fav]').forEach(button => {
    button.addEventListener('click', () => toggleFavorite(button.dataset.fav || ''));
  });
  sheetContent.querySelectorAll<HTMLButtonElement>('[data-coupon]').forEach(button => {
    button.addEventListener('click', () => useCoupon(button.dataset.coupon || ''));
  });
}

function toggleFavorite(id: string): void {
  favorites = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
  localStorage.setItem('pa-favorites', JSON.stringify(favorites));
  showToast(favorites.includes(id) ? t('favorite_added') : t('favorite_removed'));
  openPlace(id);
}

function addToSelection(key: string): void {
  const splitIndex = key.indexOf('::');
  if (splitIndex < 0) return;
  const placeId = key.slice(0, splitIndex);
  const item = key.slice(splitIndex + 2);
  const row = selection.find(entry => entry.placeId === placeId && entry.item === item);
  if (row) row.qty += 1;
  else selection.push({ placeId, item, qty: 1 });
  localStorage.setItem('pa-selection', JSON.stringify(selection));
  showToast(t('added'));
}

function openSelection(): void {
  if (!selection.length) {
    openSheet('<span class="modal-kicker">' + t('cart') + '</span><h2>' + t('selected') + '</h2><div class="empty">' + t('empty_cart') + '</div>');
    return;
  }

  const rows = selection
    .map(row => {
      const place = places.find(item => item.id === row.placeId);
      if (!place) return '';
      return (
        '<div class="cart-row"><div><strong>' + row.item + '</strong><small>' + place.name + '</small></div>' +
        '<div class="qty"><button data-minus="' + place.id + '::' + row.item.replace(/"/g, '&quot;') + '">−</button><b>' + row.qty + '</b><button data-plus="' + place.id + '::' + row.item.replace(/"/g, '&quot;') + '">+</button></div>' +
        '<button data-remove="' + place.id + '::' + row.item.replace(/"/g, '&quot;') + '">×</button></div>'
      );
    })
    .join('');

  openSheet('<span class="modal-kicker">' + t('cart') + '</span><h2>' + t('selected') + '</h2>' + rows + '<button class="whatsapp" id="sendSelection">' + t('send_whatsapp') + '</button>');

  sheetContent.querySelectorAll<HTMLButtonElement>('[data-minus]').forEach(button => {
    button.addEventListener('click', () => changeSelection(button.dataset.minus || '', -1));
  });
  sheetContent.querySelectorAll<HTMLButtonElement>('[data-plus]').forEach(button => {
    button.addEventListener('click', () => changeSelection(button.dataset.plus || '', 1));
  });
  sheetContent.querySelectorAll<HTMLButtonElement>('[data-remove]').forEach(button => {
    button.addEventListener('click', () => removeSelection(button.dataset.remove || ''));
  });
  document.querySelector<HTMLButtonElement>('#sendSelection')?.addEventListener('click', sendSelection);
}

function splitSelectionKey(key: string): { placeId: string; item: string } | null {
  const splitIndex = key.indexOf('::');
  if (splitIndex < 0) return null;
  return { placeId: key.slice(0, splitIndex), item: key.slice(splitIndex + 2) };
}

function changeSelection(key: string, delta: number): void {
  const parsed = splitSelectionKey(key);
  if (!parsed) return;
  const row = selection.find(entry => entry.placeId === parsed.placeId && entry.item === parsed.item);
  if (!row) return;
  row.qty += delta;
  if (row.qty <= 0) selection = selection.filter(entry => entry !== row);
  localStorage.setItem('pa-selection', JSON.stringify(selection));
  openSelection();
}

function removeSelection(key: string): void {
  const parsed = splitSelectionKey(key);
  if (!parsed) return;
  selection = selection.filter(entry => !(entry.placeId === parsed.placeId && entry.item === parsed.item));
  localStorage.setItem('pa-selection', JSON.stringify(selection));
  openSelection();
}

function sendSelection(): void {
  const uniquePlaceIds = [...new Set(selection.map(row => row.placeId))];
  const singlePlace = uniquePlaceIds.length === 1 ? places.find(place => place.id === uniquePlaceIds[0]) : undefined;
  const direct = Boolean(singlePlace?.whatsapp);
  const lines = [direct ? 'Hola 👋 Vi su negocio en la guía digital de Perla Andina.' : 'Hola Perla Andina 👋', 'Quiero consultar esta selección:', ''];
  selection.forEach(row => {
    const place = places.find(item => item.id === row.placeId);
    if (place) lines.push('• ' + row.qty + 'x ' + row.item + ' — ' + place.name);
  });
  lines.push('', '¿Me confirman disponibilidad y valores?');
  openWhats(lines.join('\n'), singlePlace?.whatsapp || DEFAULT_WHATSAPP);
}

function useCoupon(id: string): void {
  const place = places.find(item => item.id === id);
  if (!place) return;
  openPlaceWhats(place, 'benefit');
}

function markerHtml(place: Place): string {
  const featuredClass = place.id === 'perla-andina' ? ' perla-marker' : '';
  const badge = place.id === 'perla-andina' ? '★' : '🎁';
  return '<div class="pa-marker' + featuredClass + '" style="--accent:' + place.accent + '"><span>' + place.icon + '</span><b>' + badge + '</b>' + (place.id === 'perla-andina' ? '<em>PERLA</em>' : '') + '</div>';
}

function placePopup(place: Place): string {
  return (
    '<div class="map-popup">' +
      '<div class="map-popup-title"><span>' + place.icon + '</span><div><strong>' + place.name + '</strong><small>' + typeLabel(place) + '</small>' + googleRatingHtml(place) + '<em>' + place.address + '</em></div></div>' +
      '<div class="map-popup-benefit">🎁 <b>' + benefitLabel(place) + '</b><small class="benefit-status-inline">' + benefitStatusLabel() + '</small></div>' +
      '<div class="map-card-actions"><button class="map-open" data-map-open="' + place.id + '">' + t('see_place') + '</button><a class="map-route" href="' + mapsUrl(place) + '" target="_blank" rel="noopener">📍 ' + t('route') + '</a><button class="map-whats" data-map-whats="' + place.id + '">💬 ' + t('whatsapp') + '</button><a class="map-review" href="' + googleWriteReviewUrl(place) + '" target="_blank" rel="noopener">⭐ ' + writeGoogleReviewLabel() + '</a></div>' +
    '</div>'
  );
}

function showMapPlaceCard(place: Place): void {
  const card = document.querySelector<HTMLElement>('#mapSelectionCard');
  if (!card) return;
  card.innerHTML = placePopup(place);
  card.hidden = false;
  card.querySelector<HTMLButtonElement>('[data-map-open="' + place.id + '"]')?.addEventListener('click', () => openPlace(place.id));
  card.querySelector<HTMLButtonElement>('[data-map-whats="' + place.id + '"]')?.addEventListener('click', () => openPlaceWhats(place));
  window.setTimeout(() => card.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 40);
}

function addMarker(place: Place): void {
  if (!mapInstance || place.lat === null || place.lng === null || markers.has(place.id)) return;
  const featured = place.id === 'perla-andina';
  const icon = L.divIcon({
    className: 'pa-marker-wrap',
    html: markerHtml(place),
    iconSize: featured ? [68, 72] : [46, 52],
    iconAnchor: featured ? [34, 66] : [23, 48],
    popupAnchor: [0, featured ? -61 : -45],
  });
  const marker = L.marker([place.lat, place.lng], { icon }).addTo(mapInstance);
  marker.on('click', () => {
    showMapPlaceCard(place);
    mapInstance.panTo([place.lat, place.lng]);
  });
  markers.set(place.id, marker);
  recordDiag('MARKER', place.name + ' · total=' + markers.size);
  refreshDiagnosticPanel();
}


function fitMapToCurrentMarkers(): void {
  if (!mapInstance) return;
  if (currentGroup === 'all') return;
  if (currentGroup === 'tourism' && currentSubcategory === 'all') return;
  const points = filteredPlaces()
    .filter(place => place.lat !== null && place.lng !== null)
    .map(place => [place.lat as number, place.lng as number]);
  if (!points.length) return;
  if (points.length === 1) {
    mapInstance.setView(points[0], 15);
    recordDiag('MAP_FIT', '1 punto');
    return;
  }
  mapInstance.fitBounds(points, { padding: [46, 46], maxZoom: 14 });
  recordDiag('MAP_FIT', points.length + ' puntos');
}

async function ensureCoordinates(place: Place): Promise<boolean> {
  if (place.lat !== null && place.lng !== null) return true;
  const cacheKey = 'pa-geo-' + place.id;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as { lat: number; lng: number };
      place.lat = parsed.lat;
      place.lng = parsed.lng;
      recordDiag('GEO_CACHE', place.name);
      return true;
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  const queries = [
    place.name + ', ' + place.address + ', Argentina',
    place.address + ', Argentina',
  ];

  for (const rawQuery of queries) {
    try {
      const query = encodeURIComponent(rawQuery);
      const response = await fetch('https://photon.komoot.io/api/?limit=1&q=' + query);
      if (response.ok) {
        const data = await response.json() as { features?: Array<{ geometry?: { coordinates?: [number, number] } }> };
        const coords = data.features?.[0]?.geometry?.coordinates;
        if (coords && Number.isFinite(coords[0]) && Number.isFinite(coords[1])) {
          place.lng = Number(coords[0]);
          place.lat = Number(coords[1]);
          localStorage.setItem(cacheKey, JSON.stringify({ lat: place.lat, lng: place.lng }));
          recordDiag('GEO_OK', place.name + ' · Photon');
          return true;
        }
      } else {
        recordDiag('GEO_HTTP', place.name + ' · Photon ' + response.status);
      }
    } catch (error) {
      recordDiag('GEO_ERR', place.name + ' · Photon · ' + String(error));
    }
  }

  try {
    const query = encodeURIComponent(place.name + ', ' + place.address + ', Argentina');
    const response = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ar&q=' + query, {
      headers: { 'Accept-Language': 'es' },
    });
    if (!response.ok) {
      recordDiag('GEO_HTTP', place.name + ' · Nominatim ' + response.status);
      return false;
    }
    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (data[0]) {
      place.lat = Number(data[0].lat);
      place.lng = Number(data[0].lon);
      localStorage.setItem(cacheKey, JSON.stringify({ lat: place.lat, lng: place.lng }));
      recordDiag('GEO_OK', place.name + ' · Nominatim');
      return true;
    }
  } catch (error) {
    recordDiag('GEO_ERR', place.name + ' · Nominatim · ' + String(error));
  }

  recordDiag('GEO_FAIL', place.name);
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function geocodeMissing(runId: number, targets: Place[]): Promise<void> {
  const pending = targets.filter(place => place.lat === null || place.lng === null);
  recordDiag('MAP_QUEUE', pending.length + ' pendientes de ' + targets.length);
  if (!pending.length) {
    fitMapToCurrentMarkers();
    refreshDiagnosticPanel();
    return;
  }

  const queue = [...pending];
  const worker = async (): Promise<void> => {
    while (queue.length && runId === mapRunId) {
      const place = queue.shift();
      if (!place) return;
      const ok = await ensureCoordinates(place);
      if (runId !== mapRunId) return;
      if (ok) addMarker(place);
      refreshDiagnosticPanel();
      await sleep(180);
    }
  };

  const workers = Math.min(3, pending.length);
  await Promise.all(Array.from({ length: workers }, () => worker()));
  if (runId !== mapRunId) {
    recordDiag('MAP_CANCEL', 'Carga anterior cancelada');
    return;
  }
  recordDiag('MAP_DONE', markers.size + '/' + targets.length + ' markers cargados');
  fitMapToCurrentMarkers();
  refreshDiagnosticPanel();
}

async function initMap(): Promise<void> {
  const runId = ++mapRunId;
  if (typeof L === 'undefined') {
    showToast(t('map_error'));
    recordDiag('MAP_ERROR', 'Leaflet no disponible');
    return;
  }
  const mapNode = document.querySelector('#map');
  if (!mapNode) {
    recordDiag('MAP_ERROR', '#map no existe');
    return;
  }

  const targets = filteredPlaces();
  recordDiag('MAP_INIT', 'run=' + runId + ' · esperados=' + targets.length + ' · ' + currentGroup + '/' + currentSubcategory);
  mapInstance = L.map('map', { zoomControl: false, attributionControl: true }).setView([-50.3372, -72.2638], 15);
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(mapInstance);

  targets.forEach(addMarker);
  recordDiag('MAP_IMMEDIATE', markers.size + '/' + targets.length + ' markers con coordenadas');
  window.setTimeout(fitMapToCurrentMarkers, 120);
  void geocodeMissing(runId, targets);
}

function locateUser(): void {
  if (!navigator.geolocation || !mapInstance) return;
  navigator.geolocation.getCurrentPosition(position => {
    const coords: [number, number] = [position.coords.latitude, position.coords.longitude];
    if (userMarker) userMarker.remove();
    userMarker = L.circleMarker(coords, {
      radius: 8,
      color: '#ffffff',
      weight: 3,
      fillColor: '#079ac3',
      fillOpacity: 1,
    }).addTo(mapInstance);
    mapInstance.setView(coords, 16);
  });
}

function showLanguagePicker(): void {
  let modal = document.querySelector<HTMLElement>('#languagePicker');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'languagePicker';
    modal.className = 'language-picker';
    document.body.appendChild(modal);
  }
  modal.innerHTML =
    '<div class="language-panel">' +
      '<div class="language-brand"><div class="language-logo">▲</div><div><b>PERLA ANDINA</b><span>EL CALAFATE</span></div></div>' +
      '<h2>' + t('choose_language') + '</h2><p>' + t('choose_language_sub') + '</p>' +
      '<div class="language-grid">' +
        languages.map(language =>
          '<button data-lang="' + language.code + '" class="' + (language.code === currentLang ? 'selected' : '') + '"><span>' + language.flag + '</span><b>' + language.name + '</b></button>'
        ).join('') +
      '</div>' +
    '</div>';
  modal.classList.add('open');
  modal.querySelectorAll<HTMLButtonElement>('[data-lang]').forEach(button => {
    button.addEventListener('click', () => {
      currentLang = button.dataset.lang as LangCode;
      localStorage.setItem('pa-language', currentLang);
      modal?.classList.remove('open');
      updateChrome();
      render();
    });
  });
}

document.querySelectorAll<HTMLButtonElement>('.bottom-nav button').forEach(button => {
  button.addEventListener('click', () => switchTab(button.dataset.tab || 'home'));
});

document.querySelector<HTMLButtonElement>('#brandHome')?.addEventListener('click', () => switchTab('home'));
document.querySelector<HTMLButtonElement>('#favShortcut')?.addEventListener('click', showLanguagePicker);
document.querySelector<HTMLElement>('.sheet-backdrop')?.addEventListener('click', closeSheet);
document.querySelector<HTMLButtonElement>('.sheet-close')?.addEventListener('click', closeSheet);

installDiagnostics();
updateChrome();
render();
showLanguagePicker();
