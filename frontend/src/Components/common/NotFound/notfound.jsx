import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { notify } from "../../../utils/notify";
import Button from "../ui/buttons/button";

import notFoundImg from "../../../../assets/not-found.svg";
import "./notfound.css";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    notify("Page not found (404)", "error");
  }, []);

  return (
    <div className="not-found">
      <img src={notFoundImg} alt="Page not found" className="notfound-img" />

      <h2>Page Not Found</h2>
      <p>The page you are looking for doesn&rsquo;t exist or has moved.</p>

      <Button
        variant="primary"
        icon={<i className="bi bi-house-door"></i>}
        onClick={() => navigate("/")}
      >
        Back to Home
      </Button>
    </div>
  );
};

export default NotFound;
