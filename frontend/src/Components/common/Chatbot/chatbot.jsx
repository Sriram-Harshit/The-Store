import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { addToCart } from "../../../store/slices/cartSlice";
import { fetchProducts } from "../../../store/slices/productsSlice";
import { getProductImage } from "../../../utils/productImages";
import "./chatbot.css";

const QUICK_PROMPTS = [
  { label: "🎯 Find My Perfect Product", action: "start_wizard" },
  { label: "🔥 Best Sellers", query: "Show me best sellers" },
  { label: "💻 Top Laptops & Tech", query: "Show top electronics" },
  { label: "📺 Smart TVs", query: "Show smart TVs" },
  { label: "🚚 Shipping Policy", query: "What is your shipping policy?" },
  { label: "🔄 Returns & Warranty", query: "How do returns work?" },
];

let msgCounter = 0;
const getNextId = (prefix) => {
  msgCounter += 1;
  return `${prefix}-${msgCounter}`;
};

const getTimestampString = () => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const INITIAL_MESSAGES = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "Hello! 👋 I'm your AI Shopping Assistant at TheStore.\n\nI can help you find exactly what you need by walking through your **product requirement**, your **budget**, and your **intended use**!",
    options: [
      { label: "🎯 Find Me a Product (3-Step Match)", action: "start_wizard" },
      { label: "🔥 Browse Best Sellers", action: "best_sellers" },
      { label: "🚚 Shipping & Delivery Policy", action: "faq_shipping" },
    ],
    timestamp: "Just now",
  },
];

const Chatbot = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [addingId, setAddingId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(1);

  // One-by-One Discovery State:
  // step: "requirement" -> "price" -> "use" -> "completed"
  const [wizardState, setWizardState] = useState({
    active: false,
    step: null,
    collected: {
      requirement: "",
      requirementLabel: "",
      category: "",
      priceMin: 0,
      priceMax: Infinity,
      priceLabel: "",
      use: "",
      useLabel: "",
    },
  });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Redux Store Data
  const rawProducts = useSelector((state) => state.products?.items);
  const products = Array.isArray(rawProducts) ? rawProducts : [];
  const rawCart = useSelector((state) => state.cart?.items);
  const cartItems = Array.isArray(rawCart) ? rawCart : [];
  const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  useEffect(() => {
    if (products.length === 0) {
      dispatch(fetchProducts());
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    const handleGlobalOpen = () => {
      setIsOpen(true);
      setUnreadCount(0);
    };
    window.addEventListener("open-chatbot", handleGlobalOpen);
    return () => window.removeEventListener("open-chatbot", handleGlobalOpen);
  }, []);

  const handleOpen = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleClearChat = () => {
    setWizardState({
      active: false,
      step: null,
      collected: {
        requirement: "",
        requirementLabel: "",
        category: "",
        priceMin: 0,
        priceMax: Infinity,
        priceLabel: "",
        use: "",
        useLabel: "",
      },
    });
    setMessages([
      {
        id: getNextId("cleared-msg"),
        sender: "bot",
        text: "Chat cleared! How can I help you find the perfect product today?",
        options: [
          { label: "🎯 Find My Perfect Product", action: "start_wizard" },
          { label: "🔥 Browse Best Sellers", action: "best_sellers" },
        ],
        timestamp: getTimestampString(),
      },
    ]);
  };

  const handleInspectProduct = (product) => {
    window.dispatchEvent(new CustomEvent("open-product-modal", { detail: product }));
  };

  const handleAddToCart = async (product) => {
    if (!product || !product._id) return;
    setAddingId(product._id);
    try {
      await dispatch(addToCart({ productId: product._id, quantity: 1 })).unwrap();
      const botReply = {
        id: getNextId("cart-success"),
        sender: "bot",
        text: `✨ Added "${product.name}" to your cart!`,
        action: { label: "Go to Cart", to: "/cart" },
        timestamp: getTimestampString(),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch {
      const botReply = {
        id: getNextId("cart-fail"),
        sender: "bot",
        text: "Couldn't add to cart. Please make sure you are logged in.",
        action: { label: "Log In", to: "/login" },
        timestamp: getTimestampString(),
      };
      setMessages((prev) => [...prev, botReply]);
    } finally {
      setAddingId(null);
    }
  };

  /* =========================================================================
     STEP 1: PRODUCT REQUIREMENT
     ========================================================================= */
  const startRecommendationFlow = () => {
    setWizardState({
      active: true,
      step: "requirement",
      collected: {
        requirement: "",
        requirementLabel: "",
        category: "",
        priceMin: 0,
        priceMax: Infinity,
        priceLabel: "",
        use: "",
        useLabel: "",
      },
    });

    const step1Msg = {
      id: getNextId("bot-step1"),
      sender: "bot",
      text: "👋 Let's find your ideal product step-by-step!\n\n**Step 1 of 3: What product or item are you looking for?**\nChoose a category or type what you need (e.g. *'Sony 50 inch TV'*, *'Gaming Laptop'*, *'Wireless Earbuds'*, *'Casual Shirt'*, *'Programming Book'*):",
      options: [
        { label: "💻 Laptops & Computers", value: "laptop", category: "Electronics", step: "requirement" },
        { label: "📺 Smart TVs & Displays", value: "tv", category: "Electronics", step: "requirement" },
        { label: "📱 Phones & Audio Gear", value: "audio", category: "Electronics", step: "requirement" },
        { label: "👗 Fashion & Apparel", value: "clothing", category: "Clothing", step: "requirement" },
        { label: "🏠 Home & Lifestyle", value: "home", category: "Home", step: "requirement" },
        { label: "📚 Books & Learning", value: "books", category: "Books", step: "requirement" },
        { label: "🏃 Sports & Fitness Gear", value: "sports", category: "Sports", step: "requirement" },
        { label: "✨ Beauty & Personal Care", value: "beauty", category: "Beauty", step: "requirement" },
        { label: "🎮 Gaming Consoles & Toys", value: "toys", category: "Toys", step: "requirement" },
      ],
      timestamp: getTimestampString(),
    };

    setMessages((prev) => [...prev, step1Msg]);
  };

  /* =========================================================================
     DYNAMIC INVENTORY MATCHING & PRICE TIER GENERATOR
     ========================================================================= */
  const getMatchingProductsForRequirement = (reqValue, catHint, catalog = products) => {
    if (!catalog || catalog.length === 0) return [];
    const reqLower = (reqValue || "").toLowerCase().trim();
    const catLower = (catHint || "").toLowerCase().trim();

    // Specific product-type keyword flags
    const isLaptop =
      reqLower.includes("laptop") ||
      reqLower.includes("macbook") ||
      reqLower.includes("computer") ||
      reqLower.includes("notebook") ||
      reqLower.includes("pc");
    const isTv =
      reqLower.includes("tv") ||
      reqLower.includes("display") ||
      reqLower.includes("television") ||
      reqLower.includes("screen");
    const isAudio =
      reqLower.includes("audio") ||
      reqLower.includes("headphone") ||
      reqLower.includes("earbud") ||
      reqLower.includes("earphone") ||
      reqLower.includes("speaker") ||
      reqLower.includes("sound");
    const isPhone =
      reqLower.includes("phone") ||
      reqLower.includes("mobile") ||
      reqLower.includes("iphone") ||
      reqLower.includes("smartphone");
    const isClothing =
      reqLower.includes("cloth") ||
      reqLower.includes("shirt") ||
      reqLower.includes("pant") ||
      reqLower.includes("jacket") ||
      reqLower.includes("suit") ||
      reqLower.includes("apparel") ||
      reqLower.includes("fashion") ||
      reqLower.includes("wear");
    const isBook =
      reqLower.includes("book") ||
      reqLower.includes("read") ||
      reqLower.includes("novel") ||
      reqLower.includes("author") ||
      reqLower.includes("guide");
    const isHome =
      reqLower.includes("home") ||
      reqLower.includes("chair") ||
      reqLower.includes("purifier") ||
      reqLower.includes("furniture") ||
      reqLower.includes("lifestyle") ||
      reqLower.includes("decor") ||
      reqLower.includes("lamp") ||
      reqLower.includes("coffee") ||
      reqLower.includes("desk");
    const isSports =
      reqLower.includes("sport") ||
      reqLower.includes("fitness") ||
      reqLower.includes("gym") ||
      reqLower.includes("workout") ||
      reqLower.includes("dumbbell") ||
      reqLower.includes("weights") ||
      reqLower.includes("yoga") ||
      reqLower.includes("garmin") ||
      reqLower.includes("bottle") ||
      reqLower.includes("flask");
    const isBeauty =
      reqLower.includes("beauty") ||
      reqLower.includes("skin") ||
      reqLower.includes("cream") ||
      reqLower.includes("serum") ||
      reqLower.includes("perfume") ||
      reqLower.includes("cologne") ||
      reqLower.includes("fragrance") ||
      reqLower.includes("cleanser") ||
      reqLower.includes("trimmer") ||
      reqLower.includes("grooming");
    const isToys =
      reqLower.includes("toy") ||
      reqLower.includes("game") ||
      reqLower.includes("gaming") ||
      reqLower.includes("controller") ||
      reqLower.includes("playstation") ||
      reqLower.includes("xbox") ||
      reqLower.includes("nintendo") ||
      reqLower.includes("switch") ||
      reqLower.includes("lego") ||
      reqLower.includes("drone");

    let matched = catalog.filter((p) => {
      const pName = (p.name || "").toLowerCase();
      const pType = (p.type || "").toLowerCase();
      const pBrand = (p.brand || "").toLowerCase();
      const pDesc = (p.description || "").toLowerCase();
      const fullText = `${pName} ${pType} ${pBrand} ${pDesc}`;

      if (isLaptop) {
        return (
          pName.includes("laptop") ||
          pName.includes("macbook") ||
          pName.includes("thinkpad") ||
          pName.includes("xps") ||
          pName.includes("rog zephyrus") ||
          pDesc.includes("laptop") ||
          (pType === "electronics" && (fullText.includes("laptop") || fullText.includes("notebook")))
        );
      }
      if (isTv) {
        return (
          pName.includes("tv") ||
          pName.includes("bravia") ||
          pName.includes("qled") ||
          pDesc.includes("smart tv") ||
          fullText.includes("television")
        );
      }
      if (isAudio) {
        return (
          pName.includes("headphone") ||
          pName.includes("wh-1000xm5") ||
          pName.includes("quietcomfort") ||
          fullText.includes("audio") ||
          fullText.includes("anc")
        );
      }
      if (isPhone) {
        return (
          pName.includes("iphone") ||
          pName.includes("phone") ||
          fullText.includes("smartphone")
        );
      }
      if (isClothing) {
        return (
          pType === "clothing" ||
          fullText.includes("jacket") ||
          fullText.includes("cotton") ||
          fullText.includes("suit")
        );
      }
      if (isBook) {
        return (
          pType === "books" ||
          fullText.includes("pragmatic") ||
          fullText.includes("clean code") ||
          fullText.includes("designing data")
        );
      }
      if (isHome) {
        return (
          pType === "home" ||
          fullText.includes("chair") ||
          fullText.includes("purifier") ||
          fullText.includes("lamp") ||
          fullText.includes("espresso")
        );
      }
      if (isSports) {
        return (
          pType === "sports" ||
          fullText.includes("dumbbell") ||
          fullText.includes("yoga") ||
          fullText.includes("workout") ||
          fullText.includes("fitness") ||
          fullText.includes("flask")
        );
      }
      if (isBeauty) {
        return (
          pType === "beauty" ||
          fullText.includes("serum") ||
          fullText.includes("cream") ||
          fullText.includes("perfume") ||
          fullText.includes("cleanser") ||
          fullText.includes("trimmer")
        );
      }
      if (isToys) {
        return (
          pType === "toys" ||
          fullText.includes("controller") ||
          fullText.includes("nintendo") ||
          fullText.includes("lego") ||
          fullText.includes("drone") ||
          fullText.includes("console")
        );
      }

      if (catLower && pType === catLower) {
        return true;
      }

      return fullText.includes(reqLower);
    });

    if (matched.length === 0 && catLower) {
      matched = catalog.filter((p) => (p.type || "").toLowerCase() === catLower);
    }

    return matched.length > 0 ? matched : catalog;
  };

  const generateDynamicPriceOptions = (matchingProducts) => {
    const validPrices = matchingProducts
      .map((p) => Number(p.price))
      .filter((p) => !isNaN(p) && p > 0)
      .sort((a, b) => a - b);

    if (validPrices.length === 0) {
      return [
        { label: "💵 Budget (Under $100)", min: 0, max: 100, labelText: "Under $100", step: "price" },
        { label: "💳 Mid-Range ($100 – $500)", min: 100, max: 500, labelText: "$100 – $500", step: "price" },
        { label: "💎 Premium ($500+)", min: 500, max: Infinity, labelText: "$500+", step: "price" },
        { label: "🌈 Any Budget", min: 0, max: Infinity, labelText: "Any Budget", step: "price" },
      ];
    }

    const minP = validPrices[0];
    const maxP = validPrices[validPrices.length - 1];

    if (minP === maxP) {
      return [
        {
          label: `🏷️ Available at $${minP.toFixed(2)} (${matchingProducts.length} in stock)`,
          min: 0,
          max: maxP + 10,
          labelText: `$${minP.toFixed(2)}`,
          step: "price",
        },
        {
          label: "🌈 Any Budget",
          min: 0,
          max: Infinity,
          labelText: "Any Budget",
          step: "price",
        },
      ];
    }

    const spread = maxP - minP;

    // Tight spread (diff <= 50, e.g. Books $36.99 to $49.99)
    if (spread <= 50) {
      const mid = Math.round((minP + maxP) / 2);
      const countUnderMid = matchingProducts.filter((p) => p.price <= mid).length;
      const countAboveMid = matchingProducts.filter((p) => p.price > mid).length;
      return [
        {
          label: `🏷️ Under $${mid} (${countUnderMid} available from $${minP.toFixed(2)})`,
          min: 0,
          max: mid,
          labelText: `Under $${mid}`,
          step: "price",
        },
        {
          label: `💳 $${mid} – $${Math.ceil(maxP)} (${countAboveMid} available up to $${maxP.toFixed(2)})`,
          min: mid,
          max: maxP + 1,
          labelText: `$${mid} – $${Math.ceil(maxP)}`,
          step: "price",
        },
        {
          label: `🌈 All In-Stock Options ($${minP.toFixed(2)} – $${maxP.toFixed(2)})`,
          min: 0,
          max: Infinity,
          labelText: `All in stock ($${minP.toFixed(2)} – $${maxP.toFixed(2)})`,
          step: "price",
        },
      ];
    }

    // Medium spread (diff <= 400, e.g. TVs $1499 - $1699, Home $145 - $449)
    if (spread <= 400) {
      let splitPoint = Math.round((minP + spread * 0.5) / 25) * 25;
      if (splitPoint <= minP) splitPoint = Math.ceil(minP + 25);
      if (splitPoint >= maxP) splitPoint = Math.floor(maxP - 10);

      const count1 = matchingProducts.filter((p) => p.price <= splitPoint).length;
      const count2 = matchingProducts.filter((p) => p.price > splitPoint).length;

      return [
        {
          label: `🏷️ Under $${splitPoint.toLocaleString()} (${count1} item${count1 > 1 ? "s" : ""}, from $${minP.toFixed(0)})`,
          min: 0,
          max: splitPoint,
          labelText: `Under $${splitPoint.toLocaleString()}`,
          step: "price",
        },
        {
          label: `💳 $${splitPoint.toLocaleString()} – $${Math.ceil(maxP).toLocaleString()} (${count2} item${count2 > 1 ? "s" : ""})`,
          min: splitPoint,
          max: maxP + 1,
          labelText: `$${splitPoint.toLocaleString()} – $${Math.ceil(maxP).toLocaleString()}`,
          step: "price",
        },
        {
          label: `🌈 View All (${matchingProducts.length} in stock: $${minP.toFixed(0)} – $${maxP.toFixed(0)})`,
          min: 0,
          max: Infinity,
          labelText: `All in stock ($${minP.toFixed(0)} – $${maxP.toFixed(0)})`,
          step: "price",
        },
      ];
    }

    // High spread (e.g. Laptops $799.99 - $3,499.00, Clothing $68 - $489, Audio $348 - $1199)
    let cutoff1, cutoff2;
    if (minP >= 600) {
      // High-ticket products like Laptops
      cutoff1 = 1200;
      cutoff2 = 2200;
      if (cutoff1 <= minP) cutoff1 = Math.round((minP + 400) / 100) * 100;
      if (cutoff2 <= cutoff1) cutoff2 = cutoff1 + 800;
    } else {
      cutoff1 = Math.round((minP + spread * 0.35) / 50) * 50;
      cutoff2 = Math.round((minP + spread * 0.7) / 50) * 50;
      if (cutoff1 <= minP) cutoff1 = Math.ceil(minP + 50);
      if (cutoff2 <= cutoff1) cutoff2 = cutoff1 + 100;
    }

    const countTier1 = matchingProducts.filter((p) => p.price <= cutoff1).length;
    const countTier2 = matchingProducts.filter((p) => p.price > cutoff1 && p.price <= cutoff2).length;
    const countTier3 = matchingProducts.filter((p) => p.price > cutoff2).length;

    const options = [];
    if (countTier1 > 0) {
      options.push({
        label: `🏷️ Under $${cutoff1.toLocaleString()} (${countTier1} option${countTier1 > 1 ? "s" : ""}, from $${minP.toFixed(0)})`,
        min: 0,
        max: cutoff1,
        labelText: `Under $${cutoff1.toLocaleString()}`,
        step: "price",
      });
    }
    if (countTier2 > 0) {
      options.push({
        label: `💳 $${cutoff1.toLocaleString()} – $${cutoff2.toLocaleString()} (${countTier2} option${countTier2 > 1 ? "s" : ""})`,
        min: cutoff1,
        max: cutoff2,
        labelText: `$${cutoff1.toLocaleString()} – $${cutoff2.toLocaleString()}`,
        step: "price",
      });
    }
    if (countTier3 > 0) {
      options.push({
        label: `💎 Above $${cutoff2.toLocaleString()} (${countTier3} flagship)`,
        min: cutoff2,
        max: Infinity,
        labelText: `Above $${cutoff2.toLocaleString()}`,
        step: "price",
      });
    }

    options.push({
      label: `🌈 View All (${matchingProducts.length} in stock: $${minP.toFixed(0)} – $${maxP.toFixed(0)})`,
      min: 0,
      max: Infinity,
      labelText: `All in stock ($${minP.toFixed(0)} – $${maxP.toFixed(0)})`,
      step: "price",
    });

    return options;
  };

  const handleRequirementChoice = (value, labelText, categoryHint) => {
    // Infer category if not directly passed
    let inferredCategory = categoryHint || "";
    const lower = (value || "").toLowerCase();
    if (!inferredCategory) {
      if (
        lower.includes("tv") ||
        lower.includes("laptop") ||
        lower.includes("phone") ||
        lower.includes("audio") ||
        lower.includes("headphone") ||
        lower.includes("electronic") ||
        lower.includes("macbook")
      ) {
        inferredCategory = "Electronics";
      } else if (
        lower.includes("shirt") ||
        lower.includes("pant") ||
        lower.includes("dress") ||
        lower.includes("cloth") ||
        lower.includes("jacket") ||
        lower.includes("shoe")
      ) {
        inferredCategory = "Clothing";
      } else if (
        lower.includes("book") ||
        lower.includes("novel") ||
        lower.includes("read") ||
        lower.includes("author")
      ) {
        inferredCategory = "Books";
      } else if (
        lower.includes("chair") ||
        lower.includes("table") ||
        lower.includes("home") ||
        lower.includes("decor") ||
        lower.includes("lamp") ||
        lower.includes("coffee")
      ) {
        inferredCategory = "Home";
      } else if (
        lower.includes("sport") ||
        lower.includes("fitness") ||
        lower.includes("gym") ||
        lower.includes("dumbbell") ||
        lower.includes("yoga")
      ) {
        inferredCategory = "Sports";
      } else if (
        lower.includes("beauty") ||
        lower.includes("skin") ||
        lower.includes("cream") ||
        lower.includes("serum") ||
        lower.includes("perfume") ||
        lower.includes("cologne")
      ) {
        inferredCategory = "Beauty";
      } else if (
        lower.includes("toy") ||
        lower.includes("lego") ||
        lower.includes("switch") ||
        lower.includes("controller") ||
        lower.includes("console")
      ) {
        inferredCategory = "Toys";
      }
    }

    const updated = {
      ...wizardState.collected,
      requirement: value,
      requirementLabel: labelText || value,
      category: inferredCategory,
    };

    setWizardState({
      active: true,
      step: "price",
      collected: updated,
    });

    // Advance to Step 2: Dynamically calculate prices from real inventory
    const reqDisplay = labelText || value;
    const matchingProducts = getMatchingProductsForRequirement(value, inferredCategory, products);
    const validPrices = matchingProducts
      .map((p) => Number(p.price))
      .filter((p) => !isNaN(p) && p > 0);
    const minPrice = validPrices.length ? Math.min(...validPrices) : null;
    const maxPrice = validPrices.length ? Math.max(...validPrices) : null;

    const dynamicPriceOptions = generateDynamicPriceOptions(matchingProducts);

    let priceIntro = `Great choice: **${reqDisplay}**! 💰\n\n`;
    if (minPrice !== null && maxPrice !== null) {
      if (minPrice === maxPrice) {
        priceIntro += `In our system, this is priced at **$${minPrice.toFixed(2)}**.\n\n`;
      } else {
        priceIntro += `In our system, we currently have **${matchingProducts.length} matching item${matchingProducts.length > 1 ? "s" : ""}**, with prices starting from **$${minPrice.toFixed(2)}** up to **$${maxPrice.toFixed(2)}**.\n\n`;
      }
    }
    priceIntro += `**Step 2 of 3: What is your price budget?**\nSelect an available price tier based on our live inventory, or type your target budget:`;

    const step2Msg = {
      id: getNextId("bot-step2"),
      sender: "bot",
      text: priceIntro,
      options: dynamicPriceOptions,
      timestamp: getTimestampString(),
    };

    setMessages((prev) => [...prev, step2Msg]);
  };

  /* =========================================================================
     STEP 2: PRICE / BUDGET
     ========================================================================= */
  const handlePriceChoice = (min, max, labelText) => {
    const updated = {
      ...wizardState.collected,
      priceMin: min,
      priceMax: max,
      priceLabel: labelText || `$${min} - $${max}`,
    };

    setWizardState({
      active: true,
      step: "use",
      collected: updated,
    });

    // Build tailored Use options based on requirement
    const req = (updated.requirement || "").toLowerCase();
    let useOptions = [];

    if (req.includes("tv") || req.includes("display") || req.includes("screen")) {
      useOptions = [
        { label: "🍿 Cinema, Movies & 4K Streaming (Pristine Picture)", value: "cinema", labelText: "Movies & 4K Streaming", step: "use" },
        { label: "🎮 Next-Gen Console Gaming (120Hz & Low Latency)", value: "gaming", labelText: "Gaming & VRR", step: "use" },
        { label: "👨‍👩‍👧 Everyday Family Living Room Entertainment", value: "family", labelText: "Living Room & Family", step: "use" },
        { label: "🔊 High-Fidelity Audio & Smart Features", value: "smart", labelText: "Smart Audio & Apps", step: "use" },
      ];
    } else if (req.includes("laptop") || req.includes("computer") || req.includes("macbook")) {
      useOptions = [
        { label: "🎮 High-Performance Gaming & 3D Rendering", value: "gaming", labelText: "Gaming & 3D Graphics", step: "use" },
        { label: "💻 Software Engineering, Coding & Multitasking", value: "coding", labelText: "Programming & Dev", step: "use" },
        { label: "🎓 College Study, Productivity & Web Browsing", value: "office", labelText: "Study & Everyday Office", step: "use" },
        { label: "🎬 4K Video Editing & Creative Content", value: "editing", labelText: "Video Editing & Creative", step: "use" },
      ];
    } else if (req.includes("phone") || req.includes("audio") || req.includes("headphone") || req.includes("earbuds")) {
      useOptions = [
        { label: "🎧 Active Noise Cancellation (ANC) & Studio Fidelity", value: "anc", labelText: "ANC & Studio Sound", step: "use" },
        { label: "🏃 Sports, Workouts & All-Weather Durability", value: "sports", labelText: "Gym & Sports", step: "use" },
        { label: "📸 Pro 48MP+ Photography & 4K Cinema Video", value: "camera", labelText: "Photography & Video", step: "use" },
        { label: "🔋 Multi-Day Battery Endurance & Rapid Charge", value: "battery", labelText: "Long Battery Life", step: "use" },
      ];
    } else if (req.includes("cloth") || req.includes("apparel") || req.includes("shirt") || req.includes("fashion")) {
      useOptions = [
        { label: "🌿 Everyday Casual & Breathable Comfort", value: "casual", labelText: "Daily Casual", step: "use" },
        { label: "👔 Formal Business, Meetings & Office Wear", value: "formal", labelText: "Formal Business", step: "use" },
        { label: "❄️ Winter Thermal Protection & Warmth", value: "winter", labelText: "Thermal & Winter", step: "use" },
        { label: "🏃 Athletic Workout & Moisture-Wicking Sports", value: "active", labelText: "Activewear & Gym", step: "use" },
      ];
    } else if (req.includes("book") || req.includes("read")) {
      useOptions = [
        { label: "💻 Tech Architecture, Programming & Systems", value: "tech", labelText: "Tech & Architecture", step: "use" },
        { label: "📈 Business Strategy, Startups & Leadership", value: "business", labelText: "Business & Leadership", step: "use" },
        { label: "🧠 Mindset, Habits & Personal Growth", value: "psychology", labelText: "Habits & Growth", step: "use" },
        { label: "📖 Gripping Fiction & Engaging Narratives", value: "fiction", labelText: "Fiction & Novels", step: "use" },
      ];
    } else if (req.includes("sport") || req.includes("fit") || req.includes("gym")) {
      useOptions = [
        { label: "🏋️ Heavy Strength Training & Home Gym", value: "strength", labelText: "Strength & Muscle Building", step: "use" },
        { label: "🧘 Yoga, Pilates, Stretching & Mobility", value: "yoga", labelText: "Yoga & Flexibility", step: "use" },
        { label: "🏃 Cardio, Running & Outdoor Hydration", value: "cardio", labelText: "Running & Outdoor Endurance", step: "use" },
        { label: "⚡ Rapid Muscle Recovery & Therapeutic Massage", value: "recovery", labelText: "Muscle Recovery", step: "use" },
      ];
    } else if (req.includes("beauty") || req.includes("skin") || req.includes("face")) {
      useOptions = [
        { label: "✨ Daily Hydration, Barrier Repair & Glow", value: "hydration", labelText: "Daily Barrier Hydration", step: "use" },
        { label: "🌟 Vitamin C Brightening & Dark Spot Correction", value: "brightening", labelText: "Brightening & Radiance", step: "use" },
        { label: "🌿 Natural Botanical Cologne & Scent", value: "fragrance", labelText: "Luxury Signature Fragrance", step: "use" },
        { label: "✂️ Precision Grooming & Gentle Sonic Cleansing", value: "grooming", labelText: "Sonic Cleansing & Shave", step: "use" },
      ];
    } else if (req.includes("toy") || req.includes("game") || req.includes("console")) {
      useOptions = [
        { label: "🎮 Next-Gen Ultra-Low Latency Gaming", value: "pro_gaming", labelText: "Pro Competitive Gaming", step: "use" },
        { label: "🧩 Creative Engineering, STEM & Architecture", value: "stem", labelText: "STEM & Creative Building", step: "use" },
        { label: "✈️ Aerial 4K Cinematography & Drone Flying", value: "drone", labelText: "Aerial 4K Cinematography", step: "use" },
        { label: "🎉 Family Entertainment & Casual Co-op", value: "family", labelText: "Family & Casual Fun", step: "use" },
      ];
    } else {
      useOptions = [
        { label: "⚡ Top-Tier Performance & Durability", value: "performance", labelText: "Top Performance", step: "use" },
        { label: "🌟 Best Overall Value for Money", value: "value", labelText: "Best Value", step: "use" },
        { label: "🎁 Everyday General Use / Gift", value: "general", labelText: "General Everyday Use", step: "use" },
      ];
    }

    const step3Msg = {
      id: getNextId("bot-step3"),
      sender: "bot",
      text: `Budget saved: **${updated.priceLabel}**! 🚀\n\n**Step 3 of 3: How will you primarily use this ${updated.requirementLabel}?**\nSelect your primary use case or type your specific needs:`,
      options: useOptions,
      timestamp: getTimestampString(),
    };

    setMessages((prev) => [...prev, step3Msg]);
  };

  /* =========================================================================
     STEP 3: PRIMARY USE -> FULFILL NEEDS
     ========================================================================= */
  const handleUseChoice = (useValue, useLabelText) => {
    const finalCollected = {
      ...wizardState.collected,
      use: useValue,
      useLabel: useLabelText || useValue,
    };

    setWizardState({
      active: false,
      step: "completed",
      collected: finalCollected,
    });

    setIsTyping(true);

    setTimeout(() => {
      fulfillNeeds(finalCollected);
      setIsTyping(false);
    }, 600);
  };

  /* =========================================================================
     FULFILL NEEDS: MULTI-PARAM MATCHING ENGINE
     ========================================================================= */
  const fulfillNeeds = (collected) => {
    const { requirement, category, priceMin, priceMax, use, useLabel } = collected;
    const reqLower = (requirement || "").toLowerCase();
    const useLower = (use || "").toLowerCase();

    let pool = [...products];

    // 1. Filter by category if known
    if (category) {
      pool = pool.filter((p) => p.type && p.type.toLowerCase() === category.toLowerCase());
    }

    // 2. Filter by requirement keywords
    if (reqLower && pool.length > 5) {
      const filteredByReq = pool.filter((p) => {
        const fullText = `${p.name} ${p.brand || ""} ${p.description || ""} ${JSON.stringify(p.specs || "")}`.toLowerCase();
        return (
          fullText.includes(reqLower) ||
          (reqLower.includes("tv") && (p.name.toLowerCase().includes("tv") || fullText.includes("television"))) ||
          (reqLower.includes("laptop") && (p.name.toLowerCase().includes("laptop") || fullText.includes("macbook") || fullText.includes("notebook"))) ||
          (reqLower.includes("phone") && (fullText.includes("phone") || fullText.includes("iphone") || fullText.includes("mobile"))) ||
          (reqLower.includes("audio") && (fullText.includes("headphone") || fullText.includes("earbuds") || fullText.includes("speaker")))
        );
      });
      if (filteredByReq.length > 0) {
        pool = filteredByReq;
      }
    }

    // 3. Filter by budget
    let budgetPool = pool.filter((p) => {
      const price = p.price || 0;
      return price >= (priceMin || 0) && price <= (priceMax || Infinity);
    });

    let fallbackNote = "";
    if (budgetPool.length === 0) {
      const sortedByPrice = [...pool].sort((a, b) => (a.price || 0) - (b.price || 0));
      const lowestInStock = sortedByPrice[0];

      if (lowestInStock && priceMax && priceMax < lowestInStock.price) {
        fallbackNote = `💡 **Inventory Note**: In our catalog, ${collected.requirementLabel || "matching items"} currently start from **$${lowestInStock.price.toFixed(2)}** (${lowestInStock.name}). While we don't have stock at ${collected.priceLabel}, here are the most affordable and best-matching options in our system:`;
        budgetPool = sortedByPrice;
      } else {
        fallbackNote = `💡 **Inventory Note**: No items strictly found within ${collected.priceLabel}. Showing the closest matching recommendations in stock:`;
        budgetPool = pool;
      }
    }

    // 4. Score based on requirement, use, specs, and ratings
    const scored = budgetPool.map((p) => {
      let score = 50;
      const s = p.specs || {};
      const fullText = `${p.name} ${p.brand || ""} ${p.description || ""} ${JSON.stringify(s)} ${(p.highlights || []).join(" ")}`.toLowerCase();
      const reasons = [];

      // Requirement match
      if (reqLower && fullText.includes(reqLower)) {
        score += 25;
      }

      // Use case matches
      if (useLower.includes("game") || useLower.includes("gaming")) {
        if (fullText.includes("120hz") || fullText.includes("rtx") || fullText.includes("gpu") || fullText.includes("graphics") || fullText.includes("gaming")) {
          score += 35;
          reasons.push("Optimized for gaming performance & high refresh rates");
        }
      } else if (useLower.includes("movie") || useLower.includes("cinema") || useLower.includes("stream")) {
        if (fullText.includes("4k") || fullText.includes("oled") || fullText.includes("dolby") || fullText.includes("full hd") || fullText.includes("x-reality")) {
          score += 35;
          reasons.push("Cinematic picture quality & immersive audio");
        }
      } else if (useLower.includes("code") || useLower.includes("dev") || useLower.includes("program")) {
        if (fullText.includes("16gb") || fullText.includes("32gb") || fullText.includes("i7") || fullText.includes("i9") || fullText.includes("m3") || fullText.includes("ssd")) {
          score += 35;
          reasons.push("Powerful multi-threaded processor & fast RAM for development");
        }
      } else if (useLower.includes("anc") || useLower.includes("noise") || useLower.includes("studio")) {
        if (fullText.includes("anc") || fullText.includes("noise cancellation") || fullText.includes("dynamic driver") || fullText.includes("hi-res")) {
          score += 35;
          reasons.push("Active Noise Cancellation & studio acoustic fidelity");
        }
      } else if (useLower.includes("casual") || useLower.includes("comfort")) {
        if (fullText.includes("cotton") || fullText.includes("breathable") || fullText.includes("soft") || fullText.includes("regular fit")) {
          score += 35;
          reasons.push("Breathable organic cotton & relaxed daily comfort");
        }
      } else if (useLower.includes("tech") || useLower.includes("learn") || useLower.includes("system")) {
        if (fullText.includes("system") || fullText.includes("architecture") || fullText.includes("data") || p.type === "Books") {
          score += 35;
          reasons.push("Authoritative reference & structured technical insights");
        }
      }

      // Rating bonus
      if (p.ratings && p.ratings.length) {
        const avg = p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length;
        if (avg >= 4.5) score += 15;
      }

      const matchPercent = Math.min(99, Math.max(88, score));
      const reasonText = reasons.length
        ? reasons.join(" • ")
        : `Matches your requirement for ${collected.requirementLabel} under ${collected.priceLabel}`;

      return {
        ...p,
        score,
        matchPercent: `${matchPercent}% Match`,
        matchReason: reasonText,
      };
    });

    scored.sort((a, b) => b.score - a.score);

    const topMatches = scored.slice(0, 3).map((item, idx) => ({
      ...item,
      matchBadge: idx === 0 ? `⭐ ${item.matchPercent} • Top Pick` : `🎯 ${item.matchPercent}`,
    }));

    const resultMsg = {
      id: getNextId("bot-fulfilled"),
      sender: "bot",
      text: fallbackNote
        ? `${fallbackNote}\n\nHere are the best matches for your requirement:`
        : `🎉 **I've fulfilled your requirements!**\n\nHere are the top products matching **${collected.requirementLabel}** within **${collected.priceLabel}** for **${collected.useLabel}**:`,
      summary: {
        requirement: collected.requirementLabel,
        budget: collected.priceLabel,
        use: collected.useLabel,
      },
      products: topMatches,
      options: [
        { label: "🔄 Start New Search", action: "start_wizard" },
        { label: "🛒 View Cart", action: "view_cart" },
        { label: "🚚 Shipping & Return Policy", action: "faq_shipping" },
      ],
      timestamp: getTimestampString(),
    };

    setMessages((prev) => [...prev, resultMsg]);
  };

  /* =========================================================================
     FREE-FORM TEXT INPUT ROUTING (Handles natural typing in wizard or general)
     ========================================================================= */
  const handleSendMessage = (textToSend) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMessage = {
      id: getNextId("user"),
      sender: "user",
      text,
      timestamp: getTimestampString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    setTimeout(() => {
      // 1. If currently inside the 3-step Wizard:
      if (wizardState.active) {
        if (wizardState.step === "requirement") {
          setIsTyping(false);
          handleRequirementChoice(text, text);
          return;
        }

        if (wizardState.step === "price") {
          setIsTyping(false);
          // Parse budget from text (handling commas like "$1,500")
          const cleanText = text.replace(/,/g, "");
          const nums = cleanText.match(/\d+(\.\d+)?/g);
          if (nums && nums.length) {
            const val = parseFloat(nums[0]);
            handlePriceChoice(0, val, `Under $${val.toLocaleString()}`);
          } else {
            handlePriceChoice(0, Infinity, text);
          }
          return;
        }

        if (wizardState.step === "use") {
          setIsTyping(false);
          handleUseChoice(text, text);
          return;
        }
      }

      // 2. If user requests recommendation via general chat:
      const q = text.toLowerCase();
      if (
        q.includes("recommend") ||
        q.includes("find me") ||
        q.includes("suggest") ||
        q.includes("help me choose") ||
        q.includes("looking for") ||
        q.includes("quiz") ||
        q.includes("wizard")
      ) {
        setIsTyping(false);
        startRecommendationFlow();
        return;
      }

      // 3. Shipping / Delivery FAQ
      if (q.includes("shipping") || q.includes("delivery") || q.includes("ship")) {
        const botMsg = {
          id: getNextId("bot"),
          sender: "bot",
          text: "🚀 We offer **100% FREE express 2-day delivery** with real-time tracking, tamper-proof packaging, and scheduled courier dispatch!",
          timestamp: getTimestampString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }

      // 4. Returns / Warranty FAQ
      if (q.includes("return") || q.includes("refund") || q.includes("warranty")) {
        const botMsg = {
          id: getNextId("bot"),
          sender: "bot",
          text: "🔄 Every purchase includes a **7-Day Free Replacement** guarantee, a **30-Day Money-Back Policy**, and comprehensive brand warranty with onsite technician support!",
          timestamp: getTimestampString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }

      // 5. Cart / Checkout
      if (q.includes("cart") || q.includes("checkout") || q.includes("bag")) {
        const count = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
        const subtotal = cartItems.reduce(
          (sum, i) => sum + (i.productId?.price || 0) * (i.quantity || 1),
          0
        );
        const botMsg = {
          id: getNextId("bot"),
          sender: "bot",
          text: `🛒 You currently have **${count} item(s)** in your cart (Subtotal: $${subtotal.toFixed(2)}).`,
          action: { label: "Open Cart", to: "/cart" },
          timestamp: getTimestampString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }

      // 6. Best Sellers / Top Deals
      if (q.includes("best") || q.includes("top") || q.includes("popular") || q.includes("seller")) {
        const topItems = [...products]
          .sort((a, b) => {
            const aRate = a.ratings?.reduce((s, r) => s + r, 0) / (a.ratings?.length || 1);
            const bRate = b.ratings?.reduce((s, r) => s + r, 0) / (b.ratings?.length || 1);
            return bRate - aRate;
          })
          .slice(0, 3)
          .map((p) => ({
            ...p,
            matchBadge: "⭐ Top Customer Favorite",
            matchReason: "Highest rated & best selling item",
          }));

        const botMsg = {
          id: getNextId("bot"),
          sender: "bot",
          text: "⭐ Here are our top customer favorites across all categories:",
          products: topItems,
          options: [{ label: "🎯 Find tailored product by requirement", action: "start_wizard" }],
          timestamp: getTimestampString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }

      // 7. Keyword search across catalog
      const matched = products
        .filter(
          (p) =>
            p.name?.toLowerCase().includes(q) ||
            p.type?.toLowerCase().includes(q) ||
            p.brand?.toLowerCase().includes(q) ||
            p.description?.toLowerCase().includes(q)
        )
        .slice(0, 3)
        .map((p) => ({
          ...p,
          matchBadge: "🔍 Catalog Match",
          matchReason: `Matches "${text}"`,
        }));

      if (matched.length > 0) {
        const botMsg = {
          id: getNextId("bot"),
          sender: "bot",
          text: `🔍 Here's what I found for "${text}":`,
          products: matched,
          options: [{ label: "🎯 Step-by-Step Recommendation", action: "start_wizard" }],
          timestamp: getTimestampString(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        return;
      }

      // Default Fallback
      const botMsg = {
        id: getNextId("bot"),
        sender: "bot",
        text: "I can help you find products step-by-step based on your **requirement**, **budget**, and **use**, or answer questions about shipping and returns!\n\nWhat would you like to do?",
        options: [
          { label: "🎯 Step-by-Step Product Match", action: "start_wizard" },
          { label: "🔥 Show Best Sellers", action: "best_sellers" },
          { label: "🚚 Shipping Policy", action: "faq_shipping" },
        ],
        timestamp: getTimestampString(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 500);
  };

  /* =========================================================================
     INTERACTIVE OPTION CLICK ROUTING
     ========================================================================= */
  const handleSelectOption = (option) => {
    // 1. Wizard Step: Requirement
    if (option.step === "requirement") {
      const userMsg = {
        id: getNextId("user"),
        sender: "user",
        text: option.label,
        timestamp: getTimestampString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        handleRequirementChoice(option.value, option.label, option.category);
      }, 300);
      return;
    }

    // 2. Wizard Step: Price
    if (option.step === "price") {
      const userMsg = {
        id: getNextId("user"),
        sender: "user",
        text: option.label,
        timestamp: getTimestampString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        handlePriceChoice(option.min, option.max, option.labelText);
      }, 300);
      return;
    }

    // 3. Wizard Step: Use
    if (option.step === "use") {
      const userMsg = {
        id: getNextId("user"),
        sender: "user",
        text: option.label,
        timestamp: getTimestampString(),
      };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        handleUseChoice(option.value, option.labelText);
      }, 300);
      return;
    }

    // Actions
    if (option.action === "start_wizard") {
      startRecommendationFlow();
      return;
    }

    if (option.action === "view_cart") {
      navigate("/cart");
      handleClose();
      return;
    }

    if (option.action === "faq_shipping") {
      handleSendMessage("What is your shipping policy?");
      return;
    }

    if (option.action === "best_sellers") {
      handleSendMessage("Show me best sellers");
      return;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Hide on admin, seller portal routes, and welcome portal
  if (
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/seller") ||
    location.pathname === "/welcome"
  ) {
    return null;
  }

  return (
    <div className="floating-chatbot-root">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-launcher-btn"
          onClick={handleOpen}
          aria-label="Open AI Shopping Concierge"
        >
          <div className="launcher-icon-wrap">
            <i className="bi bi-chat-heart-fill"></i>
            <span className="launcher-pulse"></span>
          </div>
          <span className="launcher-label">Ask Assistant</span>
          {unreadCount > 0 && <span className="launcher-badge">{unreadCount}</span>}
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-brand-wrap">
              <div className="chatbot-avatar-ring">
                <i className="bi bi-robot"></i>
                <span className="online-beacon"></span>
              </div>
              <div className="chatbot-header-text">
                <h4>Shopping Assistant</h4>
                <span className="bot-status">
                  <i className="bi bi-lightning-charge-fill"></i> Step-by-Step Concierge
                </span>
              </div>
            </div>

            <div className="chatbot-header-actions">
              <button
                type="button"
                className="header-tool-btn"
                onClick={handleClearChat}
                title="Restart Discovery"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
              <button
                type="button"
                className="header-tool-btn close"
                onClick={handleClose}
                title="Close chat"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-row ${msg.sender === "user" ? "user-row" : "bot-row"}`}
              >
                {msg.sender === "bot" && (
                  <div className="bubble-avatar">
                    <i className="bi bi-robot"></i>
                  </div>
                )}

                <div className={`chat-bubble ${msg.sender}`}>
                  <div className="bubble-text">
                    {msg.text.split("\n").map((line, idx) => (
                      <p key={idx} style={{ margin: "0.2rem 0" }}>
                        {line.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((part, pIdx) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                          }
                          if (part.startsWith("*") && part.endsWith("*")) {
                            return <em key={pIdx}>{part.slice(1, -1)}</em>;
                          }
                          return part;
                        })}
                      </p>
                    ))}

                    {/* Step-by-Step Summary Pill Badge */}
                    {msg.summary && (
                      <div className="chat-summary-box">
                        <div className="summary-chip">
                          <i className="bi bi-box-seam"></i>
                          <span>Product: <strong>{msg.summary.requirement}</strong></span>
                        </div>
                        <div className="summary-chip">
                          <i className="bi bi-tag-fill"></i>
                          <span>Budget: <strong>{msg.summary.budget}</strong></span>
                        </div>
                        <div className="summary-chip">
                          <i className="bi bi-bullseye"></i>
                          <span>Primary Use: <strong>{msg.summary.use}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Interactive Clickable Options */}
                    {msg.options && msg.options.length > 0 && (
                      <div className="chat-options-group">
                        {msg.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            type="button"
                            className="chat-option-btn"
                            onClick={() => handleSelectOption(opt)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Interactive Product Preview Cards with Match Badges & Specs */}
                    {msg.products && msg.products.length > 0 && (
                      <div className="chat-product-list">
                        {msg.products.map((p) => {
                          const s = p.specs || {};
                          return (
                            <div key={p._id} className="chat-product-card">
                              <div className="chat-product-thumb">
                                <img
                                  src={getProductImage(p)}
                                  alt={p.name}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "/not-found.svg";
                                  }}
                                />
                              </div>

                              <div className="chat-product-info">
                                <div className="chat-badge-row">
                                  <span className="chat-product-type">{p.brand || p.type}</span>
                                  {p.matchBadge && (
                                    <span className="chat-match-badge">
                                      {p.matchBadge}
                                    </span>
                                  )}
                                </div>
                                <h5 className="chat-product-name">{p.name}</h5>

                                {/* In-Depth Multi-Category Specification Pills */}
                                <div className="chat-spec-pills">
                                  {s.screenSize && (
                                    <span className="chat-spec-pill" title="Screen Size">
                                      <i className="bi bi-tv"></i> {s.screenSize}
                                    </span>
                                  )}
                                  {s.resolution && (
                                    <span className="chat-spec-pill" title="Resolution">
                                      {s.resolution}
                                    </span>
                                  )}
                                  {s.soundOutput && (
                                    <span className="chat-spec-pill" title="Audio">
                                      <i className="bi bi-volume-up"></i> Audio
                                    </span>
                                  )}
                                  {s.processor && (
                                    <span className="chat-spec-pill" title="Processor">
                                      <i className="bi bi-cpu"></i> {s.processor}
                                    </span>
                                  )}
                                  {s.ram && (
                                    <span className="chat-spec-pill" title="RAM">
                                      {s.ram}
                                    </span>
                                  )}
                                  {s.storage && (
                                    <span className="chat-spec-pill" title="Storage">
                                      {s.storage}
                                    </span>
                                  )}
                                  {s.battery && (
                                    <span className="chat-spec-pill" title="Battery">
                                      <i className="bi bi-battery-charging"></i> Battery
                                    </span>
                                  )}
                                  {s.material && (
                                    <span className="chat-spec-pill" title="Material">
                                      {s.material}
                                    </span>
                                  )}
                                  {s.author && (
                                    <span className="chat-spec-pill" title="Author">
                                      By {s.author}
                                    </span>
                                  )}
                                </div>

                                {p.matchReason && (
                                  <p className="chat-match-reason">
                                    <i className="bi bi-check2-circle"></i> {p.matchReason}
                                  </p>
                                )}

                                <div className="chat-price-stock-row">
                                  <span className="chat-product-price">
                                    ${(p.price || 0).toFixed(2)}
                                  </span>
                                  <span className="chat-stock-badge">
                                    {p.stock > 0 ? "In Stock" : "Out of Stock"}
                                  </span>
                                </div>
                              </div>

                              <div className="chat-card-actions">
                                <button
                                  type="button"
                                  className="chat-inspect-btn"
                                  onClick={() => handleInspectProduct(p)}
                                  title="Inspect Full Technical Specifications"
                                >
                                  <i className="bi bi-eye"></i> Specs
                                </button>

                                <button
                                  type="button"
                                  className="chat-add-btn"
                                  disabled={addingId === p._id || p.stock <= 0}
                                  onClick={() => handleAddToCart(p)}
                                >
                                  {addingId === p._id ? (
                                    <span className="btn-spinner-tiny"></span>
                                  ) : (
                                    <i className="bi bi-cart-plus"></i>
                                  )}
                                  <span>Add</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Action link */}
                    {msg.action && (
                      <button
                        type="button"
                        className="chat-action-link"
                        onClick={() => {
                          navigate(msg.action.to);
                          handleClose();
                        }}
                      >
                        {msg.action.label} <i className="bi bi-arrow-right-short"></i>
                      </button>
                    )}
                  </div>

                  <span className="bubble-time">{msg.timestamp}</span>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="chat-bubble-row bot-row">
                <div className="bubble-avatar">
                  <i className="bi bi-robot"></i>
                </div>
                <div className="chat-bubble bot typing-bubble">
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                  <span className="typing-dot"></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="quick-prompts-bar">
            {QUICK_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="prompt-chip"
                onClick={() => {
                  if (prompt.action === "start_wizard") {
                    startRecommendationFlow();
                  } else {
                    handleSendMessage(prompt.query);
                  }
                }}
              >
                {prompt.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form className="chatbot-input-bar" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              className="chat-input"
              placeholder={
                wizardState.active
                  ? wizardState.step === "requirement"
                    ? "Type what product you need (e.g. Sony TV, Laptop)..."
                    : wizardState.step === "price"
                    ? "Type your budget (e.g. $400 or under 600)..."
                    : "Type how you will use it (e.g. movies, gaming)..."
                  : "Ask anything or type a product requirement..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputValue.trim()}
              aria-label="Send Message"
            >
              <i className="bi bi-send-fill"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
