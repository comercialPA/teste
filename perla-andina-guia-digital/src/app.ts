declare const L: any;

type LangCode = 'es' | 'en' | 'pt' | 'fr' | 'de' | 'it' | 'zh' | 'ar' | 'ru' | 'hi';
type BenefitKind = 'wine' | 'starter' | 'dessert' | 'discount' | 'twoforone' | 'coffee' | 'gift';
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

const VERSION = '1.0.6 perla andina';
const DEFAULT_WHATSAPP = '5492901498474';

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
];

const categoryKeys = [
  'all',
  'type_agency',
  'type_quick',
  'type_grill',
  'type_pasta',
  'type_icecream',
  'type_pizza',
  'type_bakery',
  'type_coffee',
  'type_taxi',
  'type_disco',
  'type_brewery',
  'type_souvenir',
  'type_pharmacy',
  'type_hotel',
];

let currentLang: LangCode = (localStorage.getItem('pa-language') as LangCode) || 'es';
let currentTab = 'home';
let currentCategory = 'all';
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

function t(key: string): string {
  return copy[currentLang][key] || copy.es[key] || key;
}

function flag(): string {
  return languages.find(item => item.code === currentLang)?.flag || '🌐';
}

function typeLabel(place: Place): string {
  return t(place.typeKey);
}

function benefitLabel(place: Place): string {
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
  return '<span class="google-rating"><b>Google</b><strong>★ ' + place.rating.toFixed(1) + '</strong><small>' + place.reviews.toLocaleString('es-AR') + ' reviews</small></span>';
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

function categoryChips(): string {
  return categoryKeys
    .map(key => {
      const label = key === 'all' ? t('all') : t(key);
      return '<button data-category="' + key + '" class="' + (currentCategory === key ? 'active' : '') + '">' + label + '</button>';
    })
    .join('');
}

function filteredPlaces(): Place[] {
  const q = searchTerm.trim().toLowerCase();
  return places.filter(place => {
    const categoryOk = currentCategory === 'all' || place.typeKey === currentCategory;
    const text = [place.name, place.address, place.description, typeLabel(place), ...place.items].join(' ').toLowerCase();
    return categoryOk && (!q || text.includes(q));
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
          '<div class="map-chips">' + categoryChips() + '</div>' +
        '</div>' +
        '<button class="locate-btn" id="locateButton" title="' + t('locate') + '">◎</button>' +
        '<div class="map-legend"><span>🎁</span><div><strong>' + t('map_benefit') + '</strong><small>' + benefitStatusLabel() + '</small></div></div>' +
      '</div>' +
      '<div id="mapSelectionCard" class="map-selection-card" hidden></div>' +
      '<div class="map-after">' +
        '<div><span>' + t('places') + '</span><strong>' + filteredPlaces().length + '</strong></div>' +
        '<div><span>' + t('categories') + '</span><strong>' + (categoryKeys.length - 1) + '</strong></div>' +
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
      '<div class="map-chips page">' + categoryChips() + '</div>' +
      '<div class="map-list">' +
        filteredPlaces().map(place => miniPlace(place)).join('') +
      '</div>' +
    '</section>'
  );
}

function miniPlace(place: Place): string {
  return (
    '<article class="mini-place" data-place="' + place.id + '">' +
      '<div class="mini-icon" style="--accent:' + place.accent + '">' + place.icon + '</div>' +
      '<div><strong>' + place.name + '</strong><span>' + typeLabel(place) + '</span>' + googleRatingHtml(place) + '<small>🎁 ' + benefitLabel(place) + ' <b class="benefit-status-inline">' + benefitStatusLabel() + '</b></small></div>' +
      '<button>›</button>' +
    '</article>'
  );
}

function renderExplore(): string {
  const list = filteredPlaces();
  return (
    '<section>' +
      '<div class="page-head"><span>PERLA ANDINA</span><h1>' + t('explore') + '</h1><p>' + t('map_sub') + '</p></div>' +
      '<label class="search"><span>⌕</span><input id="searchInput" value="' + searchTerm.replace(/"/g, '&quot;') + '" placeholder="' + t('search') + '"></label>' +
      '<div class="chips">' + categoryChips() + '</div>' +
      '<div class="list">' +
        (list.length
          ? list.map(place =>
            '<article class="list-card" data-place="' + place.id + '">' +
              '<div class="list-art" style="--accent:' + place.accent + '">' + place.icon + '</div>' +
              '<div><h3>' + place.name + '</h3><div class="meta"><span>' + typeLabel(place) + '</span></div>' + googleRatingHtml(place) + '<p>' + place.address + '</p><small class="benefit-line">🎁 ' + benefitLabel(place) + ' <b class="benefit-status-inline">' + benefitStatusLabel() + '</b></small></div>' +
              '<button class="arrow">›</button>' +
            '</article>'
          ).join('')
          : '<div class="empty">' + t('no_results') + '</div>') +
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
  updateChrome();
  bindViewEvents();
  if (currentTab === 'home' || currentTab === 'map') window.setTimeout(() => void initMap(), 80);
}

function switchTab(tab: string): void {
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

  view.querySelectorAll<HTMLButtonElement>('[data-category]').forEach(button => {
    button.addEventListener('click', () => {
      currentCategory = button.dataset.category || 'all';
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
  if (!place) return;
  const sectionLabel = place.food ? t('menu') : t('services');
  const rows = place.items
    .map(item => {
      const image = productImage(place, item);
      return (
        '<div class="menu-row">' +
          (image ? '<div class="product-photo"><img src="' + image + '" alt="' + item.replace(/"/g, '&quot;') + '" loading="lazy"><small>' + illustrativePhotoLabel() + '</small></div>' : '<div class="product-photo fallback"><span>' + place.icon + '</span></div>') +
          '<div class="menu-copy"><strong>' + item + '</strong><p>' + t('ask') + '</p></div>' +
          '<div class="menu-side"><button class="add" data-add="' + place.id + '::' + item.replace(/"/g, '&quot;') + '">+</button></div>' +
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
        '<a href="' + callUrl(place) + '"><span>☎️</span>' + t('phone') + '</a>' +
        '<button data-fav="' + place.id + '"><span>' + (favorites.includes(place.id) ? '♥' : '♡') + '</span>' + (favorites.includes(place.id) ? t('saved') : t('save')) + '</button>' +
      '</div>' +
      '<div class="google-review-actions"><a href="' + mapsUrl(place) + '" target="_blank" rel="noopener">🔎 ' + googleReviewsLabel() + '</a><a href="' + googleWriteReviewUrl(place) + '" target="_blank" rel="noopener">⭐ ' + writeGoogleReviewLabel() + '</a></div>' +
      '<div class="info"><strong>' + t('address') + '</strong><br>' + place.address + '<br><strong>' + t('phone') + ':</strong> ' + place.phone + '<br><strong>' + t('hours') + ':</strong> ' + place.hours + '</div>' +
      '<div class="menu"><h3>' + sectionLabel + '</h3>' + rows + '</div>' +
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
}

async function ensureCoordinates(place: Place): Promise<void> {
  if (place.lat !== null && place.lng !== null) return;
  const cacheKey = 'pa-geo-' + place.id;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as { lat: number; lng: number };
      place.lat = parsed.lat;
      place.lng = parsed.lng;
      return;
    } catch {
      localStorage.removeItem(cacheKey);
    }
  }

  try {
    const query = encodeURIComponent(place.address + ', Argentina');
    const response = await fetch('https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=ar&q=' + query, {
      headers: { 'Accept-Language': 'es' },
    });
    if (!response.ok) return;
    const data = (await response.json()) as Array<{ lat: string; lon: string }>;
    if (data[0]) {
      place.lat = Number(data[0].lat);
      place.lng = Number(data[0].lon);
      localStorage.setItem(cacheKey, JSON.stringify({ lat: place.lat, lng: place.lng }));
    }
  } catch {
    return;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function geocodeMissing(): Promise<void> {
  for (const place of filteredPlaces()) {
    if (place.lat === null || place.lng === null) {
      await ensureCoordinates(place);
      addMarker(place);
      await sleep(1100);
    }
  }
}

async function initMap(): Promise<void> {
  if (typeof L === 'undefined') {
    showToast(t('map_error'));
    return;
  }
  const mapNode = document.querySelector('#map');
  if (!mapNode) return;

  mapInstance = L.map('map', { zoomControl: false, attributionControl: true }).setView([-50.3372, -72.2638], 15);
  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap',
  }).addTo(mapInstance);

  filteredPlaces().forEach(addMarker);
  void geocodeMissing();
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

updateChrome();
render();
showLanguagePicker();
