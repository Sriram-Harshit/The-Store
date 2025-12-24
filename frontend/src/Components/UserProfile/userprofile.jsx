import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchProfile } from "../../store/slices/profileSlice";
import {
  fetchWishlist,
  toggleWishlist,
} from "../../store/slices/wishlistSlice";
import { fetchProducts } from "../../store/slices/productsSlice";
import Button from "../ui/buttons/button";
import AddressManagement from "../Address/address";
import ProfileEdit from "../ProfileEdit/profile.edit";
import MessageModal from "../ui/messagemodel/messageModel";

import "./userprofile.css";

const UserProfile = () => {
  const dispatch = useDispatch();

  /* ===== REDUX STATE ===== */
  const {
    data: userDetails,
    loading: profileLoading,
    error,
  } = useSelector((state) => state.profile);

  const wishlistIds = useSelector((state) => state.wishlist.items);
  const wishlistLoading = useSelector((state) => state.wishlist.loading);

  const products = useSelector((state) => state.products.items);
  const productsLoading = useSelector((state) => state.products.loading);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  /* ===== LOCAL UI STATE ===== */
  const [editProfile, setEditProfile] = useState(false);
  const [editAddress, setEditAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  /* ===== FETCH DATA (FIXED ORDER) ===== */
  useEffect(() => {
    if (!isLoggedIn) return;

    dispatch(fetchProfile());
    dispatch(fetchWishlist());

    if (!products.length) {
      dispatch(fetchProducts());
    }
  }, [dispatch, isLoggedIn]);

  /* ===== DERIVED DATA ===== */
  const wishlistProducts =
    products.length && wishlistIds.length
      ? products.filter((product) => wishlistIds.includes(product._id))
      : [];

  /* ===== HANDLERS ===== */
  const removeWishlist = (productId) => {
    dispatch(toggleWishlist(productId))
      .unwrap()
      .then(() => {
        setMessage("Removed from wishlist");
        setMessageType("success");
      })
      .catch((err) => {
        setMessage(err || "Something went wrong");
        setMessageType("error");
      });
  };

  /* ===== GLOBAL LOADING ===== */
  if (profileLoading) return null;
  if (error) return <p>{error}</p>;

  return (
    <div className="card-container">
      {/* ================= PROFILE CARD ================= */}
      <div className="cards profileDetails">
        <div className="profileedit">
          <h1>User Profile</h1>
          <Button
            size="sm"
            variant="primary"
            className="profileeditbtn"
            onClick={() => setEditProfile(true)}
          >
            Edit
          </Button>
        </div>

        {userDetails && (
          <>
            <p>
              <strong>Username:</strong> {userDetails.username}
            </p>
            <p>
              <strong>Email:</strong> {userDetails.email}
            </p>
            <p>
              <strong>First Name:</strong> {userDetails.firstName}
            </p>
            <p>
              <strong>Last Name:</strong> {userDetails.lastName}
            </p>
            <p>
              <strong>Phone:</strong> {userDetails.phone}
            </p>
            <p>
              <strong>Account Type:</strong> {userDetails.accountType}
            </p>
          </>
        )}
      </div>

      {/* ================= ADDRESS CARD ================= */}
      <div className="cards addressscard">
        <div className="addressadd">
          <h1>Addresses</h1>
          <Button
            size="sm"
            variant="primary"
            className="addressaddbtn"
            onClick={() => {
              setSelectedAddress(null);
              setEditAddress(true);
            }}
          >
            Add
          </Button>
        </div>

        {userDetails?.addresses?.length ? (
          <ul className="addressesContainer">
            {userDetails.addresses.map((address) => (
              <li key={address._id} className="addressCard">
                <p>Street: {address.street}</p>
                <p>City: {address.city}</p>
                <p>State: {address.state}</p>
                <Button
                  size="sm"
                  variant="primary"
                  className="addresseditbtn"
                  onClick={() => {
                    setSelectedAddress(address);
                    setEditAddress(true);
                  }}
                >
                  Edit
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No addresses available.</p>
        )}
      </div>

      {/* ================= WISHLIST CARD (FIXED) ================= */}
      <div className="cards wishlist-card">
        <h1>Wishlisted Items</h1>

        {wishlistLoading || productsLoading ? (
          <p>Loading wishlist...</p>
        ) : wishlistProducts.length ? (
          <ul className="wishlisted-items-container">
            {wishlistProducts.map((product) => (
              <li key={product._id} className="wishlisted-item">
                <i
                  className="bi bi-heart-fill Heart wishlisted"
                  onClick={() => removeWishlist(product._id)}
                ></i>

                <div className="wishlisted-item-details">
                  <h3>{product.name}</h3>
                  <p>${product.price.toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No items in wishlist.</p>
        )}
      </div>

      {/* ================= MODALS ================= */}
      {editProfile && (
        <div className="profile-edit-overlay">
          <ProfileEdit
            user={userDetails}
            closeContainer={() => setEditProfile(false)}
          />
        </div>
      )}

      {editAddress && (
        <div className="address-management-overlay">
          <AddressManagement
            address={selectedAddress}
            closeContainer={() => setEditAddress(false)}
          />
        </div>
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

export default UserProfile;
