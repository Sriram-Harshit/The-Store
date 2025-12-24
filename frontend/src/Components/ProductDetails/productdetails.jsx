import { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { addToCart } from "../../store/slices/cartSlice";
import { toggleWishlist } from "../../store/slices/wishlistSlice";
import Button from "../ui/buttons/button";

import "./productdetails.css";

const ProductDetails = ({ product, onClose }) => {
  const dispatch = useDispatch();
  const wishlist = useSelector((state) => state.wishlist.items);
  const { loading } = useSelector((state) => state.cart);

  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isInWishlist = wishlist.includes(product._id);

  const details = useMemo(() => {
    if (!product.details) return null;

    return Object.entries(product.details).map(([key, value]) => (
      <p key={key}>
        <strong>{key}:</strong>{" "}
        {typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)}
      </p>
    ));
  }, [product.details]);

  const handleAddToCart = async () => {
    await dispatch(addToCart({ productId: product._id, quantity })).unwrap();

    setQuantity(1); // ✅ reset after add
  };

  return (
    <div className="product-details-overlay" onClick={onClose}>
      <div className="FullProduct" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="About">
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p>Stock: {product.stock}</p>
          <p className="price">${product.price.toFixed(2)}</p>

          <div className="quantity-controls">
            <button
              disabled={loading || quantity <= 1}
              onClick={() => setQuantity((q) => q - 1)}
            >
              −
            </button>

            <input type="number" value={quantity} readOnly />

            <button
              disabled={loading || quantity >= product.stock}
              onClick={() => setQuantity((q) => q + 1)}
            >
              +
            </button>
          </div>

          <div className="productsalignbtn">
            <Button
              variant="primary"
              loading={loading}
              onClick={handleAddToCart}
            >
              Add to Cart
            </Button>

            {/* <i
              className={`bi bi-heart Heart ${
                isInWishlist ? "wishlisted" : ""
              }`}
              onClick={() => dispatch(toggleWishlist(product._id))}
            ></i> */}
          </div>
        </div>

        {details && (
          <div className="Subdetails">
            <h3>Details</h3>
            {details}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
