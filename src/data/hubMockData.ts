// Mock data for HalalMe Hub

export type User = {
  id: string;
  name: string;
  avatar: string;
  username: string;
  isVerified?: boolean;
};

export type Post = {
  id: string;
  user: User;
  content: string;
  image?: string;
  type: "post" | "recipe";
  recipeId?: string; // Link to recipe if type is "recipe"
  recipeTitle?: string;
  likes: number;
  comments: number;
  isLiked: boolean;
  createdAt: string;
  timestamp: string; // Relative time (e.g., "2 hours ago")
};

export type Comment = {
  id: string;
  postId: string;
  user: User;
  content: string;
  likes: number;
  isLiked: boolean;
  createdAt: string;
  timestamp: string;
};

// Mock users
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Chef Ahmed",
    username: "@chefahmed",
    avatar: "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&h=400&fit=crop",
    isVerified: true,
  },
  {
    id: "2",
    name: "Sara Khan",
    username: "@sarakhan",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
  },
  {
    id: "3",
    name: "Fatima Ali",
    username: "@fatima_recipes",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    isVerified: true,
  },
  {
    id: "4",
    name: "Yusuf Ibrahim",
    username: "@yusuf_foodie",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  },
  {
    id: "5",
    name: "Aisha Mohamed",
    username: "@aisha_kitchen",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
    isVerified: true,
  },
  {
    id: "6",
    name: "Omar Hassan",
    username: "@omar_cooks",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
  },
];

// Mock posts
export const mockPosts: Post[] = [
  {
    id: "1",
    user: mockUsers[0],
    content:
      "Just made this amazing Chicken Biryani for my family! The aroma is incredible. The secret is to layer the rice and chicken perfectly. Who wants the recipe? 🍛✨",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=1200&h=800&fit=crop",
    type: "post",
    likes: 342,
    comments: 28,
    isLiked: false,
    createdAt: "2024-01-13T10:30:00Z",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    user: mockUsers[2],
    content:
      "New recipe alert! 🎉 I've just uploaded my signature Lamb Kabsa recipe to HalalMe Kitchen. It's been in my family for generations. Check it out!",
    image: "https://images.unsplash.com/photo-1595295333158-4742f28fbd85?w=1200&h=800&fit=crop",
    type: "recipe",
    recipeId: "3",
    recipeTitle: "Lamb Kabsa",
    likes: 521,
    comments: 45,
    isLiked: true,
    createdAt: "2024-01-13T08:15:00Z",
    timestamp: "4 hours ago",
  },
  {
    id: "3",
    user: mockUsers[1],
    content:
      "Sunday meal prep done! 💪 Made 5 different dishes including Butter Chicken, Falafel, and Shawarma. Ready for the week ahead! #MealPrep #HalalFood",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=800&fit=crop",
    type: "post",
    likes: 189,
    comments: 15,
    isLiked: false,
    createdAt: "2024-01-12T18:45:00Z",
    timestamp: "1 day ago",
  },
  {
    id: "4",
    user: mockUsers[3],
    content:
      "First time making homemade Falafel and they turned out perfect! Crispy on the outside, soft on the inside. Thanks to everyone who shared tips! 🧆",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&h=800&fit=crop",
    type: "post",
    likes: 276,
    comments: 32,
    isLiked: true,
    createdAt: "2024-01-12T14:20:00Z",
    timestamp: "1 day ago",
  },
  {
    id: "5",
    user: mockUsers[4],
    content:
      "Sharing my Moroccan Tagine recipe that my grandmother taught me. It's a labor of love but so worth it! 🍲 Recipe now live on HalalMe Kitchen.",
    image: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=1200&h=800&fit=crop",
    type: "recipe",
    recipeId: "6",
    recipeTitle: "Moroccan Tagine",
    likes: 438,
    comments: 56,
    isLiked: false,
    createdAt: "2024-01-12T09:30:00Z",
    timestamp: "2 days ago",
  },
  {
    id: "6",
    user: mockUsers[5],
    content:
      "Quick question: What's your favorite halal protein to cook with? I'm looking for new recipe ideas! 🤔",
    type: "post",
    likes: 93,
    comments: 67,
    isLiked: false,
    createdAt: "2024-01-11T20:15:00Z",
    timestamp: "2 days ago",
  },
  {
    id: "7",
    user: mockUsers[0],
    content:
      "Weekend cooking challenge: Made Turkish Kebabs from scratch! The marinade makes all the difference. Drop a 🔥 if you want the recipe!",
    image: "https://images.unsplash.com/photo-1607623488235-e2e4ff8139b1?w=1200&h=800&fit=crop",
    type: "post",
    likes: 412,
    comments: 89,
    isLiked: true,
    createdAt: "2024-01-11T16:45:00Z",
    timestamp: "3 days ago",
  },
  {
    id: "8",
    user: mockUsers[2],
    content:
      "Hosting an Iftar dinner next week. Planning to serve Chicken Tikka Masala, fresh Naan, and Mango Lassi. Any other suggestions? 🌙",
    type: "post",
    likes: 156,
    comments: 43,
    isLiked: false,
    createdAt: "2024-01-11T11:20:00Z",
    timestamp: "3 days ago",
  },
];

// Mock comments
export const mockComments: Comment[] = [
  {
    id: "c1",
    postId: "1",
    user: mockUsers[1],
    content: "This looks absolutely delicious! Would love the recipe! 😍",
    likes: 12,
    isLiked: false,
    createdAt: "2024-01-13T10:45:00Z",
    timestamp: "1 hour ago",
  },
  {
    id: "c2",
    postId: "1",
    user: mockUsers[3],
    content: "The presentation is beautiful! What spices did you use?",
    likes: 8,
    isLiked: false,
    createdAt: "2024-01-13T11:00:00Z",
    timestamp: "1 hour ago",
  },
  {
    id: "c3",
    postId: "1",
    user: mockUsers[0],
    content:
      "Thanks everyone! I'll upload the full recipe to HalalMe Kitchen soon 🙏",
    likes: 15,
    isLiked: true,
    createdAt: "2024-01-13T11:15:00Z",
    timestamp: "45 min ago",
  },
  {
    id: "c4",
    postId: "2",
    user: mockUsers[4],
    content: "Just tried this recipe - absolutely amazing! Family loved it ❤️",
    likes: 24,
    isLiked: true,
    createdAt: "2024-01-13T09:30:00Z",
    timestamp: "3 hours ago",
  },
  {
    id: "c5",
    postId: "2",
    user: mockUsers[5],
    content: "Saving this for the weekend! Can't wait to try it 🔖",
    likes: 6,
    isLiked: false,
    createdAt: "2024-01-13T10:00:00Z",
    timestamp: "2 hours ago",
  },
  {
    id: "c6",
    postId: "4",
    user: mockUsers[2],
    content: "These look perfect! The secret is to not over-mix the batter 👌",
    likes: 18,
    isLiked: false,
    createdAt: "2024-01-12T15:00:00Z",
    timestamp: "1 day ago",
  },
  {
    id: "c7",
    postId: "4",
    user: mockUsers[3],
    content: "Thank you! I'll keep that in mind next time 😊",
    likes: 5,
    isLiked: true,
    createdAt: "2024-01-12T15:30:00Z",
    timestamp: "1 day ago",
  },
  {
    id: "c8",
    postId: "7",
    user: mockUsers[1],
    content: "🔥🔥🔥 YES PLEASE! Drop that recipe!",
    likes: 31,
    isLiked: true,
    createdAt: "2024-01-11T17:00:00Z",
    timestamp: "3 days ago",
  },
];
