import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

import { updateProfile } from "../../store/slices/profileSlice";
import MessageModal from "../ui/messagemodel/messageModel";

import "./profile.edit.css";

const ProfileEdit = ({ user, closeContainer }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        setMessage("Profile updated successfully");
        setMessageType("success");

        setTimeout(() => {
          closeContainer();
        }, 1200);
      })
      .catch((err) => {
        setMessage(err || "Failed to update profile");
        setMessageType("error");
      });
  };

  return (
    <>
      <div className="profileEditContainer">
        <h2>Edit Profile</h2>

        <form onSubmit={handleSubmit}>
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
            <button type="submit" className="save-button">
              Save
            </button>
            <button
              type="button"
              onClick={closeContainer}
              className="cancel-button"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {message && (
        <MessageModal
          message={message}
          type={messageType}
          onClose={() => setMessage("")}
        />
      )}
    </>
  );
};

export default ProfileEdit;
