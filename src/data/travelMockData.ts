// ============== COMMON TYPES ==============

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Location {
  id: string;
  name: string;
  city: string;
  country: string;
  image?: string;
}

// ============== FLIGHT TYPES ==============

export interface FlightLeg {
  departureAirport: Airport;
  arrivalAirport: Airport;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  airline: string;
  flightNumber: string;
  stops: number;
  stopoverAirports?: Airport[];
}

export interface Flight {
  id: string;
  outbound: FlightLeg;
  inbound?: FlightLeg;
  price: number;
  currency: string;
  pricePerPerson: number;
  passengers: number;
  cabinClass: "economy" | "premium_economy" | "business" | "first";
  airline: string;
  airlineLogo: string;
  bookingUrl: string;
  provider: string;
  isBestValue?: boolean;
  isCheapest?: boolean;
  isFastest?: boolean;
  isDirectFlight: boolean;
  baggageIncluded: boolean;
}

export interface FlightSearchParams {
  origin: Airport | null;
  destination: Airport | null;
  departureDate: string;
  returnDate?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass: string;
  tripType: "roundtrip" | "oneway" | "multicity";
}

// ============== HOTEL TYPES ==============

export interface HotelAmenity {
  id: string;
  name: string;
  icon: string;
}

export interface Hotel {
  id: string;
  name: string;
  description: string;
  location: Location;
  address: string;
  starRating: number;
  guestRating: number;
  reviewCount: number;
  images: string[];
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  amenities: HotelAmenity[];
  halalAmenities: {
    halalFood: boolean;
    prayerFacilities: boolean;
    alcoholFreeOption: boolean;
    separateSwimming: boolean;
    nearbyMosque: boolean;
    mosqueDistance?: string;
  };
  bookingUrl: string;
  provider: string;
  isFeatured?: boolean;
  roomType: string;
  freeCancellation: boolean;
  breakfastIncluded: boolean;
}

export interface HotelSearchParams {
  location: Location | null;
  checkIn: string;
  checkOut: string;
  rooms: number;
  guests: {
    adults: number;
    children: number;
  };
}

// ============== CAR RENTAL TYPES ==============

export interface CarRental {
  id: string;
  name: string;
  model: string;
  category: "economy" | "compact" | "midsize" | "fullsize" | "suv" | "luxury" | "van";
  image: string;
  seats: number;
  doors: number;
  transmission: "automatic" | "manual";
  airConditioning: boolean;
  bags: {
    large: number;
    small: number;
  };
  pricePerDay: number;
  totalPrice: number;
  currency: string;
  provider: string;
  providerLogo: string;
  pickupLocation: string;
  dropoffLocation: string;
  mileage: string;
  fuelPolicy: string;
  bookingUrl: string;
  insuranceIncluded: boolean;
}

export interface CarSearchParams {
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  dropoffDate: string;
  dropoffTime: string;
  driverAge: number;
}

// ============== DEALS TYPES ==============

export interface TravelDeal {
  id: string;
  title: string;
  description: string;
  type: "flight" | "hotel" | "package";
  destination: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  currency: string;
  discountPercentage: number;
  validUntil: string;
  tags: string[];
  bookingUrl: string;
  provider: string;
  isFeatured: boolean;
}

export interface PopularDestination {
  id: string;
  city: string;
  country: string;
  image: string;
  flightPriceFrom: number;
  hotelPriceFrom: number;
  currency: string;
  description: string;
  halalScore: number;
  tags: string[];
  slug: string;
}

// ============== MY TRIPS TYPES ==============

export interface SavedSearch {
  id: string;
  type: "flight" | "hotel" | "car";
  title: string;
  details: string;
  savedAt: string;
  lastPrice: number;
  currentPrice: number;
  currency: string;
  priceChange: "up" | "down" | "same";
  priceChangeAmount: number;
}

export interface PriceAlert {
  id: string;
  type: "flight" | "hotel" | "car";
  title: string;
  details: string;
  targetPrice: number;
  currentPrice: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
}

export interface RecentSearch {
  id: string;
  type: "flight" | "hotel" | "car";
  title: string;
  details: string;
  searchedAt: string;
  resultsCount: number;
  lowestPrice: number;
  currency: string;
}

// ============== MOCK DATA ==============

export const airports: Airport[] = [
  { code: "LHR", name: "London Heathrow", city: "London", country: "United Kingdom" },
  { code: "LGW", name: "London Gatwick", city: "London", country: "United Kingdom" },
  { code: "STN", name: "London Stansted", city: "London", country: "United Kingdom" },
  { code: "MAN", name: "Manchester Airport", city: "Manchester", country: "United Kingdom" },
  { code: "DXB", name: "Dubai International", city: "Dubai", country: "United Arab Emirates" },
  { code: "IST", name: "Istanbul Airport", city: "Istanbul", country: "Turkey" },
  { code: "SAW", name: "Sabiha Gokcen", city: "Istanbul", country: "Turkey" },
  { code: "KUL", name: "Kuala Lumpur International", city: "Kuala Lumpur", country: "Malaysia" },
  { code: "JED", name: "King Abdulaziz International", city: "Jeddah", country: "Saudi Arabia" },
  { code: "MED", name: "Prince Mohammad bin Abdulaziz", city: "Medina", country: "Saudi Arabia" },
  { code: "CAI", name: "Cairo International", city: "Cairo", country: "Egypt" },
  { code: "CMN", name: "Mohammed V International", city: "Casablanca", country: "Morocco" },
  { code: "JFK", name: "John F. Kennedy International", city: "New York", country: "United States" },
  { code: "CDG", name: "Charles de Gaulle", city: "Paris", country: "France" },
  { code: "AMS", name: "Amsterdam Schiphol", city: "Amsterdam", country: "Netherlands" },
];

export const mockFlights: Flight[] = [
  {
    id: "fl-001",
    outbound: {
      departureAirport: airports[0], // LHR
      arrivalAirport: airports[4], // DXB
      departureTime: "2024-03-15T09:00:00Z",
      arrivalTime: "2024-03-15T19:30:00Z",
      duration: "7h 30m",
      airline: "Emirates",
      flightNumber: "EK002",
      stops: 0,
    },
    inbound: {
      departureAirport: airports[4],
      arrivalAirport: airports[0],
      departureTime: "2024-03-22T21:00:00Z",
      arrivalTime: "2024-03-23T01:30:00Z",
      duration: "7h 30m",
      airline: "Emirates",
      flightNumber: "EK001",
      stops: 0,
    },
    price: 349,
    currency: "GBP",
    pricePerPerson: 349,
    passengers: 1,
    cabinClass: "economy",
    airline: "Emirates",
    airlineLogo: "/images/airlines/emirates.png",
    bookingUrl: "https://www.skyscanner.net/",
    provider: "Skyscanner",
    isBestValue: true,
    isDirectFlight: true,
    baggageIncluded: true,
  },
  {
    id: "fl-002",
    outbound: {
      departureAirport: airports[0],
      arrivalAirport: airports[5], // IST
      departureTime: "2024-03-15T06:30:00Z",
      arrivalTime: "2024-03-15T12:45:00Z",
      duration: "4h 15m",
      airline: "Turkish Airlines",
      flightNumber: "TK1972",
      stops: 0,
    },
    inbound: {
      departureAirport: airports[5],
      arrivalAirport: airports[0],
      departureTime: "2024-03-22T14:00:00Z",
      arrivalTime: "2024-03-22T16:15:00Z",
      duration: "4h 15m",
      airline: "Turkish Airlines",
      flightNumber: "TK1971",
      stops: 0,
    },
    price: 189,
    currency: "GBP",
    pricePerPerson: 189,
    passengers: 1,
    cabinClass: "economy",
    airline: "Turkish Airlines",
    airlineLogo: "/images/airlines/turkish.png",
    bookingUrl: "https://www.skyscanner.net/",
    provider: "Skyscanner",
    isCheapest: true,
    isDirectFlight: true,
    baggageIncluded: true,
  },
  {
    id: "fl-003",
    outbound: {
      departureAirport: airports[0],
      arrivalAirport: airports[7], // KUL
      departureTime: "2024-03-15T21:00:00Z",
      arrivalTime: "2024-03-16T16:45:00Z",
      duration: "12h 45m",
      airline: "Malaysia Airlines",
      flightNumber: "MH003",
      stops: 0,
    },
    inbound: {
      departureAirport: airports[7],
      arrivalAirport: airports[0],
      departureTime: "2024-03-22T23:30:00Z",
      arrivalTime: "2024-03-23T05:45:00Z",
      duration: "13h 15m",
      airline: "Malaysia Airlines",
      flightNumber: "MH004",
      stops: 0,
    },
    price: 485,
    currency: "GBP",
    pricePerPerson: 485,
    passengers: 1,
    cabinClass: "economy",
    airline: "Malaysia Airlines",
    airlineLogo: "/images/airlines/malaysia.png",
    bookingUrl: "https://www.skyscanner.net/",
    provider: "Skyscanner",
    isDirectFlight: true,
    baggageIncluded: true,
  },
  {
    id: "fl-004",
    outbound: {
      departureAirport: airports[0],
      arrivalAirport: airports[4],
      departureTime: "2024-03-15T14:30:00Z",
      arrivalTime: "2024-03-16T02:15:00Z",
      duration: "8h 45m",
      airline: "British Airways",
      flightNumber: "BA107",
      stops: 1,
      stopoverAirports: [airports[5]],
    },
    inbound: {
      departureAirport: airports[4],
      arrivalAirport: airports[0],
      departureTime: "2024-03-22T08:00:00Z",
      arrivalTime: "2024-03-22T18:30:00Z",
      duration: "9h 30m",
      airline: "British Airways",
      flightNumber: "BA106",
      stops: 1,
      stopoverAirports: [airports[5]],
    },
    price: 275,
    currency: "GBP",
    pricePerPerson: 275,
    passengers: 1,
    cabinClass: "economy",
    airline: "British Airways",
    airlineLogo: "/images/airlines/ba.png",
    bookingUrl: "https://www.skyscanner.net/",
    provider: "Skyscanner",
    isDirectFlight: false,
    baggageIncluded: true,
  },
  {
    id: "fl-005",
    outbound: {
      departureAirport: airports[0],
      arrivalAirport: airports[8], // JED
      departureTime: "2024-03-15T10:45:00Z",
      arrivalTime: "2024-03-15T20:30:00Z",
      duration: "6h 45m",
      airline: "Saudia",
      flightNumber: "SV124",
      stops: 0,
    },
    inbound: {
      departureAirport: airports[8],
      arrivalAirport: airports[0],
      departureTime: "2024-03-22T01:30:00Z",
      arrivalTime: "2024-03-22T06:15:00Z",
      duration: "7h 45m",
      airline: "Saudia",
      flightNumber: "SV123",
      stops: 0,
    },
    price: 395,
    currency: "GBP",
    pricePerPerson: 395,
    passengers: 1,
    cabinClass: "economy",
    airline: "Saudia",
    airlineLogo: "/images/airlines/saudia.png",
    bookingUrl: "https://www.skyscanner.net/",
    provider: "Skyscanner",
    isDirectFlight: true,
    baggageIncluded: true,
  },
];

export const mockHotels: Hotel[] = [
  {
    id: "ht-001",
    name: "Hilton Dubai Creek",
    description: "Luxury hotel with stunning views of Dubai Creek and easy access to the Gold Souk.",
    location: { id: "dubai", name: "Dubai Creek", city: "Dubai", country: "UAE" },
    address: "Baniyas Road, Deira, Dubai",
    starRating: 5,
    guestRating: 8.9,
    reviewCount: 2341,
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"],
    pricePerNight: 120,
    totalPrice: 840,
    currency: "GBP",
    amenities: [
      { id: "wifi", name: "Free WiFi", icon: "Wifi" },
      { id: "pool", name: "Swimming Pool", icon: "Waves" },
      { id: "gym", name: "Fitness Center", icon: "Dumbbell" },
      { id: "spa", name: "Spa", icon: "Sparkles" },
    ],
    halalAmenities: {
      halalFood: true,
      prayerFacilities: true,
      alcoholFreeOption: true,
      separateSwimming: false,
      nearbyMosque: true,
      mosqueDistance: "5 min walk",
    },
    bookingUrl: "https://www.booking.com/",
    provider: "Booking.com",
    isFeatured: true,
    roomType: "Deluxe Room",
    freeCancellation: true,
    breakfastIncluded: true,
  },
  {
    id: "ht-002",
    name: "The Ritz-Carlton Istanbul",
    description: "Elegant luxury hotel overlooking the Bosphorus with exceptional service.",
    location: { id: "istanbul", name: "Besiktas", city: "Istanbul", country: "Turkey" },
    address: "Suzer Plaza, Elmadag, Istanbul",
    starRating: 5,
    guestRating: 9.2,
    reviewCount: 1876,
    images: ["https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800"],
    pricePerNight: 185,
    totalPrice: 1295,
    currency: "GBP",
    amenities: [
      { id: "wifi", name: "Free WiFi", icon: "Wifi" },
      { id: "pool", name: "Indoor Pool", icon: "Waves" },
      { id: "gym", name: "Fitness Center", icon: "Dumbbell" },
      { id: "restaurant", name: "Restaurant", icon: "Utensils" },
    ],
    halalAmenities: {
      halalFood: true,
      prayerFacilities: true,
      alcoholFreeOption: true,
      separateSwimming: true,
      nearbyMosque: true,
      mosqueDistance: "10 min walk",
    },
    bookingUrl: "https://www.booking.com/",
    provider: "Booking.com",
    isFeatured: true,
    roomType: "Bosphorus View Room",
    freeCancellation: true,
    breakfastIncluded: true,
  },
  {
    id: "ht-003",
    name: "Mandarin Oriental Kuala Lumpur",
    description: "Iconic hotel at the base of Petronas Twin Towers with world-class amenities.",
    location: { id: "kl", name: "KLCC", city: "Kuala Lumpur", country: "Malaysia" },
    address: "Kuala Lumpur City Centre, 50088",
    starRating: 5,
    guestRating: 9.0,
    reviewCount: 3102,
    images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"],
    pricePerNight: 145,
    totalPrice: 1015,
    currency: "GBP",
    amenities: [
      { id: "wifi", name: "Free WiFi", icon: "Wifi" },
      { id: "pool", name: "Outdoor Pool", icon: "Waves" },
      { id: "gym", name: "Fitness Center", icon: "Dumbbell" },
      { id: "spa", name: "Spa", icon: "Sparkles" },
    ],
    halalAmenities: {
      halalFood: true,
      prayerFacilities: true,
      alcoholFreeOption: true,
      separateSwimming: false,
      nearbyMosque: true,
      mosqueDistance: "Walking distance",
    },
    bookingUrl: "https://www.booking.com/",
    provider: "Hotels.com",
    isFeatured: true,
    roomType: "Premier Room",
    freeCancellation: true,
    breakfastIncluded: false,
  },
  {
    id: "ht-004",
    name: "Raffles Makkah Palace",
    description: "Luxurious hotel with direct access to the Grand Mosque, perfect for pilgrims.",
    location: { id: "makkah", name: "Makkah", city: "Makkah", country: "Saudi Arabia" },
    address: "Ibrahim Al Khalil St, Makkah",
    starRating: 5,
    guestRating: 9.5,
    reviewCount: 4521,
    images: ["https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800"],
    pricePerNight: 350,
    totalPrice: 2450,
    currency: "GBP",
    amenities: [
      { id: "wifi", name: "Free WiFi", icon: "Wifi" },
      { id: "restaurant", name: "Halal Restaurant", icon: "Utensils" },
      { id: "lounge", name: "Executive Lounge", icon: "Coffee" },
      { id: "concierge", name: "Concierge", icon: "ConciergeBell" },
    ],
    halalAmenities: {
      halalFood: true,
      prayerFacilities: true,
      alcoholFreeOption: true,
      separateSwimming: true,
      nearbyMosque: true,
      mosqueDistance: "Direct access",
    },
    bookingUrl: "https://www.booking.com/",
    provider: "Booking.com",
    isFeatured: true,
    roomType: "Haram View Room",
    freeCancellation: false,
    breakfastIncluded: true,
  },
  {
    id: "ht-005",
    name: "Park Hyatt London",
    description: "Contemporary luxury hotel in the heart of Mayfair with exceptional dining.",
    location: { id: "london", name: "Mayfair", city: "London", country: "United Kingdom" },
    address: "30 Grosvenor Square, London",
    starRating: 5,
    guestRating: 8.8,
    reviewCount: 1543,
    images: ["https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800"],
    pricePerNight: 420,
    totalPrice: 2940,
    currency: "GBP",
    amenities: [
      { id: "wifi", name: "Free WiFi", icon: "Wifi" },
      { id: "spa", name: "Spa", icon: "Sparkles" },
      { id: "gym", name: "Fitness Center", icon: "Dumbbell" },
      { id: "restaurant", name: "Restaurant", icon: "Utensils" },
    ],
    halalAmenities: {
      halalFood: false,
      prayerFacilities: false,
      alcoholFreeOption: false,
      separateSwimming: false,
      nearbyMosque: true,
      mosqueDistance: "15 min walk",
    },
    bookingUrl: "https://www.booking.com/",
    provider: "Booking.com",
    roomType: "Park Room",
    freeCancellation: true,
    breakfastIncluded: false,
  },
];

export const mockCarRentals: CarRental[] = [
  {
    id: "car-001",
    name: "Economy Car",
    model: "Toyota Yaris or similar",
    category: "economy",
    image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800",
    seats: 5,
    doors: 4,
    transmission: "automatic",
    airConditioning: true,
    bags: { large: 1, small: 1 },
    pricePerDay: 25,
    totalPrice: 175,
    currency: "GBP",
    provider: "Hertz",
    providerLogo: "/images/car-providers/hertz.png",
    pickupLocation: "Dubai International Airport",
    dropoffLocation: "Dubai International Airport",
    mileage: "Unlimited",
    fuelPolicy: "Full to Full",
    bookingUrl: "https://www.hertz.com/",
    insuranceIncluded: true,
  },
  {
    id: "car-002",
    name: "SUV",
    model: "Nissan X-Trail or similar",
    category: "suv",
    image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=800",
    seats: 7,
    doors: 5,
    transmission: "automatic",
    airConditioning: true,
    bags: { large: 3, small: 2 },
    pricePerDay: 55,
    totalPrice: 385,
    currency: "GBP",
    provider: "Enterprise",
    providerLogo: "/images/car-providers/enterprise.png",
    pickupLocation: "Istanbul Airport",
    dropoffLocation: "Istanbul Airport",
    mileage: "Unlimited",
    fuelPolicy: "Full to Full",
    bookingUrl: "https://www.enterprise.com/",
    insuranceIncluded: true,
  },
  {
    id: "car-003",
    name: "Luxury Sedan",
    model: "Mercedes E-Class or similar",
    category: "luxury",
    image: "https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=800",
    seats: 5,
    doors: 4,
    transmission: "automatic",
    airConditioning: true,
    bags: { large: 2, small: 2 },
    pricePerDay: 120,
    totalPrice: 840,
    currency: "GBP",
    provider: "Sixt",
    providerLogo: "/images/car-providers/sixt.png",
    pickupLocation: "London Heathrow Airport",
    dropoffLocation: "London Heathrow Airport",
    mileage: "250 km/day",
    fuelPolicy: "Full to Full",
    bookingUrl: "https://www.sixt.com/",
    insuranceIncluded: true,
  },
  {
    id: "car-004",
    name: "Compact Car",
    model: "Proton Saga or similar",
    category: "compact",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
    seats: 5,
    doors: 4,
    transmission: "automatic",
    airConditioning: true,
    bags: { large: 2, small: 1 },
    pricePerDay: 18,
    totalPrice: 126,
    currency: "GBP",
    provider: "Avis",
    providerLogo: "/images/car-providers/avis.png",
    pickupLocation: "Kuala Lumpur International Airport",
    dropoffLocation: "Kuala Lumpur International Airport",
    mileage: "Unlimited",
    fuelPolicy: "Full to Full",
    bookingUrl: "https://www.avis.com/",
    insuranceIncluded: true,
  },
];

export const mockDeals: TravelDeal[] = [
  {
    id: "deal-001",
    title: "Dubai Escape",
    description: "Return flights + 5 nights at 4-star hotel with breakfast included.",
    type: "package",
    destination: "Dubai, UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    originalPrice: 899,
    discountedPrice: 649,
    currency: "GBP",
    discountPercentage: 28,
    validUntil: "2024-04-30",
    tags: ["Best Seller", "Halal-Friendly"],
    bookingUrl: "https://www.skyscanner.net/",
    provider: "Skyscanner",
    isFeatured: true,
  },
  {
    id: "deal-002",
    title: "Istanbul City Break",
    description: "Direct flights + 4 nights at boutique hotel in Sultanahmet.",
    type: "package",
    destination: "Istanbul, Turkey",
    image: "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?w=800",
    originalPrice: 549,
    discountedPrice: 399,
    currency: "GBP",
    discountPercentage: 27,
    validUntil: "2024-03-31",
    tags: ["Limited Time", "Historic City"],
    bookingUrl: "https://www.skyscanner.net/",
    provider: "Skyscanner",
    isFeatured: true,
  },
  {
    id: "deal-003",
    title: "Kuala Lumpur Adventure",
    description: "Return flights + 7 nights at 5-star hotel near KLCC.",
    type: "package",
    destination: "Kuala Lumpur, Malaysia",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800",
    originalPrice: 1199,
    discountedPrice: 899,
    currency: "GBP",
    discountPercentage: 25,
    validUntil: "2024-05-15",
    tags: ["Family Friendly", "Halal Paradise"],
    bookingUrl: "https://www.skyscanner.net/",
    provider: "Skyscanner",
    isFeatured: true,
  },
  {
    id: "deal-004",
    title: "Marrakech Getaway",
    description: "Flights + 4 nights in traditional riad with full board.",
    type: "package",
    destination: "Marrakech, Morocco",
    image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800",
    originalPrice: 699,
    discountedPrice: 529,
    currency: "GBP",
    discountPercentage: 24,
    validUntil: "2024-04-15",
    tags: ["Cultural Experience", "100% Halal"],
    bookingUrl: "https://www.skyscanner.net/",
    provider: "Skyscanner",
    isFeatured: false,
  },
];

export const popularDestinations: PopularDestination[] = [
  {
    id: "dest-istanbul",
    city: "Istanbul",
    country: "Turkey",
    image: "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800",
    flightPriceFrom: 89,
    hotelPriceFrom: 45,
    currency: "GBP",
    description: "Where East meets West, with stunning mosques and rich history.",
    halalScore: 5,
    tags: ["Historic", "Cultural", "Mosques"],
    slug: "istanbul",
  },
  {
    id: "dest-dubai",
    city: "Dubai",
    country: "UAE",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800",
    flightPriceFrom: 199,
    hotelPriceFrom: 75,
    currency: "GBP",
    description: "Luxury shopping, ultramodern architecture, and vibrant nightlife.",
    halalScore: 5,
    tags: ["Luxury", "Shopping", "Modern"],
    slug: "dubai",
  },
  {
    id: "dest-kl",
    city: "Kuala Lumpur",
    country: "Malaysia",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=800",
    flightPriceFrom: 349,
    hotelPriceFrom: 40,
    currency: "GBP",
    description: "Diverse culture, amazing food, and the iconic Petronas Towers.",
    halalScore: 5,
    tags: ["Food Paradise", "Family", "Affordable"],
    slug: "kuala-lumpur",
  },
  {
    id: "dest-london",
    city: "London",
    country: "United Kingdom",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800",
    flightPriceFrom: 45,
    hotelPriceFrom: 85,
    currency: "GBP",
    description: "Historic landmarks, world-class museums, and diverse halal dining.",
    halalScore: 4,
    tags: ["Historic", "Museums", "Diverse"],
    slug: "london",
  },
  {
    id: "dest-marrakech",
    city: "Marrakech",
    country: "Morocco",
    image: "https://images.unsplash.com/photo-1539020140153-e479b8c22e70?w=800",
    flightPriceFrom: 79,
    hotelPriceFrom: 35,
    currency: "GBP",
    description: "Vibrant souks, beautiful riads, and authentic Moroccan cuisine.",
    halalScore: 5,
    tags: ["Cultural", "Budget", "Authentic"],
    slug: "marrakech",
  },
  {
    id: "dest-maldives",
    city: "Maldives",
    country: "Maldives",
    image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800",
    flightPriceFrom: 450,
    hotelPriceFrom: 150,
    currency: "GBP",
    description: "Crystal clear waters, luxury resorts, and halal-friendly paradise.",
    halalScore: 5,
    tags: ["Beach", "Luxury", "Honeymoon"],
    slug: "maldives",
  },
];

export const mockSavedSearches: SavedSearch[] = [
  {
    id: "ss-001",
    type: "flight",
    title: "London to Dubai",
    details: "15 Mar - 22 Mar, 2 Adults, Economy",
    savedAt: "2024-02-10T10:30:00Z",
    lastPrice: 349,
    currentPrice: 325,
    currency: "GBP",
    priceChange: "down",
    priceChangeAmount: 24,
  },
  {
    id: "ss-002",
    type: "hotel",
    title: "Istanbul Hotels",
    details: "20 Apr - 25 Apr, 1 Room, 2 Guests",
    savedAt: "2024-02-08T14:20:00Z",
    lastPrice: 95,
    currentPrice: 95,
    currency: "GBP",
    priceChange: "same",
    priceChangeAmount: 0,
  },
  {
    id: "ss-003",
    type: "car",
    title: "Dubai Airport Car Rental",
    details: "15 Mar - 22 Mar, Economy",
    savedAt: "2024-02-05T09:15:00Z",
    lastPrice: 25,
    currentPrice: 28,
    currency: "GBP",
    priceChange: "up",
    priceChangeAmount: 3,
  },
];

export const mockPriceAlerts: PriceAlert[] = [
  {
    id: "pa-001",
    type: "flight",
    title: "London to Kuala Lumpur",
    details: "Any dates in April, 1 Adult",
    targetPrice: 400,
    currentPrice: 485,
    currency: "GBP",
    isActive: true,
    createdAt: "2024-01-15T12:00:00Z",
  },
  {
    id: "pa-002",
    type: "flight",
    title: "London to Istanbul",
    details: "15-20 May, 2 Adults",
    targetPrice: 150,
    currentPrice: 189,
    currency: "GBP",
    isActive: true,
    createdAt: "2024-02-01T08:30:00Z",
  },
];

export const mockRecentSearches: RecentSearch[] = [
  {
    id: "rs-001",
    type: "flight",
    title: "London to Dubai",
    details: "15 Mar - 22 Mar, 1 Adult",
    searchedAt: "2024-02-12T16:45:00Z",
    resultsCount: 45,
    lowestPrice: 275,
    currency: "GBP",
  },
  {
    id: "rs-002",
    type: "hotel",
    title: "Hotels in Istanbul",
    details: "20 Apr - 25 Apr, 2 Guests",
    searchedAt: "2024-02-12T14:30:00Z",
    resultsCount: 128,
    lowestPrice: 45,
    currency: "GBP",
  },
  {
    id: "rs-003",
    type: "car",
    title: "Car Rental in KL",
    details: "1 May - 8 May",
    searchedAt: "2024-02-11T11:20:00Z",
    resultsCount: 32,
    lowestPrice: 18,
    currency: "GBP",
  },
];

// ============== HELPER FUNCTIONS ==============

export function getFlightById(id: string): Flight | undefined {
  return mockFlights.find((flight) => flight.id === id);
}

export function getHotelById(id: string): Hotel | undefined {
  return mockHotels.find((hotel) => hotel.id === id);
}

export function getCarById(id: string): CarRental | undefined {
  return mockCarRentals.find((car) => car.id === id);
}

export function getFeaturedDeals(): TravelDeal[] {
  return mockDeals.filter((deal) => deal.isFeatured);
}

export function getDestinationBySlug(slug: string): PopularDestination | undefined {
  return popularDestinations.find((dest) => dest.slug === slug);
}

export function searchAirports(query: string): Airport[] {
  const lowerQuery = query.toLowerCase();
  return airports.filter(
    (airport) =>
      airport.code.toLowerCase().includes(lowerQuery) ||
      airport.name.toLowerCase().includes(lowerQuery) ||
      airport.city.toLowerCase().includes(lowerQuery)
  );
}

export function filterFlights(
  flights: Flight[],
  filters: {
    maxPrice?: number;
    directOnly?: boolean;
    airlines?: string[];
  }
): Flight[] {
  return flights.filter((flight) => {
    if (filters.maxPrice && flight.price > filters.maxPrice) return false;
    if (filters.directOnly && !flight.isDirectFlight) return false;
    if (filters.airlines?.length && !filters.airlines.includes(flight.airline)) return false;
    return true;
  });
}

export function filterHotels(
  hotels: Hotel[],
  filters: {
    maxPrice?: number;
    minRating?: number;
    halalFoodOnly?: boolean;
    prayerFacilities?: boolean;
  }
): Hotel[] {
  return hotels.filter((hotel) => {
    if (filters.maxPrice && hotel.pricePerNight > filters.maxPrice) return false;
    if (filters.minRating && hotel.guestRating < filters.minRating) return false;
    if (filters.halalFoodOnly && !hotel.halalAmenities.halalFood) return false;
    if (filters.prayerFacilities && !hotel.halalAmenities.prayerFacilities) return false;
    return true;
  });
}
