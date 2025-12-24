import { createRoot } from "react-dom/client";
import MessageModal from "../Components/ui/messagemodel/messageModel";

export const notify = (message, type = "info") => {
  const div = document.createElement("div");
  document.body.appendChild(div);

  const root = createRoot(div);

  const close = () => {
    root.unmount();
    document.body.removeChild(div);
  };

  root.render(<MessageModal message={message} type={type} onClose={close} />);
};
