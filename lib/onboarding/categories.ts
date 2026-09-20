export type Category = {
  id: string;
  label: string;
  emoji: string;
  subNiches: string[];
  interests: string[];
};

export const CATEGORIES: Category[] = [
  {
    id: "cafe",
    label: "Cafe",
    emoji: "☕",
    subNiches: ["Specialty coffee & brunch", "Chai & snacks", "Dessert cafe", "Study / work cafe", "Cafe + bakery"],
    interests: ["Coffee", "Brunch", "Working remotely", "Aesthetic spots", "Desserts", "Reading", "Dates & hangouts"],
  },
  {
    id: "restaurant",
    label: "Restaurant",
    emoji: "🍛",
    subNiches: ["North Indian", "South Indian", "Street food", "Fine dining", "Cloud kitchen", "Multi-cuisine", "Biryani specialist"],
    interests: ["Foodie", "Family dinners", "Weekend outings", "Late-night cravings", "Regional cuisine", "Party orders"],
  },
  {
    id: "bakery",
    label: "Bakery",
    emoji: "🎂",
    subNiches: ["Custom cakes", "Artisan breads", "Cookies & brownies", "Eggless / vegan bakes", "Home bakery"],
    interests: ["Birthdays", "Celebrations", "Baking", "Gifting", "Desserts", "Kids' parties"],
  },
  {
    id: "salon",
    label: "Salon / Spa",
    emoji: "💇",
    subNiches: ["Unisex salon", "Bridal makeup", "Men's grooming", "Nail studio", "Spa & wellness", "Hair specialist"],
    interests: ["Self-care", "Weddings", "Skincare", "Hair trends", "Fashion", "Festive looks"],
  },
  {
    id: "gym",
    label: "Gym / Fitness",
    emoji: "🏋️",
    subNiches: ["Gym & strength", "Yoga studio", "Zumba / dance fitness", "CrossFit", "Personal training", "Martial arts"],
    interests: ["Fitness", "Weight loss", "Muscle building", "Wellness", "Nutrition", "Morning routines"],
  },
  {
    id: "boutique",
    label: "Boutique",
    emoji: "👗",
    subNiches: ["Ethnic wear", "Western wear", "Kids' fashion", "Bridal couture", "Handloom & sustainable", "Jewellery"],
    interests: ["Fashion", "Weddings", "Festive shopping", "Ethnic style", "Accessories", "Gifting"],
  },
  {
    id: "retail",
    label: "Shop / Retail",
    emoji: "🛍️",
    subNiches: ["Kirana / grocery", "Electronics", "Home decor", "Stationery & gifts", "Pet supplies", "Organic store"],
    interests: ["Deals & offers", "Home", "Family", "Convenience", "Gifting", "Local shopping"],
  },
  {
    id: "tuition",
    label: "Tuition / Classes",
    emoji: "📚",
    subNiches: ["School tuition", "Competitive exams", "Music classes", "Art & craft", "Language classes", "Coding for kids"],
    interests: ["Parenting", "Education", "Exam prep", "Hobbies", "Skill building", "Kids' activities"],
  },
  {
    id: "other",
    label: "Something else",
    emoji: "✨",
    subNiches: [],
    interests: ["Local community", "Deals & offers", "Quality service", "Family", "Lifestyle"],
  },
];

export const AGE_GROUPS = ["18–24", "25–34", "35–44", "45+", "Families with kids"] as const;

export const VOICES = [
  { id: "warm", label: "Warm & friendly", emoji: "🤗" },
  { id: "witty", label: "Fun & witty", emoji: "😄" },
  { id: "premium", label: "Polished & premium", emoji: "✨" },
  { id: "no-nonsense", label: "Simple & direct", emoji: "👍" },
] as const;

export const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Bhopal", "Chandigarh", "Kochi", "Goa", "Dehradun", "Guwahati",
];

export function getCategory(id: string) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}
