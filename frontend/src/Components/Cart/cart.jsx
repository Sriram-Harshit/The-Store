import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  placeOrder,
  clearCartMessage,
} from "../../store/slices/cartSlice";

import MessageModal from "../ui/messagemodel/messageModel";
import Button from "../ui/buttons/button";

import "./cart.css";

const Cart = () => {
  const dispatch = useDispatch();

  const { items, loading, error, message, messageType } = useSelector(
    (state) => state.cart
  );

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const totalPrice = items
    .reduce((sum, i) => sum + i.productId.price * i.quantity, 0)
    .toFixed(2);

  if (error) return <p>{error}</p>;

  return (
    <div className="cart-page">
      <h1>Your Cart</h1>

      {items.length ? (
        <>
          <ul className="cart-items-list">
            {items.map((item) => (
              <li key={item.productId._id} className="cart-item">
                <div className="cart-item-details">
                  <h2>{item.productId.name}</h2>
                  <p>Price: ${item.productId.price.toFixed(2)}</p>

                  <div className="quantity-controls">
                    <Button
                      size="sm"
                      variant="outline"
                      loading={loading}
                      disabled={item.quantity <= 1}
                      onClick={() =>
                        dispatch(
                          updateCartItem({
                            productId: item.productId._id,
                            quantity: item.quantity - 1,
                          })
                        )
                      }
                    >
                      -
                    </Button>

                    <span>{item.quantity}</span>

                    <Button
                      size="sm"
                      variant="outline"
                      loading={loading}
                      disabled={item.quantity >= item.productId.stock}
                      onClick={() =>
                        dispatch(
                          updateCartItem({
                            productId: item.productId._id,
                            quantity: item.quantity + 1,
                          })
                        )
                      }
                    >
                      +
                    </Button>
                  </div>

                  <Button
                    size="sm"
                    variant="danger"
                    loading={loading}
                    onClick={() => dispatch(removeFromCart(item.productId._id))}
                  >
                    Remove
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          <div className="cart-summary">
            <h2>Total: ${totalPrice}</h2>
            <Button
              variant="primary"
              loading={loading}
              onClick={() => dispatch(placeOrder())}
            >
              Place Order
            </Button>
          </div>
        </>
      ) : (
        <p>Your cart is empty.</p>
      )}

      {message && (
        <MessageModal
          message={message}
          type={messageType}
          onClose={() => dispatch(clearCartMessage())}
        />
      )}
    </div>
  );
};

export default Cart;
