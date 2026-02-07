export interface Meal {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  calories?: number;
  prepTime?: string;
  isPopular?: boolean;
  isNew?: boolean;
}

export const meals: Meal[] = [
  {
    id: "meal-1",
    name: "Grilled Chicken Biryani",
    description: "Aromatic basmati rice with tender grilled chicken, infused with saffron and traditional spices",
    price: 12.99,
    image: "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?w=1200&auto=format&fit=crop&q=80",
    category: "Rice Dishes",
    calories: 650,
    prepTime: "Ready to heat",
    isPopular: true,
  },
  {
    id: "meal-2",
    name: "Lamb Kofta Platter",
    description: "Juicy lamb kofta with hummus, tabbouleh, and warm pita bread",
    price: 14.99,
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=1200&auto=format&fit=crop&q=80",
    category: "Platters",
    calories: 720,
    prepTime: "Ready to heat",
    isPopular: true,
  },
  {
    id: "meal-3",
    name: "Butter Chicken Bowl",
    description: "Creamy tomato-based curry with tender chicken pieces, served with basmati rice",
    price: 11.99,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=1200&auto=format&fit=crop&q=80",
    category: "Curries",
    calories: 580,
    prepTime: "Ready to heat",
  },
  {
    id: "meal-4",
    name: "Falafel Wrap",
    description: "Crispy falafel with fresh vegetables, tahini sauce, and pickles in a soft wrap",
    price: 8.99,
    image: "https://images.unsplash.com/photo-1593001872095-7d5b3868fb1d?w=1200&auto=format&fit=crop&q=80",
    category: "Wraps",
    calories: 450,
    prepTime: "Ready to eat",
    isNew: true,
  },
  {
    id: "meal-5",
    name: "Shawarma Rice Bowl",
    description: "Marinated chicken shawarma over seasoned rice with garlic sauce and salad",
    price: 10.99,
    image: "https://images.unsplash.com/photo-1529563021893-cc83c992d75d?w=1200&auto=format&fit=crop&q=80",
    category: "Bowls",
    calories: 620,
    prepTime: "Ready to heat",
    isPopular: true,
  },
  {
    id: "meal-6",
    name: "Vegetable Curry",
    description: "Mixed vegetables in a rich coconut curry sauce with fragrant jasmine rice",
    price: 9.99,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&auto=format&fit=crop&q=80",
    category: "Curries",
    calories: 420,
    prepTime: "Ready to heat",
  },
  {
    id: "meal-7",
    name: "Grilled Salmon Plate",
    description: "Herb-crusted salmon fillet with roasted vegetables and lemon butter sauce",
    price: 16.99,
    image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=1200&auto=format&fit=crop&q=80",
    category: "Seafood",
    calories: 480,
    prepTime: "Ready to heat",
    isNew: true,
  },
  {
    id: "meal-8",
    name: "Beef Kebab Platter",
    description: "Tender beef kebabs with grilled vegetables, rice pilaf, and tzatziki",
    price: 15.99,
    image: "https://images.unsplash.com/photo-1529692236671-f1dc59e15e9a?w=1200&auto=format&fit=crop&q=80",
    category: "Platters",
    calories: 680,
    prepTime: "Ready to heat",
  },
  {
    id: "meal-9",
    name: "Mediterranean Salad",
    description: "Fresh greens with feta, olives, tomatoes, cucumber, and olive oil dressing",
    price: 7.99,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&auto=format&fit=crop&q=80",
    category: "Salads",
    calories: 280,
    prepTime: "Ready to eat",
  },
  {
    id: "meal-10",
    name: "Chicken Tikka Masala",
    description: "Classic tikka masala with marinated chicken in creamy tomato sauce",
    price: 12.49,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=1200&auto=format&fit=crop&q=80",
    category: "Curries",
    calories: 590,
    prepTime: "Ready to heat",
    isPopular: true,
  },
  {
    id: "meal-11",
    name: "Quinoa Power Bowl",
    description: "Nutritious quinoa with roasted chickpeas, avocado, and tahini dressing",
    price: 10.49,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=80",
    category: "Bowls",
    calories: 380,
    prepTime: "Ready to eat",
    isNew: true,
  },
  {
    id: "meal-12",
    name: "Lamb Shank Tagine",
    description: "Slow-cooked lamb shank with apricots, almonds, and Moroccan spices",
    price: 18.99,
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=1200&auto=format&fit=crop&q=80",
    category: "Specialties",
    calories: 750,
    prepTime: "Ready to heat",
  },
];

export const categories = [
  "All",
  "Rice Dishes",
  "Platters",
  "Curries",
  "Wraps",
  "Bowls",
  "Seafood",
  "Salads",
  "Specialties",
];
