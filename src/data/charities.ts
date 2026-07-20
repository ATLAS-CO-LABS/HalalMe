export interface Charity {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  image: string;
  raised: number;
  goal: number;
  donors: number;
  featured: boolean;
}

export const charities: Charity[] = [
  {
    id: "water-for-all",
    name: "Water for All",
    description: "Provide clean drinking water to communities in need across Africa and Asia.",
    longDescription: "Access to clean water is a basic human right, yet millions of people around the world lack this essential resource. Water for All works to build wells, install water purification systems, and educate communities about water hygiene. Your donation helps us bring life-saving clean water to villages, schools, and healthcare facilities in remote areas. Every £10 can provide clean water to one person for an entire year.",
    category: "Water & Sanitation",
    image: "https://images.unsplash.com/photo-1504973960431-1c467e159aa4?w=800&h=600&fit=crop",
    raised: 15420,
    goal: 25000,
    donors: 342,
    featured: true,
  },
  {
    id: "feed-the-hungry",
    name: "Feed the Hungry",
    description: "Combat hunger by providing nutritious meals to families facing food insecurity.",
    longDescription: "Hunger affects millions of people worldwide, with children being the most vulnerable. Feed the Hungry partners with local organizations to distribute food packages, run community kitchens, and support sustainable farming initiatives. We ensure that every donation goes directly to providing meals, from emergency food aid during crises to long-term nutrition programs. £5 can provide a family with a week's worth of essential groceries.",
    category: "Food Security",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=600&fit=crop",
    raised: 28750,
    goal: 50000,
    donors: 567,
    featured: true,
  },
  {
    id: "education-hope",
    name: "Education for Hope",
    description: "Give children access to quality education and learning materials.",
    longDescription: "Education is the foundation for breaking the cycle of poverty. Education for Hope builds schools, provides scholarships, trains teachers, and supplies learning materials to underserved communities. We believe every child deserves the opportunity to learn, grow, and reach their full potential. Your donation can provide school supplies for a child for an entire year with just £15, or sponsor a student's full education for £50 per month.",
    category: "Education",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
    raised: 12300,
    goal: 30000,
    donors: 189,
    featured: true,
  },
  {
    id: "medical-aid",
    name: "Medical Aid Foundation",
    description: "Deliver essential healthcare services and medical supplies to underserved regions.",
    longDescription: "Quality healthcare should not be a privilege. The Medical Aid Foundation provides free medical clinics, essential medicines, and health education to communities without access to healthcare. We deploy mobile health units, train community health workers, and support hospitals in crisis zones. £20 can provide essential medicines for a family for a month, while £100 can fund a medical clinic visit for an entire village.",
    category: "Healthcare",
    image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=600&fit=crop",
    raised: 8900,
    goal: 20000,
    donors: 124,
    featured: false,
  },
  {
    id: "orphan-care",
    name: "Orphan Care Initiative",
    description: "Support orphaned children with shelter, education, and emotional care.",
    longDescription: "Every child deserves a loving home and a chance at a bright future. The Orphan Care Initiative provides comprehensive support to orphaned children, including safe housing, nutritious meals, quality education, and psychological support. We work with local communities to ensure these children grow up in nurturing environments. £30 per month can sponsor an orphan's complete care including food, shelter, and education.",
    category: "Children & Youth",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop",
    raised: 19200,
    goal: 40000,
    donors: 298,
    featured: true,
  },
  {
    id: "refugee-support",
    name: "Refugee Support Network",
    description: "Help displaced families rebuild their lives with dignity and hope.",
    longDescription: "Millions of people have been forced to flee their homes due to conflict and persecution. The Refugee Support Network provides emergency relief, temporary shelter, legal assistance, and integration support to refugees and displaced families. We help them access essential services and rebuild their lives in safety. £25 can provide an emergency kit with blankets, hygiene items, and basic necessities for a family.",
    category: "Humanitarian Aid",
    image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=800&h=600&fit=crop",
    raised: 22100,
    goal: 35000,
    donors: 412,
    featured: false,
  },
  {
    id: "masjid-building",
    name: "Masjid Building Project",
    description: "Help build mosques in communities that lack proper places of worship.",
    longDescription: "A masjid is the heart of any Muslim community: a place for prayer, learning, and gathering. The Masjid Building Project constructs mosques in areas where Muslims lack proper facilities for worship. From small prayer rooms in remote villages to larger community centers, we ensure every Muslim has a dignified place to pray. Contributing to building a masjid is a sadaqah jariyah, a continuous charity that benefits you even after death.",
    category: "Islamic Projects",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=800&h=600&fit=crop",
    raised: 45000,
    goal: 75000,
    donors: 678,
    featured: true,
  },
  {
    id: "disaster-relief",
    name: "Disaster Relief Fund",
    description: "Provide immediate assistance to communities affected by natural disasters.",
    longDescription: "When disaster strikes, immediate response can save lives. The Disaster Relief Fund provides emergency aid including food, water, shelter, and medical care to communities affected by earthquakes, floods, hurricanes, and other natural disasters. We work on the ground to deliver aid quickly and efficiently. 100% of disaster relief donations go directly to emergency response efforts.",
    category: "Emergency Response",
    image: "https://images.unsplash.com/photo-1599059813005-11265ba4b4ce?w=800&h=600&fit=crop",
    raised: 31500,
    goal: 60000,
    donors: 523,
    featured: false,
  },
];

export const categories = [
  "All",
  "Water & Sanitation",
  "Food Security",
  "Education",
  "Healthcare",
  "Children & Youth",
  "Humanitarian Aid",
  "Islamic Projects",
  "Emergency Response",
];

export function getCharityById(id: string): Charity | undefined {
  return charities.find((charity) => charity.id === id);
}

export function getFeaturedCharities(): Charity[] {
  return charities.filter((charity) => charity.featured);
}

export function getCharitiesByCategory(category: string): Charity[] {
  if (category === "All") return charities;
  return charities.filter((charity) => charity.category === category);
}
