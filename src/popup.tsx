import React from "react";
import { createRoot } from "react-dom/client";
import "./popup.scss"
import 'bootstrap/dist/css/bootstrap.min.css';
import UserSelections from "./components/UserSelections";

const Popup = () => {
  return (
    <>
      <div id="popup-window">
        <UserSelections/>
      </div>
    </>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
