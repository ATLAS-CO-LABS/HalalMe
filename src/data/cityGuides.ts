export interface CityAttraction {
  id: string;
  name: string;
  description: string;
  category: "landmark" | "mosque" | "restaurant" | "shopping" | "nature";
  isHalalFriendly: boolean;
}

export interface Mosque {
  name: string;
  address: string;
  description: string;
}

export interface HalalRestaurant {
  name: string;
  cuisine: string;
  priceRange: "$" | "$$" | "$$$";
  rating: number;
}

export interface CityGuide {
  id: string;
  slug: string;
  name: string;
  country: string;
  heroImage: string;
  description: string;
  halalScore: number;
  overview: string;
  bestTimeToVisit: string;
  language: string;
  currency: string;
  timezone: string;
  halalInfo: {
    mosquesCount: number;
    halalRestaurantsCount: string;
    prayerFacilitiesAvailable: boolean;
    muslimPopulationPercent: number;
    tips: string[];
  };
  attractions: CityAttraction[];
  mosques: Mosque[];
  halalRestaurants: HalalRestaurant[];
  travelTips: string[];
  flightPriceFrom: number;
  hotelPriceFrom: number;
  currency_display: string;
}

export interface TravelTip {
  id: string;
  title: string;
  description: string;
  category: "packing" | "safety" | "halal" | "budget" | "culture" | "prayer";
  icon: string;
}

export const cityGuides: CityGuide[] = [
  {
    id: "istanbul",
    slug: "istanbul",
    name: "Istanbul",
    country: "Turkey",
    heroImage: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200",
    description: "Where East meets West - a city of stunning mosques, rich history, and delicious halal cuisine.",
    halalScore: 5,
    overview: "Istanbul is a Muslim traveler's dream destination. As the former capital of the Ottoman Empire, the city is home to some of the world's most magnificent mosques, including the iconic Blue Mosque and Hagia Sophia. With a 98% Muslim population, finding halal food is effortless, and the adhan echoes across the city five times daily. From the historic Sultanahmet to the trendy Karakoy, Istanbul offers an unforgettable blend of history, culture, and modernity.",
    bestTimeToVisit: "April to May and September to November for pleasant weather and fewer crowds.",
    language: "Turkish",
    currency: "Turkish Lira (TRY)",
    timezone: "GMT+3",
    halalInfo: {
      mosquesCount: 3000,
      halalRestaurantsCount: "Almost all restaurants",
      prayerFacilitiesAvailable: true,
      muslimPopulationPercent: 98,
      tips: [
        "Most restaurants serve halal food by default",
        "The adhan is called 5 times daily across the city",
        "Modest dress is recommended when visiting mosques",
        "Many hotels have prayer mats available on request",
        "Friday prayers at the Blue Mosque are a special experience",
      ],
    },
    attractions: [
      { id: "hagia-sophia", name: "Hagia Sophia", description: "Former church turned mosque, an architectural masterpiece", category: "mosque", isHalalFriendly: true },
      { id: "blue-mosque", name: "Blue Mosque", description: "Stunning mosque with six minarets and beautiful blue tiles", category: "mosque", isHalalFriendly: true },
      { id: "grand-bazaar", name: "Grand Bazaar", description: "One of the oldest covered markets in the world", category: "shopping", isHalalFriendly: true },
      { id: "topkapi-palace", name: "Topkapi Palace", description: "Former residence of Ottoman sultans", category: "landmark", isHalalFriendly: true },
      { id: "bosphorus", name: "Bosphorus Cruise", description: "Scenic boat trip between Europe and Asia", category: "nature", isHalalFriendly: true },
    ],
    mosques: [
      { name: "Sultan Ahmed Mosque (Blue Mosque)", address: "Sultan Ahmet, Atmeydani Cd. No:7, Fatih", description: "The most famous mosque in Istanbul with stunning blue interior tiles." },
      { name: "Hagia Sophia Grand Mosque", address: "Sultan Ahmet, Ayasofya Meydani No:1, Fatih", description: "Historic mosque that was once a church, featuring Byzantine architecture." },
      { name: "Suleymaniye Mosque", address: "Suleymaniye, Prof. Siddik Sami Onar Cd. No:1, Fatih", description: "Ottoman imperial mosque with panoramic city views." },
      { name: "Eyup Sultan Mosque", address: "Eyup, Cami Kebir Cd., Eyupsultan", description: "One of the holiest sites in Istanbul, home to Abu Ayyub al-Ansari's tomb." },
    ],
    halalRestaurants: [
      { name: "Nusr-Et Steakhouse", cuisine: "Turkish Steakhouse", priceRange: "$$$", rating: 4.5 },
      { name: "Hafiz Mustafa 1864", cuisine: "Turkish Desserts & Cafe", priceRange: "$$", rating: 4.7 },
      { name: "Karakoy Lokantasi", cuisine: "Traditional Turkish", priceRange: "$$", rating: 4.4 },
      { name: "Ciya Sofrasi", cuisine: "Anatolian", priceRange: "$$", rating: 4.6 },
    ],
    travelTips: [
      "Get an Istanbulkart for easy public transport",
      "Visit mosques between prayer times for a quieter experience",
      "Bargaining is expected at the Grand Bazaar",
      "Try traditional Turkish breakfast (kahvalti)",
      "Book Bosphorus sunset cruise in advance",
    ],
    flightPriceFrom: 89,
    hotelPriceFrom: 45,
    currency_display: "GBP",
  },
  {
    id: "dubai",
    slug: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    heroImage: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200",
    description: "A dazzling metropolis of luxury, innovation, and Islamic heritage in the Arabian Gulf.",
    halalScore: 5,
    overview: "Dubai is a Muslim-friendly paradise that seamlessly blends ultra-modern luxury with Islamic traditions. As an Islamic city, everything from food to facilities caters to Muslim travelers. Marvel at the world's tallest building, shop in extravagant malls, experience desert safaris, and enjoy world-class halal dining. During Ramadan, the city comes alive with special iftar experiences and a unique spiritual atmosphere.",
    bestTimeToVisit: "November to March for cooler temperatures. Ramadan offers a unique spiritual experience.",
    language: "Arabic (English widely spoken)",
    currency: "UAE Dirham (AED)",
    timezone: "GMT+4",
    halalInfo: {
      mosquesCount: 1500,
      halalRestaurantsCount: "All restaurants (by law)",
      prayerFacilitiesAvailable: true,
      muslimPopulationPercent: 76,
      tips: [
        "All food in Dubai is halal by law",
        "Prayer rooms available in all malls and public places",
        "Alcohol is only served in licensed venues",
        "Modest dress is appreciated in public areas",
        "Friday is the holy day - many businesses close for Jummah",
      ],
    },
    attractions: [
      { id: "burj-khalifa", name: "Burj Khalifa", description: "World's tallest building with stunning observation decks", category: "landmark", isHalalFriendly: true },
      { id: "jumeirah-mosque", name: "Jumeirah Mosque", description: "Beautiful mosque open to non-Muslim visitors", category: "mosque", isHalalFriendly: true },
      { id: "dubai-mall", name: "Dubai Mall", description: "World's largest shopping mall with endless entertainment", category: "shopping", isHalalFriendly: true },
      { id: "desert-safari", name: "Desert Safari", description: "Thrilling dune bashing and traditional Bedouin camp experience", category: "nature", isHalalFriendly: true },
      { id: "gold-souk", name: "Gold Souk", description: "Traditional market with dazzling gold jewelry", category: "shopping", isHalalFriendly: true },
    ],
    mosques: [
      { name: "Jumeirah Mosque", address: "Jumeirah Beach Road, Jumeirah 1", description: "Beautiful mosque offering guided tours for non-Muslims." },
      { name: "Al Farooq Omar Bin Al Khattab Mosque", address: "Al Safa 1, Dubai", description: "Largest mosque in Dubai, inspired by the Blue Mosque." },
      { name: "Grand Bur Dubai Masjid", address: "Ali Bin Abi Taleb Street, Bur Dubai", description: "Historic mosque in the old part of Dubai." },
    ],
    halalRestaurants: [
      { name: "Al Mahara", cuisine: "Seafood", priceRange: "$$$", rating: 4.8 },
      { name: "Arabian Tea House", cuisine: "Emirati", priceRange: "$$", rating: 4.6 },
      { name: "Ravi Restaurant", cuisine: "Pakistani", priceRange: "$", rating: 4.5 },
      { name: "Pierchic", cuisine: "Seafood", priceRange: "$$$", rating: 4.7 },
    ],
    travelTips: [
      "Use the Dubai Metro for easy, air-conditioned travel",
      "Book Burj Khalifa tickets online to avoid queues",
      "Dress modestly in public areas and malls",
      "Try traditional Emirati cuisine at heritage restaurants",
      "Visit during Dubai Shopping Festival for great deals",
    ],
    flightPriceFrom: 199,
    hotelPriceFrom: 75,
    currency_display: "GBP",
  },
  {
    id: "kuala-lumpur",
    slug: "kuala-lumpur",
    name: "Kuala Lumpur",
    country: "Malaysia",
    heroImage: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=1200",
    description: "A vibrant multicultural capital where stunning architecture meets incredible halal street food.",
    halalScore: 5,
    overview: "Kuala Lumpur is consistently ranked as one of the world's most Muslim-friendly destinations. As the capital of Malaysia, a Muslim-majority country, finding halal food and prayer facilities is incredibly easy. The city offers an amazing mix of modern skyscrapers like the Petronas Towers, beautiful mosques, diverse cuisine, and affordable shopping. The food scene is legendary, with halal street food available on almost every corner.",
    bestTimeToVisit: "May to July and December to February for drier weather.",
    language: "Malay (English widely spoken)",
    currency: "Malaysian Ringgit (MYR)",
    timezone: "GMT+8",
    halalInfo: {
      mosquesCount: 500,
      halalRestaurantsCount: "Majority of restaurants",
      prayerFacilitiesAvailable: true,
      muslimPopulationPercent: 61,
      tips: [
        "Look for 'JAKIM Halal' certification for guaranteed halal food",
        "Surau (prayer rooms) available in most malls and buildings",
        "Street food is generally halal but check for certification",
        "Many hotels provide prayer mats and Quran",
        "Visit Islamic Arts Museum for cultural enrichment",
      ],
    },
    attractions: [
      { id: "petronas", name: "Petronas Twin Towers", description: "Iconic twin skyscrapers with sky bridge and observation deck", category: "landmark", isHalalFriendly: true },
      { id: "masjid-negara", name: "Masjid Negara", description: "Malaysia's national mosque with stunning modern architecture", category: "mosque", isHalalFriendly: true },
      { id: "batu-caves", name: "Batu Caves", description: "Limestone caves with Hindu temples and 272 steps", category: "landmark", isHalalFriendly: true },
      { id: "jalan-alor", name: "Jalan Alor", description: "Famous street food haven with diverse halal options", category: "restaurant", isHalalFriendly: true },
      { id: "islamic-arts", name: "Islamic Arts Museum", description: "Stunning museum showcasing Islamic art and architecture", category: "landmark", isHalalFriendly: true },
    ],
    mosques: [
      { name: "Masjid Negara (National Mosque)", address: "Jalan Perdana, Tasik Perdana", description: "Malaysia's national mosque with capacity for 15,000 worshippers." },
      { name: "Masjid Jamek", address: "Jalan Tun Perak", description: "One of KL's oldest mosques at the confluence of two rivers." },
      { name: "Masjid Wilayah Persekutuan", address: "Jalan Duta", description: "Federal Territory Mosque with Ottoman-inspired architecture." },
      { name: "Masjid As-Syakirin KLCC", address: "KLCC Park, Jalan Ampang", description: "Beautiful mosque inside KLCC Park near Petronas Towers." },
    ],
    halalRestaurants: [
      { name: "Nasi Kandar Pelita", cuisine: "Malaysian", priceRange: "$", rating: 4.4 },
      { name: "Restoran Rebung", cuisine: "Traditional Malay", priceRange: "$$", rating: 4.5 },
      { name: "Village Park Restaurant", cuisine: "Nasi Lemak", priceRange: "$", rating: 4.7 },
      { name: "Marini's on 57", cuisine: "Italian", priceRange: "$$$", rating: 4.6 },
    ],
    travelTips: [
      "Get a Touch n Go card for easy payments and transport",
      "Try Nasi Lemak - the national dish - for breakfast",
      "Visit malls during the day to escape the heat",
      "Grab drivers are reliable and affordable",
      "Shopping is excellent at Bukit Bintang area",
    ],
    flightPriceFrom: 349,
    hotelPriceFrom: 40,
    currency_display: "GBP",
  },
  {
    id: "london",
    slug: "london",
    name: "London",
    country: "United Kingdom",
    heroImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200",
    description: "A diverse global city with a thriving Muslim community and countless halal dining options.",
    halalScore: 4,
    overview: "London is one of the most Muslim-friendly cities in Europe, home to a vibrant Muslim community of over 1 million people. From the iconic East London Mosque to halal restaurants in every cuisine imaginable, Muslim travelers will feel right at home. The city offers world-class museums, historic landmarks, and diverse neighborhoods like Whitechapel and Edgware Road that cater specifically to Muslim visitors.",
    bestTimeToVisit: "May to September for warmer weather and longer days.",
    language: "English",
    currency: "British Pound (GBP)",
    timezone: "GMT/BST",
    halalInfo: {
      mosquesCount: 1000,
      halalRestaurantsCount: "Thousands across the city",
      prayerFacilitiesAvailable: true,
      muslimPopulationPercent: 12,
      tips: [
        "Edgware Road and Whitechapel have many halal restaurants",
        "Most museums have prayer rooms available",
        "Use apps like Halal Gems to find certified restaurants",
        "Many supermarkets have halal meat sections",
        "Friday prayers at East London Mosque attract thousands",
      ],
    },
    attractions: [
      { id: "big-ben", name: "Big Ben & Parliament", description: "Iconic clock tower and Houses of Parliament", category: "landmark", isHalalFriendly: true },
      { id: "british-museum", name: "British Museum", description: "World-famous museum with incredible Islamic art collection", category: "landmark", isHalalFriendly: true },
      { id: "tower-london", name: "Tower of London", description: "Historic castle and home of the Crown Jewels", category: "landmark", isHalalFriendly: true },
      { id: "regents-park", name: "London Central Mosque", description: "Beautiful mosque in Regent's Park", category: "mosque", isHalalFriendly: true },
      { id: "camden-market", name: "Camden Market", description: "Eclectic market with diverse food stalls", category: "shopping", isHalalFriendly: true },
    ],
    mosques: [
      { name: "London Central Mosque", address: "146 Park Road, Regent's Park", description: "Iconic golden-domed mosque in Regent's Park." },
      { name: "East London Mosque", address: "82-92 Whitechapel Road", description: "One of the largest mosques in Europe." },
      { name: "Finsbury Park Mosque", address: "7-11 St Thomas's Road", description: "Historic mosque in North London." },
      { name: "Brixton Mosque", address: "1 Gresham Road, Brixton", description: "Active community mosque in South London." },
    ],
    halalRestaurants: [
      { name: "Dishoom", cuisine: "Indian", priceRange: "$$", rating: 4.7 },
      { name: "The Halal Guys", cuisine: "American Halal", priceRange: "$", rating: 4.3 },
      { name: "Maroush", cuisine: "Lebanese", priceRange: "$$", rating: 4.5 },
      { name: "Tayyabs", cuisine: "Pakistani", priceRange: "$", rating: 4.6 },
    ],
    travelTips: [
      "Get an Oyster card or use contactless for tube travel",
      "Many free museums including British Museum and V&A",
      "Brick Lane has amazing Bangladeshi halal food",
      "Book popular attractions online to skip queues",
      "Take a Thames River cruise for great views",
    ],
    flightPriceFrom: 45,
    hotelPriceFrom: 85,
    currency_display: "GBP",
  },
];

export const travelTips: TravelTip[] = [
  {
    id: "tip-001",
    title: "Research Halal Options Before You Go",
    description: "Use apps like Halal Trip, Zabihah, or local Muslim travel blogs to identify halal restaurants, mosques, and prayer facilities at your destination before departure.",
    category: "halal",
    icon: "Search",
  },
  {
    id: "tip-002",
    title: "Pack a Travel Prayer Mat",
    description: "A compact, portable prayer mat takes up minimal space and ensures you always have a clean place to pray, whether at airports, hotels, or outdoor locations.",
    category: "prayer",
    icon: "LayoutGrid",
  },
  {
    id: "tip-003",
    title: "Download Offline Qibla Apps",
    description: "Apps like Muslim Pro work offline and help you find the Qibla direction anywhere in the world, even without internet connection.",
    category: "prayer",
    icon: "Compass",
  },
  {
    id: "tip-004",
    title: "Carry Halal Snacks for Long Journeys",
    description: "Pack halal-certified snacks and instant meals for long flights or road trips where halal food may not be readily available.",
    category: "halal",
    icon: "Cookie",
  },
  {
    id: "tip-005",
    title: "Learn Key Phrases in Local Language",
    description: "Learn how to ask 'Is this halal?' and 'Where is the nearest mosque?' in the local language. It shows respect and helps you navigate.",
    category: "culture",
    icon: "Languages",
  },
  {
    id: "tip-006",
    title: "Check Prayer Times at Your Destination",
    description: "Prayer times vary by location and season. Check local prayer times and plan your itinerary around Salah, especially for Jummah on Fridays.",
    category: "prayer",
    icon: "Clock",
  },
  {
    id: "tip-007",
    title: "Book Halal-Friendly Hotels",
    description: "Look for hotels that offer halal breakfast options, prayer mats, Quran in rooms, and are near mosques. Many booking sites now have Muslim-friendly filters.",
    category: "halal",
    icon: "Building2",
  },
  {
    id: "tip-008",
    title: "Dress Modestly and Respectfully",
    description: "Pack modest clothing suitable for visiting mosques and religious sites. Carry a scarf or shawl for quick coverage when needed.",
    category: "culture",
    icon: "Shirt",
  },
  {
    id: "tip-009",
    title: "Traveling During Ramadan",
    description: "If traveling during Ramadan, research iftar timings and locations. Many Muslim countries have special Ramadan experiences and reduced daytime activities.",
    category: "halal",
    icon: "Moon",
  },
  {
    id: "tip-010",
    title: "Airport Prayer Rooms",
    description: "Most major international airports have interfaith prayer rooms. Check airport maps online before your flight to locate them easily during layovers.",
    category: "prayer",
    icon: "Plane",
  },
  {
    id: "tip-011",
    title: "Travel Insurance Considerations",
    description: "Ensure your travel insurance is Shariah-compliant if that's important to you. Some insurers offer takaful-based travel insurance options.",
    category: "safety",
    icon: "Shield",
  },
  {
    id: "tip-012",
    title: "Stay Connected with Muslim Travel Communities",
    description: "Join Muslim travel groups on social media for real-time tips, restaurant recommendations, and to connect with fellow Muslim travelers.",
    category: "culture",
    icon: "Users",
  },
];

// Helper functions
export function getCityGuideBySlug(slug: string): CityGuide | undefined {
  return cityGuides.find((city) => city.slug === slug);
}

export function getAllCityGuides(): CityGuide[] {
  return cityGuides;
}

export function getTravelTipsByCategory(category: TravelTip["category"]): TravelTip[] {
  return travelTips.filter((tip) => tip.category === category);
}

export function getAllTravelTips(): TravelTip[] {
  return travelTips;
}
