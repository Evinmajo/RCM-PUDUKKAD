import wellness from "@/assets/cat-wellness.jpg";
import personal from "@/assets/cat-personal.jpg";
import home from "@/assets/cat-home.jpg";
import hero from "@/assets/hero.jpg";

export const CATEGORIES = [
  { slug: "wellness", name: "Health & Wellness", image: wellness },
  { slug: "personal-care", name: "Personal Care", image: personal },
  { slug: "home-care", name: "Home Care", image: home },
  { slug: "kitchen", name: "Kitchen Essentials", image: hero },
];

const img = { wellness, "personal-care": personal, "home-care": home, kitchen: hero };

const raw = [
  ["Moringa Leaf Powder 100g", "wellness", 249, 40, true],
  ["Amla Vitamin C Powder 100g", "wellness", 199, 25, true],
  ["Nutri Health Drink 500g", "wellness", 549, 12, false],
  ["Herbal Immunity Tea 50 bags", "wellness", 320, 0, false],
  ["Ashwagandha Capsules 60s", "wellness", 450, 18, true],
  ["Cold-Pressed Coconut Oil 500ml", "personal-care", 289, 60, true],
  ["Jasmine Herbal Shampoo 300ml", "personal-care", 225, 30, false],
  ["Neem & Turmeric Soap (Pack of 4)", "personal-care", 160, 80, true],
  ["Aloe Vera Face Gel 100g", "personal-care", 175, 5, false],
  ["Herbal Toothpaste 150g", "personal-care", 95, 100, false],
  ["Lemon Neem Dishwash 500ml", "home-care", 110, 70, true],
  ["Plant-Based Detergent 1kg", "home-care", 235, 45, false],
  ["Floor Cleaner Lemon 1L", "home-care", 189, 3, false],
  ["Toilet Cleaner 500ml", "home-care", 99, 0, false],
  ["Gamma Rice Bran Oil 1L", "kitchen", 210, 50, true],
  ["Kerala Sambar Masala 200g", "kitchen", 89, 90, false],
  ["Organic Jaggery Powder 500g", "kitchen", 130, 35, false],
  ["Red Matta Rice 5kg", "kitchen", 420, 20, false],
];

export const PRODUCTS = raw.map(([name, category, price, stock, featured], i) => ({
  id: `p${i + 1}`,
  name,
  category,
  price,
  mrp: Math.round(price * 1.18),
  stock,
  featured,
  images: [img[category], hero],
  description: `${name} — carefully selected for everyday family use. Trusted quality from HANNAN SUPERMARKET-RCM PUDUKKAD, delivered to your doorstep across Thrissur and Kerala.`,
}));

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
export const categoryName = (slug) => CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
export const heroImage = hero;
