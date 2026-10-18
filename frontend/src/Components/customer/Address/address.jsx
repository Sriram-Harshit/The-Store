import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addAddress,
  updateAddress,
  clearAddressMessage,
} from "../../../store/slices/addressSlice";

import Button from "../../common/ui/buttons/button";
import MessageModal from "../../common/ui/messagemodel/messageModel";
import "./address.css";

const AddressManagement = ({ address, closeContainer }) => {
  const dispatch = useDispatch();
  const { loading, message, messageType } = useSelector(
    (state) => state.address
  );

  const [formData, setFormData] = useState(() => ({
    apartment: address?.apartment || "",
    street: address?.street || "",
    city: address?.city || "",
    state: address?.state || "",
    postalcode: address?.postalcode || "",
    country: address?.country || "",
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (Object.values(formData).some((v) => !v.trim())) {
      dispatch(clearAddressMessage());
      return;
    }

    if (address) {
      dispatch(updateAddress({ id: address._id, address: formData }))
        .unwrap()
        .then(() => setTimeout(closeContainer, 800));
    } else {
      dispatch(addAddress(formData))
        .unwrap()
        .then(() => setTimeout(closeContainer, 800));
    }
  };

  return (
    <div className="address-modal-container">
      <div className="address-modal-header">
        <div className="address-modal-title">
          <div className="address-icon-wrap">
            <i className="bi bi-geo-alt-fill"></i>
          </div>
          <div>
            <h3>{address ? "Edit Shipping Address" : "Add New Address"}</h3>
            <p className="address-modal-subtitle">
              Enter your accurate delivery details below
            </p>
          </div>
        </div>
        <button
          type="button"
          className="address-close-btn"
          onClick={closeContainer}
          aria-label="Close"
        >
          <i className="bi bi-x-lg"></i>
        </button>
      </div>

      <form onSubmit={handleSave} className="address-form">
        <div className="address-form-grid">
          <div className="form-field full-width">
            <label htmlFor="addr-apt">Apartment / Suite / Unit</label>
            <div className="input-with-icon">
              <i className="bi bi-building"></i>
              <input
                id="addr-apt"
                name="apartment"
                placeholder="e.g. Apt 4B, Sky Heights"
                value={formData.apartment}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-field full-width">
            <label htmlFor="addr-street">Street Address</label>
            <div className="input-with-icon">
              <i className="bi bi-signpost"></i>
              <input
                id="addr-street"
                name="street"
                placeholder="e.g. 124 Main Street"
                value={formData.street}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="addr-city">City</label>
            <div className="input-with-icon">
              <i className="bi bi-buildings"></i>
              <input
                id="addr-city"
                name="city"
                placeholder="e.g. New York"
                value={formData.city}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="addr-state">State / Province</label>
            <div className="input-with-icon">
              <i className="bi bi-map"></i>
              <input
                id="addr-state"
                name="state"
                placeholder="e.g. NY"
                value={formData.state}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="addr-zip">Postal / Zip Code</label>
            <div className="input-with-icon">
              <i className="bi bi-mailbox"></i>
              <input
                id="addr-zip"
                name="postalcode"
                placeholder="e.g. 10001"
                value={formData.postalcode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="addr-country">Country</label>
            <div className="input-with-icon">
              <i className="bi bi-globe-americas"></i>
              <input
                id="addr-country"
                name="country"
                placeholder="e.g. United States"
                value={formData.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </div>

        <div className="address-actions">
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
            {address ? "Save Changes" : "Add Address"}
          </Button>
        </div>
      </form>

      {message && (
        <MessageModal
          message={message}
          type={messageType}
          onClose={() => dispatch(clearAddressMessage())}
        />
      )}
    </div>
  );
};

export default AddressManagement;
