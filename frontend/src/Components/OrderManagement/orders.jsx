import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  fetchOrders,
  cancelOrder,
  clearOrderMessage,
} from "../../store/slices/ordersSlice";

import MessageModal from "../ui/messagemodel/messageModel";
import "./orders.css";

const OrderManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { items, loading, error, message, messageType } = useSelector(
    (state) => state.orders
  );

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    dispatch(fetchOrders());
  }, [dispatch, isLoggedIn, navigate]);

  const toggleOrderItems = (orderId) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleCloseModal = () => {
    dispatch(clearOrderMessage());
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="order-management">
        <h1>Your Orders</h1>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) return <p>{error}</p>;

  return (
    <div className="order-management">
      <h1>Your Orders</h1>

      {items.length ? (
        <ul className="order-list">
          {items.map((order) => (
            <li key={order._id} className="order-item">
              <h2>Order ID: {order._id}</h2>
              <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Total Price: ${order.totalPrice.toFixed(2)}</p>

              <button
                className="toggle-items-button"
                onClick={() => toggleOrderItems(order._id)}
              >
                {expandedOrderId === order._id ? "Hide Items" : "Show Items"}
              </button>

              {expandedOrderId === order._id && (
                <ul className="order-items">
                  {order.items.map((item) => (
                    <li key={item.productId._id} className="order-item-detail">
                      <img
                        src={item.productId.imageUrl}
                        alt={item.productId.name}
                        className="order-item-image"
                      />
                      <div className="order-item-info">
                        <h4>{item.productId.name}</h4>
                        <p>Price: ${item.productId.price.toFixed(2)}</p>
                        <p>Quantity: {item.quantity}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {order.status !== "Cancelled" && (
                <button
                  className="cancel-order-button"
                  disabled={loading}
                  onClick={() => dispatch(cancelOrder(order._id))}
                >
                  Cancel Order
                </button>
              )}

              <p>Status: {order.status}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>You have no orders.</p>
      )}

      {messageType && (
        <MessageModal
          message={message}
          type={messageType}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default OrderManagement;
