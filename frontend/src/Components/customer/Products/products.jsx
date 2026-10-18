import { useEffect, useState, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import {
  fetchProducts,
  searchProducts,
} from "../../../store/slices/productsSlice";
import { setSearchTerm } from "../../../store/slices/searchSlice";

import {
  fetchWishlist,
  toggleWishlist,
} from "../../../store/slices/wishlistSlice";

import { addToCart } from "../../../store/slices/cartSlice";
import ProductDetails from "../ProductDetails/productdetails";
import MessageModal from "../../common/ui/messagemodel/messageModel";
import Button from "../../common/ui/buttons/button";
import GoodLoader from "../../common/ui/loader/loader";
import { getProductImage } from "../../../utils/productImages";

import "./products.css";

const CATEGORIES = [
  "All",
  "Electronics",
  "Clothing",
  "Home",
  "Books",
  "Sports",
  "Beauty",
  "Toys",
];
const ITEMS_PER_CHUNK = 15;

const ProductDisplay = () => {
  const dispatch = useDispatch();

  const { loading, isRevalidating, error } = useSelector(
    (state) => state.products || {}
  );
  const rawItems = useSelector((state) => state.products?.items);
  const items = useMemo(() => (Array.isArray(rawItems) ? rawItems : []), [rawItems]);

  const rawSearchResults = useSelector((state) => state.products?.searchResults);
  const searchResults = useMemo(
    () => (Array.isArray(rawSearchResults) ? rawSearchResults : []),
    [rawSearchResults]
  );

  const rawWishlist = useSelector((state) => state.wishlist?.items);
  const wishlistItems = useMemo(
    () => (Array.isArray(rawWishlist) ? rawWishlist : []),
    [rawWishlist]
  );
  const searchTerm = useSelector(
    (state) => state.search?.searchTerm || state.search?.searchterm || ""
  );
  const isLoggedIn = useSelector((state) => state.auth?.isLoggedIn);
  const cartLoading = useSelector((state) => state.cart?.loading);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [quickFilter, setQuickFilter] = useState("none"); // "none" | "under50" | "toprated" | "instock"
  const [addingId, setAddingId] = useState(null);
  const [addedSuccessId, setAddedSuccessId] = useState(null);

  // ===== CHUNKED INFINITE SCROLL STATE (15 ITEMS PER CHUNK) =====
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_CHUNK);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [searchParams] = useSearchParams();

  /* ===== URL QUERY SEARCH & DIRECT PRODUCT PREVIEW ===== */
  useEffect(() => {
    const q = searchParams.get("search");
    if (q) {
      dispatch(setSearchTerm(q));
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    const pid = searchParams.get("productId");
    if (pid && items.length > 0) {
      const match = items.find((p) => p._id === pid);
      if (match) {
        setSelectedProduct(match);
      }
    }
  }, [searchParams, items]);

  /* ===== GLOBAL PRODUCT MODAL EVENT & COUNTDOWN TIMER ===== */
  useEffect(() => {
    const handleOpenModal = (e) => {
      if (e.detail) {
        setSelectedProduct(e.detail);
      }
    };
    window.addEventListener("open-product-modal", handleOpenModal);
    return () => window.removeEventListener("open-product-modal", handleOpenModal);
  }, []);

  const [countdown, setCountdown] = useState({ hours: 4, minutes: 38, seconds: 24 });
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ===== INITIAL LOAD ===== */
  useEffect(() => {
    dispatch(fetchProducts());
    if (isLoggedIn) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isLoggedIn]);

  /* ===== DEBOUNCED SEARCH ===== */
  useEffect(() => {
    if (!searchTerm.trim()) return;

    const timer = setTimeout(() => {
      dispatch(searchProducts(searchTerm.trim()));
    }, 350);

    return () => clearTimeout(timer);
  }, [dispatch, searchTerm]);

  /* ===== LIVE CATEGORY COUNTS ===== */
  const categoryCounts = useMemo(() => {
    const counts = { All: items.length };
    items.forEach((p) => {
      if (p.type) counts[p.type] = (counts[p.type] || 0) + 1;
    });
    return counts;
  }, [items]);

  /* ===== FILTER & SORT PRODUCTS (INSTANT IN-MEMORY) ===== */
  const filteredProducts = useMemo(() => {
    let list = [...items];

    // 1. Instant client-side search across cached items
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const localMatches = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.type?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );

      list = localMatches.length > 0 || !searchResults.length
        ? localMatches
        : [...searchResults];
    }

    // 2. Category filtering
    if (selectedCategory !== "All") {
      list = list.filter(
        (p) => p.type && p.type.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // 3. Quick filters
    if (quickFilter === "under50") {
      list = list.filter((p) => p.price < 50);
    } else if (quickFilter === "toprated") {
      list = list.filter((p) => {
        const avg = p.ratings?.length
          ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length
          : 4.5;
        return avg >= 4.7;
      });
    } else if (quickFilter === "instock") {
      list = list.filter((p) => p.stock > 0);
    }

    // 4. Sorting
    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      const getAvg = (p) =>
        p.ratings?.length
          ? p.ratings.reduce((a, b) => a + b, 0) / p.ratings.length
          : 0;
      list.sort((a, b) => getAvg(b) - getAvg(a));
    }

    return list;
  }, [searchTerm, searchResults, items, selectedCategory, quickFilter, sortBy]);

  // Reset pagination chunk when any filter, category, or search query changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_CHUNK);
  }, [searchTerm, selectedCategory, quickFilter, sortBy]);

  // Infinite scroll intersection observer: automatically loads next 15 items when user scrolls to bottom
  useEffect(() => {
    if (visibleCount >= filteredProducts.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target && target.isIntersecting && !isLoadingMore) {
          setIsLoadingMore(true);
          setTimeout(() => {
            setVisibleCount((prev) =>
              Math.min(prev + ITEMS_PER_CHUNK, filteredProducts.length)
            );
            setIsLoadingMore(false);
          }, 200);
        }
      },
      { threshold: 0.1, rootMargin: "250px" }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [visibleCount, filteredProducts.length, isLoadingMore]);

  // Active slice of products to render in the DOM (15 at first, then +15 each scroll)
  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const handleWishlist = (e, productId) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setMessage("Please login to manage your wishlist");
      setMessageType("warning");
      return;
    }
    dispatch(toggleWishlist(productId))
      .unwrap()
      .then((res) => {
        setMessage(res.action === "added" ? "Added to wishlist" : "Removed from wishlist");
        setMessageType("success");
      })
      .catch((err) => {
        setMessage(err || "Failed to update wishlist");
        setMessageType("error");
      });
  };

  const handleAddToCart = async (e, product) => {
    e.stopPropagation();
    if (product.stock <= 0) return;

    setAddingId(product._id);
    try {
      await dispatch(
        addToCart({ productId: product._id, quantity: 1 })
      ).unwrap();
      setAddedSuccessId(product._id);
      setTimeout(() => setAddedSuccessId(null), 2200);
      setMessage(`"${product.name}" added to cart!`);
      setMessageType("success");
    } catch (err) {
      setMessage(err || "Failed to add to cart");
      setMessageType("error");
    } finally {
      setAddingId(null);
    }
  };

  const getProductRating = (product) => {
    if (!product.ratings || !product.ratings.length) return "4.7";
    const avg =
      product.ratings.reduce((a, b) => a + b, 0) / product.ratings.length;
    return avg.toFixed(1);
  };

  const handleOpenAssistant = () => {
    window.dispatchEvent(new CustomEvent("open-chatbot"));
  };

  const scrollToCatalog = () => {
    const el = document.getElementById("catalog-section");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  const dealProducts = useMemo(() => {
    return items
      .filter((p) => (p.discountPercent && p.discountPercent > 0) || p.price > 120)
      .slice(0, 6);
  }, [items]);

  if (error && !items.length) {
    return (
      <div className="product-display">
        <div className="catalog-error">
          <i className="bi bi-exclamation-triangle"></i>
          <p>{error}</p>
          <Button variant="primary" onClick={() => dispatch(fetchProducts())}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-display">
      {/* ===== FLIPKART / AMAZON STYLE CATEGORY ICON QUICK BAR ===== */}
      <div className="marketplace-category-strip">
        <div
          className={`market-cat-item ${selectedCategory === "Electronics" ? "active" : ""}`}
          onClick={() => {
            setSelectedCategory("Electronics");
            scrollToCatalog();
          }}
        >
          <div className="cat-icon-circle blue-grad">
            <i className="bi bi-laptop"></i>
          </div>
          <span>Electronics</span>
        </div>

        <div
          className={`market-cat-item ${selectedCategory === "Clothing" ? "active" : ""}`}
          onClick={() => {
            setSelectedCategory("Clothing");
            scrollToCatalog();
          }}
        >
          <div className="cat-icon-circle pink-grad">
            <i className="bi bi-bag-heart"></i>
          </div>
          <span>Fashion</span>
        </div>

        <div
          className={`market-cat-item ${selectedCategory === "Home" ? "active" : ""}`}
          onClick={() => {
            setSelectedCategory("Home");
            scrollToCatalog();
          }}
        >
          <div className="cat-icon-circle amber-grad">
            <i className="bi bi-house-heart"></i>
          </div>
          <span>Home & Living</span>
        </div>

        <div
          className={`market-cat-item ${selectedCategory === "Books" ? "active" : ""}`}
          onClick={() => {
            setSelectedCategory("Books");
            scrollToCatalog();
          }}
        >
          <div className="cat-icon-circle emerald-grad">
            <i className="bi bi-book"></i>
          </div>
          <span>Books</span>
        </div>

        <div
          className={`market-cat-item ${selectedCategory === "Sports" ? "active" : ""}`}
          onClick={() => {
            setSelectedCategory("Sports");
            scrollToCatalog();
          }}
        >
          <div className="cat-icon-circle teal-grad">
            <i className="bi bi-activity"></i>
          </div>
          <span>Sports & Fitness</span>
        </div>

        <div
          className={`market-cat-item ${selectedCategory === "Beauty" ? "active" : ""}`}
          onClick={() => {
            setSelectedCategory("Beauty");
            scrollToCatalog();
          }}
        >
          <div className="cat-icon-circle rose-grad">
            <i className="bi bi-stars"></i>
          </div>
          <span>Beauty & Care</span>
        </div>

        <div
          className={`market-cat-item ${selectedCategory === "Toys" ? "active" : ""}`}
          onClick={() => {
            setSelectedCategory("Toys");
            scrollToCatalog();
          }}
        >
          <div className="cat-icon-circle indigo-grad">
            <i className="bi bi-controller"></i>
          </div>
          <span>Toys & Gaming</span>
        </div>

        <div
          className="market-cat-item"
          onClick={() => {
            setQuickFilter("under50");
            scrollToCatalog();
          }}
        >
          <div className="cat-icon-circle purple-grad">
            <i className="bi bi-lightning-charge-fill"></i>
          </div>
          <span>Flash Deals</span>
        </div>

        <div
          className="market-cat-item"
          onClick={() => {
            setQuickFilter("toprated");
            scrollToCatalog();
          }}
        >
          <div className="cat-icon-circle red-grad">
            <i className="bi bi-fire"></i>
          </div>
          <span>Best Sellers</span>
        </div>

        <div
          className="market-cat-item ai-highlight"
          onClick={handleOpenAssistant}
        >
          <div className="cat-icon-circle ai-grad">
            <i className="bi bi-robot"></i>
          </div>
          <span>AI Spec Concierge</span>
        </div>
      </div>

      {/* ===== HERO / BANNER SECTION ===== */}
      <section className="hero-banner">
        <div className="hero-content">
          <div className="hero-badge-row">
            <span className="hero-pill">
              <i className="bi bi-stars"></i> Curated Essentials & Tech
            </span>
            <span className="hero-shipping-pill">
              <i className="bi bi-lightning-charge-fill"></i> Free 2-Day Delivery
            </span>
          </div>

          <h1 className="hero-title">
            Discover Quality Products at <span className="hero-highlight">TheStore</span>
          </h1>

          <p className="hero-subtitle">
            Explore premium electronics, trending fashion, and best-selling books with lightning-fast checkout and personal AI assistance.
          </p>

          <div className="hero-cta-group">
            <Button
              variant="primary"
              size="md"
              icon={<i className="bi bi-bag-check"></i>}
              onClick={scrollToCatalog}
            >
              Shop Collection
            </Button>

            <Button
              variant="outline"
              size="md"
              icon={<i className="bi bi-robot"></i>}
              onClick={handleOpenAssistant}
            >
              Ask AI Stylist
            </Button>
          </div>

          {/* Trust ribbon */}
          <div className="hero-trust-bar">
            <div className="trust-item">
              <i className="bi bi-shield-check"></i>
              <span>100% Authentic</span>
            </div>
            <div className="trust-dot">•</div>
            <div className="trust-item">
              <i className="bi bi-arrow-repeat"></i>
              <span>30-Day Free Returns</span>
            </div>
            <div className="trust-dot">•</div>
            <div className="trust-item">
              <i className="bi bi-star-fill"></i>
              <span>4.9/5 Rating (1,400+ Reviews)</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FLIPKART / AMAZON STYLE DEALS OF THE DAY RAIL ===== */}
      {dealProducts.length > 0 && (
        <section className="deals-of-the-day-section">
          <div className="deals-header-row">
            <div className="deals-title-group">
              <span className="deal-flame-icon">🔥</span>
              <div>
                <h2>Today&apos;s Super Deals</h2>
                <p>Limited-time discounts on top-rated hardware and gear</p>
              </div>
            </div>

            <div className="deals-timer-badge">
              <i className="bi bi-stopwatch"></i>
              <span>Ends in:</span>
              <strong className="timer-digits">
                {String(countdown.hours).padStart(2, "0")}h :{" "}
                {String(countdown.minutes).padStart(2, "0")}m :{" "}
                {String(countdown.seconds).padStart(2, "0")}s
              </strong>
            </div>
          </div>

          <div className="deals-scroll-rail">
            {dealProducts.map((deal) => {
              const origP = deal.originalPrice || deal.price * 1.2;
              const discP = deal.discountPercent || 15;
              return (
                <div
                  key={deal._id}
                  className="deal-card"
                  onClick={() => setSelectedProduct(deal)}
                >
                  <span className="deal-discount-tag">-{discP}% OFF</span>
                  <div className="deal-card-img-wrap">
                    <img
                      src={getProductImage(deal)}
                      alt={deal.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/not-found.svg";
                      }}
                    />
                  </div>
                  <div className="deal-card-body">
                    <span className="deal-category">{deal.brand || deal.type}</span>
                    <h4 title={deal.name}>{deal.name}</h4>
                    {deal.specs?.processor && (
                      <span className="deal-spec-chip">{deal.specs.processor}</span>
                    )}
                    <div className="deal-price-line">
                      <strong className="deal-current-price">${(deal.price || 0).toFixed(2)}</strong>
                      <span className="deal-strikethrough">${origP.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ===== CONTROLS: CATEGORIES & QUICK FILTERS ===== */}
      <div className="catalog-controls" id="catalog-section">
        {/* Category Pills */}
        <div className="category-pills">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                className={`category-pill ${selectedCategory === cat ? "active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "All" && <i className="bi bi-grid-fill"></i>}
                {cat === "Electronics" && <i className="bi bi-laptop"></i>}
                {cat === "Clothing" && <i className="bi bi-tag-fill"></i>}
                {cat === "Home" && <i className="bi bi-house-door-fill"></i>}
                {cat === "Books" && <i className="bi bi-book-fill"></i>}
                {cat === "Sports" && <i className="bi bi-activity"></i>}
                {cat === "Beauty" && <i className="bi bi-stars"></i>}
                {cat === "Toys" && <i className="bi bi-controller"></i>}
                <span>{cat}</span>
                <span className="cat-count-pill">{count}</span>
              </button>
            );
          })}
        </div>

        {/* Sort Controls */}
        <div className="sort-controls">
          <label htmlFor="sort-select">
            <i className="bi bi-arrow-down-up"></i> Sort:
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown"
          >
            <option value="featured">Featured</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* ===== QUICK FILTER CHIPS ROW ===== */}
      <div className="quick-filters-row">
        <span className="quick-filter-label">Quick Filters:</span>
        <button
          className={`quick-chip ${quickFilter === "under50" ? "active" : ""}`}
          onClick={() => setQuickFilter((prev) => (prev === "under50" ? "none" : "under50"))}
        >
          <i className="bi bi-lightning-charge"></i> Under $50
        </button>
        <button
          className={`quick-chip ${quickFilter === "toprated" ? "active" : ""}`}
          onClick={() => setQuickFilter((prev) => (prev === "toprated" ? "none" : "toprated"))}
        >
          <i className="bi bi-star-fill"></i> 4.7+ Rating
        </button>
        <button
          className={`quick-chip ${quickFilter === "instock" ? "active" : ""}`}
          onClick={() => setQuickFilter((prev) => (prev === "instock" ? "none" : "instock"))}
        >
          <i className="bi bi-check-circle"></i> In Stock Only
        </button>
        {quickFilter !== "none" && (
          <button className="clear-quick-chip" onClick={() => setQuickFilter("none")}>
            <i className="bi bi-x-circle"></i> Clear Filters
          </button>
        )}
      </div>

      {/* ===== RESULTS COUNT & SYNC STATUS ===== */}
      <div className="results-header">
        <p className="results-count">
          Showing <strong>{Math.min(visibleCount, filteredProducts.length)}</strong> of <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "product" : "products"}
          {searchTerm.trim() && <span> for &ldquo;{searchTerm}&rdquo;</span>}
          {selectedCategory !== "All" && <span> in <strong>{selectedCategory}</strong></span>}
          {quickFilter !== "none" && <span className="active-filter-badge">• Filter Active</span>}
        </p>

        {isRevalidating && (
          <span className="revalidating-badge">
            <span className="revalidating-dot"></span>
            Syncing catalog...
          </span>
        )}
      </div>

      {/* ===== PRODUCT GRID OR LOADER ===== */}
      {loading && !items.length ? (
        <GoodLoader message="Curating top products for you..." />
      ) : (
        <div className="product-cards">
          {displayedProducts.length ? (
            displayedProducts.map((product) => {
              const isWishlisted = wishlistItems.some(
                (id) => (id._id || id) === product._id
              );
              const isAdding = addingId === product._id;
              const isAdded = addedSuccessId === product._id;
              const rating = getProductRating(product);
              const imageUrl = getProductImage(product);
              const originalPrice = (product.originalPrice || product.price * 1.15).toFixed(2);
              const discountPercent = product.discountPercent || (originalPrice > product.price ? Math.round(((originalPrice - product.price) / originalPrice) * 100) : 0);

              return (
                <div
                  key={product._id}
                  className="product-card"
                  onClick={() => setSelectedProduct(product)}
                >
                  {/* Visual Image container with REAL Unsplash Photography */}
                  <div className="card-media">
                    {product.type && (
                      <span className="type-badge">{product.type}</span>
                    )}

                    {discountPercent > 0 && (
                      <span className="card-discount-pill">
                        -{discountPercent}%
                      </span>
                    )}

                    {parseFloat(rating) >= 4.8 && (
                      <span className="popular-badge">
                        <i className="bi bi-fire"></i> Best Seller
                      </span>
                    )}

                    <button
                      className={`wishlist-btn ${isWishlisted ? "active" : ""}`}
                      onClick={(e) => handleWishlist(e, product._id)}
                      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                      title={isWishlisted ? "In Wishlist" : "Save to Wishlist"}
                    >
                      <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
                    </button>

                    <div className="media-img-wrap">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        className="product-photo"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/not-found.svg";
                        }}
                      />
                      <div className="quick-view-overlay">
                        <span><i className="bi bi-eye"></i> Quick View</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="card-content">
                    <div className="card-brand-and-rating">
                      <span className="card-brand-pill">{product.brand || "TheStore"}</span>
                      {product.sellerName && (
                        <span className="card-seller-pill" title={`Verified Merchant: ${product.sellerName}`}>
                          <i className="bi bi-shop"></i> {product.sellerName}
                        </span>
                      )}
                      <span className="rating-pill">
                        <i className="bi bi-star-fill"></i> {rating}
                      </span>
                    </div>

                    <h2 className="product-name" title={product.name}>
                      {product.name}
                    </h2>

                    {/* Flipkart / Amazon In-Depth Technical Specification Badges */}
                    {product.specs && (product.specs.processor || product.specs.ram || product.specs.material || product.specs.author) && (
                      <div className="card-spec-strip">
                        {product.specs.processor && (
                          <span className="spec-badge" title="Processor">
                            <i className="bi bi-cpu"></i> {product.specs.processor}
                          </span>
                        )}
                        {product.specs.ram && (
                          <span className="spec-badge" title="RAM Memory">
                            {product.specs.ram}
                          </span>
                        )}
                        {product.specs.storage && (
                          <span className="spec-badge" title="Storage">
                            {product.specs.storage}
                          </span>
                        )}
                        {product.specs.material && (
                          <span className="spec-badge" title="Material">
                            {product.specs.material}
                          </span>
                        )}
                        {product.specs.author && (
                          <span className="spec-badge" title="Author">
                            By {product.specs.author}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Key Highlights Bullet Preview */}
                    {product.highlights && product.highlights.length > 0 && (
                      <ul className="card-highlights-preview">
                        {product.highlights.slice(0, 2).map((h, i) => (
                          <li key={i}>
                            <i className="bi bi-check2"></i> {h}
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="product-desc" title={product.description}>
                      {product.description}
                    </p>

                    {/* Price and Cart Action */}
                    <div className="card-footer">
                      <div className="price-tag-group">
                        <div className="price-tag">
                          <span className="currency">$</span>
                          <span className="amount">{(product.price || 0).toFixed(2)}</span>
                        </div>
                        {parseFloat(originalPrice) > product.price && (
                          <span className="original-price">${originalPrice}</span>
                        )}
                      </div>

                      <Button
                        variant={isAdded ? "outline" : "primary"}
                        size="sm"
                        disabled={product.stock <= 0 || isAdding || cartLoading}
                        loading={isAdding}
                        icon={
                          isAdded ? (
                            <i className="bi bi-check2"></i>
                          ) : (
                            <i className="bi bi-cart-plus"></i>
                          )
                        }
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        {product.stock <= 0 ? "Sold Out" : isAdded ? "Added" : "Add"}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-catalog">
              <div className="empty-icon-wrap">
                <i className="bi bi-search"></i>
              </div>
              <h3>No products found</h3>
              <p>Try adjusting your search keywords, clear filters, or browse all categories.</p>
              <div className="empty-catalog-actions">
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedCategory("All");
                    setQuickFilter("none");
                  }}
                >
                  Reset All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== CHUNKED INFINITE SCROLL / LOAD MORE SENTINEL ===== */}
      {!loading && filteredProducts.length > 0 && (
        <div className="infinite-scroll-container">
          {visibleCount < filteredProducts.length ? (
            <div ref={sentinelRef} className="infinite-scroll-sentinel">
              {isLoadingMore ? (
                <div className="chunk-loader-pill">
                  <span className="chunk-spinner"></span>
                  <span>Loading next 15 products...</span>
                </div>
              ) : (
                <button
                  type="button"
                  className="chunk-load-more-btn"
                  onClick={() => {
                    setIsLoadingMore(true);
                    setTimeout(() => {
                      setVisibleCount((prev) =>
                        Math.min(prev + ITEMS_PER_CHUNK, filteredProducts.length)
                      );
                      setIsLoadingMore(false);
                    }, 200);
                  }}
                >
                  <i className="bi bi-arrow-down-circle"></i>
                  <span>
                    Scroll to load more • or click to load 15 ({filteredProducts.length - visibleCount} remaining)
                  </span>
                </button>
              )}
            </div>
          ) : (
            <div className="catalog-end-pill">
              <i className="bi bi-check-circle-fill"></i>
              <span>All {filteredProducts.length} items loaded • You&apos;ve reached the end</span>
            </div>
          )}
        </div>
      )}

      {/* ===== PRODUCT DETAILS MODAL ===== */}
      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {/* ===== GLOBAL TOAST NOTIFICATION ===== */}
      {message && (
        <MessageModal
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
      )}
    </div>
  );
};

export default ProductDisplay;
