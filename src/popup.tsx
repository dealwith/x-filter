import React from "react";
import { createRoot } from "react-dom/client";

const Popup = () => {
  return (
    <>
      <div style={{ minWidth: "500px", minHeight: "700px" }}>
        {/* content */}
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
