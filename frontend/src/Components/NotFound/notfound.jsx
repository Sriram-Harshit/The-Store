import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { notify } from "../../utils/notify";
import Button from "../ui/buttons/button";

import notFoundImg from "../../../assets/not-found.svg";
import "./notfound.css";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    notify("Page not found (404)", "error");
  }, []);

  return (
    <div className="not-found">
      <img src={notFoundImg} alt="Page not found" className="notfound-img" />

      <p>The page you are looking for does not exist.</p>

      <Button variant="secondary" onClick={() => navigate("/")}>
        Go to Home
      </Button>
    </div>
  );
};

export default NotFound;
