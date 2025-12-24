import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addAddress,
  updateAddress,
  clearAddressMessage,
} from "../../store/slices/addressSlice";

import MessageModal from "../ui/messagemodel/messageModel";
import "./address.css";

const AddressManagement = ({ address, closeContainer }) => {
  const dispatch = useDispatch();
  const { loading, message, messageType } = useSelector(
    (state) => state.address
  );

  const [formData, setFormData] = useState({
    apartment: "",
    street: "",
    city: "",
    state: "",
    postalcode: "",
    country: "",
  });

  useEffect(() => {
    if (address) {
      setFormData({
        apartment: address.apartment || "",
        street: address.street || "",
        city: address.city || "",
        state: address.state || "",
        postalcode: address.postalcode || "",
        country: address.country || "",
      });
    }
  }, [address]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();

    if (Object.values(formData).some((v) => !v)) {
      dispatch(clearAddressMessage());
      return;
    }

    if (address) {
      dispatch(updateAddress({ id: address._id, address: formData }))
        .unwrap()
        .then(() => setTimeout(closeContainer, 1000));
    } else {
      dispatch(addAddress(formData))
        .unwrap()
        .then(() => setTimeout(closeContainer, 1000));
    }
  };

  return (
    <div className="address-management-overlay">
      <div className="address-management-container">
        <h2>{address ? "Edit Address" : "Add Address"}</h2>

        <form onSubmit={handleSave}>
          {Object.keys(formData).map((field) => (
            <div key={field} className="FieldContainer">
              <label>{field.toUpperCase()}</label>
              <input
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="InputField"
                required
              />
            </div>
          ))}

          <div className="button-group">
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={closeContainer} disabled={loading}>
              Cancel
            </button>
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
    </div>
  );
};

export default AddressManagement;
