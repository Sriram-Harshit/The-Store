import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store";
import App from "./App";
import ErrorBoundary from "./Components/common/ui/ErrorBoundary/ErrorBoundary";
import { setupAxiosInterceptors } from "./utils/apiLogger";
import "./index.css";

// Initialize global Axios request/response error logging
setupAxiosInterceptors();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </Provider>
  </React.StrictMode>
);

