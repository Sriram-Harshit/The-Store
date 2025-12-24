import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchProducts,
  searchProducts,
} from "../../store/slices/productsSlice";

import {
  fetchWishlist,
  toggleWishlist,
} from "../../store/slices/wishlistSlice";

import ProductDetails from "../ProductDetails/productdetails";
import MessageModal from "../ui/messagemodel/messageModel";
import Button from "../ui/buttons/button";

import "./products.css";

const ProductDisplay = () => {
  const dispatch = useDispatch();

  const { items, searchResults, loading, error } = useSelector(
    (state) => state.products
  );

  const wishlistItems = useSelector((state) => state.wishlist.items);
  const searchTerm = useSelector((state) => state.search.searchterm);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  /* ===== INITIAL LOAD ===== */
  useEffect(() => {
    dispatch(fetchProducts());
    if (isLoggedIn) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isLoggedIn]);

  /* ===== SEARCH ===== */
  useEffect(() => {
    if (searchTerm.trim()) {
      dispatch(searchProducts(searchTerm));
    }
  }, [dispatch, searchTerm]);

  const displayedProducts = searchTerm ? searchResults : items;

  const handleWishlist = (productId) => {
    dispatch(toggleWishlist(productId))
      .unwrap()
      .then(() => {
        setMessage("Wishlist updated");
        setMessageType("success");
      })
      .catch((err) => {
        setMessage(err);
        setMessageType("error");
      });
  };

  if (loading) return null;
  if (error) return <p>{error}</p>;

  return (
    <div className="product-display">
      <div className="product-cards">
        {displayedProducts.length ? (
          displayedProducts.map((product) => (
            <div
              key={product._id}
              className="product-card"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="name-price-aligner">
                <h2>{product.name}</h2>
                <p className="price">${product.price.toFixed(2)}</p>
              </div>

              <div className="addwishlist">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(product);
                  }}
                >
                  View Details
                </Button>

                <i
                  className={`bi Heart ${
                    wishlistItems.includes(product._id)
                      ? "bi-heart-fill wishlisted"
                      : "bi-heart"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleWishlist(product._id);
                  }}
                ></i>
              </div>
            </div>
          ))
        ) : (
          <p>No results found</p>
        )}
      </div>

      {selectedProduct && (
        <ProductDetails
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

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
