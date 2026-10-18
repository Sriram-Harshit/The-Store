import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import config from "../../../config/config";
import { addToCart } from "../../../store/slices/cartSlice";
import { toggleWishlist } from "../../../store/slices/wishlistSlice";
import Button from "../../common/ui/buttons/button";
import { getProductImage } from "../../../utils/productImages";
import "./productdetails.css";

const ProductDetails = ({ product: initialProduct, onClose }) => {
  const dispatch = useDispatch();
  const { loading: cartLoading } = useSelector((state) => state.cart || {});
  const rawWishlist = useSelector((state) => state.wishlist?.items);
  const wishlistItems = useMemo(() => (Array.isArray(rawWishlist) ? rawWishlist : []), [rawWishlist]);

  const rawAllProducts = useSelector((state) => state.products?.items);
  const allProducts = useMemo(() => (Array.isArray(rawAllProducts) ? rawAllProducts : []), [rawAllProducts]);

  const { isLoggedIn, user: authUser } = useSelector((state) => state.auth || {});

  const [product, setProduct] = useState(initialProduct);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    setProduct(initialProduct);
    if (initialProduct?._id) {
      axios
        .get(`${config.apiUrl}/product/${initialProduct._id}`)
        .then((res) => {
          if (res.data && res.data._id) {
            setProduct(res.data);
          }
        })
        .catch(() => {});
    }
  }, [initialProduct]);
  const [quantity, setQuantity] = useState(1);
  const [addedSuccess, setAddedSuccess] = useState(false);

  // Active Tab for Technical Details
  const [activeInfoTab, setActiveInfoTab] = useState("specs"); // "specs" | "features" | "box" | "reviews"

  // Interactive Review Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");

  const isWishlisted = useMemo(() => {
    if (!product) return false;
    return wishlistItems.some((id) => (id._id || id) === product._id);
  }, [wishlistItems, product]);

  // Compute Related / Recommended Products
  const relatedProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    return allProducts
      .filter((p) => p._id !== product._id)
      .filter(
        (p) =>
          p.type === product.type ||
          (product.brand && p.brand === product.brand) ||
          p.tags?.some((t) => product.tags?.includes(t))
      )
      .slice(0, 4);
  }, [product, allProducts]);

  if (!product) return null;

  const avgRating = product.ratings?.length
    ? (product.ratings.reduce((a, b) => a + b, 0) / product.ratings.length).toFixed(1)
    : "4.8";

  const totalReviewsCount = product.reviews?.length || 0;

  // Rating percentage breakdown
  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const ratings = product.ratings && product.ratings.length
      ? product.ratings
      : product.reviews?.map((r) => r.rating) || [5, 5, 4, 5];
    ratings.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r)));
      counts[rounded] = (counts[rounded] || 0) + 1;
    });
    const total = ratings.length || 1;
    return {
      5: Math.round((counts[5] / total) * 100),
      4: Math.round((counts[4] / total) * 100),
      3: Math.round((counts[3] / total) * 100),
      2: Math.round((counts[2] / total) * 100),
      1: Math.round((counts[1] / total) * 100),
    };
  }, [product.ratings, product.reviews]);

  const originalPrice = product.originalPrice
    ? product.originalPrice
    : product.price * 1.15;
  const savings = Math.max(0, originalPrice - product.price);
  const emiPerMonth = (product.price / 12).toFixed(2);

  const handleAddToCart = async () => {
    try {
      await dispatch(addToCart({ productId: product._id, quantity })).unwrap();
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleWishlistToggle = () => {
    if (isLoggedIn) {
      dispatch(toggleWishlist(product._id));
    }
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!newReview.comment.trim()) return;

    setSubmittingReview(true);
    setReviewMessage("");
    try {
      const res = await axios.post(`${config.apiUrl}/product/${product._id}/review`, {
        userName: authUser ? `${authUser.firstName || ""} ${authUser.lastName || ""}`.trim() || authUser.username : "Verified Customer",
        rating: Number(newReview.rating),
        comment: newReview.comment.trim(),
      });

      const postedReview = res.data.review;
      setProduct((prev) => ({
        ...prev,
        reviews: [postedReview, ...(prev.reviews || [])],
        ratings: [...(prev.ratings || []), Number(newReview.rating)],
      }));

      setNewReview({ rating: 5, comment: "" });
      setShowReviewForm(false);
      setReviewMessage("Thank you! Your verified review has been published.");
    } catch (err) {
      setReviewMessage("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Compile full specs dictionary with smart fallbacks
  const specs = {
    ...(typeof product.details === "object" ? product.details : {}),
    ...(typeof product.specs === "object" ? product.specs : {}),
  };
  const hasSpecs = Object.values(specs).some(Boolean);

  return (
    <div className="product-details-overlay" onClick={onClose}>
      <div className="FullProduct" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Close details">
          <i className="bi bi-x-lg"></i>
        </button>

        <div className="details-layout">
          {/* ================= LEFT VISUAL & TRUST COLUMN ================= */}
          <div className="details-visual-col">
            <div className="details-visual-box">
              <span className="details-type-pill">{product.type || "Store Item"}</span>

              <div className="details-image-container">
                <img
                  src={getProductImage(product)}
                  alt={product.name}
                  className="details-product-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/not-found.svg";
                  }}
                />
              </div>

              <div className="details-badges-row">
                <span className="details-rating-badge">
                  <i className="bi bi-star-fill"></i> {avgRating} ★ ({totalReviewsCount} Customer Ratings)
                </span>
                <span
                  className={`details-stock-badge ${
                    product.stock > 5 ? "in-stock" : "low-stock"
                  }`}
                >
                  <i className="bi bi-check-circle-fill"></i>
                  {product.stock > 0 ? `${product.stock} Units in Stock` : "Out of Stock"}
                </span>
              </div>
            </div>

            {/* Merchant / Seller Info Card */}
            <div className="details-merchant-card">
              <div className="merchant-avatar">
                <i className="bi bi-shop"></i>
              </div>
              <div className="merchant-text">
                <span className="merchant-label">Sold & Shipped By:</span>
                <strong>{product.sellerName || "Sony Authorized Flagship Store"}</strong>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                  <span className="merchant-badge">
                    <i className="bi bi-patch-check-fill"></i> Verified Partner
                  </span>
                  <span className="merchant-badge" style={{ background: "#fef3c7", color: "#92400e", borderColor: "#fde68a" }}>
                    <i className="bi bi-star-fill text-amber"></i> 4.9★ Seller
                  </span>
                </div>
              </div>
            </div>

            {/* Flipkart / Amazon Services & Guarantees Trust Grid */}
            <div className="details-trust-grid">
              <div className="trust-grid-item">
                <i className="bi bi-truck text-emerald"></i>
                <div>
                  <strong>Free 2-Day Delivery</strong>
                  <span>Fast tracked dispatch</span>
                </div>
              </div>
              <div className="trust-grid-item">
                <i className="bi bi-arrow-repeat text-blue"></i>
                <div>
                  <strong>7 Days Replacement</strong>
                  <span>Hassle-free return policy</span>
                </div>
              </div>
              <div className="trust-grid-item">
                <i className="bi bi-shield-check text-purple"></i>
                <div>
                  <strong>Brand Warranty</strong>
                  <span>{product.warranty || "2 Years Comprehensive"}</span>
                </div>
              </div>
              <div className="trust-grid-item">
                <i className="bi bi-patch-check-fill text-amber"></i>
                <div>
                  <strong>100% Genuine</strong>
                  <span>Verified authenticity</span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT INFO & ACTION COLUMN ================= */}
          <div className="details-info-col">
            <div className="details-header">
              <div className="brand-and-category">
                <span className="details-brand-pill">{product.brand || "TheStore Brand"}</span>
                <span className="details-category-tag">{product.type}</span>
                <span className="details-tag-pill">
                  <i className="bi bi-lightning-charge-fill"></i> Popular Choice
                </span>
              </div>
              <h2>{product.name}</h2>
              <p className="details-desc">{product.description}</p>
            </div>

            {/* Pricing Section with Flipkart/Amazon Savings & EMI */}
            <div className="details-pricing">
              <div className="price-main">
                <span className="price-currency">$</span>
                <span className="price-num">{product.price.toFixed(2)}</span>
                {originalPrice > product.price && (
                  <span className="details-orig-price">${originalPrice.toFixed(2)}</span>
                )}
                {product.discountPercent > 0 && (
                  <span className="details-discount-pill">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>

              <div className="price-extra-details">
                {savings > 0 && (
                  <span className="savings-callout">
                    <i className="bi bi-tag-fill"></i> You save ${savings.toFixed(2)} on this order
                  </span>
                )}
                <span className="emi-callout">
                  <i className="bi bi-credit-card-2-front"></i> Or <strong>${emiPerMonth}/mo</strong> with No-Cost EMI
                </span>
                <span className="tax-inclusive-lbl">Inclusive of all applicable taxes</span>
              </div>

              {quantity > 1 && (
                <div className="price-total-preview">
                  Subtotal ({quantity} items): <strong>${(product.price * quantity).toFixed(2)}</strong>
                </div>
              )}
            </div>

            {/* Quantity Stepper & Actions */}
            <div className="purchase-action-container">
              <div className="details-quantity-row">
                <span className="qty-label">Quantity:</span>
                <div className="quantity-controls">
                  <button
                    type="button"
                    disabled={cartLoading || quantity <= 1}
                    onClick={() => setQuantity((q) => q - 1)}
                    aria-label="Decrease quantity"
                  >
                    <i className="bi bi-dash"></i>
                  </button>

                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    aria-label="Current quantity"
                  />

                  <button
                    type="button"
                    disabled={cartLoading || quantity >= product.stock}
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                  >
                    <i className="bi bi-plus"></i>
                  </button>
                </div>
              </div>

              {/* Add to Cart and Wishlist Button Strip */}
              <div className="productsalignbtn">
                <Button
                  variant={addedSuccess ? "secondary" : "primary"}
                  size="md"
                  loading={cartLoading}
                  disabled={product.stock <= 0}
                  onClick={handleAddToCart}
                  className={`modal-add-cart-btn ${addedSuccess ? "is-added" : ""}`}
                >
                  {addedSuccess ? (
                    <>
                      <i className="bi bi-check2-circle"></i> Added to Cart!
                    </>
                  ) : (
                    <>
                      <i className="bi bi-cart-plus-fill"></i> Add to Cart
                    </>
                  )}
                </Button>

                <button
                  type="button"
                  className={`modal-wishlist-btn ${isWishlisted ? "active" : ""}`}
                  onClick={handleWishlistToggle}
                  aria-label={isWishlisted ? "Wishlisted" : "Add to wishlist"}
                  title={isWishlisted ? "In Wishlist" : "Save to Wishlist"}
                >
                  <i className={`bi ${isWishlisted ? "bi-heart-fill" : "bi-heart"}`}></i>
                </button>
              </div>
            </div>

            {/* Navigation Tabs for In-Depth Content */}
            <div className="modal-info-tabs">
              <button
                type="button"
                className={`info-tab-btn ${activeInfoTab === "specs" ? "active" : ""}`}
                onClick={() => setActiveInfoTab("specs")}
              >
                <i className="bi bi-cpu"></i> Full Specifications
              </button>
              <button
                type="button"
                className={`info-tab-btn ${activeInfoTab === "features" ? "active" : ""}`}
                onClick={() => setActiveInfoTab("features")}
              >
                <i className="bi bi-stars"></i> Key Features ({product.highlights?.length || 4})
              </button>
              <button
                type="button"
                className={`info-tab-btn ${activeInfoTab === "box" ? "active" : ""}`}
                onClick={() => setActiveInfoTab("box")}
              >
                <i className="bi bi-box-seam"></i> In The Box
              </button>
              <button
                type="button"
                className={`info-tab-btn ${activeInfoTab === "reviews" ? "active" : ""}`}
                onClick={() => setActiveInfoTab("reviews")}
              >
                <i className="bi bi-chat-heart"></i> Reviews & Ratings ({totalReviewsCount})
              </button>
            </div>

            {/* ================= TAB 1: FULL TECHNICAL SPECIFICATIONS ================= */}
            {activeInfoTab === "specs" && (
              <div className="Subdetails">
                <table className="tech-specs-table">
                  <tbody>
                    {/* Display & Screen Attributes */}
                    {(specs.screenSize || specs.display || specs.resolution) && (
                      <tr className="spec-section-header">
                        <td colSpan="2"><i className="bi bi-tv"></i> Display & Screen Details</td>
                      </tr>
                    )}
                    {specs.screenSize && (
                      <tr>
                        <th>Screen Size</th>
                        <td>{specs.screenSize}</td>
                      </tr>
                    )}
                    {specs.display && (
                      <tr>
                        <th>Display Technology</th>
                        <td>{specs.display}</td>
                      </tr>
                    )}
                    {specs.resolution && (
                      <tr>
                        <th>Resolution</th>
                        <td>{specs.resolution}</td>
                      </tr>
                    )}
                    {specs.refreshRate && (
                      <tr>
                        <th>Refresh Rate</th>
                        <td>{specs.refreshRate}</td>
                      </tr>
                    )}

                    {/* Audio & Smart Platform */}
                    {(specs.soundOutput || specs.smartFeatures) && (
                      <tr className="spec-section-header">
                        <td colSpan="2"><i className="bi bi-volume-up"></i> Audio & Smart Features</td>
                      </tr>
                    )}
                    {specs.soundOutput && (
                      <tr>
                        <th>Sound Output</th>
                        <td>{specs.soundOutput}</td>
                      </tr>
                    )}
                    {specs.smartFeatures && (
                      <tr>
                        <th>Smart TV Features</th>
                        <td>{specs.smartFeatures}</td>
                      </tr>
                    )}

                    {/* Computing / Processor / Memory */}
                    {(specs.processor || specs.ram || specs.storage || specs.graphics) && (
                      <tr className="spec-section-header">
                        <td colSpan="2"><i className="bi bi-cpu"></i> Processor & Hardware Engine</td>
                      </tr>
                    )}
                    {specs.processor && (
                      <tr>
                        <th>Processor (CPU)</th>
                        <td>{specs.processor}</td>
                      </tr>
                    )}
                    {specs.ram && (
                      <tr>
                        <th>RAM Memory</th>
                        <td>{specs.ram}</td>
                      </tr>
                    )}
                    {specs.storage && (
                      <tr>
                        <th>Internal Storage</th>
                        <td>{specs.storage}</td>
                      </tr>
                    )}
                    {specs.graphics && (
                      <tr>
                        <th>Graphics (GPU)</th>
                        <td>{specs.graphics}</td>
                      </tr>
                    )}
                    {specs.battery && (
                      <tr>
                        <th>Battery Life</th>
                        <td>{specs.battery}</td>
                      </tr>
                    )}
                    {specs.os && (
                      <tr>
                        <th>Operating System</th>
                        <td>{specs.os}</td>
                      </tr>
                    )}

                    {/* Connectivity & Ports */}
                    {(specs.ports || specs.connectivity) && (
                      <tr className="spec-section-header">
                        <td colSpan="2"><i className="bi bi-usb-plug"></i> Connectivity & Input Ports</td>
                      </tr>
                    )}
                    {specs.ports && (
                      <tr>
                        <th>Input / Output Ports</th>
                        <td>{specs.ports}</td>
                      </tr>
                    )}
                    {specs.connectivity && (
                      <tr>
                        <th>Wireless Connectivity</th>
                        <td>{specs.connectivity}</td>
                      </tr>
                    )}

                    {/* Physical Dimensions & Build */}
                    {(specs.dimensions || specs.weight || specs.color || specs.material) && (
                      <tr className="spec-section-header">
                        <td colSpan="2"><i className="bi bi-aspect-ratio"></i> Dimensions & Build Quality</td>
                      </tr>
                    )}
                    {specs.dimensions && (
                      <tr>
                        <th>Dimensions</th>
                        <td>{specs.dimensions}</td>
                      </tr>
                    )}
                    {specs.weight && (
                      <tr>
                        <th>Weight</th>
                        <td>{specs.weight}</td>
                      </tr>
                    )}
                    {specs.color && (
                      <tr>
                        <th>Color Variant</th>
                        <td>{specs.color}</td>
                      </tr>
                    )}
                    {specs.material && (
                      <tr>
                        <th>Fabric / Material</th>
                        <td>{specs.material}</td>
                      </tr>
                    )}
                    {specs.fit && (
                      <tr>
                        <th>Fit Type</th>
                        <td>{specs.fit}</td>
                      </tr>
                    )}
                    {specs.gender && (
                      <tr>
                        <th>Target Department</th>
                        <td>{specs.gender}</td>
                      </tr>
                    )}

                    {/* Literature & Publishing */}
                    {specs.author && (
                      <tr>
                        <th>Author</th>
                        <td>{specs.author}</td>
                      </tr>
                    )}
                    {specs.publisher && (
                      <tr>
                        <th>Publisher</th>
                        <td>{specs.publisher}</td>
                      </tr>
                    )}
                    {specs.pages && (
                      <tr>
                        <th>Page Count</th>
                        <td>{specs.pages} Pages</td>
                      </tr>
                    )}
                    {specs.genre && (
                      <tr>
                        <th>Genre & Subject</th>
                        <td>{specs.genre}</td>
                      </tr>
                    )}

                    {/* Warranty */}
                    <tr className="spec-section-header">
                      <td colSpan="2"><i className="bi bi-shield-check"></i> Manufacturer Warranty</td>
                    </tr>
                    <tr>
                      <th>Warranty Duration</th>
                      <td>{product.warranty || "2 Years Comprehensive Brand Warranty"}</td>
                    </tr>
                    <tr>
                      <th>Service Type</th>
                      <td>Onsite Service / Authorized Service Center Replacement</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* ================= TAB 2: KEY FEATURE HIGHLIGHTS ================= */}
            {activeInfoTab === "features" && (
              <div className="product-highlights-box">
                <ul className="highlights-list">
                  {(product.highlights && product.highlights.length > 0
                    ? product.highlights
                    : [
                        "Engineered with high precision components for superior performance and reliability",
                        "Intuitive, seamless user experience with modern design architecture",
                        "Energy-efficient certified hardware for lower power consumption and durability",
                        "Extensively tested against strict quality control and safety standards",
                      ]
                  ).map((h, i) => (
                    <li key={i}>
                      <i className="bi bi-patch-check-fill text-purple"></i>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ================= TAB 3: WHAT'S IN THE BOX ================= */}
            {activeInfoTab === "box" && (
              <div className="product-box-contents">
                <div className="box-header-badge">
                  <i className="bi bi-box2-heart-fill"></i>
                  <span>Package Inclusions & Accessories</span>
                </div>
                <ul className="box-items-list">
                  {(product.whatsInTheBox && product.whatsInTheBox.length > 0
                    ? product.whatsInTheBox
                    : [
                        `1x ${product.name} Core Unit`,
                        "1x Remote / Control Unit & Batteries",
                        "1x Power Adapter & AC Cable",
                        "1x Table-Top Stand & Fastening Screws",
                        "1x Quick Installation Guide & Official Warranty Card",
                      ]
                  ).map((item, idx) => (
                    <li key={idx}>
                      <i className="bi bi-box-seam-fill text-emerald"></i>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ================= TAB 4: RATINGS & CUSTOMER REVIEWS ================= */}
            {activeInfoTab === "reviews" && (
              <div className="product-reviews-box">
                {/* Rating Overview & Progress Bars */}
                <div className="ratings-summary-dashboard">
                  <div className="overall-score-card">
                    <span className="big-rating-number">{avgRating}</span>
                    <div className="stars-row-gold">
                      {"★".repeat(Math.round(parseFloat(avgRating)))}{"☆".repeat(5 - Math.round(parseFloat(avgRating)))}
                    </div>
                    <span className="rating-total-lbl">Based on {totalReviewsCount} verified reviews</span>
                  </div>

                  <div className="rating-bars-column">
                    {[5, 4, 3, 2, 1].map((star) => (
                      <div key={star} className="rating-bar-row">
                        <span className="star-num">{star} ★</span>
                        <div className="progress-bar-bg">
                          <div
                            className="progress-bar-fill"
                            style={{ width: `${ratingDistribution[star]}%` }}
                          ></div>
                        </div>
                        <span className="star-pct">{ratingDistribution[star]}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Write a Review Button / Form */}
                <div className="write-review-section">
                  {!showReviewForm ? (
                    <Button
                      variant="outline"
                      size="sm"
                      icon={<i className="bi bi-pencil-square"></i>}
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write a Customer Review
                    </Button>
                  ) : (
                    <form onSubmit={handlePostReview} className="inline-review-form">
                      <div className="form-title-row">
                        <h4>Share Your Experience</h4>
                        <button
                          type="button"
                          className="cancel-form-btn"
                          onClick={() => setShowReviewForm(false)}
                        >
                          ✕
                        </button>
                      </div>

                      <div className="rating-picker-row">
                        <label>Your Rating:</label>
                        <div className="star-rating-buttons">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              className={`star-pick-btn ${newReview.rating >= s ? "selected" : ""}`}
                              onClick={() => setNewReview((p) => ({ ...p, rating: s }))}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        rows="3"
                        required
                        placeholder="Write your honest thoughts about the picture quality, sound, build, and delivery..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview((p) => ({ ...p, comment: e.target.value }))}
                      ></textarea>

                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        loading={submittingReview}
                        icon={<i className="bi bi-send-fill"></i>}
                      >
                        Submit Verified Review
                      </Button>
                    </form>
                  )}

                  {reviewMessage && (
                    <p className="review-status-msg">{reviewMessage}</p>
                  )}
                </div>

                {/* Reviews List */}
                <div className="reviews-list">
                  {(product.reviews && product.reviews.length > 0
                    ? product.reviews
                    : [
                        {
                          userName: "Alex R. (Verified Buyer)",
                          comment: "Stunning picture clarity and rich sound. Setup was very smooth and effortless.",
                          rating: 5,
                          createdAt: new Date(Date.now() - 14 * 86400000),
                        },
                        {
                          userName: "Devon K. (Verified Buyer)",
                          comment: "Very pleased with the fast 2-day delivery and authentic warranty documentation.",
                          rating: 5,
                          createdAt: new Date(Date.now() - 30 * 86400000),
                        },
                      ]
                  ).map((rev, i) => (
                    <div key={rev._id || i} className="review-card">
                      <div className="review-header">
                        <span className="review-stars">
                          {"★".repeat(rev.rating || 5)}{"☆".repeat(5 - (rev.rating || 5))}
                        </span>
                        <div className="reviewer-meta">
                          <strong className="review-author">{rev.userName || "Verified Buyer"}</strong>
                          <span className="verified-pill">
                            <i className="bi bi-patch-check-fill"></i> Verified Purchase
                          </span>
                          <span className="review-date">
                            <i className="bi bi-calendar3"></i>{" "}
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent"}
                          </span>
                        </div>
                      </div>
                      <p className="review-comment">&ldquo;{rev.comment}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RELATED PRODUCTS RECOMMENDATION RAIL ================= */}
        {relatedProducts.length > 0 && (
          <div className="related-products-section">
            <div className="related-header">
              <h3>
                <i className="bi bi-collection-play-fill"></i> Customers Also Viewed & Related Recommendations
              </h3>
              <p>Compare similar specifications, screen sizes, and customer ratings</p>
            </div>

            <div className="related-products-grid">
              {relatedProducts.map((rel) => (
                <div
                  key={rel._id}
                  className="related-item-card"
                  onClick={() => {
                    setProduct(rel);
                    setQuantity(1);
                  }}
                >
                  <div className="related-img-wrap">
                    <img
                      src={getProductImage(rel)}
                      alt={rel.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/not-found.svg";
                      }}
                    />
                  </div>
                  <div className="related-info">
                    <span className="related-type">{rel.type}</span>
                    <h4 title={rel.name}>{rel.name}</h4>
                    {rel.specs?.display && (
                      <span className="related-spec-pill">{rel.specs.display.substring(0, 24)}...</span>
                    )}
                    <strong className="related-price">${(rel.price || 0).toFixed(2)}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
