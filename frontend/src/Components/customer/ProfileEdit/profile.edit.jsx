import { useState } from "react";
import { useDispatch } from "react-redux";

import { updateProfile } from "../../../store/slices/profileSlice";
import { updateAuthUser } from "../../../store/slices/authSlice";
import Button from "../../common/ui/buttons/button";
import MessageModal from "../../common/ui/messagemodel/messageModel";

import "./profile.edit.css";

const ProfileEdit = ({ user, closeContainer }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState(() => ({
    username: user?.username || "",
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    accountType: user?.accountType === "regular" ? "user" : (user?.accountType || "user"),
  }));

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        dispatch(updateAuthUser({ accountType: formData.accountType }));
        setLoading(false);
        setMessage("Profile updated successfully!");
        setMessageType("success");

        setTimeout(() => {
          closeContainer();
        }, 1000);
      })
      .catch((err) => {
        setLoading(false);
        setMessage(err || "Failed to update profile");
        setMessageType("error");
      });
  };

  return (
    <div className="profile-edit-modal-card">
      <div className="profile-edit-header">
        <div className="profile-edit-title-group">
          <div className="profile-edit-icon-wrap">
            <i className="bi bi-person-gear"></i>
          </div>
          <div>
            <h3>Edit Profile Details</h3>
            <p className="profile-edit-subtitle">Keep your account information current</p>
          </div>
        </div>
        <button
          type="button"
          className="profile-modal-close-btn"
          onClick={closeContainer}
          aria-label="Close"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="profile-edit-form">
        <div className="profile-form-grid">
          <div className="form-field">
            <label htmlFor="edit-first-name">First Name</label>
            <div className="input-with-icon">
              <i className="bi bi-person"></i>
              <input
                id="edit-first-name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="edit-last-name">Last Name</label>
            <div className="input-with-icon">
              <i className="bi bi-person"></i>
              <input
                id="edit-last-name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label htmlFor="edit-username">Username</label>
            <div className="input-with-icon">
              <i className="bi bi-at"></i>
              <input
                id="edit-username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username"
                required
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label htmlFor="edit-email">Email Address</label>
            <div className="input-with-icon">
              <i className="bi bi-envelope"></i>
              <input
                id="edit-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label htmlFor="edit-phone">Phone Number</label>
            <div className="input-with-icon">
              <i className="bi bi-telephone"></i>
              <input
                id="edit-phone"
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                required
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label htmlFor="edit-accountType">Account Role</label>
            <div className="input-with-icon">
              <i className="bi bi-shield-check"></i>
              <input
                id="edit-accountType"
                type="text"
                readOnly
                disabled
                value={
                  formData.accountType === "admin"
                    ? "🛡️ Platform Administrator"
                    : formData.accountType === "seller"
                    ? "🏪 Verified Store Merchant"
                    : "👤 Customer (Verified Shopper)"
                }
                className="edit-readonly-input"
              />
            </div>
          </div>
        </div>

        <div className="profile-edit-actions">
          <Button
            type="button"
            variant="outline"
            onClick={closeContainer}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={<i className="bi bi-check2-circle"></i>}
          >
            Save Changes
          </Button>
        </div>
      </form>

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

export default ProfileEdit;
