/**
 * High-quality, reliable Unsplash product image resolver.
 * Maps product types and keyword terms to crisp, vivid product photography.
 */

const IMAGE_MAP = [
  // --- Electronics ---
  {
    keywords: ["tv", "television", "sony 50", "screen", "display", "monitor", "4k"],
    url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["airpods", "earbuds", "earphone", "headphones", "bose", "sony wh", "beats"],
    url: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["garmin", "forerunner", "watch", "smartwatch", "apple watch", "fitness"],
    url: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["laptop", "macbook", "dell", "hp", "lenovo", "thinkpad", "computer"],
    url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["phone", "iphone", "samsung", "galaxy", "pixel", "smartphone", "mobile"],
    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["camera", "dslr", "canon", "nikon", "sony a", "lens", "gopro"],
    url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["speaker", "bluetooth", "jbl", "soundbar", "audio", "echo"],
    url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["tablet", "ipad", "surface", "kindle"],
    url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["drone", "gimbal", "gaming", "playstation", "xbox", "nintendo", "console"],
    url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=700&q=80",
  },
  {
    category: "Electronics",
    url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80",
  },

  // --- Clothing & Fashion ---
  {
    keywords: ["polo", "shirt", "t-shirt", "tshirt", "tee", "top"],
    url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["hoodie", "sweatshirt", "sweater", "pullover", "cardigan"],
    url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["shoes", "sneakers", "running", "boots", "nike", "adidas", "loafers"],
    url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["jacket", "coat", "blazer", "denim jacket", "leather", "parka"],
    url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["jeans", "pants", "trousers", "chinos", "denim", "shorts"],
    url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["dress", "skirt", "gown", "sundress"],
    url: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["bag", "backpack", "wallet", "purse", "sunglasses", "belt"],
    url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
  },
  {
    category: "Clothing",
    url: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=700&q=80",
  },

  // --- Books ---
  {
    keywords: ["outsiders", "novel", "fiction", "gatsby", "mockingbird", "catcher", "potter"],
    url: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["guide", "learn", "science", "physics", "code", "programming", "python", "javascript", "history"],
    url: "https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["business", "money", "habits", "psychology", "atomic", "finance"],
    url: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&w=700&q=80",
  },
  {
    category: "Books",
    url: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=700&q=80",
  },

  // --- Sports & Fitness ---
  {
    keywords: ["dumbbell", "weights", "workout", "fitness", "gym", "yoga", "mat", "kettlebell"],
    url: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["flask", "bottle", "hydration", "sports", "water bottle"],
    url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["massage gun", "recovery", "therapy"],
    url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=700&q=80",
  },
  {
    category: "Sports",
    url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=700&q=80",
  },

  // --- Beauty & Personal Care ---
  {
    keywords: ["serum", "skincare", "cream", "moisturizer", "vitamin c", "face"],
    url: "https://images.unsplash.com/photo-1608248597359-00f8626600c0?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["perfume", "cologne", "fragrance", "scent"],
    url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["cleanser", "grooming", "trimmer", "shave"],
    url: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=700&q=80",
  },
  {
    category: "Beauty",
    url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=700&q=80",
  },

  // --- Toys & Gaming ---
  {
    keywords: ["controller", "dualsense", "playstation", "xbox", "gaming", "switch", "nintendo"],
    url: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=700&q=80",
  },
  {
    keywords: ["lego", "toy", "puzzle", "drone", "board game"],
    url: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=700&q=80",
  },
  {
    category: "Toys",
    url: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=700&q=80",
  },

  // --- Home & General ---
  {
    keywords: ["espresso", "coffee", "purifier", "air purifier", "desk", "chair"],
    url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80",
  },
  {
    category: "Home",
    url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=700&q=80",
  },
];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=700&q=80";

/**
 * Returns a high-quality product image URL based on product properties.
 */
export const getProductImage = (product) => {
  if (!product) return DEFAULT_IMAGE;

  // If the product has a real, working image (not via.placeholder.com)
  if (
    product.imageUrl &&
    typeof product.imageUrl === "string" &&
    product.imageUrl.startsWith("http") &&
    !product.imageUrl.includes("via.placeholder.com")
  ) {
    return product.imageUrl;
  }

  const name = (product.name || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const type = (product.type || "").toLowerCase();

  // Keyword match first
  for (const item of IMAGE_MAP) {
    if (item.keywords) {
      for (const kw of item.keywords) {
        if (name.includes(kw) || desc.includes(kw)) {
          return item.url;
        }
      }
    }
  }

  // Category fallback
  for (const item of IMAGE_MAP) {
    if (item.category && item.category.toLowerCase() === type) {
      return item.url;
    }
  }

  return DEFAULT_IMAGE;
};

export default getProductImage;
